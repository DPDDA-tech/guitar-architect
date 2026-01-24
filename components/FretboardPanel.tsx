import React, { useState, useEffect, useCallback, useRef } from 'react';
import FretboardInstance from './FretboardInstance';
import { FretboardState, ThemeMode, Project } from '../types';
import { translations, Lang } from '../i18n';
import { 
  saveConfig, 
  loadConfig, 
  getLibrary, 
  saveProjectToLibrary, 
  deleteProject 
} from '../utils/persistence';
import { exportToPNG, exportToPDF } from '../utils/export';

const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg lg:w-[42px] lg:h-[42px]">
    <rect width="100" height="100" rx="20" fill="#2563eb"/>
    <path d="M25 30H75M25 50H75M25 70H75" stroke="white" strokeWidth="6" strokeLinecap="round"/>
    <path d="M40 20V80M60 20V80" stroke="white" strokeWidth="3" strokeOpacity="0.4"/>
    <circle cx="60" cy="50" r="8" fill="#ef4444" stroke="white" strokeWidth="3"/>
  </svg>
);

const DEFAULT_FRETBOARD = (lang: Lang): FretboardState => ({
  id: crypto.randomUUID(),
  title: translations[lang].titlePlaceholder,
  subtitle: translations[lang].subtitle,
  notes: "",
  startFret: 0,
  endFret: 15,
  isLeftHanded: false,
  root: "C",
  scaleType: "Major (Ionian)",
  tuning: "Standard",
  stringStatuses: ['normal', 'normal', 'normal', 'normal', 'normal', 'normal'],
  labelMode: "none", 
  harmonyMode: "OFF",
  chordQuality: "DIATONIC",
  chordDegree: 0,
  inversion: 0,
  layers: {
    showInlays: true,
    showAllNotes: false,
    showScale: false,
    showTonic: false
  },
  markers: [],
  lines: []
});

