import { CHROMATIC_SCALE, getNoteAt, normalizeNote } from './musicTheory';
import type { FretboardState } from '../types';

export type ChordType =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'augmented'
  | 'sus2'
  | 'sus4'
  | '6'
  | 'm6'
  | '7'
  | 'maj7'
  | 'm7'
  | 'm7b5'
  | 'dim7'
  | 'mMaj7'
  | 'add9'
  | 'madd9'
  | '9'
  | 'maj9'
  | 'm9'
  | '11'
  | 'maj11'
  | 'm11'
  | '13'
  | 'maj13'
  | 'm13';

export interface ChordFormula {
  type: ChordType;
  name: string;
  suffix: string;
  intervals: number[];
  intervalNames: string[];
  essentialIntervals: number[];
}

export interface ChordVoicingNote {
  string: number;
  fret: number;
  note: string;
  interval: string;
  finger?: string;
}

export interface ChordVoicingCandidate {
  id: string;
  name: string;
  root: string;
  type: ChordType;
  notes: string[];
  intervals: string[];
  positions: ChordVoicingNote[];
  mutedStrings: number[];
  fretSpan: number;
  minFret: number;
  maxFret: number;
  score: number;
  inversion: string;
  isKnownShape: boolean;
  voicingStyle: 'open' | 'barre' | 'movable' | 'generated';
  difficulty: 'easy' | 'intermediate' | 'advanced';
  barre?: {
    fret: number;
    fromString: number;
    toString: number;
  };
}

export interface ChordMatchCandidate {
  name: string;
  root: string;
  type: ChordType;
  quality: string;
  notes: string[];
  intervalsFound: string[];
  missingIntervals: string[];
  extraIntervals: string[];
  bass?: string;
  inversion: string;
  score: number;
  confidence: number;
}

export interface ChordIdentificationResult {
  bestMatch?: ChordMatchCandidate;
  alternatives: ChordMatchCandidate[];
  selectedNotes: string[];
  bass?: string;
}

export interface GenerateChordVoicingsOptions {
  maxFretSpan: 4 | 5 | 6;
  maxResults?: number;
  maxFret?: number;
  preferOpenChords?: boolean;
  preferRootInBass?: boolean;
}

