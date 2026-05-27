import React, { useMemo, useRef, useState } from 'react';
import { getTeensTheme } from '../utils/ecosystemPreferences';
import { addTeensXp, getRankProgress, getTeensXp } from '../utils/teenProgress';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

type RhythmPattern = {
  id: string;
  title: string;
  bpm: number;
  beats: number[];
};

const PATTERNS: RhythmPattern[] = [
  { id: 'pulse-1', title: 'Pulso Base', bpm: 76, beats: [1, 0, 1, 0] },
  { id: 'pulse-2', title: 'Pulso em Dupla', bpm: 84, beats: [1, 1, 0, 1] },
  { id: 'pulse-3', title: 'Pulso Veloz', bpm: 96, beats: [1, 0, 1, 1, 0, 1] },
  { id: 'pulse-4', title: 'Pulso Cruzado', bpm: 108, beats: [1, 0, 0, 1, 1, 0, 1, 0] },
];

const TeenRhythmLabPage: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [selectedPatternId, setSelectedPatternId] = useState(PATTERNS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBeatIndex, setActiveBeatIndex] = useState<number | null>(null);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('Escolha um pulso e toque em Ouvir padrão.');
  const [combo, setCombo] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState<number>(() => getTeensXp());

  const audioContextRef = useRef<AudioContext | null>(null);
  const playTokenRef = useRef(0);

  const isLight = theme === 'light';
  const selectedPattern = useMemo(() => PATTERNS.find((p) => p.id === selectedPatternId) ?? PATTERNS[0], [selectedPatternId]);
  const rankProgress = getRankProgress(xp);

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? '#cbd5e1' : '#1e1b4b'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#cbd5e1' : '#1e1b4b'} 1px, transparent 1px)`,
    backgroundSize: '30px 30px',
  };

  const getAudioCtx = async () => {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    return audioContextRef.current;
  };

  const playClick = async (strong: boolean) => {
    const ctx = await getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = strong ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(strong ? 880 : 520, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  };

  const playPattern = async () => {
    const token = playTokenRef.current + 1;
    playTokenRef.current = token;
    setIsPlaying(true);
    setActiveBeatIndex(null);

    const beatMs = Math.max(220, Math.round((60 / selectedPattern.bpm) * 1000));

    for (let i = 0; i < selectedPattern.beats.length; i += 1) {
      if (playTokenRef.current !== token) break;
      setActiveBeatIndex(i);
      await playClick(selectedPattern.beats[i] === 1);
      await new Promise((resolve) => window.setTimeout(resolve, beatMs));
      setActiveBeatIndex(null);
      await new Promise((resolve) => window.setTimeout(resolve, 60));
    }

    if (playTokenRef.current === token) {
      setIsPlaying(false);
      setFeedback('Sua vez! Repita o pulso clicando nos blocos ativos.');
      setUserInput([]);
    }
  };

  const handleTapBeat = async (idx: number) => {
    if (isPlaying) return;

    const expected = selectedPattern.beats[userInput.length] ?? 0;
    const tapped = idx === 1 ? 1 : 0;

    await playClick(tapped === 1);

    const next = [...userInput, tapped];
    setUserInput(next);

    if (tapped !== expected) {
      setCombo(0);
      setFeedback('Quase! Ouça de novo e tente repetir o padrão.');
      return;
    }

    if (next.length === selectedPattern.beats.length) {
      const earnedXp = selectedPattern.beats.length >= 8 ? 20 : selectedPattern.beats.length >= 6 ? 16 : 12;
      const nextXp = addTeensXp(earnedXp);
      setCombo((v) => v + 1);
      setStreak((v) => v + 1);
      setXp(nextXp);
      setFeedback('Excelente timing! Pulso concluído.');
      return;
    }

    setFeedback('Boa! Continue no tempo...');
  };

  const resetTry = () => {
    setUserInput([]);
    setFeedback('Tentativa limpa. Toque em Ouvir padrão para recomeçar.');
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-[#02030a] text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.14),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.16),transparent_48%)]" />

      <main className="relative mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-400">GA Teens</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Rhythm Lab</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Treine pulsos, timing e memória rítmica em desafios curtos.
          </p>
        </header>

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-indigo-900/70 bg-zinc-950/75'}`}>
          <div className="grid gap-3 md:grid-cols-3">
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Padrão</p>
              <p className="mt-1 text-lg font-black">{selectedPattern.title}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">BPM</p>
              <p className="mt-1 text-lg font-black">{selectedPattern.bpm}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Streak / Combo</p>
              <p className="mt-1 text-lg font-black">{streak} / {combo}</p>
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

          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => {
                  setSelectedPatternId(pattern.id);
                  setUserInput([]);
                  setFeedback('Padrão selecionado. Ouça e repita.');
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
                <p className="mt-1 text-[10px] font-black opacity-70 uppercase">{pattern.beats.length} passos</p>
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => void playPattern()}
              disabled={isPlaying}
              className="rounded-xl border border-cyan-400 bg-cyan-500/20 px-4 py-2 text-xs font-black uppercase text-cyan-100 hover:bg-cyan-500/30 disabled:opacity-50"
            >
              Ouvir padrão
            </button>
            <button
              onClick={resetTry}
              className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}
            >
              Limpar tentativa
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
            {selectedPattern.beats.map((beat, idx) => {
              const isActiveBeat = activeBeatIndex === idx;
              const isFilled = userInput[idx] === 1;
              const expectedActive = beat === 1;
              return (
                <button
                  key={`${selectedPattern.id}-beat-${idx}`}
                  onClick={() => void handleTapBeat(expectedActive ? 1 : 0)}
                  className={`h-16 rounded-2xl border text-sm font-black uppercase transition-all ${
                    isActiveBeat
                      ? 'border-cyan-100 bg-cyan-500 text-white shadow-[0_0_24px_rgba(34,211,238,0.7)] scale-[1.03]'
                      : isFilled
                        ? 'border-emerald-300 bg-emerald-500/25 text-emerald-100'
                        : isLight
                          ? 'border-slate-300 bg-slate-100 text-slate-700 hover:border-cyan-400'
                          : 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-cyan-500'
                  }`}
                >
                  {expectedActive ? 'TA' : 'PAUSA'}
                </button>
              );
            })}
          </div>

          <div className={`mt-5 rounded-xl border px-4 py-3 text-sm font-black ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
            {feedback}
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

export default TeenRhythmLabPage;
