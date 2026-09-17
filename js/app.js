/* ==========================================================================
   Bihar State ICDS - Anganwadi Sevika Management System
   Application Coordinator & UI Controller: js/app.js
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  // Wait for Supabase to load fresh data (or fall through instantly if offline/not configured)
  if (window.dbReady) await window.dbReady;
  initApp();
});

function initApp() {
  // 1. Initialize Centre Profile in Top Pill & Settings
  refreshCentreProfileDisplay();

  // 2. Populate Inward Commodity Select
  populateInwardCommoditiesSelect();

  // 3. Render Views
  renderDashboardUI();
  renderLiveStockCards();
  renderTransactionsLedger();

  if (window.renderMonthlyBhandarPanjiUI) renderMonthlyBhandarPanjiUI();

  // 4. Setup Event Listeners
  setupNavigation();
  setupModals();
  setupFormSubmissions();
  setupCalculators();
  setupExportButtons();
  setupLanguageToggle();
  setupSettingsHandlers();

  // 5. Set today's date in form date pickers
  const today = new Date().toISOString().split("T")[0];
  ["inwardDate", "hcmDate", "thrDate", "bulkStockDate"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });

  // Trigger initial HCM and THR preview calculations
  updateHcmPreviewCalculation();
  updateThrPreviewCalculation();
}

/**
 * Tab Navigation Setup (APK Bottom Nav & Views)
 */
function setupNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const targetView = tab.getAttribute("data-view");
      document.querySelectorAll(".view-section").forEach(view => {
        view.classList.remove("active");
      });

      if (targetView === "dashboard") {
        document.getElementById("viewDashboard")?.classList.add("active");
        renderDashboardUI();
      } else if (targetView === "inventory") {
        document.getElementById("viewInventory")?.classList.add("active");
        renderLiveStockCards();
        renderTransactionsLedger();
      } else if (targetView === "autoPanji") {
        document.getElementById("viewAutoPanji")?.classList.add("active");
        if (window.renderMonthlyBhandarPanjiUI) renderMonthlyBhandarPanjiUI();
      } else if (targetView === "biharMenu") {
        document.getElementById("viewBiharMenu")?.classList.add("active");
      } else if (targetView === "settings") {
        document.getElementById("viewSettings")?.classList.add("active");
        populateSettingsForm();
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Header Shortcuts
  document.getElementById("btnHeaderMenuShortcut")?.addEventListener("click", () => {
    document.querySelectorAll(".view-section").forEach(view => view.classList.remove("active"));
    document.getElementById("viewBiharMenu")?.classList.add("active");
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Dashboard Action Buttons
  document.getElementById("btnDashTodayHcm")?.addEventListener("click", () => {
    openModal("modalDailyHcm");
  });

  document.getElementById("btnDashViewFullMenu")?.addEventListener("click", () => {
    document.querySelectorAll(".view-section").forEach(view => view.classList.remove("active"));
    document.getElementById("viewBiharMenu")?.classList.add("active");
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // 6 APK Quick Action Tiles
  document.getElementById("btnDashTileBulkStock")?.addEventListener("click", () => {
    openModal("modalBulkStock");
  });

  document.getElementById("btnDashTilePanji")?.addEventListener("click", () => {
    document.getElementById("tabAutoPanji")?.click();
  });

  document.getElementById("btnDashTileInward")?.addEventListener("click", () => {
    openModal("modalInward");
  });

  document.getElementById("btnDashTileHcm")?.addEventListener("click", () => {
    openModal("modalDailyHcm");
  });



  document.getElementById("btnDashTileBackup")?.addEventListener("click", () => {
    if (window.downloadJsonBackup) window.downloadJsonBackup();
  });

  document.getElementById("btnDashGoToStockLedger")?.addEventListener("click", () => {
    document.getElementById("tabInventory")?.click();
  });

  // Quick Action: "35 बच्चों का पूरे माह का लेजर भरें" button
  document.getElementById("btnGoToAutoPanji")?.addEventListener("click", () => {
    document.getElementById("tabAutoPanji")?.click();
  });

  // Top pill click -> navigates to Settings tab
  document.getElementById("centreQuickInfo")?.addEventListener("click", () => {
    document.getElementById("tabSettings")?.click();
  });
}

/**
 * Refresh Centre Details in Header Pill
 * Fix #14: awcName from profile instead of hard-coded "केंद्र 18"
 */
function refreshCentreProfileDisplay() {
  const profile = window.db.getProfile();
  const pillAwcName = document.getElementById("pillAwcName");
  const pillAwcCode = document.getElementById("pillAwcCode");

  if (pillAwcName) pillAwcName.textContent = profile.sevikaName ? `${profile.sevikaName} — ${profile.awcName || 'केंद्र'}` : (profile.awcName || 'केंद्र');
  if (pillAwcCode) pillAwcCode.textContent = `कोड: ${profile.awcCode}`;
}

/**
 * Render Sevika Home Dashboard UI
 * Fixes: #9 (dynamic month name), #10 (dynamic child count from DB), #14 (no hard-coded centre 18)
 */
function renderDashboardUI() {
  const profile = window.db ? window.db.getProfile() : { sevikaName: "मालती कुमारी", awcCode: "201", awcName: "दरियापुर - केंद्र 201" };
  const beneficiaries = window.db ? window.db.getBeneficiaries() : null;
  const defaultChildCount = beneficiaries ? beneficiaries.preschoolKids : 35;

  // 1. Hero Card details
  const heroTitle = document.getElementById("dashHeroTitle");
  if (heroTitle) heroTitle.textContent = `नमस्ते, ${profile.sevikaName || "मालती कुमारी"} जी! 🙏`;

  const awcNameEl = document.getElementById("dashAwcName");
  if (awcNameEl) awcNameEl.textContent = profile.awcName || "दरियापुर - केंद्र 201";

  const awcCodeEl = document.getElementById("dashAwcCode");
  if (awcCodeEl) awcCodeEl.textContent = profile.awcCode || "201";

  // Fix #10: update child count from DB
  const childCountEl = document.getElementById("dashChildCount");
  if (childCountEl) childCountEl.textContent = defaultChildCount;

  // Date & Day
  const now = new Date();
  const daysHi = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
  const monthsHi = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितम्बर", "अक्टूबर", "नवम्बर", "दिसम्बर"];
  const dayIndex = now.getDay();
  const dayNameHi = daysHi[dayIndex];
  const dateStr = `${now.getDate()} ${monthsHi[now.getMonth()]} ${now.getFullYear()}`;
  const currentMonthName = `${monthsHi[now.getMonth()]} ${now.getFullYear()}`; // Fix #9

  const dateDisplay = document.getElementById("dashTodayDateDisplay");
  if (dateDisplay) {
    dateDisplay.textContent = `📅 आज: ${dayNameHi}, ${dateStr}`;
  }

  // Fix #9: Update progress card month heading dynamically
  const progressHeading = document.getElementById("dashProgressMonthTitle");
  if (progressHeading) progressHeading.textContent = `माह ${currentMonthName} - प्रगति संक्षेप`;

  // 2. Today's Meal & Snack Card
  const dayBadge = document.getElementById("dashTodayDayBadge");
  const mealNameEl = document.getElementById("dashTodayMealName");
  const mealItemsEl = document.getElementById("dashTodayMealItems");
  const snackNameEl = document.getElementById("dashTodaySnackName");
  const snackItemsEl = document.getElementById("dashTodaySnackItems");
  const reqChipsContainer = document.getElementById("dashTodayReqChips");

  if (dayIndex === 0) {
    if (dayBadge) {
      dayBadge.textContent = "आज: रविवार (साप्ताहिक अवकाश)";
      dayBadge.className = "badge badge-warning";
    }
    if (mealNameEl) mealNameEl.textContent = "साप्ताहिक अवकाश (Sunday Off)";
    if (mealItemsEl) mealItemsEl.textContent = "आज आंगनवाड़ी केंद्र का साप्ताहिक अवकाश है। कोई भोजन वितरण नहीं।";
    if (snackNameEl) snackNameEl.textContent = "अवकाश";
    if (snackItemsEl) snackItemsEl.textContent = "नाश्ता वितरण देय नहीं";
    if (reqChipsContainer) {
      reqChipsContainer.innerHTML = `<span class="req-chip" style="background:#F1F5F9; color:#64748B;">आज रविवार अवकाश है</span>`;
    }
  } else {
    const menuStd = (typeof BIHAR_OFFICIAL_HCM_STANDARDS !== "undefined") ? BIHAR_OFFICIAL_HCM_STANDARDS[dayIndex] : null;
    if (menuStd) {
      if (dayBadge) {
        dayBadge.textContent = `आज: ${menuStd.day_name_hi}`;
        dayBadge.className = "badge badge-success";
      }
      if (mealNameEl) mealNameEl.textContent = menuStd.meal_hi;
      if (snackNameEl) snackNameEl.textContent = menuStd.snack_hi;

      const chips = [];
      let mealDetailsText = [];
      let snackDetailsText = [];

      menuStd.items.forEach(item => {
        if (item.itemId === "rice") {
          const totalKg = ((item.grams * defaultChildCount) / 1000).toFixed(3);
          chips.push(`🌾 चावल: ${totalKg} kg`);
          mealDetailsText.push(`चावल ${item.grams}g`);
        } else if (item.itemId === "dal") {
          const totalKg = ((item.grams * defaultChildCount) / 1000).toFixed(3);
          chips.push(`🥣 दाल: ${totalKg} kg`);
          mealDetailsText.push(`दाल ${item.grams}g`);
        } else if (item.itemId === "soybean") {
          const totalKg = ((item.grams * defaultChildCount) / 1000).toFixed(3);
          chips.push(`🥔 सोयाबीन: ${totalKg} kg`);
          mealDetailsText.push(`सोयाबीन ${item.grams}g`);
        } else if (item.itemId === "chana" && item.grams) {
          const totalKg = ((item.grams * defaultChildCount) / 1000).toFixed(3);
          chips.push(`🧆 चना: ${totalKg} kg`);
          mealDetailsText.push(`चना ${item.grams}g`);
        } else if (item.itemId === "jaggery" && item.grams) {
          const totalKg = ((item.grams * defaultChildCount) / 1000).toFixed(3);
          chips.push(`🍯 गुड़: ${totalKg} kg`);
          mealDetailsText.push(`गुड़ ${item.grams}g`);
        } else if (item.itemId === "peanut" && item.grams) {
          const totalKg = ((item.grams * defaultChildCount) / 1000).toFixed(3);
          chips.push(`🥜 मूंगफली: ${totalKg} kg`);
          snackDetailsText.push(`मूंगफली ${item.grams}g`);
        } else if (item.itemId === "milk") {
          const milkPkts = (defaultChildCount * 0.05).toFixed(3);
          chips.push(`🥛 सुधा दूध: ${milkPkts} पैकेट`);
          snackDetailsText.push(`दूध 100ml (200g पैकेट से)`);
        } else if (item.itemId === "eggs") {
          chips.push(`🥚 उबला अंडा: ${defaultChildCount} संख्या`);
          snackDetailsText.push(`उबला अंडा`);
        } else if (item.itemId === "oil" && item.grams) {
          const totalKg = ((item.grams * defaultChildCount) / 1000).toFixed(3);
          chips.push(`🌻 तेल: ${totalKg} kg`);
          mealDetailsText.push(`तेल ${item.grams}g`);
        }
      });

      if (mealItemsEl && mealDetailsText.length > 0) {
        mealItemsEl.textContent = `${mealDetailsText.join(", ")} (प्रति बच्चा)`;
      }
      if (snackItemsEl && snackDetailsText.length > 0) {
        snackItemsEl.textContent = `${snackDetailsText.join(" + ")} (${defaultChildCount} बच्चे)`;
      }

      if (reqChipsContainer) {
        reqChipsContainer.innerHTML = chips.map(c => `<span class="req-chip">${c}</span>`).join("");
      }
    }
  }

  // 3. Live Stock Glance Cards — Fix #1: use current month dynamically
  const monthKey = window.getCurrentMonthKey ? window.getCurrentMonthKey() : getCurrentMonthKey();
  const stockGlanceContainer = document.getElementById("dashLiveStockGlanceGrid");
  if (stockGlanceContainer && window.computeLiveStockBalances) {
    const balances = window.computeLiveStockBalances(monthKey);
    const comms = window.BIHAR_COMMODITIES || [];

    stockGlanceContainer.innerHTML = comms.map(c => {
      const b = balances[c.id];
      if (!b) return "";
      const isCritical = b.status === "critical";
      const isWarning = b.status === "warning";
      const statusClass = isCritical ? "critical" : (isWarning ? "warning" : "");

      let badgeHtml = `<span class="badge badge-success">पर्याप्त</span>`;
      if (isCritical) {
        badgeHtml = `<span class="badge badge-danger">अति कम</span>`;
      } else if (isWarning) {
        badgeHtml = `<span class="badge badge-warning">पुनः मांगें</span>`;
      }

      let valHtml = `${b.currentBalance.toFixed(3)} <span class="sub-unit">${c.unit_en || "kg"}</span>`;
      let packetsPill = "";
      if (c.id === "milk") {
        const packets = (b.currentBalance / 0.2).toFixed(3);
        valHtml = `${packets} <span class="sub-unit">पैकेट</span>`;
        packetsPill = `<div class="stock-card-packets">(${b.currentBalance.toFixed(3)} kg दूध पाउडर)</div>`;
      }

      return `
        <div class="dash-stock-card ${statusClass}" onclick="document.getElementById('tabInventory')?.click()">
          <div class="stock-card-top">
            <span class="item-icon">${c.icon || "📦"}</span>
            ${badgeHtml}
          </div>
          <div class="stock-card-name">${c.name_hi.split(" ")[0]}</div>
          <div class="stock-card-val">${valHtml}</div>
          ${packetsPill}
        </div>
      `;
    }).join("");
  }

  // 4. Monthly Progress Stats — Fix #1: use current month dynamically
  if (window.generateMonthlyBhandarPanji) {
    try {
      const panji = window.generateMonthlyBhandarPanji(now.getFullYear(), now.getMonth() + 1, defaultChildCount);
      const totalFeedingEl = document.getElementById("dashTotalFeedingDays");
      const totalHolidaysEl = document.getElementById("dashTotalHolidays");
      const totalMilkEl = document.getElementById("dashTotalMilkPacketsUsed");
      const totalEggsEl = document.getElementById("dashTotalEggsUsed");

      if (totalFeedingEl) totalFeedingEl.textContent = `${panji.feedingDaysCount || 0} दिन`;
      if (totalHolidaysEl) totalHolidaysEl.textContent = `${panji.holidaysCount || 0} दिन`;

      if (totalMilkEl && panji.totalConsumed && panji.totalConsumed.milk !== undefined) {
        const milkKg = panji.totalConsumed.milk;
        const packets = (milkKg / 0.2).toFixed(3);
        totalMilkEl.textContent = `${packets} पैकेट (${milkKg.toFixed(3)} kg)`;
      }

      if (totalEggsEl && panji.totalConsumed && panji.totalConsumed.eggs !== undefined) {
        totalEggsEl.textContent = `${panji.totalConsumed.eggs} अंडे`;
      }
    } catch (e) {
      console.warn("Could not calculate monthly panji stats for dashboard:", e);
    }
  }
}

window.renderDashboardUI = renderDashboardUI;
window.getCurrentMonthKey = getCurrentMonthKey;


/**
 * Populate Inward Commodity Dropdown
 */
function populateInwardCommoditiesSelect() {
  const select = document.getElementById("inwardItemSelect");
  if (!select) return;

  const lang = (typeof currentLang !== "undefined" ? currentLang : "hi");
  let html = "";
  BIHAR_COMMODITIES.forEach(c => {
    const name = lang === "hi" ? c.name_hi : c.name_en;
    html += `<option value="${c.id}" data-unit="${c.unit_hi}">${name} (${c.unit_hi})</option>`;
  });
  select.innerHTML = html;

  const updateInwardUnitAndNotice = () => {
    const selectedOption = select.options[select.selectedIndex];
    const unit = selectedOption ? (selectedOption.getAttribute("data-unit") || "kg") : "kg";
    const unitInput = document.getElementById("inwardUnit");
    if (unitInput) unitInput.value = unit;

    const notice = document.getElementById("inwardMilkNotice");
    if (notice) {
      if (select.value === "milk") {
        const qtyVal = parseFloat(document.getElementById("inwardQuantity")?.value) || 0;
        const pktVal = Number((qtyVal / 0.2).toFixed(3));
        notice.style.display = "block";
        notice.innerHTML = `🥛 <strong>सूखा दूध पाउडर:</strong> आवक प्रविष्टि कि.ग्रा. (kg) में करें (1 कि.ग्रा. = 5 पैकेट | 1 पैकेट = 200 ग्राम) ${qtyVal > 0 ? `| <strong>${qtyVal} कि.ग्रा. = ${pktVal} पैकेट</strong>` : ''}`;
      } else {
        notice.style.display = "none";
      }
    }
  };

  select.addEventListener("change", updateInwardUnitAndNotice);
  document.getElementById("inwardQuantity")?.addEventListener("input", () => {
    if (select.value === "milk") updateInwardUnitAndNotice();
  });
  updateInwardUnitAndNotice();
}

/**
 * Modals Management
 */
function setupModals() {
  // Open buttons
  document.getElementById("btnOpenInwardModal")?.addEventListener("click", () => openModal("modalInward"));
  document.getElementById("btnOpenBulkStockModal")?.addEventListener("click", () => openModal("modalBulkStock"));
  document.getElementById("btnOpenBulkStockFromPanji")?.addEventListener("click", () => openModal("modalBulkStock"));
  document.getElementById("btnOpenAddHolidayModal")?.addEventListener("click", () => {
    const monthSelect = document.getElementById("panjiMonthSelect");
    const yearSelect = document.getElementById("panjiYearSelect");
    const month = (monthSelect?.value || new Date().getMonth() + 1).toString().padStart(2, "0");
    const year = yearSelect?.value || new Date().getFullYear();
    const holidayDateInput = document.getElementById("holidayDate");
    if (holidayDateInput) {
      holidayDateInput.value = `${year}-${month}-01`;
    }
    openModal("modalAddHoliday");
  });
  document.getElementById("btnOpenDailyHcmModal")?.addEventListener("click", () => openModal("modalDailyHcm"));
  document.getElementById("btnOpenThrModal")?.addEventListener("click", () => openModal("modalThr"));

  // Close buttons
  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close");
      closeModal(modalId);
    });
  });

  // Close on backdrop click
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
    }
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove("active");
  }
}