const CHORD_FORMULAS: Record<ChordType, ChordFormula> = {
  major: { type: 'major', name: 'Major', suffix: '', intervals: [0, 4, 7], intervalNames: ['1', '3', '5'], essentialIntervals: [0, 4, 7] },
  minor: { type: 'minor', name: 'Minor', suffix: 'm', intervals: [0, 3, 7], intervalNames: ['1', 'b3', '5'], essentialIntervals: [0, 3, 7] },
  diminished: { type: 'diminished', name: 'Diminished', suffix: 'dim', intervals: [0, 3, 6], intervalNames: ['1', 'b3', 'b5'], essentialIntervals: [0, 3, 6] },
  augmented: { type: 'augmented', name: 'Augmented', suffix: 'aug', intervals: [0, 4, 8], intervalNames: ['1', '3', '#5'], essentialIntervals: [0, 4, 8] },
  sus2: { type: 'sus2', name: 'Suspended second', suffix: 'sus2', intervals: [0, 2, 7], intervalNames: ['1', '2', '5'], essentialIntervals: [0, 2, 7] },
  sus4: { type: 'sus4', name: 'Suspended fourth', suffix: 'sus4', intervals: [0, 5, 7], intervalNames: ['1', '4', '5'], essentialIntervals: [0, 5, 7] },
  '6': { type: '6', name: 'Major sixth', suffix: '6', intervals: [0, 4, 7, 9], intervalNames: ['1', '3', '5', '6'], essentialIntervals: [0, 4, 9] },
  m6: { type: 'm6', name: 'Minor sixth', suffix: 'm6', intervals: [0, 3, 7, 9], intervalNames: ['1', 'b3', '5', '6'], essentialIntervals: [0, 3, 9] },
  '7': { type: '7', name: 'Dominant seventh', suffix: '7', intervals: [0, 4, 7, 10], intervalNames: ['1', '3', '5', 'b7'], essentialIntervals: [0, 4, 10] },
  maj7: { type: 'maj7', name: 'Major seventh', suffix: 'maj7', intervals: [0, 4, 7, 11], intervalNames: ['1', '3', '5', '7'], essentialIntervals: [0, 4, 11] },
  m7: { type: 'm7', name: 'Minor seventh', suffix: 'm7', intervals: [0, 3, 7, 10], intervalNames: ['1', 'b3', '5', 'b7'], essentialIntervals: [0, 3, 10] },
  m7b5: { type: 'm7b5', name: 'Minor seventh flat five', suffix: 'm7b5', intervals: [0, 3, 6, 10], intervalNames: ['1', 'b3', 'b5', 'b7'], essentialIntervals: [0, 3, 6, 10] },
  dim7: { type: 'dim7', name: 'Diminished seventh', suffix: 'dim7', intervals: [0, 3, 6, 9], intervalNames: ['1', 'b3', 'b5', 'bb7'], essentialIntervals: [0, 3, 6, 9] },
  mMaj7: { type: 'mMaj7', name: 'Minor major seventh', suffix: 'mMaj7', intervals: [0, 3, 7, 11], intervalNames: ['1', 'b3', '5', '7'], essentialIntervals: [0, 3, 11] },
  add9: { type: 'add9', name: 'Added ninth', suffix: 'add9', intervals: [0, 2, 4, 7], intervalNames: ['1', '9', '3', '5'], essentialIntervals: [0, 2, 4] },
  madd9: { type: 'madd9', name: 'Minor added ninth', suffix: 'madd9', intervals: [0, 2, 3, 7], intervalNames: ['1', '9', 'b3', '5'], essentialIntervals: [0, 2, 3] },
  '9': { type: '9', name: 'Dominant ninth', suffix: '9', intervals: [0, 2, 4, 7, 10], intervalNames: ['1', '9', '3', '5', 'b7'], essentialIntervals: [0, 2, 4, 10] },
  maj9: { type: 'maj9', name: 'Major ninth', suffix: 'maj9', intervals: [0, 2, 4, 7, 11], intervalNames: ['1', '9', '3', '5', '7'], essentialIntervals: [0, 2, 4, 11] },
  m9: { type: 'm9', name: 'Minor ninth', suffix: 'm9', intervals: [0, 2, 3, 7, 10], intervalNames: ['1', '9', 'b3', '5', 'b7'], essentialIntervals: [0, 2, 3, 10] },
  '11': { type: '11', name: 'Dominant eleventh', suffix: '11', intervals: [0, 2, 4, 5, 7, 10], intervalNames: ['1', '9', '3', '11', '5', 'b7'], essentialIntervals: [0, 4, 5, 10] },
  maj11: { type: 'maj11', name: 'Major eleventh', suffix: 'maj11', intervals: [0, 2, 4, 5, 7, 11], intervalNames: ['1', '9', '3', '11', '5', '7'], essentialIntervals: [0, 4, 5, 11] },
  m11: { type: 'm11', name: 'Minor eleventh', suffix: 'm11', intervals: [0, 2, 3, 5, 7, 10], intervalNames: ['1', '9', 'b3', '11', '5', 'b7'], essentialIntervals: [0, 3, 5, 10] },
  '13': { type: '13', name: 'Dominant thirteenth', suffix: '13', intervals: [0, 2, 4, 5, 7, 9, 10], intervalNames: ['1', '9', '3', '11', '5', '13', 'b7'], essentialIntervals: [0, 4, 9, 10] },
  maj13: { type: 'maj13', name: 'Major thirteenth', suffix: 'maj13', intervals: [0, 2, 4, 7, 9, 11], intervalNames: ['1', '9', '3', '5', '13', '7'], essentialIntervals: [0, 4, 9, 11] },
  m13: { type: 'm13', name: 'Minor thirteenth', suffix: 'm13', intervals: [0, 2, 3, 5, 7, 9, 10], intervalNames: ['1', '9', 'b3', '11', '5', '13', 'b7'], essentialIntervals: [0, 3, 9, 10] }
};

