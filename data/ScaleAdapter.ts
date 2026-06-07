import { 
  FretboardDataProvider, 
  FretboardEngineContext, 
  FretboardRenderState 
} from './fretboardContract';
import { getScaleNotes } from '../music/scales'; 
import { LabelMode } from '../types';

const CHROMATIC_NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

const labelsMap: Record<LabelMode, FretboardRenderState['labels']> = {
  note: 'notes',
  interval: 'intervals',
  fingering: 'fingers',
  none: 'dots',
};

/**
 * S-FRETBOARD-CONTRACT — ScaleAdapter
 * 
 * Converte dados musicais da scaleEngine em um estado de renderização puro.
 */
export class ScaleAdapter implements FretboardDataProvider {
  provide(context: FretboardEngineContext): FretboardRenderState {
    const { root, scaleType, labelMode, tuning, fretCount, openStrings, mutedStrings } = context;

    // 1. Obtém as notas e intervalos da escala (Lógica Musical)
    const scaleNotes = getScaleNotes(root, scaleType || 'Major (Ionian)');
    const INTERVALS = ['1','2','3','4','5','6','7'];
    const scaleIntervals = scaleNotes.map((_, index) => INTERVALS[index] ?? String(index + 1)); // ex: ['1', '2', '3'...]

    // Fix: Tipagem correta conforme o contrato
    const notesToRender: Array<{
      string: number;
      fret: number;
      label?: string;
      color?: string;
      type?: 'note' | 'tonic' | 'ghost';
    }> = [];

    // 2. Mapeia as notas para coordenadas do braço (Lógica de Renderização)
    tuning.forEach((openNote: string, stringIndex: number) => {
      for (let fret = 0; fret <= fretCount; fret++) {
        const currentNote = this.calculateNoteAt(openNote, fret);
        const noteIdx = scaleNotes.indexOf(currentNote);

        if (noteIdx !== -1) {
          notesToRender.push({
            string: stringIndex,
            fret,
            label: labelMode === 'interval' ? scaleIntervals[noteIdx] : currentNote,
            type: scaleIntervals[noteIdx] === '1' ? 'tonic' : 'note',
            color: scaleIntervals[noteIdx] === '1' ? 'var(--ga-tonic)' : 'var(--ga-note)'
          });
        }
      }
    });

    return {
      notesToRender,
      markers: [], // Escalas puras não costumam ter markers manuais
      openStrings,
      mutedStrings,
      labels: labelsMap[labelMode as LabelMode] ?? 'dots',
      activeEngine: 'scale',
      isLeftHanded: context.isLeftHanded
    };
  }

  private calculateNoteAt(openNote: string, fret: number): string {
    const normalized = this.normalizeNote(openNote);
    const startIndex = CHROMATIC_NOTES.indexOf(normalized);
    if (startIndex === -1) {
      if (import.meta.env.DEV) {
        console.warn(`[ScaleAdapter] Nota não reconhecida no tuning: "${openNote}"`);
      }
      return openNote;
    }
    return CHROMATIC_NOTES[(startIndex + fret) % 12];
  }

  private normalizeNote(note: string): string {
    const flatToSharp: Record<string, string> = {
      'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
    };
    return flatToSharp[note] || note;
  }
}

export const scaleAdapter = new ScaleAdapter();
