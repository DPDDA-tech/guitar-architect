export type TeenChordNote = 'DO' | 'RE' | 'MI' | 'FA' | 'SOL' | 'LA' | 'SI';

export type TeenChordStack = {
  id: string;
  title: string;
  mood: 'stable' | 'open' | 'tense';
  chordType: 'major' | 'minor' | 'sus4' | 'maj7' | 'dom7';
  blockLabel: string;
  notes: TeenChordNote[];
  color: string;
};

export type TeenChordChallenge = {
  id: string;
  title: string;
  description: string;
  mood: TeenChordStack['mood'];
  focus: 'triad' | 'tetrad';
  hint: string;
  targetStackId: string;
  xp: number;
};

// Base pronta para evoluir depois para triades/tetrades/inversions.
export const teenChordStacks: TeenChordStack[] = [
  { id: 'stack-c-major', title: 'C Maior', mood: 'stable', chordType: 'major', blockLabel: 'Tríade maior', notes: ['DO', 'MI', 'SOL'], color: 'from-emerald-400 to-cyan-400' },
  { id: 'stack-a-minor', title: 'A Menor', mood: 'tense', chordType: 'minor', blockLabel: 'Tríade menor', notes: ['LA', 'DO', 'MI'], color: 'from-violet-500 to-fuchsia-500' },
  { id: 'stack-d-sus4', title: 'D Sus4', mood: 'open', chordType: 'sus4', blockLabel: 'Suspensão', notes: ['RE', 'SOL', 'LA'], color: 'from-blue-400 to-violet-400' },
  { id: 'stack-g7', title: 'G7', mood: 'tense', chordType: 'dom7', blockLabel: 'Tétrade dominante', notes: ['SOL', 'SI', 'RE', 'FA'], color: 'from-rose-500 to-orange-400' },
  { id: 'stack-cmaj7', title: 'Cmaj7', mood: 'open', chordType: 'maj7', blockLabel: 'Tétrade maior', notes: ['DO', 'MI', 'SOL', 'SI'], color: 'from-cyan-400 to-blue-500' },
];

export const teenChordChallenges: TeenChordChallenge[] = [
  {
    id: 'ch-01-major',
    title: 'Construa Maior',
    description: 'Monte um acorde maior com base firme.',
    mood: 'stable',
    focus: 'triad',
    hint: 'Tijolos: tônica + terça maior + quinta justa.',
    targetStackId: 'stack-c-major',
    xp: 14,
  },
  {
    id: 'ch-02-minor',
    title: 'Construa Menor',
    description: 'Monte um acorde menor com som mais tenso.',
    mood: 'tense',
    focus: 'triad',
    hint: 'Troque a terça maior por terça menor.',
    targetStackId: 'stack-a-minor',
    xp: 18,
  },
  {
    id: 'ch-03-sus4',
    title: 'Construa Sus4',
    description: 'Monte um acorde suspenso (sus4).',
    mood: 'open',
    focus: 'triad',
    hint: 'A terça sai e entra a quarta.',
    targetStackId: 'stack-d-sus4',
    xp: 18,
  },
  {
    id: 'ch-04-maj7',
    title: 'Construa Maj7',
    description: 'Monte um acorde maior com sétima maior.',
    mood: 'open',
    focus: 'tetrad',
    hint: 'Estrutura: maior + sétima maior.',
    targetStackId: 'stack-cmaj7',
    xp: 24,
  },
  {
    id: 'ch-05-dom7',
    title: 'Construa 7',
    description: 'Monte um acorde dominante (7).',
    mood: 'tense',
    focus: 'tetrad',
    hint: 'Som blues/rock: maior + sétima menor.',
    targetStackId: 'stack-g7',
    xp: 24,
  },
];

export const teenChordFutureTracks = {
  triads: true,
  tetrads: true,
  inversions: true,
};
