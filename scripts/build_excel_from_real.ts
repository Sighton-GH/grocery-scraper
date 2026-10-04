import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

interface ScrapedRow {
  item_id: string;
  retailer_id: string;
  retailer_name: string;
  store_location: string;
  store_number: string;
  region: string;
  postal_code: string;
  department: string;
  subcategory: string;
  product_name: string;
  brand: string;
  package_size: string;
  price_cad: number;
  regular_price_cad: number;
  is_on_sale: string;
  savings_cad: number;
  sale_details: string;
  unit_price_cad: number;
  unit_measure: string;
  in_stock: string;
  scraped_timestamp: string;
  flyer_valid_from: string;
  flyer_valid_to: string;
  source_url: string;
}

function main() {
  const jsonPath = path.resolve(process.cwd(), 'src/data/real_scraped_groceries.json');
  const rawData: ScrapedRow[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${rawData.length} real scraped items for Excel export.`);

  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: Master Scraped Prices
  const masterRows = rawData.map((r: any) => ({
    'Item ID': r.item_id,
    'Retailer ID': r.retailer_id,
    'Retailer': r.retailer_name,
    'Website Domain': r.website_domain || 'Official Retailer Storefront',
    'Store Location': r.store_location,
    'Store #': r.store_number,
    'Region': r.region,
    'Postal Code': r.postal_code,
    'Department': r.department,
    'Subcategory': r.subcategory,
    'Product Name': r.product_name,
    'Brand': r.brand,
    'Size': r.package_size,
    'Price (CAD $)': r.price_cad,
    'Reg Price ($)': r.regular_price_cad,
    'On Sale': r.is_on_sale,
    'Savings ($)': r.savings_cad,
    'Deal Details': r.sale_details,
    'Unit Price ($)': r.unit_price_cad,
    'Unit Measure': r.unit_measure,
    'Scraped Timestamp': r.scraped_timestamp,
    'Source URL': r.source_url,
  }));

  const masterSheet = XLSX.utils.json_to_sheet(masterRows);
  masterSheet['!cols'] = [
    { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 28 }, { wch: 10 },
    { wch: 24 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 36 },
    { wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 26 },
    { wch: 55 },
  ];
  XLSX.utils.book_append_sheet(wb, masterSheet, 'Master Scraped Groceries');

  // 2. Sheet 2: Regional Summary & Retailer Comparison
  const regions = Array.from(new Set(rawData.map((r: any) => r.region)));
  const retailers = [
    'Save-On', 'No Frills', 'Walmart', 'T&T', 'Loblaws',
    'Metro', 'Food Basics', 'Sobeys', 'FreshCo', 'Costco'
  ];

  const regionalSummary: any[] = [];
  for (const reg of regions) {
    const regItems = rawData.filter(r => r.region === reg);
    for (const ret of retailers) {
      const retItems = regItems.filter(r => r.retailer_name === ret);
      if (retItems.length === 0) continue;
      const avgPrice = retItems.reduce((acc, i) => acc + i.price_cad, 0) / retItems.length;
      const salesCount = retItems.filter(i => i.is_on_sale === 'YES').length;
      const totalSavings = retItems.reduce((acc, i) => acc + i.savings_cad, 0);

      regionalSummary.push({
        'Region': reg,
        'Retailer': ret,
        'Items Scraped': retItems.length,
        'Avg Price ($)': Math.round(avgPrice * 100) / 100,
        'Active Deals': salesCount,
        'Total Flyer Savings ($)': Math.round(totalSavings * 100) / 100,
      });
    }
  }

  const summarySheet = XLSX.utils.json_to_sheet(regionalSummary);
  summarySheet['!cols'] = [
    { wch: 26 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Regional Retailer Breakdown');

  // 3. Sheet 3: Top Flyer Deals by Region
  const topDeals = rawData
    .filter(r => r.is_on_sale === 'YES' && r.savings_cad > 0)
    .sort((a, b) => b.savings_cad - a.savings_cad)
    .slice(0, 200)
    .map(r => ({
      'Region': r.region,
      'Retailer': r.retailer_name,
      'Product Name': r.product_name,
      'Brand': r.brand,
      'Sale Price ($)': r.price_cad,
      'Regular Price ($)': r.regular_price_cad,
      'Savings ($)': r.savings_cad,
      'Deal Story': r.sale_details,
      'Source URL': r.source_url,
    }));

  const dealsSheet = XLSX.utils.json_to_sheet(topDeals);
  dealsSheet['!cols'] = [
    { wch: 26 }, { wch: 14 }, { wch: 34 }, { wch: 20 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 24 }, { wch: 45 }
  ];
  XLSX.utils.book_append_sheet(wb, dealsSheet, 'Active Flyer Deals');

  // Write out files
  const rootXlsx = path.resolve(process.cwd(), 'canadian_grocery_prices_master.xlsx');
  XLSX.writeFile(wb, rootXlsx);
  console.log(`Saved: ${rootXlsx}`);

  const publicXlsx = path.resolve(process.cwd(), 'public/canadian_grocery_prices_master.xlsx');
  XLSX.writeFile(wb, publicXlsx);
  console.log(`Saved: ${publicXlsx}`);
}

main();
