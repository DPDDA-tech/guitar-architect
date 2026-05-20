import { CHROMATIC_SCALE, getNoteAt, getIntervalName } from '../music/musicTheory';
import type { Note } from '../types';

export type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented';
export type TriadInversion = 'root' | 'first' | 'second';

export interface TriadShape {
  root: string;
  quality: TriadQuality;
  inversion: TriadInversion;
  stringSet: number[];
  notes: string[];
  positions: { string: number; fret: number; interval: string; note: string }[];
}

const TRIAD_INTERVALS: Record<TriadQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
};

export const generateTriadShapes = (
  root: string,
  quality: TriadQuality,
  stringSet: number[],
  inversion: TriadInversion,
  tuning: string[],
  preferredFret?: number
): TriadShape => {
  const rootIdx = CHROMATIC_SCALE.indexOf(root);
  const intervals = TRIAD_INTERVALS[quality];
  const triadNotes = intervals.map(amt => CHROMATIC_SCALE[(rootIdx + amt) % 12]);

  let targetNotes = [...triadNotes];
  if (inversion === 'first') targetNotes = [triadNotes[1], triadNotes[2], triadNotes[0]];
  if (inversion === 'second') targetNotes = [triadNotes[2], triadNotes[0], triadNotes[1]];

  const positions: TriadShape['positions'] = [];
  const baseString = stringSet[stringSet.length - 1];
  const firstNote = targetNotes[0];

  const candidateBaseFrets: number[] = [];
  for (let fret = 0; fret <= 24; fret += 1) {
    if (getNoteAt(baseString, fret, tuning as Note[]) === firstNote) {
      candidateBaseFrets.push(fret);
    }
  }

  let baseFret = candidateBaseFrets[0] ?? -1;
  if (typeof preferredFret === 'number' && candidateBaseFrets.length > 0) {
    baseFret = candidateBaseFrets.reduce((best, fret) => (
      Math.abs(fret - preferredFret) < Math.abs(best - preferredFret) ? fret : best
    ), candidateBaseFrets[0]);
  }

  stringSet.slice().reverse().forEach((strIdx, index) => {
    const targetNote = targetNotes[index];
    let bestFret = -1;
    let minDiff = 99;

    for (let fret = 0; fret <= 24; fret += 1) {
      if (getNoteAt(strIdx, fret, tuning as Note[]) === targetNote) {
        const diff = Math.abs(fret - baseFret);
        if (diff < minDiff) {
          minDiff = diff;
          bestFret = fret;
        }
      }
    }

    positions.push({
      string: strIdx,
      fret: bestFret,
      note: targetNote,
      interval: getIntervalName(root, targetNote),
    });
  });

  return {
    root,
    quality,
    inversion,
    stringSet,
    notes: triadNotes,
    positions: positions.sort((a, b) => a.string - b.string),
  };
};

export const TRIAD_TRAINER_EXERCISES = [
  { id: 'maj-field', title: 'Tríades maiores no campo harmônico' },
  { id: 'min-field', title: 'Tríades menores no campo harmônico' },
  { id: 'i-iv-v', title: 'I-IV-V em tríades' },
  { id: 'all-inv', title: 'Tríades em todas as inversões' },
  { id: 'horiz-up', title: 'Subida horizontal no braço' },
  { id: 'horiz-down', title: 'Descida horizontal no braço' },
];
