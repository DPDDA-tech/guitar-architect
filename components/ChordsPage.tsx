import React, { useMemo, useState } from 'react';
import { translations, Lang } from '../i18n';
import { loadConfig, saveConfig } from '../utils/persistence';
import { AppState, ThemeMode } from '../types';
import {
  CHORD_HERO_CHIPS,
  CHORD_LIBRARY_ITEMS,
  CHORD_PAGE_ACTIONS,
  CHORD_PRACTICE_CARDS,
  CHORD_PROGRESSIONS,
  CHORD_QUIZ_CARDS,
  CHORD_STUDY_MODULES,
  CHORDS_COPY,
  EXTENSION_PRESETS,
  HARMONIC_EXPLORER_CHORDS,
  VOICING_CATEGORIES,
} from '../data/chordsData';
import { recordAchievementEvent } from '../utils/achievementEvents';
import { navigateToPath, returnToFretboard } from '../utils/fretboardNavigation';

const PENDING_ACTION_KEY = 'ga_pending_fretboard_action';

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

const navigateTo = navigateToPath;

const getInitialConfig = (): AppState | null => {
  try {
    return loadConfig();
  } catch {
    return null;
  }
};

const PanelSurface = ({ children, isLight, className = '' }: { children: React.ReactNode; isLight: boolean; className?: string }) => (
  <section className={`rounded-2xl border ${isLight ? 'border-[#c6d3e2] bg-white/95 shadow-[0_18px_50px_rgba(71,85,105,0.12)]' : 'border-blue-900/55 bg-[linear-gradient(145deg,#08101c,#050914)] shadow-[0_18px_54px_rgba(2,6,23,0.48)]'} ${className}`}>
    {children}
  </section>
);