window.openInwardModal = () => openModal("modalInward");

window.openInwardForCommodity = (commodityId) => {
  openModal("modalInward");
  const select = document.getElementById("inwardItemSelect");
  if (select) {
    select.value = commodityId;
    select.dispatchEvent(new Event("change"));
  }
};

/**
 * Live Dynamic Calculations inside Modals
 */
function setupCalculators() {
  // HCM Modal Inputs
  const hcmDaySelect = document.getElementById("hcmDayPresetSelect");
  const hcmKidsInput = document.getElementById("hcmChildrenCount");
  const hcmEggsInput = document.getElementById("hcmEggsCount");

  if (hcmDaySelect) hcmDaySelect.addEventListener("change", updateHcmPreviewCalculation);
  if (hcmKidsInput) hcmKidsInput.addEventListener("input", updateHcmPreviewCalculation);
  if (hcmEggsInput) hcmEggsInput.addEventListener("input", updateHcmPreviewCalculation);

  // Search input for stock cards
  document.getElementById("stockSearchInput")?.addEventListener("input", (e) => {
    renderLiveStockCards(e.target.value);
  });

  // Filter for Ledger
  document.getElementById("ledgerTypeFilter")?.addEventListener("change", (e) => {
    renderTransactionsLedger(e.target.value);
  });



  // Full Month Bhandar Panji Selectors (Month, Year, Children Count)
  document.getElementById("panjiMonthSelect")?.addEventListener("change", () => {
    if (window.renderMonthlyBhandarPanjiUI) renderMonthlyBhandarPanjiUI();
  });
  document.getElementById("panjiYearSelect")?.addEventListener("change", () => {
    if (window.renderMonthlyBhandarPanjiUI) renderMonthlyBhandarPanjiUI();
  });
  document.getElementById("panjiChildCountInput")?.addEventListener("input", () => {
    if (window.renderMonthlyBhandarPanjiUI) renderMonthlyBhandarPanjiUI();
  });

  // THR Inputs
  ["thrNormalKidsCount", "thrSamKidsCount", "thrPwCount", "thrLmCount", "thrProteinOption"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", updateThrPreviewCalculation);
    document.getElementById(id)?.addEventListener("change", updateThrPreviewCalculation);
  });

  // Bulk Stock Modal Milk Real-Time Calculation Helper
  const bulkMilkInput = document.getElementById("bulk_milk");
  const bulkMilkKgCalc = document.getElementById("bulkMilkKgCalc");
  if (bulkMilkInput && bulkMilkKgCalc) {
    const updateBulkMilkCalc = () => {
      const val = parseFloat(bulkMilkInput.value) || 0;
      const kg = (val * 0.2).toFixed(3);
      bulkMilkKgCalc.innerHTML = `💡 <strong>${val}</strong> पैकेट = <strong>${kg}</strong> कि.ग्रा. (kg)`;
    };
    bulkMilkInput.addEventListener("input", updateBulkMilkCalc);
    updateBulkMilkCalc();
  }
}

