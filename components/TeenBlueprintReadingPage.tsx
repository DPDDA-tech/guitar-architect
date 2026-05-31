import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getTeensTheme } from '../utils/ecosystemPreferences';
import { addTeensXp, getRankProgress, getTeensXp } from '../utils/teenProgress';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

type Quiz = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  xp: number;
};

type Subdivision = 1 | 2 | 4;
type TimeSignature = '4/4' | '3/4' | '6/8';
type FigureId =
  | 'semibreve'
  | 'minima'
  | 'seminima'
  | 'colcheia'
  | 'semicolcheia'
  | 'pausa-semibreve'
  | 'pausa-minima'
  | 'pausa-seminima'
  | 'pausa-colcheia'
  | 'pausa-semicolcheia';

type BlueprintPattern = {
  id: string;
  title: string;
  notes: Array<{ x: number; y: number; color: string }>;
  description: string;
};

type RepertoireFragment = {
  id: string;
  title: string;
  source: string;
  level: 'easy' | 'medium' | 'hard';
  staffNotes: Array<{ x: number; y: number; color: string }>;
  tabLines: string[];
  tip: string;
};

type ClefInfo = {
  id: 'sol' | 'fa' | 'do';
  name: string;
  symbol: string;
  usage: string;
  anchor: string;
  lineLabels: string[];
  spaceLabels: string[];
  lineNoteY: number[];
  spaceNoteY: number[];
};

const quizzes: Quiz[] = [
  {
    id: 'q1',
    prompt: 'No blueprint musical, o eixo horizontal mostra...',
    options: ['Altura da nota', 'Tempo da música', 'Volume'],
    answer: 'Tempo da música',
    xp: 8,
  },
  {
    id: 'q2',
    prompt: 'Se a nota está mais alta na pauta, ela tende a ser...',
    options: ['Mais grave', 'Mais aguda', 'Mais curta'],
    answer: 'Mais aguda',
    xp: 8,
  },
  {
    id: 'q3',
    prompt: 'Na leitura híbrida, a TAB ajuda primeiro em...',
    options: ['Quando tocar', 'Onde colocar o dedo', 'Tonalidade final'],
    answer: 'Onde colocar o dedo',
    xp: 10,
  },
];

const figures: { id: FigureId; label: string; beats: number; symbol: string; group: 'nota' | 'pausa' }[] = [
  { id: 'semibreve', label: 'Semibreve', beats: 4, symbol: '𝅝', group: 'nota' },
  { id: 'minima', label: 'Mínima', beats: 2, symbol: '𝅗𝅥', group: 'nota' },
  { id: 'seminima', label: 'Semínima', beats: 1, symbol: '♩', group: 'nota' },
  { id: 'colcheia', label: 'Colcheia', beats: 0.5, symbol: '♪', group: 'nota' },
  { id: 'semicolcheia', label: 'Semicolcheia', beats: 0.25, symbol: '♬', group: 'nota' },
  { id: 'pausa-semibreve', label: 'Pausa de semibreve', beats: 4, symbol: '𝄻', group: 'pausa' },
  { id: 'pausa-minima', label: 'Pausa de mínima', beats: 2, symbol: '𝄼', group: 'pausa' },
  { id: 'pausa-seminima', label: 'Pausa de semínima', beats: 1, symbol: '𝄽', group: 'pausa' },
  { id: 'pausa-colcheia', label: 'Pausa de colcheia', beats: 0.5, symbol: '𝄾', group: 'pausa' },
  { id: 'pausa-semicolcheia', label: 'Pausa de semicolcheia', beats: 0.25, symbol: '𝄿', group: 'pausa' },
];

const blueprintPatterns: BlueprintPattern[] = [
  {
    id: 'asc',
    title: 'Linha Ascendente',
    notes: [
      { x: 70, y: 68, color: '#22d3ee' },
      { x: 145, y: 52, color: '#a855f7' },
      { x: 220, y: 36, color: '#f472b6' },
    ],
    description: 'As notas sobem no eixo vertical: sensação de subida melódica.',
  },
  {
    id: 'desc',
    title: 'Linha Descendente',
    notes: [
      { x: 70, y: 36, color: '#22d3ee' },
      { x: 145, y: 52, color: '#a855f7' },
      { x: 220, y: 68, color: '#f472b6' },
    ],
    description: 'As notas descem no eixo vertical: sensação de queda melódica.',
  },
  {
    id: 'jump',
    title: 'Saltos',
    notes: [
      { x: 70, y: 68, color: '#22d3ee' },
      { x: 145, y: 36, color: '#a855f7' },
      { x: 220, y: 68, color: '#f472b6' },
    ],
    description: 'Alterna grave/agudo: leitura de salto intervalar.',
  },
  {
    id: 'repeat',
    title: 'Repetição Rítmica',
    notes: [
      { x: 70, y: 52, color: '#22d3ee' },
      { x: 120, y: 52, color: '#22d3ee' },
      { x: 170, y: 52, color: '#22d3ee' },
      { x: 220, y: 52, color: '#22d3ee' },
    ],
    description: 'Mesma altura em tempos diferentes: foco no ritmo.',
  },
];

