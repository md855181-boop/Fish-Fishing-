import { IpDetails } from '../types';

export const DEFAULT_IP_DETAILS: IpDetails = {
  ip: '192.168.1.10',
  city: 'Dhaka',
  country: 'Bangladesh',
  countryCode: 'BD',
  isp: 'Local Gateway / FiberNet',
  isReal: false,
  status: 'connected',
};

export async function fetchPublicIp(): Promise<Partial<IpDetails>> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      return {
        ip: data.ip || '192.168.1.10',
        city: data.city || 'Dhaka',
        country: data.country_name || 'Bangladesh',
        countryCode: data.country_code || 'BD',
        isp: data.org || 'Broadband Network',
        isReal: true,
        status: 'connected',
      };
    }
  } catch {
    // Fallback to ipify if ipapi failed
    try {
      const res2 = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      if (res2.ok) {
        const data2 = await res2.json();
        return {
          ip: data2.ip,
          isReal: true,
          status: 'connected',
        };
      }
    } catch {
      // silently fallback
    }
  }
  return {};
}
