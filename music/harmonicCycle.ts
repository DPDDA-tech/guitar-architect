import { CHROMATIC_SCALE, normalizeNote } from './musicTheory';

export type HarmonicCycleMode =
  | 'major'
  | 'minor'
  | 'harmonic-minor'
  | 'melodic-minor'
  | 'pentatonic-major'
  | 'pentatonic-minor'
  | 'blues'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'locrian';

export type AccidentalPreference = 'sharp' | 'flat';
export type HarmonicModeGroup = 'tonal' | 'pentatonic' | 'modal';

export interface HarmonicDegree {
  degree: string;
  note: string;
  chord: string;
  role: 'tonic' | 'subdominant' | 'dominant' | 'relative' | 'diminished' | 'neighbor';
}

export interface HarmonicKeyInfo {
  root: string;
  displayRoot: string;
  mode: HarmonicCycleMode;
  group: HarmonicModeGroup;
  scaleType: string;
  supportsHarmonicField: boolean;
  accidental: AccidentalPreference;
  keyName: string;
  keySignature: {
    count: number;
    type: 'sharps' | 'flats' | 'none';
    isTraditional: boolean;
  };
  scale: string[];
  relative: string;
  contextualReference: {
    label: 'relativeMinor' | 'relativeMajor' | 'derivedMode' | 'parallelScale' | 'tonalCenter';
    value: string;
  };
  dominant: string;
  subdominant: string;
  harmonicField: HarmonicDegree[];
}

const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const SHARP_KEY_ROOTS = new Set(['G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#']);
const FLAT_KEY_ROOTS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab']);

export const FIFTHS_CYCLE = ['C', 'G', 'D', 'A', 'E', 'B', 'F#/Gb', 'Db/C#', 'Ab/G#', 'Eb/D#', 'Bb/A#', 'F'];
export const HARMONIC_ROOT_OPTIONS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Gb', 'C#', 'Db', 'G#', 'Ab', 'D#', 'Eb', 'A#', 'Bb', 'F'];

const MAJOR_SIGNATURES: Record<string, number> = {
  C: 0,
  G: 1,
  D: 2,
  A: 3,
  E: 4,
  B: 5,
  'F#': 6,
  'C#': 7,
  F: -1,
  Bb: -2,
  Eb: -3,
  Ab: -4,
  Db: -5,
  Gb: -6,
  Cb: -7,
};

const MODE_DEFINITIONS: Record<HarmonicCycleMode, {
  group: HarmonicModeGroup;
  intervals: number[];
  scaleType: string;
  keyNameSuffix: string;
  supportsHarmonicField: boolean;
  traditionalSignature: boolean;
  contextualLabel: HarmonicKeyInfo['contextualReference']['label'];
}> = {
  major: { group: 'tonal', intervals: [0, 2, 4, 5, 7, 9, 11], scaleType: 'Major (Ionian)', keyNameSuffix: '', supportsHarmonicField: true, traditionalSignature: true, contextualLabel: 'relativeMinor' },
  minor: { group: 'tonal', intervals: [0, 2, 3, 5, 7, 8, 10], scaleType: 'Natural Minor (Aeolian)', keyNameSuffix: 'm', supportsHarmonicField: true, traditionalSignature: true, contextualLabel: 'relativeMajor' },
  'harmonic-minor': { group: 'tonal', intervals: [0, 2, 3, 5, 7, 8, 11], scaleType: 'Harmonic Minor', keyNameSuffix: 'm', supportsHarmonicField: true, traditionalSignature: false, contextualLabel: 'parallelScale' },
  'melodic-minor': { group: 'tonal', intervals: [0, 2, 3, 5, 7, 9, 11], scaleType: 'Melodic Minor', keyNameSuffix: 'm', supportsHarmonicField: true, traditionalSignature: false, contextualLabel: 'parallelScale' },
  'pentatonic-major': { group: 'pentatonic', intervals: [0, 2, 4, 7, 9], scaleType: 'Pentatonic Major', keyNameSuffix: '', supportsHarmonicField: false, traditionalSignature: false, contextualLabel: 'tonalCenter' },
  'pentatonic-minor': { group: 'pentatonic', intervals: [0, 3, 5, 7, 10], scaleType: 'Pentatonic Minor', keyNameSuffix: 'm', supportsHarmonicField: false, traditionalSignature: false, contextualLabel: 'tonalCenter' },
  blues: { group: 'pentatonic', intervals: [0, 3, 5, 6, 7, 10], scaleType: 'Blues', keyNameSuffix: '', supportsHarmonicField: false, traditionalSignature: false, contextualLabel: 'tonalCenter' },
  dorian: { group: 'modal', intervals: [0, 2, 3, 5, 7, 9, 10], scaleType: 'Dorian', keyNameSuffix: '', supportsHarmonicField: true, traditionalSignature: false, contextualLabel: 'derivedMode' },
  phrygian: { group: 'modal', intervals: [0, 1, 3, 5, 7, 8, 10], scaleType: 'Phrygian', keyNameSuffix: '', supportsHarmonicField: true, traditionalSignature: false, contextualLabel: 'derivedMode' },
  lydian: { group: 'modal', intervals: [0, 2, 4, 6, 7, 9, 11], scaleType: 'Lydian', keyNameSuffix: '', supportsHarmonicField: true, traditionalSignature: false, contextualLabel: 'derivedMode' },
  mixolydian: { group: 'modal', intervals: [0, 2, 4, 5, 7, 9, 10], scaleType: 'Mixolydian', keyNameSuffix: '', supportsHarmonicField: true, traditionalSignature: false, contextualLabel: 'derivedMode' },
  locrian: { group: 'modal', intervals: [0, 1, 3, 5, 6, 8, 10], scaleType: 'Locrian', keyNameSuffix: '', supportsHarmonicField: true, traditionalSignature: false, contextualLabel: 'derivedMode' },
};

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

