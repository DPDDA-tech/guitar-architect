export type LightPattern = {
  id: string;
  level: number;
  sequence: number[];
  message: string;
};

export const lightPatterns: LightPattern[] = [
  { id: 'level-1', level: 1, sequence: [8], message: 'Boa! Você encontrou a luz!' },
  { id: 'level-2', level: 2, sequence: [3, 14], message: 'Muito bem! Agora siga duas luzes.' },
  { id: 'level-3', level: 3, sequence: [6, 7, 8, 9], message: 'Perfeito! Caminho subindo.' },
  { id: 'level-4', level: 4, sequence: [23, 22, 21, 20], message: 'Incrível! Caminho descendo.' },
];

export const LIGHT_GRID = {
  strings: 6,
  frets: 5,
};
