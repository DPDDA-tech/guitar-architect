import React, { useEffect, useMemo, useState } from 'react';
import FretboardSVG from './FretboardSVG';
import { getIntervalName, getNoteAt } from '../music/musicTheory';
import { getTeensLang, getTeensTheme, setGlobalLang } from '../utils/ecosystemPreferences';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';
import AppFooter from './AppFooter';
import {
  generateTeenTetradMap,
  getTeenTetradGroups,
  getTeenTetradIntervalLabels,
  getTeenTetradNotes,
  type TeenTetradGroupMap,
  type TeenTetradInstrument,
  type TeenTetradInversion,
  type TeenTetradMapShape,
  type TeenTetradQuality,
  type TeenTetradRole,
} from '../data/teenTetradMap';
import type { FretboardState, Line, Marker, StringStatus } from '../types';
import { AnalyticsEvents, trackEvent } from '../src/lib/analytics';

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

type VisualizationMode =
  | 'none'
  | 'shape'
  | 'notes-shape'
  | 'notes-all'
  | 'notes-neck'
  | 'intervals-shape'
  | 'intervals-all'
  | 'intervals-neck';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const qualityLabels: Record<'pt' | 'en', Record<TeenTetradQuality, string>> = {
  pt: {
    maj7: 'Maior',
    m7: 'Menor',
    '7': 'Dominante',
    m7b5: 'Meio-dim.',
    dim7: 'Diminuta',
  },
  en: {
    maj7: 'Major',
    m7: 'Minor',
    '7': 'Dominant',
    m7b5: 'Half-dim.',
    dim7: 'Diminished',
  },
};

const qualityTechnical: Record<TeenTetradQuality, string> = {
  maj7: 'Maj7',
  m7: 'm7',
  '7': '7',
  m7b5: 'm7b5',
  dim7: 'dim7',
};

const inversionFullCopyKey: Record<TeenTetradInversion, 'rootFull' | 'firstFull' | 'secondFull' | 'thirdFull'> = {
  root: 'rootFull',
  first: 'firstFull',
  second: 'secondFull',
  third: 'thirdFull',
};

const roleSequenceByInversion: Record<TeenTetradInversion, TeenTetradRole[]> = {
  root: ['T', '3', '5', '7'],
  first: ['3', '5', '7', 'T'],
  second: ['5', '7', 'T', '3'],
  third: ['7', 'T', '3', '5'],
};

const getNormalizedTetradRole = (interval: string): TeenTetradRole => {
  if (interval === 'T') return 'T';
  if (interval === '3' || interval === 'b3') return '3';
  if (interval === '5' || interval === 'b5') return '5';
  return '7';
};

const cycleVisualizationMode = (current: VisualizationMode, target: 'notes' | 'intervals' | 'shape'): VisualizationMode => {
  if (target === 'shape') {
    return current === 'shape' ? 'none' : 'shape';
  }

  if (target === 'notes') {
    if (current === 'notes-shape') return 'notes-all';
    if (current === 'notes-all') return 'notes-neck';
    if (current === 'notes-neck') return 'none';
    return 'notes-shape';
  }

  if (current === 'intervals-shape') return 'intervals-all';
  if (current === 'intervals-all') return 'intervals-neck';
  if (current === 'intervals-neck') return 'none';
  return 'intervals-shape';
};

const getVisualizationButtonClass = (
  mode: VisualizationMode,
  button: 'notes' | 'intervals' | 'shape',
  isLight: boolean,
) => {
  const inactive = isLight
    ? 'border-slate-300 bg-white text-slate-700'
    : 'border-zinc-700 bg-zinc-950 text-zinc-200';

  const activeClass = isLight
    ? 'border-violet-500 bg-violet-100 text-violet-900'
    : 'border-violet-400 bg-violet-500/15 text-violet-50';

  if (button === 'shape') {
    return mode === 'shape' ? activeClass : inactive;
  }

  if (button === 'notes') {
    if (mode === 'notes-shape' || mode === 'notes-all' || mode === 'notes-neck') return activeClass;
    return inactive;
  }

  if (mode === 'intervals-shape' || mode === 'intervals-all' || mode === 'intervals-neck') return activeClass;
  return inactive;
};

