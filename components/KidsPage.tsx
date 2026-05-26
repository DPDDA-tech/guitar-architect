import React, { useState } from 'react';
import { getKidsLang, getKidsTheme } from '../utils/ecosystemPreferences';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const KidsPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getKidsTheme());
  const [lang, setLang] = useState<'pt' | 'en'>(() => getKidsLang());

  const isLight = theme === 'light';

  const copy = lang === 'pt'
    ? {
        subtitle: 'Um espaço lúdico para descobrir instrumentos, cores, sons e as primeiras notas musicais de forma divertida.',
        workInProgress: 'Obra em andamento',
        firstSteps: 'Primeiros Passos',
        firstStepsSubtitle: 'Pinte as figuras dos instrumentos.',
        discoverInstruments: 'Descobrindo os Instrumentos',
        discoverInstrumentsSubtitle: 'Escolha instrumentos e veja modelos em detalhes.',
        knowNotes: 'Conhecendo as Notas',
        knowNotesSubtitle: 'Reconheça as 7 notas musicais.',
        lightHunt: 'Caça às Luzes',
        lightHuntSubtitle: 'Siga as luzes pelo braço musical.',
        games: 'Jogos Musicais',
        gamesSubtitle: 'Brinque e descubra no hub de jogos.',
        available: 'DISPONÍVEL',
        comingSoon: 'EM BREVE',
        backEcosystem: 'Voltar ao Ecossistema',
        backMain: 'Ir para Guitar Architect Principal',
        theme: 'Tema',
        light: 'Claro',
        dark: 'Escuro',
      }
    : {
        subtitle: 'A playful space to discover instruments, colors, sounds, and first music notes in a fun way.',
        workInProgress: 'Work in progress',
        firstSteps: 'First Steps',
        firstStepsSubtitle: 'Paint simple instrument figures.',
        discoverInstruments: 'Discovering Instruments',
        discoverInstrumentsSubtitle: 'Choose instruments and view models in detail.',
        knowNotes: 'Knowing Notes',
        knowNotesSubtitle: 'Recognize the 7 music notes.',
        lightHunt: 'Light Hunt',
        lightHuntSubtitle: 'Follow the lights through the musical neck.',
        games: 'Music Games',
        gamesSubtitle: 'Play and discover in the games hub.',
        available: 'AVAILABLE',
        comingSoon: 'COMING SOON',
        backEcosystem: 'Back to Ecosystem',
        backMain: 'Go to Main Guitar Architect',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
      };

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ga_kids_theme', next);
      return next;
    });
  };

  const handleToggleLang = () => {
    setLang((prev) => {
      const next = prev === 'pt' ? 'en' : 'pt';
      localStorage.setItem('ga_kids_lang', next);
      return next;
    });
  };

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? '#cbd5e1' : '#14532d75'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#cbd5e1' : '#14532d75'} 1px, transparent 1px)`,
    backgroundSize: '28px 28px',
  };

  return (
    <div className={`min-h-screen relative p-6 md:p-12 transition-colors duration-700 ${isLight ? 'bg-slate-50 text-emerald-900' : 'bg-[#051109] text-emerald-50'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />

      <div className="relative mx-auto max-w-5xl">
        <header className={`relative flex flex-col items-center text-center mb-12 animate-in fade-in zoom-in-95 duration-1000 ${isLight ? 'rounded-[36px] border border-emerald-200/70 bg-white/75 backdrop-blur-sm px-4 py-8 md:px-8 md:py-10 shadow-[0_20px_50px_rgba(16,185,129,0.08)]' : ''}`}>
          <img src="/gakidslogo.webp" alt="GA Kids" className="w-32 h-32 md:w-48 md:h-48 object-contain mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-emerald-500">
            Guitar Architect Kids
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-bold opacity-80 leading-relaxed">
            {copy.subtitle}
          </p>

          <div className="mt-6 flex w-full items-center justify-center">
            <span className="px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest text-emerald-400">
              {copy.workInProgress}
            </span>
            <div className="hidden md:flex absolute right-3 items-center gap-3">
              <button
                onClick={handleToggleTheme}
                className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-emerald-300 bg-white text-emerald-700' : 'border-emerald-700 bg-emerald-950/70 text-emerald-200'}`}
              >
                {copy.theme}: {isLight ? copy.light : copy.dark}
              </button>
              <button
                onClick={handleToggleLang}
                className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-emerald-300 bg-white text-emerald-700' : 'border-emerald-700 bg-emerald-950/70 text-emerald-200'}`}
              >
                {lang.toUpperCase()}
              </button>
            </div>
          </div>

          <div className="mt-3 flex md:hidden gap-2">
            <button
              onClick={handleToggleTheme}
              className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-emerald-300 bg-white text-emerald-700' : 'border-emerald-700 bg-emerald-950/70 text-emerald-200'}`}
            >
              {copy.theme}: {isLight ? copy.light : copy.dark}
            </button>
            <button
              onClick={handleToggleLang}
              className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-emerald-300 bg-white text-emerald-700' : 'border-emerald-700 bg-emerald-950/70 text-emerald-200'}`}
            >
              {lang.toUpperCase()}
            </button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {[
            {
              title: copy.firstSteps,
              subtitle: copy.firstStepsSubtitle,
              path: '/kids/first-steps',
              icon: (
                <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
                  <rect x="8" y="30" width="16" height="10" rx="5" fill="#34d399" />
                  <rect x="22" y="28" width="10" height="6" rx="3" fill="#fbbf24" />
                  <circle cx="36" cy="15" r="5" fill="#f472b6" />
                  <circle cx="31" cy="20" r="4.5" fill="#60a5fa" />
                  <circle cx="39" cy="22" r="4" fill="#f59e0b" />
                  <circle cx="35" cy="27" r="3.5" fill="#a78bfa" />
                  <circle cx="33.5" cy="18" r="1.4" fill="#ffffff" />
                </svg>
              ),
            },
            {
              title: copy.discoverInstruments,
              subtitle: copy.discoverInstrumentsSubtitle,
              path: '/kids/instruments',
              icon: (
                <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
                  <circle cx="16" cy="34" r="6" fill="#f472b6" />
                  <circle cx="31" cy="30" r="6" fill="#a78bfa" />
                  <rect x="20" y="12" width="4" height="20" rx="2" fill="#f472b6" />
                  <rect x="35" y="10" width="4" height="18" rx="2" fill="#a78bfa" />
                  <path d="M24 12l13-3v6l-13 3z" fill="#c4b5fd" />
                </svg>
              ),
            },
            {
              title: copy.knowNotes,
              subtitle: copy.knowNotesSubtitle,
              path: '/kids/notes',
              icon: (
                <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
                  <path d="M8 20h8l10-8v24l-10-8H8z" fill="#22d3ee" />
                  <path d="M31 18c3 2 3 10 0 12" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                  <path d="M36 14c5 4 5 16 0 20" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              title: 'O Tamanho dos Sons',
              subtitle: 'Descubra sons rápidos, longos e pausas musicais.',
              path: '/kids/sound-lengths',
              icon: (
                <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
                  <rect x="6" y="26" width="8" height="14" rx="4" fill="#22d3ee" />
                  <rect x="18" y="18" width="8" height="22" rx="4" fill="#34d399" />
                  <rect x="30" y="10" width="8" height="30" rx="4" fill="#fbbf24" />
                  <circle cx="42" cy="34" r="2.2" fill="#f472b6" />
                </svg>
              ),
            },
            {
              title: copy.lightHunt,
              subtitle: copy.lightHuntSubtitle,
              path: '/kids/light-hunt',
              icon: (
                <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
                  <circle cx="11" cy="11" r="4" fill="#22d3ee" />
                  <circle cx="24" cy="24" r="4" fill="#38bdf8" />
                  <circle cx="37" cy="37" r="4" fill="#0ea5e9" />
                  <path d="M11 11L24 24L37 37" stroke="#67e8f9" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              title: copy.games,
              subtitle: copy.gamesSubtitle,
              path: '/kids/games',
              icon: (
                <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
                  <rect x="6" y="14" width="36" height="20" rx="10" fill="#f59e0b" />
                  <circle cx="16" cy="24" r="2.5" fill="#fff" />
                  <rect x="14.5" y="19" width="3" height="10" rx="1.5" fill="#fff" />
                  <circle cx="31" cy="22" r="2.2" fill="#fff" />
                  <circle cx="35.5" cy="26.5" r="2.2" fill="#fff" />
                </svg>
              ),
            },
          ].map((module, idx) => {
            const isAvailable = Boolean(module.path);
            return (
              <button
                key={module.title}
                onClick={() => {
                  if (module.path) navigateTo(module.path);
                }}
                style={{ animationDelay: `${idx * 100}ms` }}
                className={`p-8 rounded-[32px] border flex flex-col items-center text-center transition-all animate-in fade-in slide-in-from-bottom-4 ${isAvailable ? 'opacity-100 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] cursor-pointer' : 'opacity-70 hover:opacity-100 cursor-default'} ${isLight ? 'border-emerald-200 bg-white shadow-md' : 'border-emerald-600/70 bg-emerald-950/70 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.22)]'}`}
              >
                <span className="mb-4 relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/60 bg-gradient-to-br from-emerald-400/20 via-cyan-400/10 to-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_28px_rgba(16,185,129,0.4)]">
                  {module.icon}
                </span>
                <h3 className="text-sm font-black uppercase tracking-tight">{module.title}</h3>
                {'subtitle' in module && module.subtitle && (
                  <p className="mt-2 text-[10px] font-bold opacity-70 tracking-normal normal-case">
                    {module.subtitle}
                  </p>
                )}
                <p className="mt-2 text-[10px] font-bold opacity-50 tracking-widest">{isAvailable ? copy.available : copy.comingSoon}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-4 mt-12">
          <button
            onClick={() => navigateTo('/ecosystem')}
            className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
          >
            {copy.backEcosystem}
          </button>
          <button
            onClick={() => navigateTo('/studio')}
            className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            {copy.backMain}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KidsPage;

