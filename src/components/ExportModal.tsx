import React, { useState } from 'react';
import { GroceryItem } from '../types/grocery';
import { exportToExcel, exportToCSV, generateCSV } from '../services/excelExporter';
import { X, Download, FileSpreadsheet, FileText, Copy, Check, ExternalLink } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GroceryItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, items }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyTSV = () => {
    const csvContent = generateCSV(items);
    // Replace comma with tab for clean clipboard paste into spreadsheet apps
    const tsvContent = csvContent
      .split('\r\n')
      .map(line => {
        // Simple unquote & tab join
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        return line.split(',').map(s => s.replace(/^"|"$/g, '')).join('\t');
      })
      .join('\n');

    navigator.clipboard.writeText(tsvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Export Canadian Grocery Spreadsheet
              </h3>
              <p className="text-xs text-slate-500">
                {items.length} food price records ready for Excel, Google Sheets, or CSV analysis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Format 1: Multi-tab Excel .xlsx */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <span>Excel Workbook (.xlsx)</span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Includes 4 worksheets: Master Price List, Cross-Store Matrix, Category Rankings, and Flyer Deals.
              </p>
            </div>
            <button
              onClick={() => {
                exportToExcel(items, 'Canadian_Grocery_Prices_All_Chains.xlsx');
                onClose();
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .xlsx</span>
            </button>
          </div>

          {/* Format 2: Standard CSV */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-slate-900 text-sm">
                Comma-Separated Values (.csv)
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Universal RFC 4180 format with UTF-8 BOM encoding for seamless import into Excel, R, or Python.
              </p>
            </div>
            <button
              onClick={() => {
                exportToCSV(items, 'Canadian_Grocery_Prices_All_Chains.csv');
                onClose();
              }}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Download .csv</span>
            </button>
          </div>

          {/* Format 3: Copy to Clipboard */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-slate-900 text-sm">
                Direct Clipboard Copy (TSV)
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Copy formatted table rows to clipboard and paste immediately (Ctrl+V) into an open Google Sheet or Excel workbook.
              </p>
            </div>
            <button
              onClick={handleCopyTSV}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Table'}</span>
            </button>
          </div>

          {/* Direct Static File Link */}
          <div className="pt-2 text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
            <span>Also saved locally to disk as:</span>
            <div className="flex gap-2 font-mono text-[11px]">
              <a
                href="/canadian_grocery_prices_master.xlsx"
                download="canadian_grocery_prices_master.xlsx"
                className="text-emerald-700 hover:underline flex items-center gap-0.5"
              >
                <span>master.xlsx</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-300">|</span>
              <a
                href="/canadian_grocery_prices_master.csv"
                download="canadian_grocery_prices_master.csv"
                className="text-emerald-700 hover:underline flex items-center gap-0.5"
              >
                <span>master.csv</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
