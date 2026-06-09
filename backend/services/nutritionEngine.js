const guidelines = require('../config/nutritionGuidelines.json');

function getTrimester(gestational_week) {
  if (gestational_week == null) return 1;
  const week = parseInt(gestational_week, 10);
  if (isNaN(week) || week <= 13) return 1;
  if (week <= 26) return 2;
  return 3;
}

function calcBMI(weight_kg, height_cm) {
  if (!weight_kg || !height_cm) return null;
  const height_m = height_cm / 100;
  const bmi = weight_kg / (height_m * height_m);
  return Math.round(bmi * 10) / 10;
}

function getBMICategory(bmi) {
  if (bmi == null) return null;
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25.0) return 'normal';
  if (bmi < 30.0) return 'overweight';
  return 'obese';
}

function getPersonalizedRDA({ gestational_week, is_twin_pregnancy, activity_level, weight_kg, height_cm }) {
  const trimester = getTrimester(gestational_week);
  const baseRda = guidelines.base_by_trimester[String(trimester)];

  let calories_kcal = baseRda.calories_kcal;
  let protein_g = baseRda.protein_g;
  let carb_g = baseRda.carb_g;
  let fat_g = baseRda.fat_g;

  // 1. Apply activity calorie delta
  const actLevel = activity_level || 'sedentary';
  const activityDelta = guidelines.activity_calorie_delta[actLevel] || 0;
  calories_kcal += activityDelta;

  // 2. Apply BMI calorie delta (only if weight & height are available)
  let bmi = null;
  let bmiCategory = null;
  if (weight_kg && height_cm) {
    bmi = calcBMI(weight_kg, height_cm);
    bmiCategory = getBMICategory(bmi);
    if (bmiCategory) {
      const bmiDelta = guidelines.bmi_calorie_delta[bmiCategory] || 0;
      calories_kcal += bmiDelta;
    }
  }

  // 3. Get base micronutrients
  let iron_mg = guidelines.micronutrients.iron_mg;
  let calcium_mg = guidelines.micronutrients.calcium_mg;
  let folic_acid_mcg = guidelines.micronutrients.folic_acid_mcg;
  let zinc_mg = guidelines.micronutrients.zinc_mg;
  let vitamin_d_mcg = guidelines.micronutrients.vitamin_d_mcg;
  let vitamin_c_mg = guidelines.micronutrients.vitamin_c_mg;

  // 4. Apply twin pregnancy multipliers if applicable
  if (is_twin_pregnancy) {
    const mult = guidelines.twin_multipliers;
    calories_kcal *= (mult.calories_kcal || 1.20);
    protein_g *= (mult.protein_g || 1.30);
    iron_mg *= (mult.iron_mg || 1.15);
    calcium_mg *= (mult.calcium_mg || 1.10);
  }

  return {
    trimester,
    bmi,
    bmi_category: bmiCategory,
    is_twin_pregnancy: !!is_twin_pregnancy,
    activity_level: actLevel,
    rda: {
      calories_kcal: Math.round(calories_kcal),
      protein_g: Math.round(protein_g * 10) / 10,
      carb_g: Math.round(carb_g * 10) / 10,
      fat_g: Math.round(fat_g * 10) / 10,
      iron_mg: Math.round(iron_mg * 10) / 10,
      calcium_mg: Math.round(calcium_mg * 10) / 10,
      folic_acid_mcg: Math.round(folic_acid_mcg * 10) / 10,
      zinc_mg: Math.round(zinc_mg * 10) / 10,
      vitamin_d_mcg: Math.round(vitamin_d_mcg * 10) / 10,
      vitamin_c_mg: Math.round(vitamin_c_mg * 10) / 10
    }
  };
}

function calcNutrientsFromFood(foodRow, grams) {
  const factor = grams / 100;
  return {
    calories_kcal: Math.round((parseFloat(foodRow.energy_kcal) || 0) * factor * 10) / 10,
    protein_g: Math.round((parseFloat(foodRow.protein_g) || 0) * factor * 100) / 100,
    carb_g: Math.round((parseFloat(foodRow.carb_g) || 0) * factor * 100) / 100,
    fat_g: Math.round((parseFloat(foodRow.fat_g) || 0) * factor * 100) / 100,
    iron_mg: Math.round((parseFloat(foodRow.iron_mg) || 0) * factor * 100) / 100,
    calcium_mg: Math.round((parseFloat(foodRow.calcium_mg) || 0) * factor * 10) / 10,
    folic_acid_mcg: Math.round((parseFloat(foodRow.folate_mcg) || 0) * factor * 10) / 10,
    zinc_mg: Math.round((parseFloat(foodRow.zinc_mg) || 0) * factor * 100) / 100,
    vitamin_d_mcg: Math.round((parseFloat(foodRow.vitamin_d_mcg) || 0) * factor * 100) / 100,
    vitamin_c_mg: Math.round((parseFloat(foodRow.vitamin_c_mg) || 0) * factor * 100) / 100
  };
}

