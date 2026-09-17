/* ==========================================================================
   Bihar State ICDS - Anganwadi Sevika Management System
   Data Models, Bihar Commodities & LocalStorage Engine: js/data.js
   Updated specifically as per Bihar ICDS दरियापुर (सारण) official menu
   ========================================================================== */

const STORAGE_KEY = "AWW_BIHAR_INVENTORY_MPR_V1";

// Bihar ICDS Approved Commodities Master (As per Dariyapur, Saran official menu)
var BIHAR_COMMODITIES = window.BIHAR_COMMODITIES = [
  {
    id: "rice",
    name_hi: "चावल (अरवा/उसना)",
    name_en: "Rice (SFC Godown Supply)",
    unit_hi: "कि.ग्रा. (kg)",
    unit_en: "kg",
    source: "SFC राज्य खाद्य निगम (PDS Godown)",
    icon: "🌾",
    reorderThreshold: 40,
    criticalThreshold: 15,
    category: "grain"
  },
  {
    id: "dal",
    name_hi: "दाल (मसूर/अरहर/मूंग - कद्दू/साग दाल व खिचड़ी)",
    name_en: "Lentils / Dal (Friday & Saturday)",
    unit_hi: "कि.ग्रा. (kg)",
    unit_en: "kg",
    source: "आंगनवाड़ी विकास समिति (संयुक्त खाता)",
    icon: "🥣",
    reorderThreshold: 20,
    criticalThreshold: 8,
    category: "pulse"
  },
  {
    id: "milk",
    name_hi: "सूखा दूध पाउडर (Sudha Milk - 200g पैकेट)",
    name_en: "Dry Milk Powder (200g Packets)",
    unit_hi: "कि.ग्रा. (kg)",
    unit_en: "kg",
    packetWeightKg: 0.2, // 200g per packet
    source: "सुधा डेरी / ICDS सूखा दूध पाउडर (200g पैकेट)",
    icon: "🥛",
    reorderThreshold: 3.0, // 15 packets = 3.0 kg
    criticalThreshold: 1.0,  // 5 packets = 1.0 kg
    category: "dairy"
  },
  {
    id: "eggs",
    name_hi: "अंडे (बुधवार व शुक्रवार नाश्ता अतिरिक्त)",
    name_en: "Eggs (Wed & Fri Extra Snack)",
    unit_hi: "संख्या (Nos.)",
    unit_en: "Nos.",
    source: "आंगनवाड़ी विकास समिति (स्थानीय क्रय)",
    icon: "🥚",
    reorderThreshold: 60,
    criticalThreshold: 20,
    category: "protein"
  },
  {
    id: "soybean",
    name_hi: "सोयाबीन बड़ी (बुधवार सब्जी व THR)",
    name_en: "Soybean Chunks (Wednesday HCM)",
    unit_hi: "कि.ग्रा. (kg)",
    unit_en: "kg",
    source: "आंगनवाड़ी विकास समिति (स्थानीय क्रय)",
    icon: "🧆",
    reorderThreshold: 12,
    criticalThreshold: 4,
    category: "protein"
  },
  {
    id: "chana",
    name_hi: "चना (सब्जी व भुना/अंकुरित नाश्ता)",
    name_en: "Gram / Chana (Snack & Tuesday Curry)",
    unit_hi: "कि.ग्रा. (kg)",
    unit_en: "kg",
    source: "आंगनवाड़ी विकास समिति (स्थानीय क्रय)",
    icon: "🧆",
    reorderThreshold: 15,
    criticalThreshold: 5,
    category: "pulse"
  },
  {
    id: "peanut",
    name_hi: "मूंगफली (सोमवार नाश्ता / शाकाहारी विकल्प)",
    name_en: "Peanuts (Monday & Veg Alternative)",
    unit_hi: "कि.ग्रा. (kg)",
    unit_en: "kg",
    source: "आंगनवाड़ी विकास समिति (स्थानीय क्रय)",
    icon: "🥜",
    reorderThreshold: 8,
    criticalThreshold: 3,
    category: "snack"
  },
  {
    id: "jaggery",
    name_hi: "गुड़ (बुधवार नाश्ता एवं गुरुवार रसियाव)",
    name_en: "Jaggery / Gur (Rasiyaw & Snack)",
    unit_hi: "कि.ग्रा. (kg)",
    unit_en: "kg",
    source: "आंगनवाड़ी विकास समिति (स्थानीय क्रय)",
    icon: "🍯",
    reorderThreshold: 8,
    criticalThreshold: 3,
    category: "condiment"
  },
  {
    id: "oil",
    name_hi: "खाद्य तेल (सरसों/रिफाइंड)",
    name_en: "Edible Oil (Cooking)",
    unit_hi: "लीटर (Litres)",
    unit_en: "Litres",
    source: "आंगनवाड़ी विकास समिति (स्थानीय क्रय)",
    icon: "🫗",
    reorderThreshold: 8,
    criticalThreshold: 3,
    category: "oil"
  },
  {
    id: "salt_spices",
    name_hi: "आयोडीन नमक व मसाले",
    name_en: "Iodized Salt & Spices",
    unit_hi: "कि.ग्रा. (kg)",
    unit_en: "kg",
    source: "आंगनवाड़ी विकास समिति (स्थानीय क्रय)",
    icon: "🧂",
    reorderThreshold: 5,
    criticalThreshold: 2,
    category: "condiment"
  }
];

