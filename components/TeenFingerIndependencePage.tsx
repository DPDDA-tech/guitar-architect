import React, { useEffect, useMemo, useRef, useState } from 'react';
import FretboardSVG from './FretboardSVG';
import { getTeensLang, getTeensTheme, setGlobalLang } from '../utils/ecosystemPreferences';
import { useFretboardScrollAnchor } from '../utils/useFretboardScrollAnchor';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';
import AppFooter from './AppFooter';
import {
  buildRegionFromStartFret,
  DEFAULT_START_FRET,
  FINGER_EXERCISE_CATALOG,
  FINGER_EXERCISE_CATEGORIES,
  MAX_START_FRET,
  MIN_START_FRET,
  getFingerExercisesByCategory,
  type FingerExerciseCategory,
} from '../data/teenFingerExerciseData';
import {
  applyExerciseMode,
  buildFingerExerciseSequence,
  buildHeldFingerSteps,
  buildPairExerciseSequence,
  type FingerExerciseMode,
  type FingerExerciseStep,
} from '../utils/fingerExerciseEngine';
import type { FretboardState, Marker, StringStatus } from '../types';

// customTuning index 0 = high e (1st string, drawn at the top by FretboardSVG's
// getY, which increases with string index) through index 5 = low E (6th
// string, drawn at the bottom). "Subir" (ascend) for this tool means
// physically low-to-high pitch — 6th string (E) up to 1st string (e) — which
// visually is bottom-to-top, so the traversal order must start at index 5.
const TUNING = ['E', 'B', 'G', 'D', 'A', 'E'];
const STRINGS = [5, 4, 3, 2, 1, 0];
// Standard tab notation: lowercase "e" for the 1st (high) string disambiguates
// it from the 6th (low) "E", both top-to-bottom matching string index 0-5.
const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];

// Mirrors FretboardSVG's own internal layout constants (marginY=60,
// stringSpacing derived from height=150+numStrings*45) so these labels line
// up with its rows without needing any prop from the shared component.
const getStringLabelTopPercent = (stringIndex: number, numStrings: number) => {
  const height = 150 + numStrings * 45;
  const marginY = 60;
  const stringSpacing = (height - marginY - 60) / (numStrings - 1);
  return ((marginY + stringIndex * stringSpacing) / height) * 100;
};

const FINGER_COLORS: Record<number, string> = {
  1: '#22d3ee',
  2: '#a855f7',
  3: '#f59e0b',
  4: '#f472b6',
};

const FINGER_NAMES: Record<'pt' | 'en', Record<number, string>> = {
  pt: { 1: 'Indicador', 2: 'Médio', 3: 'Anelar', 4: 'Mínimo' },
  en: { 1: 'Index', 2: 'Middle', 3: 'Ring', 4: 'Pinky' },
};

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const buildFretboardState = (
  region: { startFret: number; endFret: number },
  baseSteps: FingerExerciseStep[],
  heldSteps: FingerExerciseStep[],
  activeStep: FingerExerciseStep | undefined,
  isLeftHanded: boolean,
): { fretboardState: FretboardState; feedbackNote: { string: number; fret: number } | null } => {
  const markerMap = new Map<string, Marker>();

  // Resting markers use a faint tint of the finger's own color (same `${hex}33`
  // dimming convention as Triad/Tetrad Map) instead of a fully transparent
  // fill. FretboardSVG always draws marker strokes in solid white — paired
  // with a literally transparent fill, that white rim cuts a hard, empty gap
  // into the string line in light mode (reads as a hole/break). A faint tint
  // still reads as "resting", but keeps the rim looking like the edge of a
  // soft dot instead of a void cut into the line.
  baseSteps.forEach((step) => {
    const key = `${step.string}:${step.fret}`;
    const isActive = !!activeStep && step.string === activeStep.string && step.fret === activeStep.fret;
    const fingerColor = FINGER_COLORS[step.finger] ?? '#94a3b8';
    markerMap.set(key, {
      id: key,
      string: step.string,
      fret: step.fret,
      shape: 'circle',
      color: isActive ? fingerColor : `${fingerColor}33`,
      finger: String(step.finger),
    });
  });

  heldSteps.forEach((step) => {
    const key = `${step.string}:${step.fret}`;
    markerMap.set(key, {
      id: key,
      string: step.string,
      fret: step.fret,
      shape: 'square',
      color: FINGER_COLORS[step.finger] ?? '#94a3b8',
      finger: String(step.finger),
    });
  });

  const stringStatuses: StringStatus[] = Array.from({ length: TUNING.length }, () => 'normal');

  const fretboardState: FretboardState = {
    id: 'finger-independence',
    title: '',
    subtitle: '',
    notes: '',
    // FretboardSVG draws a note for fret N in the slot between wires N-1 and N
    // (same convention used by the nut at fret 0 in Triad/Tetrad Map), so the
    // wire just before the first playable fret of the region must be in view.
    startFret: region.startFret - 1,
    endFret: region.endFret,
    isLeftHanded,
    root: 'C',
    scaleType: 'Major (Ionian)',
    instrumentType: 'guitar-6',
    tuning: 'Custom',
    customTuning: TUNING,
    stringStatuses,
    labelMode: 'fingering',
    harmonyMode: 'OFF',
    chordQuality: 'DIATONIC',
    chordDegree: 0,
    inversion: 0,
    colorMode: 'SINGLE',
    layers: {
      showInlays: true,
      showAllNotes: false,
      showScale: false,
      showTonic: false,
    },
    markers: Array.from(markerMap.values()),
    lines: [],
  };

  const feedbackNote = activeStep ? { string: activeStep.string, fret: activeStep.fret } : null;

  return { fretboardState, feedbackNote };
};