export const CHORD_TYPES = Object.keys(CHORD_FORMULAS) as ChordType[];

const STANDARD_GUITAR_HIGH_TO_LOW = ['E', 'B', 'G', 'D', 'A', 'E'];

const KNOWN_OPEN_SHAPES: Partial<Record<ChordType, Record<string, Array<number | null>>>> = {
  major: {
    C: [0, 1, 0, 2, 3, null],
    G: [3, 0, 0, 0, 2, 3],
    D: [2, 3, 2, 0, null, null],
    E: [0, 0, 1, 2, 2, 0],
    A: [0, 2, 2, 2, 0, null]
  },
  minor: {
    A: [0, 1, 2, 2, 0, null],
    E: [0, 0, 0, 2, 2, 0],
    D: [1, 3, 2, 0, null, null]
  },
  '7': {
    A: [0, 2, 0, 2, 0, null],
    E: [0, 0, 1, 0, 2, 0],
    D: [2, 1, 2, 0, null, null],
    G: [1, 0, 0, 0, 2, 3],
    C: [0, 1, 3, 2, 3, null]
  },
  m7: {
    A: [0, 1, 0, 2, 0, null],
    E: [0, 0, 0, 0, 2, 0],
    D: [1, 1, 2, 0, null, null]
  },
  maj7: {
    A: [0, 2, 1, 2, 0, null],
    E: [0, 0, 1, 1, 2, 0],
    D: [2, 2, 2, 0, null, null],
    C: [0, 0, 0, 2, 3, null]
  }
};

type MovableShapeName = 'E' | 'A' | 'C' | 'G' | 'D';

const MOVABLE_SHAPES_BY_CHORD_TYPE: Partial<Record<ChordType, MovableShapeName[]>> = {
  major: ['E', 'A', 'C', 'G', 'D'],
  minor: ['E', 'A', 'D'],
  '7': ['E', 'A', 'D'],
  m7: ['E', 'A', 'D'],
  maj7: ['E', 'A', 'D']
};

const normalizeNotes = (notes: string[]) => {
  const unique = new Set<string>();
  notes.forEach(note => {
    const normalized = normalizeNote(note);
    if (CHROMATIC_SCALE.includes(normalized)) unique.add(normalized);
  });
  return Array.from(unique);
};

const noteForInterval = (root: string, interval: number) => {
  const rootIndex = CHROMATIC_SCALE.indexOf(normalizeNote(root));
  return CHROMATIC_SCALE[(rootIndex + interval + 12) % 12];
};

const intervalForNote = (root: string, note: string) => {
  const rootIndex = CHROMATIC_SCALE.indexOf(normalizeNote(root));
  const noteIndex = CHROMATIC_SCALE.indexOf(normalizeNote(note));
  return (noteIndex - rootIndex + 12) % 12;
};

const intervalName = (formula: ChordFormula, interval: number) => {
  const index = formula.intervals.indexOf(interval);
  if (index >= 0) return formula.intervalNames[index];
  const fallback = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', '#5', '6', 'b7', '7'];
  return fallback[interval] || String(interval);
};

const formatChordName = (root: string, formula: ChordFormula, bass?: string) => {
  const base = `${root}${formula.suffix}`;
  return bass && bass !== root ? `${base}/${bass}` : base;
};

const getInversionName = (root: string, bass?: string) => {
  if (!bass || bass === root) return 'root';
  const interval = intervalForNote(root, bass);
  if (interval === 3 || interval === 4) return 'first';
  if (interval === 6 || interval === 7 || interval === 8) return 'second';
  if (interval === 9 || interval === 10 || interval === 11) return 'third';
  return 'slash';
};

const uniqueIntervals = (root: string, notes: string[]) => {
  return Array.from(new Set(notes.map(note => intervalForNote(root, note)))).sort((a, b) => a - b);
};

const isStandardGuitarTuning = (tuning: string[]) => (
  tuning.length === STANDARD_GUITAR_HIGH_TO_LOW.length &&
  tuning.every((note, index) => normalizeNote(note) === STANDARD_GUITAR_HIGH_TO_LOW[index])
);

