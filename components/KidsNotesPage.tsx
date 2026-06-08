import React, { useEffect, useRef, useState } from 'react';
import { getKidsTheme } from '../utils/ecosystemPreferences';

type NoteId = 'DO' | 'RE' | 'MI' | 'FA' | 'SOL' | 'LA' | 'SI';

type Challenge = {
  id: string;
  prompt: string;
  options: NoteId[];
  answer: NoteId;
};

type MelodyChallenge = {
  id: string;
  title: string;
  notes: NoteId[];
  displayNotes: string;
  bpm?: number;
  level: 'kids-beginner';
  source: string;
};

type NoteLetterChallenge = {
  note: NoteId;
  correctLetter: string;
  options: string[];
};

const NOTES: Array<{ id: NoteId; color: string; glow: string; curiosity: string; colorName: string }> = [
  { id: 'DO',  color: 'bg-red-500',    glow: 'shadow-red-500/35',    curiosity: 'A nota DO abre muitas músicas infantis.',  colorName: 'vermelha' },
  { id: 'RE', color: 'bg-orange-500', glow: 'shadow-orange-500/35', curiosity: 'A nota RE ajuda a melodia a caminhar.', colorName: 'laranja' },
  { id: 'MI', color: 'bg-yellow-400', glow: 'shadow-yellow-400/35', curiosity: 'A nota MI aparece em varias cancoes alegres.', colorName: 'amarela' },
  { id: 'FA',  color: 'bg-green-500',  glow: 'shadow-green-500/35',  curiosity: 'A nota FA traz um brilho especial para a música.',  colorName: 'verde' },
  { id: 'SOL', color: 'bg-blue-500',   glow: 'shadow-blue-500/35',   curiosity: 'A nota SOL é fácil de lembrar por ser o nome de uma estrela.', colorName: 'azul' },
  { id: 'LA',  color: 'bg-violet-500', glow: 'shadow-violet-500/35', curiosity: 'A nota LA está em muitas melodias conhecidas.', colorName: 'roxa' },
  { id: 'SI',  color: 'bg-pink-500',   glow: 'shadow-pink-500/35',   curiosity: 'A nota SI prepara o retorno para o DO.', colorName: 'rosa' },
];

const CHALLENGES: Challenge[] = [
  { id: 'c1', prompt: 'Clique na nota azul', options: ['DO', 'RE', 'SOL', 'LA'], answer: 'SOL' },
  { id: 'c2', prompt: 'Qual nota vem depois do DO?', options: ['RE', 'MI', 'FA', 'SI'], answer: 'RE' },
  { id: 'c3', prompt: 'Encontre a nota vermelha', options: ['DO', 'FA', 'LA', 'SI'], answer: 'DO' },
  { id: 'c4', prompt: 'Clique na nota LA', options: ['SI', 'LA', 'RE', 'MI'], answer: 'LA' },
];

