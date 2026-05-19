import React, { useMemo, useState } from 'react';
import { translations, Lang } from '../i18n';
import { LEARN_MODULES, LEARN_PRACTICE_TOOLS, LearnAction, LearnModule, LearnModuleCategory } from '../data/learnModules';
import { LEARN_EXERCISES } from '../data/learnExercises';
import { loadConfig, saveConfig } from '../utils/persistence';
import { AppState, ThemeMode } from '../types';
import { recordAchievementEvent } from '../utils/achievementEvents';
import QuickToolsModal from './QuickToolsModal';

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

const categoryLabels: Record<LearnModuleCategory, string> = {
  theory: 'Teoria',
  practice: 'Prática',
  tool: 'Ferramenta',
  fretboard: 'Fretboard',
  harmony: 'Harmonia',
  technique: 'Técnica',
};

const categoryClasses: Record<LearnModuleCategory, string> = {
  theory: 'border-cyan-400/30 text-cyan-200 bg-cyan-950/22',
  practice: 'border-emerald-400/30 text-emerald-200 bg-emerald-950/22',
  tool: 'border-amber-400/30 text-amber-200 bg-amber-950/22',
  fretboard: 'border-blue-400/30 text-blue-200 bg-blue-950/24',
  harmony: 'border-violet-400/30 text-violet-200 bg-violet-950/24',
  technique: 'border-rose-400/30 text-rose-200 bg-rose-950/20',
};

const lightCategoryClasses: Record<LearnModuleCategory, string> = {
  theory: 'border-cyan-200 text-cyan-700 bg-cyan-50',
  practice: 'border-emerald-200 text-emerald-700 bg-emerald-50',
  tool: 'border-amber-200 text-amber-700 bg-amber-50',
  fretboard: 'border-blue-200 text-blue-700 bg-blue-50',
  harmony: 'border-violet-200 text-violet-700 bg-violet-50',
  technique: 'border-rose-200 text-rose-700 bg-rose-50',
};

const statusLabel = (module: LearnModule, active: boolean) => {
  if (active) return 'Ativo';
  if (module.status === 'completed') return 'Concluído';
  return 'Disponível';
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
  <section
    className={`rounded-2xl border ${
      isLight
        ? 'border-[#c6d3e2] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,248,252,0.9))] shadow-[0_24px_80px_rgba(71,85,105,0.16),inset_0_1px_0_rgba(255,255,255,0.88)]'
        : 'border-blue-900/38 bg-[linear-gradient(145deg,rgba(8,13,22,0.98),rgba(3,7,18,0.94))] shadow-[0_28px_90px_rgba(2,6,23,0.48),inset_0_1px_0_rgba(96,165,250,0.06)]'
    } ${className}`}
  >
    {children}
  </section>
);

const executeLearnAction = (action: LearnAction, module?: LearnModule, openQuickTool?: (tool: 'tuner' | 'metronome') => void) => {
  const payload = {
    ...(typeof action.payload === 'object' && action.payload ? action.payload : {}),
    moduleTitle: module?.title,
    moduleLabel: action.label,
    createdAt: new Date().toISOString(),
  };
  const payloadRecord = payload as Record<string, unknown>;

  switch (action.type) {
    case 'openTool':
      if (payloadRecord.tool === 'metronome' || payloadRecord.tool === 'tuner') {
        if (payloadRecord.tool === 'metronome') {
          recordAchievementEvent({ type: 'exploration', key: 'open_metronome' });
        }
        openQuickTool?.(payloadRecord.tool);
        break;
      }
      window.localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(payload));
      navigateTo('/');
      break;
    case 'pendingFretboardAction':
    case 'startPractice':
      if (payloadRecord.tool === 'metronome') {
        recordAchievementEvent({ type: 'exploration', key: 'open_metronome' });
      }
      if (payloadRecord.action === 'scale') {
        recordAchievementEvent({ type: 'exploration', key: 'apply_scale' });
      }
      if (typeof payloadRecord.exerciseId === 'string') {
        recordAchievementEvent({
          type: 'exercise_completion',
          exerciseId: payloadRecord.exerciseId,
          bpm: typeof payloadRecord.bpm === 'number' ? payloadRecord.bpm : undefined,
        });
      }
      window.localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(payload));
      navigateTo('/');
      break;
    case 'navigate':
      navigateTo(action.href || '/');
      break;
  }
};

