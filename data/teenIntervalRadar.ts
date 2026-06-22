import { CHROMATIC_SCALE, getIntervalName, getNoteAt, normalizeNote } from '../music/musicTheory';
import { TEEN_RANKS, type TeenRank } from '../utils/teenProgress';
import { INTERVAL_COLORS, TONIC_COLOR } from './fretboardVisualTheme';

export type TeenRankId = TeenRank['id'];

export type IntervalId = 'b2' | '2' | 'b3' | '3' | '4' | '#4b5' | '5' | 'b6' | '6' | 'b7' | '7' | '8';

export type IntervalRadarMode = 'power-chords' | 'maior-ou-menor' | 'misto';

// Ordem cromática. O unissono (1) fica fora: seria a própria tônica, distância
// zero, sem valor pedagógico como "nota-alvo" a identificar.
export const ALL_INTERVALS: IntervalId[] = ['b2', '2', 'b3', '3', '4', '#4b5', '5', 'b6', '6', 'b7', '7', '8'];

export const INTERVAL_SEMITONES: Record<IntervalId, number> = {
  b2: 1,
  '2': 2,
  b3: 3,
  '3': 4,
  '4': 5,
  '#4b5': 6,
  '5': 7,
  b6: 8,
  '6': 9,
  b7: 10,
  '7': 11,
  '8': 12,
};

export type IntervalClass = 'justo' | 'maior-menor' | 'tritono';

export const INTERVAL_CLASS: Record<IntervalId, IntervalClass> = {
  b2: 'maior-menor',
  '2': 'maior-menor',
  b3: 'maior-menor',
  '3': 'maior-menor',
  '4': 'justo',
  '#4b5': 'tritono',
  '5': 'justo',
  b6: 'maior-menor',
  '6': 'maior-menor',
  b7: 'maior-menor',
  '7': 'maior-menor',
  '8': 'justo',
};

// Abreviação formal usada nos botões (Justos levam J, maiores levam M, menores
// mantêm o símbolo de bemol, trítono mantém a dupla nomenclatura #4/b5).
export const INTERVAL_ABBR: Record<IntervalId, string> = {
  b2: 'b2',
  '2': '2M',
  b3: 'b3',
  '3': '3M',
  '4': '4J',
  '#4b5': '#4/b5',
  '5': '5J',
  b6: 'b6',
  '6': '6M',
  b7: 'b7',
  '7': '7M',
  '8': '8J',
};

// Desbloqueio progressivo pelos ranks Teens já existentes (utils/teenProgress.ts) —
// nenhuma escala de XP própria do Radar.
export const INTERVAL_UNLOCK_RANK: Record<IntervalId, TeenRankId> = {
  b3: 'rookie',
  '3': 'rookie',
  '5': 'rookie',
  '8': 'rookie',
  '4': 'runner',
  b7: 'runner',
  '7': 'runner',
  b2: 'architect',
  '2': 'architect',
  b6: 'architect',
  '6': 'architect',
  '#4b5': 'neon',
};

const RANK_MIN_XP: Record<TeenRankId, number> = TEEN_RANKS.reduce(
  (acc, rank) => ({ ...acc, [rank.id]: rank.minXp }),
  {} as Record<TeenRankId, number>
);

export const isIntervalUnlocked = (intervalId: IntervalId, xp: number): boolean =>
  xp >= RANK_MIN_XP[INTERVAL_UNLOCK_RANK[intervalId]];

export const getUnlockedIntervals = (xp: number): IntervalId[] =>
  ALL_INTERVALS.filter((intervalId) => isIntervalUnlocked(intervalId, xp));

// Power Chords e Maior ou Menor são treinos especializados e fixos. O modo
// Misto cresce automaticamente com os intervalos desbloqueados (ver getUnlockedIntervals).
export const INTERVAL_MODE_SCOPE: Record<'power-chords' | 'maior-ou-menor', IntervalId[]> = {
  'power-chords': ['5', '8'],
  'maior-ou-menor': ['b3', '3'],
};

