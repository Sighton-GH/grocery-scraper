export type GroceryCategory =
  | 'Produce'
  | 'Dairy & Eggs'
  | 'Meat & Seafood'
  | 'Bakery & Bread'
  | 'Pantry & Dry Staples'
  | 'Beverages'
  | 'Frozen Foods'
  | 'Snacks & Treats'
  | 'Household & Essentials';

export type RetailerId =
  | 'saveon'
  | 'nofrills'
  | 'walmart'
  | 'tnt'
  | 'loblaws'
  | 'metro'
  | 'foodbasics'
  | 'sobeys'
  | 'freshco'
  | 'costco';

export type StoreChain =
  | 'Save-On'
  | 'No Frills'
  | 'Walmart'
  | 'T&T'
  | 'Loblaws'
  | 'Metro'
  | 'Food Basics'
  | 'Sobeys'
  | 'FreshCo'
  | 'Costco';

export interface GroceryItem {
  id: string;
  retailerId: RetailerId;
  store: StoreChain;
  storeLocation: string;
  storeNumber: string;
  region: string;
  postalCode: string;
  category: GroceryCategory;
  subcategory: string;
  name: string;
  brand: string;
  size: string;
  price: number;
  regularPrice: number;
  isOnSale: boolean;
  savings: number;
  saleDetails: string;
  unitPrice: number;
  unitMeasure: string;
  inStock: boolean;
  sourceUrl: string;
  sku: string;
  scrapedAt: string;
  flyerValidFrom?: string;
  flyerValidTo?: string;
}

export interface RegionOption {
  id: string;
  name: string;
  province: string;
  postalCode: string;
  description: string;
}

export interface ScrapeJobStatus {
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentStore: string;
  progressPercent: number;
  itemsFound: number;
  logs: string[];
}

export interface BasketItemSelection {
  productId: string;
  genericName: string;
  quantity: number;
}

export interface HistoricalPricePoint {
  date: string;
  displayDate: string;
  [storeKey: string]: string | number | boolean | undefined;
  averagePrice: number;
}

export interface ItemHistoricalRecord {
  itemName: string;
  category: GroceryCategory;
  size: string;
  history: HistoricalPricePoint[];
  change12moPct: number;
  highestPrice: number;
  highestStore: string;
  lowestPrice: number;
  lowestStore: string;
}
