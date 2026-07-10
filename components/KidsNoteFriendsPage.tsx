import React, { useState } from 'react';
import { getKidsLang, getKidsTheme } from '../utils/ecosystemPreferences';
import AppFooter from './AppFooter';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';

type NoteId = 'DO' | 'RE' | 'MI' | 'FA' | 'SOL' | 'LA' | 'SI';
type RelationshipType = 'happy' | 'strong' | 'octave';
type MusicStepType = 'small' | 'large';

type LocalizedText = { pt: string; en: string };

type NoteRelationship = {
  id: string;
  type: RelationshipType;
  notes: [NoteId, NoteId];
  description: LocalizedText;
};

type FriendChallenge = {
  id: string;
  prompt: LocalizedText;
  options: NoteId[];
  answer: NoteId;
};

type StepChallenge = {
  id: string;
  prompt: LocalizedText;
  options: [string, string][];
  answer: [string, string];
};

type MusicStep = {
  type: MusicStepType;
  notes: [NoteId, NoteId];
  description: LocalizedText;
  futureName: { pt: 'Tom' | 'Semitom'; en: 'Tone' | 'Semitone' };
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
  { id: 'r1', type: 'happy', notes: ['DO', 'MI'], description: { pt: 'Criam sons felizes e suaves.', en: 'Create happy, gentle sounds.' } },
  { id: 'r2', type: 'strong', notes: ['SOL', 'RE'], description: { pt: 'Criam sons fortes e poderosos.', en: 'Create strong, powerful sounds.' } },
  { id: 'r3', type: 'octave', notes: ['LA', 'LA'], description: { pt: 'Parecem a mesma nota em alturas diferentes.', en: 'Sound like the same note at different heights.' } },
  { id: 'r4', type: 'happy', notes: ['FA', 'LA'], description: { pt: 'Soam leves e combinam muito bem.', en: 'Sound light and go really well together.' } },
  { id: 'r5', type: 'strong', notes: ['RE', 'LA'], description: { pt: 'Trazem energia e firmeza.', en: 'Bring energy and firmness.' } },
];

const challenges: FriendChallenge[] = [
  { id: 'c1', prompt: { pt: 'Qual nota combina com DO?', en: 'Which note matches DO?' }, options: ['MI', 'SI', 'FA', 'RE'], answer: 'MI' },
  { id: 'c2', prompt: { pt: 'Encontre a combinacao forte.', en: 'Find the strong combination.' }, options: ['MI', 'RE', 'SI', 'DO'], answer: 'RE' },
  { id: 'c3', prompt: { pt: 'Clique nas notas iguais.', en: 'Click the matching notes.' }, options: ['LA', 'SOL', 'DO', 'RE'], answer: 'LA' },
];

const musicSteps: MusicStep[] = [
  {
    type: 'small',
    notes: ['MI', 'FA'],
    description: { pt: 'Essas notas estao bem pertinho.', en: 'These notes are very close together.' },
    futureName: { pt: 'Semitom', en: 'Semitone' },
  },
  {
    type: 'small',
    notes: ['SI', 'DO'],
    description: { pt: 'Essas notas estao coladinhas uma na outra.', en: 'These notes sit right next to each other.' },
    futureName: { pt: 'Semitom', en: 'Semitone' },
  },
  {
    type: 'large',
    notes: ['DO', 'RE'],
    description: { pt: 'Essas notas dao um passo maior.', en: 'These notes take a bigger step.' },
    futureName: { pt: 'Tom', en: 'Tone' },
  },
  {
    type: 'large',
    notes: ['FA', 'SOL'],
    description: { pt: 'Essas notas tambem fazem um passo maior.', en: 'These notes also take a bigger step.' },
    futureName: { pt: 'Tom', en: 'Tone' },
  },
];

const stepChallenges: StepChallenge[] = [
  {
    id: 's1',
    prompt: { pt: 'Encontre o passo pequeno.', en: 'Find the small step.' },
    options: [['MI', 'FA'], ['DO', 'RE'], ['FA', 'SOL'], ['SOL', 'LA']],
    answer: ['MI', 'FA'],
  },
  {
    id: 's2',
    prompt: { pt: 'Qual par esta mais perto?', en: 'Which pair is closer together?' },
    options: [['SI', 'DO'], ['DO', 'RE'], ['RE', 'MI'], ['FA', 'SOL']],
    answer: ['SI', 'DO'],
  },
  {
    id: 's3',
    prompt: { pt: 'Qual par da um passo maior?', en: 'Which pair takes a bigger step?' },
    options: [['MI', 'FA'], ['SI', 'DO'], ['DO', 'RE'], ['LA', 'SI']],
    answer: ['DO', 'RE'],
  },
];

