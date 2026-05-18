import React, { useState } from 'react';
import { translations, Lang } from '../i18n';
import { loadConfig, saveConfig } from '../utils/persistence';
import { AppState, ThemeMode } from '../types';
import {
  INVERSION_GROUPS,
  MAJOR_FIELD_TETRADS,
  PRACTICAL_EXERCISES,
  STRING_SET_CARDS,
  TETRAD_FORMULAS,
  TRIAD_FORMULAS,
  TRIADS_TETRADS_ACTIONS,
  TRIADS_TETRADS_COPY,
  TriadsTetradsAction,
  VOICE_LEADING_EXAMPLE,
} from '../data/triadsTetradsData';
import { recordAchievementEvent } from '../utils/achievementEvents';

const PENDING_ACTION_KEY = 'ga_pending_fretboard_action';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const getInitialConfig = (): AppState | null => {
  try {
    return loadConfig();
  } catch {
    return null;
  }
};

const PanelSurface = ({
  children,
  isLight,
  className = '',
}: {
  children: React.ReactNode;
  isLight: boolean;
  className?: string;
}) => (
  <section className={`rounded-2xl border ${isLight ? 'border-[#c6d3e2] bg-white/95 shadow-[0_18px_50px_rgba(71,85,105,0.12)]' : 'border-blue-900/55 bg-[linear-gradient(145deg,#08101c,#050914)] shadow-[0_18px_54px_rgba(2,6,23,0.48)]'} ${className}`}>
    {children}
  </section>
);

