import React, { useEffect, useMemo, useRef, useState } from 'react';
import FretboardSVG from './FretboardSVG';
import { getTeensLang, getTeensTheme, setGlobalLang, setGlobalTheme } from '../utils/ecosystemPreferences';
import { addTeensXp, getTeensXp, TEEN_RANKS } from '../utils/teenProgress';
import { getFrequencyForNoteName, playFrequencies } from '../utils/audio';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';
import AppFooter from './AppFooter';
import {
  ALL_INTERVALS,
  buildRadarNeckMarkers,
  findAllIntervalOccurrences,
  findIntervalOccurrence,
  getIntervalTargetNote,
  getUnlockedIntervals,
  INTERVAL_ABBR,
  INTERVAL_CLASS,
  INTERVAL_COPY,
  INTERVAL_MARKER_COLOR,
  INTERVAL_MODE_SCOPE,
  INTERVAL_SEMITONES,
  INTERVAL_UNLOCK_RANK,
  TONIC_COLOR,
  type IntervalClass,
  type IntervalId,
  type IntervalRadarMode,
} from '../data/teenIntervalRadar';
import type { FretboardState, Line, Marker, StringStatus } from '../types';

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
type IntervalRadarInstrument = 'guitar' | 'bass';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const STREAK_BONUS_EVERY = 5;
const STREAK_BONUS_XP = 3;
const CORRECT_ANSWER_XP = 1;

const INTERVAL_GROUPS: { id: IntervalClass; labelPt: string; labelEn: string }[] = [
  { id: 'justo', labelPt: 'Justos', labelEn: 'Perfect' },
  { id: 'maior-menor', labelPt: 'Maior / Menor', labelEn: 'Major / Minor' },
  { id: 'tritono', labelPt: 'Trítono', labelEn: 'Tritone' },
];

// 'scale-degrees' é reservado para uma evolução futura (T, 2, 3, 4, 5, 6, 7 —
// graus da escala diatônica, não intervalos cromáticos) e fica documentado
// aqui propositalmente, mas fora do ciclo implementado nesta versão.
type FretboardLabelMode = 'intervals' | 'active-notes' | 'all-notes' | 'relative-intervals' | 'scale-degrees';

const isFullNeckLabelMode = (mode: FretboardLabelMode): boolean =>
  mode === 'all-notes' || mode === 'relative-intervals';

const getTuning = (instrument: IntervalRadarInstrument): string[] =>
  instrument === 'guitar' ? ['E', 'B', 'G', 'D', 'A', 'E'] : ['G', 'D', 'A', 'E'];

const buildEmptyFretboardState = (instrument: IntervalRadarInstrument, isLeftHanded: boolean): FretboardState => {
  const tuning = getTuning(instrument);
  return {
    id: 'interval-radar',
    title: '',
    subtitle: '',
    notes: '',
    startFret: 0,
    endFret: 12,
    isLeftHanded,
    root: 'C',
    scaleType: 'Major (Ionian)',
    instrumentType: instrument === 'guitar' ? 'guitar-6' : 'bass-4',
    tuning: 'Custom',
    customTuning: tuning,
    stringStatuses: tuning.map(() => 'normal') as StringStatus[],
    labelMode: 'fingering',
    harmonyMode: 'OFF',
    chordQuality: 'DIATONIC',
    chordDegree: 0,
    inversion: 0,
    colorMode: 'SINGLE',
    layers: {
      showInlays: true,
      showAllNotes: false,
      showScale: false,
      showTonic: false,
    },
    markers: [],
    lines: [],
  };
};

