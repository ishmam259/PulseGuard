const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const pool = require('../db/pool');

function cleanCategory(cat) {
  if (!cat) return '';
  return cat.replace(/^\d+\s+/, '').trim();
}

function parseEnergy(val) {
  if (val === undefined || val === null) return 0;
  const str = String(val).trim();
  const match = str.match(/\((\d+)\)/);
  if (match) {
    return parseFloat(match[1]);
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

function cleanValue(val) {
  if (val === undefined || val === null) return 0;
  let str = String(val).trim();
  if (
    str === '-' ||
    str.toLowerCase() === 'n.d.' ||
    str.toLowerCase() === 'nd' ||
    str.toLowerCase() === 'tr' ||
    str === ''
  ) {
    return 0;
  }
  // Strip brackets, e.g., "[8.0]" -> "8.0"
  str = str.replace(/[\[\]]/g, '');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

function getPieceGrams(category) {
  const catLower = category.toLowerCase();
  if (catLower.includes('egg')) return 50;
  if (catLower.includes('fruit')) return 120;
  if (catLower.includes('fish') || catLower.includes('shellfish')) return 80;
  if (catLower.includes('meat') || catLower.includes('poultry')) return 80;
  return 100;
}

async function importFcdb() {
  const excelPath = path.join(__dirname, '../Data/FCDB_7_4_14.xlsx');
  console.log(`Loading Excel from ${excelPath}...`);
  
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Excel file not found at ${excelPath}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(excelPath);
  const sheetName = 'UserDB_Main_table';
  if (!workbook.SheetNames.includes(sheetName)) {
    console.error(`❌ Sheet "${sheetName}" not found in workbook.`);
    process.exit(1);
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`Read ${rows.length} total rows from sheet.`);

  let currentCategory = '';
  let importedCount = 0;
  const itemCodeRegex = /^\d{2}_\d{4}/;
  const categoryHeaderRegex = /^\d{2}\s+[A-Za-z]/;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || '').trim();

    // 1. Detect Category Header
    if (categoryHeaderRegex.test(code)) {
      currentCategory = cleanCategory(code);
      console.log(`📁 Found Category: "${currentCategory}"`);
      continue;
    }

    // 2. Detect Food Item Row
    if (itemCodeRegex.test(code)) {
      const name_en = String(row[1] || '').trim();
      const name_bn = row[2] ? String(row[2]).trim() : null;

      if (!name_en) continue;

      const energy_kcal = parseEnergy(row[6]);
      const protein_g = cleanValue(row[8]);
      const fat_g = cleanValue(row[9]);
      const carb_g = cleanValue(row[10]);
      const calcium_mg = cleanValue(row[13]);
      const iron_mg = cleanValue(row[14]);
      const zinc_mg = cleanValue(row[19]);
      const vitamin_d_mcg = cleanValue(row[27]);
      const folate_mcg = cleanValue(row[35]);
      const vitamin_c_mg = cleanValue(row[36]);

      // Insert or update food item
      const insertFoodQuery = `
        INSERT INTO food_items (
          fcdb_code, name_en, name_bn, category, 
          energy_kcal, protein_g, carb_g, fat_g, 
          calcium_mg, iron_mg, zinc_mg, vitamin_d_mcg, 
          folate_mcg, vitamin_c_mg
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (fcdb_code) DO UPDATE SET
          name_en = EXCLUDED.name_en,
          name_bn = EXCLUDED.name_bn,
          category = EXCLUDED.category,
          energy_kcal = EXCLUDED.energy_kcal,
          protein_g = EXCLUDED.protein_g,
          carb_g = EXCLUDED.carb_g,
          fat_g = EXCLUDED.fat_g,
          calcium_mg = EXCLUDED.calcium_mg,
          iron_mg = EXCLUDED.iron_mg,
          zinc_mg = EXCLUDED.zinc_mg,
          vitamin_d_mcg = EXCLUDED.vitamin_d_mcg,
          folate_mcg = EXCLUDED.folate_mcg,
          vitamin_c_mg = EXCLUDED.vitamin_c_mg
        RETURNING id;
      `;

      const foodResult = await pool.query(insertFoodQuery, [
        code, name_en, name_bn, currentCategory || 'Other',
        energy_kcal, protein_g, carb_g, fat_g,
        calcium_mg, iron_mg, zinc_mg, vitamin_d_mcg,
        folate_mcg, vitamin_c_mg
      ]);

      const foodItemId = foodResult.rows[0].id;

      // Clean old serving sizes to avoid duplicates
      await pool.query(`DELETE FROM food_serving_sizes WHERE food_item_id = $1`, [foodItemId]);

      // Seed standard serving sizes
      const servingSizes = [];
      const pieceGrams = getPieceGrams(currentCategory);

      // 1. Gram
      servingSizes.push({ unit_name: 'gram', grams_equivalent: 1, display_label: '1g' });
      
      // 2. Kilogram (kg)
      servingSizes.push({ unit_name: 'kg', grams_equivalent: 1000, display_label: '1 kg (1000g)' });

      // 3. Milliliter (ml)
      servingSizes.push({ unit_name: 'ml', grams_equivalent: 1, display_label: '1 ml' });

      // 4. Spoon
      servingSizes.push({ unit_name: 'spoon', grams_equivalent: 15, display_label: '1 Spoon (15g)' });

      // 5. Half Cup
      servingSizes.push({ unit_name: 'half_cup', grams_equivalent: 120, display_label: '0.5 Cup (120g)' });

      // 6. Cup
      servingSizes.push({ unit_name: 'cup', grams_equivalent: 240, display_label: '1 Cup (240g)' });

      // 7. Bowl
      servingSizes.push({ unit_name: 'bowl', grams_equivalent: 200, display_label: '1 Bowl (200g)' });

      // 8. Piece
      servingSizes.push({ unit_name: 'piece', grams_equivalent: pieceGrams, display_label: `1 Piece (${pieceGrams}g)` });

      // 9. Glass (Milk/Dairy only)
      if (currentCategory.toLowerCase().includes('milk') || currentCategory.toLowerCase().includes('dairy')) {
        servingSizes.push({ unit_name: 'glass', grams_equivalent: 250, display_label: '1 Glass (250g)' });
      }

      for (const size of servingSizes) {
        await pool.query(`
          INSERT INTO food_serving_sizes (food_item_id, unit_name, grams_equivalent, display_label)
          VALUES ($1, $2, $3, $4);
        `, [foodItemId, size.unit_name, size.grams_equivalent, size.display_label]);
      }

      importedCount++;
    }
  }

  console.log(`\n🎉 Seed process finished. Imported/updated ${importedCount} foods!`);
  await pool.end();
}

importFcdb().catch(err => {
  console.error('❌ Excel import failed:', err);
  pool.end();
  process.exit(1);
});
