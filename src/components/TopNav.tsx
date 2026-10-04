import React from 'react';
import { Download, FileSpreadsheet, RefreshCw, ShoppingCart, TableProperties, BarChart3, TrendingUp } from 'lucide-react';

export type ActiveTab = 'table' | 'matrix' | 'basket' | 'trends' | 'scraper' | 'export';

interface TopNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onQuickScrape: () => void;
  isScraping: boolean;
  itemCount: number;
  onOpenExport: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onQuickScrape,
  isScraping,
  itemCount,
  onOpenExport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark in display style */}
          <div className="flex items-center gap-3">
            <a
              href="#home"
              onClick={(e) => { e.preventDefault(); setActiveTab('table'); }}
              className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              <span>CanPrice Canada</span>
            </a>
            <span className="text-xs text-slate-400 hidden sm:inline">|</span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              {itemCount} records indexed
            </span>
          </div>

          {/* Zone 2: 4-5 clean text navigation links */}
          <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'table'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TableProperties className="w-4 h-4" />
              <span>All Groceries</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'matrix'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Store Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('basket')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'basket'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Basket Compare</span>
            </button>

            <button
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'trends'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>Price Trends</span>
            </button>

            <button
              onClick={() => setActiveTab('scraper')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'scraper'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isScraping ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Live Scraper</span>
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExport}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Spreadsheet</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