const FormulaGrid = ({
  title,
  description,
  cards,
  isLight,
}: {
  title: string;
  description: string;
  cards: { id: string; title: string; formula: string; example: string }[];
  isLight: boolean;
}) => (
  <PanelSurface isLight={isLight} className="p-5 sm:p-6">
    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{title}</p>
    <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{description}</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(card => (
        <article key={card.id} className={`rounded-xl border p-4 ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-900/60 bg-[#070d18]'}`}>
          <h3 className="text-lg font-black">{card.title}</h3>
          <p className="mt-3 rounded-lg border border-blue-500/20 bg-blue-600/10 px-3 py-2 text-center text-sm font-black text-blue-300">{card.formula}</p>
          <p className={`mt-3 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{card.example}</p>
        </article>
      ))}
    </div>
  </PanelSurface>
);

const TriadsTetradsPage: React.FC = () => {
  const [lang, setLang] = useState<Lang>(() => getInitialConfig()?.lang || 'pt');
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialConfig()?.theme || 'dark');
  const isLight = theme === 'light';
  const t = translations[lang].harmonicCycle;
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

  const executeAction = (action: TriadsTetradsAction) => {
    recordAchievementEvent({ type: 'module_completion', moduleId: 'triads-tetrads' });
    recordAchievementEvent({ type: 'exercise_completion', exerciseId: 'triads-on-neck' });
    window.localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify({
      ...action.payload,
      createdAt: new Date().toISOString(),
    }));
    navigateTo('/');
  };

  return (
    <div className={`min-h-screen ${isLight ? 'text-zinc-950' : 'blueprint-grid-dark text-zinc-100'}`} style={pageBackgroundStyle}>
      <header className={`border-b px-4 py-4 backdrop-blur-2xl ${isLight ? 'border-[#cbd7e6] bg-[#f6f9fd]/96' : 'border-blue-950/50 bg-zinc-950/92'}`}>
        <div className="mx-auto flex max-w-[1700px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${isLight ? 'text-blue-500' : 'text-blue-300'}`}>Guitar Architect</p>
            <h1 className={`mt-1 text-3xl font-black italic uppercase tracking-tight ${isLight ? 'text-blue-600' : 'bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.18)]'}`}>
              {TRIADS_TETRADS_COPY.title[lang]}
            </h1>
            <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {TRIADS_TETRADS_COPY.subtitle[lang]}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={toggleTheme} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>
              {isLight ? 'Escuro' : 'Claro'}
            </button>
            <button onClick={toggleLang} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>
              {lang === 'pt' ? 'EN' : 'PORT'}
            </button>
            <button onClick={() => navigateTo('/')} className="rounded-xl border border-blue-500/50 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-950/30">
              {t.backToFretboard}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1700px] space-y-6 px-4 py-7">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <PanelSurface isLight={isLight} className="p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{lang === 'pt' ? 'Ponte teoria / braço' : 'Theory / fretboard bridge'}</p>
            <p className={`mt-4 text-base font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{TRIADS_TETRADS_COPY.intro[lang]}</p>
          </PanelSurface>

          <PanelSurface isLight={isLight} className="p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{lang === 'pt' ? 'Conectar ao fretboard' : 'Connect to fretboard'}</p>
            <div className="mt-5 space-y-3">
              {TRIADS_TETRADS_ACTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => executeAction(action)}
                  className="w-full rounded-xl border border-blue-400/30 bg-[linear-gradient(180deg,#4f8df3,#2563eb)] px-4 py-3 text-[10px] font-black uppercase text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_12px_24px_rgba(37,99,235,0.20)] transition hover:-translate-y-0.5"
                >
                  {action.label[lang]}
                </button>
              ))}
            </div>
          </PanelSurface>
        </div>

        <FormulaGrid
          title={lang === 'pt' ? 'Construção das tríades' : 'Triad construction'}
          description={lang === 'pt' ? 'Três notas essenciais: fundamental, terça e quinta.' : 'Three essential notes: root, third, and fifth.'}
          cards={TRIAD_FORMULAS}
          isLight={isLight}
        />

        <FormulaGrid
          title={lang === 'pt' ? 'Construção das tétrades' : 'Seventh chord construction'}
          description={lang === 'pt' ? 'A sétima revela mais função harmônica e cor.' : 'The seventh reveals more harmonic function and color.'}
          cards={TETRAD_FORMULAS}
          isLight={isLight}
        />

        <PanelSurface isLight={isLight} className="p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{lang === 'pt' ? 'Tétrades diatônicas no campo maior' : 'Diatonic seventh chords in major'}</p>
          <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {lang === 'pt'
              ? 'No campo maior, cada grau gera uma tétrade específica quando empilhamos terças dentro da escala.'
              : 'In the major field, each degree creates a specific seventh chord when stacking thirds inside the scale.'}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {MAJOR_FIELD_TETRADS.map(degree => (
              <article key={degree.degree} className={`rounded-xl border p-4 text-center ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-900/60 bg-[#070d18]'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">{degree.degree}</p>
                <p className="mt-2 text-lg font-black">{degree.quality}</p>
                <p className={`mt-2 text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{degree.example}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 rounded-xl border border-blue-500/20 bg-blue-600/10 px-4 py-3 text-sm font-black text-blue-300">
            Gmaj7 · Am7 · Bm7 · Cmaj7 · D7 · Em7 · F#m7(b5)
          </p>
        </PanelSurface>

        <div className="grid gap-6 xl:grid-cols-2">
          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{lang === 'pt' ? 'Inversões' : 'Inversions'}</p>
            <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {lang === 'pt'
                ? 'A nota mais grave define a inversão: fundamental, terça, quinta ou sétima no baixo.'
                : 'The lowest note defines the inversion: root, third, fifth, or seventh in the bass.'}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {INVERSION_GROUPS.map(group => (
                <article key={group.title} className={`rounded-xl border p-4 ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-900/60 bg-[#070d18]'}`}>
                  <h3 className="font-black">{group.title}</h3>
                  <div className="mt-3 space-y-2">
                    {group.items.map(item => <p key={item} className={`text-sm font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{item}</p>)}
                  </div>
                </article>
              ))}
            </div>
          </PanelSurface>

          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{lang === 'pt' ? 'Grupos de cordas' : 'String sets'}</p>
            <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {lang === 'pt'
                ? 'Na guitarra, tríades ficam mais úteis em grupos de três cordas: 1-2-3, 2-3-4, 3-4-5 e 4-5-6. No baixo, adapte para cordas adjacentes, registro e função.'
                : 'On guitar, triads become more useful on three-string sets: 1-2-3, 2-3-4, 3-4-5, and 4-5-6. On bass, adapt the idea to adjacent strings, register, and function.'}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {STRING_SET_CARDS.map(card => (
                <article key={card.pt} className={`rounded-xl border p-4 text-sm font-bold ${isLight ? 'border-[#d2deeb] bg-white text-slate-600' : 'border-blue-900/60 bg-[#070d18] text-slate-300'}`}>
                  {card[lang]}
                </article>
              ))}
            </div>
          </PanelSurface>
        </div>

        <PanelSurface isLight={isLight} className="p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{lang === 'pt' ? 'Condução por notas próximas' : 'Voice leading'}</p>
          <p className={`mt-2 text-sm font-bold leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {lang === 'pt'
              ? 'Condução por notas próximas significa trocar de acorde movendo o menor número possível de notas. O objetivo não é apenas tocar os acordes, mas encontrar regiões em que a troca soe fluida.'
              : 'Voice leading means changing chords while moving as few notes as possible. The goal is not just to play the chords, but to find regions where the movement sounds fluid.'}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {VOICE_LEADING_EXAMPLE.map(item => (
              <article key={item} className={`rounded-xl border p-4 text-sm font-black ${isLight ? 'border-[#d2deeb] bg-white text-slate-700' : 'border-blue-900/60 bg-[#070d18] text-slate-200'}`}>{item}</article>
            ))}
          </div>
        </PanelSurface>

        <PanelSurface isLight={isLight} className="p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{lang === 'pt' ? 'Exercícios práticos' : 'Practical exercises'}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {PRACTICAL_EXERCISES.map(exercise => (
              <article key={exercise.id} className={`rounded-xl border p-4 ${isLight ? 'border-[#d2deeb] bg-white' : 'border-blue-900/60 bg-[#070d18]'}`}>
                <h3 className="text-sm font-black">{exercise.title[lang]}</h3>
                <div className="mt-3 space-y-2">
                  {exercise.steps[lang].map(step => (
                    <p key={step} className={`text-xs font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{step}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </PanelSurface>
      </main>
    </div>
  );
};

export default TriadsTetradsPage;