const noteName = (note: string, accidental: AccidentalPreference) => {
  const normalized = normalizeNote(note);
  const index = CHROMATIC_SCALE.indexOf(normalized);
  if (index === -1) return note;
  return accidental === 'flat' ? FLAT_NOTES[index] : SHARP_NOTES[index];
};

export const getAccidentalPreference = (root: string, mode: HarmonicCycleMode): AccidentalPreference => {
  const definition = MODE_DEFINITIONS[mode];
  if (root.includes('b')) return 'flat';
  if (root.includes('#')) return 'sharp';
  if (mode === 'minor' || (definition.group === 'modal' && definition.intervals.length === 7)) {
    const relativeMajor = noteName(transpose(root, 3), 'sharp');
    return FLAT_KEY_ROOTS.has(relativeMajor) && !SHARP_KEY_ROOTS.has(relativeMajor) ? 'flat' : 'sharp';
  }
  return FLAT_KEY_ROOTS.has(root) && !SHARP_KEY_ROOTS.has(root) ? 'flat' : 'sharp';
};

const transpose = (root: string, semitones: number) => {
  const index = CHROMATIC_SCALE.indexOf(normalizeNote(root));
  if (index === -1) return root;
  return CHROMATIC_SCALE[(index + semitones + 120) % 12];
};

export const buildScale = (root: string, mode: HarmonicCycleMode, accidental = getAccidentalPreference(root, mode)) => {
  const intervals = MODE_DEFINITIONS[mode].intervals;
  const rootIndex = CHROMATIC_SCALE.indexOf(normalizeNote(root));
  if (rootIndex === -1) return [];
  return intervals.map(interval => noteName(CHROMATIC_SCALE[(rootIndex + interval) % 12], accidental));
};

export const getKeySignature = (root: string, mode: HarmonicCycleMode) => {
  const definition = MODE_DEFINITIONS[mode];
  if (!definition.traditionalSignature) {
    return { count: 0, type: 'none' as const, isTraditional: false };
  }
  const accidental = getAccidentalPreference(root, mode);
  const relativeMajorRoot = mode === 'major' ? root : noteName(transpose(root, 3), accidental);
  const count = MAJOR_SIGNATURES[relativeMajorRoot] ?? 0;
  return {
    count: Math.abs(count),
    type: count > 0 ? 'sharps' as const : count < 0 ? 'flats' as const : 'none' as const,
    isTraditional: true,
  };
};

const chordName = (note: string, quality: string) => `${note}${quality}`;
const normalizeIntervals = (intervals: number[]) => intervals.map(interval => ((interval % 12) + 12) % 12);