// Fonte única de verdade para cores: data/fretboardVisualTheme.ts. O Radar não
// declara sua própria paleta — só seleciona, do arquivo canônico, as chaves
// que correspondem ao seu IntervalId (incluindo as duas chaves exclusivas do
// Radar: '#4b5' e '8'). `TONIC_COLOR` é re-exportado por conveniência para os
// consumidores deste módulo.
export { TONIC_COLOR } from './fretboardVisualTheme';

export const INTERVAL_MARKER_COLOR: Record<IntervalId, string> = {
  b2: INTERVAL_COLORS.b2,
  '2': INTERVAL_COLORS['2'],
  b3: INTERVAL_COLORS.b3,
  '3': INTERVAL_COLORS['3'],
  '4': INTERVAL_COLORS['4'],
  '#4b5': INTERVAL_COLORS['#4b5'],
  '5': INTERVAL_COLORS['5'],
  b6: INTERVAL_COLORS.b6,
  '6': INTERVAL_COLORS['6'],
  b7: INTERVAL_COLORS.b7,
  '7': INTERVAL_COLORS['7'],
  '8': TONIC_COLOR,
};

export type NeckIntervalDisplay = { label: string; color: string };

// Usado pelo modo "relative-intervals" do fretboard completo: reaproveita
// getIntervalName (music/musicTheory.ts) para os 10 graus compartilhados com
// Tríades/Tétrades, com duas sobrescritas pontuais — tônica mostrada como 'T'
// (não '1') e trítono mostrado como '#4/b5' violeta (não 'b5' azul) — para a
// mesma nota física nunca aparecer com duas cores diferentes no mesmo braço.
export const getRadarNeckDisplay = (root: string, note: string): NeckIntervalDisplay => {
  const generic = getIntervalName(root, note);
  if (generic === '1') return { label: 'T', color: TONIC_COLOR };
  if (generic === 'b5') return { label: INTERVAL_ABBR['#4b5'], color: INTERVAL_COLORS['#4b5'] };
  return { label: generic, color: INTERVAL_COLORS[generic] ?? TONIC_COLOR };
};

export type NeckMarkerData = { string: number; fret: number; label: string; color: string };

// Grid cromático completo do braço (toda corda x toda casa visível), usado
// pelos modos "all-notes"/"relative-intervals" da aba Estudar — mesma cor
// intervalar em ambos, só troca o rótulo (nome da nota ou grau), igual ao
// padrão já usado por buildChromaticNeckMarkers em Tríades/Tétrades.
export const buildRadarNeckMarkers = (
  root: string,
  tuning: string[],
  maxFret: number,
  showNoteNames: boolean,
): NeckMarkerData[] => {
  const markers: NeckMarkerData[] = [];

  tuning.forEach((_, stringIndex) => {
    for (let fret = 0; fret <= maxFret; fret += 1) {
      const note = getNoteAt(stringIndex, fret, tuning);
      const display = getRadarNeckDisplay(root, note);
      markers.push({ string: stringIndex, fret, color: display.color, label: showNoteNames ? note : display.label });
    }
  });

  return markers;
};

export type IntervalCopyEntry = {
  name: string;
  semitoneLabel: string;
  bullets: string[];
};

export type IntervalRadarCopy = {
  pt: IntervalCopyEntry;
  en: IntervalCopyEntry;
  // Reservado para a fase futura "Onde você já ouviu isso?" — não populado ainda.
  references?: { pt: string[]; en: string[] };
};

