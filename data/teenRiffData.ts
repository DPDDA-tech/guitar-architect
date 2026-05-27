export type TeenRiffDifficulty = 'easy' | 'medium' | 'hard';
export type TeenRiffNote = 'DO' | 'RE' | 'MI' | 'FA' | 'SOL' | 'LA' | 'SI';

export type TeenRiffChallenge = {
  id: string;
  title: string;
  difficulty: TeenRiffDifficulty;
  bpm: number;
  notes: TeenRiffNote[];
};

export const teenRiffChallenges: TeenRiffChallenge[] = [
  {
    id: 'riff-01',
    title: 'Riff Inicial',
    difficulty: 'easy',
    bpm: 70,
    notes: ['MI', 'SOL', 'LA', 'SOL'],
  },
  {
    id: 'riff-02',
    title: 'Pulso Azul',
    difficulty: 'easy',
    bpm: 78,
    notes: ['SOL', 'LA', 'SOL', 'MI'],
  },
  {
    id: 'riff-03',
    title: 'Salto Neon',
    difficulty: 'medium',
    bpm: 86,
    notes: ['RE', 'MI', 'SOL', 'LA', 'SOL', 'FA'],
  },
  {
    id: 'riff-04',
    title: 'Drive Urbano',
    difficulty: 'medium',
    bpm: 92,
    notes: ['MI', 'FA', 'SOL', 'LA', 'SI', 'LA'],
  },
  {
    id: 'riff-05',
    title: 'Noite Elétrica',
    difficulty: 'hard',
    bpm: 105,
    notes: ['DO', 'RE', 'MI', 'SOL', 'LA', 'SOL', 'FA', 'MI'],
  },
  {
    id: 'riff-06',
    title: 'Sprint Roxo',
    difficulty: 'hard',
    bpm: 112,
    notes: ['LA', 'SOL', 'MI', 'FA', 'SOL', 'LA', 'SI', 'LA'],
  },
];
