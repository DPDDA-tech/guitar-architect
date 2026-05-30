import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CHROMATIC_SCALE } from '../music/musicTheory';
import { generateTriadShapes, TriadQuality, TriadInversion, TRIAD_TRAINER_EXERCISES, TriadShape } from '../utils/triadLogic';
import { getFrequencyForPosition, playChord } from '../utils/audio';
import type { Lang } from '../i18n';

interface TriadTrainerProps {
  isLight: boolean;
  lang: Lang;
  tuning: string[];
  onAction: (payload: any) => void;
}

const stringSetOptions = [
  { label: '1-2-3 (E B G)', value: [0, 1, 2] },
  { label: '2-3-4 (B G D)', value: [1, 2, 3] },
  { label: '3-4-5 (G D A)', value: [2, 3, 4] },
  { label: '4-5-6 (D A E)', value: [3, 4, 5] },
];

const TriadTrainer: React.FC<TriadTrainerProps> = ({ isLight, lang, tuning, onAction }) => {
  const [root, setRoot] = useState('C');
  const [quality, setQuality] = useState<TriadQuality>('major');
  const [stringSet, setStringSet] = useState<number[]>([0, 1, 2]);
  const [bpm, setBpm] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const buildSequence = useCallback((): TriadShape[] => {
    const currentTuning = tuning.length ? tuning : ['E', 'B', 'G', 'D', 'A', 'E'];
    const anchors = [0, 3, 5, 7, 9, 12, 14, 15, 17, 19, 21];
    const shapes = anchors.flatMap(anchor =>
      (['root', 'first', 'second'] as TriadInversion[])
        .map(inv => generateTriadShapes(root, quality, stringSet, inv, currentTuning, anchor))
    );

    const uniqueShapes = new Map<string, TriadShape>();
    shapes.forEach(shape => {
      const frets = shape.positions.map(position => position.fret);
      const minFret = Math.min(...frets);
      const maxFret = Math.max(...frets);
      if (minFret < 0 || maxFret > 24 || maxFret - minFret > 7) return;

      const key = shape.positions.map(position => `${position.string}:${position.fret}:${position.note}`).join('|');
      if (!uniqueShapes.has(key)) uniqueShapes.set(key, shape);
    });

    return Array.from(uniqueShapes.values()).sort((a, b) => {
      const fretsA = a.positions.map(position => position.fret);
      const fretsB = b.positions.map(position => position.fret);
      const centerA = fretsA.reduce((sum, fret) => sum + fret, 0) / fretsA.length;
      const centerB = fretsB.reduce((sum, fret) => sum + fret, 0) / fretsB.length;
      if (centerA !== centerB) return centerA - centerB;
      return Math.min(...fretsA) - Math.min(...fretsB);
    });
  }, [root, quality, stringSet, tuning]);

  const sequence = useMemo(() => buildSequence(), [buildSequence]);
  const currentShape = sequence[stepIndex] || sequence[0];

  const qualityLabels: Record<TriadQuality, string> = {
    major: lang === 'pt' ? 'Maior' : 'Major',
    minor: lang === 'pt' ? 'Menor' : 'Minor',
    diminished: lang === 'pt' ? 'Diminuta' : 'Diminished',
    augmented: lang === 'pt' ? 'Aumentada' : 'Augmented',
  };

  const inversionLabels: Record<TriadInversion, string> = {
    root: lang === 'pt' ? 'Fundamental' : 'Root',
    first: lang === 'pt' ? '1ª Inv.' : '1st Inv.',
    second: lang === 'pt' ? '2ª Inv.' : '2nd Inv.',
  };

  useEffect(() => {
    setStepIndex(0);
  }, [root, quality, stringSet]);

  useEffect(() => {
    if (!isPlaying || sequence.length === 0) return;
    const intervalId = window.setInterval(() => {
      setStepIndex(prev => (prev + 1) % sequence.length);
    }, (60000 / bpm) * 4);

    return () => window.clearInterval(intervalId);
  }, [isPlaying, bpm, sequence.length]);

  useEffect(() => {
    if (!soundEnabled || !currentShape || !isPlaying) return;

    const frequencies = currentShape.positions.map(position =>
      getFrequencyForPosition('guitar-6', tuning, position.string, position.fret)
    );

    void playChord(frequencies);
  }, [currentShape, soundEnabled, tuning, isPlaying]);

  const showSequenceOnFretboard = () => {
    if (sequence.length === 0) return;
    onAction({
      type: 'triad-trainer-sequence',
      source: 'triad-trainer',
      action: 'startPractice',
      payload: {
        sequence,
        bpm,
        soundEnabled,
        root,
        quality,
      }
    });
    window.history.pushState(null, '', '/studio');
    window.dispatchEvent(new Event('ga-route-change'));
  };

  const showCurrentShapeOnFretboard = () => {
    if (!currentShape) return;
    onAction({
      type: 'showTriadShape',
      source: 'triad-trainer',
      action: 'startPractice',
      payload: {
        ...currentShape,
        harmonyMode: 'OFF',
        labelMode: 'fingering',
        soundEnabled,
        root,
        quality,
      }
    });
    window.history.pushState(null, '', '/studio');
    window.dispatchEvent(new Event('ga-route-change'));
  };

  const toggleAutoplay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      showSequenceOnFretboard();
      return;
    }

    setIsPlaying(false);
  };

  const btnClass = (active: boolean) => `
    rounded-xl border px-3 py-2 text-[10px] font-black uppercase transition-all
    ${active
      ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/20'
      : isLight ? 'border-zinc-200 bg-white text-zinc-600 hover:border-blue-400' : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-blue-500'}
  `;

  if (!currentShape) return null;

  return (
    <div className={`mb-8 space-y-6 rounded-3xl border p-6 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-blue-900/30 bg-[#080c14]'}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Study Tool</p>
          <h3 className="text-xl font-black italic uppercase tracking-tighter">Triad Trainer</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase text-zinc-500">Tempo</span>
            <input
              type="number"
              min={40}
              max={200}
              value={bpm}
              onChange={e => setBpm(Math.max(40, Math.min(200, Number(e.target.value) || 80)))}
              className={`w-16 bg-transparent text-right text-lg font-black outline-none ${isLight ? 'text-zinc-900' : 'text-white'}`}
            />
          </div>
          <button
            onClick={toggleAutoplay}
            className={`flex h-12 min-w-16 items-center justify-center rounded-full border px-4 text-[10px] font-black uppercase text-white shadow-xl transition-all hover:-translate-y-0.5 ${
              isPlaying
                ? 'border-rose-300/50 bg-[linear-gradient(135deg,#19070b,#881337_58%,#ef4444)] shadow-rose-500/25'
                : 'border-cyan-300/50 bg-[linear-gradient(135deg,#06111f,#2563eb_55%,#22d3ee)] shadow-cyan-500/25'
            }`}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase transition-all ${soundEnabled ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-white'}`}
          >
            {soundEnabled ? (lang === 'pt' ? 'Som ON' : 'Sound ON') : (lang === 'pt' ? 'Som OFF' : 'Sound OFF')}
          </button>
        </div>
      </div>

      <div className={`rounded-3xl border p-4 text-sm font-semibold ${
        isLight
          ? 'border-blue-200 bg-blue-50/85 text-blue-950 shadow-[0_18px_50px_rgba(37,99,235,0.08)]'
          : 'border-blue-900/45 bg-blue-950/20 text-blue-100 shadow-[0_0_32px_rgba(37,99,235,0.08)]'
      }`}>
        {lang === 'pt'
          ? 'Inicie o treino de tríades, envie a sequência ao fretboard e acompanhe a região harmônica ativa.'
          : 'Start triad practice, send the sequence to the fretboard and follow the active harmonic region.'}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Base</span>
          <div className="grid grid-cols-2 gap-2">
            <select value={root} onChange={e => setRoot(e.target.value)} className={`rounded-xl border p-2 text-xs font-black uppercase ${isLight ? 'bg-white' : 'border-zinc-800 bg-zinc-900'}`}>
              {CHROMATIC_SCALE.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select value={quality} onChange={e => setQuality(e.target.value as TriadQuality)} className={`rounded-xl border p-2 text-xs font-black uppercase ${isLight ? 'bg-white' : 'border-zinc-800 bg-zinc-900'}`}>
              <option value="major">{lang === 'pt' ? 'Maior' : 'Major'}</option>
              <option value="minor">{lang === 'pt' ? 'Menor' : 'Minor'}</option>
              <option value="diminished">{lang === 'pt' ? 'Diminuta' : 'Diminished'}</option>
              <option value="augmented">{lang === 'pt' ? 'Aumentada' : 'Augmented'}</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {stringSetOptions.map(opt => (
              <button key={opt.label} onClick={() => setStringSet(opt.value)} className={btnClass(JSON.stringify(stringSet) === JSON.stringify(opt.value))}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{lang === 'pt' ? 'Inversões' : 'Inversions'}</span>
          <div className="grid grid-cols-3 gap-2">
            {(['root', 'first', 'second'] as TriadInversion[]).map(inv => (
              <button key={inv} onClick={() => setStepIndex(['root', 'first', 'second'].indexOf(inv))} className={btnClass(stepIndex === ['root', 'first', 'second'].indexOf(inv))}>
                {inversionLabels[inv]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm text-blue-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">{lang === 'pt' ? 'Sequência' : 'Sequence'}</p>
            <p className="mt-1 text-base font-black">
              {lang === 'pt' ? 'Tríade atual' : 'Current triad'}: {currentShape.root} {qualityLabels[currentShape.quality]} - {inversionLabels[currentShape.inversion]}
            </p>
            <p className="text-[11px] text-blue-100/80">{lang === 'pt' ? 'Cordas' : 'Strings'}: {currentShape.stringSet.map(n => n + 1).join('-')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setStepIndex(prev => (prev - 1 + sequence.length) % sequence.length)} className={btnClass(true)}>
              {lang === 'pt' ? 'Anterior' : 'Previous'}
            </button>
            <button onClick={() => setStepIndex(prev => (prev + 1) % sequence.length)} className={btnClass(true)}>
              {lang === 'pt' ? 'Próxima' : 'Next'}
            </button>
            <button
              onClick={toggleAutoplay}
              className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase text-white transition-all hover:-translate-y-0.5 ${
                isPlaying
                  ? 'border-rose-300/50 bg-[linear-gradient(135deg,#19070b,#881337_58%,#ef4444)] shadow-[0_0_22px_rgba(244,63,94,0.2)]'
                  : 'border-cyan-300/50 bg-[linear-gradient(135deg,#06111f,#2563eb_55%,#22d3ee)] shadow-[0_0_24px_rgba(34,211,238,0.22)]'
              }`}
            >
              {isPlaying ? (lang === 'pt' ? 'Pausar' : 'Pause') : 'Autoplay'}
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-blue-200">BPM</span>
          <input
            type="number"
            min={40}
            max={200}
            value={bpm}
            onChange={e => setBpm(Math.max(40, Math.min(200, Number(e.target.value) || 80)))}
            className="w-20 rounded-xl border border-blue-300/50 bg-slate-900/10 px-3 py-2 text-sm font-black text-white"
          />
          <button onClick={showCurrentShapeOnFretboard} className="rounded-xl bg-slate-900/80 px-4 py-2 text-[10px] font-black uppercase text-white shadow-lg shadow-slate-900/20">
            {lang === 'pt' ? 'Mostrar no braço' : 'Show on fretboard'}
          </button>
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="text-[9px] font-black uppercase text-zinc-400">Presets</span>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
          {TRIAD_TRAINER_EXERCISES.map(ex => (
            <button
              key={ex.id}
              className={`rounded-2xl border p-3 text-left text-[10px] font-bold leading-tight ${isLight ? 'border-zinc-200 bg-white hover:border-blue-400' : 'border-zinc-800 bg-zinc-900 hover:border-blue-500'}`}
            >
              {ex.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TriadTrainer;