const repertoireFragments: RepertoireFragment[] = [
  {
    id: 'ode-joy-a',
    title: 'Ode to Joy (trecho A)',
    source: 'Dominio publico (Beethoven) - versao simplificada de estudo',
    level: 'easy',
    staffNotes: [
      { x: 44, y: 54, color: '#22d3ee' },
      { x: 80, y: 54, color: '#22d3ee' },
      { x: 116, y: 50, color: '#f59e0b' },
      { x: 152, y: 46, color: '#3b82f6' },
      { x: 188, y: 46, color: '#3b82f6' },
      { x: 224, y: 50, color: '#f59e0b' },
      { x: 260, y: 54, color: '#22d3ee' },
      { x: 296, y: 58, color: '#ef4444' },
    ],
    tabLines: ['e|-------------------------------', 'B|--0--0--1--3--3--1--0---------', 'G|-----------------------2------', 'D|-------------------------------', 'A|-------------------------------', 'E|-------------------------------'],
    tip: 'Toque em seminimas constantes e mantenha o pulso firme no metronomo.',
  },
  {
    id: 'saints-hook',
    title: 'When the Saints (hook)',
    source: 'Tradicional - dominio publico - adaptacao para guitarra',
    level: 'easy',
    staffNotes: [
      { x: 44, y: 62, color: '#22d3ee' },
      { x: 80, y: 58, color: '#f59e0b' },
      { x: 116, y: 54, color: '#3b82f6' },
      { x: 152, y: 58, color: '#f59e0b' },
      { x: 188, y: 62, color: '#22d3ee' },
      { x: 224, y: 58, color: '#f59e0b' },
      { x: 260, y: 54, color: '#3b82f6' },
      { x: 296, y: 50, color: '#8b5cf6' },
    ],
    tabLines: ['e|-------------------------------', 'B|--1--3--5--3--1--3--5--6------', 'G|-------------------------------', 'D|-------------------------------', 'A|-------------------------------', 'E|-------------------------------'],
    tip: 'Pense em pergunta e resposta: dois blocos de 4 notas.',
  },
  {
    id: 'greensleeves-core',
    title: 'Greensleeves (motivo central)',
    source: 'Tradicional inglesa - dominio publico - recorte didatico',
    level: 'medium',
    staffNotes: [
      { x: 44, y: 48, color: '#3b82f6' },
      { x: 80, y: 54, color: '#22d3ee' },
      { x: 116, y: 58, color: '#ef4444' },
      { x: 152, y: 54, color: '#22d3ee' },
      { x: 188, y: 50, color: '#f59e0b' },
      { x: 224, y: 46, color: '#8b5cf6' },
      { x: 260, y: 50, color: '#f59e0b' },
      { x: 296, y: 54, color: '#22d3ee' },
    ],
    tabLines: ['e|-----------0--1--0-------------', 'B|--3--1--0-----------3--1------', 'G|-------------------------------', 'D|-------------------------------', 'A|-------------------------------', 'E|-------------------------------'],
    tip: 'Use legato leve entre notas vizinhas para soar mais musical.',
  },
  {
    id: 'fur-elise-hook',
    title: 'Fur Elise (tema reconhecivel)',
    source: 'Dominio publico (Beethoven) - simplificacao melodica',
    level: 'hard',
    staffNotes: [
      { x: 44, y: 38, color: '#8b5cf6' },
      { x: 80, y: 42, color: '#f59e0b' },
      { x: 116, y: 38, color: '#8b5cf6' },
      { x: 152, y: 42, color: '#f59e0b' },
      { x: 188, y: 38, color: '#8b5cf6' },
      { x: 224, y: 46, color: '#3b82f6' },
      { x: 260, y: 40, color: '#a855f7' },
      { x: 296, y: 36, color: '#f472b6' },
    ],
    tabLines: ['e|--0--1--0--1--0--3--2--0------', 'B|------------------------------', 'G|------------------------------', 'D|------------------------------', 'A|------------------------------', 'E|------------------------------'],
    tip: 'Comece lento e busque articulacao clara antes de acelerar.',
  },
];

