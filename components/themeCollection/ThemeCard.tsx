import React from 'react';
import { ThemeCollectionItem } from '../../features/themeCollection/themeTypes';
import { getThemeCopy, getThemeLevelLabel } from '../../features/themeCollection/themeCopy';
import ThemeLockedOverlay from './ThemeLockedOverlay';
import ThemePreview from './ThemePreview';

interface ThemeCardProps {
  theme: ThemeCollectionItem;
  isActive: boolean;
  isLight: boolean;
  lang: 'pt' | 'en';
  onSelect: (themeId: string) => void;
}

const rarityClass = {
  common: 'border-slate-400/28',
  rare: 'border-blue-400/60 ring-1 ring-blue-300/16 after:pointer-events-none after:absolute after:inset-[3px] after:rounded-[14px] after:border after:border-blue-200/10 after:content-[""]',
  epic: 'border-violet-400/65 ring-1 ring-violet-300/22 before:pointer-events-none before:absolute before:inset-[-1px] before:rounded-2xl before:bg-violet-400/10 before:blur-xl before:content-[""] after:pointer-events-none after:absolute after:inset-[3px] after:rounded-[14px] after:border after:border-fuchsia-200/18 after:content-[""]',
  legendary: 'border-amber-300/70 ring-1 ring-amber-200/32 before:pointer-events-none before:absolute before:inset-[-2px] before:rounded-2xl before:bg-[radial-gradient(circle_at_30%_0%,rgba(251,191,36,0.24),transparent_34%)] before:blur-xl before:content-[""] after:pointer-events-none after:absolute after:inset-[3px] after:rounded-[14px] after:border after:border-amber-100/22 after:content-[""]',
};

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isActive, isLight, lang, onSelect }) => {
  const locked = !theme.unlocked;
  const copy = getThemeCopy(theme, lang);
  const rarityLabel = getThemeLevelLabel(theme, lang);

  return (
    <article
      className={`group relative rounded-2xl border p-4 transition duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-400 ${rarityClass[theme.rarity]} ${theme.rarity === 'legendary' && !locked ? 'animate-[pulse_8s_ease-in-out_infinite]' : ''} ${isLight ? 'bg-white/88 shadow-[0_18px_44px_rgba(71,85,105,0.12)]' : 'bg-slate-950/70 shadow-[0_18px_44px_rgba(2,6,23,0.38)]'} ${locked ? 'opacity-78' : ''}`}
      style={{ boxShadow: locked ? undefined : theme.rarity === 'common' ? `0 12px 30px ${theme.glowColor || 'rgba(37,99,235,0.12)'}` : `0 18px 44px ${theme.glowColor || 'rgba(37,99,235,0.16)'}, 0 0 34px ${theme.glowColor || 'rgba(37,99,235,0.14)'}` }}
    >
      {theme.rarity === 'legendary' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-60">
          <span className="absolute left-8 top-6 h-1 w-1 rounded-full bg-amber-100/70" />
          <span className="absolute right-10 top-14 h-1 w-1 rounded-full bg-amber-100/50" />
          <span className="absolute bottom-9 left-1/2 h-1 w-1 rounded-full bg-amber-100/50" />
        </div>
      )}
      {!locked && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-0 transition duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.16),transparent_34%)]" />
          <div className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12 bg-white/10 blur-xl transition duration-700 group-hover:translate-x-[260%]" />
          <span className="absolute right-8 top-8 h-1 w-1 rounded-full bg-white/50" />
          <span className="absolute bottom-10 left-10 h-1 w-1 rounded-full bg-white/35" />
        </div>
      )}
      <div className="relative">
        <ThemePreview theme={theme} locked={locked} compact lang={lang} />
        {locked && <ThemeLockedOverlay label={lang === 'pt' ? 'Bloqueado' : 'Locked'} />}
      </div>
      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-black tracking-tight">{copy.name}</h3>
            <p className={`mt-1 text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{copy.subtitle}</p>
          </div>
          <span className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase ${isLight ? 'border-slate-200 text-slate-600' : 'border-slate-700 text-slate-300'}`}>
            {rarityLabel}
          </span>
        </div>
        <p className={`mt-3 min-h-[48px] text-xs font-semibold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{copy.description}</p>
        {locked && copy.unlockRequirement && (
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{copy.unlockRequirement}</p>
        )}
        <button
          onClick={() => onSelect(theme.id)}
          disabled={locked}
          className={`mt-4 w-full rounded-xl border px-4 py-3 text-[10px] font-black uppercase transition focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-45 ${isActive ? 'border-emerald-300/50 bg-[linear-gradient(180deg,#10b981,#047857)] text-white shadow-[0_10px_24px_rgba(16,185,129,0.24),inset_0_1px_0_rgba(255,255,255,0.20)]' : isLight ? 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700' : 'border-slate-700 bg-slate-900 text-slate-100 hover:border-blue-500'}`}
          aria-label={`${lang === 'pt' ? 'Usar tema' : 'Use theme'} ${copy.name}`}
        >
          {isActive ? (lang === 'pt' ? '✓ EQUIPADO' : '✓ EQUIPPED') : locked ? (lang === 'pt' ? 'Bloqueado' : 'Locked') : (lang === 'pt' ? 'Ativar' : 'Activate')}
        </button>
      </div>
    </article>
  );
};

export default ThemeCard;
