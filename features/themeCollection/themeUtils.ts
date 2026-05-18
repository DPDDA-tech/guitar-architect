import { DEFAULT_THEME_ID, THEME_REGISTRY } from './themeRegistry';
import { ThemeCollectionItem, ThemeCollectionState } from './themeTypes';

const STORAGE_KEY = 'ga_theme_collection_state';

export const getDefaultThemeState = (): ThemeCollectionState => ({
  activeThemeId: DEFAULT_THEME_ID,
  unlockedThemeIds: THEME_REGISTRY.filter(item => item.unlocked).map(item => item.id),
});

export const loadThemeCollectionState = (): ThemeCollectionState => {
  if (typeof window === 'undefined') return getDefaultThemeState();
  const fallback = getDefaultThemeState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
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

export const saveThemeCollectionState = (state: ThemeCollectionState) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const getThemeWithState = (theme: ThemeCollectionItem, state: ThemeCollectionState): ThemeCollectionItem => ({
  ...theme,
  unlocked: theme.unlocked || state.unlockedThemeIds.includes(theme.id),
});

export const selectTheme = (themeId: string, state: ThemeCollectionState): ThemeCollectionState => {
  if (!state.unlockedThemeIds.includes(themeId)) return state;
  const next = { ...state, activeThemeId: themeId };
  saveThemeCollectionState(next);
  return next;
};

export const unlockTheme = (themeId: string, state: ThemeCollectionState): ThemeCollectionState => {
  const next = {
    ...state,
    unlockedThemeIds: Array.from(new Set([...state.unlockedThemeIds, themeId])),
  };
  saveThemeCollectionState(next);
  return next;
};
