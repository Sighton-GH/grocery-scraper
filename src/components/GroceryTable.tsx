import React, { useState, useMemo } from 'react';
import { GroceryItem, StoreChain, GroceryCategory } from '../types/grocery';
import { CANADIAN_REGIONS, TARGET_RETAILERS } from '../data/regions';
import { Search, ArrowUpDown, ExternalLink, Filter, Plus, Check, TrendingUp, MapPin } from 'lucide-react';

interface GroceryTableProps {
  items: GroceryItem[];
  onAddToBasket: (item: GroceryItem) => void;
  basketItemIds: Set<string>;
  onViewTrend?: (itemName: string) => void;
}

type SortField = 'name' | 'store' | 'region' | 'category' | 'price' | 'unitPrice' | 'savings';
type SortDirection = 'asc' | 'desc';

export const GroceryTable: React.FC<GroceryTableProps> = ({
  items,
  onAddToBasket,
  basketItemIds,
  onViewTrend,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlySales, setOnlySales] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => set.add(i.category));
    return ['all', ...Array.from(set)];
  }, [items]);

  const regions = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => set.add(i.region));
    return ['all', ...Array.from(set)];
  }, [items]);

  const filteredAndSortedItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items
      .filter(item => {
        if (selectedRegion !== 'all' && item.region !== selectedRegion) return false;
        if (selectedStore !== 'all' && item.store !== selectedStore) return false;
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
        if (onlySales && !item.isOnSale) return false;
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.store.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.subcategory.toLowerCase().includes(q) ||
          item.storeLocation.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortField === 'store') cmp = a.store.localeCompare(b.store);
        else if (sortField === 'region') cmp = a.region.localeCompare(b.region);
        else if (sortField === 'category') cmp = a.category.localeCompare(b.category);
        else if (sortField === 'price') cmp = a.price - b.price;
        else if (sortField === 'unitPrice') cmp = a.unitPrice - b.unitPrice;
        else if (sortField === 'savings') cmp = b.savings - a.savings;

        return sortDirection === 'asc' ? cmp : -cmp;
      });
  }, [items, searchQuery, selectedRegion, selectedStore, selectedCategory, onlySales, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search groceries (e.g., butter, milk, eggs, chicken, rice)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
        </div>

        {/* Filter dropdowns and toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Region filter */}
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
          >
            <option value="all">All Canadian Regions</option>
            {regions.filter(r => r !== 'all').map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Store filter */}
          <select
            value={selectedStore}
            onChange={e => setSelectedStore(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
          >
            <option value="all">All 10 Supermarket Chains</option>
            {TARGET_RETAILERS.map(r => (
              <option key={r.name} value={r.name}>{r.name} ({r.id})</option>
            ))}
          </select>

          {/* Department filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">All Departments</option>
            {categories.filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sale items toggle button */}
          <button
            onClick={() => setOnlySales(prev => !prev)}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors border ${
              onlySales
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {onlySales ? '✓ Flyer Deals Only' : 'Show Deals Only'}
          </button>
        </div>
      </div>

      {/* Table Results Summary */}
      <div className="px-4 py-2 bg-slate-100/50 border-b border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Showing <strong className="font-mono text-slate-700">{filteredAndSortedItems.length}</strong> items
          {selectedRegion !== 'all' ? ` in ${selectedRegion}` : ' across all Canadian regions'}
          {selectedStore !== 'all' ? ` at ${selectedStore}` : ''}
          {selectedCategory !== 'all' ? ` (${selectedCategory})` : ''}
        </span>
        <span className="hidden sm:inline">Click table headers to sort</span>
      </div>

      {/* High-Density Data Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase">
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('store')}>
                <div className="flex items-center gap-1">
                  <span>Retailer</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('region')}>
                <div className="flex items-center gap-1">
                  <span>Region & Location</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Product Title & Brand</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort('price')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Price (CAD)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort('savings')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Flyer Story / Deal</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                  No grocery items match your search filters in this region. Try selecting another region or clearing filters.
                </td>
              </tr>
            ) : (
              filteredAndSortedItems.map(item => {
                const inBasket = basketItemIds.has(item.id);
                const isExpanded = expandedId === item.id;

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isExpanded ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* Retailer */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block text-xs sm:text-sm">
                          {item.store}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          ID: {item.retailerId}
                        </span>
                      </td>

                      {/* Region & Location */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="text-xs text-slate-800 font-medium block">
                          {item.region}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[200px]" title={item.storeLocation}>
                          {item.storeLocation} ({item.postalCode})
                        </span>
                      </td>

                      {/* Product Name & Brand */}
                      <td className="py-2.5 px-4 max-w-sm">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className="font-medium text-slate-900 hover:text-emerald-700 text-left line-clamp-1"
                            title="Click to view full flyer details and source URL"
                          >
                            {item.name}
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Brand: <strong className="text-slate-700 font-normal">{item.brand}</strong></span>
                          <span aria-hidden="true">·</span>
                          <span>Dept: {item.category}</span>
                        </div>
                      </td>

                      {/* Price CAD */}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                          ${item.price.toFixed(2)}
                        </span>
                        {item.isOnSale && item.regularPrice > item.price && (
                          <span className="block text-[11px] text-slate-400 line-through font-mono tabular-nums">
                            reg. ${item.regularPrice.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Flyer Story / Savings */}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        {item.isOnSale ? (
                          <div>
                            <span className="text-emerald-700 font-semibold font-mono tabular-nums text-xs block">
                              {item.savings > 0 ? `Save $${item.savings.toFixed(2)}` : 'On Sale'}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                              {item.saleDetails}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Regular Price</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {onViewTrend && (
                            <button
                              onClick={() => onViewTrend(item.name)}
                              className="p-1.5 rounded-md transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700"
                              title="View historical price trend"
                            >
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                            </button>
                          )}
                          <button
                            onClick={() => onAddToBasket(item)}
                            className={`p-1.5 rounded-md transition-colors ${
                              inBasket
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                            title={inBasket ? 'In Comparison Basket' : 'Add to Comparison Basket'}
                          >
                            {inBasket ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded details row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70 border-b border-slate-200">
                        <td colSpan={6} className="py-3 px-6 text-xs text-slate-600">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <span className="font-semibold text-slate-700 block">Item / Retailer ID:</span>
                              <span className="font-mono text-slate-600">{item.id} ({item.retailerId})</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-700 block">Store Location & Postal:</span>
                              <span>{item.storeLocation} ({item.postalCode})</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-700 block">Scraped Timestamp:</span>
                              <span className="font-mono">{new Date(item.scrapedAt).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-700 block">Flyer Item Source Link:</span>
                              <a
                                href={item.sourceUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-emerald-700 hover:underline flex items-center gap-1 mt-0.5 truncate font-mono text-[11px]"
                              >
                                <span className="truncate">{item.sourceUrl}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