// Hierarquia visual: o par tônica/intervalo selecionado (nível 1) precisa
// sempre "ganhar" do que está em volta. Como FretboardSVG não aceita raio ou
// contorno por marcador (só `color`/`finger`), o único lever disponível é
// diluir a cor via canal alpha hex — por isso dois níveis de transparência
// abaixo, em vez de cor cheia, para tudo que não é o par principal.
const SECONDARY_ALPHA = '4d'; // ~30% — outras ocorrências do mesmo par (nível 2)
const NECK_ALPHA = '30'; // ~19% — grid cromático completo de fundo (nível 2, mais diluído por cobrir o braço inteiro; reduzido de '33' após nova revisão visual)
const SECONDARY_STROKE_OPACITY = 0.3; // mesmo nível de diluição do preenchimento, agora também no aro do marcador
const NECK_STROKE_OPACITY = 0.19;
// Destaque intermediário das demais ocorrências de T/alvo quando "Mostrar
// todas as ocorrências" está ligado nos modos de braço completo — precisa
// ficar visivelmente entre o par principal (100%) e o grid de notas/intervalos
// não vinculados (NECK_ALPHA, ~19%), não perto demais de nenhum dos dois.
const FULL_NECK_OCCURRENCE_ALPHA = 'e6'; // ~90% — opaco o suficiente para não deixar o rótulo do grid por baixo "vazar" semitransparente e ilegível
const FULL_NECK_OCCURRENCE_STROKE_OPACITY = 0.9;
const withAlpha = (hex: string, alpha: string): string => `${hex}${alpha}`;

const buildIntervalFretboardState = (
  root: string,
  intervalId: IntervalId,
  instrument: IntervalRadarInstrument,
  isLeftHanded: boolean,
  labelMode: FretboardLabelMode,
  showAllOccurrences: boolean,
): FretboardState => {
  const tuning = getTuning(instrument);
  const primary = findIntervalOccurrence(root, intervalId, tuning, 15);
  const base = buildEmptyFretboardState(instrument, isLeftHanded);

  if (!primary) return base;

  const { rootPos, targetPos } = primary;
  const intervalColor = INTERVAL_MARKER_COLOR[intervalId];
  const fullNeck = isFullNeckLabelMode(labelMode);
  const showNoteName = labelMode === 'active-notes' || labelMode === 'all-notes';

  const markers: Marker[] = [];

  if (fullNeck) {
    // Grid cromático completo, diluído (nível 2/fundo) — o par principal é
    // desenhado depois, por cima, na mesma posição (ver abaixo).
    const neckData = buildRadarNeckMarkers(root, tuning, 15, labelMode === 'all-notes');
    neckData.forEach((data, index) => {
      markers.push({ id: `neck-${index}`, string: data.string, fret: data.fret, shape: 'circle', color: withAlpha(data.color, NECK_ALPHA), finger: data.label, strokeOpacity: NECK_STROKE_OPACITY });
    });

    if (showAllOccurrences) {
      // Destaque intermediário das demais ocorrências de T/alvo por cima do
      // grid diluído — recebem o mesmo rótulo que o grid já mostraria nessa
      // casa (a opacidade alta cobriria o texto de fundo, então o rótulo
      // precisa ser redesenhado aqui também) e continuam sem linha (só o par
      // principal recebe linha de conexão).
      const rootExtraLabel = showNoteName ? root : 'T';
      const targetExtraLabel = showNoteName ? getIntervalTargetNote(root, intervalId) : INTERVAL_ABBR[intervalId];
      const all = findAllIntervalOccurrences(root, intervalId, tuning, 15);
      all.rootPositions.forEach((pos, index) => {
        if (pos.string === rootPos.string && pos.fret === rootPos.fret) return;
        markers.push({ id: `neck-root-extra-${index}`, string: pos.string, fret: pos.fret, shape: 'circle', color: withAlpha(TONIC_COLOR, FULL_NECK_OCCURRENCE_ALPHA), finger: rootExtraLabel, strokeOpacity: FULL_NECK_OCCURRENCE_STROKE_OPACITY });
      });
      all.targetPositions.forEach((pos, index) => {
        if (pos.string === targetPos.string && pos.fret === targetPos.fret) return;
        markers.push({ id: `neck-target-extra-${index}`, string: pos.string, fret: pos.fret, shape: 'circle', color: withAlpha(intervalColor, FULL_NECK_OCCURRENCE_ALPHA), finger: targetExtraLabel, strokeOpacity: FULL_NECK_OCCURRENCE_STROKE_OPACITY });
      });
    }
  } else if (showAllOccurrences) {
    const all = findAllIntervalOccurrences(root, intervalId, tuning, 15);
    all.rootPositions.forEach((pos, index) => {
      if (pos.string === rootPos.string && pos.fret === rootPos.fret) return;
      markers.push({ id: `root-extra-${index}`, string: pos.string, fret: pos.fret, shape: 'circle', color: withAlpha(TONIC_COLOR, SECONDARY_ALPHA), finger: '', strokeOpacity: SECONDARY_STROKE_OPACITY });
    });
    all.targetPositions.forEach((pos, index) => {
      if (pos.string === targetPos.string && pos.fret === targetPos.fret) return;
      markers.push({ id: `target-extra-${index}`, string: pos.string, fret: pos.fret, shape: 'circle', color: withAlpha(intervalColor, SECONDARY_ALPHA), finger: '', strokeOpacity: SECONDARY_STROKE_OPACITY });
    });
  }

  // Nível 1 — sempre inserido por último, para ficar desenhado por cima de
  // qualquer marcador de fundo na mesma posição, cor e rótulo cheios, nos 4
  // modos de visualização.
  markers.push(
    { id: 'root', string: rootPos.string, fret: rootPos.fret, shape: 'circle', color: TONIC_COLOR, finger: showNoteName ? root : 'T' },
    {
      id: 'target',
      string: targetPos.string,
      fret: targetPos.fret,
      shape: 'circle',
      color: intervalColor,
      finger: showNoteName ? getIntervalTargetNote(root, intervalId) : INTERVAL_ABBR[intervalId],
    },
  );

  // A linha sempre sai da tônica e sempre é vermelha — toda ligação do Radar é
  // T -> intervalo, igual ao critério usado em Tríades/Tétrades. A cor do
  // intervalo fica reservada ao marcador do alvo, e a linha permanece mesmo
  // nos modos de braço completo (mesmo precedente de Tríades/Tétrades).
  const lines: Line[] = [
    { id: 'interval-link', start: rootPos, end: targetPos, color: TONIC_COLOR, width: 8 },
  ];

  const maxFret = Math.max(rootPos.fret, targetPos.fret);
  const endFret = fullNeck || showAllOccurrences ? 15 : Math.max(12, Math.min(15, maxFret + 2));

  return { ...base, endFret, markers, lines };
};

