/* ==========================================================================
   Bihar State ICDS - Anganwadi Sevika Management System
   Full Month Date-Wise Bhandar Panji (Register-8) Auto-Generator: js/auto-register.js
   Supports 35 children (with date-wise inline attendance editing),
   Custom Holiday addition/toggle, Sundays & Gazetted Holidays,
   and Comprehensive All-Commodity Balance Stock Tracking.
   ========================================================================== */

// Official Bihar Gazetted Holidays dictionary (Month -> Day -> Holiday Name)
// Fix #15: corrected September dates; Vishwakarma Puja = Sep 17, Anant Chaturdashi = Sep 28 (not mixed)
const BIHAR_GAZETTED_HOLIDAYS = {
  1: { 1: "नव वर्ष", 14: "मकर संक्रांति", 26: "गणतंत्र दिवस" },
  2: { 15: "संत रविदास जयंती", 24: "महाशिवरात्रि" },
  3: { 8: "होली", 22: "बिहार दिवस (Bihar Diwas)", 30: "रामनवमी" },
  4: { 4: "महावीर जयंती", 14: "डॉ. भीमराव अंबेडकर जयंती" },
  5: { 1: "मई दिवस", 23: "बुद्ध पूर्णिमा" },
  6: { 17: "बकरीद (ईद-उल-जुहा)" },
  7: { 17: "मोहर्रम" },
  8: { 15: "स्वतंत्रता दिवस", 19: "रक्षा बंधन", 26: "श्रीकृष्ण जन्माष्टमी" },
  // Fix #15: Vishwakarma Puja = Sep 17; Milad-un-Nabi = Sep 28; Anant Chaturdashi = Sep 28
  9: { 17: "विश्वकर्मा पूजा (Vishwakarma Puja)", 28: "मिलाद-उन-नबी / अनंत चतुर्दशी" },
  // Fix #15: Added Navratri days; Mahanavami = Oct 11; Dussehra = Oct 12; Gandhi Jayanti = Oct 2
  10: { 2: "गांधी जयंती", 3: "शारदीय नवरात्रि प्रारम्भ", 10: "दुर्गा पूजा (महाष्टमी)", 11: "दुर्गा पूजा (महानवमी)", 12: "विजयादशमी / दशहरा" },
  // Fix #15: Chhath Puja 2026 dates (Kharna=Oct31, Sandhya Arghya=Nov1, Pratah Arghya=Nov2); Diwali=Oct20
  11: { 1: "छठ पूजा (संध्या अर्घ्य)", 2: "छठ पूजा (प्रातः अर्घ्य) / दीपावली अगले दिन", 3: "भैया दूज", 15: "गुरु नानक जयंती" },
  12: { 25: "क्रिसमस डे" }
};

const DAY_NAMES_HI = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
const DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Generates the complete full month daily calendar with meals, custom overrides, and all running stock balances
 */
