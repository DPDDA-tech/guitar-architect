import type { FingerExerciseDefinition, FingerExerciseRegion } from '../data/teenFingerExerciseData';

export type FingerExerciseMode = 'ascend' | 'descend' | 'roundtrip';

export interface FingerExerciseStep {
  string: number;
  fret: number;
  finger: number;
}

type FingerOrderSource = Pick<FingerExerciseDefinition, 'fingerOrder' | 'fretOffsets'>;

const fretForFinger = (def: FingerOrderSource, region: FingerExerciseRegion, orderIndex: number): number => {
  const offset = def.fretOffsets ? def.fretOffsets[orderIndex] : def.fingerOrder[orderIndex] - 1;
  return region.startFret + offset;
};

export const buildFingerExerciseSequence = (
  def: FingerOrderSource,
  region: FingerExerciseRegion,
  strings: number[],
): FingerExerciseStep[] => {
  const steps: FingerExerciseStep[] = [];

  strings.forEach((stringIndex) => {
    def.fingerOrder.forEach((finger, orderIndex) => {
      steps.push({
        string: stringIndex,
        fret: fretForFinger(def, region, orderIndex),
        finger,
      });
    });
  });

  return steps;
};

export const buildHeldFingerSteps = (
  def: FingerExerciseDefinition,
  region: FingerExerciseRegion,
  strings: number[],
): FingerExerciseStep[] => {
  if (!def.heldFingers || def.heldFingers.length === 0) return [];

  const steps: FingerExerciseStep[] = [];
  strings.forEach((stringIndex) => {
    def.heldFingers!.forEach((finger) => {
      steps.push({
        string: stringIndex,
        fret: region.startFret + (finger - 1),
        finger,
      });
    });
  });

  return steps;
};

export const applyExerciseMode = (
  sequence: FingerExerciseStep[],
  mode: FingerExerciseMode,
): FingerExerciseStep[] => {
  if (mode === 'ascend') return sequence;
  if (mode === 'descend') return [...sequence].reverse();

  const reversed = [...sequence].reverse();
  return [...sequence, ...reversed.slice(1, -1)];
};

// Standard 1-2-3-4 warm-up, always ascending E (low) to e (high) regardless
// of the selected mode — the "pairs" category always ramps up through every
// string with all four fingers before the pair drill itself begins.
const WARMUP_FINGER_ORDER = [1, 2, 3, 4];

// "Pairs" exercises play a fixed ascending warm-up first, then drill just the
// selected pair. The drill continues from the string the warm-up ended on
// (e, the 1st string) with no jump whenever possible: descend picks up
// straight from e→E, and roundtrip goes e→E→e (dropping the pair's own
// leading E-string group from the climb back up so the bottom note isn't
// played twice in a row). Only "ascend" mode requires a jump back down to E,
// since the pair has nowhere left to climb from e.
export const buildPairExerciseSequence = (
  pairDef: FingerOrderSource,
  region: FingerExerciseRegion,
  strings: number[],
  mode: FingerExerciseMode,
): FingerExerciseStep[] => {
  const warmup = buildFingerExerciseSequence({ fingerOrder: WARMUP_FINGER_ORDER }, region, strings);
  const pairAscend = buildFingerExerciseSequence(pairDef, region, strings);

  let pairTail: FingerExerciseStep[];
  if (mode === 'ascend') {
    pairTail = pairAscend;
  } else if (mode === 'descend') {
    pairTail = [...pairAscend].reverse();
  } else {
    const pairDescend = [...pairAscend].reverse();
    const groupSize = pairDef.fingerOrder.length;
    pairTail = [...pairDescend, ...pairAscend.slice(groupSize)];
  }

  return [...warmup, ...pairTail];
};
