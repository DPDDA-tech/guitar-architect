import type { FretboardState, Line, Marker, MarkerShape, StringStatus } from '../types';
import type { ChordVoicingCandidate, ChordVoicingNote } from '../music/chordLibrary';
import type { TeenChordInstrument, TeenRenderedShape } from '../data/teenChordExplorer';

export type ChordStringState =
  | { type: 'mute' }
  | { type: 'open'; note?: string }
  | { type: 'fretted'; fret: number; note?: string; finger?: number | string };

export type ChordDiagramData = {
  instrument: 'guitar' | 'bass';
  tuning: string[];
  strings: ChordStringState[];
  baseFret?: number;
  visibleFrets?: number;
  rootNote?: string;
  title?: string;
  subtitle?: string;
  barre?: {
    fret: number;
    fromString: number;
    toString: number;
  };
};

type ChordRenderPosition = {
  string: number;
  fret: number;
  note?: string;
  finger?: string;
};

type BuildChordRenderStateOptions = {
  stringCount: number;
  positions: ChordRenderPosition[];
  mutedStrings?: number[];
  barre?: {
    fret: number;
    fromString: number;
    toString: number;
  };
  markerColor?: string;
  alternateMarkerColor?: string;
  markerShape?: MarkerShape;
  lineColor?: string;
  lineWidth?: number;
  shapeMode?: 'uniform' | 'lead-circle';
};

type ChordRenderState = {
  markers: Marker[];
  lines: Line[];
  stringStatuses: StringStatus[];
};

const isValidStringIndex = (value: number, stringCount: number) => value >= 0 && value < stringCount;

export const normalizeStringStatus = (status: StringStatus | 'muted' | null | undefined): StringStatus => {
  if (status === 'open') return 'open';
  if (status === 'mute' || status === 'muted') return 'mute';
  return 'normal';
};

export const buildChordRenderState = ({
  stringCount,
  positions,
  mutedStrings = [],
  barre,
  markerColor = '#2563eb',
  alternateMarkerColor = '#ef4444',
  markerShape = 'circle',
  lineColor = '#0f172a',
  lineWidth = 11,
  shapeMode = 'uniform',
}: BuildChordRenderStateOptions): ChordRenderState => {
  const stringStatuses: StringStatus[] = Array(stringCount).fill('mute');
  const markers: Marker[] = [];

  positions
    .filter((position) => isValidStringIndex(position.string, stringCount))
    .forEach((position, index) => {
      if (position.fret === 0) {
        stringStatuses[position.string] = 'open';
        return;
      }

      stringStatuses[position.string] = 'normal';
      markers.push({
        id: crypto.randomUUID(),
        string: position.string,
        fret: position.fret,
        shape: shapeMode === 'lead-circle' ? (index === 0 ? 'circle' : 'square') : markerShape,
        color: shapeMode === 'lead-circle' ? (index === 0 ? alternateMarkerColor : markerColor) : markerColor,
        finger: position.finger && position.finger !== '0' ? String(position.finger) : '1',
      });
    });

  mutedStrings.forEach((stringIndex) => {
    if (isValidStringIndex(stringIndex, stringCount) && stringStatuses[stringIndex] !== 'open') {
      stringStatuses[stringIndex] = 'mute';
    }
  });

  const lines: Line[] = barre && barre.fret > 0 ? [{
    id: crypto.randomUUID(),
    start: { string: barre.fromString, fret: barre.fret },
    end: { string: barre.toString, fret: barre.fret },
    color: lineColor,
    width: lineWidth,
  }] : [];

  return { markers, lines, stringStatuses };
};

export const createChordDiagramDataFromVoicing = (
  voicing: ChordVoicingCandidate,
  tuning: string[],
  instrument: 'guitar' | 'bass' = 'guitar',
): ChordDiagramData => {
  const strings: ChordStringState[] = Array.from({ length: tuning.length }, () => ({ type: 'mute' }));
  const positionByString = new Map<number, ChordRenderPosition>();

  voicing.positions.forEach((position) => {
    positionByString.set(position.string, position);
  });

  strings.forEach((_, stringIndex) => {
    const position = positionByString.get(stringIndex);
    if (!position) {
      strings[stringIndex] = { type: 'mute' };
      return;
    }

    if (position.fret === 0) {
      strings[stringIndex] = { type: 'open', note: position.note };
      return;
    }

    strings[stringIndex] = {
      type: 'fretted',
      fret: position.fret,
      note: position.note,
      finger: position.finger,
    };
  });

  voicing.mutedStrings.forEach((stringIndex) => {
    if (isValidStringIndex(stringIndex, strings.length) && !positionByString.has(stringIndex)) {
      strings[stringIndex] = { type: 'mute' };
    }
  });

  const fretted = voicing.positions.filter((position) => position.fret > 0).map((position) => position.fret);
  const baseFret = fretted.length > 0 ? Math.min(...fretted) : 1;

  return {
    instrument,
    tuning,
    strings,
    baseFret: baseFret <= 1 ? 1 : baseFret,
    title: voicing.name,
    subtitle: voicing.voicingStyle,
    barre: voicing.barre,
  };
};

