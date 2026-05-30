import type { FretboardIntent } from '../types/fretboardIntent';

const PENDING_FRETBOARD_ACTION_KEY = 'ga_pending_fretboard_action';

const navigateToStudio = () => {
  window.history.pushState(null, '', '/studio');
  window.dispatchEvent(new Event('ga-route-change'));
};

const isValidIntent = (intent: Partial<FretboardIntent>) => {
  return Boolean(
    intent
    && typeof intent.source === 'string'
    && typeof intent.action === 'string'
    && typeof intent.root === 'string'
    && typeof intent.scaleType === 'string',
  );
};

export const sendFretboardIntent = (input: Omit<FretboardIntent, 'version' | 'createdAt'>) => {
  if (!isValidIntent(input)) return false;

  const intent = {
    ...input,
    version: 1,
    createdAt: new Date().toISOString(),
  } as FretboardIntent;

  window.localStorage.setItem(PENDING_FRETBOARD_ACTION_KEY, JSON.stringify(intent));
  navigateToStudio();
  return true;
};
