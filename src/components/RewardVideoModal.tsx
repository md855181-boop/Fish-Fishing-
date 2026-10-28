import React, { useState, useEffect } from 'react';
import { X, Award, Coins, Sparkles, Volume2, VolumeX, CheckCircle2, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface RewardVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  adUnitId: string;
  onRewardGranted: () => void;
}

export const RewardVideoModal: React.FC<RewardVideoModalProps> = ({
  isOpen,
  onClose,
  adUnitId,
  onRewardGranted,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setSecondsRemaining(10);
      setIsCompleted(false);
      setRewardClaimed(false);
      return;
    }

    const durationSeconds = 10;
    const intervalTime = 100;
    const step = 100 / (durationSeconds * (1000 / intervalTime));

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
          setSecondsRemaining(0);
          return 100;
        }
        setSecondsRemaining(Math.max(0, Math.ceil(durationSeconds * (1 - next / 100))));
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isOpen]);

  // When completed, trigger confetti & reward callback once
  useEffect(() => {
    if (isCompleted && !rewardClaimed) {
      sounds.playCoinReward();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      onRewardGranted();
      setRewardClaimed(true);
    }
  }, [isCompleted, rewardClaimed]);

  if (!isOpen) return null;

  const handleSkipFast = () => {
    sounds.playClick();
    setProgress(100);
    setSecondsRemaining(0);
    setIsCompleted(true);
  };

  const handleClose = () => {
    sounds.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm sm:max-w-md h-[92vh] max-h-[720px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col text-white">
        
        {/* Top Ad Bar */}
        <div className="bg-black/80 px-4 py-2.5 flex items-center justify-between border-b border-white/10 z-10">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">
              Rewarded Ad
            </span>
            <span className="text-xs text-slate-300 font-mono truncate max-w-[130px]">
              {adUnitId || 'ca-app-pub-3940...'}
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {!isCompleted ? (
              <div className="flex items-center gap-1.5 bg-black/50 border border-white/20 px-2.5 py-0.5 rounded-full text-xs text-amber-300 font-medium">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Reward in {secondsRemaining}s</span>
              </div>
            ) : (
              <button
                onClick={handleClose}
                className="w-7 h-7 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition hover:scale-105"
                title="Claim & Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Simulated Video Player Area */}
        <div className="relative flex-1 bg-gradient-to-br from-indigo-950 via-blue-950 to-slate-900 flex flex-col justify-between p-5 overflow-hidden">
          
          {/* Animated aquatic/ocean elements */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-blue-500 blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-44 h-44 rounded-full bg-cyan-400 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 flex justify-between items-center text-xs text-white/70">
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" /> Video Ad Stream (1080p)
            </span>
            {!isCompleted && (
              <button
                onClick={handleSkipFast}
                className="text-[11px] text-cyan-300 hover:text-white underline bg-white/10 px-2 py-0.5 rounded cursor-pointer"
              >
                Skip to Reward ⏩
              </button>
            )}
          </div>

          {/* Central Reward Content */}
          <div className="relative z-10 my-auto text-center py-6">
            {!isCompleted ? (
              <div className="space-y-4">
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-400/30 animate-spin" style={{ animationDuration: '4s' }} />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/40">
                    🪙
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    Watch Video to Claim 2x Bonus
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto mt-1">
                    Rewarded Video testing verification for AdMob SDK. Reward callback will fire once the countdown completes.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/30">
                  🎉
                </div>

                <div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> AdMob Reward Verified
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    +1 Reward Impression!
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                    User completed the video. <code>onUserEarnedRewardListener()</code> was successfully executed.
                  </p>
                </div>

                <div className="p-3 bg-white/10 rounded-2xl border border-white/10 max-w-xs mx-auto flex items-center justify-center gap-3">
                  <Coins className="w-6 h-6 text-amber-400" />
                  <div className="text-left">
                    <span className="text-xs text-white/70 block">Bonus Item</span>
                    <span className="text-sm font-bold text-amber-300">500 Golden Lures</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className="relative z-10">
            {isCompleted ? (
              <button
                onClick={handleClose}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Collect & Return to App
              </button>
            ) : (
              <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-center">
                <span className="text-xs text-slate-400">
                  Please keep watching to earn your reward • {secondsRemaining}s remaining
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-black border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>AdMob SDK Mediation: AdColony / Unity Ads</span>
          <span className="text-emerald-400 font-mono">Fill: 100% OK</span>
        </div>
      </div>
    </div>
  );
};
