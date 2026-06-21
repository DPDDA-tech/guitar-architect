const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() || 'G-1P55PY0KFE';

type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: GtagFunction;
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

let isScriptLoaded = false;
let gtagLoadPromise: Promise<void> | null = null;
let gtagLoadResolver: (() => void) | null = null;
let gtagLoadRejecter: ((error: unknown) => void) | null = null;

const isBrowserEnv = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined';

const isLocalHost = (): boolean => {
  if (!isBrowserEnv()) return true;
  const { hostname } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '';
};

const canTrack = (): boolean => isBrowserEnv() && !isLocalHost();

function createGtagLoadPromise(): Promise<void> {
  if (!gtagLoadPromise) {
    gtagLoadPromise = new Promise((resolve, reject) => {
      gtagLoadResolver = resolve;
      gtagLoadRejecter = reject;
    });
  }

  return gtagLoadPromise;
}

function resolveGtagLoad(): void {
  if (!gtagLoadResolver) return;
  gtagLoadResolver();
  gtagLoadResolver = null;
  gtagLoadRejecter = null;
}

function rejectGtagLoad(error: unknown): void {
  if (!gtagLoadRejecter) return;
  gtagLoadRejecter(error);
  gtagLoadPromise = null;
  gtagLoadResolver = null;
  gtagLoadRejecter = null;
}

function setupGtagStub(): void {
  window.dataLayer = window.dataLayer || [];
  const stub = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  (stub as unknown as { q?: unknown; l?: number }).q = window.dataLayer;
  (stub as unknown as { q?: unknown; l?: number }).l = Date.now();
  window.gtag = stub as unknown as GtagFunction;
}

function loadGtagScript(): Promise<void> {
  if (!isBrowserEnv()) return Promise.resolve();
  if (isScriptLoaded) return createGtagLoadPromise();

  isScriptLoaded = true;
  setupGtagStub();
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

  const promise = createGtagLoadPromise();
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.onload = () => {
    resolveGtagLoad();
  };
  script.onerror = () => {
    isScriptLoaded = false;
    rejectGtagLoad(new Error(`Failed to load gtag.js from ${script.src}`));
  };
  (document.head || document.getElementsByTagName('head')[0]).appendChild(script);

  return promise;
}

export function initAnalytics(): void {
  if (!canTrack()) return;
  void loadGtagScript();
}

export function trackPageView(path: string): void {
  if (!canTrack()) return;
  void loadGtagScript().catch(() => undefined);
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    send_to: GA_MEASUREMENT_ID,
  });
}

export function trackEvent(name: AnalyticsEventName, params: Record<string, unknown> = {}): void {
  if (!canTrack()) return;
  void loadGtagScript().catch(() => undefined);
  window.gtag('event', name, params);
}
