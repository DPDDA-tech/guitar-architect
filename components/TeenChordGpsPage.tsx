import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  getHarmonicKeyInfo,
  getSuggestedProgressions,
  getShortestFifthsSteps,
  resolveProgression,
  HARMONIC_ROOT_OPTIONS,
  type HarmonicDegree,
} from '../music/harmonicCycle';
import { normalizeNote } from '../music/musicTheory';
import {
  generateTeenTetradMap,
  type TeenTetradMapShape,
  type TeenTetradQuality,
  type TeenTetradRole,
} from '../data/teenTetradMap';
import { getTeensLang, getTeensTheme } from '../utils/ecosystemPreferences';
import { sendFretboardIntent } from '../utils/sendFretboardIntent';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';
import AppFooter from './AppFooter';
import FretboardSVG from './FretboardSVG';
import type { FretboardState, Line, Marker, StringStatus } from '../types';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

type ChordGpsMode = 'major' | 'minor';

// Mesma paleta semantica T/3/5/7 usada em Triades e Tetrades (vermelho/laranja/azul/roxo),
// reaproveitada aqui para Tonica/Subdominante/Dominante/Relativa no GPS dos Acordes.
const CHORD_INTERVAL_COLORS = {
  T: '#dc2626',
  '3': '#d97706',
  b3: '#d97706',
  '5': '#2563eb',
  b5: '#2563eb',
  '7M': '#a855f7',
  b7: '#a855f7',
} as const;

interface HarmonicGpsCircleProps {
  tonicValue: string;
  tonicLabel: string;
  subdominantValue: string;
  subdominantLabel: string;
  dominantValue: string;
  dominantLabel: string;
  relativeValue: string;
  relativeLabel: string;
  isLight: boolean;
  /** Cumulative angle (deg) — positive = clockwise/up a fifth, negative = anticlockwise/up a fourth. */
  orbitRotation: number;
  /** Bumped (not the angle itself) on a mode-only change, to replay a one-shot pulse instead of rotating. */
  tonicPulseKey: number;
}

