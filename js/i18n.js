/* ==========================================================================
   Bihar State ICDS - Anganwadi Sevika Management System
   Bilingual Translation Dictionary: js/i18n.js
   ========================================================================== */

const I18N = {
  hi: {
    govBadge: "बिहार सरकार | समाज कल्याण विभाग",
    appTitle: "समेकित बाल विकास सेवाएं (ICDS) - पोषाहार व MPR प्रणाली",
    appSub: "आंगनवाड़ी केंद्र भंडार पंजी (पंजी-8) एवं मासिक प्रगति प्रतिवेदन",
    
    // Navigation
    tabInventory: "राशन व पोषाहार भंडार (पंजी 8)",
    tabMpr: "मासिक प्रगति प्रतिवेदन (MPR)",
    tabMenu: "बिहार साप्ताहिक मेनू व मानक",
    tabSettings: "केंद्र विवरण व सेटिंग्स",

    // Inventory View
    inventoryTitle: "राशन एवं पोषाहार भंडार पंजी (पंजी-8)",
    inventoryDesc: "दैनिक भोजन (HCM), नाश्ता एवं टेक होम राशन (THR) के स्टॉक की आवक व खपत का वास्तविक लेखा-जोखा",
    btnStockInward: "स्टॉक आवक दर्ज करें",
    btnDailyConsumption: "दैनिक भोजन खपत (HCM)",
    btnThrDistribution: "टेक होम राशन (THR)",
    kpiRiceStock: "SFC खाद्यान्न",
    kpiRiceSub: "चावल का उपलब्ध स्टॉक",
    kpiDalStock: "दाल व प्रोटीन",
    kpiDalSub: "मसूर/अरहर दाल शेष",
    kpiEggStock: "बुध/शुक्रवार अंडा",
    kpiEggSub: "उपलब्ध अंडों की संख्या",
    kpiLowStock: "निम्न स्टॉक चेतावनी",
    kpiAlertsSub: "सामग्रियां न्यूनतम स्तर से कम",
    liveStockTitle: "लाइव स्टॉक स्थिति (बिहार ICDS अनुमत सामग्री)",
    liveStockSub: "मासिक उपभोग एवं पुनः मांग सीमा के साथ",
    ledgerTitle: "पंजी-8: भंडार आवक-खपत लेजर विवरण",
    ledgerSub: "तारीखवार सभी प्राप्तियां एवं वितरण अभिलेख",
    filterAll: "सभी लेन-देन (All Transactions)",
    filterInward: "केवल आवक (Inward / SFC / क्रय)",
    filterHcm: "दैनिक भोजन खपत (HCM)",
    filterThr: "टेक होम राशन (THR)",
    thDate: "तारीख",
    thType: "प्रकार",
    thItem: "सामग्री",
    thQuantity: "मात्रा (Qty)",
    thSource: "स्रोत / संदर्भ विवरण",
    thBeneficiaries: "लाभार्थी संख्या",
    thAction: "कार्रवाई",

    // MPR View
    mprTitle: "मासिक प्रगति प्रतिवेदन (MPR) - पोषाहार प्रपत्र",
    mprDesc: "बिहार समाज कल्याण विभाग द्वारा स्वीकृत आधिकारिक 5-कॉलम मासिक स्टॉक समाधान एवं उपभोग विवरणी",
    btnPrintMpr: "A4 प्रपत्र प्रिंट करें / PDF",
    mprGovTitle: "बिहार सरकार | समाज कल्याण विभाग",
    mprDocTitle: "समेकित बाल विकास सेवाएं (ICDS) - मासिक प्रगति प्रतिवेदन (MPR)",
    mprSubTitle: "पूरक पोषाहार स्टॉक एवं उपभोग मासिक विवरणी (पंजी 8 एवं 9 पर आधारित)",
    lblDistrict: "जिला:",
    lblProject: "प्रखंड/परियोजना:",
    lblSector: "सेक्टर:",
    lblPanchayat: "पंचायत/वार्ड:",
    lblAwcCode: "आंगनवाड़ी केंद्र कोड:",
    lblAwcName: "केंद्र का नाम:",
    lblSevika: "सेविका का नाम:",
    lblSahayika: "सहायिका का नाम:",
    lblPeriod: "प्रतिवेदन माह/वर्ष:",
    lblFeedingDays: "केंद्र संचालन (पोषाहार) दिवस:",

    // Menu View
    menuTitle: "बिहार ICDS साप्ताहिक पोषाहार मेनू एवं सरकारी मानक",
    menuDesc: "समाज कल्याण विभाग बिहार द्वारा निर्धारित गर्म पका भोजन (HCM), नाश्ता एवं टेक होम राशन (THR) के आधिकारिक मानक",

    // Settings View
    settingsTitle: "आंगनवाड़ी केंद्र विवरण एवं सेटिंग्स",
    settingsDesc: "केंद्र की प्रशासनिक जानकारी अद्यतन करें तथा डाटा बैकअप/रीस्टोर प्रबंधित करें",

    // Common
    safe: "सुरक्षित (Safe)",
    warning: "पुनः मंगाएं (Warning)",
    critical: "अति-न्यूनतम (Critical)",
    delete: "हटाएं",
    confirmDelete: "क्या आप इस प्रविष्टि को हटाना चाहते हैं?",
    savedSuccess: "सफलतापूर्वक सुरक्षित किया गया!",
    deletedSuccess: "प्रविष्टि हटा दी गई!"
  },

  en: {
    govBadge: "Government of Bihar | Social Welfare Department",
    appTitle: "Integrated Child Development Services (ICDS) - Nutrition & MPR System",
    appSub: "Anganwadi Centre Stock Register (Register-8) & Monthly Progress Report",
    
    // Navigation
    tabInventory: "Ration & Nutrition Stock (Reg 8)",
    tabMpr: "Monthly Progress Report (MPR)",
    tabMenu: "Bihar Weekly Menu & Norms",
    tabSettings: "Centre Profile & Settings",

    // Inventory View
    inventoryTitle: "Ration & Supplementary Nutrition Inventory (Register-8)",
    inventoryDesc: "Live accounting of stock receipts and consumption for Daily Meals (HCM), Snacks, and Take-Home Ration (THR)",
    btnStockInward: "Log Stock Inward",
    btnDailyConsumption: "Daily Meal Usage (HCM)",
    btnThrDistribution: "Take-Home Ration (THR)",
    kpiRiceStock: "SFC Foodgrain",
    kpiRiceSub: "Available Rice Stock",
    kpiDalStock: "Pulses & Protein",
    kpiDalSub: "Available Lentils Stock",
    kpiEggStock: "Wed/Fri Eggs",
    kpiEggSub: "Available Eggs Count",
    kpiLowStock: "Low Stock Alert",
    kpiAlertsSub: "Commodities below threshold",
    liveStockTitle: "Live Stock Status (Bihar ICDS Commodities)",
    liveStockSub: "With monthly consumption and reorder thresholds",
    ledgerTitle: "Register-8: Stock Inward & Consumption Ledger",
    ledgerSub: "Chronological receipts and distribution records",
    filterAll: "All Transactions",
    filterInward: "Stock Inward Only",
    filterHcm: "Daily Hot Cooked Meals (HCM)",
    filterThr: "Take-Home Ration (THR)",
    thDate: "Date",
    thType: "Type",
    thItem: "Commodity",
    thQuantity: "Quantity",
    thSource: "Source / Reference Details",
    thBeneficiaries: "Beneficiaries Count",
    thAction: "Action",

    // MPR View
    mprTitle: "Monthly Progress Report (MPR) - Nutrition Sheet",
    mprDesc: "Official 5-Column Monthly Stock Reconciliation & Consumption Report approved by Social Welfare Dept, Bihar",
    btnPrintMpr: "Print A4 Sheet / PDF",
    mprGovTitle: "Government of Bihar | Social Welfare Department",
    mprDocTitle: "Integrated Child Development Services (ICDS) - Monthly Progress Report (MPR)",
    mprSubTitle: "Supplementary Nutrition Stock & Consumption Statement (Based on Register 8 & 9)",
    lblDistrict: "District:",
    lblProject: "Block / CDPO Project:",
    lblSector: "Sector:",
    lblPanchayat: "Panchayat / Ward:",
    lblAwcCode: "Anganwadi Centre Code:",
    lblAwcName: "Centre Name:",
    lblSevika: "Sevika Name:",
    lblSahayika: "Sahayika Name:",
    lblPeriod: "Report Month / Year:",
    lblFeedingDays: "Feeding Days Completed:",

    // Menu View
    menuTitle: "Bihar ICDS Weekly Nutrition Menu & Government Norms",
    menuDesc: "Official entitlement and meal norms prescribed by Social Welfare Department, Bihar",

    // Settings View
    settingsTitle: "Anganwadi Centre Details & Settings",
    settingsDesc: "Update administrative details of your centre and manage data backups",

    // Common
    safe: "Safe Stock",
    warning: "Reorder Warning",
    critical: "Critical Low Stock",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this transaction?",
    savedSuccess: "Saved successfully!",
    deletedSuccess: "Transaction deleted!"
  }
};

// Fix #17: Restore saved language on load, default to 'hi'
let currentLang = localStorage.getItem('aww_lang') || 'hi';

function getTranslation(key) {
  return I18N[currentLang][key] || key;
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('aww_lang', lang); // Fix #17: persist across page reloads
  document.documentElement.lang = lang;

  // Update button label
  const langLabel = document.getElementById('langLabel');
  if (langLabel) {
    langLabel.textContent = lang === 'hi' ? 'English' : 'हिंदी';
  }

  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (I18N[lang] && I18N[lang][key]) {
      elem.textContent = I18N[lang][key];
    }
  });

  // Re-render components if available
  if (window.renderLiveStockCards) window.renderLiveStockCards();
  if (window.renderTransactionsLedger) window.renderTransactionsLedger();
  if (window.renderMprDocument) window.renderMprDocument();
}

// Apply persisted language on page load
document.addEventListener('DOMContentLoaded', function() {
  const saved = localStorage.getItem('aww_lang') || 'hi';
  if (saved && saved !== 'hi') {
    setLanguage(saved);
  }
});
