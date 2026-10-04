import React, { useState, useMemo } from 'react';
import { GroceryItem, StoreChain } from '../types/grocery';
import { TARGET_RETAILERS } from '../data/regions';
import { Search, Download, MapPin } from 'lucide-react';
import * as XLSX from 'xlsx';

interface PriceMatrixProps {
  items: GroceryItem[];
}

export const PriceMatrix: React.FC<PriceMatrixProps> = ({ items }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const regions = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => set.add(i.region));
    return ['all', ...Array.from(set)];
  }, [items]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => set.add(i.category));
    return ['all', ...Array.from(set)];
  }, [items]);

  const targetRetailers: StoreChain[] = [
    'Save-On', 'No Frills', 'Walmart', 'T&T', 'Loblaws',
    'Metro', 'Food Basics', 'Sobeys', 'FreshCo', 'Costco'
  ];

  const matrixData = useMemo(() => {
    const scopedItems = selectedRegion === 'all'
      ? items
      : items.filter(i => i.region === selectedRegion);

    const map = new Map<
      string,
      {
        name: string;
        category: string;
        size: string;
        prices: Partial<Record<StoreChain, { price: number; sale: boolean; rawName: string }>>;
      }
    >();

    for (const item of scopedItems) {
      // Extract generic staple name from product name
      const cleanName = item.name
        .replace(/^(Western Family Organic|Western Family Signature|Western Family|No Name|Great Value|President's Choice|PC Organics|PC Blue Menu|PC Free From|PC Green|Kirkland Signature Ultra Clean|Kirkland Signature|Compliments Organic|Compliments Value|Compliments|Selection|Irresistibles Organic|Irresistibles|T&T Fresh Direct|T&T Seafood Direct|T&T Fresh|T&T Select|T&T Bakery|T&T Brand|T&T|Farmer's Market|Suraj|Rooster Brand|Rooster Jasmine|Sunrise Soya|Sunrise|Neilson \/ Sealtest|Neilson|Sealtest|Lactantia|Dairyland|Armstrong|Gay Lea|Italpasta|Garofalo Organic|Barilla|Five Roses|Robin Hood|Bertolli|PC Splendido|Panache|Tim Hortons|Oasis|Delissio \/ Kirkland|Dr. Oetker|Calbee \/ T&T|Royale|Cashmere|Tide Simply|Country Harvest|Dempster's)\s+/i, '')
        .replace(/,\s*.*$/, '');

      const key = `${item.category} - ${cleanName}`;
      if (!map.has(key)) {
        map.set(key, {
          name: cleanName,
          category: item.category,
          size: item.size,
          prices: {},
        });
      }
      const entry = map.get(key)!;
      entry.prices[item.store] = { price: item.price, sale: item.isOnSale, rawName: item.name };
    }

    const rows = Array.from(map.values()).map(entry => {
      const priceVals = Object.values(entry.prices).map(p => p.price);
      const min = priceVals.length > 0 ? Math.min(...priceVals) : 0;
      const max = priceVals.length > 0 ? Math.max(...priceVals) : 0;
      const gap = Math.round((max - min) * 100) / 100;
      const pctGap = min > 0 ? Math.round(((max - min) / min) * 100) : 0;

      return {
        ...entry,
        min,
        max,
        gap,
        pctGap,
        availableStoresCount: priceVals.length,
      };
    });

    return rows
      .filter(r => {
        if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      })
      .slice(0, 150); // Keep rendering fast
  }, [items, selectedRegion, selectedCategory, searchTerm]);

  const handleExportMatrixExcel = () => {
    const rows = matrixData.map(r => {
      const obj: Record<string, any> = {
        'Department': r.category,
        'Product Title': r.name,
        'Size': r.size,
      };
      for (const chain of targetRetailers) {
        const val = r.prices[chain];
        obj[chain] = val !== undefined ? `$${val.price.toFixed(2)}${val.sale ? ' (Sale)' : ''}` : '—';
      }
      obj['Lowest Price ($)'] = `$${r.min.toFixed(2)}`;
      obj['Price Spread ($)'] = `$${r.gap.toFixed(2)}`;
      obj['Spread (%)'] = `${r.pctGap}%`;
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Store Price Matrix');
    XLSX.writeFile(wb, 'Canadian_10_Retailers_Price_Matrix.xlsx');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            10 Major Canadian Retailers Price Comparison Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare prices across Save-On, No Frills, Walmart, T&T, Loblaws, Metro, Food Basics, Sobeys, FreshCo, and Costco.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Region selector */}
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
          >
            <option value="all">All Canadian Regions</option>
            {regions.filter(r => r !== 'all').map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Department selector */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">All Departments</option>
            {categories.filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter items..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            onClick={handleExportMatrixExcel}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Matrix</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-2.5 px-3 sticky left-0 bg-slate-50 z-10 min-w-[220px]">
                Product Title & Department
              </th>
              {targetRetailers.map(chain => (
                <th key={chain} className="py-2.5 px-3 text-right min-w-[100px]">
                  {chain}
                </th>
              ))}
              <th className="py-2.5 px-3 text-right min-w-[100px] bg-slate-100/50">
                Price Gap
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matrixData.map(row => (
              <tr key={row.name} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2 px-3 font-medium text-slate-900 sticky left-0 bg-white shadow-xs">
                  <div className="truncate max-w-[240px]" title={row.name}>
                    {row.name}
                  </div>
                  <div className="text-[10px] text-slate-400">{row.category}</div>
                </td>
                {targetRetailers.map(chain => {
                  const data = row.prices[chain];
                  const price = data?.price;
                  const isMin = price !== undefined && price === row.min;

                  return (
                    <td
                      key={chain}
                      className={`py-2 px-3 text-right font-mono tabular-nums text-xs ${
                        isMin
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      {price !== undefined ? (
                        <div>
                          <span>${price.toFixed(2)}</span>
                          {data?.sale && (
                            <span className="block text-[10px] text-emerald-700 font-semibold">
                              Deal
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="py-2 px-3 text-right bg-slate-50/40 font-mono tabular-nums">
                  {row.gap > 0 ? (
                    <div>
                      <span className="font-semibold text-slate-800">
                        +${row.gap.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-amber-700 font-medium">
                        ({row.pctGap}%)
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