const MELODY_CHALLENGES: MelodyChallenge[] = [
  {
    id: 'brilha-brilha',
    title: 'Brilha, Brilha Estrelinha',
    notes: ['DO', 'DO', 'SOL', 'SOL', 'LA', 'LA', 'SOL'],
    displayNotes: 'DO DO SOL SOL LA LA SOL',
    bpm: 92,
    level: 'kids-beginner',
    source: 'Tradicional / Dominio publico',
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    notes: ['SOL', 'SOL', 'LA', 'SOL', 'DO', 'SI'],
    displayNotes: 'SOL SOL LA SOL DO SI',
    bpm: 92,
    level: 'kids-beginner',
    source: 'Tradicional / Dominio publico',
  },
  {
    id: 'alecrim-dourado',
    title: 'Alecrim Dourado',
    notes: ['SOL', 'LA', 'SOL', 'FA', 'MI', 'FA', 'SOL'],
    displayNotes: 'SOL LA SOL FA MI FA SOL',
    bpm: 90,
    level: 'kids-beginner',
    source: 'Tradicional / Dominio publico',
  },
  {
    id: 'um-dois-feijao',
    title: 'Um, Dois, Feijao com Arroz',
    notes: ['DO', 'RE', 'MI', 'DO', 'MI', 'FA', 'SOL'],
    displayNotes: 'DO RE MI DO MI FA SOL',
    bpm: 96,
    level: 'kids-beginner',
    source: 'Tradicional / Dominio publico',
  },
  {
    id: 'a-velha-a-fiar',
    title: 'A Velha a Fiar',
    notes: ['SOL', 'LA', 'SI', 'LA', 'SOL', 'FA', 'MI'],
    displayNotes: 'SOL LA SI LA SOL FA MI',
    bpm: 90,
    level: 'kids-beginner',
    source: 'Tradicional / Dominio publico',
  },
  {
    id: 'teresinha-de-jesus',
    title: 'Teresinha de Jesus',
    notes: ['DO', 'RE', 'MI', 'FA', 'MI', 'RE', 'DO'],
    displayNotes: 'DO RE MI FA MI RE DO',
    bpm: 88,
    level: 'kids-beginner',
    source: 'Tradicional / Dominio publico',
  },
  {
    id: 'dorme-pequenino',
    title: 'Dorme Pequenino',
    notes: ['MI', 'RE', 'DO', 'RE', 'MI', 'MI', 'MI'],
    displayNotes: 'MI RE DO RE MI MI MI',
    bpm: 84,
    level: 'kids-beginner',
    source: 'Tradicional / Dominio publico',
  },
  {
    id: 'marcha-soldado',
    title: 'Marcha Soldado',
    notes: ['SOL', 'SOL', 'LA', 'SOL', 'DO', 'SI'],
    displayNotes: 'SOL SOL LA SOL DO SI',
    bpm: 96,
    level: 'kids-beginner',
    source: 'Tradicional / Dominio publico',
  },
  {
    id: 'a-canoa-virou',
    title: 'A Canoa Virou',
    notes: ['MI', 'MI', 'RE', 'RE', 'DO', 'RE', 'MI'],
    displayNotes: 'MI MI RE RE DO RE MI',
    bpm: 90,
    level: 'kids-beginner',
    source: 'Tradicional / Dominio publico',
  },
  {
    id: 'escravos-de-jo',
    title: 'Escravos de Jo',
    notes: ['DO', 'RE', 'MI', 'RE', 'DO', 'MI', 'SOL'],
    displayNotes: 'DO RE MI RE DO MI SOL',
    bpm: 94,
    level: 'kids-beginner',
    source: 'Tradicional / Dominio publico',
  },
];

const NOTE_FREQUENCIES: Record<NoteId, number> = {
  DO: 261.63,
  RE: 293.66,
  MI: 329.63,
  FA: 349.23,
  SOL: 392.0,
  LA: 440.0,
  SI: 493.88,
};

const NOTE_TO_LETTER: Record<NoteId, string> = {
  DO: 'C',
  RE: 'D',
  MI: 'E',
  FA: 'F',
  SOL: 'G',
  LA: 'A',
  SI: 'B',
};

const MAX_SEQUENCE = 12;
const MAX_MELODY_SEQUENCE = 20;

