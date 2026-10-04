import { ItemHistoricalRecord, HistoricalPricePoint, GroceryCategory, StoreChain } from '../types/grocery';

const MONTH_SNAPSHOTS = [
  { key: '2025-10', label: 'Oct 25', inflationOffset: -0.06 },
  { key: '2025-11', label: 'Nov 25', inflationOffset: -0.05 },
  { key: '2025-12', label: 'Dec 25', inflationOffset: -0.03 },
  { key: '2026-01', label: 'Jan 26', inflationOffset: -0.04 },
  { key: '2026-02', label: 'Feb 26', inflationOffset: -0.02 },
  { key: '2026-03', label: 'Mar 26', inflationOffset: -0.01 },
  { key: '2026-04', label: 'Apr 26', inflationOffset: -0.01 },
  { key: '2026-05', label: 'May 26', inflationOffset: 0.00 },
  { key: '2026-06', label: 'Jun 26', inflationOffset: 0.01 },
  { key: '2026-07', label: 'Jul 26', inflationOffset: 0.02 },
  { key: '2026-08', label: 'Aug 26', inflationOffset: 0.01 },
  { key: '2026-09', label: 'Sep 26', inflationOffset: 0.02 },
  { key: '2026-10', label: 'Oct 26 (Current)', inflationOffset: 0.03 },
];

export interface HistoricalStaple {
  name: string;
  category: GroceryCategory;
  size: string;
  basePrice: number;
  retailerMultipliers?: Partial<Record<StoreChain, number>>;
}

export const HISTORICAL_STAPLES: HistoricalStaple[] = [
  {
    name: 'Gay Lea / Salted Butter 454g',
    category: 'Dairy & Eggs',
    size: '454 g',
    basePrice: 5.99,
    retailerMultipliers: {
      'No Frills': 0.83, 'Walmart': 0.83, 'Food Basics': 0.84, 'FreshCo': 0.85, 'Costco': 0.78,
      'Save-On': 1.05, 'T&T': 0.95, 'Metro': 1.12, 'Sobeys': 1.14, 'Loblaws': 1.15
    },
  },
  {
    name: '2% Partly Skimmed Milk 4L',
    category: 'Dairy & Eggs',
    size: '4 L',
    basePrice: 5.89,
    retailerMultipliers: {
      'No Frills': 0.92, 'Walmart': 0.93, 'Food Basics': 0.92, 'FreshCo': 0.93, 'Costco': 0.88,
      'Save-On': 1.04, 'T&T': 0.96, 'Metro': 1.08, 'Sobeys': 1.08, 'Loblaws': 1.08
    },
  },
  {
    name: 'Large White Grade A Eggs 12pk',
    category: 'Dairy & Eggs',
    size: '12 count',
    basePrice: 4.19,
    retailerMultipliers: {
      'No Frills': 0.88, 'Walmart': 0.89, 'Food Basics': 0.88, 'FreshCo': 0.89, 'Costco': 0.78,
      'Save-On': 1.06, 'T&T': 0.92, 'Metro': 1.12, 'Sobeys': 1.12, 'Loblaws': 1.14
    },
  },
  {
    name: 'Boneless Skinless Chicken Breasts',
    category: 'Meat & Seafood',
    size: 'approx 1.2 kg',
    basePrice: 16.99,
    retailerMultipliers: {
      'No Frills': 0.85, 'Walmart': 0.86, 'Food Basics': 0.85, 'FreshCo': 0.86, 'Costco': 0.80,
      'Save-On': 1.08, 'T&T': 0.89, 'Metro': 1.15, 'Sobeys': 1.16, 'Loblaws': 1.18
    },
  },
  {
    name: 'Lean Ground Beef Family Pack',
    category: 'Meat & Seafood',
    size: 'approx 1.0 kg',
    basePrice: 14.49,
    retailerMultipliers: {
      'No Frills': 0.86, 'Walmart': 0.87, 'Food Basics': 0.86, 'FreshCo': 0.87, 'Costco': 0.82,
      'Save-On': 1.08, 'T&T': 0.92, 'Metro': 1.14, 'Sobeys': 1.15, 'Loblaws': 1.16
    },
  },
  {
    name: '100% Whole Wheat Sliced Bread 675g',
    category: 'Bakery & Bread',
    size: '675 g',
    basePrice: 3.89,
    retailerMultipliers: {
      'No Frills': 0.72, 'Walmart': 0.74, 'Food Basics': 0.72, 'FreshCo': 0.74, 'Costco': 0.65,
      'Save-On': 1.02, 'T&T': 0.88, 'Metro': 1.10, 'Sobeys': 1.12, 'Loblaws': 1.12
    },
  },
  {
    name: 'Bananas Fresh Yellow',
    category: 'Produce',
    size: '1 kg',
    basePrice: 1.79,
    retailerMultipliers: {
      'No Frills': 0.86, 'Walmart': 0.87, 'Food Basics': 0.86, 'FreshCo': 0.87, 'Costco': 0.80,
      'Save-On': 1.05, 'T&T': 0.89, 'Metro': 1.12, 'Sobeys': 1.12, 'Loblaws': 1.12
    },
  },
  {
    name: 'Gala Apples Bag 3lb',
    category: 'Produce',
    size: '3 lb (1.36 kg)',
    basePrice: 5.49,
    retailerMultipliers: {
      'No Frills': 0.84, 'Walmart': 0.86, 'Food Basics': 0.85, 'FreshCo': 0.86, 'Costco': 0.80,
      'Save-On': 1.08, 'T&T': 0.90, 'Metro': 1.12, 'Sobeys': 1.14, 'Loblaws': 1.14
    },
  },
  {
    name: 'Long Grain White / Jasmine Rice 8kg',
    category: 'Pantry & Dry Staples',
    size: '8 kg',
    basePrice: 16.99,
    retailerMultipliers: {
      'No Frills': 0.82, 'Walmart': 0.84, 'Food Basics': 0.82, 'FreshCo': 0.84, 'Costco': 0.75,
      'Save-On': 1.04, 'T&T': 0.78, 'Metro': 1.10, 'Sobeys': 1.12, 'Loblaws': 1.10
    },
  },
  {
    name: 'Medium Roast Ground Coffee',
    category: 'Beverages',
    size: '925 g',
    basePrice: 12.99,
    retailerMultipliers: {
      'No Frills': 0.82, 'Walmart': 0.84, 'Food Basics': 0.82, 'FreshCo': 0.84, 'Costco': 0.74,
      'Save-On': 1.05, 'T&T': 0.95, 'Metro': 1.12, 'Sobeys': 1.14, 'Loblaws': 1.12
    },
  },
];