// Seed Profile for Dariyapur, Saran (as per user's official chart)
const INITIAL_CENTRE_PROFILE = {
  district: "सारण (Saran)",
  project: "दरियापुर (Dariyapur)",
  sector: "सेक्टर-02",
  panchayat: "दरियापुर पंचायत",
  awcName: "दरियापुर - केंद्र 201",
  awcCode: "201",
  sevikaName: "मालती कुमारी",
  sahayikaName: "सुनीता कुमारी",
  cdpoName: "अंजू सिंह"
};

// Registered Beneficiaries count
const INITIAL_BENEFICIARIES = {
  normalKids: 32,    // 6m-3y normal
  samKids: 4,        // 6m-3y SAM
  preschoolKids: 40, // 3y-6y preschool attendees
  pregnantWomen: 12, // PW
  lactatingMothers: 10 // LM
};

// Opening Stock (September 2026)
const INITIAL_OPENING_STOCK = {
  "2026-09": {
    rice: 70.0,
    dal: 25.0,
    milk: 7.0, // 7.00 kg = 35 packets (200g each)
    eggs: 75,
    soybean: 12.0,
    chana: 15.0,
    peanut: 8.0,
    jaggery: 8.0,
    oil: 9.0,
    salt_spices: 4.5
  }
};

// Seed Transactions for Dariyapur
const INITIAL_TRANSACTIONS = [
  // 02/09/2026: Stock Inward (Rice from SFC)
  {
    id: "TXN-001",
    date: "2026-09-02",
    type: "inward",
    item: "rice",
    quantity: 200.0,
    source: "SFC राज्य खाद्य निगम (PDS Godown)",
    challan: "SFC/SARAN/2026/09/441",
    notes: "दरियापुर प्रखंड SFC गोदाम से चावल प्राप्त"
  },
  // 03/09/2026: Joint Account Inward (Dal, Milk, Eggs, Soybean, Chana, Peanuts, Jaggery, Oil)
  {
    id: "TXN-002",
    date: "2026-09-03",
    type: "inward",
    item: "dal",
    quantity: 80.0,
    source: "आंगनवाड़ी विकास समिति (संयुक्त खाता)",
    challan: "VSS/DAR/09/11",
    notes: "कद्दू/साग दाल व खिचड़ी हेतु मसूर/अरहर दाल"
  },
  {
    id: "TXN-003",
    date: "2026-09-03",
    type: "inward",
    item: "milk",
    quantity: 8.0, // 8.00 kg = 40 packets (200g each)
    source: "सुधा डेरी / ICDS सूखा दूध पाउडर (200g पैकेट)",
    challan: "SUDHA/DAR/09/02",
    notes: "मंगलवार व गुरुवार बच्चों हेतु 40 पैकेट (8.00 kg) सूखा दूध पाउडर"
  },
  {
    id: "TXN-004",
    date: "2026-09-03",
    type: "inward",
    item: "eggs",
    quantity: 450,
    source: "आंगनवाड़ी विकास समिति (स्थानीय क्रय)",
    challan: "EGG/DAR/09/18",
    notes: "बुधवार व शुक्रवार नाश्ता अतिरिक्त अंडा"
  },
  {
    id: "TXN-005",
    date: "2026-09-03",
    type: "inward",
    item: "chana",
    quantity: 25.0,
    source: "आंगनवाड़ी विकास समिति (स्थानीय क्रय)",
    challan: "VSS/DAR/09/12",
    notes: "मंगलवार सब्जी व बुधवार अंकुरित नाश्ता"
  },
  {
    id: "TXN-006",
    date: "2026-09-03",
    type: "inward",
    item: "soybean",
    quantity: 25.0,
    source: "आंगनवाड़ी विकास समिति (स्थानीय क्रय)",
    challan: "VSS/DAR/09/12",
    notes: "बुधवार सब्जी हेतु सोयाबीन बड़ी"
  },
  {
    id: "TXN-007",
    date: "2026-09-03",
    type: "inward",
    item: "peanut",
    quantity: 15.0,
    source: "आंगनवाड़ी विकास समिति (स्थानीय क्रय)",
    challan: "VSS/DAR/09/13",
    notes: "सोमवार नाश्ता एवं शाकाहारी अंडा विकल्प"
  },
  {
    id: "TXN-008",
    date: "2026-09-03",
    type: "inward",
    item: "jaggery",
    quantity: 12.0,
    source: "आंगनवाड़ी विकास समिति (स्थानीय क्रय)",
    challan: "VSS/DAR/09/13",
    notes: "बुधवार नाश्ता गुड़ एवं गुरुवार रसियाव"
  },
  {
    id: "TXN-009",
    date: "2026-09-03",
    type: "inward",
    item: "oil",
    quantity: 18.0,
    source: "आंगनवाड़ी विकास समिति (स्थानीय क्रय)",
    challan: "VSS/DAR/09/14",
    notes: "सरसों तेल क्रय"
  },
  // Take-Home Ration (THR) Distribution on 08/09/2026
  {
    id: "TXN-THR-01",
    date: "2026-09-08",
    type: "thr",
    item: "rice",
    quantity: 161.0,
    source: "बिहार THR मासिक वितरण (चावल)",
    beneficiaries: 58,
    details: "32 सामान्य बच्चे (80kg) + 4 SAM (15kg) + 12 PW (36kg) + 10 LM (30kg)"
  },
  {
    id: "TXN-THR-02",
    date: "2026-09-08",
    type: "thr",
    item: "dal",
    quantity: 80.0,
    source: "बिहार THR मासिक वितरण (दाल)",
    beneficiaries: 58,
    details: "32 सामान्य बच्चे (40kg) + 4 SAM (7kg) + 12 PW (18kg) + 10 LM (15kg)"
  },
  {
    id: "TXN-THR-03",
    date: "2026-09-08",
    type: "thr",
    item: "eggs",
    quantity: 280,
    source: "बिहार THR अंडा वितरण",
    beneficiaries: 38,
    details: "पात्र लाभार्थियों को सूखा अंडा वितरण (8-12 अंडे/लाभार्थी)"
  },
  // Daily HCM sample logs for Dariyapur menu
  {
    id: "TXN-HCM-01",
    date: "2026-09-01",
    type: "hcm",
    item: "rice",
    quantity: 2.85,
    source: "दैनिक HCM (मंगलवार: चना आलू की सब्जी व चावल + दूध)",
    beneficiaries: 38,
    details: "38 बच्चे (75g चावल)"
  },
  {
    id: "TXN-HCM-02",
    date: "2026-09-01",
    type: "hcm",
    item: "milk",
    quantity: 0.35, // 0.35 kg = 1.75 packets
    source: "नाश्ता अतिरिक्त (मंगलवार: सूखा दूध पाउडर 200g पैकेट)",
    beneficiaries: 35,
    details: "35 बच्चे × 10g = 0.35 kg (1.75 पैकेट दूध पाउडर)"
  },
  {
    id: "TXN-HCM-03",
    date: "2026-09-02",
    type: "hcm",
    item: "rice",
    quantity: 2.85,
    source: "दैनिक HCM (बुधवार: सोयाबीन की सब्जी व चावल + अंडा)",
    beneficiaries: 38,
    details: "38 बच्चे (75g चावल)"
  },
  {
    id: "TXN-HCM-04",
    date: "2026-09-02",
    type: "hcm",
    item: "eggs",
    quantity: 34,
    source: "नाश्ता अतिरिक्त (बुधवार: उबला अंडा)",
    beneficiaries: 34,
    details: "34 बच्चों को उबला अंडा दिया गया"
  },
  {
    id: "TXN-HCM-05",
    date: "2026-09-03",
    type: "hcm",
    item: "rice",
    quantity: 2.28,
    source: "दैनिक HCM (गुरुवार: रसियाव + दूध)",
    beneficiaries: 38,
    details: "38 बच्चे रसियाव (60g चावल/गुड़)"
  },
  {
    id: "TXN-HCM-06",
    date: "2026-09-03",
    type: "hcm",
    item: "milk",
    quantity: 0.35, // Fix #4: was 1.75 (packets), must be kg. 35 children × 10g = 0.35 kg
    source: "नाश्ता अतिरिक्त (गुरुवार: सूखा दूध पाउडर 200g पैकेट)",
    beneficiaries: 35,
    details: "35 बच्चे × 10g = 0.35 kg (1.75 पैकेट दूध पाउडर)"
  },
  {
    id: "TXN-HCM-07",
    date: "2026-09-04",
    type: "hcm",
    item: "rice",
    quantity: 2.85,
    source: "दैनिक HCM (शुक्रवार: कद्दू दाल / साग दाल व चावल + अंडा)",
    beneficiaries: 38,
    details: "38 बच्चे (75g चावल)"
  },
  {
    id: "TXN-HCM-08",
    date: "2026-09-04",
    type: "hcm",
    item: "dal",
    quantity: 0.76,
    source: "दैनिक HCM (शुक्रवार: कद्दू दाल)",
    beneficiaries: 38,
    details: "38 बच्चे (20g दाल)"
  },
  {
    id: "TXN-HCM-09",
    date: "2026-09-04",
    type: "hcm",
    item: "eggs",
    quantity: 34,
    source: "नाश्ता अतिरिक्त (शुक्रवार: उबला अंडा)",
    beneficiaries: 34,
    details: "34 बच्चों को उबला अंडा दिया गया"
  },
  {
    id: "TXN-HCM-10",
    date: "2026-09-05",
    type: "hcm",
    item: "rice",
    quantity: 2.85,
    source: "दैनिक HCM (शनिवार: चावल दाल की खिचड़ी)",
    beneficiaries: 38,
    details: "38 बच्चे खिचड़ी"
  },
  {
    id: "TXN-HCM-11",
    date: "2026-09-05",
    type: "hcm",
    item: "dal",
    quantity: 0.76,
    source: "दैनिक HCM (शनिवार: खिचड़ी दाल)",
    beneficiaries: 38,
    details: "38 बच्चे खिचड़ी दाल"
  },
  {
    id: "TXN-HCM-12",
    date: "2026-09-07",
    type: "hcm",
    item: "rice",
    quantity: 2.85,
    source: "दैनिक HCM (सोमवार: चावल का पुलाव)",
    beneficiaries: 38,
    details: "38 बच्चे पुलाव"
  }
];

