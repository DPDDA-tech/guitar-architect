import { getNoteAt, getFretForNote, transposeNote } from '../music/musicTheory';
import { getScaleNotes } from '../music/scales';

// Shapes reais (boxes tradicionais) da pentatônica, para o Caça às Escalas — substituem as
// janelas genéricas de casas (Região 1-6) só para Pentatônica Menor/Maior. Major/Menor Natural/
// modos gregos continuam usando as janelas genéricas (fora do escopo desta etapa).
//
// Modelo (ver auditoria): o dataset guarda só GEOMETRIA — offsets de casa por corda, relativos
// a uma única âncora (a casa onde a tônica MENOR cai na corda grave). Nenhuma nota é gravada
// aqui; getScaleNotes/getNoteAt (música/scales.ts, música/musicTheory.ts) são a única fonte de
// verdade musical, usadas em resolvePentatonicShape para validar e para achar a tônica.
//
// Pentatônica maior reaproveita a MESMA geometria da relativa menor (3 semitons abaixo) — não
// existe um segundo dataset para "maior": é o mesmo desenho, só a tônica destacada muda.

export type PentatonicShapeId = 'shape-1' | 'shape-2' | 'shape-3' | 'shape-4' | 'shape-5';

type ShapeStringOffsets = {
  string: number; // 0 = corda grave (E baixo) .. 5 = corda aguda (E alto) — mesma convenção do Caça às Escalas
  fretOffsets: number[];
};

export type PentatonicShapeDefinition = {
  id: PentatonicShapeId;
  label: string;
  positions: ShapeStringOffsets[];
};

export type ResolvedShapePosition = {
  string: number;
  fret: number;
  note: string;
  isTonic: boolean;
};

// Offsets validados nota a nota contra os 5 boxes tradicionais de pentatônica menor (A menor
// pentatônica como referência: Shape 1 = casas 5-8, Shape 2 = 7-10, Shape 3 = 9/10-12/13,
// Shape 4 = 12-15, Shape 5 = 0-3). A corda G "atrasa" uma casa nos shapes 3/4 e a B "atrasa"
// uma casa nos shapes 1/2/4 — efeito esperado do intervalo de 3a maior entre G e B (em vez da
// 4a justa das outras cordas adjacentes), não um erro de digitação.
export const MINOR_PENTATONIC_SHAPES: PentatonicShapeDefinition[] = [
  {
    id: 'shape-1',
    label: 'Shape 1',
    positions: [
      { string: 0, fretOffsets: [0, 3] },
      { string: 1, fretOffsets: [0, 2] },
      { string: 2, fretOffsets: [0, 2] },
      { string: 3, fretOffsets: [0, 2] },
      { string: 4, fretOffsets: [0, 3] },
      { string: 5, fretOffsets: [0, 3] },
    ],
  },
  {
    id: 'shape-2',
    label: 'Shape 2',
    positions: [
      { string: 0, fretOffsets: [3, 5] },
      { string: 1, fretOffsets: [2, 5] },
      { string: 2, fretOffsets: [2, 5] },
      { string: 3, fretOffsets: [2, 4] },
      { string: 4, fretOffsets: [3, 5] },
      { string: 5, fretOffsets: [3, 5] },
    ],
  },
  {
    id: 'shape-3',
    label: 'Shape 3',
    positions: [
      { string: 0, fretOffsets: [5, 7] },
      { string: 1, fretOffsets: [5, 7] },
      { string: 2, fretOffsets: [5, 7] },
      { string: 3, fretOffsets: [4, 7] },
      { string: 4, fretOffsets: [5, 8] },
      { string: 5, fretOffsets: [5, 7] },
    ],
  },
  {
    id: 'shape-4',
    label: 'Shape 4',
    positions: [
      { string: 0, fretOffsets: [7, 10] },
      { string: 1, fretOffsets: [7, 10] },
      { string: 2, fretOffsets: [7, 9] },
      { string: 3, fretOffsets: [7, 9] },
      { string: 4, fretOffsets: [8, 10] },
      { string: 5, fretOffsets: [7, 10] },
    ],
  },
  {
    id: 'shape-5',
    label: 'Shape 5',
    positions: [
      { string: 0, fretOffsets: [-5, -2] },
      { string: 1, fretOffsets: [-5, -2] },
      { string: 2, fretOffsets: [-5, -3] },
      { string: 3, fretOffsets: [-5, -3] },
      { string: 4, fretOffsets: [-4, -2] },
      { string: 5, fretOffsets: [-5, -2] },
    ],
  },
];

