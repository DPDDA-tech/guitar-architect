import { loadConfig } from './persistence';

export type ThemeMode = 'light' | 'dark';
export type AppLang = 'pt' | 'en';

export const getKidsTheme = (): ThemeMode => {
  const saved = localStorage.getItem('ga_kids_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  const fallback = loadConfig()?.theme;
  return fallback === 'light' ? 'light' : 'dark';
};

export const getKidsLang = (): AppLang => {
  const saved = localStorage.getItem('ga_kids_lang');
  if (saved === 'pt' || saved === 'en') return saved;
  return loadConfig()?.lang === 'en' ? 'en' : 'pt';
};

export const getTeensTheme = (): ThemeMode => {
  const saved = localStorage.getItem('ga_teens_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  const fallback = loadConfig()?.theme;
  return fallback === 'light' ? 'light' : 'dark';
};

export const getTeensLang = (): AppLang => {
  const saved = localStorage.getItem('ga_teens_lang');
  if (saved === 'pt' || saved === 'en') return saved;
  return loadConfig()?.lang === 'en' ? 'en' : 'pt';
};
