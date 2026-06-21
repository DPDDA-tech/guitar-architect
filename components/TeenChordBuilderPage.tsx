import React, { useMemo, useRef, useState } from 'react';
import { getTeensLang, getTeensTheme } from '../utils/ecosystemPreferences';
import { addTeensXpOnce, getRankProgress, getTeensXp } from '../utils/teenProgress';
import { sendFretboardIntent } from '../utils/sendFretboardIntent';
import { teenChordChallenges, teenChordStacks, type TeenChordNote } from '../data/teenChordData';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';
import AppFooter from './AppFooter';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const noteFreq: Record<TeenChordNote, number> = {
  DO: 261.63,
  RE: 293.66,
  MI: 329.63,
  FA: 349.23,
  SOL: 392,
  LA: 440,
  SI: 493.88,
};

const noteColor: Record<TeenChordNote, string> = {
  DO: 'bg-red-500',
  RE: 'bg-orange-500',
  MI: 'bg-yellow-400',
  FA: 'bg-green-500',
  SOL: 'bg-blue-500',
  LA: 'bg-violet-500',
  SI: 'bg-pink-500',
};

type ChordIntervalCard = {
  id: string;
  title: string;
  pair: [TeenChordNote, TeenChordNote];
  type: '3a' | '5a' | '8a';
  description: string;
};

const chordIntervalCards: ChordIntervalCard[] = [
  {
    id: 'ci-1',
    title: 'Terça',
    pair: ['DO', 'MI'],
    type: '3a',
    description: 'A terça muda o humor do acorde: maior (brilho) ou menor (tensão).',
  },
  {
    id: 'ci-2',
    title: 'Quinta',
    pair: ['SOL', 'RE'],
    type: '5a',
    description: 'A quinta traz estabilidade estrutural e peso para a base.',
  },
  {
    id: 'ci-3',
    title: 'Oitava',
    pair: ['LA', 'LA'],
    type: '8a',
    description: 'A oitava reforça a identidade da nota em outro registro.',
  },
];