const clefData: ClefInfo[] = [
  {
    id: 'sol',
    name: 'Clave de Sol',
    symbol: '𝄞',
    usage: 'Vozes agudas: guitarra, violino, voz feminina e melodia principal.',
    anchor: 'A espiral marca o SOL na 2a linha da pauta.',
    lineLabels: ['MI', 'SOL', 'SI', 'RE', 'FA'],
    spaceLabels: ['FA', 'LA', 'DO', 'MI'],
    lineNoteY: [84, 72, 60, 48, 36],
    spaceNoteY: [78, 66, 54, 42],
  },
  {
    id: 'fa',
    name: 'Clave de Fa',
    symbol: '𝄢',
    usage: 'Vozes graves: baixo, tuba, cello e mao esquerda do piano.',
    anchor: 'Os dois pontos marcam o FA na 4a linha da pauta.',
    lineLabels: ['SOL', 'SI', 'RE', 'FA', 'LA'],
    spaceLabels: ['LA', 'DO', 'MI', 'SOL'],
    lineNoteY: [84, 72, 60, 48, 36],
    spaceNoteY: [78, 66, 54, 42],
  },
  {
    id: 'do',
    name: 'Clave de Do',
    symbol: '𝄡',
    usage: 'Regiao media: viola classica e algumas partituras corais.',
    anchor: 'O centro do simbolo marca o DO (pode mudar de linha).',
    lineLabels: ['FA', 'LA', 'DO', 'MI', 'SOL'],
    spaceLabels: ['SOL', 'SI', 'RE', 'FA'],
    lineNoteY: [84, 72, 60, 48, 36],
    spaceNoteY: [78, 66, 54, 42],
  },
];