// Purely presentational "GPS" compass — only positions four already-computed
// labels on a functional map (tonica no centro, subdominante/dominante como
// polos opostos no topo, relativa abaixo). No harmonic-theory logic lives
// here, so the visual can evolve later (radius, styling, animation) without
// touching the page's data/state logic above.
const HarmonicGpsCircle: React.FC<HarmonicGpsCircleProps> = ({
  tonicValue,
  tonicLabel,
  subdominantValue,
  subdominantLabel,
  dominantValue,
  dominantLabel,
  relativeValue,
  relativeLabel,
  isLight,
  orbitRotation,
  tonicPulseKey,
}) => {
  const nodeRadius = 44; // ~88px de diametro — tamanho preservado (nao reduzir)
  const tonicRadius = 66; // ~132px de diametro — tamanho preservado (nao reduzir)

  // Posicoes dos satelites como deslocamento (dx, dy) a partir da tonica — fixas,
  // independentes da tonalidade selecionada. Subdominante/Dominante abertos em
  // ~55° a partir do eixo vertical (evita o efeito "orelhas de Mickey Mouse");
  // Relativa fica deliberadamente mais proxima da tonica que os outros dois.
  const pointDefs = [
    {
      key: 'subdominant' as const,
      label: subdominantLabel,
      value: subdominantValue,
      dx: -111,
      dy: -77,
      color: CHORD_INTERVAL_COLORS['3'],
      bgLight: '#ffedd5',
      bgDark: '#431407',
    },
    {
      key: 'dominant' as const,
      label: dominantLabel,
      value: dominantValue,
      dx: 111,
      dy: -77,
      color: CHORD_INTERVAL_COLORS['5'],
      bgLight: '#dbeafe',
      bgDark: '#172554',
    },
    {
      key: 'relative' as const,
      label: relativeLabel,
      value: relativeValue,
      dx: 0,
      dy: 125,
      color: CHORD_INTERVAL_COLORS['7M'],
      bgLight: '#f3e8ff',
      bgDark: '#3b0764',
    },
  ];

  const distances = pointDefs.map(p => Math.hypot(p.dx, p.dy));
  const orbitRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  // A orbita gira rigidamente, entao a distancia de cada satelite a tonica nao
  // muda com o angulo — o alcance maximo do giro (em qualquer direcao) e
  // sempre maxDistance + nodeRadius: nesse raio o satelite mais distante fica
  // exatamente tangente a borda, em qualquer angulo, sem nunca ser cortado.
  // Uma pequena folga (fracao do raio do satelite, nao um nodeRadius inteiro)
  // evita que o traco fique colado na borda sem inflar a area com respiro vazio.
  const maxOrbitReach = Math.max(...distances) + nodeRadius;
  const safetyMargin = nodeRadius * 0.2;
  const safeRadius = maxOrbitReach + safetyMargin;

  // Area util dinamica: quadrado de lado 2x o raio seguro, com a tonica
  // centralizada — margem identica e minima nas 4 direcoes, sem respiro extra.
  const width = safeRadius * 2;
  const height = safeRadius * 2;
  const tonicCenter = { x: safeRadius, y: safeRadius };

  const points = pointDefs.map(point => ({
    ...point,
    x: tonicCenter.x + point.dx,
    y: tonicCenter.y + point.dy,
  }));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ maxWidth: '100%', height: 'auto' }}
      className="mx-auto block"
    >
      <style>{`
        @keyframes gpsTonicPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
          100% { transform: scale(1); opacity: 1; }
        }
        .gps-tonic-pulse {
          animation: gpsTonicPulse 0.5s ease-in-out;
        }
      `}</style>
      <g
        style={{
          transform: `rotate(${orbitRotation}deg)`,
          transformOrigin: `${tonicCenter.x}px ${tonicCenter.y}px`,
          transition: 'transform 0.6s ease-in-out',
        }}
      >
        <circle
          cx={tonicCenter.x}
          cy={tonicCenter.y}
          r={orbitRadius}
          fill="none"
          stroke={isLight ? '#94a3b8' : '#6b7280'}
          strokeOpacity={0.55}
          strokeWidth={1.25}
          strokeDasharray="4 6"
        />
        {points.map((point) => (
          <line
            key={`line-${point.key}`}
            x1={tonicCenter.x}
            y1={tonicCenter.y}
            x2={point.x}
            y2={point.y}
            stroke={point.color}
            strokeOpacity={0.3}
            strokeWidth={1.5}
          />
        ))}
        {points.map((point) => (
          // Contra-rotaciona o conteudo do nó para que o acorde/rotulo continue
          // legivel (em pe) enquanto a posicao do nó acompanha o giro da orbita.
          <g
            key={point.key}
            style={{
              transform: `rotate(${-orbitRotation}deg)`,
              transformOrigin: `${point.x}px ${point.y}px`,
              transition: 'transform 0.6s ease-in-out',
            }}
          >
            <circle cx={point.x} cy={point.y} r={nodeRadius} fill={isLight ? point.bgLight : point.bgDark} stroke={point.color} strokeWidth={2} />
            <text x={point.x} y={point.y - 2} textAnchor="middle" fontSize="17" fontWeight={900} fill={isLight ? '#1f2937' : '#f4f4f5'}>
              {point.value}
            </text>
            <text x={point.x} y={point.y + 17} textAnchor="middle" fontSize="8" fontWeight={700} letterSpacing="0.04em" fill={point.color} className="uppercase">
              {point.label}
            </text>
          </g>
        ))}
      </g>
      <g key={tonicPulseKey} className="gps-tonic-pulse" style={{ transformOrigin: `${tonicCenter.x}px ${tonicCenter.y}px` }}>
        <circle cx={tonicCenter.x} cy={tonicCenter.y} r={tonicRadius} fill={isLight ? '#fee2e2' : '#450a0a'} stroke={CHORD_INTERVAL_COLORS.T} strokeWidth={3} />
        <text x={tonicCenter.x} y={tonicCenter.y - 4} textAnchor="middle" fontSize="24" fontWeight={900} fill={isLight ? '#991b1b' : '#fecaca'}>
          {tonicValue}
        </text>
        <text x={tonicCenter.x} y={tonicCenter.y + 18} textAnchor="middle" fontSize="9" fontWeight={700} letterSpacing="0.08em" fill={isLight ? '#991b1b' : '#fca5a5'} className="uppercase">
          {tonicLabel}
        </text>
      </g>
    </svg>
  );
};

const ROLE_EXPLANATION: Record<HarmonicDegree['role'], { pt: string; en: string }> = {
  tonic: { pt: 'é a tônica desta tonalidade.', en: 'is the tonic of this key.' },
  subdominant: { pt: 'atua como subdominante.', en: 'acts as the subdominant.' },
  dominant: { pt: 'atua como dominante.', en: 'acts as the dominant.' },
  relative: { pt: 'é a relativa desta tonalidade.', en: 'is the relative of this key.' },
  diminished: { pt: 'é o acorde diminuto, de forte tensão.', en: 'is the diminished chord, full of tension.' },
  neighbor: { pt: 'é um acorde diatônico de apoio dentro da tonalidade.', en: 'is a supporting diatonic chord within the key.' },
};

// Standard diatonic seventh chords of the major and natural-minor scales —
// a fixed music-theory fact, not derived from harmonicCycle.ts (which only
// builds triads). Indexed by scale degree (0 = I/i).
const SEVENTH_QUALITY_BY_DEGREE: Record<ChordGpsMode, TeenTetradQuality[]> = {
  major: ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'],
  minor: ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', '7'],
};

