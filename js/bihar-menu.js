/* ==========================================================================
   Bihar State ICDS - Anganwadi Sevika Management System
   Official Bihar ICDS Weekly HCM Menu & Ready-to-Cook THR Quotas
   Accurately transcribed from official government notification
   ========================================================================== */

// 1. गर्म पका भोजन हेतु साप्ताहिक मेनू (Weekly HCM Menu for 3-6 Years)
const BIHAR_OFFICIAL_HCM_STANDARDS = {
  1: {
    day_id: 1,
    day_name_hi: "सोमवार",
    day_name_en: "Monday",
    snack_hi: "भुना चना और मूंगफली",
    meal_hi: "चावल का पुलाव",
    total_grams: 155,
    energy_kcal: 504.17,
    protein_gm: 18.83,
    items: [
      { itemId: "rice", name: "चावल", grams: 70, kcal: 246.17, protein: 5.83 },
      { itemId: "chana", name: "चना (सब्जी)", grams: 20, kcal: 57.0, protein: 4.0 },
      { itemId: "veg", name: "मौसम के अनुसार हरी सब्जियां", grams: 25, kcal: 18.0, protein: 2.0 },
      { itemId: "oil", name: "खाद्य तेल", grams: 5, kcal: 45.0, protein: 0.0 },
      { itemId: "chana_snack", name: "भुना चना (नाश्ता)", grams: 20, kcal: 60.0, protein: 4.0 },
      { itemId: "peanut", name: "मूंगफली (नाश्ता)", grams: 15, kcal: 78.0, protein: 3.0 }
    ]
  },
  2: {
    day_id: 2,
    day_name_hi: "मंगलवार",
    day_name_en: "Tuesday",
    snack_hi: "केला, पपीता या मौसमी फल + दूध",
    meal_hi: "आलू चना सब्जी व चावल",
    total_grams: 156,
    energy_kcal: 504.37,
    protein_gm: 14.07,
    items: [
      { itemId: "potato", name: "आलू", grams: 60, kcal: 58.2, protein: 0.96 },
      { itemId: "chana", name: "चना", grams: 25, kcal: 90.0, protein: 4.275 },
      { itemId: "rice", name: "चावल", grams: 70, kcal: 246.17, protein: 5.83 },
      { itemId: "milk", name: "दूध (100ml पानी में घोलकर)", grams: 1, ml: 100, kcal: 110.0, protein: 3.0 },
      { itemId: "fruit", name: "केला, पपीता या मौसमी फल", grams: 1, kcal: 0, protein: 0 }
    ]
  },
  3: {
    day_id: 3,
    day_name_hi: "बुधवार",
    day_name_en: "Wednesday",
    snack_hi: "अंकुरित चना - गुड़",
    meal_hi: "सोयाबीन सब्जी व चावल (अंडा / मूंगफली)",
    total_grams: 155,
    energy_kcal: 510.80,
    protein_gm: 18.68,
    items: [
      { itemId: "soybean", name: "सोयाबीन", grams: 20, kcal: 75.8, protein: 7.4 },
      { itemId: "veg", name: "सब्जी (प्याज + टमाटर + अन्य)", grams: 25, kcal: 18.0, protein: 2.0 },
      { itemId: "oil", name: "खाद्य तेल", grams: 5, kcal: 45.0, protein: 0.0 },
      { itemId: "rice", name: "चावल", grams: 60, kcal: 211.0, protein: 5.0 },
      { itemId: "chana", name: "अंकुरित चना (नाश्ता)", grams: 25, kcal: 90.0, protein: 4.275 },
      { itemId: "jaggery", name: "गुड़ (नाश्ता)", grams: 20, kcal: 71.0, protein: 0.0 },
      { itemId: "eggs", name: "उबला अंडा (नाश्ता अतिरिक्त)", units: 1, kcal: 70, protein: 6 }
    ]
  },
  4: {
    day_id: 4,
    day_name_hi: "गुरुवार",
    day_name_en: "Thursday",
    snack_hi: "केला, पपीता या मौसमी फल + दूध",
    meal_hi: "रसियाव (गुड़ खीर)",
    total_grams: 106,
    energy_kcal: 505.00,
    protein_gm: 12.00,
    items: [
      { itemId: "rice", name: "चावल (रसियाव)", grams: 60, kcal: 211.0, protein: 5.0 },
      { itemId: "jaggery", name: "गुड़", grams: 30, kcal: 106.0, protein: 1.0 },
      { itemId: "peanut", name: "मूंगफली", grams: 15, kcal: 78.0, protein: 3.0 },
      { itemId: "milk", name: "दूध (100ml पानी में घोलकर)", grams: 1, ml: 100, kcal: 110.0, protein: 3.0 },
      { itemId: "fruit", name: "केला, पपीता या मौसमी फल", grams: 1, kcal: 0, protein: 0 }
    ]
  },
  5: {
    day_id: 5,
    day_name_hi: "शुक्रवार",
    day_name_en: "Friday",
    snack_hi: "मौसमी फल + अंडा/मूंगफली",
    meal_hi: "कद्दू दाल व चावल (या साग दाल व चावल)",
    total_grams: 212,
    energy_kcal: 505.00,
    protein_gm: 17.00,
    items: [
      { itemId: "rice", name: "चावल", grams: 70, kcal: 246.0, protein: 6.0 },
      { itemId: "dal", name: "दाल (कद्दू/साग दाल)", grams: 25, kcal: 81.0, protein: 6.0 },
      { itemId: "kaddu", name: "कद्दू / साग", grams: 100, kcal: 25.0, protein: 1.4 },
      { itemId: "oil", name: "खाद्य तेल", grams: 5, kcal: 45.0, protein: 0.0 },
      { itemId: "eggs", name: "उबला अंडा (नाश्ता अतिरिक्त)", units: 1, kcal: 70, protein: 6 }
    ]
  },
  6: {
    day_id: 6,
    day_name_hi: "शनिवार",
    day_name_en: "Saturday",
    snack_hi: "केला, पपीता या मौसमी फल",
    meal_hi: "चावल दाल की खिचड़ी",
    total_grams: 112,
    energy_kcal: 558.80,
    protein_gm: 17.80,
    items: [
      { itemId: "rice", name: "चावल (खिचड़ी)", grams: 60, kcal: 211.0, protein: 5.0 },
      { itemId: "dal", name: "दाल (खिचड़ी)", grams: 20, kcal: 64.8, protein: 4.8 },
      { itemId: "veg", name: "मौसम के अनुसार हरी सब्जियां", grams: 25, kcal: 18.0, protein: 2.0 },
      { itemId: "oil", name: "खाद्य तेल", grams: 5, kcal: 45.0, protein: 0.0 },
      { itemId: "fruit", name: "केला, पपीता या मौसमी फल (2)", grams: 2, kcal: 220.0, protein: 6.0 }
    ]
  },
  7: {
    day_id: 7,
    day_name_hi: "एक अतिरिक्त दिन (25वाँ दिन)",
    day_name_en: "Additional Day (25th Day)",
    snack_hi: "नाश्ता में चौमीन, मैगी, खीर पुरी सब्जी इत्यादि",
    meal_hi: "गर्म पका विशेष भोजन",
    total_grams: 150,
    energy_kcal: 500.00,
    protein_gm: 15.00,
    items: [
      { itemId: "rice", name: "चावल / सूजी", grams: 70, kcal: 246.0, protein: 5.0 },
      { itemId: "dal", name: "दाल / चना", grams: 20, kcal: 70.0, protein: 4.5 },
      { itemId: "oil", name: "खाद्य तेल", grams: 5, kcal: 45.0, protein: 0.0 }
    ]
  }
};

