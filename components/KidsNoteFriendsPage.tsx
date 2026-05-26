import React, { useMemo, useState } from 'react';
import { getKidsTheme } from '../utils/ecosystemPreferences';

type NoteId = 'DO' | 'RE' | 'MI' | 'FA' | 'SOL' | 'LA' | 'SI';
type RelationshipType = 'happy' | 'strong' | 'octave';
type MusicStepType = 'small' | 'large';

type NoteRelationship = {
  id: string;
  type: RelationshipType;
  notes: [NoteId, NoteId];
  description: string;
};

type FriendChallenge = {
  id: string;
  prompt: string;
  options: NoteId[];
  answer: NoteId;
};

type StepChallenge = {
  id: string;
  prompt: string;
  options: [string, string][];
  answer: [string, string];
};

type MusicStep = {
  type: MusicStepType;
  notes: [NoteId, NoteId];
  description: string;
  futureName: 'Tom' | 'Semitom';
};

const noteColors: Record<NoteId, string> = {
  DO: 'bg-red-500',
  RE: 'bg-orange-500',
  MI: 'bg-yellow-400',
  FA: 'bg-green-500',
  SOL: 'bg-blue-500',
  LA: 'bg-violet-500',
  SI: 'bg-pink-500',
};

const noteRelationships: NoteRelationship[] = [
  { id: 'r1', type: 'happy', notes: ['DO', 'MI'], description: 'Criam sons felizes e suaves.' },
  { id: 'r2', type: 'strong', notes: ['SOL', 'RE'], description: 'Criam sons fortes e poderosos.' },
  { id: 'r3', type: 'octave', notes: ['LA', 'LA'], description: 'Parecem a mesma nota em alturas diferentes.' },
  { id: 'r4', type: 'happy', notes: ['FA', 'LA'], description: 'Soam leves e combinam muito bem.' },
  { id: 'r5', type: 'strong', notes: ['RE', 'LA'], description: 'Trazem energia e firmeza.' },
];

const challenges: FriendChallenge[] = [
  { id: 'c1', prompt: 'Qual nota combina com DO?', options: ['MI', 'SI', 'FA', 'RE'], answer: 'MI' },
  { id: 'c2', prompt: 'Encontre a combinacao forte.', options: ['MI', 'RE', 'SI', 'DO'], answer: 'RE' },
  { id: 'c3', prompt: 'Clique nas notas iguais.', options: ['LA', 'SOL', 'DO', 'RE'], answer: 'LA' },
];

const musicSteps: MusicStep[] = [
  {
    type: 'small',
    notes: ['MI', 'FA'],
    description: 'Essas notas estao bem pertinho.',
    futureName: 'Semitom',
  },
  {
    type: 'small',
    notes: ['SI', 'DO'],
    description: 'Essas notas estao coladinhas uma na outra.',
    futureName: 'Semitom',
  },
  {
    type: 'large',
    notes: ['DO', 'RE'],
    description: 'Essas notas dao um passo maior.',
    futureName: 'Tom',
  },
  {
    type: 'large',
    notes: ['FA', 'SOL'],
    description: 'Essas notas tambem fazem um passo maior.',
    futureName: 'Tom',
  },
];

const stepChallenges: StepChallenge[] = [
  {
    id: 's1',
    prompt: 'Encontre o passo pequeno.',
    options: [['MI', 'FA'], ['DO', 'RE'], ['FA', 'SOL'], ['SOL', 'LA']],
    answer: ['MI', 'FA'],
  },
  {
    id: 's2',
    prompt: 'Qual par esta mais perto?',
    options: [['SI', 'DO'], ['DO', 'RE'], ['RE', 'MI'], ['FA', 'SOL']],
    answer: ['SI', 'DO'],
  },
  {
    id: 's3',
    prompt: 'Qual par da um passo maior?',
    options: [['MI', 'FA'], ['SI', 'DO'], ['DO', 'RE'], ['LA', 'SI']],
    answer: ['DO', 'RE'],
  },
];