const getSeventhQuality = (mode: ChordGpsMode, degreeIndex: number): TeenTetradQuality =>
  SEVENTH_QUALITY_BY_DEGREE[mode][degreeIndex] ?? 'maj7';

const QUALITY_SUFFIX: Record<TeenTetradQuality, string> = {
  maj7: 'maj7',
  m7: 'm7',
  '7': '7',
  m7b5: 'm7b5',
  dim7: 'dim7',
};

const getChordGpsLabel = (note: string, quality: TeenTetradQuality) => `${note}${QUALITY_SUFFIX[quality]}`;

// Explanation shown while stepping through a progression on the fretboard —
// same `role` data as ROLE_EXPLANATION above, distinct wording for this context.
const PROGRESSION_ROLE_EXPLANATION: Record<HarmonicDegree['role'], { pt: string; en: string }> = {
  tonic: { pt: 'é a tônica: estabelece o centro tonal da progressão.', en: 'is the tonic: it establishes the tonal center of the progression.' },
  subdominant: { pt: 'é a subdominante: prepara o movimento harmônico.', en: 'is the subdominant: it prepares the harmonic movement.' },
  dominant: { pt: 'é a dominante: cria tensão que resolve para a tônica.', en: 'is the dominant: it creates tension that resolves to the tonic.' },
  relative: { pt: 'é a relativa: traz contraste de cor dentro da mesma tonalidade.', en: 'is the relative: it brings tonal-color contrast within the same key.' },
  diminished: { pt: 'é o diminuto: traz forte tensão à progressão.', en: 'is the diminished chord: it brings strong tension to the progression.' },
  neighbor: { pt: 'é um acorde de apoio dentro da progressão.', en: 'is a supporting chord within the progression.' },
};

const GPS_TUNING = ['E', 'B', 'G', 'D', 'A', 'E'];

const ROOT_ROLE_ORDER: TeenTetradRole[] = ['T', '3', '5', '7'];

// Reuses generateTeenTetradMap (already exported by data/teenTetradMap.ts,
// the same engine Tetrad Map uses) instead of duplicating shape-generation
// logic. Picks the single most accessible root-position voicing across the
// three string groups — exactly one shape per chord, no inversions.
const buildChordGpsShape = (rootNote: string, quality: TeenTetradQuality): TeenTetradMapShape | null => {
  const normalizedRoot = normalizeNote(rootNote);
  const groupMaps = generateTeenTetradMap(normalizedRoot, quality, 'guitar', 15);
  const rootShapes = groupMaps.flatMap((groupMap) => groupMap.shapes).filter((shape) => shape.inversion === 'root');
  if (rootShapes.length === 0) return null;
  return rootShapes.reduce((best, shape) => (shape.minFret < best.minFret ? shape : best));
};

// Isolated on purpose: swapping region/shape strategy later only means
// changing this function (and buildChordGpsShape above), not the JSX below.
const buildChordGpsFretboardState = (shape: TeenTetradMapShape, isLeftHanded: boolean): FretboardState => {
  const markers: Marker[] = shape.positions.map((position) => ({
    id: `${position.string}:${position.fret}`,
    string: position.string,
    fret: position.fret,
    shape: 'circle',
    color: CHORD_INTERVAL_COLORS[position.interval as keyof typeof CHORD_INTERVAL_COLORS] ?? '#6b7280',
    finger: position.interval,
  }));

  const orderedByRole = ROOT_ROLE_ORDER
    .map((role) => shape.positions.find((position) => position.role === role))
    .filter((position): position is TeenTetradMapShape['positions'][number] => Boolean(position));

  const lines: Line[] = [];
  for (let i = 0; i < orderedByRole.length - 1; i += 1) {
    lines.push({
      id: `line-${i}`,
      start: { string: orderedByRole[i].string, fret: orderedByRole[i].fret },
      end: { string: orderedByRole[i + 1].string, fret: orderedByRole[i + 1].fret },
      color: CHORD_INTERVAL_COLORS[orderedByRole[i].interval as keyof typeof CHORD_INTERVAL_COLORS] ?? '#8b5cf6',
      width: 8,
    });
  }

  const stringStatuses: StringStatus[] = Array.from({ length: GPS_TUNING.length }, () => 'normal');

  return {
    id: 'chord-gps',
    title: '',
    subtitle: '',
    notes: '',
    startFret: Math.max(0, shape.minFret - 1),
    endFret: shape.maxFret + 1,
    isLeftHanded,
    root: shape.root,
    scaleType: 'Major (Ionian)',
    instrumentType: 'guitar-6',
    tuning: 'Custom',
    customTuning: GPS_TUNING,
    stringStatuses,
    labelMode: 'fingering',
    harmonyMode: 'OFF',
    chordQuality: 'DIATONIC',
    chordDegree: 0,
    inversion: 0,
    colorMode: 'SINGLE',
    layers: { showInlays: true, showAllNotes: false, showScale: false, showTonic: false },
    markers,
    lines,
  };
};

