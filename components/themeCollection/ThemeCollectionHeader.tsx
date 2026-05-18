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
    <header className={`relative overflow-hidden border-b px-4 py-5 backdrop-blur-2xl ${isLight ? 'border-[#cbd7e6] bg-[#f6f9fd]/96' : 'border-blue-950/50 bg-zinc-950/92'}`}>
      <svg viewBox="0 0 680 300" className={`pointer-events-none absolute -left-24 -top-8 h-72 w-[620px] ${isLight ? 'text-blue-300/22' : 'text-blue-800/20'}`} aria-hidden="true">
        <path d="M48 182 C128 111 220 84 335 100 L498 119 C557 126 600 85 636 24 C663 99 642 170 580 219 C530 259 452 255 356 226 L213 190 C138 172 91 193 48 238 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M95 183 C173 145 236 141 323 152 L490 172 C540 177 575 159 606 120" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 12" />
        <path d="M116 74 H560 M116 74 V246 M560 74 V246" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.58" />
        <path d="M155 250 H512 M512 250 l-10 -5 M512 250 l-10 5 M155 250 l10 -5 M155 250 l10 5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
        <circle cx="335" cy="100" r="4" fill="currentColor" opacity="0.45" />
        <circle cx="498" cy="119" r="4" fill="currentColor" opacity="0.38" />
        <circle cx="213" cy="190" r="4" fill="currentColor" opacity="0.35" />
        <path d="M196 92 V56 M498 119 V52 M213 190 V264" fill="none" stroke="currentColor" strokeWidth="0.65" opacity="0.42" strokeDasharray="4 8" />
        <text x="122" y="66" fill="currentColor" fontSize="10" fontWeight="900" letterSpacing="2" opacity="0.50">HEADSTOCK ARC</text>
        <text x="438" y="244" fill="currentColor" fontSize="9" fontWeight="900" letterSpacing="1.6" opacity="0.38">ALIGNMENT PATH</text>
        <text x="506" y="52" fill="currentColor" fontSize="8" fontWeight="900" letterSpacing="1.3" opacity="0.34">VECTOR NODE 04</text>
        <text x="220" y="268" fill="currentColor" fontSize="8" fontWeight="900" letterSpacing="1.3" opacity="0.32">REFERENCE RADIUS</text>
      </svg>
      <div className="relative mx-auto grid max-w-[1700px] gap-5 lg:grid-cols-[1fr_360px] lg:items-center">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${isLight ? 'text-blue-500' : 'text-blue-300'}`}>Guitar Architect</p>
          <h1 className={`mt-1 text-3xl font-black italic uppercase tracking-tight ${isLight ? 'text-blue-600' : 'bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.18)]'}`}>
            {lang === 'pt' ? 'Coleção de Temas' : 'Theme Collection'}
          </h1>
          <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {lang === 'pt'
              ? 'Galeria premium de headstocks colecionáveis, preparada para imagens oficiais, desbloqueios e conquistas.'
              : 'Premium gallery of collectible headstocks, ready for official images, unlocks and achievements.'}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-slate-700 bg-slate-900 text-slate-300'}`}>
              {unlockedCount}/{totalCount} {lang === 'pt' ? 'desbloqueados' : 'unlocked'}
            </span>
            <span className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-slate-700 bg-slate-900 text-slate-300'}`}>
              {progress}% {lang === 'pt' ? 'concluído' : 'complete'}
            </span>
          </div>
        </div>
        <div>
          <ThemePreview theme={activeTheme} lang={lang} />
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">{lang === 'pt' ? 'Tema ativo' : 'Equipped Theme'}</p>
              <p className="font-black">{activeThemeCopy.name}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={onToggleTheme} className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-slate-200 bg-white text-slate-700' : 'border-slate-700 bg-slate-900 text-slate-100'}`}>
                {isLight ? (lang === 'pt' ? 'Escuro' : 'Dark') : (lang === 'pt' ? 'Claro' : 'Light')}
              </button>
              <button onClick={onToggleLang} className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-slate-200 bg-white text-slate-700' : 'border-slate-700 bg-slate-900 text-slate-100'}`}>
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
