import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getTeensTheme } from '../utils/ecosystemPreferences';
import { addTeensXp, getRankProgress, getTeensXp } from '../utils/teenProgress';
import { sendFretboardIntent } from '../utils/sendFretboardIntent';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

type DrumHit = {
  kick: boolean;
  snare: boolean;
  hihatClosed: boolean;
  hihatOpen: boolean;
};

type RhythmPattern = {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  steps: number;
  pattern: DrumHit[];
};

const PATTERNS: RhythmPattern[] = [
  {
    id: 'pulse-1',
    title: 'Pulso Base',
    genre: 'Básico',
    bpm: 76,
    steps: 8,
    pattern: [
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: true },
    ],
  },
  {
    id: 'pulse-2',
    title: 'Pulso em Dupla',
    genre: 'Básico',
    bpm: 84,
    steps: 8,
    pattern: [
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
    ],
  },
  {
    id: 'pulse-3',
    title: 'Pulso Veloz',
    genre: 'Básico',
    bpm: 96,
    steps: 8,
    pattern: [
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: true },
    ],
  },
  {
    id: 'pulse-4',
    title: 'Pulso Cruzado',
    genre: 'Intermediário',
    bpm: 108,
    steps: 8,
    pattern: [
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: true },
    ],
  },
  {
    id: 'pulse-5',
    title: 'Rock Básico',
    genre: 'Rock',
    bpm: 92,
    steps: 8,
    pattern: [
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: true },
    ],
  },
  {
    id: 'pulse-6',
    title: 'Samba Levada',
    genre: 'Brasileiro',
    bpm: 88,
    steps: 8,
    pattern: [
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: false, hihatOpen: true },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
    ],
  },
  {
    id: 'pulse-7',
    title: 'Funk Groove',
    genre: 'Funk',
    bpm: 100,
    steps: 8,
    pattern: [
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: true },
      { kick: false, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: true },
    ],
  },
  {
    id: 'pulse-8',
    title: 'Reggae',
    genre: 'Reggae',
    bpm: 78,
    steps: 8,
    pattern: [
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: false, hihatOpen: true },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: false, hihatOpen: true },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: false, hihatOpen: true },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: false, hihatOpen: true },
    ],
  },
  {
    id: 'pulse-9',
    title: 'Gallop Metal',
    genre: 'Metal',
    bpm: 120,
    steps: 8,
    pattern: [
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: true },
    ],
  },
  {
    id: 'pulse-10',
    title: 'Blues Shuffle',
    genre: 'Blues',
    bpm: 84,
    steps: 12,
    pattern: [
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: true },
      { kick: true, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
    ],
  },
  {
    id: 'pulse-11',
    title: 'Bossa Nova',
    genre: 'Brasileiro',
    bpm: 96,
    steps: 8,
    pattern: [
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: false, hihatOpen: true },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: true },
    ],
  },
  {
    id: 'pulse-12',
    title: 'Ska Upstroke',
    genre: 'Ska',
    bpm: 110,
    steps: 8,
    pattern: [
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: false, hihatOpen: true },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: false, hihatOpen: true },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: false, hihatOpen: true },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: false, hihatOpen: true },
    ],
  },
  {
    id: 'pulse-13',
    title: 'Valsa 3/4',
    genre: 'Valsa',
    bpm: 90,
    steps: 6,
    pattern: [
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: false, hihatOpen: true },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: false, hihatOpen: true },
    ],
  },
  {
    id: 'pulse-14',
    title: 'Syncopated',
    genre: 'Avançado',
    bpm: 104,
    steps: 10,
    pattern: [
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: false, hihatOpen: true },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: true },
    ],
  },
  {
    id: 'pulse-15',
    title: 'Hardcore Punk',
    genre: 'Punk',
    bpm: 140,
    steps: 8,
    pattern: [
      { kick: true, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
    ],
  },
  {
    id: 'pulse-16',
    title: 'Odd Time 5/4',
    genre: 'Avançado',
    bpm: 88,
    steps: 10,
    pattern: [
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: true, hihatClosed: false, hihatOpen: true },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: true, hihatClosed: true, hihatOpen: false },
      { kick: true, snare: false, hihatClosed: true, hihatOpen: false },
      { kick: false, snare: false, hihatClosed: false, hihatOpen: true },
    ],
  },
];

