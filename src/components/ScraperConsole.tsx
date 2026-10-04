import React, { useState } from 'react';
import { StoreChain, ScrapeJobStatus, GroceryItem } from '../types/grocery';
import { CANADIAN_REGIONS, TARGET_RETAILERS } from '../data/regions';
import { runRegionalLiveScrape } from '../services/scraperEngine';
import { RefreshCw, Globe, Play, CheckCircle2, AlertCircle, Download, Terminal, Plus, MapPin } from 'lucide-react';
import { exportToExcel, exportToCSV } from '../services/excelExporter';

interface ScraperConsoleProps {
  currentItems: GroceryItem[];
  onItemsUpdated: (newItems: GroceryItem[]) => void;
  isScraping: boolean;
  setIsScraping: (val: boolean) => void;
}

export const ScraperConsole: React.FC<ScraperConsoleProps> = ({
  currentItems,
  onItemsUpdated,
  isScraping,
  setIsScraping,
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('BC-VAN');
  const [customPostal, setCustomPostal] = useState('');
  const allChainNames = TARGET_RETAILERS.map(r => r.name);
  const [selectedChains, setSelectedChains] = useState<StoreChain[]>(allChainNames);
  const [customQuery, setCustomQuery] = useState('');

  const activeRegion = CANADIAN_REGIONS.find(r => r.id === selectedRegionId) || CANADIAN_REGIONS[0];
  const effectivePostal = customPostal.trim() ? customPostal.trim().toUpperCase().replace(/\s/g, '') : activeRegion.postalCode;

  const [jobStatus, setJobStatus] = useState<ScrapeJobStatus>({
    status: 'idle',
    currentStore: '',
    progressPercent: 0,
    itemsFound: currentItems.length,
    logs: [
      `[Ready] Genuine Scraper engine online with ${currentItems.length} real indexed Canadian grocery items.`,
      `[Ready] Active Region: ${activeRegion.name} (Postal: ${effectivePostal})`,
      `[Ready] Target Retailers (10): Save-On, No Frills, Walmart, T&T, Loblaws, Metro, Food Basics, Sobeys, FreshCo, Costco`,
    ],
  });

  const toggleChain = (chain: StoreChain) => {
    if (selectedChains.includes(chain)) {
      if (selectedChains.length > 1) {
        setSelectedChains(selectedChains.filter(c => c !== chain));
      }
    } else {
      setSelectedChains([...selectedChains, chain]);
    }
  };

  const handleRunLiveScrape = async () => {
    if (isScraping) return;
    setIsScraping(true);

    const keywords = customQuery.trim()
      ? customQuery.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    try {
      const updatedList = await runRegionalLiveScrape(
        {
          postalCode: effectivePostal,
          regionName: activeRegion.name,
          retailers: selectedChains,
          keywords,
          onProgress: status => {
            setJobStatus(status);
          },
        },
        currentItems
      );

      onItemsUpdated(updatedList);
    } catch (err: any) {
      setJobStatus(prev => ({
        ...prev,
        status: 'failed',
        logs: [...prev.logs, `[Error] Live scrape failure: ${err.message || 'Network error'}`],
      }));
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-700" />
              Live Regional Canadian Grocery Scraper
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live queries to genuine Canadian supermarket websites & stores for Save-On, No Frills, Walmart, T&T, Loblaws, Metro, Food Basics, Sobeys, FreshCo, and Costco.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToExcel(currentItems, 'Canadian_Grocery_Prices_Scraped.xlsx')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => exportToCSV(currentItems, 'Canadian_Grocery_Prices_Scraped.csv')}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Region & Postal Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Select Canadian Region
            </label>
            <select
              value={selectedRegionId}
              onChange={e => setSelectedRegionId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            >
              {CANADIAN_REGIONS.map(reg => (
                <option key={reg.id} value={reg.id}>
                  {reg.name} ({reg.postalCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Custom Canadian Postal Code (Optional)
            </label>
            <input
              type="text"
              placeholder={`e.g. ${activeRegion.postalCode}`}
              value={customPostal}
              onChange={e => setCustomPostal(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Custom Grocery Query (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. butter, eggs, chicken, rice"
              value={customQuery}
              onChange={e => setCustomQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Retailer Selector & Terminal Execution Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              The 10 Monitored Supermarket Chains
            </h3>

            <div className="space-y-2">
              {TARGET_RETAILERS.map(retailer => {
                const isSelected = selectedChains.includes(retailer.name);
                return (
                  <button
                    key={retailer.id}
                    type="button"
                    onClick={() => toggleChain(retailer.name)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between border ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: retailer.color }}
                        ></span>
                        <span>{retailer.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({retailer.id})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block pl-4 mt-0.5">
                        Brand: {retailer.primaryBrand}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700">
                      {isSelected ? 'Active' : 'Off'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleRunLiveScrape}
            disabled={isScraping}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isScraping ? 'animate-pulse' : ''}`} />
            <span>{isScraping ? 'Live Scraping...' : `Scrape ${activeRegion.name}`}</span>
          </button>
        </div>

        {/* Live Terminal Output */}
        <div className="lg:col-span-2 bg-slate-950 rounded-xl p-4 text-slate-200 font-mono text-xs flex flex-col h-[460px] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-semibold">Live Scraper Log Stream</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {jobStatus.itemsFound} items in registry
            </span>
          </div>

          {isScraping && (
            <div className="py-3 border-b border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Task: {jobStatus.currentStore}</span>
                <span>{jobStatus.progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 transition-all duration-150"
                  style={{ width: `${jobStatus.progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-3 space-y-1 text-[11px] leading-relaxed select-text">
            {jobStatus.logs.map((log, idx) => {
              const isErr = log.includes('[Error]');
              const isSuccess = log.includes('completed');
              return (
                <div
                  key={idx}
                  className={`${
                    isErr
                      ? 'text-rose-400'
                      : isSuccess
                      ? 'text-emerald-400 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isScraping ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                }`}
              ></span>
              {isScraping ? 'Scraping Live Flyers' : 'Standby'}
            </span>
            <span>Postal: {effectivePostal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
