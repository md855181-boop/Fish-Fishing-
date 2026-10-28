import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Key,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Filter,
  Layers,
  Info,
  Smartphone,
  Layout,
  PlaySquare,
  FileText
} from 'lucide-react';
import { AdMobConfig, PreferredAdFormat } from '../types';
import { sounds } from '../utils/audio';

interface SetAdMobModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdMobConfig;
  onSave: (newConfig: AdMobConfig) => void;
}

export const SetAdMobModal: React.FC<SetAdMobModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formData, setFormData] = useState<AdMobConfig>({
    ...config,
    preferredAdFormat: config.preferredAdFormat || 'all',
    nativeUnitId: config.nativeUnitId || 'ca-app-pub-3940256099942544/2247696110',
    appOpenUnitId: config.appOpenUnitId || 'ca-app-pub-3940256099942544/9257395921',
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync state when modal is opened or config changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...config,
        preferredAdFormat: config.preferredAdFormat || 'all',
        nativeUnitId: config.nativeUnitId || 'ca-app-pub-3940256099942544/2247696110',
        appOpenUnitId: config.appOpenUnitId || 'ca-app-pub-3940256099942544/9257395921',
      });
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard?.writeText(text);
    sounds.playClick();
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleResetToPromptDefaults = () => {
    sounds.playReset();
    setFormData({
      accountId: 'admob_acc_987654',
      appId: 'ca-app-pub-1234567890~9876543210',
      interstitialUnitId: 'ca-app-pub-3940256099942544/1033173712',
      rewardedUnitId: 'ca-app-pub-3940256099942544/5224354917',
      bannerUnitId: 'ca-app-pub-3940256099942544/6300978111',
      nativeUnitId: 'ca-app-pub-3940256099942544/2247696110',
      appOpenUnitId: 'ca-app-pub-3940256099942544/9257395921',
      preferredAdFormat: 'all',
      isTestMode: true,
    });
  };

  const handleSetGoogleOfficialSuite = () => {
    sounds.playClick();
    setFormData({
      accountId: 'admob_acc_google_demo',
      appId: 'ca-app-pub-3940256099942544~3347511713',
      interstitialUnitId: 'ca-app-pub-3940256099942544/1033173712',
      rewardedUnitId: 'ca-app-pub-3940256099942544/5224354917',
      bannerUnitId: 'ca-app-pub-3940256099942544/6300978111',
      nativeUnitId: 'ca-app-pub-3940256099942544/2247696110',
      appOpenUnitId: 'ca-app-pub-3940256099942544/9257395921',
      preferredAdFormat: 'all',
      isTestMode: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-900/60 to-slate-800 border-b border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base tracking-wide">Set AdMob IDs</h3>
              <p className="text-xs text-blue-200/70">Modify Account, App ID & Ad Unit parameters</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Preset Buttons */}
          <div className="flex items-center justify-between gap-2 p-2 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
            <span className="text-slate-400 font-medium px-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleResetToPromptDefaults}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition cursor-pointer"
              >
                Default Mock
              </button>
              <button
                type="button"
                onClick={handleSetGoogleOfficialSuite}
                className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 border border-blue-700/50 text-blue-200 rounded-lg font-medium transition cursor-pointer"
              >
                Google Official
              </button>
            </div>
          </div>

          {/* Account ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                AdMob Account ID <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => handleCopy(formData.accountId, 'account')}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'account' ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                {copiedField === 'account' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              placeholder="e.g. admob_acc_987654"
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-xs transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">Publisher identifier used for revenue mapping.</p>
          </div>

          {/* App ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                AdMob APP ID <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => handleCopy(formData.appId, 'app')}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'app' ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                {copiedField === 'app' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.appId}
              onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
              placeholder="e.g. ca-app-pub-1234567890~9876543210"
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-xs transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">Standard format: ca-app-pub-[publisher_id]~[app_id]</p>
          </div>

          {/* Preferred Ad Format Dropdown: Prioritizes & filters ad types in Auto-Impressions */}
          <div className="p-3.5 bg-gradient-to-br from-blue-950/70 via-slate-800/90 to-cyan-950/40 rounded-xl border border-blue-500/50 shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="preferred-format-select" className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                Preferred Ad Format
              </label>
              <span className="text-[10px] font-mono font-semibold text-cyan-300 bg-cyan-950 border border-cyan-700/60 px-2 py-0.5 rounded-full">
                Auto-Impression Testing Focus
              </span>
            </div>

            <div className="relative">
              <select
                id="preferred-format-select"
                value={formData.preferredAdFormat || 'all'}
                onChange={(e) => {
                  sounds.playClick();
                  setFormData({
                    ...formData,
                    preferredAdFormat: e.target.value as PreferredAdFormat,
                  });
                }}
                className="w-full appearance-none px-3.5 py-2.5 bg-slate-900/90 border border-blue-400/60 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 pr-10 cursor-pointer transition shadow-inner"
              >
                <option value="all">🌐 All Formats (Balanced Auto-Rotation)</option>
                <option value="banner">🏷️ Banner Ad (Standard 320x50 / Smart Display)</option>
                <option value="interstitial">📺 Interstitial Ad (Full-Screen Rich Creative)</option>
                <option value="rewarded">🎁 Rewarded Video (Opt-In Video Reward)</option>
                <option value="native">🧩 Native Advanced (Custom Feed Placement)</option>
                <option value="app_open">🚀 App Open Ad (App Launch / Splash Screen)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cyan-300">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="text-[11px] text-blue-200/90 bg-blue-900/30 p-2.5 rounded-lg border border-blue-500/30 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                {(!formData.preferredAdFormat || formData.preferredAdFormat === 'all') && (
                  <span>
                    <strong>Balanced Mode:</strong> Automated testing cycles distribute impressions across multiple active ad formats.
                  </span>
                )}
                {formData.preferredAdFormat === 'banner' && (
                  <span>
                    <strong>Banner Priority:</strong> Auto-impression cycles will focus exclusively on Banner ad unit verification.
                  </span>
                )}
                {formData.preferredAdFormat === 'interstitial' && (
                  <span>
                    <strong>Interstitial Priority:</strong> Auto-impression cycles will target full-screen static and rich interstitial formats.
                  </span>
                )}
                {formData.preferredAdFormat === 'rewarded' && (
                  <span>
                    <strong>Rewarded Video Priority:</strong> Auto-impression cycles will test rewarded video playback and grant reward callbacks.
                  </span>
                )}
                {formData.preferredAdFormat === 'native' && (
                  <span>
                    <strong>Native Advanced Priority:</strong> Auto-impression cycles will target customized native layout assets and impression trackers.
                  </span>
                )}
                {formData.preferredAdFormat === 'app_open' && (
                  <span>
                    <strong>App Open Priority:</strong> Auto-impression cycles will simulate cold/warm foreground app launch impressions.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ad Unit IDs Header */}
          <div className="pt-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Ad Unit Placements</span>
              <span className="text-[10px] text-slate-400 lowercase font-normal font-mono">Google Test Suite IDs</span>
            </h4>
          </div>

          {/* Interstitial Unit ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layout className="w-3 h-3 text-cyan-400" />
                Interstitial Ad Unit ID
              </label>
              {formData.preferredAdFormat === 'interstitial' && (
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-700/60">
                  Prioritized
                </span>
              )}
            </div>
            <input
              type="text"
              value={formData.interstitialUnitId}
              onChange={(e) => setFormData({ ...formData, interstitialUnitId: e.target.value })}
              placeholder="ca-app-pub-3940256099942544/1033173712"
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs transition"
            />
          </div>

          {/* Rewarded Unit ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <PlaySquare className="w-3 h-3 text-amber-400" />
                Reward Video Ad Unit ID
              </label>
              {formData.preferredAdFormat === 'rewarded' && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-700/60">
                  Prioritized
                </span>
              )}
            </div>
            <input
              type="text"
              value={formData.rewardedUnitId}
              onChange={(e) => setFormData({ ...formData, rewardedUnitId: e.target.value })}
              placeholder="ca-app-pub-3940256099942544/5224354917"
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs transition"
            />
          </div>

          {/* Banner Unit ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-emerald-400" />
                Banner Ad Unit ID
              </label>
              {formData.preferredAdFormat === 'banner' && (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/60">
                  Prioritized
                </span>
              )}
            </div>
            <input
              type="text"
              value={formData.bannerUnitId}
              onChange={(e) => setFormData({ ...formData, bannerUnitId: e.target.value })}
              placeholder="ca-app-pub-3940256099942544/6300978111"
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs transition"
            />
          </div>

          {/* Native Advanced Unit ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-purple-400" />
                Native Advanced Ad Unit ID
              </label>
              {formData.preferredAdFormat === 'native' && (
                <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-700/60">
                  Prioritized
                </span>
              )}
            </div>
            <input
              type="text"
              value={formData.nativeUnitId || ''}
              onChange={(e) => setFormData({ ...formData, nativeUnitId: e.target.value })}
              placeholder="ca-app-pub-3940256099942544/2247696110"
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs transition"
            />
          </div>

          {/* App Open Unit ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3 h-3 text-rose-400" />
                App Open Ad Unit ID
              </label>
              {formData.preferredAdFormat === 'app_open' && (
                <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-700/60">
                  Prioritized
                </span>
              )}
            </div>
            <input
              type="text"
              value={formData.appOpenUnitId || ''}
              onChange={(e) => setFormData({ ...formData, appOpenUnitId: e.target.value })}
              placeholder="ca-app-pub-3940256099942544/9257395921"
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs transition"
            />
          </div>

          {/* Test Mode toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-medium text-slate-200 block">AdMob Test Mode Guard</span>
                <span className="text-[11px] text-slate-400 block">Prevents policy violations by serving Google test creatives</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isTestMode}
                onChange={(e) => setFormData({ ...formData, isTestMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200/90 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Changes are stored persistently in local storage and take effect immediately across all impression tests.</span>
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
