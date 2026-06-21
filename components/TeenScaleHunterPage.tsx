import React, { useEffect, useRef, useState } from 'react';
import { getTeensLang, getTeensTheme } from '../utils/ecosystemPreferences';
import { addTeensXp, getRankProgress, getTeensXp, TEEN_RANKS } from '../utils/teenProgress';
import { sendFretboardIntent } from '../utils/sendFretboardIntent';
import { getNoteAt, CHROMATIC_SCALE } from '../music/musicTheory';
import { getScaleNotes } from '../music/scales';
import { getAccidentalPreference, type HarmonicCycleMode } from '../music/harmonicCycle';
import { getFrequencyForPosition } from '../utils/audio';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';
import AppFooter from './AppFooter';
import FretboardSVG from './FretboardSVG';
import type { FretboardState, Marker, StringStatus } from '../types';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

// Modos de exercício — substituem o antigo corte arbitrário "easy/medium/hard" por algo
// musicalmente real: subir a escala, descer a escala, subir-e-descer em loop, ou explorar
// livremente dentro dela.
type ExerciseMode = 'ascend' | 'descend' | 'roundtrip' | 'free';
type CellId = `s${number}f${number}`;

type ScaleHunterRegion = {
  id: string;
  label: string;
  strings: number[];
  frets: number[];
};

type PathPattern = {
  id: string;
  title: string;
  sequence: CellId[];
  region: ScaleHunterRegion;
  root: string;
  scaleType: string;
};

type PathConfig = {
  id: string;
  title: string;
  root: string;
  scaleType: string;
};

// Tuning usado para localizar notas reais via music/musicTheory.getNoteAt — fonte única de verdade.
// Indice 0 = corda grossa (6a, E baixo) ... indice 5 = corda fina (1a, E alto). Toda a logica de
// jogo (CellId, region.strings, STRING_PITCH_OFFSET, isTonicCell etc.) usa essa ordem.
const OPEN_NOTES = ['E', 'A', 'D', 'G', 'B', 'E'];

// FretboardSVG desenha customTuning[0] na linha de cima e customTuning[last] na de baixo (getY
// cresce com o indice). O padrao visual do site é a corda fina (1a) em cima e a grossa (6a) embaixo
// — ver TUNING/STRINGS em TeenFingerIndependencePage.tsx. Como toda a logica do Caça às Escalas usa
// OPEN_NOTES na ordem grossa->fina, só invertemos a fronteira com o FretboardSVG: a tuning enviada
// e o indice de corda de cada marker/clique, nunca os indices internos do jogo.
const FRETBOARD_TUNING = [...OPEN_NOTES].reverse();
const toFretboardStringIndex = (logicalStringIdx: number) => OPEN_NOTES.length - 1 - logicalStringIdx;

// Grafia cromática real (com sustenido ou bemol) para cada índice de CHROMATIC_SCALE —
// usadas pelo rótulo do marcador, que nunca deve remover o acidente (ver toDisplayLetter).
const SHARP_SPELLING = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SPELLING = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Mapeia o scaleType (vocabulário do Caça às Escalas, ver music/scales.ts) para o
// HarmonicCycleMode equivalente, só para reaproveitar getAccidentalPreference —
// já testada e usada em GPS dos Acordes para decidir bemol x sustenido por tonalidade.
const SCALE_TYPE_TO_HARMONIC_MODE: Record<string, HarmonicCycleMode> = {
  'Pentatonic Major': 'pentatonic-major',
  'Pentatonic Minor': 'pentatonic-minor',
  'Major (Ionian)': 'major',
  'Natural Minor (Aeolian)': 'minor',
  Blues: 'blues',
  Dorian: 'dorian',
  Mixolydian: 'mixolydian',
  Lydian: 'lydian',
  Phrygian: 'phrygian',
  Locrian: 'locrian',
};

// Regiões jogáveis (subconjuntos de cordas/casas). Usam as 6 cordas (braço completo, como no
// Studio) — a restrição original a 3 cordas era herança das sequências hardcoded do Phase 0,
// não uma decisão pedagógica. Janelas genéricas de 5 casas, deslocando 2 casas por região —
// mesmo padrão de r1/r2 original, só estendido até cobrir o braço inteiro (até a casa 15).
// Não são boxes CAGED nem dependem de tônica/escala — isso é decisão deliberada (ver auditoria).
const SCALE_HUNTER_REGIONS: ScaleHunterRegion[] = [
  { id: 'r1', label: 'Região 1', strings: [0, 1, 2, 3, 4, 5], frets: [1, 2, 3, 4, 5] },
  { id: 'r2', label: 'Região 2', strings: [0, 1, 2, 3, 4, 5], frets: [3, 4, 5, 6, 7] },
  { id: 'r3', label: 'Região 3', strings: [0, 1, 2, 3, 4, 5], frets: [5, 6, 7, 8, 9] },
  { id: 'r4', label: 'Região 4', strings: [0, 1, 2, 3, 4, 5], frets: [7, 8, 9, 10, 11] },
  { id: 'r5', label: 'Região 5', strings: [0, 1, 2, 3, 4, 5], frets: [9, 10, 11, 12, 13] },
  { id: 'r6', label: 'Região 6', strings: [0, 1, 2, 3, 4, 5], frets: [11, 12, 13, 14, 15] },
];
const DEFAULT_REGION = SCALE_HUNTER_REGIONS[0];
const REGION_STRING_LIST = DEFAULT_REGION.strings;
const REGION_FRET_LIST = DEFAULT_REGION.frets;

