
import { TuningKey } from '../types';

export const CHROMATIC_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const TUNINGS: Record<Exclude<TuningKey, 'Custom'>, string[]> = {
  'Standard': ["E", "B", "G", "D", "A", "E"],
  'Drop D': ["E", "B", "G", "D", "A", "D"],
  'Drop C': ["D", "A", "F", "C", "G", "C"],
  'Open D': ["D", "A", "F#", "D", "A", "D"],
  'Open G': ["D", "B", "G", "D", "G", "D"],
};

export const getNoteAt = (stringIndex: number, fret: number, tuning: string[]): string => {
  const openNote = tuning[stringIndex];
  const openIndex = CHROMATIC_SCALE.indexOf(openNote);
  return CHROMATIC_SCALE[(openIndex + fret) % 12];
};

export const getIntervalName = (root: string, target: string): string => {
  const rootIdx = CHROMATIC_SCALE.indexOf(root);
  const targetIdx = CHROMATIC_SCALE.indexOf(target);
  const diff = (targetIdx - rootIdx + 12) % 12;
  const intervals = ["R", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"];
  return intervals[diff];
};