function updateHcmPreviewCalculation() {
  const day = Number(document.getElementById("hcmDayPresetSelect")?.value || 1);
  const count = Number(document.getElementById("hcmChildrenCount")?.value || 38);
  const eggsCount = Number(document.getElementById("hcmEggsCount")?.value || 34);

  const previewBox = document.getElementById("hcmCalcPreviewList");
  if (!previewBox) return;

  const result = window.biharMenu.calculateHcmConsumption(day, count, eggsCount);
  let html = "";
  result.items.forEach(item => {
    const c = BIHAR_COMMODITIES.find(c => c.id === item.itemId);
    const name = c ? c.name_hi : item.itemId;
    html += `
      <div class="calc-row">
        <span>${name}:</span>
        <strong style="color:#D84315;">${item.formula}</strong>
      </div>
    `;
  });

  previewBox.innerHTML = html;
}

function updateThrPreviewCalculation() {
  const normalKids = Number(document.getElementById("thrNormalKidsCount")?.value || 32);
  const samKids = Number(document.getElementById("thrSamKidsCount")?.value || 4);
  const pwCount = Number(document.getElementById("thrPwCount")?.value || 12);
  const lmCount = Number(document.getElementById("thrLmCount")?.value || 10);
  const proteinOption = document.getElementById("thrProteinOption")?.value || "eggs";

  const previewBox = document.getElementById("thrCalcPreviewList");
  if (!previewBox) return;

  const quota = window.biharMenu.calculateThrQuota(normalKids, samKids, pwCount, lmCount);

  let html = `
    <div class="calc-row">
      <span>कुल पंजीकृत लाभार्थी:</span>
      <strong style="color:#1E293B;">${quota.totalBeneficiaries} व्यक्ति</strong>
    </div>
    <div class="calc-row">
      <span>🌾 चावल (1875g / 2942.5g / 2250g):</span>
      <strong style="color:#D84315;">${quota.rice.quantity} kg</strong>
    </div>
    <div class="calc-row">
      <span>🥣 मूंगदाल (750g / 1337.5g / 1000g):</span>
      <strong style="color:#1B5E20;">${quota.moong_dal.quantity} kg</strong>
    </div>
    <div class="calc-row">
      <span>🧆 सोयाबीन बड़ी (500g / 500g / 375g):</span>
      <strong style="color:#E65100;">${quota.soybean.quantity} kg</strong>
    </div>
    <div class="calc-row">
      <span>🫗 खाद्य तेल (250g / 500g / 375g):</span>
      <strong style="color:#F57F17;">${quota.oil.quantity} kg</strong>
    </div>
    <div class="calc-row">
      <span>🧂 मसाला मिक्स व नमक:</span>
      <strong style="color:#546E7A;">${(quota.masala_mix.quantity + quota.salt.quantity).toFixed(3)} kg</strong>
    </div>
  `;

  previewBox.innerHTML = html;
}