const TeenBlueprintReadingPage: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [xp, setXp] = useState<number>(() => getTeensXp());
  const [quizIndex, setQuizIndex] = useState(0);
  const [feedback, setFeedback] = useState('Comece pelos painéis e finalize com mini desafios.');
  const [locked, setLocked] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [focusAxis, setFocusAxis] = useState<'time' | 'pitch'>('time');

  const [bpm, setBpm] = useState(80);
  const [subdivision, setSubdivision] = useState<Subdivision>(1);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [tickIndex, setTickIndex] = useState(0);

  const [selectedFigure, setSelectedFigure] = useState<FigureId>('seminima');
  const [selectedPatternId, setSelectedPatternId] = useState<string>(blueprintPatterns[0].id);
  const [selectedFragmentId, setSelectedFragmentId] = useState<string>(repertoireFragments[0].id);
  const [selectedClefId, setSelectedClefId] = useState<ClefInfo['id']>('sol');

  const audioContextRef = useRef<AudioContext | null>(null);
  const metronomeTimerRef = useRef<number | null>(null);

  const isLight = theme === 'light';
  const rankProgress = getRankProgress(xp);
  const quiz = useMemo(() => quizzes[quizIndex], [quizIndex]);
  const selectedFigureData = figures.find((item) => item.id === selectedFigure) ?? figures[2];
  const selectedPattern = blueprintPatterns.find((pattern) => pattern.id === selectedPatternId) ?? blueprintPatterns[0];
  const selectedFragment = repertoireFragments.find((fragment) => fragment.id === selectedFragmentId) ?? repertoireFragments[0];
  const selectedClef = clefData.find((clef) => clef.id === selectedClefId) ?? clefData[0];

  const beatsPerBar = timeSignature === '3/4' ? 3 : timeSignature === '6/8' ? 6 : 4;

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? '#cbd5e1' : '#1e1b4b'} 1px, transparent 1px)`,
    backgroundSize: '100% 30px',
  };

  const getAudioCtx = async () => {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    return audioContextRef.current;
  };

  const playTick = async (strong: boolean) => {
    const ctx = await getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = strong ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(strong ? 980 : 620, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  };

  useEffect(() => {
    if (!metronomeOn) {
      if (metronomeTimerRef.current) {
        window.clearInterval(metronomeTimerRef.current);
        metronomeTimerRef.current = null;
      }
      return;
    }

    const stepMs = Math.max(60, Math.round((60_000 / bpm) / subdivision));
    setTickIndex(0);

    metronomeTimerRef.current = window.setInterval(() => {
      setTickIndex((prev) => {
        const next = (prev + 1) % (beatsPerBar * subdivision);
        const beatPosition = Math.floor(next / subdivision);
        const isStrong = beatPosition === 0 && next % subdivision === 0;
        void playTick(isStrong);
        return next;
      });
    }, stepMs);

    void playTick(true);

    return () => {
      if (metronomeTimerRef.current) {
        window.clearInterval(metronomeTimerRef.current);
        metronomeTimerRef.current = null;
      }
    };
  }, [metronomeOn, bpm, subdivision, timeSignature]);

  const handleAnswer = (choice: string) => {
    if (locked) return;
    setLocked(true);
    if (choice === quiz.answer) {
      const nextXp = addTeensXp(quiz.xp);
      setXp(nextXp);
      setFeedback(`Acertou! +${quiz.xp} XP`);
    } else {
      setFeedback(`Quase! Resposta certa: ${quiz.answer}`);
    }
    window.setTimeout(() => {
      setQuizIndex((prev) => (prev + 1) % quizzes.length);
      setLocked(false);
    }, 950);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-[#02030a] text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.14),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.16),transparent_48%)]" />

      <main className="relative mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-400">GA Teens</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Blueprint Reading</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Pauta como planta baixa: altura no eixo Y, tempo no eixo X, com apoio da TAB.
          </p>
        </header>

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-indigo-900/70 bg-zinc-950/75'}`}>
          <div className={`rounded-xl border px-4 py-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-indigo-800/70 bg-zinc-900/70'}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Progressão</p>
              <p className="text-xs font-black uppercase">
                Rank: <span className={rankProgress.current.accentClass}>{rankProgress.current.label}</span> · XP {xp}
              </p>
            </div>
            <div className={`mt-2 h-2 w-full rounded-full ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`}>
              <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 transition-all" style={{ width: `${rankProgress.percent}%` }} />
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-700 bg-zinc-900/70'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Painel 1 · Mapa Visual</p>
              <div className="mt-3 rounded-xl border border-cyan-400/40 p-3">
                <svg viewBox="0 0 360 120" className="h-28 w-full" fill="none">
                  {[20, 35, 50, 65, 80].map((y) => <line key={y} x1="10" y1={y} x2="350" y2={y} stroke="#64748b" strokeWidth="1.2" />)}
                  {selectedPattern.notes.map((note, idx) => (
                    <React.Fragment key={`${selectedPattern.id}-${idx}`}>
                      <circle cx={note.x} cy={note.y} r="5" fill={idx === 0 && focusAxis === 'time' ? '#22d3ee' : note.color} />
                      <line x1={note.x} y1="15" x2={note.x} y2="100" stroke={idx === 0 && focusAxis === 'time' ? '#22d3ee' : '#334155'} strokeDasharray="3 3" />
                    </React.Fragment>
                  ))}
                </svg>
              </div>
              <p className="mt-3 text-xs font-bold opacity-80">Vertical = altura da nota. Horizontal = momento no tempo.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {blueprintPatterns.map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => setSelectedPatternId(pattern.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-[10px] font-black uppercase ${selectedPatternId === pattern.id ? 'border-cyan-300 bg-cyan-500/20 text-cyan-200' : isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-900'}`}
                  >
                    {pattern.title}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs font-bold opacity-80">{selectedPattern.description}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setFocusAxis('time')}
                  className={`rounded-lg border px-3 py-1 text-[10px] font-black uppercase ${focusAxis === 'time' ? 'border-cyan-300 bg-cyan-500/20 text-cyan-200' : isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-900'}`}
                >
                  Foco no tempo
                </button>
                <button
                  onClick={() => setFocusAxis('pitch')}
                  className={`rounded-lg border px-3 py-1 text-[10px] font-black uppercase ${focusAxis === 'pitch' ? 'border-violet-300 bg-violet-500/20 text-violet-200' : isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-900'}`}
                >
                  Foco na altura
                </button>
              </div>
            </article>

            <article className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-700 bg-zinc-900/70'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Painel 2 · Repertório Guiado</p>
              <div className="mt-3 rounded-xl border border-violet-400/40 p-3">
                <div className="text-[11px] font-black tracking-wide opacity-90">{selectedFragment.title}</div>
                <svg viewBox="0 0 340 110" className="mt-2 h-24 w-full" fill="none">
                  {[18, 32, 46, 60, 74].map((y) => <line key={y} x1="10" y1={y} x2="330" y2={y} stroke="#64748b" strokeWidth="1.2" />)}
                  {selectedFragment.staffNotes.map((note, idx) => (
                    <React.Fragment key={`${selectedFragment.id}-staff-${idx}`}>
                      <circle cx={note.x} cy={note.y} r="4.8" fill={note.color} />
                      <line x1={note.x + 5} y1={note.y} x2={note.x + 5} y2={note.y - 18} stroke="#94a3b8" strokeWidth="1.4" />
                    </React.Fragment>
                  ))}
                </svg>
                {tabVisible && (
                  <div className="mt-2 rounded-lg border border-violet-300/30 px-3 py-2">
                    <div className="text-[11px] font-black opacity-80">TAB (abaixo da pauta):</div>
                    <div className="mt-1 font-mono text-[11px] leading-5 opacity-90">
                      {selectedFragment.tabLines.map((line, idx) => (
                        <div key={`${selectedFragment.id}-tab-${idx}`}>{line}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-violet-400">{selectedFragment.source}</p>
              <p className="mt-2 text-xs font-bold opacity-80">{selectedFragment.tip}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {repertoireFragments.map((fragment) => (
                  <button
                    key={fragment.id}
                    onClick={() => setSelectedFragmentId(fragment.id)}
                    className={`rounded-lg border px-3 py-2 text-left ${selectedFragmentId === fragment.id ? 'border-violet-300 bg-violet-500/20' : isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-900'}`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.14em]">{fragment.title}</p>
                    <p className="mt-1 text-[10px] font-bold opacity-70">Nivel {fragment.level.toUpperCase()}</p>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs font-bold opacity-80">TAB mostra onde tocar. Pauta mostra quando e duração.</p>
              <button
                onClick={() => setTabVisible((v) => !v)}
                className={`mt-3 rounded-lg border px-3 py-1 text-[10px] font-black uppercase ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-900'}`}
              >
                {tabVisible ? 'Esconder TAB (modo avançando)' : 'Mostrar TAB (modo apoio)'}
              </button>
            </article>
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${isLight ? 'border-emerald-200 bg-emerald-50/80' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Painel 3 · Metrônomo e Subdivisão</p>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <label className="rounded-xl border px-3 py-2 text-xs font-black uppercase">
                BPM: {bpm}
                <input
                  className="mt-2 w-full"
                  type="range"
                  min={50}
                  max={180}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                />
              </label>
              <div className="rounded-xl border px-3 py-2 text-xs font-black uppercase">
                Subdivisão
                <div className="mt-2 flex gap-2">
                  {[1, 2, 4].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSubdivision(value as Subdivision)}
                      className={`rounded-lg border px-2 py-1 text-[10px] ${subdivision === value ? 'border-cyan-300 bg-cyan-500/20 text-cyan-200' : ''}`}
                    >
                      {value === 1 ? '1/4' : value === 2 ? '1/8' : '1/16'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border px-3 py-2 text-xs font-black uppercase">
                Compasso
                <div className="mt-2 flex gap-2">
                  {(['4/4', '3/4', '6/8'] as TimeSignature[]).map((sig) => (
                    <button
                      key={sig}
                      onClick={() => setTimeSignature(sig)}
                      className={`rounded-lg border px-2 py-1 text-[10px] ${timeSignature === sig ? 'border-violet-300 bg-violet-500/20 text-violet-200' : ''}`}
                    >
                      {sig}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border px-3 py-2 text-xs font-black uppercase">
                Transporte
                <button
                  onClick={() => setMetronomeOn((v) => !v)}
                  className={`mt-2 w-full rounded-lg border px-3 py-2 text-[10px] ${metronomeOn ? 'border-emerald-300 bg-emerald-500/20 text-emerald-200' : ''}`}
                >
                  {metronomeOn ? 'Parar Metrônomo' : 'Iniciar Metrônomo'}
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-8 gap-1">
              {Array.from({ length: beatsPerBar * subdivision }).map((_, idx) => {
                const active = metronomeOn && idx === tickIndex;
                const strong = idx % subdivision === 0 && Math.floor(idx / subdivision) === 0;
                return (
                  <div
                    key={`tick-${idx}`}
                    className={`h-3 rounded ${active ? (strong ? 'bg-cyan-300' : 'bg-cyan-500') : isLight ? 'bg-slate-200' : 'bg-zinc-800'}`}
                  />
                );
              })}
            </div>
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${isLight ? 'border-amber-200 bg-amber-50/80' : 'border-amber-500/30 bg-amber-500/10'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Painel 4 · Figuras Rítmicas</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {figures.map((fig) => (
                <button
                  key={fig.id}
                  onClick={() => setSelectedFigure(fig.id)}
                  className={`rounded-xl border px-3 py-3 text-left ${selectedFigure === fig.id ? 'border-amber-300 bg-amber-500/20' : ''}`}
                >
                  <p className="text-xs font-black uppercase">{fig.label}</p>
                  <p className="mt-1 text-xl">{fig.symbol}</p>
                  <p className="mt-1 text-[10px] font-black uppercase opacity-70">{fig.group}</p>
                  <p className="mt-1 text-[10px] font-black opacity-80">{fig.beats} tempo(s)</p>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs font-bold opacity-85">
              Figura ativa: {selectedFigureData.label} ({selectedFigureData.beats} tempo(s)).
            </p>
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${isLight ? 'border-sky-200 bg-sky-50/80' : 'border-sky-500/30 bg-sky-500/10'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">Painel 5 · Claves e Posições</p>
            <p className="mt-2 text-xs font-bold opacity-85">
              A clave define o mapa da pauta. Mudou a clave, muda a posição das notas.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {clefData.map((clef) => (
                <button
                  key={clef.id}
                  onClick={() => setSelectedClefId(clef.id)}
                  className={`rounded-lg border px-3 py-2 text-left ${selectedClefId === clef.id ? 'border-sky-300 bg-sky-500/20' : isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-900'}`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.14em]">{clef.name}</p>
                </button>
              ))}
            </div>

            <div className={`mt-3 rounded-xl border p-3 ${isLight ? 'border-sky-200 bg-white' : 'border-sky-400/30 bg-zinc-900/70'}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedClef.symbol}</span>
                <div>
                  <p className="text-sm font-black">{selectedClef.name}</p>
                  <p className="text-xs font-bold opacity-80">{selectedClef.usage}</p>
                </div>
              </div>
              <p className="mt-2 text-xs font-bold text-sky-400">{selectedClef.anchor}</p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className={`rounded-lg border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-700 bg-zinc-950/60'}`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-400">Linhas (de baixo para cima)</p>
                  <svg viewBox="0 0 280 110" className="mt-2 h-28 w-full" fill="none">
                    {[36, 48, 60, 72, 84].map((y) => (
                      <line key={`line-guide-${y}`} x1="12" y1={y} x2="268" y2={y} stroke="#64748b" strokeWidth="1.2" />
                    ))}
                    <text x="18" y="28" fill={isLight ? '#0f172a' : '#cbd5e1'} fontSize="20">{selectedClef.symbol}</text>
                    {selectedClef.lineLabels.map((label, idx) => {
                      const x = 70 + idx * 40;
                      const y = selectedClef.lineNoteY[idx];
                      return (
                        <g key={`line-note-${label}-${idx}`}>
                          <circle cx={x} cy={y} r="7" fill="#38bdf8" />
                          <text x={x} y={y + 3} textAnchor="middle" fill="#082f49" fontSize="8" fontWeight="700">{label}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <div className={`rounded-lg border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-700 bg-zinc-950/60'}`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-400">Espaços (de baixo para cima)</p>
                  <svg viewBox="0 0 280 110" className="mt-2 h-28 w-full" fill="none">
                    {[36, 48, 60, 72, 84].map((y) => (
                      <line key={`space-guide-${y}`} x1="12" y1={y} x2="268" y2={y} stroke="#64748b" strokeWidth="1.2" />
                    ))}
                    <text x="18" y="28" fill={isLight ? '#0f172a' : '#cbd5e1'} fontSize="20">{selectedClef.symbol}</text>
                    {selectedClef.spaceLabels.map((label, idx) => {
                      const x = 84 + idx * 44;
                      const y = selectedClef.spaceNoteY[idx];
                      return (
                        <g key={`space-note-${label}-${idx}`}>
                          <circle cx={x} cy={y} r="7" fill="#a78bfa" />
                          <text x={x} y={y + 3} textAnchor="middle" fill="#2e1065" fontSize="8" fontWeight="700">{label}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-700 bg-zinc-900/70'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Mini Desafios (Complemento)</p>
            <p className="mt-2 text-sm font-black">{quiz.prompt}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quiz.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={locked}
                  className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'} disabled:opacity-50`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className={`mt-3 rounded-xl border px-4 py-3 text-sm font-black ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
              {feedback}
            </div>
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

export default TeenBlueprintReadingPage;