const TeenChordBuilderPage: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [lang] = useState<'pt' | 'en'>(() => getTeensLang());
  const [activeChallengeId, setActiveChallengeId] = useState(teenChordChallenges[0].id);
  const [selectedNotes, setSelectedNotes] = useState<TeenChordNote[]>([]);
  const [feedback, setFeedback] = useState(() => (lang === 'pt' ? 'Escolha um desafio, monte 3 notas e compare o resultado.' : 'Choose a challenge, build 3 notes, and compare the result.'));
  const [combo, setCombo] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState<number>(() => getTeensXp());
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedIntervalId, setSelectedIntervalId] = useState(chordIntervalCards[0].id);

  const audioContextRef = useRef<AudioContext | null>(null);

  const isLight = theme === 'light';
  const isPt = lang === 'pt';
  const rankProgress = getRankProgress(xp);

  const activeChallenge = useMemo(
    () => teenChordChallenges.find((item) => item.id === activeChallengeId) ?? teenChordChallenges[0],
    [activeChallengeId]
  );

  const targetStack = useMemo(
    () => teenChordStacks.find((stack) => stack.id === activeChallenge.targetStackId) ?? teenChordStacks[0],
    [activeChallenge]
  );
  const requiredNotes = targetStack.notes.length;
  const selectedInterval = chordIntervalCards.find((item) => item.id === selectedIntervalId) ?? chordIntervalCards[0];

  const sortedSelected = [...selectedNotes].sort().join('|');
  const sortedTarget = [...targetStack.notes].sort().join('|');

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? 'rgba(148,163,184,0.35)' : 'rgba(139,92,246,0.18)'} 1px, transparent 1px)`,
    backgroundSize: '100% 30px',
  };

  const getAudioCtx = async () => {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    return audioContextRef.current;
  };

  const playNote = async (note: TeenChordNote, duration = 0.22, delay = 0) => {
    const ctx = await getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(noteFreq[note], now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  };

  const playStack = async (notes: TeenChordNote[]) => {
    if (!notes.length || isPlaying) return;
    setIsPlaying(true);
    for (let i = 0; i < notes.length; i += 1) {
      await playNote(notes[i], 0.22, i * 0.06);
    }
    window.setTimeout(() => setIsPlaying(false), 420);
  };

  const toggleNote = (note: TeenChordNote) => {
    setSelectedNotes((prev) => {
      if (prev.includes(note)) {
        return prev.filter((n) => n !== note);
      }
      if (prev.length >= requiredNotes) {
        return [...prev.slice(1), note];
      }
      return [...prev, note];
    });
  };

  const clearBuild = () => {
    setSelectedNotes([]);
    setFeedback(isPt ? `Construção limpa. Monte um novo bloco de ${requiredNotes} notas.` : `Build cleared. Create a new ${requiredNotes}-note block.`);
  };

  const checkBuild = () => {
    if (selectedNotes.length !== requiredNotes) {
      setFeedback(`Escolha ${requiredNotes} notas para validar o bloco.`);
      return;
    }

    if (sortedSelected === sortedTarget) {
      const { xp: earnedXp, total, firstTime } = addTeensXpOnce(`chordBuilder:${activeChallenge.id}`, activeChallenge.xp);
      setXp(total);
      setCombo((v) => v + 1);
      setStreak((v) => v + 1);
      setFeedback(
        firstTime
          ? (isPt ? `Perfeito! Bloco correto. +${earnedXp} XP` : `Perfect! Correct block. +${earnedXp} XP`)
          : (isPt ? 'Perfeito! Bloco correto. Desafio já dominado — sem XP adicional.' : 'Perfect! Correct block. Challenge already mastered — no extra XP.'),
      );
      return;
    }

    setCombo(0);
    setFeedback(isPt ? 'Quase! Compare as sensações e tente outra combinação.' : 'Almost! Compare the sounds and try another combination.');
  };

  const nextChallenge = () => {
    const pool = teenChordChallenges.filter((challenge) => challenge.id !== activeChallengeId);
    const next = pool[Math.floor(Math.random() * pool.length)] ?? teenChordChallenges[0];
    setActiveChallengeId(next.id);
    setSelectedNotes([]);
    setFeedback(next.description);
  };

  return (
    <>
    <div className={`relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />

      <main className="relative mx-auto max-w-6xl">
        <EcosystemPageActions ecosystem="teens" isLight={isLight} backLabel={isPt ? "Voltar ao Teens" : "Back to Teens"} backPath="/teens" />
        <InternalEcosystemHeader ecosystem="teens" isLight={isLight} title="Construtor de Acordes" subtitle="Monte blocos harmônicos por sensação e prepare o caminho para tríades, tétrades e inversões." />

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-violet-800/60 bg-zinc-950/80'}`}>
          <div className="grid gap-3 md:grid-cols-3">
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">Desafio</p>
              <p className="mt-1 text-lg font-black">{activeChallenge.title}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">Streak / Combo</p>
              <p className="mt-1 text-lg font-black">{streak} / {combo}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">XP por acerto</p>
              <p className="mt-1 text-lg font-black">{activeChallenge.xp}</p>
            </div>
          </div>

          <div className={`mt-3 rounded-xl border px-4 py-3 ${isLight ? 'border-violet-200 bg-violet-50' : 'border-violet-500/30 bg-violet-500/10'}`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${isLight ? 'text-violet-700' : 'text-violet-300'}`}>Arquitetura Do Som</p>
            <p className={`mt-1 text-xs font-bold ${isLight ? 'text-slate-700' : 'text-zinc-200'}`}>
              Tijolos: intervalos. Estrutura: tríade (1, 3, 5). Acabamento: tétrades (7). Engenharia: mover formas no braço.
            </p>
          </div>

          <div className={`mt-3 rounded-xl border px-4 py-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{isPt ? 'Progressão' : 'Progress'}</p>
              <p className="text-xs font-black uppercase">
                Rank: <span className={rankProgress.current.accentClass}>{rankProgress.current.label}</span> · XP {xp}
              </p>
            </div>
            <div className={`mt-2 h-2 w-full rounded-full ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`}>
              <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 via-violet-400 to-fuchsia-500 transition-all" style={{ width: `${rankProgress.percent}%` }} />
            </div>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {teenChordChallenges.map((challenge) => (
              <button
                key={challenge.id}
                onClick={() => {
                  setActiveChallengeId(challenge.id);
                  setSelectedNotes([]);
                  setFeedback(challenge.description);
                }}
                className={`rounded-xl border px-3 py-3 text-left transition-all ${
                  activeChallengeId === challenge.id
                    ? 'border-violet-400 bg-violet-500/15 ring-2 ring-violet-300/40'
                    : isLight
                      ? 'border-slate-300 bg-white hover:border-violet-400'
                      : 'border-zinc-700 bg-zinc-950 hover:border-violet-500'
                }`}
              >
                <p className="text-sm font-black uppercase">{challenge.title}</p>
                <p className="mt-1 text-[10px] font-black opacity-70">{challenge.description}</p>
                <p className="mt-2 text-[10px] font-black text-violet-300/90">{challenge.hint}</p>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-violet-500/35 bg-violet-500/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">{isPt ? 'Bloco-alvo (referência)' : 'Target block (reference)'}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {targetStack.notes.map((note) => (
                <span key={`target-${note}`} className={`rounded-full border border-violet-200/50 px-3 py-1 text-xs font-black ${noteColor[note]} text-white`}>
                  {note}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] font-black text-violet-200/90">
              {isPt ? 'Tipo' : 'Type'}: {targetStack.chordType.toUpperCase()} · {targetStack.blockLabel} · {isPt ? `Monte ${requiredNotes} notas` : `Build ${requiredNotes} notes`}
            </p>
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${isLight ? 'border-fuchsia-200 bg-fuchsia-50/80' : 'border-fuchsia-500/30 bg-fuchsia-500/10'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-400">Intervalos na Arquitetura do Acorde</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {chordIntervalCards.map((card) => {
                const active = selectedIntervalId === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => setSelectedIntervalId(card.id)}
                    className={`rounded-xl border p-3 text-left ${active ? 'border-fuchsia-300 bg-fuchsia-500/20' : ''}`}
                  >
                    <p className="text-xs font-black uppercase">{card.title}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`h-8 w-8 rounded-full ${noteColor[card.pair[0]]} text-white flex items-center justify-center text-xs font-black`}>{card.pair[0]}</span>
                      <span className="text-fuchsia-300 font-black">→</span>
                      <span className={`h-8 w-8 rounded-full ${noteColor[card.pair[1]]} text-white flex items-center justify-center text-xs font-black`}>{card.pair[1]}</span>
                    </div>
                    <p className="mt-2 text-[11px] font-black opacity-85">Intervalo: {card.type}</p>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs font-bold opacity-90">{selectedInterval.description}</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {(Object.keys(noteColor) as TeenChordNote[]).map((note) => {
              const selected = selectedNotes.includes(note);
              return (
                <button
                  key={note}
                  onClick={() => toggleNote(note)}
                  className={`h-16 rounded-2xl border text-sm font-black uppercase transition-all ${
                    selected
                      ? `${noteColor[note]} border-violet-200 text-white shadow-[0_0_20px_rgba(139,92,246,0.65)]`
                      : isLight
                        ? 'border-slate-300 bg-slate-100 text-slate-700 hover:border-violet-400'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-violet-500'
                  }`}
                >
                  {note}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
            <button
              onClick={() => void playStack(targetStack.notes)}
              disabled={isPlaying}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${
                isLight
                  ? 'border-violet-500 bg-violet-100 text-violet-900 hover:bg-violet-200'
                  : 'border-violet-300 bg-violet-500/25 text-violet-50 hover:bg-violet-500/35'
              }`}
            >
              {isPt ? 'Ouvir referência' : 'Play reference'}
            </button>
            <button
              onClick={() => void playStack(selectedNotes)}
              disabled={isPlaying || selectedNotes.length === 0}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${
                isLight
                  ? 'border-violet-500 bg-violet-100 text-violet-900 hover:bg-violet-200'
                  : 'border-violet-300 bg-violet-500/25 text-violet-50 hover:bg-violet-500/35'
              }`}
            >
              Ouvir seu bloco
            </button>
            <button
              onClick={checkBuild}
              className="min-h-[44px] rounded-xl border border-emerald-400 bg-emerald-500/20 px-4 py-2 text-xs font-black uppercase text-center leading-tight text-emerald-100 hover:bg-emerald-500/30"
            >
              Validar
            </button>
            <button
              onClick={nextChallenge}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${
                isLight
                  ? 'border-violet-500 bg-violet-100 text-violet-900 hover:bg-violet-200'
                  : 'border-violet-300 bg-violet-500/25 text-violet-50 hover:bg-violet-500/35'
              }`}
            >
              {isPt ? 'Próximo exercício' : 'Next exercise'}
            </button>
            <button
              onClick={clearBuild}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-white hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 hover:border-violet-500'}`}
            >
              Limpar
            </button>
          </div>

          <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-black ${isLight ? 'border-violet-200 bg-violet-50 text-violet-800' : 'border-violet-500/30 bg-violet-500/8 text-violet-200'}`}>
            {feedback}
          </div>
        </section>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => navigateTo('/teens')}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] transition-all hover:from-violet-500 hover:to-fuchsia-500 active:scale-95"
          >
            {isPt ? 'Voltar ao Teens' : 'Back to Teens'}
          </button>
          <button
            onClick={() => sendFretboardIntent({
              source: 'teens-chord',
              action: 'field',
              root: 'C',
              scaleType: 'Major (Ionian)',
              harmonyMode: 'TRIADS',
              instruction: {
                title: isPt ? 'Do Bloco ao Campo Harmônico' : 'From Block to Harmonic Field',
                description: isPt ? 'As tríades que você montou fazem parte deste campo harmônico. Explore os graus.' : 'The triads you built are part of this harmonic field. Explore the degrees.',
                persistent: true,
              },
            })}
            className="rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-500 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(8,145,178,0.3)] transition-all hover:from-cyan-500 hover:to-sky-400 active:scale-95"
          >
            {isPt ? 'Ir para Studio' : 'Go to Studio'}
          </button>
        </div>
      </main>
    </div>

    <AppFooter isLight={isLight} lang={isPt ? 'pt' : 'en'} logoSrc="/gateenslogo.webp" logoAlt="Guitar Architect Teens" />
    </>
  );
};

export default TeenChordBuilderPage;