/**
 * Setup Form Submissions (Inward, HCM, THR)
 */
function setupFormSubmissions() {
  // 0. Bulk Monthly Stock Inward & Auto-Panji Generation Form
  document.getElementById("formBulkStock")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const month = Number(document.getElementById("bulkStockMonth")?.value || 9);
    const year = Number(document.getElementById("bulkStockYear")?.value || 2026);
    const arrivalDate = document.getElementById("bulkStockDate")?.value || `${year}-${month.toString().padStart(2, "0")}-01`;
    const challan = document.getElementById("bulkStockChallan")?.value || `SFC/SARAN/${year}/${month}/108`;
    const childCount = Number(document.getElementById("bulkStockChildCount")?.value || 35);
    const autoGen = document.getElementById("chkAutoGeneratePanji")?.checked;

    const bulkMilkPackets = parseFloat(document.getElementById("bulk_milk")?.value || 0);
    const milkKg = Number((bulkMilkPackets * 0.2).toFixed(3));

    const data = {
      month,
      year,
      arrivalDate,
      challan,
      childCount,
      autoGeneratePanji: autoGen !== false,
      rice: parseFloat(document.getElementById("bulk_rice")?.value || 0),
      dal: parseFloat(document.getElementById("bulk_dal")?.value || 0),
      milk: milkKg,
      milkPackets: bulkMilkPackets,
      eggs: parseInt(document.getElementById("bulk_eggs")?.value || 0),
      soybean: parseFloat(document.getElementById("bulk_soybean")?.value || 0),
      chana: parseFloat(document.getElementById("bulk_chana")?.value || 0),
      peanut: parseFloat(document.getElementById("bulk_peanut")?.value || 0),
      jaggery: parseFloat(document.getElementById("bulk_jaggery")?.value || 0),
      oil: parseFloat(document.getElementById("bulk_oil")?.value || 0),
      salt_spices: parseFloat(document.getElementById("bulk_salt_spices")?.value || 0)
    };

    if (window.saveBulkMonthlyStockAndGenerate) {
      window.saveBulkMonthlyStockAndGenerate(data);
    }
    closeModal("modalBulkStock");
  });

  // 1. Stock Inward Form
  document.getElementById("formInward")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("inwardDate").value;
    const item = document.getElementById("inwardItemSelect").value;
    const qty = parseFloat(document.getElementById("inwardQuantity").value);
    const source = document.getElementById("inwardSourceSelect").value;
    const challan = document.getElementById("inwardChallan").value;
    const notes = document.getElementById("inwardNotes").value;

    if (!qty || qty <= 0) {
      alert("कृपया वैध मात्रा दर्ज करें (Please enter valid quantity)");
      return;
    }

    window.db.addTransaction({
      date,
      type: "inward",
      item,
      quantity: qty,
      source,
      challan,
      notes: notes || "स्टॉक आवक प्रविष्टि"
    });

    closeModal("modalInward");
    document.getElementById("formInward").reset();
    document.getElementById("inwardDate").value = new Date().toISOString().split("T")[0];

    renderLiveStockCards();
    renderTransactionsLedger();

    if (window.renderDashboardUI) renderDashboardUI();
    showToast("स्टॉक आवक सफलतापूर्वक दर्ज हुई!", "success");
  });

  // 2. Daily HCM Consumption Form
  document.getElementById("formDailyHcm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("hcmDate").value;
    const day = Number(document.getElementById("hcmDayPresetSelect").value);
    const childrenCount = Number(document.getElementById("hcmChildrenCount").value);
    const eggsCount = Number(document.getElementById("hcmEggsCount").value);

    const calcResult = window.biharMenu.calculateHcmConsumption(day, childrenCount, eggsCount);

    // Add transaction for each item consumed
    calcResult.items.forEach(it => {
      window.db.addTransaction({
        date,
        type: "hcm",
        item: it.itemId,
        quantity: it.quantity,
        source: `दैनिक HCM (${calcResult.mealTitle})`,
        beneficiaries: it.itemId === "eggs" ? eggsCount : childrenCount,
        details: it.formula
      });
    });

    closeModal("modalDailyHcm");
    renderLiveStockCards();
    renderTransactionsLedger();

    if (window.renderDashboardUI) renderDashboardUI();
    showToast("दैनिक भोजन खपत (HCM) लेजर में दर्ज हो गई!", "success");
  });

  // 3. Take Home Ration (THR) Form
  document.getElementById("formThr")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("thrDate").value;
    const normalKids = Number(document.getElementById("thrNormalKidsCount").value);
    const samKids = Number(document.getElementById("thrSamKidsCount").value);
    const pwCount = Number(document.getElementById("thrPwCount").value);
    const lmCount = Number(document.getElementById("thrLmCount").value);

    const quota = window.biharMenu.calculateThrQuota(normalKids, samKids, pwCount, lmCount);

    // Log Rice
    window.db.addTransaction({
      date,
      type: "thr",
      item: "rice",
      quantity: quota.rice.quantity,
      source: "बिहार THR रेडी टू कुक (चावल)",
      beneficiaries: quota.totalBeneficiaries,
      details: quota.rice.formula
    });

    // Log Moong Dal
    window.db.addTransaction({
      date,
      type: "thr",
      item: "dal",
      quantity: quota.moong_dal.quantity,
      source: "बिहार THR रेडी टू कुक (मूंगदाल)",
      beneficiaries: quota.totalBeneficiaries,
      details: quota.moong_dal.formula
    });

    // Log Soybean
    window.db.addTransaction({
      date,
      type: "thr",
      item: "soybean",
      quantity: quota.soybean.quantity,
      source: "बिहार THR रेडी टू कुक (सोयाबीन)",
      beneficiaries: quota.totalBeneficiaries,
      details: quota.soybean.formula
    });

    // Log Oil
    window.db.addTransaction({
      date,
      type: "thr",
      item: "oil",
      quantity: quota.oil.quantity,
      source: "बिहार THR रेडी टू कुक (खाद्य तेल)",
      beneficiaries: quota.totalBeneficiaries,
      details: quota.oil.formula
    });

    // Log Salt & Spices
    const totalCondiments = Number((quota.masala_mix.quantity + quota.salt.quantity).toFixed(3));
    window.db.addTransaction({
      date,
      type: "thr",
      item: "salt_spices",
      quantity: totalCondiments,
      source: "बिहार THR रेडी टू कुक (मसाला मिक्स व नमक)",
      beneficiaries: quota.totalBeneficiaries,
      details: `मसाला: ${quota.masala_mix.quantity}kg + नमक: ${quota.salt.quantity}kg`
    });

    closeModal("modalThr");
    renderLiveStockCards();
    renderTransactionsLedger();

    if (window.renderDashboardUI) renderDashboardUI();
    showToast("रेडी टू कुक टेक होम राशन (THR) वितरण दर्ज हो गया!", "success");
  });

  // 4. Custom Holiday Addition Form
  document.getElementById("formAddHoliday")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("holidayDate")?.value;
    const reason = document.getElementById("holidayReason")?.value?.trim() || "स्थानीय अवकाश";
    if (!date) return;

    const [year, month] = date.split("-");
    const monthKey = `${year}-${month}`;

    window.db.setDayOverride(monthKey, date, {
      isHoliday: true,
      holidayName: reason,
      childrenCount: 0
    });

    closeModal("modalAddHoliday");
    document.getElementById("formAddHoliday").reset();

    if (window.renderMonthlyBhandarPanjiUI) {
      window.renderMonthlyBhandarPanjiUI();
    }
    showToast(`छुट्टी जोड़ी गई: ${date} (${reason})`, "success");
  });
}