const LearnPage: React.FC = () => {
  const [lang, setLang] = useState<Lang>(() => getInitialConfig()?.lang || 'pt');
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialConfig()?.theme || 'dark');
  const [activeModuleId, setActiveModuleId] = useState(LEARN_MODULES[0].id);
  const [quickTool, setQuickTool] = useState<'tuner' | 'metronome' | null>(null);
  const isLight = theme === 'light';
  const t = translations[lang].harmonicCycle;
  const activeModule = useMemo(
    () => LEARN_MODULES.find(module => module.id === activeModuleId) || LEARN_MODULES[0],
    [activeModuleId],
  );
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

  const openHeaderTool = (tool: 'tuner' | 'metronome') => {
    if (tool === 'metronome') recordAchievementEvent({ type: 'exploration', key: 'open_metronome' });
    setQuickTool(tool);
  };

  return (
    <div className={`min-h-screen ${isLight ? 'text-zinc-950' : 'blueprint-grid-dark text-zinc-100'}`} style={pageBackgroundStyle}>
      <header className={`border-b px-4 py-4 backdrop-blur-2xl ${isLight ? 'border-[#cbd7e6] bg-[#f6f9fd]/96' : 'border-blue-950/50 bg-zinc-950/92'}`}>
        <div className="mx-auto flex max-w-[1700px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${isLight ? 'text-blue-500' : 'text-blue-300'}`}>Guitar Architect</p>
            <h1 className={`mt-1 text-3xl font-black italic uppercase tracking-tight ${isLight ? 'text-blue-600' : 'bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.18)]'}`}>
              Aprender
            </h1>
            <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Central pedagógica para organizar teoria, ferramentas, fretboard e prática em uma jornada aplicada.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={toggleTheme} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>
              {isLight ? 'Escuro' : 'Claro'}
            </button>
            <button onClick={toggleLang} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>
              {lang === 'pt' ? 'EN' : 'PORT'}
            </button>
            <button onClick={() => openHeaderTool('metronome')} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>
              {lang === 'pt' ? 'Metrônomo' : 'Metronome'}
            </button>
            <button onClick={() => openHeaderTool('tuner')} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>
              {lang === 'pt' ? 'Afinador' : 'Tuner'}
            </button>
            <button onClick={() => navigateTo('/')} className="rounded-xl border border-blue-500/50 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-950/30">
              {t.backToFretboard}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1700px] px-4 py-7">
        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Mapa de estudo</p>
                <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Do preparo do instrumento à improvisação guiada.</p>
              </div>
              <span className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-blue-800/60 bg-blue-950/30 text-blue-200'}`}>
                {LEARN_MODULES.length} módulos
              </span>
              <span className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-emerald-800/60 bg-emerald-950/20 text-emerald-200'}`}>
                {LEARN_EXERCISES.length} exercícios
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {LEARN_MODULES.map(module => {
                const active = module.id === activeModule.id;
                const completed = module.status === 'completed';
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModuleId(module.id)}
                    className={`group w-full rounded-xl border p-4 text-left transition duration-300 hover:-translate-y-0.5 ${
                      active
                        ? 'border-blue-400 bg-[linear-gradient(135deg,rgba(37,99,235,0.98),rgba(14,165,233,0.72))] text-white shadow-[0_18px_42px_rgba(37,99,235,0.26)]'
                        : completed
                          ? isLight
                            ? 'border-emerald-200 bg-emerald-50/76 text-slate-800'
                            : 'border-emerald-900/50 bg-emerald-950/20 text-slate-100'
                          : isLight
                            ? 'border-[#d4deea] bg-white/88 text-slate-900 shadow-[0_10px_32px_rgba(71,85,105,0.08)] hover:border-blue-300'
                            : 'border-blue-950/50 bg-[#080d16]/82 text-slate-100 hover:border-blue-800/80'
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className={`text-[9px] font-black uppercase tracking-[0.16em] ${active ? 'text-blue-100' : completed ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          {String(module.order).padStart(2, '0')} - {statusLabel(module, active)}
                        </span>
                        <h2 className="mt-2 text-base font-black tracking-tight sm:text-lg">{module.title}</h2>
                        <p className={`mt-1.5 text-sm font-semibold leading-relaxed ${active ? 'text-blue-100' : isLight ? 'text-slate-500' : 'text-slate-400'}`}>{module.subtitle}</p>
                      </div>
                      <span className={`w-fit rounded-full border px-2.5 py-1.5 text-[9px] font-black uppercase ${active ? 'border-white/30 bg-white/14 text-white' : isLight ? lightCategoryClasses[module.category] : categoryClasses[module.category]}`}>
                        {categoryLabels[module.category]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </PanelSurface>

          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Painel didático dinâmico</p>
                <h2 className="mt-4 text-3xl font-black tracking-tight">{activeModule.title}</h2>
                <p className={`mt-2 text-base font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{activeModule.subtitle}</p>
              </div>
              <span className={`w-fit rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? lightCategoryClasses[activeModule.category] : categoryClasses[activeModule.category]}`}>
                {categoryLabels[activeModule.category]}
              </span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {activeModule.blocks.map(block => (
                <section key={block.id} className={`rounded-xl border p-5 ${isLight ? 'border-[#d2deeb] bg-white/86' : 'border-blue-950/50 bg-[#080d16]/80'}`}>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300">{block.eyebrow}</p>
                  {block.title && <h3 className="mt-2 text-lg font-black">{block.title}</h3>}
                  <p className={`mt-3 text-sm font-semibold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{block.body}</p>
                  {block.examples && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {block.examples.map(example => (
                        <span key={example} className={`rounded-lg border px-3 py-2 text-xs font-black ${isLight ? 'border-blue-200 bg-white text-blue-700' : 'border-blue-900/50 bg-[#080b11] text-blue-100'}`}>
                          {example}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>

            <div className={`mt-6 rounded-xl border p-5 ${isLight ? 'border-[#d3deeb] bg-[#eef4fb]' : 'border-blue-950/60 bg-blue-950/10'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Pratique agora</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {activeModule.actions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => executeLearnAction(action, activeModule, openHeaderTool)}
                    className={`${isLight ? 'border border-blue-400/30 bg-[linear-gradient(180deg,#4f8df3,#2563eb)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_12px_24px_rgba(37,99,235,0.22)]' : 'border border-blue-400/22 bg-[linear-gradient(180deg,#2e6af0,#1d4ed8)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_28px_rgba(15,23,42,0.32)]'} rounded-xl px-4 py-3 text-[10px] font-black uppercase text-white transition hover:-translate-y-0.5`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {activeModule.relatedTools && (
              <div className="mt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Ferramentas relacionadas</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {activeModule.relatedTools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => executeLearnAction(tool, activeModule, openHeaderTool)}
                      className={`rounded-xl border p-4 text-left transition hover:-translate-y-0.5 ${isLight ? 'border-[#d2deeb] bg-white/86 text-slate-900 shadow-[0_10px_26px_rgba(71,85,105,0.08)]' : 'border-blue-950/50 bg-[#080d16]/80 text-slate-100'}`}
                    >
                      <span className="text-sm font-black">{tool.label}</span>
                      {tool.description && <p className={`mt-1.5 text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{tool.description}</p>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </PanelSurface>
        </div>

        <PanelSurface isLight={isLight} className="mt-6 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Ferramentas de prática</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Atalhos para o que já existe no app</h2>
            </div>
            <p className={`max-w-2xl text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              A página organiza o estudo e aciona o fretboard, afinador, metrônomo, exercícios e módulos dedicados sem duplicar lógica.
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LEARN_PRACTICE_TOOLS.map(tool => (
              <button
                key={tool.id}
                onClick={() => executeLearnAction(tool, undefined, openHeaderTool)}
                className={`rounded-xl border p-4 text-left transition duration-300 hover:-translate-y-0.5 ${isLight ? 'border-[#d2deeb] bg-white/88 text-slate-900 shadow-[0_12px_30px_rgba(71,85,105,0.09)]' : 'border-blue-950/50 bg-[#080d16]/82 text-slate-100 hover:border-blue-800/80'}`}
              >
                <span className="text-sm font-black">{tool.label}</span>
                {tool.description && <p className={`mt-1.5 text-xs font-semibold leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{tool.description}</p>}
              </button>
            ))}
          </div>
        </PanelSurface>
      </main>
      <QuickToolsModal
        isOpen={quickTool !== null}
        initialTool={quickTool || 'metronome'}
        isLight={isLight}
        lang={lang}
        onClose={() => setQuickTool(null)}
      />
    </div>
  );
};

export default LearnPage;
