// Minimal Cloudflare Turnstile loader/renderer used by GearProductFeedbackModal.
// Loads the official widget script once and exposes a small render/reset API.

const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

export interface TurnstileRenderOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement | string, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

type TurnstileWindow = Window & { turnstile?: TurnstileApi };

let loadPromise: Promise<TurnstileApi> | null = null;

export function loadTurnstile(): Promise<TurnstileApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Turnstile can only load in a browser environment.'));
  }

  const turnstileWindow = window as TurnstileWindow;
  if (turnstileWindow.turnstile) {
    return Promise.resolve(turnstileWindow.turnstile);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT_SRC}"]`);

    const handleReady = () => {
      const api = (window as TurnstileWindow).turnstile;
      if (api) resolve(api);
      else reject(new Error('Turnstile script loaded without exposing window.turnstile.'));
    };

    if (existingScript) {
      if ((window as TurnstileWindow).turnstile) {
        handleReady();
      } else {
        existingScript.addEventListener('load', handleReady, { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Turnstile script.')), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', handleReady, { once: true });
    script.addEventListener('error', () => reject(new Error('Failed to load Turnstile script.')), { once: true });
    document.head.appendChild(script);
  });

  return loadPromise;
}