/**
 * Setup Export & Backup Buttons
 */
function setupExportButtons() {
  document.getElementById("btnExportLedgerCsv")?.addEventListener("click", exportLedgerCsv);

  document.getElementById("btnDownloadBackup")?.addEventListener("click", downloadJsonBackup);

  // Bhandar Panji Actions
  document.getElementById("btnAutoFillCommit")?.addEventListener("click", () => {
    if (window.autoFillFullMonthRegister) window.autoFillFullMonthRegister();
  });
  document.getElementById("btnPrintPanji")?.addEventListener("click", () => {
    if (window.printMonthlyPanji) window.printMonthlyPanji();
  });
  document.getElementById("btnExportPanjiCsv")?.addEventListener("click", () => {
    if (window.exportMonthlyPanjiCsv) window.exportMonthlyPanjiCsv();
  });

  const backupInput = document.getElementById("backupFileInput");
  if (backupInput) {
    backupInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        restoreJsonBackup(e.target.files[0]);
      }
    });
  }

  // One-Click Quick Backup & Restore in Bhandar Panji View
  document.getElementById("btnQuickBackup")?.addEventListener("click", downloadJsonBackup);
  document.getElementById("btnQuickRestore")?.addEventListener("click", () => {
    document.getElementById("quickBackupFileInput")?.click();
  });
  const quickBackupInput = document.getElementById("quickBackupFileInput");
  if (quickBackupInput) {
    quickBackupInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        restoreJsonBackup(e.target.files[0]);
      }
    });
  }

  document.getElementById("btnResetSampleData")?.addEventListener("click", () => {
    if (confirm("क्या आप बिहार सैंपल डेटा को पुनः लोड करना चाहते हैं? (यह वर्तमान डेटा को रीसेट कर देगा)")) {
      window.db.resetToDefaults();
      window.location.reload();
    }
  });
}