// Varre a região (cordas x casas) e mantém apenas as células cuja nota real pertence à escala
// (music/scales.getScaleNotes). Continua sendo só o coletor de células válidas — a ordem
// musical (tônica, ascendente) é responsabilidade do pós-processamento abaixo.
const generateScaleHunterPath = ({
  root,
  scaleType,
  strings,
  frets,
}: {
  root: string;
  scaleType: string;
  strings: number[];
  frets: number[];
}): CellId[] => {
  const scaleNotes = new Set(getScaleNotes(root, scaleType));
  const sequence: CellId[] = [];

  for (const stringIdx of strings) {
    for (const fret of frets) {
      const note = getNoteAt(stringIdx, fret, OPEN_NOTES);
      if (scaleNotes.has(note)) {
        sequence.push(`s${stringIdx}f${fret}` as CellId);
      }
    }
  }

  return sequence;
};

// Distância em semitons de cada corda em relação à corda 0 (mais grave), derivada do próprio
// OPEN_NOTES via getNoteAt-equivalente (índice cromático) — sem hardcodar números "5,5,5,4,5".
const STRING_PITCH_OFFSET: number[] = OPEN_NOTES.reduce<number[]>((offsets, note, index) => {
  if (index === 0) return [0];
  const prevIndex = CHROMATIC_SCALE.indexOf(OPEN_NOTES[index - 1]);
  const currentIndex = CHROMATIC_SCALE.indexOf(note);
  const step = ((currentIndex - prevIndex) + 12) % 12;
  offsets.push(offsets[index - 1] + step);
  return offsets;
}, []);

const getCellPitch = (cellId: CellId): number => {
  const match = cellId.match(/^s(\d+)f(\d+)$/);
  if (!match) return 0;
  const stringIndex = Number(match[1]);
  const fret = Number(match[2]);
  return (STRING_PITCH_OFFSET[stringIndex] ?? 0) + fret;
};

// Reordena as células por altura musical real (não pela ordem de varredura corda/casa) e
// remove duplicatas consecutivas de mesmo pitch absoluto (mesma nota, mesma oitava).
const orderByPitch = (cells: CellId[]): CellId[] => {
  const sorted = [...cells].sort((a, b) => getCellPitch(a) - getCellPitch(b));
  const deduped: CellId[] = [];
  let lastPitch: number | null = null;

  for (const cell of sorted) {
    const pitch = getCellPitch(cell);
    if (pitch === lastPitch) continue;
    deduped.push(cell);
    lastPitch = pitch;
  }

  return deduped;
};

// Identifica se uma célula é a tônica (para dar um pequeno realce visual a ela no braço,
// sem recortar nenhuma outra nota válida da escala — ver nota abaixo sobre anchorOnTonic).
const isTonicCell = (cellId: CellId, root: string): boolean => {
  const match = cellId.match(/^s(\d+)f(\d+)$/);
  if (!match) return false;
  return getNoteAt(Number(match[1]), Number(match[2]), OPEN_NOTES) === root;
};

// Junta o coletor de células (generateScaleHunterPath) com o pós-processamento pedagógico —
// usado por todos os pontos que montam um caminho jogável (atalhos, sorteio e geração manual).
//
// Importante: NÃO recortamos mais o início da lista até a primeira tônica. Cortar ali descartava
// notas da escala com pitch menor que a primeira tônica na região (ex.: a b7 abaixo da tônica),
// fazendo-as desaparecer do caminho/realce mesmo sendo notas legítimas da escala — o braço deve
// mostrar a escala inteira da região, começando na nota mais grave disponível, seja ela qual grau
// for. A tônica é só marcada visualmente (isTonicCell), nunca usada para cortar a lista.
const buildScaleHunterSequence = (params: {
  root: string;
  scaleType: string;
  strings: number[];
  frets: number[];
}): CellId[] => {
  const rawCells = generateScaleHunterPath(params);
  return orderByPitch(rawCells);
};

// Os 3 caminhos fixos da Fase 1 continuam disponíveis como atalhos do nível inicial,
// em qualquer rank — "Novo caminho" é quem varia por progressão (ver pools abaixo).
const STARTER_PATH_CONFIGS: PathConfig[] = [
  { id: 'am-pentatonic', title: 'Am Pentatônica', root: 'A', scaleType: 'Pentatonic Minor' },
  { id: 'c-major', title: 'C Maior', root: 'C', scaleType: 'Major (Ionian)' },
  { id: 'am-natural', title: 'Am Natural', root: 'A', scaleType: 'Natural Minor (Aeolian)' },
];

const STARTER_PATHS: PathPattern[] = STARTER_PATH_CONFIGS.map((config) => ({
  id: config.id,
  title: config.title,
  region: DEFAULT_REGION,
  root: config.root,
  scaleType: config.scaleType,
  sequence: buildScaleHunterSequence({
    root: config.root,
    scaleType: config.scaleType,
    strings: REGION_STRING_LIST,
    frets: REGION_FRET_LIST,
  }),
}));

// XP por modo concluído. Não depende mais de um corte de tamanho — o "tamanho" do exercício
// é a escala real (curta numa pentatônica, mais longa numa escala de 7 notas), e quem varia é
// o tipo de percurso: subir, descer, subir-e-descer (loop) ou explorar livremente.
const XP_BY_MODE: Record<ExerciseMode, number> = {
  ascend: 24,
  descend: 24,
  roundtrip: 32,
  free: 30,
};

