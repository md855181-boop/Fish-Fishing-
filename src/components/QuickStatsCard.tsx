import React, { useState } from 'react';
import { Target, TrendingUp, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { ImpressionCounts } from '../types';
import { sounds } from '../utils/audio';

interface QuickStatsCardProps {
  impressions: ImpressionCounts;
  theme: 'ocean' | 'sunset';
}

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  impressions,
  theme,
}) => {
  const [dailyTarget, setDailyTarget] = useState<number>(() => {
    const saved = localStorage.getItem('fish_fishing_daily_target');
    return saved ? parseInt(saved, 10) || 20 : 20;
  });

  const handleSetTarget = (target: number) => {
    sounds.playClick();
    setDailyTarget(target);
    localStorage.setItem('fish_fishing_daily_target', target.toString());
  };

  const totalDelivered =
    impressions.interstitial +
    impressions.rewardVideo +
    (impressions.banner || 0) +
    (impressions.native || 0) +
    (impressions.appOpen || 0);
  const progressPercent = Math.min(100, Math.round((totalDelivered / dailyTarget) * 100));

  // Circular progress chart dimensions
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const isCompleted = totalDelivered >= dailyTarget;

  return (
    <section
      className={`rounded-2xl p-4 border shadow-sm text-white backdrop-blur-md transition-all duration-300 ${
        theme === 'sunset'
          ? 'bg-orange-950/40 border-orange-500/40 shadow-orange-950/30'
          : 'bg-white/10 border-white/15'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              theme === 'sunset'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide">Quick Stats</h3>
        </div>

        {/* Goal Preset Toggle Pills */}
        <div className="flex items-center gap-1 text-[10px] bg-black/30 p-1 rounded-lg border border-white/10">
          <span className="text-white/60 px-1 font-medium">Goal:</span>
          {[15, 20, 50].map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => handleSetTarget(goal)}
              className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                dailyTarget === goal
                  ? theme === 'sunset'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Layout: Circular Progress Chart & KPI Summary */}
      <div className="flex items-center gap-4">
        {/* Circular Progress Gauge */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 72 72">
            <defs>
              <linearGradient id="oceanStatsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <linearGradient id="sunsetStatsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>

            {/* Background Track */}
            <circle
              cx="36"
              cy="36"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-white/10"
            />

            {/* Animated Progress Ring */}
            <circle
              cx="36"
              cy="36"
              r={radius}
              stroke={theme === 'sunset' ? 'url(#sunsetStatsGrad)' : 'url(#oceanStatsGrad)'}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Centered Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span className="text-base font-black text-white font-mono leading-none">
              {progressPercent}%
            </span>
            <span className="text-[9px] text-white/70 tracking-tight mt-0.5 font-medium">
              Daily
            </span>
          </div>
        </div>

        {/* Right Info Column */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/80 font-medium">Daily Target</span>
            <span className="text-xs font-mono font-bold text-white">
              {totalDelivered} / {dailyTarget}
            </span>
          </div>

          {/* Status Badge */}
          <div className="pt-0.5">
            {isCompleted ? (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Target Achieved 🎉</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-white/80 text-[11px] font-medium border border-white/10">
                <Target className="w-3 h-3 text-cyan-300" />
                <span>{dailyTarget - totalDelivered} more to reach goal</span>
              </div>
            )}
          </div>

          {/* Quick Metrics Breakdown */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-white/70">
            <div className="bg-black/25 px-2 py-1 rounded-lg border border-white/5 truncate">
              <span className="block text-[9px] text-white/50">Interstitial</span>
              <span className="font-mono font-bold text-white text-xs">{impressions.interstitial}</span>
            </div>
            <div className="bg-black/25 px-2 py-1 rounded-lg border border-white/5 truncate">
              <span className="block text-[9px] text-white/50">Rewarded</span>
              <span className="font-mono font-bold text-white text-xs">{impressions.rewardVideo}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
