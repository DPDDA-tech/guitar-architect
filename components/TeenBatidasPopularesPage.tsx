import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getTeensTheme } from '../utils/ecosystemPreferences';
import { addTeensXp, getRankProgress, getTeensXp } from '../utils/teenProgress';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

type StrumSymbol = '↓' | '↑' | '–';
type Phase = 'LISTEN' | 'UNDERSTAND' | 'PLAY';

type StrumStep = {
  count: string;
  symbol: StrumSymbol;
  accent?: boolean;
};

type StrummingPattern = {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  meter: string;
  level: string;
  hint: string;
  description: string;
  steps: StrumStep[];
};

type UserStrum = {
  stepIndex: number;
  symbol: Exclude<StrumSymbol, '–'>;
  result: 'perfect' | 'wrong' | 'miss';
};

const makeEight = (symbols: StrumSymbol[]) =>
  ['1', '&', '2', '&', '3', '&', '4', '&'].map((count, index) => ({
    count,
    symbol: symbols[index] ?? '–',
    accent: count === '1' || count === '3',
  }));

const makeSix = (symbols: StrumSymbol[]) =>
  ['1', '&', '2', '&', '3', '&'].map((count, index) => ({
    count,
    symbol: symbols[index] ?? '–',
    accent: count === '1',
  }));