// Data Store Class
class DataStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.profile) {
          if (parsed.profile.sevikaName === "मंजू देवी" || !parsed.profile.sevikaName) {
            parsed.profile.sevikaName = "मालती कुमारी";
          }
          if (parsed.profile.awcCode === "1024805" || !parsed.profile.awcCode) {
            parsed.profile.awcCode = "201";
          }
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse LocalStorage data:", e);
    }
    const initial = {
      profile: { ...INITIAL_CENTRE_PROFILE },
      beneficiaries: { ...INITIAL_BENEFICIARIES },
      openingStock: { ...INITIAL_OPENING_STOCK },
      transactions: [...INITIAL_TRANSACTIONS]
    };
    this.save(initial);
    return initial;
  }

  save(dataToSave = null) {
    if (dataToSave) {
      this.data = dataToSave;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error("Failed to save to LocalStorage:", e);
    }
  }

  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.load();
    return this.data;
  }

  getProfile() {
    return this.data.profile;
  }

  setProfile(profile) {
    this.data.profile = { ...this.data.profile, ...profile };
    this.save();
  }

  getBeneficiaries() {
    return this.data.beneficiaries;
  }

  setBeneficiaries(beneficiaries) {
    this.data.beneficiaries = { ...this.data.beneficiaries, ...beneficiaries };
    this.save();
  }

  getTransactions() {
    return this.data.transactions || [];
  }

  addTransaction(txn) {
    if (!txn.id) {
      txn.id = "TXN-" + Date.now().toString(36).toUpperCase();
    }
    this.data.transactions.unshift(txn);
    this.save();
    return txn;
  }

  deleteTransaction(id) {
    this.data.transactions = this.data.transactions.filter(t => t.id !== id);
    this.save();
  }

  getOpeningStock(monthKey) {
    if (this.data.openingStock && this.data.openingStock[monthKey]) {
      return this.data.openingStock[monthKey];
    }
    const fallback = {};
    BIHAR_COMMODITIES.forEach(c => {
      fallback[c.id] = 10.0;
    });
    return fallback;
  }

  setOpeningStock(monthKey, stockObj) {
    if (!this.data.openingStock) this.data.openingStock = {};
    this.data.openingStock[monthKey] = stockObj;
    this.save();
  }

  getDayOverrides(monthKey) {
    if (!this.data.dayOverrides) this.data.dayOverrides = {};
    return this.data.dayOverrides[monthKey] || {};
  }

  setDayOverride(monthKey, date, overrideObj) {
    if (!this.data.dayOverrides) this.data.dayOverrides = {};
    if (!this.data.dayOverrides[monthKey]) this.data.dayOverrides[monthKey] = {};
    this.data.dayOverrides[monthKey][date] = {
      ...(this.data.dayOverrides[monthKey][date] || {}),
      ...overrideObj
    };
    this.save();
    return this.data.dayOverrides[monthKey][date];
  }

  removeDayOverride(monthKey, date) {
    if (this.data.dayOverrides && this.data.dayOverrides[monthKey] && this.data.dayOverrides[monthKey][date]) {
      delete this.data.dayOverrides[monthKey][date];
      this.save();
    }
  }

  clearDayOverrides(monthKey) {
    if (this.data.dayOverrides && this.data.dayOverrides[monthKey]) {
      delete this.data.dayOverrides[monthKey];
      this.save();
    }
  }
}

// Global instance
window.BIHAR_COMMODITIES = BIHAR_COMMODITIES;
window.DataStore = DataStore;
window.db = new DataStore();
