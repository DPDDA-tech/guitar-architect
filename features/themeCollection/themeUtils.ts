import { DEFAULT_THEME_ID, THEME_REGISTRY } from './themeRegistry';
import { ThemeCollectionItem, ThemeCollectionState } from './themeTypes';
import { getScopedStorageKey } from '../../utils/persistence';

const STORAGE_KEY = 'ga_theme_collection_state';

export const getDefaultThemeState = (): ThemeCollectionState => ({
  activeThemeId: DEFAULT_THEME_ID,
  unlockedThemeIds: THEME_REGISTRY.filter(item => item.unlocked).map(item => item.id),
});

export const loadThemeCollectionState = (userId?: string | null): ThemeCollectionState => {
  if (typeof window === 'undefined') return getDefaultThemeState();
  const fallback = getDefaultThemeState();
  const key = getScopedStorageKey(STORAGE_KEY, userId);
  const scopedData = window.localStorage.getItem(key);

  if (scopedData) {
    try {
      const parsed = JSON.parse(scopedData) as Partial<ThemeCollectionState>;
      const knownIds = new Set(THEME_REGISTRY.map(item => item.id));
      const unlockedThemeIds = Array.from(new Set([
        ...fallback.unlockedThemeIds,
        ...(parsed.unlockedThemeIds || []).filter(id => knownIds.has(id)),
      ]));
      const activeThemeId = parsed.activeThemeId && unlockedThemeIds.includes(parsed.activeThemeId)
        ? parsed.activeThemeId
        : fallback.activeThemeId;
      return { activeThemeId, unlockedThemeIds };
    } catch { return fallback; }
  }

  // MIGRATION
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    if (userId && userId !== 'guest') {
      window.localStorage.setItem(key, raw);
    }
    const parsed = JSON.parse(raw) as Partial<ThemeCollectionState>;
    const knownIds = new Set(THEME_REGISTRY.map(item => item.id));
    const unlockedThemeIds = Array.from(new Set([
      ...fallback.unlockedThemeIds,
      ...(parsed.unlockedThemeIds || []).filter(id => knownIds.has(id)),
    ]));
    const activeThemeId = parsed.activeThemeId && unlockedThemeIds.includes(parsed.activeThemeId)
      ? parsed.activeThemeId
      : fallback.activeThemeId;
    return { activeThemeId, unlockedThemeIds };
  } catch {
    return fallback;
  }
};

export const saveThemeCollectionState = (state: ThemeCollectionState, userId?: string | null) => {
  if (typeof window === 'undefined') return;
  const key = getScopedStorageKey(STORAGE_KEY, userId);
  window.localStorage.setItem(key, JSON.stringify(state));
};

export const getThemeWithState = (theme: ThemeCollectionItem, state: ThemeCollectionState): ThemeCollectionItem => ({
  ...theme,
  unlocked: theme.unlocked || state.unlockedThemeIds.includes(theme.id),
});

export const selectTheme = (themeId: string, state: ThemeCollectionState, userId?: string | null): ThemeCollectionState => {
  if (!state.unlockedThemeIds.includes(themeId)) return state;
  const next = { ...state, activeThemeId: themeId };
  saveThemeCollectionState(next, userId);
  return next;
};

export const unlockTheme = (themeId: string, state: ThemeCollectionState, userId?: string | null): ThemeCollectionState => {
  const next = {
    ...state,
    unlockedThemeIds: Array.from(new Set([...state.unlockedThemeIds, themeId])),
  };
  saveThemeCollectionState(next, userId);
  return next;
};
