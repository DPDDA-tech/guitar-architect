import { CHROMATIC_SCALE } from '../music/musicTheory';
import { generateTriadShapes, type TriadInversion, type TriadQuality } from '../utils/triadLogic';

export type TeenTriadInstrument = 'guitar' | 'bass';
export type TeenTriadHighlight = TriadInversion;

export type TeenTriadGroup = {
  id: string;
  label: string;
  strings: number[];
};

export type TeenTriadMapShape = {
  id: string;
  key: string;
  root: string;
  quality: TriadQuality;
  inversion: TriadInversion;
  groupId: string;
  stringSet: number[];
  notes: string[];
  positions: Array<{
    string: number;
    fret: number;
    note: string;
    interval: string;
  }>;
  minFret: number;
  maxFret: number;
};

export type TeenTriadLink = {
  id: string;
  groupId: string;
  fromShapeId: string;
  toShapeId: string;
  inversion: TriadInversion | 'mixed';
  segments: Array<{
    string: number;
    fromFret: number;
    toFret: number;
  }>;
};

export type TeenTriadGroupMap = {
  group: TeenTriadGroup;
  shapes: TeenTriadMapShape[];
  links: TeenTriadLink[];
};

const TRIAD_INTERVALS: Record<TriadQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
};

const INVERSIONS: TriadInversion[] = ['root', 'first', 'second'];
const PREFERRED_FRETS = [0, 2, 4, 6, 8, 10, 12, 14];

const GUITAR_TUNING = ['E', 'B', 'G', 'D', 'A', 'E'];
const BASS_TUNING = ['G', 'D', 'A', 'E'];

const GUITAR_GROUPS: TeenTriadGroup[] = [
  { id: 'all', label: 'Todas', strings: [] },
  { id: 'g-654', label: '6-5-4', strings: [5, 4, 3] },
  { id: 'g-543', label: '5-4-3', strings: [4, 3, 2] },
  { id: 'g-432', label: '4-3-2', strings: [3, 2, 1] },
  { id: 'g-321', label: '3-2-1', strings: [2, 1, 0] },
];

const BASS_GROUPS: TeenTriadGroup[] = [
  { id: 'all', label: 'Todas', strings: [] },
  { id: 'b-432', label: '4-3-2', strings: [3, 2, 1] },
  { id: 'b-321', label: '3-2-1', strings: [2, 1, 0] },
];

const inversionOrder: Record<TriadInversion, number> = {
  root: 0,
  first: 1,
  second: 2,
};

export const getTeenTriadTuning = (instrument: TeenTriadInstrument) =>
  instrument === 'guitar' ? GUITAR_TUNING : BASS_TUNING;

export const getTeenTriadGroups = (instrument: TeenTriadInstrument) =>
  instrument === 'guitar' ? GUITAR_GROUPS : BASS_GROUPS;

export const getTeenTriadNotes = (root: string, quality: TriadQuality) => {
  const rootIndex = CHROMATIC_SCALE.indexOf(root);
  return TRIAD_INTERVALS[quality].map((interval) => CHROMATIC_SCALE[(rootIndex + interval) % 12]);
};

const buildShapeKey = (
  positions: Array<{ string: number; fret: number }>
) => positions
  .slice()
  .sort((left, right) => left.string - right.string)
  .map((position) => `${position.string}:${position.fret}`)
  .join('|');

const buildFretSignature = (positions: Array<{ fret: number }>) => positions
  .map((position) => position.fret)
  .slice()
  .sort((left, right) => left - right)
  .join('|');

// Every string in the set takes a turn as the anchor (last element of the
// array passed to generateTriadShapes), with the remaining strings keeping
// their relative order. This surfaces shapes that were unreachable when the
// anchor was always stringSet[stringSet.length - 1].
const buildAnchorOrders = (strings: number[]) => strings.map((_, anchorIndex) => [
  ...strings.slice(0, anchorIndex),
  ...strings.slice(anchorIndex + 1),
  strings[anchorIndex],
]);

