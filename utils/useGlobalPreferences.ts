import { useCallback, useEffect, useState } from 'react';
import {
  getGlobalLang,
  getGlobalTheme,
  setGlobalLang,
  setGlobalTheme,
  type AppLang,
  type ThemeMode,
} from './ecosystemPreferences';

interface GlobalPreferencesState {
  theme: ThemeMode;
  lang: AppLang;
}

export const useGlobalPreferences = () => {
  const [preferences, setPreferences] = useState<GlobalPreferencesState>(() => ({
    theme: getGlobalTheme(),
    lang: getGlobalLang(),
  }));

  useEffect(() => {
    const synchronize = () => setPreferences({ theme: getGlobalTheme(), lang: getGlobalLang() });
    window.addEventListener('ga-preferences-updated', synchronize);
    window.addEventListener('storage', synchronize);
    return () => {
      window.removeEventListener('ga-preferences-updated', synchronize);
      window.removeEventListener('storage', synchronize);
    };
  }, []);

  const updateTheme = useCallback((theme: ThemeMode) => {
    setGlobalTheme(theme);
    setPreferences(current => ({ ...current, theme }));
  }, []);

  const updateLang = useCallback((lang: AppLang) => {
    setGlobalLang(lang);
    setPreferences(current => ({ ...current, lang }));
  }, []);

  return { ...preferences, setTheme: updateTheme, setLang: updateLang };
};
