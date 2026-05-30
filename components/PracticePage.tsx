import React, { useMemo, useState } from 'react';
import { translations, Lang } from '../i18n';
import {
  DEFAULT_PRACTICE_PROGRESS,
  PRACTICE_EXERCISES,
  PRACTICE_ROUTINES,
  PracticeDifficulty,
  PracticeExercise,
  PracticeProgress,
} from '../data/practiceData';
import { loadConfig, saveConfig } from '../utils/persistence';
import { AppState, ThemeMode } from '../types';
import { recordAchievementEvent } from '../utils/achievementEvents';
import PracticeMissionCard from './practice/PracticeMissionCard';
import PracticeCategorySection from './practice/PracticeCategorySection';
import PracticeStatsPanel from './practice/PracticeStatsPanel';
import QuickToolsModal from './QuickToolsModal';
import { navigateToPath, returnToFretboard } from '../utils/fretboardNavigation';
import { sendFretboardIntent } from '../utils/sendFretboardIntent';
import type { FretboardIntent, FretboardIntentAction, FretboardIntentTab } from '../types/fretboardIntent';

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

const RETURN_CONTEXT_KEY = 'ga_fretboard_return_context';
const PROGRESS_KEY = 'ga_practice_progress';

const navigateTo = navigateToPath;

const getInitialConfig = (): AppState | null => {
  try {
    return loadConfig();
  } catch {
    return null;
  }
};

const loadProgress = (): PracticeProgress => {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PRACTICE_PROGRESS;
    return { ...DEFAULT_PRACTICE_PROGRESS, ...JSON.parse(raw) } as PracticeProgress;
  } catch {
    return DEFAULT_PRACTICE_PROGRESS;
  }
};

const saveProgress = (progress: PracticeProgress) => {
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

const getTodayMission = () => {
  const daySeed = new Date().toISOString().slice(0, 10).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const missionPool = PRACTICE_EXERCISES.filter(exercise => ['location', 'harmony', 'caged', 'scales', 'improvisation'].includes(exercise.category));
  return missionPool[daySeed % missionPool.length] || PRACTICE_EXERCISES[0];
};

const difficultyOptions: { id: 'all' | PracticeDifficulty; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'beginner', label: 'Iniciante' },
  { id: 'intermediate', label: 'Intermediário' },
  { id: 'advanced', label: 'Avançado' },
  { id: 'fretboard-master', label: 'Mestre do Braço' },
];

const categories = [
  { id: 'location', title: 'Localização', description: 'Notas, tônicas, oitavas e memória visual.' },
  { id: 'intervals', title: 'Intervalos', description: 'Distâncias, quintas, oitavas e percepção aplicada.' },
  { id: 'scales', title: 'Escalas', description: 'Maior, menor, pentatônicas e prática no BPM.' },
  { id: 'harmony', title: 'Harmonia', description: 'Progressões, campo harmônico e funções tonais.' },
  { id: 'caged', title: 'CAGED', description: 'Shapes, tônicas, conexão e navegação horizontal.' },
  { id: 'rhythm', title: 'Ritmo', description: 'Semínimas, colcheias, subdivisão e metrônomo.' },
  { id: 'improvisation', title: 'Improviso', description: 'Call & response, alvo por acorde e frases curtas.' },
  { id: 'technique', title: 'Técnica', description: 'Palhetada, spider, legato, coordenação e velocidade.' },
] as const;

const mapLegacyActionToIntentAction = (action: unknown): FretboardIntentAction => {
  if (action === 'scale') return 'showScale';
  if (action === 'field') return 'showHarmonyField';
  if (action === 'triads') return 'showTriads';
  if (action === 'progression') return 'showProgression';
  if (action === 'openTool') return 'openTool';
  if (action === 'startPractice') return 'startPractice';
  return 'startPractice';
};

const mapLegacyTabToTargetTab = (value: unknown): FretboardIntentTab | undefined => {
  if (value === 'visual' || value === 'scale' || value === 'harmony' || value === 'tools' || value === 'chords') return value;
  return undefined;
};

