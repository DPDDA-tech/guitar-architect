export type RhythmType = 'short' | 'long' | 'fast' | 'silence';

export type RhythmExample = {
  id: RhythmType;
  title: string;
  syllable: string;
  visual: string;
  description: string;
};

export const rhythmExamples: RhythmExample[] = [
  {
    id: 'short',
    title: 'Sons Curtos',
    syllable: 'TA',
    visual: '🔴',
    description: 'Esse som acaba rapidinho!',
  },
  {
    id: 'long',
    title: 'Sons Longos',
    syllable: 'TAAAA',
    visual: '🟢══════',
    description: 'Esse som dura mais tempo!',
  },
  {
    id: 'fast',
    title: 'Sons Rápidos',
    syllable: 'TA-TA',
    visual: '🟡 🟡',
    description: 'Esses sons correm bem rápido!',
  },
  {
    id: 'silence',
    title: 'Silêncio',
    syllable: 'SHHH',
    visual: '🤫',
    description: 'A música também gosta de descansar.',
  },
];

export type RhythmChallenge = {
  id: string;
  prompt: string;
  answer: RhythmType;
};

export const rhythmChallenges: RhythmChallenge[] = [
  { id: 'c1', prompt: 'Encontre o som mais longo.', answer: 'long' },
  { id: 'c2', prompt: 'Clique no som rapidinho.', answer: 'fast' },
  { id: 'c3', prompt: 'Qual é o silêncio?', answer: 'silence' },
  { id: 'c4', prompt: 'Qual som dura mais?', answer: 'long' },
];

export const rhythmSequence: RhythmType[] = ['short', 'long', 'fast'];
