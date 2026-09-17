/* ==========================================================================
   Bihar ICDS AWW - SupabaseDataStore
   js/db-supabase.js
   Extends DataStore with Supabase real-time backend.
   Offline-first: reads from localStorage cache, writes to both.
   ========================================================================== */

class SupabaseDataStore extends DataStore {
  constructor() {
    super(); // loads from localStorage immediately (instant render)
    const cfg = window.SUPABASE_CONFIG;
    this._sb = window._sbAuthClient || window.supabase.createClient(cfg.url, cfg.key);
    window._sbAuthClient = this._sb;
    this.awcCode = cfg.awcCode || "201";
  }

  /* ===== Override write methods to also sync with Supabase ===== */

  setProfile(profile) {
    super.setProfile(profile);
    this._upsertProfile(this.data.profile).catch(e => console.warn("Profile sync:", e));
  }

  setBeneficiaries(b) {
    super.setBeneficiaries(b);
    this._upsertBeneficiaries(this.data.beneficiaries).catch(e => console.warn("Ben sync:", e));
  }

  addTransaction(txn) {
    const result = super.addTransaction(txn);
    this._insertTransaction(result).catch(e => console.warn("Txn sync:", e));
    return result;
  }

  deleteTransaction(id) {
    super.deleteTransaction(id);
    this._sb.from("awc_transactions").delete().eq("id", id)
      .then(() => {}).catch(e => console.warn("Del sync:", e));
  }

  setOpeningStock(monthKey, stockObj) {
    super.setOpeningStock(monthKey, stockObj);
    this._upsertOpeningStock(monthKey, stockObj).catch(e => console.warn("Stock sync:", e));
  }

  setDayOverride(monthKey, date, overrideObj) {
    const result = super.setDayOverride(monthKey, date, overrideObj);
    this._upsertDayOverride(monthKey, date, overrideObj).catch(e => console.warn("Override sync:", e));
    return result;
  }

  removeDayOverride(monthKey, date) {
    super.removeDayOverride(monthKey, date);
    this._sb.from("awc_day_overrides").delete()
      .eq("awc_code", this.awcCode).eq("date", date)
      .then(() => {}).catch(e => console.warn("Override del:", e));
  }

  /* ===== Initialize: fetch all data from Supabase ===== */

  async initialize() {
    try {
      this._setSyncStatus("syncing");
      await this._syncFromSupabase();
      this._setupRealtime();
      this._setSyncStatus("online");
    } catch (e) {
      console.warn("Supabase init failed, using localStorage:", e);
      this._setSyncStatus("offline");
    }
  }

  async _syncFromSupabase() {
    const code = this.awcCode;
    const sb = this._sb;

    // Check if profile exists
    const { data: prof } = await sb.from("awc_profile")
      .select("*").eq("awc_code", code).maybeSingle();

    if (!prof) {
      // First run: push localStorage seed data to Supabase
      await this._upsertProfile(this.data.profile);
      await this._upsertBeneficiaries(this.data.beneficiaries);
      const txns = this.data.transactions || [];
      for (let i = txns.length - 1; i >= 0; i--) {
        await this._insertTransaction(txns[i]);
      }
      const openStock = this.data.openingStock || {};
      for (const mk of Object.keys(openStock)) {
        await this._upsertOpeningStock(mk, openStock[mk]);
      }
      return;
    }

    // Has data: pull fresh from Supabase into cache
    this.data.profile = this._mapProfile(prof);

    const { data: ben } = await sb.from("awc_beneficiaries")
      .select("*").eq("awc_code", code).maybeSingle();
    if (ben) this.data.beneficiaries = this._mapBen(ben);

    const { data: txns } = await sb.from("awc_transactions")
      .select("*").eq("awc_code", code)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (txns) this.data.transactions = txns.map(t => this._mapTxn(t));

    const { data: stocks } = await sb.from("awc_opening_stock")
      .select("*").eq("awc_code", code);
    if (stocks && stocks.length > 0) {
      this.data.openingStock = {};
      stocks.forEach(s => {
        this.data.openingStock[s.month_key] = {
          rice: Number(s.rice), dal: Number(s.dal), milk: Number(s.milk),
          eggs: Number(s.eggs), soybean: Number(s.soybean), chana: Number(s.chana),
          peanut: Number(s.peanut), jaggery: Number(s.jaggery),
          oil: Number(s.oil), salt_spices: Number(s.salt_spices)
        };
      });
    }

    const { data: overrides } = await sb.from("awc_day_overrides")
      .select("*").eq("awc_code", code);
    if (overrides && overrides.length > 0) {
      this.data.dayOverrides = {};
      overrides.forEach(o => {
        if (!this.data.dayOverrides[o.month_key]) this.data.dayOverrides[o.month_key] = {};
        this.data.dayOverrides[o.month_key][o.date] = {
          isHoliday: o.is_holiday,
          holidayName: o.holiday_name,
          childrenCount: o.children_count
        };
      });
    }

    this.save(); // mirror updated data to localStorage cache
  }

  /* ===== Realtime Subscriptions ===== */

