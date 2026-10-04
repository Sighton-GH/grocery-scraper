import { GroceryItem, StoreChain, RetailerId, GroceryCategory } from '../types/grocery';
import rawData from './real_scraped_groceries.json';

export function loadRealScrapedDataset(): GroceryItem[] {
  return (rawData as any[]).map((r, idx) => ({
    id: r.item_id || `CAN-${r.retailer_id?.toUpperCase() || 'ITEM'}-${idx + 1000}`,
    retailerId: (r.retailer_id || 'loblaws') as RetailerId,
    store: (r.retailer_name || 'Loblaws') as StoreChain,
    storeLocation: r.store_location || 'Local Canadian Supermarket',
    storeNumber: r.store_number || '101',
    region: r.region || 'BC - Greater Vancouver',
    postalCode: r.postal_code || 'V5K0A1',
    category: (r.department || 'Pantry & Dry Staples') as GroceryCategory,
    subcategory: r.subcategory || 'General',
    name: r.product_name || 'Grocery Item',
    brand: r.brand || 'Store Brand',
    size: r.package_size || '1 each',
    price: Number(r.price_cad) || 0,
    regularPrice: Number(r.regular_price_cad) || Number(r.price_cad) || 0,
    isOnSale: r.is_on_sale === 'YES' || (Number(r.savings_cad) > 0),
    savings: Number(r.savings_cad) || 0,
    saleDetails: r.sale_details || 'Regular Everyday Price',
    unitPrice: Number(r.unit_price_cad) || Number(r.price_cad) || 0,
    unitMeasure: r.unit_measure || 'each',
    inStock: true,
    sourceUrl: r.source_url || 'https://flipp.com',
    sku: `SKU-${r.item_id ? r.item_id.replace(/[^0-9]/g, '') : idx + 200000}`,
    scrapedAt: r.scraped_timestamp || new Date().toISOString(),
    flyerValidFrom: r.flyer_valid_from,
    flyerValidTo: r.flyer_valid_to,
  }));
}

// Key staple reference templates for cross-store comparisons
export const STAPLE_GROCERY_NAMES = [
  'Gay Lea butter',
  'Lactantia Butter',
  'Large White Grade A Eggs',
  '2% Partly Skimmed Milk',
  '100% Whole Wheat Sliced Bread',
  'Boneless Skinless Chicken Breasts',
  'Lean Ground Beef',
  'Gala Apples',
  'Bananas',
  'Russet Potatoes',
  'Yellow Cooking Onions',
  'Long Grain White Rice',
  'Jasmine Rice',
  'Medium Roast Ground Coffee',
  'Orange Pekoe Tea',
  'Pure Canola Cooking Oil',
  'Classic Regular Potato Chips',
  'Paper Towels',
  'Bathroom Tissue',
];
