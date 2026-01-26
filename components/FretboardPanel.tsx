
import React, { useState, useEffect, useCallback, useRef } from 'react';
import FretboardInstance from './FretboardInstance';
import { FretboardState, ThemeMode, Project, InstrumentType } from '../types';
import { translations, Lang } from '../i18n';
import { transposeNote, INSTRUMENT_PRESETS } from '../music/musicTheory';
import { 
  saveConfig, 
  loadConfig, 
  getLibrary, 
  saveProjectToLibrary 
} from '../utils/persistence';
import { exportToPNG, exportToPDF } from '../utils/export';

const HERO_IMAGE = "/hero.png"; 

const LogoIcon = () => (
  <img src="/favicon-32x32.png" alt="Guitar Architect" className="w-[32px] h-[32px] lg:w-[42px] lg:h-[42px] object-contain drop-shadow-md" />
);

const GitHubIcon = ({ isLight }: { isLight: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isLight ? 'text-zinc-400 hover:text-zinc-900' : 'text-zinc-500 hover:text-zinc-100'}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const DEFAULT_FRETBOARD = (lang: Lang, instrumentType: InstrumentType = 'guitar-6'): FretboardState => {
  const instr = INSTRUMENT_PRESETS[instrumentType];
  return {
    id: crypto.randomUUID(),
    title: "",
    subtitle: "",
    notes: "",
    startFret: 0,
    endFret: 15,
    isLeftHanded: false,
    root: "C",
    scaleType: "Major (Ionian)",
    instrumentType: instrumentType,
    tuning: "Standard",
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
};

const FretboardPanel: React.FC = () => {
  const [instances, setInstances] = useState<FretboardState[]>([]);
  const [projectName, setProjectName] = useState('Novo Projeto');
  const [projectId, setProjectId] = useState<string>(crypto.randomUUID());
  const [globalTranspose, setGlobalTranspose] = useState(0);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [lang, setLang] = useState<Lang>('pt');
  const [user, setUser] = useState('');
  const [defaultInstrument, setDefaultInstrument] = useState<InstrumentType>('guitar-6');
  
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const initialized = useRef(false);
  const t = translations[lang];

  useEffect(() => {
    if (!initialized.current) {
      const config = loadConfig();
      const library = getLibrary();
      if (config) {
        setTheme(config.theme); setLang(config.lang); setUser(config.currentUser || '');
        const lastProject = library.find(p => p.id === config.activeProjectId);
        if (lastProject) {
          setInstances(lastProject.instances); setProjectName(lastProject.name); setProjectId(lastProject.id); setGlobalTranspose(lastProject.globalTransposition || 0);
          if (lastProject.instances.length > 0) setDefaultInstrument(lastProject.instances[0].instrumentType);
        } else { 
          setInstances([DEFAULT_FRETBOARD(config.lang, defaultInstrument)]); 
        }
      } else { 
        setInstances([DEFAULT_FRETBOARD('pt', 'guitar-6')]); 
        setShowLoginModal(true); 
      }
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (initialized.current && !isExporting && user) {
      setSaveStatus('saving');
      const timer = setTimeout(() => {
        const currentProject: Project = { id: projectId, name: projectName, user: user, lastUpdated: new Date().toISOString(), instances: instances, globalTransposition: globalTranspose };
        saveProjectToLibrary(currentProject);
        saveConfig({ version: "1.7.2", activeProjectId: projectId, theme, lang, currentUser: user });
        setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [instances, projectName, projectId, theme, lang, user, isExporting, globalTranspose]);

  const handleGlobalTranspose = (semitones: number) => {
    const newInstances = instances.map(inst => {
      const newRoot = transposeNote(inst.root, semitones);
      const newMarkers = inst.markers.map(m => ({ ...m, fret: Math.max(0, m.fret + semitones) }));
      return { ...inst, root: newRoot, markers: newMarkers };
    });
    setInstances(newInstances);
    setGlobalTranspose(prev => prev + semitones);
  };

  const updateInstance = (id: string, newState: FretboardState) => {
    setInstances(prev => prev.map(inst => inst.id === id ? newState : inst));
  };

  const addInstance = (cloneData?: FretboardState) => {
    if (instances.length >= 24) {
      alert(t.limitReached);
      return;
    }
    const newItem = cloneData ? { ...JSON.parse(JSON.stringify(cloneData)), id: crypto.randomUUID() } : DEFAULT_FRETBOARD(lang, defaultInstrument);
    setInstances(prev => [...prev, newItem]);
  };

  const clearAll = useCallback(() => {
    const confirmMsg = lang === 'pt' 
      ? "LIMPAR PROJETO INTEIRO?\n\nIsso excluirá todos os diagramas. Você voltará para a tela inicial." 
      : "CLEAR ENTIRE PROJECT?\n\nThis will delete all diagrams. You will return to the home screen.";
    
    if (window.confirm(confirmMsg)) {
       setInstances([]); 
       setProjectName(lang === 'pt' ? "Novo Projeto" : "New Project");
       setProjectId(crypto.randomUUID());
       setGlobalTranspose(0);
       setSaveStatus('saving');
    }
  }, [lang]);

  const handleExportPNG = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 50));
    await exportToPNG(lang, user);
    setIsExporting(false);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 50));
    await exportToPDF(lang, user);
    setIsExporting(false);
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen transition-all ${isExporting ? 'is-exporting-mode' : (isLight ? 'blueprint-grid-light' : 'blueprint-grid-dark')}`}>
      
      {/* HEADER BAR */}
      <div className={`fixed top-0 left-0 w-full z-50 border-b backdrop-blur-2xl py-4 px-10 transition-all ${isLight ? 'bg-white/90 border-zinc-200 shadow-sm' : 'bg-zinc-950/90 border-zinc-800'} ${isExporting ? 'hidden' : ''}`}>
         <div className="max-w-[1700px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
               <LogoIcon />
               <div>
                  <h1 className="text-xl font-black italic text-blue-600 leading-none tracking-tighter uppercase">GUITAR ARCHITECT</h1>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight mt-1">{t.tagline}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <span className={`text-[10px] font-black uppercase ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{user || (lang === 'pt' ? 'Visitante' : 'Guest')}</span>
                     <button onClick={() => setShowLoginModal(true)} className="text-[9px] text-blue-600 font-bold hover:underline uppercase">(Login)</button>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <a href="https://github.com/dpdda-tech/guitar-architect" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-transparent hover:border-zinc-300 transition-all flex items-center justify-center" title="Open Source Code">
                  <GitHubIcon isLight={isLight} />
               </a>
               <div className={`flex items-center rounded-xl p-1 border ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-800 border-zinc-700'}`}>
                  <button onClick={() => setShowLoadModal(true)} className={`px-4 py-2 text-[10px] font-black uppercase ${isLight ? 'text-zinc-900' : 'text-zinc-100'} hover:text-blue-600`}>{t.loadProject}</button>
                  <div className="w-[1px] h-4 bg-zinc-300 mx-1"></div>
                  <button onClick={() => setSaveStatus('saved')} className={`px-4 py-2 text-[10px] font-black uppercase ${isLight ? 'text-zinc-900' : 'text-zinc-100'} hover:text-blue-600`}>{t.saveProject}</button>
               </div>
               <div className="flex gap-2">
                  <button onClick={handleExportPNG} className="bg-emerald-600 px-5 py-2.5 rounded-xl font-black text-[11px] text-white hover:bg-emerald-500 shadow-md uppercase transition-transform active:scale-95">PNG</button>
                  <button onClick={handleExportPDF} className="bg-red-600 px-5 py-2.5 rounded-xl font-black text-[11px] text-white hover:bg-red-500 shadow-md uppercase transition-transform active:scale-95">PDF</button>
               </div>
               <button onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')} className={`px-3 py-2.5 rounded-xl border font-black text-[11px] uppercase ${isLight ? 'border-zinc-300 text-zinc-900' : 'border-zinc-700 text-zinc-100'}`}>{lang === 'pt' ? 'EN' : 'PT'}</button>
               <button onClick={() => setTheme(isLight ? 'dark' : 'light')} className={`p-2.5 rounded-xl border text-sm transition-transform active:rotate-12 ${isLight ? 'border-zinc-300 text-zinc-700' : 'border-zinc-700 text-zinc-100'}`}>{isLight ? '☾' : '☼'}</button>
            </div>
         </div>
      </div>

      {/* SUB-HEADER */}
      <div className={`fixed top-[88px] left-0 w-full z-40 border-b py-3 px-10 ${isLight ? 'bg-zinc-50 border-zinc-200 shadow-sm' : 'bg-zinc-900 border-zinc-800'} ${isExporting ? 'hidden' : ''}`}>
         <div className="max-w-[1700px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t.projectName}:</span>
                  <input value={projectName} onChange={e => setProjectName(e.target.value)} className={`bg-transparent font-bold text-xs focus:outline-none border-b border-transparent focus:border-blue-500 transition-all ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`} />
               </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Transposição Global</span>
                  <div className={`flex rounded-lg border p-0.5 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-800 border-zinc-700'}`}>
                     <button onClick={() => handleGlobalTranspose(1)} className="w-8 h-8 flex items-center justify-center font-black text-blue-600 hover:bg-blue-50 rounded-md transition-colors">+</button>
                     <div className={`w-10 h-8 flex items-center justify-center font-black text-xs ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{globalTranspose > 0 ? `+${globalTranspose}` : globalTranspose}</div>
                     <button onClick={() => handleGlobalTranspose(-1)} className="w-8 h-8 flex items-center justify-center font-black text-blue-600 hover:bg-blue-50 rounded-md transition-colors">-</button>
                  </div>
                  {globalTranspose !== 0 && (
                    <button onClick={() => handleGlobalTranspose(-globalTranspose)} className="text-[9px] font-black text-red-500 hover:underline uppercase ml-1 transition-colors">{t.reset}</button>
                  )}
               </div>
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{saveStatus === 'saving' ? 'Saving...' : 'Synced'}</span>
               </div>
               <button onClick={clearAll} className="text-[9px] font-black text-red-500 hover:underline uppercase transition-colors">{t.clearAll}</button>
            </div>
         </div>
      </div>

      <div className={`max-w-[1700px] mx-auto px-10 pb-20 space-y-12 ${isExporting ? 'pt-10' : 'pt-48'}`}>
        {instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-1000">
             <div className="relative mb-12">
                <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full scale-150"></div>
                <img src={HERO_IMAGE} alt="Hero" className="relative w-full max-w-lg rounded-[40px] shadow-2xl border border-white/10" />
             </div>
             <h2 className={`text-2xl font-black italic uppercase mb-8 tracking-tighter ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>Arquitetura de Braço Ativada</h2>
             <button onClick={() => addInstance()} className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs shadow-2xl hover:scale-110 active:scale-95 transition-all">Criar Primeiro Diagrama</button>
          </div>
        ) : (
          instances.map((inst, idx) => (
            <FretboardInstance key={inst.id} state={inst} updateState={(s) => updateInstance(inst.id, s)} onRemove={() => setInstances(prev => prev.filter(i => i.id !== inst.id))} onMove={(dir) => { const newList = [...instances]; const tIdx = dir === 'up' ? idx - 1 : idx + 1; if (tIdx >= 0 && tIdx < newList.length) { [newList[idx], newList[tIdx]] = [newList[tIdx], newList[idx]]; setInstances(newList); } }} onAdd={addInstance} isFirst={idx === 0} isLast={idx === instances.length - 1} theme={theme} lang={lang} isActive={false} onActivate={() => {}} isExporting={isExporting} />
          ))
        )}
      </div>

      {/* FOOTER */}
      <footer className={`py-16 border-t transition-all ${isExporting ? 'hidden' : ''} ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-900'}`}>
         <div className="max-w-[1700px] mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
               <LogoIcon />
               <div className="text-left">
                  <p className={`font-black text-sm tracking-[0.3em] uppercase ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>Guitar Architect</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Engine v1.7.2 • Open Source Project</p>
               </div>
            </div>
            <div className="flex gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
               <a href="/privacy.html" target="_blank" className="hover:text-blue-500 transition-colors uppercase">Privacidade</a>
               <span className="opacity-20 text-zinc-300">•</span>
               <a href="/LICENSE" target="_blank" className="hover:text-blue-500 transition-colors uppercase">Licença MIT</a>
               <span className="opacity-20 text-zinc-300">|</span>
               <a href="https://github.com/dpdda-tech/guitar-architect" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors uppercase flex items-center gap-2">
                  <GitHubIcon isLight={isLight} /> GitHub
               </a>
            </div>
            <p className={`text-[11px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
               © 2026 {t.allRights}
            </p>
         </div>
      </footer>

      {showLoginModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/70 backdrop-blur-xl">
          <div className={`w-full max-w-md rounded-[40px] p-12 border shadow-2xl transition-all ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
             <div className="flex flex-col items-center mb-10">
                <LogoIcon />
                <h2 className={`text-2xl font-black italic uppercase tracking-tighter mt-4 ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{t.login}</h2>
                <div className="w-12 h-1 bg-blue-600 rounded-full mt-2"></div>
             </div>
             
             <div className={`p-6 rounded-2xl mb-8 border ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/20 border-blue-900/30'}`}>
                <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-2">⚠️ Atenção ao Armazenamento</h4>
                <p className={`text-[11px] leading-relaxed font-medium ${isLight ? 'text-blue-800' : 'text-blue-300'}`}>Seus projetos são salvos apenas **localmente** neste navegador. Limpar dados do site apagará seu progresso.</p>
             </div>

             <input autoFocus placeholder={lang === 'pt' ? "Digite seu nome..." : "Enter your name..."} value={user} onChange={e => setUser(e.target.value)} onKeyDown={e => e.key === 'Enter' && user.trim() && setShowLoginModal(false)} className={`w-full p-5 rounded-2xl mb-8 font-bold outline-none border transition-all text-center text-lg ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-900 focus:border-blue-500' : 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-blue-500'}`} />
             
             <button onClick={() => user.trim() && setShowLoginModal(false)} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-200 hover:bg-blue-500 transition-all transform active:scale-95">{t.gotIt}</button>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
          <div className={`w-full max-w-xl rounded-[32px] p-10 border shadow-3xl ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black italic text-blue-500 uppercase tracking-tighter">Projetos Salvos</h2>
              <button onClick={() => setShowLoadModal(false)} className="text-zinc-500 font-black text-xs uppercase tracking-widest hover:text-red-500">Fechar</button>
            </div>
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300">
              {getLibrary().filter(p => p.user === user || !p.user).map(p => (
                <div key={p.id} onClick={() => { setProjectId(p.id); setProjectName(p.name); setInstances(p.instances); setGlobalTranspose(p.globalTransposition || 0); setShowLoadModal(false); }} className={`flex items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer group ${isLight ? 'bg-zinc-50 border-zinc-100 hover:border-blue-500 hover:bg-white' : 'bg-zinc-800 border-zinc-700 hover:border-blue-500 hover:bg-zinc-750'}`}>
                  <div className="font-black text-zinc-800 group-hover:text-blue-500 uppercase text-sm transition-colors">{p.name}</div>
                  <div className="text-[10px] font-bold text-zinc-400">{new Date(p.lastUpdated).toLocaleDateString()}</div>
                </div>
              ))}
              {getLibrary().length === 0 && <p className="text-center py-16 font-black text-zinc-400 uppercase text-[10px] tracking-widest">Nenhum projeto encontrado</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FretboardPanel;