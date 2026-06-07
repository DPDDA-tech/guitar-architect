import type { ActiveEngine, LabelMode } from '../types';

type BaseIntent = {
  version: string;
  createdAt: number;
  source: string;
};

export type ScaleIntent = BaseIntent & {
  action: 'scale' | 'field' | 'triads';
  root: string;
  scaleType: string;
};

export type ChordIntent = BaseIntent & {
  action: 'progression';
  chord: string;
};

export type PracticeIntent = BaseIntent & {
  action: 'startPractice' | 'openTool';
};

export type FretboardIntent = ScaleIntent | ChordIntent | PracticeIntent;

export type FretboardMarker = Readonly<{
  string: number;
  fret: number;
  shape?: 'circle' | 'square' | 'triangle';
  color?: string;
  label?: string;
}>;

export type FretboardRenderState = Readonly<{
  notesToRender: ReadonlyArray<Readonly<{
    string: number;
    fret: number;
    label?: string;
    color?: string;
    type?: 'note' | 'tonic' | 'ghost';
  }>>;
  markers: ReadonlyArray<FretboardMarker>;
  openStrings: ReadonlyArray<number>;
  mutedStrings: ReadonlyArray<number>;
  labels: 'notes' | 'intervals' | 'fingers' | 'dots';
  activeEngine: ActiveEngine;
  isLeftHanded: boolean;
  regionOffset?: number;
}>;

export type FretboardEngineContext = Readonly<{
  root: string;
  scaleType?: string;
  chord?: string;
  tuning: string[];
  stringsCount: number;
  fretCount: number;
  isLeftHanded: boolean;
  openStrings: ReadonlyArray<number>;
  mutedStrings: ReadonlyArray<number>;
  labelMode: LabelMode;
}>;

export interface FretboardDataProvider {
  provide(context: FretboardEngineContext): FretboardRenderState;
}