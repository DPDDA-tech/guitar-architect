export type ThemeMode = 'light' | 'dark';

export type EcosystemBrandId = 'kids' | 'teens' | 'studio' | 'academy';

export const ECOSYSTEM_BRAND_ASSETS: Record<EcosystemBrandId, Record<ThemeMode, string>> = {
  kids: { light: '/gakidslogo.webp', dark: '/gakidslogodm.webp' },
  teens: { light: '/gateenslogo.webp', dark: '/gateenslogodm.webp' },
  studio: { light: '/logogastudio.webp', dark: '/logogastudiodm.webp' },
  academy: { light: '/gamyacademylogo.webp', dark: '/gamyacademylogodm.webp' },
};

export const getEcosystemBrandAsset = (brand: EcosystemBrandId, theme: ThemeMode) =>
  ECOSYSTEM_BRAND_ASSETS[brand][theme];

const getBrandForPath = (path: string): EcosystemBrandId | null => {
  const match = (Object.entries(ECOSYSTEM_BRAND_ASSETS) as Array<[
    EcosystemBrandId,
    Record<ThemeMode, string>,
  ]>).find(([, assets]) => path === assets.light || path === assets.dark);

  return match?.[0] ?? null;
};

export const syncEcosystemBrandImages = (
  theme: ThemeMode,
  root: ParentNode = document,
) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  root.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    const rawSrc = image.getAttribute('src');
    if (!rawSrc) return;

    let path = rawSrc;
    try {
      path = new URL(rawSrc, window.location.origin).pathname;
    } catch {
      return;
    }

    const brand = getBrandForPath(path);
    if (!brand) return;

    const nextSrc = getEcosystemBrandAsset(brand, theme);
    if (rawSrc !== nextSrc) image.setAttribute('src', nextSrc);
  });
};

const OBSERVER_KEY = '__gaEcosystemBrandObserverInstalled';

type BrandObserverWindow = Window & {
  [OBSERVER_KEY]?: boolean;
};

export const installEcosystemBrandAssetSync = (getTheme: () => ThemeMode) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const browserWindow = window as BrandObserverWindow;
  if (browserWindow[OBSERVER_KEY]) return;
  browserWindow[OBSERVER_KEY] = true;

  const apply = () => syncEcosystemBrandImages(getTheme());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    window.requestAnimationFrame(apply);
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches('img')) syncEcosystemBrandImages(getTheme(), node.parentNode ?? document);
        else syncEcosystemBrandImages(getTheme(), node);
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
};