const EXERCISE_MODE_LABEL: Record<ExerciseMode, { pt: string; en: string }> = {
  ascend: { pt: 'Subir', en: 'Ascend' },
  descend: { pt: 'Descer', en: 'Descend' },
  roundtrip: { pt: 'Subir e descer', en: 'Up & down' },
  free: { pt: 'Livre', en: 'Free' },
};

const EXERCISE_MODE_INTRO: Record<ExerciseMode, { pt: string; en: string }> = {
  ascend: { pt: 'Suba a escala a partir da nota mais grave da região, casa por casa, no seu instrumento.', en: 'Climb the scale from the lowest note in the region, fret by fret, on your instrument.' },
  descend: { pt: 'Agora desça a mesma escala, do topo de volta até a base.', en: 'Now descend the same scale, from the top back down to the bottom.' },
  roundtrip: { pt: 'Suba até o topo da escala e desça de volta, em um único ciclo contínuo.', en: 'Climb to the top of the scale and come back down, in one continuous loop.' },
  free: { pt: 'Toque livremente dentro da escala destacada — sem ordem fixa.', en: 'Play freely inside the highlighted scale — no fixed order.' },
};

// Pool de combinações sorteáveis por "Novo caminho", liberado progressivamente por rank.
// Não é exibido como lista — apenas usado para sortear root + escala + região.
type ScalePoolEntry = {
  scaleType: string;
  roots: string[];
  regionIds: string[];
};

const SCALE_DISPLAY_LABEL: Record<string, string> = {
  'Pentatonic Major': 'Pentatônica Maior',
  'Pentatonic Minor': 'Pentatônica Menor',
  'Major (Ionian)': 'Maior',
  'Natural Minor (Aeolian)': 'Menor Natural',
  Blues: 'Blues',
  Dorian: 'Dorian',
  Mixolydian: 'Mixolydian',
  Lydian: 'Lydian',
  Phrygian: 'Phrygian',
  Locrian: 'Locrian',
};

// Fase 4 — seleção manual controlada: 4 tipos de escala e as 12 tônicas cromáticas,
// liberadas desde o início (escolha consciente do usuário, não depende de rank).
const MANUAL_SCALE_TYPES = ['Pentatonic Major', 'Pentatonic Minor', 'Major (Ionian)', 'Natural Minor (Aeolian)'];
const MANUAL_ROOTS = [...CHROMATIC_SCALE];

// Regiões liberadas por rank — progressão gradual sobre as 6 regiões agora disponíveis
// (era só Rookie/Runner = r1, Architect/Neon = r1+r2; mantém a mesma forma de gate, só
// com mais passos). Usada tanto pelo sorteio ("Novo caminho") quanto pelo seletor manual.
const ROOKIE_REGION_IDS = ['r1'];
const RUNNER_REGION_IDS = ['r1', 'r2'];
const ARCHITECT_REGION_IDS = ['r1', 'r2', 'r3', 'r4'];
const NEON_REGION_IDS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'];

const SCALE_REGION_IDS_BY_RANK: Record<string, string[]> = {
  rookie: ROOKIE_REGION_IDS,
  runner: RUNNER_REGION_IDS,
  architect: ARCHITECT_REGION_IDS,
  neon: NEON_REGION_IDS,
};

// Ordem de progressão dos ranks (mesma ordem de TEEN_RANKS) — usada só para achar o
// primeiro rank que libera cada região, para a dica de "bloqueada" no seletor.
const RANK_ORDER = ['rookie', 'runner', 'architect', 'neon'];

const getRequiredRankForRegion = (regionId: string) =>
  RANK_ORDER.find((rankId) => SCALE_REGION_IDS_BY_RANK[rankId]?.includes(regionId))
    ?? RANK_ORDER[RANK_ORDER.length - 1];

const getAvailableRegionsForRank = (rankId: string): ScaleHunterRegion[] => {
  const allowedIds = SCALE_REGION_IDS_BY_RANK[rankId] ?? ROOKIE_REGION_IDS;
  return SCALE_HUNTER_REGIONS.filter((region) => allowedIds.includes(region.id));
};

const ROOKIE_POOL: ScalePoolEntry[] = [
  { scaleType: 'Pentatonic Minor', roots: ['A'], regionIds: ROOKIE_REGION_IDS },
];

const RUNNER_POOL: ScalePoolEntry[] = [
  { scaleType: 'Pentatonic Minor', roots: ['A'], regionIds: RUNNER_REGION_IDS },
  { scaleType: 'Major (Ionian)', roots: ['C', 'G'], regionIds: RUNNER_REGION_IDS },
  { scaleType: 'Natural Minor (Aeolian)', roots: ['A', 'E'], regionIds: RUNNER_REGION_IDS },
];

const ARCHITECT_POOL: ScalePoolEntry[] = [
  { scaleType: 'Pentatonic Minor', roots: ['A'], regionIds: ARCHITECT_REGION_IDS },
  { scaleType: 'Major (Ionian)', roots: ['C', 'G'], regionIds: ARCHITECT_REGION_IDS },
  { scaleType: 'Natural Minor (Aeolian)', roots: ['A', 'E'], regionIds: ARCHITECT_REGION_IDS },
  { scaleType: 'Blues', roots: ['A', 'E'], regionIds: ARCHITECT_REGION_IDS },
];