const ChordsPage: React.FC = () => {
  const [lang, setLang] = useState<Lang>(() => getInitialConfig()?.lang || 'pt');
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialConfig()?.theme || 'dark');
  const [activeModuleId, setActiveModuleId] = useState(CHORD_STUDY_MODULES[0].id);
  const [filter, setFilter] = useState('Todos');
  const isLight = theme === 'light';
  const t = translations[lang].harmonicCycle;
  const activeModule = useMemo(
    () => CHORD_STUDY_MODULES.find(module => module.id === activeModuleId) || CHORD_STUDY_MODULES[0],
    [activeModuleId],
  );
  const libraryFamilies = ['Todos', ...Array.from(new Set(CHORD_LIBRARY_ITEMS.map(item => item.family)))];
  const filteredLibrary = filter === 'Todos' ? CHORD_LIBRARY_ITEMS : CHORD_LIBRARY_ITEMS.filter(item => item.family === filter);
  const pageBackgroundStyle = isLight
    ? {
      backgroundColor: '#edf3f8',
      backgroundImage: 'linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    }
    : undefined;

  const persistConfigPatch = (patch: Partial<AppState>) => {
    const current = loadConfig();
    if (!current) return;
    saveConfig({ ...current, ...patch });
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = isLight ? 'dark' : 'light';
    setTheme(nextTheme);
    persistConfigPatch({ theme: nextTheme });
  };

  const toggleLang = () => {
    const nextLang: Lang = lang === 'pt' ? 'en' : 'pt';
    setLang(nextLang);
    persistConfigPatch({ lang: nextLang });
  };

  const executePayload = (payload: Record<string, unknown>, label?: string) => {
    recordAchievementEvent({ type: 'module_completion', moduleId: 'chords' });
    window.localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify({
      ...payload,
      moduleTitle: CHORDS_COPY.title[lang],
      moduleLabel: label,
      createdAt: new Date().toISOString(),
    }));
    navigateTo('/studio');
  };

  return (
    <div className={`min-h-screen ${isLight ? 'text-zinc-950' : 'blueprint-grid-dark text-zinc-100'}`} style={pageBackgroundStyle}>
      <header className={`border-b px-4 py-4 backdrop-blur-2xl ${isLight ? 'border-[#cbd7e6] bg-[#f6f9fd]/96' : 'border-blue-950/50 bg-zinc-950/92'}`}>
        <div className="mx-auto flex max-w-[1700px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${isLight ? 'text-blue-500' : 'text-blue-300'}`}>Guitar Architect</p>
            <h1 className={`mt-1 text-3xl font-black italic uppercase tracking-tight ${isLight ? 'text-blue-600' : 'bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.18)]'}`}>{CHORDS_COPY.title[lang]}</h1>
            <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{CHORDS_COPY.subtitle[lang]}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700 hover:bg-zinc-50' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100 hover:bg-[#161d2a]'}`}
              title={isLight ? (lang === 'pt' ? 'Modo Escuro' : 'Dark Mode') : (lang === 'pt' ? 'Modo Claro' : 'Light Mode')}
            >
              {isLight ? <MoonIcon /> : <SunIcon />}
            </button>
            <button onClick={toggleLang} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>{lang === 'pt' ? 'EN' : 'PORT'}</button>
            <button onClick={returnToFretboard} className="rounded-xl border border-blue-500/50 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-950/30">{t.backToFretboard}</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1700px] space-y-6 px-4 py-7">
        <PanelSurface isLight={isLight} className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute right-[-90px] top-[-90px] h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-blue-300">Harmonic workstation</p>
            <p className={`mt-4 max-w-5xl text-lg font-black leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{CHORDS_COPY.hero[lang]}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {CHORD_HERO_CHIPS.map(chip => (
                <span key={chip} className={`rounded-full border px-3 py-2 text-[9px] font-black uppercase ${isLight ? 'border-blue-200 bg-white text-blue-700' : 'border-blue-900/60 bg-[#07101e] text-blue-200'}`}>{chip}</span>
              ))}
            </div>
          </div>
        </PanelSurface>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{lang === 'pt' ? 'Mapa de estudo' : 'Study map'}</p>
            <div className="mt-5 space-y-3">
              {CHORD_STUDY_MODULES.map(module => {
                const active = module.id === activeModule.id;
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModuleId(module.id)}
                    className={`w-full rounded-xl border p-4 text-left transition hover:-translate-y-0.5 ${active ? 'border-blue-400 bg-blue-600 text-white shadow-[0_18px_42px_rgba(37,99,235,0.26)]' : isLight ? 'border-[#d4deea] bg-white text-slate-900' : 'border-blue-900/60 bg-[#070d18] text-slate-100'}`}
                  >
                    <p className={`text-[9px] font-black uppercase tracking-[0.16em] ${active ? 'text-blue-100' : 'text-blue-300'}`}>{module.category}</p>
                    <h2 className="mt-2 text-lg font-black">{module.title[lang]}</h2>
                    <p className={`mt-1.5 text-sm font-semibold ${active ? 'text-blue-100' : isLight ? 'text-slate-500' : 'text-slate-400'}`}>{module.subtitle[lang]}</p>
                  </button>
                );
              })}
            </div>
          </PanelSurface>

          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Conteúdo interno</p>
            <h2 className="mt-3 text-3xl font-black">{activeModule.title[lang]}</h2>
            <p className={`mt-3 text-sm font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{activeModule.body[lang]}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {activeModule.formulas.map(item => (
                <article key={`${activeModule.id}-${item.type}`} className={`rounded-xl border p-4 ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-900/60 bg-[#070d18]'}`}>
                  <h3 className="font-black">{item.type}</h3>
                  <p className="mt-2 rounded-lg border border-blue-500/20 bg-blue-600/10 px-3 py-2 text-center text-sm font-black text-blue-300">{item.formula}</p>
                  <p className={`mt-2 text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.example}</p>
                </article>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {activeModule.actions.map(action => (
                <button key={action.id} onClick={() => executePayload(action.payload, action.label[lang])} className="rounded-xl border border-blue-400/30 bg-[linear-gradient(180deg,#4f8df3,#2563eb)] px-4 py-3 text-[10px] font-black uppercase text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_12px_24px_rgba(37,99,235,0.20)]">
                  {action.label[lang]}
                </button>
              ))}
            </div>
          </PanelSurface>
        </div>

        <PanelSurface isLight={isLight} className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{lang === 'pt' ? 'Biblioteca de acordes' : 'Chord library'}</p>
              <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Fórmulas, intervalos, dificuldade e aplicação musical.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {libraryFamilies.map(family => (
                <button key={family} onClick={() => setFilter(family)} className={`rounded-xl border px-3 py-2 text-[9px] font-black uppercase ${filter === family ? 'border-blue-400 bg-blue-600 text-white' : isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-blue-900/55 bg-[#050914] text-slate-400'}`}>{family}</button>
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {filteredLibrary.map(chord => (
              <article key={chord.id} className={`rounded-xl border p-4 ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-900/60 bg-[#070d18]'}`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-black">{chord.name}</h3>
                  <span className="rounded-full border border-blue-500/20 bg-blue-600/10 px-2 py-1 text-[8px] font-black uppercase text-blue-300">{chord.difficulty}</span>
                </div>
                <p className="mt-2 text-sm font-black text-blue-300">{chord.formula}</p>
                <p className={`mt-2 text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{chord.intervals} · {chord.degree}</p>
                <p className={`mt-3 text-xs font-semibold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{chord.use}</p>
                <button onClick={() => executePayload(chord.payload, chord.name)} className="mt-4 w-full rounded-xl border border-blue-400/30 bg-blue-600 px-3 py-2 text-[9px] font-black uppercase text-white">Aplicar</button>
              </article>
            ))}
          </div>
        </PanelSurface>

        <div className="grid gap-6 xl:grid-cols-2">
          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{lang === 'pt' ? 'Explorador harmônico' : 'Harmonic explorer'}</p>
            <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Tom: C maior · Harmonia em tétrades · funções diatônicas.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {HARMONIC_EXPLORER_CHORDS.map(chord => (
                <button key={chord} onClick={() => executePayload(CHORD_PAGE_ACTIONS[0].payload, chord)} className={`rounded-xl border p-3 text-sm font-black ${isLight ? 'border-[#d2deeb] bg-white text-slate-800' : 'border-blue-900/60 bg-[#070d18] text-slate-100'}`}>{chord}</button>
              ))}
            </div>
          </PanelSurface>

          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{lang === 'pt' ? 'Conectar ao fretboard' : 'Connect to fretboard'}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {CHORD_PAGE_ACTIONS.map(action => (
                <button key={action.id} onClick={() => executePayload(action.payload, action.label[lang])} className="rounded-xl border border-blue-400/30 bg-[linear-gradient(180deg,#4f8df3,#2563eb)] px-4 py-3 text-[10px] font-black uppercase text-white">{action.label[lang]}</button>
              ))}
            </div>
          </PanelSurface>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Voicings e inversões</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {VOICING_CATEGORIES.map(item => (
                <article key={item.title} className={`rounded-xl border p-4 ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-900/60 bg-[#070d18]'}`}>
                  <h3 className="font-black">{item.title}</h3>
                  <p className={`mt-2 text-xs font-bold leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.body}</p>
                </article>
              ))}
            </div>
          </PanelSurface>

          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Tensões e extensões</p>
            <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Extensões naturais, tensões alteradas, dominantes alterados, lydian dominant e acordes híbridos.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {EXTENSION_PRESETS.map(preset => (
                <button key={preset} onClick={() => executePayload(CHORD_PAGE_ACTIONS[4].payload, preset)} className={`rounded-full border px-3 py-2 text-[9px] font-black uppercase ${isLight ? 'border-blue-200 bg-white text-blue-700' : 'border-blue-900/60 bg-[#07101e] text-blue-200'}`}>{preset}</button>
              ))}
            </div>
          </PanelSurface>
        </div>

        <PanelSurface isLight={isLight} className="p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Progressões prontas</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CHORD_PROGRESSIONS.map(progression => (
              <article key={progression.id} className={`rounded-xl border p-4 ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-900/60 bg-[#070d18]'}`}>
                <h3 className="text-lg font-black">{progression.title}</h3>
                <p className={`mt-1 text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{progression.subtitle}</p>
                <p className="mt-3 text-sm font-black text-blue-300">{progression.chords.join(' · ')}</p>
                <p className={`mt-2 text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{progression.function}</p>
                <button onClick={() => executePayload(progression.payload, progression.title)} className="mt-4 w-full rounded-xl border border-blue-400/30 bg-blue-600 px-3 py-2 text-[9px] font-black uppercase text-white">Reproduzir no fretboard</button>
              </article>
            ))}
          </div>
        </PanelSurface>

        <div className="grid gap-6 xl:grid-cols-3">
          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Treino prático</p>
            <div className="mt-4 space-y-2">
              {CHORD_PRACTICE_CARDS.map(card => <p key={card} className={`rounded-xl border p-3 text-sm font-black ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-900/60 bg-[#070d18]'}`}>{card}</p>)}
            </div>
          </PanelSurface>
          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Mini quiz</p>
            <div className="mt-4 space-y-2">
              {CHORD_QUIZ_CARDS.map(card => <p key={card} className={`rounded-xl border p-3 text-sm font-black ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-900/60 bg-[#070d18]'}`}>{card}</p>)}
            </div>
          </PanelSurface>
          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Exportação e favoritos</p>
            <p className={`mt-3 text-sm font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Use os favoritos da biblioteca de acordes no painel principal e exporte diagramas pelo fluxo PNG/PDF já existente do Guitar Architect.</p>
            <button onClick={() => executePayload({ source: 'study-module', action: 'openTool', root: 'C', scaleType: 'Major (Ionian)', tool: 'changes' }, 'Favoritos e mudanças')} className="mt-5 w-full rounded-xl border border-blue-400/30 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white">Abrir treino de acordes</button>
          </PanelSurface>
        </div>
      </main>
    </div>
  );
};

export default ChordsPage;
