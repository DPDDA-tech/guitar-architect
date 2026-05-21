import React, { useMemo, useState } from 'react';
import { translations, Lang } from '../i18n';
import {
  CAGED_MODULES,
  CAGED_OVERLAYS,
  CagedAction,
  CagedBlock,
  CagedModule,
  CagedModuleCategory,
  CagedOverlay,
} from '../data/cagedModules';
import { loadConfig, saveConfig } from '../utils/persistence';
import { AppState, ThemeMode } from '../types';
import { recordAchievementEvent } from '../utils/achievementEvents';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z" />
  </svg>
);

const PENDING_ACTION_KEY = 'ga_pending_fretboard_action';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const getInitialConfig = (): AppState | null => {
  try {
    return loadConfig();
  } catch {
    return null;
  }
};

const categoryLabels: Record<Lang, Record<CagedModuleCategory, string>> = {
  pt: {
    theory: 'Teoria',
    fretboard: 'Fretboard',
    visualization: 'Visualização',
    harmony: 'Harmonia',
    practice: 'Prática',
    improvisation: 'Improviso',
  },
  en: {
    theory: 'Theory',
    fretboard: 'Fretboard',
    visualization: 'Visualization',
    harmony: 'Harmony',
    practice: 'Practice',
    improvisation: 'Improvisation',
  },
};

const categoryClasses: Record<CagedModuleCategory, string> = {
  theory: 'border-cyan-400/30 text-cyan-200 bg-cyan-950/22',
  fretboard: 'border-blue-400/30 text-blue-200 bg-blue-950/24',
  visualization: 'border-sky-400/30 text-sky-200 bg-sky-950/22',
  harmony: 'border-violet-400/30 text-violet-200 bg-violet-950/24',
  practice: 'border-emerald-400/30 text-emerald-200 bg-emerald-950/22',
  improvisation: 'border-amber-400/30 text-amber-200 bg-amber-950/22',
};

const lightCategoryClasses: Record<CagedModuleCategory, string> = {
  theory: 'border-cyan-200 text-cyan-700 bg-cyan-50',
  fretboard: 'border-blue-200 text-blue-700 bg-blue-50',
  visualization: 'border-sky-200 text-sky-700 bg-sky-50',
  harmony: 'border-violet-200 text-violet-700 bg-violet-50',
  practice: 'border-emerald-200 text-emerald-700 bg-emerald-50',
  improvisation: 'border-amber-200 text-amber-700 bg-amber-50',
};

const difficultyLabel: Record<Lang, Record<NonNullable<CagedModule['difficulty']>, string>> = {
  pt: {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  },
  en: {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  },
};

const cagedCopy = {
  pt: {
    subtitle: 'Laboratório de visualização para conectar acordes, arpejos, escalas e regiões móveis do braço.',
    mapTitle: 'Mapa CAGED',
    mapSubtitle: 'Do conceito às regiões completas do braço.',
    modules: 'módulos',
    study: 'Estudo',
    panelTitle: 'Painel didático dinâmico',
    overlayTitle: 'Overlay system',
    overlayBody: 'Camadas preparadas para shape, tônica, tríade, arpejo, escala, graus e conexão horizontal.',
    actionsTitle: 'Ações práticas',
  },
  en: {
    subtitle: 'A visualization lab for connecting chords, arpeggios, scales and movable fretboard regions.',
    mapTitle: 'CAGED map',
    mapSubtitle: 'From the concept to full-neck regions.',
    modules: 'modules',
    study: 'Study',
    panelTitle: 'Dynamic lesson panel',
    overlayTitle: 'Overlay system',
    overlayBody: 'Layers prepared for shape, root, triad, arpeggio, scale, degrees and horizontal connection.',
    actionsTitle: 'Practical actions',
  },
} as const;

