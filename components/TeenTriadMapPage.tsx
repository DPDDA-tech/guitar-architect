import React, { useEffect, useMemo, useState } from 'react';
import FretboardSVG from './FretboardSVG';
import { getIntervalName, getNoteAt } from '../music/musicTheory';
import { getTeensLang, getTeensTheme, setGlobalLang, setGlobalTheme } from '../utils/ecosystemPreferences';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';
import AppFooter from './AppFooter';
import {
  generateTeenTriadMap,
  getTeenTriadGroups,
  getTeenTriadNotes,
  type TeenTriadGroupMap,
  type TeenTriadHighlight,
  type TeenTriadInstrument,
} from '../data/teenTriadMap';
import type { TriadInversion, TriadQuality } from '../utils/triadLogic';
import type { FretboardState, Line, Marker, StringStatus } from '../types';

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

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z" />
  </svg>
);

const qualityLabels: Record<'pt' | 'en', Record<TriadQuality, string>> = {
  pt: {
    major: 'Maior',
    minor: 'Menor',
    diminished: 'Diminuta',
    augmented: 'Aumentada',
  },
  en: {
    major: 'Major',
    minor: 'Minor',
    diminished: 'Diminished',
    augmented: 'Augmented',
  },
};

const inversionFullCopyKey: Record<TriadInversion, 'rootFull' | 'firstFull' | 'secondFull'> = {
  root: 'rootFull',
  first: 'firstFull',
  second: 'secondFull',
};

// What defines an inversion is which note sits in the bass: root position has
// the tonic in the bass, first inversion has the third, second inversion has
// the fifth — the other two notes simply stack above it in triad order.
const roleSequenceByInversion: Record<TriadInversion, Array<'T' | '3' | '5'>> = {
  root: ['T', '3', '5'],
  first: ['3', '5', 'T'],
  second: ['5', 'T', '3'],
};

// A shape's nominal `inversion` reflects how generateTriadShapes assigned
// notes to its anchor string, but anchor permutations can land a different
// note on the group's actual lowest-pitched string. So the connection order
// must be derived from the bass note that's really there, not from the label.
const ROLE_ORDER: Array<'T' | '3' | '5'> = ['T', '3', '5'];
const buildRoleStackFromBass = (bassRole: 'T' | '3' | '5'): Array<'T' | '3' | '5'> => {
  const startIndex = ROLE_ORDER.indexOf(bassRole);
  return [ROLE_ORDER[startIndex], ROLE_ORDER[(startIndex + 1) % 3], ROLE_ORDER[(startIndex + 2) % 3]];
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

const getMarkerIntervalLabel = (interval: string) => {
  if (interval === '1' || interval === 'P1' || interval === 'R') return 'T';
  if (interval === '3' || interval === 'M3' || interval === 'm3' || interval === 'b3') return '3';
  if (interval === '5' || interval === 'P5' || interval === 'd5' || interval === 'A5' || interval === 'b5' || interval === 'b6') return '5';
  return interval;
};

const getHighlightLabel = (
  highlight: TeenTriadHighlight,
  copy: Record<string, string>,
) => copy[inversionFullCopyKey[highlight]];

const TRIAD_INTERVAL_LABELS: Record<TriadQuality, Array<'T' | '3' | '5'>> = {
  major: ['T', '3', '5'],
  minor: ['T', '3', '5'],
  diminished: ['T', '3', '5'],
  augmented: ['T', '3', '5'],
};

const isGlobalVisualizationMode = (visualizationMode: VisualizationMode) =>
  visualizationMode === 'notes-all'
  || visualizationMode === 'notes-neck'
  || visualizationMode === 'intervals-all'
  || visualizationMode === 'intervals-neck';

const isShapeVisualizationMode = (visualizationMode: VisualizationMode) =>
  visualizationMode === 'shape' || visualizationMode === 'notes-shape' || visualizationMode === 'intervals-shape';

const isNotesVisualizationMode = (visualizationMode: VisualizationMode) =>
  visualizationMode === 'notes-shape'
  || visualizationMode === 'notes-all'
  || visualizationMode === 'notes-neck';

const buildGlobalTriadMarkers = (
  root: string,
  quality: TriadQuality,
  tuning: string[],
  fretCount: number,
  visualizationMode: VisualizationMode,
): Marker[] => {
  const triadNotes = getTeenTriadNotes(root, quality);
  const intervalLabels = TRIAD_INTERVAL_LABELS[quality];
  const intervalColors = {
    T: '#dc2626',
    '3': '#d97706',
    '5': '#2563eb',
  } as const;

  const markers: Marker[] = [];

  tuning.forEach((_, stringIndex) => {
    for (let fret = 0; fret <= fretCount; fret += 1) {
      const note = getNoteAt(stringIndex, fret, tuning);
      const noteIndex = triadNotes.indexOf(note);
      if (noteIndex === -1) continue;

      const label = intervalLabels[noteIndex];
      markers.push({
        id: crypto.randomUUID(),
        string: stringIndex,
        fret,
        shape: 'circle',
        color: intervalColors[label],
        finger: isNotesVisualizationMode(visualizationMode) ? note : label,
      });
    }
  });

  return markers;
};

const buildChromaticNeckMarkers = (
  root: string,
  quality: TriadQuality,
  tuning: string[],
  fretCount: number,
  visualizationMode: VisualizationMode,
): Marker[] => {
  const showNotes = visualizationMode === 'notes-neck';
  const triadNotes = getTeenTriadNotes(root, quality);
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
      const isTriadTone = triadNotes.includes(note);
      markers.push({
        id: crypto.randomUUID(),
        string: stringIndex,
        fret,
        shape: 'circle',
        color: isTriadTone ? (intervalColors[interval] ?? '#94a3b8') : neutralColor,
        finger: showNotes ? note : interval,
      });
    }
  });

  return markers;
};

