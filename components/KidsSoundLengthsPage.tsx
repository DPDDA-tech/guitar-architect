import React, { useRef, useState } from 'react';
import { getKidsLang, getKidsTheme } from '../utils/ecosystemPreferences';
import { rhythmChallenges, rhythmExamples, type RhythmType } from '../data/kidsRhythmData';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';

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
  const [lang] = useState(() => getKidsLang());
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
  const [activeSequenceIndex, setActiveSequenceIndex] = useState<number | null>(null);
  const [customSequence, setCustomSequence] = useState<RhythmType[]>([]);
  const [isPlayingCustom, setIsPlayingCustom] = useState(false);
  const [customPlayingIndex, setCustomPlayingIndex] = useState<number | null>(null);

  const isLight = theme === 'light';
  const isPt = lang === 'pt';

  const copy = {
    backKids: isPt ? 'Voltar ao Kids' : 'Back to Kids',
    challenge: isPt ? 'Desafios' : 'Challenges',
    repeatPath: isPt ? 'Repita o caminho' : 'Repeat the path',
    repeatDescription: isPt ? 'Jogue fases curtas e ganhe estrelas no ritmo.' : 'Play short rounds and earn stars in rhythm.',
    play5: isPt ? 'Jogar 5 fases' : 'Play 5 rounds',
    infinite: isPt ? 'Modo infinito' : 'Infinite mode',
    repeatSequence: isPt ? 'Repetir caminho' : 'Repeat path',
    restart: isPt ? 'Reiniciar' : 'Restart',
    level: isPt ? 'Nível' : 'Level',
    round: isPt ? 'Fase' : 'Round',
    stars: isPt ? 'Estrelas' : 'Stars',
    currentPath: isPt ? 'Caminho atual' : 'Current path',
    buildSection: isPt ? 'Monte seu trecho' : 'Build your phrase',
    buildDescription: isPt ? 'Escolha a ordem dos sons e aperte play para ouvir como ficou.' : 'Choose the order of sounds and press play to hear the result.',
    yourPhraseEmpty: isPt ? 'Seu trecho aparecerá aqui.' : 'Your phrase will appear here.',
    play: 'Play',
    playing: isPt ? 'Tocando...' : 'Playing...',
    eraseLast: isPt ? 'Apagar última' : 'Erase last',
    clear: isPt ? 'Limpar' : 'Clear',
    initialFeedback: isPt ? 'Escolha um modo e comece o desafio!' : 'Choose a mode and start the challenge!',
    lookListenRepeat: isPt ? 'Olhe, escute e repita o caminho!' : 'Look, listen, and repeat the path!',
    replaySlowly: isPt ? 'Boa ideia! Vamos ouvir de novo com calma.' : 'Good idea! Let’s listen again slowly.',
    restarted: isPt ? 'Reiniciado! Escolha um modo e comece novamente.' : 'Restarted! Choose a mode and start again.',
    missionComplete: isPt ? 'Missão completa! Você brilhou no ritmo!' : 'Mission complete! You shined in rhythm!',
    almost: isPt ? 'Quase! Vamos tentar de novo.' : 'Almost! Let’s try again.',
    challengeSuccess: isPt ? 'Boa! Você encontrou certinho.' : 'Nice! You found it exactly right.',
    challengeRetry: isPt ? 'Quase! Tente mais uma vez, você consegue.' : 'Almost! Try one more time, you can do it.',
  };

  const rhythmText: Record<RhythmType, { title: string; description: string }> = {
    short: { title: isPt ? 'Sons Curtos' : 'Short Sounds', description: isPt ? 'Esse som acaba rapidinho!' : 'This sound ends quickly!' },
    long: { title: isPt ? 'Sons Longos' : 'Long Sounds', description: isPt ? 'Esse som dura mais tempo!' : 'This sound lasts longer!' },
    fast: { title: isPt ? 'Sons Rápidos' : 'Fast Sounds', description: isPt ? 'Esses sons correm bem rápido!' : 'These sounds move very fast!' },
    silence: { title: isPt ? 'Silêncio' : 'Silence', description: isPt ? 'A música também gosta de descansar.' : 'Music likes to rest too.' },
  };

  const challengePromptCopy: Record<string, string> = {
    c1: isPt ? 'Encontre o som mais longo.' : 'Find the longest sound.',
    c2: isPt ? 'Clique no som rapidinho.' : 'Click the very fast sound.',
    c3: isPt ? 'Qual é o silêncio?' : 'Which one is silence?',
    c4: isPt ? 'Qual som dura mais?' : 'Which sound lasts longer?',
  };

  const currentChallenge = rhythmChallenges[challengeIndex];
  const [feedback, setFeedback] = useState(copy.initialFeedback);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sequencePlayIdRef = useRef(0);
  const customPlayIdRef = useRef(0);

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
    setFeedback(copy.lookListenRepeat);
    await playSequence(next);
  };

  const repeatCurrentSequence = async () => {
    if (sequence.length === 0 || isPlaying) return;
    setFeedback(copy.replaySlowly);
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
    setFeedback(copy.restarted);
  };

  const motivational = isPt
    ? ['Boa! Você tem ouvido de explorador!', 'Incrível! Mais uma fase!', 'Perfeito! Continue assim!', 'Muito bem! Você está voando!']
    : ['Nice! You have an explorer’s ear!', 'Amazing! One more round!', 'Perfect! Keep going!', 'Great job! You are flying!'];

  const handleLoopClick = async (type: RhythmType) => {
    if (isPlaying || sequence.length === 0) return;
    await playTone(type);

    const nextInput = [...userInput, type];
    setUserInput(nextInput);
    const idx = nextInput.length - 1;

    if (sequence[idx] !== type) {
      setFeedback(copy.almost);
      setUserInput([]);
      return;
    }

    if (nextInput.length === sequence.length) {
      const targetRounds = GAME_MODES[mode];
      const nextRound = round + 1;
      const nextLevel = level + 1;

      if (targetRounds !== null && nextRound >= targetRounds) {
        setStars((prev) => prev + 1);
        setFeedback(copy.missionComplete);
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
      setChallengeFeedback(copy.challengeSuccess);
      window.setTimeout(() => {
        setChallengeIndex((prev) => (prev + 1) % rhythmChallenges.length);
        setChallengeFeedback('');
      }, 900);
    } else {
      setChallengeFeedback(copy.challengeRetry);
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
        <EcosystemPageActions ecosystem="kids" isLight={isLight} backLabel={copy.backKids} backPath="/kids" />
        <InternalEcosystemHeader ecosystem="kids" isLight={isLight} title="O Tamanho dos Sons" subtitle="Descubra sons rápidos, longos e pausas musicais." />

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {rhythmExamples.map((example) => (
              <button key={example.id} onClick={() => void handleRhythmClick(example.id)} className={`rounded-2xl border p-4 text-left transition-all ${activeRhythm === example.id ? 'border-cyan-400 ring-2 ring-cyan-300/50' : isLight ? 'border-slate-300 hover:border-cyan-400' : 'border-zinc-700 hover:border-cyan-500'}`}>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">{rhythmText[example.id].title}</p>
                <p className="mt-2 text-2xl">{example.visual}</p>
                <p className="mt-2 text-lg font-black">{example.syllable}</p>
                <p className={`mt-2 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>{rhythmText[example.id].description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">{copy.challenge}</p>
          <p className="mt-2 text-sm font-black">{challengePromptCopy[currentChallenge.id] ?? currentChallenge.prompt}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {rhythmExamples.map((example) => (
              <button key={`challenge-${example.id}`} onClick={() => handleChallengeAnswer(example.id)} className={`rounded-xl border px-3 py-3 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}>
                {example.syllable}
              </button>
            ))}
          </div>
          {challengeFeedback && <div className={`mt-3 rounded-xl border px-3 py-2 text-sm font-black ${challengeFeedback === copy.challengeSuccess ? (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200') : (isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-500/30 bg-amber-500/10 text-amber-200')}`}>{challengeFeedback}</div>}
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">{copy.repeatPath}</p>
          <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>{copy.repeatDescription}</p>
          <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
            <button onClick={() => void startLoop('session5')} disabled={isPlaying} className="min-h-[44px] rounded-xl border border-cyan-500 bg-cyan-600 px-4 py-2 text-xs font-black uppercase text-center leading-tight text-white hover:bg-cyan-500 disabled:opacity-50">{copy.play5}</button>
            <button onClick={() => void startLoop('infinite')} disabled={isPlaying} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>{copy.infinite}</button>
            <button onClick={() => void repeatCurrentSequence()} disabled={isPlaying || sequence.length === 0} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>{copy.repeatSequence}</button>
            <button onClick={resetLoop} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>{copy.restart}</button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-wider text-cyan-500">
            <span>{copy.level}: {level}</span>
            <span>{copy.round}: {round}{GAME_MODES[mode] ? `/${GAME_MODES[mode]}` : ''}</span>
            <span>{copy.stars}: {'★'.repeat(Math.min(stars, 10)) || '★'}</span>
          </div>
          {sequence.length > 0 && <p className={`mt-2 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>{copy.currentPath}: {sequence.map((item) => rhythmExamples.find((e) => e.id === item)?.syllable).join(' • ')}</p>}
          <div className={`mt-3 rounded-xl border px-3 py-3 text-sm font-black ${feedback === copy.missionComplete || motivational.includes(feedback) ? (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200') : (isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200')}`}>{feedback}</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {rhythmExamples.map((example) => (
              <button key={`loop-${example.id}`} onClick={() => void handleLoopClick(example.id)} disabled={isPlaying || sequence.length === 0} className={`rounded-xl border px-3 py-3 text-xs font-black uppercase transition-all disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}>
                <div className="text-lg">{example.visual}</div>
                <div className="mt-1">{example.syllable}</div>
              </button>
            ))}
          </div>
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">{copy.buildSection}</p>
          <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>{copy.buildDescription}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {rhythmExamples.map((example) => (
              <button key={`custom-${example.id}`} onClick={() => void addToCustomSequence(example.id)} className={`rounded-xl border px-3 py-3 text-xs font-black uppercase transition-all ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}>
                <div className="text-lg">{example.visual}</div>
                <div className="mt-1">{example.syllable}</div>
              </button>
            ))}
          </div>
          <div className={`mt-3 min-h-[60px] rounded-xl border px-3 py-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-700 bg-zinc-950/70'}`}>
            {customSequence.length === 0 ? <p className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{copy.yourPhraseEmpty}</p> : <div className="flex flex-wrap gap-2">{customSequence.map((item, index) => <span key={`custom-preview-${item}-${index}`} className={`rounded-lg border px-2 py-1 text-xs font-black uppercase ${customPlayingIndex === index ? 'border-cyan-400 bg-cyan-500 text-white' : isLight ? 'border-slate-300 bg-white text-slate-700' : 'border-zinc-600 bg-zinc-900 text-zinc-200'}`}>{rhythmExamples.find((e) => e.id === item)?.syllable}</span>)}</div>}
          </div>
          <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
            <button onClick={() => void playCustomSequence()} disabled={customSequence.length === 0 || isPlayingCustom} className="min-h-[44px] rounded-xl border border-cyan-500 bg-cyan-600 px-4 py-2 text-xs font-black uppercase text-center leading-tight text-white hover:bg-cyan-500 disabled:opacity-50">{isPlayingCustom ? copy.playing : copy.play}</button>
            <button onClick={removeLastCustom} disabled={customSequence.length === 0 || isPlayingCustom} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>{copy.eraseLast}</button>
            <button onClick={clearCustom} disabled={customSequence.length === 0} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>{copy.clear}</button>
          </div>
        </section>

        <div className="mt-6 grid gap-3 sm:flex sm:justify-center">
          <button onClick={() => navigateTo('/kids')} className="min-h-[44px] rounded-xl border border-emerald-500 bg-emerald-600 px-5 py-3 text-xs font-black uppercase text-center leading-tight text-white hover:bg-emerald-500">{copy.backKids}</button>
        </div>
      </main>
    </div>
  );
};

export default KidsSoundLengthsPage;