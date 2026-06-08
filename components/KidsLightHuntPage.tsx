import React, { useMemo, useRef, useState } from 'react';
import { getKidsTheme } from '../utils/ecosystemPreferences';
import { LIGHT_GRID } from '../data/kidsLightHuntData';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

type NaturalNote = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
type PathPreset = {
  id: 'pathA' | 'pathB' | 'pathC' | 'pathD';
  label: string;
  notes: NaturalNote[];
};
type TempoPreset = { id: 'slow' | 'medium' | 'fast'; label: string; stepMs: number; gapMs: number };

type CellInfo = {
  cellId: number;
  stringIndex: number;
  fretIndex: number;
  note: NaturalNote;
  midi: number;
};
type Region = { id: string; stringStart: number; stringEnd: number; cellIds: number[] };

const NATURAL_ORDER: NaturalNote[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL_SEMITONES: Record<NaturalNote, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const OPEN_STRING_NOTES: NaturalNote[] = ['E', 'B', 'G', 'D', 'A', 'E'];
const OPEN_STRING_MIDI = [64, 59, 55, 50, 45, 40]; // E4 B3 G3 D3 A2 E2

const NOTE_COLOR: Record<NaturalNote, string> = {
  C: 'bg-red-500',
  D: 'bg-orange-500',
  E: 'bg-yellow-400',
  F: 'bg-green-500',
  G: 'bg-blue-500',
  A: 'bg-violet-500',
  B: 'bg-pink-500',
};

const PATH_PRESETS: PathPreset[] = [
  { id: 'pathA', label: 'Caminho A', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  { id: 'pathB', label: 'Caminho B', notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
  { id: 'pathC', label: 'Caminho C', notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F'] },
  { id: 'pathD', label: 'Caminho D', notes: ['E', 'F', 'G', 'A', 'B', 'C', 'D'] },
];
const TEMPO_PRESETS: TempoPreset[] = [
  { id: 'slow', label: 'Lento', stepMs: 700, gapMs: 220 },
  { id: 'medium', label: 'Médio', stepMs: 520, gapMs: 140 },
  { id: 'fast', label: 'Rápido', stepMs: 380, gapMs: 100 },
];

const midiToHz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

const nextNatural = (note: NaturalNote): NaturalNote => {
  const idx = NATURAL_ORDER.indexOf(note);
  return NATURAL_ORDER[(idx + 1) % NATURAL_ORDER.length];
};

const semitoneDistance = (from: NaturalNote, to: NaturalNote) => {
  const diff = (NATURAL_SEMITONES[to] - NATURAL_SEMITONES[from] + 12) % 12;
  return diff === 0 ? 12 : diff;
};

const createCellMap = (): CellInfo[] => {
  const list: CellInfo[] = [];

  for (let stringIndex = 0; stringIndex < LIGHT_GRID.strings; stringIndex += 1) {
    let currentNote = OPEN_STRING_NOTES[stringIndex];
    let currentMidi = OPEN_STRING_MIDI[stringIndex];

    for (let fretIndex = 0; fretIndex < LIGHT_GRID.frets; fretIndex += 1) {
      const cellId = stringIndex * LIGHT_GRID.frets + fretIndex;
      list.push({ cellId, stringIndex, fretIndex, note: currentNote, midi: currentMidi });

      const next = nextNatural(currentNote);
      currentMidi += semitoneDistance(currentNote, next);
      currentNote = next;
    }
  }

  return list;
};

const CELL_MAP = createCellMap();

const KidsLightHuntPage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [selectedPathId, setSelectedPathId] = useState<PathPreset['id']>('pathA');
  const [tempoId, setTempoId] = useState<TempoPreset['id']>('medium');
  const [useCustomPath, setUseCustomPath] = useState(false);
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [customPath, setCustomPath] = useState<NaturalNote[]>(['C', 'D', 'E', 'F']);
  const [stepIndex, setStepIndex] = useState(0);
  const [feedback, setFeedback] = useState('Escolha um caminho e toque em Começar.');
  const [litCellId, setLitCellId] = useState<number | null>(null);
  const [pulseId, setPulseId] = useState<number | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const playTokenRef = useRef(0);

  const isLight = theme === 'light';

  const selectedPath = PATH_PRESETS.find((preset) => preset.id === selectedPathId) ?? PATH_PRESETS[0];
  const selectedTempo = TEMPO_PRESETS.find((preset) => preset.id === tempoId) ?? TEMPO_PRESETS[1];
  const activePathNotes = useCustomPath ? (customPath.length > 0 ? customPath : selectedPath.notes) : selectedPath.notes;

  const getCellInfo = (cellId: number) => CELL_MAP[cellId];
  const regions = useMemo<Region[]>(() => {
    const list: Region[] = [];
    for (let stringStart = 0; stringStart <= LIGHT_GRID.strings - 2; stringStart += 1) {
      const stringEnd = stringStart + 1;
      const cellIds: number[] = [];
      for (let s = stringStart; s <= stringEnd; s += 1) {
        for (let fret = 0; fret < LIGHT_GRID.frets; fret += 1) {
          cellIds.push(s * LIGHT_GRID.frets + fret);
        }
      }
      list.push({ id: `region-${stringStart}-${stringEnd}`, stringStart, stringEnd, cellIds });
    }
    return list;
  }, []);

  const getAudioCtx = async () => {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    return audioContextRef.current;
  };

  const playCellNote = async (cellId: number) => {
    const ctx = await getAudioCtx();
    if (!ctx) return;

    const info = getCellInfo(cellId);
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(midiToHz(info.midi), now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  };

  const randomFrom = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

  const buildSequence = (targetLevel: number) => {
    const length = Math.max(1, Math.min(8, targetLevel));
    const order = activePathNotes.length > 0 ? activePathNotes : selectedPath.notes;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const startIndex = Math.floor(Math.random() * order.length);
    const desiredNotes = Array.from({ length }, (_, i) => {
      const idx = (startIndex + i * direction + order.length * 3) % order.length;
      return order[idx];
    });

    const regionCandidates = regions.filter((region) =>
      desiredNotes.every((note) => region.cellIds.some((cellId) => getCellInfo(cellId).note === note)),
    );

    const selectedRegion = randomFrom(regionCandidates.length > 0 ? regionCandidates : regions);
    const next: number[] = [];
    let lastFret = -1;

    for (const note of desiredNotes) {
      const options = selectedRegion.cellIds.filter((cellId) => getCellInfo(cellId).note === note);
      if (options.length === 0) continue;
      const picked =
        lastFret < 0
          ? randomFrom(options)
          : [...options].sort((a, b) => Math.abs(getCellInfo(a).fretIndex - lastFret) - Math.abs(getCellInfo(b).fretIndex - lastFret))[0];
      next.push(picked);
      lastFret = getCellInfo(picked).fretIndex;
    }

    return next.slice(0, length);
  };

  const playSequence = async (target: number[]) => {
    if (target.length === 0) return;

    const token = playTokenRef.current + 1;
    playTokenRef.current = token;
    setIsPlayingSequence(true);
    setLitCellId(null);

    for (let i = 0; i < target.length; i += 1) {
      if (playTokenRef.current !== token) break;
      const cellId = target[i];
      setLitCellId(cellId);
      await playCellNote(cellId);
      await new Promise((resolve) => window.setTimeout(resolve, selectedTempo.stepMs));
      setLitCellId(null);
      await new Promise((resolve) => window.setTimeout(resolve, selectedTempo.gapMs));
    }

    if (playTokenRef.current === token) {
      setIsPlayingSequence(false);
      setFeedback('Agora é sua vez. Repita o caminho!');
    }
  };

  const startLevel = async (targetLevel = level) => {
    const next = buildSequence(targetLevel);
    setSequence(next);
    setStepIndex(0);
    setFeedback('Uma luz vai aparecer. Toque nela!');
    await playSequence(next);
  };

  const handleCellClick = async (cellId: number) => {
    if (isPlayingSequence || sequence.length === 0) return;

    if (cellId === sequence[stepIndex]) {
      setPulseId(cellId);
      window.setTimeout(() => setPulseId(null), 220);
      await playCellNote(cellId);

      if (stepIndex === sequence.length - 1) {
        if (level >= 8) {
          setFeedback('Você completou todos os 8 níveis!');
          setSequence([]);
          setLitCellId(null);
          return;
        }

        const nextLevel = level + 1;
        setLevel(nextLevel);
        setStepIndex(0);
        setFeedback('Boa! Próximo nível!');

        await new Promise((resolve) => window.setTimeout(resolve, 1000));
        await startLevel(nextLevel);
      } else {
        setStepIndex((prev) => prev + 1);
        setFeedback('Muito bem! Siga o caminho.');
      }
    } else {
      setFeedback('Quase! Observe a sequência e tente de novo.');
      setStepIndex(0);
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      await playSequence(sequence);
    }
  };

  const restart = () => {
    playTokenRef.current += 1;
    setIsPlayingSequence(false);
    setLevel(1);
    setStepIndex(0);
    setSequence([]);
    setLitCellId(null);
    setPulseId(null);
    setFeedback('Escolha um caminho e toque em Começar.');
  };

  const addToCustomPath = (note: NaturalNote) => {
    setUseCustomPath(true);
    setCustomPath((prev) => (prev.length >= 12 ? prev : [...prev, note]));
  };

  const removeCustomLast = () => {
    setCustomPath((prev) => prev.slice(0, -1));
  };

  const clearCustomPath = () => {
    setUseCustomPath(true);
    setCustomPath([]);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <main className="relative mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigateTo('/kids')}
          className={`mb-6 rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-all ${isLight ? 'border-emerald-300 bg-white text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.12)] hover:border-emerald-400 hover:shadow-[0_10px_24px_rgba(16,185,129,0.16)]' : 'border-emerald-500/70 bg-emerald-950/60 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.16),0_0_24px_rgba(16,185,129,0.18)] hover:border-emerald-400 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.22),0_0_30px_rgba(16,185,129,0.24)]'}`}
        >
          Voltar ao Kids
        </button>
        <header className="mb-6 md:mb-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-500">Guitar Architect Kids</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Caça às Luzes</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>Siga as luzes pelo braço musical.</p>
        </header>

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-xs font-black uppercase tracking-wider text-cyan-500">Nível {level} de 8</p>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                onClick={() => void startLevel()}
                className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-cyan-300 bg-cyan-50 text-cyan-800 hover:border-cyan-400' : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200 hover:border-cyan-400'}`}
              >
                Começar
              </button>
              <button
                onClick={restart}
                className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}
              >
                Reiniciar
              </button>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">Tempo entre notas</p>
            <div className="mt-2 grid gap-2 sm:flex sm:flex-wrap">
              {TEMPO_PRESETS.map((tempo) => (
                <button
                  key={tempo.id}
                  onClick={() => setTempoId(tempo.id)}
                  className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-black uppercase text-center leading-tight transition-all ${
                    tempoId === tempo.id
                      ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-300/40'
                      : isLight
                        ? 'border-slate-300 bg-white hover:border-cyan-400'
                        : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'
                  }`}
                >
                  {tempo.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-700 bg-zinc-950/70'}`}>
            <div className="grid gap-4">
              {Array.from({ length: LIGHT_GRID.strings }, (_, stringIndex) => (
                <div key={`string-${stringIndex}`} className="grid grid-cols-5 gap-3">
                  {Array.from({ length: LIGHT_GRID.frets }, (_, fretIndex) => {
                    const cellId = stringIndex * LIGHT_GRID.frets + fretIndex;
                    const info = getCellInfo(cellId);
                    const isLit = litCellId === cellId;
                    const isPulse = pulseId === cellId;
                    const colorClass = NOTE_COLOR[info.note];

                    return (
                      <button
                        key={`cell-${cellId}`}
                        onClick={() => void handleCellClick(cellId)}
                        className={`h-12 w-full rounded-full border transition-all duration-300 ${
                          isLit
                            ? `${colorClass} border-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.65)]`
                            : isLight
                              ? 'border-slate-300 bg-slate-200/60'
                              : 'border-zinc-700 bg-zinc-900/90'
                        } ${isPulse ? 'scale-110 ring-2 ring-cyan-300' : ''}`}
                      >
                        <span className={`text-[10px] font-black ${isLit ? 'text-white' : isLight ? 'text-slate-500' : 'text-zinc-500'}`}>{info.note}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
            {feedback}
          </div>
        </section>

        <section className={`mt-4 rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/70'}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">Escolha a sequência para brincar</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PATH_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setUseCustomPath(false);
                  setSelectedPathId(preset.id);
                  restart();
                }}
                className={`rounded-xl border px-3 py-3 text-left transition-all ${selectedPathId === preset.id ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-300/40' : isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}
              >
                <p className="text-xs font-black uppercase">{preset.label}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {preset.notes.map((note) => (
                    <span key={`${preset.id}-${note}`} className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black text-white ${NOTE_COLOR[note]}`}>
                      {note}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
          <div className={`mt-3 rounded-xl border p-3 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950/80'}`}>
            <p className="text-xs font-black uppercase">Crie sua sequência</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {NATURAL_ORDER.map((note) => (
                <button
                  key={`custom-add-${note}`}
                  onClick={() => addToCustomPath(note)}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-[11px] font-black text-white ${NOTE_COLOR[note]}`}
                >
                  {note}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {customPath.map((note, idx) => (
                <span key={`custom-seq-${note}-${idx}`} className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black text-white ${NOTE_COLOR[note]}`}>
                  {note}
                </span>
              ))}
            </div>
            {useCustomPath && (
              <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-cyan-500">Sequência personalizada ativa</p>
            )}
            <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
              <button
                onClick={removeCustomLast}
                className={`min-h-[40px] rounded-lg border px-3 py-2 text-[11px] font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-slate-50 hover:border-cyan-400' : 'border-zinc-700 bg-zinc-900 hover:border-cyan-500'}`}
              >
                Apagar última
              </button>
              <button
                onClick={clearCustomPath}
                className={`min-h-[40px] rounded-lg border px-3 py-2 text-[11px] font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-slate-50 hover:border-cyan-400' : 'border-zinc-700 bg-zinc-900 hover:border-cyan-500'}`}
              >
                Limpar
              </button>
              <button
                onClick={() => {
                  setUseCustomPath(false);
                  restart();
                }}
                className={`min-h-[40px] rounded-lg border px-3 py-2 text-[11px] font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-slate-50 hover:border-cyan-400' : 'border-zinc-700 bg-zinc-900 hover:border-cyan-500'}`}
              >
                Usar caminho pronto
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-3 sm:flex sm:justify-center">
          <button onClick={() => navigateTo('/kids')} className="min-h-[44px] rounded-xl border border-emerald-500 bg-emerald-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-emerald-500">
            Voltar ao Kids
          </button>
        </div>
      </main>
    </div>
  );
};

export default KidsLightHuntPage;
