import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Zap, TrendingUp } from 'lucide-react';

interface ImpressionSparklineProps {
  timestamps: number[];
  isRunning?: boolean;
}

export const ImpressionSparkline: React.FC<ImpressionSparklineProps> = ({
  timestamps,
  isRunning = false,
}) => {
  // Ticking state to update the sliding 60-second window every second
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute 12 buckets of 5 seconds each across [now - 60000ms, now]
  const { buckets, totalLast60s, maxBucket } = useMemo(() => {
    const windowMs = 60000;
    const bucketCount = 12;
    const bucketDuration = windowMs / bucketCount; // 5000ms each
    const windowStart = now - windowMs;

    const counts = new Array(bucketCount).fill(0);
    let total = 0;

    for (const ts of timestamps) {
      if (ts >= windowStart && ts <= now) {
        total++;
        const index = Math.min(
          bucketCount - 1,
          Math.max(0, Math.floor((ts - windowStart) / bucketDuration))
        );
        counts[index]++;
      }
    }

    const max = Math.max(...counts, 2); // Minimum scale of 2 so 0/1 don't look broken
    return {
      buckets: counts,
      totalLast60s: total,
      maxBucket: max,
    };
  }, [timestamps, now]);

  // SVG dimensions
  const width = 340;
  const height = 48;
  const paddingX = 10;
  const paddingY = 8;
  const effectiveWidth = width - paddingX * 2;
  const effectiveHeight = height - paddingY * 2;

  // Calculate coordinates for the 12 points
  const points = useMemo(() => {
    return buckets.map((count, i) => {
      const x = paddingX + (i / (buckets.length - 1)) * effectiveWidth;
      const normalizedY = count / maxBucket;
      const y = height - paddingY - normalizedY * effectiveHeight;
      return { x, y, count };
    });
  }, [buckets, maxBucket, effectiveWidth, effectiveHeight]);

  // Construct SVG line and area path
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      // Smooth curve with cubic beziers
      const prev = points[idx - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      return `${acc} C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = height - paddingY;
    return `${linePath} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  }, [linePath, points]);

  const latestPoint = points[points.length - 1];

  return (
    <div className="bg-slate-900/90 border border-slate-700/70 rounded-xl p-3 space-y-2">
      {/* Sparkline Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Impression Velocity</span>
          <span className="text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.2 rounded font-mono">
            Last 60s
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Zap className={`w-3 h-3 ${isRunning ? 'animate-bounce text-amber-400' : 'text-emerald-400'}`} />
            {totalLast60s} imp / 60s
          </span>
        </div>
      </div>

      {/* Mini SVG Sparkline Chart */}
      <div className="relative bg-black/50 rounded-lg p-1 border border-slate-800 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-12 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="sparklineStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Grid Guideline */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeDasharray="2 2"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="3 3"
          />

          {/* Gradient Filled Area */}
          <path d={areaPath} fill="url(#sparklineFill)" />

          {/* Smooth Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#sparklineStroke)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Individual Data Points */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={pt.count > 0 ? 2.5 : 1.2}
              className={pt.count > 0 ? 'fill-cyan-300' : 'fill-slate-600'}
            />
          ))}

          {/* Active Live Pulse Ring at current second (Rightmost) */}
          {latestPoint && (
            <g transform={`translate(${latestPoint.x}, ${latestPoint.y})`}>
              <circle r="4" className="fill-emerald-400" />
              <circle r="7" className="fill-emerald-400/30 animate-ping" />
            </g>
          )}
        </svg>

        {/* Timeline Bottom Axis Labels */}
        <div className="flex justify-between items-center px-2 pt-0.5 text-[9px] font-mono text-slate-500 select-none">
          <span>-60s</span>
          <span>-45s</span>
          <span>-30s</span>
          <span>-15s</span>
          <span className="text-emerald-400 font-bold">Now</span>
        </div>
      </div>
    </div>
  );
};
