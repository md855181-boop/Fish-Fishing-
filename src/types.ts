export type PreferredAdFormat =
  | 'all'
  | 'banner'
  | 'interstitial'
  | 'rewarded'
  | 'native'
  | 'app_open';

export interface AdMobConfig {
  accountId: string;
  appId: string;
  interstitialUnitId: string;
  rewardedUnitId: string;
  bannerUnitId: string;
  nativeUnitId?: string;
  appOpenUnitId?: string;
  preferredAdFormat?: PreferredAdFormat;
  isTestMode: boolean;
}

export interface ImpressionCounts {
  interstitial: number;
  rewardVideo: number;
  banner?: number;
  native?: number;
  appOpen?: number;
  auto: number;
}

export interface IpDetails {
  ip: string;
  city: string;
  country: string;
  countryCode: string;
  isp: string;
  isReal: boolean;
  status: 'connected' | 'checking' | 'simulated';
}

export interface AdLogItem {
  id: string;
  timestamp: string;
  type: 'interstitial' | 'reward' | 'auto' | 'config' | 'reset';
  title: string;
  details: string;
  status: 'success' | 'info' | 'warning';
}

export interface MediationServerPing {
  id: string;
  name: string;
  provider: string;
  category: 'Google Core' | 'Mediation Bidding' | 'Waterfall' | 'Ad CDN';
  domain: string;
  testUrl: string;
  latency: number | null;
  status: 'idle' | 'testing' | 'success' | 'warning' | 'timeout' | 'error';
  lastPingTime?: number;
  notes: string;
}

export interface MediationPingSummary {
  avgLatency: number | null;
  minLatency: number | null;
  maxLatency: number | null;
  successfulCount: number;
  totalCount: number;
  lastTestedAt: number | null;
  healthRating: 'optimal' | 'good' | 'fair' | 'degraded' | 'untested';
}

export interface DailyImpressionRecord {
  date: string; // ISO format 'YYYY-MM-DD'
  dayLabel: string; // e.g. 'Mon', 'Tue'
  fullDateLabel: string; // e.g. 'Oct 28'
  isToday: boolean;
  interstitial: number;
  rewardVideo: number;
  banner: number;
  native: number;
  appOpen: number;
  auto: number;
  total: number;
}


