import React, { useEffect, useMemo, useState } from 'react';
import {
  getHarmonicKeyInfo,
  getSuggestedProgressions,
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
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';
import AppFooter from './AppFooter';
import FretboardSVG from './FretboardSVG';
import type { FretboardState, Line, Marker, StringStatus } from '../types';

type ChordGpsMode = 'major' | 'minor';

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
}

// Purely presentational "GPS" compass — only positions four already-computed
// labels around a circle. No harmonic-theory logic lives here, so the visual
// can evolve later (radius, styling, animation) without touching the page's
// data/state logic above.
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
}) => {
  const size = 240;
  const center = size / 2;
  const radius = 86;

  const points = [
    { label: subdominantLabel, value: subdominantValue, angle: -90, color: '#f59e0b' },
    { label: dominantLabel, value: dominantValue, angle: 30, color: '#ef4444' },
    { label: relativeLabel, value: relativeValue, angle: 150, color: '#8b5cf6' },
  ];

  const toXY = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-56 w-56 sm:h-60 sm:w-60">
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={isLight ? '#cbd5e1' : '#3f3f5c'}
        strokeWidth={2}
        strokeDasharray="4 6"
      />
      {points.map((point) => {
        const { x, y } = toXY(point.angle);
        return (
          <g key={point.label}>
            <line x1={center} y1={center} x2={x} y2={y} stroke={point.color} strokeOpacity={0.35} strokeWidth={2} />
            <circle cx={x} cy={y} r={27} fill={point.color} fillOpacity={isLight ? 0.16 : 0.22} stroke={point.color} strokeWidth={2} />
            <text x={x} y={y - 2} textAnchor="middle" fontSize="13" fontWeight={900} fill={isLight ? '#1f2937' : '#f4f4f5'}>
              {point.value}
            </text>
            <text x={x} y={y + 13} textAnchor="middle" fontSize="7" fontWeight={700} letterSpacing="0.05em" fill={point.color} className="uppercase">
              {point.label}
            </text>
          </g>
        );
      })}
      <circle cx={center} cy={center} r={36} fill={isLight ? '#fef3c7' : '#451a03'} stroke="#f59e0b" strokeWidth={2.5} />
      <text x={center} y={center - 2} textAnchor="middle" fontSize="16" fontWeight={900} fill={isLight ? '#92400e' : '#fde68a'}>
        {tonicValue}
      </text>
      <text x={center} y={center + 14} textAnchor="middle" fontSize="7" fontWeight={700} letterSpacing="0.08em" fill={isLight ? '#92400e' : '#fcd34d'} className="uppercase">
        {tonicLabel}
      </text>
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

const CHORD_INTERVAL_COLORS = {
  T: '#dc2626',
  '3': '#d97706',
  b3: '#d97706',
  '5': '#2563eb',
  b5: '#2563eb',
  '7M': '#a855f7',
  b7: '#a855f7',
} as const;

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
  const isLight = theme === 'light';

  const keyInfo = useMemo(() => getHarmonicKeyInfo(root, mode), [root, mode]);
  const progressions = useMemo(() => getSuggestedProgressions(mode), [mode]);

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
    () => (activeShape ? buildChordGpsFretboardState(activeShape, false) : null),
    [activeShape],
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-center">
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

            <div className="mt-4">
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
              />
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
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-violet-400">{copy.fretboardTitle}</h2>

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
          </section>
        </main>
      </div>
      <AppFooter isLight={isLight} lang={lang} logoSrc="/gateenslogo.webp" logoAlt="Guitar Architect Teens" />
    </>
  );
};

export default TeenChordGpsPage;