const getHighlightLabel = (
  highlight: TeenTetradInversion,
  copy: Record<string, string>,
) => copy[inversionFullCopyKey[highlight]];

const INTERVAL_COLORS = {
  T: '#dc2626',
  '3': '#d97706',
  'b3': '#d97706',
  '5': '#2563eb',
  'b5': '#2563eb',
  '7M': '#a855f7',
  'b7': '#a855f7',
  'bb7': '#ec4899',
} as const;

const LINE_INTERVAL_COLORS = {
  T: '#ef4444',
  '3': '#d97706',
  'b3': '#d97706',
  '5': '#2563eb',
  'b5': '#2563eb',
  '7M': '#a855f7',
  'b7': '#a855f7',
  'bb7': '#a855f7',
} as const;

const isNotesOrIntervalsMode = (visualizationMode: VisualizationMode) =>
  visualizationMode === 'notes-shape'
  || visualizationMode === 'notes-all'
  || visualizationMode === 'notes-neck'
  || visualizationMode === 'intervals-shape'
  || visualizationMode === 'intervals-all'
  || visualizationMode === 'intervals-neck';

const isNotesMode = (visualizationMode: VisualizationMode) =>
  visualizationMode === 'notes-shape'
  || visualizationMode === 'notes-all'
  || visualizationMode === 'notes-neck';

const isGlobalVisualizationMode = (visualizationMode: VisualizationMode) =>
  visualizationMode === 'notes-all'
  || visualizationMode === 'notes-neck'
  || visualizationMode === 'intervals-all'
  || visualizationMode === 'intervals-neck';

const isShapeVisualizationMode = (visualizationMode: VisualizationMode) =>
  visualizationMode === 'shape' || visualizationMode === 'notes-shape' || visualizationMode === 'intervals-shape';

/**
 * Marca todas as ocorrências das notas da tétrade no braço, independente
 * de pertencerem a um shape gerado — usado nos modos Notas e Intervalos.
 */
const buildGlobalTetradNoteMarkers = (
  root: string,
  quality: TeenTetradQuality,
  tuning: string[],
  fretCount: number,
  visualizationMode: VisualizationMode,
): Marker[] => {
  const tetradNotes = getTeenTetradNotes(root, quality);
  const intervalLabels = getTeenTetradIntervalLabels(quality);
  const showLabel = isNotesOrIntervalsMode(visualizationMode);
  const useNoteLabel = isNotesMode(visualizationMode);
  const markers: Marker[] = [];

  tuning.forEach((_, stringIndex) => {
    for (let fret = 0; fret <= fretCount; fret += 1) {
      const note = getNoteAt(stringIndex, fret, tuning);
      const noteIndex = tetradNotes.indexOf(note);
      if (noteIndex === -1) continue;

      const interval = intervalLabels[noteIndex];
      const color = INTERVAL_COLORS[interval as keyof typeof INTERVAL_COLORS] ?? '#6b7280';

      markers.push({
        id: crypto.randomUUID(),
        string: stringIndex,
        fret,
        shape: 'circle',
        color,
        finger: showLabel ? (useNoteLabel ? note : interval) : '',
      });
    }
  });

  return markers;
};

const buildChromaticNeckMarkers = (
  root: string,
  quality: TeenTetradQuality,
  tuning: string[],
  fretCount: number,
  visualizationMode: VisualizationMode,
): Marker[] => {
  const showNotes = visualizationMode === 'notes-neck';
  const tetradNotes = getTeenTetradNotes(root, quality);
  const intervalColors: Record<string, string> = {
    '1': '#dc2626',
    'b2': '#f97316',
    '2': '#fb923c',
    'b3': '#d97706',
    '3': '#d97706',
    '4': '#22c55e',
    'b5': '#2563eb',
    '5': '#2563eb',
    'b6': '#8b5cf6',
    '6': '#a855f7',
    'b7': '#ec4899',
    '7': '#f43f5e',
  };
  const neutralColor = '#cbd5e1';
  const markers: Marker[] = [];

  tuning.forEach((_, stringIndex) => {
    for (let fret = 0; fret <= fretCount; fret += 1) {
      const note = getNoteAt(stringIndex, fret, tuning);
      const interval = getIntervalName(root, note);
      const isTetradTone = tetradNotes.includes(note);
      markers.push({
        id: crypto.randomUUID(),
        string: stringIndex,
        fret,
        shape: 'circle',
        color: isTetradTone ? (intervalColors[interval] ?? '#94a3b8') : neutralColor,
        finger: showNotes ? note : interval,
      });
    }
  });

  return markers;
};

