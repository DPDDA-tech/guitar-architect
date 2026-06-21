import React, { useMemo, useRef, useState } from 'react';
import { getTeensLang, getTeensTheme } from '../utils/ecosystemPreferences';
import { teenRiffChallenges, type TeenRiffChallenge, type TeenRiffDifficulty, type TeenRiffNote } from '../data/teenRiffData';
import { addTeensXpOnce, getRankProgress, getTeensXp } from '../utils/teenProgress';
import { sendFretboardIntent } from '../utils/sendFretboardIntent';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';
import AppFooter from './AppFooter';

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

const UNLOCK_STORAGE_KEY = 'ga_teens_riff_unlocks_v1';

const TeenRiffChallengesPage: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [lang] = useState<'pt' | 'en'>(() => getTeensLang());
  const [unlockedRiffIds, setUnlockedRiffIds] = useState<string[]>(() => {
    const fallback = teenRiffChallenges[0] ? [teenRiffChallenges[0].id] : [];
    try {
      const raw = window.localStorage.getItem(UNLOCK_STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as string[];
      return parsed.length ? parsed : fallback;
    } catch {
      return fallback;
    }
  });
  const [selectedRiffId, setSelectedRiffId] = useState<string>(() => teenRiffChallenges[0]?.id ?? '');
  const [userNotes, setUserNotes] = useState<TeenRiffNote[]>([]);
  const [feedback, setFeedback] = useState('Selecione um riff e toque em Ouvir desafio.');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNote, setActiveNote] = useState<TeenRiffNote | null>(null);
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);
  const [xp, setXp] = useState<number>(() => getTeensXp());

  const audioContextRef = useRef<AudioContext | null>(null);
  const playTokenRef = useRef(0);

  const isLight = theme === 'light';
  const isPt = lang === 'pt';

  const selectedRiff = useMemo<TeenRiffChallenge>(() => {
    return teenRiffChallenges.find((riff) => riff.id === selectedRiffId) ?? teenRiffChallenges[0];
  }, [selectedRiffId]);
  const selectedIndex = teenRiffChallenges.findIndex((riff) => riff.id === selectedRiff.id);
  const rankProgress = getRankProgress(xp);

  const progressText = `${Math.min(userNotes.length, selectedRiff.notes.length)}/${selectedRiff.notes.length}`;

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

  const persistUnlocks = (nextIds: string[]) => {
    setUnlockedRiffIds(nextIds);
    try {
      window.localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(nextIds));
    } catch {
      // no-op
    }
  };

  const unlockNextRiff = (baseIndex: number) => {
    const nextRiff = teenRiffChallenges[baseIndex + 1];
    if (!nextRiff) return;
    if (!unlockedRiffIds.includes(nextRiff.id)) {
      persistUnlocks([...unlockedRiffIds, nextRiff.id]);
      setFeedback(isPt ? `Riff concluído! Novo desafio liberado: ${nextRiff.title}.` : `Riff completed! New challenge unlocked: ${nextRiff.title}.`);
    }
  };

  const handleChooseRiff = (riffId: string) => {
    if (!unlockedRiffIds.includes(riffId)) return;
    setSelectedRiffId(riffId);
    setUserNotes([]);
    setFeedback(isPt ? 'Riff selecionado. Ouça e reproduza.' : 'Riff selected. Listen and reproduce it.');
    setLastResult(null);
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
          const baseXp = selectedRiff.difficulty === 'hard' ? 30 : selectedRiff.difficulty === 'medium' ? 22 : 16;
          const { total, firstTime } = addTeensXpOnce(`riff:${selectedRiff.id}`, baseXp);
          setFeedback(
            firstTime
              ? (isPt ? 'Riff concluído!' : 'Riff completed!')
              : (isPt ? 'Riff concluído! Já dominado — sem XP adicional.' : 'Riff completed! Already mastered — no extra XP.'),
          );
          setStreak((value) => value + 1);
          setCombo((value) => value + 1);
          setLastResult('success');
          setXp(total);
          setShowAchievement(true);
          window.setTimeout(() => setShowAchievement(false), 1400);
          unlockNextRiff(selectedIndex);
        } else {
          setFeedback(isPt ? 'Quase! Ouça novamente.' : 'Almost! Listen again.');
          setCombo(0);
          setLastResult('error');
        }
      } else {
        setFeedback(isPt ? 'Continue tocando o riff...' : 'Keep playing the riff...');
      }

      return next;
    });
  };

  const clearUser = () => {
    setUserNotes([]);
    setFeedback(isPt ? 'Sua sequência foi limpa.' : 'Your sequence was cleared.');
    setLastResult(null);
  };

  const goNextChallenge = () => {
    const next = teenRiffChallenges[selectedIndex + 1];
    if (!next) return;
    if (!unlockedRiffIds.includes(next.id)) return;
    setSelectedRiffId(next.id);
    setUserNotes([]);
    setFeedback(isPt ? `Novo desafio: ${next.title}` : `New challenge: ${next.title}`);
    setLastResult(null);
  };

  const isNextUnlocked = unlockedRiffIds.includes(teenRiffChallenges[selectedIndex + 1]?.id ?? '');

  return (
    <>
    <div className={`relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />

      <main className="relative mx-auto max-w-6xl">
        <EcosystemPageActions ecosystem="teens" isLight={isLight} backLabel={isPt ? "Voltar ao Teens" : "Back to Teens"} backPath="/teens" />
        <InternalEcosystemHeader ecosystem="teens" isLight={isLight} title={isPt ? "Desafios de Riff" : "Riff Challenges"} subtitle={isPt ? "Ouça, memorize e reproduza riffs." : "Listen, memorize, and play back riffs."} />

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-violet-800/60 bg-zinc-950/80'}`}>
          <div className="grid gap-3 md:grid-cols-3">
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">Riff</p>
              <p className="mt-1 text-lg font-black">{selectedRiff.title}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">Dificuldade</p>
              <p className="mt-1 text-lg font-black">{difficultyBadge[selectedRiff.difficulty]}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">BPM</p>
              <p className="mt-1 text-lg font-black">{selectedRiff.bpm} | Progresso {progressText}</p>
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className={`rounded-xl border px-4 py-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Streak</p>
              <p className="mt-1 text-lg font-black">{streak}</p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Combo</p>
              <p className="mt-1 text-lg font-black">{combo}</p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Trilha</p>
              <p className="mt-1 text-lg font-black">{unlockedRiffIds.length}/{teenRiffChallenges.length}</p>
            </div>
          </div>

          <div className={`mt-3 rounded-xl border px-4 py-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">{isPt ? 'Progressão' : 'Progress'}</p>
              <p className="text-xs font-black uppercase">
                Rank: <span className={rankProgress.current.accentClass}>{rankProgress.current.label}</span> · XP {xp}
              </p>
            </div>
            <div className={`mt-2 h-2 w-full rounded-full ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`}>
              <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 via-violet-400 to-fuchsia-500 transition-all" style={{ width: `${rankProgress.percent}%` }} />
            </div>
            {rankProgress.next && (
              <p className={`mt-2 text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                Falta {Math.max(0, rankProgress.next.minXp - xp)} XP para {rankProgress.next.label}.
              </p>
            )}
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {teenRiffChallenges.map((riff) => {
              const isUnlocked = unlockedRiffIds.includes(riff.id);
              return (
                <button
                  key={riff.id}
                  onClick={() => handleChooseRiff(riff.id)}
                  disabled={!isUnlocked}
                  className={`rounded-xl border px-3 py-3 text-left transition-all ${
                    selectedRiff.id === riff.id
                      ? 'border-violet-400 bg-violet-500/15 ring-2 ring-violet-300/40'
                      : isLight
                        ? 'border-slate-300 bg-white hover:border-violet-400'
                        : 'border-zinc-700 bg-zinc-950 hover:border-violet-500'
                  } ${!isUnlocked ? 'opacity-45 cursor-not-allowed' : ''}`}
                >
                  <p className="text-sm font-black uppercase">{riff.title}</p>
                  <p className="mt-1 text-[10px] font-black opacity-70 uppercase">
                    {difficultyBadge[riff.difficulty]} · {riff.notes.length} {isPt ? 'notas' : 'notes'} {isUnlocked ? '' : `· ${isPt ? 'BLOQUEADO' : 'LOCKED'}`}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
            <button
              onClick={() => void playSequence(selectedRiff.notes)}
              disabled={isPlaying}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${
                isLight
                  ? 'border-violet-500 bg-violet-100 text-violet-900 hover:bg-violet-200'
                  : 'border-violet-400 bg-violet-500/15 text-violet-50 hover:bg-violet-500/25'
              }`}
            >
              {isPt ? 'Ouvir desafio' : 'Play challenge'}
            </button>
            <button
              onClick={() => void playSequence(userNotes)}
              disabled={isPlaying || userNotes.length === 0}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${
                isLight
                  ? 'border-violet-500 bg-violet-100 text-violet-900 hover:bg-violet-200'
                  : 'border-violet-300 bg-violet-500/25 text-violet-50 hover:bg-violet-500/35'
              }`}
            >
              {isPt ? 'Ouvir sua versão' : 'Play your version'}
            </button>
            <button
              onClick={clearUser}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-white hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 hover:border-violet-500'}`}
            >
              Limpar
            </button>
            <button
              onClick={goNextChallenge}
              disabled={!isNextUnlocked}
              className="min-h-[44px] rounded-xl border border-emerald-400 bg-emerald-500/20 px-4 py-2 text-xs font-black uppercase text-center leading-tight text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-40"
            >
              {isPt ? 'Próximo desafio' : 'Next challenge'}
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
                      ? `${noteColor[note]} border-violet-200 text-white shadow-[0_0_24px_rgba(139,92,246,0.7)] scale-[1.03]`
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

          {showAchievement && (
            <div className={`mt-5 rounded-xl border px-4 py-3 text-sm font-black animate-pulse ${isLight ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'}`}>
              {isPt ? `+XP ganho • +1 streak • combo ${combo} • desafio dominado` : `+XP earned • +1 streak • combo ${combo} • challenge mastered`}
            </div>
          )}

          <div className={`mt-3 rounded-xl border px-4 py-3 text-sm font-black ${
            lastResult === 'success'
              ? isLight
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              : lastResult === 'error'
                ? isLight
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                : isLight
                  ? 'border-violet-200 bg-violet-50 text-violet-800'
                  : 'border-violet-500/30 bg-violet-500/8 text-violet-200'
          }`}>
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
              source: 'teens-riff',
              action: 'showScale',
              root: 'C',
              scaleType: 'Major (Ionian)',
              focusFirstRegion: true,
              instruction: {
                title: isPt ? 'Do Riff à Escala' : 'From Riff to Scale',
                description: isPt ? 'As notas que você tocou fazem parte desta escala. Explore as regiões do braço.' : 'The notes you played are part of this scale. Explore the fretboard regions.',
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

export default TeenRiffChallengesPage;

