import React, { useMemo, useRef, useState } from 'react';
import { getTeensLang, getTeensTheme } from '../utils/ecosystemPreferences';
import { addTeensXp, getRankProgress, getTeensXp } from '../utils/teenProgress';
import { sendFretboardIntent } from '../utils/sendFretboardIntent';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

type Difficulty = 'easy' | 'medium' | 'hard';
type CellId = `s${number}f${number}`;

type PathPattern = {
  id: string;
  title: string;
  sequence: CellId[];
};

const STRINGS = ['E', 'A', 'D', 'G', 'B', 'E'];
const FRETS = [0, 1, 2, 3, 4, 5, 6, 7];
const NOTE_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
type ScaleNote = typeof NOTE_ORDER[number];

const NOTE_FREQ: Record<ScaleNote, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392,
  A: 440,
  B: 493.88,
};

const OPEN_NOTES = ['E', 'A', 'D', 'G', 'B', 'E'] as const;
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const SCALE_SET = new Set(NOTE_ORDER);
const REGION_STRINGS = new Set([3, 4, 5]);
const REGION_FRETS = new Set([1, 2, 3, 4, 5]);

const PATHS: PathPattern[] = [
  {
    id: 'am-pentatonic',
    title: 'Am Pentatônica',
    sequence: ['s3f2', 's4f1', 's4f3', 's4f5', 's5f3', 's5f5', 's4f5', 's4f3'],
  },
  {
    id: 'c-major',
    title: 'C Maior',
    sequence: ['s4f1', 's4f3', 's4f5', 's5f1', 's5f3', 's5f5', 's3f4', 's4f1'],
  },
  {
    id: 'am-natural',
    title: 'Am Natural',
    sequence: ['s3f2', 's3f4', 's4f1', 's4f3', 's4f5', 's5f1', 's5f3', 's5f5'],
  },
];

const LENGTH_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 4,
  medium: 6,
  hard: 8,
};

const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 14,
  medium: 22,
  hard: 30,
};

const getChromaticNote = (open: string, fret: number): string => {
  const openIndex = CHROMATIC.indexOf(open as (typeof CHROMATIC)[number]);
  if (openIndex === -1) return open;
  return CHROMATIC[(openIndex + fret) % CHROMATIC.length];
};

const normalizeNote = (note: string): ScaleNote | null => {
  const normalized = note.replace('#', '');
  if (!SCALE_SET.has(normalized as ScaleNote)) return null;
  return normalized as ScaleNote;
};

