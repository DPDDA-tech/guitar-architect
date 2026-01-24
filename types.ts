
import { ChordQuality } from './music/harmony';

export type MarkerShape = 'circle' | 'square' | 'triangle';
export type LabelMode = 'note' | 'interval' | 'fingering' | 'none';
export type EditorMode = 'marker' | 'line' | 'view';
export type HarmonyMode = 'OFF' | 'TRIADS' | 'TETRADS';
export type ThemeMode = 'dark' | 'light';
export type LineThickness = 2 | 4 | 7;
export type TuningKey = 'Standard' | 'Drop D' | 'Drop C' | 'Open D' | 'Open G' | 'Custom';
export type StringStatus = 'normal' | 'open' | 'mute';

export interface Marker {
  id: string;
  string: number;
  fret: number;
  shape: MarkerShape;
  color: string;
  finger?: string; // T, 1, 2, 3, 4
}

export interface Line {
  id: string;
  start: { string: number; fret: number };
  end: { string: number; fret: number };
  color: string;
  width: number;
}

export interface FretboardState {
  id: string;
  title: string;
  subtitle: string;
  notes: string;
  startFret: number;
  endFret: number;
  isLeftHanded: boolean;
  root: string;
  scaleType: string;
  tuning: TuningKey;
  customTuning?: string[];
  stringStatuses: StringStatus[];
  labelMode: LabelMode;
  harmonyMode: HarmonyMode;
  chordQuality: ChordQuality; // Agora parte do estado global da instância
  chordDegree: number;
  inversion: number;
  layers: {
    showInlays: boolean;
    showAllNotes: boolean;
    showScale: boolean;
    showTonic: boolean;
  };
  markers: Marker[];
  lines: Line[];
}

export interface AppState {
  version: string;
  instances: FretboardState[];
  activeId: string;
  theme: ThemeMode;
  lang: 'pt' | 'en';
  currentUser?: string;
  projectName?: string;
}

export interface HistoryState {
  past: FretboardState[][];
  present: FretboardState[];
  future: FretboardState[][];
}
