import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Download, Star, Info, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { sounds } from '../utils/audio';

interface InterstitialAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adUnitId: string;
  onImpressionRecorded: () => void;
}

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({
  isOpen,
  onClose,
  adUnitId,
  onImpressionRecorded,
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [canClose, setCanClose] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanClose(false);
      setHasRecorded(false);
      return;
    }

    // Record impression upon display
    if (!hasRecorded) {
      onImpressionRecorded();
      setHasRecorded(true);
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    sounds.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm sm:max-w-md h-[92vh] max-h-[720px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col text-white">
        
        {/* AdMob Top Bar with Google Test Badge */}
        <div className="bg-black/60 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-white/10 z-10">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">
              Test Ad
            </span>
            <span className="text-xs text-slate-300 font-mono truncate max-w-[140px] sm:max-w-[180px]">
              {adUnitId || 'ca-app-pub-3940...'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {canClose ? (
              <button
                onClick={handleClose}
                className="w-7 h-7 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition hover:scale-105"
                title="Close Ad"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-7 h-7 bg-black/40 border border-white/20 rounded-full flex items-center justify-center text-xs font-semibold text-slate-200">
                {countdown}
              </div>
            )}
          </div>
        </div>

        {/* Ad Content Hero Graphic */}
        <div className="relative flex-1 bg-gradient-to-b from-blue-700 via-cyan-800 to-indigo-950 p-6 flex flex-col justify-between overflow-hidden">
          {/* Subtle decorative background bubbles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />
          <div className="absolute top-1/3 -left-12 w-40 h-40 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />

          {/* Sponsored Ad Header */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-white/15 text-white/90 backdrop-blur-xs flex items-center gap-1">
              <Info className="w-3 h-3 text-cyan-300" /> Sponsored Interstitial
            </span>
            <span className="text-[11px] text-white/70">Google AdMob Network</span>
          </div>

          {/* Ad Creative Visual */}
          <div className="relative z-10 text-center my-auto py-4">
            <div className="relative inline-block mx-auto mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-1 shadow-xl shadow-orange-500/30 transform hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-3xl">
                  🎣
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                NEW 2026
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
              Deep Sea Fishing 3D
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100/90 mt-1.5 max-w-xs mx-auto">
              Real-time competitive multiplayer ocean fishing. Hook giant marlins and win seasonal tournaments!
            </p>

            <div className="flex items-center justify-center gap-3 mt-3 text-xs text-amber-300">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-white">4.9</span>
              <span className="text-white/60">• 10M+ Downloads</span>
            </div>
          </div>

          {/* Bottom Card Actions */}
          <div className="relative z-10 bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-lg">
                  🎮
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Deep Sea Fishing Pro</h4>
                  <p className="text-[10px] text-slate-400">Contains ads • Free in-app purchase</p>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Verified
              </span>
            </div>

            <button
              onClick={() => {
                sounds.playSuccess();
                alert('Simulated Install Action: In a native app, this redirects to the Google Play Store or Apple App Store.');
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" /> Install Free Now
            </button>
          </div>
        </div>

        {/* AdMob Footer Verification */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldAlert className="w-3 h-3 text-cyan-400" />
            <span>AdMob SDK 23.4.0 Test Impression</span>
          </div>
          <span className="text-emerald-400 font-mono">+1 Impression Logged</span>
        </div>
      </div>
    </div>
  );
};