// 2. T.H.R. मेनू (प्रति माह प्रति लाभार्थी) रेडी टू कुक सामग्री
// Official Government Bihar Norms (Exact Grams per Month):
const BIHAR_OFFICIAL_THR_STANDARDS = {
  normal_kids: {
    id: "normal_kids",
    title_hi: "6 माह से 3 वर्ष के बच्चे (सामान्य व MAM)",
    daily_rate_rs: 8.00,
    calorie_standard: "500 Kcal",
    protein_standard: "12-15 gm",
    monthly_quota_grams: {
      rice: 1875,       // 1.875 kg
      moong_dal: 750,   // 0.750 kg
      masala_mix: 12.5, // 12.5 gm
      soybean: 500,     // 0.500 kg
      salt: 50,         // 50 gm
      oil: 250          // 0.250 kg (250 gm)
    }
  },
  sam_kids: {
    id: "sam_kids",
    title_hi: "6 माह से 3 वर्ष अतिकुपोषित बच्चे (SAM)",
    daily_rate_rs: 12.00,
    calorie_standard: "800 Kcal",
    protein_standard: "20-25 gm",
    monthly_quota_grams: {
      rice: 2942.5,     // 2.9425 kg
      moong_dal: 1337.5,// 1.3375 kg
      masala_mix: 25,   // 25 gm
      soybean: 500,     // 0.500 kg
      salt: 75,         // 75 gm
      oil: 500          // 0.500 kg (500 gm)
    }
  },
  mothers: {
    id: "mothers",
    title_hi: "गर्भवती एवं धात्री महिलाएं (PW & LM)",
    daily_rate_rs: 9.50,
    calorie_standard: "600 Kcal",
    protein_standard: "18-20 gm",
    monthly_quota_grams: {
      rice: 2250,       // 2.250 kg
      moong_dal: 1000,  // 1.000 kg
      masala_mix: 12.5, // 12.5 gm
      soybean: 375,     // 0.375 kg
      salt: 62.5,       // 62.5 gm
      oil: 375          // 0.375 kg (375 gm)
    }
  }
};