const pickRandom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

type Challenge = { root: string; intervalId: IntervalId };

const generateChallenge = (scope: IntervalId[]): Challenge => ({
  root: pickRandom([...CHROMATIC_NOTES]),
  intervalId: pickRandom(scope),
});

const TeenIntervalRadarPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [lang, setLang] = useState<'pt' | 'en'>(() => getTeensLang());
  const [instrument, setInstrument] = useState<IntervalRadarInstrument>('guitar');
  const [handedness, setHandedness] = useState<'right' | 'left'>('right');
  const [activeTab, setActiveTab] = useState<'estudar' | 'desafios'>('estudar');

  const [studyNoteIndex, setStudyNoteIndex] = useState(0);
  const [studyInterval, setStudyInterval] = useState<IntervalId>('5');
  const [showAllOccurrences, setShowAllOccurrences] = useState(false);
  const [labelMode, setLabelMode] = useState<FretboardLabelMode>('intervals');

  const [xp, setXp] = useState(() => getTeensXp());
  const [unlockBanner, setUnlockBanner] = useState<IntervalId | null>(null);

  const [challengeMode, setChallengeMode] = useState<IntervalRadarMode | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeOptions, setChallengeOptions] = useState<IntervalId[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<IntervalId | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [locked, setLocked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastResultCorrect, setLastResultCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setGlobalLang(lang);
  }, [lang]);

  const unlockedIntervals = useMemo(() => getUnlockedIntervals(xp), [xp]);
  const prevUnlockedRef = useRef<IntervalId[]>(unlockedIntervals);

  useEffect(() => {
    const previous = prevUnlockedRef.current;
    const newlyUnlocked = unlockedIntervals.filter((id) => !previous.includes(id));
    prevUnlockedRef.current = unlockedIntervals;
    if (newlyUnlocked.length === 0) return;
    setUnlockBanner(newlyUnlocked[0]);
    const timer = setTimeout(() => setUnlockBanner(null), 6000);
    return () => clearTimeout(timer);
  }, [unlockedIntervals]);

  const rankLabelById = useMemo(
    () => Object.fromEntries(TEEN_RANKS.map((rank) => [rank.id, rank.label])) as Record<string, string>,
    []
  );

  const isLight = theme === 'light';
  const studyNote = CHROMATIC_NOTES[studyNoteIndex];

  const copy = lang === 'pt'
    ? {
        title: 'Radar de Intervalos',
        subtitle: 'Ouça, identifique e veja os intervalos ganharem forma no braço.',
        tabStudy: 'Estudar',
        tabChallenges: 'Desafios',
        instrument: 'Instrumento',
        guitar: 'Guitarra',
        bass: 'Baixo',
        handedness: 'Modo do braço',
        right: 'Destro',
        left: 'Canhoto',
        note: 'Tônica',
        interval: 'Intervalo',
        playRoot: 'Tocar Tônica',
        playInterval: 'Tocar Intervalo',
        playMelodic: 'Tocar Melódico',
        playHarmonic: 'Tocar Harmônico',
        chooseMode: 'Modo de Desafio',
        modePowerChords: 'Power Chords',
        modeMajorMinor: 'Maior ou Menor',
        modeMixed: 'Desafio Misto',
        newChallenge: 'Novo Desafio',
        changeMode: 'Trocar modo',
        whatInterval: 'Que intervalo é esse?',
        correct: 'Acertou!',
        incorrect: 'Quase! Era',
        streak: 'Sequência',
        back: 'Voltar ao Teens',
        studio: 'Ir para Studio',
        visualization: 'Visualização',
        visualizationOption: {
          intervals: 'Intervalos',
          'active-notes': 'Notas',
          'all-notes': 'Todas as notas',
          'relative-intervals': 'Todos os intervalos',
          'scale-degrees': 'Intervalos',
        } as Record<FretboardLabelMode, string>,
        showAllOccurrences: 'Mostrar todas as ocorrências',
        showAllOccurrencesHint: 'Destaca as demais ocorrências da tônica e da nota-alvo',
        listenSection: 'Ouvir',
        answerSection: 'Sua Resposta',
        groupLabel: { justo: 'Justos', 'maior-menor': 'Maior / Menor', tritono: 'Trítono' } as Record<IntervalClass, string>,
        unlockedAt: 'Disponível em',
        newUnlock: 'Novo intervalo desbloqueado:',
        tonicLabel: 'Tônica',
        targetLabel: 'Nota-alvo',
        distanceLabel: 'Distância',
        semitons: 'semitons',
        classification: { justo: 'Intervalo Justo', 'maior-menor': 'Maior / Menor', tritono: 'Trítono' } as Record<IntervalClass, string>,
      }
    : {
        title: 'Interval Radar',
        subtitle: 'Listen, identify, and watch intervals take shape on the fretboard.',
        tabStudy: 'Study',
        tabChallenges: 'Challenges',
        instrument: 'Instrument',
        guitar: 'Guitar',
        bass: 'Bass',
        handedness: 'Neck mode',
        right: 'Right',
        left: 'Left',
        note: 'Root',
        interval: 'Interval',
        playRoot: 'Play Root',
        playInterval: 'Play Interval',
        playMelodic: 'Play Melodic',
        playHarmonic: 'Play Harmonic',
        chooseMode: 'Challenge Mode',
        modePowerChords: 'Power Chords',
        modeMajorMinor: 'Major or Minor',
        modeMixed: 'Mixed Challenge',
        newChallenge: 'New Challenge',
        changeMode: 'Change mode',
        whatInterval: 'What interval is this?',
        correct: 'Correct!',
        incorrect: 'Close! It was',
        streak: 'Streak',
        back: 'Back to Teens',
        studio: 'Go to Studio',
        visualization: 'Visualization',
        visualizationOption: {
          intervals: 'Intervals',
          'active-notes': 'Notes',
          'all-notes': 'All notes',
          'relative-intervals': 'All intervals',
          'scale-degrees': 'Intervals',
        } as Record<FretboardLabelMode, string>,
        showAllOccurrences: 'Show all occurrences',
        showAllOccurrencesHint: 'Highlights the other occurrences of the root and target note',
        listenSection: 'Listen',
        answerSection: 'Your Answer',
        groupLabel: { justo: 'Perfect', 'maior-menor': 'Major / Minor', tritono: 'Tritone' } as Record<IntervalClass, string>,
        unlockedAt: 'Unlocks at',
        newUnlock: 'New interval unlocked:',
        tonicLabel: 'Root',
        targetLabel: 'Target note',
        distanceLabel: 'Distance',
        semitons: 'semitones',
        classification: { justo: 'Perfect Interval', 'maior-menor': 'Major / Minor', tritono: 'Tritone' } as Record<IntervalClass, string>,
      };

  const modeLabels: Record<IntervalRadarMode, string> = {
    'power-chords': copy.modePowerChords,
    'maior-ou-menor': copy.modeMajorMinor,
    misto: copy.modeMixed,
  };

  const getModeScope = (mode: IntervalRadarMode): IntervalId[] => {
    if (mode === 'misto') return unlockedIntervals.length > 0 ? unlockedIntervals : ['5'];
    return INTERVAL_MODE_SCOPE[mode];
  };

  const studyFretboardState = useMemo(
    () => buildIntervalFretboardState(studyNote, studyInterval, instrument, handedness === 'left', labelMode, showAllOccurrences),
    [studyNote, studyInterval, instrument, handedness, labelMode, showAllOccurrences]
  );

  const challengeFretboardState = useMemo(() => {
    if (!challenge || !revealed) return buildEmptyFretboardState(instrument, handedness === 'left');
    return buildIntervalFretboardState(challenge.root, challenge.intervalId, instrument, handedness === 'left', 'intervals', false);
  }, [challenge, revealed, instrument, handedness]);

  const violetButtonClass = (selected: boolean) =>
    `${selected
      ? isLight
        ? 'border-violet-500 bg-violet-100 text-violet-900'
        : 'border-violet-300 bg-violet-500/25 text-violet-50'
      : isLight
        ? 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
        : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-violet-500'
    } min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase leading-tight transition-all`;

  const tabButtonClass = (selected: boolean) =>
    `min-h-[44px] flex-1 rounded-xl border px-4 py-2 text-sm font-black uppercase tracking-[0.1em] transition-all ${
      selected
        ? isLight
          ? 'border-violet-500 bg-violet-100 text-violet-900'
          : 'border-violet-400 bg-violet-500/20 text-violet-50'
        : isLight
          ? 'border-slate-300 bg-white text-slate-600 hover:border-violet-400'
          : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-violet-500'
    }`;

  const cardClass = isLight ? 'border-slate-200 bg-white/90' : 'border-violet-800/60 bg-zinc-950/80';
  const innerCardClass = isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60';

  const getIntervalTargetWithOctave = (note: string, intervalId: IntervalId) => {
    const semitones = INTERVAL_SEMITONES[intervalId];
    const rootChromaIndex = CHROMATIC_NOTES.indexOf(note as typeof CHROMATIC_NOTES[number]);
    const octaveBump = rootChromaIndex + semitones >= 12 ? 1 : 0;
    return { note: getIntervalTargetNote(note, intervalId), octave: 4 + octaveBump };
  };

  const playRoot = (note: string) => playFrequencies([getFrequencyForNoteName(note, 4)], { duration: 0.6, volume: 0.08 });
  const playTarget = (note: string, intervalId: IntervalId) => {
    const target = getIntervalTargetWithOctave(note, intervalId);
    return playFrequencies([getFrequencyForNoteName(target.note, target.octave)], { duration: 0.6, volume: 0.08 });
  };
  const playMelodic = (note: string, intervalId: IntervalId) => {
    const target = getIntervalTargetWithOctave(note, intervalId);
    return playFrequencies(
      [getFrequencyForNoteName(note, 4), getFrequencyForNoteName(target.note, target.octave)],
      { duration: 0.65, stagger: 0.35, volume: 0.08 }
    );
  };
  const playHarmonic = (note: string, intervalId: IntervalId) => {
    const target = getIntervalTargetWithOctave(note, intervalId);
    return playFrequencies(
      [getFrequencyForNoteName(note, 4), getFrequencyForNoteName(target.note, target.octave)],
      { duration: 0.9, stagger: 0, volume: 0.07 }
    );
  };

  const startChallengeMode = (mode: IntervalRadarMode) => {
    const scope = getModeScope(mode);
    setChallengeMode(mode);
    const next = generateChallenge(scope);
    setChallenge(next);
    setChallengeOptions(scope);
    setRevealed(false);
    setLocked(false);
    setSelectedAnswer(null);
    setLastResultCorrect(null);
    playHarmonic(next.root, next.intervalId);
  };

  const requestNewChallenge = () => {
    if (!challengeMode) return;
    const scope = getModeScope(challengeMode);
    const next = generateChallenge(scope);
    setChallenge(next);
    setChallengeOptions(scope);
    setRevealed(false);
    setLocked(false);
    setSelectedAnswer(null);
    setLastResultCorrect(null);
    playHarmonic(next.root, next.intervalId);
  };

  const replayChallenge = () => {
    if (!challenge) return;
    playHarmonic(challenge.root, challenge.intervalId);
  };

  const handleAnswer = (option: IntervalId) => {
    if (locked || !challenge) return;
    setLocked(true);
    setSelectedAnswer(option);
    setRevealed(true);

    const correct = option === challenge.intervalId;
    setLastResultCorrect(correct);

    if (correct) {
      addTeensXp(CORRECT_ANSWER_XP);
      const nextStreak = streak + 1;
      if (nextStreak % STREAK_BONUS_EVERY === 0) addTeensXp(STREAK_BONUS_XP);
      setStreak(nextStreak);
    } else {
      setStreak(0);
    }
    setXp(getTeensXp());
  };

  const renderTheoryPanel = (intervalId: IntervalId) => {
    const entry = INTERVAL_COPY[intervalId][lang];
    const cls = INTERVAL_CLASS[intervalId];
    return (
      <div className={`rounded-xl border px-4 py-3 text-sm font-bold ${isLight ? 'border-violet-200 bg-violet-50 text-violet-800' : 'border-violet-500/30 bg-violet-500/8 text-violet-200'}`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.15em] text-violet-400">{entry.name}</p>
          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${isLight ? 'border-violet-300 text-violet-600' : 'border-violet-400 text-violet-300'}`}>
            {copy.classification[cls]}
          </span>
        </div>
        <p className="mt-1 text-xs font-bold opacity-70">{entry.semitoneLabel}</p>
        <ul className="mt-2 space-y-1">
          {entry.bullets.map((bullet, index) => (
            <li key={index}>• {bullet}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderDistanceBox = (root: string, intervalId: IntervalId) => {
    const targetNote = getIntervalTargetNote(root, intervalId);
    const semitones = INTERVAL_SEMITONES[intervalId];
    return (
      <div className={`rounded-xl border px-4 py-2 text-xs font-black ${isLight ? 'border-slate-200 bg-white text-slate-700' : 'border-zinc-800 bg-zinc-950/80 text-zinc-200'}`}>
        {copy.tonicLabel}: {root} · {copy.targetLabel}: {targetNote} · {copy.distanceLabel}: {semitones} {copy.semitons}
      </div>
    );
  };

  const renderIntervalButton = (intervalId: IntervalId) => {
    const unlocked = unlockedIntervals.includes(intervalId);
    if (!unlocked) {
      const rankId = INTERVAL_UNLOCK_RANK[intervalId];
      const rankLabel = rankLabelById[rankId] ?? rankId;
      return (
        <button
          key={intervalId}
          disabled
          className={`${violetButtonClass(false)} flex flex-col items-center gap-0.5 cursor-not-allowed opacity-50`}
        >
          <span>🔒 {INTERVAL_ABBR[intervalId]}</span>
          <span className="text-[8px] font-bold normal-case opacity-80">{copy.unlockedAt} {rankLabel}</span>
        </button>
      );
    }
    return (
      <button
        key={intervalId}
        onClick={() => setStudyInterval(intervalId)}
        className={`${violetButtonClass(studyInterval === intervalId)} inline-flex items-center justify-center text-center`}
      >
        {INTERVAL_ABBR[intervalId]}
      </button>
    );
  };

  return (
    <>
    <div className={`relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${isLight ? 'rgba(148,163,184,0.35)' : 'rgba(139,92,246,0.18)'} 1px, transparent 1px)`,
          backgroundSize: '100% 30px',
        }}
      />

      <main className="relative mx-auto max-w-7xl">
        <EcosystemPageActions ecosystem="teens" isLight={isLight} backLabel={copy.back} backPath="/teens" />
        <InternalEcosystemHeader ecosystem="teens" isLight={isLight} title={copy.title} subtitle={copy.subtitle} />

        <section className={`rounded-3xl border p-4 md:p-6 ${cardClass}`}>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('estudar')} className={tabButtonClass(activeTab === 'estudar')}>
              {copy.tabStudy}
            </button>
            <button onClick={() => setActiveTab('desafios')} className={tabButtonClass(activeTab === 'desafios')}>
              {copy.tabChallenges}
            </button>
          </div>

          <div className={`mt-4 rounded-2xl border p-3 ${innerCardClass}`}>
            <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
              <div className="min-w-fit">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.instrument}</p>
                <div className="mt-2 flex gap-2">
                  {(['guitar', 'bass'] as IntervalRadarInstrument[]).map((item) => (
                    <button key={item} onClick={() => setInstrument(item)} className={violetButtonClass(instrument === item)}>
                      {item === 'guitar' ? copy.guitar : copy.bass}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-fit">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.handedness}</p>
                <div className="mt-2 flex gap-2">
                  {(['right', 'left'] as const).map((item) => (
                    <button key={item} onClick={() => setHandedness(item)} className={violetButtonClass(handedness === item)}>
                      {item === 'right' ? copy.right : copy.left}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'estudar' ? (
            <>
              {unlockBanner && (
                <div className={`mt-4 flex items-center justify-between rounded-xl border px-4 py-2 text-xs font-black ${isLight ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'}`}>
                  <span>{copy.newUnlock} {INTERVAL_COPY[unlockBanner][lang].name}</span>
                  <button onClick={() => setUnlockBanner(null)} aria-label="dismiss" className="ml-3 font-black">×</button>
                </div>
              )}

              <div className={`mt-4 rounded-2xl border p-4 ${innerCardClass}`}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.note}</p>
                    <div className="mt-2 grid grid-cols-6 gap-2">
                      {CHROMATIC_NOTES.map((item, index) => (
                        <button key={item} onClick={() => setStudyNoteIndex(index)} className={`${violetButtonClass(studyNote === item)} inline-flex items-center justify-center text-center`}>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.interval}</p>
                    <div className="mt-2 space-y-3">
                      {INTERVAL_GROUPS.map((group) => {
                        const groupIntervals = ALL_INTERVALS.filter((id) => INTERVAL_CLASS[id] === group.id);
                        return (
                          <div key={group.id}>
                            <p className={`text-[9px] font-black uppercase tracking-[0.15em] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                              {copy.groupLabel[group.id]}
                            </p>
                            <div className="mt-1 grid grid-cols-4 gap-2">
                              {groupIntervals.map((id) => renderIntervalButton(id))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.visualization}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(['intervals', 'active-notes', 'all-notes', 'relative-intervals'] as FretboardLabelMode[]).map((mode) => (
                      <button key={mode} onClick={() => setLabelMode(mode)} className={violetButtonClass(labelMode === mode)}>
                        {copy.visualizationOption[mode]}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowAllOccurrences((current) => !current)}
                      className={violetButtonClass(showAllOccurrences)}
                    >
                      {copy.showAllOccurrences}
                    </button>
                    <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      {copy.showAllOccurrencesHint}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => playRoot(studyNote)} className={violetButtonClass(false)}>{copy.playRoot}</button>
                  <button onClick={() => playTarget(studyNote, studyInterval)} className={violetButtonClass(false)}>{copy.playInterval}</button>
                  <button onClick={() => playMelodic(studyNote, studyInterval)} className={violetButtonClass(false)}>{copy.playMelodic}</button>
                  <button onClick={() => playHarmonic(studyNote, studyInterval)} className={violetButtonClass(false)}>{copy.playHarmonic}</button>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <div className={`min-w-[1040px] rounded-[28px] border px-4 py-5 ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950/80'}`}>
                  <FretboardSVG
                    state={studyFretboardState}
                    editorMode="view"
                    onEvent={() => undefined}
                    selectedColor="#dc2626"
                    selectedShape="circle"
                    theme={theme}
                    isActive={false}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {renderTheoryPanel(studyInterval)}
                {renderDistanceBox(studyNote, studyInterval)}
              </div>
            </>
          ) : (
            <div className="mt-4">
              {!challengeMode ? (
                <div className={`rounded-2xl border p-4 ${innerCardClass}`}>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.chooseMode}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {(['power-chords', 'maior-ou-menor', 'misto'] as IntervalRadarMode[]).map((mode) => (
                      <button key={mode} onClick={() => startChallengeMode(mode)} className={violetButtonClass(false)}>
                        {modeLabels[mode]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`rounded-xl border px-3 py-2 text-xs font-black uppercase ${innerCardClass}`}>
                      {modeLabels[challengeMode]}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-xl border px-3 py-2 text-xs font-black ${innerCardClass}`}>
                        {copy.streak}: {streak}
                      </span>
                      <button onClick={() => setChallengeMode(null)} className={violetButtonClass(false)}>
                        {copy.changeMode}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.4fr]">
                    <div className={`flex flex-col items-center justify-center gap-4 rounded-2xl border p-6 ${innerCardClass}`}>
                      <div className={`flex h-24 w-24 items-center justify-center rounded-full border-4 text-4xl font-black ${isLight ? 'border-violet-300 text-violet-700' : 'border-violet-500 text-violet-200'}`}>
                        {revealed ? (lastResultCorrect ? '✓' : '✗') : '?'}
                      </div>
                      {!revealed && <p className="text-center text-sm font-bold">{copy.whatInterval}</p>}

                      {challenge && (
                        <div className="w-full">
                          <p className="text-center text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.listenSection}</p>
                          <div className="mt-2 flex flex-wrap justify-center gap-2">
                            <button onClick={() => playRoot(challenge.root)} className={violetButtonClass(false)}>{copy.playRoot}</button>
                            <button onClick={() => playTarget(challenge.root, challenge.intervalId)} className={violetButtonClass(false)}>{copy.playInterval}</button>
                            <button onClick={() => playMelodic(challenge.root, challenge.intervalId)} className={violetButtonClass(false)}>{copy.playMelodic}</button>
                            <button onClick={replayChallenge} className={violetButtonClass(false)}>{copy.playHarmonic}</button>
                          </div>
                        </div>
                      )}

                      {!revealed && (
                        <div className="w-full">
                          <p className="text-center text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.answerSection}</p>
                          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {challengeOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                disabled={locked}
                                className={`${violetButtonClass(false)} disabled:opacity-50`}
                              >
                                {INTERVAL_COPY[option][lang].name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {revealed && challenge && (
                        <div className="w-full">
                          <div className={`rounded-xl border px-4 py-2 text-center text-xs font-black ${isLight ? 'border-violet-200 bg-violet-50 text-violet-800' : 'border-violet-500/30 bg-violet-500/10 text-violet-200'}`}>
                            {lastResultCorrect
                              ? copy.correct
                              : `${copy.incorrect} ${INTERVAL_COPY[challenge.intervalId][lang].name}`}
                            {selectedAnswer && !lastResultCorrect && (
                              <span className="block mt-1 opacity-70">
                                {INTERVAL_COPY[selectedAnswer][lang].name}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex justify-center">
                            <button onClick={requestNewChallenge} className={violetButtonClass(false)}>{copy.newChallenge}</button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <div className={`min-w-[640px] rounded-[28px] border px-4 py-5 ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950/80'}`}>
                        <FretboardSVG
                          state={challengeFretboardState}
                          editorMode="view"
                          onEvent={() => undefined}
                          selectedColor="#dc2626"
                          selectedShape="circle"
                          theme={theme}
                          isActive={false}
                        />
                      </div>
                      {revealed && challenge && (
                        <div className="mt-3 space-y-3">
                          {renderTheoryPanel(challenge.intervalId)}
                          {renderDistanceBox(challenge.root, challenge.intervalId)}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => navigateTo('/teens')}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] transition-all hover:from-violet-500 hover:to-fuchsia-500 active:scale-95"
          >
            {copy.back}
          </button>
          <button
            onClick={() => navigateTo('/studio')}
            className="rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-500 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(8,145,178,0.3)] transition-all hover:from-cyan-500 hover:to-sky-400 active:scale-95"
          >
            {copy.studio}
          </button>
        </div>
      </main>
    </div>

    <AppFooter isLight={isLight} lang={lang} logoSrc="/gateenslogo.webp" logoAlt="Guitar Architect Teens" />
    </>
  );
};

export default TeenIntervalRadarPage;