const PracticePage: React.FC = () => {
  const [lang, setLang] = useState<Lang>(() => getInitialConfig()?.lang || 'pt');
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialConfig()?.theme || 'dark');
  const [progress, setProgress] = useState<PracticeProgress>(() => loadProgress());
  const [difficulty, setDifficulty] = useState<'all' | PracticeDifficulty>('all');
  const [quickTool, setQuickTool] = useState<'tuner' | 'metronome' | null>(null);
  const isLight = theme === 'light';
  const t = translations[lang].harmonicCycle;
  const mission = useMemo(() => getTodayMission(), []);
  const filteredExercises = useMemo(
    () => difficulty === 'all' ? PRACTICE_EXERCISES : PRACTICE_EXERCISES.filter(exercise => exercise.difficulty === difficulty),
    [difficulty],
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

  const updateProgress = (updater: (current: PracticeProgress) => PracticeProgress) => {
    setProgress(current => {
      const next = updater(current);
      saveProgress(next);
      return next;
    });
  };

  const startExercise = (exercise: PracticeExercise) => {
    const currentBpm = progress.maxBpm[exercise.id] || exercise.bpmStart;
    const payload = {
      ...exercise.payload,
      bpm: currentBpm,
      practiceExerciseId: exercise.id,
      moduleTitle: 'Praticar',
      moduleLabel: exercise.title,
    };
    const payloadRecord = payload as Record<string, unknown>;
    const today = new Date().toISOString().slice(0, 10);

    updateProgress(current => ({
      ...current,
      completed: current.completed.includes(exercise.id) ? current.completed : [...current.completed, exercise.id],
      streak: current.lastPracticeDate === today ? current.streak : current.streak + 1,
      practicedMinutes: current.practicedMinutes + exercise.durationMinutes,
      bestTimes: {
        ...current.bestTimes,
        [exercise.id]: Math.min(current.bestTimes[exercise.id] || exercise.durationMinutes * 60, exercise.durationMinutes * 60),
      },
      maxBpm: exercise.bpmStart
        ? {
          ...current.maxBpm,
          [exercise.id]: currentBpm || exercise.bpmStart,
        }
        : current.maxBpm,
      lastPracticeDate: today,
    }));

    recordAchievementEvent({ type: 'exercise_completion', exerciseId: exercise.id, bpm: currentBpm || exercise.bpmStart });
    if (currentBpm || exercise.bpmStart) {
      recordAchievementEvent({ type: 'bpm_target', exerciseId: exercise.id, bpm: currentBpm || exercise.bpmStart || 0 });
    }
    recordAchievementEvent({ type: 'streak', days: progress.lastPracticeDate === today ? progress.streak : progress.streak + 1 });

    window.localStorage.setItem(RETURN_CONTEXT_KEY, JSON.stringify({
      label: lang === 'pt' ? 'Voltar para a prática' : 'Back to practice',
      path: '/practice',
      source: 'practice',
      exerciseId: exercise.id,
    }));
    sendFretboardIntent({
      ...(payloadRecord as Omit<FretboardIntent, 'version' | 'createdAt'>),
      source: 'practice',
      action: mapLegacyActionToIntentAction(payloadRecord.action),
      root: typeof payloadRecord.root === 'string' ? payloadRecord.root : 'C',
      scaleType: typeof payloadRecord.scaleType === 'string' ? payloadRecord.scaleType : 'Major (Ionian)',
      targetTab: mapLegacyTabToTargetTab(payloadRecord.quickTab ?? payloadRecord.tab),
    });
  };

  const increaseBpm = (exercise: PracticeExercise) => {
    if (!exercise.bpmStart) return;
    updateProgress(current => {
      const currentBpm = current.maxBpm[exercise.id] || exercise.bpmStart || 0;
      const nextBpm = Math.min(currentBpm + 5, exercise.bpmTarget || currentBpm + 5);
      recordAchievementEvent({ type: 'bpm_target', exerciseId: exercise.id, bpm: nextBpm });
      return {
        ...current,
        maxBpm: {
          ...current.maxBpm,
          [exercise.id]: nextBpm,
        },
      };
    });
  };

  const resetBpm = (exercise: PracticeExercise) => {
    if (!exercise.bpmStart) return;
    updateProgress(current => ({
      ...current,
      maxBpm: {
        ...current.maxBpm,
        [exercise.id]: exercise.bpmStart || 0,
      },
    }));
  };

  return (
    <div className={`min-h-screen ${isLight ? 'text-zinc-950' : 'blueprint-grid-dark text-zinc-100'}`} style={pageBackgroundStyle}>
      <header className={`border-b px-4 py-4 backdrop-blur-2xl ${isLight ? 'border-[#cbd7e6] bg-[#f6f9fd]/96' : 'border-blue-950/50 bg-zinc-950/92'}`}>
        <div className="mx-auto flex max-w-[1700px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${isLight ? 'text-blue-500' : 'text-blue-300'}`}>Guitar Architect</p>
            <h1 className={`mt-1 text-3xl font-black italic uppercase tracking-tight ${isLight ? 'text-blue-600' : 'bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.18)]'}`}>
              Praticar
            </h1>
            <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Academia musical guiada: ouvido, braço, tempo, técnica, harmonia e improviso em tarefas executáveis.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700 hover:bg-zinc-50' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100 hover:bg-[#161d2a]'}`}
              title={isLight ? (lang === 'pt' ? 'Modo Escuro' : 'Dark Mode') : (lang === 'pt' ? 'Modo Claro' : 'Light Mode')}
            >
              {isLight ? <MoonIcon /> : <SunIcon />}
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
            <button onClick={returnToFretboard} className="rounded-xl border border-blue-500/50 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-950/30">
              {t.backToFretboard}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1700px] px-4 py-7">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <PracticeMissionCard mission={mission} currentBpm={progress.maxBpm[mission.id]} isLight={isLight} onStart={startExercise} />
          <PracticeStatsPanel progress={progress} totalExercises={PRACTICE_EXERCISES.length} isLight={isLight} />
        </div>

        <section className={`mt-6 rounded-2xl border p-5 ${isLight ? 'border-[#c6d3e2] bg-white/95 shadow-[0_18px_50px_rgba(71,85,105,0.12)]' : 'border-blue-900/55 bg-[linear-gradient(145deg,#08101c,#050914)] shadow-[0_18px_54px_rgba(2,6,23,0.48)]'}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Sistema de dificuldade</p>
              <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Filtre a academia pelo nível do treino.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setDifficulty(option.id)}
                  className={`rounded-xl border px-3 py-2 text-[9px] font-black uppercase transition ${
                    difficulty === option.id
                      ? 'border-blue-400 bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]'
                      : isLight
                        ? 'border-slate-200 bg-white text-slate-600'
                        : 'border-blue-900/55 bg-[#050914] text-slate-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {categories.map(category => (
          <PracticeCategorySection
            key={category.id}
            title={category.title}
            description={category.description}
            exercises={filteredExercises.filter(exercise => exercise.category === category.id)}
            isLight={isLight}
            completed={progress.completed}
            bpmByExercise={progress.maxBpm}
            onStart={startExercise}
            onIncreaseBpm={increaseBpm}
            onResetBpm={resetBpm}
          />
        ))}

        <section className={`mt-7 rounded-2xl border p-6 ${isLight ? 'border-[#c6d3e2] bg-white/95 shadow-[0_18px_50px_rgba(71,85,105,0.12)]' : 'border-blue-900/55 bg-[linear-gradient(145deg,#08101c,#050914)] shadow-[0_18px_54px_rgba(2,6,23,0.48)]'}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Rotinas</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Sequências prontas de treino</h2>
            </div>
            <p className={`max-w-2xl text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Rotinas agrupam tarefas musicais. Inicie pelo primeiro exercício e avance no fretboard.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PRACTICE_ROUTINES.map(routine => {
              const firstExercise = PRACTICE_EXERCISES.find(exercise => exercise.id === routine.exerciseIds[0]) || PRACTICE_EXERCISES[0];
              return (
                <article key={routine.id} className={`rounded-xl border p-5 ${isLight ? 'border-[#d2deeb] bg-white/95' : 'border-blue-900/60 bg-[#070d18] shadow-[inset_0_1px_0_rgba(96,165,250,0.04)]'}`}>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-300">{routine.durationMinutes} min</p>
                  <h3 className="mt-2 text-lg font-black">{routine.title}</h3>
                  <p className={`mt-2 text-sm font-semibold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{routine.description}</p>
                  <button onClick={() => startExercise(firstExercise)} className="mt-4 w-full rounded-xl border border-blue-400/30 bg-[linear-gradient(180deg,#4f8df3,#2563eb)] px-4 py-3 text-[10px] font-black uppercase text-white">
                    Iniciar rotina
                  </button>
                </article>
              );
            })}
          </div>
        </section>
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

export default PracticePage;
