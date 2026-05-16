import { InstrumentType } from '../types';

export type BrandVariant = 'guitar' | 'extended-guitar' | 'bass';

export interface BrandAssets {
  variant: BrandVariant;
  logo: string;
  hero: string;
  accent: string;
  accentSoft: string;
  accentShadow: string;
  label: string;
}

export const getBrandAssets = (instrumentType: InstrumentType): BrandAssets => {
  if (instrumentType === 'bass-4' || instrumentType === 'bass-5') {
    return {
      variant: 'bass',
      logo: '/Logo Bass.webp',
      hero: '/Hero Bass.webp',
      accent: '#22c55e',
      accentSoft: 'rgba(34,197,94,0.16)',
      accentShadow: 'rgba(34,197,94,0.28)',
      label: 'Bass',
    };
  }

  if (instrumentType === 'guitar-7' || instrumentType === 'guitar-8') {
    return {
      variant: 'extended-guitar',
      logo: '/Logo GAmpl.webp',
      hero: '/Hero GAmpl.webp',
      accent: '#8b5cf6',
      accentSoft: 'rgba(139,92,246,0.16)',
      accentShadow: 'rgba(139,92,246,0.28)',
      label: 'Extended Guitar',
    };
  }

  return {
    variant: 'guitar',
    logo: '/Logo Guitar.webp',
    hero: '/Hero Guitar.webp',
    accent: '#2563eb',
    accentSoft: 'rgba(37,99,235,0.14)',
    accentShadow: 'rgba(37,99,235,0.26)',
    label: 'Guitar',
  };
};
