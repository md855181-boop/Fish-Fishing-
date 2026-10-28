import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Copy, Check, BarChart2, ShieldCheck, Sparkles } from 'lucide-react';
import { AdMobConfig, ImpressionCounts, IpDetails, DailyImpressionRecord } from '../types';
import { generateAnalyticsCsv, downloadCsvFile } from '../utils/csvExporter';
import { sounds } from '../utils/audio';

interface ExportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdMobConfig;
  impressions: ImpressionCounts;
  ipDetails: IpDetails;
  logs: string[];
  dailyHistory?: DailyImpressionRecord[];
  onDownloaded: (filename: string) => void;
}

export const ExportCsvModal: React.FC<ExportCsvModalProps> = ({
  isOpen,
  onClose,
  config,
  impressions,
  ipDetails,
  logs,
  dailyHistory,
  onDownloaded,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'preview'>('summary');

  if (!isOpen) return null;

  const totalImpressions =
    impressions.interstitial +
    impressions.rewardVideo +
    (impressions.banner || 0) +
    (impressions.native || 0) +
    (impressions.appOpen || 0);
  const csvContent = generateAnalyticsCsv({ config, impressions, ipDetails, logs, dailyHistory });

  const handleDownload = () => {
    sounds.playSuccess();
    downloadCsvFile(csvContent);
    onDownloaded('fish_fishing_admob_analytics.csv');
  };

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard?.writeText(csvContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Export Analytics (CSV)</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  RFC 4180
                </span>
              </div>
              <p className="text-xs text-slate-400">Impression metrics, publisher config & event log audit</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 pt-2">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('summary');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'summary'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Analytical Summary
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('preview');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'preview'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw CSV Data Preview
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'summary' ? (
            <div className="space-y-4">
              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">Total</span>
                  <span className="text-lg font-black text-white font-mono">{totalImpressions}</span>
                  <span className="text-[9px] text-emerald-400 block">100% Fill</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">Interstitial</span>
                  <span className="text-lg font-black text-cyan-300 font-mono">{impressions.interstitial}</span>
                  <span className="text-[9px] text-slate-400 block">Manual/Auto</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">Reward Video</span>
                  <span className="text-lg font-black text-amber-300 font-mono">{impressions.rewardVideo}</span>
                  <span className="text-[9px] text-slate-400 block">Verified</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-emerald-500/30 text-center bg-emerald-950/20">
                  <span className="text-[10px] text-emerald-400 block font-medium">Auto Delivered</span>
                  <span className="text-lg font-black text-emerald-300 font-mono">{impressions.auto || 0}</span>
                  <span className="text-[9px] text-emerald-400/80 block">Counted</span>
                </div>
              </div>

              {/* Data payload details */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/60 space-y-2.5 text-xs">
                <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-400" /> Exported Dataset Inclusions:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="p-2 rounded-xl bg-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Publisher Account</span>
                    <span className="font-mono text-xs text-white">{config.accountId}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Application ID</span>
                    <span className="font-mono text-xs text-white truncate block">{config.appId}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Preferred Format</span>
                    <span className="font-mono text-xs text-cyan-300 font-semibold uppercase">{config.preferredAdFormat || 'all'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Diagnostics IP & Geo</span>
                    <span className="font-mono text-xs text-white">{ipDetails.ip} ({ipDetails.city})</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Event Stream Audit</span>
                    <span className="font-mono text-xs text-emerald-300">{logs.length} logged entries</span>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-[11px] text-emerald-200/90 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Compatible with Microsoft Excel, Google Sheets, Python Pandas, and Tableau.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>CSV File Output ({csvContent.length} bytes)</span>
                <button
                  onClick={handleCopy}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied to Clipboard' : 'Copy CSV Text'}
                </button>
              </div>
              <pre className="bg-black/80 border border-slate-800 rounded-2xl p-3 text-[11px] font-mono text-slate-300 max-h-64 overflow-y-auto select-all leading-relaxed whitespace-pre-wrap">
                {csvContent}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {isCopied ? 'Copied' : 'Copy CSV'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download CSV Report
          </button>
        </div>
      </div>
    </div>
  );
};