type Phase = 'LISTEN' | 'UNDERSTAND' | 'REPRODUCE';

type UserHit = {
  stepIndex: number;
  timestamp: number;
  accuracy: 'perfect' | 'good' | 'ok' | 'miss';
};

type LaneType = 'kick' | 'snare';

type FallingBeat = {
  id: string;
  lane: LaneType;
  stepIndex: number;
  spawnTime: number;
  targetTime: number;
  position: number;
  hit: boolean;
  accuracy?: 'perfect' | 'early' | 'late' | 'miss';
};

const LANES: Array<{
  type: LaneType;
  label: string;
  key: string;
  color: string;
  shadowColor: string;
  borderColor: string;
  hitEffectColor: string;
}> = [
  {
    type: 'kick',
    label: 'KICK',
    key: 'A',
    color: 'bg-red-500',
    shadowColor: 'shadow-[0_0_20px_rgba(239,68,68,0.8)]',
    borderColor: 'border-red-300',
    hitEffectColor: 'bg-red-400/60',
  },
  {
    type: 'snare',
    label: 'SNARE',
    key: 'S',
    color: 'bg-blue-500',
    shadowColor: 'shadow-[0_0_20px_rgba(59,130,246,0.8)]',
    borderColor: 'border-blue-300',
    hitEffectColor: 'bg-blue-400/60',
  },
];

