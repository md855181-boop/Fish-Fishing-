import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Trash2,
  Clock,
  Timer,
  Hourglass,
  Filter,
  Layers,
  Settings,
  Sparkles
} from 'lucide-react';
import { PreferredAdFormat } from '../types';
import { sounds } from '../utils/audio';
import { ImpressionSparkline } from './ImpressionSparkline';

interface AutoImpressionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRunning: boolean;
  onToggleRun: () => void;
  intervalSeconds: number;
  onChangeInterval: (sec: number) => void;
  targetCount: number;
  onChangeTarget: (cnt: number) => void;
  currentCycleCount: number;
  totalAutoCount: number;
  adTypes: { interstitial: boolean; reward: boolean };
  onToggleAdType: (type: 'interstitial' | 'reward') => void;
  logs: string[];
  impressionTimestamps: number[];
  onOpenExport?: () => void;
  onClearLogs: () => void;
  // Ad Scheduling props
  startDelaySeconds: number;
  onChangeStartDelay: (sec: number) => void;
  totalDurationSeconds: number;
  onChangeTotalDuration: (sec: number) => void;
  countdownRemaining: number | null;
  onCancelCountdown: () => void;
  durationRemaining: number | null;
  // Preferred Format filter & priority
  preferredAdFormat?: PreferredAdFormat;
  onOpenSetIds?: () => void;
  onChangePreferredFormat?: (format: PreferredAdFormat) => void;
}

