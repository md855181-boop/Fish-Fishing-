import { ImpressionCounts, DailyImpressionRecord } from '../types';

const STORAGE_KEY = 'fish_fishing_daily_history';

/**
 * Formats a Date object to YYYY-MM-DD
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns weekday label: 'Sun', 'Mon', etc.
 */
export const formatDayLabel = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Returns month + day label: 'Oct 28'
 */
export const formatFullDateLabel = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Generate default seed history for the past 6 days so the user has immediate
 * comparison data when opening the app, while the 7th day is today's real live count.
 */
export const generateSeedHistory = (todayImpressions?: ImpressionCounts): DailyImpressionRecord[] => {
  const records: DailyImpressionRecord[] = [];
  const today = new Date();

  // Baseline seed samples for the last 6 days: [6 days ago ... 1 day ago]
  const seedProfiles = [
    { interstitial: 12, rewardVideo: 6, banner: 4, native: 2, appOpen: 1, auto: 15 }, // -6d
    { interstitial: 18, rewardVideo: 9, banner: 5, native: 3, appOpen: 2, auto: 24 }, // -5d
    { interstitial: 15, rewardVideo: 7, banner: 3, native: 1, appOpen: 1, auto: 18 }, // -4d
    { interstitial: 28, rewardVideo: 14, banner: 8, native: 5, appOpen: 3, auto: 35 }, // -3d (peak)
    { interstitial: 22, rewardVideo: 11, banner: 6, native: 4, appOpen: 2, auto: 29 }, // -2d
    { interstitial: 17, rewardVideo: 8, banner: 4, native: 2, appOpen: 1, auto: 20 },  // -1d (yesterday)
  ];

  for (let i = 6; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = formatDateKey(d);
    const profile = seedProfiles[6 - i];
    const total =
      profile.interstitial +
      profile.rewardVideo +
      profile.banner +
      profile.native +
      profile.appOpen;

    records.push({
      date: dateKey,
      dayLabel: formatDayLabel(d),
      fullDateLabel: formatFullDateLabel(d),
      isToday: false,
      interstitial: profile.interstitial,
      rewardVideo: profile.rewardVideo,
      banner: profile.banner,
      native: profile.native,
      appOpen: profile.appOpen,
      auto: profile.auto,
      total,
    });
  }

  // Today
  const todayKey = formatDateKey(today);
  const todayDelivered = todayImpressions
    ? todayImpressions.interstitial +
      todayImpressions.rewardVideo +
      (todayImpressions.banner || 0) +
      (todayImpressions.native || 0) +
      (todayImpressions.appOpen || 0)
    : 7; // Default 5 + 2

  records.push({
    date: todayKey,
    dayLabel: 'Today',
    fullDateLabel: formatFullDateLabel(today),
    isToday: true,
    interstitial: todayImpressions?.interstitial ?? 5,
    rewardVideo: todayImpressions?.rewardVideo ?? 2,
    banner: todayImpressions?.banner ?? 0,
    native: todayImpressions?.native ?? 0,
    appOpen: todayImpressions?.appOpen ?? 0,
    auto: todayImpressions?.auto ?? 0,
    total: todayDelivered,
  });

  return records;
};

/**
 * Retrieve 7-day historical impressions from localStorage, merged with today's live counts.
 */
export const get7DayHistory = (todayImpressions: ImpressionCounts): DailyImpressionRecord[] => {
  const today = new Date();
  const todayKey = formatDateKey(today);

  let storedRecords: Record<string, DailyImpressionRecord> = {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((rec: DailyImpressionRecord) => {
          if (rec && rec.date) {
            storedRecords[rec.date] = rec;
          }
        });
      }
    }
  } catch (err) {
    console.warn('Failed to parse daily history from localStorage:', err);
  }

  // If no history exists, generate and store the initial 7-day seed
  if (Object.keys(storedRecords).length === 0) {
    const initialRecords = generateSeedHistory(todayImpressions);
    saveHistory(initialRecords);
    return initialRecords;
  }

  // Build the continuous 7-day window ending today
  const result: DailyImpressionRecord[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = formatDateKey(d);
    const isToday = i === 0;

    if (isToday) {
      // Always sync today with the live impression state
      const total =
        todayImpressions.interstitial +
        todayImpressions.rewardVideo +
        (todayImpressions.banner || 0) +
        (todayImpressions.native || 0) +
        (todayImpressions.appOpen || 0);

      const todayRec: DailyImpressionRecord = {
        date: todayKey,
        dayLabel: 'Today',
        fullDateLabel: formatFullDateLabel(today),
        isToday: true,
        interstitial: todayImpressions.interstitial,
        rewardVideo: todayImpressions.rewardVideo,
        banner: todayImpressions.banner || 0,
        native: todayImpressions.native || 0,
        appOpen: todayImpressions.appOpen || 0,
        auto: todayImpressions.auto || 0,
        total,
      };

      storedRecords[todayKey] = todayRec;
      result.push(todayRec);
    } else if (storedRecords[dateKey]) {
      const rec = storedRecords[dateKey];
      result.push({
        ...rec,
        dayLabel: formatDayLabel(d),
        fullDateLabel: formatFullDateLabel(d),
        isToday: false,
      });
    } else {
      // Missing past day: estimate reasonable historical fallback
      const fallbackTotal = 15 + ((d.getDate() * 7) % 18);
      const fallbackInter = Math.round(fallbackTotal * 0.6);
      const fallbackReward = fallbackTotal - fallbackInter;
      const rec: DailyImpressionRecord = {
        date: dateKey,
        dayLabel: formatDayLabel(d),
        fullDateLabel: formatFullDateLabel(d),
        isToday: false,
        interstitial: fallbackInter,
        rewardVideo: fallbackReward,
        banner: 0,
        native: 0,
        appOpen: 0,
        auto: fallbackTotal,
        total: fallbackTotal,
      };
      storedRecords[dateKey] = rec;
      result.push(rec);
    }
  }

  // Keep stored records up to date in localStorage
  saveHistory(Object.values(storedRecords));

  return result;
};

/**
 * Save records array to localStorage
 */
export const saveHistory = (records: DailyImpressionRecord[]): void => {
  try {
    // Keep at most recent 30 days in storage
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  } catch (err) {
    console.error('Failed to save daily history to localStorage:', err);
  }
};

/**
 * Resets history to a fresh seeded 7-day dataset
 */
export const resetHistoricalTrends = (todayImpressions?: ImpressionCounts): DailyImpressionRecord[] => {
  const fresh = generateSeedHistory(todayImpressions);
  saveHistory(fresh);
  return fresh;
};
