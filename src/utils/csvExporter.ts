import { AdMobConfig, ImpressionCounts, IpDetails, DailyImpressionRecord } from '../types';

export interface ExportDataPayload {
  config: AdMobConfig;
  impressions: ImpressionCounts;
  ipDetails: IpDetails;
  logs: string[];
  dailyHistory?: DailyImpressionRecord[];
}

export function generateAnalyticsCsv(payload: ExportDataPayload): string {
  const { config, impressions, ipDetails, logs, dailyHistory } = payload;
  const now = new Date();
  const timestampIso = now.toISOString();
  const formattedDate = now.toLocaleString();

  const totalImpressions =
    impressions.interstitial +
    impressions.rewardVideo +
    (impressions.banner || 0) +
    (impressions.native || 0) +
    (impressions.appOpen || 0);
  const estimatedEcpm = 3.85; // Simulated benchmark eCPM for mobile fishing utility/gaming
  const estimatedRevenue = ((totalImpressions / 1000) * estimatedEcpm).toFixed(4);

  // Section 1: Executive Metadata
  const metadataRows = [
    ['--- APPLICATION & PUBLISHER METADATA ---', ''],
    ['Application Title', 'Fish Fishing - AdMob Utility'],
    ['Export Timestamp (UTC)', timestampIso],
    ['Export Local Time', `"${formattedDate}"`],
    ['AdMob Account ID', `"${config.accountId}"`],
    ['AdMob APP ID', `"${config.appId}"`],
    ['Preferred Ad Format', `"${config.preferredAdFormat || 'all'}"`],
    ['Interstitial Unit ID', `"${config.interstitialUnitId}"`],
    ['Rewarded Unit ID', `"${config.rewardedUnitId}"`],
    ['Banner Unit ID', `"${config.bannerUnitId}"`],
    ['Native Unit ID', `"${config.nativeUnitId || 'ca-app-pub-3940256099942544/2247696110'}"`],
    ['App Open Unit ID', `"${config.appOpenUnitId || 'ca-app-pub-3940256099942544/9257395921'}"`],
    ['Test Mode Guard Active', config.isTestMode ? 'YES' : 'NO'],
    ['Current Network IP', `"${ipDetails.ip}"`],
    ['Geolocation', `"${ipDetails.city}, ${ipDetails.countryCode} (${ipDetails.country})"`],
    ['Network Provider / ISP', `"${ipDetails.isp}"`],
    ['', ''],
  ];

  // Section 2: Impression KPI Summary
  const kpiRows = [
    ['--- IMPRESSION METRICS & ANALYTICS ---', ''],
    ['Metric Category', 'Delivered Count / Value', 'Unit / Benchmark'],
    ['Interstitial Impressions', impressions.interstitial.toString(), 'Impressions'],
    ['Reward Video Impressions', impressions.rewardVideo.toString(), 'Impressions'],
    ['Banner Ad Impressions', (impressions.banner || 0).toString(), 'Impressions'],
    ['Native Advanced Impressions', (impressions.native || 0).toString(), 'Impressions'],
    ['App Open Impressions', (impressions.appOpen || 0).toString(), 'Impressions'],
    ['Auto-Generated Impressions', (impressions.auto || 0).toString(), 'Impressions'],
    ['Total Delivered Impressions', totalImpressions.toString(), 'Impressions'],
    ['Simulated Network Fill Rate', '100.0%', 'Percent'],
    ['Benchmark Test eCPM (USD)', `$${estimatedEcpm.toFixed(2)}`, 'USD per 1k impressions'],
    ['Estimated Ad Revenue (USD)', `$${estimatedRevenue}`, 'USD (Simulated)'],
    ['', '', ''],
  ];

  // Section 3: 7-Day Historical Daily Breakdown (if provided)
  const historyRows: string[][] = [];
  if (dailyHistory && dailyHistory.length > 0) {
    historyRows.push(['--- 7-DAY HISTORICAL IMPRESSION TRENDS ---', '', '', '', '']);
    historyRows.push(['Date (YYYY-MM-DD)', 'Day Label', 'Total Impressions', 'Interstitial', 'Reward Video', 'Auto / Other']);
    dailyHistory.forEach((rec) => {
      historyRows.push([
        rec.date,
        rec.isToday ? `${rec.dayLabel} (Today)` : rec.dayLabel,
        rec.total.toString(),
        rec.interstitial.toString(),
        rec.rewardVideo.toString(),
        (rec.auto || Math.max(0, rec.total - rec.interstitial - rec.rewardVideo)).toString(),
      ]);
    });
    historyRows.push(['', '', '', '', '']);
  }


  // Section 3: Event Stream & Audit Logs
  const logHeader = ['--- AD EVENT & DIAGNOSTIC AUDIT LOGS ---', '', '', ''];
  const logTableHeaders = ['Log Entry #', 'Timestamp', 'Event Category', 'Raw Message'];

  const logRows = logs.map((log, index) => {
    let category = 'SYSTEM';
    if (log.toLowerCase().includes('interstitial')) category = 'INTERSTITIAL_AD';
    else if (log.toLowerCase().includes('reward')) category = 'REWARD_VIDEO';
    else if (log.toLowerCase().includes('banner')) category = 'BANNER_AD';
    else if (log.toLowerCase().includes('native')) category = 'NATIVE_AD';
    else if (log.toLowerCase().includes('app open')) category = 'APP_OPEN_AD';
    else if (log.toLowerCase().includes('reset')) category = 'COUNTER_RESET';
    else if (log.toLowerCase().includes('config')) category = 'CONFIG_UPDATE';

    // Parse timestamp if bracketed [HH:MM:SS]
    const match = log.match(/\[(.*?)\]/);
    const time = match ? match[1] : formattedDate;
    const cleanMsg = log.replace(/\[(.*?)\]\s*/, '').replace(/"/g, '""');

    return [(index + 1).toString(), `"${time}"`, category, `"${cleanMsg}"`];
  });

  const allLines = [
    ...metadataRows.map((r) => r.join(',')),
    ...kpiRows.map((r) => r.join(',')),
    ...(historyRows.length > 0 ? historyRows.map((r) => r.join(',')) : []),
    logHeader.join(','),
    logTableHeaders.join(','),
    ...logRows.map((r) => r.join(',')),
  ];

  return allLines.join('\r\n');
}

export function downloadCsvFile(csvContent: string, filenamePrefix: string = 'fish_fishing_admob_analytics'): void {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  const filename = `${filenamePrefix}_${dateStr}_${timeStr}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