/**
 * Setup Bilingual Toggle
 */
function setupLanguageToggle() {
  const btn = document.getElementById("langToggleBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const nextLang = currentLang === "hi" ? "en" : "hi";
    setLanguage(nextLang);
    populateInwardCommoditiesSelect();
  });
}

/**
 * Setup Centre Profile Settings Form
 */
function setupSettingsHandlers() {
  const form = document.getElementById("centreSettingsForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const updated = {
      district: document.getElementById("cfgDistrict").value,
      project: document.getElementById("cfgProject").value,
      sector: document.getElementById("cfgSector").value,
      panchayat: document.getElementById("cfgPanchayat").value,
      awcName: document.getElementById("cfgAwcName").value,
      awcCode: document.getElementById("cfgAwcCode").value,
      sevikaName: document.getElementById("cfgSevika").value,
      sahayikaName: document.getElementById("cfgSahayika").value
    };

    window.db.setProfile(updated);
    refreshCentreProfileDisplay();

    showToast("केंद्र विवरण सफलतापूर्वक अपडेट हो गया!", "success");
  });
}

function populateSettingsForm() {
  const p = window.db.getProfile();
  if (!p) return;
  document.getElementById("cfgDistrict").value = p.district || "";
  document.getElementById("cfgProject").value = p.project || "";
  document.getElementById("cfgSector").value = p.sector || "";
  document.getElementById("cfgPanchayat").value = p.panchayat || "";
  document.getElementById("cfgAwcName").value = p.awcName || "";
  document.getElementById("cfgAwcCode").value = p.awcCode || "";
  document.getElementById("cfgSevika").value = p.sevikaName || "";
  document.getElementById("cfgSahayika").value = p.sahayikaName || "";
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "❌";

  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

window.showToast = showToast;