// Texto pedagógico genérico — referências auditivas populares ficam para uma fase futura.
export const INTERVAL_COPY: Record<IntervalId, IntervalRadarCopy> = {
  b2: {
    pt: {
      name: '2ª Menor (b2)',
      semitoneLabel: '1 semitom.',
      bullets: ['Toque cromático, gera tensão forte.', 'Usado em escalas frígias e em efeitos de suspense.'],
    },
    en: {
      name: 'Minor 2nd (b2)',
      semitoneLabel: '1 semitone.',
      bullets: ['Chromatic step, creates strong tension.', 'Used in phrygian scales and suspense effects.'],
    },
  },
  '2': {
    pt: {
      name: '2ª Maior (2M)',
      semitoneLabel: '2 semitons.',
      bullets: ['Intervalo de tom inteiro.', 'Comum em melodias e nas escalas maiores.'],
    },
    en: {
      name: 'Major 2nd (2M)',
      semitoneLabel: '2 semitones.',
      bullets: ['A whole-tone step.', 'Common in melodies and major scales.'],
    },
  },
  b3: {
    pt: {
      name: '3ª Menor (b3)',
      semitoneLabel: '3 semitons.',
      bullets: ['Responsável pela sonoridade menor.', 'Muito presente em blues, rock e músicas de clima mais sombrio.'],
    },
    en: {
      name: 'Minor 3rd (b3)',
      semitoneLabel: '3 semitones.',
      bullets: ['Gives music its minor sound.', 'Common in blues, rock and darker-sounding songs.'],
    },
  },
  '3': {
    pt: {
      name: '3ª Maior (3M)',
      semitoneLabel: '4 semitons.',
      bullets: ['Responsável pela sonoridade maior.', 'Base dos acordes maiores.'],
    },
    en: {
      name: 'Major 3rd (3M)',
      semitoneLabel: '4 semitones.',
      bullets: ['Gives music its major sound.', 'The foundation of major chords.'],
    },
  },
  '4': {
    pt: {
      name: '4ª Justa (4J)',
      semitoneLabel: '5 semitons.',
      bullets: ['Soa estável e suspensiva.', 'Muito usada em suspensões antes de resolver na 3ª.'],
    },
    en: {
      name: 'Perfect 4th (4J)',
      semitoneLabel: '5 semitones.',
      bullets: ['Sounds stable and suspended.', 'Often used as a suspension before resolving to the 3rd.'],
    },
  },
  '#4b5': {
    pt: {
      name: 'Trítono (#4/b5)',
      semitoneLabel: '6 semitons.',
      bullets: [
        'Único intervalo do sistema que pode ser interpretado como quarta aumentada ou quinta diminuta.',
        'O intervalo mais tenso e instável da música ocidental.',
      ],
    },
    en: {
      name: 'Tritone (#4/b5)',
      semitoneLabel: '6 semitones.',
      bullets: [
        'The only interval that can be read as either an augmented 4th or a diminished 5th.',
        'The most tense and unstable interval in Western music.',
      ],
    },
  },
  '5': {
    pt: {
      name: '5ª Justa (5J)',
      semitoneLabel: '7 semitons.',
      bullets: ['Base dos power chords.', 'Um dos intervalos mais importantes do rock.'],
    },
    en: {
      name: 'Perfect 5th (5J)',
      semitoneLabel: '7 semitones.',
      bullets: ['The foundation of power chords.', 'One of the most important intervals in rock.'],
    },
  },
  b6: {
    pt: {
      name: '6ª Menor (b6)',
      semitoneLabel: '8 semitons.',
      bullets: ['Som melancólico.', 'Comum em harmonia menor e em trilhas dramáticas.'],
    },
    en: {
      name: 'Minor 6th (b6)',
      semitoneLabel: '8 semitones.',
      bullets: ['Melancholic sound.', 'Common in minor harmony and dramatic scores.'],
    },
  },
  '6': {
    pt: {
      name: '6ª Maior (6M)',
      semitoneLabel: '9 semitons.',
      bullets: ['Soa doce e aberta.', 'Aparece em acordes 6 e em melodias country/pop.'],
    },
    en: {
      name: 'Major 6th (6M)',
      semitoneLabel: '9 semitones.',
      bullets: ['Sweet and open sound.', 'Appears in 6 chords and country/pop melodies.'],
    },
  },
  b7: {
    pt: {
      name: '7ª Menor (b7)',
      semitoneLabel: '10 semitons.',
      bullets: ['Elemento fundamental dos acordes dominantes.'],
    },
    en: {
      name: 'Minor 7th (b7)',
      semitoneLabel: '10 semitones.',
      bullets: ['A core building block of dominant chords.'],
    },
  },
  '7': {
    pt: {
      name: '7ª Maior (7M)',
      semitoneLabel: '11 semitons.',
      bullets: ['Som sofisticado e tenso, quase resolve na oitava.', 'Base dos acordes maj7.'],
    },
    en: {
      name: 'Major 7th (7M)',
      semitoneLabel: '11 semitones.',
      bullets: ['Sophisticated, tense sound that almost resolves to the octave.', 'The foundation of maj7 chords.'],
    },
  },
  '8': {
    pt: {
      name: 'Oitava (8J)',
      semitoneLabel: '12 semitons.',
      bullets: ['A mesma nota em uma altura mais aguda.', 'Soa como a "mesma cor", só mais alta.'],
    },
    en: {
      name: 'Octave (8J)',
      semitoneLabel: '12 semitones.',
      bullets: ['The same note at a higher pitch.', 'Sounds like the "same color", just higher.'],
    },
  },
};

