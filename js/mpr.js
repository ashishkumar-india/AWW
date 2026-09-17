/* ==========================================================================
   Bihar State ICDS - Anganwadi Sevika Management System
   Monthly Progress Report (MPR) Generator: js/mpr.js
   ========================================================================== */

/**
 * Calculates monthly stock reconciliation numbers for the selected month/year
 */
function calculateMonthlyMprData(year = "2026", month = "9") {
  const monthPadded = month.toString().padStart(2, "0");
  const monthKey = `${year}-${monthPadded}`;

  const opening = window.db.getOpeningStock(monthKey);
  const transactions = window.db.getTransactions();

  // Filter transactions belonging to this month
  const monthTransactions = transactions.filter(t => {
    return t.date && t.date.startsWith(monthKey);
  });

  // Calculate distinct feeding days (HCM dates in this month)
  const feedingDates = new Set();
  let totalEggsServedInHcm = 0;

  monthTransactions.forEach(t => {
    if (t.type === "hcm") {
      feedingDates.add(t.date);
      if (t.item === "eggs") {
        totalEggsServedInHcm += Number(t.quantity);
      }
    }
  });

  // Reconcile commodity balances
  const reconciliation = [];

  BIHAR_COMMODITIES.forEach((c, idx) => {
    const openingQty = Number(opening[c.id] || 0);
    let inwardQty = 0;
    let consumedQty = 0;

    monthTransactions.forEach(t => {
      if (t.item === c.id) {
        if (t.type === "inward") {
          inwardQty += Number(t.quantity);
        } else if (t.type === "hcm" || t.type === "thr") {
          consumedQty += Number(t.quantity);
        }
      }
    });

    const totalAvailable = openingQty + inwardQty;
    const closingQty = Math.max(0, totalAvailable - consumedQty);

    reconciliation.push({
      srNo: idx + 1,
      commodityId: c.id,
      commodityName_hi: c.name_hi,
      commodityName_en: c.name_en,
      unit_hi: c.unit_hi,
      unit_en: c.unit_en,
      opening: Number(openingQty.toFixed(3)),
      inward: Number(inwardQty.toFixed(3)),
      totalAvailable: Number(totalAvailable.toFixed(3)),
      consumed: Number(consumedQty.toFixed(3)),
      closing: Number(closingQty.toFixed(3)),
      status: closingQty <= c.reorderThreshold ? "कम (Low)" : "सामान्य (OK)"
    });
  });

  return {
    monthKey,
    feedingDaysCount: feedingDates.size,
    totalEggsServedInHcm,
    reconciliation
  };
}

/**
 * Renders the printable official Bihar ICDS MPR document
 */