function generateMonthlyBhandarPanji(year = 2026, month = 9, defaultChildCount = 35, thrDay = 8) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthPadded = month.toString().padStart(2, "0");
  const monthKey = `${year}-${monthPadded}`;

  // Get opening stock for this month
  const openingStock = window.db ? window.db.getOpeningStock(monthKey) : {};
  const transactions = window.db ? window.db.getTransactions() : [];
  const overrides = window.db ? window.db.getDayOverrides(monthKey) : {};

  // Track stock inward receipts for each day and total inward
  const inwardByDate = {};
  const totalInward = {};
  (window.BIHAR_COMMODITIES || []).forEach(c => {
    totalInward[c.id] = 0;
  });

  transactions.forEach(t => {
    if (t.type === "inward" && t.date && t.date.startsWith(monthKey)) {
      if (!inwardByDate[t.date]) inwardByDate[t.date] = {};
      inwardByDate[t.date][t.item] = (inwardByDate[t.date][t.item] || 0) + Number(t.quantity);
      totalInward[t.item] = (totalInward[t.item] || 0) + Number(t.quantity);
    }
  });

  // Running balances initialized to opening stock
  const runningBalances = {};
  (window.BIHAR_COMMODITIES || []).forEach(c => {
    runningBalances[c.id] = Number(openingStock[c.id] || 0);
  });

  const dailyRows = [];
  let feedingDaysCount = 0;
  let holidaysCount = 0;

  // Monthly totals across all 10 commodities
  const totalConsumed = {
    rice: 0,
    dal: 0,
    milk: 0,
    eggs: 0,
    soybean: 0,
    chana: 0,
    peanut: 0,
    jaggery: 0,
    oil: 0,
    salt_spices: 0
  };

  const feedingDaysTarget = 25;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayPadded = day.toString().padStart(2, "0");
    const dateStr = `${year}-${monthPadded}-${dayPadded}`;
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday

    const isSunday = (dayOfWeek === 0);
    const defaultHolidayName = (BIHAR_GAZETTED_HOLIDAYS[month] && BIHAR_GAZETTED_HOLIDAYS[month][day]) || null;
    let isHoliday = isSunday || Boolean(defaultHolidayName);
    let holidayName = defaultHolidayName || (isSunday ? "रविवार (साप्ताहिक अवकाश)" : null);

    // Apply User's Custom Day Override (Holiday toggle / Custom Reason)
    const dayOverride = overrides[dateStr];
    if (dayOverride) {
      if (dayOverride.isHoliday !== undefined) {
        isHoliday = Boolean(dayOverride.isHoliday);
        if (isHoliday) {
          holidayName = dayOverride.holidayName || "अतिरिक्त अवकाश (केंद्र बंद)";
        }
      }
    }

    // Add any inward stock that arrived on this day to running balance
    if (inwardByDate[dateStr]) {
      Object.keys(inwardByDate[dateStr]).forEach(item => {
        runningBalances[item] = (runningBalances[item] || 0) + inwardByDate[dateStr][item];
      });
    }

    const row = {
      date: dateStr,
      dayNumber: day,
      dayOfWeekHi: DAY_NAMES_HI[dayOfWeek],
      dayOfWeekEn: DAY_NAMES_EN[dayOfWeek],
      isSunday,
      isHoliday,
      isCustomHoliday: Boolean(dayOverride && dayOverride.isHoliday === true && !isSunday && !defaultHolidayName),
      holidayName: holidayName,
      isFeedingDay: false,
      isThrDay: (day === thrDay),
      menuTitle: "-",
      snackTitle: "-",
      childrenFed: 0,
      hcmItems: [],
      consumed: {
        rice: 0,
        dal: 0,
        milk: 0,
        eggs: 0,
        chana: 0,
        soybean: 0,
        peanut: 0,
        jaggery: 0,
        oil: 0,
        salt_spices: 0
      },
      inwardToday: inwardByDate[dateStr] || null,
      runningClosing: {}
    };

    if (!isHoliday && feedingDaysCount < feedingDaysTarget) {
      // Active feeding day
      row.isFeedingDay = true;
      feedingDaysCount++;

      // Determine child count: User custom attendance for this date or default
      const hasCustomKids = (dayOverride && dayOverride.childrenCount !== undefined && Number(dayOverride.childrenCount) > 0);
      const dayChildCount = hasCustomKids ? Number(dayOverride.childrenCount) : defaultChildCount;
      row.childrenFed = dayChildCount;
      row.isCustomChildCount = hasCustomKids;

      // Map day of week to official Bihar menu
      let menuDayId = dayOfWeek;
      if (menuDayId === 0) menuDayId = 1;

      // Additional 25th day if on Saturday
      if (feedingDaysCount === 25 && dayOfWeek === 6) {
        menuDayId = 7;
      }

      const hcmCalc = window.biharMenu 
        ? window.biharMenu.calculateHcmConsumption(menuDayId, dayChildCount, dayChildCount) 
        : { items: [], mealTitle: "-", snackTitle: "-" };

      row.menuTitle = hcmCalc.mealTitle;
      row.snackTitle = hcmCalc.snackTitle;
      row.hcmItems = hcmCalc.items;

      hcmCalc.items.forEach(it => {
        const q = Number(it.quantity);
        if (row.consumed[it.itemId] !== undefined) {
          row.consumed[it.itemId] = Number((row.consumed[it.itemId] + q).toFixed(3));
          totalConsumed[it.itemId] = Number((totalConsumed[it.itemId] + q).toFixed(3));
        }
      });
    } else if (isHoliday) {
      holidaysCount++;
      row.menuTitle = row.isSunday ? "साप्ताहिक अवकाश (केंद्र बंद)" : `${row.holidayName} (केंद्र बंद)`;
    } else {
      row.menuTitle = "केंद्र संचालन (अभिलेख संधारण व गृह-भेंट)";
    }

    // Check if THR Distribution occurs on this day
    if (row.isThrDay && window.biharMenu && window.db) {
      const beneficiaries = window.db.getBeneficiaries();
      const thrQuota = window.biharMenu.calculateThrQuota(
        beneficiaries.normalKids,
        beneficiaries.samKids,
        beneficiaries.pregnantWomen,
        beneficiaries.lactatingMothers
      );

      row.thrDistribution = thrQuota;
      row.consumed.rice = Number((row.consumed.rice + thrQuota.rice.quantity).toFixed(3));
      row.consumed.dal = Number((row.consumed.dal + thrQuota.moong_dal.quantity).toFixed(3));
      row.consumed.soybean = Number((row.consumed.soybean + thrQuota.soybean.quantity).toFixed(3));
      row.consumed.oil = Number((row.consumed.oil + thrQuota.oil.quantity).toFixed(3));
      row.consumed.salt_spices = Number((row.consumed.salt_spices + thrQuota.masala_mix.quantity + thrQuota.salt.quantity).toFixed(3));

      totalConsumed.rice = Number((totalConsumed.rice + thrQuota.rice.quantity).toFixed(3));
      totalConsumed.dal = Number((totalConsumed.dal + thrQuota.moong_dal.quantity).toFixed(3));
      totalConsumed.soybean = Number((totalConsumed.soybean + thrQuota.soybean.quantity).toFixed(3));
      totalConsumed.oil = Number((totalConsumed.oil + thrQuota.oil.quantity).toFixed(3));
      totalConsumed.salt_spices = Number((totalConsumed.salt_spices + thrQuota.masala_mix.quantity + thrQuota.salt.quantity).toFixed(3));
    }

    // Deduct today's consumption from running balances for ALL commodities
    Object.keys(row.consumed).forEach(item => {
      if (runningBalances[item] !== undefined) {
        runningBalances[item] = Number(Math.max(0, runningBalances[item] - row.consumed[item]).toFixed(3));
      }
    });

    // Snapshot closing balances for today for all commodities
    row.runningClosing = { ...runningBalances };
    dailyRows.push(row);
  }

  // Generate All-Commodity Balance Stock Summary
  const commoditySummary = {};
  (window.BIHAR_COMMODITIES || []).forEach(c => {
    const opening = Number(openingStock[c.id] || 0);
    const inward = Number(totalInward[c.id] || 0);
    const totalAvailable = Number((opening + inward).toFixed(3));
    const consumed = Number((totalConsumed[c.id] || 0).toFixed(3));
    const currentBalance = Number(Math.max(0, totalAvailable - consumed).toFixed(3));

    commoditySummary[c.id] = {
      id: c.id,
      name_hi: c.name_hi,
      name_en: c.name_en,
      unit_hi: c.unit_hi,
      icon: c.icon,
      opening,
      inward,
      totalAvailable,
      consumed,
      currentBalance
    };
  });

  return {
    year,
    month,
    monthKey,
    daysInMonth,
    defaultChildCount,
    feedingDaysCount,
    holidaysCount,
    commoditySummary,
    totalConsumed,
    dailyRows
  };
}

/**
 * Commits the generated register directly into the transactions database
 */