const isKnownOpenChordShape = (
  root: string,
  chordType: ChordType,
  tuning: string[],
  positions: ChordVoicingNote[],
  mutedStrings: number[]
) => {
  if (!isStandardGuitarTuning(tuning)) return false;

  const shape = KNOWN_OPEN_SHAPES[chordType]?.[root];
  if (!shape) return false;

  const byString = new Map(positions.map(position => [position.string, position.fret]));
  const muted = new Set(mutedStrings);

  return shape.every((fret, stringIndex) => {
    if (fret === null) return muted.has(stringIndex) && !byString.has(stringIndex);
    return byString.get(stringIndex) === fret;
  });
};

const getLargeJumpPenalty = (positions: ChordVoicingNote[]) => {
  const frettedPositions = [...positions]
    .filter(position => position.fret > 0)
    .sort((a, b) => b.string - a.string);

  return frettedPositions.reduce((penalty, position, index) => {
    const next = frettedPositions[index + 1];
    if (!next) return penalty;
    return penalty + (Math.abs(position.fret - next.fret) > 3 ? 20 : 0);
  }, 0);
};

const getShapeFrets = (
  shape: MovableShapeName,
  chordType: ChordType,
  rootFret: number
): Array<number | null> => {
  const shapes: Partial<Record<ChordType, Partial<Record<MovableShapeName, Array<number | null>>>>> = {
    major: {
      E: [rootFret, rootFret, rootFret + 1, rootFret + 2, rootFret + 2, rootFret],
      A: [rootFret, rootFret + 2, rootFret + 2, rootFret + 2, rootFret, null],
      C: [rootFret - 3, rootFret - 2, rootFret - 3, rootFret - 1, rootFret, null],
      G: [rootFret, rootFret - 3, rootFret - 3, rootFret - 3, rootFret - 1, rootFret],
      D: [rootFret + 2, rootFret + 3, rootFret + 2, rootFret, null, null]
    },
    minor: {
      E: [rootFret, rootFret, rootFret, rootFret + 2, rootFret + 2, rootFret],
      A: [rootFret, rootFret + 1, rootFret + 2, rootFret + 2, rootFret, null],
      D: [rootFret + 1, rootFret + 3, rootFret + 2, rootFret, null, null]
    },
    '7': {
      E: [rootFret, rootFret, rootFret + 1, rootFret, rootFret + 2, rootFret],
      A: [rootFret, rootFret + 2, rootFret, rootFret + 2, rootFret, null],
      D: [rootFret + 2, rootFret + 1, rootFret + 2, rootFret, null, null]
    },
    m7: {
      E: [rootFret, rootFret, rootFret, rootFret, rootFret + 2, rootFret],
      A: [rootFret, rootFret + 1, rootFret, rootFret + 2, rootFret, null],
      D: [rootFret + 1, rootFret + 1, rootFret + 2, rootFret, null, null]
    },
    maj7: {
      E: [rootFret, rootFret, rootFret + 1, rootFret + 1, rootFret + 2, rootFret],
      A: [rootFret, rootFret + 2, rootFret + 1, rootFret + 2, rootFret, null],
      D: [rootFret + 2, rootFret + 2, rootFret + 2, rootFret, null, null]
    }
  };

  return shapes[chordType]?.[shape] || [];
};

const getRootStringForShape = (shape: MovableShapeName) => {
  if (shape === 'E' || shape === 'G') return 5;
  if (shape === 'A' || shape === 'C') return 4;
  return 3;
};

export const getChordFormula = (chordType: ChordType) => CHORD_FORMULAS[chordType];

export const normalizeVoicing = (voicing: ChordVoicingCandidate) => ({
  ...voicing,
  positions: [...voicing.positions].sort((a, b) => b.string - a.string)
});

export const scoreChordMatch = (candidate: ChordMatchCandidate) => candidate.score;