const buildTriadMapFretboardState = (
  groupMaps: TeenTriadGroupMap[],
  activeGroupId: string,
  highlight: TeenTriadHighlight,
  visualizationMode: VisualizationMode,
  instrument: TeenTriadInstrument,
  fretCount: number,
  isLeftHanded: boolean,
  root: string,
  quality: TriadQuality,
): FretboardState => {
  const shapeMarkers: Marker[] = [];
  const lines: Line[] = [];
  const intervalColors = {
    T: '#dc2626',
    '3': '#d97706',
    '5': '#2563eb',
  } as const;
  const tuning = instrument === 'guitar'
    ? ['E', 'B', 'G', 'D', 'A', 'E']
    : ['G', 'D', 'A', 'E'];
  const stringCount = tuning.length;
  const stringStatuses: StringStatus[] = Array.from({ length: stringCount }, () => 'normal');

  groupMaps.forEach((groupMap) => {
    const allGroupsActive = activeGroupId === 'all';
    const groupIsActive = allGroupsActive || groupMap.group.id === activeGroupId;
    const visibleShapes = groupMap.shapes.filter((shape) => shape.inversion === highlight);

    groupMap.shapes.forEach((shape) => {
      const highlighted = shape.inversion === highlight;
      if (!groupIsActive && !highlighted) return;

      shape.positions.forEach((position) => {
        const label = getMarkerIntervalLabel(position.interval);
        const color = intervalColors[label as keyof typeof intervalColors] ?? '#6b7280';
        const markerColor = groupIsActive ? color : `${color}33`;
        const showLabel =
          (visualizationMode === 'notes-shape' && groupIsActive)
          || (visualizationMode === 'intervals-shape' && groupIsActive);

        shapeMarkers.push({
          id: crypto.randomUUID(),
          string: position.string,
          fret: position.fret,
          shape: 'circle',
          color: markerColor,
          finger: showLabel ? (visualizationMode === 'notes-shape' ? position.note : label) : '',
        });
      });
    });

    // Each shape's own three notes are connected stacking up from whichever
    // note is actually in the bass (the lowest-pitched string the shape uses)
    // — that note is what defines the inversion (T in the bass = root
    // position, 3 = first inversion, 5 = second inversion), not the shape's
    // nominal label.
    if (groupIsActive) {
      visibleShapes.forEach((shape) => {
        const bassPosition = shape.positions.reduce((lowest, position) => (
          position.string > lowest.string ? position : lowest
        ));
        const bassRole = getMarkerIntervalLabel(bassPosition.interval) as 'T' | '3' | '5';
        const roleSequence = buildRoleStackFromBass(bassRole);

        for (let index = 0; index < roleSequence.length - 1; index += 1) {
          const fromRole = roleSequence[index];
          const toRole = roleSequence[index + 1];
          const fromPosition = shape.positions.find(
            (position) => getMarkerIntervalLabel(position.interval) === fromRole
          );
          const toPosition = shape.positions.find(
            (position) => getMarkerIntervalLabel(position.interval) === toRole
          );

          if (!fromPosition || !toPosition) continue;

          lines.push({
            id: crypto.randomUUID(),
            start: { string: fromPosition.string, fret: fromPosition.fret },
            end: { string: toPosition.string, fret: toPosition.fret },
            color: intervalColors[fromRole],
            width: 8,
          });
        }
      });
    }
  });

  const globalMarkers =
    visualizationMode === 'notes-neck' || visualizationMode === 'intervals-neck'
      ? buildChromaticNeckMarkers(root, quality, tuning, fretCount, visualizationMode)
      : buildGlobalTriadMarkers(root, quality, tuning, fretCount, visualizationMode);
  const markers = isGlobalVisualizationMode(visualizationMode)
    ? globalMarkers
    : isShapeVisualizationMode(visualizationMode)
      ? shapeMarkers
      : shapeMarkers.map((marker) => ({ ...marker, finger: '' }));

  return {
    id: 'triad-map',
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

const TeenTriadMapPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [lang, setLang] = useState<'pt' | 'en'>(() => getTeensLang());
  const [instrument, setInstrument] = useState<TeenTriadInstrument>('guitar');
  const [handedness, setHandedness] = useState<'right' | 'left'>('right');
  const [noteIndex, setNoteIndex] = useState(0);
  const [quality, setQuality] = useState<TriadQuality>('major');
  const [activeGroupId, setActiveGroupId] = useState('all');
  const [highlight, setHighlight] = useState<TeenTriadHighlight>('root');
  const [fretCount, setFretCount] = useState(15);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('intervals-shape');
  const isLight = theme === 'light';
  const note = CHROMATIC_NOTES[noteIndex];

  const copy = lang === 'pt'
    ? {
        title: 'Mapa de Tríades',
        subtitle: 'Veja as tríades se conectando pelo braço inteiro.',
        instrument: 'Instrumento',
        note: 'Nota',
        quality: 'Qualidade',
        stringGroup: 'Grupo',
        inversion: 'Estado / Inversão',
        all: 'Todas',
        root: 'Fund.',
        first: '1ª Inv.',
        second: '2ª Inv.',
        rootFull: 'Fundamental',
        firstFull: '1ª Inversão',
        secondFull: '2ª Inversão',
        notes: 'Notas da tríade',
        quickFlow: 'Escolha instrumento, nota, qualidade e grupo. Depois destaque uma inversão para enxergar as ligações no braço.',
        handedness: 'Modo do braço',
        right: 'Destro',
        left: 'Canhoto',
        frets: 'Casas',
        language: 'Idioma',
        mode: 'Modo',
        guitar: 'Guitarra',
        bass: 'Baixo',
        showNotes: 'Notas',
        showIntervals: 'Intervalos',
        shapeOnly: 'Somente shape',
        back: 'Voltar ao Teens',
        studio: 'Ir para Studio',
      }
    : {
        title: 'Triad Map',
        subtitle: 'See triads connecting across the full neck.',
        instrument: 'Instrument',
        note: 'Note',
        quality: 'Quality',
        stringGroup: 'Group',
        inversion: 'Inversion',
        all: 'All',
        root: 'Root',
        first: '1st Inv.',
        second: '2nd Inv.',
        rootFull: 'Root',
        firstFull: '1st Inversion',
        secondFull: '2nd Inversion',
        notes: 'Triad notes',
        quickFlow: 'Choose instrument, note, quality and group. Then highlight an inversion to see the links across the neck.',
        handedness: 'Neck mode',
        right: 'Right',
        left: 'Left',
        frets: 'Frets',
        language: 'Language',
        mode: 'Mode',
        guitar: 'Guitar',
        bass: 'Bass',
        showNotes: 'Notes',
        showIntervals: 'Intervals',
        shapeOnly: 'Shape only',
        back: 'Back to Teens',
        studio: 'Go to Studio',
      };

  const groupOptions = useMemo(() => getTeenTriadGroups(instrument), [instrument]);
  const groupMaps = useMemo(
    () => generateTeenTriadMap(note, quality, instrument, fretCount),
    [instrument, note, quality, fretCount]
  );
  const triadNotes = useMemo(() => getTeenTriadNotes(note, quality), [note, quality]);
  const triadRoleSequence = roleSequenceByInversion[highlight];
  const triadNoteSequence = useMemo(() => {
    const roleToNoteIndex: Record<'T' | '3' | '5', number> = { T: 0, '3': 1, '5': 2 };
    return triadRoleSequence.map((role) => triadNotes[roleToNoteIndex[role]]);
  }, [triadNotes, triadRoleSequence]);
  const fretboardState = useMemo(
    () => buildTriadMapFretboardState(
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

  const handleToggleTheme = () => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      setGlobalTheme(next);
      return next;
    });
  };

  const handleToggleLang = () => {
    setLang((current) => current === 'pt' ? 'en' : 'pt');
  };

  const handleVisualizationToggle = (target: 'notes' | 'intervals' | 'shape') => {
    setVisualizationMode((current) => cycleVisualizationMode(current, target));
  };

  const showFormulaHint =
    visualizationMode === 'intervals-shape'
    || visualizationMode === 'intervals-all'
    || visualizationMode === 'intervals-neck';

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

          <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${isLight ? 'border-violet-200 bg-violet-50 text-violet-800' : 'border-violet-500/30 bg-violet-500/8 text-violet-200'}`}>
            {copy.quickFlow}
          </div>

          <div className={`mt-4 rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-violet-800/50 bg-zinc-900/60'}`}>
            <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
              <div className="min-w-fit">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.instrument}</p>
                <div className="mt-2 flex gap-2">
                  {(['guitar', 'bass'] as TeenTriadInstrument[]).map((item) => (
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
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setFretCount((current) => Math.max(5, current - 1))}
                    className={`h-10 w-10 rounded-xl border text-lg font-black ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label="Diminuir casas"
                  >
                    -
                  </button>
                  <div className="min-w-[28px] text-center text-xl font-black">{fretCount}</div>
                  <button
                    onClick={() => setFretCount((current) => Math.min(24, current + 1))}
                    className={`h-10 w-10 rounded-xl border text-lg font-black ${isLight ? 'border-slate-300 bg-slate-100 text-slate-800 hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-violet-500'}`}
                    aria-label="Aumentar casas"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-violet-800/50 bg-zinc-900/60'}`}>
            <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.note}</p>
                <div className="mt-2 grid grid-cols-6 gap-2">
                  {CHROMATIC_NOTES.map((item, index) => (
                    <button key={item} onClick={() => setNoteIndex(index)} className={`${violetButtonClass(note === item)} inline-flex items-center justify-center text-center`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.stringGroup}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {groupOptions.map((group) => (
                    <button key={group.id} onClick={() => setActiveGroupId(group.id)} className={`${toolbarButtonClass(activeGroupId === group.id)} inline-flex items-center justify-center text-center`}>
                      {group.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.quality}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(['major', 'minor', 'diminished', 'augmented'] as TriadQuality[]).map((item) => (
                    <button key={item} onClick={() => setQuality(item)} className={`${toolbarButtonClass(quality === item)} inline-flex items-center justify-center text-center`}>
                      {qualityLabels[lang][item]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.inversion}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {([
                    { id: 'root', label: copy.root },
                    { id: 'first', label: copy.first },
                    { id: 'second', label: copy.second },
                  ] as const).map((item) => (
                    <button key={item.id} onClick={() => setHighlight(item.id)} className={`${toolbarButtonClass(highlight === item.id)} inline-flex items-center justify-center text-center`}>
                      {item.label}
                    </button>
                  ))}
                </div>
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
            <div className={`ml-auto rounded-xl border px-4 py-2 text-xs font-black ${isLight ? 'border-slate-200 bg-white text-slate-700' : 'border-zinc-800 bg-zinc-950/80 text-zinc-200'}`}>
              <span className="uppercase tracking-[0.15em] text-violet-400">{copy.notes}</span>
              <span className="ml-2">{triadNoteSequence.join(' · ')}</span>
              {showFormulaHint && (
                <span className={`ml-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>/ {triadRoleSequence.join(' · ')}</span>
              )}
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

export default TeenTriadMapPage;