const typeTitle: Record<RelationshipType, string> = {
  happy: 'Combinacao suave',
  strong: 'Combinacao forte',
  octave: 'Notas irmas',
};

// Futuro: conectar audio infantil das combinacoes
const playPairSound = (_pair: [NoteId, NoteId]) => {
  return;
};

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const KidsNoteFriendsPage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [selectedRelationshipId, setSelectedRelationshipId] = useState(noteRelationships[0].id);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeFeedback, setChallengeFeedback] = useState('');
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [stepInteracted, setStepInteracted] = useState(false);
  const [stepChallengeIndex, setStepChallengeIndex] = useState(0);
  const [stepChallengeFeedback, setStepChallengeFeedback] = useState('');

  const isLight = theme === 'light';

  const gridStyle = useMemo(() => ({
    backgroundImage: `linear-gradient(${isLight ? '#d1d5db' : '#1f2937'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#d1d5db' : '#1f2937'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  }), [isLight]);

  const selectedRelationship = noteRelationships.find(r => r.id === selectedRelationshipId) ?? noteRelationships[0];
  const currentChallenge = challenges[challengeIndex];
  const selectedStep = musicSteps[selectedStepIndex];
  const currentStepChallenge = stepChallenges[stepChallengeIndex];

  const handlePickRelationship = (relationship: NoteRelationship) => {
    setSelectedRelationshipId(relationship.id);
    playPairSound(relationship.notes);
  };

  const handleChallengeAnswer = (note: NoteId) => {
    if (note === currentChallenge.answer) {
      setChallengeFeedback('Boa! Essa combinacao funciona muito bem.');
      window.setTimeout(() => {
        setChallengeIndex((prev) => (prev + 1) % challenges.length);
        setChallengeFeedback('');
      }, 800);
    } else {
      setChallengeFeedback('Quase! Tente outra opcao.');
    }
  };

  const handlePickStep = (index: number) => {
    setSelectedStepIndex(index);
    setStepInteracted(true);
  };

  const handleStepChallengeAnswer = (option: [string, string]) => {
    const normalized = `${option[0]}-${option[1]}`;
    const expected = `${currentStepChallenge.answer[0]}-${currentStepChallenge.answer[1]}`;
    if (normalized === expected) {
      setStepChallengeFeedback('Boa! Voce percebeu bem essa distancia.');
      window.setTimeout(() => {
        setStepChallengeIndex((prev) => (prev + 1) % stepChallenges.length);
        setStepChallengeFeedback('');
      }, 800);
    } else {
      setStepChallengeFeedback('Quase! Compare qual par esta mais perto.');
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none opacity-45" style={gridStyle} />

      <main className="relative mx-auto max-w-6xl">
        <header className="mb-6 md:mb-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-500">Guitar Architect Kids</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Notas que combinam</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Algumas notas gostam de tocar juntas. Vamos descobrir?
          </p>
        </header>

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {noteRelationships.map((relationship) => {
              const active = relationship.id === selectedRelationshipId;
              return (
                <button
                  key={relationship.id}
                  onClick={() => handlePickRelationship(relationship)}
                  className={`rounded-2xl border p-4 text-left transition-all ${active ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.25)]' : isLight ? 'border-slate-200 bg-white hover:border-cyan-300' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500/60'}`}
                >
                  <div className="flex items-center justify-center gap-2 text-white">
                    <span className={`h-10 w-10 rounded-full ${noteColors[relationship.notes[0]]} flex items-center justify-center text-sm font-black shadow-lg`}>{relationship.notes[0]}</span>
                    <span className="text-cyan-400 text-xl font-black">----</span>
                    <span className={`h-10 w-10 rounded-full ${noteColors[relationship.notes[1]]} flex items-center justify-center text-sm font-black shadow-lg`}>{relationship.notes[1]}</span>
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-cyan-500">{typeTitle[relationship.type]}</p>
                  <p className="mt-1 text-xs font-bold opacity-90">{relationship.description}</p>
                </button>
              );
            })}
          </div>

          <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black animate-in fade-in slide-in-from-top-1 duration-300 ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
            {selectedRelationship.notes[0]} + {selectedRelationship.notes[1]}: {selectedRelationship.description}
          </div>
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">Desafios</p>
          <p className="mt-2 text-sm font-black">{currentChallenge.prompt}</p>

          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {currentChallenge.options.map((option) => (
              <button
                key={option}
                onClick={() => handleChallengeAnswer(option)}
                className={`rounded-xl border px-3 py-3 text-sm font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}
              >
                {option}
              </button>
            ))}
          </div>

          {challengeFeedback && (
            <div className={`mt-3 rounded-xl border px-3 py-2 text-sm font-black ${challengeFeedback.startsWith('Boa') ? (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200') : (isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-500/30 bg-amber-500/10 text-amber-200')}`}>
              {challengeFeedback}
            </div>
          )}
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Passos Musicais</h2>
          <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Algumas notas ficam bem pertinho. Outras dao passos maiores.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {musicSteps.map((step, idx) => {
              const active = idx === selectedStepIndex;
              const connector = step.type === 'small' ? '--' : '------';
              return (
                <button
                  key={`${step.notes[0]}-${step.notes[1]}-${idx}`}
                  onClick={() => handlePickStep(idx)}
                  className={`rounded-2xl border p-4 text-left transition-all ${active ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.25)]' : isLight ? 'border-slate-200 bg-white hover:border-cyan-300' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500/60'}`}
                >
                  <div className="flex items-center justify-center gap-2 text-white">
                    <span className={`h-10 w-10 rounded-full ${noteColors[step.notes[0]]} flex items-center justify-center text-sm font-black shadow-lg`}>{step.notes[0]}</span>
                    <span className="text-cyan-400 text-xl font-black">{connector}</span>
                    <span className={`h-10 w-10 rounded-full ${noteColors[step.notes[1]]} flex items-center justify-center text-sm font-black shadow-lg`}>{step.notes[1]}</span>
                  </div>
                  <p className="mt-2 text-xs font-bold opacity-90">{step.description}</p>
                </button>
              );
            })}
          </div>

          <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
            {selectedStep.notes[0]} + {selectedStep.notes[1]}: {selectedStep.description}
          </div>

          {stepInteracted && (
            <div className={`mt-3 rounded-xl border px-3 py-3 text-sm font-bold animate-in fade-in slide-in-from-top-1 duration-300 ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
              Os musicos chamam isso de: <span className="font-black">{selectedStep.futureName}</span>.
            </div>
          )}

          <div className="mt-5">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">Desafios de Passos</p>
            <p className="mt-2 text-sm font-black">{currentStepChallenge.prompt}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {currentStepChallenge.options.map((pair) => (
                <button
                  key={`${pair[0]}-${pair[1]}`}
                  onClick={() => handleStepChallengeAnswer(pair)}
                  className={`rounded-xl border px-3 py-3 text-sm font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}
                >
                  {pair[0]} + {pair[1]}
                </button>
              ))}
            </div>
            {stepChallengeFeedback && (
              <div className={`mt-3 rounded-xl border px-3 py-2 text-sm font-black ${stepChallengeFeedback.startsWith('Boa') ? (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200') : (isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-500/30 bg-amber-500/10 text-amber-200')}`}>
                {stepChallengeFeedback}
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <button onClick={() => navigateTo('/kids/notes')} className="rounded-xl border border-cyan-500 bg-cyan-600 px-4 py-2 text-xs font-black uppercase text-white hover:bg-cyan-500">
            Voltar para Notas
          </button>
          <button onClick={() => navigateTo('/kids')} className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
            Voltar ao Kids
          </button>
        </div>
      </main>
    </div>
  );
};

export default KidsNoteFriendsPage;