const FretboardPanel: React.FC = () => {
  const [instances, setInstances] = useState<FretboardState[]>([]);
  const [projectName, setProjectName] = useState('Novo Projeto');
  // Tipagem explícita como string para evitar o erro de SetStateAction do UUID
  const [projectId, setProjectId] = useState<string>(crypto.randomUUID());
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [lang, setLang] = useState<Lang>('pt');
  const [user, setUser] = useState<string>('');
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showStorageInfo, setShowStorageInfo] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const initialized = useRef(false);

  const t = translations[lang];

  useEffect(() => {
    if (!initialized.current) {
      const config = loadConfig();
      const library = getLibrary();
      
      if (config) {
        setTheme(config.theme);
        setLang(config.lang);
        setUser(config.currentUser || '');
        
        const lastProject = library.find(p => p.id === config.activeProjectId);
        if (lastProject) {
          setInstances(lastProject.instances);
          setProjectName(lastProject.name);
          setProjectId(lastProject.id);
        } else {
          setInstances([DEFAULT_FRETBOARD(config.lang)]);
        }
      } else {
        setInstances([DEFAULT_FRETBOARD('pt')]);
        setShowLoginModal(true);
      }
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (initialized.current && !isExporting && user) {
      setSaveStatus('saving');
      const timer = setTimeout(() => {
        const currentProject: Project = {
          id: projectId,
          name: projectName,
          user: user,
          lastUpdated: new Date().toISOString(),
          instances: instances
        };
        saveProjectToLibrary(currentProject);
        saveConfig({
          version: "1.7",
          activeProjectId: projectId,
          theme,
          lang,
          currentUser: user
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [instances, projectName, projectId, theme, lang, user, isExporting]);

  const handleManualSave = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const currentProject: Project = {
      id: projectId,
      name: projectName,
      user: user,
      lastUpdated: new Date().toISOString(),
      instances: instances
    };
    saveProjectToLibrary(currentProject);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const createNewProject = () => {
    if (confirm(t.clearAll + "?")) {
      setProjectId(crypto.randomUUID());
      setProjectName('Novo Projeto');
      setInstances([DEFAULT_FRETBOARD(lang)]);
    }
  };

  const loadProject = (p: Project) => {
    setProjectId(p.id);
    setProjectName(p.name);
    setInstances(p.instances);
    setUser(p.user);
    setShowLoadModal(false);
  };

  const updateInstance = (id: string, newState: FretboardState) => {
    setInstances(prev => prev.map(inst => inst.id === id ? newState : inst));
  };

  const addInstance = (clone: boolean = false) => {
    if (instances.length >= 12) {
      alert(t.limitReached);
      return;
    }
    const newItem = clone ? { ...JSON.parse(JSON.stringify(instances[instances.length-1])), id: crypto.randomUUID() } : DEFAULT_FRETBOARD(lang);
    setInstances(prev => [...prev, newItem]);
  };

  const handleExport = async (type: 'png' | 'pdf') => {
    setIsExporting(true);
    setTimeout(async () => {
      try {
        if (type === 'png') await exportToPNG(lang);
        else await exportToPDF(lang);
      } finally {
        setIsExporting(false);
      }
    }, 200);
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen transition-all duration-700 ${isExporting ? 'is-exporting-mode' : (isLight ? 'blueprint-grid-light' : 'blueprint-grid-dark')}`}>
      
      {/* HEADER SUPERIOR */}
      <div className={`fixed top-0 left-0 w-full z-50 border-b backdrop-blur-2xl transition-all duration-500 ${isLight ? 'bg-white/95 border-zinc-200 shadow-sm' : 'bg-zinc-950/95 border-zinc-800'} ${isExporting ? 'hidden' : ''}`}>
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between p-3 md:p-4 px-4 md:px-10 gap-4">
          <div className="flex items-center gap-4">
             <LogoIcon />
             <div className="flex flex-col">
               <h1 className="text-xl font-black italic text-blue-600 leading-none tracking-tighter">GUITAR ARCHITECT</h1>
               <p className={`text-[9px] font-bold uppercase tracking-tight mt-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                 {t.tagline}
               </p>
               <div className="flex items-center gap-2 mt-1">
                 <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                   {user || 'Visitante'}
                 </span>
                 <button onClick={() => setShowLoginModal(true)} className="text-[9px] text-blue-600 font-bold hover:underline uppercase tracking-tight">
                   ({t.login})
                 </button>
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            {/* Pill Container de Ações */}
            <div className={`flex items-center rounded-xl p-1 border shadow-inner ${isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-800 border-zinc-700'}`}>
              <button 
                onClick={() => setShowLoadModal(true)} 
                className={`px-4 py-2 text-[10px] font-black transition-colors uppercase tracking-widest ${isLight ? 'text-zinc-900 hover:text-blue-600' : 'text-zinc-300 hover:text-blue-400'}`}
              >
                {t.loadProject}
              </button>
              <div className={`w-[1px] h-4 mx-1 ${isLight ? 'bg-zinc-400 opacity-50' : 'bg-zinc-600 opacity-50'}`}></div>
              <button 
                onClick={handleManualSave} 
                className={`px-4 py-2 text-[10px] font-black transition-colors uppercase tracking-widest ${isLight ? 'text-zinc-900 hover:text-blue-600' : 'text-zinc-300 hover:text-blue-400'}`}
              >
                {saveStatus === 'saved' ? '✓ SALVO' : t.saveProject}
              </button>
            </div>
            
            {/* Export buttons */}
            <div className="flex gap-2">
              <button onClick={() => handleExport('png')} className="bg-emerald-600 px-5 py-2.5 rounded-xl font-black text-[11px] text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all uppercase">PNG</button>
              <button onClick={() => handleExport('pdf')} className="bg-red-600 px-5 py-2.5 rounded-xl font-black text-[11px] text-white hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all uppercase">PDF</button>
            </div>
            
            {/* Language & Theme Toggle */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
                className={`px-3 py-2.5 rounded-xl border font-black text-[11px] transition-all uppercase tracking-tighter ${isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-900 hover:bg-zinc-200' : 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700'}`}
              >
                {lang === 'pt' ? 'EN' : 'PT'}
              </button>
              <button 
                onClick={() => setTheme(isLight ? 'dark' : 'light')} 
                className={`p-2.5 rounded-xl border transition-all text-sm ${isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-900 hover:bg-zinc-200' : 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700'}`}
              >
                {isLight ? '☾' : '☼'}
              </button>
            </div>
          </div>
        </div>
        
        {/* BARRA DE NOME DO PROJETO E STATUS */}
        <div className={`border-t py-2 px-4 md:px-10 transition-colors ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
           <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3">
             <div className="flex items-center gap-3 flex-1">
               <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">{t.projectName}:</span>
               <input 
                 value={projectName} 
                 onChange={e => setProjectName(e.target.value)}
                 className={`bg-transparent text-xs font-bold focus:outline-none focus:text-blue-500 transition-all flex-1 md:flex-none md:min-w-[300px] ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}
               />
             </div>
             
             <div className="flex items-center gap-3">
               <div className={`group flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-tighter transition-all cursor-help ${saveStatus === 'saving' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-transparent border-transparent text-zinc-500'}`}>
                 <div className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-500'}`}></div>
                 {saveStatus === 'saving' ? 'Salvando...' : 'Sincronizado'}
                 <button onClick={(e) => {e.stopPropagation(); setShowStorageInfo(true)}} className="ml-1 opacity-40 hover:opacity-100 transition-opacity">ⓘ</button>
               </div>
               <button onClick={createNewProject} className="text-[9px] font-black text-red-500 hover:underline uppercase tracking-widest">{t.clearAll}</button>
             </div>
           </div>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className={`max-w-[1700px] mx-auto px-4 md:px-10 pb-20 space-y-12 ${isExporting ? 'pt-10' : 'pt-44 md:pt-40'}`}>
        {instances.length === 0 ? (
          <div className="text-center py-40">
            <button onClick={() => addInstance()} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-2xl">Começar Primeiro Diagrama</button>
          </div>
        ) : (
          instances.map((inst, idx) => (
            <FretboardInstance 
              key={inst.id} 
              state={inst} 
              updateState={(s) => updateInstance(inst.id, s)} 
              onRemove={() => setInstances(prev => prev.filter(i => i.id !== inst.id))} 
              onMove={(dir) => {
                const newList = [...instances];
                const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
                if (targetIdx >= 0 && targetIdx < newList.length) {
                  [newList[idx], newList[targetIdx]] = [newList[targetIdx], newList[idx]];
                  setInstances(newList);
                }
              }} 
              onAdd={addInstance} 
              isFirst={idx === 0} 
              isLast={idx === instances.length - 1} 
              theme={theme} 
              lang={lang} 
              isActive={false} 
              onActivate={() => {}}
              isExporting={isExporting}
            />
          ))
        )}
      </div>

      {/* MODAL DE INFORMAÇÃO DE ARMAZENAMENTO */}
      {showStorageInfo && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className={`w-full max-w-lg rounded-3xl p-8 border shadow-2xl ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-2xl">🔒</div>
                <h2 className="text-xl font-black italic text-blue-500 uppercase tracking-tighter">{t.storageTitle}</h2>
             </div>
             <div className="space-y-6">
                <div className="space-y-2">
                   <h3 className="text-xs font-black uppercase text-zinc-500">{t.storageLocal}</h3>
                   <p className="text-sm font-medium opacity-80">{t.storageLocalDesc}</p>
                </div>
                <div className="space-y-2 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                   <h3 className="text-xs font-black uppercase text-red-500">{t.storageWarning}</h3>
                   <p className="text-sm font-medium text-red-500/80">{t.storageWarningDesc}</p>
                </div>
                <div className="space-y-2">
                   <h3 className="text-xs font-black uppercase text-zinc-500">{t.storageCost}</h3>
                   <p className="text-sm font-medium opacity-80">{t.storageCostDesc}</p>
                </div>
             </div>
             <button 
               onClick={() => setShowStorageInfo(false)} 
               className="w-full mt-8 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase text-xs hover:bg-zinc-700 transition-all"
             >
               {t.gotIt}
             </button>
          </div>
        </div>
      )}

      {/* MODAL DE LOGIN / PERFIL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
          <div className={`w-full max-w-md rounded-3xl p-8 border shadow-2xl ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
             <h2 className="text-2xl font-black italic text-blue-500 uppercase tracking-tighter mb-2">{t.login}</h2>
             <p className="text-xs font-bold text-zinc-500 mb-6 uppercase tracking-tight">Identifique-se para organizar seus projetos localmente.</p>
             <input 
               autoFocus
               placeholder="Seu nome ou apelido..."
               value={user}
               onChange={e => setUser(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && user.trim() && setShowLoginModal(false)}
               className={`w-full p-4 rounded-2xl mb-4 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none border transition-all ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-900' : 'bg-zinc-800 border-zinc-700 text-zinc-100'}`}
             />
             
             <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 mb-6">
                <span className="text-xs mt-0.5">ℹ️</span>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight leading-relaxed">
                  {t.storageLocalDesc} {t.storageWarningDesc}
                </p>
             </div>

             <button 
               onClick={() => user.trim() && setShowLoginModal(false)} 
               disabled={!user.trim()}
               className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-30"
             >
               Confirmar e Entrar
             </button>
          </div>
        </div>
      )}

      {/* MODAL DE CARREGAMENTO (BIBLIOTECA) */}
      {showLoadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-xl rounded-3xl p-8 border ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic text-blue-500 uppercase tracking-tighter">{t.loadProject}</h2>
              <button onClick={() => setShowLoadModal(false)} className="text-zinc-500 hover:text-red-500 font-black text-xs uppercase tracking-widest">FECHAR</button>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {getLibrary().filter(p => p.user === user || !p.user).length === 0 ? (
                <div className="text-center py-20 opacity-40 text-sm font-bold uppercase tracking-widest">Nenhum projeto salvo para "{user}"</div>
              ) : (
                getLibrary().filter(p => p.user === user || !p.user).map(p => (
                  <div key={p.id} className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${isLight ? 'bg-zinc-50 hover:border-blue-500' : 'bg-zinc-800 border-zinc-700 hover:border-blue-500'}`}>
                    <div onClick={() => loadProject(p)} className="flex-1 cursor-pointer">
                      <div className="font-black text-blue-500 uppercase text-xs mb-1 tracking-tight">{p.name}</div>
                      <div className="text-[10px] opacity-50 font-bold uppercase tracking-tighter">{new Date(p.lastUpdated).toLocaleString()} • {p.instances.length} Diagramas</div>
                    </div>
                    <button onClick={() => {
                      if (confirm("Excluir projeto permanentemente?")) {
                        deleteProject(p.id);
                        setShowLoadModal(false);
                        setShowLoadModal(true);
                      }
                    }} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all font-black text-[10px] uppercase">EXCLUIR</button>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-zinc-800">
               <button onClick={createNewProject} className="w-full py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-zinc-700 transition-all tracking-[0.2em]">Criar Novo Projeto Vazio</button>
            </div>
          </div>
        </div>
      )}

      <footer className={`py-20 text-center border-t ${isExporting ? 'hidden' : ''} ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-400' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}>
        <p className="font-black text-[11px] tracking-[0.7em] mb-3 uppercase">GUITAR ARCHITECT - ENGINE v1.7</p>
        <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">{t.createdBy}</p>
      </footer>
    </div>
  );
};

export default FretboardPanel;