export const getIntervalTargetNote = (root: string, intervalId: IntervalId): string => {
  const normalizedRoot = normalizeNote(root);
  const semitones = INTERVAL_SEMITONES[intervalId];
  return CHROMATIC_SCALE[(CHROMATIC_SCALE.indexOf(normalizedRoot) + semitones + 12) % 12];
};

export type FretPosition = { string: number; fret: number };

export type IntervalOccurrence = {
  rootPos: FretPosition;
  targetPos: FretPosition;
};

const collectCandidates = (
  root: string,
  intervalId: IntervalId,
  tuning: string[],
  maxFret: number,
): { rootPositions: FretPosition[]; targetPositions: FretPosition[] } => {
  const normalizedRoot = normalizeNote(root);
  const targetNote = getIntervalTargetNote(root, intervalId);

  const rootPositions: FretPosition[] = [];
  const targetPositions: FretPosition[] = [];

  tuning.forEach((_, stringIndex) => {
    for (let fret = 0; fret <= maxFret; fret += 1) {
      const note = getNoteAt(stringIndex, fret, tuning);
      if (note === normalizedRoot) rootPositions.push({ string: stringIndex, fret });
      if (note === targetNote) targetPositions.push({ string: stringIndex, fret });
    }
  });

  return { rootPositions, targetPositions };
};

// Encontra uma ocorrência didática do intervalo no braço: prioriza a região
// inicial/intermediária, a menor distância física entre as duas notas, evita
// corda solta quando há alternativa clara, e nunca repete a mesma casa para
// as duas notas (o que tornaria a linha de conexão confusa visualmente).
export const findIntervalOccurrence = (
  root: string,
  intervalId: IntervalId,
  tuning: string[],
  maxFret = 15,
): IntervalOccurrence | null => {
  const { rootPositions, targetPositions } = collectCandidates(root, intervalId, tuning, maxFret);
  if (rootPositions.length === 0 || targetPositions.length === 0) return null;

  let best: IntervalOccurrence | null = null;
  let bestScore = Infinity;

  rootPositions.forEach((rootPos) => {
    targetPositions.forEach((targetPos) => {
      if (rootPos.string === targetPos.string && rootPos.fret === targetPos.fret) return;

      const fretSpan = Math.abs(rootPos.fret - targetPos.fret);
      const regionPenalty = Math.max(rootPos.fret, targetPos.fret) * 0.6;
      const openStringPenalty = (rootPos.fret === 0 ? 1 : 0) + (targetPos.fret === 0 ? 1 : 0);
      const stringSpan = Math.abs(rootPos.string - targetPos.string);

      const score = fretSpan + regionPenalty + openStringPenalty * 1.5 + stringSpan * 0.2;

      if (score < bestScore) {
        bestScore = score;
        best = { rootPos, targetPos };
      }
    });
  });

  return best;
};

export type AllIntervalOccurrences = {
  rootPositions: FretPosition[];
  targetPositions: FretPosition[];
};

// Todas as posições da tônica e do alvo no braço visível, para o modo
// "mostrar todas as ocorrências" da aba Estudar.
export const findAllIntervalOccurrences = (
  root: string,
  intervalId: IntervalId,
  tuning: string[],
  maxFret = 15,
): AllIntervalOccurrences => collectCandidates(root, intervalId, tuning, maxFret);