const buildHeptatonicField = (scale: string[], intervals: number[]): HarmonicDegree[] => {
  if (scale.length !== 7 || intervals.length !== 7) return [];
  const normalized = normalizeIntervals(intervals);

  return scale.map((note, index) => {
    const thirdIndex = (index + 2) % 7;
    const fifthIndex = (index + 4) % 7;
    const third = (normalized[thirdIndex] - normalized[index] + 12) % 12;
    const fifth = (normalized[fifthIndex] - normalized[index] + 12) % 12;
    const quality = third === 3 && fifth === 6 ? '°' : third === 3 && fifth === 7 ? 'm' : '';
    const degreeBase = ROMAN[index] || `${index + 1}`;
    const degree = quality === 'm' ? degreeBase.toLowerCase() : quality === '°' ? `${degreeBase.toLowerCase()}°` : degreeBase;

    return {
      degree,
      note,
      chord: chordName(note, quality),
      role: index === 0 ? 'tonic' : index === 3 ? 'subdominant' : index === 4 ? 'dominant' : quality === '°' ? 'diminished' : 'neighbor',
    };
  });
};

export const getHarmonicKeyInfo = (root: string, mode: HarmonicCycleMode): HarmonicKeyInfo => {
  const definition = MODE_DEFINITIONS[mode];
  const accidental = getAccidentalPreference(root, mode);
  const displayRoot = noteName(root, accidental);
  const scale = buildScale(displayRoot, mode, accidental);
  const signature = getKeySignature(displayRoot, mode);

  const relative = mode === 'major'
    ? `${scale[5] || ''}m`
    : mode === 'minor'
      ? noteName(transpose(displayRoot, 3), accidental)
      : displayRoot;

  const contextualValue = definition.contextualLabel === 'relativeMinor'
    ? `${scale[5] || '-'}m`
    : definition.contextualLabel === 'relativeMajor'
      ? noteName(transpose(displayRoot, 3), accidental)
      : definition.contextualLabel === 'parallelScale'
        ? `${displayRoot} menor natural`
        : displayRoot;

  const harmonicField = definition.supportsHarmonicField ? buildHeptatonicField(scale, definition.intervals) : [];

  return {
    root: normalizeNote(displayRoot),
    displayRoot,
    mode,
    group: definition.group,
    scaleType: definition.scaleType,
    supportsHarmonicField: definition.supportsHarmonicField,
    accidental,
    keyName: `${displayRoot}${definition.keyNameSuffix}`,
    keySignature: signature,
    scale,
    relative,
    contextualReference: {
      label: definition.contextualLabel,
      value: contextualValue,
    },
    dominant: definition.supportsHarmonicField ? (scale[4] || '-') : '-',
    subdominant: definition.supportsHarmonicField ? (scale[3] || '-') : '-',
    harmonicField,
  };
};

export const getCycleDisplayNote = (cycleItem: string, accidental: AccidentalPreference) => {
  const [first, second] = cycleItem.split('/');
  if (!second) return first;
  return accidental === 'flat'
    ? [first, second].find(note => note.includes('b')) || first
    : [first, second].find(note => note.includes('#')) || first;
};

export const getSuggestedProgressions = (mode: HarmonicCycleMode) => mode === 'major'
  ? ['I - V - vi - IV', 'ii - V - I', 'I - IV - V', 'vi - IV - I - V']
  : mode === 'minor'
    ? ['i - VI - III - VII', 'i - iv - v', 'i - VII - VI - VII', 'ii° - V - i']
    : mode === 'harmonic-minor'
      ? ['i - iv - V - i', 'i - VI - ii° - V', 'i - VII - VI - V']
      : mode === 'melodic-minor'
        ? ['i - IV - V - i', 'i - ii - V - i', 'i - VI - V - i']
        : mode === 'dorian'
          ? ['i - IV - i - VII', 'i - ii - IV - i', 'i - VII - IV - i']
          : mode === 'phrygian'
            ? ['i - II - i - VII', 'i - VII - VI - VII', 'i - II - VII - i']
            : mode === 'lydian'
              ? ['I - II - I - V', 'I - V - II - I', 'I - VII - II - I']
              : mode === 'mixolydian'
                ? ['I - VII - IV - I', 'I - IV - VII - I', 'I - V - IV - I']
                : mode === 'locrian'
                  ? ['i° - VII - i° - VI', 'i° - VI - VII - i°']
                  : ['Uso melódico: riffs e fraseado', 'Uso melódico: solo e licks', 'Vamp sugerido: I7 - IV7'];

export const getModeScaleType = (mode: HarmonicCycleMode) => MODE_DEFINITIONS[mode].scaleType;

export const resolveProgression = (progression: string, field: HarmonicDegree[]) => {
  const normalized = progression.split('-').map(item => item.trim());
  return normalized
    .map(degree => field.find(item => item.degree === degree || item.degree.replace('°', '') === degree.replace('°', '')))
    .filter(Boolean) as HarmonicDegree[];
};