const TeenFingerIndependencePage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [lang, setLang] = useState<'pt' | 'en'>(() => getTeensLang());
  const isLight = theme === 'light';

  const [category, setCategory] = useState<FingerExerciseCategory>('chromatic');
  const exercisesInCategory = useMemo(() => getFingerExercisesByCategory(category), [category]);
  const [exerciseId, setExerciseId] = useState(exercisesInCategory[0]?.id ?? '');
  const [bpm, setBpm] = useState(60);
  const [mode, setMode] = useState<FingerExerciseMode>('roundtrip');
  const [loop, setLoop] = useState(true);
  const [startFret, setStartFret] = useState(DEFAULT_START_FRET);
  const [autoShift, setAutoShift] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  // Mesmo estado/label/prop de Tríades e Tétrades (handedness -> FretboardState.isLeftHanded).
  const [handedness, setHandedness] = useState<'right' | 'left'>('right');

  const indexRef = useRef(0);
  const [, forceRender] = useState(0);

  // Wrapper min-w-[1040px] (ergonomia de toque no mobile) com scroll horizontal.
  // Ancora no início do braço (ou no fim, para canhotos) e reancora ao girar o
  // aparelho, evitando que o scrollLeft antigo passe a mostrar um trecho
  // diferente do braço na nova largura.
  const fretboardScrollRef = useRef<HTMLDivElement | null>(null);
  useFretboardScrollAnchor(fretboardScrollRef, handedness === 'left');

  const copy = lang === 'pt'
    ? {
        title: 'Independência dos Dedos',
        subtitle: 'Desenvolva coordenação, independência, alcance e precisão através de exercícios progressivos para a mão esquerda.',
        category: 'Categoria',
        exercise: 'Exercício',
        bpm: 'BPM',
        mode: 'Modo',
        loop: 'Loop',
        startingFret: 'Casa inicial',
        handedness: 'Modo do braço',
        right: 'Destro',
        left: 'Canhoto',
        autoShift: 'Deslocamento automático',
        region: 'Região',
        start: 'Iniciar',
        pause: 'Pausar',
        on: 'Ligado',
        off: 'Desligado',
        ascend: 'Subir',
        descend: 'Descer',
        roundtrip: 'Subir e Descer',
        currentPattern: 'Padrão atual',
        difficulty: 'Dificuldade',
        held: 'Dedos fixos',
        back: 'Voltar ao Teens',
        studio: 'Ir para Studio',
      }
    : {
        title: 'Finger Independence',
        subtitle: 'Build coordination, independence, reach and precision through progressive left-hand exercises.',
        category: 'Category',
        exercise: 'Exercise',
        bpm: 'BPM',
        mode: 'Mode',
        loop: 'Loop',
        startingFret: 'Starting fret',
        handedness: 'Neck mode',
        right: 'Right',
        left: 'Left',
        autoShift: 'Auto-shift neck',
        region: 'Region',
        start: 'Start',
        pause: 'Pause',
        on: 'On',
        off: 'Off',
        ascend: 'Ascend',
        descend: 'Descend',
        roundtrip: 'Up & Down',
        currentPattern: 'Current pattern',
        difficulty: 'Difficulty',
        held: 'Fixed fingers',
        back: 'Back to Teens',
        studio: 'Go to Studio',
      };

  useEffect(() => {
    if (!exercisesInCategory.some((item) => item.id === exerciseId)) {
      setExerciseId(exercisesInCategory[0]?.id ?? '');
    }
  }, [category, exerciseId, exercisesInCategory]);

  const exercise = useMemo(
    () => FINGER_EXERCISE_CATALOG.find((item) => item.id === exerciseId) ?? exercisesInCategory[0],
    [exerciseId, exercisesInCategory]
  );

  const region = useMemo(() => buildRegionFromStartFret(startFret), [startFret]);

  const heldSteps = useMemo(
    () => (exercise ? buildHeldFingerSteps(exercise, region, STRINGS) : []),
    [exercise, region]
  );

  const sequence = useMemo(() => {
    if (!exercise) return [];
    if (exercise.category === 'pairs') {
      return buildPairExerciseSequence(exercise, region, STRINGS, mode);
    }
    return applyExerciseMode(buildFingerExerciseSequence(exercise, region, STRINGS), mode);
  }, [exercise, region, mode]);

  useEffect(() => {
    indexRef.current = 0;
    forceRender((tick) => tick + 1);
  }, [sequence]);

  useEffect(() => {
    if (!isPlaying || sequence.length === 0) return;
    const intervalMs = 60000 / bpm;
    const timer = window.setInterval(() => {
      const next = indexRef.current + 1;
      if (next < sequence.length) {
        indexRef.current = next;
        forceRender((tick) => tick + 1);
        return;
      }

      // Finished one full pass through the current region.
      if (autoShift) {
        // setStartFret triggers the region/sequence recompute, which the
        // effect below already resets indexRef to 0 for — no manual reset
        // needed here.
        if (startFret < MAX_START_FRET) {
          setStartFret((current) => current + 1);
        } else if (loop) {
          setStartFret(MIN_START_FRET);
        } else {
          indexRef.current = sequence.length - 1;
          setIsPlaying(false);
          forceRender((tick) => tick + 1);
        }
        return;
      }

      if (loop) {
        indexRef.current = 0;
      } else {
        indexRef.current = sequence.length - 1;
        setIsPlaying(false);
      }
      forceRender((tick) => tick + 1);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, bpm, sequence, loop, autoShift, startFret]);

  const activeStep = sequence[indexRef.current];

  const { fretboardState, feedbackNote } = useMemo(
    () => buildFretboardState(region, sequence, heldSteps, activeStep, handedness === 'left'),
    [region, sequence, heldSteps, activeStep, handedness]
  );

  useEffect(() => {
    setGlobalLang(lang);
  }, [lang]);

  const inactiveButtonClass = isLight
    ? 'border-slate-300 bg-white text-slate-700'
    : 'border-zinc-700 bg-zinc-950 text-zinc-200';

  const toolbarButtonClass = (selected: boolean) =>
    `${selected
      ? isLight
        ? 'border-violet-500 bg-violet-100 text-violet-900'
        : 'border-violet-400 bg-violet-500/15 text-violet-50'
      : inactiveButtonClass} min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase leading-tight transition-all`;

  const patternLabel = exercise
    ? exercise.fingerOrder.map((finger) => finger).join('-')
    : '';

  const patternFingerNames = exercise
    ? exercise.fingerOrder.map((finger) => FINGER_NAMES[lang][finger]).join(' → ')
    : '';

  return (
    <>
    <div className={`relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${isLight ? 'rgba(148,163,184,0.35)' : 'rgba(139,92,246,0.18)'} 1px, transparent 1px)`,
          backgroundSize: '100% 30px',
        }}
      />

      <main className="relative mx-auto max-w-7xl">
        <EcosystemPageActions ecosystem="teens" isLight={isLight} backLabel={copy.back} backPath="/teens" />
        <InternalEcosystemHeader ecosystem="teens" isLight={isLight} title={copy.title} subtitle={copy.subtitle} />

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-violet-800/60 bg-zinc-950/80'}`}>
          <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-violet-800/50 bg-zinc-900/60'}`}>
            <div className="grid gap-4 xl:grid-cols-[1.1fr_1.1fr_1fr_1fr]">
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.category}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {FINGER_EXERCISE_CATEGORIES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCategory(item.id)}
                      className={`${toolbarButtonClass(category === item.id)} inline-flex items-center justify-center text-center`}
                    >
                      {item.label[lang]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.exercise}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {exercisesInCategory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setExerciseId(item.id)}
                      className={`${toolbarButtonClass(exerciseId === item.id)} inline-flex items-center justify-center text-center`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.mode}</p>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {([
                    { id: 'ascend', label: copy.ascend },
                    { id: 'descend', label: copy.descend },
                    { id: 'roundtrip', label: copy.roundtrip },
                  ] as const).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setMode(item.id as FingerExerciseMode)}
                      className={`${toolbarButtonClass(mode === item.id)} inline-flex items-center justify-center text-center`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.startingFret}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setStartFret((current) => Math.max(MIN_START_FRET, current - 1))}
                    className={`h-10 w-10 rounded-xl border text-lg font-black ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label="-"
                  >
                    -
                  </button>
                  <div className="min-w-[80px] text-center text-sm font-black">{copy.region} {region.startFret}–{region.endFret}</div>
                  <button
                    onClick={() => setStartFret((current) => Math.min(MAX_START_FRET, current + 1))}
                    className={`h-10 w-10 rounded-xl border text-lg font-black ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label="+"
                  >
                    +
                  </button>
                </div>

                <p className="mt-3 text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.handedness}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(['right', 'left'] as const).map((item) => (
                    <button
                      key={item}
                      onClick={() => setHandedness(item)}
                      className={`${toolbarButtonClass(handedness === item)} inline-flex items-center justify-center text-center`}
                    >
                      {item === 'right' ? copy.right : copy.left}
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.loop}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button onClick={() => setLoop(true)} className={`${toolbarButtonClass(loop)} inline-flex items-center justify-center text-center`}>
                    {copy.on}
                  </button>
                  <button onClick={() => setLoop(false)} className={`${toolbarButtonClass(!loop)} inline-flex items-center justify-center text-center`}>
                    {copy.off}
                  </button>
                </div>

                <p className="mt-3 text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.autoShift}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button onClick={() => setAutoShift(true)} className={`${toolbarButtonClass(autoShift)} inline-flex items-center justify-center text-center`}>
                    {copy.on}
                  </button>
                  <button onClick={() => setAutoShift(false)} className={`${toolbarButtonClass(!autoShift)} inline-flex items-center justify-center text-center`}>
                    {copy.off}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="min-w-fit">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.bpm}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => setBpm((current) => Math.max(40, current - 5))}
                    className={`h-10 w-10 rounded-xl border text-lg font-black ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label="-"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min={40}
                    max={180}
                    value={bpm}
                    onChange={(event) => setBpm(Number(event.target.value))}
                    className="w-40"
                  />
                  <button
                    onClick={() => setBpm((current) => Math.min(180, current + 5))}
                    className={`h-10 w-10 rounded-xl border text-lg font-black ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label="+"
                  >
                    +
                  </button>
                  <div className="min-w-[48px] text-center text-xl font-black">{bpm}</div>
                </div>
              </div>

              <button
                onClick={() => setIsPlaying((current) => !current)}
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] transition-all hover:from-violet-500 hover:to-fuchsia-500 active:scale-95"
              >
                {isPlaying ? copy.pause : copy.start}
              </button>
            </div>
          </div>

          {exercise && (
            <div className={`mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border px-4 py-3 text-xs font-bold ${isLight ? 'border-violet-200 bg-violet-50 text-violet-800' : 'border-violet-500/30 bg-violet-500/8 text-violet-200'}`}>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((finger) => (
                  <span
                    key={finger}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black text-white"
                    style={{ backgroundColor: FINGER_COLORS[finger] }}
                    title={FINGER_NAMES[lang][finger]}
                  >
                    {finger}
                  </span>
                ))}
              </div>
              <span className="uppercase tracking-[0.15em] text-violet-400">{copy.currentPattern}</span>
              <span>{patternLabel} ({patternFingerNames})</span>
              <span className="uppercase tracking-[0.14em] text-violet-400">{copy.difficulty}: {exercise.difficulty}/5</span>
              {exercise.heldFingers && exercise.heldFingers.length > 0 && (
                <span>{copy.held}: {exercise.heldFingers.map((finger) => FINGER_NAMES[lang][finger]).join(', ')}</span>
              )}
              <span className="basis-full opacity-80">{exercise.description[lang]}</span>
            </div>
          )}

          <div className="mt-4 overflow-x-auto" style={{ overflowAnchor: 'none' }} ref={fretboardScrollRef}>
            <div className={`min-w-[1040px] rounded-[28px] border px-4 py-5 ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950/80'}`}>
              <div className="flex gap-2">
                <div className="relative w-5 shrink-0">
                  {STRING_LABELS.map((label, idx) => (
                    <span
                      key={label + idx}
                      className={`absolute left-0 -translate-y-1/2 text-[11px] font-black ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}
                      style={{ top: `${getStringLabelTopPercent(idx, STRING_LABELS.length)}%` }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <FretboardSVG
                    state={fretboardState}
                    editorMode="view"
                    onEvent={() => undefined}
                    selectedColor="#a855f7"
                    selectedShape="circle"
                    theme={theme}
                    isActive={false}
                    feedbackNote={feedbackNote}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => navigateTo('/teens')}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] transition-all hover:from-violet-500 hover:to-fuchsia-500 active:scale-95"
          >
            {copy.back}
          </button>
          <button
            onClick={() => navigateTo('/studio')}
            className="rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-500 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(8,145,178,0.3)] transition-all hover:from-cyan-500 hover:to-sky-400 active:scale-95"
          >
            {copy.studio}
          </button>
        </div>
      </main>
    </div>

    <AppFooter isLight={isLight} lang={lang} logoSrc="/gateenslogo.webp" logoAlt="Guitar Architect Teens" />
    </>
  );
};

export default TeenFingerIndependencePage;