function commitMonthlyRegisterToDatabase(monthlyPanji) {
  if (!window.db) return;
  const monthKey = monthlyPanji.monthKey;
  const existingTransactions = window.db.getTransactions();

  // Remove existing HCM & THR transactions for this month so we replace them cleanly without duplicating inward stock
  const preservedTransactions = existingTransactions.filter(t => {
    const isThisMonth = t.date && t.date.startsWith(monthKey);
    return !(isThisMonth && (t.type === "hcm" || t.type === "thr"));
  });

  const newTransactions = [...preservedTransactions];

  monthlyPanji.dailyRows.forEach(row => {
    // 1. Log HCM daily consumption
    if (row.isFeedingDay) {
      if (row.hcmItems && row.hcmItems.length > 0) {
        row.hcmItems.forEach(it => {
          if (it.quantity > 0 && it.itemId !== "fruit") {
            newTransactions.push({
              id: `TXN-${row.date}-HCM-${it.itemId.toUpperCase()}`,
              date: row.date,
              type: "hcm",
              item: it.itemId,
              quantity: it.quantity,
              source: `दैनिक HCM (${row.menuTitle})`,
              beneficiaries: it.itemId === "eggs" ? (row.childrenFed > 0 ? row.childrenFed : 0) : row.childrenFed,
              details: it.formula || `${row.childrenFed} बच्चे उपस्थित (${row.dayOfWeekHi})`
            });
          }
        });
      }
    }

    // 2. Log THR if this was THR day
    if (row.isThrDay && row.thrDistribution) {
      const q = row.thrDistribution;
      const bCount = q.totalBeneficiaries || 58;

      newTransactions.push({
        id: `TXN-${row.date}-THR-RICE`,
        date: row.date,
        type: "thr",
        item: "rice",
        quantity: q.rice.quantity,
        source: "बिहार THR रेडी टू कुक (चावल)",
        beneficiaries: bCount,
        details: q.rice.formula
      });

      newTransactions.push({
        id: `TXN-${row.date}-THR-DAL`,
        date: row.date,
        type: "thr",
        item: "dal",
        quantity: q.moong_dal.quantity,
        source: "बिहार THR रेडी टू कुक (मूंगदाल)",
        beneficiaries: bCount,
        details: q.moong_dal.formula
      });

      newTransactions.push({
        id: `TXN-${row.date}-THR-SOYBEAN`,
        date: row.date,
        type: "thr",
        item: "soybean",
        quantity: q.soybean.quantity,
        source: "बिहार THR रेडी टू कुक (सोयाबीन)",
        beneficiaries: bCount,
        details: q.soybean.formula
      });

      newTransactions.push({
        id: `TXN-${row.date}-THR-OIL`,
        date: row.date,
        type: "thr",
        item: "oil",
        quantity: q.oil.quantity,
        source: "बिहार THR रेडी टू कुक (खाद्य तेल)",
        beneficiaries: bCount,
        details: q.oil.formula
      });

      const condiments = Number((q.masala_mix.quantity + q.salt.quantity).toFixed(3));
      newTransactions.push({
        id: `TXN-${row.date}-THR-SALT-SPICES`,
        date: row.date,
        type: "thr",
        item: "salt_spices",
        quantity: condiments,
        source: "बिहार THR रेडी टू कुक (मसाला मिक्स व नमक)",
        beneficiaries: bCount,
        details: `मसाला: ${q.masala_mix.quantity}kg + नमक: ${q.salt.quantity}kg`
      });
    }
  });

  // Sort descending by date
  newTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  window.db.data.transactions = newTransactions;
  window.db.save();

  // Refresh all system views
  if (window.renderLiveStockCards) window.renderLiveStockCards();
  if (window.renderTransactionsLedger) window.renderTransactionsLedger();

  if (window.renderDashboardUI) window.renderDashboardUI();
}

/**
 * Saves full month stock allocation and auto-generates 35-child Bhandar Panji
 */
function saveBulkMonthlyStockAndGenerate(data) {
  const month = Number(data.month || 9);
  const year = Number(data.year || 2026);
  const childCount = Number(data.childCount || 35);
  const arrivalDate = data.arrivalDate || `${year}-${month.toString().padStart(2, "0")}-01`;
  const challan = data.challan || `SFC/SARAN/${year}/${month.toString().padStart(2, "0")}/101`;

  const commodities = [
    { id: "rice", qty: Number(data.rice || 0), source: "SFC राज्य खाद्य निगम (PDS Godown - चावल)" },
    { id: "dal", qty: Number(data.dal || 0), source: "आंगनवाड़ी विकास समिति (संयुक्त खाता क्रय - दाल)" },
    { id: "milk", qty: Number(data.milk || 0), source: "सुधा डेरी / ICDS सूखा दूध पाउडर (200g पैकेट)" },
    { id: "eggs", qty: Number(data.eggs || 0), source: "आंगनवाड़ी विकास समिति (बुध/शुक्रवार अंडा)" },
    { id: "soybean", qty: Number(data.soybean || 0), source: "आंगनवाड़ी विकास समिति (सोयाबीन बड़ी)" },
    { id: "chana", qty: Number(data.chana || 0), source: "आंगनवाड़ी विकास समिति (चना नाश्ता व सब्जी)" },
    { id: "peanut", qty: Number(data.peanut || 0), source: "आंगनवाड़ी विकास समिति (मूंगफली नाश्ता)" },
    { id: "jaggery", qty: Number(data.jaggery || 0), source: "आंगनवाड़ी विकास समिति (गुड़ रसियाव व नाश्ता)" },
    { id: "oil", qty: Number(data.oil || 0), source: "आंगनवाड़ी विकास समिति (खाद्य तेल)" },
    { id: "salt_spices", qty: Number(data.salt_spices || 0), source: "आंगनवाड़ी विकास समिति (नमक व मसाले)" }
  ];

  commodities.forEach(c => {
    if (c.qty > 0) {
      window.db.addTransaction({
        date: arrivalDate,
        type: "inward",
        item: c.id,
        quantity: c.qty,
        source: c.source,
        challan: challan,
        notes: c.id === "milk"
          ? `${month}/${year} माह का सम्पूर्ण आवंटित स्टॉक (${data.milkPackets || Number((c.qty / 0.2).toFixed(3))} पैकेट = ${c.qty} kg)`
          : `${month}/${year} माह का सम्पूर्ण आवंटित स्टॉक`
      });
    }
  });

  const panji = generateMonthlyBhandarPanji(year, month, childCount, 8);
  commitMonthlyRegisterToDatabase(panji);

  const tabAutoPanji = document.getElementById("tabAutoPanji");
  if (tabAutoPanji && typeof tabAutoPanji.click === "function") tabAutoPanji.click();

  const panjiMonthSelect = document.getElementById("panjiMonthSelect");
  if (panjiMonthSelect) panjiMonthSelect.value = month;
  const panjiYearSelect = document.getElementById("panjiYearSelect");
  if (panjiYearSelect) panjiYearSelect.value = year;
  const panjiChildCountInput = document.getElementById("panjiChildCountInput");
  if (panjiChildCountInput) panjiChildCountInput.value = childCount;

  renderMonthlyBhandarPanjiUI();
  if (window.renderLiveStockCards) window.renderLiveStockCards();
  if (window.renderTransactionsLedger) window.renderTransactionsLedger();

  if (window.renderDashboardUI) window.renderDashboardUI();

  if (window.showToast) {
    window.showToast(`✅ माह ${month}/${year} का सम्पूर्ण स्टॉक दर्ज हुआ! 35 बच्चों का पूरे माह का दैनिक भंडार पंजी स्वतः तैयार हो गया!`, "success");
  }
}

/**
 * Renders the Monthly Date-Wise Bhandar Panji Table into the UI with All Stock Balances and Editable Controls
 */
