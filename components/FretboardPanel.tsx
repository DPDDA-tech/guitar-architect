
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
const APP_LOGO_PATH = "/logo.png"; 

const LogoIcon = ({ variant = 'default' }: { variant?: 'default' | 'large' | 'footer' }) => {
  const isLarge = variant === 'large';
  const isFooter = variant === 'footer';
  
  return (
    <div className={`flex items-center justify-center ${isLarge ? 'mb-6' : ''}`}>
      <img 
        src={APP_LOGO_PATH}
        alt="Guitar Architect Logo" 
        className={`
          object-contain transition-transform hover:scale-110 drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]
          ${isLarge ? 'w-24 h-24 md:w-32 md:h-32' : (isFooter ? 'w-8 h-8 md:w-10 md:h-10' : 'w-10 h-10 md:w-14 md:h-14')}
        `}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `<div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-[10px]">GA</div>`;
        }}
      />
    </div>
  );
};

const FullScreenIcon = ({ isFullScreen }: { isFullScreen: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {isFullScreen ? (
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    ) : (
      <path d="M15 3h6v6M9 21H3v-6M21 15v6h-6M3 9V3h6" />
    )}
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
  const [userLogo, setUserLogo] = useState<string | undefined>(undefined);
  const [defaultInstrument, setDefaultInstrument] = useState<InstrumentType>('guitar-6');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [showMobileHint, setShowMobileHint] = useState(true);

  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const initialized = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang] || translations['pt'];

const switchUserSession = (newUser: string) => {

  // ============================
  // 1️⃣ SALVA SESSÃO ATUAL
  // ============================

  if (user && initialized.current) {

    const currentProject: Project = {
      id: projectId,
      name: projectName,
      user,
      lastUpdated: new Date().toISOString(),
      instances,
      globalTransposition: globalTranspose
    };

    saveProjectToLibrary(currentProject);

    saveConfig({
      version: "1.8.1",
      activeProjectId: projectId,
      theme,
      lang,
      currentUser: user,
      userLogo,
      defaultInstrument
    });
  }

  // ============================
  // 2️⃣ LIMPA WORKSPACE (CRÍTICO)
  // ============================

  setInstances([]);
  setProjectName('Novo Projeto');
  setProjectId(crypto.randomUUID());
  setGlobalTranspose(0);

  // ⚠️ força novo ciclo de boot
  initialized.current = false;

  // ============================
  // 3️⃣ DEFINE NOVO USUÁRIO
  // ============================

  setUser(newUser);

  // ============================
  // 4️⃣ BOOT NOVA SESSÃO
  // ============================

  const config = loadConfig();
  const library = getLibrary(newUser);

  const userProjects = library
    .filter(p => p.user === newUser)
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() -
        new Date(a.lastUpdated).getTime()
    );

  if (userProjects.length > 0) {

    const recent = userProjects[0];

    setInstances(recent.instances);
    setProjectName(recent.name);
    setProjectId(recent.id);
    setGlobalTranspose(
      recent.globalTransposition || 0
    );

    if (recent.instances.length > 0) {
      setDefaultInstrument(
        recent.instances[0].instrumentType
      );
    }

  } else {

    // usuário novo → workspace limpo
    setInstances([
      DEFAULT_FRETBOARD(lang, 'guitar-6')
    ]);
  }

  initialized.current = true;
};

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erro ao entrar em tela cheia: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    // Manter o idioma acessível globalmente para o SVG
    (window as any).ga_lang = lang;
  }, [lang]);

  useEffect(() => {
  const handleResize = () => {
    setIsSmallScreen(window.innerWidth < 1024);
  };

  handleResize(); // boot inicial

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

useEffect(() => {
  if (isSmallScreen) {
    setShowMobileHint(true);

    const timer = setTimeout(() => {
      setShowMobileHint(false);
    }, 3000);

    return () => clearTimeout(timer);
  }
}, [isSmallScreen]);

useEffect(() => {
  if (!initialized.current) {

    const config = loadConfig();
    const library = getLibrary(config?.currentUser || '');

    if (config) {

      setTheme(config.theme || 'light');
      setLang((config.lang as Lang) || 'pt');
      setUser(config.currentUser || '');
      setUserLogo(config.userLogo);

      const bootInstrument: InstrumentType =
        config.defaultInstrument || 'guitar-6';

      setDefaultInstrument(bootInstrument);

      const lastProject = library.find(
        p =>
          p.id === config.activeProjectId &&
          p.user === config.currentUser
      );

      if (lastProject) {

        setInstances(lastProject.instances);
        setProjectName(lastProject.name);
        setProjectId(lastProject.id);
        setGlobalTranspose(
          lastProject.globalTransposition || 0
        );

        if (lastProject.instances.length > 0) {
          setDefaultInstrument(
            lastProject.instances[0].instrumentType
          );
        }

      } else {

        const userProjects = library
          .filter(p => p.user === config.currentUser)
          .sort(
            (a, b) =>
              new Date(b.lastUpdated).getTime() -
              new Date(a.lastUpdated).getTime()
          );

        if (userProjects.length > 0) {

          const recent = userProjects[0];

          setInstances(recent.instances);
          setProjectName(recent.name);
          setProjectId(recent.id);
          setGlobalTranspose(
            recent.globalTransposition || 0
          );

          if (recent.instances.length > 0) {
            setDefaultInstrument(
              recent.instances[0].instrumentType
            );
          }

        } else {

          setInstances([
            DEFAULT_FRETBOARD(
              (config.lang as Lang) || 'pt',
              bootInstrument
            )
          ]);

        }
      }

    } else {

      setInstances([
        DEFAULT_FRETBOARD('pt', 'guitar-6')
      ]);

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
        instances: instances,
        globalTransposition: globalTranspose
      };

      saveProjectToLibrary(currentProject);

      saveConfig({
        version: "1.8.1",
        activeProjectId: projectId,
        theme,
        lang,
        currentUser: user,
        userLogo: userLogo,
        defaultInstrument,
      });

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);

    }, 1000);

    return () => clearTimeout(timer);
  }
}, [
  instances,
  projectName,
  projectId,
  theme,
  lang,
  user,
  userLogo,
  isExporting,
  globalTranspose,
  defaultInstrument
]);

