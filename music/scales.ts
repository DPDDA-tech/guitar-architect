
import { CHROMATIC_SCALE } from './musicTheory';

export interface ScaleDef {
  name: string;
  intervals: number[];
  formula: string;
}

export const SCALES: ScaleDef[] = [
  { name: 'Major (Ionian)', intervals: [0, 2, 4, 5, 7, 9, 11], formula: "1 2 3 4 5 6 7" },
  { name: 'Natural Minor (Aeolian)', intervals: [0, 2, 3, 5, 7, 8, 10], formula: "1 2 b3 4 5 b6 b7" },
  { name: 'Pentatonic Major', intervals: [0, 2, 4, 7, 9], formula: "1 2 3 5 6" },
  { name: 'Pentatonic Minor', intervals: [0, 3, 5, 7, 10], formula: "1 b3 4 5 b7" },
  { name: 'Blues', intervals: [0, 3, 5, 6, 7, 10], formula: "1 b3 4 b5 5 b7" },
  { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10], formula: "1 2 b3 4 5 6 b7" },
  { name: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10], formula: "1 b2 b3 4 5 b6 b7" },
  { name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11], formula: "1 2 3 #4 5 6 7" },
  { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10], formula: "1 2 3 4 5 6 b7" },
  { name: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10], formula: "1 b2 b3 4 b5 b6 b7" },
  { name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11], formula: "1 2 b3 4 5 b6 7" },
  { name: 'Melodic Minor', intervals: [0, 2, 3, 5, 7, 9, 11], formula: "1 2 b3 4 5 6 7" },
];

export const getScaleNotes = (root: string, scaleName: string): string[] => {
  const scale = SCALES.find(s => s.name === scaleName);
  if (!scale) return [];
  const rootIdx = CHROMATIC_SCALE.indexOf(root);
  return scale.intervals.map(interval => CHROMATIC_SCALE[(rootIdx + interval) % 12]);
};