// Neon Player libera os modos gregos principais com transposição livre (qualquer fundamental cromática).
const NEON_PLAYER_POOL: ScalePoolEntry[] = [
  { scaleType: 'Pentatonic Minor', roots: ['A'], regionIds: NEON_REGION_IDS },
  { scaleType: 'Major (Ionian)', roots: ['C', 'G'], regionIds: NEON_REGION_IDS },
  { scaleType: 'Natural Minor (Aeolian)', roots: ['A', 'E'], regionIds: NEON_REGION_IDS },
  { scaleType: 'Blues', roots: ['A', 'E'], regionIds: NEON_REGION_IDS },
  ...['Dorian', 'Mixolydian', 'Lydian', 'Phrygian', 'Locrian'].map((scaleType) => ({
    scaleType,
    roots: [...CHROMATIC_SCALE],
    regionIds: NEON_REGION_IDS,
  })),
];

const SCALE_POOL_BY_RANK: Record<string, ScalePoolEntry[]> = {
  rookie: ROOKIE_POOL,
  runner: RUNNER_POOL,
  architect: ARCHITECT_POOL,
  neon: NEON_PLAYER_POOL,
};

const pickRandomItem = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

// Caminhos gerados sempre mostram a região no nome (ex.: "C Maior — Região 1"), para deixar
// claro que vieram do sorteio por rank — diferente dos 3 atalhos fixos, que mantêm título simples.
const buildGeneratedPathTitle = (root: string, scaleType: string, region: ScaleHunterRegion): string => {
  const scaleLabel = SCALE_DISPLAY_LABEL[scaleType] ?? scaleType;
  return `${root} ${scaleLabel} — ${region.label}`;
};

// Resumo discreto (uma linha) do pool liberado por rank — não lista escalas individualmente.
const RANK_POOL_SUMMARY: Record<string, { pt: string; en: string }> = {
  rookie: { pt: 'Rookie: Pentatônica menor', en: 'Rookie: Minor pentatonic' },
  runner: { pt: 'Runner: Maior e menor natural', en: 'Runner: Major and natural minor' },
  architect: { pt: 'Architect: Blues e regiões extras', en: 'Architect: Blues and extra regions' },
  neon: { pt: 'Neon Player: Modos gregos', en: 'Neon Player: Greek modes' },
};

// Sorteia uma combinação (root + escala + região) dentro do pool liberado pelo rank atual,
// gera a sequência via buildScaleHunterSequence e devolve um PathPattern pronto para jogar.
const generateRandomScaleHunterPath = (rankId: string): PathPattern => {
  const pool = SCALE_POOL_BY_RANK[rankId] ?? ROOKIE_POOL;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const entry = pickRandomItem(pool);
    const root = pickRandomItem(entry.roots);
    const regionId = pickRandomItem(entry.regionIds);
    const region = SCALE_HUNTER_REGIONS.find((candidate) => candidate.id === regionId) ?? DEFAULT_REGION;
    const sequence = buildScaleHunterSequence({
      root,
      scaleType: entry.scaleType,
      strings: region.strings,
      frets: region.frets,
    });

    if (sequence.length > 0) {
      return {
        id: `generated-${entry.scaleType}-${root}-${region.id}`,
        title: buildGeneratedPathTitle(root, entry.scaleType, region),
        sequence,
        region,
        root,
        scaleType: entry.scaleType,
      };
    }
  }

  return STARTER_PATHS[0];
};

// Grafia real da nota (com o acidente correto para a tonalidade), nunca removida — ex.: A#/Bb
// nunca aparece como "A", C#/Db nunca aparece como "C". A escolha entre sustenido e bemol segue
// a mesma convenção de tonalidade já usada em GPS dos Acordes (getAccidentalPreference).
const toDisplayLetter = (chromaticNote: string, root: string, scaleType: string): string => {
  const index = CHROMATIC_SCALE.indexOf(chromaticNote);
  if (index === -1) return chromaticNote;
  const mode = SCALE_TYPE_TO_HARMONIC_MODE[scaleType];
  const accidental = mode ? getAccidentalPreference(root, mode) : 'sharp';
  return accidental === 'flat' ? FLAT_SPELLING[index] : SHARP_SPELLING[index];
};

