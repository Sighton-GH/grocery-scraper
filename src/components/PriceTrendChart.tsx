import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { getHistoricalDataForItem, getAllHistoricalItems } from '../data/historicalPrices';
import { TARGET_RETAILERS } from '../data/regions';
import { TrendingUp, Calendar, Store, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface PriceTrendChartProps {
  initialItemName?: string;
}

const STORE_COLORS: Record<string, { color: string; label: string }> = {
  'Save-On': { color: '#15803D', label: 'Save-On' },
  'No Frills': { color: '#CA8A04', label: 'No Frills' },
  'Walmart': { color: '#0284C7', label: 'Walmart' },
  'T&T': { color: '#DC2626', label: 'T&T' },
  'Loblaws': { color: '#7C3AED', label: 'Loblaws' },
  'Metro': { color: '#E11D48', label: 'Metro' },
  'Food Basics': { color: '#16A34A', label: 'Food Basics' },
  'Sobeys': { color: '#0D9488', label: 'Sobeys' },
  'FreshCo': { color: '#84CC16', label: 'FreshCo' },
  'Costco': { color: '#2563EB', label: 'Costco' },
  'averagePrice': { color: '#64748B', label: 'Market Avg' },
};

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  initialItemName = 'Gay Lea / Salted Butter 454g',
}) => {
  const allItems = useMemo(() => getAllHistoricalItems(), []);
  const [selectedItem, setSelectedItem] = useState<string>(initialItemName);
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m'>('12m');

  const [activeStores, setActiveStores] = useState<Record<string, boolean>>({
    'Save-On': true,
    'No Frills': true,
    'Walmart': true,
    'T&T': true,
    'Loblaws': true,
    'Metro': true,
    'Food Basics': true,
    'Sobeys': true,
    'FreshCo': true,
    'Costco': true,
    'averagePrice': true,
  });

  const record = useMemo(() => {
    return getHistoricalDataForItem(selectedItem);
  }, [selectedItem]);

  const filteredHistory = useMemo(() => {
    if (!record) return [];
    if (timeRange === '3m') return record.history.slice(-4);
    if (timeRange === '6m') return record.history.slice(-7);
    return record.history;
  }, [record, timeRange]);

  const toggleStore = (storeKey: string) => {
    setActiveStores(prev => ({
      ...prev,
      [storeKey]: !prev[storeKey],
    }));
  };

  if (!record) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        Historical trend data not found.
      </div>
    );
  }

  const startPoint = filteredHistory[0]?.averagePrice || 0;
  const currentPoint = filteredHistory[filteredHistory.length - 1]?.averagePrice || 0;
  const periodDiff = Math.round((currentPoint - startPoint) * 100) / 100;
  const periodPct = startPoint > 0 ? Math.round(((currentPoint - startPoint) / startPoint) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              12-Month Real Price Trajectory
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {record.itemName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>Department: {record.category}</span>
              <span aria-hidden="true">·</span>
              <span>Benchmark Package: {record.size}</span>
            </div>
          </div>

          {/* Product Selector Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Select Grocery Staple
              </label>
              <select
                value={selectedItem}
                onChange={e => setSelectedItem(e.target.value)}
                className="text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-xs max-w-xs"
              >
                {allItems.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Time Horizon Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Time Horizon
              </label>
              <div className="flex items-center p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTimeRange('3m')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    timeRange === '3m'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  3 Months
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('6m')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    timeRange === '6m'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  6 Months
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('12m')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    timeRange === '12m'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1 Year
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Quantitative Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div>
            <div className="text-xs text-slate-500 font-medium">Market Change ({timeRange})</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-xl font-bold font-mono tabular-nums ${periodPct >= 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {periodPct >= 0 ? `+${periodPct}%` : `${periodPct}%`}
              </span>
              {periodPct >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {periodDiff >= 0 ? `+$${periodDiff.toFixed(2)}` : `-$${Math.abs(periodDiff).toFixed(2)}`} CAD avg shift
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 font-medium">Current Market Average</div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              ${currentPoint.toFixed(2)} CAD
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Across 5 tracked retailers</div>
          </div>

          <div>
            <div className="text-xs text-slate-500 font-medium">Historical Low Deal</div>
            <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
              ${record.lowestPrice.toFixed(2)} CAD
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              At <strong className="font-semibold text-slate-700">{record.lowestStore}</strong>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 font-medium">Peak Recorded Price</div>
            <div className="text-xl font-bold text-slate-800 font-mono tabular-nums mt-0.5">
              ${record.highestPrice.toFixed(2)} CAD
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              At <strong className="font-semibold text-slate-700">{record.highestStore}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        {/* Store Visibility Toggle Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Store className="w-3.5 h-3.5" />
            Tracked Retailers:
          </span>
          {Object.entries(STORE_COLORS).map(([key, config]) => {
            const isActive = activeStores[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleStore(key)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-slate-50 border-slate-300 text-slate-900 shadow-2xs'
                    : 'bg-white border-dashed border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: isActive ? config.color : '#CBD5E1' }}
                ></span>
                <span className={isActive ? 'font-semibold' : ''}>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Recharts Canvas */}
        <div className="h-[400px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredHistory}
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={val => `$${val}`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-slate-900/95 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-800 min-w-[200px] backdrop-blur-xs font-sans">
                      <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
                        <span>{label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Snapshot</span>
                      </div>
                      <div className="space-y-1">
                        {payload.map((entry: any) => {
                          const storeLabel = STORE_COLORS[entry.dataKey]?.label || entry.name;
                          const isAvg = entry.dataKey === 'averagePrice';
                          return (
                            <div
                              key={entry.dataKey}
                              className={`flex items-center justify-between gap-3 ${
                                isAvg ? 'pt-1 mt-1 border-t border-slate-800 font-semibold text-emerald-400' : 'text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: entry.color }}
                                ></span>
                                <span className="truncate">{storeLabel}:</span>
                              </div>
                              <span className="font-mono tabular-nums font-semibold text-white">
                                ${Number(entry.value).toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                formatter={(value) => {
                  return <span className="text-xs text-slate-600 font-medium">{STORE_COLORS[value]?.label || value}</span>;
                }}
              />

              {Object.entries(STORE_COLORS).map(([storeKey, config]) => {
                if (!activeStores[storeKey]) return null;
                const isAvg = storeKey === 'averagePrice';

                return (
                  <Line
                    key={storeKey}
                    type="monotone"
                    dataKey={storeKey}
                    name={storeKey}
                    stroke={config.color}
                    strokeWidth={isAvg ? 2.5 : 2}
                    strokeDasharray={isAvg ? '4 4' : undefined}
                    dot={{ r: isAvg ? 3 : 2.5, strokeWidth: 1, fill: config.color }}
                    activeDot={{ r: 5, strokeWidth: 1 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            Historical trajectory tracks genuine flyer snapshots for Save-On, No Frills, Walmart, T&T, and Loblaws across major metropolitan markets.
          </p>
        </div>
      </div>
    </div>
  );
};
