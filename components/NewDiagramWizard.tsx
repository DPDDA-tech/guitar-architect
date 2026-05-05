import React, { useState } from 'react';
import { FretboardState, InstrumentType, TuningKey } from '../types';
import { translations, Lang } from '../i18n';
import { INSTRUMENT_PRESETS, TUNINGS_PRESETS } from '../music/musicTheory';
import { SCALES } from '../music/scales';

interface NewDiagramWizardProps {
  onCreate: (state: FretboardState) => void;
  onClose: () => void;
  lang: Lang;
  initialDiagramType?: DiagramType;
}

type DiagramType = 'scale' | 'chord' | 'harmonic-field' | 'free';

const NewDiagramWizard: React.FC<NewDiagramWizardProps> = ({ onCreate, onClose, lang, initialDiagramType }) => {
  const t = translations[lang];
  const [diagramType, setDiagramType] = useState<DiagramType>(initialDiagramType || 'scale');
  const [step, setStep] = useState(initialDiagramType ? 2 : 1);
  const [instrument, setInstrument] = useState<InstrumentType>('guitar-6');
  const [tuning, setTuning] = useState<TuningKey>('Standard');
  const [labelMode, setLabelMode] = useState<'note' | 'fingering' | 'interval' | 'none'>('none');
  const [root, setRoot] = useState('C');
  const [scale, setScale] = useState('Major (Ionian)');
  const [chord, setChord] = useState('Major');
  const onboardingKey = 'ga_onboarding_completed';

  const setOnboardingCompleted = (enabled: boolean) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (enabled) {
        window.localStorage.setItem(onboardingKey, 'true');
      } else {
        window.localStorage.removeItem(onboardingKey);
      }
    }
  };

  const options = [
    {
      id: 'scale',
      label: lang === 'pt' ? 'Escala' : 'Scale',
      title: lang === 'pt' ? 'Escala' : 'Scale',
      description: lang === 'pt' ? 'Monte uma escala no braço' : 'Build a scale on the neck',
      help: lang === 'pt' ? 'Visualize escalas no braço' : 'Visualize scales on the neck'
    },
    {
      id: 'chord',
      label: lang === 'pt' ? 'Acorde' : 'Chord',
      title: lang === 'pt' ? 'Acorde' : 'Chord',
      description: lang === 'pt' ? 'Monte acordes e inversões' : 'Build chords and inversions',
      help: lang === 'pt' ? 'Monte acordes e inversões' : 'Build chords and inversions'
    },
    {
      id: 'harmonic-field',
      label: lang === 'pt' ? 'Campo Harmônico' : 'Harmonic Field',
      title: lang === 'pt' ? 'Campo Harmônico' : 'Harmonic Field',
      description: lang === 'pt' ? 'Explore graus e funções' : 'Explore degrees and functions',
      help: lang === 'pt' ? 'Explore graus e funções' : 'Explore degrees and functions'
    },
    {
      id: 'free',
      label: lang === 'pt' ? 'Diagrama Livre' : 'Free Diagram',
      title: lang === 'pt' ? 'Diagrama Livre' : 'Free Diagram',
      description: lang === 'pt' ? 'Crie manualmente' : 'Create manually',
      help: lang === 'pt' ? 'Crie manualmente' : 'Create manually'
    }
  ];

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
      labelMode: labelMode,
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
    setOnboardingCompleted(true);
    onClose();
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto max-h-[calc(100vh-3rem)] shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-zinc-900">{lang === 'pt' ? 'Novo Diagrama' : 'New Diagram'}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800">×</button>
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-11rem)] pr-1">
          {step === 1 && (
          <div>
            <h3 className="text-lg font-black mb-4 text-zinc-900">{lang === 'pt' ? 'O que você quer criar?' : 'What do you want to create?'}</h3>
            <div className="space-y-3">
              {options.map(option => (
                <button
                  key={option.id}
                  onClick={() => { setDiagramType(option.id as DiagramType); nextStep(); }}
                  className="group w-full rounded-3xl border border-zinc-300 bg-white p-4 text-left text-zinc-900 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-zinc-900"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">{option.label}</span>
                    <h3 className="mt-2 text-lg font-black text-zinc-900">{option.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-700">{option.description}</p>
                  <p className="mt-2 text-[11px] text-zinc-600">{option.help}</p>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => { setDiagramType('free'); createDiagram(); }} className="px-4 py-2 rounded-lg border border-zinc-300 bg-zinc-100 text-zinc-900 text-sm font-black uppercase transition hover:bg-zinc-200 hover:text-zinc-900">
                {lang === 'pt' ? 'Criar Rápido' : 'Quick Create'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-bold mb-3 text-zinc-900">{lang === 'pt' ? 'Instrumento' : 'Instrument'}</h3>
            <select value={instrument} onChange={e => setInstrument(e.target.value as InstrumentType)} className="w-full p-3 border rounded-lg mb-4 text-zinc-900">
              <option value="guitar-6">{t.instr_guitar6}</option>
              <option value="guitar-7">{t.instr_guitar7}</option>
              <option value="guitar-8">{t.instr_guitar8}</option>
              <option value="bass-4">{t.bass4}</option>
              <option value="bass-5">{t.bass5}</option>
            </select>
            <h3 className="text-lg font-bold mb-3 text-zinc-900">{lang === 'pt' ? 'Afinação' : 'Tuning'}</h3>
            <select value={tuning} onChange={e => setTuning(e.target.value as TuningKey)} className="w-full p-3 border rounded-lg mb-4 text-zinc-900">
              {Object.keys(TUNINGS_PRESETS).map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
            <div className="space-y-3 mb-6">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">{lang === 'pt' ? 'Visual' : 'Visual'}</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'note', label: lang === 'pt' ? 'Notas' : 'Notes' },
                  { value: 'fingering', label: lang === 'pt' ? 'Dedos' : 'Fingers' },
                  { value: 'interval', label: lang === 'pt' ? 'Intervalos' : 'Intervals' },
                  { value: 'none', label: lang === 'pt' ? 'Pontos' : 'Dots' }
                ].map(option => (
                  <button key={option.value} type="button" onClick={() => setLabelMode(option.value as any)} className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${labelMode === option.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'}`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={prevStep} className="px-4 py-2 bg-zinc-100 rounded-lg">{lang === 'pt' ? 'Voltar' : 'Back'}</button>
              <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{lang === 'pt' ? 'Próximo' : 'Next'}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-lg font-bold mb-3 text-zinc-900">{lang === 'pt' ? 'Tom' : 'Key'}</h3>
            <select value={root} onChange={e => setRoot(e.target.value)} className="w-full p-3 border rounded-lg mb-4 text-zinc-900">
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {(diagramType === 'scale' || diagramType === 'harmonic-field') && (
              <>
                <h3 className="text-lg font-bold mb-3 text-zinc-900">{lang === 'pt' ? 'Escala' : 'Scale'}</h3>
                <select value={scale} onChange={e => setScale(e.target.value)} className="w-full p-3 border rounded-lg mb-4 text-zinc-900">
                  {SCALES.map(s => <option key={s.name} value={s.name}>{lang === 'pt' ? (t.scales as any)[s.name] || s.name : s.name}</option>)}
                </select>
              </>
            )}
            {diagramType === 'chord' && (
              <>
                <h3 className="text-lg font-bold mb-3 text-zinc-900">{lang === 'pt' ? 'Acorde' : 'Chord'}</h3>
                <select value={chord} onChange={e => setChord(e.target.value)} className="w-full p-3 border rounded-lg mb-4 text-zinc-900">
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
  </div>
  );
};

export default NewDiagramWizard;
