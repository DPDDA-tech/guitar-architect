import { CHROMATIC_SCALE, getNoteAt } from '../music/musicTheory';
import type { Note } from '../types';

export type TeenTetradInstrument = 'guitar' | 'bass';
export type TeenTetradQuality = 'maj7' | 'm7' | '7' | 'm7b5' | 'dim7';
export type TeenTetradInversion = 'root' | 'first' | 'second' | 'third';
export type TeenTetradRole = 'T' | '3' | '5' | '7';

export type TeenTetradGroup = {
  id: string;
  label: string;
  strings: number[];
};

export type TeenTetradMapShape = {
  id: string;
  key: string;
  root: string;
  quality: TeenTetradQuality;
  inversion: TeenTetradInversion;
  groupId: string;
  stringSet: number[];
  notes: string[];
  positions: Array<{
    string: number;
    fret: number;
    note: string;
    interval: string;
    role: TeenTetradRole;
  }>;
  minFret: number;
  maxFret: number;
};

export type TeenTetradGroupMap = {
  group: TeenTetradGroup;
  shapes: TeenTetradMapShape[];
};

const TETRAD_INTERVALS: Record<TeenTetradQuality, number[]> = {
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  '7': [0, 4, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
};

const TETRAD_INTERVAL_LABELS: Record<TeenTetradQuality, string[]> = {
  maj7: ['T', '3', '5', '7M'],
  m7: ['T', 'b3', '5', 'b7'],
  '7': ['T', '3', '5', 'b7'],
  m7b5: ['T', 'b3', 'b5', 'b7'],
  dim7: ['T', 'b3', 'b5', 'bb7'],
};

const INVERSION_NOTE_ORDERS: Record<TeenTetradInversion, number[]> = {
  root: [0, 1, 2, 3],
  first: [1, 2, 3, 0],
  second: [2, 3, 0, 1],
  third: [3, 0, 1, 2],
};

const ROLES: TeenTetradRole[] = ['T', '3', '5', '7'];
const INVERSIONS: TeenTetradInversion[] = ['root', 'first', 'second', 'third'];
const GUITAR_TUNING = ['E', 'B', 'G', 'D', 'A', 'E'];
const BASS_TUNING = ['G', 'D', 'A', 'E'];
const GUITAR_OPEN_MIDI = [64, 59, 55, 50, 45, 40];
const BASS_OPEN_MIDI = [43, 38, 33, 28];

const GUITAR_GROUPS: TeenTetradGroup[] = [
  { id: 'all', label: 'Todas', strings: [] },
  { id: 'g-6543', label: '6-5-4-3', strings: [5, 4, 3, 2] },
  { id: 'g-5432', label: '5-4-3-2', strings: [4, 3, 2, 1] },
  { id: 'g-4321', label: '4-3-2-1', strings: [3, 2, 1, 0] },
];

const BASS_GROUPS: TeenTetradGroup[] = [
  { id: 'all', label: 'Todas', strings: [] },
  { id: 'b-4321', label: '4-3-2-1', strings: [3, 2, 1, 0] },
];

const buildShapeKey = (positions: Array<{ string: number; fret: number }>) => positions
  .slice()
  .sort((left, right) => left.string - right.string)
  .map((position) => `${position.string}:${position.fret}`)
  .join('|');

const MAX_TEEN_TETRAD_SHAPE_SPAN = 5;

const isPlayableTeenTetradShape = (frets: number[], maxFret: number) =>
  frets.length === 4
  && frets.every((fret) => fret >= 0 && fret <= maxFret)
  && Math.max(...frets) - Math.min(...frets) <= MAX_TEEN_TETRAD_SHAPE_SPAN;

export const getTeenTetradTuning = (instrument: TeenTetradInstrument) =>
  instrument === 'guitar' ? GUITAR_TUNING : BASS_TUNING;

const getTeenTetradOpenMidi = (instrument: TeenTetradInstrument) =>
  instrument === 'guitar' ? GUITAR_OPEN_MIDI : BASS_OPEN_MIDI;

export const getTeenTetradGroups = (instrument: TeenTetradInstrument) =>
  instrument === 'guitar' ? GUITAR_GROUPS : BASS_GROUPS;

export const getTeenTetradNotes = (root: string, quality: TeenTetradQuality) => {
  const rootIndex = CHROMATIC_SCALE.indexOf(root);
  return TETRAD_INTERVALS[quality].map((interval) => CHROMATIC_SCALE[(rootIndex + interval) % 12]);
};

export const getTeenTetradIntervalLabels = (quality: TeenTetradQuality) =>
  TETRAD_INTERVAL_LABELS[quality];

const generateTetradShape = (
  root: string,
  quality: TeenTetradQuality,
  stringSet: number[],
  inversion: TeenTetradInversion,
  tuning: string[],
  openMidi: number[],
  maxFret: number,
  preferredFret?: number
): Pick<TeenTetradMapShape, 'notes' | 'positions'> => {
  const tetradNotes = getTeenTetradNotes(root, quality);
  const intervalLabels = getTeenTetradIntervalLabels(quality);
  const noteOrder = INVERSION_NOTE_ORDERS[inversion];
  const targetNotes = noteOrder.map((index) => tetradNotes[index]);
  const targetIntervalLabels = noteOrder.map((index) => intervalLabels[index]);
  const targetRoles = noteOrder.map((index) => ROLES[index]);

  const orderedStrings = [...stringSet].sort((left, right) => right - left);
  const candidatesByString = orderedStrings.map((stringIndex, index) => {
    const targetNote = targetNotes[index];
    const candidates: Array<{ fret: number; midi: number }> = [];

    for (let fret = 0; fret <= maxFret; fret += 1) {
      if (getNoteAt(stringIndex, fret, tuning as Note[]) !== targetNote) continue;
      candidates.push({ fret, midi: openMidi[stringIndex] + fret });
    }

    return candidates.sort((left, right) => {
      const leftDistance = Math.abs(left.fret - (preferredFret ?? 0));
      const rightDistance = Math.abs(right.fret - (preferredFret ?? 0));
      return leftDistance - rightDistance || left.fret - right.fret;
    });
  });

  let bestShape: TeenTetradMapShape['positions'] | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  const walk = (
    index: number,
    previousMidi: number,
    current: TeenTetradMapShape['positions'],
  ) => {
    if (index === orderedStrings.length) {
      const frets = current.map((position) => position.fret);
      if (!isPlayableTeenTetradShape(frets, maxFret)) return;

      const minFret = Math.min(...frets);
      const maxShapeFret = Math.max(...frets);
      const target = preferredFret ?? minFret;
      const score = Math.abs(minFret - target) + Math.abs(maxShapeFret - target) + (maxShapeFret - minFret) * 2;

      if (score < bestScore) {
        bestScore = score;
        bestShape = current.slice();
      }
      return;
    }

    const stringIndex = orderedStrings[index];
    const targetNote = targetNotes[index];
    const targetInterval = targetIntervalLabels[index];
    const targetRole = targetRoles[index];

    for (const candidate of candidatesByString[index]) {
      if (candidate.midi <= previousMidi) continue;

      const next = [
        ...current,
        {
          string: stringIndex,
          fret: candidate.fret,
          note: targetNote,
          interval: targetInterval,
          role: targetRole,
        },
      ];

      const frets = next.map((position) => position.fret);
      if (Math.max(...frets) - Math.min(...frets) > MAX_TEEN_TETRAD_SHAPE_SPAN) continue;

      walk(index + 1, candidate.midi, next);
    }
  };

  walk(0, Number.NEGATIVE_INFINITY, []);

  return {
    notes: tetradNotes,
    positions: (bestShape ?? ([] as TeenTetradMapShape['positions'])).slice().sort((left, right) => left.string - right.string),
  };
};

export const generateTeenTetradMap = (
  root: string,
  quality: TeenTetradQuality,
  instrument: TeenTetradInstrument,
  maxFret: number,
): TeenTetradGroupMap[] => {
  const tuning = getTeenTetradTuning(instrument);
  const openMidi = getTeenTetradOpenMidi(instrument);

  return getTeenTetradGroups(instrument)
    .filter((group) => group.id !== 'all')
    .map((group) => {
      const uniqueShapes = new Map<string, TeenTetradMapShape>();

      for (let preferredFret = 0; preferredFret <= maxFret; preferredFret += 1) {
        INVERSIONS.forEach((inversion) => {
          const shape = generateTetradShape(root, quality, group.strings, inversion, tuning, openMidi, maxFret, preferredFret);
          const frets = shape.positions.map((position) => position.fret);

          if (!isPlayableTeenTetradShape(frets, maxFret)) return;

          const key = buildShapeKey(shape.positions);
          if (uniqueShapes.has(key)) return;

          uniqueShapes.set(key, {
            id: `${group.id}-${inversion}-${preferredFret}-${key}`,
            key,
            root,
            quality,
            inversion,
            groupId: group.id,
            stringSet: group.strings,
            notes: shape.notes,
            positions: shape.positions,
            minFret: Math.min(...frets),
            maxFret: Math.max(...frets),
          });
        });
      }

      return {
        group,
        shapes: [...uniqueShapes.values()].sort((left, right) => left.minFret - right.minFret),
      };
    });
};
