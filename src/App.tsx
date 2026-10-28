/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Globe,
  Settings,
  RotateCcw,
  Layout,
  PlaySquare,
  Repeat,
  ArrowLeft,
  Volume2,
  VolumeX,
  Smartphone,
  Maximize2,
  Wifi,
  Battery,
  Edit3,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Coins,
  Sparkles,
  Info,
  FileSpreadsheet,
  Download,
  Sun,
  Palette,
  Waves,
  CalendarClock,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import fishMascotLogo from './assets/images/fish_fishing_logo_1793186002666.jpg';
import { AdMobConfig, ImpressionCounts, IpDetails, PreferredAdFormat, DailyImpressionRecord } from './types';
import { sounds } from './utils/audio';
import { fetchPublicIp, DEFAULT_IP_DETAILS } from './utils/ipDetector';
import { downloadCsvFile, generateAnalyticsCsv } from './utils/csvExporter';
import { get7DayHistory } from './utils/historyStorage';
import { SetAdMobModal } from './components/SetAdMobModal';
import { InterstitialAdModal } from './components/InterstitialAdModal';
import { RewardVideoModal } from './components/RewardVideoModal';
import { AutoImpressionsModal } from './components/AutoImpressionsModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { ExportCsvModal } from './components/ExportCsvModal';
import { QuickStatsCard } from './components/QuickStatsCard';
import { PingTestUtility } from './components/PingTestUtility';
import { HistoricalTrendsChart } from './components/HistoricalTrendsChart';