/**
 * Calculates HCM daily meal consumption deductions based on official grams
 */
function calculateHcmConsumption(dayNumber, childrenCount, eggsEaterCount = null) {
  const dayData = BIHAR_OFFICIAL_HCM_STANDARDS[dayNumber] || BIHAR_OFFICIAL_HCM_STANDARDS[1];
  const results = [];
  const count = Number(childrenCount);
  const eggsCount = (eggsEaterCount !== null) ? Number(eggsEaterCount) : count;

  dayData.items.forEach(it => {
    if (it.itemId === "eggs") {
      if (eggsCount > 0) {
        results.push({
          itemId: "eggs",
          name: it.name,
          quantity: eggsCount,
          unit: "संख्या (Nos.)",
          formula: `${eggsCount} बच्चे × 1 अंडा`
        });
      }
    } else if (it.itemId === "milk") {
      // Bihar ICDS: 200g dry milk powder packet (10g powder per child = 0.05 packet for 100ml milk)
      const totalKg = Number(((10 * count) / 1000).toFixed(3));
      const totalPackets = Number((totalKg / 0.2).toFixed(3));
      results.push({
        itemId: "milk",
        name: "सूखा दूध पाउडर (200g पैकेट)",
        quantity: totalKg,
        quantityPackets: totalPackets,
        unit: "कि.ग्रा. (kg)",
        formula: `${count} बच्चे × 10g = ${totalPackets} पैकेट (${totalKg} kg)`
      });
    } else if (it.itemId === "fruit") {
      // Seasonal fruit count
      results.push({
        itemId: "fruit",
        name: it.name,
        quantity: count * (it.grams || 1),
        unit: "संख्या/इकाई",
        formula: `${count} बच्चे × ${it.grams} मौसमी फल`
      });
    } else if (it.grams) {
      // Grams to Kilograms
      const totalKg = Number(((it.grams * count) / 1000).toFixed(3));
      results.push({
        itemId: it.itemId === "chana_snack" ? "chana" : it.itemId,
        name: it.name,
        quantity: totalKg,
        unit: "कि.ग्रा. (kg)",
        formula: `${count} बच्चे × ${it.grams}g = ${totalKg} kg`
      });
    }
  });

  return {
    mealTitle: dayData.meal_hi,
    snackTitle: dayData.snack_hi,
    totalGrams: dayData.total_grams,
    energyKcal: dayData.energy_kcal,
    proteinGm: dayData.protein_gm,
    items: results
  };
}