export const identifyChordFromNotes = (notes: string[], bassNote?: string): ChordIdentificationResult => {
  const selectedNotes = normalizeNotes(notes);
  const bass = bassNote ? normalizeNote(bassNote) : undefined;
  if (selectedNotes.length < 2) return { selectedNotes, bass, alternatives: [] };

  const candidates = selectedNotes.flatMap(root => {
    const selectedIntervals = uniqueIntervals(root, selectedNotes);
    return CHORD_TYPES.map(type => {
      const formula = getChordFormula(type);
      const missing = formula.essentialIntervals.filter(interval => !selectedIntervals.includes(interval));
      const extra = selectedIntervals.filter(interval => !formula.intervals.includes(interval));
      const found = formula.intervals.filter(interval => selectedIntervals.includes(interval));
      const hasRoot = selectedIntervals.includes(0);
      const hasFifthTypeInterval = formula.intervals.some(interval => [6, 7, 8].includes(interval));
      const hasSelectedFifthTypeInterval = selectedIntervals.some(interval => [6, 7, 8].includes(interval));
      const fifthMissingPenalty = hasFifthTypeInterval && !hasSelectedFifthTypeInterval ? 8 : 0;
      const partialRootPenalty = selectedNotes.length < 3 && root !== selectedNotes[0] ? 16 : 0;
      const partialExtensionPenalty = selectedNotes.length < formula.intervals.length
        ? (formula.intervals.length - selectedNotes.length) * 6
        : 0;
      const score =
        found.length * 18 +
        (hasRoot ? 18 : 0) -
        missing.length * 22 -
        extra.length * 14 -
        fifthMissingPenalty -
        partialRootPenalty -
        partialExtensionPenalty -
        (bass && bass !== root ? 4 : 0);
      const confidence = Math.max(0, Math.min(100, Math.round(score)));

      return {
        name: formatChordName(root, formula, bass),
        root,
        type,
        quality: formula.name,
        notes: selectedNotes,
        intervalsFound: selectedIntervals.map(interval => intervalName(formula, interval)),
        missingIntervals: missing.map(interval => intervalName(formula, interval)),
        extraIntervals: extra.map(interval => intervalName(formula, interval)),
        bass,
        inversion: getInversionName(root, bass),
        score,
        confidence
      };
    });
  })
    .filter(candidate => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    bestMatch: candidates[0],
    alternatives: candidates.slice(1, 8),
    selectedNotes,
    bass
  };
};

