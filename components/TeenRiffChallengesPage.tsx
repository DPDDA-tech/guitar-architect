import React, { useMemo, useRef, useState } from 'react';
import { getTeensTheme } from '../utils/ecosystemPreferences';
import { teenRiffChallenges, type TeenRiffChallenge, type TeenRiffDifficulty, type TeenRiffNote } from '../data/teenRiffData';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const noteColor: Record<TeenRiffNote, string> = {
  DO: 'bg-red-500',
  RE: 'bg-orange-500',
  MI: 'bg-yellow-400',
  FA: 'bg-green-500',
  SOL: 'bg-blue-500',
  LA: 'bg-violet-500',
  SI: 'bg-pink-500',
};

const noteFreq: Record<TeenRiffNote, number> = {
  DO: 261.63,
  RE: 293.66,
  MI: 329.63,
  FA: 349.23,
  SOL: 392,
  LA: 440,
  SI: 493.88,
};

const difficultyBadge: Record<TeenRiffDifficulty, string> = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
};

const TeenRiffChallengesPage: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [selectedRiffId, setSelectedRiffId] = useState<string>(teenRiffChallenges[0]?.id ?? '');
  const [userNotes, setUserNotes] = useState<TeenRiffNote[]>([]);
  const [feedback, setFeedback] = useState('Selecione um riff e toque em Ouvir desafio.');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNote, setActiveNote] = useState<TeenRiffNote | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const playTokenRef = useRef(0);

  const isLight = theme === 'light';

  const selectedRiff = useMemo<TeenRiffChallenge>(() => {
    return teenRiffChallenges.find((riff) => riff.id === selectedRiffId) ?? teenRiffChallenges[0];
  }, [selectedRiffId]);

  const progressText = `${Math.min(userNotes.length, selectedRiff.notes.length)}/${selectedRiff.notes.length}`;

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

  const playNote = async (note: TeenRiffNote, duration = 0.2) => {
    const ctx = await getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(noteFreq[note], now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  };

  const playSequence = async (notes: TeenRiffNote[]) => {
    if (!notes.length) return;

    const token = playTokenRef.current + 1;
    playTokenRef.current = token;
    setIsPlaying(true);

    for (const note of notes) {
      if (playTokenRef.current !== token) break;
      setActiveNote(note);
      await playNote(note, 0.22);
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      setActiveNote(null);
      await new Promise((resolve) => window.setTimeout(resolve, 60));
    }

    if (playTokenRef.current === token) {
      setIsPlaying(false);
    }
  };

  const handleChooseRiff = (riffId: string) => {
    setSelectedRiffId(riffId);
    setUserNotes([]);
    setFeedback('Riff selecionado. Ouça e reproduza.');
  };

  const handleUserNote = async (note: TeenRiffNote) => {
    if (isPlaying) return;

    setActiveNote(note);
    void playNote(note, 0.18);
    window.setTimeout(() => setActiveNote(null), 160);

    setUserNotes((prev) => {
      const next = [...prev, note].slice(0, selectedRiff.notes.length);

      if (next.length === selectedRiff.notes.length) {
        if (JSON.stringify(next) === JSON.stringify(selectedRiff.notes)) {
          setFeedback('Riff concluído!');
        } else {
          setFeedback('Quase! Ouça novamente.');
        }
      } else {
        setFeedback('Continue tocando o riff...');
      }

      return next;
    });
  };

  const clearUser = () => {
    setUserNotes([]);
    setFeedback('Sua sequência foi limpa.');
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-[#02030a] text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.14),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.16),transparent_48%)]" />

      <main className="relative mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-400">GA Teens</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Riff Challenges</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Ouça, memorize e reproduza riffs.
          </p>
        </header>

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-indigo-900/70 bg-zinc-950/75'}`}>
          <div className="grid gap-3 md:grid-cols-3">
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Riff</p>
              <p className="mt-1 text-lg font-black">{selectedRiff.title}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Dificuldade</p>
              <p className="mt-1 text-lg font-black">{difficultyBadge[selectedRiff.difficulty]}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">BPM</p>
              <p className="mt-1 text-lg font-black">{selectedRiff.bpm} | Progresso {progressText}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {teenRiffChallenges.map((riff) => (
              <button
                key={riff.id}
                onClick={() => handleChooseRiff(riff.id)}
                className={`rounded-xl border px-3 py-3 text-left transition-all ${
                  selectedRiff.id === riff.id
                    ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-300/40'
                    : isLight
                      ? 'border-slate-300 bg-white hover:border-cyan-400'
                      : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'
                }`}
              >
                <p className="text-sm font-black uppercase">{riff.title}</p>
                <p className="mt-1 text-[10px] font-black opacity-70 uppercase">{difficultyBadge[riff.difficulty]} · {riff.notes.length} notas</p>
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => void playSequence(selectedRiff.notes)}
              disabled={isPlaying}
              className="rounded-xl border border-cyan-400 bg-cyan-500/20 px-4 py-2 text-xs font-black uppercase text-cyan-100 hover:bg-cyan-500/30 disabled:opacity-50"
            >
              Ouvir desafio
            </button>
            <button
              onClick={() => void playSequence(userNotes)}
              disabled={isPlaying || userNotes.length === 0}
              className="rounded-xl border border-violet-400 bg-violet-500/20 px-4 py-2 text-xs font-black uppercase text-violet-100 hover:bg-violet-500/30 disabled:opacity-50"
            >
              Ouvir sua versão
            </button>
            <button
              onClick={clearUser}
              className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}
            >
              Limpar
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {(Object.keys(noteColor) as TeenRiffNote[]).map((note) => {
              const isActive = activeNote === note;
              return (
                <button
                  key={note}
                  onClick={() => void handleUserNote(note)}
                  className={`h-16 rounded-2xl border text-sm font-black uppercase transition-all ${
                    isActive
                      ? `${noteColor[note]} border-cyan-100 text-white shadow-[0_0_24px_rgba(34,211,238,0.7)] scale-[1.03]`
                      : isLight
                        ? 'border-slate-300 bg-slate-100 text-slate-700 hover:border-cyan-400'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-cyan-500'
                  }`}
                >
                  {note}
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

export default TeenRiffChallengesPage;