export const AutoImpressionsModal: React.FC<AutoImpressionsModalProps> = ({
  isOpen,
  onClose,
  isRunning,
  onToggleRun,
  intervalSeconds,
  onChangeInterval,
  targetCount,
  onChangeTarget,
  currentCycleCount,
  totalAutoCount,
  adTypes,
  onToggleAdType,
  logs,
  impressionTimestamps,
  onOpenExport,
  onClearLogs,
  startDelaySeconds,
  onChangeStartDelay,
  totalDurationSeconds,
  onChangeTotalDuration,
  countdownRemaining,
  onCancelCountdown,
  durationRemaining,
  preferredAdFormat = 'all',
  onOpenSetIds,
  onChangePreferredFormat,
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((currentCycleCount / targetCount) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-b border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isRunning ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              <Activity className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base">Auto Impressions Engine</h3>
                {isRunning && (
                  <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    Live
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Automated cycle impression test generator</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Status Bar & Progress */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Batch Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Total Auto: {totalAutoCount}
                </span>
                <span className="text-white font-mono font-semibold">
                  {currentCycleCount} / {targetCount} ({progressPercent}%)
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>Status: <strong className={isRunning ? 'text-emerald-400' : 'text-slate-300'}>{isRunning ? 'Running scheduled cycles' : 'Paused / Idle'}</strong></span>
              <span>Cadence: every {intervalSeconds}s</span>
            </div>
          </div>

          {/* Configuration Controls */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-400" /> Cycle Parameters
            </h4>

            {/* Interval & Target */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <label className="text-[11px] text-slate-400 block mb-1">Interval (Seconds)</label>
                <div className="flex items-center gap-1.5">
                  {[2, 4, 8].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      disabled={isRunning}
                      onClick={() => {
                        sounds.playClick();
                        onChangeInterval(sec);
                      }}
                      className={`flex-1 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                        intervalSeconds === sec
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <label className="text-[11px] text-slate-400 block mb-1">Target Limit</label>
                <div className="flex items-center gap-1.5">
                  {[10, 25, 50].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      disabled={isRunning}
                      onClick={() => {
                        sounds.playClick();
                        onChangeTarget(cnt);
                      }}
                      className={`flex-1 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                        targetCount === cnt
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferred Ad Format Priority & Filter Indicator */}
            <div className="bg-gradient-to-br from-blue-950/60 to-slate-800/80 p-3 rounded-xl border border-blue-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  Preferred Ad Format Priority
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  preferredAdFormat !== 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {preferredAdFormat === 'banner' && 'Banner Priority'}
                  {preferredAdFormat === 'native' && 'Native Priority'}
                  {preferredAdFormat === 'app_open' && 'App Open Priority'}
                  {preferredAdFormat === 'interstitial' && 'Interstitial Priority'}
                  {preferredAdFormat === 'rewarded' && 'Rewarded Priority'}
                  {preferredAdFormat === 'all' && 'All Formats (Balanced)'}
                </span>
              </div>

              {/* Format Dropdown Selector */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={preferredAdFormat}
                    disabled={isRunning}
                    onChange={(e) => {
                      sounds.playClick();
                      onChangePreferredFormat?.(e.target.value as PreferredAdFormat);
                    }}
                    className={`w-full appearance-none px-3 py-1.5 bg-slate-900 border rounded-lg text-white font-medium text-xs focus:outline-none focus:border-cyan-400 pr-8 cursor-pointer transition ${
                      preferredAdFormat !== 'all' ? 'border-cyan-500/60 ring-1 ring-cyan-500/30' : 'border-slate-700'
                    } ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <option value="all">🌐 All Formats (Balanced Rotation)</option>
                    <option value="banner">🏷️ Banner Ad (Display / Smart 320x50)</option>
                    <option value="interstitial">📺 Interstitial Ad (Full Screen Rich)</option>
                    <option value="rewarded">🎁 Rewarded Video (Opt-In Video Reward)</option>
                    <option value="native">🧩 Native Advanced (Custom In-Feed Layout)</option>
                    <option value="app_open">🚀 App Open Ad (Cold Start / Splash)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-cyan-300">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                </div>

                {onOpenSetIds && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onOpenSetIds();
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition cursor-pointer"
                    title="Configure Ad Units in Set AdMob IDs"
                  >
                    <Settings className="w-3.5 h-3.5 text-blue-300" />
                  </button>
                )}
              </div>

              <div className="text-[11px] text-blue-200/80 bg-blue-900/20 px-2.5 py-1.5 rounded-lg border border-blue-500/20 flex items-center justify-between">
                <span>
                  {preferredAdFormat === 'all' && 'Cycles test Interstitial & Rewarded in balanced succession.'}
                  {preferredAdFormat === 'banner' && 'Cycles focus exclusively on delivering Banner Ad impressions.'}
                  {preferredAdFormat === 'interstitial' && 'Cycles focus exclusively on delivering Interstitial Ad impressions.'}
                  {preferredAdFormat === 'rewarded' && 'Cycles focus exclusively on delivering Rewarded Video impressions.'}
                  {preferredAdFormat === 'native' && 'Cycles focus exclusively on delivering Native Advanced impressions.'}
                  {preferredAdFormat === 'app_open' && 'Cycles focus exclusively on delivering App Open launch impressions.'}
                </span>
                {preferredAdFormat !== 'all' && (
                  <span className="text-[10px] text-cyan-300 font-mono font-semibold uppercase shrink-0 pl-1">
                    Filtered
                  </span>
                )}
              </div>
            </div>

            {/* Ad Format Checkbox Toggles (Active when in Balanced All Formats Mode) */}
            {preferredAdFormat === 'all' && (
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 space-y-2">
                <span className="text-[11px] text-slate-400 block">Active Formats in Rotation:</span>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adTypes.interstitial}
                      onChange={() => onToggleAdType('interstitial')}
                      disabled={isRunning}
                      className="rounded text-blue-600 focus:ring-0 bg-slate-700 border-slate-600"
                    />
                    <span>Interstitial Ads</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adTypes.reward}
                      onChange={() => onToggleAdType('reward')}
                      disabled={isRunning}
                      className="rounded text-blue-600 focus:ring-0 bg-slate-700 border-slate-600"
                    />
                    <span>Reward Video Ads</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Ad Scheduling Section */}
          <div className="space-y-3 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Ad Scheduling
              </h4>
              <span className="text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full font-mono">
                Timing Controls
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Start Delay */}
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <Hourglass className="w-3 h-3 text-amber-400" /> Start Delay
                  </span>
                  <span className="font-mono text-cyan-300 font-semibold">
                    {startDelaySeconds > 0 ? `${startDelaySeconds}s` : 'Immediate'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[0, 5, 10, 30].map((delay) => (
                    <button
                      key={delay}
                      type="button"
                      disabled={isRunning || countdownRemaining !== null}
                      onClick={() => {
                        sounds.playClick();
                        onChangeStartDelay(delay);
                      }}
                      className={`py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                        startDelaySeconds === delay
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      } ${isRunning || countdownRemaining !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {delay === 0 ? '0s' : `${delay}s`}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-slate-400 block">Pause before impressions begin</span>
              </div>

              {/* Total Duration */}
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <Timer className="w-3 h-3 text-indigo-400" /> Total Duration
                  </span>
                  <span className="font-mono text-indigo-300 font-semibold">
                    {totalDurationSeconds > 0 ? `${totalDurationSeconds}s` : 'Target'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { val: 0, label: 'Target' },
                    { val: 30, label: '30s' },
                    { val: 60, label: '1m' },
                    { val: 180, label: '3m' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      disabled={isRunning || countdownRemaining !== null}
                      onClick={() => {
                        sounds.playClick();
                        onChangeTotalDuration(item.val);
                      }}
                      className={`py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                        totalDurationSeconds === item.val
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      } ${isRunning || countdownRemaining !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-slate-400 block">Auto-stop duration threshold</span>
              </div>
            </div>

            {/* Live Scheduler Delay Countdown Badge */}
            {countdownRemaining !== null && (
              <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <Hourglass className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-200 font-semibold">
                    Scheduled delay: Starting loop in {countdownRemaining}s...
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onCancelCountdown}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Live Running Duration Countdown */}
            {isRunning && totalDurationSeconds > 0 && durationRemaining !== null && (
              <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl flex items-center justify-between text-xs text-indigo-200">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Scheduled Loop Time Remaining:</span>
                </div>
                <span className="font-mono font-bold text-white bg-indigo-900/80 px-2 py-0.5 rounded-md border border-indigo-700/60">
                  {Math.floor(durationRemaining / 60)}:{(durationRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="pt-1">
            {countdownRemaining !== null ? (
              <button
                type="button"
                onClick={onCancelCountdown}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
              >
                <X className="w-4 h-4" /> Cancel Scheduled Start ({countdownRemaining}s)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onToggleRun();
                }}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause Auto Impressions
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    {startDelaySeconds > 0
                      ? `Start Scheduled Loop (${startDelaySeconds}s delay)`
                      : 'Start Auto Impression Cycle'}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Mini Sparkline Chart: Last 60s Distribution */}
          <ImpressionSparkline timestamps={impressionTimestamps} isRunning={isRunning} />

          {/* Real-time Event Console Log */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">Simulated SDK Network Stream</span>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] text-slate-500">{logs.length} events</span>
                {logs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playReset();
                      onClearLogs();
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 hover:underline cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/20 transition"
                    title="Clear impression activity logs (preserves impression counts)"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                    <span>Clear Logs</span>
                  </button>
                )}
              </div>
            </div>
            <div
              ref={logContainerRef}
              className="bg-black/70 border border-slate-800 rounded-xl p-2.5 h-32 overflow-y-auto font-mono text-[11px] space-y-1 text-slate-300 select-text"
            >
              {logs.length === 0 ? (
                <div className="text-slate-600 italic text-center py-8">
                  Click 'Start' to begin streaming auto-impression requests...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="leading-tight flex items-start gap-1.5">
                    <span className="text-cyan-400 select-none">›</span>
                    <span className={log.includes('Recorded') ? 'text-emerald-300' : 'text-slate-300'}>
                      {log}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AdMob Policy Safety Loop Engaged</span>
          </div>
          <div className="flex items-center gap-3">
            {onOpenExport && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenExport();
                }}
                className="text-emerald-400 hover:text-emerald-300 font-medium underline cursor-pointer"
              >
                Export CSV
              </button>
            )}
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="text-blue-400 hover:underline cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