const cagedModuleTranslations: Record<string, { title: string; subtitle: string }> = {
  'what-is-caged': { title: 'What the CAGED system is', subtitle: 'Five open forms organizing the whole fretboard.' },
  'five-connected-forms': { title: 'The five connected forms', subtitle: 'C, A, G, E and D are not isolated boxes.' },
  'tonic-in-each-shape': { title: 'Finding the root in each shape', subtitle: 'The root is the gravitational center of the region.' },
  'chord-arpeggio-scale': { title: 'Chord, arpeggio and scale in the same region', subtitle: 'A shape contains harmonic layers, not only a form.' },
  'horizontal-connection': { title: 'Horizontal connection between shapes', subtitle: 'The fretboard should be seen laterally, not as isolated boxes.' },
  'barre-transposition': { title: 'Barre transposition', subtitle: 'Open shapes become movable through the barre.' },
  'major-scale-caged': { title: 'CAGED applied to the major scale', subtitle: 'The major scale can be visualized inside the five regions.' },
  'pentatonics-inside-caged': { title: 'Pentatonics inside CAGED', subtitle: 'Pentatonic boxes gain meaning when tied to the chord.' },
  'triads-inside-caged': { title: 'Triads inside CAGED', subtitle: 'Small triads reveal the harmonic core of each region.' },
  'connected-arpeggios': { title: 'Connected arpeggios', subtitle: 'Arpeggios cross shapes and reveal harmonic voice leading.' },
  'caged-improvisation': { title: 'CAGED and improvisation', subtitle: 'Use regions as maps of intention, not visual prisons.' },
  'full-neck-visualization': { title: 'Full-neck visualization', subtitle: 'The final goal is to see the entire fretboard as one continuous system.' },
};

const cagedActionTranslations: Record<string, string> = {
  'show-caged-shapes': 'Show CAGED shapes',
  'show-regions': 'Show regions',
  'highlight-tonics': 'Highlight roots',
  'next-shape': 'Show next shape',
  overlap: 'Show overlap',
  horizontal: 'Navigate horizontally',
  'only-tonics': 'Show roots only',
  'alternate-shapes': 'Alternate shapes',
  'show-octaves': 'Show octaves',
  'show-chord': 'Show chord',
  'show-arpeggio': 'Show arpeggio',
  'show-scale': 'Show scale',
  'connect-regions': 'Connect regions',
  'show-movement': 'Show movement',
  'navigate-neck': 'Navigate the neck',
  'move-shape': 'Move shape',
  'change-key': 'Change key',
  'show-barre': 'Show barre',
  'apply-major': 'Apply major scale',
  'show-degrees': 'Show degrees',
  'connect-scale-regions': 'Connect regions',
  'show-pentatonic': 'Show pentatonic',
  'chord-relation': 'Show chord relationship',
  'blue-note': 'Show blue note',
  'show-triads': 'Show triads',
  inversions: 'Show inversions',
  'voice-leading': 'Show voice leading',
  'show-arpeggio-line': 'Show arpeggio',
  'next-shape-arpeggio': 'Show next shape',
  'play-arpeggio': 'Play arpeggio',
  'backing-region': 'Apply backing region',
  'target-notes': 'Show target notes',
  'related-pentatonic': 'Apply related pentatonic',
  'full-neck': 'Full neck mode',
  'only-degrees': 'Show only degrees',
  pathways: 'Highlight paths',
};

const overlayTranslations: Record<CagedOverlay, { label: string; description: string }> = {
  shape: { label: 'Shape', description: 'Active CAGED system region.' },
  tonic: { label: 'Root', description: 'Main orientation point.' },
  triad: { label: 'Triad', description: 'Harmonic core of the shape.' },
  arpeggio: { label: 'Arpeggio', description: 'Chord played as a line.' },
  scale: { label: 'Scale', description: 'Melodic map around the shape.' },
  degrees: { label: 'Degrees', description: 'Internal functions of the scale.' },
  horizontalConnection: { label: 'Connection', description: 'Horizontal link between regions.' },
};

const getCagedModuleCopy = (module: CagedModule, lang: Lang) => (
  lang === 'pt' ? module : { ...module, ...cagedModuleTranslations[module.id] }
);