const TeenRhythmLabPage: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [selectedPatternId, setSelectedPatternId] = useState(PATTERNS[0].id);
  const [currentPhase, setCurrentPhase] = useState<Phase>('LISTEN');
  const [isLooping, setIsLooping] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [userHits, setUserHits] = useState<UserHit[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState<number>(() => getTeensXp());
  const [expectedNextBeat, setExpectedNextBeat] = useState(0);
  const [timingModeActive, setTimingModeActive] = useState(false);
  const [completedLoops, setCompletedLoops] = useState(0);
  const [feedback, setFeedback] = useState('Clique nos tempos do compasso.');
  const [loopProgress, setLoopProgress] = useState(0);
  const [fallingBeats, setFallingBeats] = useState<FallingBeat[]>([]);
  const [hitEffects, setHitEffects] = useState<Record<LaneType, boolean>>({
    kick: false,
    snare: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const loopIntervalRef = useRef<number | null>(null);
  const currentStepTimeRef = useRef<number>(0);
  const currentStepIndexRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const beatSpawnIntervalRef = useRef<number | null>(null);

  // Refs para values frescos sem causar re-renders
  const fallingBeatsRef = useRef<FallingBeat[]>([]);
  const currentPhaseRef = useRef<Phase>(currentPhase);
  const isLoopingRef = useRef<boolean>(isLooping);

  const isLight = theme === 'light';
  const selectedPattern = useMemo(() => PATTERNS.find((p) => p.id === selectedPatternId) ?? PATTERNS[0], [selectedPatternId]);
  const rankProgress = getRankProgress(xp);

  // Extrair beats principais (onde cai o kick) para interface simplificada
  const mainBeats = useMemo(() => {
    return selectedPattern.pattern
      .map((hit, idx) => (hit.kick ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [selectedPattern]);

  const timeSignature = useMemo(() => {
    if (selectedPattern.steps === 6) return '3/4';
    if (selectedPattern.steps === 10 && selectedPattern.id === 'pulse-16') return '5/4';
    return '4/4';
  }, [selectedPattern]);

  const travelTimeMs = useMemo(() => {
    return Math.max(1500, (60 / selectedPattern.bpm) * 4 * 1000);
  }, [selectedPattern.bpm]);

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? '#cbd5e1' : '#1e1b4b'} 1px, transparent 1px)`,
    backgroundSize: '100% 30px',
  };

  const getAudioCtx = useCallback(async () => {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    return audioContextRef.current;
  }, []);

  const playKick = useCallback(async (time?: number, userTriggered = false) => {
    const ctx = await getAudioCtx();
    if (!ctx) return;
    const t = time ?? ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);

    const volume = userTriggered ? 0.05 : 1;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }, [getAudioCtx]);

  const playSnare = useCallback(async (time?: number, userTriggered = false) => {
    const ctx = await getAudioCtx();
    if (!ctx) return;
    const t = time ?? ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const volumeMultiplier = userTriggered ? 0.05 : 1;
    const noiseEnvelope = ctx.createGain();
    noiseEnvelope.gain.setValueAtTime(volumeMultiplier, t);
    noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseEnvelope);
    noiseEnvelope.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + 0.2);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 180;
    oscGain.gain.setValueAtTime(0.7 * volumeMultiplier, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }, [getAudioCtx]);

  const playHiHatClosed = useCallback(async (time?: number) => {
    const ctx = await getAudioCtx();
    if (!ctx) return;
    const t = time ?? ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.3, t);
    envelope.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + 0.05);
  }, [getAudioCtx]);

  const playHiHatOpen = useCallback(async (time?: number) => {
    const ctx = await getAudioCtx();
    if (!ctx) return;
    const t = time ?? ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.4, t);
    envelope.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + 0.3);
  }, [getAudioCtx]);

  const playStep = useCallback(async (hit: DrumHit, time?: number) => {
    if (hit.kick) await playKick(time);
    if (hit.snare) await playSnare(time);
    if (hit.hihatClosed) await playHiHatClosed(time);
    if (hit.hihatOpen) await playHiHatOpen(time);
  }, [playKick, playSnare, playHiHatClosed, playHiHatOpen]);

  const startLoop = useCallback(async () => {
    const ctx = await getAudioCtx();
    if (!ctx) return;

    setIsLooping(true);
    setCurrentStep(null);

    const stepDuration = (60 / selectedPattern.bpm / (selectedPattern.steps / 4));
    let stepIndex = 0;

    currentStepTimeRef.current = ctx.currentTime;

    const scheduleNextStep = () => {
      currentStepTimeRef.current = ctx.currentTime;
      currentStepIndexRef.current = stepIndex;

      const hit = selectedPattern.pattern[stepIndex];
      void playStep(hit, currentStepTimeRef.current);

      setCurrentStep(stepIndex);
      setLoopProgress((stepIndex / selectedPattern.steps) * 100);

      const callbackTime = (currentStepTimeRef.current - ctx.currentTime) * 1000;
      setTimeout(() => setCurrentStep(null), Math.max(0, callbackTime + 80));

      stepIndex = (stepIndex + 1) % selectedPattern.steps;
    };

    scheduleNextStep();
    const interval = window.setInterval(scheduleNextStep, stepDuration * 1000);
    loopIntervalRef.current = interval;
  }, [getAudioCtx, selectedPattern, playStep]);

  const stopLoop = useCallback(() => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
    if (beatSpawnIntervalRef.current) {
      clearInterval(beatSpawnIntervalRef.current);
      beatSpawnIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsLooping(false);
    setCurrentStep(null);
    setFallingBeats([]);
  }, []);

  const spawnBeatsForStep = useCallback(async (stepIndex: number) => {
    const ctx = await getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const hit = selectedPattern.pattern[stepIndex];

    // Spawn KICK
    if (hit.kick) {
      const beat: FallingBeat = {
        id: `kick-${now}-${stepIndex}`,
        lane: 'kick',
        stepIndex,
        spawnTime: now,
        targetTime: now + travelTimeMs / 1000,
        position: 0,
        hit: false,
      };
      setFallingBeats((prev) => [...prev, beat]);
    }

    // Spawn SNARE
    if (hit.snare) {
      const beat: FallingBeat = {
        id: `snare-${now}-${stepIndex}`,
        lane: 'snare',
        stepIndex,
        spawnTime: now,
        targetTime: now + travelTimeMs / 1000,
        position: 0,
        hit: false,
      };
      setFallingBeats((prev) => [...prev, beat]);
    }
  }, [getAudioCtx, selectedPattern, travelTimeMs]);

  const handleLaneHit = useCallback(async (lane: LaneType) => {
    if (currentPhaseRef.current !== 'REPRODUCE' || !isLoopingRef.current) return;

    const ctx = await getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Procurar beat da trilha específica na hit zone (recalibrado para 75% - linha visual)
    const candidate = fallingBeatsRef.current
      .filter((b) => !b.hit && b.lane === lane && b.position >= 65 && b.position <= 85)
      .sort((a, b) => Math.abs(75 - a.position) - Math.abs(75 - b.position))[0];

    if (!candidate) return;

    const timeDiff = Math.abs(now - candidate.targetTime) * 1000;
    const isEarly = now < candidate.targetTime;

    let accuracy: 'perfect' | 'early' | 'late';
    let points = 0;
    let feedbackText = '';

    if (timeDiff < 300) {
      accuracy = 'perfect';
      points = 20;
      setStreak((v) => v + 1);
      feedbackText = '🎯 NO TEMPO!';
    } else if (timeDiff < 600) {
      accuracy = isEarly ? 'early' : 'late';
      points = 15;
      setStreak((v) => v + 1);
      feedbackText = isEarly ? '⚡ Adiantado' : '🐌 Atrasado';
    } else {
      accuracy = isEarly ? 'early' : 'late';
      points = 5;
      setStreak((v) => v + 1);
      feedbackText = isEarly ? '⚡ Muito adiantado' : '🐌 Muito atrasado';
    }

    // Tocar som do instrumento específico (volume reduzido para não interferir no loop)
    if (lane === 'kick') await playKick(undefined, true);
    if (lane === 'snare') await playSnare(undefined, true);

    // Marcar como hit
    setFallingBeats((prev) =>
      prev.map((b) => (b.id === candidate.id ? { ...b, hit: true, accuracy } : b))
    );

    // Trigger hit effect na trilha específica
    setHitEffects((prev) => ({ ...prev, [lane]: true }));
    setTimeout(() => {
      setHitEffects((prev) => ({ ...prev, [lane]: false }));
    }, 300);

    setFeedback(`${feedbackText} +${points} pts`);
    setUserHits((prev) => [...prev, { stepIndex: candidate.stepIndex, timestamp: now, accuracy: accuracy as any }]);
    setScore((v) => v + points);

    if (points > 0) {
      const earnedXp = Math.floor(points / 2);
      setXp(addTeensXp(earnedXp));
    }
  }, [getAudioCtx, playKick, playSnare]);

  const resetSession = useCallback(() => {
    stopLoop();
    setCurrentPhase('LISTEN');
    setUserHits([]);
    setScore(0);
    setExpectedNextBeat(0);
    setTimingModeActive(false);
    setCompletedLoops(0);
    setLoopProgress(0);
    setFeedback('Clique nos tempos do compasso.');
  }, [stopLoop]);

  const advancePhase = useCallback(() => {
    if (currentPhase === 'LISTEN') {
      setCurrentPhase('UNDERSTAND');
      setFeedback('Observe a grade DAW e veja como os instrumentos se combinam.');
    } else if (currentPhase === 'UNDERSTAND') {
      setCurrentPhase('REPRODUCE');
      setUserHits([]);
      setScore(0);
      setExpectedNextBeat(0);
      setTimingModeActive(false);
      setCompletedLoops(0);
      setLoopProgress(0);
      setFeedback('Clique nos tempos do compasso.');
    }
  }, [currentPhase]);

  // Manter refs sincronizadas
  useEffect(() => {
    fallingBeatsRef.current = fallingBeats;
  }, [fallingBeats]);

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  // Animação dos beats caindo
  useEffect(() => {
    if (currentPhase !== 'REPRODUCE' || !isLooping) return;

    const animate = async () => {
      const ctx = await getAudioCtx();
      if (!ctx) return;

      const now = ctx.currentTime;

      setFallingBeats((prev) =>
        prev
          .map((beat) => {
            const elapsed = now - beat.spawnTime;
            const progress = Math.min(120, (elapsed / (travelTimeMs / 1000)) * 100);
            return { ...beat, position: progress };
          })
          .filter((beat) => {
            // Remover beats que passaram da tela (miss se não foi clicado)
            if (beat.position > 110) {
              if (!beat.hit) {
                setStreak(0);
              }
              return false;
            }
            return true;
          })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentPhase, isLooping, getAudioCtx, travelTimeMs]);

  // Spawn de beats sincronizado com BPM (percorre todos os steps do pattern)
  useEffect(() => {
    if (currentPhase !== 'REPRODUCE' || !isLooping) return;

    const stepDuration = ((60 / selectedPattern.bpm) * 1000) / (selectedPattern.steps / 4);
    let stepIndex = 0;

    const spawnLoop = window.setInterval(() => {
      void spawnBeatsForStep(stepIndex);
      stepIndex = (stepIndex + 1) % selectedPattern.steps;
    }, stepDuration);

    beatSpawnIntervalRef.current = spawnLoop;

    return () => {
      if (beatSpawnIntervalRef.current) {
        clearInterval(beatSpawnIntervalRef.current);
      }
    };
  }, [currentPhase, isLooping, selectedPattern, spawnBeatsForStep]);

  // Listener de teclado (A para KICK, S para SNARE)
  useEffect(() => {
    if (currentPhase !== 'REPRODUCE') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        void handleLaneHit('kick');
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        void handleLaneHit('snare');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPhase, handleLaneHit]);

  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  const getPhaseInstructions = () => {
    switch (currentPhase) {
      case 'LISTEN':
        return 'Ouça o padrão em loop quantas vezes precisar. Quando se sentir pronto, avance para entender a estrutura.';
      case 'UNDERSTAND':
        return 'Veja a grade mostrando cada instrumento. Observe como kick, snare e hi-hat se combinam no tempo.';
      case 'REPRODUCE':
        if (timingModeActive) {
          return '🔥 MODO TIMING ATIVO! Clique nos tempos do compasso COM precisão. No tempo = ±300ms.';
        }
        return `Clique nos ${mainBeats.length} tempos do compasso na ordem certa. Após 1 loop completo, o modo timing será ativado!`;
      default:
        return '';
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-[#02030a] text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.14),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.16),transparent_48%)]" />

      <main className="relative mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-400">GA Teens</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Rhythm Lab</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Sistema de aprendizado em 3 fases: OUVIR → ENTENDER → REPRODUZIR
          </p>
        </header>

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-indigo-900/70 bg-zinc-950/75'}`}>
          <div className="grid gap-3 md:grid-cols-4">
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Fase</p>
              <p className="mt-1 text-lg font-black">{currentPhase}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Padrão</p>
              <p className="mt-1 text-lg font-black">{selectedPattern.title}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">BPM / Compasso</p>
              <p className="mt-1 text-lg font-black">{selectedPattern.bpm} · {timeSignature}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Score / Streak</p>
              <p className="mt-1 text-lg font-black">{score} pts · {streak}</p>
            </div>
          </div>

          <div className={`mt-3 rounded-xl border px-4 py-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Progressão</p>
              <p className="text-xs font-black uppercase">
                Rank: <span className={rankProgress.current.accentClass}>{rankProgress.current.label}</span> · XP {xp}
              </p>
            </div>
            <div className={`mt-2 h-2 w-full rounded-full ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`}>
              <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 transition-all" style={{ width: `${rankProgress.percent}%` }} />
            </div>
            {rankProgress.next && (
              <p className={`mt-2 text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                Falta {Math.max(0, rankProgress.next.minXp - xp)} XP para {rankProgress.next.label}.
              </p>
            )}
          </div>

          <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
            {getPhaseInstructions()}
          </div>

          {currentPhase === 'REPRODUCE' && (
            <div className={`mt-3 rounded-xl border px-4 py-3 text-sm font-black ${
              feedback.includes('❌')
                ? isLight ? 'border-red-300 bg-red-50 text-red-800' : 'border-red-500/40 bg-red-500/10 text-red-300'
                : feedback.includes('PERFECT')
                  ? isLight ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : feedback.includes('MODO TIMING')
                    ? isLight ? 'border-orange-300 bg-orange-50 text-orange-800' : 'border-orange-500/40 bg-orange-500/10 text-orange-300'
                    : isLight ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-blue-500/40 bg-blue-500/10 text-blue-300'
            }`}>
              {feedback}
            </div>
          )}

          {currentPhase === 'REPRODUCE' && completedLoops > 0 && (
            <div className={`mt-3 rounded-xl border px-4 py-3 ${isLight ? 'border-violet-200 bg-violet-50' : 'border-violet-500/30 bg-violet-500/10'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">Progresso</p>
              <p className={`mt-1 text-sm font-bold ${isLight ? 'text-violet-800' : 'text-violet-200'}`}>
                Loops completados: {completedLoops} · Modo Timing: {timingModeActive ? '✅ ATIVO' : '⏳ Aguardando'}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <div className="flex gap-2">
              {(['LISTEN', 'UNDERSTAND', 'REPRODUCE'] as Phase[]).map((phase) => (
                <div
                  key={phase}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-black uppercase transition-all ${
                    currentPhase === phase
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                      : isLight
                        ? 'border-slate-300 bg-white text-slate-500'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-500'
                  }`}
                >
                  {phase}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => void startLoop()}
              disabled={isLooping}
              className="rounded-xl border border-cyan-400 bg-cyan-500/20 px-4 py-2 text-xs font-black uppercase text-cyan-100 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLooping ? 'Tocando...' : 'Iniciar Loop'}
            </button>
            <button
              onClick={stopLoop}
              disabled={!isLooping}
              className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-orange-400 disabled:opacity-50' : 'border-zinc-700 bg-zinc-950 hover:border-orange-500 disabled:opacity-50'}`}
            >
              Parar Loop
            </button>
            {currentPhase !== 'REPRODUCE' && (
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

          {currentPhase === 'UNDERSTAND' && (
            <div className="mt-6">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400 mb-3">Grade DAW - Visualização</p>
              <div className="space-y-2">
                {[
                  { label: 'KICK', key: 'kick' as keyof DrumHit, color: isLight ? 'bg-red-500' : 'bg-red-600' },
                  { label: 'SNARE', key: 'snare' as keyof DrumHit, color: isLight ? 'bg-blue-500' : 'bg-blue-600' },
                  { label: 'HI-HAT', key: 'hihatClosed' as keyof DrumHit, color: isLight ? 'bg-amber-500' : 'bg-amber-600' },
                ].map((instrument) => (
                  <div key={instrument.label} className="flex items-center gap-2">
                    <div className={`w-16 text-[10px] font-black uppercase ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      {instrument.label}
                    </div>
                    <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${selectedPattern.steps}, minmax(0, 1fr))` }}>
                      {selectedPattern.pattern.map((hit, idx) => {
                        const isActive = hit[instrument.key];
                        const isCurrent = currentStep === idx;

                        return (
                          <div
                            key={idx}
                            className={`h-10 rounded-lg border transition-all ${
                              isCurrent && isActive
                                ? `${instrument.color} border-white/50 shadow-[0_0_16px_rgba(255,255,255,0.6)] scale-105`
                                : isActive
                                  ? `${instrument.color} border-transparent opacity-70`
                                  : isLight
                                    ? 'bg-slate-100 border-slate-200'
                                    : 'bg-zinc-900 border-zinc-800'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                {selectedPattern.pattern.some((hit) => hit.hihatOpen) && (
                  <div className="flex items-center gap-2">
                    <div className={`w-16 text-[10px] font-black uppercase ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      HH OPEN
                    </div>
                    <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${selectedPattern.steps}, minmax(0, 1fr))` }}>
                      {selectedPattern.pattern.map((hit, idx) => {
                        const isActive = hit.hihatOpen;
                        const isCurrent = currentStep === idx;

                        return (
                          <div
                            key={idx}
                            className={`h-10 rounded-lg border transition-all ${
                              isCurrent && isActive
                                ? 'bg-yellow-400 border-white/50 shadow-[0_0_16px_rgba(255,255,255,0.6)] scale-105'
                                : isActive
                                  ? 'bg-yellow-500 border-transparent opacity-70'
                                  : isLight
                                    ? 'bg-slate-100 border-slate-200'
                                    : 'bg-zinc-900 border-zinc-800'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentPhase === 'REPRODUCE' && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-6 px-4">
                <div className={`text-2xl font-black ${isLight ? 'text-slate-800' : 'text-zinc-100'}`}>
                  Score: {score}
                </div>
                {streak >= 5 && (
                  <div className="text-3xl font-black text-orange-400 animate-pulse">
                    🔥 {streak}x
                  </div>
                )}
                {streak < 5 && streak > 0 && (
                  <div className={`text-xl font-black ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    Streak: {streak}
                  </div>
                )}
              </div>

              {/* Container das 2 trilhas com linha de acerto */}
              <div className="relative flex justify-center gap-8 md:gap-12">
                {LANES.map((lane) => (
                  <div
                    key={lane.type}
                    className="relative h-[500px] w-28 md:w-36 cursor-pointer"
                    onClick={() => void handleLaneHit(lane.type)}
                  >
                    {/* Label da trilha */}
                    <div className={`text-center mb-2 text-sm font-black ${
                      isLight ? 'text-slate-700' : 'text-zinc-300'
                    }`}>
                      {lane.label}
                      <div className="text-[11px] opacity-70 mt-1">({lane.key})</div>
                    </div>

                    {/* Trilha de fundo */}
                    <div className={`absolute inset-0 top-10 bg-gradient-to-b ${
                      isLight
                        ? 'from-transparent via-slate-200/20 to-transparent'
                        : 'from-transparent via-zinc-900/30 to-transparent'
                    } border-x-2 ${lane.borderColor}/30`} />

                    {/* Beats caindo nesta trilha */}
                    {fallingBeats
                      .filter((beat) => beat.lane === lane.type)
                      .map((beat) => (
                        <div
                          key={beat.id}
                          className={`absolute left-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full transition-all pointer-events-none ${
                            lane.color
                          } ${lane.shadowColor} border-2 ${lane.borderColor} ${
                            beat.hit ? 'opacity-0 scale-150' : ''
                          }`}
                          style={{
                            top: `${beat.position}%`,
                            transform: 'translateX(-50%)',
                            transition: beat.hit ? 'all 0.2s ease-out' : 'none',
                          }}
                        />
                      ))}

                    {/* Efeito de hit individual por trilha - fixo na linha de acerto (75%) */}
                    {hitEffects[lane.type] && (
                      <div
                        className={`absolute inset-x-0 h-16 animate-ping ${lane.hitEffectColor}`}
                        style={{
                          top: '75%',
                          transform: 'translateY(-50%)',
                          animationDuration: '0.3s'
                        }}
                      />
                    )}
                  </div>
                ))}

                {/* Linha de acerto unificada a 75% da altura - dentro do container */}
                <div className="absolute inset-x-0 pointer-events-none" style={{ top: '75%', transform: 'translateY(-50%)' }}>
                  {/* Zona de tolerância (fundo sombreado) */}
                  <div className={`absolute inset-x-0 h-20 ${
                    isLight ? 'bg-cyan-200/20' : 'bg-cyan-900/20'
                  } blur-sm -translate-y-1/2`} style={{ top: '50%' }} />

                  {/* Linha principal de acerto - atravessa as 2 trilhas */}
                  <div className="relative h-20">
                    {/* Borda superior brilhante */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,1)]" />

                    {/* Zona central de hit - destaque forte */}
                    <div className={`absolute top-0 inset-x-0 h-20 border-y-4 ${
                      isLight
                        ? 'border-cyan-400 bg-gradient-to-b from-cyan-100/40 via-white/50 to-cyan-100/40'
                        : 'border-cyan-400 bg-gradient-to-b from-cyan-500/30 via-cyan-400/40 to-cyan-500/30'
                    } shadow-[0_0_24px_rgba(34,211,238,0.8)]`} />

                    {/* Linha central exata (75% position = timing perfeito) */}
                    <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-1 bg-white shadow-[0_0_16px_rgba(255,255,255,1)] animate-pulse"
                         style={{ animationDuration: '1.5s' }} />

                    {/* Borda inferior brilhante */}
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,1)]" />
                  </div>

                  {/* Labels HIT ZONE nas extremidades */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-4 px-2 py-1 rounded text-[10px] font-black bg-cyan-500 text-white shadow-lg">
                    HIT
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 px-2 py-1 rounded text-[10px] font-black bg-cyan-500 text-white shadow-lg">
                    ZONE
                  </div>
                </div>
              </div>

              {/* Botões mobile - apenas em telas pequenas */}
              <div className="flex gap-4 justify-center mt-8 md:hidden">
                <button
                  onClick={() => void handleLaneHit('kick')}
                  className={`flex-1 max-w-[140px] h-20 rounded-2xl border-4 font-black text-xl uppercase transition-transform active:scale-95 ${
                    isLight
                      ? 'border-red-400 bg-red-500 text-white shadow-lg'
                      : 'border-red-400 bg-red-600 text-white shadow-lg'
                  }`}
                >
                  KICK
                </button>

                <button
                  onClick={() => void handleLaneHit('snare')}
                  className={`flex-1 max-w-[140px] h-20 rounded-2xl border-4 font-black text-xl uppercase transition-transform active:scale-95 ${
                    isLight
                      ? 'border-blue-400 bg-blue-500 text-white shadow-lg'
                      : 'border-blue-400 bg-blue-600 text-white shadow-lg'
                  }`}
                >
                  SNARE
                </button>
              </div>

              {/* Instruções adaptativas */}
              <div className={`text-center mt-6 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                <span className="hidden md:inline">
                  Teclas: <span className="text-red-400">[A]</span> Kick · <span className="text-blue-400">[S]</span> Snare
                  <div className="text-xs opacity-70 mt-1">ou clique nas trilhas</div>
                </span>
                <span className="md:hidden">
                  Toque nos botões abaixo ou clique nas trilhas
                </span>
              </div>

              {/* Últimos hits */}
              {userHits.length > 0 && (
                <div className={`mt-6 rounded-xl border px-4 py-3 ${isLight ? 'border-emerald-200 bg-emerald-50' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-400 mb-2">Últimos Hits</p>
                  <div className="flex flex-wrap gap-2">
                    {userHits.slice(-10).map((hit, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                          hit.accuracy === 'perfect'
                            ? 'bg-emerald-500 text-white'
                            : hit.accuracy === 'good' || hit.accuracy === 'ok'
                              ? 'bg-amber-500 text-white'
                              : 'bg-red-500 text-white'
                        }`}
                      >
                        {hit.accuracy === 'perfect' ? '✓' : hit.accuracy === 'good' || hit.accuracy === 'ok' ? '~' : '✗'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentPhase === 'REPRODUCE' && userHits.length > 0 && (
            <div className={`mt-5 rounded-xl border px-4 py-3 ${isLight ? 'border-emerald-200 bg-emerald-50' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-400 mb-2">Últimos Hits</p>
              <div className="flex flex-wrap gap-2">
                {userHits.slice(-10).map((hit, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                      hit.accuracy === 'perfect'
                        ? 'bg-emerald-500 text-white'
                        : hit.accuracy === 'good'
                          ? 'bg-blue-500 text-white'
                          : hit.accuracy === 'ok'
                            ? 'bg-amber-500 text-white'
                            : 'bg-red-500 text-white'
                    }`}
                  >
                    {hit.accuracy}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
            {PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => {
                  setSelectedPatternId(pattern.id);
                  resetSession();
                }}
                className={`rounded-xl border px-3 py-3 text-left transition-all ${
                  selectedPatternId === pattern.id
                    ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-300/40'
                    : isLight
                      ? 'border-slate-300 bg-white hover:border-cyan-400'
                      : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'
                }`}
              >
                <p className="text-sm font-black uppercase">{pattern.title}</p>
                <p className="mt-1 text-[10px] font-black opacity-70 uppercase">{pattern.genre} · {pattern.steps} steps</p>
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
            onClick={() => sendFretboardIntent({
              source: 'teens-rhythm',
              action: 'showScale',
              root: 'C',
              scaleType: 'Major (Ionian)',
              instruction: {
                title: 'Ritmo no Braço',
                description: 'Aplique o pulso que você treinou tocando as notas desta escala no tempo certo.',
                persistent: true,
              },
            })}
            className="rounded-xl border border-cyan-500 bg-cyan-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-cyan-500"
          >
            Ir para Studio
          </button>
        </div>
      </main>
    </div>
  );
};

export default TeenRhythmLabPage;
