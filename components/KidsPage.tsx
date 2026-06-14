import React, { useState } from 'react';
import { getKidsLang, getKidsTheme, setGlobalLang, setGlobalTheme } from '../utils/ecosystemPreferences';
import AppFooter from './AppFooter';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 4 9 14 14 0 0 1-4 9 14 14 0 0 1-4-9 14 14 0 0 1 4-9Z" />
  </svg>
);

const KidsPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getKidsTheme());
  const [lang, setLang] = useState<'pt' | 'en'>(() => getKidsLang());

  const isLight = theme === 'light';

  const copy = lang === 'pt'
    ? {
        subtitle: 'Um espaço lúdico para descobrir instrumentos, cores, sons e as primeiras notas musicais de forma divertida.',
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
        comingSoon: 'EM BREVE',
        backEcosystem: 'Voltar ao Ecossistema',
        backMain: 'Ir para Guitar Architect Principal',
      }
    : {
        subtitle: 'A playful space to discover instruments, colors, sounds, and first music notes in a fun way.',
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
        comingSoon: 'COMING SOON',
        backEcosystem: 'Back to Ecosystem',
        backMain: 'Go to Main Guitar Architect',
      };

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      setGlobalTheme(next);
      return next;
    });
  };

  const handleToggleLang = () => {
    setLang((prev) => {
      const next = prev === 'pt' ? 'en' : 'pt';
      setGlobalLang(next);
      return next;
    });
  };

  return (
    <>
    <div className={`relative p-6 md:p-12 transition-colors duration-700 ${isLight ? 'bg-slate-50 text-emerald-900' : 'bg-[#051109] text-emerald-50'}`}>
      <div className="relative mx-auto max-w-5xl">
        <header className={`relative flex flex-col items-center text-center mb-8 animate-in fade-in zoom-in-95 duration-1000 ${isLight ? 'rounded-[36px] border border-emerald-200/70 bg-white/75 backdrop-blur-sm px-4 py-5 md:px-8 md:py-7 shadow-[0_20px_50px_rgba(16,185,129,0.08)]' : ''}`}>
          <img src="/gakidslogo.webp" alt="GA Kids" className="w-32 h-32 md:w-48 md:h-48 object-contain mb-3 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-emerald-500">
            Guitar Architect Kids
          </h1>
          <p className="mt-2 max-w-2xl text-sm md:text-base font-bold opacity-80 leading-relaxed">
            {copy.subtitle}
          </p>

        </header>

        <div className="mb-8 flex items-center justify-end gap-2">
          <button
            onClick={() => navigateTo('/ecosystem')}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isLight ? 'border-emerald-300 bg-white text-emerald-700' : 'border-emerald-700 bg-emerald-950/70 text-emerald-200'}`}
            aria-label={lang === 'pt' ? 'Voltar ao ecossistema' : 'Back to ecosystem'}
            title={lang === 'pt' ? 'Ecossistema' : 'Ecosystem'}
          >
            <GlobeIcon />
          </button>
          <button
            onClick={handleToggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isLight ? 'border-emerald-300 bg-white text-emerald-700' : 'border-emerald-700 bg-emerald-950/70 text-emerald-200'}`}
            aria-label={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
            title={isLight ? (lang === 'pt' ? 'Modo escuro' : 'Dark mode') : (lang === 'pt' ? 'Modo claro' : 'Light mode')}
          >
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>
          <button
            onClick={handleToggleLang}
            className={`min-h-[40px] rounded-xl border px-3 py-2 text-[11px] font-black uppercase text-center ${isLight ? 'border-emerald-300 bg-white text-emerald-700' : 'border-emerald-700 bg-emerald-950/70 text-emerald-200'}`}
          >
            {lang.toUpperCase()}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {[
            {
              title: copy.firstSteps,
              subtitle: copy.firstStepsSubtitle,
              path: '/kids/first-steps',
              visual: (
                <svg viewBox="0 0 320 88" className="h-20 w-full" fill="none">
                  <path d="M20 58c28-10 56-10 88 0" stroke="#34d399" strokeWidth="9" strokeLinecap="round" />
                  <path d="M66 64C108 48 142 32 198 18" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="210" cy="20" r="12" fill="#fbbf24" />
                  <circle cx="236" cy="34" r="10" fill="#f472b6" />
                  <circle cx="186" cy="36" r="10" fill="#60a5fa" />
                  <circle cx="257" cy="52" r="9" fill="#a78bfa" />
                  <circle cx="120" cy="58" r="4.5" fill="#34d399" />
                  <circle cx="136" cy="62" r="4" fill="#f59e0b" />
                  <circle cx="152" cy="56" r="3.8" fill="#f472b6" />
                  <circle cx="199" cy="16" r="3" fill="#fff" />
                  <circle cx="245" cy="31" r="2.5" fill="#fff" />
                </svg>
              ),
            },
            {
              title: copy.discoverInstruments,
              subtitle: copy.discoverInstrumentsSubtitle,
              path: '/kids/instruments',
              visual: (
                <svg viewBox="0 0 320 88" className="h-20 w-full" fill="none">
                  <rect x="20" y="16" width="250" height="56" rx="12" stroke="#0ea5e9" strokeOpacity="0.35" strokeDasharray="5 5" />
                  <rect x="42" y="26" width="14" height="38" rx="7" fill="#f472b6" />
                  <path d="M56 30l72-14v18l-72 14z" fill="#ddd6fe" />
                  <line x1="60" y1="35" x2="145" y2="18" stroke="#7dd3fc" strokeWidth="2" />
                  <line x1="60" y1="43" x2="145" y2="26" stroke="#7dd3fc" strokeWidth="2" />
                  <line x1="60" y1="51" x2="145" y2="34" stroke="#7dd3fc" strokeWidth="2" />
                  <line x1="60" y1="59" x2="145" y2="42" stroke="#7dd3fc" strokeWidth="2" />
                  <circle cx="182" cy="24" r="3" fill="#22d3ee" />
                  <circle cx="202" cy="24" r="3" fill="#22d3ee" />
                  <circle cx="222" cy="24" r="3" fill="#22d3ee" />
                  <line x1="168" y1="26" x2="168" y2="66" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="188" y1="26" x2="188" y2="66" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="208" y1="26" x2="208" y2="66" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="228" y1="26" x2="228" y2="66" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="248" y1="26" x2="248" y2="66" stroke="#38bdf8" strokeWidth="2" />
                </svg>
              ),
            },
            {
              title: copy.knowNotes,
              subtitle: copy.knowNotesSubtitle,
              path: '/kids/notes',
              visual: (
                <svg viewBox="0 0 320 88" className="h-20 w-full" fill="none">
                  {['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'].map((color, idx) => (
                    <g key={color}>
                      <circle cx={32 + idx * 38} cy={44} r="15" fill={color} />
                      <circle cx={32 + idx * 38} cy={44} r="15" fill="url(#noteGlow)" fillOpacity="0.35" />
                    </g>
                  ))}
                  <defs>
                    <radialGradient id="noteGlow" cx="0.5" cy="0.5" r="0.6">
                      <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              ),
            },
            {
              title: lang === 'pt' ? 'O Tamanho dos Sons' : 'Sound Lengths',
              subtitle: lang === 'pt' ? 'Descubra sons rápidos, longos e pausas musicais.' : 'Discover short, long, and silent musical sounds.',
              path: '/kids/sound-lengths',
              visual: (
                <svg viewBox="0 0 320 88" className="h-20 w-full" fill="none">
                  <rect x="20" y="20" width="40" height="10" rx="5" fill="#22d3ee" />
                  <rect x="20" y="38" width="84" height="10" rx="5" fill="#34d399" />
                  <rect x="20" y="56" width="120" height="10" rx="5" fill="#fbbf24" />
                  <rect x="160" y="38" width="26" height="10" rx="5" fill="#f472b6" />
                  <rect x="192" y="38" width="26" height="10" rx="5" fill="#f472b6" />
                  <line x1="230" y1="18" x2="230" y2="66" stroke="#a78bfa" strokeWidth="5" strokeDasharray="4 7" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              title: copy.lightHunt,
              subtitle: copy.lightHuntSubtitle,
              path: '/kids/light-hunt',
              visual: (
                <svg viewBox="0 0 320 88" className="h-20 w-full" fill="none">
                  <line x1="20" y1="20" x2="280" y2="20" stroke="#164e63" strokeWidth="2" />
                  <line x1="20" y1="36" x2="280" y2="36" stroke="#164e63" strokeWidth="2" />
                  <line x1="20" y1="52" x2="280" y2="52" stroke="#164e63" strokeWidth="2" />
                  <line x1="20" y1="68" x2="280" y2="68" stroke="#164e63" strokeWidth="2" />
                  <circle cx="72" cy="36" r="10" fill="#ef4444" />
                  <circle cx="122" cy="52" r="10" fill="#f97316" />
                  <circle cx="176" cy="20" r="10" fill="#22c55e" />
                  <circle cx="232" cy="68" r="10" fill="#3b82f6" />
                  <circle cx="232" cy="68" r="16" stroke="#22d3ee" strokeOpacity="0.5" />
                </svg>
              ),
            },
            {
              title: lang === 'pt' ? 'Custom Shop' : 'Custom Shop',
              subtitle: lang === 'pt' ? 'Monte a guitarra dos seus sonhos!' : 'Build your dream guitar!',
              path: '/kids/custom-shop',
              visual: (
                <svg viewBox="0 0 320 88" className="h-20 w-full" fill="none">
                  <rect x="100" y="10" width="50" height="68" rx="10" fill="#a78bfa" opacity="0.9" />
                  <rect x="120" y="5" width="10" height="15" rx="3" fill="#7c3aed" />
                  <rect x="105" y="22" width="40" height="6" rx="3" fill="#fbbf24" opacity="0.9" />
                  <rect x="105" y="32" width="40" height="6" rx="3" fill="#fbbf24" opacity="0.6" />
                  <circle cx="125" cy="55" r="9" fill="#f472b6" />
                  <circle cx="125" cy="55" r="5" fill="#1e1b4b" />
                  <circle cx="200" cy="28" r="14" fill="#34d399" />
                  <circle cx="200" cy="28" r="8" fill="#059669" />
                  <circle cx="200" cy="28" r="3" fill="#ecfdf5" />
                  <circle cx="240" cy="52" r="11" fill="#f97316" />
                  <circle cx="240" cy="52" r="6" fill="#c2410c" />
                  <circle cx="70" cy="44" r="10" fill="#60a5fa" />
                  <circle cx="70" cy="44" r="5" fill="#1d4ed8" />
                  <path d="M155 28 Q180 18 200 28" stroke="#a7f3d0" strokeWidth="2" strokeDasharray="4 3" />
                  <path d="M155 55 Q178 70 200 55" stroke="#fde68a" strokeWidth="2" strokeDasharray="4 3" />
                </svg>
              ),
            },
            {
              title: copy.games,
              subtitle: copy.gamesSubtitle,
              path: '/kids/games',
              visual: (
                <svg viewBox="0 0 320 88" className="h-20 w-full" fill="none">
                  <rect x="24" y="28" width="48" height="32" rx="8" fill="#06b6d4" />
                  <rect x="82" y="18" width="40" height="26" rx="7" fill="#8b5cf6" />
                  <rect x="132" y="34" width="48" height="30" rx="8" fill="#22c55e" />
                  <rect x="190" y="20" width="44" height="26" rx="7" fill="#f59e0b" />
                  <rect x="244" y="34" width="42" height="30" rx="8" fill="#ec4899" />
                  <path d="M72 44h10M122 30h10M180 48h10M234 32h10" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
                  <path d="M20 74c14-10 28-10 42 0s28 10 42 0 28-10 42 0 28 10 42 0 28-10 42 0" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                  <circle cx="286" cy="49" r="4.5" fill="#22d3ee" className="animate-pulse" />
                </svg>
              ),
            },
          ].map((module, idx, arr) => {
            const isAvailable = Boolean(module.path);
            const isLastAlone = idx === arr.length - 1 && arr.length % 2 === 1;
            return (
              <button
                key={module.title}
                onClick={() => {
                  if (module.path) navigateTo(module.path);
                }}
                style={{ animationDelay: `${idx * 100}ms` }}
                className={`group p-4 md:p-5 rounded-[26px] border flex flex-col items-start text-left transition-all animate-in fade-in slide-in-from-bottom-4 ${isAvailable ? 'opacity-100 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] cursor-pointer' : 'opacity-70 hover:opacity-100 cursor-default'} ${isLight ? 'border-emerald-200 bg-white shadow-md' : 'border-emerald-600/70 bg-emerald-950/70 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.22)]'} ${isLastAlone ? 'md:col-span-2 md:max-w-[calc(50%-0.75rem)] md:mx-auto md:w-full' : ''}`}
              >
                <div className={`mb-2 w-full rounded-2xl border px-3 py-2 ${isLight ? 'border-emerald-200 bg-emerald-50/70' : 'border-emerald-500/30 bg-emerald-900/25'}`}>
                  <div className="h-[88px] w-full overflow-hidden">
                    {module.visual}
                  </div>
                </div>
                <h3 className={`text-base md:text-[17px] font-black uppercase tracking-wide ${isLight ? 'text-emerald-800 drop-shadow-[0_1px_0_rgba(16,185,129,0.15)]' : 'text-emerald-50 drop-shadow-[0_0_10px_rgba(16,185,129,0.28)]'}`}>{module.title}</h3>
                {'subtitle' in module && module.subtitle && (
                  <p className="mt-1 text-[10px] font-bold opacity-75 tracking-normal normal-case">
                    {module.subtitle}
                  </p>
                )}
                {!isAvailable && (
                  <p className="mt-2 text-[10px] font-bold opacity-50 tracking-widest">{copy.comingSoon}</p>
                )}
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

    <AppFooter
      isLight={isLight}
      lang={lang}
      logoSrc="/gakidslogo.webp"
      logoAlt="Guitar Architect Kids"
    />
    </>
  );
};

export default KidsPage;