  _setupRealtime() {
    const self = this;
    this._sb
      .channel("awc-rt-" + this.awcCode)
      .on("postgres_changes", {
        event: "INSERT", schema: "public",
        table: "awc_transactions",
        filter: "awc_code=eq." + this.awcCode
      }, payload => {
        const txn = self._mapTxn(payload.new);
        if (!self.data.transactions.find(t => t.id === txn.id)) {
          self.data.transactions.unshift(txn);
          self.save();
          self._refreshUI();
          if (window.showToast) showToast("\uD83D\uDCE1 Real-time sync!", "info");
        }
      })
      .on("postgres_changes", {
        event: "DELETE", schema: "public",
        table: "awc_transactions",
        filter: "awc_code=eq." + this.awcCode
      }, payload => {
        const id = payload.old.id;
        if (self.data.transactions.find(t => t.id === id)) {
          self.data.transactions = self.data.transactions.filter(t => t.id !== id);
          self.save();
          self._refreshUI();
        }
      })
      .subscribe(status => {
        self._setSyncStatus(status === "SUBSCRIBED" ? "online" : "offline");
      });
  }

  /* ===== Supabase write operations ===== */

  async _upsertProfile(p) {
    const { error } = await this._sb.from("awc_profile").upsert({
      awc_code: this.awcCode, district: p.district, project: p.project,
      sector: p.sector, panchayat: p.panchayat, awc_name: p.awcName,
      sevika_name: p.sevikaName, sahayika_name: p.sahayikaName,
      cdpo_name: p.cdpoName, updated_at: new Date().toISOString()
    }, { onConflict: "awc_code" });
    if (error) throw error;
  }

  async _upsertBeneficiaries(b) {
    const { error } = await this._sb.from("awc_beneficiaries").upsert({
      awc_code: this.awcCode, normal_kids: b.normalKids, sam_kids: b.samKids,
      preschool_kids: b.preschoolKids, pregnant_women: b.pregnantWomen,
      lactating_mothers: b.lactatingMothers, updated_at: new Date().toISOString()
    }, { onConflict: "awc_code" });
    if (error) throw error;
  }

  async _insertTransaction(txn) {
    const { error } = await this._sb.from("awc_transactions").upsert({
      id: txn.id, awc_code: this.awcCode, date: txn.date, type: txn.type,
      item: txn.item, quantity: txn.quantity, source: txn.source,
      challan: txn.challan, notes: txn.notes, details: txn.details,
      beneficiaries_count: txn.beneficiaries
    }, { onConflict: "id" });
    if (error) throw error;
  }

  async _upsertOpeningStock(monthKey, s) {
    const { error } = await this._sb.from("awc_opening_stock").upsert({
      awc_code: this.awcCode, month_key: monthKey,
      rice: s.rice || 0, dal: s.dal || 0, milk: s.milk || 0,
      eggs: s.eggs || 0, soybean: s.soybean || 0, chana: s.chana || 0,
      peanut: s.peanut || 0, jaggery: s.jaggery || 0,
      oil: s.oil || 0, salt_spices: s.salt_spices || 0,
      updated_at: new Date().toISOString()
    }, { onConflict: "awc_code,month_key" });
    if (error) throw error;
  }

  async _upsertDayOverride(monthKey, date, obj) {
    const { error } = await this._sb.from("awc_day_overrides").upsert({
      awc_code: this.awcCode, date: date, month_key: monthKey,
      is_holiday: obj.isHoliday, holiday_name: obj.holidayName,
      children_count: obj.childrenCount
    }, { onConflict: "awc_code,date" });
    if (error) throw error;
  }

  /* ===== Mapping: DB snake_case -> JS camelCase ===== */

  _mapProfile(r) {
    return {
      awcCode: r.awc_code, district: r.district, project: r.project,
      sector: r.sector, panchayat: r.panchayat, awcName: r.awc_name,
      sevikaName: r.sevika_name, sahayikaName: r.sahayika_name, cdpoName: r.cdpo_name
    };
  }

  _mapBen(r) {
    return {
      normalKids: r.normal_kids, samKids: r.sam_kids, preschoolKids: r.preschool_kids,
      pregnantWomen: r.pregnant_women, lactatingMothers: r.lactating_mothers
    };
  }

  _mapTxn(r) {
    return {
      id: r.id, date: r.date, type: r.type, item: r.item,
      quantity: Number(r.quantity), source: r.source, challan: r.challan,
      notes: r.notes, details: r.details, beneficiaries: r.beneficiaries_count
    };
  }

  /* ===== UI helpers ===== */

  _refreshUI() {
    if (window.renderDashboardUI)           window.renderDashboardUI();
    if (window.renderLiveStockCards)        window.renderLiveStockCards();
    if (window.renderTransactionsLedger)    window.renderTransactionsLedger();
    if (window.renderMprDocument)           window.renderMprDocument();
    if (window.renderMonthlyBhandarPanjiUI) window.renderMonthlyBhandarPanjiUI();
  }

  _setSyncStatus(state) {
    const dot = document.getElementById("syncDot");
    const lbl = document.getElementById("syncLabel");
    if (!dot) return;
    const map = {
      online:  { color: "#22C55E", label: "Live" },
      syncing: { color: "#F59E0B", label: "Sync..." },
      offline: { color: "#EF4444", label: "Offline" }
    };
    const s = map[state] || { color: "#94A3B8", label: state };
    dot.style.background = s.color;
    dot.title = "Supabase: " + s.label;
    if (lbl) lbl.textContent = s.label;
  }
}

/* ===== Bootstrap: replace window.db with SupabaseDataStore ===== */
window.dbReady = (function () {
  if (!window.SUPABASE_CONFIG || typeof window.supabase === "undefined") {
    console.warn("Supabase not configured — localStorage only mode");
    window.dbReady = Promise.resolve(window.db);
    return window.dbReady;
  }
  const sdb = new SupabaseDataStore();
  window.db = sdb; // replace synchronously so all reads use cache immediately
  return sdb.initialize().then(() => sdb).catch(err => {
    console.warn("SupabaseDataStore init error:", err);
    return sdb;
  });
}());
