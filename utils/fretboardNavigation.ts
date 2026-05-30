const RETURN_CONTEXT_KEY = 'ga_fretboard_return_context';

type ReturnContext = {
  label: string;
  path: string;
  source: string;
};

const isValidReturnContext = (value: unknown): value is ReturnContext => {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Record<string, unknown>;
  return typeof maybe.label === 'string'
    && typeof maybe.path === 'string'
    && typeof maybe.source === 'string';
};

export const navigateToPath = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

export const returnToFretboard = () => {
  const raw = window.localStorage.getItem(RETURN_CONTEXT_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (!isValidReturnContext(parsed)) {
        window.localStorage.removeItem(RETURN_CONTEXT_KEY);
      }
    } catch {
      window.localStorage.removeItem(RETURN_CONTEXT_KEY);
    }
  }

  navigateToPath('/studio');
};

