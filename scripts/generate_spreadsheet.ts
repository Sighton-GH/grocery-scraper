import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { loadRealScrapedDataset } from '../src/data/groceryCatalog';
import { buildExcelWorkbook, generateCSV } from '../src/services/excelExporter';

function main() {
  console.log('Generating Canadian Grocery Master Dataset...');
  const items = loadRealScrapedDataset();
  console.log(`Generated ${items.length} grocery price records across all major Canadian chains.`);

  // 1. Write Excel Workbook (.xlsx)
  const wb = buildExcelWorkbook(items);
  const xlsxPath = path.resolve(process.cwd(), 'canadian_grocery_prices_master.xlsx');
  XLSX.writeFile(wb, xlsxPath);
  console.log(`Wrote Excel spreadsheet to: ${xlsxPath}`);

  // Also write to public folder if it exists, or create public folder so browser can download it directly via static GET
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicXlsx = path.resolve(publicDir, 'canadian_grocery_prices_master.xlsx');
  XLSX.writeFile(wb, publicXlsx);

  // 2. Write CSV (.csv)
  const csvContent = generateCSV(items);
  const csvPath = path.resolve(process.cwd(), 'canadian_grocery_prices_master.csv');
  fs.writeFileSync(csvPath, '\uFEFF' + csvContent, 'utf-8');
  console.log(`Wrote CSV spreadsheet to: ${csvPath}`);

  const publicCsv = path.resolve(publicDir, 'canadian_grocery_prices_master.csv');
  fs.writeFileSync(publicCsv, '\uFEFF' + csvContent, 'utf-8');

  console.log('Master spreadsheets successfully generated and saved!');
}

main();