const NOTE_VISUAL: Record<NoteId, { color: string; glow: string }> = NOTES.reduce((acc, note) => {
  acc[note.id] = { color: note.color, glow: note.glow };
  return acc;
}, {} as Record<NoteId, { color: string; glow: string }>);

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const KidsNotesPage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [selectedNote, setSelectedNote] = useState<NoteId | null>(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeFeedback, setChallengeFeedback] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [noteSequence, setNoteSequence] = useState<NoteId[]>([]);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [playingSequenceIndex, setPlayingSequenceIndex] = useState<number | null>(null);

  const [selectedMelodyId, setSelectedMelodyId] = useState<string>(MELODY_CHALLENGES[0].id);
  const [userMelodySequence, setUserMelodySequence] = useState<NoteId[]>([]);
  const [melodyFeedback, setMelodyFeedback] = useState('');
  const [isPlayingModel, setIsPlayingModel] = useState(false);
  const [isPlayingUserVersion, setIsPlayingUserVersion] = useState(false);
  const [playingModelIndex, setPlayingModelIndex] = useState<number | null>(null);
  const [playingUserIndex, setPlayingUserIndex] = useState<number | null>(null);
  const [memorySequence, setMemorySequence] = useState<NoteId[]>([]);
  const [memoryUserInput, setMemoryUserInput] = useState<NoteId[]>([]);
  const [memoryIsPlaying, setMemoryIsPlaying] = useState(false);
  const [memoryLevel, setMemoryLevel] = useState(0);
  const [memoryFeedback, setMemoryFeedback] = useState('Clique em Começar para seguir as notas.');
  const [memoryPlayingIndex, setMemoryPlayingIndex] = useState<number | null>(null);
  const [letterChallenge, setLetterChallenge] = useState<NoteLetterChallenge | null>(null);
  const [letterFeedback, setLetterFeedback] = useState('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const sequencePlayIdRef = useRef(0);
  const melodyPlayIdRef = useRef(0);
  const memoryPlayIdRef = useRef(0);

  const isLight = theme === 'light';
  const currentChallenge = CHALLENGES[challengeIndex];
  const selectedMelody = MELODY_CHALLENGES.find((item) => item.id === selectedMelodyId) ?? MELODY_CHALLENGES[0];


  const selectedNoteData = NOTES.find(note => note.id === selectedNote);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const playNote = (note: NoteId) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(NOTE_FREQUENCIES[note], now);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.43);
  };

  const playNoteList = async (
    notes: NoteId[],
    setPlayingIndex: React.Dispatch<React.SetStateAction<number | null>>,
    playTokenRef: React.MutableRefObject<number>,
    activeToken: number,
    bpm?: number,
  ) => {
    const beatMs = bpm ? Math.max(260, Math.round((60_000 / bpm) * 0.8)) : 500;

    for (let i = 0; i < notes.length; i += 1) {
      if (playTokenRef.current !== activeToken) break;
      setPlayingIndex(i);
      playNote(notes[i]);
      await new Promise((resolve) => window.setTimeout(resolve, beatMs));
    }

    setPlayingIndex(null);
  };

  const handleChallengeAnswer = (note: NoteId) => {
    if (note === currentChallenge.answer) {
      setChallengeFeedback('Boa! Voce acertou.');
      window.setTimeout(() => {
        setChallengeIndex((prev) => (prev + 1) % CHALLENGES.length);
        setChallengeFeedback('');
      }, 700);
    } else {
      setChallengeFeedback('Quase! Tente outra nota.');
    }
  };

  const addNoteToSequence = (note: NoteId) => {
    setNoteSequence((prev) => {
      if (prev.length >= MAX_SEQUENCE) return prev;
      return [...prev, note];
    });
    playNote(note);
  };

  const clearSequence = () => {
    sequencePlayIdRef.current += 1;
    setIsPlayingSequence(false);
    setPlayingSequenceIndex(null);
    setNoteSequence([]);
  };

  const removeLastSequenceNote = () => {
    setNoteSequence((prev) => prev.slice(0, -1));
  };

  const playSequence = async () => {
    if (noteSequence.length === 0 || isPlayingSequence) return;

    const currentPlayId = sequencePlayIdRef.current + 1;
    sequencePlayIdRef.current = currentPlayId;
    setIsPlayingSequence(true);

    await playNoteList(noteSequence, setPlayingSequenceIndex, sequencePlayIdRef, currentPlayId);

    if (sequencePlayIdRef.current === currentPlayId) {
      setIsPlayingSequence(false);
      setPlayingSequenceIndex(null);
    }
  };

  const addNoteToMelodyVersion = (note: NoteId) => {
    setUserMelodySequence((prev) => {
      if (prev.length >= MAX_MELODY_SEQUENCE) return prev;
      return [...prev, note];
    });
    playNote(note);
    setMelodyFeedback('');
  };

  const clearMelodyVersion = () => {
    melodyPlayIdRef.current += 1;
    setIsPlayingModel(false);
    setIsPlayingUserVersion(false);
    setPlayingModelIndex(null);
    setPlayingUserIndex(null);
    setUserMelodySequence([]);
    setMelodyFeedback('');
  };

  const removeLastMelodyNote = () => {
    setUserMelodySequence((prev) => prev.slice(0, -1));
    setMelodyFeedback('');
  };

  const playModel = async () => {
    if (isPlayingModel) return;
    const token = melodyPlayIdRef.current + 1;
    melodyPlayIdRef.current = token;
    setIsPlayingModel(true);

    await playNoteList(selectedMelody.notes, setPlayingModelIndex, melodyPlayIdRef, token, selectedMelody.bpm);

    if (melodyPlayIdRef.current === token) {
      setIsPlayingModel(false);
      setPlayingModelIndex(null);
    }
  };

  const playUserVersion = async () => {
    if (userMelodySequence.length === 0 || isPlayingUserVersion) return;
    const token = melodyPlayIdRef.current + 1;
    melodyPlayIdRef.current = token;
    setIsPlayingUserVersion(true);

    await playNoteList(userMelodySequence, setPlayingUserIndex, melodyPlayIdRef, token, selectedMelody.bpm);

    if (melodyPlayIdRef.current === token) {
      setIsPlayingUserVersion(false);
      setPlayingUserIndex(null);
    }

    const isEqual = userMelodySequence.length === selectedMelody.notes.length
      && userMelodySequence.every((note, index) => note === selectedMelody.notes[index]);

    setMelodyFeedback(
      isEqual
        ? 'Você encontrou o caminho da música!'
        : 'Ouça de novo e compare com o modelo.'
    );
  };

  const handleMelodyChange = (melodyId: string) => {
    setSelectedMelodyId(melodyId);
    setUserMelodySequence([]);
    setMelodyFeedback('');
    melodyPlayIdRef.current += 1;
    setIsPlayingModel(false);
    setIsPlayingUserVersion(false);
    setPlayingModelIndex(null);
    setPlayingUserIndex(null);
  };

  const randomNote = (): NoteId => NOTES[Math.floor(Math.random() * NOTES.length)].id;

  const randomLetterChallenge = (): NoteLetterChallenge => {
    const note = randomNote();
    const correctLetter = NOTE_TO_LETTER[note];
    const allLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].filter((item) => item !== correctLetter);
    const distractors = allLetters.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [correctLetter, ...distractors].sort(() => Math.random() - 0.5);
    return { note, correctLetter, options };
  };

  useEffect(() => {
    setLetterChallenge(randomLetterChallenge());
  }, []);

  const playMemorySequence = async (sequence: NoteId[]) => {
    if (sequence.length === 0) return;
    const token = memoryPlayIdRef.current + 1;
    memoryPlayIdRef.current = token;
    setMemoryIsPlaying(true);
    setMemoryPlayingIndex(null);

    await playNoteList(sequence, setMemoryPlayingIndex, memoryPlayIdRef, token, 96);

    if (memoryPlayIdRef.current === token) {
      setMemoryIsPlaying(false);
      setMemoryPlayingIndex(null);
    }
  };

  const startMemoryGame = async () => {
    const first = [randomNote()];
    setMemorySequence(first);
    setMemoryUserInput([]);
    setMemoryLevel(1);
      setMemoryFeedback('Olhe e escute o caminho da música.');
    await playMemorySequence(first);
  };

  const replayMemorySequence = async () => {
    if (memorySequence.length === 0) return;
    setMemoryFeedback('Vamos ouvir de novo com calma.');
    await playMemorySequence(memorySequence);
  };

  const resetMemoryGame = () => {
    memoryPlayIdRef.current += 1;
    setMemorySequence([]);
    setMemoryUserInput([]);
    setMemoryIsPlaying(false);
    setMemoryLevel(0);
    setMemoryPlayingIndex(null);
      setMemoryFeedback('Reiniciado! Clique em Começar para um novo caminho.');
  };

  const handleMemoryNoteClick = async (note: NoteId) => {
    if (memoryIsPlaying || memorySequence.length === 0) return;
    playNote(note);
    const nextInput = [...memoryUserInput, note];
    setMemoryUserInput(nextInput);

    const currentIndex = nextInput.length - 1;
    if (memorySequence[currentIndex] !== note) {
      setMemoryFeedback('Quase! Vamos tentar de novo. Voce consegue!');
      setMemoryUserInput([]);
      return;
    }

    if (nextInput.length === memorySequence.length) {
      const nextLevel = memorySequence.length + 1;
      const nextSequence = [...memorySequence, randomNote()];
      setMemoryFeedback(`Boa! Nivel ${nextLevel}. Agora ficou um pouquinho maior.`);
      setMemorySequence(nextSequence);
      setMemoryUserInput([]);
      setMemoryLevel(nextLevel);
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
      await playMemorySequence(nextSequence);
    }
  };

  const handleLetterAnswer = (option: string) => {
    if (!letterChallenge) return;
    if (option === letterChallenge.correctLetter) {
      setLetterFeedback('Boa! Você encontrou a letra da nota.');
    } else {
      setLetterFeedback(`Quase! A letra da nota ${letterChallenge.note} é ${letterChallenge.correctLetter}. Tente de novo!`);
    }

    window.setTimeout(() => {
      setLetterChallenge(randomLetterChallenge());
      setLetterFeedback('');
    }, 900);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>

      <main className="relative mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigateTo('/kids')}
          className={`mb-6 rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-all ${isLight ? 'border-emerald-300 bg-white text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.12)] hover:border-emerald-400 hover:shadow-[0_10px_24px_rgba(16,185,129,0.16)]' : 'border-emerald-500/70 bg-emerald-950/60 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.16),0_0_24px_rgba(16,185,129,0.18)] hover:border-emerald-400 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.22),0_0_30px_rgba(16,185,129,0.24)]'}`}
        >
          Voltar ao Kids
        </button>
        <header className="mb-6 md:mb-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-500">Guitar Architect Kids</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Conhecendo as Notas</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            As músicas usam notas musicais. Vamos descobrir?
          </p>
        </header>

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {NOTES.map((note) => {
              const isActive = selectedNote === note.id;
              return (
                <button
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note.id);
                    playNote(note.id);
                  }}
                  className={`rounded-2xl border px-3 py-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] ${isActive ? 'border-white/70 scale-[1.03]' : isLight ? 'border-slate-200' : 'border-zinc-700'}`}
                >
                  <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white text-xl font-black shadow-lg ${note.color} ${note.glow}`}>
                    {note.id}
                  </div>
                  <p className="mt-3 text-xs font-black uppercase tracking-widest">{note.id}</p>
                </button>
              );
            })}
          </div>

          {selectedNoteData && (
            <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black animate-in fade-in slide-in-from-top-1 duration-300 ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
              Voce encontrou a nota {selectedNoteData.id}!
              <p className="mt-1 text-xs font-semibold opacity-90">{selectedNoteData.curiosity}</p>
            </div>
          )}
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <div className="mb-3 flex justify-end">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-black uppercase text-center leading-tight ${soundEnabled ? 'border-emerald-500 bg-emerald-600 text-white' : isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
            >
              Som: {soundEnabled ? 'Ligado' : 'Desligado'}
            </button>
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">Desafios</p>
          <p className="mt-2 text-sm font-black">{currentChallenge.prompt}</p>

          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {currentChallenge.options.map((option) => (
              <button
                key={option}
                onClick={() => handleChallengeAnswer(option)}
                className={`rounded-xl border px-3 py-3 text-sm font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}
              >
                {option}
              </button>
            ))}
          </div>

          {challengeFeedback && (
            <div className={`mt-3 rounded-xl border px-3 py-2 text-sm font-black ${challengeFeedback.startsWith('Boa') ? (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200') : (isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-500/30 bg-amber-500/10 text-amber-200')}`}>
              {challengeFeedback}
            </div>
          )}
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">Monte sua música</p>
          <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
              Invente sua sequência de notas e aperte play para ouvir.
          </p>

          <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-7">
            {NOTES.map((note) => (
              <button
                key={`sequence-${note.id}`}
                onClick={() => addNoteToSequence(note.id)}
                disabled={noteSequence.length >= MAX_SEQUENCE}
                className={`rounded-2xl border p-3 text-center transition-all hover:-translate-y-0.5 hover:scale-[1.03] disabled:opacity-50 ${
                  isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'
                }`}
              >
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white text-sm font-black shadow-lg ${note.color} ${note.glow}`}>
                  {note.id}
                </div>
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest">{note.id}</p>
              </button>
            ))}
          </div>

          <div className={`mt-3 min-h-[58px] rounded-xl border px-3 py-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-700 bg-zinc-950/70'}`}>
            {noteSequence.length === 0 ? (
              <p className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Sua sequência:</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {noteSequence.map((note, index) => (
                  <span
                    key={`${note}-${index}`}
                    className={`rounded-lg border px-2 py-1 text-xs font-black uppercase transition-all ${playingSequenceIndex === index ? 'border-cyan-400 bg-cyan-500 text-white scale-105' : isLight ? 'border-slate-300 bg-white text-slate-700' : 'border-zinc-600 bg-zinc-900 text-zinc-200'}`}
                  >
                    {note}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
            <button
              onClick={() => void playSequence()}
              disabled={noteSequence.length === 0 || isPlayingSequence}
              className="min-h-[44px] rounded-xl border border-cyan-500 bg-cyan-600 px-4 py-2 text-xs font-black uppercase text-center leading-tight text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {isPlayingSequence ? 'Tocando...' : 'Play'}
            </button>
            <button
              onClick={removeLastSequenceNote}
              disabled={noteSequence.length === 0 || isPlayingSequence}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
            >
              Apagar ultima
            </button>
            <button
              onClick={clearSequence}
              disabled={noteSequence.length === 0}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
            >
              Limpar
            </button>
          </div>
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">Copie a música</p>
          <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
              Toque o modelo, monte sua versão e ouça para comparar.
          </p>

          <div className="mt-3">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]">Caminho da música</label>
            <select
              value={selectedMelodyId}
              onChange={(e) => handleMelodyChange(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 text-sm font-bold outline-none ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
            >
              {MELODY_CHALLENGES.map((melody) => (
                <option key={melody.id} value={melody.id}>{melody.title}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-700 bg-zinc-950/70'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">Toque o modelo</p>
              <p className="mt-2 text-sm font-black">{selectedMelody.title}</p>
              <p className={`mt-1 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>{selectedMelody.displayNotes}</p>
              <p className={`mt-1 text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{selectedMelody.source}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedMelody.notes.map((note, index) => (
                  <span
                    key={`model-${note}-${index}`}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-[10px] font-black uppercase text-white shadow-lg transition-all ${
                      playingModelIndex === index
                        ? 'border-cyan-200 scale-110 ring-2 ring-cyan-300'
                        : 'border-white/30'
                    } ${NOTE_VISUAL[note].color} ${NOTE_VISUAL[note].glow}`}
                  >
                    {note}
                  </span>
                ))}
              </div>

              <button
                onClick={() => void playModel()}
                disabled={isPlayingModel}
                className="mt-3 min-h-[44px] rounded-xl border border-cyan-500 bg-cyan-600 px-4 py-2 text-xs font-black uppercase text-center leading-tight text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                {isPlayingModel ? 'Tocando modelo...' : 'Play modelo'}
              </button>
            </div>

            <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-700 bg-zinc-950/70'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">Monte sua versão</p>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {NOTES.map((note) => (
                  <button
                    key={`melody-note-${note.id}`}
                    onClick={() => addNoteToMelodyVersion(note.id)}
                    disabled={userMelodySequence.length >= MAX_MELODY_SEQUENCE}
                    className={`rounded-2xl border p-2 text-center transition-all hover:-translate-y-0.5 hover:scale-[1.03] disabled:opacity-50 ${
                      isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'
                    }`}
                  >
                    <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-white text-[10px] font-black shadow-lg ${note.color} ${note.glow}`}>
                      {note.id}
                    </div>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-widest">{note.id}</p>
                  </button>
                ))}
              </div>

              <div className={`mt-3 min-h-[58px] rounded-xl border px-3 py-3 ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-700 bg-zinc-900'}`}>
                {userMelodySequence.length === 0 ? (
                  <p className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Sua versão:</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userMelodySequence.map((note, index) => (
                      <span
                        key={`user-${note}-${index}`}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-[10px] font-black uppercase text-white shadow-lg transition-all ${
                          playingUserIndex === index
                            ? 'border-emerald-200 scale-110 ring-2 ring-emerald-300'
                            : 'border-white/30'
                        } ${NOTE_VISUAL[note].color} ${NOTE_VISUAL[note].glow}`}
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
                <button
                  onClick={() => void playUserVersion()}
                  disabled={userMelodySequence.length === 0 || isPlayingUserVersion}
                  className="min-h-[44px] rounded-xl border border-emerald-500 bg-emerald-600 px-4 py-2 text-xs font-black uppercase text-center leading-tight text-white hover:bg-emerald-500 disabled:opacity-50"
                >
              {isPlayingUserVersion ? 'Tocando versão...' : 'Play sua versão'}
                </button>
                <button
                  onClick={removeLastMelodyNote}
                  disabled={userMelodySequence.length === 0 || isPlayingUserVersion}
                  className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
                >
                  Apagar ultima
                </button>
                <button
                  onClick={clearMelodyVersion}
                  disabled={userMelodySequence.length === 0}
                  className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>

          {melodyFeedback && (
            <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black ${melodyFeedback.startsWith('Voce encontrou') ? (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200') : (isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-500/30 bg-amber-500/10 text-amber-200')}`}>
              {melodyFeedback}
            </div>
          )}
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">Qual ê a letra?</p>
          <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
              Alguns músicos usam letras para chamar as notas.
          </p>

          <div className={`mt-3 rounded-xl border px-3 py-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-700 bg-zinc-950/70'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">Mapa rápido</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['DO', 'RE', 'MI', 'FA', 'SOL', 'LA', 'SI'] as NoteId[]).map((note) => (
                <span
                  key={`map-${note}`}
                  className={`inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-[11px] font-black ${isLight ? 'border-slate-300 bg-white text-slate-700' : 'border-zinc-600 bg-zinc-900 text-zinc-200'}`}
                >
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-black text-white ${NOTE_VISUAL[note].color} ${NOTE_VISUAL[note].glow}`}>
                    {note}
                  </span>
                  <span>= {NOTE_TO_LETTER[note]}</span>
                </span>
              ))}
            </div>
          </div>

          {letterChallenge && (
            <>
              <div className="mt-3 flex items-center gap-3">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full text-white text-sm font-black shadow-lg ${NOTE_VISUAL[letterChallenge.note].color} ${NOTE_VISUAL[letterChallenge.note].glow}`}>
                  {letterChallenge.note}
                </div>
                <p className="text-sm font-black">Qual letra representa essa nota?</p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {letterChallenge.options.map((option) => (
                  <button
                    key={`${letterChallenge.note}-${option}`}
                    onClick={() => handleLetterAnswer(option)}
                    className={`rounded-xl border px-3 py-3 text-sm font-black uppercase transition-all ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}

          {letterFeedback && (
            <div className={`mt-3 rounded-xl border px-3 py-2 text-sm font-black ${letterFeedback.startsWith('Boa') ? (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200') : (isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-500/30 bg-amber-500/10 text-amber-200')}`}>
              {letterFeedback}
            </div>
          )}
        </section>

        <section className={`mt-5 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-500">Siga as Notas</p>
          <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Escute o caminho e repita clicando nas bolas coloridas.
          </p>

          <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap sm:items-center">
            <button onClick={() => void startMemoryGame()} disabled={memoryIsPlaying} className="min-h-[44px] rounded-xl border border-cyan-500 bg-cyan-600 px-4 py-2 text-xs font-black uppercase text-center leading-tight text-white hover:bg-cyan-500 disabled:opacity-50">
                Começar
            </button>
            <button onClick={() => void replayMemorySequence()} disabled={memoryIsPlaying || memorySequence.length === 0} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight disabled:opacity-50 ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
                Repetir sequência
            </button>
            <button onClick={resetMemoryGame} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              Reiniciar
            </button>
              <span className="text-xs font-black uppercase tracking-wider text-cyan-500">Nível: {memoryLevel}</span>
          </div>

          <div className={`mt-3 min-h-[52px] rounded-xl border px-3 py-3 text-sm font-black ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
            {memoryFeedback}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-7">
            {NOTES.map((note) => (
              <button
                key={`memory-${note.id}`}
                onClick={() => void handleMemoryNoteClick(note.id)}
                disabled={memorySequence.length === 0}
                className={`rounded-2xl border p-3 text-center transition-all disabled:opacity-40 ${
                  memoryIsPlaying
                    ? 'pointer-events-none opacity-75'
                    : 'hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95'
                } ${isLight ? 'border-slate-300 bg-white hover:border-cyan-400' : 'border-zinc-700 bg-zinc-950 hover:border-cyan-500'}`}
              >
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white text-sm font-black shadow-lg ${
                  memoryIsPlaying && memoryPlayingIndex !== null && memorySequence[memoryPlayingIndex] === note.id
                    ? 'ring-4 ring-cyan-300 scale-110'
                    : ''
                } ${note.color} ${note.glow}`}>
                  {note.id}
                </div>
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest">{note.id}</p>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-2 sm:flex sm:flex-row sm:justify-center">
          <button onClick={() => navigateTo('/kids')} className="min-h-[44px] rounded-xl border border-emerald-500 bg-emerald-600 px-4 py-2 text-xs font-black uppercase text-center leading-tight text-white hover:bg-emerald-500">
            Voltar ao Kids
          </button>
          <button onClick={() => navigateTo('/kids/games')} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
            Jogos Musicais
          </button>
        </div>
      </main>
    </div>
  );
};

export default KidsNotesPage;