const PENTATONIC_SCALE_TYPES = new Set(['Pentatonic Minor', 'Pentatonic Major']);
export const isPentatonicScaleType = (scaleType: string): boolean => PENTATONIC_SCALE_TYPES.has(scaleType);

// Referência pedagógica pura (CAGED) — não influencia geometria, offsets, âncora nem
// nenhuma lógica musical: serve só para a UI mostrar a letra CAGED ao lado do número do
// shape, já que esse é o nome pelo qual a maioria dos métodos de guitarra reconhece cada
// box. Ordem ascendente no braço (Shape 5 → 1 → 2 → 3 → 4) é G-E-D-C-A, o ciclo CAGED padrão.
export const CAGED_LETTER_BY_SHAPE_ID: Record<PentatonicShapeId, string> = {
  'shape-1': 'E',
  'shape-2': 'D',
  'shape-3': 'C',
  'shape-4': 'A',
  'shape-5': 'G',
};

// Offset mais negativo de todo o dataset (hoje -5, do Shape 5). A âncora é decidida UMA vez
// por tônica e reaproveitada pelos 5 shapes igualmente — nunca recalculada por shape
// individual, senão dois shapes podem colidir na mesma região do braço para tônicas com
// âncora natural baixa (ex.: E, F, F#, G, G# na corda grave). Ver auditoria: tratamento do Shape 5.
const GLOBAL_MIN_OFFSET = Math.min(
  ...MINOR_PENTATONIC_SHAPES.flatMap((shape) => shape.positions.flatMap((position) => position.fretOffsets)),
);

const LOW_STRING_INDEX = 0;

// Pentatônica maior usa a geometria da relativa menor (3 semitons abaixo) — mesmas casas,
// tônica diferente. Para menor, a "relativa" é a própria tônica escolhida.
export const getShapeAnchorRoot = (root: string, scaleType: string): string =>
  scaleType === 'Pentatonic Major' ? transposeNote(root, -3) : root;

// Âncora física compartilhada pelos 5 shapes: a casa mais baixa (>=0) onde a tônica relativa
// menor cai na corda grave, subindo uma oitava inteira se isso deixaria o Shape 5 negativo.
export const getPentatonicAnchorFret = (anchorRoot: string, tuning: string[]): number => {
  let anchor = getFretForNote(LOW_STRING_INDEX, anchorRoot, tuning, 0);
  while (anchor + GLOBAL_MIN_OFFSET < 0) {
    anchor += 12;
  }
  return anchor;
};

// Resolve um shape para casas reais de um root/scaleType concretos. getScaleNotes valida que
// toda casa gerada pertence à escala (defensivo — a geometria já deveria garantir isso) e
// isTonic compara contra a ROOT escolhida pelo usuário (maior OU menor), não contra a raiz
// relativa usada só para achar a âncora física.
export const resolvePentatonicShape = (
  root: string,
  scaleType: string,
  shape: PentatonicShapeDefinition,
  tuning: string[],
): ResolvedShapePosition[] => {
  const anchorRoot = getShapeAnchorRoot(root, scaleType);
  const anchor = getPentatonicAnchorFret(anchorRoot, tuning);
  const scaleNotes = new Set(getScaleNotes(root, scaleType));

  return shape.positions.flatMap(({ string, fretOffsets }) =>
    fretOffsets.map((offset) => {
      const fret = anchor + offset;
      const note = getNoteAt(string, fret, tuning);
      if (fret < 0 || !scaleNotes.has(note)) {
        console.warn(
          `[teenScalePentatonicShapes] casa inválida gerada: shape=${shape.id} string=${string} fret=${fret} nota=${note} para ${root} ${scaleType}`,
        );
      }
      return { string, fret, note, isTonic: note === root };
    }),
  );
};
