/* ==========================================================================
   Bihar State ICDS - Anganwadi Sevika Management System
   Export Engine (A4 Print, CSV/Excel, JSON Backup/Restore): js/export.js
   ========================================================================== */

/**
 * Initiates the print flow for the official A4 Bihar ICDS MPR form
 */
function printMprDocument() {
  // Ensure we are on the MPR tab
  const tabMpr = document.getElementById("tabMpr");
  if (tabMpr) tabMpr.click();

  // Small timeout to allow DOM layout to settle
  setTimeout(() => {
    window.print();
  }, 150);
}

/**
 * Exports Register-8 Transactions Ledger to CSV
 */
function exportLedgerCsv() {
  const transactions = window.db.getTransactions();
  if (!transactions || transactions.length === 0) {
    alert("डाउनलोड करने के लिए कोई लेन-देन उपलब्ध नहीं है (No transactions to export)");
    return;
  }

  const lang = (typeof currentLang !== "undefined" ? currentLang : "hi");
  const headers = [
    "Transaction ID",
    "तारीख (Date)",
    "प्रकार (Type)",
    "सामग्री (Commodity)",
    "मात्रा (Quantity)",
    "स्रोत / चालान (Source/Challan)",
    "लाभार्थी संख्या (Beneficiaries)",
    "विवरण (Notes)"
  ];

  const rows = transactions.map(t => {
    const commodity = BIHAR_COMMODITIES.find(c => c.id === t.item);
    const itemName = commodity ? (lang === "hi" ? commodity.name_hi : commodity.name_en) : t.item;
    const unit = commodity ? commodity.unit_en : "";

    return [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type}"`,
      `"${itemName}"`,
      `"${t.quantity} ${unit}"`,
      `"${(t.source || t.challan || '').replace(/"/g, '""')}"`,
      `"${t.beneficiaries || ''}"`,
      `"${(t.notes || t.details || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
  downloadBlob(csvContent, "text/csv;charset=utf-8;", `AWW_Bihar_Register8_Ledger_${getTimestamp()}.csv`);
}

/**
 * Exports Monthly Progress Report (MPR) to CSV
 */
function exportMprCsv() {
  const monthSelect = document.getElementById("mprMonthSelect");
  const yearSelect = document.getElementById("mprYearSelect");
  const month = monthSelect ? monthSelect.value : "9";
  const year = yearSelect ? yearSelect.value : "2026";

  const mprData = calculateMonthlyMprData(year, month);
  const profile = window.db.getProfile();

  const lines = [
    `"बिहार सरकार | समाज कल्याण विभाग - समेकित बाल विकास सेवाएं (ICDS)"`,
    `"मासिक प्रगति प्रतिवेदन (MPR) - पोषाहार स्टॉक एवं उपभोग विवरणी"`,
    `"प्रतिवेदन माह/वर्ष:","${month}/${year}","केंद्र संचालन दिवस:","${mprData.feedingDaysCount} दिन"`,
    `"जिला:","${profile.district}","प्रखंड:","${profile.project}"`,
    `"केंद्र का नाम:","${profile.awcName}","केंद्र कोड:","${profile.awcCode}"`,
    `"सेविका:","${profile.sevikaName}","सहायिका:","${profile.sahayikaName}"`,
    ``,
    `"क्र.सं.","सामग्री का नाम (Commodity)","इकाई","प्रारंभिक अवशेष [क]","माह में प्राप्ति [ख]","कुल उपलब्ध [ग=क+ख]","माह में कुल खपत [घ]","अंतिम अवशेष [ङ=ग-घ]"`
  ];

  mprData.reconciliation.forEach(r => {
    lines.push(
      `"${r.srNo}","${r.commodityName_hi}","${r.unit_hi}","${r.opening}","${r.inward}","${r.totalAvailable}","${r.consumed}","${r.closing}"`
    );
  });

  lines.push(``);
  lines.push(`"सत्यापित हस्ताक्षर: सेविका - ${profile.sevikaName}","महिला पर्यवेक्षिका","बाल विकास परियोजना पदाधिकारी (CDPO)"`);

  const csvContent = "\uFEFF" + lines.join("\r\n");
  downloadBlob(csvContent, "text/csv;charset=utf-8;", `AWW_Bihar_MPR_${year}_${month}.csv`);
}

/**
 * Downloads full JSON database backup
 */
function downloadJsonBackup() {
  const fullData = window.db.data;
  const jsonStr = JSON.stringify(fullData, null, 2);
  downloadBlob(jsonStr, "application/json", `AWW_Bihar_Backup_${getTimestamp()}.json`);
  if (window.showToast) showToast("पूरा बैकअप डाउनलोड हो गया!", "success");
}

/**
 * Restores JSON backup from file
 */
function restoreJsonBackup(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const restored = JSON.parse(e.target.result);
      if (restored && restored.profile && restored.transactions) {
        window.db.save(restored);
        window.location.reload();
      } else {
        alert("अमान्य बैकअप फाइल (Invalid backup file structure)");
      }
    } catch (err) {
      alert("फाइल पढ़ने में त्रुटि: " + err.message);
    }
  };
  reader.readAsText(file);
}

/**
 * Helper to download blob
 */
function downloadBlob(content, mimeType, filename) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getTimestamp() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
}

window.printMprDocument = printMprDocument;
window.exportLedgerCsv = exportLedgerCsv;
window.exportMprCsv = exportMprCsv;
window.downloadJsonBackup = downloadJsonBackup;
window.restoreJsonBackup = restoreJsonBackup;
