import React, { useEffect, useState } from 'react';
import { INSTRUMENT_PRESETS } from '../music/musicTheory';
import type { FretboardState, InstrumentType, StringStatus } from '../types';
import PracticeTools from './PracticeTools';

type QuickTool = 'tuner' | 'metronome';

interface QuickToolsModalProps {
  isOpen: boolean;
  initialTool: QuickTool;
  isLight: boolean;
  lang: 'pt' | 'en';
  onClose: () => void;
}

const DEFAULT_INSTRUMENT: InstrumentType = 'guitar-6';

const createDefaultState = (): FretboardState => ({
  id: 'quick-tools-preview',
  title: 'Quick Tools',
  subtitle: '',
  notes: '',
  startFret: 0,
  endFret: 12,
  isLeftHanded: false,
  root: 'C',
  scaleType: 'Major (Ionian)',
  instrumentType: DEFAULT_INSTRUMENT,
  tuning: 'Standard',
  stringStatuses: Array(INSTRUMENT_PRESETS[DEFAULT_INSTRUMENT].strings).fill('normal') as StringStatus[],
  labelMode: 'note',
  harmonyMode: 'OFF',
  voicingMode: 'CLOSE',
  cagedShape: 'OFF',
  chordQuality: 'DIATONIC',
  chordDegree: 0,
  inversion: 0,
  colorMode: 'SINGLE',
  layers: {
    showInlays: true,
    showAllNotes: false,
    showScale: false,
    showTonic: false,
  },
  markers: [],
  lines: [],
});

const QuickToolsModal: React.FC<QuickToolsModalProps> = ({ isOpen, initialTool, isLight, lang, onClose }) => {
  const [toolState, setToolState] = useState<FretboardState>(() => createDefaultState());

  useEffect(() => {
    if (isOpen) setToolState(createDefaultState());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tuning = toolState.customTuning?.length
    ? toolState.customTuning
    : INSTRUMENT_PRESETS[toolState.instrumentType].defaultTuning;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={lang === 'pt' ? 'Fechar ferramentas' : 'Close tools'}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <section className={`relative max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-2xl border p-4 shadow-2xl ${isLight ? 'border-[#cbd7e6] bg-[#f6f9fd]' : 'border-blue-900/60 bg-[#050914]'}`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-300">
              {lang === 'pt' ? 'Ferramentas rapidas' : 'Quick tools'}
            </p>
            <h2 className={`mt-1 text-xl font-black uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {initialTool === 'metronome'
                ? lang === 'pt' ? 'Metronomo' : 'Metronome'
                : lang === 'pt' ? 'Afinador' : 'Tuner'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase transition ${isLight ? 'border-slate-300 bg-white text-slate-700 hover:border-blue-300' : 'border-blue-900/70 bg-[#0b1220] text-slate-100 hover:border-blue-500'}`}
          >
            {lang === 'pt' ? 'Fechar' : 'Close'}
          </button>
        </div>
        <PracticeTools
          instrumentType={toolState.instrumentType}
          tuning={tuning}
          isLight={isLight}
          lang={lang}
          state={toolState}
          onApplyExample={setToolState}
          onHighlightPosition={() => undefined}
          initialTool={initialTool}
          toolScope="quick"
        />
      </section>
    </div>
  );
};

export default QuickToolsModal;
