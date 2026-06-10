const express = require('express');
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');
const { enrichPatient } = require('../services/gestation');
const { storeKnowledge } = require('../services/ragService');
const {
  getPersonalizedRDA,
  calcNutrientsFromFood,
  getFoodRecommendations,
  detectDeficiencies
} = require('../services/nutritionEngine');

const router = express.Router();
router.use(authenticate);

const ALLOWED_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

// Helper to resolve patient profile ID from user ID
async function resolvePatientId(userId) {
  const r = await pool.query('SELECT id FROM patients WHERE user_id = $1', [userId]);
  return r.rows[0]?.id ?? null;
}

// Helper to resolve patient RDA using current metadata and latest vitals weight
async function getPatientRDAData(patientId) {
  const patientRes = await pool.query('SELECT * FROM patients WHERE id = $1', [patientId]);
  if (patientRes.rows.length === 0) return null;

  const patient = enrichPatient(patientRes.rows[0]);

  // Query latest vitals weight
  const vitalsRes = await pool.query(
    'SELECT weight_kg FROM vitals WHERE patient_id = $1 AND weight_kg IS NOT NULL ORDER BY recorded_at DESC LIMIT 1',
    [patientId]
  );
  const weight_kg = vitalsRes.rows[0]?.weight_kg ? parseFloat(vitalsRes.rows[0].weight_kg) : null;
  const height_cm = patient.height ? parseFloat(patient.height) : null;

  const rdaInfo = getPersonalizedRDA({
    gestational_week: patient.gestational_week,
    is_twin_pregnancy: patient.is_twin_pregnancy,
    activity_level: patient.activity_level,
    weight_kg,
    height_cm
  });

  return rdaInfo;
}