export const createChordDiagramDataFromTeenShape = (
  shape: TeenRenderedShape,
  tuning: string[],
  instrument: TeenChordInstrument,
  rootNote?: string,
): ChordDiagramData => {
  const stringCount = tuning.length;
  const strings: ChordStringState[] = Array.from({ length: stringCount }, () => ({ type: 'mute' }));
  
  shape.cells.forEach((cell) => {
    if (cell.fret === 0) {
      strings[cell.stringIndex] = { type: 'open' };
    } else {
      strings[cell.stringIndex] = { type: 'fretted', fret: cell.fret };
    }
  });
  const frettedFrets = shape.cells
    .filter((cell) => cell.fret > 0)
    .map((cell) => cell.fret);
  const hasOpenStrings = shape.cells.some((cell) => cell.fret === 0);
  const baseFret = hasOpenStrings ? 1 : frettedFrets.length > 0 ? Math.min(...frettedFrets) : 1;

  return {
    instrument,
    tuning,
    strings,
    baseFret: baseFret <= 1 ? 1 : baseFret,
    rootNote,
    title: shape.label,
  };
};

export const createReadonlyFretboardStateFromChordDiagramData = (
  diagram: ChordDiagramData,
  isLeftHanded = false,
): FretboardState => {
  const positions: ChordRenderPosition[] = [];
  const stringCount = diagram.strings.length;

  diagram.strings.forEach((stringState, string) => {
    if (stringState.type === 'fretted') {
      positions.push({
        string,
        fret: stringState.fret,
        note: stringState.note,
        finger: stringState.finger ? String(stringState.finger) : undefined,
      });
    }
    if (stringState.type === 'open') {
      positions.push({
        string,
        fret: 0,
        note: stringState.note,
      });
    }
  });

  const { markers, lines, stringStatuses } = buildChordRenderState({
    stringCount,
    positions,
    mutedStrings: diagram.strings
      .map((stringState, stringIndex) => stringState.type === 'mute' ? stringIndex : null)
      .filter((stringIndex): stringIndex is number => stringIndex !== null),
    barre: diagram.barre,
    shapeMode: 'lead-circle',
  });

  positions
    .filter((position) => position.fret === 0)
    .forEach((position) => {
      markers.push({
        id: crypto.randomUUID(),
        string: position.string,
        fret: 0,
        shape: 'circle',
        color: '#2563eb',
        finger: undefined,
      });
    });

  const visibleFrets = Math.max(5, diagram.visibleFrets || 5);
  const startFret = 0;
  const minimumEndFret = visibleFrets - 1;
  const endFret = Math.max(minimumEndFret, ...positions.map((position) => position.fret + 1), 4);

  return {
    id: `chord-diagram-${diagram.title || 'viewer'}`,
    title: diagram.title || '',
    subtitle: diagram.subtitle || '',
    notes: '',
    startFret,
    endFret,
    isLeftHanded,
    root: diagram.rootNote || 'C',
    scaleType: 'Major (Ionian)',
    instrumentType: diagram.instrument === 'bass'
      ? (diagram.strings.length === 5 ? 'bass-5' : 'bass-4')
      : 'guitar-6',
    tuning: 'Custom',
    customTuning: diagram.tuning,
    stringStatuses,
    labelMode: 'none',
    harmonyMode: 'OFF',
    chordQuality: 'DIATONIC',
    chordDegree: 0,
    inversion: 0,
    colorMode: 'SINGLE',
    layers: {
      showInlays: false,
      showAllNotes: false,
      showScale: false,
      showTonic: false,
    },
    markers,
    lines,
  };
};