function renderMonthlyBhandarPanjiUI() {
  const container = document.getElementById("monthlyRegisterTableContainer");
  if (!container) return;

  const month = Number(document.getElementById("panjiMonthSelect")?.value || 9);
  const year = Number(document.getElementById("panjiYearSelect")?.value || 2026);
  const childCount = Number(document.getElementById("panjiChildCountInput")?.value || 35);

  const panji = generateMonthlyBhandarPanji(year, month, childCount, 8);
  const profile = window.db ? window.db.getProfile() : { awcName: "दरियापुर - केंद्र 201", project: "दरियापुर (सारण)", cdpoName: "अंजू सिंह", sevikaName: "मंजू देवी" };

  // Update Summary KPI Bar
  setText("panjiTotalDays", `${panji.daysInMonth} दिन`);
  setText("panjiHolidays", `${panji.holidaysCount} दिन (अवकाश)`);
  setText("panjiFeedingDays", `${panji.feedingDaysCount} दिन (पोषाहार)`);
  setText("panjiMilkTotal", `${Number((panji.totalConsumed.milk / 0.2).toFixed(3))} पैकेट (${panji.totalConsumed.milk.toFixed(3)} kg)`);
  setText("panjiEggsTotal", `${panji.totalConsumed.eggs} अंडे`);

  const monthNamesHi = {
    1: "जनवरी", 2: "फरवरी", 3: "मार्च", 4: "अप्रैल", 5: "मई", 6: "जून",
    7: "जुलाई", 8: "अगस्त", 9: "सितम्बर", 10: "अक्टूबर", 11: "नवम्बर", 12: "दिसम्बर"
  };
  const monthName = monthNamesHi[month] || `माह ${month}`;

  // 1. ALL COMMODITIES MASTER STOCK BALANCE: SMALL BOXES (DEFAULT) & TABLE
  const commodityOrder = ["rice", "dal", "milk", "eggs", "soybean", "chana", "peanut", "jaggery", "oil", "salt_spices"];
  let smallBoxesHtml = `<div id="stockBoxesView" class="stock-boxes-grid">`;
  let tableRowsHtml = "";

  commodityOrder.forEach((cId, idx) => {
    const item = panji.commoditySummary[cId];
    if (!item) return;
    const isMilk = cId === "milk";
    const openingPkt = Number((item.opening / 0.2).toFixed(3));
    const inwardPkt = Number((item.inward / 0.2).toFixed(3));
    const availPkt = Number((item.totalAvailable / 0.2).toFixed(3));
    const consPkt = Number((item.consumed / 0.2).toFixed(3));
    const balPkt = Number((item.currentBalance / 0.2).toFixed(3));

    // Short commodity name for small box
    const shortName = item.name_hi.split(" ")[0];

    // Small Box values
    let sboxBalVal = `${item.currentBalance} <span style="font-size:11.5px; font-weight:600;">${item.unit_hi}</span>`;
    let sboxBalSub = "";
    let sboxOpenVal = item.opening;
    let sboxInwardVal = item.inward > 0 ? `+${item.inward}` : "0";
    let sboxAvailVal = item.totalAvailable;
    let sboxConsVal = item.consumed;

    if (isMilk) {
      sboxBalVal = `${balPkt} <span style="font-size:12px; font-weight:700;">पैकेट</span>`;
      sboxBalSub = `<div class="sbox-bal-sub">(${item.currentBalance.toFixed(3)} kg)</div>`;
      sboxOpenVal = `${openingPkt} pkt`;
      sboxInwardVal = item.inward > 0 ? `+${inwardPkt} pkt` : "0";
      sboxAvailVal = `${availPkt} pkt`;
      sboxConsVal = `${consPkt} pkt`;
    }

    // Small Box Item
    smallBoxesHtml += `
      <div class="stock-small-box">
        <div class="sbox-head">
          <div class="sbox-title">
            <span class="sbox-icon">${item.icon}</span>
            <span>${shortName}</span>
          </div>
          <span class="sbox-unit-badge">${item.unit_hi}</span>
        </div>

        <div class="sbox-balance-card">
          <span class="sbox-bal-lbl">5. वर्तमान शेष (Balance)</span>
          <div class="sbox-bal-val">${sboxBalVal}</div>
          ${sboxBalSub}
        </div>

        <div class="sbox-details-grid">
          <div class="sbox-detail-item">
            <span class="sbox-detail-lbl">1. प्रारंभिक</span>
            <span class="sbox-detail-val">${sboxOpenVal}</span>
          </div>
          <div class="sbox-detail-item">
            <span class="sbox-detail-lbl">2. आवक</span>
            <span class="sbox-detail-val val-inward">${sboxInwardVal}</span>
          </div>
          <div class="sbox-detail-item">
            <span class="sbox-detail-lbl">3. उपलब्ध</span>
            <span class="sbox-detail-val">${sboxAvailVal}</span>
          </div>
          <div class="sbox-detail-item">
            <span class="sbox-detail-lbl">4. खपत</span>
            <span class="sbox-detail-val val-consumed">${sboxConsVal}</span>
          </div>
        </div>
      </div>
    `;

    // Table Row Item
    const isEven = idx % 2 === 0;
    const rowBg = isEven ? "#FFFFFF" : "#F8FAFC";
    const openingHtml = isMilk ? `<strong>${openingPkt}</strong> <span style="font-size:11px;">pkt</span><br><span style="font-size:10.5px; color:#475569; font-weight:700;">(${item.opening.toFixed(3)} kg)</span>` : item.opening;
    const inwardHtml = isMilk ? (item.inward > 0 ? `<strong>+${inwardPkt}</strong> <span style="font-size:11px;">pkt</span><br><span style="font-size:10.5px; color:#166534; font-weight:700;">(+${item.inward.toFixed(3)} kg)</span>` : '0') : (item.inward > 0 ? '+' + item.inward : '0');
    const availHtml = isMilk ? `<strong>${availPkt}</strong> <span style="font-size:11px;">pkt</span><br><span style="font-size:10.5px; color:#92400E; font-weight:700;">(${item.totalAvailable.toFixed(3)} kg)</span>` : item.totalAvailable;
    const consHtml = isMilk ? `<strong>${consPkt}</strong> <span style="font-size:11px;">pkt</span><br><span style="font-size:10.5px; color:#B91C1C; font-weight:700;">(${item.consumed.toFixed(3)} kg)</span>` : item.consumed;
    const balHtml = isMilk ? `<strong>${balPkt}</strong> पैकेट <div style="font-size:11px; color:#166534; font-weight:700;">(${item.currentBalance.toFixed(3)} kg)</div>` : `${item.currentBalance} ${item.unit_hi}`;

    tableRowsHtml += `
      <tr style="background:${rowBg}; border-bottom:1px solid #E2E8F0;">
        <td style="padding:8px 10px; font-weight:700; color:#64748B; text-align:left;">${idx + 1}</td>
        <td style="padding:8px 12px; font-weight:700; color:#0F172A; text-align:left;">
          <span style="font-size:15px; margin-right:6px;">${item.icon}</span>
          <span>${item.name_hi}</span>
        </td>
        <td style="padding:8px; font-weight:600; color:#475569;">${item.unit_hi}</td>
        <td style="padding:8px 10px; font-weight:700; color:#1E40AF; background:#F0F9FF;">${openingHtml}</td>
        <td style="padding:8px 10px; font-weight:700; color:#166534; background:#F0FDF4;">${inwardHtml}</td>
        <td style="padding:8px 10px; font-weight:700; color:#B45309; background:#FFFBEB;">${availHtml}</td>
        <td style="padding:8px 10px; font-weight:700; color:#DC2626; background:#FEF2F2;">${consHtml}</td>
        <td style="padding:8px 12px; font-weight:800; font-size:14px; color:#15803D; background:#DCFCE7;">
          ${balHtml}
        </td>
      </tr>
    `;
  });
  smallBoxesHtml += `</div>`;

  let summaryCardsHtml = `
    <div class="stock-summary-container no-print" style="margin-bottom:18px; border:2px solid #E2E8F0;">
      <div class="stock-summary-header" style="padding-bottom:10px; border-bottom:1px solid #E2E8F0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div class="stock-summary-title" style="font-size:14.5px;">
          <span>📦</span>
          <span>माह: <strong style="color:#4F46E5;">${monthName} ${year}</strong> - सभी 10 राशन सामग्रियों का स्टॉक हिसाब व शेष (All Stock & Balance)</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="stock-view-toggle">
            <button id="btnStockViewBoxes" class="btn-toggle-view active" onclick="window.toggleStockSummaryView('boxes')">🔲 स्मॉल बॉक्स (Small Boxes)</button>
            <button id="btnStockViewTable" class="btn-toggle-view" onclick="window.toggleStockSummaryView('table')">📋 विस्तृत तालिका</button>
          </div>
        </div>
      </div>

      <!-- 1. Small Boxes View (DEFAULT) -->
      ${smallBoxesHtml}

      <!-- 2. Master Stock Balance Table View (Hidden by default, toggleable) -->
      <div id="stockTableView" style="display:none; overflow-x:auto; margin-top:12px; margin-bottom:14px;">
        <table style="width:100%; border-collapse:collapse; font-size:12.5px; text-align:center; background:#FFF; border:1px solid #CBD5E1; border-radius:6px; overflow:hidden;">
          <thead>
            <tr style="background:#0F172A; color:#FFF; font-weight:700;">
              <th style="padding:10px 12px; text-align:left;">क्र.सं.</th>
              <th style="padding:10px 12px; text-align:left;">सामग्री का नाम (Commodity)</th>
              <th style="padding:10px 8px;">इकाई</th>
              <th style="padding:10px 10px; background:#1E3A8A; color:#DBEAFE;">1. प्रारंभिक शेष (Opening)</th>
              <th style="padding:10px 10px; background:#14532D; color:#DCFCE7;">2. मासिक आवक (Inward)</th>
              <th style="padding:10px 10px; background:#78350F; color:#FEF3C7;">3. कुल उपलब्ध (Total Available)</th>
              <th style="padding:10px 10px; background:#7F1D1D; color:#FEE2E2;">4. कुल खपत (Consumed)</th>
              <th style="padding:10px 12px; background:#15803D; color:#FFFFFF; font-size:13.5px; font-weight:800;">5. वर्तमान शेष स्टॉक (Balance Stock)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // 2. OFFICIAL BIHAR PANJI-8 HEADER BANNER
  let headerHtml = `
    <div style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:8px; padding:12px 16px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase;">बिहार सरकार | समाज कल्याण विभाग - समेकित बाल विकास सेवाएं (ICDS)</div>
        <div style="font-size:16px; font-weight:800; color:#1E293B;">पंजी-8: पोषाहार भंडार एवं उपभोग पंजी (दैनिक समाधान रजिस्टर - 10 सामग्रियां)</div>
        <div style="font-size:12px; color:#475569; margin-top:2px;">
          केंद्र: <strong style="color:#0F172A;">${profile.awcName}</strong> | 
          परियोजना: <strong>${profile.project}</strong> | 
          माह: <strong style="color:#4F46E5;">${monthName} ${year}</strong> | 
          उपस्थिति: <strong>${childCount} बच्चे</strong> (प्रतिदिन बच्चे बदल सकते हैं ✏️)
        </div>
      </div>
      <div style="background:#EEF2FF; border:1px solid #C7D2FE; border-radius:6px; padding:6px 12px; text-align:right;">
        <div style="font-size:12.5px; font-weight:800; color:#3730A3;">पोषाहार: ${panji.feedingDaysCount} दिन | अवकाश: <span style="color:#BE123C;">${panji.holidaysCount} दिन</span></div>
        <div style="font-size:11px; color:#64748B;">प्रत्येक कॉलम में: <strong>दैनिक खपत / अंतिम शेष स्टॉक</strong></div>
      </div>
    </div>
  `;

  // 3. DATE-WISE BHANDAR PANJI TABLE WITH TWO-TIER (USE & BALANCE) SUB-COLUMNS
  const tableCommodities = [
    { id: "rice", name: "चावल (Rice)", icon: "🌾", unit: "kg" },
    { id: "dal", name: "दाल (Dal)", icon: "🥣", unit: "kg" },
    { id: "milk", name: "सूखा दूध (200g Pkt)", icon: "🥛", unit: "kg" },
    { id: "eggs", name: "अंडा (Eggs)", icon: "🥚", unit: "अंडे" },
    { id: "soybean", name: "सोयाबीन", icon: "🧆", unit: "kg" },
    { id: "chana", name: "चना (Chana)", icon: "🥜", unit: "kg" },
    { id: "peanut", name: "मूंगफली", icon: "🥜", unit: "kg" },
    { id: "jaggery", name: "गुड़ (Jaggery)", icon: "🍯", unit: "kg" },
    { id: "oil", name: "तेल (Oil)", icon: "🫗", unit: "L" },
    { id: "salt_spices", name: "नमक-मसाले", icon: "🧂", unit: "kg" }
  ];

  // Balance cell formatting helper with Low Stock & Negative Alerts
  function renderBalanceCell(balVal, itemId) {
    if (balVal === undefined || balVal === null) {
      return `<td class="cell-balance">-</td>`;
    }
    const num = Number(balVal);

    if (itemId === 'milk') {
      const kg = num.toFixed(3);
      const pkts = (num / 0.2).toFixed(3);
      let alertClass = "";
      let prefix = "";
      if (num <= 0) {
        alertClass = " cell-balance-danger";
        prefix = "⚠️ ";
      } else if (num <= 1.0) {
        alertClass = " cell-balance-warning";
        prefix = "⚠️ ";
      }
      return `<td class="cell-balance${alertClass}" title="दूध शेष: ${pkts} पैकेट (${kg} kg)">
        <div>${prefix}<strong>${pkts}</strong> <span style="font-size:10px; font-weight:600;">pkt</span></div>
        <div style="font-size:10px; font-weight:700; color:#166534;">(${kg} kg)</div>
      </td>`;
    }

    const displayStr = (itemId === 'eggs') ? num : num.toFixed(3);

    if (num <= 0) {
      return `<td class="cell-balance cell-balance-danger" title="⚠️ स्टॉक समाप्त / नेगेटिव बैलेंस: ${displayStr}">⚠️ ${displayStr}</td>`;
    }

    const warningThresholds = {
      rice: 15, dal: 8, eggs: 35, soybean: 4,
      chana: 4, peanut: 3, jaggery: 3, oil: 3, salt_spices: 1
    };

    if (warningThresholds[itemId] && num <= warningThresholds[itemId]) {
      return `<td class="cell-balance cell-balance-warning" title="⚠️ कम स्टॉक चेतावनी: ${displayStr}">⚠️ ${displayStr}</td>`;
    }

    return `<td class="cell-balance">${displayStr}</td>`;
  }

  let tableHtml = `
    <div style="overflow-x:auto;">
      <table class="panji-register-table" style="font-size:12px; min-width:1750px;">
        <thead>
          <!-- Row 1: Commodity Group Headers (Sticky Date & Day) -->
          <tr style="background:#0F172A; color:#FFF;">
            <th rowspan="2" class="sticky-col-1" style="vertical-align:middle; text-align:center;">तारीख</th>
            <th rowspan="2" class="sticky-col-2" style="vertical-align:middle; text-align:center;">दिन</th>
            <th rowspan="2" style="width:120px; min-width:120px; vertical-align:middle; text-align:center;">स्थिति / छुट्टी</th>
            <th rowspan="2" style="min-width:210px; vertical-align:middle; text-align:left; padding-left:12px;">नाश्ता एवं भोजन विवरण (Menu)</th>
            <th rowspan="2" style="width:70px; min-width:70px; vertical-align:middle; text-align:center;" title="बच्चे की संख्या बदलें">बच्चे ✏️</th>
            ${tableCommodities.map(c => `
              <th colspan="2" class="th-commodity-group" style="background:#0F172A; color:#FFF;">
                ${c.icon} ${c.name}
              </th>
            `).join('')}
          </tr>
          <!-- Row 2: Sub-Headers (USE | Balance) exactly as sketched by user -->
          <tr>
            ${tableCommodities.map(c => `
              <th class="th-sub-use">USE (खपत)</th>
              <th class="th-sub-bal">Balance (शेष)</th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  panji.dailyRows.forEach(row => {
    let rowClass = "row-feeding";
    let statusBadge = "";
    let toggleBtn = "";

    if (row.isSunday) {
      rowClass = "row-sunday";
      statusBadge = `<span class="badge-sunday">🚫 रविवार</span>`;
      toggleBtn = `<button class="btn-holiday-toggle" data-action="set-working" data-date="${row.date}" style="background:#DCFCE7; color:#166534; border:1px solid #86EFAC; margin-left:4px;">चालू</button>`;
    } else if (row.isHoliday) {
      rowClass = "row-holiday";
      statusBadge = `<span class="badge-holiday">🎉 ${row.holidayName.split(" ")[0]}</span>`;
      toggleBtn = `<button class="btn-holiday-toggle" data-action="set-working" data-date="${row.date}" style="background:#DCFCE7; color:#166534; border:1px solid #86EFAC; margin-left:4px;">चालू</button>`;
    } else {
      statusBadge = `<span class="badge-feeding">✅ पोषाहार</span>`;
      toggleBtn = `<button class="btn-holiday-toggle" data-action="set-holiday" data-date="${row.date}" style="background:#FEE2E2; color:#991B1B; border:1px solid #FCA5A5; margin-left:4px;">छुट्टी</button>`;
    }

    // Format Date DD/MM
    const dParts = row.date.split("-");
    const dateFormatted = `${dParts[2]}/${dParts[1]}`;

    if (row.isHoliday) {
      const holidayCellsHtml = tableCommodities.map(c => {
        const balVal = row.runningClosing[c.id];
        const zeroVal = (c.id === 'milk') ? `0.00 pkt` : `0.00`;
        return `
          <td class="cell-use" style="text-align:center; color:#94A3B8; border-left:2px solid #E2E8F0;">${zeroVal}</td>
          ${renderBalanceCell(balVal, c.id)}
        `;
      }).join('');

      tableHtml += `
        <tr class="${rowClass}">
          <td class="sticky-col-1 font-bold">${dateFormatted}</td>
          <td class="sticky-col-2 font-bold" style="color:${row.isSunday ? '#BE123C' : '#92400E'};">${row.dayOfWeekHi}</td>
          <td style="width:120px; min-width:120px; text-align:center;">${statusBadge}${toggleBtn}</td>
          <td style="min-width:210px; color:${row.isSunday ? '#BE123C' : '#92400E'}; font-weight:700;">
            ${row.isSunday ? '🚫 साप्ताहिक अवकाश (केंद्र बंद)' : `🎉 ${row.holidayName} (अवकाश)`}
          </td>
          <td style="width:70px; min-width:70px; text-align:center; color:#94A3B8;">0</td>
          ${holidayCellsHtml}
        </tr>
      `;
    } else {
      // Inward tag if arrived today
      let inwardNote = "";
      if (row.inwardToday) {
        const itemsList = Object.keys(row.inwardToday).map(k => `${k}: +${row.inwardToday[k]}`).join(", ");
        inwardNote = `<div style="font-size:10.5px; font-weight:800; color:#15803D; margin-top:2px;">📥 [स्टॉक आवक: ${itemsList}]</div>`;
      }

      // THR note if distributed today
      let thrNote = "";
      if (row.isThrDay && row.thrDistribution) {
        thrNote = `<div style="font-size:10.5px; font-weight:800; color:#4F46E5; margin-top:2px;">📦 [मासिक THR वितरण: चावल ${row.thrDistribution.rice.quantity}kg, दाल ${row.thrDistribution.moong_dal.quantity}kg, सोया ${row.thrDistribution.soybean.quantity}kg]</div>`;
      }

      const feedingCellsHtml = tableCommodities.map(c => {
        const useVal = Number(row.consumed[c.id] || 0);
        const balVal = row.runningClosing[c.id];
        let formattedUse = `<span style="color:#94A3B8;">0.00</span>`;
        if (useVal > 0) {
          if (c.id === 'milk') {
            const kgUse = useVal.toFixed(3);
            const pktUse = (useVal / 0.2).toFixed(3);
            formattedUse = `<div><strong style="color:#B45309;">${pktUse}</strong> <span style="font-size:10px; font-weight:600;">pkt</span></div><div style="font-size:10px; color:#1E40AF; font-weight:600;">(${kgUse} kg)</div>`;
          } else if (c.id === 'eggs') {
            formattedUse = `<strong style="color:#D97706;">${useVal}</strong>`;
          } else {
            formattedUse = `<strong style="color:#B45309;">${useVal.toFixed(3)}</strong>`;
          }
        }
        return `
          <td class="cell-use" style="border-left:2px solid #E2E8F0;">${formattedUse}</td>
          ${renderBalanceCell(balVal, c.id)}
        `;
      }).join('');

      tableHtml += `
        <tr class="${rowClass}">
          <td class="sticky-col-1 font-bold">${dateFormatted}</td>
          <td class="sticky-col-2 font-bold">${row.dayOfWeekHi}</td>
          <td style="width:120px; min-width:120px; text-align:center;">${statusBadge}${toggleBtn}</td>
          <td style="min-width:210px;">
            <div style="font-weight:700; color:#0F172A;">${row.menuTitle}</div>
            ${row.snackTitle && row.snackTitle !== '-' ? `<div style="font-size:11px; color:#475569;">नाश्ता: ${row.snackTitle}</div>` : ''}
            ${inwardNote}
            ${thrNote}
          </td>
          <td style="width:70px; min-width:70px; text-align:center;">
            <input type="number" class="panji-child-edit no-print" data-date="${row.date}" value="${row.childrenFed}" min="1" max="60" title="बच्चे की संख्या बदलें (क्लिक करें)">
            <span class="only-print font-bold">${row.childrenFed}</span>
          </td>
          ${feedingCellsHtml}
        </tr>
      `;
    }
  });

  tableHtml += `
        </tbody>
        <tfoot style="font-weight:700;">
          <!-- 1. Row: Monthly Total Consumed (USE) -->
          <tr style="background:#1E293B; color:#FFF;">
            <td class="sticky-col-1" style="background:#1E293B !important; color:#86EFAC !important; font-weight:800;">कुल</td>
            <td class="sticky-col-2" style="background:#1E293B !important; color:#86EFAC !important; font-weight:800;">खपत</td>
            <td colspan="2" style="padding:10px 12px; text-align:left; background:#1E293B; color:#FFF;">मासिक कुल खपत (Total USE - ${panji.feedingDaysCount} पोषाहार दिवस):</td>
            <td style="text-align:center; color:#86EFAC; background:#1E293B;">कुल</td>
            ${tableCommodities.map(c => {
              if (c.id === 'milk') {
                const totalUseKg = Number(panji.totalConsumed.milk || 0);
                const totalUsePkt = (totalUseKg / 0.2).toFixed(3);
                return `
                  <td class="cell-use" style="background:#334155; color:#FEF08A; font-weight:800; border-left:2px solid #64748B; font-size:11px;">
                    <div>${totalUsePkt} pkt</div>
                    <div style="color:#93C5FD; font-size:10px;">(${totalUseKg.toFixed(3)} kg)</div>
                  </td>
                  <td class="cell-balance" style="background:#1E293B; color:#94A3B8; font-weight:normal; text-align:center;">-</td>
                `;
              }
              const totalUse = c.id === 'eggs' ? panji.totalConsumed.eggs : panji.totalConsumed[c.id].toFixed(3);
              return `
                <td class="cell-use" style="background:#334155; color:#FEF08A; font-weight:800; border-left:2px solid #64748B;">${totalUse}</td>
                <td class="cell-balance" style="background:#1E293B; color:#94A3B8; font-weight:normal; text-align:center;">-</td>
              `;
            }).join('')}
          </tr>
          <!-- 2. Row: Final Closing Balance Stock -->
          <tr style="background:#0F172A; color:#86EFAC; border-top:2px solid #334155;">
            <td class="sticky-col-1" style="background:#0F172A !important; color:#38BDF8 !important; font-weight:800;">अंतिम</td>
            <td class="sticky-col-2" style="background:#0F172A !important; color:#38BDF8 !important; font-weight:800;">बैलेंस</td>
            <td colspan="2" style="padding:10px 12px; text-align:left; color:#FFFFFF; font-size:13px; background:#0F172A;">
              ⭐ माह का अंतिम शेष स्टॉक (Final Balance Stock):
            </td>
            <td style="text-align:center; color:#DCFCE7; background:#0F172A;">बैलेंस</td>
            ${tableCommodities.map(c => {
              const finBal = panji.commoditySummary[c.id].currentBalance;
              if (c.id === 'milk') {
                const finBalKg = Number(finBal || 0);
                const finBalPkt = (finBalKg / 0.2).toFixed(3);
                return `
                  <td class="cell-use" style="background:#0F172A; color:#94A3B8; font-weight:normal; text-align:center; border-left:2px solid #64748B;">-</td>
                  <td class="cell-balance" style="background:#14532D; color:#FFFFFF; font-weight:800; font-size:11px;">
                    <div>${finBalPkt} pkt</div>
                    <div style="color:#BBF7D0; font-size:10px;">(${finBalKg.toFixed(3)} kg)</div>
                  </td>
                `;
              }
              return `
                <td class="cell-use" style="background:#0F172A; color:#94A3B8; font-weight:normal; text-align:center; border-left:2px solid #64748B;">-</td>
                <td class="cell-balance" style="background:#14532D; color:#FFFFFF; font-weight:800; font-size:12.5px;">${finBal}</td>
              `;
            }).join('')}
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  container.innerHTML = summaryCardsHtml + headerHtml + tableHtml;
  window.currentActiveMonthlyPanji = panji;

  // 4. ATTACH INTERACTIVE EVENT LISTENERS (Child Count Edit & Holiday Toggles)
  attachPanjiInteractiveListeners(panji.monthKey);
}

/**
 * Attaches interactive listeners for editing child attendance and toggling holidays
 */
function attachPanjiInteractiveListeners(monthKey) {
  // A. Inline Child Attendance Editing
  const childInputs = document.querySelectorAll(".panji-child-edit");
  childInputs.forEach(input => {
    input.addEventListener("change", (e) => {
      const date = e.target.getAttribute("data-date");
      const val = Number(e.target.value);
      if (isNaN(val) || val < 0) return;

      if (window.db) {
        window.db.setDayOverride(monthKey, date, { childrenCount: val });
      }
      renderMonthlyBhandarPanjiUI();
      if (window.showToast) {
        window.showToast(`तारीख ${date} की उपस्थिति ${val} बच्चे दर्ज हुई!`, "success");
      }
    });
  });

  // B. Holiday / Working Quick Toggles per row
  const toggleButtons = document.querySelectorAll(".btn-holiday-toggle");
  toggleButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const action = btn.getAttribute("data-action");
      const date = btn.getAttribute("data-date");

      if (action === "set-holiday") {
        const reason = prompt(`तारीख ${date} के लिए अवकाश का कारण लिखें:`, "अत्यधिक वर्षा / स्थानीय अवकाश");
        if (reason !== null && reason.trim() !== "") {
          if (window.db) {
            window.db.setDayOverride(monthKey, date, {
              isHoliday: true,
              holidayName: reason.trim(),
              childrenCount: 0
            });
          }
          renderMonthlyBhandarPanjiUI();
          if (window.showToast) {
            window.showToast(`तारीख ${date} को अवकाश दर्ज किया गया!`, "success");
          }
        }
      } else if (action === "set-working") {
        if (confirm(`क्या आप तारीख ${date} को केंद्र चालू (पोषाहार दिवस) करना चाहते हैं?`)) {
          if (window.db) {
            window.db.setDayOverride(monthKey, date, {
              isHoliday: false,
              childrenCount: 35
            });
          }
          renderMonthlyBhandarPanjiUI();
          if (window.showToast) {
            window.showToast(`तारीख ${date} को पोषाहार दिवस के रूप में चालू किया गया!`, "success");
          }
        }
      }
    });
  });
}

