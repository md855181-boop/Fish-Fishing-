import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Award,
  Info,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Activity,
  Layers,
} from 'lucide-react';
import { DailyImpressionRecord, ImpressionCounts } from '../types';
import { resetHistoricalTrends, saveHistory } from '../utils/historyStorage';
import { sounds } from '../utils/audio';

interface HistoricalTrendsChartProps {
  history: DailyImpressionRecord[];
  theme: 'ocean' | 'sunset';
  onRefreshHistory: () => void;
  onToast: (msg: string) => void;
  todayImpressions: ImpressionCounts;
}

export const HistoricalTrendsChart: React.FC<HistoricalTrendsChartProps> = ({
  history,
  theme,
  onRefreshHistory,
  onToast,
  todayImpressions,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return history.length > 0 ? history[history.length - 1].date : '';
  });
  const [viewMode, setViewMode] = useState<'totals' | 'breakdown'>('totals');

  // Find max total to scale the chart bars
  const maxTotal = useMemo(() => {
    const max = Math.max(...history.map((d) => d.total), 1);
    // Add small headroom for labels
    return Math.ceil(max * 1.15) || 10;
  }, [history]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalImpressions = history.reduce((acc, curr) => acc + curr.total, 0);
    const avgDaily = Math.round((totalImpressions / (history.length || 1)) * 10) / 10;
    
    let peak = history[0] || { total: 0, dayLabel: '-', date: '' };
    for (const item of history) {
      if (item.total > peak.total) {
        peak = item;
      }
    }

    return { totalImpressions, avgDaily, peak };
  }, [history]);

  // Active selected record
  const selectedRecord = useMemo(() => {
    return history.find((d) => d.date === selectedDate) || history[history.length - 1];
  }, [history, selectedDate]);

  // Handle resetting history to fresh 7-day seeded dataset
  const handleResetHistory = () => {
    sounds.playReset();
    resetHistoricalTrends(todayImpressions);
    onRefreshHistory();
    onToast('Historical 7-day data reseeded to baseline');
  };

  // Add 3 test impressions to selected day
  const handleSimulateImpression = (dateToAdjust: string) => {
    sounds.playCoinReward();
    const updated = history.map((item) => {
      if (item.date === dateToAdjust) {
        const added = 3;
        const newTotal = item.total + added;
        return {
          ...item,
          interstitial: item.interstitial + 2,
          rewardVideo: item.rewardVideo + 1,
          total: newTotal,
        };
      }
      return item;
    });
    saveHistory(updated);
    onRefreshHistory();
    onToast(`Added +3 test impressions to ${selectedRecord?.dayLabel || 'selected day'}`);
  };

  return (
    <div className="space-y-3.5">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        {/* 7-Day Total */}
        <div className="bg-black/25 rounded-xl p-2.5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">7D Total</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black font-mono text-white leading-tight">
              {stats.totalImpressions}
            </span>
            <span className="text-[10px] text-white/50">ads</span>
          </div>
          <span className="text-[9px] text-emerald-300 font-medium mt-0.5 flex items-center gap-0.5">
            <TrendingUp className="w-2.5 h-2.5" />
            +14% vs avg
          </span>
        </div>

        {/* Daily Average */}
        <div className="bg-black/25 rounded-xl p-2.5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Daily Avg</span>
            <BarChart3 className={`w-3.5 h-3.5 ${theme === 'sunset' ? 'text-amber-400' : 'text-cyan-400'}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black font-mono text-white leading-tight">
              {stats.avgDaily}
            </span>
            <span className="text-[10px] text-white/50">/day</span>
          </div>
          <span className="text-[9px] text-white/60 font-medium mt-0.5">
            Normalized rate
          </span>
        </div>

        {/* Peak Day */}
        <div className="bg-black/25 rounded-xl p-2.5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/60 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Peak Day</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black font-mono text-amber-300 leading-tight">
              {stats.peak?.total || 0}
            </span>
            <span className="text-[10px] text-white/50">{stats.peak?.dayLabel}</span>
          </div>
          <span className="text-[9px] text-amber-200/80 font-medium mt-0.5 truncate">
            {stats.peak?.fullDateLabel || 'Highest volume'}
          </span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="bg-black/30 rounded-xl p-3 border border-white/10 relative">
        {/* Controls Bar: Mode Toggle + Reset Data */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/10 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setViewMode('totals');
                }}
                className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                  viewMode === 'totals'
                    ? theme === 'sunset'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Totals
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setViewMode('breakdown');
                }}
                className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'breakdown'
                    ? theme === 'sunset'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Layers className="w-2.5 h-2.5" />
                Format Stack
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-white/60">
            <button
              type="button"
              onClick={handleResetHistory}
              className="text-[10px] text-white/60 hover:text-white hover:underline flex items-center gap-1 transition cursor-pointer"
              title="Reset 7-day data to default test baseline"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Reset
            </button>
          </div>
        </div>

        {/* The 7-Day Bar Chart */}
        <div className="h-40 pt-4 pb-1 relative flex items-end justify-between gap-1.5 px-1 border-b border-white/15">
          {/* Subtle Background Target Gridlines */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-2 text-[9px] font-mono text-white/20">
            <div className="border-b border-white/10 border-dashed w-full flex justify-end pr-1">
              <span>{maxTotal}</span>
            </div>
            <div className="border-b border-white/5 border-dashed w-full flex justify-end pr-1">
              <span>{Math.round(maxTotal / 2)}</span>
            </div>
            <div className="w-full flex justify-end pr-1">
              <span>0</span>
            </div>
          </div>

          {/* 7 Bars */}
          {history.map((record) => {
            const isSelected = record.date === (selectedRecord?.date || '');
            const isPeak = record.date === stats.peak?.date && record.total > 0;
            const heightPercent = Math.max(8, Math.round((record.total / maxTotal) * 100));

            // Breakdown proportions
            const total = record.total || 1;
            const interPercent = Math.round((record.interstitial / total) * 100);
            const rewardPercent = Math.round((record.rewardVideo / total) * 100);
            const otherPercent = Math.max(0, 100 - interPercent - rewardPercent);

            return (
              <div
                key={record.date}
                onClick={() => {
                  sounds.playClick();
                  setSelectedDate(record.date);
                }}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative z-10"
              >
                {/* Count badge floating above bar */}
                <span
                  className={`text-[10px] font-mono font-bold transition-all mb-1 ${
                    isSelected
                      ? 'text-white scale-110'
                      : 'text-white/70 group-hover:text-white'
                  }`}
                >
                  {record.total}
                </span>

                {/* Bar Graphic */}
                <div
                  className={`w-full max-w-[34px] rounded-t-lg transition-all duration-300 relative overflow-hidden flex flex-col justify-end ${
                    isSelected
                      ? 'ring-2 ring-white shadow-lg'
                      : 'hover:brightness-110 active:scale-95'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                >
                  {viewMode === 'totals' ? (
                    // Solid / Gradient Bar
                    <div
                      className={`w-full h-full rounded-t-lg ${
                        record.isToday
                          ? theme === 'sunset'
                            ? 'bg-gradient-to-t from-orange-600 via-amber-500 to-amber-300 shadow-md shadow-orange-500/40'
                            : 'bg-gradient-to-t from-blue-600 via-cyan-500 to-teal-300 shadow-md shadow-cyan-500/40'
                          : isPeak
                          ? theme === 'sunset'
                            ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                            : 'bg-gradient-to-t from-indigo-600 to-cyan-400'
                          : theme === 'sunset'
                          ? 'bg-gradient-to-t from-slate-700 to-amber-600/70'
                          : 'bg-gradient-to-t from-slate-700 to-blue-500/70'
                      }`}
                    >
                      {/* Top highlight shine */}
                      <div className="w-full h-1 bg-white/40 rounded-t-lg" />
                    </div>
                  ) : (
                    // Stacked Formats View: Interstitial (blue/amber), Reward (purple/orange), Others (emerald)
                    <div className="w-full h-full flex flex-col justify-end">
                      {otherPercent > 0 && (
                        <div
                          style={{ height: `${otherPercent}%` }}
                          className="w-full bg-emerald-500/80"
                          title={`Auto/Other: ${record.total - record.interstitial - record.rewardVideo}`}
                        />
                      )}
                      {rewardPercent > 0 && (
                        <div
                          style={{ height: `${rewardPercent}%` }}
                          className="w-full bg-amber-400"
                          title={`Reward: ${record.rewardVideo}`}
                        />
                      )}
                      <div
                        style={{ height: `${interPercent}%` }}
                        className={`w-full ${theme === 'sunset' ? 'bg-orange-600' : 'bg-blue-500'}`}
                        title={`Interstitial: ${record.interstitial}`}
                      />
                    </div>
                  )}

                  {/* Peak Star Indicator */}
                  {isPeak && (
                    <div className="absolute top-0.5 inset-x-0 flex justify-center pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping" />
                    </div>
                  )}
                </div>

                {/* Day of Week Label */}
                <div className="mt-2 flex flex-col items-center">
                  <span
                    className={`text-[10px] font-semibold transition-colors leading-none ${
                      record.isToday
                        ? theme === 'sunset'
                          ? 'text-amber-300 font-bold'
                          : 'text-cyan-300 font-bold'
                        : isSelected
                        ? 'text-white'
                        : 'text-white/60 group-hover:text-white/90'
                    }`}
                  >
                    {record.dayLabel}
                  </span>
                  {record.isToday && (
                    <span
                      className={`text-[8px] font-mono font-bold uppercase tracking-tighter px-1 rounded-sm mt-0.5 ${
                        theme === 'sunset'
                          ? 'bg-amber-500/30 text-amber-200'
                          : 'bg-cyan-500/30 text-cyan-200'
                      }`}
                    >
                      LIVE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend for Stacked Mode */}
        {viewMode === 'breakdown' && (
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-center gap-3 text-[10px] text-white/70">
            <span className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-xs ${theme === 'sunset' ? 'bg-orange-600' : 'bg-blue-500'}`} />
              Interstitial
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-400" />
              Rewarded
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/80" />
              Other/Auto
            </span>
          </div>
        )}
      </div>

      {/* Selected Day Deep Dive Panel */}
      {selectedRecord && (
        <div className="bg-black/35 rounded-xl p-3 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  selectedRecord.isToday
                    ? theme === 'sunset'
                      ? 'bg-amber-500 text-slate-950 font-mono'
                      : 'bg-cyan-500 text-slate-950 font-mono'
                    : 'bg-white/15 text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  {selectedRecord.isToday ? 'Today (Live)' : selectedRecord.dayLabel}
                  <span className="text-[11px] font-normal text-white/60">
                    • {selectedRecord.fullDateLabel} ({selectedRecord.date})
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-black text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
                {selectedRecord.total} Total Ads
              </span>
            </div>
          </div>

          {/* Breakdown Chips */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
            <div className="bg-white/5 p-1.5 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-white/60">Interstitial:</span>
              <span className="font-mono font-bold text-white">{selectedRecord.interstitial}</span>
            </div>
            <div className="bg-white/5 p-1.5 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-white/60">Rewarded:</span>
              <span className="font-mono font-bold text-white">{selectedRecord.rewardVideo}</span>
            </div>
            <div className="bg-white/5 p-1.5 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-white/60">Auto/Other:</span>
              <span className="font-mono font-bold text-emerald-300">
                {selectedRecord.auto || Math.max(0, selectedRecord.total - selectedRecord.interstitial - selectedRecord.rewardVideo)}
              </span>
            </div>
          </div>

          {/* Quick interactive test increment for developer testing */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-white/60">
            <span className="italic">
              {selectedRecord.isToday
                ? 'Counts sync live with ad actions & auto-impressions.'
                : 'Historical record archived in localStorage.'}
            </span>
            <button
              type="button"
              onClick={() => handleSimulateImpression(selectedRecord.date)}
              className={`${theme === 'sunset' ? 'text-amber-300 hover:text-amber-200' : 'text-cyan-300 hover:text-cyan-200'} font-semibold hover:underline flex items-center gap-0.5 cursor-pointer`}
              title="Add simulated impressions to this day for chart testing"
            >
              <span>+3 Test Ads</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
