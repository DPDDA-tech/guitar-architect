import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CHROMATIC_SCALE, getNoteAt, normalizeNote } from '../music/musicTheory';
import { getScaleNotes } from '../music/scales';
import { generateChordVoicings, type ChordType, type ChordVoicingCandidate } from '../music/chordLibrary';
import { getFrequencyForNoteName, getFrequencyForPosition, getOpenStringMidi, playFrequencies } from '../utils/audio';
import type { FretboardState, InstrumentType, StringStatus } from '../types';

interface PracticeToolsProps {
  instrumentType: InstrumentType;
  tuning: string[];
  isLight: boolean;
  lang: 'pt' | 'en';
  state: FretboardState;
  onApplyExample: (state: FretboardState) => void;
  onHighlightPosition: (position: { string: number; fret: number }) => void;
}

type TunerTarget = {
  string: number;
  note: string;
  frequency: number;
};

type ClickSound = 'classic' | 'wood' | 'bell' | 'soft';
type ExerciseFocus = 'scale' | 'arpeggio' | 'stringSkip' | 'rhythm';
type StudyPattern = '3nps' | '4nps';

const EXERCISE_CHALLENGE_COUNT = 4;
const INTERVAL_CHALLENGE_COUNT = 12;
const CHORD_CHANGE_CHALLENGE_COUNT = 4;
const STUDENT_PROGRESSIONS = [
  'C G Am F',
  'G D Em C',
  'D A Bm G',
  'A E F#m D',
  'E A B7 E',
  'Am G F E',
  'C Am F G',
  'Em C G D'
];

