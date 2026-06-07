import React, { useRef, useState } from 'react';
import { getKidsTheme } from '../utils/ecosystemPreferences';
import { rhythmChallenges, rhythmExamples, type RhythmType } from '../data/kidsRhythmData';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const GAME_MODES = {
  session5: 5,
  infinite: null,
} as const;

type GameMode = keyof typeof GAME_MODES;

const KidsSoundLengthsPage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [activeRhythm, setActiveRhythm] = useState<RhythmType | null>(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeFeedback, setChallengeFeedback] = useState('');

  const [mode, setMode] = useState<GameMode>('session5');
  const [sequence, setSequence] = useState<RhythmType[]>([]);
  const [userInput, setUserInput] = useState<RhythmType[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(0);
  const [round, setRound] = useState(0);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState('Escolha um modo e comece o desafio!');
  const [activeSequenceIndex, setActiveSequenceIndex] = useState<number | null>(null);
  const [customSequence, setCustomSequence] = useState<RhythmType[]>([]);
  const [isPlayingCustom, setIsPlayingCustom] = useState(false);
  const [customPlayingIndex, setCustomPlayingIndex] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sequencePlayIdRef = useRef(0);
  const customPlayIdRef = useRef(0);

  const isLight = theme === 'light';
  const currentChallenge = rhythmChallenges[challengeIndex];


  const getAudioCtx = () => {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
    return audioContextRef.current;
  };

  const playTone = async (type: RhythmType) => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();

    const now = ctx.currentTime;
    const makeBeep = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.01);
    };

    if (type === 'short') makeBeep(392, now, 0.22);
    if (type === 'long') makeBeep(330, now, 0.7);
    if (type === 'fast') {
      makeBeep(440, now, 0.16);
      makeBeep(440, now + 0.22, 0.16);
    }
    if (type === 'silence') {
  // silÉncio intencional
    }
  };

  const randomRhythm = (): RhythmType => {
    const all: RhythmType[] = ['short', 'long', 'fast', 'silence'];
    return all[Math.floor(Math.random() * all.length)];
  };

  const buildSequence = (nextLevel: number): RhythmType[] => {
    const size = Math.min(2 + nextLevel, 5);
    return Array.from({ length: size }, () => randomRhythm());
  };

  const playSequence = async (target: RhythmType[]) => {
    if (target.length === 0) return;

    const token = sequencePlayIdRef.current + 1;
    sequencePlayIdRef.current = token;
    setIsPlaying(true);
    setActiveSequenceIndex(null);

    for (let i = 0; i < target.length; i += 1) {
      if (sequencePlayIdRef.current !== token) break;
      setActiveSequenceIndex(i);
      await playTone(target[i]);
      await new Promise((resolve) => window.setTimeout(resolve, 520));
    }

    if (sequencePlayIdRef.current === token) {
      setActiveSequenceIndex(null);
      setIsPlaying(false);
    }
  };

  const startLoop = async (selectedMode: GameMode = mode) => {
    const next = buildSequence(1);
    setMode(selectedMode);
    setLevel(1);
    setRound(1);
    setStars(0);
    setSequence(next);
    setUserInput([]);
    setFeedback('Olhe, escute e repita o caminho!');
    await playSequence(next);
  };

  const repeatCurrentSequence = async () => {
    if (sequence.length === 0 || isPlaying) return;
    setFeedback('Boa ideia! Vamos ouvir de novo com calma.');
    await playSequence(sequence);
  };

  const resetLoop = () => {
    sequencePlayIdRef.current += 1;
    setSequence([]);
    setUserInput([]);
    setIsPlaying(false);
    setLevel(0);
    setRound(0);
    setStars(0);
    setActiveSequenceIndex(null);
    setFeedback('Reiniciado! Escolha um modo e comece novamente.');
  };

  const motivational = [
    'Boa! VocÉ tem ouvido de explorador!',
    'Incrível! Mais uma fase!',
    'Perfeito! Continue assim!',
    'Muito bem! VocÉ está voando!',
  ];

  const handleLoopClick = async (type: RhythmType) => {
    if (isPlaying || sequence.length === 0) return;
    await playTone(type);

    const nextInput = [...userInput, type];
    setUserInput(nextInput);
    const idx = nextInput.length - 1;

    if (sequence[idx] !== type) {
      setFeedback('Quase! Vamos tentar de novo.');
      setUserInput([]);
      return;
    }

    if (nextInput.length === sequence.length) {
      const targetRounds = GAME_MODES[mode];
      const nextRound = round + 1;
      const nextLevel = level + 1;

      if (targetRounds !== null && nextRound >= targetRounds) {
        setStars((prev) => prev + 1);
    setFeedback('Missão completa! VocÉ brilhou no ritmo!');
        setUserInput([]);
        return;
      }

      setStars((prev) => prev + 1);
      setFeedback(motivational[Math.floor(Math.random() * motivational.length)]);
      setRound(nextRound);
      setLevel(nextLevel);
      setUserInput([]);

      const nextSequence = buildSequence(nextLevel);
      setSequence(nextSequence);
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      await playSequence(nextSequence);
    }
  };

  const handleRhythmClick = async (type: RhythmType) => {
    setActiveRhythm(type);
    await playTone(type);
  };

  const handleChallengeAnswer = (type: RhythmType) => {
    if (type === currentChallenge.answer) {
      setChallengeFeedback('Boa! VocÉ encontrou certinho.');
      window.setTimeout(() => {
        setChallengeIndex((prev) => (prev + 1) % rhythmChallenges.length);
        setChallengeFeedback('');
      }, 900);
    } else {
      setChallengeFeedback('Quase! Tente mais uma vez, vocÉ consegue.');
    }
  };

  const addToCustomSequence = async (type: RhythmType) => {
    setCustomSequence((prev) => [...prev, type]);
    await playTone(type);
  };

  const removeLastCustom = () => {
    setCustomSequence((prev) => prev.slice(0, -1));
  };

  const clearCustom = () => {
    customPlayIdRef.current += 1;
    setIsPlayingCustom(false);
    setCustomPlayingIndex(null);
    setCustomSequence([]);
  };

  const playCustomSequence = async () => {
    if (customSequence.length === 0 || isPlayingCustom) return;

    const token = customPlayIdRef.current + 1;
    customPlayIdRef.current = token;
    setIsPlayingCustom(true);
    setCustomPlayingIndex(null);

    for (let i = 0; i < customSequence.length; i += 1) {
      if (customPlayIdRef.current !== token) break;
      setCustomPlayingIndex(i);
      await playTone(customSequence[i]);
      await new Promise((resolve) => window.setTimeout(resolve, 520));
    }

    if (customPlayIdRef.current === token) {
      setIsPlayingCustom(false);
      setCustomPlayingIndex(null);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>

      <main className="relative mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigateTo('/kids')}
          className={`mb-6 rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-all ${isLight ? 'border-emerald-300 bg-white text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.12)] hover:border-emerald-400 hover:shadow-[0_10px_24px_rgba(16,185,129,0.16)]' : 'border-emerald-500/70 bg-emerald-950/60 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.16),0_0_24px_rgba(16,185,129,0.18)] hover:border-emerald-400 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.22),0_0_30px_rgba(16,185,129,0.24)]'}`}
        >
          Voltar ao Kids
        </button>
        <header className="mb-6 md:mb-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-500">Guitar Architect Kids</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">O Tamanho dos Sons</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Descubra sons rápidos, longos e pausas musicais.
          </p>
        </header>

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {rhythmExamples.map((example) => (
              <button
                key={example.id}
                onClick={() => void handleRhythmClick(example.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${activeRhythm === example.id ? 'border-cyan-400 ring-2 ring-cyan-300/50' : isLight ? 'border-slate-300 hover:border-cyan-400' : 'border-zinc-700 hover:border-cyan-500'}`}
              >
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">{example.title}</p>
                <p className="mt-2 text-2xl">{example.visual}</p>
                <p className="mt-2 text-lg font-black">{example.syllable}</p>
                <p className={`mt-2 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>{example.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">Desafios</p>
          <p className="mt-2 text-sm font-black">{currentChallenge.prompt}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {rhythmExamples.map((example) => (
              <button
                key={`challenge-${example.id}`}
                onClick={() => handleChallengeAnswer(example.id)}
                className={`rounded-xl border px-3 py-3 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}
              >
                {example.syllable}
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
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">Repita o caminho</p>
          <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Jogue fases curtas e ganhe estrelas no ritmo.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => void startLoop('session5')} disabled={isPlaying} className="rounded-xl border border-cyan-500 bg-cyan-600 px-4 py-2 text-xs font-black uppercase text-white hover:bg-cyan-500 disabled:opacity-50">
              Jogar 5 fases
            </button>
            <button onClick={() => void startLoop('infinite')} disabled={isPlaying} className={`rounded-xl border px-4 py-2 text-xs font-black uppercase disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              Modo infinito
            </button>
            <button onClick={() => void repeatCurrentSequence()} disabled={isPlaying || sequence.length === 0} className={`rounded-xl border px-4 py-2 text-xs font-black uppercase disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              Repetir caminho
            </button>
            <button onClick={resetLoop} className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              Reiniciar
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-wider text-cyan-500">
              <span>Nível: {level}</span>
            <span>Fase: {round}{GAME_MODES[mode] ? `/${GAME_MODES[mode]}` : ''}</span>
              <span>Estrelas: {'?'.repeat(Math.min(stars, 10)) || '★'}</span>
          </div>

          {sequence.length > 0 && (
            <p className={`mt-2 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
              Caminho atual: {sequence.map((item) => rhythmExamples.find((e) => e.id === item)?.syllable).join(' ? ')}
            </p>
          )}

          <div className={`mt-3 rounded-xl border px-3 py-3 text-sm font-black ${feedback.startsWith('Missão') || feedback.startsWith('Boa') || feedback.startsWith('Incrível') || feedback.startsWith('Perfeito') || feedback.startsWith('Muito bem') ? (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200') : (isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200')}`}>
            {feedback}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {rhythmExamples.map((example) => (
              <button
                key={`loop-${example.id}`}
                onClick={() => void handleLoopClick(example.id)}
                disabled={isPlaying || sequence.length === 0}
                className={`rounded-xl border px-3 py-3 text-xs font-black uppercase transition-all disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}
              >
                <div className="text-lg">{example.visual}</div>
                <div className="mt-1">{example.syllable}</div>
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {sequence.map((item, index) => (
              <span
                key={`preview-${item}-${index}`}
                className={`rounded-lg border px-2 py-1 text-xs font-black uppercase ${activeSequenceIndex === index ? 'border-cyan-400 bg-cyan-500 text-white' : isLight ? 'border-slate-300 bg-white text-slate-700' : 'border-zinc-600 bg-zinc-900 text-zinc-200'}`}
              >
                {rhythmExamples.find((e) => e.id === item)?.syllable}
              </span>
            ))}
          </div>
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">Monte seu trecho</p>
          <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Escolha a ordem dos sons e aperte play para ouvir como ficou.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {rhythmExamples.map((example) => (
              <button
                key={`custom-${example.id}`}
                onClick={() => void addToCustomSequence(example.id)}
                className={`rounded-xl border px-3 py-3 text-xs font-black uppercase transition-all ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}
              >
                <div className="text-lg">{example.visual}</div>
                <div className="mt-1">{example.syllable}</div>
              </button>
            ))}
          </div>

          <div className={`mt-3 min-h-[60px] rounded-xl border px-3 py-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-700 bg-zinc-950/70'}`}>
            {customSequence.length === 0 ? (
              <p className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Seu trecho aparecerá aqui.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {customSequence.map((item, index) => (
                  <span
                    key={`custom-preview-${item}-${index}`}
                    className={`rounded-lg border px-2 py-1 text-xs font-black uppercase ${customPlayingIndex === index ? 'border-cyan-400 bg-cyan-500 text-white' : isLight ? 'border-slate-300 bg-white text-slate-700' : 'border-zinc-600 bg-zinc-900 text-zinc-200'}`}
                  >
                    {rhythmExamples.find((e) => e.id === item)?.syllable}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => void playCustomSequence()}
              disabled={customSequence.length === 0 || isPlayingCustom}
              className="rounded-xl border border-cyan-500 bg-cyan-600 px-4 py-2 text-xs font-black uppercase text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {isPlayingCustom ? 'Tocando...' : 'Play'}
            </button>
            <button
              onClick={removeLastCustom}
              disabled={customSequence.length === 0 || isPlayingCustom}
              className={`rounded-xl border px-4 py-2 text-xs font-black uppercase disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
            >
              Apagar última
            </button>
            <button
              onClick={clearCustom}
              disabled={customSequence.length === 0}
              className={`rounded-xl border px-4 py-2 text-xs font-black uppercase disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
            >
              Limpar
            </button>
          </div>
        </section>

        <div className="mt-6 flex justify-center">
          <button onClick={() => navigateTo('/kids')} className="rounded-xl border border-emerald-500 bg-emerald-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-emerald-500">
            Voltar ao Kids
          </button>
        </div>
      </main>
    </div>
  );
};

export default KidsSoundLengthsPage;