function renderMprDocument() {
  const monthSelect = document.getElementById("mprMonthSelect");
  const yearSelect = document.getElementById("mprYearSelect");

  const month = monthSelect ? monthSelect.value : "9";
  const year = yearSelect ? yearSelect.value : "2026";

  const mprData = calculateMonthlyMprData(year, month);
  const profile = window.db.getProfile();
  const beneficiaries = window.db.getBeneficiaries();
  const lang = (typeof currentLang !== "undefined" ? currentLang : "hi");

  // Month names in Hindi & English
  const monthNamesHi = ["", "जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितम्बर", "अक्टूबर", "नवम्बर", "दिसम्बर"];
  const monthNamesEn = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const displayPeriod = lang === "hi" 
    ? `${monthNamesHi[Number(month)]} ${year}` 
    : `${monthNamesEn[Number(month)]} ${year}`;

  // Update Header Metadata
  setText("mprDistrict", profile.district);
  setText("mprProject", profile.project);
  setText("mprSector", profile.sector);
  setText("mprPanchayat", profile.panchayat);
  setText("mprCode", profile.awcCode);
  setText("mprName", profile.awcName);
  setText("mprSevika", profile.sevikaName);
  setText("mprSahayika", profile.sahayikaName);
  setText("mprPeriodDisplay", displayPeriod);

  // Feeding Days badge (Target: 25 days)
  const feedingDaysElem = document.getElementById("mprFeedingDaysVal");
  if (feedingDaysElem) {
    const isTargetMet = mprData.feedingDaysCount >= 25;
    feedingDaysElem.textContent = `${mprData.feedingDaysCount} दिन ${isTargetMet ? "(लक्ष्य पूर्ण)" : "/ 25 दिन"}`;
    feedingDaysElem.className = isTargetMet ? "feeding-days-badge" : "feeding-days-badge alert-pill";
  }

  // Update Beneficiaries
  // Fix #18: avg. absent children per day (configurable constant, not a magic number)
  const AVG_ABSENT_PRESCHOOL = 2;
  setText("bCountNormalReg", beneficiaries.normalKids);
  setText("bCountNormalFed", beneficiaries.normalKids);
  setText("bCountSamReg", beneficiaries.samKids);
  setText("bCountSamFed", beneficiaries.samKids);
  setText("bCountPreschoolReg", beneficiaries.preschoolKids);
  setText("bCountPreschoolFed", Math.max(0, beneficiaries.preschoolKids - AVG_ABSENT_PRESCHOOL));
  setText("bCountPwReg", beneficiaries.pregnantWomen);
  setText("bCountPwFed", beneficiaries.pregnantWomen);
  setText("bCountLmReg", beneficiaries.lactatingMothers);
  setText("bCountLmFed", beneficiaries.lactatingMothers);

  // Update Notes
  setText("mprEggHcmCount", mprData.totalEggsServedInHcm);

  // Update Signatures
  setText("sigSevikaName", profile.sevikaName);
  setText("sigAwcName", profile.awcName);
  setText("sigSectorName", `${profile.sector}, ${profile.project}`);
  setText("sigProjectName", `${profile.project}, ${profile.district}`);

  // Render 5-Column Stock Table
  const tbody = document.getElementById("mprStockTableBody");
  if (!tbody) return;

  let html = "";
  mprData.reconciliation.forEach(row => {
    const name = lang === "hi" ? row.commodityName_hi : row.commodityName_en;
    const unit = lang === "hi" ? row.unit_hi : row.unit_en;
    const isMilk = row.commodityId === "milk";

    const openingText = isMilk ? `${Number((row.opening / 0.2).toFixed(3))} pkt <div style="font-size:10.5px; color:#475569; font-weight:700;">(${row.opening.toFixed(3)} kg)</div>` : row.opening;
    const inwardText = row.inward > 0 ? (isMilk ? `+${Number((row.inward / 0.2).toFixed(3))} pkt <div style="font-size:10.5px; color:#166534; font-weight:700;">(+${row.inward.toFixed(3)} kg)</div>` : `+${row.inward}`) : "0.00";
    const availText = isMilk ? `${Number((row.totalAvailable / 0.2).toFixed(3))} pkt <div style="font-size:10.5px; color:#92400E; font-weight:700;">(${row.totalAvailable.toFixed(3)} kg)</div>` : row.totalAvailable;
    const consText = row.consumed > 0 ? (isMilk ? `-${Number((row.consumed / 0.2).toFixed(3))} pkt <div style="font-size:10.5px; color:#B91C1C; font-weight:700;">(-${row.consumed.toFixed(3)} kg)</div>` : `-${row.consumed}`) : "0.00";
    const closingText = isMilk ? `${Number((row.closing / 0.2).toFixed(3))} pkt <div style="font-size:10.5px; color:#15803D; font-weight:800;">(${row.closing.toFixed(3)} kg)</div>` : row.closing;

    html += `
      <tr>
        <td style="text-align:center;">${row.srNo}</td>
        <td><strong>${name}</strong></td>
        <td style="text-align:center;">${unit}</td>
        <td>${openingText}</td>
        <td>${inwardText}</td>
        <td class="font-bold">${availText}</td>
        <td style="color:#C62828;">${consText}</td>
        <td class="font-bold" style="color:#1B5E20;">${closingText}</td>
        <td class="no-print" style="text-align:center;">
          <span class="stock-status-pill ${row.status.includes('OK') ? 'status-safe' : 'status-warning'}">
            ${row.status}
          </span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function setText(elementId, text) {
  const elem = document.getElementById(elementId);
  if (elem) elem.textContent = text;
}

window.renderMprDocument = renderMprDocument;
window.calculateMonthlyMprData = calculateMonthlyMprData;