/**
 * Trigger commit of the current active monthly panji to the database
 */
function autoFillFullMonthRegister() {
  if (!window.currentActiveMonthlyPanji) {
    renderMonthlyBhandarPanjiUI();
  }
  const panji = window.currentActiveMonthlyPanji;
  if (!panji) return;

  if (confirm(`क्या आप ${panji.monthKey} के लिए पूरा मासिक रजिस्टर (रविवार, छुट्टियां व संशोधित उपस्थिति सहित) लेजर में सेव करना चाहते हैं?`)) {
    commitMonthlyRegisterToDatabase(panji);
    if (window.showToast) {
      window.showToast(`✅ ${panji.monthKey} का पूरा मासिक भंडार पंजी लेजर में सुरक्षित हो गया!`, "success");
    }
  }
}

/**
 * Export Monthly Bhandar Panji Table to CSV with UTF-8 BOM
 */
function exportMonthlyPanjiCsv() {
  if (!window.currentActiveMonthlyPanji) {
    renderMonthlyBhandarPanjiUI();
  }
  const p = window.currentActiveMonthlyPanji;
  if (!p) return;

  const headers = [
    "तारीख",
    "दिन",
    "स्थिति (Status)",
    "मेनू विवरण",
    "उपस्थित बच्चे",
    "चावल खपत (kg)",
    "चावल अंतिम शेष (kg)",
    "दाल खपत (kg)",
    "दाल अंतिम शेष (kg)",
    "दूध खपत (पैकेट - 200g)",
    "दूध खपत (kg)",
    "दूध अंतिम शेष (पैकेट)",
    "दूध अंतिम शेष (kg)",
    "अंडा खपत (संख्या)",
    "अंडा अंतिम शेष (संख्या)",
    "सोयाबीन खपत (kg)",
    "सोयाबीन अंतिम शेष (kg)",
    "चना खपत (kg)",
    "चना अंतिम शेष (kg)",
    "मूंगफली खपत (kg)",
    "मूंगफली अंतिम शेष (kg)",
    "गुड़ खपत (kg)",
    "गुड़ अंतिम शेष (kg)",
    "तेल खपत (L)",
    "तेल अंतिम शेष (L)",
    "नमक-मसाले खपत (kg)",
    "नमक-मसाले अंतिम शेष (kg)"
  ];

  const rows = p.dailyRows.map(r => {
    const milkKgUse = Number(r.consumed.milk || 0);
    const milkPktUse = Number((milkKgUse / 0.2).toFixed(3));
    const milkKgBal = r.runningClosing.milk !== undefined ? Number(r.runningClosing.milk) : '';
    const milkPktBal = milkKgBal !== '' ? Number((milkKgBal / 0.2).toFixed(3)) : '';

    return [
      `"${r.date}"`,
      `"${r.dayOfWeekHi}"`,
      `"${r.isSunday ? 'रविवार अवकाश' : (r.holidayName || (r.isFeedingDay ? 'पोषाहार दिवस' : 'कार्यालय दिवस'))}"`,
      `"${r.menuTitle.replace(/"/g, '""')}"`,
      `"${r.childrenFed || 0}"`,
      `"${r.consumed.rice || 0}"`,
      `"${r.runningClosing.rice || ''}"`,
      `"${r.consumed.dal || 0}"`,
      `"${r.runningClosing.dal || ''}"`,
      `"${milkPktUse}"`,
      `"${milkKgUse}"`,
      `"${milkPktBal}"`,
      `"${milkKgBal}"`,
      `"${r.consumed.eggs || 0}"`,
      `"${r.runningClosing.eggs || ''}"`,
      `"${r.consumed.soybean || 0}"`,
      `"${r.runningClosing.soybean || ''}"`,
      `"${r.consumed.chana || 0}"`,
      `"${r.runningClosing.chana || ''}"`,
      `"${r.consumed.peanut || 0}"`,
      `"${r.runningClosing.peanut || ''}"`,
      `"${r.consumed.jaggery || 0}"`,
      `"${r.runningClosing.jaggery || ''}"`,
      `"${r.consumed.oil || 0}"`,
      `"${r.runningClosing.oil || ''}"`,
      `"${r.consumed.salt_spices || 0}"`,
      `"${r.runningClosing.salt_spices || ''}"`
    ];
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.join(","))].join("\r\n");
  if (window.downloadBlob) {
    window.downloadBlob(csvContent, "text/csv;charset=utf-8;", `AWW_Bihar_Bhandar_Panji_${p.monthKey}.csv`);
  }
}