const TeenScaleHunterPage: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [lang] = useState<'pt' | 'en'>(() => getTeensLang());
  const [mode, setMode] = useState<ExerciseMode>('ascend');
  const [currentPath, setCurrentPath] = useState<PathPattern>(STARTER_PATHS[0]);
  const [activeCell, setActiveCell] = useState<CellId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInput, setUserInput] = useState<CellId[]>([]);
  const [feedback, setFeedback] = useState(() => (lang === 'pt' ? 'Escolha um caminho, ouça a tônica e acompanhe no seu instrumento.' : 'Choose a path, listen for the root note and follow along on your instrument.'));
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const [xp, setXp] = useState<number>(() => getTeensXp());
  // Espelha o currentPath inicial (STARTER_PATHS[0]) para os seletores manuais nao
  // mostrarem um rascunho diferente do caminho de fato ativo no primeiro render.
  const [manualRoot, setManualRoot] = useState<string>(STARTER_PATHS[0].root);
  const [manualScaleType, setManualScaleType] = useState<string>(STARTER_PATHS[0].scaleType);
  const [manualRegionId, setManualRegionId] = useState<string>(DEFAULT_REGION.id);
  // Mesmo estado/label/prop de Tríades e Tétrades (handedness -> FretboardState.isLeftHanded),
  // sem nenhuma lógica nova: o espelhamento é todo feito pelo FretboardSVG.
  const [handedness, setHandedness] = useState<'right' | 'left'>('right');
  // Dica da região bloqueada tocada por último — title já cobre hover no desktop, mas toque
  // no mobile não dispara :hover, então guardamos a última região bloqueada tocada para
  // mostrar a mesma dica em texto, sem precisar de uma lib de tooltip nova.
  const [lockedRegionHintId, setLockedRegionHintId] = useState<string | null>(null);

  // O wrapper min-w-[880px] (ajuste de ergonomia de toque no mobile) abre com scrollLeft=0,
  // que mostra a borda esquerda do SVG. Em modo destro essa borda é o nut — certo por padrão.
  // Em canhoto o FretboardSVG espelha o eixo X e o nut passa para a direita, então sem isso o
  // aluno cairia numa área vazia (padding) e precisaria rolar manualmente para achar a região.
  useEffect(() => {
    const node = fretboardScrollRef.current;
    if (!node) return;
    node.scrollLeft = handedness === 'left' ? node.scrollWidth : 0;
  }, [handedness]);

  const fretboardScrollRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playTokenRef = useRef(0);

  const isLight = theme === 'light';
  const isPt = lang === 'pt';
  const rankProgress = getRankProgress(xp);

  // A escala completa (ordenada por pitch, começando na nota mais grave da região, seja ela
  // qual grau for) é o próprio exercício — sem corte arbitrário de tamanho e sem recortar o
  // início pela tônica. "Descer" é a mesma escala invertida; "Subir e descer" é um ciclo único
  // (sobe até o topo e desce de volta, sem repetir a nota do topo duas vezes); "Livre" não tem
  // ordem fixa, mas usa o conjunto ascendente como referência de quais notas pertencem à escala.
  const ascendSequence = currentPath.sequence;
  const descendSequence = [...ascendSequence].reverse();
  const roundtripSequence = [...ascendSequence, ...descendSequence.slice(1)];
  const targetSequence = mode === 'descend'
    ? descendSequence
    : mode === 'roundtrip'
      ? roundtripSequence
      : ascendSequence;

  const availableManualRegions = getAvailableRegionsForRank(rankProgress.current.id);
  const resolvedManualRegionId = availableManualRegions.some((region) => region.id === manualRegionId)
    ? manualRegionId
    : availableManualRegions[0].id;

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? 'rgba(148,163,184,0.35)' : 'rgba(139,92,246,0.18)'} 1px, transparent 1px)`,
    backgroundSize: '100% 30px',
  };

  const cellToNote = (cellId: CellId): string | null => {
    const match = cellId.match(/^s(\d+)f(\d+)$/);
    if (!match) return null;
    const stringIndex = Number(match[1]);
    const fret = Number(match[2]);
    const chromatic = getNoteAt(stringIndex, fret, OPEN_NOTES);
    return toDisplayLetter(chromatic, currentPath.root, currentPath.scaleType);
  };

  // Migração da grade HTML para o FretboardSVG compartilhado (mesmo componente de
  // Triades/Tetrades/GPS/Independencia dos Dedos): nota-alvo, acerto e tonica viram
  // markers; a regiao jogavel vira startFret/endFret (fora dela o FretboardSVG nem
  // desenha a casa). Layers automaticos ficam desligados — cor e 100% via markers,
  // igual ao padrao ja usado por TeenFingerIndependencePage.
  const scaleHunterMarkers: Marker[] = [];
  for (const stringIdx of currentPath.region.strings) {
    for (const fret of currentPath.region.frets) {
      const cellId = `s${stringIdx}f${fret}` as CellId;
      const isTarget = currentPath.sequence.includes(cellId);
      const wasPicked = userInput.includes(cellId);
      const isTonic = isTarget && isTonicCell(cellId, currentPath.root);
      // Tonica usa vermelho (#ef4444), a mesma cor do intervalo "1" no resto do GA
      // (ver colors.intervals['1'] em FretboardSVG.tsx) — sem triangulo, so cor, para
      // nao precisar de um shape novo nem tocar no FretboardSVG.
      const color = wasPicked ? '#34d399' : isTonic ? '#ef4444' : isTarget ? '#8b5cf6' : (isLight ? '#cbd5e1' : '#52525b');
      scaleHunterMarkers.push({
        id: cellId,
        string: toFretboardStringIndex(stringIdx),
        fret,
        shape: 'circle',
        color,
        finger: cellToNote(cellId) ?? '-',
      });
    }
  }

  const activeCellPosition = (() => {
    if (!activeCell) return null;
    const match = activeCell.match(/^s(\d+)f(\d+)$/);
    if (!match) return null;
    return { string: toFretboardStringIndex(Number(match[1])), fret: Number(match[2]) };
  })();

  const scaleHunterStringStatuses: StringStatus[] = OPEN_NOTES.map(() => 'normal');

  // FretboardSVG centra o marcador de cada casa no espaco ANTES da sua propria
  // trastinha — por isso todo outro consumidor (Triad/Tetrad Map, GPS, Finger
  // Independence) nunca usa startFret igual a casa do primeiro marcador real,
  // sempre subtraindo 1 (ver buildChordGpsFretboardState, etc.) — sem essa folga
  // a primeira coluna da regiao fica fora da area visivel do SVG.
  const scaleHunterFretboardState: FretboardState = {
    id: 'scale-hunter',
    title: '',
    subtitle: '',
    notes: '',
    startFret: Math.max(0, Math.min(...currentPath.region.frets) - 1),
    endFret: Math.max(...currentPath.region.frets) + 1,
    isLeftHanded: handedness === 'left',
    root: currentPath.root,
    scaleType: currentPath.scaleType,
    instrumentType: 'guitar-6',
    tuning: 'Custom',
    customTuning: FRETBOARD_TUNING,
    stringStatuses: scaleHunterStringStatuses,
    labelMode: 'fingering',
    harmonyMode: 'OFF',
    chordQuality: 'DIATONIC',
    chordDegree: 0,
    inversion: 0,
    colorMode: 'SINGLE',
    layers: { showInlays: true, showAllNotes: false, showScale: false, showTonic: false },
    markers: scaleHunterMarkers,
    lines: [],
  };

  const getAudioCtx = async () => {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    return audioContextRef.current;
  };

  const playCellNote = async (cellId: CellId, duration = 0.2) => {
    const match = cellId.match(/^s(\d+)f(\d+)$/);
    if (!match) return;
    const stringIndex = Number(match[1]);
    const fret = Number(match[2]);
    const frequency = getFrequencyForPosition('guitar-6', OPEN_NOTES, stringIndex, fret);
    const ctx = await getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, now);
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
      setFeedback(isPt ? 'Toque este caminho no seu instrumento e confirme no braço.' : 'Play this path on your instrument and confirm it on the fretboard.');
    }
  };

  // Modo Livre: não há ordem obrigatória — qualquer nota da escala conta, na ordem que o aluno
  // quiser. "Concluído" aqui significa ter passado por todas as posições da escala na região.
  const handleFreePick = (cellId: CellId) => {
    const isInScale = currentPath.sequence.includes(cellId);

    if (!isInScale) {
      setCombo(0);
      setFeedback(isPt ? 'Essa nota está fora da escala. Procure outra dentro do desenho destacado.' : 'That note is outside the scale. Look for one inside the highlighted shape.');
      return;
    }

    setUserInput((prev) => {
      if (prev.includes(cellId)) return prev;
      const next = [...prev, cellId];
      setCombo((v) => v + 1);

      if (next.length === currentPath.sequence.length) {
        const nextXp = addTeensXp(XP_BY_MODE.free);
        setXp(nextXp);
        setStreak((v) => v + 1);
        setFeedback(isPt ? 'Você passou por toda a escala! Novo XP adicionado.' : 'You explored the whole scale! New XP added.');
      } else {
        setFeedback(isPt ? 'Boa! Continue explorando as notas da escala no instrumento.' : 'Nice! Keep exploring the scale notes on your instrument.');
      }

      return next;
    });
  };

  const handlePickCell = async (cellId: CellId) => {
    if (isPlaying) return;

    setActiveCell(cellId);
    void playCellNote(cellId, 0.16);
    window.setTimeout(() => setActiveCell(null), 150);

    if (mode === 'free') {
      handleFreePick(cellId);
      return;
    }

    setUserInput((prev) => {
      const next = [...prev, cellId].slice(0, targetSequence.length);
      const expected = targetSequence[next.length - 1];

      if (cellId !== expected) {
        setCombo(0);
        setFeedback(isPt ? 'Quase! Ouça de novo e siga o padrão do caminho.' : 'Almost! Listen again and follow the path pattern.');
        return next;
      }

      if (next.length === targetSequence.length) {
        const nextXp = addTeensXp(XP_BY_MODE[mode]);
        setXp(nextXp);
        setStreak((v) => v + 1);
        setCombo((v) => v + 1);
        setFeedback(isPt ? 'Caminho concluído! Novo XP adicionado.' : 'Path completed! New XP added.');
      } else {
        setFeedback(isPt ? 'Boa! Continue acompanhando a escala no instrumento.' : 'Nice! Keep following the scale on your instrument.');
      }

      return next;
    });
  };

  const resetTry = () => {
    setUserInput([]);
    setFeedback(isPt ? 'Tentativa limpa. Ouça a tônica e acompanhe de novo no instrumento.' : 'Attempt cleared. Listen for the root note and follow along again on your instrument.');
  };

  // Troca o caminho ativo E mantém os seletores de "Criar caminho" (Tônica/Escala/Região)
  // sincronizados com o que está de fato em jogo — inclusive quando o caminho vem de um
  // atalho fixo ou do sorteio por rank, não só da geração manual. Tônica/Escala só são
  // sincronizadas quando o tipo sorteado está entre os 4 oferecidos no seletor manual
  // (Blues/modos, sorteados em ranks mais altos, não têm opção lá — sincronizar geraria
  // um <select> mostrando um valor que não existe na lista).
  const applyPath = (path: PathPattern, message: string) => {
    setCurrentPath(path);
    if (MANUAL_SCALE_TYPES.includes(path.scaleType)) {
      setManualRoot(path.root);
      setManualScaleType(path.scaleType);
    }
    setManualRegionId(path.region.id);
    setUserInput([]);
    setFeedback(message);
  };

  const newChallenge = () => {
    let next = generateRandomScaleHunterPath(rankProgress.current.id);
    if (next.id === currentPath.id) {
      next = generateRandomScaleHunterPath(rankProgress.current.id);
    }
    applyPath(next, isPt ? 'Novo caminho carregado. Observe a tônica e toque junto no instrumento.' : 'New path loaded. Spot the root note and play along on your instrument.');
  };

  const generateManualPath = () => {
    const region = SCALE_HUNTER_REGIONS.find((candidate) => candidate.id === resolvedManualRegionId) ?? DEFAULT_REGION;
    const sequence = buildScaleHunterSequence({
      root: manualRoot,
      scaleType: manualScaleType,
      strings: region.strings,
      frets: region.frets,
    });

    if (sequence.length === 0) {
      setFeedback(isPt ? 'Essa combinação não tem notas nessa região. Tente outra tônica ou escala.' : 'That combination has no notes in this region. Try another root or scale.');
      return;
    }

    applyPath(
      {
        id: `manual-${manualScaleType}-${manualRoot}-${region.id}`,
        title: buildGeneratedPathTitle(manualRoot, manualScaleType, region),
        sequence,
        region,
        root: manualRoot,
        scaleType: manualScaleType,
      },
      isPt ? 'Caminho gerado. Observe a tônica e toque junto no instrumento.' : 'Path generated. Spot the root note and play along on your instrument.',
    );
  };

  return (
    <>
    <div className={`relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />

      <main className="relative mx-auto max-w-6xl">
        <EcosystemPageActions ecosystem="teens" isLight={isLight} backLabel={isPt ? "Voltar ao Teens" : "Back to Teens"} backPath="/teens" />
        <InternalEcosystemHeader ecosystem="teens" isLight={isLight} title="Caça às Escalas" subtitle="Caçe padrões no braço e reproduza caminhos musicais por região." />

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-violet-800/60 bg-zinc-950/80'}`}>
          <div className="grid gap-3 md:grid-cols-3">
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">{isPt ? 'Modo' : 'Mode'}</p>
              <p className="mt-1 text-lg font-black">{EXERCISE_MODE_LABEL[mode][lang]} · {targetSequence.length} {isPt ? 'notas' : 'notes'}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-400">Caminho</p>
              <p className="mt-1 text-lg font-black">{currentPath.title}</p>
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
            <p className={`mt-2 text-[10px] font-bold uppercase tracking-tight ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {isPt
                ? RANK_POOL_SUMMARY[rankProgress.current.id]?.pt ?? RANK_POOL_SUMMARY.rookie.pt
                : RANK_POOL_SUMMARY[rankProgress.current.id]?.en ?? RANK_POOL_SUMMARY.rookie.en}
              {rankProgress.current.id === 'rookie'
                ? ` · ${isPt ? 'Suba de rank para liberar novas escalas.' : 'Level up to unlock new scales.'}`
                : ''}
            </p>
          </div>

          <div className="mt-4">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {isPt ? 'Modo de prática' : 'Practice mode'}
            </p>
            <div className="mt-2 grid gap-2 sm:flex sm:flex-wrap">
              {(['ascend', 'descend', 'roundtrip', 'free'] as ExerciseMode[]).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setMode(item);
                    setUserInput([]);
                    setFeedback(EXERCISE_MODE_INTRO[item][lang]);
                  }}
                  className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${
                    mode === item
                      ? isLight
                        ? 'border-violet-500 bg-violet-100 text-violet-900'
                        : 'border-violet-400 bg-violet-500/15 text-violet-50'
                      : isLight
                        ? 'border-slate-300 bg-white hover:border-violet-400'
                        : 'border-zinc-700 bg-zinc-950 hover:border-violet-500'
                  }`}
                >
                  {EXERCISE_MODE_LABEL[item][lang]}
                </button>
              ))}
            </div>
          </div>

          <div className={`mt-4 rounded-2xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {isPt ? 'Criar caminho' : 'Create path'}
            </p>
            <p className={`mt-1 text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
              {isPt ? 'Escolha a tônica e a escala para montar seu próprio desafio.' : 'Pick a root and scale to build your own challenge.'}
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1">
                <span className={`text-[9px] font-black uppercase ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>{isPt ? 'Tônica' : 'Root'}</span>
                <select
                  value={manualRoot}
                  onChange={(e) => setManualRoot(e.target.value)}
                  className={`min-h-[40px] rounded-lg border px-3 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white text-slate-900' : 'border-zinc-700 bg-zinc-950 text-zinc-100'}`}
                >
                  {MANUAL_ROOTS.map((note) => (
                    <option key={note} value={note}>{note}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className={`text-[9px] font-black uppercase ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>{isPt ? 'Escala' : 'Scale'}</span>
                <select
                  value={manualScaleType}
                  onChange={(e) => setManualScaleType(e.target.value)}
                  className={`min-h-[40px] rounded-lg border px-3 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white text-slate-900' : 'border-zinc-700 bg-zinc-950 text-zinc-100'}`}
                >
                  {MANUAL_SCALE_TYPES.map((scaleType) => (
                    <option key={scaleType} value={scaleType}>{SCALE_DISPLAY_LABEL[scaleType] ?? scaleType}</option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-1">
                <span className={`text-[9px] font-black uppercase ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>{isPt ? 'Região' : 'Region'}</span>
                <div className="flex flex-wrap gap-2">
                  {SCALE_HUNTER_REGIONS.map((region) => {
                    const isUnlocked = availableManualRegions.some((available) => available.id === region.id);
                    const isSelected = isUnlocked && resolvedManualRegionId === region.id;
                    const requiredRank = TEEN_RANKS.find((rank) => rank.id === getRequiredRankForRegion(region.id));
                    const lockHint = requiredRank
                      ? (isPt
                          ? `Desbloqueia com rank ${requiredRank.label} (${requiredRank.minXp} XP)`
                          : `Unlocks at ${requiredRank.label} rank (${requiredRank.minXp} XP)`)
                      : undefined;
                    return (
                      <button
                        key={region.id}
                        type="button"
                        title={isUnlocked ? undefined : lockHint}
                        aria-disabled={!isUnlocked}
                        onClick={() => {
                          if (!isUnlocked) {
                            setLockedRegionHintId(region.id);
                            return;
                          }
                          setLockedRegionHintId(null);
                          setManualRegionId(region.id);
                        }}
                        className={`min-h-[40px] rounded-lg border px-3 text-xs font-black uppercase transition-all ${
                          !isUnlocked
                            ? isLight
                              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                              : 'cursor-not-allowed border-zinc-800 bg-zinc-900/40 text-zinc-600'
                            : isSelected
                              ? isLight
                                ? 'border-violet-500 bg-violet-100 text-violet-900'
                                : 'border-violet-300 bg-violet-500/25 text-violet-50'
                              : isLight
                                ? 'border-slate-300 bg-white text-slate-700 hover:border-violet-400'
                                : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-violet-500'
                        }`}
                      >
                        {region.label}{!isUnlocked ? ' 🔒' : ''}
                      </button>
                    );
                  })}
                </div>
                {lockedRegionHintId && !availableManualRegions.some((available) => available.id === lockedRegionHintId) ? (
                  <p className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    {(() => {
                      const requiredRank = TEEN_RANKS.find((rank) => rank.id === getRequiredRankForRegion(lockedRegionHintId));
                      if (!requiredRank) return null;
                      return isPt
                        ? `Desbloqueia com rank ${requiredRank.label} (${requiredRank.minXp} XP)`
                        : `Unlocks at ${requiredRank.label} rank (${requiredRank.minXp} XP)`;
                    })()}
                  </p>
                ) : (
                  <p className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    {isPt ? 'Novas regiões são liberadas conforme seu XP no Teens.' : 'New regions unlock as your Teens XP grows.'}
                  </p>
                )}
              </div>

              <button
                onClick={generateManualPath}
                className={`min-h-[40px] rounded-lg border px-4 text-xs font-black uppercase ${isLight ? 'border-violet-500 bg-violet-100 text-violet-900 hover:bg-violet-200' : 'border-violet-400 bg-violet-500/15 text-violet-50 hover:bg-violet-500/25'}`}
              >
                {isPt ? 'Gerar caminho' : 'Generate path'}
              </button>

              <div className="flex flex-col gap-1">
                <span className={`text-[9px] font-black uppercase ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>{isPt ? 'Modo do braço' : 'Neck mode'}</span>
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
                      {item === 'right' ? (isPt ? 'Destro' : 'Right') : (isPt ? 'Canhoto' : 'Left')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-4 rounded-2xl border p-3 ${isLight ? 'border-slate-300 bg-slate-50' : 'border-violet-800/50 bg-zinc-900/60'}`}>
            {/* FretboardSVG escala altura proporcionalmente a largura (viewBox fixo). Em telas
                estreitas isso espreme demais o espaco entre cordas para um toque confortavel.
                Sem alterar o FretboardSVG: forcamos uma largura minima aqui (min-w) e deixamos
                o scroll horizontal (overflow-x-auto) absorver o excesso em mobile — a altura
                sobe junto, proporcional, sem distorcer nada. */}
            <div className="overflow-x-auto" ref={fretboardScrollRef}>
              <div className="min-w-[880px]">
                <FretboardSVG
                  state={scaleHunterFretboardState}
                  editorMode="view"
                  onEvent={(event) => {
                    if (isPlaying || event?.type !== 'note') return;
                    void handlePickCell(`s${toFretboardStringIndex(event.string)}f${event.fret}` as CellId);
                  }}
                  selectedColor="#8b5cf6"
                  selectedShape="circle"
                  theme={theme}
                  isActive={false}
                  feedbackNote={activeCellPosition}
                />
              </div>
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
              className="min-h-[44px] rounded-xl border border-violet-400/60 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-xs font-black uppercase text-center leading-tight text-white shadow-[0_10px_24px_rgba(139,92,246,0.35)] transition-all hover:from-violet-500 hover:to-fuchsia-500 active:scale-95"
            >
              {isPt ? 'Sortear novo caminho' : 'Roll a new path'}
            </button>
            <button
              onClick={resetTry}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-white hover:border-violet-400' : 'border-zinc-700 bg-zinc-950 hover:border-violet-500'}`}
            >
              Limpar
            </button>
          </div>

          <p className={`mt-2 text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            {isPt
              ? 'Novos caminhos são sorteados conforme seu rank. O botão "Sortear novo caminho" libera escalas e regiões conforme seu progresso.'
              : 'New paths are rolled based on your rank. The "Roll a new path" button unlocks scales and regions as you progress.'}
          </p>

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

    <AppFooter
      isLight={isLight}
      lang={lang}
      logoSrc="/gateenslogo.webp"
      logoAlt="Guitar Architect Teens"
    />
    </>
  );
};

export default TeenScaleHunterPage;