export function getHistoricalDataForItem(itemName: string): ItemHistoricalRecord | null {
  const staple = HISTORICAL_STAPLES.find(s => s.name.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(s.name.toLowerCase()))
    || HISTORICAL_STAPLES[0];

  const chainNames: StoreChain[] = [
    'Save-On', 'No Frills', 'Walmart', 'T&T', 'Loblaws',
    'Metro', 'Food Basics', 'Sobeys', 'FreshCo', 'Costco'
  ];
  let allRecordedPrices: { price: number; store: string }[] = [];

  const defaultChainMult: Record<StoreChain, number> = {
    'No Frills': 0.88, 'Food Basics': 0.88, 'FreshCo': 0.89, 'Walmart': 0.89, 'Costco': 0.82,
    'T&T': 0.92, 'Save-On': 1.05, 'Metro': 1.10, 'Sobeys': 1.12, 'Loblaws': 1.14
  };

  const history: HistoricalPricePoint[] = MONTH_SNAPSHOTS.map((snap, snapIdx) => {
    const point: HistoricalPricePoint = {
      date: snap.key,
      displayDate: snap.label,
      averagePrice: 0,
    };

    let sum = 0;
    let count = 0;

    for (const chain of chainNames) {
      const baseMult = staple.retailerMultipliers?.[chain] || defaultChainMult[chain] || 1.0;

      // Realistic flyer discount events
      const isFlyerSale = (snapIdx + chain.length * 3) % 4 === 0;
      const flyerDiscount = isFlyerSale ? 0.84 : 1.0;
      const noise = ((snapIdx * 17 + chain.charCodeAt(0)) % 9 - 4) / 250;

      const calcPrice = Math.round(
        staple.basePrice * (baseMult + snap.inflationOffset + noise) * flyerDiscount * 100
      ) / 100;

      point[chain] = calcPrice;
      sum += calcPrice;
      count += 1;
      allRecordedPrices.push({ price: calcPrice, store: chain });
    }

    point.averagePrice = Math.round((sum / count) * 100) / 100;
    return point;
  });

  allRecordedPrices.sort((a, b) => a.price - b.price);
  const lowest = allRecordedPrices[0];
  const highest = allRecordedPrices[allRecordedPrices.length - 1];

  const firstAvg = history[0].averagePrice;
  const lastAvg = history[history.length - 1].averagePrice;
  const change12moPct = Math.round(((lastAvg - firstAvg) / firstAvg) * 1000) / 10;

  return {
    itemName: staple.name,
    category: staple.category,
    size: staple.size,
    history,
    change12moPct,
    highestPrice: highest.price,
    highestStore: highest.store,
    lowestPrice: lowest.price,
    lowestStore: lowest.store,
  };
}

export function getAllHistoricalItems(): string[] {
  return HISTORICAL_STAPLES.map(s => s.name);
}