const PATTERNS: StrummingPattern[] = [
  {
    id: 'pop-8',
    title: 'Pop 8',
    genre: 'Pop',
    bpm: 78,
    meter: '4/4',
    level: 'Base',
    hint: 'Comece com movimentos largos e relaxados.',
    description: 'Batida pop clássica para treinar fluidez entre pausas e subidas.',
    steps: makeEight(['↓', '–', '↓', '↑', '–', '↑', '↓', '↑']),
  },
  {
    id: 'pop-rock',
    title: 'Pop Rock',
    genre: 'Pop Rock',
    bpm: 86,
    meter: '4/4',
    level: 'Base',
    hint: 'Marque bem o 2 e o 4 sem travar a mão.',
    description: 'Levada direta para acompanhar refrões e músicas animadas.',
    steps: makeEight(['↓', '↓', '↑', '–', '↓', '↑', '↓', '↑']),
  },
  {
    id: 'ballad',
    title: 'Balada',
    genre: 'Balada',
    bpm: 72,
    meter: '4/4',
    level: 'Base',
    hint: 'Use dinâmica suave e deixe as pausas respirarem.',
    description: 'Padrão mais aberto para canções lentas e acompanhamento leve.',
    steps: makeEight(['↓', '–', '↓', '↑', '↓', '–', '↓', '↑']),
  },
  {
    id: 'reggae',
    title: 'Reggae',
    genre: 'Reggae',
    bpm: 76,
    meter: '4/4',
    level: 'Intermediário',
    hint: 'Pense no contratempo: as subidas aparecem onde o corpo quer balançar.',
    description: 'Treina a sensação de contratempo típica do reggae.',
    steps: makeEight(['–', '↑', '–', '↑', '–', '↑', '–', '↑']),
  },
  {
    id: 'ska',
    title: 'Ska',
    genre: 'Ska',
    bpm: 112,
    meter: '4/4',
    level: 'Intermediário',
    hint: 'Mantenha a mão pequena e rápida para não cansar.',
    description: 'Versão mais acelerada do contratempo, ótima para precisão de upstroke.',
    steps: makeEight(['–', '↑', '–', '↑', '–', '↑', '↓', '↑']),
  },
  {
    id: 'funk',
    title: 'Funk',
    genre: 'Funk',
    bpm: 96,
    meter: '4/4',
    level: 'Intermediário',
    hint: 'Pense em groove curto e seco, com mão sempre em movimento.',
    description: 'Levada com ataque mais recortado para trabalhar groove.',
    steps: makeEight(['↓', '–', '↓', '↑', '–', '↑', '↓', '–']),
  },
  {
    id: 'samba',
    title: 'Samba Básico',
    genre: 'Brasileiro',
    bpm: 90,
    meter: '4/4',
    level: 'Intermediário',
    hint: 'Balance a mão como se estivesse desenhando um círculo contínuo.',
    description: 'Entrada leve no universo das batidas brasileiras.',
    steps: makeEight(['↓', '↑', '↓', '↑', '↓', '–', '↑', '–']),
  },
  {
    id: 'bossa',
    title: 'Bossa Básica',
    genre: 'Brasileiro',
    bpm: 84,
    meter: '4/4',
    level: 'Intermediário',
    hint: 'Busque elegância e constância; menos força, mais controle.',
    description: 'Padrão de acompanhamento suave, com ataques distribuídos.',
    steps: makeEight(['↓', '–', '↑', '↓', '–', '↑', '↓', '↑']),
  },
  {
    id: 'blues-swing',
    title: 'Blues Swing',
    genre: 'Blues',
    bpm: 80,
    meter: '4/4',
    level: 'Intermediário',
    hint: 'Pense no balanço ternário escondido dentro do compasso quaternário.',
    description: 'Levada blues mais macia, ótima para shuffle leve e frases cantadas.',
    steps: makeEight(['↓', '–', '↓', '↑', '↓', '–', '↑', '↑']),
  },
  {
    id: 'louvor-pop',
    title: 'Louvor Pop',
    genre: 'Louvor',
    bpm: 74,
    meter: '4/4',
    level: 'Base',
    hint: 'Deixe o movimento contínuo e priorize a sustentação dos acordes.',
    description: 'Batida muito usada em músicas de louvor com clima aberto e progressivo.',
    steps: makeEight(['↓', '↓', '↑', '–', '↑', '↓', '↑', '–']),
  },
  {
    id: 'louvor-ballad',
    title: 'Louvor Balada',
    genre: 'Louvor',
    bpm: 68,
    meter: '4/4',
    level: 'Base',
    hint: 'Ataque leve, bastante espaço e intenção nas entradas.',
    description: 'Padrão lento e emotivo para conduções mais contemplativas.',
    steps: makeEight(['↓', '–', '↓', '↑', '–', '↓', '↑', '–']),
  },
  {
    id: 'folk-open',
    title: 'Folk Aberto',
    genre: 'Folk',
    bpm: 88,
    meter: '4/4',
    level: 'Base',
    hint: 'Imagine a mão como um pêndulo constante, sem travar nas pausas.',
    description: 'Levada aberta e orgânica para acompanhar voz e violão.',
    steps: makeEight(['↓', '–', '↓', '↑', '↓', '↑', '↓', '↑']),
  },
  {
    id: 'sertanejo-pop',
    title: 'Sertanejo Pop',
    genre: 'Sertanejo',
    bpm: 92,
    meter: '4/4',
    level: 'Base',
    hint: 'Deixe o pulso constante e a subida sempre leve, sem pesar a mão.',
    description: 'Batida muito comum em sertanejo universitário e pop romântico brasileiro.',
    steps: makeEight(['↓', '↓', '↑', '↓', '↑', '↓', '↑', '–']),
  },
  {
    id: 'guarania-light',
    title: 'Guarânia Leve',
    genre: 'Brasileiro',
    bpm: 74,
    meter: '4/4',
    level: 'Intermediário',
    hint: 'Pense em condução macia e sentimental, com entradas bem cantadas.',
    description: 'Levada inspirada em guarânias e baladas sertanejas mais emotivas.',
    steps: makeEight(['↓', '–', '↑', '↓', '↑', '–', '↓', '↑']),
  },
  {
    id: 'worship-68',
    title: 'Worship 6/8',
    genre: 'Louvor',
    bpm: 70,
    meter: '6/8',
    level: 'Intermediário',
    hint: 'Sinta dois blocos de três pulsações: forte, leve, leve / forte, leve, leve.',
    description: 'Padrão muito usado em louvor moderno com sensação ampla e cinematográfica.',
    steps: makeSix(['↓', '–', '↑', '↓', '–', '↑']),
  },
  {
    id: 'blues-shuffle',
    title: 'Blues Shuffle',
    genre: 'Blues',
    bpm: 88,
    meter: '4/4',
    level: 'Intermediário',
    hint: 'Trabalhe a sensação de “vai e volta” do shuffle sem endurecer o pulso.',
    description: 'Versão mais marcada de shuffle para blues e rock clássico.',
    steps: makeEight(['↓', '–', '↓', '↑', '↓', '–', '↓', '↑']),
  },
  {
    id: 'waltz',
    title: 'Valsa 3/4',
    genre: 'Valsa',
    bpm: 82,
    meter: '3/4',
    level: 'Base',
    hint: 'Sinta o primeiro tempo mais firme e os outros dois mais leves.',
    description: 'Treina a troca de sensação entre compasso quaternário e ternário.',
    steps: makeSix(['↓', '–', '↑', '↓', '–', '↑']),
  },
  {
    id: 'punk',
    title: 'Punk Downstroke',
    genre: 'Punk',
    bpm: 132,
    meter: '4/4',
    level: 'Energia',
    hint: 'Segure firme o pulso, mas relaxe o antebraço para aguentar o fluxo.',
    description: 'Treino de resistência e constância com ataques para baixo.',
    steps: makeEight(['↓', '↓', '↓', '↓', '↓', '↓', '↓', '↓']),
  },
];