const TeenScaleHunterPage: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [lang] = useState<'pt' | 'en'>(() => getTeensLang());
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [selectedPathId, setSelectedPathId] = useState<string>(PATHS[0].id);
  const [activeCell, setActiveCell] = useState<CellId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInput, setUserInput] = useState<CellId[]>([]);
  const [feedback, setFeedback] = useState(() => (lang === 'pt' ? 'Escolha um caminho e toque em Ouvir sequência.' : 'Choose a path and press Play sequence.'));
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const [xp, setXp] = useState<number>(() => getTeensXp());

  const audioContextRef = useRef<AudioContext | null>(null);
  const playTokenRef = useRef(0);

  const isLight = theme === 'light';
  const isPt = lang === 'pt';
  const rankProgress = getRankProgress(xp);

  const selectedPath = useMemo(() => PATHS.find((p) => p.id === selectedPathId) ?? PATHS[0], [selectedPathId]);
  const targetSequence = selectedPath.sequence.slice(0, LENGTH_BY_DIFFICULTY[difficulty]);

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? 'rgba(148,163,184,0.35)' : 'rgba(139,92,246,0.18)'} 1px, transparent 1px)`,
    backgroundSize: '100% 30px',
  };

  const cellToNote = (cellId: CellId): ScaleNote | null => {
    const match = cellId.match(/^s(\d+)f(\d+)$/);
    if (!match) return null;
    const stringIndex = Number(match[1]);
    const fret = Number(match[2]);
    const chromatic = getChromaticNote(OPEN_NOTES[stringIndex], fret);
    return normalizeNote(chromatic);
  };

  const getAudioCtx = async () => {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    return audioContextRef.current;
  };

  const playCellNote = async (cellId: CellId, duration = 0.2) => {
    const note = cellToNote(cellId);
    if (!note) return;
    const ctx = await getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(NOTE_FREQ[note], now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  };

  const playSequence = async () => {
    const token = playTokenRef.current + 1;
    playTokenRef.current = token;
    setIsPlaying(true);
    setUserInput([]);

    for (const cellId of targetSequence) {
      if (playTokenRef.current !== token) break;
      setActiveCell(cellId);
      await playCellNote(cellId, 0.2);
      await new Promise((resolve) => window.setTimeout(resolve, 320));
      setActiveCell(null);
      await new Promise((resolve) => window.setTimeout(resolve, 70));
    }

    if (playTokenRef.current === token) {
      setIsPlaying(false);
      setFeedback(isPt ? 'Sua vez: reproduza o caminho no braço.' : 'Your turn: reproduce the path on the fretboard.');
    }
  };

  const handlePickCell = async (cellId: CellId) => {
    if (isPlaying) return;

    setActiveCell(cellId);
    void playCellNote(cellId, 0.16);
    window.setTimeout(() => setActiveCell(null), 150);

    setUserInput((prev) => {
      const next = [...prev, cellId].slice(0, targetSequence.length);
      const expected = targetSequence[next.length - 1];

      if (cellId !== expected) {
        setCombo(0);
        setFeedback(isPt ? 'Quase! Ouça de novo e siga o padrão do caminho.' : 'Almost! Listen again and follow the path pattern.');
        return next;
      }

      if (next.length === targetSequence.length) {
        const nextXp = addTeensXp(XP_BY_DIFFICULTY[difficulty]);
        setXp(nextXp);
        setStreak((v) => v + 1);
        setCombo((v) => v + 1);
        setFeedback(isPt ? 'Caminho concluído! Novo XP adicionado.' : 'Path completed! New XP added.');
      } else {
        setFeedback('Boa leitura! Continue o caminho...');
      }

      return next;
    });
  };

  const resetTry = () => {
    setUserInput([]);
    setFeedback(isPt ? 'Tentativa limpa. Ouça a sequência novamente.' : 'Attempt cleared. Listen to the sequence again.');
  };

  const newChallenge = () => {
    const pool = PATHS.filter((item) => item.id !== selectedPathId);
    const next = pool[Math.floor(Math.random() * pool.length)] ?? PATHS[0];
    setSelectedPathId(next.id);
    setUserInput([]);
    setFeedback(isPt ? 'Novo caminho carregado. Ouça e reproduza.' : 'New path loaded. Listen and reproduce it.');
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />

      <main className="relative mx-auto max-w-6xl">
        <EcosystemPageActions ecosystem="teens" isLight={isLight} backLabel={isPt ? "Voltar ao Teens" : "Back to Teens"} backPath="/teens" />
        <InternalEcosystemHeader ecosystem="teens" isLight={isLight} title="Caça às Escalas" subtitle="Caçe padrões no braço e reproduza caminhos musicais por região." />

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-violet-800/60 bg-zinc-950/80'}`}>
          <div className="grid gap-3 md:grid-cols-3">
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">Dificuldade</p>
              <p className="mt-1 text-lg font-black">{difficulty.toUpperCase()} · {targetSequence.length} {isPt ? 'passos' : 'steps'}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">Caminho</p>
              <p className="mt-1 text-lg font-black">{selectedPath.title}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">Streak / Combo</p>
              <p className="mt-1 text-lg font-black">{streak} / {combo}</p>
            </div>
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

          <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setDifficulty(item);
                  setUserInput([]);
                  setFeedback(isPt ? 'Dificuldade ajustada. Ouça e reproduza.' : 'Difficulty adjusted. Listen and reproduce it.');
                }}
                className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${
                  difficulty === item
                    ? isLight
                      ? 'border-violet-500 bg-violet-100 text-violet-900'
                      : 'border-violet-400 bg-violet-500/15 text-violet-50'
                    : isLight
                      ? 'border-slate-300 bg-white hover:border-violet-400'
                      : 'border-zinc-700 bg-zinc-950 hover:border-violet-500'
                }`}
              >
                {item}
              </button>
            ))}
            {PATHS.map((path) => (
              <button
                key={path.id}
                onClick={() => {
                  setSelectedPathId(path.id);
                  setUserInput([]);
                  setFeedback(isPt ? 'Caminho selecionado. Ouça e reproduza.' : 'Path selected. Listen and reproduce it.');
                }}
                className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${
                  selectedPathId === path.id
                    ? isLight
                      ? 'border-violet-500 bg-violet-100 text-violet-900'
                      : 'border-violet-300 bg-violet-500/25 text-violet-50'
                    : isLight
                      ? 'border-slate-300 bg-white hover:border-violet-400'
                      : 'border-zinc-700 bg-zinc-950 hover:border-violet-500'
                }`}
              >
                {path.title}
              </button>
            ))}
          </div>

          <div className={`mt-4 rounded-2xl border p-3 ${isLight ? 'border-slate-300 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
            <div className="grid gap-2" style={{ gridTemplateColumns: `72px repeat(${FRETS.length}, minmax(0, 1fr))` }}>
              <div className="text-[10px] font-black uppercase opacity-60 self-center">Cordas</div>
              {FRETS.map((fret) => (
                <div key={`fret-${fret}`} className="text-center text-[10px] font-black opacity-50">{fret}</div>
              ))}

              {STRINGS.map((label, stringIdx) => (
                <React.Fragment key={`string-${label}-${stringIdx}`}>
                  <div className="text-[10px] font-black uppercase opacity-70 self-center">{label}</div>
                  {FRETS.map((fret) => {
                    const cellId = `s${stringIdx}f${fret}` as CellId;
                    const inRegion = REGION_STRINGS.has(stringIdx) && REGION_FRETS.has(fret);
                    const isTarget = targetSequence.includes(cellId);
                    const isActive = activeCell === cellId;
                    const wasPicked = userInput.includes(cellId);
                    return (
                      <button
                        key={cellId}
                        onClick={() => void handlePickCell(cellId)}
                        className={`h-10 rounded-lg border text-[9px] font-black transition-all ${
                          isActive
                            ? 'bg-violet-500 text-white border-violet-200 shadow-[0_0_18px_rgba(139,92,246,0.8)]'
                            : wasPicked
                              ? 'bg-emerald-500/25 border-emerald-300 text-emerald-100'
                              : inRegion
                                ? isTarget
                                  ? 'bg-violet-500/20 border-violet-400/70 text-violet-100'
                                  : isLight
                                    ? 'bg-white border-slate-300 text-slate-700'
                                    : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                                : isLight
                                  ? 'bg-slate-100 border-slate-200 text-slate-400'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                        }`}
                      >
                        {inRegion ? cellToNote(cellId) ?? '-' : ''}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
            <button
              onClick={() => void playSequence()}
              disabled={isPlaying}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${
                isLight
                  ? 'border-violet-500 bg-violet-100 text-violet-900 hover:bg-violet-200'
                  : 'border-violet-400 bg-violet-500/15 text-violet-50 hover:bg-violet-500/25'
              }`}
            >
              {isPt ? 'Ouvir sequência' : 'Play sequence'}
            </button>
            <button
              onClick={newChallenge}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${
                isLight
                  ? 'border-violet-500 bg-violet-100 text-violet-900 hover:bg-violet-200'
                  : 'border-violet-300 bg-violet-500/25 text-violet-50 hover:bg-violet-500/35'
              }`}
            >
              {isPt ? 'Novo desafio' : 'New challenge'}
            </button>
            <button
              onClick={resetTry}
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
              source: 'teens-scale',
              action: 'showScale',
              root: 'C',
              scaleType: 'Major (Ionian)',
              focusFirstRegion: true,
              instruction: {
                title: isPt ? 'Do Caçador ao Braço Completo' : 'From Hunter to Full Fretboard',
                description: isPt ? 'Você treinou uma região. Agora veja a escala completa no braço.' : 'You trained one region. Now see the full scale on the fretboard.',
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
  );
};

export default TeenScaleHunterPage;