const parseChordSymbol = (symbol: string): { root: string; type: ChordType } | null => {
  const match = symbol.trim().match(/^([A-G](?:#|b)?)(maj13|maj11|maj9|maj7|mMaj7|m13|m11|m9|m7b5|madd9|m7|m6|m|dim7|dim|aug|sus2|sus4|add9|13|11|9|7|6)?$/i);
  if (!match) return null;

  const root = normalizeNote(match[1]);
  const suffix = match[2] || '';
  const typeBySuffix: Record<string, ChordType> = {
    '': 'major',
    m: 'minor',
    dim: 'diminished',
    aug: 'augmented',
    sus2: 'sus2',
    sus4: 'sus4',
    '6': '6',
    m6: 'm6',
    '7': '7',
    maj7: 'maj7',
    m7: 'm7',
    m7b5: 'm7b5',
    dim7: 'dim7',
    mMaj7: 'mMaj7',
    add9: 'add9',
    madd9: 'madd9',
    '9': '9',
    maj9: 'maj9',
    m9: 'm9',
    '11': '11',
    maj11: 'maj11',
    m11: 'm11',
    '13': '13',
    maj13: 'maj13',
    m13: 'm13'
  };

  return { root, type: typeBySuffix[suffix] || 'major' };
};

const getStudentChordVoicing = (symbol: string, tuning: string[]): ChordVoicingCandidate | null => {
  const parsed = parseChordSymbol(symbol);
  if (!parsed) return null;

  const voicings = generateChordVoicings(parsed.root, parsed.type, tuning, {
    maxFretSpan: 4,
    maxResults: 120,
    preferOpenChords: true,
    preferRootInBass: true
  });

  return voicings
    .filter(voicing => voicing.isKnownShape || voicing.voicingStyle === 'open' || voicing.voicingStyle === 'barre')
    .sort((a, b) => {
      const styleRank = (voicing: ChordVoicingCandidate) => (
        voicing.isKnownShape && voicing.voicingStyle === 'open' ? 0 :
        voicing.isKnownShape ? 1 :
        voicing.voicingStyle === 'barre' ? 2 :
        voicing.voicingStyle === 'open' ? 3 :
        voicing.voicingStyle === 'movable' ? 4 :
        4
      );
      return styleRank(a) - styleRank(b) || a.minFret - b.minFret || b.score - a.score;
    })[0] || voicings[0] || null;
};

const findPositionsForNotes = (notes: string[], tuning: string[], maxFret = 12) => {
  const used = new Set<string>();
  return notes.flatMap(note => {
    for (let fret = 0; fret <= maxFret; fret++) {
      for (let string = tuning.length - 1; string >= 0; string--) {
        const key = `${string}:${fret}`;
        if (!used.has(key) && getNoteAt(string, fret, tuning) === note) {
          used.add(key);
          return [{ note, string, fret }];
        }
      }
    }
    return [];
  });
};

const getScaleSequencePositions = (
  scaleNotes: string[],
  instrumentType: InstrumentType,
  tuning: string[],
  startFret: number,
  endFret: number,
  notesPerString: 3 | 4
) => {
  const positions: Array<{ note: string; string: number; fret: number; midi: number }> = [];
  for (let string = tuning.length - 1; string >= 0; string--) {
    let notesOnString = 0;
    for (let fret = startFret; fret <= Math.min(endFret, startFret + 12); fret++) {
      const note = getNoteAt(string, fret, tuning);
      if (scaleNotes.includes(note)) {
        positions.push({ note, string, fret, midi: getOpenStringMidi(instrumentType, tuning, string) + fret });
        notesOnString += 1;
        if (notesOnString >= notesPerString) break;
      }
    }
  }

  return positions
    .sort((a, b) => a.midi - b.midi)
    .map(({ note, string, fret }) => ({ note, string, fret }))
    .slice(0, 24);
};

const detectPitch = (buffer: Float32Array, sampleRate: number) => {
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.012) return null;

  let bestOffset = -1;
  let bestCorrelation = 0;
  const minOffset = Math.floor(sampleRate / 1200);
  const maxOffset = Math.floor(sampleRate / 35);

  for (let offset = minOffset; offset <= maxOffset; offset++) {
    let correlation = 0;
    for (let i = 0; i < buffer.length - offset; i++) {
      correlation += 1 - Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation /= buffer.length - offset;
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

  if (bestCorrelation < 0.92 || bestOffset <= 0) return null;
  return sampleRate / bestOffset;
};

const getCents = (frequency: number, target: number) => Math.round(1200 * Math.log2(frequency / target));

const PracticeTools: React.FC<PracticeToolsProps> = ({ instrumentType, tuning, isLight, lang, state, onApplyExample, onHighlightPosition }) => {
  const [activeTool, setActiveTool] = useState<'tuner' | 'metronome' | 'intervals' | 'exercises' | 'changes'>('tuner');
  const [isTunerRunning, setIsTunerRunning] = useState(false);
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>(null);
  const [tunerError, setTunerError] = useState<string | null>(null);
  const [bpm, setBpm] = useState(80);
  const [targetBpm, setTargetBpm] = useState(120);
  const [bpmStep, setBpmStep] = useState(5);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [increaseEveryBars, setIncreaseEveryBars] = useState(4);
  const [isBpmRampEnabled, setIsBpmRampEnabled] = useState(true);
  const [isCountInEnabled, setIsCountInEnabled] = useState(true);
  const [clickSound, setClickSound] = useState<ClickSound>('classic');
  const [isMetronomeRunning, setIsMetronomeRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState('1');
  const [intervalRoot, setIntervalRoot] = useState('C');
  const [intervalDistance, setIntervalDistance] = useState(7);
  const [isIntervalAnswerVisible, setIsIntervalAnswerVisible] = useState(false);
  const [exerciseFocus, setExerciseFocus] = useState<ExerciseFocus>('scale');
  const [studyPattern, setStudyPattern] = useState<StudyPattern>('3nps');
  const [exerciseText, setExerciseText] = useState('');
  const [changeProgression, setChangeProgression] = useState('C G Am F');
  const [changeBpm, setChangeBpm] = useState(70);
  const [changeBarsPerChord, setChangeBarsPerChord] = useState(1);
  const [isChangePracticeRunning, setIsChangePracticeRunning] = useState(false);
  const [activeChangeIndex, setActiveChangeIndex] = useState(0);
  const [isScalePlaybackRunning, setIsScalePlaybackRunning] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const metronomeTimeoutRef = useRef<number | null>(null);
  const changeTimeoutRef = useRef<number | null>(null);
  const scalePlaybackTimeoutsRef = useRef<number[]>([]);
  const beatRef = useRef(0);
  const bpmRef = useRef(bpm);
  const countInRemainingRef = useRef(0);
  const changeBeatRef = useRef(0);

  const targets = useMemo<TunerTarget[]>(() => tuning.map((note, stringIndex) => ({
    string: stringIndex,
    note,
    frequency: getFrequencyForPosition(instrumentType, tuning, stringIndex, 0)
  })), [instrumentType, tuning]);

  const closestTarget = useMemo(() => {
    if (!detectedFrequency || targets.length === 0) return null;
    return targets.reduce((best, target) => (
      Math.abs(getCents(detectedFrequency, target.frequency)) < Math.abs(getCents(detectedFrequency, best.frequency))
        ? target
        : best
    ), targets[0]);
  }, [detectedFrequency, targets]);

  const cents = detectedFrequency && closestTarget ? getCents(detectedFrequency, closestTarget.frequency) : null;
  const clampedCents = Math.max(-50, Math.min(50, cents ?? 0));

  const stopTuner = () => {
    if (animationFrameRef.current) window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    analyserRef.current = null;
    setIsTunerRunning(false);
  };

  const startTuner = async () => {
    try {
      setTunerError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) throw new Error('AudioContext unavailable');

      const context = new AudioCtor();
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      context.createMediaStreamSource(stream).connect(analyser);
      streamRef.current = stream;
      audioContextRef.current = context;
      analyserRef.current = analyser;
      setIsTunerRunning(true);

      const buffer = new Float32Array(analyser.fftSize);
      const tick = () => {
        analyser.getFloatTimeDomainData(buffer);
        setDetectedFrequency(detectPitch(buffer, context.sampleRate));
        animationFrameRef.current = window.requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setTunerError(lang === 'pt' ? 'Microfone indisponivel ou permissao negada.' : 'Microphone unavailable or permission denied.');
      stopTuner();
    }
  };

  const stopMetronome = () => {
    if (metronomeTimeoutRef.current) window.clearTimeout(metronomeTimeoutRef.current);
    metronomeTimeoutRef.current = null;
    beatRef.current = 0;
    countInRemainingRef.current = 0;
    setCurrentBeat('1');
    setIsMetronomeRunning(false);
  };

  const stopChangePractice = () => {
    if (changeTimeoutRef.current) window.clearTimeout(changeTimeoutRef.current);
    changeTimeoutRef.current = null;
    changeBeatRef.current = 0;
    setActiveChangeIndex(0);
    setIsChangePracticeRunning(false);
  };

  const stopScalePlayback = () => {
    scalePlaybackTimeoutsRef.current.forEach(timeout => window.clearTimeout(timeout));
    scalePlaybackTimeoutsRef.current = [];
    setIsScalePlaybackRunning(false);
  };

  const playMetronomeClick = (isAccent: boolean, isPrep: boolean) => {
    const sounds: Record<ClickSound, { accent: number[]; regular: number[]; prep: number[]; duration: number }> = {
      classic: { accent: [1320], regular: [880], prep: [660], duration: 0.08 },
      wood: { accent: [1760, 880], regular: [990, 495], prep: [660, 330], duration: 0.055 },
      bell: { accent: [1568, 2352], regular: [1175], prep: [784], duration: 0.12 },
      soft: { accent: [1046], regular: [784], prep: [523], duration: 0.1 }
    };
    const sound = sounds[clickSound];
    playFrequencies(isPrep ? sound.prep : isAccent ? sound.accent : sound.regular, {
      duration: sound.duration,
      volume: isPrep ? 0.045 : isAccent ? 0.09 : 0.06
    }).catch(() => undefined);
  };

  const scheduleMetronome = () => {
    if (countInRemainingRef.current > 0) {
      const prepBeat = beatsPerBar - countInRemainingRef.current + 1;
      setCurrentBeat(`${lang === 'pt' ? 'Prep' : 'Count'} ${prepBeat}`);
      playMetronomeClick(prepBeat === 1, true);
      countInRemainingRef.current -= 1;
      metronomeTimeoutRef.current = window.setTimeout(scheduleMetronome, 60000 / bpmRef.current);
      return;
    }

    const beat = beatRef.current % beatsPerBar;
    setCurrentBeat(String(beat + 1));
    playMetronomeClick(beat === 0, false);

    beatRef.current += 1;
    const completedBars = Math.floor(beatRef.current / beatsPerBar);
    if (isBpmRampEnabled && beat === beatsPerBar - 1 && completedBars > 0 && completedBars % increaseEveryBars === 0) {
      const nextBpm = Math.min(targetBpm, bpmRef.current + bpmStep);
      bpmRef.current = nextBpm;
      setBpm(nextBpm);
    }

    metronomeTimeoutRef.current = window.setTimeout(scheduleMetronome, 60000 / bpmRef.current);
  };

  const startMetronome = () => {
    beatRef.current = 0;
    countInRemainingRef.current = isCountInEnabled ? beatsPerBar : 0;
    bpmRef.current = bpm;
    setIsMetronomeRunning(true);
    scheduleMetronome();
  };

  const intervalTarget = CHROMATIC_SCALE[(CHROMATIC_SCALE.indexOf(intervalRoot) + intervalDistance + 12) % 12];
  const intervalLabels = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
  const selectedScaleNotes = getScaleNotes(state.root, state.scaleType);
  const notesPerString = studyPattern === '3nps' ? 3 : 4;
  const scaleSequencePositions = getScaleSequencePositions(selectedScaleNotes, instrumentType, tuning, state.startFret, state.endFret, notesPerString);
  const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
  const chordToneIntervals = [0, 4, 7, 11];
  const exerciseTemplates = {
    scale: lang === 'pt' ? `Toque a escala em ${notesPerString} notas por corda, subindo e descendo, sem mudar de regiao.` : `Play the scale in ${notesPerString} notes per string, ascending and descending, without changing region.`,
    arpeggio: lang === 'pt' ? `Toque o arpejo em ${notesPerString} dedos por corda, subindo 1-3-5-7 e voltando 7-5-3-1.` : `Play the arpeggio in ${notesPerString} notes per string, ascending 1-3-5-7 and descending 7-5-3-1.`,
    stringSkip: lang === 'pt' ? 'Toque saltando uma corda: 6-4-5-3-4-2-3-1, depois volte.' : 'Play with string skipping: 6-4-5-3-4-2-3-1, then return.',
    rhythm: lang === 'pt' ? 'Toque o mesmo shape em semínimas, colcheias e tercinas, 2 compassos cada.' : 'Play the same shape as quarters, eighths, and triplets, 2 bars each.'
  };
  const progressionChords = changeProgression.split(/\s+/).filter(Boolean).slice(0, 4);

  const applyPositionsToFretboard = (
    positions: Array<{ note?: string; string: number; fret: number; finger?: string }>,
    title: string,
    subtitle: string,
    mutedStrings: number[] = [],
    barre?: ChordVoicingCandidate['barre']
  ) => {
    const stringStatuses = Array(tuning.length).fill('normal') as StringStatus[];
    mutedStrings.forEach(stringIndex => {
      if (stringIndex < stringStatuses.length) stringStatuses[stringIndex] = 'mute';
    });
    positions.forEach(position => {
      if (position.fret === 0) stringStatuses[position.string] = 'open';
    });
    const barreLines = barre ? [{
      id: crypto.randomUUID(),
      start: { string: barre.fromString, fret: barre.fret },
      end: { string: barre.toString, fret: barre.fret },
      color: isLight ? '#0f172a' : '#f8fafc',
      width: 11
    }] : [];
    onApplyExample({
      ...state,
      title,
      subtitle,
      instrumentType,
      markers: positions.map((position, index) => ({
        id: crypto.randomUUID(),
        string: position.string,
        fret: position.fret,
        shape: 'circle',
        color: index === 0 ? '#ef4444' : '#2563eb',
        finger: position.finger && position.finger !== '0' ? position.finger : String((index % 4) + 1)
      })),
      lines: barreLines,
      stringStatuses,
      labelMode: 'note',
      root: positions[0]?.note || state.root
    });
  };

  const playInterval = () => {
    setIsIntervalAnswerVisible(false);
    playFrequencies([getFrequencyForNoteName(intervalRoot, 4), getFrequencyForNoteName(intervalTarget, 4)], { duration: 0.65, stagger: 0.35, volume: 0.08 }).catch(() => undefined);
  };

  const showIntervalOnFretboard = () => {
    const positions = findPositionsForNotes([intervalRoot, intervalTarget], tuning);
    applyPositionsToFretboard(
      positions,
      lang === 'pt' ? 'Treino de intervalo' : 'Interval training',
      `${intervalRoot} -> ${intervalTarget} (${intervalLabels[intervalDistance]})`
    );
  };

  const generateExercise = () => {
    const regions = ['0-3', '3-7', '5-9', '7-12'];
    const region = regions[Math.floor(Math.random() * regions.length)];
    setExerciseText(`${exerciseTemplates[exerciseFocus]} ${lang === 'pt' ? 'Regiao' : 'Region'}: ${region}.`);
  };

  const showExerciseOnFretboard = () => {
    if (exerciseFocus === 'scale') {
      onApplyExample({
        ...state,
        title: lang === 'pt' ? 'Escala selecionada' : 'Selected scale',
        subtitle: `${state.root} - ${state.scaleType}`,
        layers: {
          ...state.layers,
          showScale: true,
          showTonic: true
        },
        markers: scaleSequencePositions.slice(0, 8).map((position, index) => ({
          id: crypto.randomUUID(),
          string: position.string,
          fret: position.fret,
          shape: 'circle',
          color: index === 0 ? '#ef4444' : '#2563eb',
          finger: String((index % 4) + 1)
        })),
        lines: [],
        labelMode: 'note'
      });
      return;
    }

    const rootIndex = CHROMATIC_SCALE.indexOf(state.root);
    const notes = exerciseFocus === 'arpeggio'
      ? chordToneIntervals
        .concat(studyPattern === '4nps' ? [12, 16, 19, 23] : [12, 16, 19])
        .map(interval => CHROMATIC_SCALE[(rootIndex + interval) % 12])
      : exerciseFocus === 'stringSkip'
        ? majorScaleIntervals.slice(0, 6).map(interval => CHROMATIC_SCALE[(rootIndex + interval) % 12])
        : majorScaleIntervals.slice(0, 5).map(interval => CHROMATIC_SCALE[(rootIndex + interval) % 12]);
    const positions = exerciseFocus === 'arpeggio'
      ? getScaleSequencePositions(notes, instrumentType, tuning, state.startFret, state.endFret, notesPerString)
      : findPositionsForNotes(notes, tuning, exerciseFocus === 'rhythm' ? 7 : 12);
    applyPositionsToFretboard(
      positions,
      lang === 'pt' ? 'Exercicio aplicado' : 'Applied exercise',
      exerciseText || exerciseTemplates[exerciseFocus]
    );
  };

  const scheduleChangePractice = () => {
    if (progressionChords.length === 0) return;
    const beatInBar = changeBeatRef.current % beatsPerBar;
    const barIndex = Math.floor(changeBeatRef.current / beatsPerBar);
    const chordIndex = Math.floor(barIndex / changeBarsPerChord) % progressionChords.length;
    setActiveChangeIndex(chordIndex);
    playMetronomeClick(beatInBar === 0, false);
    changeBeatRef.current += 1;
    changeTimeoutRef.current = window.setTimeout(scheduleChangePractice, 60000 / changeBpm);
  };

  const startChangePractice = () => {
    changeBeatRef.current = 0;
    setIsChangePracticeRunning(true);
    scheduleChangePractice();
  };

  const playSelectedScaleAtBpm = () => {
    if (scaleSequencePositions.length === 0) return;
    stopScalePlayback();
    setIsScalePlaybackRunning(true);
    const intervalMs = 60000 / bpm;
    scaleSequencePositions.forEach((position, index) => {
      const timeout = window.setTimeout(() => {
        onHighlightPosition({ string: position.string, fret: position.fret });
        playFrequencies([getFrequencyForPosition(instrumentType, tuning, position.string, position.fret)], { duration: 0.35, volume: 0.07 }).catch(() => undefined);
        if (index === scaleSequencePositions.length - 1) {
          setIsScalePlaybackRunning(false);
          scalePlaybackTimeoutsRef.current = [];
        }
      }, index * intervalMs);
      scalePlaybackTimeoutsRef.current.push(timeout);
    });
  };

  const showCurrentChangeOnFretboard = () => {
    const chord = progressionChords[activeChangeIndex] || progressionChords[0];
    if (!chord) return;
    const voicing = getStudentChordVoicing(chord, tuning);
    if (voicing) {
      applyPositionsToFretboard(
        voicing.positions,
        lang === 'pt' ? 'Troca de acorde' : 'Chord change',
        `${voicing.name} - ${voicing.voicingStyle === 'open' ? (lang === 'pt' ? 'shape aberto' : 'open shape') : voicing.voicingStyle === 'barre' ? (lang === 'pt' ? 'shape com pestana' : 'barre shape') : (lang === 'pt' ? 'shape de estudo' : 'study shape')}`,
        voicing.mutedStrings,
        voicing.barre
      );
      return;
    }

    const parsed = parseChordSymbol(chord);
    const root = parsed?.root || 'C';
    const isMinor = parsed?.type === 'minor';
    const intervals = isMinor ? [0, 3, 7] : [0, 4, 7];
    const rootIndex = CHROMATIC_SCALE.indexOf(root);
    const notes = intervals.map(interval => CHROMATIC_SCALE[(rootIndex + interval) % 12]);
    applyPositionsToFretboard(
      findPositionsForNotes(notes, tuning),
      lang === 'pt' ? 'Troca de acorde' : 'Chord change',
      chord
    );
  };

  useEffect(() => () => {
    stopTuner();
    stopMetronome();
    stopChangePractice();
    stopScalePlayback();
  }, []);

  const panelClass = isLight ? 'border-zinc-200 bg-white text-zinc-900' : 'border-zinc-800 bg-zinc-900 text-zinc-100';
  const buttonBase = 'rounded-lg border px-3 py-2 text-[9px] font-black uppercase transition-all active:scale-95';
  const inputClass = 'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-black text-zinc-900';

  return (
    <div className={`rounded-2xl border p-3 ${panelClass}`}>
      <div className="mb-3 flex gap-2 rounded-xl border border-zinc-200 bg-white p-1">
        {(['tuner', 'metronome', 'intervals', 'exercises', 'changes'] as const).map(tool => (
          <button key={tool} onClick={() => setActiveTool(tool)} className={`flex-1 rounded-lg py-2 text-[9px] font-black uppercase ${activeTool === tool ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-blue-600'}`}>
            {tool === 'tuner' ? (lang === 'pt' ? 'Afinador' : 'Tuner') : tool === 'metronome' ? (lang === 'pt' ? 'Metronomo' : 'Metronome') : tool === 'intervals' ? (lang === 'pt' ? 'Intervalos' : 'Intervals') : tool === 'exercises' ? (lang === 'pt' ? 'Exercicios' : 'Exercises') : (lang === 'pt' ? 'Trocas' : 'Changes')}
          </button>
        ))}
      </div>

      {activeTool === 'tuner' ? (
        <div className="space-y-3">
          <div className={`rounded-xl border p-3 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-950'}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">
                {closestTarget ? `${lang === 'pt' ? 'Corda' : 'String'} ${closestTarget.string + 1} - ${closestTarget.note}` : (lang === 'pt' ? 'Toque uma corda' : 'Play a string')}
              </span>
              <span className={`text-[11px] font-black ${Math.abs(cents ?? 99) <= 5 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {cents === null ? '--' : `${cents > 0 ? '+' : ''}${cents} cents`}
              </span>
            </div>
            <div className="relative mt-4 h-3 rounded-full bg-zinc-200">
              <div className="absolute left-1/2 top-[-4px] h-5 w-0.5 bg-emerald-500" />
              <div className="absolute top-[-5px] h-6 w-1 rounded-full bg-blue-600 transition-all" style={{ left: `calc(${50 + clampedCents}% - 2px)` }} />
            </div>
            <p className="mt-3 text-center text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
              {detectedFrequency ? `${detectedFrequency.toFixed(1)} Hz` : (lang === 'pt' ? 'Aguardando sinal' : 'Waiting for signal')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {targets.map(target => (
              <button key={target.string} onClick={() => playFrequencies([target.frequency], { duration: 0.7, volume: 0.08 })} className={`${buttonBase} ${isLight ? 'border-zinc-200 bg-white text-zinc-600' : 'border-zinc-800 bg-zinc-950 text-zinc-300'}`}>
                {target.string + 1}:{target.note}
              </button>
            ))}
          </div>
          {tunerError && <p className="text-[10px] font-bold text-red-500">{tunerError}</p>}
          <button onClick={isTunerRunning ? stopTuner : startTuner} className={`${buttonBase} w-full ${isTunerRunning ? 'border-red-200 bg-red-50 text-red-600' : 'border-blue-600 bg-blue-600 text-white'}`}>
            {isTunerRunning ? (lang === 'pt' ? 'Parar afinador' : 'Stop tuner') : (lang === 'pt' ? 'Iniciar afinador' : 'Start tuner')}
          </button>
        </div>
      ) : activeTool === 'metronome' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-[9px] font-black uppercase ${isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-600' : 'border-zinc-800 bg-zinc-950 text-zinc-300'}`}>
              <input type="checkbox" checked={isBpmRampEnabled} onChange={e => setIsBpmRampEnabled(e.target.checked)} disabled={isMetronomeRunning} className="h-4 w-4 accent-blue-600" />
              {lang === 'pt' ? 'Incremento' : 'Ramp'}
            </label>
            <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-[9px] font-black uppercase ${isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-600' : 'border-zinc-800 bg-zinc-950 text-zinc-300'}`}>
              <input type="checkbox" checked={isCountInEnabled} onChange={e => setIsCountInEnabled(e.target.checked)} disabled={isMetronomeRunning} className="h-4 w-4 accent-blue-600" />
              {lang === 'pt' ? 'Pre-contagem' : 'Count-in'}
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
              BPM
              <input type="number" min={30} max={260} value={bpm} onChange={e => setBpm(Number(e.target.value))} disabled={isMetronomeRunning} className={inputClass} />
            </label>
            <label className="space-y-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
              {lang === 'pt' ? 'Alvo' : 'Target'}
              <input type="number" min={30} max={260} value={targetBpm} onChange={e => setTargetBpm(Number(e.target.value))} disabled={isMetronomeRunning} className={inputClass} />
            </label>
            <label className="space-y-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
              {lang === 'pt' ? 'Compasso' : 'Beats'}
              <input type="number" min={1} max={12} value={beatsPerBar} onChange={e => setBeatsPerBar(Number(e.target.value))} disabled={isMetronomeRunning} className={inputClass} />
            </label>
            <label className="space-y-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
              {lang === 'pt' ? 'Sobe' : 'Step'}
              <input type="number" min={1} max={20} value={bpmStep} onChange={e => setBpmStep(Number(e.target.value))} disabled={isMetronomeRunning} className={inputClass} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
              {lang === 'pt' ? 'A cada compassos' : 'Every bars'}
              <input type="number" min={1} max={32} value={increaseEveryBars} onChange={e => setIncreaseEveryBars(Number(e.target.value))} disabled={isMetronomeRunning || !isBpmRampEnabled} className={inputClass} />
            </label>
            <label className="space-y-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
              {lang === 'pt' ? 'Clique' : 'Click'}
              <select value={clickSound} onChange={e => setClickSound(e.target.value as ClickSound)} disabled={isMetronomeRunning} className={inputClass}>
                <option value="classic">{lang === 'pt' ? 'Classico' : 'Classic'}</option>
                <option value="wood">Wood</option>
                <option value="bell">Bell</option>
                <option value="soft">{lang === 'pt' ? 'Suave' : 'Soft'}</option>
              </select>
            </label>
          </div>
          <div className={`rounded-xl border p-4 text-center ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-950'}`}>
            <p className="text-4xl font-black text-blue-600">{currentBeat}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{bpm} BPM</p>
          </div>
          <button onClick={isMetronomeRunning ? stopMetronome : startMetronome} className={`${buttonBase} w-full ${isMetronomeRunning ? 'border-red-200 bg-red-50 text-red-600' : 'border-blue-600 bg-blue-600 text-white'}`}>
            {isMetronomeRunning ? (lang === 'pt' ? 'Parar' : 'Stop') : (lang === 'pt' ? 'Iniciar' : 'Start')}
          </button>
        </div>
      ) : activeTool === 'intervals' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select value={intervalRoot} onChange={e => setIntervalRoot(e.target.value)} className={inputClass}>
              {CHROMATIC_SCALE.map(note => <option key={note} value={note}>{note}</option>)}
            </select>
            <select value={intervalDistance} onChange={e => setIntervalDistance(Number(e.target.value))} className={inputClass}>
              {intervalLabels.map((label, index) => <option key={label} value={index}>{label}</option>)}
            </select>
          </div>
          <button onClick={playInterval} className={`${buttonBase} w-full border-blue-600 bg-blue-600 text-white`}>{lang === 'pt' ? 'Tocar intervalo' : 'Play interval'}</button>
          <button onClick={() => setIsIntervalAnswerVisible(true)} className={`${buttonBase} w-full ${isLight ? 'border-zinc-200 bg-white text-zinc-600' : 'border-zinc-800 bg-zinc-950 text-zinc-300'}`}>{lang === 'pt' ? 'Mostrar resposta' : 'Show answer'}</button>
          <button onClick={showIntervalOnFretboard} className={`${buttonBase} w-full border-blue-200 bg-white text-blue-600`}>{lang === 'pt' ? 'Mostrar no braço' : 'Show on fretboard'}</button>
          <div className={`rounded-xl border p-4 text-center ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-950'}`}>
            <p className="text-2xl font-black text-blue-600">{isIntervalAnswerVisible ? `${intervalRoot} -> ${intervalTarget} (${intervalLabels[intervalDistance]})` : '?'}</p>
            <p className="mt-2 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">{INTERVAL_CHALLENGE_COUNT} {lang === 'pt' ? 'desafios possiveis' : 'possible challenges'}</p>
          </div>
        </div>
      ) : activeTool === 'exercises' ? (
        <div className="space-y-3">
          <select value={exerciseFocus} onChange={e => setExerciseFocus(e.target.value as typeof exerciseFocus)} className={inputClass}>
            <option value="scale">{lang === 'pt' ? 'Escala' : 'Scale'}</option>
            <option value="arpeggio">{lang === 'pt' ? 'Arpejo' : 'Arpeggio'}</option>
            <option value="stringSkip">{lang === 'pt' ? 'Salto de cordas' : 'String skipping'}</option>
            <option value="rhythm">{lang === 'pt' ? 'Ritmo' : 'Rhythm'}</option>
          </select>
          {(exerciseFocus === 'scale' || exerciseFocus === 'arpeggio') && (
            <div className="grid grid-cols-2 gap-2">
              {(['3nps', '4nps'] as StudyPattern[]).map(pattern => (
                <button key={pattern} onClick={() => setStudyPattern(pattern)} className={`${buttonBase} ${studyPattern === pattern ? 'border-blue-600 bg-blue-600 text-white' : isLight ? 'border-zinc-200 bg-white text-zinc-600' : 'border-zinc-800 bg-zinc-950 text-zinc-300'}`}>
                  {pattern === '3nps' ? '3DPC' : '4DPC'}
                </button>
              ))}
            </div>
          )}
          <button onClick={generateExercise} className={`${buttonBase} w-full border-blue-600 bg-blue-600 text-white`}>{lang === 'pt' ? 'Gerar exercicio' : 'Generate exercise'}</button>
          {exerciseFocus === 'scale' && (
            <button onClick={isScalePlaybackRunning ? stopScalePlayback : playSelectedScaleAtBpm} className={`${buttonBase} w-full ${isScalePlaybackRunning ? 'border-red-200 bg-red-50 text-red-600' : 'border-emerald-600 bg-emerald-600 text-white'}`}>
              {isScalePlaybackRunning ? (lang === 'pt' ? 'Parar escala' : 'Stop scale') : (lang === 'pt' ? 'Tocar escala no BPM' : 'Play scale at BPM')}
            </button>
          )}
          <button onClick={showExerciseOnFretboard} className={`${buttonBase} w-full border-blue-200 bg-white text-blue-600`}>{lang === 'pt' ? 'Mostrar exemplo no braço' : 'Show example on fretboard'}</button>
          <div className={`rounded-xl border p-4 ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-950'}`}>
            <p className="text-sm font-bold leading-relaxed text-zinc-500 dark:text-zinc-300">{exerciseText || (lang === 'pt' ? 'Escolha um foco e gere uma tarefa.' : 'Choose a focus and generate a task.')}</p>
            {exerciseFocus === 'scale' && (
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">
                {state.root} - {state.scaleType} | {scaleSequencePositions.length} {lang === 'pt' ? 'notas na sequencia visivel' : 'notes in visible sequence'} | {bpm} BPM
              </p>
            )}
            <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">{EXERCISE_CHALLENGE_COUNT} {lang === 'pt' ? 'tipos de exercicio' : 'exercise types'}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <input value={changeProgression} onChange={e => setChangeProgression(e.target.value)} disabled={isChangePracticeRunning} className={inputClass} />
          <div className="grid grid-cols-2 gap-1">
            {STUDENT_PROGRESSIONS.slice(0, 4).map(progression => (
              <button
                key={progression}
                onClick={() => {
                  setChangeProgression(progression);
                  setActiveChangeIndex(0);
                }}
                disabled={isChangePracticeRunning}
                className={`${buttonBase} normal-case ${changeProgression === progression ? 'border-blue-600 bg-blue-600 text-white' : isLight ? 'border-zinc-200 bg-white text-zinc-600' : 'border-zinc-800 bg-zinc-950 text-zinc-300'}`}
              >
                {progression}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" min={30} max={220} value={changeBpm} onChange={e => setChangeBpm(Number(e.target.value))} disabled={isChangePracticeRunning} className={inputClass} />
            <input type="number" min={1} max={8} value={changeBarsPerChord} onChange={e => setChangeBarsPerChord(Number(e.target.value))} disabled={isChangePracticeRunning} className={inputClass} />
          </div>
          <div className="grid grid-cols-4 gap-1">
            {progressionChords.map((chord, index) => (
              <div key={`${chord}-${index}`} className={`rounded-lg border px-2 py-3 text-center text-sm font-black ${index === activeChangeIndex ? 'border-blue-600 bg-blue-600 text-white' : isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-500' : 'border-zinc-800 bg-zinc-950 text-zinc-300'}`}>{chord}</div>
            ))}
          </div>
          <button onClick={showCurrentChangeOnFretboard} className={`${buttonBase} w-full border-blue-200 bg-white text-blue-600`}>{lang === 'pt' ? 'Mostrar acorde atual' : 'Show current chord'}</button>
          <button onClick={isChangePracticeRunning ? stopChangePractice : startChangePractice} className={`${buttonBase} w-full ${isChangePracticeRunning ? 'border-red-200 bg-red-50 text-red-600' : 'border-blue-600 bg-blue-600 text-white'}`}>
            {isChangePracticeRunning ? (lang === 'pt' ? 'Parar trocas' : 'Stop changes') : (lang === 'pt' ? 'Iniciar trocas' : 'Start changes')}
          </button>
          <p className="text-center text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">{CHORD_CHANGE_CHALLENGE_COUNT} {lang === 'pt' ? 'acordes por rodada' : 'chords per round'}</p>
        </div>
      )}
    </div>
  );
};

export default PracticeTools;