// A shape's three notes must also sit within a realistic hand span — without
// this, generateTriadShapes can pick frets that are individually in range but
// many frets apart from each other, producing "shapes" that aren't a single
// playable position and draw long diagonal lines across the neck.
const MAX_TEEN_TRIAD_SHAPE_SPAN = 4;

const isPlayableTeenTriadShape = (frets: number[], maxFret: number) =>
  frets.length === 3
  && frets.every((fret) => fret >= 0 && fret <= maxFret)
  && Math.max(...frets) - Math.min(...frets) <= MAX_TEEN_TRIAD_SHAPE_SPAN;

const buildLinks = (groupId: string, shapes: TeenTriadMapShape[]): TeenTriadLink[] => {
  const links: TeenTriadLink[] = [];

  for (let index = 0; index < shapes.length - 1; index += 1) {
    const current = shapes[index];
    const next = shapes[index + 1];
    const currentByString = new Map(current.positions.map((position) => [position.string, position]));
    const nextByString = new Map(next.positions.map((position) => [position.string, position]));
    const strings = current.positions.map((position) => position.string);
    const allStringsMatch = strings.every((string) => nextByString.has(string));

    if (!allStringsMatch) continue;

    const maxDistance = Math.max(
      ...strings.map((string) => Math.abs(
        currentByString.get(string)!.fret - nextByString.get(string)!.fret
      ))
    );

    if (maxDistance > 3) continue;

    links.push({
      id: `${groupId}-link-${current.id}-${next.id}`,
      groupId,
      fromShapeId: current.id,
      toShapeId: next.id,
      inversion: current.inversion === next.inversion ? current.inversion : 'mixed',
      segments: strings.map((string) => ({
        string,
        fromFret: currentByString.get(string)!.fret,
        toFret: nextByString.get(string)!.fret,
      })),
    });
  }

  return links;
};

export const generateTeenTriadMap = (
  root: string,
  quality: TriadQuality,
  instrument: TeenTriadInstrument,
  maxFret: number,
): TeenTriadGroupMap[] => {
  const tuning = getTeenTriadTuning(instrument);

  const groupMaps = getTeenTriadGroups(instrument)
    .filter((group) => group.id !== 'all')
    .map((group) => {
    const uniqueShapes = new Map<string, TeenTriadMapShape>();
    const anchorOrders = buildAnchorOrders(group.strings);

    for (let preferredFret = 0; preferredFret <= maxFret; preferredFret += 1) {
      INVERSIONS.forEach((inversion) => {
        anchorOrders.forEach((anchorOrder) => {
          const shape = generateTriadShapes(root, quality, anchorOrder, inversion, tuning, preferredFret);
          const frets = shape.positions.map((position) => position.fret);

          if (!isPlayableTeenTriadShape(frets, maxFret)) return;

          const fretSignature = buildFretSignature(shape.positions);
          if (uniqueShapes.has(fretSignature)) return;

          // generateTriadShapes assigns notes relative to the anchor string we
          // pass in, which can differ from the group's actual lowest-pitched
          // (bass) string — so its `inversion` doesn't always match what's
          // really voiced. The true inversion is defined by which triad note
          // ends up in the bass: tonic = root position, third = first
          // inversion, fifth = second inversion.
          const bassPosition = shape.positions.reduce((lowest, position) => (
            position.string > lowest.string ? position : lowest
          ));
          const bassNoteIndex = shape.notes.indexOf(bassPosition.note);
          const actualInversion: TriadInversion =
            bassNoteIndex === 1 ? 'first' : bassNoteIndex === 2 ? 'second' : 'root';

          const key = buildShapeKey(shape.positions);
          uniqueShapes.set(fretSignature, {
            id: `${group.id}-${actualInversion}-${preferredFret}-${key}`,
            key,
            root,
            quality,
            inversion: actualInversion,
            groupId: group.id,
            stringSet: group.strings,
            notes: shape.notes,
            positions: shape.positions,
            minFret: Math.min(...frets),
            maxFret: Math.max(...frets),
          });
        });
      });
    }

    const shapes = [...uniqueShapes.values()]
      .sort((left, right) => left.minFret - right.minFret);

    return {
      group,
      shapes,
      links: [],
    };
  });

  return groupMaps;
};
