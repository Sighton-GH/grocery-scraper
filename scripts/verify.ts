import * as fs from 'fs';
import * as path from 'path';
import { ScrapedProduct } from '../src/scraper/types';
import { getTodayDateString } from '../src/scraper/cache';

function main() {
  const dateStr = process.argv[2] || getTodayDateString();
  const filePath = path.resolve(process.cwd(), 'data', 'scraped', `${dateStr}.json`);

  console.log(`=== Running Scraper Verification for ${filePath} ===\n`);

  if (!fs.existsSync(filePath)) {
    console.error(`Verification Failed: Scraped data file does not exist: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let products: ScrapedProduct[];
  try {
    products = JSON.parse(content);
  } catch (err: any) {
    console.error(`Verification Failed: Invalid JSON in ${filePath}: ${err.message}`);
    process.exit(1);
  }

  console.log(`Auditing ${products.length} scraped product records...`);

  let missingFieldErrors = 0;
  let missingRawFileErrors = 0;
  let priceMismatchErrors = 0;

  for (let idx = 0; idx < products.length; idx++) {
    const p = products[idx];

    // 1. Fails if any row is missing url, fetchedAt or rawFile
    if (!p.url || typeof p.url !== 'string' || p.url.trim() === '') {
      console.error(`[Row ${idx}] Missing or empty 'url' field for: "${p.title}"`);
      missingFieldErrors++;
    }
    if (!p.fetchedAt || typeof p.fetchedAt !== 'string' || p.fetchedAt.trim() === '') {
      console.error(`[Row ${idx}] Missing or empty 'fetchedAt' timestamp for: "${p.title}"`);
      missingFieldErrors++;
    }
    if (!p.rawFile || typeof p.rawFile !== 'string' || p.rawFile.trim() === '') {
      console.error(`[Row ${idx}] Missing or empty 'rawFile' path for: "${p.title}"`);
      missingFieldErrors++;
    }

    // 2. Checks every row's rawFile exists
    const fullRawPath = path.resolve(process.cwd(), p.rawFile);
    if (!fs.existsSync(fullRawPath)) {
      console.error(`[Row ${idx}] Raw file not found on disk: "${p.rawFile}"`);
      missingRawFileErrors++;
      continue;
    }

    // 3. Checks that the row's price really appears in that raw file
    const rawContent = fs.readFileSync(fullRawPath, 'utf-8');
    const priceStr = p.price.toString();
    const priceTwoDec = p.price.toFixed(2);

    const priceFound = rawContent.includes(priceStr) || rawContent.includes(priceTwoDec);
    if (!priceFound) {
      console.error(`[Row ${idx}] Price ${p.price} not found inside raw response: "${p.rawFile}"`);
      priceMismatchErrors++;
    }
  }

  console.log('\n--- Verification Audit Results ---');
  console.log(`Total Rows Audited: ${products.length}`);
  console.log(`Missing Required Fields (url, fetchedAt, rawFile): ${missingFieldErrors}`);
  console.log(`Missing Raw Files on Disk: ${missingRawFileErrors}`);
  console.log(`Price Traceability Failures: ${priceMismatchErrors}`);

  if (missingFieldErrors > 0 || missingRawFileErrors > 0 || priceMismatchErrors > 0) {
    console.error('\nVERIFICATION FAILED: Data contains untraceable or malformed rows.');
    process.exit(1);
  }

  console.log('\nALL TRACEABILITY CHECKS PASSED: Every row corresponds to a real raw response file containing the exact recorded price.');

  // Print 10 random rows with their URLs so a human can inspect them
  console.log('\n--- 10 Sample Rows for Manual Human Verification ---');
  const sampleCount = Math.min(10, products.length);
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  const samples = shuffled.slice(0, sampleCount);

  samples.forEach((item, i) => {
    console.log(`\n[Sample ${i + 1}] Store: ${item.storeId.toUpperCase()} (${item.source})`);
    console.log(`  Title:       ${item.title}`);
    console.log(`  Query:       ${item.query}`);
    console.log(`  Price:       $${item.price.toFixed(2)} CAD`);
    if (item.regularPrice) console.log(`  Reg Price:   $${item.regularPrice.toFixed(2)} CAD`);
    if (item.onSale) console.log(`  On Sale:     YES`);
    console.log(`  URL:         ${item.url}`);
    console.log(`  Fetched At:  ${item.fetchedAt}`);
    console.log(`  Raw File:    ${item.rawFile}`);
  });
}

main();