// 1. GET /api/nutrition/rda — Get patient's personalized targets
router.get('/rda', async (req, res) => {
  try {
    let patientId;
    if (req.user.role === 'patient') {
      patientId = await resolvePatientId(req.user.id);
    } else {
      return res.status(403).json({ error: 'Only patients can fetch their own RDA' });
    }

    if (!patientId) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const rdaData = await getPatientRDAData(patientId);
    if (!rdaData) return res.status(404).json({ error: 'Patient profile not found' });

    res.json(rdaData);
  } catch (err) {
    console.error('Get RDA error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GET /api/nutrition/foods/search — Search food items database
router.get('/foods/search', async (req, res) => {
  try {
    const { q, category, limit = 20 } = req.query;
    let foodsQuery = `
      SELECT id, fcdb_code, name_en, name_bn, category, energy_kcal, protein_g, carb_g, fat_g, calcium_mg, iron_mg, zinc_mg, vitamin_d_mcg, folate_mcg, vitamin_c_mg
      FROM food_items
      WHERE is_active = true
    `;
    const params = [];
    let paramIdx = 1;

    if (q && q.trim()) {
      foodsQuery += ` AND (name_en ILIKE $${paramIdx} OR name_bn ILIKE $${paramIdx})`;
      params.push(`%${q.trim()}%`);
      paramIdx++;
    }

    if (category && category.trim()) {
      foodsQuery += ` AND category = $${paramIdx}`;
      params.push(category.trim());
      paramIdx++;
    }

    foodsQuery += ` ORDER BY name_bn ASC LIMIT $${paramIdx}`;
    params.push(parseInt(limit, 10) || 20);

    const result = await pool.query(foodsQuery, params);

    // Fetch serving sizes for all matching foods
    const foodsWithServing = [];
    for (const food of result.rows) {
      const servingRes = await pool.query(
        'SELECT unit_name, grams_equivalent, display_label FROM food_serving_sizes WHERE food_item_id = $1 ORDER BY grams_equivalent ASC',
        [food.id]
      );
      foodsWithServing.push({
        ...food,
        serving_sizes: servingRes.rows
      });
    }

    res.json({ foods: foodsWithServing });
  } catch (err) {
    console.error('Search foods error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. GET /api/nutrition/foods/:id — Get details of a single food item
router.get('/foods/:id', async (req, res) => {
  try {
    const foodRes = await pool.query(
      `SELECT * FROM food_items WHERE id = $1 AND is_active = true`,
      [req.params.id]
    );

    if (foodRes.rows.length === 0) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const food = foodRes.rows[0];
    const servingRes = await pool.query(
      'SELECT unit_name, grams_equivalent, display_label FROM food_serving_sizes WHERE food_item_id = $1 ORDER BY grams_equivalent ASC',
      [food.id]
    );

    res.json({
      food: {
        ...food,
        serving_sizes: servingRes.rows
      }
    });
  } catch (err) {
    console.error('Get food details error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. POST /api/nutrition/log — Log a food intake entry
router.post('/log', requireRole('patient'), async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.user.id);
    if (!patientId) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const {
      entry_method = 'direct',
      food_item_id,
      quantity,
      serving_unit,
      food_name,
      meal_type
    } = req.body;

    if (!ALLOWED_MEAL_TYPES.includes(meal_type)) {
      return res.status(400).json({ error: 'Invalid meal_type. Must be breakfast, lunch, dinner, or snack' });
    }

    let insertQuery = '';
    let insertParams = [];

    if (entry_method === 'food_based') {
      if (!food_item_id) {
        return res.status(400).json({ error: 'food_item_id is required for food_based entry' });
      }
      if (quantity == null || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
        return res.status(400).json({ error: 'Valid quantity is required' });
      }
      if (!serving_unit) {
        return res.status(400).json({ error: 'serving_unit is required' });
      }

      // Query food details
      const foodRes = await pool.query('SELECT * FROM food_items WHERE id = $1', [food_item_id]);
      if (foodRes.rows.length === 0) {
        return res.status(404).json({ error: 'Food item not found' });
      }
      const food = foodRes.rows[0];

      // Query serving size details
      const servingRes = await pool.query(
        'SELECT grams_equivalent FROM food_serving_sizes WHERE food_item_id = $1 AND unit_name = $2',
        [food_item_id, serving_unit]
      );
      if (servingRes.rows.length === 0) {
        return res.status(400).json({ error: `Invalid serving_unit: ${serving_unit} for this food item` });
      }
      const gramsEquivalent = parseFloat(servingRes.rows[0].grams_equivalent);
      const totalGrams = parseFloat(quantity) * gramsEquivalent;

      // Scale nutrients
      const nutrients = calcNutrientsFromFood(food, totalGrams);

      insertQuery = `
        INSERT INTO nutrition_logs (
          patient_id, entry_method, food_item_id, quantity, serving_unit, food_name, meal_type,
          calories_kcal, protein_g, carb_g, fat_g, iron_mg, calcium_mg, folic_acid_mcg, zinc_mg, vitamin_d_mcg, vitamin_c_mg
        ) VALUES ($1, 'food_based', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *;
      `;
      insertParams = [
        patientId, food_item_id, quantity, serving_unit, food.name_bn || food.name_en, meal_type,
        nutrients.calories_kcal, nutrients.protein_g, nutrients.carb_g, nutrients.fat_g,
        nutrients.iron_mg, nutrients.calcium_mg, nutrients.folic_acid_mcg, nutrients.zinc_mg,
        nutrients.vitamin_d_mcg, nutrients.vitamin_c_mg
      ];
    } else {
      // Direct manual nutrient input
      const displayFoodName = food_name?.trim() || 'Manual Entry';
      const calories_kcal = parseFloat(req.body.calories_kcal) || 0;
      const protein_g = parseFloat(req.body.protein_g) || 0;
      const carb_g = parseFloat(req.body.carb_g) || 0;
      const fat_g = parseFloat(req.body.fat_g) || 0;
      const iron_mg = parseFloat(req.body.iron_mg) || 0;
      const calcium_mg = parseFloat(req.body.calcium_mg) || 0;
      const folic_acid_mcg = parseFloat(req.body.folic_acid_mcg) || 0;
      const zinc_mg = parseFloat(req.body.zinc_mg) || 0;
      const vitamin_d_mcg = parseFloat(req.body.vitamin_d_mcg) || 0;
      const vitamin_c_mg = parseFloat(req.body.vitamin_c_mg) || 0;

      insertQuery = `
        INSERT INTO nutrition_logs (
          patient_id, entry_method, food_name, meal_type,
          calories_kcal, protein_g, carb_g, fat_g, iron_mg, calcium_mg, folic_acid_mcg, zinc_mg, vitamin_d_mcg, vitamin_c_mg
        ) VALUES ($1, 'direct', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *;
      `;
      insertParams = [
        patientId, displayFoodName, meal_type,
        calories_kcal, protein_g, carb_g, fat_g, iron_mg, calcium_mg, folic_acid_mcg, zinc_mg, vitamin_d_mcg, vitamin_c_mg
      ];
    }

    const logRes = await pool.query(insertQuery, insertParams);
    const entry = logRes.rows[0];

    // Store in RAG system
    const nutritionContent = `Nutrition Update: Logged ${entry.meal_type} - ${entry.food_name}. Calories: ${entry.calories_kcal} kcal.`;
    await storeKnowledge(req.user.name, nutritionContent);

    res.status(201).json({ entry: logRes.rows[0] });
  } catch (err) {
    console.error('Log nutrition entry error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. PUT /api/nutrition/log/:id — Edit a logged nutrition entry
router.put('/log/:id', requireRole('patient'), async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.user.id);
    if (!patientId) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Verify ownership
    const checkRes = await pool.query(
      'SELECT * FROM nutrition_logs WHERE id = $1 AND patient_id = $2',
      [req.params.id, patientId]
    );
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Log entry not found' });
    }
    const existingEntry = checkRes.rows[0];

    const {
      quantity,
      serving_unit,
      meal_type,
      food_name
    } = req.body;

    const finalMealType = meal_type || existingEntry.meal_type;
    if (!ALLOWED_MEAL_TYPES.includes(finalMealType)) {
      return res.status(400).json({ error: 'Invalid meal_type' });
    }

    let updateQuery = '';
    let updateParams = [];

    if (existingEntry.entry_method === 'food_based') {
      const finalQty = quantity != null ? parseFloat(quantity) : parseFloat(existingEntry.quantity);
      const finalUnit = serving_unit || existingEntry.serving_unit;

      if (isNaN(finalQty) || finalQty <= 0) {
        return res.status(400).json({ error: 'Invalid quantity' });
      }

      // Query food item
      const foodRes = await pool.query('SELECT * FROM food_items WHERE id = $1', [existingEntry.food_item_id]);
      const food = foodRes.rows[0];

      // Query serving size
      const servingRes = await pool.query(
        'SELECT grams_equivalent FROM food_serving_sizes WHERE food_item_id = $1 AND unit_name = $2',
        [existingEntry.food_item_id, finalUnit]
      );
      if (servingRes.rows.length === 0) {
        return res.status(400).json({ error: `Invalid serving unit: ${finalUnit}` });
      }
      const gramsEquivalent = parseFloat(servingRes.rows[0].grams_equivalent);
      const totalGrams = finalQty * gramsEquivalent;

      // Recalculate
      const nutrients = calcNutrientsFromFood(food, totalGrams);

      updateQuery = `
        UPDATE nutrition_logs SET
          quantity = $1, serving_unit = $2, meal_type = $3,
          calories_kcal = $4, protein_g = $5, carb_g = $6, fat_g = $7,
          iron_mg = $8, calcium_mg = $9, folic_acid_mcg = $10, zinc_mg = $11, vitamin_d_mcg = $12, vitamin_c_mg = $13
        WHERE id = $14 AND patient_id = $15
        RETURNING *;
      `;
      updateParams = [
        finalQty, finalUnit, finalMealType,
        nutrients.calories_kcal, nutrients.protein_g, nutrients.carb_g, nutrients.fat_g,
        nutrients.iron_mg, nutrients.calcium_mg, nutrients.folic_acid_mcg, nutrients.zinc_mg,
        nutrients.vitamin_d_mcg, nutrients.vitamin_c_mg,
        req.params.id, patientId
      ];
    } else {
      // Edit direct entry
      const finalFoodName = food_name?.trim() || existingEntry.food_name;
      const calories_kcal = req.body.calories_kcal != null ? parseFloat(req.body.calories_kcal) : parseFloat(existingEntry.calories_kcal);
      const protein_g = req.body.protein_g != null ? parseFloat(req.body.protein_g) : parseFloat(existingEntry.protein_g);
      const carb_g = req.body.carb_g != null ? parseFloat(req.body.carb_g) : parseFloat(existingEntry.carb_g);
      const fat_g = req.body.fat_g != null ? parseFloat(req.body.fat_g) : parseFloat(existingEntry.fat_g);
      const iron_mg = req.body.iron_mg != null ? parseFloat(req.body.iron_mg) : parseFloat(existingEntry.iron_mg);
      const calcium_mg = req.body.calcium_mg != null ? parseFloat(req.body.calcium_mg) : parseFloat(existingEntry.calcium_mg);
      const folic_acid_mcg = req.body.folic_acid_mcg != null ? parseFloat(req.body.folic_acid_mcg) : parseFloat(existingEntry.folic_acid_mcg);
      const zinc_mg = req.body.zinc_mg != null ? parseFloat(req.body.zinc_mg) : parseFloat(existingEntry.zinc_mg);
      const vitamin_d_mcg = req.body.vitamin_d_mcg != null ? parseFloat(req.body.vitamin_d_mcg) : parseFloat(existingEntry.vitamin_d_mcg);
      const vitamin_c_mg = req.body.vitamin_c_mg != null ? parseFloat(req.body.vitamin_c_mg) : parseFloat(existingEntry.vitamin_c_mg);

      updateQuery = `
        UPDATE nutrition_logs SET
          food_name = $1, meal_type = $2,
          calories_kcal = $3, protein_g = $4, carb_g = $5, fat_g = $6,
          iron_mg = $7, calcium_mg = $8, folic_acid_mcg = $9, zinc_mg = $10, vitamin_d_mcg = $11, vitamin_c_mg = $12
        WHERE id = $13 AND patient_id = $14
        RETURNING *;
      `;
      updateParams = [
        finalFoodName, finalMealType,
        calories_kcal, protein_g, carb_g, fat_g, iron_mg, calcium_mg, folic_acid_mcg, zinc_mg, vitamin_d_mcg, vitamin_c_mg,
        req.params.id, patientId
      ];
    }

    const editRes = await pool.query(updateQuery, updateParams);
    res.json({ entry: editRes.rows[0] });
  } catch (err) {
    console.error('Edit nutrition entry error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. DELETE /api/nutrition/log/:id — Delete a logged nutrition entry
router.delete('/log/:id', requireRole('patient'), async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.user.id);
    if (!patientId) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const result = await pool.query(
      'DELETE FROM nutrition_logs WHERE id = $1 AND patient_id = $2 RETURNING id',
      [req.params.id, patientId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Log entry not found or unauthorized' });
    }

    res.json({ message: 'Log entry deleted successfully' });
  } catch (err) {
    console.error('Delete nutrition entry error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Internal helper to get daily summary data
async function getDailySummary(patientId, dateStr) {
  const rdaData = await getPatientRDAData(patientId);
  if (!rdaData) return null;

  const { rda } = rdaData;

  // Query entries for the given date
  const logsRes = await pool.query(
    `SELECT * FROM nutrition_logs WHERE patient_id = $1 AND logged_at::date = $2::date ORDER BY logged_at ASC`,
    [patientId, dateStr]
  );
  const entries = logsRes.rows;

  // Compute daily totals
  const totals = {
    calories_kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0,
    iron_mg: 0, calcium_mg: 0, folic_acid_mcg: 0, zinc_mg: 0, vitamin_d_mcg: 0, vitamin_c_mg: 0
  };

  const by_meal = {
    breakfast: { calories_kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0, iron_mg: 0, calcium_mg: 0, folic_acid_mcg: 0, zinc_mg: 0, vitamin_d_mcg: 0, vitamin_c_mg: 0 },
    lunch: { calories_kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0, iron_mg: 0, calcium_mg: 0, folic_acid_mcg: 0, zinc_mg: 0, vitamin_d_mcg: 0, vitamin_c_mg: 0 },
    dinner: { calories_kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0, iron_mg: 0, calcium_mg: 0, folic_acid_mcg: 0, zinc_mg: 0, vitamin_d_mcg: 0, vitamin_c_mg: 0 },
    snack: { calories_kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0, iron_mg: 0, calcium_mg: 0, folic_acid_mcg: 0, zinc_mg: 0, vitamin_d_mcg: 0, vitamin_c_mg: 0 }
  };

  for (const entry of entries) {
    const meal = entry.meal_type;
    const mealTotals = by_meal[meal] || by_meal.snack;

    for (const key of Object.keys(totals)) {
      const val = parseFloat(entry[key]) || 0;
      totals[key] += val;
      mealTotals[key] += val;
    }
  }

  // Round totals and meals
  for (const key of Object.keys(totals)) {
    totals[key] = Math.round(totals[key] * 10) / 10;
    for (const meal of Object.keys(by_meal)) {
      by_meal[meal][key] = Math.round(by_meal[meal][key] * 10) / 10;
    }
  }

  // Compute percentages
  const percentages = {};
  for (const key of Object.keys(totals)) {
    const target = rda[key] || 1;
    percentages[key] = Math.round((totals[key] / target) * 100);
  }

  // Query last 7 days of daily summaries to detect deficiency alerts
  const pastSummariesRes = await pool.query(
    `SELECT logged_at::date as date,
            SUM(calories_kcal) as calories_kcal, SUM(protein_g) as protein_g,
            SUM(carb_g) as carb_g, SUM(fat_g) as fat_g,
            SUM(iron_mg) as iron_mg, SUM(calcium_mg) as calcium_mg,
            SUM(folic_acid_mcg) as folic_acid_mcg, SUM(zinc_mg) as zinc_mg,
            SUM(vitamin_d_mcg) as vitamin_d_mcg, SUM(vitamin_c_mg) as vitamin_c_mg
     FROM nutrition_logs
     WHERE patient_id = $1 AND logged_at::date <= $2::date AND logged_at::date > $2::date - INTERVAL '7 days'
     GROUP BY logged_at::date`,
    [patientId, dateStr]
  );

  const dailySummaries = pastSummariesRes.rows.map(row => ({
    date: row.date.toISOString().slice(0, 10),
    totals: {
      calories_kcal: parseFloat(row.calories_kcal) || 0,
      protein_g: parseFloat(row.protein_g) || 0,
      carb_g: parseFloat(row.carb_g) || 0,
      fat_g: parseFloat(row.fat_g) || 0,
      iron_mg: parseFloat(row.iron_mg) || 0,
      calcium_mg: parseFloat(row.calcium_mg) || 0,
      folic_acid_mcg: parseFloat(row.folic_acid_mcg) || 0,
      zinc_mg: parseFloat(row.zinc_mg) || 0,
      vitamin_d_mcg: parseFloat(row.vitamin_d_mcg) || 0,
      vitamin_c_mg: parseFloat(row.vitamin_c_mg) || 0
    }
  }));

  // Ensure the current requested date is also present in dailySummaries for consecutive streaks
  const exists = dailySummaries.find(s => s.date === dateStr);
  if (!exists) {
    dailySummaries.push({ date: dateStr, totals });
  } else {
    // Override with newly computed totals
    exists.totals = totals;
  }

  const alerts = detectDeficiencies(dailySummaries, rda);

  return {
    date: dateStr,
    rda,
    totals,
    percentages,
    by_meal,
    entries,
    alerts,
    trimester: rdaData.trimester,
    bmi: rdaData.bmi,
    bmi_category: rdaData.bmi_category,
    is_twin_pregnancy: rdaData.is_twin_pregnancy,
    activity_level: rdaData.activity_level
  };
}

// 7. GET /api/nutrition/daily — Get patient's daily summary report
router.get('/daily', requireRole('patient'), async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.user.id);
    if (!patientId) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const summary = await getDailySummary(patientId, dateStr);

    res.json(summary);
  } catch (err) {
    console.error('Get daily nutrition error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 8. GET /api/nutrition/weekly — Get patient's rolling weekly nutrition report
router.get('/weekly', requireRole('patient'), async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.user.id);
    if (!patientId) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const weeksBack = parseInt(req.query.weeks_back, 10) || 0;
    
    // Rolling 7-day period (ending at current timezone today)
    const baseOffset = weeksBack * 7;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - baseOffset);
    const endDateStr = endDate.toISOString().slice(0, 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - baseOffset - 6);
    const startDateStr = startDate.toISOString().slice(0, 10);

    const rdaData = await getPatientRDAData(patientId);
    if (!rdaData) return res.status(404).json({ error: 'Patient profile not found' });

    const { rda } = rdaData;

    // Fetch daily logs grouped by date
    const logsRes = await pool.query(
      `SELECT logged_at::date as entry_date,
              SUM(calories_kcal) as calories_kcal, SUM(protein_g) as protein_g,
              SUM(carb_g) as carb_g, SUM(fat_g) as fat_g,
              SUM(iron_mg) as iron_mg, SUM(calcium_mg) as calcium_mg,
              SUM(folic_acid_mcg) as folic_acid_mcg, SUM(zinc_mg) as zinc_mg,
              SUM(vitamin_d_mcg) as vitamin_d_mcg, SUM(vitamin_c_mg) as vitamin_c_mg
       FROM nutrition_logs
       WHERE patient_id = $1 AND logged_at::date >= $2::date AND logged_at::date <= $3::date
       GROUP BY logged_at::date
       ORDER BY logged_at::date ASC`,
      [patientId, startDateStr, endDateStr]
    );

    // Build map of dates to fill empty tracking days
    const dailyBreakdown = [];
    const dateMap = {};
    for (const row of logsRes.rows) {
      const dStr = row.entry_date.toISOString().slice(0, 10);
      dateMap[dStr] = {
        calories_kcal: parseFloat(row.calories_kcal) || 0,
        protein_g: parseFloat(row.protein_g) || 0,
        carb_g: parseFloat(row.carb_g) || 0,
        fat_g: parseFloat(row.fat_g) || 0,
        iron_mg: parseFloat(row.iron_mg) || 0,
        calcium_mg: parseFloat(row.calcium_mg) || 0,
        folic_acid_mcg: parseFloat(row.folic_acid_mcg) || 0,
        zinc_mg: parseFloat(row.zinc_mg) || 0,
        vitamin_d_mcg: parseFloat(row.vitamin_d_mcg) || 0,
        vitamin_c_mg: parseFloat(row.vitamin_c_mg) || 0
      };
    }

    const averages = {
      calories_kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0,
      iron_mg: 0, calcium_mg: 0, folic_acid_mcg: 0, zinc_mg: 0, vitamin_d_mcg: 0, vitamin_c_mg: 0
    };

    let daysTracked = 0;
    
    // Fill all 7 dates in chronological order
    const iterDate = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const dStr = iterDate.toISOString().slice(0, 10);
      const dayData = dateMap[dStr] || {
        calories_kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0,
        iron_mg: 0, calcium_mg: 0, folic_acid_mcg: 0, zinc_mg: 0, vitamin_d_mcg: 0, vitamin_c_mg: 0
      };

      if (dateMap[dStr]) {
        daysTracked++;
      }

      // Compute percentages for the day
      const dayPercentages = {};
      for (const key of Object.keys(averages)) {
        const target = rda[key] || 1;
        dayPercentages[key] = Math.round((dayData[key] / target) * 100);
        
        // Sum for weekly averages
        averages[key] += dayData[key];
      }

      dailyBreakdown.push({
        date: dStr,
        totals: dayData,
        percentages: dayPercentages
      });

      iterDate.setDate(iterDate.getDate() + 1);
    }

    // Calculate average over 7 days (or actual tracked days, standard is 7 days period)
    const avg_percentages = {};
    for (const key of Object.keys(averages)) {
      averages[key] = Math.round((averages[key] / 7) * 10) / 10;
      const target = rda[key] || 1;
      avg_percentages[key] = Math.round((averages[key] / target) * 100);
    }

    // Determine strengths & deficiencies
    const strengths = [];
    const deficiencies = [];

    // Checked nutrients list
    const micronutrientKeys = [
      { key: 'iron_mg', label: 'iron' },
      { key: 'calcium_mg', label: 'calcium' },
      { key: 'folic_acid_mcg', label: 'folic_acid' },
      { key: 'zinc_mg', label: 'zinc' },
      { key: 'vitamin_d_mcg', label: 'vitamin_d' },
      { key: 'vitamin_c_mg', label: 'vitamin_c' }
    ];

    for (const item of micronutrientKeys) {
      const pct = avg_percentages[item.key];
      if (pct >= 90) {
        strengths.push(item.label);
      } else if (pct < 70) {
        deficiencies.push(item.label);
      }
    }

    // Get recommended foods
    const recommendations = {};
    for (const defNutrient of deficiencies) {
      // Find the label in micro list
      const matchingItem = micronutrientKeys.find(m => m.label === defNutrient);
      if (matchingItem) {
        const foodList = getFoodRecommendations([matchingItem.key])[matchingItem.key];
        const displayLabel = defNutrient.replace('_', ' ');
        recommendations[defNutrient] = {
          message: `Your weekly average intake of ${displayLabel} is below target. Consider adding the following foods to your diet:`,
          foods: foodList
        };
      }
    }

    res.json({
      period: {
        from: startDateStr,
        to: endDateStr,
        days_tracked: daysTracked
      },
      rda,
      averages,
      avg_percentages,
      strengths,
      deficiencies,
      daily_breakdown: dailyBreakdown,
      recommendations
    });
  } catch (err) {
    console.error('Get weekly report error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 9. GET /api/nutrition/summary/:patientId — Get summary report of a patient (worker/admin only)
router.get('/summary/:patientId', requireRole('worker', 'admin'), async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const summary = await getDailySummary(patientId, dateStr);

    if (!summary) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json(summary);
  } catch (err) {
    console.error('Summary view error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
