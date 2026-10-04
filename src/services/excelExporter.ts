import * as XLSX from 'xlsx';
import { GroceryItem, StoreChain } from '../types/grocery';

export function buildExcelWorkbook(items: GroceryItem[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // --- SHEET 1: Master Scraped Canadian Groceries ---
  const masterRows = items.map(item => ({
    'Item ID': item.id,
    'Retailer ID': item.retailerId,
    'Retailer': item.store,
    'Store Location': item.storeLocation,
    'Store #': item.storeNumber,
    'Region': item.region,
    'Postal Code': item.postalCode,
    'Department': item.category,
    'Subcategory': item.subcategory,
    'Product Name': item.name,
    'Brand': item.brand,
    'Size': item.size,
    'Price (CAD $)': item.price,
    'Regular Price (CAD $)': item.regularPrice,
    'On Sale': item.isOnSale ? 'YES' : 'NO',
    'Savings (CAD $)': item.savings > 0 ? item.savings : 0,
    'Deal Details': item.saleDetails,
    'Unit Price (CAD $)': item.unitPrice,
    'Unit Measure': item.unitMeasure,
    'Stock Status': item.inStock ? 'In Stock' : 'Out of Stock',
    'Scraped Timestamp': item.scrapedAt,
    'Flyer Valid To': item.flyerValidTo ? item.flyerValidTo.split('T')[0] : '',
    'Source URL': item.sourceUrl,
  }));

  const masterSheet = XLSX.utils.json_to_sheet(masterRows);

  masterSheet['!cols'] = [
    { wch: 18 }, // Item ID
    { wch: 14 }, // Retailer ID
    { wch: 14 }, // Retailer
    { wch: 28 }, // Store Location
    { wch: 10 }, // Store #
    { wch: 24 }, // Region
    { wch: 12 }, // Postal Code
    { wch: 18 }, // Department
    { wch: 18 }, // Subcategory
    { wch: 38 }, // Product Name
    { wch: 20 }, // Brand
    { wch: 14 }, // Size
    { wch: 12 }, // Price
    { wch: 14 }, // Regular Price
    { wch: 10 }, // On Sale
    { wch: 12 }, // Savings
    { wch: 22 }, // Deal Details
    { wch: 14 }, // Unit Price
    { wch: 12 }, // Unit Measure
    { wch: 12 }, // Stock Status
    { wch: 26 }, // Scraped Timestamp
    { wch: 14 }, // Flyer Valid To
    { wch: 45 }, // Source URL
  ];

  XLSX.utils.book_append_sheet(wb, masterSheet, 'Master Scraped Groceries');

  // --- SHEET 2: Regional Retailer Comparison Matrix ---
  const regions = Array.from(new Set(items.map(i => i.region)));
  const retailers: StoreChain[] = [
    'Save-On', 'No Frills', 'Walmart', 'T&T', 'Loblaws',
    'Metro', 'Food Basics', 'Sobeys', 'FreshCo', 'Costco'
  ];

  const regionalStats: any[] = [];
  for (const reg of regions) {
    const regItems = items.filter(i => i.region === reg);
    for (const ret of retailers) {
      const retItems = regItems.filter(i => i.store === ret);
      if (retItems.length === 0) continue;

      const avgPrice = retItems.reduce((acc, i) => acc + i.price, 0) / retItems.length;
      const salesCount = retItems.filter(i => i.isOnSale).length;
      const totalSavings = retItems.reduce((acc, i) => acc + i.savings, 0);

      regionalStats.push({
        'Region': reg,
        'Retailer': ret,
        'Items Scraped': retItems.length,
        'Average Item Price ($)': Math.round(avgPrice * 100) / 100,
        'Active Flyer Deals': salesCount,
        'Total Flyer Savings ($)': Math.round(totalSavings * 100) / 100,
      });
    }
  }

  const regionalSheet = XLSX.utils.json_to_sheet(regionalStats);
  regionalSheet['!cols'] = [
    { wch: 26 }, { wch: 16 }, { wch: 14 }, { wch: 20 }, { wch: 16 }, { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, regionalSheet, 'Regional Breakdown');

  // --- SHEET 3: Active Promotional Flyer Deals ---
  const deals = items
    .filter(i => i.isOnSale && i.savings > 0)
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 300)
    .map(i => ({
      'Region': i.region,
      'Retailer ID': i.retailerId,
      'Retailer': i.store,
      'Product Name': i.name,
      'Brand': i.brand,
      'Sale Price ($)': i.price,
      'Regular Price ($)': i.regularPrice,
      'Savings ($)': i.savings,
      'Promotion Details': i.saleDetails,
      'Source URL': i.sourceUrl,
    }));

  const dealsSheet = XLSX.utils.json_to_sheet(deals);
  dealsSheet['!cols'] = [
    { wch: 26 }, { wch: 14 }, { wch: 14 }, { wch: 36 }, { wch: 20 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 26 }, { wch: 45 }
  ];
  XLSX.utils.book_append_sheet(wb, dealsSheet, 'Active Flyer Deals');

  return wb;
}

export function exportToExcel(items: GroceryItem[], filename = 'Canadian_Grocery_Prices_Scraped.xlsx'): void {
  const wb = buildExcelWorkbook(items);
  XLSX.writeFile(wb, filename);
}

export function generateCSV(items: GroceryItem[]): string {
  const headers = [
    'Item ID',
    'Retailer ID',
    'Retailer Name',
    'Store Location',
    'Store Number',
    'Region',
    'Postal Code',
    'Department',
    'Subcategory',
    'Product Name',
    'Brand',
    'Package Size',
    'Price CAD',
    'Regular Price CAD',
    'On Sale',
    'Savings CAD',
    'Deal Details',
    'Unit Price CAD',
    'Unit Measure',
    'In Stock',
    'Scraped Timestamp',
    'Flyer Valid To',
    'Source URL',
  ];

  const rows = items.map(item => [
    escapeCsv(item.id),
    escapeCsv(item.retailerId),
    escapeCsv(item.store),
    escapeCsv(item.storeLocation),
    escapeCsv(item.storeNumber),
    escapeCsv(item.region),
    escapeCsv(item.postalCode),
    escapeCsv(item.category),
    escapeCsv(item.subcategory),
    escapeCsv(item.name),
    escapeCsv(item.brand),
    escapeCsv(item.size),
    item.price.toFixed(2),
    item.regularPrice.toFixed(2),
    item.isOnSale ? 'YES' : 'NO',
    item.savings.toFixed(2),
    escapeCsv(item.saleDetails),
    item.unitPrice.toFixed(2),
    escapeCsv(item.unitMeasure),
    item.inStock ? 'TRUE' : 'FALSE',
    escapeCsv(item.scrapedAt),
    escapeCsv(item.flyerValidTo || ''),
    escapeCsv(item.sourceUrl),
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
}

export function exportToCSV(items: GroceryItem[], filename = 'Canadian_Grocery_Prices_Scraped.csv'): void {
  const csvContent = generateCSV(items);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(val: string | number | undefined): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}
