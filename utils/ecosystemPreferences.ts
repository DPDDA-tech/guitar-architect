import type { AppState } from '../types';
import { loadConfig, saveConfig } from './persistence';

export type ThemeMode = 'light' | 'dark';
export type AppLang = 'pt' | 'en';

export const GLOBAL_THEME_KEY = 'ga_theme';
export const GLOBAL_LANG_KEY = 'ga_lang';
const LEGACY_THEME_KEYS = ['ga_kids_theme', 'ga_teens_theme'] as const;
const LEGACY_LANG_KEYS = ['ga_kids_lang', 'ga_teens_lang'] as const;

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const readTheme = (key: string): ThemeMode | null => {
  if (!isBrowser()) return null;
  const saved = localStorage.getItem(key);
  return saved === 'light' || saved === 'dark' ? saved : null;
};

const readLang = (key: string): AppLang | null => {
  if (!isBrowser()) return null;
  const saved = localStorage.getItem(key);
  return saved === 'pt' || saved === 'en' ? saved : null;
};

const syncLegacyThemeKeys = (theme: ThemeMode) => {
  if (!isBrowser()) return;
  LEGACY_THEME_KEYS.forEach((key) => localStorage.setItem(key, theme));
};

const syncLegacyLangKeys = (lang: AppLang) => {
  if (!isBrowser()) return;
  LEGACY_LANG_KEYS.forEach((key) => localStorage.setItem(key, lang));
};

const syncConfigPatch = (patch: Partial<Pick<AppState, 'theme' | 'lang'>>) => {
  if (!isBrowser()) return;

  const current = loadConfig();
  if (current) {
    saveConfig({ ...current, ...patch }, current.currentUser);
    return;
  }

  const fallback: AppState = {
    version: '1.8.7',
    activeProjectId: '',
    currentUser: 'guest',
    theme: patch.theme ?? 'dark',
    lang: patch.lang ?? 'pt',
    defaultInstrument: 'guitar-6',
    showTips: true,
  };

  saveConfig(fallback, fallback.currentUser);
};

export const getGlobalTheme = (): ThemeMode => {
  const globalTheme = readTheme(GLOBAL_THEME_KEY);
  if (globalTheme) return globalTheme;

  const legacyTheme = LEGACY_THEME_KEYS.map(readTheme).find(Boolean);
  if (legacyTheme) {
    if (isBrowser()) localStorage.setItem(GLOBAL_THEME_KEY, legacyTheme);
    return legacyTheme;
  }

  const fallback = loadConfig()?.theme;
  return fallback === 'light' ? 'light' : 'dark';
};

export const getGlobalLang = (): AppLang => {
  const globalLang = readLang(GLOBAL_LANG_KEY);
  if (globalLang) return globalLang;

  const legacyLang = LEGACY_LANG_KEYS.map(readLang).find(Boolean);
  if (legacyLang) {
    if (isBrowser()) localStorage.setItem(GLOBAL_LANG_KEY, legacyLang);
    return legacyLang;
  }

  return loadConfig()?.lang === 'en' ? 'en' : 'pt';
};

export const setGlobalTheme = (theme: ThemeMode) => {
  if (!isBrowser()) return;
  localStorage.setItem(GLOBAL_THEME_KEY, theme);
  syncLegacyThemeKeys(theme);
  syncConfigPatch({ theme });
  window.dispatchEvent(new CustomEvent('ga-preferences-updated', { detail: { theme } }));
};

export const setGlobalLang = (lang: AppLang) => {
  if (!isBrowser()) return;
  localStorage.setItem(GLOBAL_LANG_KEY, lang);
  syncLegacyLangKeys(lang);
  syncConfigPatch({ lang });
  (window as Window & { ga_lang?: string }).ga_lang = lang;
  window.dispatchEvent(new CustomEvent('ga-preferences-updated', { detail: { lang } }));
};

export const setGlobalPreferences = (theme: ThemeMode, lang: AppLang) => {
  setGlobalTheme(theme);
  setGlobalLang(lang);
};

export const getKidsTheme = (): ThemeMode => getGlobalTheme();
export const getKidsLang = (): AppLang => getGlobalLang();
export const getTeensTheme = (): ThemeMode => getGlobalTheme();
export const getTeensLang = (): AppLang => getGlobalLang();