const buildTetradMapFretboardState = (
  groupMaps: TeenTetradGroupMap[],
  activeGroupId: string,
  highlight: TeenTetradInversion,
  visualizationMode: VisualizationMode,
  instrument: TeenTetradInstrument,
  fretCount: number,
  isLeftHanded: boolean,
  root: string,
  quality: TeenTetradQuality,
): FretboardState => {
  const shapeMarkers: Marker[] = [];
  const lines: Line[] = [];
  const tuning = instrument === 'guitar'
    ? ['E', 'B', 'G', 'D', 'A', 'E']
    : ['G', 'D', 'A', 'E'];
  const stringStatuses: StringStatus[] = Array.from({ length: tuning.length }, () => 'normal');

  groupMaps.forEach((groupMap) => {
    const allGroupsActive = activeGroupId === 'all';
    const groupIsActive = allGroupsActive || groupMap.group.id === activeGroupId;

    groupMap.shapes.forEach((shape) => {
      if (!groupIsActive || shape.inversion !== highlight) return;

      shape.positions.forEach((position) => {
        const color = INTERVAL_COLORS[position.interval as keyof typeof INTERVAL_COLORS] ?? '#6b7280';
        shapeMarkers.push({
          id: crypto.randomUUID(),
          string: position.string,
          fret: position.fret,
          shape: 'circle',
          color,
          finger:
            visualizationMode === 'notes-shape'
              ? position.note
              : visualizationMode === 'intervals-shape'
                ? position.interval
                : '',
        });
      });

      const roleOrder = roleSequenceByInversion[shape.inversion];
      const ordered = roleOrder
        .map((role) => shape.positions.find((position) => getNormalizedTetradRole(position.interval) === role))
        .filter((position): position is TeenTetradMapShape['positions'][number] => Boolean(position));
      for (let i = 0; i < ordered.length - 1; i += 1) {
        lines.push({
          id: crypto.randomUUID(),
          start: { string: ordered[i].string, fret: ordered[i].fret },
          end: { string: ordered[i + 1].string, fret: ordered[i + 1].fret },
          color: LINE_INTERVAL_COLORS[ordered[i].interval as keyof typeof LINE_INTERVAL_COLORS] ?? '#8b5cf6',
          width: 8,
        });
      }
    });
  });

  const globalMarkers =
    visualizationMode === 'notes-neck' || visualizationMode === 'intervals-neck'
      ? buildChromaticNeckMarkers(root, quality, tuning, fretCount, visualizationMode)
      : buildGlobalTetradNoteMarkers(root, quality, tuning, fretCount, visualizationMode);
  const markers = isGlobalVisualizationMode(visualizationMode)
    ? globalMarkers
    : shapeMarkers.map((marker) => (
        visualizationMode === 'shape'
          ? { ...marker, finger: '' }
          : marker
      ));

  return {
    id: 'tetrad-map',
    title: '',
    subtitle: '',
    notes: '',
    startFret: 0,
    endFret: fretCount,
    isLeftHanded,
    root: 'C',
    scaleType: 'Major (Ionian)',
    instrumentType: instrument === 'guitar' ? 'guitar-6' : 'bass-4',
    tuning: 'Custom',
    customTuning: tuning,
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
    markers,
    lines,
  };
};