const foodRecommendationsMap = {
  calories_kcal: ['Rice (Bhat)', 'Potato (Aloo)', 'Bread/Roti', 'Banana (Kola)'],
  protein_g: ['Lentils (Dal)', 'Eggs', 'Chicken', 'Beef', 'Milk', 'Rui Fish'],
  carb_g: ['Rice', 'Roti', 'Potato', 'Sweet potato'],
  fat_g: ['Mustard oil', 'Ghee', 'Nuts', 'Eggs'],
  iron_mg: ['Spinach (Palak Shak)', 'Red lentils (Masoor dal)', 'Beef liver', 'Hilsa fish', 'Pomegranate'],
  calcium_mg: ['Milk', 'Yogurt (Doi)', 'Small fish (Mola fish)', 'Dark leafy greens', 'Broccoli'],
  folic_acid_mcg: ['Red lentils (Masoor dal)', 'Spinach', 'Broccoli', 'Oranges', 'Eggs'],
  zinc_mg: ['Beef', 'Pumpkin seeds', 'Chickpeas (Chola)', 'Lentils', 'Yogurt'],
  vitamin_d_mcg: ['Egg yolk', 'Mushrooms', 'Fortified milk', 'Hilsa fish', 'Sunshine exposure'],
  vitamin_c_mg: ['Guava (Peyara)', 'Lemon (Lebu)', 'Orange (Komola)', 'Tomato', 'Amla (Amroki)']
};

function getFoodRecommendations(deficientNutrients) {
  const recommendations = {};
  for (const nutrient of deficientNutrients) {
    recommendations[nutrient] = foodRecommendationsMap[nutrient] || [];
  }
  return recommendations;
}

function detectDeficiencies(dailySummaries, rda, guidelinesConfig = guidelines) {
  // We need at least consecutive_days of data to detect a streak of deficiency
  const consecutiveDays = guidelinesConfig.deficiency_consecutive_days || 3;
  const thresholdPct = guidelinesConfig.deficiency_threshold_pct || 70;

  if (!dailySummaries || dailySummaries.length < consecutiveDays) {
    return [];
  }

  // Sort daily summaries chronologically (most recent last)
  const sortedSummaries = [...dailySummaries].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Only check the last `consecutiveDays` days for current active deficiency alerts
  const checkPeriod = sortedSummaries.slice(-consecutiveDays);

  const microNutrients = [
    { key: 'iron_mg', label: 'iron' },
    { key: 'calcium_mg', label: 'calcium' },
    { key: 'folic_acid_mcg', label: 'folic_acid' },
    { key: 'zinc_mg', label: 'zinc' },
    { key: 'vitamin_d_mcg', label: 'vitamin_d' },
    { key: 'vitamin_c_mg', label: 'vitamin_c' }
  ];

  const alerts = [];

  for (const item of microNutrients) {
    const target = rda[item.key];
    if (!target) continue;

    // Check if ALL checkPeriod days are below thresholdPct
    let lowDaysCount = 0;
    let totalIntake = 0;

    for (const summary of checkPeriod) {
      const intake = summary.totals[item.key] || 0;
      const pct = (intake / target) * 100;
      if (pct < thresholdPct) {
        lowDaysCount++;
      }
      totalIntake += intake;
    }

    if (lowDaysCount === consecutiveDays) {
      const avgIntake = totalIntake / consecutiveDays;
      const avgPct = (avgIntake / target) * 100;
      const severity = avgPct < 50 ? 'danger' : 'warning';
      
      const nutrientName = item.label.replace('_', ' ');
      const message = `Your ${nutrientName} intake has been below recommended levels (${Math.round(avgPct)}% of daily target) for ${consecutiveDays} consecutive days.`;

      alerts.push({
        nutrient: item.label,
        days_low: lowDaysCount,
        severity,
        message,
        recommendations: foodRecommendationsMap[item.key] || []
      });
    }
  }

  return alerts;
}

module.exports = {
  getTrimester,
  calcBMI,
  getBMICategory,
  getPersonalizedRDA,
  calcNutrientsFromFood,
  getFoodRecommendations,
  detectDeficiencies
};