const cagedBlockTranslations: Record<string, Record<string, { eyebrow: string; title?: string; body: string; examples?: string[] }>> = {
  'what-is-caged': {
    concept: {
      eyebrow: 'Concept',
      body: 'The CAGED system organizes the fretboard into five regions derived from the open C, A, G, E and D forms.',
      examples: ['C', 'A', 'G', 'E', 'D'],
    },
    fretboard: {
      eyebrow: 'On the fretboard',
      body: 'The forms connect horizontally and let you visualize chords, scales and arpeggios in movable regions.',
    },
    music: {
      eyebrow: 'Musical connection',
      body: 'Improvisation, accompaniment and harmonic visualization become more intuitive when the root organizes each region.',
    },
  },
  'five-connected-forms': {
    concept: {
      eyebrow: 'Concept',
      body: 'The five forms are not isolated. They overlap and connect the whole fretboard in one movable sequence.',
      examples: ['C -> A -> G -> E -> D'],
    },
    fretboard: {
      eyebrow: 'On the fretboard',
      body: 'Watch the move from one region to the next, using roots and common tones as transition points.',
    },
    movement: {
      eyebrow: 'Movement',
      body: 'The transition should feel lateral and continuous, not like a jump to an unrelated diagram.',
    },
  },
  'tonic-in-each-shape': {
    concept: {
      eyebrow: 'Concept',
      body: 'The root is the main orientation point of the shape. Without it, CAGED becomes memorized geometry.',
    },
    examples: {
      eyebrow: 'Examples',
      body: 'The same logic works in every key: find the root and the shape gains direction.',
      examples: ['C in E shape', 'D in A shape', 'G in G shape'],
    },
    focus: {
      eyebrow: 'Visual focus',
      body: 'Reducing the other notes and highlighting roots helps you see octaves, resting points and resolution.',
    },
  },
  'chord-arpeggio-scale': {
    concept: {
      eyebrow: 'Concept',
      body: 'The same shape contains chord, arpeggio and scale. The layers change the visual function of the same region.',
    },
    example: {
      eyebrow: 'Example',
      body: 'In the E shape of C major, the C chord, Cmaj7 arpeggio and C major scale coexist in the same territory.',
      examples: ['C chord', 'Cmaj7 arpeggio', 'C major scale'],
    },
    overlay: {
      eyebrow: 'Overlays',
      body: 'Turn chord, arpeggio and scale on or off to understand the role of each layer.',
    },
  },
  'horizontal-connection': {
    concept: {
      eyebrow: 'Concept',
      body: 'The fretboard should be seen horizontally. Regions are stages of the same map, not separate drawers.',
    },
    fretboard: {
      eyebrow: 'On the fretboard',
      body: 'Soft connection lines and a highlighted next position help you understand lateral movement.',
    },
    music: {
      eyebrow: 'Musical connection',
      body: 'Improvising between shapes becomes natural when you connect target notes instead of jumping blindly between boxes.',
    },
  },
  'barre-transposition': {
    concept: {
      eyebrow: 'Concept',
      body: 'Open shapes become movable through the barre. The form remains, but the root changes.',
    },
    examples: {
      eyebrow: 'Examples',
      body: 'The E form can move up to F, G and A while keeping the same relative architecture.',
      examples: ['E shape -> F', 'E shape -> G', 'E shape -> A'],
    },
    application: {
      eyebrow: 'Application',
      body: 'Transposition makes it clear that CAGED is a movable system, not a fixed collection of open chords.',
    },
  },
  'major-scale-caged': {
    concept: {
      eyebrow: 'Concept',
      body: 'The major scale can be visualized inside the five CAGED regions, always organized by the root and by degrees.',
    },
    targets: {
      eyebrow: 'Target notes',
      body: 'Root, third, fifth and seventh help turn scale movement into intentional phrasing.',
    },
    connection: {
      eyebrow: 'Connection',
      body: 'Connect regions through the scale, but keep the chord as the internal harmonic reference.',
    },
  },
  'pentatonics-inside-caged': {
    concept: {
      eyebrow: 'Concept',
      body: 'Pentatonics can be organized through CAGED regions and related directly to the chord underneath.',
    },
    relation: {
      eyebrow: 'Relationship',
      body: 'A pentatonic stops being a loose box when you can see the chord tones inside it.',
    },
    color: {
      eyebrow: 'Blue note',
      body: 'The blue note can be added as expressive color without hiding the main structure.',
    },
  },
  'triads-inside-caged': {
    concept: {
      eyebrow: 'Concept',
      body: 'Small triads reveal the harmonic core of each region and make shapes more musical.',
    },
    sets: {
      eyebrow: 'String sets',
      body: 'Study triads through string sets and inversions to find close voice leading.',
    },
    'voice-leading': {
      eyebrow: 'Voice leading',
      body: 'Connecting triads by nearby notes creates clear harmonic motion without big jumps.',
    },
  },
  'connected-arpeggios': {
    concept: {
      eyebrow: 'Concept',
      body: 'Arpeggios cross shapes and reveal harmonic voice leading between regions.',
    },
    movement: {
      eyebrow: 'Movement',
      body: 'Lines connecting notes help you see the chord as melody in motion.',
    },
    application: {
      eyebrow: 'Application',
      body: 'Play arpeggios to resolve phrases, outline chords and cross the fretboard with control.',
    },
  },
  'caged-improvisation': {
    concept: {
      eyebrow: 'Concept',
      body: 'CAGED is not only for memorizing chords. It is a way to improvise with visual awareness.',
    },
    targets: {
      eyebrow: 'Target notes',
      body: 'Roots, thirds, fifths and sevenths work as safe points for creating phrases.',
    },
    modal: {
      eyebrow: 'Modal connection',
      body: 'A CAGED region can receive pentatonic, major scale, modes and arpeggios according to the musical context.',
    },
  },
  'full-neck-visualization': {
    concept: {
      eyebrow: 'Concept',
      body: 'The final goal is to see the whole fretboard as one continuous system, without depending on one fixed box.',
    },
    'full-neck': {
      eyebrow: 'Full neck',
      body: 'All connected shapes show how chords, arpeggios and scales travel across the instrument.',
    },
    filters: {
      eyebrow: 'Filters',
      body: 'Hide shapes, show roots only, show degrees only or highlight paths according to the study goal.',
    },
  },
};

