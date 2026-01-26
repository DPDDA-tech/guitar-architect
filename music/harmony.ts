
import { CHROMATIC_SCALE, normalizeNote } from './musicTheory';
import { SCALES, getScaleNotes } from './scales';

export type ChordQuality = 'DIATONIC' | 'MAJOR' | 'MINOR' | 'DIM' | 'AUG' | 'MAJ7' | 'DOM7' | 'MIN7' | 'MIN7B5';

// Definição dos intervalos para cada shape CAGED (Tríades Maiores)
// Formato: [corda (0=mais aguda), intervalo_semitons_da_tonica]
const CAGED_PATTERNS: Record<string, { corda: number, semitons: number }[]> = {
  'C': [
    { corda: 1, semitons: 0 },   // Tônica na B
    { corda: 2, semitons: 7 },   // 5ª na G
    { corda: 3, semitons: 4 },   // 3ª na D
    { corda: 4, semitons: 0 },   // Tônica na A
    { corda: 0, semitons: 4 },   // 3ª na E aguda
  ],
  'A': [
    { corda: 4, semitons: 0 },   // Tônica na A
    { corda: 3, semitons: 7 },   // 5ª na D
    { corda: 2, semitons: 0 },   // Tônica na G
    { corda: 1, semitons: 4 },   // 3ª na B
    { corda: 0, semitons: 7 },   // 5ª na E aguda
  ],
  'G': [
    { corda: 5, semitons: 0 },   // Tônica na E grave
    { corda: 4, semitons: 4 },   // 3ª na A
    { corda: 3, semitons: 7 },   // 5ª na D
    { corda: 2, semitons: 0 },   // Tônica na G
    { corda: 0, semitons: 0 },   // Tônica na E aguda
  ],
  'E': [
    { corda: 5, semitons: 0 },   // Tônica na E grave
    { corda: 4, semitons: 7 },   // 5ª na A
    { corda: 3, semitons: 0 },   // Tônica na D
    { corda: 2, semitons: 4 },   // 3ª na G
    { corda: 1, semitons: 7 },   // 5ª na B
    { corda: 0, semitons: 0 },   // Tônica na E aguda
  ],
  'D': [
    { corda: 3, semitons: 0 },   // Tônica na D
    { corda: 2, semitons: 7 },   // 5ª na G
    { corda: 1, semitons: 0 },   // Tônica na B
    { corda: 0, semitons: 4 },   // 3ª na E aguda
  ]
};

export const getChordNotes = (
  root: string, 
  scaleName: string, 
  degree: number, 
  isTetrad: boolean, 
  inversion: number,
  quality: ChordQuality = 'DIATONIC',
  voicing: 'CLOSE' | 'DROP2' | 'DROP3' = 'CLOSE'
): string[] => {
  const scaleNotes = getScaleNotes(root, scaleName);
  if (scaleNotes.length === 0) return [];
  
  const chordRootNote = scaleNotes[degree % scaleNotes.length];
  const rootChromaticIdx = CHROMATIC_SCALE.indexOf(chordRootNote);

  let chord: string[] = [];

  if (quality === 'DIATONIC') {
    const chordLength = isTetrad ? 4 : 3;
    for (let i = 0; i < chordLength; i++) {
      const noteIdx = (degree + i * 2) % scaleNotes.length;
      chord.push(scaleNotes[noteIdx]);
    }
  } else {
    let intervals: number[];
    switch (quality) {
      case 'MAJOR': intervals = [0, 4, 7]; break;
      case 'MINOR': intervals = [0, 3, 7]; break;
      case 'DIM': intervals = [0, 3, 6]; break;
      case 'AUG': intervals = [0, 4, 8]; break;
      case 'MAJ7': intervals = [0, 4, 7, 11]; break;
      case 'DOM7': intervals = [0, 4, 7, 10]; break;
      case 'MIN7': intervals = [0, 3, 7, 10]; break;
      case 'MIN7B5': intervals = [0, 3, 6, 10]; break;
      default: intervals = [0, 4, 7];
    }
    if (!isTetrad && intervals.length > 3) intervals = intervals.slice(0, 3);
    chord = intervals.map(iv => CHROMATIC_SCALE[(rootChromaticIdx + iv) % 12]);
  }

  const invertedClose = rotateInversion(chord, inversion);

  if (isTetrad && invertedClose.length === 4) {
    const [n1, n2, n3, n4] = invertedClose;
    if (voicing === 'DROP2') return [n3, n1, n2, n4];
    if (voicing === 'DROP3') return [n2, n1, n3, n4];
  }

  return invertedClose;
};

const rotateInversion = (chord: string[], inversion: number) => {
    const result = [...chord];
    const rotations = inversion % result.length;
    for (let i = 0; i < rotations; i++) {
      const first = result.shift();
      if (first) result.push(first);
    }
    return result;
}

export const getCagedPositions = (root: string, shape: string, tuning: string[]) => {
  const pattern = CAGED_PATTERNS[shape];
  if (!pattern) return [];

  const results: { string: number, fret: number }[] = [];
  const rootIdx = CHROMATIC_SCALE.indexOf(root);

  pattern.forEach(p => {
    // Nota alvo para esta corda no shape
    const targetNote = CHROMATIC_SCALE[(rootIdx + p.semitons) % 12];
    
    // Como o CAGED é um sistema de formas fixas, 
    // precisamos encontrar a casa correta baseada na afinação
    const openNote = normalizeNote(tuning[p.corda] || "E");
    const openIdx = CHROMATIC_SCALE.indexOf(openNote);
    
    // Cálculo da casa base (primeira ocorrência)
    let fret = (CHROMATIC_SCALE.indexOf(targetNote) - openIdx + 12) % 12;
    
    // Ajuste de oitava para manter o "shape" coeso no braço
    // (O CAGED geralmente se estende por 4-5 casas)
    // Usamos a tônica na corda de referência do shape para ancorar
    results.push({ string: p.corda, fret });
  });

  return results;
};

export const DEGREE_NAMES = ["I", "II", "III", "IV", "V", "VI", "VII"];
export const CHORD_QUALITIES: ChordQuality[] = ['DIATONIC', 'MAJOR', 'MINOR', 'DIM', 'AUG', 'MAJ7', 'DOM7', 'MIN7', 'MIN7B5'];
