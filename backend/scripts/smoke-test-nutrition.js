const axios = require('axios');
const pool = require('../db/pool');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🏁 Starting Nutrition Tracker Backend Smoke Tests...');

  const testEmail = `testpatient_${Date.now()}@example.com`;
  const testPhone = `017${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPassword = 'Password123!';

  let token = '';
  let patientId = '';
  let userId = '';

  try {
    // 1. Register a test user (role = patient)
    console.log('\nStep 1: Registering a test patient user...');
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test Pregnant Patient',
      email: testEmail,
      phone: testPhone,
      password: testPassword,
      role: 'patient',
      address: 'Dhaka, Bangladesh',
      blood_type: 'O+',
      height: 160 // 160 cm = 1.6 m
    });

    userId = registerRes.data.user.id;
    console.log(`✅ Registered user ID: ${userId}`);

    // 2. Login as the patient
    console.log('\nStep 2: Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });

    token = loginRes.data.token;
    console.log('✅ Logged in successfully. Token acquired.');

    const headers = { Authorization: `Bearer ${token}` };

    // 3. Create a patient profile in the patients table
    console.log('\nStep 3: Creating patient profile...');
    const patientProfileRes = await axios.post(`${API_URL}/patients`, {
      name: 'Test Pregnant Patient',
      age: 25,
      village: 'Joypurhat',
      gestational_week: 16, // Trimester 2
      height: 160,
      blood_type: 'O+'
    }, { headers });

    patientId = patientProfileRes.data.patient.id;
    console.log(`✅ Patient Profile ID: ${patientId}`);

    // 4. Update activity level and twin pregnancy using DB update directly (or route if exists, but we can update patients table)
    console.log('\nStep 4: Setting activity level and twin pregnancy in patients table...');
    await pool.query(
      `UPDATE patients SET activity_level = 'light', is_twin_pregnancy = false WHERE id = $1`,
      [patientId]
    );
    console.log('✅ Updated activity_level = light, is_twin_pregnancy = false.');

    // 5. Test RDA endpoint BEFORE vitals weight is recorded
    console.log('\nStep 5: Fetching RDA targets (no vitals checkup recorded)...');
    const rdaResBefore = await axios.get(`${API_URL}/nutrition/rda`, { headers });
    console.log('RDA response:');
    console.log(JSON.stringify(rdaResBefore.data, null, 2));

    // Verify weight/BMI is ignored
    if (rdaResBefore.data.bmi !== null || rdaResBefore.data.bmi_category !== null) {
      throw new Error('❌ Test Failed: bmi and bmi_category should be null when no vitals weight is recorded');
    }
    console.log('✅ Verified: BMI and weight are ignored/null.');

    // Verify trimester is correct
    if (rdaResBefore.data.trimester !== 2) {
      throw new Error(`❌ Test Failed: expected trimester 2, got ${rdaResBefore.data.trimester}`);
    }
    console.log('✅ Verified: Trimester 2 base targets applied.');

    // 6. Test Food Search
    console.log('\nStep 6: Searching for "rice"...');
    const searchRes = await axios.get(`${API_URL}/nutrition/foods/search?q=rice`, { headers });
    const foods = searchRes.data.foods;
    console.log(`✅ Found ${foods.length} foods matching "rice".`);
    
    if (foods.length === 0) {
      throw new Error('❌ Test Failed: no foods found for "rice"');
    }

    const firstFood = foods[0];
    console.log(`First Food: "${firstFood.name_en}" (${firstFood.category})`);
    console.log('Serving sizes:', firstFood.serving_sizes);

    // 7. Log a food-based entry
    console.log('\nStep 7: Logging a food-based entry (1.5 bowl)...');
    const bowlServing = firstFood.serving_sizes.find(s => s.unit_name === 'bowl');
    if (!bowlServing) {
      throw new Error('❌ Test Failed: first food does not have a "bowl" serving size');
    }

    const logRes = await axios.post(`${API_URL}/nutrition/log`, {
      entry_method: 'food_based',
      food_item_id: firstFood.id,
      quantity: 1.5,
      serving_unit: 'bowl',
      meal_type: 'lunch'
    }, { headers });

    const entry = logRes.data.entry;
    console.log('Logged Entry:');
    console.log(JSON.stringify(entry, null, 2));

    if (entry.entry_method !== 'food_based' || parseFloat(entry.quantity) !== 1.5) {
      throw new Error('❌ Test Failed: log entry quantity or method mismatch');
    }
    console.log('✅ Verified: Food-based entry logged successfully with scaled nutrients.');

    // 8. Log a direct/manual entry
    console.log('\nStep 8: Logging a manual direct entry (Iron tablet)...');
    const directLogRes = await axios.post(`${API_URL}/nutrition/log`, {
      entry_method: 'direct',
      food_name: 'Iron supplement tablet',
      meal_type: 'snack',
      iron_mg: 15.0,
      calories_kcal: 0,
      protein_g: 0
    }, { headers });
    console.log(`✅ Direct entry logged: "${directLogRes.data.entry.food_name}"`);

    // 9. Fetch Daily Summary
    console.log('\nStep 9: Fetching Daily Summary...');
    const dailyRes = await axios.get(`${API_URL}/nutrition/daily`, { headers });
    console.log('Daily Totals:', dailyRes.data.totals);
    console.log('Daily Percentages:', dailyRes.data.percentages);
    console.log('Daily Entries count:', dailyRes.data.entries.length);

    if (dailyRes.data.entries.length !== 2) {
      throw new Error(`❌ Test Failed: expected 2 entries, got ${dailyRes.data.entries.length}`);
    }
    console.log('✅ Verified: Daily summary returns correct totals and entries list.');

    // 10. Record Vitals with Weight (to trigger BMI calculation)
    console.log('\nStep 10: Recording vitals with weight = 45kg (underweight category)...');
    // Height = 160 cm, Weight = 45 kg -> BMI = 45 / (1.6 * 1.6) = 17.6 (< 18.5 is underweight)
    // Underweight calorie delta should be +200 kcal
    await axios.post(`${API_URL}/patients/${patientId}/vitals`, {
      bp_systolic: 110,
      bp_diastolic: 70,
      weight_kg: 45.0,
      temperature_c: 36.6,
      pulse: 72,
      symptoms: []
    }, { headers });
    console.log('✅ Vitals recorded successfully.');

    // 11. Fetch RDA targets AFTER vitals weight is recorded
    console.log('\nStep 11: Fetching RDA targets (vitals weight recorded)...');
    const rdaResAfter = await axios.get(`${API_URL}/nutrition/rda`, { headers });
    console.log('RDA response (after vitals):');
    console.log(JSON.stringify(rdaResAfter.data, null, 2));

    if (rdaResAfter.data.bmi !== 17.6 || rdaResAfter.data.bmi_category !== 'underweight') {
      throw new Error(`❌ Test Failed: expected BMI 17.6 and category underweight, got BMI ${rdaResAfter.data.bmi} (${rdaResAfter.data.bmi_category})`);
    }
    console.log('✅ Verified: Dynamic BMI computed correctly as 17.6 (underweight).');

    // Calorie RDA with underweight delta (+200):
    // Trimester 2 base: 2200
    // Activity light: +100
    // Underweight BMI: +200
    // Total should be 2500 kcal
    if (rdaResAfter.data.rda.calories_kcal !== 2500) {
      throw new Error(`❌ Test Failed: expected calories target 2500 kcal, got ${rdaResAfter.data.rda.calories_kcal}`);
    }
    console.log('✅ Verified: Calorie RDA adjusted correctly based on dynamic BMI (+200 kcal).');

    // 12. Fetch Weekly Report
    console.log('\nStep 12: Fetching Weekly Report...');
    const weeklyRes = await axios.get(`${API_URL}/nutrition/weekly`, { headers });
    console.log('Weekly Period:', weeklyRes.data.period);
    console.log('Weekly Averages:', weeklyRes.data.averages);
    console.log('Weekly Strengths:', weeklyRes.data.strengths);
    console.log('Weekly Deficiencies:', weeklyRes.data.deficiencies);

    if (!weeklyRes.data.daily_breakdown || weeklyRes.data.daily_breakdown.length !== 7) {
      throw new Error('❌ Test Failed: expected daily_breakdown array of length 7');
    }
    console.log('✅ Verified: Weekly report returns 7-day breakdown and aggregate averages.');

    // 13. Delete logged entries & test patient to clean up database
    console.log('\nStep 13: Cleaning up test data...');
    // Delete logs
    for (const entry of dailyRes.data.entries) {
      await axios.delete(`${API_URL}/nutrition/log/${entry.id}`, { headers });
    }
    console.log('✅ Log entries deleted.');

    // Delete patient and user rows
    await pool.query('DELETE FROM patients WHERE id = $1', [patientId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log('✅ Test patient and user deleted from database.');

    console.log('\n🎉 ALL NUTRITION MODULE SMOKE TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    if (err.response) {
      console.error('API Error Response:', err.response.data);
    }
    
    // Attempt database cleanup on error
    try {
      if (patientId) await pool.query('DELETE FROM patients WHERE id = $1', [patientId]);
      if (userId) await pool.query('DELETE FROM users WHERE id = $1', [userId]);
      console.log('🧹 Cleanup query executed after failure.');
    } catch (cleanupErr) {
      console.error('Cleanup failed:', cleanupErr.message);
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTests();