export default function App() {
  // --- Persistent State ---
  const [config, setConfig] = useState<AdMobConfig>(() => {
    const saved = localStorage.getItem('fish_fishing_admob_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          accountId: parsed.accountId || 'admob_acc_987654',
          appId: parsed.appId || 'ca-app-pub-1234567890~9876543210',
          interstitialUnitId: parsed.interstitialUnitId || 'ca-app-pub-3940256099942544/1033173712',
          rewardedUnitId: parsed.rewardedUnitId || 'ca-app-pub-3940256099942544/5224354917',
          bannerUnitId: parsed.bannerUnitId || 'ca-app-pub-3940256099942544/6300978111',
          nativeUnitId: parsed.nativeUnitId || 'ca-app-pub-3940256099942544/2247696110',
          appOpenUnitId: parsed.appOpenUnitId || 'ca-app-pub-3940256099942544/9257395921',
          preferredAdFormat: (parsed.preferredAdFormat as PreferredAdFormat) || 'all',
          isTestMode: parsed.isTestMode ?? true,
        };
      } catch {
        // fallback
      }
    }
    return {
      accountId: 'admob_acc_987654',
      appId: 'ca-app-pub-1234567890~9876543210',
      interstitialUnitId: 'ca-app-pub-3940256099942544/1033173712',
      rewardedUnitId: 'ca-app-pub-3940256099942544/5224354917',
      bannerUnitId: 'ca-app-pub-3940256099942544/6300978111',
      nativeUnitId: 'ca-app-pub-3940256099942544/2247696110',
      appOpenUnitId: 'ca-app-pub-3940256099942544/9257395921',
      preferredAdFormat: 'all',
      isTestMode: true,
    };
  });

  const [impressions, setImpressions] = useState<ImpressionCounts>(() => {
    const saved = localStorage.getItem('fish_fishing_impressions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          interstitial: typeof parsed.interstitial === 'number' ? parsed.interstitial : 5,
          rewardVideo: typeof parsed.rewardVideo === 'number' ? parsed.rewardVideo : 2,
          banner: typeof parsed.banner === 'number' ? parsed.banner : 0,
          native: typeof parsed.native === 'number' ? parsed.native : 0,
          appOpen: typeof parsed.appOpen === 'number' ? parsed.appOpen : 0,
          auto: typeof parsed.auto === 'number' ? parsed.auto : 0,
        };
      } catch {
        // fallback
      }
    }
    return {
      interstitial: 5,
      rewardVideo: 2,
      banner: 0,
      native: 0,
      appOpen: 0,
      auto: 0,
    };
  });

  const [ipDetails, setIpDetails] = useState<IpDetails>(() => {
    const saved = localStorage.getItem('fish_fishing_ip_details');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_IP_DETAILS;
  });

  // --- UI Modals & Views ---
  const [isAdMobModalOpen, setIsAdMobModalOpen] = useState(false);
  const [isInterstitialOpen, setIsInterstitialOpen] = useState(false);
  const [isRewardOpen, setIsRewardOpen] = useState(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isDeviceFrame, setIsDeviceFrame] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshingIp, setIsRefreshingIp] = useState(false);
  const [isEditingIp, setIsEditingIp] = useState(false);
  const [tempIp, setTempIp] = useState(ipDetails.ip);
  const [tempLocation, setTempLocation] = useState(`${ipDetails.city}, ${ipDetails.countryCode}`);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // --- Theme State ('ocean' = Deep Ocean Blue, 'sunset' = Sunset Orange High-Contrast) ---
  const [theme, setTheme] = useState<'ocean' | 'sunset'>(() => {
    const saved = localStorage.getItem('fish_fishing_theme');
    return saved === 'sunset' || saved === 'ocean' ? saved : 'ocean';
  });

  // --- Auto Impressions & Scheduling State ---
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [autoInterval, setAutoInterval] = useState(3);
  const [autoTarget, setAutoTarget] = useState(10);
  const [autoCycleCount, setAutoCycleCount] = useState(0);
  const [autoAdTypes, setAutoAdTypes] = useState({ interstitial: true, reward: true });
  const [startDelaySeconds, setStartDelaySeconds] = useState(0);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(0);
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const [durationRemaining, setDurationRemaining] = useState<number | null>(null);
  const [autoLogs, setAutoLogs] = useState<string[]>([
    'AdMob SDK initialized with Test Profile.',
    'Ready for manual or automated impression tests.',
  ]);

  // --- Daily Reset at Midnight State ---
  const [isDailyResetEnabled, setIsDailyResetEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('fish_fishing_daily_reset_enabled');
    return saved !== null ? saved === 'true' : true; // default enabled
  });

  const [lastResetted, setLastResetted] = useState<string>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem('fish_fishing_last_resetted');
    if (!saved) {
      localStorage.setItem('fish_fishing_last_resetted', today);
      return today;
    }
    return saved;
  });

  // --- Real-time Impression Timestamps for 60s Sparkline Distribution ---
  const [impressionTimestamps, setImpressionTimestamps] = useState<number[]>(() => {
    const now = Date.now();
    return [now - 48000, now - 35000, now - 22000, now - 10000];
  });

  // --- Impressions Tab State: Live Today vs 7-Day Historical Trends ---
  const [impressionsTab, setImpressionsTab] = useState<'live' | 'trends'>('live');
  const [dailyHistory, setDailyHistory] = useState<DailyImpressionRecord[]>(() =>
    get7DayHistory(impressions)
  );

  // Synchronize 7-day daily history whenever impressions updates
  useEffect(() => {
    setDailyHistory(get7DayHistory(impressions));
  }, [impressions]);

  const refreshDailyHistory = useCallback(() => {
    setDailyHistory(get7DayHistory(impressions));
  }, [impressions]);

  // Persist theme
  useEffect(() => {
    localStorage.setItem('fish_fishing_theme', theme);
  }, [theme]);

  // Persist daily reset toggle
  useEffect(() => {
    localStorage.setItem('fish_fishing_daily_reset_enabled', isDailyResetEnabled.toString());
  }, [isDailyResetEnabled]);

  const handleToggleTheme = () => {
    sounds.playClick();
    const nextTheme = theme === 'ocean' ? 'sunset' : 'ocean';
    setTheme(nextTheme);
    showToast(
      nextTheme === 'sunset'
        ? 'Sunset Orange (Outdoor High-Contrast Mode)'
        : 'Deep Ocean Blue Theme'
    );
    setAutoLogs((prev) => [
      ...prev.slice(-30),
      `[${new Date().toLocaleTimeString()}] Theme switched to ${nextTheme === 'sunset' ? 'Sunset Orange (High-Contrast Outdoor Mode)' : 'Deep Ocean Blue'}.`,
    ]);
  };

  // Persist config
  useEffect(() => {
    localStorage.setItem('fish_fishing_admob_config', JSON.stringify(config));
  }, [config]);

  // Persist impressions
  useEffect(() => {
    localStorage.setItem('fish_fishing_impressions', JSON.stringify(impressions));
  }, [impressions]);

  // Persist IP
  useEffect(() => {
    localStorage.setItem('fish_fishing_ip_details', JSON.stringify(ipDetails));
  }, [ipDetails]);

  // Sound sync
  useEffect(() => {
    sounds.soundEnabled = !isSoundMuted;
  }, [isSoundMuted]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2400);
  }, []);

  // Midnight Auto-Reset Check
  useEffect(() => {
    if (!isDailyResetEnabled) return;

    const checkMidnightReset = () => {
      const today = new Date().toISOString().slice(0, 10);
      const storedLastReset = localStorage.getItem('fish_fishing_last_resetted') || lastResetted;

      if (storedLastReset && storedLastReset !== today) {
        // Midnight has passed: Auto-clear impression counts
        setImpressions({
          interstitial: 0,
          rewardVideo: 0,
          auto: 0,
        });
        setAutoCycleCount(0);
        setImpressionTimestamps([]);
        setLastResetted(today);
        localStorage.setItem('fish_fishing_last_resetted', today);
        sounds.playReset();
        showToast(`Midnight Daily Reset: Impression counts reset for ${today}`);
        setAutoLogs((prev) => [
          ...prev.slice(-30),
          `[${new Date().toLocaleTimeString()}] Daily Reset: Midnight reached. Impression counts automatically cleared for ${today}.`,
        ]);
      }
    };

    checkMidnightReset();
    const interval = setInterval(checkMidnightReset, 20000); // Check every 20s
    return () => clearInterval(interval);
  }, [isDailyResetEnabled, lastResetted, showToast]);

  // --- Impressions Handler ---
  const handleRecordInterstitial = useCallback(() => {
    setImpressions((prev) => ({ ...prev, interstitial: prev.interstitial + 1 }));
    setImpressionTimestamps((prev) => [...prev.slice(-100), Date.now()]);
    setAutoLogs((prev) => [
      ...prev.slice(-30),
      `[${new Date().toLocaleTimeString()}] Interstitial impression recorded (+1) • Fill: 100%`,
    ]);
  }, []);

  const handleRecordReward = useCallback(() => {
    setImpressions((prev) => ({ ...prev, rewardVideo: prev.rewardVideo + 1 }));
    setImpressionTimestamps((prev) => [...prev.slice(-100), Date.now()]);
    setAutoLogs((prev) => [
      ...prev.slice(-30),
      `[${new Date().toLocaleTimeString()}] Rewarded Video verified & reward granted (+1)`,
    ]);
  }, []);

  const handleResetImpressions = () => {
    sounds.playReset();
    const today = new Date().toISOString().slice(0, 10);
    setImpressions({
      interstitial: 0,
      rewardVideo: 0,
      banner: 0,
      native: 0,
      appOpen: 0,
      auto: 0,
    });
    setAutoCycleCount(0);
    setImpressionTimestamps([]);
    setLastResetted(today);
    localStorage.setItem('fish_fishing_last_resetted', today);
    showToast('Impressions reset to 0 (including Auto)');
    setAutoLogs((prev) => [
      ...prev.slice(-30),
      `[${new Date().toLocaleTimeString()}] All impression counters reset to 0. (lastResetted: ${today})`,
    ]);
  };

  const handleRestorePromptDefaults = () => {
    sounds.playReset();
    setImpressions({
      interstitial: 5,
      rewardVideo: 2,
      banner: 0,
      native: 0,
      appOpen: 0,
      auto: 0,
    });
    showToast('Restored mockup defaults (Interstitial: 5, Reward: 2, Auto: 0)');
  };

  const handleClearLogs = () => {
    sounds.playReset();
    setAutoLogs([
      `[${new Date().toLocaleTimeString()}] Activity logs cleared by user. (Preserved: ${impressions.interstitial} Interstitial, ${impressions.rewardVideo} Reward, ${impressions.auto || 0} Auto)`,
    ]);
    showToast('Activity logs cleared');
  };

  // --- Ad Scheduling & Auto Run Controls ---
  const handleToggleAutoRun = () => {
    sounds.playClick();
    // If currently in a scheduled start countdown, cancel it
    if (countdownRemaining !== null) {
      setCountdownRemaining(null);
      showToast('Scheduled start countdown cancelled');
      setAutoLogs((prev) => [
        ...prev.slice(-30),
        `[${new Date().toLocaleTimeString()}] Scheduled countdown cancelled by user.`,
      ]);
      return;
    }

    // If currently running, pause loop
    if (isAutoRunning) {
      setIsAutoRunning(false);
      setDurationRemaining(null);
      showToast('Auto impressions paused');
      setAutoLogs((prev) => [
        ...prev.slice(-30),
        `[${new Date().toLocaleTimeString()}] Auto impressions testing loop paused.`,
      ]);
      return;
    }

    // Not running: check if a start delay is scheduled
    if (startDelaySeconds > 0) {
      setCountdownRemaining(startDelaySeconds);
      showToast(`Ad schedule active: starting in ${startDelaySeconds}s`);
      setAutoLogs((prev) => [
        ...prev.slice(-30),
        `[${new Date().toLocaleTimeString()}] Ad Scheduling: Countdown initialized (${startDelaySeconds}s start delay before loop).`,
      ]);
    } else {
      setIsAutoRunning(true);
      if (totalDurationSeconds > 0) {
        setDurationRemaining(totalDurationSeconds);
      }
      showToast('Auto impressions loop started');
      setAutoLogs((prev) => [
        ...prev.slice(-30),
        `[${new Date().toLocaleTimeString()}] Auto impressions loop activated (Immediate start${totalDurationSeconds > 0 ? `, scheduled duration: ${totalDurationSeconds}s` : ''}).`,
      ]);
    }
  };

  const handleCancelCountdown = () => {
    sounds.playClick();
    setCountdownRemaining(null);
    showToast('Scheduled start cancelled');
    setAutoLogs((prev) => [
      ...prev.slice(-30),
      `[${new Date().toLocaleTimeString()}] Scheduled countdown was cancelled.`,
    ]);
  };

  // Start Delay Countdown Effect
  useEffect(() => {
    if (countdownRemaining === null) return;

    if (countdownRemaining <= 1) {
      const timer = setTimeout(() => {
        setCountdownRemaining(null);
        setIsAutoRunning(true);
        if (totalDurationSeconds > 0) {
          setDurationRemaining(totalDurationSeconds);
        }
        sounds.playSuccess();
        showToast('Scheduled delay complete: Testing loop active!');
        setAutoLogs((prev) => [
          ...prev.slice(-30),
          `[${new Date().toLocaleTimeString()}] Start delay of ${startDelaySeconds}s elapsed. Testing loop is now ACTIVE.`,
        ]);
      }, 1000);
      return () => clearTimeout(timer);
    }

    const timer = setInterval(() => {
      setCountdownRemaining((prev) => (prev !== null && prev > 1 ? prev - 1 : 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownRemaining, startDelaySeconds, totalDurationSeconds, showToast]);

  // Total Duration Countdown Effect
  useEffect(() => {
    if (!isAutoRunning || totalDurationSeconds <= 0 || durationRemaining === null) return;

    if (durationRemaining <= 1) {
      const timer = setTimeout(() => {
        setIsAutoRunning(false);
        setDurationRemaining(null);
        sounds.playSuccess();
        showToast(`Scheduled duration (${totalDurationSeconds}s) completed!`);
        setAutoLogs((prev) => [
          ...prev.slice(-30),
          `[${new Date().toLocaleTimeString()}] Scheduled duration limit reached (${totalDurationSeconds}s elapsed). Testing loop stopped.`,
        ]);
      }, 1000);
      return () => clearTimeout(timer);
    }

    const timer = setInterval(() => {
      setDurationRemaining((prev) => (prev !== null && prev > 1 ? prev - 1 : 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRunning, totalDurationSeconds, durationRemaining, showToast]);

  // Preferred Ad Format Priority Handler
  const handleChangePreferredFormat = useCallback((format: PreferredAdFormat) => {
    sounds.playClick();
    setConfig((prev) => ({ ...prev, preferredAdFormat: format }));
    const formatLabels: Record<PreferredAdFormat, string> = {
      all: 'All Formats (Balanced Rotation)',
      banner: 'Banner Ads',
      interstitial: 'Interstitial Ads',
      rewarded: 'Rewarded Video Ads',
      native: 'Native Advanced Ads',
      app_open: 'App Open Ads',
    };
    showToast(`Prioritizing: ${formatLabels[format]}`);
    setAutoLogs((prev) => [
      ...prev.slice(-30),
      `[${new Date().toLocaleTimeString()}] Preferred Ad Format configured to "${formatLabels[format]}". Auto-impression cycles will focus on this format.`,
    ]);
  }, [showToast]);

  // --- Auto Impression Timer Loop ---
  useEffect(() => {
    if (!isAutoRunning) return;

    const timer = setInterval(() => {
      setAutoCycleCount((prevCount) => {
        if (prevCount >= autoTarget) {
          setIsAutoRunning(false);
          setDurationRemaining(null);
          sounds.playSuccess();
          showToast(`Completed target batch of ${autoTarget} auto impressions!`);
          return prevCount;
        }

        const nextCount = prevCount + 1;
        const preferred = config.preferredAdFormat || 'all';

        let formatDeliveredName = 'Interstitial';
        let unitIdSuffix = config.interstitialUnitId.slice(-10);

        if (preferred === 'banner') {
          formatDeliveredName = 'Banner Ad';
          unitIdSuffix = (config.bannerUnitId || '6300978111').slice(-10);
          setImpressions((prev) => ({
            ...prev,
            banner: (prev.banner || 0) + 1,
            auto: (prev.auto || 0) + 1,
          }));
        } else if (preferred === 'native') {
          formatDeliveredName = 'Native Advanced';
          unitIdSuffix = (config.nativeUnitId || '2247696110').slice(-10);
          setImpressions((prev) => ({
            ...prev,
            native: (prev.native || 0) + 1,
            auto: (prev.auto || 0) + 1,
          }));
        } else if (preferred === 'app_open') {
          formatDeliveredName = 'App Open Ad';
          unitIdSuffix = (config.appOpenUnitId || '9257395921').slice(-10);
          setImpressions((prev) => ({
            ...prev,
            appOpen: (prev.appOpen || 0) + 1,
            auto: (prev.auto || 0) + 1,
          }));
        } else if (preferred === 'interstitial') {
          formatDeliveredName = 'Interstitial Ad';
          unitIdSuffix = config.interstitialUnitId.slice(-10);
          setImpressions((prev) => ({
            ...prev,
            interstitial: prev.interstitial + 1,
            auto: (prev.auto || 0) + 1,
          }));
        } else if (preferred === 'rewarded') {
          formatDeliveredName = 'Reward Video';
          unitIdSuffix = config.rewardedUnitId.slice(-10);
          setImpressions((prev) => ({
            ...prev,
            rewardVideo: prev.rewardVideo + 1,
            auto: (prev.auto || 0) + 1,
          }));
        } else {
          // 'all': Follows active adTypes rotation
          const isInter = autoAdTypes.interstitial && autoAdTypes.reward
            ? (nextCount % 2 === 1)
            : autoAdTypes.interstitial;

          formatDeliveredName = isInter ? 'Interstitial' : 'Reward Video';
          unitIdSuffix = (isInter ? config.interstitialUnitId : config.rewardedUnitId).slice(-10);

          setImpressions((prev) => ({
            ...prev,
            interstitial: isInter ? prev.interstitial + 1 : prev.interstitial,
            rewardVideo: !isInter ? prev.rewardVideo + 1 : prev.rewardVideo,
            auto: (prev.auto || 0) + 1,
          }));
        }

        setImpressionTimestamps((prev) => [...prev.slice(-100), Date.now()]);

        setAutoLogs((prev) => [
          ...prev.slice(-30),
          `[${new Date().toLocaleTimeString()}] Auto Impression #${nextCount} delivered (+1 Auto, +1 ${formatDeliveredName}) • Unit: ...${unitIdSuffix}`,
        ]);

        sounds.playClick();
        return nextCount;
      });
    }, autoInterval * 1000);

    return () => clearInterval(timer);
  }, [isAutoRunning, autoInterval, autoTarget, autoAdTypes, config, showToast]);

  // --- IP Detection Toggle ---
  const handleDetectRealIp = async () => {
    sounds.playClick();
    setIsRefreshingIp(true);
    showToast('Probing network gateway IP...');
    try {
      const data = await fetchPublicIp();
      if (data.ip) {
        setIpDetails((prev) => ({
          ...prev,
          ip: data.ip || prev.ip,
          city: data.city || prev.city,
          country: data.country || prev.country,
          countryCode: data.countryCode || prev.countryCode,
          isp: data.isp || prev.isp,
          isReal: true,
          status: 'connected',
        }));
        showToast(`Detected IP: ${data.ip} (${data.city || 'BD'})`);
      } else {
        showToast('Using local simulated IP: 192.168.1.10');
      }
    } catch {
      showToast('Fallback to test IP');
    } finally {
      setIsRefreshingIp(false);
    }
  };

  const handleResetIpToPrompt = () => {
    sounds.playReset();
    setIpDetails(DEFAULT_IP_DETAILS);
    showToast('IP reset to 192.168.1.10 (Dhaka, BD)');
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    sounds.playClick();
    setCopiedKey(label);
    showToast(`Copied ${label}`);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Back button handler
  const handleBackAction = () => {
    sounds.playClick();
    if (countdownRemaining !== null) {
      setCountdownRemaining(null);
      showToast('Cancelled scheduled countdown');
    } else if (isAutoRunning) {
      setIsAutoRunning(false);
      setDurationRemaining(null);
      showToast('Paused auto-impressions and returned.');
    } else {
      showToast('Fish Fishing Utility: Already on main screen');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start sm:p-4 text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Utility Control Bar (outside phone frame on desktop) */}
      <header className="w-full max-w-md px-4 py-2 flex items-center justify-between text-xs text-slate-400 select-none">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>AdMob Utility Active</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle in Header */}
          <button
            onClick={handleToggleTheme}
            className={`p-1.5 px-2.5 rounded-lg border transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              theme === 'sunset'
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 hover:bg-amber-500/30'
                : 'bg-blue-900/40 border-blue-500/40 text-blue-200 hover:bg-blue-900/60'
            }`}
            title={`Switch to ${theme === 'sunset' ? 'Deep Ocean Blue' : 'Sunset Orange (Outdoor Mode)'}`}
          >
            {theme === 'sunset' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
            ) : (
              <Waves className="w-3.5 h-3.5 text-cyan-300" />
            )}
            <span>{theme === 'sunset' ? 'Sunset Orange' : 'Ocean Blue'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setIsSoundMuted(!isSoundMuted);
              sounds.playClick();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title={isSoundMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Device Frame Viewport Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsDeviceFrame(!isDeviceFrame);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition hidden sm:flex items-center gap-1 cursor-pointer"
            title="Toggle Smartphone Frame"
          >
            {isDeviceFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5 text-blue-400" />}
            <span className="text-[11px]">{isDeviceFrame ? 'Full' : 'Frame'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Device Mockup Container */}
      <main
        className={`w-full transition-all duration-300 ${
          isDeviceFrame
            ? 'max-w-[412px] sm:my-2 sm:rounded-[40px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_12px_#1e293b,0_0_0_14px_#334155] sm:border sm:border-slate-700/60'
            : 'max-w-md'
        } overflow-hidden flex flex-col relative`}
        style={{
          // Supports Deep Ocean Blue (default) or Sunset Orange (outdoor high-contrast mode)
          background:
            theme === 'sunset'
              ? 'linear-gradient(180deg, #9a3412 0%, #7c2d12 35%, #431407 70%, #1e0802 100%)'
              : 'linear-gradient(180deg, #0b2f5b 0%, #082449 35%, #051c3a 70%, #031329 100%)',
          minHeight: isDeviceFrame ? '844px' : '100vh',
        }}
      >
        {/* Mobile Device Status Bar */}
        <div className="pt-3 px-6 pb-1 flex items-center justify-between text-xs text-white/80 select-none">
          <span className="font-semibold tracking-tight text-xs">9:41</span>
          {/* Dynamic Island / Notch Simulation with In-App Quick Theme Toggle */}
          <div className="flex items-center gap-2">
            <div className="w-16 sm:w-20 h-4 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-xs">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700/60 mr-2" />
              <div className={`w-1.5 h-1.5 rounded-full ${theme === 'sunset' ? 'bg-orange-500' : 'bg-blue-500'}`} />
            </div>
            <button
              onClick={handleToggleTheme}
              className={`p-1 rounded-full border transition cursor-pointer ${
                theme === 'sunset'
                  ? 'bg-amber-500/25 border-amber-400/50 text-amber-300'
                  : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
              }`}
              title="Toggle Theme: Ocean Blue / Sunset Orange"
            >
              {theme === 'sunset' ? <Sun className="w-3 h-3 text-amber-400" /> : <Waves className="w-3 h-3 text-cyan-300" />}
            </button>
          </div>
          <div className="flex items-center space-x-1.5 text-white/90">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Scrollable Mobile App Shell */}
        <div className="flex-1 flex flex-col px-5 py-4 space-y-4">
          
          {/* App Header & Logo:
              "Below the top bar, place a unique round app logo featuring a cheerful, cartoon fish mascot holding a fishing rod.
               The logo must be perfectly centered. Directly below the logo, add the app title "fish fishing" in a stylized white font." */}
          <section className="flex flex-col items-center justify-center pt-1 pb-1">
            <div className="relative group">
              {/* Perfectly Centered Round Mascot Logo with theme glow */}
              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 flex items-center justify-center transition-all hover:scale-105 duration-300 ${
                theme === 'sunset'
                  ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 shadow-[0_8px_30px_rgba(249,115,22,0.5)] border-2 border-orange-400/60'
                  : 'bg-gradient-to-tr from-cyan-400 via-blue-400 to-indigo-300 shadow-[0_8px_25px_rgba(14,165,233,0.35)]'
              }`}>
                <img
                  src={fishMascotLogo}
                  alt="Fish Fishing Cartoon Mascot"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className={`absolute -bottom-1 -right-1 p-1 rounded-full text-[10px] font-bold shadow-md border-2 border-slate-900 ${
                theme === 'sunset' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-slate-950'
              }`}>
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            </div>

            {/* Stylized White App Title: "fish fishing" */}
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide mt-2.5 drop-shadow-md select-none lowercase font-sans">
              fish fishing
            </h1>
          </section>

          {/* Profile Section:
              "Below the title, add a section labeled "Profile" with a small document icon.
               To its right, display:
               Account ID: admob_acc_987654
               APP ID: ca-app-pub-1234567890~9876543210
               Maintain the exact blue color scheme and font weights (like 'admob_acc_987654' in a regular font)" */}
          <section className={`rounded-2xl p-3.5 border shadow-sm text-white backdrop-blur-md transition-colors ${
            theme === 'sunset'
              ? 'bg-orange-950/40 border-orange-500/40 shadow-orange-950/40'
              : 'bg-white/10 border-white/15'
          }`}>
            <div className="flex items-start gap-3">
              {/* Profile Label with Small Document Icon */}
              <div className="flex items-center gap-1.5 text-blue-200 font-medium text-xs pt-0.5 shrink-0">
                <FileText className="w-4 h-4 text-cyan-300" />
                <span className="font-semibold text-white tracking-wide">Profile</span>
              </div>

              {/* Account ID & APP ID Display */}
              <div className="flex-1 space-y-1 text-xs text-white/90 overflow-hidden">
                <div className="flex items-center justify-between group">
                  <div className="truncate">
                    <span className="text-white/70 font-medium">Account ID: </span>
                    <span className="font-normal text-white">{config.accountId}</span>
                  </div>
                  <button
                    onClick={() => handleCopyText(config.accountId, 'Account ID')}
                    className="opacity-0 group-hover:opacity-100 p-1 text-blue-200 hover:text-white transition"
                    title="Copy Account ID"
                  >
                    {copiedKey === 'Account ID' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="truncate">
                    <span className="text-white/70 font-medium">APP ID: </span>
                    <span className="font-normal text-white">{config.appId}</span>
                  </div>
                  <button
                    onClick={() => handleCopyText(config.appId, 'APP ID')}
                    className="opacity-0 group-hover:opacity-100 p-1 text-blue-200 hover:text-white transition"
                    title="Copy APP ID"
                  >
                    {copiedKey === 'APP ID' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Edit Quick Link */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsAdMobModalOpen(true);
                }}
                className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg transition shrink-0"
                title="Edit AdMob IDs"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          {/* IP Info Section:
              "Create a white, rounded-corner panel labeled "ip info".
               Inside this panel, list:
               Current IP: 192.168.1.10
               Location: Dhaka, BD
               A stylized blue globe icon on the right side of the text." */}
          <section className="bg-white rounded-2xl p-4 shadow-lg text-slate-800 transition-all space-y-3">
            <div className="flex items-center justify-between">
              {/* Left Column: Label, Current IP, Location */}
              <div className="space-y-1.5 flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 lowercase tracking-wide bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-100">
                    ip info
                  </span>
                  {ipDetails.isReal && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                      Real Network
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-1 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 font-medium">Current IP:</span>
                    <span className="font-semibold text-slate-900 font-mono text-[13px] tracking-tight">
                      {ipDetails.ip}
                    </span>
                    <button
                      onClick={() => handleCopyText(ipDetails.ip, 'IP')}
                      className="text-slate-400 hover:text-blue-600 p-0.5 transition cursor-pointer"
                      title="Copy IP"
                    >
                      {copiedKey === 'IP' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 font-medium">Location:</span>
                    <span className="font-semibold text-slate-900">
                      {ipDetails.city}, {ipDetails.countryCode}
                    </span>
                  </div>
                </div>

                {/* Sub-actions for developer inspection */}
                <div className="flex items-center gap-2 pt-1 text-[11px] text-blue-600">
                  <button
                    onClick={handleDetectRealIp}
                    disabled={isRefreshingIp}
                    className="hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshingIp ? 'animate-spin' : ''}`} />
                    {isRefreshingIp ? 'Detecting...' : 'Detect Real IP'}
                  </button>
                  {ipDetails.isReal && (
                    <>
                      <span className="text-slate-300">•</span>
                      <button
                        onClick={handleResetIpToPrompt}
                        className="text-slate-500 hover:text-slate-700 underline cursor-pointer"
                      >
                        Reset (192.168.1.10)
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Right Side: Stylized blue/orange globe icon */}
              <div className="shrink-0 pl-2">
                <div className={`w-14 h-14 rounded-2xl p-0.5 shadow-md flex items-center justify-center ${
                  theme === 'sunset'
                    ? 'bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 shadow-orange-500/30'
                    : 'bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 shadow-blue-500/25'
                }`}>
                  <div className={`w-full h-full rounded-[14px] flex items-center justify-center text-white ${
                    theme === 'sunset' ? 'bg-orange-600' : 'bg-blue-600'
                  }`}>
                    <Globe className={`w-8 h-8 ${theme === 'sunset' ? 'text-amber-200' : 'text-cyan-200'} animate-[spin_20s_linear_infinite]`} />
                  </div>
                </div>
              </div>
            </div>

            {/* AdMob Mediation Server Ping Test Utility */}
            <div className="border-t border-slate-100 pt-2.5">
              <PingTestUtility
                theme={theme}
                onToast={showToast}
              />
            </div>
          </section>

          {/* Main Action Grid:
              "Below the IP panel, create a distinct grey, rounded-corner container containing a 2x2 grid of buttons:
               Top Left: "Interstitial Ads" with a browser/ad icon.
               Top Right: "Reward Video" with a video/coin icon.
               Bottom Left: "Auto Impressions" with a gear/impression icon.
               Bottom Right: "Back" with an arrow icon." */}
          <section className="bg-slate-700/80 backdrop-blur-md rounded-2xl p-3 border border-slate-600/70 shadow-lg">
            <div className="grid grid-cols-2 gap-3">
              
              {/* Top Left: Interstitial Ads */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsInterstitialOpen(true);
                }}
                className="bg-slate-800/90 hover:bg-slate-800 active:scale-95 border border-slate-600/60 hover:border-blue-400/50 rounded-xl p-3.5 flex flex-col items-center justify-center text-center transition-all group shadow-sm cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Layout className="w-5 h-5 text-cyan-300" />
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-cyan-200 leading-tight">
                  Interstitial Ads
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Full screen test</span>
              </button>

              {/* Top Right: Reward Video */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsRewardOpen(true);
                }}
                className="bg-slate-800/90 hover:bg-slate-800 active:scale-95 border border-slate-600/60 hover:border-amber-400/50 rounded-xl p-3.5 flex flex-col items-center justify-center text-center transition-all group shadow-sm cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <PlaySquare className="w-5 h-5 text-amber-300" />
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-amber-200 leading-tight">
                  Reward Video
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Bonus video test</span>
              </button>

              {/* Bottom Left: Auto Impressions */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsAutoModalOpen(true);
                }}
                className={`relative bg-slate-800/90 hover:bg-slate-800 active:scale-95 border rounded-xl p-3.5 flex flex-col items-center justify-center text-center transition-all group shadow-sm cursor-pointer ${
                  isAutoRunning ? 'border-emerald-500/70 bg-emerald-950/20' : 'border-slate-600/60 hover:border-emerald-400/50'
                }`}
              >
                {/* Auto Impressions Count Badge */}
                {(impressions.auto > 0 || isAutoRunning) && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md border border-slate-900 flex items-center gap-0.5">
                    {impressions.auto}
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${
                  isAutoRunning
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  <Repeat className={`w-5 h-5 ${isAutoRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-white group-hover:text-emerald-200 leading-tight">
                    Auto Impressions
                  </span>
                  {isAutoRunning && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-medium mt-0.5">
                  {countdownRemaining !== null
                    ? `Delay: ${countdownRemaining}s`
                    : durationRemaining !== null
                    ? `${durationRemaining}s left`
                    : impressions.auto > 0
                    ? `Count: ${impressions.auto}`
                    : isAutoRunning
                    ? 'Running loop...'
                    : 'Batch generator'}
                </span>
              </button>

              {/* Bottom Right: Back */}
              <button
                onClick={handleBackAction}
                className="bg-slate-800/90 hover:bg-slate-800 active:scale-95 border border-slate-600/60 hover:border-slate-400 rounded-xl p-3.5 flex flex-col items-center justify-center text-center transition-all group shadow-sm cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 text-slate-300 border border-slate-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <ArrowLeft className="w-5 h-5 text-slate-200" />
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-slate-200 leading-tight">
                  Back
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Navigation</span>
              </button>

            </div>
          </section>

          {/* Impressions Section:
              "Create a distinct section titled "Impressions" in white text.
               Below it, list:
               Interstitial: 5
               Reward Video: 2
               To the right of the numbers, include a functional, circular "reset" arrow icon."
               Plus: Auto Impressions live counter, Export CSV feature, and Historical Trends 7-day bar chart */}
          <section className={`rounded-2xl p-4 border shadow-sm text-white backdrop-blur-md transition-colors ${
            theme === 'sunset'
              ? 'bg-orange-950/40 border-orange-500/40 shadow-orange-950/30'
              : 'bg-white/10 border-white/15'
          }`}>
            {/* Impressions Section Header with Tab Navigation */}
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Impressions
                </h3>

                {/* Tab Switcher: Today's Live vs. Historical Trends */}
                <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setImpressionsTab('live');
                    }}
                    className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      impressionsTab === 'live'
                        ? theme === 'sunset'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-cyan-500 text-slate-950 shadow-xs'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span>Today's Live</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setImpressionsTab('trends');
                      refreshDailyHistory();
                    }}
                    className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      impressionsTab === 'trends'
                        ? theme === 'sunset'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-cyan-500 text-slate-950 shadow-xs'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Historical Trends</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                      impressionsTab === 'trends'
                        ? 'bg-black/20 text-slate-900'
                        : 'bg-white/15 text-white/80'
                    }`}>
                      7D
                    </span>
                  </button>
                </div>
              </div>

              {/* Action buttons on header */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsExportModalOpen(true);
                }}
                className="text-[11px] font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                title="Export Impressions & Logs as CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>

            {/* TAB 1: Today's Live Impressions */}
            {impressionsTab === 'live' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {/* Counts List */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 font-medium w-28">Interstitial:</span>
                      <span className="font-bold text-white font-mono text-sm bg-white/10 px-2 py-0.5 rounded-md min-w-[28px] text-center">
                        {impressions.interstitial}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 font-medium w-28">Reward Video:</span>
                      <span className="font-bold text-white font-mono text-sm bg-white/10 px-2 py-0.5 rounded-md min-w-[28px] text-center">
                        {impressions.rewardVideo}
                      </span>
                    </div>
                    {impressions.banner !== undefined && impressions.banner > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/80 font-medium w-28">Banner:</span>
                        <span className="font-bold text-emerald-300 font-mono text-sm bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md min-w-[28px] text-center">
                          {impressions.banner}
                        </span>
                      </div>
                    )}
                    {impressions.native !== undefined && impressions.native > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/80 font-medium w-28">Native:</span>
                        <span className="font-bold text-purple-300 font-mono text-sm bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-md min-w-[28px] text-center">
                          {impressions.native}
                        </span>
                      </div>
                    )}
                    {impressions.appOpen !== undefined && impressions.appOpen > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/80 font-medium w-28">App Open:</span>
                        <span className="font-bold text-rose-300 font-mono text-sm bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-md min-w-[28px] text-center">
                          {impressions.appOpen}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-300 font-medium w-28 flex items-center gap-1">
                        <Repeat className="w-3 h-3 text-emerald-400" />
                        Auto Count:
                      </span>
                      <span className="font-bold text-emerald-300 font-mono text-sm bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md min-w-[28px] text-center">
                        {impressions.auto || 0}
                      </span>
                    </div>
                  </div>

                  {/* Functional circular icons: Export CSV & Circular reset arrow */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setIsExportModalOpen(true);
                      }}
                      className="w-11 h-11 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 border border-emerald-400/40 flex items-center justify-center text-emerald-300 transition-all shadow-md group cursor-pointer"
                      title="Export Analytical CSV"
                      aria-label="Export CSV"
                    >
                      <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={handleResetImpressions}
                      className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 flex items-center justify-center text-white transition-all shadow-md group cursor-pointer"
                      title="Reset Impressions Counter"
                      aria-label="Reset impressions"
                    >
                      <RotateCcw className="w-5 h-5 text-white group-hover:-rotate-90 transition-transform duration-300" />
                    </button>
                  </div>
                </div>

                {/* Daily Reset at Midnight Control */}
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isDailyResetEnabled
                        ? (theme === 'sunset' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30')
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}>
                      <CalendarClock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-xs">Daily Reset</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                          isDailyResetEnabled
                            ? (theme === 'sunset' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30')
                            : 'bg-white/10 text-white/50'
                        }`}>
                          {isDailyResetEnabled ? 'Midnight 00:00' : 'Disabled'}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/60 block">
                        {isDailyResetEnabled ? `Auto-clears at 00:00 • Last: ${lastResetted}` : 'Manual reset only'}
                      </span>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      const nextVal = !isDailyResetEnabled;
                      setIsDailyResetEnabled(nextVal);
                      showToast(nextVal ? 'Daily Reset at midnight: Enabled' : 'Daily Reset at midnight: Disabled');
                      setAutoLogs((prev) => [
                        ...prev.slice(-30),
                        `[${new Date().toLocaleTimeString()}] Daily Reset at midnight was turned ${nextVal ? 'ON' : 'OFF'}.`,
                      ]);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isDailyResetEnabled
                        ? (theme === 'sunset' ? 'bg-amber-500' : 'bg-blue-500')
                        : 'bg-slate-700/80'
                    }`}
                    role="switch"
                    aria-checked={isDailyResetEnabled}
                    title="Toggle automatic impression counter reset at midnight"
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isDailyResetEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Quick Helper to restore initial prompt numbers 5 & 2 if user cleared it */}
                {(impressions.interstitial !== 5 || impressions.rewardVideo !== 2 || (impressions.auto || 0) > 0) && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-white/60">
                    <span>Total: {impressions.interstitial + impressions.rewardVideo} delivered ({impressions.auto || 0} auto)</span>
                    <button
                      onClick={handleRestorePromptDefaults}
                      className={`${theme === 'sunset' ? 'text-amber-300' : 'text-cyan-300'} hover:underline cursor-pointer`}
                    >
                      Restore 5 & 2
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* TAB 2: Historical Trends (Last 7 Days) */
              <HistoricalTrendsChart
                history={dailyHistory}
                theme={theme}
                onRefreshHistory={refreshDailyHistory}
                onToast={showToast}
                todayImpressions={impressions}
              />
            )}
          </section>


          {/* Quick Stats Card: Daily Impression Target Completion */}
          <QuickStatsCard impressions={impressions} theme={theme} />

          {/* Spacer */}
          <div className="flex-1 min-h-2" />

          {/* Button Footer:
              "Place a prominent, dark rectangular button labeled "Set AdMob IDs" with a gear icon.
               Below it, add a simple text link for "Privacy Policy"." */}
          <footer className="pt-2 pb-2 space-y-3 flex flex-col items-center">
            {/* Prominent dark rectangular button */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsAdMobModalOpen(true);
              }}
              className={`w-full py-3.5 px-5 active:scale-[0.99] border rounded-xl text-white font-bold text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition cursor-pointer ${
                theme === 'sunset'
                  ? 'bg-amber-950/90 hover:bg-amber-900 border-amber-600/60 shadow-orange-950/40'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 shadow-xl'
              }`}
            >
              <Settings className={`w-4 h-4 ${theme === 'sunset' ? 'text-amber-400' : 'text-blue-400'}`} />
              <span>Set AdMob IDs</span>
            </button>

            {/* Simple text link for "Privacy Policy" */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsPrivacyModalOpen(true);
              }}
              className="text-xs text-blue-200 hover:text-white underline underline-offset-4 font-normal transition cursor-pointer"
            >
              Privacy Policy
            </button>
          </footer>

          {/* Home indicator bar for mobile feel */}
          <div className="pt-1 pb-1 flex justify-center">
            <div className="w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs px-3.5 py-2 rounded-full border border-blue-400/40 shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>

      {/* --- Interactive Modals --- */}

      {/* Set AdMob IDs Modal */}
      <SetAdMobModal
        isOpen={isAdMobModalOpen}
        onClose={() => setIsAdMobModalOpen(false)}
        config={config}
        onSave={(newConfig) => {
          setConfig(newConfig);
          showToast('AdMob IDs updated successfully!');
          setAutoLogs((prev) => [
            ...prev.slice(-30),
            `[${new Date().toLocaleTimeString()}] Config updated: App ID: ${newConfig.appId}`,
          ]);
        }}
      />

      {/* Interstitial Ad Simulator */}
      <InterstitialAdModal
        isOpen={isInterstitialOpen}
        onClose={() => setIsInterstitialOpen(false)}
        adUnitId={config.interstitialUnitId}
        onImpressionRecorded={handleRecordInterstitial}
      />

      {/* Rewarded Video Ad Simulator */}
      <RewardVideoModal
        isOpen={isRewardOpen}
        onClose={() => setIsRewardOpen(false)}
        adUnitId={config.rewardedUnitId}
        onRewardGranted={handleRecordReward}
      />

      {/* Auto Impressions Engine Modal */}
      <AutoImpressionsModal
        isOpen={isAutoModalOpen}
        onClose={() => setIsAutoModalOpen(false)}
        isRunning={isAutoRunning}
        onToggleRun={handleToggleAutoRun}
        intervalSeconds={autoInterval}
        onChangeInterval={setAutoInterval}
        targetCount={autoTarget}
        onChangeTarget={setAutoTarget}
        currentCycleCount={autoCycleCount}
        totalAutoCount={impressions.auto || 0}
        adTypes={autoAdTypes}
        onToggleAdType={(type) =>
          setAutoAdTypes((prev) => ({
            ...prev,
            [type]: !prev[type],
          }))
        }
        logs={autoLogs}
        onOpenExport={() => setIsExportModalOpen(true)}
        onClearLogs={handleClearLogs}
        startDelaySeconds={startDelaySeconds}
        onChangeStartDelay={setStartDelaySeconds}
        totalDurationSeconds={totalDurationSeconds}
        onChangeTotalDuration={setTotalDurationSeconds}
        countdownRemaining={countdownRemaining}
        onCancelCountdown={handleCancelCountdown}
        durationRemaining={durationRemaining}
        impressionTimestamps={impressionTimestamps}
        preferredAdFormat={config.preferredAdFormat || 'all'}
        onChangePreferredFormat={handleChangePreferredFormat}
        onOpenSetIds={() => {
          setIsAutoModalOpen(false);
          setIsAdMobModalOpen(true);
        }}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Export CSV Analytics Modal */}
      <ExportCsvModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={config}
        impressions={impressions}
        ipDetails={ipDetails}
        logs={autoLogs}
        dailyHistory={dailyHistory}
        onDownloaded={(filename) => {
          showToast(`Exported ${filename}`);
        }}
      />
    </div>
  );
}

