/* ==========================================================================
   Bihar State ICDS - Anganwadi Sevika Management System
   Data Models, Bihar Commodities & LocalStorage Engine: js/data.js
   Updated specifically as per Bihar ICDS दरियापुर (सारण) official menu
   ========================================================================== */

const STORAGE_KEY = "AWW_BIHAR_INVENTORY_MPR_V2";
window.STORAGE_KEY = STORAGE_KEY;
try { localStorage.removeItem("AWW_BIHAR_INVENTORY_MPR_V1"); } catch (e) {}

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

// Registered Beneficiaries count (Clean defaults)
const INITIAL_BENEFICIARIES = {
  normalKids: 0,    // 6m-3y normal
  samKids: 0,       // 6m-3y SAM
  preschoolKids: 0, // 3y-6y preschool attendees
  pregnantWomen: 0, // PW
  lactatingMothers: 0 // LM
};

// Opening Stock - Clean (no dummy data)
const INITIAL_OPENING_STOCK = {};

// Transactions Ledger - Clean (no dummy transactions)
const INITIAL_TRANSACTIONS = [];

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
// Default dbReady (overridden by db-supabase.js if Supabase is configured)
if (!window.dbReady) window.dbReady = Promise.resolve(window.db);