/**
 * Calculates Exact Bihar T.H.R. (Ready to Cook) Quota based on Official Table
 */
function calculateThrQuota(normalKids, samKids, pwCount, lmCount) {
  const nKids = Number(normalKids);
  const sKids = Number(samKids);
  const mothers = Number(pwCount) + Number(lmCount);

  const nQ = BIHAR_OFFICIAL_THR_STANDARDS.normal_kids.monthly_quota_grams;
  const sQ = BIHAR_OFFICIAL_THR_STANDARDS.sam_kids.monthly_quota_grams;
  const mQ = BIHAR_OFFICIAL_THR_STANDARDS.mothers.monthly_quota_grams;

  // Convert grams to kg (divide by 1000)
  const totalRiceKg = Number((((nKids * nQ.rice) + (sKids * sQ.rice) + (mothers * mQ.rice)) / 1000).toFixed(3));
  const totalMoongDalKg = Number((((nKids * nQ.moong_dal) + (sKids * sQ.moong_dal) + (mothers * mQ.moong_dal)) / 1000).toFixed(3));
  const totalMasalaMixKg = Number((((nKids * nQ.masala_mix) + (sKids * sQ.masala_mix) + (mothers * mQ.masala_mix)) / 1000).toFixed(3));
  const totalSoybeanKg = Number((((nKids * nQ.soybean) + (sKids * sQ.soybean) + (mothers * mQ.soybean)) / 1000).toFixed(3));
  const totalSaltKg = Number((((nKids * nQ.salt) + (sKids * sQ.salt) + (mothers * mQ.salt)) / 1000).toFixed(3));
  const totalOilKg = Number((((nKids * nQ.oil) + (sKids * sQ.oil) + (mothers * mQ.oil)) / 1000).toFixed(3));

  return {
    totalBeneficiaries: nKids + sKids + mothers,
    rice: {
      itemId: "rice",
      name: "चावल (Rice)",
      quantity: totalRiceKg,
      unit: "कि.ग्रा. (kg)",
      formula: `(${nKids}×1875g) + (${sKids}×2942.5g) + (${mothers}×2250g) = ${totalRiceKg} kg`
    },
    moong_dal: {
      itemId: "dal",
      name: "मूंगदाल (Moong Dal)",
      quantity: totalMoongDalKg,
      unit: "कि.ग्रा. (kg)",
      formula: `(${nKids}×750g) + (${sKids}×1337.5g) + (${mothers}×1000g) = ${totalMoongDalKg} kg`
    },
    soybean: {
      itemId: "soybean",
      name: "सोयाबीन (Soybean)",
      quantity: totalSoybeanKg,
      unit: "कि.ग्रा. (kg)",
      formula: `(${nKids}×500g) + (${sKids}×500g) + (${mothers}×375g) = ${totalSoybeanKg} kg`
    },
    oil: {
      itemId: "oil",
      name: "खाद्य तेल (Oil)",
      quantity: totalOilKg,
      unit: "कि.ग्रा. (kg)",
      formula: `(${nKids}×250g) + (${sKids}×500g) + (${mothers}×375g) = ${totalOilKg} kg`
    },
    masala_mix: {
      itemId: "salt_spices",
      name: "मसाला मिक्स (Masala Mix)",
      quantity: totalMasalaMixKg,
      unit: "कि.ग्रा. (kg)",
      formula: `(${nKids}×12.5g) + (${sKids}×25g) + (${mothers}×12.5g) = ${totalMasalaMixKg} kg`
    },
    salt: {
      itemId: "salt",
      name: "नमक (Salt)",
      quantity: totalSaltKg,
      unit: "कि.ग्रा. (kg)",
      formula: `(${nKids}×50g) + (${sKids}×75g) + (${mothers}×62.5g) = ${totalSaltKg} kg`
    }
  };
}

window.biharMenu = {
  calculateHcmConsumption,
  calculateThrQuota,
  BIHAR_OFFICIAL_HCM_STANDARDS,
  BIHAR_OFFICIAL_THR_STANDARDS
};