const PHASE_LABELS: Record<Phase, string> = {
  LISTEN: 'OUVIR',
  UNDERSTAND: 'ENTENDER',
  PLAY: 'TOCAR',
};

const STRUM_FREQUENCIES = [110, 146.83, 196, 246.94, 293.66, 369.99];

const TeenBatidasPopularesPage: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const isLight = theme === 'light';
  const [selectedPatternId, setSelectedPatternId] = useState(PATTERNS[0].id);
  const [currentBpm, setCurrentBpm] = useState(PATTERNS[0].bpm);
  const [currentPhase, setCurrentPhase] = useState<Phase>('LISTEN');
  const [isLooping, setIsLooping] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('Ouça a batida algumas vezes e deixe a mão entrar no balanço.');
  const [xp, setXp] = useState(() => getTeensXp());
  const [userStrums, setUserStrums] = useState<UserStrum[]>([]);
  const [loopsCompleted, setLoopsCompleted] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const loopIntervalRef = useRef<number | null>(null);
  const missTimeoutRef = useRef<number | null>(null);
  const currentStepRef = useRef<number | null>(null);
  const stepResolvedRef = useRef(false);

  const selectedPattern = useMemo(
    () => PATTERNS.find((pattern) => pattern.id === selectedPatternId) ?? PATTERNS[0],
    [selectedPatternId]
  );

  const stepDuration = useMemo(() => (60 / currentBpm) * 500, [currentBpm]);
  const rankProgress = getRankProgress(xp);
  const attackSteps = useMemo(
    () => selectedPattern.steps.filter((step) => step.symbol !== '–').length,
    [selectedPattern.steps]
  );

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? 'rgba(148,163,184,0.34)' : 'rgba(129,140,248,0.22)'} 1px, transparent 1px)`,
    backgroundSize: '100% 28px',
  };

  const stopLoop = useCallback(() => {
    if (loopIntervalRef.current) {
      window.clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
    if (missTimeoutRef.current) {
      window.clearTimeout(missTimeoutRef.current);
      missTimeoutRef.current = null;
    }
    setIsLooping(false);
    setCurrentStep(null);
    currentStepRef.current = null;
    stepResolvedRef.current = false;
  }, []);

  const getAudioCtx = useCallback(async () => {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playStringPluck = useCallback(async (frequency: number, time: number, volumeMultiplier = 1) => {
    const ctx = await getAudioCtx();
    if (!ctx) return;
    const attackTime = 0.005;
    const releaseTime = 0.72;

    const fundamental = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const masterGain = ctx.createGain();
    const lowpassFilter = ctx.createBiquadFilter();
    const highpassFilter = ctx.createBiquadFilter();
    const midFilter = ctx.createBiquadFilter();
    const bodyFilter = ctx.createBiquadFilter();
    const saturator = ctx.createWaveShaper();

    fundamental.type = 'triangle';
    harmonic.type = 'sine';
    fundamental.frequency.setValueAtTime(frequency, time);
    harmonic.frequency.setValueAtTime(frequency * 2.02, time);
    fundamental.detune.setValueAtTime(-1, time);
    harmonic.detune.setValueAtTime(2, time);

    lowpassFilter.type = 'lowpass';
    lowpassFilter.frequency.setValueAtTime(2600, time);
    lowpassFilter.Q.value = 0.68;

    highpassFilter.type = 'highpass';
    highpassFilter.frequency.setValueAtTime(90, time);
    highpassFilter.Q.value = 0.32;

    midFilter.type = 'peaking';
    midFilter.frequency.setValueAtTime(1200, time);
    midFilter.Q.value = 0.9;
    midFilter.gain.value = 1.6;

    bodyFilter.type = 'peaking';
    bodyFilter.frequency.setValueAtTime(210, time);
    bodyFilter.Q.value = 0.72;
    bodyFilter.gain.value = 2.4;

    const curve = new Float32Array(256);
    for (let index = 0; index < curve.length; index += 1) {
      const sample = (index / (curve.length - 1)) * 2 - 1;
      curve[index] = Math.tanh(sample * 1.6);
    }
    saturator.curve = curve;
    saturator.oversample = '4x';

    masterGain.gain.setValueAtTime(0.0001, time);
    masterGain.gain.linearRampToValueAtTime(0.055 * volumeMultiplier, time + attackTime);
    masterGain.gain.exponentialRampToValueAtTime(0.022 * volumeMultiplier, time + 0.08);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, time + releaseTime);

    fundamental.connect(lowpassFilter);
    harmonic.connect(lowpassFilter);
    lowpassFilter.connect(highpassFilter);
    highpassFilter.connect(midFilter);
    midFilter.connect(bodyFilter);
    bodyFilter.connect(saturator);
    saturator.connect(masterGain);
    masterGain.connect(ctx.destination);

    fundamental.start(time);
    harmonic.start(time);
    fundamental.stop(time + releaseTime);
    harmonic.stop(time + releaseTime);

    const bufferSize = Math.floor(ctx.sampleRate * 0.035);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < bufferSize; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / bufferSize);
    }

    const pickNoise = ctx.createBufferSource();
    pickNoise.buffer = buffer;
    const pickFilter = ctx.createBiquadFilter();
    pickFilter.type = 'bandpass';
    pickFilter.frequency.setValueAtTime(1450, time);
    pickFilter.Q.value = 0.52;
    const pickHighpass = ctx.createBiquadFilter();
    pickHighpass.type = 'highpass';
    pickHighpass.frequency.setValueAtTime(480, time);
    const pickGain = ctx.createGain();
    pickGain.gain.setValueAtTime(0.004 * volumeMultiplier, time);
    pickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.018);

    pickNoise.connect(pickFilter);
    pickFilter.connect(pickHighpass);
    pickHighpass.connect(pickGain);
    pickGain.connect(ctx.destination);

    pickNoise.start(time);
    pickNoise.stop(time + 0.035);
  }, [getAudioCtx]);

  const playStrum = useCallback(async (direction: 'down' | 'up', time?: number, volumeMultiplier = 1) => {
    const ctx = await getAudioCtx();
    if (!ctx) return;
    const t = time ?? ctx.currentTime;
    const orderedFrequencies = direction === 'down' ? STRUM_FREQUENCIES : [...STRUM_FREQUENCIES].reverse();
    orderedFrequencies.forEach((frequency, index) => {
      const offset = index * 0.01;
      const stringVolume = volumeMultiplier * (1 - index * 0.035);
      void playStringPluck(frequency, t + offset, stringVolume);
    });
  }, [getAudioCtx, playStringPluck]);

  const playStepSound = useCallback(async (step: StrumStep) => {
    const ctx = await getAudioCtx();
    if (!ctx || step.symbol === '–') return;
    const time = ctx.currentTime;
    const volumeMultiplier = step.accent ? 1 : 0.78;

    if (step.symbol === '↓') {
      await playStrum('down', time, volumeMultiplier);
      return;
    }

    await playStrum('up', time, 0.92 * volumeMultiplier);
  }, [getAudioCtx, playStrum]);

  const registerMiss = useCallback((stepIndex: number) => {
    const step = selectedPattern.steps[stepIndex];
    if (!step || step.symbol === '–' || stepResolvedRef.current) return;

    stepResolvedRef.current = true;
    setFeedback(`Perdeu a batida ${step.symbol}. Respira e tenta acertar no próximo pulso.`);
    setStreak(0);
    setUserStrums((prev) => [...prev.slice(-11), { stepIndex, symbol: '↓', result: 'miss' }]);
  }, [selectedPattern.steps]);

  const runStep = useCallback((stepIndex: number) => {
    const step = selectedPattern.steps[stepIndex];
    currentStepRef.current = stepIndex;
    stepResolvedRef.current = step.symbol === '–';
    setCurrentStep(stepIndex);
    void playStepSound(step);

    if (missTimeoutRef.current) {
      window.clearTimeout(missTimeoutRef.current);
      missTimeoutRef.current = null;
    }

    if (currentPhase === 'PLAY' && step.symbol !== '–') {
      missTimeoutRef.current = window.setTimeout(() => registerMiss(stepIndex), Math.max(180, stepDuration * 0.78));
    }
  }, [currentPhase, playStepSound, registerMiss, selectedPattern.steps, stepDuration]);

  const startLoop = useCallback(() => {
    stopLoop();
    setIsLooping(true);
    let stepIndex = 0;
    runStep(stepIndex);

    loopIntervalRef.current = window.setInterval(() => {
      stepIndex = (stepIndex + 1) % selectedPattern.steps.length;
      if (stepIndex === 0) {
        setLoopsCompleted((prev) => prev + 1);
      }
      runStep(stepIndex);
    }, stepDuration);
  }, [runStep, selectedPattern.steps.length, stepDuration, stopLoop]);

  const resetSession = useCallback(() => {
    stopLoop();
    setCurrentPhase('LISTEN');
    setScore(0);
    setStreak(0);
    setLoopsCompleted(0);
    setUserStrums([]);
    setFeedback('Ouça a batida algumas vezes e deixe a mão entrar no balanço.');
  }, [stopLoop]);

  const adjustBpm = useCallback((delta: number) => {
    setCurrentBpm((prev) => Math.max(50, Math.min(160, prev + delta)));
  }, []);

  const resetBpm = useCallback(() => {
    setCurrentBpm(selectedPattern.bpm);
  }, [selectedPattern.bpm]);

  const advancePhase = useCallback(() => {
    if (currentPhase === 'LISTEN') {
      setCurrentPhase('UNDERSTAND');
      setFeedback('Agora acompanhe a contagem e veja onde entram as setas para baixo e para cima.');
      return;
    }

    if (currentPhase === 'UNDERSTAND') {
      setCurrentPhase('PLAY');
      setScore(0);
      setStreak(0);
      setLoopsCompleted(0);
      setUserStrums([]);
      setFeedback('Toque junto usando as setas do teclado ou os botões abaixo do padrão.');
    }
  }, [currentPhase]);

  const handleStrum = useCallback((symbol: Exclude<StrumSymbol, '–'>) => {
    if (currentPhase !== 'PLAY' || !isLooping || currentStepRef.current === null) return;

    void playStrum(symbol === '↓' ? 'down' : 'up', undefined, 0.82);

    const step = selectedPattern.steps[currentStepRef.current];
    if (!step || step.symbol === '–') {
      setFeedback('Nesse ponto havia pausa. Espere a próxima seta.');
      setStreak(0);
      setUserStrums((prev) => [...prev.slice(-11), { stepIndex: currentStepRef.current ?? 0, symbol, result: 'wrong' }]);
      return;
    }

    if (stepResolvedRef.current) return;

    if (step.symbol === symbol) {
      stepResolvedRef.current = true;
      const points = step.accent ? 18 : 12;
      const earnedXp = Math.max(1, Math.floor(points / 6));
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setXp(addTeensXp(earnedXp));
      setFeedback(`Boa! ${symbol} encaixou no pulso. +${points} pts · +${earnedXp} XP`);
      setUserStrums((prev) => [...prev.slice(-11), { stepIndex: currentStepRef.current ?? 0, symbol, result: 'perfect' }]);
      return;
    }

    stepResolvedRef.current = true;
    setStreak(0);
    setFeedback(`Quase. Aqui a direção esperada era ${step.symbol}.`);
    setUserStrums((prev) => [...prev.slice(-11), { stepIndex: currentStepRef.current ?? 0, symbol, result: 'wrong' }]);
  }, [currentPhase, isLooping, playStrum, selectedPattern.steps]);

  const getPhaseInstructions = () => {
    switch (currentPhase) {
      case 'LISTEN':
        return 'Ouça o loop e perceba a respiração da mão. Não pense só nas setas: sinta o fluxo do compasso.';
      case 'UNDERSTAND':
        return 'Leia a contagem e observe como as setas tradicionais de cifra se distribuem entre ataques e pausas.';
      case 'PLAY':
        return 'Toque junto usando ↓ e ↑. Você pode clicar nos botões ou usar as teclas ArrowDown e ArrowUp.';
      default:
        return '';
    }
  };

  useEffect(() => {
    setCurrentBpm(selectedPattern.bpm);
    resetSession();
  }, [resetSession, selectedPattern.bpm, selectedPatternId]);

  useEffect(() => () => stopLoop(), [stopLoop]);

  useEffect(() => {
    if (!isLooping) return;
    startLoop();
  }, [currentBpm, isLooping, startLoop]);

  useEffect(() => {
    if (currentPhase !== 'PLAY') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        handleStrum('↓');
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleStrum('↑');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPhase, handleStrum]);

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#050312] text-violet-50'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.18),transparent_45%)]" />

      <main className="relative mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-400">GA Teens</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Batidas Populares</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Aprenda batidas com setas tradicionais de cifra: OUVIR → ENTENDER → TOCAR
          </p>
        </header>

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-indigo-900/70 bg-zinc-950/75'}`}>
          <div className="grid gap-3 md:grid-cols-4">
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">Fase</p>
              <p className="mt-2 text-2xl font-black uppercase">{PHASE_LABELS[currentPhase]}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">Padrão</p>
              <p className="mt-2 text-2xl font-black">{selectedPattern.title}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">BPM / Compasso</p>
              <p className="mt-2 text-2xl font-black">{currentBpm} · {selectedPattern.meter}</p>
              <p className={`mt-1 text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Base: {selectedPattern.bpm} BPM
              </p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">Score / Streak</p>
              <p className="mt-2 text-2xl font-black">{score} pts · {streak}</p>
            </div>
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-white' : 'border-indigo-800/70 bg-zinc-900/60'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">Progressão</p>
                <p className={`mt-1 text-sm font-bold ${isLight ? 'text-slate-700' : 'text-zinc-200'}`}>
                  Faltam {rankProgress.next ? Math.max(0, rankProgress.next.minXp - xp) : 0} XP para {rankProgress.next?.label ?? 'Architect'}
                </p>
              </div>
              <p className="text-[11px] font-black uppercase">Rank: {rankProgress.current.label} · XP {xp}</p>
            </div>
            <div className={`mt-3 h-2 w-full rounded-full ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`}>
              <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 transition-all" style={{ width: `${rankProgress.percent}%` }} />
            </div>
          </div>

          <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
            {getPhaseInstructions()}
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-white' : 'border-indigo-800/70 bg-zinc-900/60'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">Velocidade</p>
                <p className={`mt-1 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                  Ajuste o BPM como num metrônomo para estudar mais lento ou mais rápido.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustBpm(-5)}
                  className={`rounded-xl border px-3 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-slate-50 text-slate-800 hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-cyan-500'}`}
                >
                  -5
                </button>
                <button
                  onClick={() => adjustBpm(-1)}
                  className={`rounded-xl border px-3 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-slate-50 text-slate-800 hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-cyan-500'}`}
                >
                  -1
                </button>
                <div className={`min-w-[88px] rounded-xl border px-3 py-2 text-center text-sm font-black ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'}`}>
                  {currentBpm} BPM
                </div>
                <button
                  onClick={() => adjustBpm(1)}
                  className={`rounded-xl border px-3 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-slate-50 text-slate-800 hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-cyan-500'}`}
                >
                  +1
                </button>
                <button
                  onClick={() => adjustBpm(5)}
                  className={`rounded-xl border px-3 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-slate-50 text-slate-800 hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-cyan-500'}`}
                >
                  +5
                </button>
                <button
                  onClick={resetBpm}
                  className={`rounded-xl border px-3 py-2 text-xs font-black uppercase ${isLight ? 'border-violet-300 bg-violet-50 text-violet-700 hover:border-violet-500' : 'border-violet-500/40 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20'}`}
                >
                  Base
                </button>
              </div>
            </div>
            <input
              type="range"
              min={50}
              max={160}
              step={1}
              value={currentBpm}
              onChange={(event) => setCurrentBpm(Number(event.target.value))}
              className="mt-4 w-full accent-cyan-500"
              aria-label="Controle de BPM"
            />
          </div>

          <div className={`mt-3 rounded-xl border px-4 py-3 text-sm font-black ${
            feedback.includes('Boa!')
              ? isLight ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : feedback.includes('Quase') || feedback.includes('Perdeu') || feedback.includes('pausa')
                ? isLight ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : isLight ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-blue-500/40 bg-blue-500/10 text-blue-300'
          }`}>
            {feedback}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex gap-2">
              {(['LISTEN', 'UNDERSTAND', 'PLAY'] as Phase[]).map((phase) => (
                <div
                  key={phase}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-black uppercase transition-all ${
                    currentPhase === phase
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                      : isLight
                        ? 'border-slate-300 bg-white text-slate-500'
                        : 'border-zinc-700 bg-zinc-950 text-zinc-500'
                  }`}
                >
                  {PHASE_LABELS[phase]}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={startLoop}
              className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-cyan-300 bg-cyan-50 text-cyan-800 hover:border-cyan-500' : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'}`}
            >
              Iniciar Loop
            </button>
            <button
              onClick={stopLoop}
              disabled={!isLooping}
              className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-orange-400 disabled:opacity-50' : 'border-zinc-700 bg-zinc-950 hover:border-orange-500 disabled:opacity-50'}`}
            >
              Parar Loop
            </button>
            {currentPhase !== 'PLAY' && (
              <button
                onClick={advancePhase}
                className="rounded-xl border border-violet-400 bg-violet-500/20 px-4 py-2 text-xs font-black uppercase text-violet-100 hover:bg-violet-500/30"
              >
                Avançar Fase →
              </button>
            )}
            <button
              onClick={resetSession}
              className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-red-400' : 'border-zinc-700 bg-zinc-950 hover:border-red-500'}`}
            >
              Reiniciar
            </button>
          </div>

          <div className={`mt-6 rounded-3xl border p-4 md:p-5 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-indigo-800/70 bg-zinc-900/60'}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">Levada Atual</p>
                <h2 className="mt-2 text-2xl font-black">{selectedPattern.title}</h2>
                <p className={`mt-2 max-w-2xl text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                  {selectedPattern.description}
                </p>
              </div>
              <div className={`rounded-2xl border px-4 py-3 text-sm font-black ${isLight ? 'border-violet-200 bg-white text-violet-700' : 'border-violet-500/30 bg-violet-500/10 text-violet-200'}`}>
                {selectedPattern.genre} · {selectedPattern.level}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950/80'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Padrão em setas</p>
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-8">
                  {selectedPattern.steps.map((step, index) => {
                    const isCurrent = currentStep === index;
                    return (
                      <div
                        key={`${selectedPattern.id}-${index}`}
                        className={`rounded-2xl border px-3 py-3 text-center transition-all ${
                          isCurrent
                            ? isLight
                              ? 'border-cyan-400 bg-cyan-50 shadow-[0_0_0_2px_rgba(34,211,238,0.12)]'
                              : 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(34,211,238,0.18)]'
                            : isLight
                              ? 'border-slate-200 bg-slate-50'
                              : 'border-zinc-800 bg-zinc-900/80'
                        }`}
                      >
                        <p className={`text-[10px] font-black uppercase ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>{step.count}</p>
                        <p className={`mt-2 text-3xl font-black ${step.symbol === '–' ? (isLight ? 'text-slate-300' : 'text-zinc-700') : isLight ? 'text-slate-900' : 'text-white'}`}>
                          {step.symbol}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950/80'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Leitura rápida</p>
                <p className={`mt-4 text-xl md:text-2xl font-black tracking-[0.18em] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedPattern.steps.map((step) => step.symbol).join(' ')}
                </p>
                <p className={`mt-4 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                  {selectedPattern.hint}
                </p>
                <div className={`mt-4 rounded-2xl border px-4 py-3 ${isLight ? 'border-violet-200 bg-violet-50' : 'border-violet-500/25 bg-violet-500/10'}`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Meta do ciclo</p>
                  <p className={`mt-2 text-sm font-bold ${isLight ? 'text-violet-800' : 'text-violet-100'}`}>
                    Acerte {attackSteps} ataques por loop. Loops completos: {loopsCompleted}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {currentPhase === 'PLAY' && (
            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950/80'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Tocar junto</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleStrum('↓')}
                    className={`min-w-[132px] rounded-2xl border px-5 py-4 text-3xl font-black transition-all ${isLight ? 'border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-500' : 'border-amber-500/50 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'}`}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleStrum('↑')}
                    className={`min-w-[132px] rounded-2xl border px-5 py-4 text-3xl font-black transition-all ${isLight ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:border-emerald-500' : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20'}`}
                  >
                    ↑
                  </button>
                </div>
                <p className={`mt-3 text-xs font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Atalho: use `ArrowDown` e `ArrowUp` no teclado.
                </p>
              </div>

              <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950/80'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Últimos ataques</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {userStrums.length === 0 && (
                    <p className={`text-sm font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      Comece o loop e toque junto para gerar feedback.
                    </p>
                  )}
                  {userStrums.slice(-10).map((strum, index) => (
                    <span
                      key={`${strum.stepIndex}-${index}`}
                      className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase ${
                        strum.result === 'perfect'
                          ? isLight ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                          : strum.result === 'wrong'
                            ? isLight ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                            : isLight ? 'border-red-300 bg-red-50 text-red-700' : 'border-red-500/40 bg-red-500/10 text-red-300'
                      }`}
                    >
                      {strum.result === 'miss' ? 'MISS' : `${strum.symbol} ${strum.result === 'perfect' ? 'OK' : 'OFF'}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => setSelectedPatternId(pattern.id)}
                className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                  selectedPatternId === pattern.id
                    ? isLight
                      ? 'border-cyan-400 bg-cyan-50 shadow-[0_0_0_2px_rgba(34,211,238,0.12)]'
                      : 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]'
                    : isLight
                      ? 'border-slate-200 bg-white hover:border-cyan-300'
                      : 'border-zinc-800 bg-zinc-950/70 hover:border-cyan-500/40'
                }`}
              >
                <p className="text-sm font-black uppercase">{pattern.title}</p>
                <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.16em] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {pattern.genre} · {pattern.steps.length} passos
                </p>
                <p className={`mt-3 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                  {pattern.steps.map((step) => step.symbol).join(' ')}
                </p>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => navigateTo('/teens')}
            className="rounded-xl border border-violet-500 bg-violet-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-violet-500"
          >
            Voltar ao Teens
          </button>
          <button
            onClick={() => navigateTo('/studio')}
            className="rounded-xl border border-cyan-500 bg-cyan-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-cyan-500"
          >
            Ir para Studio
          </button>
        </div>
      </main>
    </div>
  );
};

export default TeenBatidasPopularesPage;
