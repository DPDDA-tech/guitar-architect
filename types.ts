import { ChordQuality } from './music/harmony';

export type Note =
  | 'C' | 'C#' | 'D' | 'D#'
  | 'E' | 'F' | 'F#'
  | 'G' | 'G#'
  | 'A' | 'A#'
  | 'B';

export type MarkerShape = 'circle' | 'square' | 'triangle';
export type LabelMode = 'note' | 'interval' | 'fingering' | 'none';
export type EditorMode = 'marker' | 'line' | 'view';
export type HarmonyMode = 'OFF' | 'TRIADS' | 'TETRADS';
export type VoicingMode = 'CLOSE' | 'DROP2' | 'DROP3';
export type CagedShape = 'OFF' | 'C' | 'A' | 'G' | 'E' | 'D';
export type ThemeMode = 'dark' | 'light';
export type LineThickness = 2 | 4 | 7;
export type TuningKey = 'Standard' | 'Drop D' | 'Drop C' | 'Open D' | 'Open G' | 'Custom';
export type StringStatus = 'normal' | 'open' | 'mute';
export type InstrumentType = 'guitar-6' | 'guitar-7' | 'guitar-8' | 'bass-4' | 'bass-5';
export type ColorMode = 'SINGLE' | 'MULTI';

export interface Marker {
  id: string;
  string: number;
  fret: number;
  shape: MarkerShape;
  color: string;
  finger?: string;
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
  instrumentType: InstrumentType;
  tuning: TuningKey;
  customTuning?: string[];
  stringStatuses: StringStatus[];
  labelMode: LabelMode;
  harmonyMode: HarmonyMode;
  voicingMode?: VoicingMode;
  cagedShape?: CagedShape;
  chordQuality: ChordQuality;
  chordDegree: number;
  inversion: number;
  colorMode: ColorMode;
  layers: {
    showInlays: boolean;
    showAllNotes: boolean;
    showScale: boolean;
    showTonic: boolean;
  };
  markers: Marker[];
  lines: Line[];
}

export interface Project {
  id: string;
  name: string;
  user: string;
  lastUpdated: string;
  instances: FretboardState[];
  globalTransposition: number;
}

export interface AppState {
  version: string;
  activeProjectId: string;
  theme: ThemeMode;
  lang: 'pt' | 'en';
  currentUser: string;
  userLogo?: string;
}