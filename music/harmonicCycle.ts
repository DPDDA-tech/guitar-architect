import { CHROMATIC_SCALE, normalizeNote } from './musicTheory';

export type HarmonicCycleMode = 'major' | 'minor';
export type AccidentalPreference = 'sharp' | 'flat';

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
  accidental: AccidentalPreference;
  keyName: string;
  keySignature: {
    count: number;
    type: 'sharps' | 'flats' | 'none';
  };
  scale: string[];
  relative: string;
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

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const NATURAL_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];
const MAJOR_DEGREES = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const MINOR_DEGREES = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
const MAJOR_QUALITIES = ['', 'm', 'm', '', '', 'm', '°'];
const MINOR_QUALITIES = ['m', '°', '', 'm', 'm', '', ''];

const noteName = (note: string, accidental: AccidentalPreference) => {
  const normalized = normalizeNote(note);
  const index = CHROMATIC_SCALE.indexOf(normalized);
  if (index === -1) return note;
  return accidental === 'flat' ? FLAT_NOTES[index] : SHARP_NOTES[index];
};

export const getAccidentalPreference = (root: string, mode: HarmonicCycleMode): AccidentalPreference => {
  if (root.includes('b')) return 'flat';
  if (root.includes('#')) return 'sharp';
  if (mode === 'minor') {
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
  const intervals = mode === 'major' ? MAJOR_INTERVALS : NATURAL_MINOR_INTERVALS;
  const rootIndex = CHROMATIC_SCALE.indexOf(normalizeNote(root));
  if (rootIndex === -1) return [];
  return intervals.map(interval => noteName(CHROMATIC_SCALE[(rootIndex + interval) % 12], accidental));
};

export const getKeySignature = (root: string, mode: HarmonicCycleMode) => {
  const accidental = getAccidentalPreference(root, mode);
  const relativeMajorRoot = mode === 'major' ? root : noteName(transpose(root, 3), accidental);
  const count = MAJOR_SIGNATURES[relativeMajorRoot] ?? 0;
  return {
    count: Math.abs(count),
    type: count > 0 ? 'sharps' as const : count < 0 ? 'flats' as const : 'none' as const,
  };
};

const chordName = (note: string, quality: string) => `${note}${quality}`;

export const getHarmonicKeyInfo = (root: string, mode: HarmonicCycleMode): HarmonicKeyInfo => {
  const accidental = getAccidentalPreference(root, mode);
  const displayRoot = noteName(root, accidental);
  const scale = buildScale(displayRoot, mode, accidental);
  const signature = getKeySignature(displayRoot, mode);
  const relative = mode === 'major'
    ? `${scale[5]}m`
    : noteName(transpose(displayRoot, 3), accidental);
  const dominant = mode === 'major' ? scale[4] : `${scale[4]}m`;
  const subdominant = mode === 'major' ? scale[3] : `${scale[3]}m`;
  const degrees = mode === 'major' ? MAJOR_DEGREES : MINOR_DEGREES;
  const qualities = mode === 'major' ? MAJOR_QUALITIES : MINOR_QUALITIES;

  return {
    root: normalizeNote(displayRoot),
    displayRoot,
    mode,
    accidental,
    keyName: mode === 'major' ? displayRoot : `${displayRoot}m`,
    keySignature: signature,
    scale,
    relative,
    dominant,
    subdominant,
    harmonicField: scale.map((note, index) => ({
      degree: degrees[index],
      note,
      chord: chordName(note, qualities[index]),
      role:
        index === 0 ? 'tonic' :
        index === 3 ? 'subdominant' :
        index === 4 ? 'dominant' :
        index === 5 && mode === 'major' ? 'relative' :
        index === 2 && mode === 'minor' ? 'relative' :
        qualities[index] === '°' ? 'diminished' :
        'neighbor',
    })),
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
  : ['i - VI - III - VII', 'i - iv - v', 'i - VII - VI - VII', 'ii° - V - i'];

export const resolveProgression = (progression: string, field: HarmonicDegree[]) => {
  const normalized = progression.split('-').map(item => item.trim());
  return normalized.map(degree => field.find(item => item.degree === degree || item.degree.replace('°', '') === degree.replace('°', ''))).filter(Boolean) as HarmonicDegree[];
};