export const generateChordVoicings = (
  root: string,
  chordType: ChordType,
  tuning: string[],
  options: GenerateChordVoicingsOptions
): ChordVoicingCandidate[] => {
  const formula = getChordFormula(chordType);
  const normalizedRoot = normalizeNote(root);
  const targetNotes = formula.intervals.map(interval => noteForInterval(normalizedRoot, interval));
  const targetSet = new Set(targetNotes);
  const maxFret = options.maxFret ?? 24;
  const maxResults = options.maxResults ?? 30;
  const preferOpenChords = options.preferOpenChords ?? true;
  const preferRootInBass = options.preferRootInBass ?? true;
  const candidates: ChordVoicingCandidate[] = [];
  const seen = new Set<string>();

  const addCandidate = (
    current: ChordVoicingNote[],
    mutedStrings: number[],
    bonus = 0,
    forceKnownShape = false,
    barre?: ChordVoicingCandidate['barre']
  ) => {
    if (current.length < Math.min(3, formula.intervals.length)) return false;

    const intervals = uniqueIntervals(normalizedRoot, current.map(position => position.note));
    if (!formula.essentialIntervals.every(interval => intervals.includes(interval))) return false;

    const fretted = current.filter(position => position.fret > 0).map(position => position.fret);
    const minFret = fretted.length ? Math.min(...fretted) : 0;
    const maxUsedFret = fretted.length ? Math.max(...fretted) : 0;
    const fretSpan = fretted.length ? maxUsedFret - minFret : 0;
    if (fretSpan > options.maxFretSpan) return false;
    if (new Set(fretted).size > 4) return false;

    const key = current.map(position => `${position.string}:${position.fret}`).join('|');
    if (seen.has(key)) {
      if (forceKnownShape) {
        const existing = candidates.find(candidate => candidate.id === key);
        if (existing) {
          existing.isKnownShape = true;
          existing.score += bonus + 70;
          if (barre) existing.barre = barre;
        }
      }
      return false;
    }
    seen.add(key);

    const notes = normalizeNotes(current.map(position => position.note));
    const bass = [...current].sort((a, b) => b.string - a.string || a.fret - b.fret)[0]?.note;
    const hasRoot = intervals.includes(0);
    const isRootInBass = bass === normalizedRoot;
    const mutedCount = mutedStrings.length;
    const openCount = current.filter(position => position.fret === 0).length;
    const hasOpenStrings = openCount > 0;
    const includesAllChordTones = formula.intervals.every(interval => intervals.includes(interval));
    const isKnownShape = forceKnownShape || isKnownOpenChordShape(normalizedRoot, chordType, tuning, current, mutedStrings);
    const voicingStyle = barre ? 'barre' : hasOpenStrings ? 'open' : isKnownShape ? 'movable' : 'generated';
    const difficulty = voicingStyle === 'open' && current.length <= 4 && fretSpan <= 3
      ? 'easy'
      : voicingStyle === 'barre' || current.length >= 5 || formula.intervals.length >= 6
        ? 'advanced'
        : 'intermediate';
    const largeJumpPenalty = getLargeJumpPenalty(current);
    const score =
      bonus +
      (isRootInBass && preferRootInBass ? 100 : 0) +
      (hasOpenStrings && preferOpenChords ? 80 : 0) +
      (isKnownShape ? 70 : 0) +
      (fretSpan <= 4 ? 60 : 0) +
      (includesAllChordTones ? 50 : 0) +
      Math.max(0, 30 - mutedCount * 6) -
      (hasRoot ? 0 : 40) -
      (!isRootInBass && preferRootInBass ? 50 : 0) -
      (fretSpan > 5 ? 30 : 0) -
      largeJumpPenalty -
      minFret;
    const withFingers = current.map(position => ({
      ...position,
      finger: position.fret === 0 ? '0' : String(Math.min(4, Math.max(1, position.fret - minFret + 1)))
    }));

    candidates.push(normalizeVoicing({
      id: key,
      name: formatChordName(normalizedRoot, formula, bass),
      root: normalizedRoot,
      type: chordType,
      notes,
      intervals: intervals.map(interval => intervalName(formula, interval)),
      positions: withFingers,
      mutedStrings,
      fretSpan,
      minFret,
      maxFret: maxUsedFret,
      score,
      inversion: getInversionName(normalizedRoot, bass),
      isKnownShape,
      voicingStyle,
      difficulty,
      barre
    }));

    return true;
  };

  for (let windowStart = 0; windowStart <= maxFret; windowStart++) {
    const windowEnd = Math.min(maxFret, windowStart + options.maxFretSpan);
    let windowCandidateCount = 0;
    const stringOptions = tuning.map((_, stringIndex) => {
      const positions: Array<ChordVoicingNote | null> = [null];
      const openNote = getNoteAt(stringIndex, 0, tuning);
      if (targetSet.has(openNote)) {
        const interval = intervalForNote(normalizedRoot, openNote);
        positions.push({ string: stringIndex, fret: 0, note: openNote, interval: intervalName(formula, interval), finger: '0' });
      }
      for (let fret = Math.max(1, windowStart); fret <= windowEnd; fret++) {
        const note = getNoteAt(stringIndex, fret, tuning);
        if (targetSet.has(note)) {
          const interval = intervalForNote(normalizedRoot, note);
          positions.push({ string: stringIndex, fret, note, interval: intervalName(formula, interval) });
        }
      }
      return positions;
    });

    const walk = (stringIndex: number, current: ChordVoicingNote[], mutedStrings: number[]) => {
      if (windowCandidateCount >= maxResults * 2) return;
      if (stringIndex === stringOptions.length) {
        if (addCandidate(current, mutedStrings)) windowCandidateCount += 1;
        return;
      }

      stringOptions[stringIndex].forEach(option => {
        if (option === null) {
          walk(stringIndex + 1, current, [...mutedStrings, stringIndex]);
          return;
        }
        walk(stringIndex + 1, [...current, option], mutedStrings);
      });
    };

    walk(0, [], []);
  }

  if (isStandardGuitarTuning(tuning)) {
    const openShape = KNOWN_OPEN_SHAPES[chordType]?.[normalizedRoot];
    if (openShape) {
      const positions = openShape
        .map((shapeFret, stringIndex) => {
          if (shapeFret === null) return null;
          const note = getNoteAt(stringIndex, shapeFret, tuning);
          if (!targetSet.has(note)) return null;
          const interval = intervalForNote(normalizedRoot, note);
          return { string: stringIndex, fret: shapeFret, note, interval: intervalName(formula, interval) };
        })
        .filter((position): position is ChordVoicingNote => Boolean(position));
      const mutedStrings = openShape
        .map((shapeFret, stringIndex) => shapeFret === null ? stringIndex : null)
        .filter((stringIndex): stringIndex is number => stringIndex !== null);

      addCandidate(positions, mutedStrings, 80, true);
    }

    const movableShapes = MOVABLE_SHAPES_BY_CHORD_TYPE[chordType] || [];
    movableShapes.forEach(shapeName => {
      const rootString = getRootStringForShape(shapeName);
      for (let fret = 0; fret <= maxFret; fret++) {
        if (getNoteAt(rootString, fret, tuning) !== normalizedRoot) continue;

        const shapeFrets = getShapeFrets(shapeName, chordType, fret);
        if (shapeFrets.length === 0) continue;
        if (shapeFrets.some(shapeFret => shapeFret !== null && (shapeFret < 0 || shapeFret > maxFret))) continue;

        const positions = shapeFrets
          .map((shapeFret, stringIndex) => {
            if (shapeFret === null) return null;
            const note = getNoteAt(stringIndex, shapeFret, tuning);
            if (!targetSet.has(note)) return null;
            const interval = intervalForNote(normalizedRoot, note);
            return { string: stringIndex, fret: shapeFret, note, interval: intervalName(formula, interval) };
          })
          .filter((position): position is ChordVoicingNote => Boolean(position));
        const mutedStrings = shapeFrets
          .map((shapeFret, stringIndex) => shapeFret === null ? stringIndex : null)
          .filter((stringIndex): stringIndex is number => stringIndex !== null);

        const frettedShape = shapeFrets.filter((shapeFret): shapeFret is number => shapeFret !== null);
        const barreFret = Math.min(...frettedShape);
        const barreStrings = shapeFrets
          .map((shapeFret, stringIndex) => shapeFret !== null && shapeFret === barreFret ? stringIndex : null)
          .filter((stringIndex): stringIndex is number => stringIndex !== null);
        const barre = barreStrings.length >= 2
          ? {
              fret: barreFret,
              fromString: Math.max(...positions.map(position => position.string)),
              toString: Math.min(...positions.map(position => position.string))
            }
          : undefined;

        addCandidate(positions, mutedStrings, 40, true, barre);
      }
    });
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
};

export const getFretboardChordNotes = (state: FretboardState, tuning: string[]) => {
  const markerNotes = state.markers.map(marker => getNoteAt(marker.string, marker.fret, tuning));
  const openNotes = (state.stringStatuses || [])
    .map((status, stringIndex) => status === 'open' ? getNoteAt(stringIndex, 0, tuning) : null)
    .filter((note): note is string => Boolean(note));

  return [...markerNotes, ...openNotes];
};

export const getFretboardBassNote = (state: FretboardState, tuning: string[]) => {
  const markerPositions = state.markers.map(marker => ({
    string: marker.string,
    fret: marker.fret,
    note: getNoteAt(marker.string, marker.fret, tuning)
  }));

  const openPositions = (state.stringStatuses || [])
    .map((status, stringIndex) => status === 'open'
      ? { string: stringIndex, fret: 0, note: getNoteAt(stringIndex, 0, tuning) }
      : null)
    .filter((position): position is { string: number; fret: number; note: string } => Boolean(position));

  const positions = [...markerPositions, ...openPositions];
  if (positions.length === 0) return undefined;

  const lowest = positions.sort((a, b) => {
    if (a.string !== b.string) return b.string - a.string;
    return a.fret - b.fret;
  })[0];

  return lowest.note;
};
