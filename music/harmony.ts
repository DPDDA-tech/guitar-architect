
import { CHROMATIC_SCALE } from './musicTheory';
import { SCALES, getScaleNotes } from './scales';

export type ChordQuality = 'DIATONIC' | 'MAJOR' | 'MINOR' | 'DIM' | 'AUG';

export const getChordNotes = (
  root: string, 
  scaleName: string, 
  degree: number, 
  isTetrad: boolean, 
  inversion: number,
  quality: ChordQuality = 'DIATONIC'
): string[] => {
  const scaleNotes = getScaleNotes(root, scaleName);
  if (scaleNotes.length === 0) return [];
  
  const rootIdxInScale = degree % scaleNotes.length;
  const chordRootNote = scaleNotes[rootIdxInScale];
  const rootChromaticIdx = CHROMATIC_SCALE.indexOf(chordRootNote);

  let intervals: number[];

  if (quality === 'DIATONIC') {
    // Diatonic logic: pick every other note from the scale
    const chord = [];
    const chordLength = isTetrad ? 4 : 3;
    for (let i = 0; i < chordLength; i++) {
      const noteIdx = (degree + i * 2) % scaleNotes.length;
      chord.push(scaleNotes[noteIdx]);
    }
    // Apply inversion
    for (let i = 0; i < (inversion % chord.length); i++) {
      const first = chord.shift();
      if (first) chord.push(first);
    }
    return chord;
  }

  // Fixed quality logic
  switch (quality) {
    case 'MAJOR':
      intervals = isTetrad ? [0, 4, 7, 11] : [0, 4, 7]; // Maj7 or Major
      break;
    case 'MINOR':
      intervals = isTetrad ? [0, 3, 7, 10] : [0, 3, 7]; // m7 or Minor
      break;
    case 'DIM':
      intervals = isTetrad ? [0, 3, 6, 9] : [0, 3, 6]; // dim7 or Dim
      break;
    case 'AUG':
      intervals = isTetrad ? [0, 4, 8, 10] : [0, 4, 8]; // Aug7 or Aug
      break;
    default:
      intervals = [0, 4, 7];
  }

  const chord = intervals.map(interval => CHROMATIC_SCALE[(rootChromaticIdx + interval) % 12]);
  
  // Apply inversion
  for (let i = 0; i < (inversion % chord.length); i++) {
    const first = chord.shift();
    if (first) chord.push(first);
  }

  return chord;
};

export const DEGREE_NAMES = ["I", "II", "III", "IV", "V", "VI", "VII"];
export const CHORD_QUALITIES: ChordQuality[] = ['DIATONIC', 'MAJOR', 'MINOR', 'DIM', 'AUG'];