const getCagedBlockCopy = (moduleId: string, block: CagedBlock, lang: Lang): CagedBlock => (
  lang === 'pt' ? block : { ...block, ...cagedBlockTranslations[moduleId]?.[block.id] }
);

const isOverlayPayload = (payload: unknown): payload is { overlay: CagedOverlay } => {
  return typeof payload === 'object' && payload !== null && 'overlay' in payload;
};

const PanelSurface = ({
  children,
  isLight,
  className = '',
}: {
  children: React.ReactNode;
  isLight: boolean;
  className?: string;
}) => (
  <section
    className={`rounded-2xl border ${
      isLight
        ? 'border-[#c6d3e2] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,248,252,0.9))] shadow-[0_24px_80px_rgba(71,85,105,0.16),inset_0_1px_0_rgba(255,255,255,0.88)]'
        : 'border-blue-900/38 bg-[linear-gradient(145deg,rgba(8,13,22,0.98),rgba(3,7,18,0.94))] shadow-[0_28px_90px_rgba(2,6,23,0.48),inset_0_1px_0_rgba(96,165,250,0.06)]'
    } ${className}`}
  >
    {children}
  </section>
);

const CagedPage: React.FC = () => {
  const [lang, setLang] = useState<Lang>(() => getInitialConfig()?.lang || 'pt');
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialConfig()?.theme || 'dark');
  const [activeModuleId, setActiveModuleId] = useState(CAGED_MODULES[0].id);
  const [activeOverlays, setActiveOverlays] = useState<CagedOverlay[]>(['shape', 'tonic']);
  const isLight = theme === 'light';
  const t = translations[lang].harmonicCycle;
  const copy = cagedCopy[lang];
  const activeModule = useMemo(
    () => CAGED_MODULES.find(module => module.id === activeModuleId) || CAGED_MODULES[0],
    [activeModuleId],
  );
  const activeModuleCopy = getCagedModuleCopy(activeModule, lang);
  const pageBackgroundStyle = isLight
    ? {
      backgroundColor: '#edf3f8',
      backgroundImage: 'linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    }
    : undefined;

  const persistConfigPatch = (patch: Partial<AppState>) => {
    const current = loadConfig();
    if (!current) return;
    saveConfig({ ...current, ...patch });
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = isLight ? 'dark' : 'light';
    setTheme(nextTheme);
    persistConfigPatch({ theme: nextTheme });
  };

  const toggleLang = () => {
    const nextLang: Lang = lang === 'pt' ? 'en' : 'pt';
    setLang(nextLang);
    persistConfigPatch({ lang: nextLang });
  };

  const toggleOverlay = (overlay: CagedOverlay) => {
    setActiveOverlays(prev => prev.includes(overlay) ? prev.filter(item => item !== overlay) : [...prev, overlay]);
  };

  const executeCagedAction = (action: CagedAction, module: CagedModule) => {
    if (action.type === 'toggleOverlay') {
      if (isOverlayPayload(action.payload)) toggleOverlay(action.payload.overlay);
      return;
    }

    if (action.type === 'navigate') {
      const href = typeof action.payload === 'object' && action.payload && 'href' in action.payload
        ? String((action.payload as { href?: string }).href || '/')
        : '/';
      navigateTo(href);
      return;
    }

    const payload = {
      ...(typeof action.payload === 'object' && action.payload ? action.payload : {}),
      moduleTitle: module.title,
      moduleLabel: action.label,
      activeCagedOverlays: activeOverlays,
      createdAt: new Date().toISOString(),
    };

    recordAchievementEvent({ type: 'module_completion', moduleId: 'caged' });
    window.localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(payload));
    navigateTo('/');
  };

  return (
    <div className={`min-h-screen ${isLight ? 'text-zinc-950' : 'blueprint-grid-dark text-zinc-100'}`} style={pageBackgroundStyle}>
      <header className={`border-b px-4 py-4 backdrop-blur-2xl ${isLight ? 'border-[#cbd7e6] bg-[#f6f9fd]/96' : 'border-blue-950/50 bg-zinc-950/92'}`}>
        <div className="mx-auto flex max-w-[1700px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${isLight ? 'text-blue-500' : 'text-blue-300'}`}>Guitar Architect</p>
            <h1 className={`mt-1 text-3xl font-black italic uppercase tracking-tight ${isLight ? 'text-blue-600' : 'bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.18)]'}`}>
              CAGED
            </h1>
            <p className={`mt-2 max-w-3xl text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {copy.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700 hover:bg-zinc-50' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100 hover:bg-[#161d2a]'}`}
              title={isLight ? (lang === 'pt' ? 'Modo Escuro' : 'Dark Mode') : (lang === 'pt' ? 'Modo Claro' : 'Light Mode')}
            >
              {isLight ? <MoonIcon /> : <SunIcon />}
            </button>
            <button onClick={toggleLang} className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase ${isLight ? 'border-[#cbd7e6] bg-white text-zinc-700' : 'border-blue-950/70 bg-[#0e121a] text-zinc-100'}`}>
              {lang === 'pt' ? 'EN' : 'PORT'}
            </button>
            <button onClick={() => navigateTo('/')} className="rounded-xl border border-blue-500/50 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-950/30">
              {t.backToFretboard}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1700px] px-4 py-7">
        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{copy.mapTitle}</p>
                <p className={`mt-2 text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{copy.mapSubtitle}</p>
              </div>
              <span className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-blue-800/60 bg-blue-950/30 text-blue-200'}`}>
                {CAGED_MODULES.length} {copy.modules}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {CAGED_MODULES.map(module => {
                const active = module.id === activeModule.id;
                const moduleCopy = getCagedModuleCopy(module, lang);
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModuleId(module.id)}
                    className={`group w-full rounded-xl border p-4 text-left transition duration-300 hover:-translate-y-0.5 ${
                      active
                        ? 'border-blue-400 bg-[linear-gradient(135deg,rgba(37,99,235,0.98),rgba(14,165,233,0.72))] text-white shadow-[0_18px_42px_rgba(37,99,235,0.26)]'
                        : isLight
                          ? 'border-[#d4deea] bg-white/88 text-slate-900 shadow-[0_10px_32px_rgba(71,85,105,0.08)] hover:border-blue-300'
                          : 'border-blue-950/50 bg-[#080d16]/82 text-slate-100 hover:border-blue-800/80'
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className={`text-[9px] font-black uppercase tracking-[0.16em] ${active ? 'text-blue-100' : 'text-zinc-500'}`}>
                          {String(module.order).padStart(2, '0')} - {module.difficulty ? difficultyLabel[lang][module.difficulty] : copy.study}
                        </span>
                        <h2 className="mt-2 text-base font-black tracking-tight sm:text-lg">{moduleCopy.title}</h2>
                        <p className={`mt-1.5 text-sm font-semibold leading-relaxed ${active ? 'text-blue-100' : isLight ? 'text-slate-500' : 'text-slate-400'}`}>{moduleCopy.subtitle}</p>
                      </div>
                      <span className={`w-fit rounded-full border px-2.5 py-1.5 text-[9px] font-black uppercase ${active ? 'border-white/30 bg-white/14 text-white' : isLight ? lightCategoryClasses[module.category] : categoryClasses[module.category]}`}>
                        {categoryLabels[lang][module.category]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </PanelSurface>

          <PanelSurface isLight={isLight} className="p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{copy.panelTitle}</p>
                <h2 className="mt-4 text-3xl font-black tracking-tight">{activeModuleCopy.title}</h2>
                <p className={`mt-2 text-base font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{activeModuleCopy.subtitle}</p>
              </div>
              <span className={`w-fit rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? lightCategoryClasses[activeModule.category] : categoryClasses[activeModule.category]}`}>
                {categoryLabels[lang][activeModule.category]}
              </span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {activeModule.blocks.map(block => {
                const blockCopy = getCagedBlockCopy(activeModule.id, block, lang);
                return (
                <section key={block.id} className={`rounded-xl border p-5 ${isLight ? 'border-[#d2deeb] bg-white/86' : 'border-blue-950/50 bg-[#080d16]/80'}`}>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300">{blockCopy.eyebrow}</p>
                  {blockCopy.title && <h3 className="mt-2 text-lg font-black">{blockCopy.title}</h3>}
                  <p className={`mt-3 text-sm font-semibold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{blockCopy.body}</p>
                  {blockCopy.examples && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {blockCopy.examples.map(example => (
                        <span key={example} className={`rounded-lg border px-3 py-2 text-xs font-black ${isLight ? 'border-blue-200 bg-white text-blue-700' : 'border-blue-900/50 bg-[#080b11] text-blue-100'}`}>
                          {example}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              )})}
            </div>

            <div className={`mt-6 rounded-xl border p-5 ${isLight ? 'border-[#d3deeb] bg-[#eef4fb]' : 'border-blue-950/60 bg-blue-950/10'}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{copy.overlayTitle}</p>
                  <p className={`mt-2 max-w-2xl text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {copy.overlayBody}
                  </p>
                </div>
                <div className="flex max-w-3xl flex-wrap gap-2">
                  {CAGED_OVERLAYS.map(overlay => {
                    const active = activeOverlays.includes(overlay.id);
                    const overlayCopy = lang === 'pt' ? overlay : { ...overlay, ...overlayTranslations[overlay.id] };
                    return (
                      <button
                        key={overlay.id}
                        onClick={() => toggleOverlay(overlay.id)}
                        className={`rounded-lg border px-3 py-2 text-[9px] font-black uppercase transition ${
                          active
                            ? 'border-blue-400 bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]'
                            : isLight
                              ? 'border-slate-200 bg-white text-slate-500'
                              : 'border-blue-950/60 bg-[#070b12] text-slate-400'
                        }`}
                        title={overlayCopy.description}
                      >
                        {overlayCopy.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`mt-6 rounded-xl border p-5 ${isLight ? 'border-[#d3deeb] bg-[#eef4fb]' : 'border-blue-950/60 bg-blue-950/10'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{copy.actionsTitle}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {activeModule.actions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => executeCagedAction(action, activeModule)}
                    className={`${isLight ? 'border border-blue-400/30 bg-[linear-gradient(180deg,#4f8df3,#2563eb)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_12px_24px_rgba(37,99,235,0.22)]' : 'border border-blue-400/22 bg-[linear-gradient(180deg,#2e6af0,#1d4ed8)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_28px_rgba(15,23,42,0.32)]'} rounded-xl px-4 py-3 text-[10px] font-black uppercase text-white transition hover:-translate-y-0.5`}
                  >
                    {lang === 'pt' ? action.label : cagedActionTranslations[action.id] || action.label}
                  </button>
                ))}
              </div>
            </div>
          </PanelSurface>
        </div>
      </main>
    </div>
  );
};

export default CagedPage;
