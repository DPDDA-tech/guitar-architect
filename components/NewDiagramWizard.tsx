import React, { useState } from 'react';
import { FretboardState, InstrumentType, TuningKey } from '../types';
import { translations, Lang } from '../i18n';
import { INSTRUMENT_PRESETS } from '../music/musicTheory';
import { SCALES } from '../music/scales';

interface NewDiagramWizardProps {
  onCreate: (state: FretboardState) => void;
  onClose: () => void;
  lang: Lang;
}

type DiagramType = 'scale' | 'chord' | 'harmonic-field' | 'free';

const NewDiagramWizard: React.FC<NewDiagramWizardProps> = ({ onCreate, onClose, lang }) => {
  const t = translations[lang];
  const [step, setStep] = useState(1);
  const [diagramType, setDiagramType] = useState<DiagramType>('scale');
  const [instrument, setInstrument] = useState<InstrumentType>('guitar-6');
  const [tuning, setTuning] = useState<TuningKey>('Standard');
  const [root, setRoot] = useState('C');
  const [scale, setScale] = useState('Major (Ionian)');
  const [chord, setChord] = useState('Major');

  const createDiagram = () => {
    const instr = INSTRUMENT_PRESETS[instrument];
    const newState: FretboardState = {
      id: crypto.randomUUID(),
      title: "",
      subtitle: "",
      notes: "",
      startFret: 0,
      endFret: 15,
      isLeftHanded: false,
      root,
      scaleType: scale,
      instrumentType: instrument,
      tuning,
      stringStatuses: Array(instr.strings).fill('normal'),
      labelMode: "none",
      harmonyMode: "OFF",
      chordQuality: "DIATONIC",
      chordDegree: 0,
      inversion: 0,
      colorMode: "SINGLE",
      layers: {
        showInlays: true,
        showAllNotes: false,
        showScale: false,
        showTonic: false
      },
      markers: [],
      lines: []
    };

    // Ajustes baseados no tipo
    if (diagramType === 'scale') {
      newState.layers.showScale = true;
    } else if (diagramType === 'chord') {
      newState.harmonyMode = 'TRIADS';
      newState.chordQuality = chord as any;
    } else if (diagramType === 'harmonic-field') {
      newState.harmonyMode = 'TRIADS';
      newState.layers.showScale = true;
    }

    onCreate(newState);
    onClose();
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black">{lang === 'pt' ? 'Novo Diagrama' : 'New Diagram'}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">×</button>
        </div>

        {step === 1 && (
          <div>
            <h3 className="text-lg font-bold mb-4">{lang === 'pt' ? 'O que você quer criar?' : 'What do you want to create?'}</h3>
            <div className="space-y-3">
              {[
                { id: 'scale', label: lang === 'pt' ? 'Escala' : 'Scale' },
                { id: 'chord', label: lang === 'pt' ? 'Acorde' : 'Chord' },
                { id: 'harmonic-field', label: lang === 'pt' ? 'Campo Harmônico' : 'Harmonic Field' },
                { id: 'free', label: lang === 'pt' ? 'Diagrama Livre' : 'Free Diagram' }
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => { setDiagramType(option.id as DiagramType); nextStep(); }}
                  className="w-full p-4 rounded-xl border text-left hover:bg-zinc-50 transition-all"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => { setDiagramType('free'); createDiagram(); }} className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm">
                {lang === 'pt' ? 'Criar Rápido' : 'Quick Create'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-bold mb-4">{lang === 'pt' ? 'Instrumento' : 'Instrument'}</h3>
            <select value={instrument} onChange={e => setInstrument(e.target.value as InstrumentType)} className="w-full p-3 border rounded-lg mb-4">
              <option value="guitar-6">{t.instr_guitar6}</option>
              <option value="guitar-7">{t.instr_guitar7}</option>
              <option value="guitar-8">{t.instr_guitar8}</option>
              <option value="bass-4">{t.bass4}</option>
              <option value="bass-5">{t.bass5}</option>
            </select>
            <h3 className="text-lg font-bold mb-4">{lang === 'pt' ? 'Afinação' : 'Tuning'}</h3>
            <select value={tuning} onChange={e => setTuning(e.target.value as TuningKey)} className="w-full p-3 border rounded-lg mb-6">
              <option value="Standard">Standard</option>
              <option value="Drop D">Drop D</option>
              {/* Adicionar mais se necessário */}
            </select>
            <div className="flex justify-between">
              <button onClick={prevStep} className="px-4 py-2 bg-zinc-100 rounded-lg">{lang === 'pt' ? 'Voltar' : 'Back'}</button>
              <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{lang === 'pt' ? 'Próximo' : 'Next'}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-lg font-bold mb-4">{lang === 'pt' ? 'Tom' : 'Key'}</h3>
            <select value={root} onChange={e => setRoot(e.target.value)} className="w-full p-3 border rounded-lg mb-4">
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {(diagramType === 'scale' || diagramType === 'harmonic-field') && (
              <>
                <h3 className="text-lg font-bold mb-4">{lang === 'pt' ? 'Escala' : 'Scale'}</h3>
                <select value={scale} onChange={e => setScale(e.target.value)} className="w-full p-3 border rounded-lg mb-4">
                  {SCALES.map(s => <option key={s.name} value={s.name}>{lang === 'pt' ? (t.scales as any)[s.name] || s.name : s.name}</option>)}
                </select>
              </>
            )}
            {diagramType === 'chord' && (
              <>
                <h3 className="text-lg font-bold mb-4">{lang === 'pt' ? 'Acorde' : 'Chord'}</h3>
                <select value={chord} onChange={e => setChord(e.target.value)} className="w-full p-3 border rounded-lg mb-4">
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                  {/* Adicionar mais */}
                </select>
              </>
            )}
            <div className="flex justify-between">
              <button onClick={prevStep} className="px-4 py-2 bg-zinc-100 rounded-lg">{lang === 'pt' ? 'Voltar' : 'Back'}</button>
              <button onClick={createDiagram} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{lang === 'pt' ? 'Criar' : 'Create'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewDiagramWizard;