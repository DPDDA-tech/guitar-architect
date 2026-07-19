import type { ThemeMode } from './ecosystemPreferences';

export type EcosystemBrandId = 'kids' | 'teens' | 'studio' | 'academy';

export const ECOSYSTEM_BRAND_ASSETS: Record<EcosystemBrandId, Record<ThemeMode, string>> = {
  kids: { light: '/gakidslogo.webp', dark: '/gakidslogodm.webp' },
  teens: { light: '/gateenslogo.webp', dark: '/gateenslogodm.webp' },
  studio: { light: '/logogastudio.webp', dark: '/logogastudiodm.webp' },
  academy: { light: '/gamyacademylogo.webp', dark: '/gamyacademylogodm.webp' },
};

export const getEcosystemBrandAsset = (brand: EcosystemBrandId, theme: ThemeMode) =>
  ECOSYSTEM_BRAND_ASSETS[brand][theme];
