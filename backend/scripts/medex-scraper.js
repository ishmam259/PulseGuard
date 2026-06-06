/**
 * medex-scraper.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Scrapes https://medex.com.bd/ for medicine information.
 *
 * Capabilities:
 *   1. searchMedicine(query, type)  → list of search results
 *   2. getMedicineDetails(url)      → full medicine info from a brand/generic page
 *   3. main()                       → demo that runs both for several medicines
 *
 * Supports both /brands/ and /generics/ page types automatically.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://medex.com.bd';

// Shared browser-like headers to avoid bot-blocks
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  Referer: 'https://medex.com.bd/',
};

// Terminal colour helpers
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

const ok = (msg) => console.log(`${c.green}✔  ${msg}${c.reset}`);
const err = (msg) => console.error(`${c.red}✘  ${msg}${c.reset}`);
const hdr = (msg) => {
  const bar = '═'.repeat(62);
  console.log(`\n${c.cyan}${bar}${c.reset}`);
  console.log(`${c.bold}${c.cyan}  ${msg}${c.reset}`);
  console.log(`${c.cyan}${bar}${c.reset}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility: clean up whitespace from scraped text blocks
// ─────────────────────────────────────────────────────────────────────────────
function cleanText(text = '') {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\*\s*রেজিস্টার্ড.*/, '')
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH  –  returns array of { name, url, description }
// type can be: 'search' | 'brands' | 'generics' | 'indications'
// ─────────────────────────────────────────────────────────────────────────────
async function searchMedicine(query, type = 'search') {
  const url = `${BASE_URL}/search?search=${encodeURIComponent(query)}&type=${type}`;

  hdr(`SEARCH  →  "${query}"  [filter: ${type}]`);
  console.log(`${c.dim}  URL: ${url}${c.reset}\n`);

  const { data } = await axios.get(url, { headers: HEADERS });
  const $ = cheerio.load(data);

  const results = [];

  $('.search-result-row').each((_, el) => {
    const anchor = $(el).find('.search-result-title a');
    const name = anchor.text().trim();
    const href = anchor.attr('href') || '';
    const desc = $(el).find('p').text().trim();

    if (name && href) results.push({ name, url: href, description: desc });
  });

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL PAGE  –  works for both /brands/ and /generics/ URLs
// ─────────────────────────────────────────────────────────────────────────────
async function getMedicineDetails(medicineUrl) {
  const fullUrl = medicineUrl.startsWith('http')
    ? medicineUrl
    : `${BASE_URL}${medicineUrl}`;

  const { data } = await axios.get(fullUrl, { headers: HEADERS });
  const $ = cheerio.load(data);
  const isGeneric = fullUrl.includes('/generics/');

  // ── Helper: extract a section's text by its anchor ID ──────────────────────
  // Structure on the page:
  //   <div>
  //     <div id="indications"><h3 class="ac-header">...</h3></div>
  //     <div class="ac-body">...</div>
  //   </div>
  const getSection = (anchorId) => {
    const anchor = $(`#${anchorId}`);
    if (!anchor.length) return null;

    // Structure:  <div>  <div id="indications">...</div>  <div class="ac-body">...</div>  </div>
    // So the .ac-body is a sibling of the anchor div, both sharing the same parent wrapper.
    // We go: anchor → its own parent (the wrapper div) → find .ac-body child
    const wrapper = anchor.parent(); // the outer <div> wrapping id-div + ac-body
    const acBody = wrapper.find('> .ac-body');
    if (acBody.length) return cleanText(acBody.text());

    // Fallback: try next sibling at the same level
    const sibling = anchor.next('.ac-body');
    if (sibling.length) return cleanText(sibling.text());

    return null;
  };

  // ── Brand name / generic name ───────────────────────────────────────────────
  let brandName = '';
  let dosageForm = '';
  let genericName = '';
  let strength = '';
  let manufacturer = '';
  let priceText = '';

  if (isGeneric) {
    // Generic page: h1 has just the generic name, no brand
    brandName = $('h1.page-heading-1-l').first().text().trim();
    dosageForm = 'Generic';
    // No single strength / manufacturer on the generic page header
  } else {
    // Brand page
    brandName = $('h1.page-heading-1-l.brand')
      .clone()
      .children('small')
      .remove()
      .end()
      .text()
      .trim();
    dosageForm = $('h1.page-heading-1-l.brand small').text().trim();
    genericName = $('[title="Generic Name"] a').first().text().trim();
    strength = $('[title="Strength"]').first().text().trim();
    manufacturer = $('[title="Manufactured by"] a').first().text().trim();
    priceText = cleanText($('.package-container').first().text());
  }

  // ── Content sections (same structure on both page types) ───────────────────
  const indications = getSection('indications');
  const pharmacology = getSection('mode_of_action');
  const dosage = getSection('dosage');
  const administration = getSection('administration');
  const interaction = getSection('interaction');
  const contraindications = getSection('contraindications');
  const sideEffects = getSection('side_effects');
  const pregnancyLactation = getSection('pregnancy_cat');
  const precautions = getSection('precautions');
  const specialPopulations = getSection('pediatric_uses');
  const therapeuticClass = getSection('drug_classes');
  const reconstitution = getSection('reconstitution');
  const storageConditions = getSection('storage_conditions');

  // ── Pack image — bottom of every brand/generic page ───────────────────────
  let packImageUrl = null;
  $('img').each((_, el) => {
    const dataSrc = $(el).attr('data-src') || '';
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt') || '';
    const imgUrl = (dataSrc || src).trim();
    
    const isPackImage = imgUrl.includes('/storage/images/packaging/') || 
                         alt.toLowerCase().includes('pack image') ||
                         $(el).parent().hasClass('mp-trigger-g') ||
                         $(el).parent().hasClass('mp-trigger');
                         
    if (isPackImage && imgUrl && !imgUrl.startsWith('data:image')) {
      packImageUrl = imgUrl.startsWith('http') ? imgUrl : `${BASE_URL}${imgUrl}`;
      return false; // break the loop
    }
  });


  return {
    pageType: isGeneric ? 'generic' : 'brand',
    brandName,
    dosageForm,
    genericName,
    strength,
    manufacturer,
    priceText,
    sourceUrl: fullUrl,
    packImageUrl,
    sections: {
      indications,
      pharmacology,
      dosage,
      administration,
      interaction,
      contraindications,
      sideEffects,
      pregnancyLactation,
      precautions,
      specialPopulations,
      therapeuticClass,
      reconstitution,
      storageConditions,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pretty-printer
// ─────────────────────────────────────────────────────────────────────────────
function printMedicineInfo(info) {
  const divider = '─'.repeat(62);

  console.log(`\n${divider}`);
  console.log(
    `${c.bold}${c.yellow}💊  ${info.brandName}` +
      (info.dosageForm ? `  ·  ${info.dosageForm}` : '') +
      `${c.reset}`,
  );
  console.log(divider);

  const row = (label, value) => {
    if (!value) return;
    console.log(`  ${c.dim}${label.padEnd(18)}${c.reset}${value}`);
  };

  row('Page type', info.pageType);
  row('Generic Name', info.genericName);
  row('Strength', info.strength);
  row('Manufacturer', info.manufacturer);
  row('Price', info.priceText);
  row('Source URL', info.sourceUrl);

  const sectionLabels = {
    indications: 'Indications',
    pharmacology: 'Pharmacology',
    dosage: 'Dosage & Admin.',
    administration: 'Administration',
    interaction: 'Drug Interactions',
    contraindications: 'Contraindications',
    sideEffects: 'Side Effects',
    pregnancyLactation: 'Pregnancy & Lactation',
    precautions: 'Precautions',
    specialPopulations: 'Special Populations',
    therapeuticClass: 'Therapeutic Class',
    reconstitution: 'Reconstitution',
    storageConditions: 'Storage',
  };

  for (const [key, label] of Object.entries(sectionLabels)) {
    const text = info.sections[key];
    if (!text) continue;

    console.log(`\n  ${c.cyan}▸ ${label}:${c.reset}`);
    // Word-wrap at ~78 chars
    const words = text.split(' ');
    let line = '    ';
    for (const w of words) {
      if (line.length + w.length > 80) {
        console.log(line.trimEnd());
        line = '    ';
      }
      line += w + ' ';
    }
    if (line.trim()) console.log(line.trimEnd());
  }

  console.log(`\n${divider}\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DEMO
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${c.bold}${'▓'.repeat(62)}`);
  console.log('  MEDEX.COM.BD SCRAPER  —  Live Medicine Information');
  console.log(`${'▓'.repeat(62)}${c.reset}`);

  const queries = [
    { query: 'Napa', type: 'brands' },
    { query: 'Filmet', type: 'brands' },
    { query: 'Flagyl', type: 'brands' },
    { query: 'Imotil', type: 'brands' },
    { query: 'Sergel', type: 'brands' },
  ];

  for (const { query, type } of queries) {
    try {
      // ── 1. Search ──────────────────────────────────────────────────────────
      const results = await searchMedicine(query, type);

      if (!results.length) {
        err(`No results for "${query}"`);
        continue;
      }

      ok(`Found ${results.length} result(s).  Showing top 5:`);
      results.slice(0, 5).forEach((r, i) => {
        console.log(`  ${c.dim}[${i + 1}]${c.reset} ${r.name}`);
        if (r.description)
          console.log(
            `       ${c.dim}${r.description.slice(0, 110)}...${c.reset}`,
          );
      });

      // ── 2. Fetch details for the first result ──────────────────────────────
      const top = results[0];
      console.log(
        `\n${c.dim}  → Fetching full details for: ${top.name}${c.reset}`,
      );
      const details = await getMedicineDetails(top.url);
      ok('Details fetched!');

      // ── 3. Print ───────────────────────────────────────────────────────────
      printMedicineInfo(details);
    } catch (e) {
      err(`Error processing "${query}": ${e.message}`);
    }

    // Polite inter-request delay
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n${c.green}${c.bold}✅  All done!${c.reset}\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Export functions for use as a module in other scripts
// ─────────────────────────────────────────────────────────────────────────────
module.exports = { searchMedicine, getMedicineDetails };

// Run if called directly
if (require.main === module) {
  main().catch((e) => {
    err(`Fatal: ${e.message}`);
    process.exit(1);
  });
}
