import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GlobalPreferenceControls from '../components/GlobalPreferenceControls';
import MyAcademyUnitPrototypePage from '../components/MyAcademyUnitPrototypePage';
import { ECOSYSTEM_BRAND_ASSETS, getEcosystemBrandAsset } from '../utils/ecosystemBrandAssets';
import {
  GLOBAL_LANG_KEY,
  GLOBAL_THEME_KEY,
  getGlobalLang,
  getGlobalTheme,
  setGlobalLang,
  setGlobalTheme,
} from '../utils/ecosystemPreferences';

const createMemoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, String(value)),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  } satisfies Storage;
};

describe('global ecosystem preferences', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    vi.stubGlobal('window', { dispatchEvent: vi.fn() });
    vi.stubGlobal('CustomEvent', class CustomEventMock { constructor(public type: string, public init?: unknown) {} });
  });

  it('shares the established theme and language keys without My Academy alternatives', () => {
    setGlobalTheme('light');
    setGlobalLang('en');

    expect(localStorage.getItem(GLOBAL_THEME_KEY)).toBe('light');
    expect(localStorage.getItem(GLOBAL_LANG_KEY)).toBe('en');
    expect(getGlobalTheme()).toBe('light');
    expect(getGlobalLang()).toBe('en');
    expect(localStorage.getItem('ga_my_academy_theme')).toBeNull();
    expect(localStorage.getItem('ga_my_academy_lang')).toBeNull();
  });

  it('maps each brand to the exact light and dark assets', () => {
    expect(ECOSYSTEM_BRAND_ASSETS).toEqual({
      kids: { light: '/gakidslogo.webp', dark: '/gakidslogodm.webp' },
      teens: { light: '/gateenslogo.webp', dark: '/gateenslogodm.webp' },
      studio: { light: '/logogastudio.webp', dark: '/logogastudiodm.webp' },
      academy: { light: '/gamyacademylogo.webp', dark: '/gamyacademylogodm.webp' },
    });
    expect(getEcosystemBrandAsset('academy', 'dark')).toBe('/gamyacademylogodm.webp');
  });

  it('exposes current theme and language states through the shared controls', () => {
    const markup = renderToStaticMarkup(React.createElement(GlobalPreferenceControls, {
      theme: 'dark',
      lang: 'en',
      onThemeChange: vi.fn(),
      onLangChange: vi.fn(),
    }));

    expect(markup).toContain('data-current-theme="dark"');
    expect(markup).toContain('data-current-lang="en"');
    expect(markup).toContain('Global preferences');
  });

  it('keeps the pilot substance in Portuguese and adds a non-blocking English notice', () => {
    localStorage.setItem(GLOBAL_THEME_KEY, 'dark');
    localStorage.setItem(GLOBAL_LANG_KEY, 'en');
    const markup = renderToStaticMarkup(React.createElement(MyAcademyUnitPrototypePage));

    expect(markup).toContain('This pilot experience is currently available in Portuguese only.');
    expect(markup).toContain('Começar');
    expect(markup).toContain('Iniciação');
  });
});
