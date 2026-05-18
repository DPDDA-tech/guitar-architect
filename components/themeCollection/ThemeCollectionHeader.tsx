import React from 'react';
import { ThemeCollectionItem } from '../../features/themeCollection/themeTypes';
import { getThemeCopy } from '../../features/themeCollection/themeCopy';
import ThemePreview from './ThemePreview';

interface ThemeCollectionHeaderProps {
  activeTheme: ThemeCollectionItem;
  unlockedCount: number;
  totalCount: number;
  isLight: boolean;
  lang: 'pt' | 'en';
  onBack: () => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
}

const ThemeCollectionHeader: React.FC<ThemeCollectionHeaderProps> = ({
  activeTheme,
  unlockedCount,
  totalCount,
  isLight,
  lang,
  onBack,
  onToggleTheme,
  onToggleLang,
}) => {
  const progress = Math.round((unlockedCount / totalCount) * 100);
  const activeThemeCopy = getThemeCopy(activeTheme, lang);

  return (
  <header className={`relative overflow-hidden border-b px-4 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] ${isLight ? 'border-[#cbd7e6] bg-[#f6f9fd]' : 'border-blue-950/50 bg-zinc-950'}`}>
    <div className="relative z-10 mx-auto grid max-w-[1700px] gap-5 lg:grid-cols-[1fr_360px] lg:items-center">
      <div className="relative z-20 max-w-full lg:max-w-[68%]">
        <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${isLight ? 'text-blue-500' : 'text-blue-300'}`}>Guitar Architect</p>
        <h1 className={`mt-1 text-2xl sm:text-3xl font-black italic uppercase tracking-tight ${isLight ? 'text-blue-600' : 'bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.18)]'}`}>
          {lang === 'pt' ? 'Coleção de Temas' : 'Theme Collection'}
        </h1>
        <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
          {lang === 'pt'
            ? 'Galeria premium de headstocks colecionáveis, preparada para imagens oficiais, desbloqueios e conquistas.'
            : 'Premium gallery of collectible headstocks, ready for official images, unlocks and achievements.'}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase shadow-sm ${isLight ? 'border-slate-300 bg-white text-slate-700' : 'border-slate-700 bg-slate-900 text-slate-200'}`}>
            {unlockedCount}/{totalCount} {lang === 'pt' ? 'desbloqueados' : 'unlocked'}
          </span>
          <span className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase shadow-sm ${isLight ? 'border-slate-300 bg-white text-slate-700' : 'border-slate-700 bg-slate-900 text-slate-200'}`}>
            {progress}% {lang === 'pt' ? 'concluído' : 'complete'}
          </span>
        </div>
      </div>

      <div className={`rounded-3xl border p-3 shadow-[0_16px_48px_rgba(15,23,42,0.12)] ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
        <ThemePreview theme={activeTheme} lang={lang} isLight={isLight} />
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">{lang === 'pt' ? 'Tema ativo' : 'Equipped Theme'}</p>
            <p className="font-black">{activeThemeCopy.name}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onToggleTheme} className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase shadow-sm ${isLight ? 'border-slate-300 bg-white text-slate-700' : 'border-slate-700 bg-slate-900 text-slate-100'}`}>
              {isLight ? (lang === 'pt' ? 'Escuro' : 'Dark') : (lang === 'pt' ? 'Claro' : 'Light')}
            </button>
            <button onClick={onToggleLang} className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase shadow-sm ${isLight ? 'border-slate-300 bg-white text-slate-700' : 'border-slate-700 bg-slate-900 text-slate-100'}`}>
              {lang === 'pt' ? 'EN' : 'PORT'}
            </button>
            <button onClick={onBack} className="rounded-xl border border-blue-500/50 bg-blue-600 px-3 py-2 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-950/30">
              {lang === 'pt' ? 'Voltar' : 'Back'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
);
};

export default ThemeCollectionHeader;