const typeTitle: Record<RelationshipType, LocalizedText> = {
  happy: { pt: 'Combinacao suave', en: 'Gentle match' },
  strong: { pt: 'Combinacao forte', en: 'Strong match' },
  octave: { pt: 'Notas irmas', en: 'Sibling notes' },
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
  const [lang] = useState(() => getKidsLang());
  const [selectedRelationshipId, setSelectedRelationshipId] = useState(noteRelationships[0].id);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [stepInteracted, setStepInteracted] = useState(false);
  const [stepChallengeIndex, setStepChallengeIndex] = useState(0);
  const [stepChallengeStatus, setStepChallengeStatus] = useState<'correct' | 'incorrect' | null>(null);

  const isLight = theme === 'light';
  const isPt = lang === 'pt';

  const feedbackText: Record<'correct' | 'incorrect', LocalizedText> = {
    correct: { pt: 'Boa! Essa combinacao funciona muito bem.', en: 'Nice! This combination works really well.' },
    incorrect: { pt: 'Quase! Tente outra opcao.', en: 'Almost! Try another option.' },
  };

  const stepFeedbackText: Record<'correct' | 'incorrect', LocalizedText> = {
    correct: { pt: 'Boa! Voce percebeu bem essa distancia.', en: 'Nice! You spotted that distance well.' },
    incorrect: { pt: 'Quase! Compare qual par esta mais perto.', en: 'Almost! Compare which pair is closer together.' },
  };

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
      setChallengeStatus('correct');
      window.setTimeout(() => {
        setChallengeIndex((prev) => (prev + 1) % challenges.length);
        setChallengeStatus(null);
      }, 800);
    } else {
      setChallengeStatus('incorrect');
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
      setStepChallengeStatus('correct');
      window.setTimeout(() => {
        setStepChallengeIndex((prev) => (prev + 1) % stepChallenges.length);
        setStepChallengeStatus(null);
      }, 800);
    } else {
      setStepChallengeStatus('incorrect');
    }
  };

  return (
    <>
    <div className={`relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>

      <main className="relative mx-auto max-w-6xl">
        <EcosystemPageActions ecosystem="kids" isLight={isLight} backLabel={isPt ? "Voltar ao Kids" : "Back to Kids"} backPath="/kids" />
        <InternalEcosystemHeader ecosystem="kids" isLight={isLight} title={isPt ? "Notas que combinam" : "Notes That Sound Good Together"} subtitle={isPt ? "Algumas notas gostam de tocar juntas. Vamos descobrir?" : "Some notes like to play together. Want to find out?"} />

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
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-cyan-500">{typeTitle[relationship.type][lang]}</p>
                  <p className="mt-1 text-xs font-bold opacity-90">{relationship.description[lang]}</p>
                </button>
              );
            })}
          </div>

          <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black animate-in fade-in slide-in-from-top-1 duration-300 ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
            {selectedRelationship.notes[0]} + {selectedRelationship.notes[1]}: {selectedRelationship.description[lang]}
          </div>
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">{isPt ? 'Desafios' : 'Challenges'}</p>
          <p className="mt-2 text-sm font-black">{currentChallenge.prompt[lang]}</p>

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

          {challengeStatus && (
            <div className={`mt-3 rounded-xl border px-3 py-2 text-sm font-black ${challengeStatus === 'correct' ? (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200') : (isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-500/30 bg-amber-500/10 text-amber-200')}`}>
              {feedbackText[challengeStatus][lang]}
            </div>
          )}
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{isPt ? 'Passos Musicais' : 'Musical Steps'}</h2>
          <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            {isPt ? 'Algumas notas ficam bem pertinho. Outras dao passos maiores.' : 'Some notes sit very close together. Others take bigger steps.'}
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
                  <p className="mt-2 text-xs font-bold opacity-90">{step.description[lang]}</p>
                </button>
              );
            })}
          </div>

          <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
            {selectedStep.notes[0]} + {selectedStep.notes[1]}: {selectedStep.description[lang]}
          </div>

          {stepInteracted && (
            <div className={`mt-3 rounded-xl border px-3 py-3 text-sm font-bold animate-in fade-in slide-in-from-top-1 duration-300 ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
              {isPt ? 'Os musicos chamam isso de: ' : 'Musicians call this: '}<span className="font-black">{selectedStep.futureName[lang]}</span>.
            </div>
          )}

          <div className="mt-5">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">{isPt ? 'Desafios de Passos' : 'Step Challenges'}</p>
            <p className="mt-2 text-sm font-black">{currentStepChallenge.prompt[lang]}</p>
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
            {stepChallengeStatus && (
              <div className={`mt-3 rounded-xl border px-3 py-2 text-sm font-black ${stepChallengeStatus === 'correct' ? (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200') : (isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-500/30 bg-amber-500/10 text-amber-200')}`}>
                {stepFeedbackText[stepChallengeStatus][lang]}
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <button onClick={() => navigateTo('/kids/notes')} className="rounded-xl border border-cyan-500 bg-cyan-600 px-4 py-2 text-xs font-black uppercase text-white hover:bg-cyan-500">
            {isPt ? 'Voltar para Notas' : 'Back to Notes'}
          </button>
          <button onClick={() => navigateTo('/kids')} className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
            {isPt ? 'Voltar ao Kids' : 'Back to Kids'}
          </button>
        </div>
      </main>
    </div>

    <AppFooter
      isLight={isLight}
      lang={lang}
      logoSrc="/gakidslogo.webp"
      logoAlt="Guitar Architect Kids"
    />
    </>
  );
};

export default KidsNoteFriendsPage;


