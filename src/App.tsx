import React, { useState, useEffect } from 'react';
import { GroceryItem } from './types/grocery';
import { loadRealScrapedDataset } from './data/groceryCatalog';
import { TopNav, ActiveTab } from './components/TopNav';
import { StatsOverview } from './components/StatsOverview';
import { GroceryTable } from './components/GroceryTable';
import { PriceMatrix } from './components/PriceMatrix';
import { BasketCalculator } from './components/BasketCalculator';
import { PriceTrendChart } from './components/PriceTrendChart';
import { ScraperConsole } from './components/ScraperConsole';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [items, setItems] = useState<GroceryItem[]>(() => {
    return loadRealScrapedDataset();
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('table');
  const [selectedTrendItem, setSelectedTrendItem] = useState<string>('Salted Butter Block');
  const [isScraping, setIsScraping] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [basketItemIds, setBasketItemIds] = useState<Set<string>>(new Set());

  const handleAddToBasket = (item: GroceryItem) => {
    setBasketItemIds(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  };

  const handleRemoveFromBasket = (itemId: string) => {
    setBasketItemIds(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleClearBasket = () => {
    setBasketItemIds(new Set());
  };

  const handleQuickScrape = () => {
    setActiveTab('scraper');
  };

  const handleViewTrend = (itemName: string) => {
    setSelectedTrendItem(itemName);
    setActiveTab('trends');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickScrape={handleQuickScrape}
        isScraping={isScraping}
        itemCount={items.length}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Stats Bar */}
        <StatsOverview
          items={items}
          onTriggerScrape={() => setActiveTab('scraper')}
          isScraping={isScraping}
        />

        {/* Tab Views */}
        {activeTab === 'table' && (
          <GroceryTable
            items={items}
            onAddToBasket={handleAddToBasket}
            basketItemIds={basketItemIds}
            onViewTrend={handleViewTrend}
          />
        )}

        {activeTab === 'matrix' && (
          <PriceMatrix items={items} />
        )}

        {activeTab === 'basket' && (
          <BasketCalculator
            items={items}
            basketItemIds={basketItemIds}
            onRemoveFromBasket={handleRemoveFromBasket}
            onClearBasket={handleClearBasket}
          />
        )}

        {activeTab === 'trends' && (
          <PriceTrendChart initialItemName={selectedTrendItem} />
        )}

        {activeTab === 'scraper' && (
          <ScraperConsole
            currentItems={items}
            onItemsUpdated={newItems => setItems(newItems)}
            isScraping={isScraping}
            setIsScraping={setIsScraping}
          />
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        items={items}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>CanPrice Canadian Food Price Scraper</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Covering Loblaw, Metro, Empire, Walmart, and Costco banners</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExportOpen(true)}
              className="text-emerald-700 hover:underline font-medium"
            >
              Export Spreadsheet
            </button>
            <span aria-hidden="true">·</span>
            <a
              href="/canadian_grocery_prices_master.xlsx"
              download="canadian_grocery_prices_master.xlsx"
              className="text-slate-600 hover:text-slate-900"
            >
              Download Master .xlsx
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="/canadian_grocery_prices_master.csv"
              download="canadian_grocery_prices_master.csv"
              className="text-slate-600 hover:text-slate-900"
            >
              Download Master .csv
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