/**
 * Print Monthly Date-Wise Bhandar Panji
 */
function printMonthlyPanji() {
  window.print();
}

// Helpers
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Toggle Stock Summary View (Small Boxes vs Table)
function toggleStockSummaryView(mode) {
  const boxesEl = document.getElementById("stockBoxesView");
  const tableEl = document.getElementById("stockTableView");
  const btnBoxes = document.getElementById("btnStockViewBoxes");
  const btnTable = document.getElementById("btnStockViewTable");

  if (mode === "table") {
    if (boxesEl) boxesEl.style.display = "none";
    if (tableEl) tableEl.style.display = "block";
    btnBoxes?.classList.remove("active");
    btnTable?.classList.add("active");
  } else {
    if (boxesEl) boxesEl.style.display = "grid";
    if (tableEl) tableEl.style.display = "none";
    btnBoxes?.classList.add("active");
    btnTable?.classList.remove("active");
  }
}

// Global Exports
window.generateMonthlyBhandarPanji = generateMonthlyBhandarPanji;
window.commitMonthlyRegisterToDatabase = commitMonthlyRegisterToDatabase;
window.saveBulkMonthlyStockAndGenerate = saveBulkMonthlyStockAndGenerate;
window.renderMonthlyBhandarPanjiUI = renderMonthlyBhandarPanjiUI;
window.autoFillFullMonthRegister = autoFillFullMonthRegister;
window.exportMonthlyPanjiCsv = exportMonthlyPanjiCsv;
window.printMonthlyPanji = printMonthlyPanji;
window.toggleStockSummaryView = toggleStockSummaryView;

