type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: GtagFunction;
  }
}

export const AnalyticsEvents = {
  KIDS_ACCESS: 'kids_access',
  TEENS_ACCESS: 'teens_access',
  STUDIO_ACCESS: 'studio_access',
  COLLECTIBLE_UNLOCKED: 'collectible_unlocked',
  GUIDED_PRACTICE_STARTED: 'guided_practice_started',
  TRIAD_MAP_USED: 'triad_map_used',
  TETRAD_MAP_USED: 'tetrad_map_used',
  CHORD_EXPLORER_USED: 'chord_explorer_used',
  LOGIN_COMPLETED: 'login_completed',
  SIGNUP_COMPLETED: 'signup_completed',
} as const;

export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents] | string;

const isBrowserEnv = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined';

const isLocalHost = (): boolean => {
  if (!isBrowserEnv()) return true;
  const { hostname } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '';
};

const canTrack = (): boolean => isBrowserEnv() && !isLocalHost() && typeof window.gtag === 'function';

export function trackPageView(path: string): void {
  if (!canTrack()) return;
  window.gtag!('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackEvent(name: AnalyticsEventName, params: Record<string, unknown> = {}): void {
  if (!canTrack()) return;
  window.gtag!('event', name, params);
}
