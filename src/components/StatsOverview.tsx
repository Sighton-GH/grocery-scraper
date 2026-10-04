import React from 'react';
import { GroceryItem } from '../types/grocery';
import { Download, FileText, MapPin } from 'lucide-react';
import { exportToExcel, exportToCSV } from '../services/excelExporter';

interface StatsOverviewProps {
  items: GroceryItem[];
  onTriggerScrape: () => void;
  isScraping: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  items,
  onTriggerScrape,
  isScraping,
}) => {
  const storeCount = new Set(items.map(i => i.store)).size;
  const regionsCount = new Set(items.map(i => i.region)).size;
  const onSaleCount = items.filter(i => i.isOnSale).length;

  const totalSavings = Math.round(
    items.reduce((acc, i) => acc + (i.savings > 0 ? i.savings : 0), 0) * 100
  ) / 100;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-Time Regional Canadian Grocery Intelligence
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Canadian Food Price Scraper (10 Major National & Regional Chains)
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">Official Storefronts:</span>
            <span>Save-On (saveonfoods.com)</span>
            <span aria-hidden="true">·</span>
            <span>No Frills (nofrills.ca)</span>
            <span aria-hidden="true">·</span>
            <span>Walmart (walmart.ca)</span>
            <span aria-hidden="true">·</span>
            <span>T&T (tntsupermarket.com)</span>
            <span aria-hidden="true">·</span>
            <span>Loblaws (loblaws.ca)</span>
            <span aria-hidden="true">·</span>
            <span>Metro (metro.ca)</span>
            <span aria-hidden="true">·</span>
            <span>Food Basics (foodbasics.ca)</span>
            <span aria-hidden="true">·</span>
            <span>Sobeys (sobeys.com)</span>
            <span aria-hidden="true">·</span>
            <span>FreshCo (freshco.com)</span>
            <span aria-hidden="true">·</span>
            <span>Costco (costco.ca)</span>
          </div>
        </div>

        {/* Quick spreadsheet download actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToExcel(items, 'Canadian_Grocery_Prices_Master.xlsx')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            title="Download multi-tab Excel spreadsheet (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Download Master Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportToCSV(items, 'Canadian_Grocery_Prices_Master.csv')}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Download raw data CSV file"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">Scraped Price Points</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {items.length}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Genuine flyer & store rows</div>
        </div>

        <div>
          <div className="text-xs text-slate-500 font-medium">Regional Coverage</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {regionsCount} Regions
          </div>
          <div className="text-xs text-slate-400 mt-0.5">BC, GTA, AB, Ottawa</div>
        </div>

        <div>
          <div className="text-xs text-slate-500 font-medium">Active Flyer Deals</div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
            {onSaleCount} Items
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Weekly flyer promotions</div>
        </div>

        <div>
          <div className="text-xs text-slate-500 font-medium">Flyer Deal Savings</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            ${totalSavings.toFixed(2)} CAD
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Discounts captured</div>
        </div>
      </div>
    </div>
  );
};