const handleLogout = () => {

  // salva sessão atual antes de sair
  if (user && initialized.current) {

    const currentProject: Project = {
      id: projectId,
      name: projectName,
      user,
      lastUpdated: new Date().toISOString(),
      instances,
      globalTransposition: globalTranspose
    };

    saveProjectToLibrary(currentProject);

    saveConfig({
      version: "1.8.1",
      activeProjectId: projectId,
      theme,
      lang,
      currentUser: user,
      userLogo,
      defaultInstrument
    });
  }

  // limpa sessão
  setInstances([]);
  setUser('');
  setProjectName('Novo Projeto');
  setProjectId(crypto.randomUUID());
  setGlobalTranspose(0);
  setUserLogo(undefined);

  initialized.current = false;

  // abre modal de login novamente
  setShowLoginModal(true);
};

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 512000) {
        alert(lang === 'pt' ? "Arquivo muito grande. Limite: 500KB" : "File too large. Limit: 500KB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGlobalTranspose = (semitones: number) => {
    if (semitones === 0) {
      const diff = -globalTranspose;
      const newInstances = instances.map(inst => {
        const newRoot = transposeNote(inst.root, diff);
        const newMarkers = inst.markers.map(m => ({ ...m, fret: Math.max(0, m.fret + diff) }));
        return { ...inst, root: newRoot, markers: newMarkers };
      });
      setInstances(newInstances);
      setGlobalTranspose(0);
      return;
    }
    const newInstances = instances.map(inst => {
      const newRoot = transposeNote(inst.root, semitones);
      const newMarkers = inst.markers.map(m => ({ ...m, fret: Math.max(0, m.fret + semitones) }));
      return { ...inst, root: newRoot, markers: newMarkers };
    });
    setInstances(newInstances);
    setGlobalTranspose(prev => prev + semitones);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importText);
      if (data.diagram_id || data.theory) {
         const newInst = DEFAULT_FRETBOARD(lang, data.meta?.instrument || 'guitar-6');
         newInst.title = data.meta?.title || "Importado";
         newInst.root = data.theory?.root || "C";
         newInst.scaleType = data.theory?.scale || "Major (Ionian)";
         newInst.tuning = data.tuning?.label || "Standard";
         newInst.harmonyMode = data.theory?.harmony || "OFF";
         
         if (data.points) {
            newInst.markers = data.points.map((p: any) => ({
              id: crypto.randomUUID(),
              string: INSTRUMENT_PRESETS[newInst.instrumentType].strings - p.string,
              fret: p.fret,
              shape: 'circle',
              color: '#2563eb',
              finger: '1'
            }));
         }
         setInstances(prev => [...prev, newInst]);
         alert(t.importSuccess);
      } else if (data.instances && Array.isArray(data.instances)) {
         if (window.confirm(lang === 'pt' ? "Deseja substituir o projeto atual por este arquivo?" : "Replace current project with this file?")) {
            setInstances(data.instances);
            setProjectName(data.name || projectName);
            setGlobalTranspose(data.globalTransposition || 0);
         }
      } else {
         throw new Error("Invalid structure");
      }
      setShowImportModal(false);
      setImportText('');
    } catch (e) {
      alert(t.importError);
    }
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
      ? "LIMPAR PROJETO INTEIRO?\n\nIsso excluirá todos os diagramas." 
      : "CLEAR ENTIRE PROJECT?\n\nThis will delete all diagrams.";
    
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
    await exportToPNG(lang, user, userLogo);
    setIsExporting(false);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 50));
    await exportToPDF(lang, user, userLogo);
    setIsExporting(false);
  };

  const isLight = theme === 'light';
  const userLibrary = getLibrary(user);

  return (
    <div className={`min-h-screen transition-all ${isExporting ? 'is-exporting-mode' : (isLight ? 'blueprint-grid-light' : 'blueprint-grid-dark')}`}>
      
      {isSmallScreen && showMobileHint && !isExporting && (
  <div className="
    fixed bottom-4 left-1/2 -translate-x-1/2
    z-[120]
    bg-black/80 text-white
    px-4 py-2 rounded-xl
    text-[11px] font-bold
    flex items-center gap-3
    backdrop-blur-md
    shadow-lg
  ">
    <span>
      🎸 Otimizado para desktop. Use paisagem para melhor experiência.
    </span>

    <button
      onClick={() => setShowMobileHint(false)}
      className="bg-white/20 hover:bg-white/40 px-2 py-0.5 rounded-md transition-colors"
    >
      ✕
    </button>
  </div>
)}


      <div className={`fixed top-0 left-0 w-full z-50 border-b backdrop-blur-2xl px-4 md:px-10 transition-all duration-500
${isLight ? 'bg-white/90 border-zinc-200 shadow-sm' : 'bg-zinc-950/90 border-zinc-800'}
${isExporting ? 'hidden' : ''}
${isSmallScreen ? '-translate-y-[72%] hover:translate-y-0 py-2' : 'py-3 md:py-4'}
`}
>

         <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
               <LogoIcon />
               <div className="min-w-0">
                  <h1 className="text-[16px] md:text-2xl font-black italic text-blue-600 leading-none tracking-tighter uppercase truncate">GUITAR ARCHITECT</h1>
                  <input
  value={projectName}
  onChange={e => setProjectName(e.target.value)}
  className={`bg-transparent font-bold text-[10px] md:text-xs
  focus:outline-none border-b border-transparent
  focus:border-blue-500 truncate max-w-[140px]
  ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}
  placeholder={t.projectName}
/>

                  <p className="text-[8px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-tight mt-1">{t.tagline}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                     <span className={`text-[10px] md:text-[11px] font-black uppercase truncate max-w-[100px] md:max-w-none ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                        {user || (lang === 'pt' ? 'Visitante' : 'Guest')}
                     </span>
                     <div className="flex gap-2">
  <button
    onClick={() => setShowLoginModal(true)}
    className="text-[9px] md:text-[10px] text-blue-600 font-black hover:underline uppercase tracking-tight opacity-70 hover:opacity-100 transition-opacity"
  >
    IDENTIDADE
  </button>

  <button
    onClick={handleLogout}
    className="text-[9px] md:text-[10px] bg-red-600 text-white font-black px-2.5 py-1 rounded-md uppercase tracking-tight hover:bg-red-700 active:scale-95 transition-all shadow-sm"
  >
    LOGOFF
  </button>
</div>

                  </div>
               </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
               <button onClick={toggleFullScreen} className={`p-2 md:p-2.5 rounded-xl border transition-all ai-glow ${isLight ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100' : 'border-zinc-700 text-zinc-100 hover:bg-zinc-800'}`} title="Toggle Full Screen">
                  <FullScreenIcon isFullScreen={isFullScreen} />
               </button>

               {/* LOAD / SAVE — SEPARADOS */}
<div className="flex items-center gap-2 md:gap-3">

  {/* LOAD */}
  <button
    onClick={() => setShowLoadModal(true)}
    className={`
      px-4 md:px-6 py-2 md:py-3
      rounded-xl border font-black uppercase
      text-[10px] md:text-[11px]
      transition-all shadow-sm
      ${isLight
        ? 'bg-white border-zinc-300 text-zinc-800 hover:border-blue-500 hover:text-blue-600'
        : 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:border-blue-500 hover:text-blue-400'}
    `}
  >
    {window.innerWidth < 768 ? 'LISTA' : t.loadProject}
  </button>

  {/* SAVE */}
  <button
    onClick={() => setSaveStatus('saved')}
    className={`
      px-4 md:px-6 py-2 md:py-3
      rounded-xl border font-black uppercase
      text-[10px] md:text-[11px]
      transition-all shadow-sm
      ${isLight
        ? 'bg-white border-zinc-300 text-zinc-800 hover:border-emerald-500 hover:text-emerald-600'
        : 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:border-emerald-500 hover:text-emerald-400'}
    `}
  >
    {window.innerWidth < 768 ? 'SALVAR' : t.saveProject}
  </button>

</div>


               {/* EXPORTAÇÃO */}
<div className="flex flex-col items-center md:items-start leading-none">

  {/* TÍTULO */}
  <span className={`
    text-[8px] md:text-[8px]
    font-black uppercase tracking-wider
    mb-1
    ${isLight ? 'text-zinc-500' : 'text-zinc-400'}
  `}>
    {lang === 'pt' ? 'Exportação' : 'Export'}
  </span>

  {/* BOTÕES */}
  <div className="flex gap-1 md:gap-2">
    <button
      onClick={handleExportPNG}
      className="
        bg-emerald-600
        px-3 md:px-6 py-2 md:py-3
        rounded-xl
        font-black
        text-[10px] md:text-[11px]
        text-white
        shadow-md
        active:scale-90
        transition-transform
      "
    >
      PNG
    </button>

    <button
      onClick={handleExportPDF}
      className="
        bg-red-600
        px-3 md:px-6 py-2 md:py-3
        rounded-xl
        font-black
        text-[10px] md:text-[11px]
        text-white
        shadow-md
        active:scale-90
        transition-transform
      "
    >
      PDF
    </button>
  </div>

</div>


{/* GLOBAL TRANSPOSE — HEADER */}
<div className="flex flex-col items-center leading-none select-none">

  {/* LABEL */}
  <span className={`
    text-[8px] font-black uppercase tracking-widest mb-1
    ${isLight ? 'text-zinc-500' : 'text-zinc-400'}
  `}>
    {lang === 'pt'
      ? 'Transposição Global'
      : 'Global Transpose'}
  </span>

  {/* CONTROLS */}
  <div className={`
    flex items-center gap-1
    rounded-xl border px-1.5 py-1
    shadow-sm backdrop-blur
    ${isLight
      ? 'bg-white border-zinc-200'
      : 'bg-zinc-800 border-zinc-700'}
  `}>

    <button
      onClick={() => handleGlobalTranspose(1)}
      className="w-7 h-7 flex items-center justify-center font-black text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
    >
      +
    </button>

    <div className="flex flex-col items-center justify-center px-1 min-w-[26px]">
      <span className="font-black text-[10px] leading-none">
        {globalTranspose === 0
          ? '0'
          : globalTranspose > 0
            ? `+${globalTranspose}`
            : globalTranspose}
      </span>

      <button
        onClick={() => handleGlobalTranspose(0)}
        className="text-[7px] font-black uppercase text-zinc-400 hover:text-red-500 leading-none"
      >
        reset
      </button>
    </div>

    <button
      onClick={() => handleGlobalTranspose(-1)}
      className="w-7 h-7 flex items-center justify-center font-black text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
    >
      −
    </button>

  </div>
</div>


               <button onClick={() => setTheme(isLight ? 'dark' : 'light')} className={`p-2.5 md:p-3 rounded-xl border text-sm md:text-base transition-colors ${isLight ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100' : 'border-zinc-700 text-zinc-100 hover:bg-zinc-800'}`}>{isLight ? '☾' : '☼'}</button>

               <div className="flex items-center gap-3 ml-3">
{/* LANG */}
<div className={`
  flex border rounded-lg p-0.5
  ${isLight
    ? 'bg-zinc-100 border-zinc-200'
    : 'bg-zinc-800 border-zinc-700'}
`}>
  <button
    onClick={() => setLang('pt')}
    className={`px-2 py-1 text-[9px] font-black rounded ${
      lang === 'pt'
        ? 'bg-blue-600 text-white'
        : 'text-zinc-500'
    }`}
  >
    PT
  </button>

  <button
    onClick={() => setLang('en')}
    className={`px-2 py-1 text-[9px] font-black rounded ${
      lang === 'en'
        ? 'bg-blue-600 text-white'
        : 'text-zinc-500'
    }`}
  >
    EN
  </button>
</div>

{/* CLEAR ALL */}
<button
  onClick={clearAll}
  className="
    ml-2 px-3 py-1.5
    text-[10px] font-black
    text-red-500/80
    border border-red-300/40
    rounded-lg
    hover:bg-red-500
    hover:text-white
    transition-all
    uppercase
  "
>
  LIMPAR TUDO
</button>

               </div>
            </div>
         </div>
      </div>

          <div
  className={`max-w-[1700px] mx-auto px-4 md:px-10 pb-20 space-y-8 md:space-y-12 ${
    isExporting
      ? 'pt-10'
      : isSmallScreen
        ? 'pt-24 md:pt-48'
        : 'pt-24 md:pt-48'
  }`}
>

        {instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="relative mb-8 md:mb-12 scale-90 md:scale-100">
                <img src={HERO_IMAGE} alt="Hero" className="w-full max-w-[280px] md:max-w-lg rounded-[24px] md:rounded-[40px] shadow-2xl" />
             </div>
             <button onClick={() => addInstance()} className="bg-blue-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-xl font-black uppercase text-[10px] md:text-xs shadow-xl active:scale-95 transition-transform">Criar Primeiro Diagrama</button>
          </div>
        ) : (
          instances.map((inst, idx) => (
            <FretboardInstance key={inst.id} state={inst} updateState={(s) => updateInstance(inst.id, s)} onRemove={() => setInstances(prev => prev.filter(i => i.id !== inst.id))} onMove={(dir) => { const newList = [...instances]; const tIdx = dir === 'up' ? idx - 1 : idx + 1; if (tIdx >= 0 && tIdx < newList.length) { [newList[idx], newList[tIdx]] = [newList[tIdx], newList[idx]]; setInstances(newList); } }} onAdd={addInstance} isFirst={idx === 0} isLast={idx === instances.length - 1} theme={theme} lang={lang} isActive={false} onActivate={() => {}} isExporting={isExporting} />
          ))
        )}
      </div>

      <footer className={`py-10 border-t ${isExporting ? 'hidden' : ''} ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-900'}`}>
         <div className="max-w-[1700px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
               <LogoIcon variant="footer" />
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Guitar Architect • DPDDA-tech</p>
            </div>
            <div className="flex gap-4 md:gap-8 text-[10px] font-black uppercase text-zinc-500">
               <a href="/legal/privacy.html" target="_blank" className="hover:text-blue-600 transition-colors">Privacidade</a>
               <a href="/legal/terms.html" target="_blank" className="hover:text-blue-600 transition-colors">Termos</a>
               <a href="/legal/license.html" target="_blank" className="hover:text-blue-600 transition-colors">Licença</a>
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>© 2026</p>
         </div>
      </footer>

      {showLoginModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
          <div className={`w-full max-w-md rounded-[40px] p-8 md:p-12 border shadow-2xl ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
             <div className="flex flex-col items-center mb-8">
                <LogoIcon variant="large" />
                <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-center">Identidade Visual</h2>
             </div>
             
             <div className={`p-6 rounded-3xl mb-8 border ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/10 border-blue-900/30'}`}>
                <div className="flex flex-col items-center gap-4">
                   {userLogo ? (
                     <div className="relative shrink-0">
                        <img src={userLogo} className="max-w-[200px] max-h-[80px] rounded-xl object-contain bg-white border border-zinc-200 p-2" />
                        <button onClick={() => setUserLogo(undefined)} className="absolute -top-3 -right-3 bg-red-600 text-white w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center shadow-lg hover:scale-110 transition-transform">×</button>
                     </div>
                   ) : (
                     <button onClick={() => fileInputRef.current?.click()} className={`w-full h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-xs font-black transition-all ${isLight ? 'border-zinc-200 text-zinc-400 bg-zinc-50 hover:bg-zinc-100' : 'border-zinc-700 text-zinc-500 bg-zinc-800 hover:bg-zinc-700'}`}>
                       <span className="text-2xl">+</span>
                       <span>SUBIR LOGO</span>
                     </button>
                   )}
                   <div className="text-center">
                      <p className="text-[11px] md:text-[12px] font-black text-blue-600 uppercase">Insira SEU LOGOTIPO para as exportações</p>
                      <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase mt-2 font-bold leading-relaxed opacity-60">Sugestão: PNG transparente, 400x120px.<br/>Limite: 500KB para performance.</p>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={handleLogoUpload} />
                   </div>
                </div>
             </div>

             <div className="relative mb-8">
               <input 
                 autoFocus 
                 placeholder="Nome do Autor (ex: Prof. Jimmy H)..." 
                 value={user} 
                 onChange={e => setUser(e.target.value)} 
 onKeyDown={e => {
  if (e.key === 'Enter' && user.trim()) {
    switchUserSession(user.trim());
    setShowLoginModal(false);
  }
}}


                 className={`w-full p-4 rounded-2xl font-bold outline-none border transition-all text-center text-sm md:text-base placeholder:text-zinc-400 placeholder:font-normal placeholder:opacity-50 ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-900 focus:border-blue-500' : 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-blue-500'}`} 
               />
               {!user && (
                 <p className="absolute -bottom-5 left-0 w-full text-center text-[9px] font-black uppercase text-zinc-400 tracking-tighter opacity-40">Apenas sugestão. Digite o que desejar.</p>
               )}
             </div>
             
<button
  onClick={() => {
    if (user.trim()) {
      switchUserSession(user.trim());
      setShowLoginModal(false);
    }
  }}
  className={`w-full py-5 rounded-2xl font-black uppercase text-[12px] shadow-xl active:scale-95 transition-all ${
    user.trim()
      ? 'bg-blue-600 text-white'
      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
  }`}
>
  Confirmar Identidade
</button>
</div>
</div>
)}
      {showImportModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
           <div className={`w-full max-w-2xl rounded-[32px] p-6 md:p-8 border shadow-3xl ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black italic text-blue-500 uppercase tracking-tighter">{t.importTitle}</h2>
                 <button onClick={() => setShowImportModal(false)} className="text-zinc-500 text-2xl hover:text-red-500 transition-colors">×</button>
              </div>
              <textarea 
                 autoFocus 
                 placeholder={t.importPlaceholder} 
                 value={importText} 
                 onChange={e => setImportText(e.target.value)} 
                 className={`w-full h-64 p-4 rounded-2xl mb-6 font-mono text-[10px] outline-none border transition-all ${isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-blue-500' : 'bg-zinc-800 border-zinc-700 text-zinc-300 focus:border-blue-500'}`}
              />
              <div className="flex gap-4">
                 <button onClick={() => setShowImportModal(false)} className={`flex-1 py-4 rounded-xl font-black uppercase text-[11px] transition-colors ${isLight ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Sair</button>
                 <button onClick={handleImport} className="flex-2 py-4 px-12 bg-blue-600 text-white rounded-xl font-black uppercase text-[11px] shadow-xl hover:bg-blue-700 transition-colors">Importar Dados</button>
              </div>
           </div>
        </div>
      )}

     {showLoadModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
    <div className={`w-full max-w-xl rounded-[24px] p-6 md:p-10 border shadow-3xl ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black italic text-blue-500 uppercase tracking-tighter">
          Projetos
        </h2>
        <button
          onClick={() => setShowLoadModal(false)}
          className="text-zinc-500 font-black text-[11px] uppercase hover:text-blue-500 transition-colors"
        >
          Fechar
        </button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">

        {userLibrary.map(p => (
          <div
            key={p.id}
            onClick={() => {
              setProjectId(p.id);
              setProjectName(p.name);
              setInstances(p.instances);
              setGlobalTranspose(p.globalTransposition || 0);
              setShowLoadModal(false);
            }}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
              isLight
                ? 'bg-zinc-50 border-zinc-100 hover:border-blue-500 hover:bg-blue-50/20'
                : 'bg-zinc-800 border-zinc-700 hover:border-blue-500 hover:bg-blue-900/10'
            }`}
          >
            <div className="font-black text-zinc-800 group-hover:text-blue-500 uppercase text-xs truncate max-w-[200px]">
              {p.name}
            </div>

            <div className="text-[9px] font-bold text-zinc-400 shrink-0">
              {new Date(p.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        ))}

        {userLibrary.length === 0 && (
          <p className="text-center py-12 font-black text-zinc-400 uppercase text-[10px]">
            Vazio
          </p>
        )}

      </div>
    </div>
  </div>
)}

</div>
);
};
export default FretboardPanel;