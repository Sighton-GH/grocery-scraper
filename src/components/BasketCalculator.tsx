import React, { useState, useMemo } from 'react';
import { GroceryItem, StoreChain } from '../types/grocery';
import { TARGET_RETAILERS } from '../data/regions';
import { ShoppingBag, Plus, Trash2, Trophy, Download, MapPin } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BasketCalculatorProps {
  items: GroceryItem[];
  basketItemIds: Set<string>;
  onRemoveFromBasket: (itemId: string) => void;
  onClearBasket: () => void;
}

export const BasketCalculator: React.FC<BasketCalculatorProps> = ({
  items,
  basketItemIds,
  onRemoveFromBasket,
  onClearBasket,
}) => {
  const regions = useMemo(() => {
    return Array.from(new Set(items.map(i => i.region)));
  }, [items]);

  const [selectedRegion, setSelectedRegion] = useState<string>(regions[0] || 'BC - Greater Vancouver');

  // Representative staples
  const defaultKeywords = ['butter', 'milk', 'eggs', 'bread', 'chicken', 'rice', 'banana', 'apple', 'coffee'];
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(defaultKeywords);

  const targetRetailers: StoreChain[] = [
    'Save-On', 'No Frills', 'Walmart', 'T&T', 'Loblaws',
    'Metro', 'Food Basics', 'Sobeys', 'FreshCo', 'Costco'
  ];

  const storeTotals = useMemo(() => {
    const scoped = items.filter(i => i.region === selectedRegion);

    return targetRetailers.map(chain => {
      const storeItems = scoped.filter(i => i.store === chain);
      let total = 0;
      let count = 0;

      for (const kw of selectedKeywords) {
        // Find best match for this keyword at this store
        const match = storeItems.find(i => i.name.toLowerCase().includes(kw));
        if (match) {
          total += match.price;
          count++;
        }
      }

      return {
        store: chain,
        total: Math.round(total * 100) / 100,
        itemCount: count,
        missingCount: selectedKeywords.length - count,
      };
    }).sort((a, b) => a.total - b.total);
  }, [items, selectedRegion, selectedKeywords]);

  const cheapest = storeTotals.find(s => s.total > 0);
  const mostExpensive = [...storeTotals].reverse().find(s => s.total > 0);
  const maxSavings = cheapest && mostExpensive
    ? Math.round((mostExpensive.total - cheapest.total) * 100) / 100
    : 0;

  const handleExportBasketExcel = () => {
    const rows = storeTotals.map((st, idx) => ({
      'Rank': `#${idx + 1}`,
      'Region': selectedRegion,
      'Retailer': st.store,
      'Basket Total (CAD $)': st.total,
      'Items Matched': st.itemCount,
      'Difference vs Cheapest ($)': Math.round((st.total - (cheapest?.total || 0)) * 100) / 100,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Basket Comparison');
    XLSX.writeFile(wb, `Canadian_Grocery_Basket_${selectedRegion.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Savings insight */}
      <div className="bg-emerald-900 text-white rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-emerald-400" />
              Regional Basket Price Comparison
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {cheapest ? `${cheapest.store} offers the Lowest Cost Basket in ${selectedRegion}` : 'Calculating Basket...'}
            </h2>
            <p className="text-emerald-100 text-xs mt-1">
              On this staple basket, you save{' '}
              <strong className="text-white underline font-mono tabular-nums">${maxSavings.toFixed(2)} CAD</strong> by shopping at {cheapest?.store} instead of {mostExpensive?.store}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="bg-emerald-800 text-white border border-emerald-700 text-xs rounded-lg px-3 py-2 font-medium focus:outline-hidden"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <button
              onClick={handleExportBasketExcel}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shrink-0 border border-emerald-500 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basket Staples */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              Basket Staples ({selectedKeywords.length})
            </h3>
            <span className="text-xs text-slate-400">{selectedRegion}</span>
          </div>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {selectedKeywords.map(kw => (
              <div
                key={kw}
                className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-800 transition-colors"
              >
                <span className="font-medium capitalize">{kw}</span>
                <span className="text-[11px] text-slate-400">Essential Staple</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Columns: 5 Retailer Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  5 Retailers Basket Leaderboard
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated against live local flyer prices for {selectedRegion}.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {storeTotals.map((item, idx) => {
                const isWinner = idx === 0 && item.total > 0;
                const diff = Math.round((item.total - (cheapest?.total || 0)) * 100) / 100;
                const pctDiff = cheapest?.total ? Math.round((diff / cheapest.total) * 100) : 0;

                return (
                  <div
                    key={item.store}
                    className={`p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors ${
                      isWinner ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs font-mono ${
                          isWinner
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{item.store}</span>
                          {isWinner && (
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                              Cheapest
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {item.itemCount} items matched in {selectedRegion}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                        ${item.total.toFixed(2)} CAD
                      </div>
                      <div className="text-xs font-mono">
                        {isWinner ? (
                          <span className="text-emerald-700 font-semibold">Lowest Total</span>
                        ) : (
                          <span className="text-amber-700 font-medium">
                            +${diff.toFixed(2)} (+{pctDiff}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
