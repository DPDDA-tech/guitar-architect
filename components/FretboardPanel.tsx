
import React, { useState, useEffect, useCallback, useRef } from 'react';
import FretboardInstance from './FretboardInstance';
import { AppState, FretboardState, ThemeMode } from '../types';
import { translations, Lang } from '../i18n';
import { saveToStorage, loadFromStorage } from '../utils/persistence';
import { exportToPNG, exportToPDF } from '../utils/export';

const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg lg:w-[42px] lg:h-[42px]">
    <rect width="100" height="100" rx="20" fill="#2563eb"/>
    <path d="M25 30H75M25 50H75M25 70H75" stroke="white" strokeWidth="6" strokeLinecap="round"/>
    <path d="M40 20V80M60 20V80" stroke="white" strokeWidth="3" strokeOpacity="0.4"/>
    <circle cx="60" cy="50" r="8" fill="#ef4444" stroke="white" strokeWidth="3"/>
  </svg>
);

const DEFAULT_FRETBOARD = (lang: Lang, id?: string): FretboardState => ({
  id: id || crypto.randomUUID(),
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
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [lang, setLang] = useState<Lang>('pt');
  const [activeId, setActiveId] = useState<string>('');
  const [user, setUser] = useState<string>('Músico');
  const [isExporting, setIsExporting] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      const saved = loadFromStorage();
      if (saved) {
        setInstances(saved.instances.length > 0 ? saved.instances : [DEFAULT_FRETBOARD(saved.lang || 'pt')]);
        setTheme(saved.theme || 'light');
        setLang(saved.lang || 'pt');
        setUser(saved.currentUser || 'Músico');
        setActiveId(saved.activeId || saved.instances[0]?.id || '');
      } else {
        const initial = [DEFAULT_FRETBOARD('pt')];
        setInstances(initial);
        setActiveId(initial[0].id);
      }
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (initialized.current) {
      saveToStorage({ version: "1.5", instances, activeId, theme, lang, currentUser: user });
    }
  }, [instances, activeId, theme, lang, user]);

  const updateInstance = (id: string, newState: FretboardState) => {
    setInstances(prev => prev.map(inst => inst.id === id ? newState : inst));
  };

  const t = translations[lang];

  const addInstance = (clone: boolean = false) => {
    if (instances.length >= 12) {
      alert(t.limitReached);
      return;
    }
    const active = instances.find(i => i.id === activeId) || instances[0];
    const newItem = clone ? { ...JSON.parse(JSON.stringify(active)), id: crypto.randomUUID() } : DEFAULT_FRETBOARD(lang);
    setInstances(prev => [...prev, newItem]);
    setActiveId(newItem.id);
  };

  const removeInstance = (id: string) => {
    setInstances(prev => {
      const filtered = prev.filter(i => i.id !== id);
      const final = filtered.length === 0 ? [DEFAULT_FRETBOARD(lang)] : filtered;
      if (activeId === id) setActiveId(final[0].id);
      return final;
    });
  };

  const moveInstance = (id: string, dir: 'up' | 'down') => {
    setInstances(prev => {
      const idx = prev.findIndex(i => i.id === id);
      const nextIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const newList = [...prev];
      [newList[idx], newList[nextIdx]] = [newList[nextIdx], newList[idx]];
      return newList;
    });
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
      <div className={`fixed top-0 left-0 w-full z-50 border-b backdrop-blur-2xl transition-all duration-500 ${isLight ? 'bg-white/95 border-zinc-200 shadow-sm' : 'bg-zinc-950/95 border-zinc-800'} ${isExporting ? 'hidden' : ''}`}>
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between p-3 md:p-4 px-4 md:px-10 gap-4">
          <div className="flex items-center gap-3 md:gap-4 self-start md:self-auto">
             <LogoIcon />
             <div className="flex flex-col">
               <h1 className="text-lg md:text-2xl font-black tracking-tighter leading-none italic text-blue-600">GUITAR ARCHITECT</h1>
               <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-1 md:mt-1.5 ${isLight ? 'text-zinc-500 opacity-80' : 'text-zinc-400 opacity-90'}`}>
                 {t.tagline}
               </span>
             </div>
          </div>
          
          <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-6">
            <div className="flex items-center gap-2">
              <div className={`flex rounded-xl md:rounded-2xl p-0.5 md:p-1 border shadow-inner ${isLight ? 'bg-zinc-200/50 border-zinc-300' : 'bg-zinc-800/40 border-zinc-800/50'}`}>
                 <button onClick={() => setLang('pt')} className={`px-3 md:px-6 py-1.5 md:py-2 text-[10px] md:text-[11px] font-black rounded-lg md:rounded-xl transition-all ${lang === 'pt' ? 'bg-blue-600 text-white' : 'opacity-40 hover:opacity-100'}`}>PT</button>
                 <button onClick={() => setLang('en')} className={`px-3 md:px-6 py-1.5 md:py-2 text-[10px] md:text-[11px] font-black rounded-lg md:rounded-xl transition-all ${lang === 'en' ? 'bg-blue-600 text-white' : 'opacity-40 hover:opacity-100'}`}>EN</button>
              </div>
              <div className={`flex rounded-xl md:rounded-2xl p-0.5 md:p-1 border shadow-inner ${isLight ? 'bg-zinc-200/50 border-zinc-300' : 'bg-zinc-800/40 border-zinc-800/50'}`}>
                 <button onClick={() => setTheme('light')} className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all ${isLight ? 'bg-white text-zinc-900 shadow-sm' : 'opacity-40 hover:opacity-100'}`}>☼</button>
                 <button onClick={() => setTheme('dark')} className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all ${!isLight ? 'bg-zinc-700 text-white shadow-sm' : 'opacity-40 hover:opacity-100'}`}>☾</button>
              </div>
            </div>
            <div className={`hidden md:block h-10 w-px mx-2 ${isLight ? 'bg-zinc-300' : 'bg-zinc-800/50'}`} />
            <div className="flex gap-2">
              <button onClick={() => handleExport('png')} className="bg-emerald-600 px-4 md:px-7 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[12px] text-white hover:bg-emerald-500 shadow-lg md:shadow-2xl shadow-emerald-600/20 transition-all uppercase tracking-widest">PNG</button>
              <button onClick={() => handleExport('pdf')} className="bg-red-600 px-4 md:px-7 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[12px] text-white hover:bg-red-500 shadow-lg md:shadow-2xl shadow-red-600/20 transition-all uppercase tracking-widest">PDF</button>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-[1700px] mx-auto px-4 md:px-10 pb-20 md:pb-32 space-y-12 md:space-y-24 ${isExporting ? 'pt-10 bg-white' : 'pt-40 md:pt-36'}`}>
        {instances.map((inst, idx) => (
          <FretboardInstance 
            key={inst.id} 
            state={inst} 
            updateState={(s) => updateInstance(inst.id, s)} 
            onRemove={() => removeInstance(inst.id)} 
            onMove={(dir) => moveInstance(inst.id, dir)} 
            onAdd={addInstance} 
            isFirst={idx === 0} 
            isLast={idx === instances.length - 1} 
            theme={theme} 
            lang={lang} 
            isActive={activeId === inst.id} 
            onActivate={() => setActiveId(inst.id)}
            isExporting={isExporting}
          />
        ))}
      </div>

      <footer className={`py-12 md:py-20 text-center border-t transition-all duration-500 ${isExporting ? 'hidden' : ''} ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-400' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}>
        <p className="font-black text-[9px] md:text-[11px] tracking-[0.4em] md:tracking-[0.7em] mb-2 md:mb-3 uppercase px-4">GUITAR ARCHITECT - ENGINE v1.5</p>
        <p className="text-[8px] md:text-[10px] opacity-70 font-bold uppercase tracking-widest px-4">Professional Fretboard Visualization System</p>
      </footer>
    </div>
  );
};

export default FretboardPanel;