const TeenChordGpsPage: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [lang] = useState<'pt' | 'en'>(() => getTeensLang());
  const [root, setRoot] = useState('C');
  const [mode, setMode] = useState<ChordGpsMode>('major');
  const [selectedDegreeIndex, setSelectedDegreeIndex] = useState<number | null>(null);
  const [selectedProgression, setSelectedProgression] = useState<string | null>(null);
  const [progressionStepIndex, setProgressionStepIndex] = useState(0);
  // Mesmo estado/label/prop de Tríades e Tétrades (handedness -> FretboardState.isLeftHanded).
  const [handedness, setHandedness] = useState<'right' | 'left'>('right');
  // Orbita pedagogica: trocar a tonica gira o sistema pelo caminho mais curto no
  // circulo das quintas (horario = quinta acima, anti-horario = quarta acima).
  // Trocar so o modo (Maior <-> Menor) nao gira nada — apenas um pulso leve,
  // porque a posicao da tonica no circulo nao muda.
  const [orbitRotation, setOrbitRotation] = useState(0);
  const [tonicPulseKey, setTonicPulseKey] = useState(0);
  const previousRootRef = useRef(root);
  const previousModeRef = useRef(mode);
  const isLight = theme === 'light';

  const keyInfo = useMemo(() => getHarmonicKeyInfo(root, mode), [root, mode]);
  const progressions = useMemo(() => getSuggestedProgressions(mode), [mode]);

  useEffect(() => {
    if (previousRootRef.current !== root) {
      const steps = getShortestFifthsSteps(previousRootRef.current, root);
      setOrbitRotation(angle => angle + steps * 30);
    } else if (previousModeRef.current !== mode) {
      setTonicPulseKey(key => key + 1);
    }
    previousRootRef.current = root;
    previousModeRef.current = mode;
  }, [root, mode]);

  useEffect(() => {
    setSelectedDegreeIndex(null);
    setSelectedProgression(null);
  }, [root, mode]);

  useEffect(() => {
    setProgressionStepIndex(0);
  }, [selectedProgression]);

  const relativeDegreeIndex = useMemo(() => {
    const relativeNote = mode === 'major' ? keyInfo.relative.replace(/m$/, '') : keyInfo.relative;
    return keyInfo.harmonicField.findIndex((degree) => degree.note === relativeNote);
  }, [keyInfo, mode]);

  const highlightedDegreeIndices = useMemo(() => {
    if (selectedProgression) {
      const resolved = resolveProgression(selectedProgression, keyInfo.harmonicField);
      return new Set(resolved.map((degree) => keyInfo.harmonicField.indexOf(degree)));
    }
    if (selectedDegreeIndex !== null) return new Set([selectedDegreeIndex]);
    return new Set<number>();
  }, [selectedProgression, selectedDegreeIndex, keyInfo.harmonicField]);

  const handleDegreeClick = (index: number) => {
    setSelectedProgression(null);
    setSelectedDegreeIndex((current) => (current === index ? null : index));
  };

  const handleProgressionClick = (progression: string) => {
    setSelectedDegreeIndex(null);
    setSelectedProgression((current) => (current === progression ? null : progression));
  };

  // Resolves which chord the Geometria Física block should show. Isolated
  // here so a future BPM auto-advance or region/shape switch only has to
  // change this and the two build* functions above, not the JSX below.
  const activeChordContext = useMemo(() => {
    if (selectedProgression) {
      const sequence = resolveProgression(selectedProgression, keyInfo.harmonicField);
      const stepIndex = sequence.length > 0 ? progressionStepIndex % sequence.length : 0;
      return { degree: sequence[stepIndex] as HarmonicDegree | undefined, sequence, stepIndex };
    }
    const index = selectedDegreeIndex ?? 0;
    return { degree: keyInfo.harmonicField[index] as HarmonicDegree | undefined, sequence: null as HarmonicDegree[] | null, stepIndex: 0 };
  }, [selectedProgression, selectedDegreeIndex, progressionStepIndex, keyInfo.harmonicField]);

  const handleNextChord = () => {
    setProgressionStepIndex((current) => current + 1);
  };

  const activeDegreeRole: HarmonicDegree['role'] | null = activeChordContext.degree
    ? (keyInfo.harmonicField.indexOf(activeChordContext.degree) === relativeDegreeIndex ? 'relative' : activeChordContext.degree.role)
    : null;

  const activeQuality = useMemo(() => {
    if (!activeChordContext.degree) return null;
    const index = keyInfo.harmonicField.indexOf(activeChordContext.degree);
    return getSeventhQuality(mode, index === -1 ? 0 : index);
  }, [activeChordContext.degree, keyInfo.harmonicField, mode]);

  const activeShape = useMemo(() => {
    if (!activeChordContext.degree || !activeQuality) return null;
    return buildChordGpsShape(activeChordContext.degree.note, activeQuality);
  }, [activeChordContext.degree, activeQuality]);

  const chordGpsFretboardState = useMemo(
    () => (activeShape ? buildChordGpsFretboardState(activeShape, handedness === 'left') : null),
    [activeShape, handedness],
  );

  const copy = lang === 'pt'
    ? {
        title: 'GPS dos Acordes',
        subtitle: 'Descubra como os acordes se conectam dentro de uma tonalidade.',
        back: 'Voltar ao Teens',
        tonicSelector: 'Tônica',
        modeSelector: 'Modo',
        major: 'Maior',
        minor: 'Menor',
        tonicPoint: 'Tônica',
        subdominantPoint: 'Subdominante',
        dominantPoint: 'Dominante',
        relativePoint: 'Relativa',
        gpsPanelTitle: 'GPS HARMÔNICO',
        gpsPanelSubtitle: 'Toda a tonalidade gira em torno da tônica.',
        diminishedPoint: 'Diminuto',
        neighborPoint: 'Acorde de apoio',
        infoTitle: 'Informações da tonalidade',
        keyLabel: 'Tonalidade',
        scaleLabel: 'Escala',
        signatureLabel: 'Armadura',
        relativeLabel: 'Relativa',
        dominantLabel: 'Dominante',
        subdominantLabel: 'Subdominante',
        noAccidentals: 'Sem acidentes',
        sharp: (count: number) => `${count} ${count === 1 ? 'sustenido' : 'sustenidos'}`,
        flat: (count: number) => `${count} ${count === 1 ? 'bemol' : 'bemóis'}`,
        fieldTitle: 'Campo harmônico',
        fieldHint: 'Clique em um acorde para entender sua função.',
        progressionsTitle: 'Progressões populares',
        progressionsHint: 'Clique numa progressão para destacar os acordes envolvidos.',
        fretboardTitle: 'Geometria no Braço',
        handedness: 'Modo do braço',
        right: 'Destro',
        left: 'Canhoto',
        fretboardPlaceholder: 'Não foi possível montar uma forma para este acorde nesta região do braço.',
        currentChordLabel: 'Acorde atual',
        degreeLabel: 'Grau',
        functionLabel: 'Função',
        nextChord: 'Próximo acorde',
        explanationTitle: 'Explicação',
        defaultExplanation: (info: typeof keyInfo) =>
          `${info.keyName} é a tônica desta tonalidade. ${info.subdominant} atua como subdominante, ${info.dominant} como dominante, e ${info.relative} é a relativa.`,
        progressionExplanation: (progression: string) =>
          `A progressão ${progression} aparece em milhares de músicas populares nesta tonalidade.`,
        conceptsTitle: 'O que cada função significa',
        tonicConcept: 'É o centro tonal: todas as outras funções existem em relação a ela.',
        subdominantConcept: 'Prepara o caminho: é a ponte entre a estabilidade da tônica e a tensão da dominante.',
        dominantConcept: 'Cria tensão: pede para resolver de volta para a tônica.',
        relativeConcept: 'Tonalidade vizinha: usa as mesmas notas, mas gira em torno de outro centro.',
      }
    : {
        title: 'Chord GPS',
        subtitle: 'Discover how chords connect within a key.',
        back: 'Back to Teens',
        tonicSelector: 'Tonic',
        modeSelector: 'Mode',
        major: 'Major',
        minor: 'Minor',
        tonicPoint: 'Tonic',
        subdominantPoint: 'Subdominant',
        dominantPoint: 'Dominant',
        relativePoint: 'Relative',
        gpsPanelTitle: 'HARMONIC GPS',
        gpsPanelSubtitle: 'The whole key revolves around the tonic.',
        diminishedPoint: 'Diminished',
        neighborPoint: 'Supporting chord',
        infoTitle: 'Key information',
        keyLabel: 'Key',
        scaleLabel: 'Scale',
        signatureLabel: 'Key signature',
        relativeLabel: 'Relative',
        dominantLabel: 'Dominant',
        subdominantLabel: 'Subdominant',
        noAccidentals: 'No accidentals',
        sharp: (count: number) => `${count} sharp${count === 1 ? '' : 's'}`,
        flat: (count: number) => `${count} flat${count === 1 ? '' : 's'}`,
        fieldTitle: 'Harmonic field',
        fieldHint: 'Click a chord to understand its function.',
        progressionsTitle: 'Popular progressions',
        progressionsHint: 'Click a progression to highlight the chords involved.',
        fretboardTitle: 'Neck Geometry',
        handedness: 'Neck mode',
        right: 'Right',
        left: 'Left',
        fretboardPlaceholder: 'Could not build a shape for this chord in this neck region.',
        currentChordLabel: 'Current chord',
        degreeLabel: 'Degree',
        functionLabel: 'Function',
        nextChord: 'Next chord',
        explanationTitle: 'Explanation',
        defaultExplanation: (info: typeof keyInfo) =>
          `${info.keyName} is the tonic of this key. ${info.subdominant} acts as the subdominant, ${info.dominant} as the dominant, and ${info.relative} is the relative.`,
        progressionExplanation: (progression: string) =>
          `The ${progression} progression appears in thousands of popular songs in this key.`,
        conceptsTitle: 'What each function means',
        tonicConcept: 'It is the tonal center: every other function exists in relation to it.',
        subdominantConcept: 'Prepares the move: a bridge between the tonic’s stability and the dominant’s tension.',
        dominantConcept: 'Creates tension: it pulls toward resolving back to the tonic.',
        relativeConcept: 'A neighboring key: shares the same notes but orbits a different center.',
      };

  const signatureText = keyInfo.keySignature.type === 'none'
    ? copy.noAccidentals
    : keyInfo.keySignature.type === 'sharps'
      ? copy.sharp(keyInfo.keySignature.count)
      : copy.flat(keyInfo.keySignature.count);

  const explanationText = useMemo(() => {
    if (selectedProgression) return copy.progressionExplanation(selectedProgression);
    if (selectedDegreeIndex !== null) {
      const degree = keyInfo.harmonicField[selectedDegreeIndex];
      if (degree) {
        const role: HarmonicDegree['role'] = selectedDegreeIndex === relativeDegreeIndex ? 'relative' : degree.role;
        return `${degree.chord} ${ROLE_EXPLANATION[role][lang]}`;
      }
    }
    return copy.defaultExplanation(keyInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgression, selectedDegreeIndex, keyInfo, relativeDegreeIndex, lang]);

  const rolePointLabel: Record<HarmonicDegree['role'], string> = {
    tonic: copy.tonicPoint,
    subdominant: copy.subdominantPoint,
    dominant: copy.dominantPoint,
    relative: copy.relativePoint,
    diminished: copy.diminishedPoint,
    neighbor: copy.neighborPoint,
  };

  const gpsChordLabel = activeChordContext.degree && activeQuality
    ? getChordGpsLabel(activeChordContext.degree.note, activeQuality)
    : null;

  const gpsExplanationText = activeChordContext.degree && activeDegreeRole
    ? `${gpsChordLabel} ${PROGRESSION_ROLE_EXPLANATION[activeDegreeRole][lang]}`
    : null;

  const chipBaseClass = 'rounded-2xl border px-3 py-2 text-center transition-all';
  const chipInactiveClass = isLight
    ? 'border-slate-200 bg-slate-50 hover:border-violet-300'
    : 'border-violet-800/50 bg-zinc-900/60 hover:border-violet-500';
  const chipActiveClass = isLight
    ? 'border-violet-500 bg-violet-100'
    : 'border-violet-400 bg-violet-500/20';

  const progressionBaseClass = 'rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-tight transition-all whitespace-nowrap';

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

        <main className="relative mx-auto max-w-6xl">
          <EcosystemPageActions ecosystem="teens" isLight={isLight} backLabel={copy.back} backPath="/teens" />
          <InternalEcosystemHeader ecosystem="teens" isLight={isLight} title={copy.title} subtitle={copy.subtitle} />

          {/* Bloco 1 — GPS Harmônico */}
          <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-violet-800/60 bg-zinc-950/80'}`}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
              <div className="text-left">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-violet-400">{copy.gpsPanelTitle}</h2>
                <p className="mt-1 text-[11px] font-bold opacity-70">{copy.gpsPanelSubtitle}</p>

                <div className="mt-5 flex flex-col gap-4">
                  <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide">
                    {copy.tonicSelector}
                    <select
                      value={root}
                      onChange={(event) => setRoot(event.target.value)}
                      className={`min-h-[44px] rounded-xl border px-3 py-2 text-sm font-bold ${isLight ? 'border-slate-300 bg-white text-zinc-900' : 'border-zinc-700 bg-zinc-900 text-zinc-100'}`}
                    >
                      {HARMONIC_ROOT_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>

                  <div className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide">
                    {copy.modeSelector}
                    <div className="flex gap-2">
                      {(['major', 'minor'] as ChordGpsMode[]).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setMode(option)}
                          className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase transition-all ${
                            mode === option
                              ? isLight ? 'border-violet-500 bg-violet-100 text-violet-900' : 'border-violet-400 bg-violet-500/20 text-violet-50'
                              : isLight ? 'border-slate-300 bg-white text-slate-700' : 'border-zinc-700 bg-zinc-950 text-zinc-200'
                          }`}
                        >
                          {option === 'major' ? copy.major : copy.minor}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <HarmonicGpsCircle
                  tonicValue={keyInfo.keyName}
                  tonicLabel={copy.tonicPoint}
                  subdominantValue={keyInfo.subdominant}
                  subdominantLabel={copy.subdominantPoint}
                  dominantValue={keyInfo.dominant}
                  dominantLabel={copy.dominantPoint}
                  relativeValue={keyInfo.relative}
                  relativeLabel={copy.relativePoint}
                  isLight={isLight}
                  orbitRotation={orbitRotation}
                  tonicPulseKey={tonicPulseKey}
                />
              </div>
            </div>
          </section>

          {/* Bloco 2 — Informações da tonalidade */}
          <section className={`mt-6 rounded-2xl border px-4 py-3 ${isLight ? 'border-slate-200 bg-white/90' : 'border-violet-800/60 bg-zinc-950/80'}`}>
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5 text-sm">
              {[
                { label: copy.keyLabel, value: keyInfo.keyName },
                { label: copy.scaleLabel, value: keyInfo.scale.join(' ') },
                { label: copy.signatureLabel, value: signatureText },
                { label: copy.relativeLabel, value: keyInfo.relative },
                { label: copy.dominantLabel, value: keyInfo.dominant },
                { label: copy.subdominantLabel, value: keyInfo.subdominant },
              ].map((item, index) => (
                <React.Fragment key={item.label}>
                  {index > 0 && <span className={isLight ? 'text-slate-300' : 'text-zinc-700'}>|</span>}
                  <span>
                    <span className={`font-black uppercase tracking-wide ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{item.label}:</span>{' '}
                    <span className="font-black">{item.value}</span>
                  </span>
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* Bloco 3 — Campo harmônico */}
          <section className={`mt-6 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-violet-800/60 bg-zinc-950/80'}`}>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-violet-400">{copy.fieldTitle}</h2>
            <p className="mt-1 text-[11px] font-bold opacity-70">{copy.fieldHint}</p>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {keyInfo.harmonicField.map((degree, index) => (
                <button
                  key={`${degree.degree}-${index}`}
                  type="button"
                  onClick={() => handleDegreeClick(index)}
                  className={`${chipBaseClass} ${highlightedDegreeIndices.has(index) ? chipActiveClass : chipInactiveClass}`}
                >
                  <p className="text-[10px] font-black uppercase tracking-wide opacity-60">{degree.degree}</p>
                  <p className="text-sm font-black">{degree.chord}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Bloco 4 — Progressões populares */}
          <section className={`mt-6 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-violet-800/60 bg-zinc-950/80'}`}>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-violet-400">{copy.progressionsTitle}</h2>
            <p className="mt-1 text-[11px] font-bold opacity-70">{copy.progressionsHint}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {progressions.map((progression) => (
                <button
                  key={progression}
                  type="button"
                  onClick={() => handleProgressionClick(progression)}
                  className={`${progressionBaseClass} ${
                    selectedProgression === progression ? chipActiveClass : chipInactiveClass
                  }`}
                >
                  {progression}
                </button>
              ))}
            </div>
          </section>

          {/* Bloco 5 — Geometria física */}
          <section className={`mt-6 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-violet-800/60 bg-zinc-950/80'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-violet-400">{copy.fretboardTitle}</h2>
              <div className="flex flex-col gap-1">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>{copy.handedness}</span>
                <div className="flex gap-2">
                  {(['right', 'left'] as const).map((item) => (
                    <button
                      key={item}
                      onClick={() => setHandedness(item)}
                      className={`min-h-[40px] rounded-lg border px-4 text-xs font-black uppercase ${handedness === item
                        ? isLight
                          ? 'border-violet-500 bg-violet-100 text-violet-900'
                          : 'border-violet-300 bg-violet-500/25 text-violet-50'
                        : isLight
                          ? 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
                          : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-violet-500'}`}
                    >
                      {item === 'right' ? copy.right : copy.left}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {chordGpsFretboardState && activeChordContext.degree && gpsChordLabel && activeDegreeRole ? (
              <>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.currentChordLabel}</p>
                    <p className="mt-1 text-base font-black">{gpsChordLabel}</p>
                  </div>
                  <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.degreeLabel}</p>
                    <p className="mt-1 text-base font-black">{activeChordContext.degree.degree}</p>
                  </div>
                  <div className={`rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{copy.functionLabel}</p>
                    <p className="mt-1 text-base font-black">{rolePointLabel[activeDegreeRole]}</p>
                  </div>
                </div>

                {activeChordContext.sequence && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {activeChordContext.sequence.map((degree, index) => (
                      <React.Fragment key={`${degree.degree}-${index}`}>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black uppercase transition-all ${
                            index === activeChordContext.stepIndex ? chipActiveClass : chipInactiveClass
                          }`}
                        >
                          {degree.degree}
                        </span>
                        {index < activeChordContext.sequence!.length - 1 && (
                          <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>→</span>
                        )}
                      </React.Fragment>
                    ))}
                    <button
                      type="button"
                      onClick={handleNextChord}
                      className={`ml-2 rounded-xl border px-4 py-2 text-xs font-black uppercase transition-all ${
                        isLight ? 'border-violet-500 bg-violet-600 text-white hover:bg-violet-700' : 'border-violet-400 bg-violet-500 text-white hover:bg-violet-600'
                      }`}
                    >
                      {copy.nextChord}
                    </button>
                  </div>
                )}

                <div className="mt-4 overflow-x-auto">
                  <FretboardSVG
                    state={chordGpsFretboardState}
                    editorMode="view"
                    onEvent={() => undefined}
                    selectedColor="#a855f7"
                    selectedShape="circle"
                    theme={theme}
                    isActive={false}
                  />
                </div>

                {gpsExplanationText && (
                  <p className={`mt-4 text-sm font-bold ${isLight ? 'text-slate-700' : 'text-zinc-200'}`}>{gpsExplanationText}</p>
                )}
              </>
            ) : (
              <div className={`mt-3 rounded-2xl border p-6 text-center text-sm font-bold ${isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-violet-800/50 bg-zinc-900/60 text-zinc-400'}`}>
                {copy.fretboardPlaceholder}
              </div>
            )}
          </section>

          {/* Bloco 6 — Explicação pedagógica */}
          <section className={`mt-6 rounded-3xl border p-4 md:p-6 ${isLight ? 'border-cyan-200 bg-cyan-50' : 'border-cyan-500/30 bg-cyan-500/10'}`}>
            <h2 className={`text-xs font-black uppercase tracking-[0.2em] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{copy.explanationTitle}</h2>
            <p className={`mt-2 text-sm font-bold ${isLight ? 'text-cyan-900' : 'text-cyan-100'}`}>{explanationText}</p>

            <h3 className={`mt-4 text-[10px] font-black uppercase tracking-[0.18em] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{copy.conceptsTitle}</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: copy.tonicPoint, chord: keyInfo.keyName, text: copy.tonicConcept, color: CHORD_INTERVAL_COLORS.T },
                { label: copy.subdominantPoint, chord: keyInfo.subdominant, text: copy.subdominantConcept, color: CHORD_INTERVAL_COLORS['3'] },
                { label: copy.dominantPoint, chord: keyInfo.dominant, text: copy.dominantConcept, color: CHORD_INTERVAL_COLORS['5'] },
                { label: copy.relativePoint, chord: keyInfo.relative, text: copy.relativeConcept, color: CHORD_INTERVAL_COLORS['7M'] },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl border-l-4 p-3 ${isLight ? 'bg-white/70' : 'bg-zinc-950/40'}`}
                  style={{ borderColor: item.color }}
                >
                  <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: item.color }}>{item.label}</p>
                  <p className={`text-lg font-black ${isLight ? 'text-cyan-950' : 'text-white'}`}>{item.chord}</p>
                  <p className={`mt-1 text-xs font-bold ${isLight ? 'text-cyan-900' : 'text-cyan-100'}`}>{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigateTo('/teens')}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] transition-all hover:from-violet-500 hover:to-fuchsia-500 active:scale-95"
            >
              {lang === 'pt' ? 'Voltar ao Teens' : 'Back to Teens'}
            </button>
            <button
              onClick={() => sendFretboardIntent({
                source: 'teens-chord',
                action: 'field',
                root,
                scaleType: mode === 'major' ? 'Major (Ionian)' : 'Natural Minor (Aeolian)',
                harmonyMode: 'TRIADS',
                instruction: {
                  title: lang === 'pt' ? 'Do GPS ao Campo Harmônico' : 'From GPS to Harmonic Field',
                  description: lang === 'pt' ? 'Você navegou pelo campo harmônico aqui. Agora explore os graus completos no Studio.' : 'You navigated the harmonic field here. Now explore the full degrees in the Studio.',
                  persistent: true,
                },
              })}
              className="rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-500 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(8,145,178,0.3)] transition-all hover:from-cyan-500 hover:to-sky-400 active:scale-95"
            >
              {lang === 'pt' ? 'Ir para Studio' : 'Go to Studio'}
            </button>
          </div>
        </main>
      </div>
      <AppFooter isLight={isLight} lang={lang} logoSrc="/gateenslogo.webp" logoAlt="Guitar Architect Teens" />
    </>
  );
};

export default TeenChordGpsPage;