const TeenTetradMapPage: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [lang] = useState<'pt' | 'en'>(() => getTeensLang());
  const [instrument, setInstrument] = useState<TeenTetradInstrument>('guitar');
  const [handedness, setHandedness] = useState<'right' | 'left'>('right');
  const [noteIndex, setNoteIndex] = useState(0);
  const [quality, setQuality] = useState<TeenTetradQuality>('maj7');
  const [activeGroupId, setActiveGroupId] = useState('all');
  const [highlight, setHighlight] = useState<TeenTetradInversion>('root');
  const [fretCount, setFretCount] = useState(15);

  useEffect(() => {
    trackEvent(AnalyticsEvents.TETRAD_MAP_USED);
  }, []);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('intervals-shape');
  const [showQualityInfo, setShowQualityInfo] = useState(false);
  const isLight = theme === 'light';
  const note = CHROMATIC_NOTES[noteIndex];

  const copy = lang === 'pt'
    ? {
        title: 'Mapa de Tétrades',
        subtitle: 'Veja as tétrades se conectando pelo braço inteiro.',
        instrument: 'Instrumento',
        note: 'Nota',
        quality: 'Qualidade',
        stringGroup: 'Grupo',
        inversion: 'Estado / Inversão',
        all: 'Todas',
        root: 'Fund.',
        first: '1ª Inv.',
        second: '2ª Inv.',
        third: '3ª Inv.',
        rootFull: 'Fundamental',
        firstFull: '1ª Inversão',
        secondFull: '2ª Inversão',
        thirdFull: '3ª Inversão',
        notes: 'Notas da tétrade',
        quickFlow: 'Escolha instrumento, nota, qualidade e grupo. Depois destaque uma inversão para enxergar as ligações no braço.',
        handedness: 'Modo do braço',
        right: 'Destro',
        left: 'Canhoto',
        frets: 'Casas',
        mode: 'Modo',
        guitar: 'Guitarra',
        bass: 'Baixo',
        showNotes: 'Notas',
        showIntervals: 'Intervalos',
        shapeOnly: 'Somente shape',
        back: 'Voltar ao Teens',
        studio: 'Ir para Studio',
        qualityInfoTitle: 'Qualidades',
      }
    : {
        title: 'Tetrad Map',
        subtitle: 'See tetrads connecting across the full neck.',
        instrument: 'Instrument',
        note: 'Note',
        quality: 'Quality',
        stringGroup: 'Group',
        inversion: 'Inversion',
        all: 'All',
        root: 'Root',
        first: '1st Inv.',
        second: '2nd Inv.',
        third: '3rd Inv.',
        rootFull: 'Root',
        firstFull: '1st Inversion',
        secondFull: '2nd Inversion',
        thirdFull: '3rd Inversion',
        notes: 'Tetrad notes',
        quickFlow: 'Choose instrument, note, quality and group. Then highlight an inversion to see the links across the neck.',
        handedness: 'Neck mode',
        right: 'Right',
        left: 'Left',
        frets: 'Frets',
        mode: 'Mode',
        guitar: 'Guitar',
        bass: 'Bass',
        showNotes: 'Notes',
        showIntervals: 'Intervals',
        shapeOnly: 'Shape only',
        back: 'Back to Teens',
        studio: 'Go to Studio',
        qualityInfoTitle: 'Qualities',
      };

  const groupOptions = useMemo(() => {
    const groups = getTeenTetradGroups(instrument);
    return groups.map((group) => ({
      ...group,
      label: group.id === 'all' ? copy.all : group.label,
    }));
  }, [instrument, copy.all]);
  const groupMaps = useMemo(
    () => generateTeenTetradMap(note, quality, instrument, fretCount),
    [instrument, note, quality, fretCount]
  );
  const tetradNotes = useMemo(() => getTeenTetradNotes(note, quality), [note, quality]);
  const tetradIntervalLabels = useMemo(() => getTeenTetradIntervalLabels(quality), [quality]);
  const tetradRoleSequence = roleSequenceByInversion[highlight];
  const tetradNoteSequence = useMemo(() => {
    const roleToNoteIndex: Record<TeenTetradRole, number> = { T: 0, '3': 1, '5': 2, '7': 3 };
    return tetradRoleSequence.map((role) => tetradNotes[roleToNoteIndex[role]]);
  }, [tetradNotes, tetradRoleSequence]);
  const tetradFormulaSequence = useMemo(() => {
    const roleToNoteIndex: Record<TeenTetradRole, number> = { T: 0, '3': 1, '5': 2, '7': 3 };
    return tetradRoleSequence.map((role) => tetradIntervalLabels[roleToNoteIndex[role]]);
  }, [tetradIntervalLabels, tetradRoleSequence]);
  const fretboardState = useMemo(
    () => buildTetradMapFretboardState(
      groupMaps,
      activeGroupId,
      highlight,
      visualizationMode,
      instrument,
      fretCount,
      handedness === 'left',
      note,
      quality
    ),
    [groupMaps, activeGroupId, highlight, visualizationMode, instrument, fretCount, handedness, note, quality]
  );

  useEffect(() => {
    if (!groupOptions.some((group) => group.id === activeGroupId)) {
      setActiveGroupId(groupOptions[0]?.id ?? '');
    }
  }, [activeGroupId, groupOptions]);

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

  const violetButtonClass = (selected: boolean) =>
    `${selected
      ? isLight
        ? 'border-violet-500 bg-violet-100 text-violet-900'
        : 'border-violet-300 bg-violet-500/25 text-violet-50'
      : isLight
        ? 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
        : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-violet-500'
    } min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase leading-tight transition-all`;

  const handleVisualizationToggle = (target: 'notes' | 'intervals' | 'shape') => {
    setVisualizationMode((current) => cycleVisualizationMode(current, target));
  };

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
          <div className="grid gap-3 md:grid-cols-4">
            <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.instrument}</p>
              <p className="mt-1 text-base font-black uppercase">{instrument === 'guitar' ? copy.guitar : copy.bass}</p>
            </div>
            <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.note}</p>
              <p className="mt-1 text-base font-black">{note}</p>
            </div>
            <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.quality}</p>
              <p className="mt-1 text-base font-black">{qualityLabels[lang][quality]}</p>
            </div>
            <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.inversion}</p>
              <p className="mt-1 text-base font-black">{getHighlightLabel(highlight, copy)}</p>
            </div>
          </div>

          <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
            {copy.quickFlow}
          </div>

          <div className={`mt-4 rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-violet-800/50 bg-zinc-900/60'}`}>
            <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
              <div className="min-w-fit">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.instrument}</p>
                <div className="mt-2 flex gap-2">
                  {(['guitar', 'bass'] as TeenTetradInstrument[]).map((item) => (
                    <button key={item} onClick={() => setInstrument(item)} className={toolbarButtonClass(instrument === item)}>
                      {item === 'guitar' ? copy.guitar : copy.bass}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-fit">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.handedness}</p>
                <div className="mt-2 flex gap-2">
                  {(['right', 'left'] as const).map((item) => (
                    <button key={item} onClick={() => setHandedness(item)} className={violetButtonClass(handedness === item)}>
                      {item === 'right' ? copy.right : copy.left}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-fit">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.frets}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => setFretCount((current) => Math.max(12, current - 1))}
                    className={`h-11 w-11 rounded-xl border text-xl font-black ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label={lang === 'pt' ? 'Diminuir casas' : 'Decrease frets'}
                  >
                    −
                  </button>
                  <div className="min-w-[28px] text-center text-2xl font-black">{fretCount}</div>
                  <button
                    onClick={() => setFretCount((current) => Math.min(18, current + 1))}
                    className={`h-11 w-11 rounded-xl border text-xl font-black ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label={lang === 'pt' ? 'Aumentar casas' : 'Increase frets'}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-4 rounded-3xl border p-4 md:p-5 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-violet-800/50 bg-zinc-900/60'}`}>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto_auto_auto] xl:items-start">
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.note}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
                  {CHROMATIC_NOTES.map((item, index) => (
                    <button key={item} onClick={() => setNoteIndex(index)} className={`${violetButtonClass(note === item)} inline-flex items-center justify-center text-center`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.stringGroup}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {groupOptions.map((group) => (
                    <button key={group.id} onClick={() => setActiveGroupId(group.id)} className={`${toolbarButtonClass(activeGroupId === group.id)} inline-flex items-center justify-center text-center`}>
                      {group.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.quality}</p>
                  <button
                    onClick={() => setShowQualityInfo((prev) => !prev)}
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black transition-colors ${showQualityInfo ? 'bg-violet-500 text-white' : isLight ? 'bg-slate-200 text-slate-500 hover:bg-violet-100 hover:text-violet-600' : 'bg-zinc-700 text-zinc-400 hover:bg-violet-500/20 hover:text-violet-400'}`}
                    aria-label={copy.qualityInfoTitle}
                  >
                    i
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(['maj7', 'm7', '7', 'm7b5', 'dim7'] as TeenTetradQuality[]).map((item) => (
                    <button key={item} onClick={() => setQuality(item)} className={`${toolbarButtonClass(quality === item)} inline-flex items-center justify-center text-center`}>
                      {qualityLabels[lang][item]}
                    </button>
                  ))}
                </div>
                {showQualityInfo && (
                  <div className={`mt-2 rounded-xl border px-3 py-2 ${isLight ? 'border-violet-200 bg-violet-50' : 'border-violet-800/50 bg-violet-500/8'}`}>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-400">{copy.qualityInfoTitle}</p>
                    <div className="mt-1.5 space-y-0.5">
                      {(['maj7', 'm7', '7', 'm7b5', 'dim7'] as TeenTetradQuality[]).map((item) => (
                        <div key={item} className="flex items-center gap-2 text-[11px] font-bold">
                          <span className={isLight ? 'text-slate-700' : 'text-zinc-200'}>{qualityLabels[lang][item]}</span>
                          <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>→</span>
                          <span className={`font-black ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{qualityTechnical[item]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.inversion}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {([
                    { id: 'root', label: copy.root },
                    { id: 'first', label: copy.first },
                    { id: 'second', label: copy.second },
                    { id: 'third', label: copy.third },
                  ] as const).map((item) => (
                    <button key={item.id} onClick={() => setHighlight(item.id)} className={`${toolbarButtonClass(highlight === item.id)} inline-flex items-center justify-center text-center`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
              <button
                onClick={() => handleVisualizationToggle('notes')}
                className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight transition-all ${getVisualizationButtonClass(visualizationMode, 'notes', isLight)}`}
              >
                {copy.showNotes}
              </button>
              <button
                onClick={() => handleVisualizationToggle('intervals')}
                className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight transition-all ${getVisualizationButtonClass(visualizationMode, 'intervals', isLight)}`}
              >
                {copy.showIntervals}
              </button>
              <button
                onClick={() => handleVisualizationToggle('shape')}
                className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight transition-all ${getVisualizationButtonClass(visualizationMode, 'shape', isLight)}`}
              >
                {copy.shapeOnly}
              </button>
            </div>

            <div className={`mt-4 flex flex-wrap items-center justify-end gap-2 rounded-2xl border px-4 py-3 text-sm font-bold ${isLight ? 'border-slate-200 bg-white/80 text-slate-700' : 'border-violet-800/50 bg-zinc-950/60 text-zinc-200'}`}>
              <span className="uppercase tracking-[0.15em] text-violet-400">{copy.notes}</span>
              <span className="ml-2">{tetradNoteSequence.join(' · ')}</span>
              <span className={`ml-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>/ {tetradFormulaSequence.join(' · ')}</span>
              <span className={`ml-2 ${isLight ? 'text-slate-300' : 'text-zinc-600'}`}>·</span>
              <span className="text-violet-400">{qualityLabels[lang][quality]}</span>
              <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>=</span>
              <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>{qualityTechnical[quality]}</span>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <div className={`min-w-[1040px] rounded-[28px] border px-4 py-5 ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950/80'}`}>
              <FretboardSVG
                state={fretboardState}
                editorMode="view"
                onEvent={() => undefined}
                selectedColor="#dc2626"
                selectedShape="circle"
                theme={theme}
                isActive={false}
              />
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

export default TeenTetradMapPage;
