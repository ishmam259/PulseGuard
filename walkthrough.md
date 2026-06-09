# Nutrition Tracker — Backend Implementation Walkthrough

## Overview

The old 5-nutrient nutrition tracker was completely scrapped and rebuilt from scratch. This is a comprehensive clean-slate rewrite covering the database schema, a real Bangladeshi food composition database, configurable RDA guidelines, a pure logic service layer, and 9 new API endpoints.

---

## What Was Discarded

| Old Artifact | Action |
|---|---|
| `routes/nutrition.js` (168 lines, 4 endpoints) | **Deleted & fully rewritten** |
| `nutrition_logs` table (5-nutrient, no food ref) | **Dropped & recreated** |
| Hardcoded `RDA` object in route file | **Replaced** by `config/nutritionGuidelines.json` |
| 5-nutrient tracking only | **Replaced** by 9-nutrient system |

---

## Files Created / Changed

### `db/schema.sql` — Modified
- Dropped old `nutrition_logs` table
- **Created `food_items` table**: 381 Bangladeshi foods from FCDB, with 9 tracked nutrients per 100g
- **Created `food_serving_sizes` table**: Multiple serving units per food (gram, spoon, half_cup, cup, bowl, kg, ml, piece, glass)
- **Recreated `nutrition_logs` table**: New schema with `entry_method` (direct/food_based), food references, 9 nutrient columns (excluding iodine)
- Added `activity_level` and `is_twin_pregnancy` columns to `patients`

### `scripts/import-fcdb.js` — New
One-time seed script that imports `FCDB_7_4_14.xlsx`:
- Parses 1058 rows, detects 15 category headers and 381 food item rows
- Extracts energy kcal from the `(324)1360` format using regex
- Handles messy values: brackets `[8.0]`, dashes, `n.d.`, `tr` → 0
- Inserts/upserts all 381 foods into `food_items`
- Seeds 8–9 standard serving sizes per food with category-specific gram overrides (e.g. eggs → 50g/piece, fish/meat → 80g/piece)
- **Result**: 381 foods imported, covering 15 categories

### `config/nutritionGuidelines.json` — New
Fully configurable RDA rules — no code changes needed to update any value:
- Base RDA targets by trimester (1/2/3) for calories, protein, carbs, fat
- BMI calorie delta adjustments (underweight +200, overweight -100, obese -200)
- Activity level calorie deltas (sedentary, light, moderate, active)
- Twin pregnancy multipliers (calories ×1.20, protein ×1.30, iron ×1.15, calcium ×1.10)
- Micronutrient daily targets: iron 27mg, calcium 1000mg, folate 600mcg, zinc 11mg, vitamin D 15mcg, vitamin C 85mg

### `services/nutritionEngine.js` — New
Pure functions (zero DB calls, fully testable):
- `getTrimester(week)` — week 1-13 → T1, 14-26 → T2, 27+ → T3
- `calcBMI(weight_kg, height_cm)` — standard WHO BMI formula
- `getBMICategory(bmi)` — underweight / normal / overweight / obese
- `getPersonalizedRDA(params)` — applies all deltas in order: base → activity → BMI (if available) → twin multipliers
- `calcNutrientsFromFood(foodRow, grams)` — scales all 9 nutrients proportionally from per-100g values
- `detectDeficiencies(dailySummaries, rda)` — detects consecutive-day micronutrient shortfalls (configurable threshold %)
- `getFoodRecommendations(nutrients)` — returns Bangladeshi food suggestions per deficient nutrient

### `routes/nutrition.js` — Complete Rewrite
9 clean endpoints:

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/nutrition/rda` | patient | Personalized daily targets. Fetches height from `patients`, latest weight from `vitals` for dynamic BMI |
| `GET` | `/api/nutrition/foods/search` | all | Full-text + ILIKE food search with serving sizes |
| `GET` | `/api/nutrition/foods/:id` | all | Full nutrient profile + all serving sizes |
| `POST` | `/api/nutrition/log` | patient | Unified log entry (food_based or direct manual) |
| `PUT` | `/api/nutrition/log/:id` | patient | Edit entry (food_based recalculates nutrients) |
| `DELETE` | `/api/nutrition/log/:id` | patient | Delete own log entry |
| `GET` | `/api/nutrition/daily` | patient | Full daily summary with meal breakdown, percentages, and deficiency alerts |
| `GET` | `/api/nutrition/weekly` | patient | 7-day rolling report with averages, strengths, deficiencies, and food recommendations |
| `GET` | `/api/nutrition/summary/:patientId` | worker/admin | Same as daily but for any patient |

### `scripts/smoke-test-nutrition.js` — New
Automated 13-step end-to-end smoke test:
1. Register test patient
2. Login
3. Create patient profile
4. Set activity level in DB
5. Fetch RDA **with no vitals** → verify BMI is null
6. Search foods for "rice" → verify results + serving sizes
7. Log food-based entry (1.5 bowls rice flakes) → verify nutrient scaling
8. Log direct entry (iron tablet) → verify manual entry
9. Fetch daily summary → verify 2 entries + totals
10. Record vitals with weight 45kg (height 160cm = BMI 17.6)
11. Fetch RDA **after vitals** → verify BMI=17.6, bmi_category=underweight, calories=2500 (trimester 2300 + activity 100 + underweight 200)
12. Fetch weekly report → verify 7-day breakdown
13. Clean up test data

---

## Key Design Decisions

### Flexible BMI Calculation
Weight is not stored in patient profiles. Instead, on every `GET /api/nutrition/rda` call, the backend dynamically queries the most recent `vitals` entry with `weight_kg IS NOT NULL`. If available, BMI is calculated and calorie targets are adjusted. If not (no checkup yet), BMI adjustments are simply skipped — no null errors.

### Iodine Excluded
The FCDB database has no iodine column. Iodine is not tracked anywhere in this implementation.

### Two Entry Methods
- **`food_based`**: Patient picks from the 381-food database, selects a quantity + serving unit. Backend computes nutrients automatically.
- **`direct`**: Patient types in raw nutrient values (for supplements, custom foods, etc.)

### Deficiency Alerts
Alerts fire when a micronutrient stays below 70% of the daily target for 3 or more consecutive days. The 3-day window and 70% threshold are both configurable in `nutritionGuidelines.json`.

---

## Smoke Test Results

```
✅ Registered user
✅ Logged in
✅ Created patient profile
✅ Updated activity level
✅ Verified: BMI and weight are ignored/null (no vitals)
✅ Verified: Trimester 2 base targets applied (2200 kcal + 100 light = 2300 kcal)
✅ Found 20 foods matching "rice" + serving sizes
✅ Food-based entry logged with scaled nutrients (1.5 bowls)
✅ Direct entry logged (Iron supplement tablet)
✅ Daily summary returns 2 entries + correct totals
✅ Vitals recorded (weight 45kg)
✅ Verified: Dynamic BMI = 17.6 (underweight)
✅ Verified: Calorie RDA adjusted to 2500 kcal (2300 + 200 underweight)
✅ Weekly report returns 7-day breakdown
✅ Cleanup completed

🎉 ALL 13 NUTRITION MODULE SMOKE TESTS PASSED SUCCESSFULLY!
```
