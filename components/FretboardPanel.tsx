
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import FretboardInstance from './FretboardInstance';
import { FretboardState, ThemeMode, Project, InstrumentType } from '../types';
import { translations, Lang } from '../i18n';
import { transposeNote, INSTRUMENT_PRESETS } from '../music/musicTheory';
import { 
  saveConfig, 
  loadConfig, 
  getLibrary, 
  saveProjectToLibrary,
  listLocalUsers
} from '../utils/persistence';
import { buildProjectFileName, parseProjectFile, serializeProjectFile } from '../utils/projectFile';
import SupportModal from './SupportModal';
import { BrandAssets, getBrandAssets } from '../utils/brandAssets';
import MyInstruments from './MyInstruments';
import { recordAchievementEvent, recordAppAnniversaryVisit, recordAppLoyaltyVisit } from '../utils/achievementEvents';
import { loadThemeCollectionState, saveThemeCollectionState } from '../features/themeCollection/themeUtils';
import { THEME_REGISTRY } from '../features/themeCollection/themeRegistry';
import type { ThemeCollectionItem } from '../features/themeCollection/themeTypes';
import {
  getAchievementProgressState,
  getSelectedRewardBadgeId,
  getUnlockedAchievementIds,
  mergeAchievementProgressState,
  setSelectedRewardBadgeId,
  unlockAchievement,
} from '../utils/achievementStorage';
import { getAchievementById, getRewardById } from '../utils/achievementUtils';
import { getTierName } from '../utils/tierNomenclature';
import { supabase } from '../src/lib/supabase';
import { migrateLocalIdentityToSupabase, pushLocalSnapshotToSupabase, syncSupabaseSnapshot } from '../src/lib/cloudSync';
import { canUseDisplayName, getDisplayNameError, getSupabaseDisplayName } from '../src/lib/userIdentity';
import { listInstruments, replaceInstruments } from '../utils/instrumentRegistry';
import { PinnedProfileBadges } from './PinnedProfileBadges';
import { isAdminEmail } from '../utils/adminAccess';
import { FretboardInstructionCard, type FretboardInstruction } from './FretboardInstructionCard';

const RETURN_CONTEXT_KEY = 'ga_fretboard_return_context';
const PENDING_FRETBOARD_ACTION_KEY = 'ga_pending_fretboard_action';
const LOCAL_MIGRATION_DEADLINE_PT = '17/06/2026';
const LOCAL_MIGRATION_DEADLINE_EN = 'June 17, 2026';

const themeMatchesInstrument = (theme: ThemeCollectionItem, instrumentType: InstrumentType) => {
  if (theme.instrumentFamily === 'special') return true;
  if (theme.instrumentFamily === 'guitar6') return instrumentType === 'guitar-6';
  if (theme.instrumentFamily === 'guitar7' || theme.instrumentFamily === 'guitar8') {
    return instrumentType === 'guitar-7' || instrumentType === 'guitar-8';
  }
  if (theme.instrumentFamily === 'bass4' || theme.instrumentFamily === 'bass5') {
    return instrumentType === 'bass-4' || instrumentType === 'bass-5';
  }
  return false;
};

interface PendingFretboardAction {
  source: 'harmonic-cycle' | 'study-module';
  action: 'scale' | 'field' | 'triads' | 'progression' | 'openTool' | 'startPractice';
  root?: string;
  displayRoot?: string;
  scaleType?: string;
  progression?: string;
  chords?: string[];
  moduleTitle?: string;
  moduleLabel?: string;
  tool?: 'tuner' | 'metronome' | 'intervals' | 'exercises' | 'changes';
  bpm?: number;
  instruction?: FretboardInstruction;
  harmonyMode?: 'TRIADS' | 'TETRADS';
  chordQuality?: FretboardState['chordQuality'];
  chordDegree?: number;
  inversion?: number;
  voicingMode?: FretboardState['voicingMode'];
  practiceExerciseId?: string;
}

const LogoIcon = ({ brand, variant = 'default' }: { brand: BrandAssets; variant?: 'default' | 'large' | 'footer' }) => {
  const isLarge = variant === 'large';
  const isFooter = variant === 'footer';

  return (
    <div className={`flex items-center justify-center ${isLarge ? 'mb-6' : ''}`}>
      <img 
        src={brand.logo}
        alt={`Guitar Architect Logo - ${brand.label}`} 
        className={`
          object-contain transition-transform hover:scale-110
          ${isLarge ? 'w-24 h-24 md:w-32 md:h-32' : (isFooter ? 'w-8 h-8 md:w-10 md:h-10' : 'w-12 h-12 md:w-16 md:h-16')}
        `}
        style={{ filter: `drop-shadow(0 0 10px ${brand.accentShadow})` }}
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
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const savedTheme = loadConfig()?.theme;
    return savedTheme === 'dark' ? 'dark' : 'light';
  });
  const [lang, setLang] = useState<Lang>('pt');
  const [user, setUser] = useState('');
  const [userLogo, setUserLogo] = useState<string | undefined>(undefined);
  const [defaultInstrument, setDefaultInstrument] = useState<InstrumentType>('guitar-6');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeInstruction, setInstruction] = useState<FretboardInstruction | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [showMobileHint, setShowMobileHint] = useState(true);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showMyInstruments, setShowMyInstruments] = useState(false);
  const instructionTimeoutRef = useRef<number | null>(null);
  const instrumentsSyncTimeoutRef = useRef<number | null>(null);
  const [showTips, setShowTips] = useState(true);
  const [activeInstanceId, setActiveInstanceId] = useState<string | null>(null);

  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [returnContext, setReturnContext] = useState<{ label: string; path: string; source: string } | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [authMessage, setAuthMessage] = useState('');
  const [localUserOptions, setLocalUserOptions] = useState<string[]>([]);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [migrationMessage, setMigrationMessage] = useState('');
  const [allowLocalIdentity, setAllowLocalIdentity] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem('ga_require_account_login') !== '1';
  });
  const initialized = useRef(false);
  const authSessionBooted = useRef(false);
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  const clearInstructionTimeout = useCallback(() => {
    if (instructionTimeoutRef.current) {
      window.clearTimeout(instructionTimeoutRef.current);
      instructionTimeoutRef.current = null;
    }
  }, []);

  const t = translations[lang] || translations['pt'];

const switchUserSession = (newUserId: string, displayName: string) => {

  // ============================
  // 1ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ SALVA SESSÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢O ATUAL
  // ============================

  if (user && initialized.current) {
    const currentUserId = authUser?.id || 'guest';
    const currentProject: Project = {
      id: projectId,
      name: projectName,
      user: currentUserId, // UUID
      lastUpdated: new Date().toISOString(),
      instances,
      globalTransposition: globalTranspose
    };

    saveProjectToLibrary(currentProject, currentUserId);

    saveConfig({
      version: "1.8.7",
      activeProjectId: projectId,
      theme,
      lang,
        currentUser: currentUserId,
      userLogo,
      defaultInstrument,
      showTips
      }, currentUserId);
    }

  // ============================
  // 2ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ LIMPA WORKSPACE (CRÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂTICO)
  // ============================

  setInstances([]);
  setProjectName('Novo Projeto');
  setProjectId(crypto.randomUUID());
  setGlobalTranspose(0);

  // RESET DE IDENTIDADE (CRÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂTICO)
  // Limpa logos, instruÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes, contextos de retorno e estados transitÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³rios
  setUserLogo(undefined);
  setInstruction(null);
  setReturnContext(null);

  // ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â forÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§a novo ciclo de boot
  initialized.current = false;

  // ============================
  // 3ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ DEFINE NOVO USUÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂRIO
  // ============================

  setUser(displayName);

  // ============================
  // 4ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ BOOT NOVA SESSÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢O
  // ============================

  // Carrega configuraÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o especÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­fica do usuÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡rio (UUID-scoped)
  const userSpecificConfig = loadConfig(newUserId);
  if (userSpecificConfig) {
    setTheme(userSpecificConfig.theme || 'light');
    setLang(userSpecificConfig.lang || 'pt');
    setShowTips(userSpecificConfig.showTips ?? true);
    setDefaultInstrument(userSpecificConfig.defaultInstrument || 'guitar-6');
    setUserLogo(userSpecificConfig.userLogo);
  }

  const library = getLibrary(newUserId);

  const userProjects = library
    .filter(p => p.user === newUserId)
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

    // usuÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡rio novo ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ workspace limpo
    setInstances([
        DEFAULT_FRETBOARD(userSpecificConfig?.lang || lang, userSpecificConfig?.defaultInstrument || 'guitar-6')
    ]);
  }

  initialized.current = true;
};

const handleSupabaseAuth = async () => {
  const email = authEmail.trim();
  const password = authPassword.trim();

  if (!email || !password) {
    setAuthStatus('error');
    setAuthMessage(lang === 'pt' ? 'Informe e-mail e senha.' : 'Enter e-mail and password.');
    return;
  }

  setAuthStatus('loading');
  setAuthMessage('');

  const requestedName = user.trim();
  if (requestedName && !canUseDisplayName(requestedName, email)) {
    setAuthStatus('error');
    setAuthMessage(getDisplayNameError(lang));
    return;
  }

  const result = authMode === 'signup'
    ? await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name: user.trim() || email.split('@')[0],
          },
        },
      })
    : await supabase.auth.signInWithPassword({ email, password });

  if (result.error) {
    setAuthStatus('error');
    setAuthMessage(result.error.message);
    return;
  }

  if (result.data.user) {
    const identity = getSupabaseDisplayName(result.data.user);
    setAuthUser(result.data.user);
      setUser(identity); // Display Name para UI
    authSessionBooted.current = true;
      switchUserSession(result.data.user.id, identity);
    void syncSupabaseSnapshot(result.data.user.id, result.data.user.id);
  }

  setAuthStatus('success');
  setAuthMessage(
    authMode === 'signup' && !result.data.session
      ? (lang === 'pt' ? 'Conta criada. Verifique seu e-mail para confirmar o acesso.' : 'Account created. Check your e-mail to confirm access.')
      : (lang === 'pt' ? 'Acesso confirmado.' : 'Access confirmed.')
  );

  if (result.data.session) {
    setShowLoginModal(false);
  }
};

const handleGoogleAuth = async () => {
  setAuthStatus('loading');
  setAuthMessage('');

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    setAuthStatus('error');
    setAuthMessage(error.message);
  }
};

const refreshLocalUserOptions = useCallback((currentIdentity = user) => {
  const options = listLocalUsers().filter(localUser => (
    localUser &&
    localUser !== currentIdentity &&
    localUser !== authUser?.email
  ));
  setLocalUserOptions(options);
}, [authUser?.email, user]);

const handleMigrateLocalIdentity = async (sourceIdentity: string) => {
  if (!authUser || !user) return;

  setMigrationStatus('loading');
  setMigrationMessage('');

  const result = await migrateLocalIdentityToSupabase(authUser.id, authUser.id, sourceIdentity);

  if (!result.ok) {
    setMigrationStatus('error');
    const errorMessage = result.error?.message
      ? `${result.error.message}${result.error.code ? ` (${result.error.code})` : ''}`
      : '';
    setMigrationMessage(
      lang === 'pt'
        ? `NÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o foi possÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­vel sincronizar agora.${errorMessage ? ` Detalhe: ${errorMessage}` : ' Tente novamente em instantes.'}`
        : `Could not sync right now.${errorMessage ? ` Detail: ${errorMessage}` : ' Try again shortly.'}`,
    );
    return;
  }

  setMigrationStatus('success');
  const summary = result.summary;
  setMigrationMessage(
    lang === 'pt'
      ? `Dados de ${sourceIdentity} migrados: ${summary?.projects ?? 0} projetos, ${summary?.instruments ?? 0} instrumentos, ${summary?.achievements ?? 0} conquistas e ${summary?.unlockedThemes ?? 0} temas.`
      : `${sourceIdentity} data migrated: ${summary?.projects ?? 0} projects, ${summary?.instruments ?? 0} instruments, ${summary?.achievements ?? 0} achievements and ${summary?.unlockedThemes ?? 0} themes.`,
  );
  refreshLocalUserOptions(user);
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
    // Manter o idioma acessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­vel globalmente para o SVG
    (window as any).ga_lang = lang;
  }, [lang]);

  useEffect(() => {
    recordAppLoyaltyVisit();
  }, []);

  useEffect(() => {
    if (!showLoginModal) return;
    refreshLocalUserOptions();
  }, [refreshLocalUserOptions, showLoginModal]);

  useEffect(() => {
  const handleResize = () => {
    const isTouchLayout =
      window.matchMedia?.('(pointer: coarse)').matches &&
      window.innerWidth < 1200;

    setIsSmallScreen(
      window.innerWidth < 1024 || isTouchLayout
    );
  };

  handleResize();

  window.addEventListener('resize', handleResize);

  return () => {
    clearInstructionTimeout();
    window.removeEventListener('resize', handleResize);
  };
}, [clearInstructionTimeout]);

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

    const rawReturn = window.localStorage.getItem(RETURN_CONTEXT_KEY);
    if (rawReturn) {
      try {
        const parsed = JSON.parse(rawReturn);
        if (parsed.path && (parsed.source === 'learn' || parsed.source === 'practice')) {
          setReturnContext(parsed);
        }
      } catch (e) {
        window.localStorage.removeItem(RETURN_CONTEXT_KEY);
      }
    }

    const config = loadConfig();
    const requiresAccountLogin =
      typeof window !== 'undefined' &&
      window.localStorage.getItem('ga_require_account_login') === '1';

    if (requiresAccountLogin) {
      if (config) {
        setTheme(config.theme || 'light');
        setLang((config.lang as Lang) || 'pt');
        setShowTips(config.showTips ?? true);
        setDefaultInstrument(config.defaultInstrument || 'guitar-6');
      }

      setAuthUser(null);
      setAuthEmail('');
      setAllowLocalIdentity(true);
      setUser('');
      setUserLogo(undefined);
      setInstances([DEFAULT_FRETBOARD((config?.lang as Lang) || 'pt', config?.defaultInstrument || 'guitar-6')]);
      setProjectName('Novo Projeto');
      setProjectId(crypto.randomUUID());
      setGlobalTranspose(0);
      setShowLoginModal(false);
      initialized.current = true;
      return;
    }

    const library = getLibrary(config?.currentUser || '');

    if (config) {

      setTheme(config.theme || 'light');
      setLang((config.lang as Lang) || 'pt');
      setUser(config.currentUser || '');
      setUserLogo(config.userLogo);
      setShowTips(config.showTips ?? true);

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
    }

    initialized.current = true;
  }
}, []);

useEffect(() => {
  let isMounted = true;

  supabase.auth.getUser().then(({ data }) => {
    if (!isMounted || !data.user) return;

    const identity = getSupabaseDisplayName(data.user);
    setAuthUser(data.user);
    setAuthEmail(data.user.email || '');
    setAllowLocalIdentity(true);
    window.localStorage.removeItem('ga_require_account_login');

    if (!authSessionBooted.current) {
      authSessionBooted.current = true;
        switchUserSession(data.user.id, identity);
      recordAppLoyaltyVisit(new Date(), identity);
      recordAppAnniversaryVisit(new Date(), data.user.created_at, identity);
      void syncSupabaseSnapshot(data.user.id, data.user.id);
      setShowLoginModal(false);
    }
  });

  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    if (!isMounted) return;

    if (event === 'SIGNED_IN' && session?.user) {
      const identity = getSupabaseDisplayName(session.user);
      setAuthUser(session.user);
      setAuthEmail(session.user.email || '');
      setAllowLocalIdentity(true);
      window.localStorage.removeItem('ga_require_account_login');

      if (!authSessionBooted.current) {
        authSessionBooted.current = true;
        switchUserSession(session.user.id, identity);
        recordAppLoyaltyVisit(new Date(), identity);
        recordAppAnniversaryVisit(new Date(), session.user.created_at, identity);
        void syncSupabaseSnapshot(session.user.id, session.user.id);
      }

      setShowLoginModal(false);
    }

    if (event === 'SIGNED_OUT') {
      setAuthUser(null);
      setAllowLocalIdentity(false);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ga_require_account_login', '1');
      }
      authSessionBooted.current = false;
    }
  });

  return () => {
    isMounted = false;
    listener.subscription.unsubscribe();
  };
}, []);


useEffect(() => {
  if (initialized.current && !isExporting) {
    setSaveStatus('saving');

    const timer = setTimeout(() => {
      const currentUserId = authUser?.id || 'guest';
      const currentProject: Project = {
        id: projectId,
        name: projectName,
        user: currentUserId, // UUID
        lastUpdated: new Date().toISOString(),
        instances: instances,
        globalTransposition: globalTranspose
      };

      saveProjectToLibrary(currentProject, currentUserId);

      saveConfig({
        version: "1.8.7",
        activeProjectId: projectId,
        theme,
        lang,
        currentUser: currentUserId,
        userLogo: userLogo,
        defaultInstrument,
        showTips,
      }, currentUserId);

      if (authUser?.id) {
        void pushLocalSnapshotToSupabase(authUser.id, authUser.id);
      }

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
  showTips,
  isExporting,
  authUser,
  globalTranspose,
  defaultInstrument
]);

const handleLogout = async () => {
  console.log('[Auth Trace] Fretboard handleLogout iniciado');
  if (authUser) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth Trace] signOut retornou erro:', error);
      return;
    }
    console.log('[Auth Trace] signOut concluÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­do com sucesso');
  } else {
    console.log('[Auth Trace] handleLogout sem authUser ativo.');
  }

  setAuthUser(null);
  setAllowLocalIdentity(true);
  setUser('');
  setAuthEmail('');
  authSessionBooted.current = false;
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('ga_require_account_login');
  }
};

const handleReturnToContext = () => {
  if (!returnContext) return;
  const targetPath = returnContext.path;
  window.localStorage.removeItem(RETURN_CONTEXT_KEY);
  setReturnContext(null);
  window.history.pushState(null, '', targetPath);
  window.dispatchEvent(new Event('ga-route-change'));
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

  const exportProjectFile = async () => {
    const currentUserId = authUser?.id || 'guest';
    const instruments = await listInstruments(currentUserId).catch(() => []);
    const payload = serializeProjectFile({
      projectId,
      projectName,
      user,
      instances,
      globalTranspose,
      theme,
      lang,
      defaultInstrument,
      userLogo,
      showTips,
      themeCollection: loadThemeCollectionState(),
      achievements: {
        unlockedAchievementIds: getUnlockedAchievementIds(currentUserId),
        progress: getAchievementProgressState(currentUserId),
        selectedRewardBadgeId: getSelectedRewardBadgeId(currentUserId),
      },
      instruments,
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = buildProjectFileName(projectName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    recordAchievementEvent({ type: 'export_diagram', format: 'json' });
    setShowProjectMenu(false);
  };

  const importProjectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      alert(lang === 'pt' ? 'Selecione um arquivo .json valido.' : 'Select a valid .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = parseProjectFile(String(reader.result || ''));
        const confirmMsg = lang === 'pt'
          ? 'Importar este projeto substituira o projeto aberto agora. Continuar?'
          : 'Importing this project will replace the currently open project. Continue?';

        if (!window.confirm(confirmMsg)) return;

        const importUserId = authUser?.id || payload.project.user || 'guest';
        const importDisplayName = authUser ? getSupabaseDisplayName(authUser) : (payload.project.user || user);
        setProjectId(payload.project.id || crypto.randomUUID());
        setProjectName(payload.project.name || (lang === 'pt' ? 'Projeto Importado' : 'Imported Project'));
        setUser(importDisplayName);
        setInstances(payload.project.instances);
        setGlobalTranspose(payload.project.globalTransposition || 0);
        setTheme(payload.settings.theme || theme);
        setLang(payload.settings.lang || lang);
        setDefaultInstrument(payload.settings.defaultInstrument || payload.project.instances[0]?.instrumentType || defaultInstrument);
        if (payload.settings.userLogo !== undefined) {
          setUserLogo(payload.settings.userLogo);
        }
        setShowTips(payload.settings.showTips ?? true);
        if (payload.settings.themeCollection) {
          const currentCollection = loadThemeCollectionState();
          const unlockedThemeIds = Array.from(new Set([
            ...currentCollection.unlockedThemeIds,
            ...payload.settings.themeCollection.unlockedThemeIds,
          ]));
          saveThemeCollectionState({
            activeThemeId: unlockedThemeIds.includes(payload.settings.themeCollection.activeThemeId)
              ? payload.settings.themeCollection.activeThemeId
              : currentCollection.activeThemeId,
            unlockedThemeIds,
          });
        }
        payload.settings.achievements?.unlockedAchievementIds?.forEach(id => {
          if (getAchievementById(id)?.asset.status === 'ready') unlockAchievement(id, importUserId);
        });
        if (payload.settings.achievements?.progress) {
          mergeAchievementProgressState(payload.settings.achievements.progress, importUserId);
        }
        if (payload.settings.achievements?.selectedRewardBadgeId && getRewardById(payload.settings.achievements.selectedRewardBadgeId)?.asset.status === 'ready') {
          setSelectedRewardBadgeId(payload.settings.achievements.selectedRewardBadgeId, importUserId);
        }
        if (payload.instruments && payload.instruments.length > 0) {
          void replaceInstruments(payload.instruments, importUserId);
        }
        setSaveStatus('saving');
        setShowProjectMenu(false);
      } catch {
        alert(lang === 'pt' ? 'Arquivo de projeto invalido.' : 'Invalid project file.');
      }
    };
    reader.readAsText(file);
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
      ? "LIMPAR PROJETO INTEIRO?\n\nIsso excluirÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ todos os diagramas." 
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
    const { exportToPNG } = await import('../utils/export');
    await exportToPNG(lang, user, userLogo, primaryInstrument);
    recordAchievementEvent({ type: 'export_diagram', format: 'png' });
    setIsExporting(false);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 50));
    const { exportToPDF } = await import('../utils/export');
    await exportToPDF(lang, user, userLogo, primaryInstrument);
    recordAchievementEvent({ type: 'export_diagram', format: 'pdf' });
    setIsExporting(false);
  };

  const isLight = theme === 'light';
  const userLibrary = getLibrary(authUser?.id || 'guest');
  const activeInstanceIndex = Math.max(0, instances.findIndex(instance => instance.id === activeInstanceId));
  const activeInstance = instances[activeInstanceIndex] || instances[0];
  const primaryInstrument = activeInstance?.instrumentType || defaultInstrument;
  const primaryLeftHanded = activeInstance?.isLeftHanded || false;
  const isBassInstrument = primaryInstrument.startsWith('bass');
  const isExtendedGuitar = primaryInstrument.startsWith('guitar') && primaryInstrument !== 'guitar-6';
  const titleColorClass = isBassInstrument
    ? isLight
      ? 'text-emerald-600'
      : 'bg-gradient-to-r from-emerald-200 via-green-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(16,185,129,0.18)]'
    : isExtendedGuitar
      ? isLight
        ? 'text-violet-600'
        : 'bg-gradient-to-r from-violet-200 via-purple-500 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(168,85,247,0.20)]'
      : isLight
        ? 'text-blue-600'
        : 'bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.18)]';
  const brandAssets = getBrandAssets(primaryInstrument);
  const themeCollectionState = loadThemeCollectionState();
  const activeCollectionTheme = THEME_REGISTRY.find(item =>
    item.id === themeCollectionState.activeThemeId &&
    (item.unlocked || themeCollectionState.unlockedThemeIds.includes(item.id)) &&
    themeMatchesInstrument(item, primaryInstrument)
  );
  const displayedBrandAssets: BrandAssets = activeCollectionTheme?.image
    ? {
      ...brandAssets,
      logo: activeCollectionTheme.image,
      hero: activeCollectionTheme.image,
      label: activeCollectionTheme.name,
      accentShadow: activeCollectionTheme.glowColor || brandAssets.accentShadow,
    }
    : brandAssets;

  const isGuestMode = !authUser && !user;

  const currentUserTier = useMemo(() => {
    if (!user) return 0;
    const unlocked = getUnlockedAchievementIds(user);
    const tiers = unlocked
      .map(id => getAchievementById(id)?.tier)
      .filter((tier): tier is 0 | 1 | 2 | 3 | 4 | 5 | 6 => typeof tier === 'number');
    return tiers.length ? Math.max(...tiers) as 0 | 1 | 2 | 3 | 4 | 5 | 6 : 0;
  }, [user]);
  const currentUserTierName = getTierName(currentUserTier, lang);
  const updatePrimaryInstrument = (instrumentType: InstrumentType) => {
    const instrument = INSTRUMENT_PRESETS[instrumentType];
    const instrumentFamily = instrumentType.startsWith('bass')
      ? 'bass'
      : instrumentType === 'guitar-6'
        ? 'guitar'
        : 'extended_guitar';
    recordAchievementEvent({ type: 'instrument_switch', instrumentFamily });
    setDefaultInstrument(instrumentType);
    setInstances(prev => prev.map((instance, index) => index === activeInstanceIndex ? {
      ...instance,
      instrumentType,
      tuning: 'Standard',
      stringStatuses: Array(instrument.strings).fill('normal')
    } : instance));
  };
  const togglePrimaryLeftHanded = () => {
    setInstances(prev => prev.map((instance, index) => index === activeInstanceIndex ? {
      ...instance,
      isLeftHanded: !instance.isLeftHanded
    } : instance));
  };
  const openHarmonicCycle = useCallback(() => {
    saveConfig({
      version: "1.8.7",
      activeProjectId: projectId,
      theme,
      lang,
      currentUser: user,
      userLogo,
      defaultInstrument,
      showTips
    });
    setShowProjectMenu(false);
    window.history.pushState(null, '', '/harmonic-cycle');
    window.dispatchEvent(new Event('ga-route-change'));
  }, [defaultInstrument, lang, projectId, showTips, theme, user, userLogo]);

  const handleInstrumentsChanged = useCallback(() => {
    if (!authUser?.id) return;
    if (instrumentsSyncTimeoutRef.current) {
      window.clearTimeout(instrumentsSyncTimeoutRef.current);
    }
    instrumentsSyncTimeoutRef.current = window.setTimeout(() => {
      void pushLocalSnapshotToSupabase(authUser.id, authUser.id);
      instrumentsSyncTimeoutRef.current = null;
    }, 350);
  }, [authUser?.id]);

  useEffect(() => {
    return () => {
      if (instrumentsSyncTimeoutRef.current) {
        window.clearTimeout(instrumentsSyncTimeoutRef.current);
      }
    };
  }, []);
  const openModulePage = useCallback((path: string) => {
    saveConfig({
      version: "1.8.7",
      activeProjectId: projectId,
      theme,
      lang,
      currentUser: user,
      userLogo,
      defaultInstrument,
      showTips
    });
    setShowProjectMenu(false);
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event('ga-route-change'));
  }, [defaultInstrument, lang, projectId, showTips, theme, user, userLogo]);
  const openMyInstruments = useCallback(() => {
    setShowMyInstruments(true);
    setShowProjectMenu(false);
    if (typeof window !== 'undefined' && window.location.hash !== '#meus-instrumentos') {
      window.history.pushState(null, '', '#meus-instrumentos');
    }
  }, []);
  const closeMyInstruments = useCallback(() => {
    setShowMyInstruments(false);
    if (typeof window !== 'undefined' && window.location.hash === '#meus-instrumentos') {
      window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }, []);
  const openMetronomeTool = useCallback(() => {
    recordAchievementEvent({ type: 'exploration', key: 'open_metronome' });
    window.dispatchEvent(new CustomEvent('ga-open-diagram-panel', { detail: { tab: 'tools', tool: 'metronome' } }));
  }, []);
  const openTunerTool = useCallback(() => {
    window.dispatchEvent(new CustomEvent('ga-open-diagram-panel', { detail: { tab: 'tools', tool: 'tuner' } }));
  }, []);

  useEffect(() => {
    if (!activeInstanceId && instances[0]) {
      setActiveInstanceId(instances[0].id);
    } else if (activeInstanceId && instances.length > 0 && !instances.some(instance => instance.id === activeInstanceId)) {
      setActiveInstanceId(instances[0].id);
    }
  }, [activeInstanceId, instances]);

  useEffect(() => {
    if (!initialized.current) return;
    const rawAction = window.localStorage.getItem(PENDING_FRETBOARD_ACTION_KEY);
    if (!rawAction) return;

    let pending: PendingFretboardAction | null = null;
    try {
      pending = JSON.parse(rawAction) as PendingFretboardAction;
    } catch {
      window.localStorage.removeItem(PENDING_FRETBOARD_ACTION_KEY);
      return;
    }

    if (!pending || (pending.source !== 'harmonic-cycle' && pending.source !== 'study-module')) {
      window.localStorage.removeItem(PENDING_FRETBOARD_ACTION_KEY);
      return;
    }

    window.localStorage.removeItem(PENDING_FRETBOARD_ACTION_KEY);

    if (pending.action === 'scale') {
      recordAchievementEvent({ type: 'exploration', key: 'apply_scale' });
    }
    if (pending.source === 'harmonic-cycle' && pending.action === 'progression') {
      recordAchievementEvent({ type: 'exploration', key: 'harmonic_cycle_progression' });
    }
    if (pending.tool === 'metronome') {
      recordAchievementEvent({ type: 'exploration', key: 'open_metronome' });
    }
    if (pending.action === 'openTool') {
      if (pending.tool) {
        window.setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ga-open-diagram-panel', { detail: { tab: 'tools', tool: pending?.tool } }));
        }, 120);
      }
      return;
    }

    if (pending.instruction) {
      clearInstructionTimeout();
      setInstruction(pending.instruction);
      

      if (pending.instruction.durationMs && !pending.instruction.persistent) {
        instructionTimeoutRef.current = window.setTimeout(() => setInstruction(null), pending.instruction.durationMs);
      }
    }

    const applyToDiagram = (instance: FretboardState): FretboardState => {
      const isHarmonyAction = pending.action === 'field' || pending.action === 'triads' || pending.action === 'progression';
      const isScaleAction = pending.action === 'scale' || pending.action === 'startPractice';
      const nextRoot = pending.root || instance.root;
      const nextScaleType = pending.scaleType || instance.scaleType;
      return {
        ...instance,
        id: instance.id || crypto.randomUUID(),
        title: pending.action === 'progression' && pending.progression
          ? `${pending.displayRoot || nextRoot} - ${pending.progression}`
          : `${pending.displayRoot || nextRoot} - ${nextScaleType}`,
        subtitle: pending.chords?.length ? pending.chords.join(' - ') : nextScaleType,
        notes: pending.action === 'progression' && pending.chords?.length
          ? `${pending.progression}: ${pending.chords.join(' - ')}`
          : pending.action === 'field' && pending.chords?.length
            ? `${pending.displayRoot || nextRoot}: ${pending.chords.join(' - ')}`
          : pending.moduleTitle
            ? `${pending.moduleTitle}: ${pending.moduleLabel || nextScaleType}`
          : instance.notes,
        root: nextRoot,
        scaleType: nextScaleType,
        harmonyMode: pending.harmonyMode || (pending.action === 'field' || pending.action === 'progression' ? 'TETRADS' : isHarmonyAction ? 'TRIADS' : 'OFF'),
        chordQuality: pending.chordQuality || 'DIATONIC',
        chordDegree: pending.chordDegree ?? 0,
        inversion: pending.inversion ?? 0,
        voicingMode: pending.voicingMode || instance.voicingMode,
        layers: {
          ...instance.layers,
          showScale: isScaleAction,
          showTonic: true,
        },
      };
    };

    setInstances(prev => {
      const base = activeInstanceIndex >= 0 ? prev[activeInstanceIndex] : prev[0];
      const created = applyToDiagram({
        ...(base || DEFAULT_FRETBOARD(lang, defaultInstrument)),
        id: crypto.randomUUID(),
      });
      if (prev.length >= 24) {
        const canOverwrite = window.confirm(
          lang === 'pt'
            ? 'VocÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª atingiu o limite de 24 diagramas. Posso substituir o ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºltimo diagrama para abrir esta tarefa?'
            : 'You reached the 24 diagram limit. Can I replace the last diagram to open this task?',
        );
        if (!canOverwrite) {
          window.alert(lang === 'pt' ? 'NÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o foi possÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­vel abrir a tarefa sem substituir um diagrama.' : 'The task could not be opened without replacing a diagram.');
          return prev;
        }
        setActiveInstanceId(created.id);
        return prev.map((instance, index) => index === prev.length - 1 ? created : instance);
      }

      if (prev.length === 0) {
        setActiveInstanceId(created.id);
        return [created];
      }

      setActiveInstanceId(created.id);
      return [...prev, created];
    });

    const targetTab = (pending as any).quickTab || (pending as any).tab || (
      (pending.action === 'field' || pending.action === 'triads' || pending.action === 'progression' || pending.harmonyMode) ? 'harmony' :
      pending.action === 'scale' ? 'scale' :
      (pending.action === 'startPractice' || pending.tool) ? 'tools' :
      'visual'
    );

    const eventName = (targetTab === 'tools' || targetTab === 'chords')
      ? 'ga-open-diagram-panel'
      : 'ga-open-quick-tab';

    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(eventName, { 
        detail: { 
          tab: targetTab, 
          tool: eventName === 'ga-open-diagram-panel' 
            ? (pending.tool || 'exercises') 
            : undefined 
        } 
      }));
    }, 160);

    setSaveStatus('saving');
  }, [activeInstanceIndex, defaultInstrument, lang]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncInstrumentRoute = () => {
      setShowMyInstruments(window.location.hash === '#meus-instrumentos');
    };

    syncInstrumentRoute();
    window.addEventListener('hashchange', syncInstrumentRoute);
    window.addEventListener('popstate', syncInstrumentRoute);
    return () => {
      window.removeEventListener('hashchange', syncInstrumentRoute);
      window.removeEventListener('popstate', syncInstrumentRoute);
    };
  }, []);

  const headerButtonBaseClass = 'rounded-xl border transition-all duration-200 ai-glow font-black uppercase backdrop-blur-[2px] active:scale-[0.98]';
  const headerButtonThemeClass = isLight
    ? 'bg-white/90 border-zinc-300 text-zinc-800 hover:bg-white hover:border-zinc-400 hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)]'
    : 'bg-zinc-900/60 border-zinc-600 text-zinc-100 hover:bg-zinc-800/85 hover:border-zinc-400 hover:shadow-[0_12px_26px_rgba(2,6,23,0.55)]';
  const headerActionButtonThemeClass = isLight
    ? 'bg-white border-zinc-300 text-zinc-800 hover:bg-white hover:border-zinc-500 hover:shadow-[0_12px_24px_rgba(15,23,42,0.16)]'
    : 'bg-zinc-800/90 border-zinc-600 text-zinc-100 hover:bg-zinc-700 hover:border-zinc-300 hover:shadow-[0_14px_28px_rgba(0,0,0,0.55)]';

  return (
    <div className={`min-h-screen transition-all ${isExporting ? 'is-exporting-mode' : (isLight ? 'blueprint-grid-light' : 'blueprint-grid-dark')}`}>
      <input
        ref={projectFileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={importProjectFile}
        className="hidden"
      />
      
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
      ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â½ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ Otimizado para desktop. Use paisagem para melhor experiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âªncia.
    </span>

    <button
      onClick={() => setShowMobileHint(false)}
      className="bg-white/20 hover:bg-white/40 px-2 py-0.5 rounded-md transition-colors"
    >
      ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢
    </button>
  </div>
)}


      {isSmallScreen && !isExporting && (
        <div className={`fixed top-0 left-0 w-full z-50 border-b px-3 py-2 backdrop-blur-2xl ${isLight ? 'bg-white/95 border-zinc-200 shadow-sm' : 'bg-zinc-950/95 border-zinc-800'}`}>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('ga-close-diagram-panels'));
                setShowProjectMenu(prev => !prev);
              }}
              className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-900 border-zinc-700 text-zinc-100'}`}
              aria-label="Menu"
            >
              MENU
            </button>
            <button
              onClick={() => {
                if (authUser) {
                  void handleLogout();
                } else {
                  setShowLoginModal(true);
                }
              }}
              className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'bg-white border-zinc-300 text-zinc-700' : 'bg-zinc-900 border-zinc-700 text-zinc-100'}`}
              aria-label={authUser ? (lang === 'pt' ? 'Sair da conta' : 'Log out') : (lang === 'pt' ? 'Entrar na conta' : 'Sign in')}
              title={authUser ? (lang === 'pt' ? 'Sair da conta' : 'Log out') : (lang === 'pt' ? 'Entrar na conta' : 'Sign in')}
            >
              {authUser ? (lang === 'pt' ? 'Sair' : 'Exit') : (lang === 'pt' ? 'Entrar' : 'Sign in')}
            </button>

            <div className="min-w-0 flex-1 text-center">
              <div className="truncate text-[12px] font-black italic uppercase tracking-tight text-blue-600">Guitar Architect</div>
              <input
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                maxLength={28}
                className={`mx-auto block w-full max-w-[150px] truncate bg-transparent text-center text-[9px] font-black uppercase focus:outline-none ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}
                placeholder={t.projectName}
                aria-label={lang === 'pt' ? 'Nome do projeto' : 'Project name'}
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme(isLight ? 'dark' : 'light')}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isLight ? 'bg-white border-zinc-300 text-zinc-700' : 'bg-zinc-900 border-zinc-700 text-zinc-100'}`}
                aria-label={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
                title={isLight ? (lang === 'pt' ? 'Modo escuro' : 'Dark mode') : (lang === 'pt' ? 'Modo claro' : 'Light mode')}
              >
                {isLight ? <MoonIcon /> : <SunIcon />}
              </button>
	              <button
	                onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
	                className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-2 text-[10px] font-black uppercase ${isLight ? 'bg-white border-zinc-300 text-zinc-700' : 'bg-zinc-900 border-zinc-700 text-zinc-100'}`}
                aria-label={lang === 'pt' ? 'Switch to English' : 'Mudar para portuguÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âªs'}
                title={lang === 'pt' ? 'English' : 'PortuguÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âªs'}
	              >
	                {lang === 'pt' ? 'EN' : 'PORT'}
	              </button>
	              <button
	                onClick={openHarmonicCycle}
	                className={`flex h-10 items-center justify-center rounded-xl border px-2.5 text-[10px] font-black uppercase ${isLight ? 'bg-white border-zinc-300 text-zinc-700' : 'bg-zinc-900 border-zinc-700 text-zinc-100'}`}
	                aria-label={translations[lang].harmonicCycle.menu}
	                title={translations[lang].harmonicCycle.menu}
	              >
	                {lang === 'pt' ? 'Ciclo' : 'Cycle'}
	              </button>
	              <button
                  onClick={openMetronomeTool}
                className={`rounded-xl border px-2.5 py-2 text-[10px] font-black uppercase ${isLight ? 'bg-white border-zinc-300 text-zinc-700' : 'bg-zinc-900 border-zinc-700 text-zinc-100'}`}
                aria-label={lang === 'pt' ? 'Abrir metrônomo e ferramentas' : 'Open metronome and tools'}
                title={lang === 'pt' ? 'Metrônomo' : 'Metronome'}
              >
                BPM
              </button>
              <button
                onClick={openTunerTool}
                className={`rounded-xl border px-2.5 py-2 text-[10px] font-black uppercase ${isLight ? 'bg-white border-zinc-300 text-zinc-700' : 'bg-zinc-900 border-zinc-700 text-zinc-100'}`}
                aria-label={lang === 'pt' ? 'Abrir afinador' : 'Open tuner'}
                title={lang === 'pt' ? 'Afinador' : 'Tuner'}
              >
                AFIN
              </button>
            </div>
          </div>

          {showProjectMenu && (
            <div className={`absolute left-3 right-3 top-full mt-2 max-h-[calc(100vh-92px)] overflow-y-auto rounded-2xl border p-3 shadow-2xl ring-1 ${isLight ? 'bg-[linear-gradient(160deg,#fbfdff_0%,#eef5fb_58%,#e8f0f8_100%)] border-[#aebed1] shadow-[0_24px_80px_rgba(71,85,105,0.24)] ring-white/80' : 'bg-[linear-gradient(160deg,#172033_0%,#111827_52%,#0c1322_100%)] border-blue-800/60 shadow-[0_30px_95px_rgba(0,0,0,0.72)] ring-white/5'}`}>
              <button onClick={() => { setShowLoadModal(true); setShowProjectMenu(false); }} className={`mb-2 w-full rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase ${isLight ? 'border-zinc-200 text-zinc-700' : 'border-zinc-700 text-zinc-200'}`}>
                {lang === 'pt' ? 'Carregar projetos locais' : 'Load local projects'}
              </button>
              <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { void exportProjectFile(); setShowProjectMenu(false); }} className={`rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase ${isLight ? 'border-zinc-200 text-zinc-700' : 'border-zinc-700 text-zinc-200'}`}>
                  {lang === 'pt' ? 'Exportar JSON' : 'Export JSON'}
                </button>
                <button onClick={() => { setShowProjectMenu(false); projectFileInputRef.current?.click(); }} className={`rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase ${isLight ? 'border-zinc-200 text-zinc-700' : 'border-zinc-700 text-zinc-200'}`}>
                  {lang === 'pt' ? 'Importar JSON' : 'Import JSON'}
                </button>
              </div>
              <button onClick={() => openModulePage('/profile')} className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase ${isLight ? 'border-zinc-200 text-zinc-700' : 'border-zinc-700 text-zinc-200'}`}>
                {lang === 'pt' ? 'Perfil' : 'Profile'}
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button onClick={openMyInstruments} className={`rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase ${isLight ? 'border-zinc-200 text-zinc-700' : 'border-zinc-700 text-zinc-200'}`}>
                  {lang === 'pt' ? 'Instrumentos' : 'Instruments'}
                </button>
                <button onClick={() => openModulePage('/theme-collection')} className={`rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase ${isLight ? 'border-zinc-200 text-zinc-700' : 'border-zinc-700 text-zinc-200'}`}>
                  {lang === 'pt' ? 'Coleções' : 'Collections'}
                </button>
              </div>
              <button
                onClick={() => {
                  refreshLocalUserOptions();
                  setShowLoginModal(true);
                  setShowProjectMenu(false);
                }}
                className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase ${isLight ? 'border-emerald-200 text-emerald-700' : 'border-emerald-900/60 text-emerald-200'}`}
              >
                {lang === 'pt' ? 'Migrar dados locais' : 'Migrate local data'}
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { label: lang === 'pt' ? 'Ecossistema' : 'Ecosystem', path: '/ecosystem', wide: true },
                  { label: lang === 'pt' ? 'Aprender' : 'Learn', path: '/learn' },
                  { label: lang === 'pt' ? 'Praticar' : 'Practice', path: '/practice' },
                  { label: lang === 'pt' ? 'Acordes' : 'Chords', path: '/chords' },
                  { label: 'CAGED', path: '/caged' },
                  { label: 'Tri/Tetrad', path: '/triads-tetrads' },
                  { label: lang === 'pt' ? 'Modos' : 'Modes', path: '/greek-modes' },
                  { label: translations[lang].harmonicCycle.menu, path: 'harmonic-cycle', wide: true },
                  { label: lang === 'pt' ? 'Treinar tríade' : 'Triad train.', path: '/triads-tetrads?trainer=1', wide: true },
                ].map(item => (
                  <button
                    key={item.path}
                    onClick={() => item.path === 'harmonic-cycle' ? openHarmonicCycle() : openModulePage(item.path)}
                    className={`rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase ${item.wide ? 'col-span-2' : ''} ${isLight ? 'border-zinc-200 text-zinc-700' : 'border-zinc-700 text-zinc-200'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className={`rounded-xl border p-1.5 ${isLight ? 'border-zinc-200' : 'border-zinc-700'}`}>
                  <p className="mb-1 px-1 text-[8px] font-black uppercase text-zinc-400">{lang === 'pt' ? 'Guitarra' : 'Guitar'}</p>
                  <div className="grid grid-cols-3 gap-1">
                    {(['guitar-6', 'guitar-7', 'guitar-8'] as InstrumentType[]).map(instrument => (
                      <button key={instrument} onClick={() => updatePrimaryInstrument(instrument)} className={`rounded-lg px-2 py-2 text-[9px] font-black uppercase ${primaryInstrument === instrument ? 'bg-blue-600 text-white' : isLight ? 'bg-zinc-50 text-zinc-700' : 'bg-zinc-800 text-zinc-200'}`}>
                        {instrument.replace('guitar-', '')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={`rounded-xl border p-1.5 ${isLight ? 'border-zinc-200' : 'border-zinc-700'}`}>
                  <p className="mb-1 px-1 text-[8px] font-black uppercase text-zinc-400">{lang === 'pt' ? 'Baixo' : 'Bass'}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {(['bass-4', 'bass-5'] as InstrumentType[]).map(instrument => (
                      <button key={instrument} onClick={() => updatePrimaryInstrument(instrument)} className={`rounded-lg px-2 py-2 text-[9px] font-black uppercase ${primaryInstrument === instrument ? 'bg-blue-600 text-white' : isLight ? 'bg-zinc-50 text-zinc-700' : 'bg-zinc-800 text-zinc-200'}`}>
                        {instrument.replace('bass-', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={togglePrimaryLeftHanded} className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase ${primaryLeftHanded ? 'border-blue-600 bg-blue-600 text-white' : isLight ? 'border-zinc-200 text-zinc-700' : 'border-zinc-700 text-zinc-200'}`}>
                {lang === 'pt' ? 'Canhoto' : 'Left-handed'}
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {authUser ? (
                  <button onClick={handleLogout} className={`rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase ${isLight ? 'border-red-200 text-red-600' : 'border-red-950/70 text-red-300'}`}>
                    {lang === 'pt' ? 'Sair da conta' : 'Log out'}
                  </button>
                ) : (
                  <button onClick={() => { setShowLoginModal(true); setShowProjectMenu(false); }} className={`rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase ${isLight ? 'border-blue-200 bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-950/20'}`}>
                    {lang === 'pt' ? 'Entrar na conta' : 'Sign in'}
                  </button>
                )}
                <button onClick={() => { setShowProjectMenu(false); void handleLogout(); }} className={`rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase ${isLight ? 'border-zinc-200 text-zinc-700' : 'border-zinc-700 text-zinc-200'}`}>
                  {lang === 'pt' ? 'Trocar conta' : 'Switch account'}
                </button>
              </div>
              <button onClick={() => { setShowSupportModal(true); setShowProjectMenu(false); }} className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase ${isLight ? 'border-zinc-200 text-zinc-700' : 'border-zinc-700 text-zinc-200'}`}>
                APOIAR O PROJETO
              </button>
            </div>
          )}
        </div>
      )}


      <div
  className={`fixed top-0 left-0 w-full z-50 border-b backdrop-blur-2xl px-4 md:px-10 transition-all duration-500
${isLight ? 'bg-white/90 border-zinc-200 shadow-sm' : 'bg-zinc-950/90 border-zinc-800'}
${isExporting ? 'hidden' : ''}
${isSmallScreen ? 'hidden' : 'py-3 md:py-4'}
`}
>
  <div className="max-w-[1700px] mx-auto flex items-start justify-between gap-3">
    <div className="flex min-w-[320px] flex-1 items-center gap-3 md:gap-5">
      <button
        type="button"
        onClick={() => openModulePage('/theme-collection')}
        className="shrink-0 rounded-2xl transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-400"
        title={lang === 'pt' ? 'Trocar logo desbloqueada' : 'Change unlocked logo'}
        aria-label={lang === 'pt' ? 'Abrir coleções para trocar a logo' : 'Open collections to change logo'}
      >
        <LogoIcon brand={displayedBrandAssets} />
      </button>

      <div className="min-w-0">
        <h1 className={`text-[16px] md:text-2xl font-black italic leading-none tracking-tighter uppercase truncate ${titleColorClass}`}>
          GUITAR ARCHITECT
        </h1>

        <p className="text-[8px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-tight mt-1">
          {t.tagline}
        </p>

        <label className={`mt-2 flex max-w-[260px] items-center gap-2 rounded-lg border px-2 py-1 ${isLight ? 'bg-white/70 border-zinc-200' : 'bg-zinc-900/70 border-zinc-800'}`}>
          <span className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-400">
            {lang === 'pt' ? 'Projeto' : 'Project'}
          </span>
          <input
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            maxLength={28}
            className={`min-w-0 flex-1 bg-transparent font-black text-[10px] md:text-xs focus:outline-none truncate ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}
            placeholder={t.projectName}
          />
        </label>

        <div className={`mt-2 min-w-0 flex items-center gap-1 text-[10px] md:text-[11px] font-black uppercase ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
          <span className="hidden 2xl:inline text-zinc-400 shrink-0">
            {lang === 'pt' ? 'Usuário:' : 'User:'}
          </span>
          <span className="truncate max-w-[220px] md:max-w-[320px] xl:max-w-[420px] 2xl:max-w-none">
            {authUser ? getSupabaseDisplayName(authUser) : user || (lang === 'pt' ? 'Visitante' : 'Guest')}
          </span>
        </div>
      </div>

      <div className="hidden lg:flex flex-col items-start gap-2 shrink-0">
        {!isGuestMode && <PinnedProfileBadges isLight={isLight} />}

        <div className="flex items-center gap-2">
          {authUser && isAdminEmail(authUser.email) && (
            <a
              href="/admin/rewards"
              className={`text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight transition-all border ${isLight ? 'border-zinc-200 text-zinc-400 hover:border-blue-400 hover:text-blue-600' : 'border-zinc-700 text-zinc-500 hover:border-blue-500 hover:text-blue-400'}`}
            >
              ADMIN
            </a>
          )}
          <span className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] ${isLight ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-blue-900/70 bg-blue-950/40 text-blue-200'}`}>
            {isGuestMode ? (lang === 'pt' ? 'VISITANTE' : 'VISITOR') : currentUserTierName}
          </span>
          {authUser ? (
            <button
              onClick={handleLogout}
              className={`text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight active:scale-95 transition-all border ${isLight ? 'border-zinc-200 text-zinc-500 hover:border-red-300 hover:text-red-600' : 'border-zinc-700 text-zinc-400 hover:border-red-500 hover:text-red-400'}`}
            >
              LOGOFF
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className={`text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight active:scale-95 transition-all border ${isLight ? 'border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50' : 'border-blue-900 text-blue-400 hover:border-blue-500 hover:bg-blue-950/20'}`}
            >
              {lang === 'pt' ? 'ENTRAR' : 'LOGIN'}
            </button>
          )}
        </div>
      </div>
    </div>

            <div className="flex min-w-0 items-start gap-1.5 md:gap-3">
               <div className="hidden xl:flex flex-col gap-1.5 min-w-0">
              <div className="grid grid-cols-5 gap-1.5">
                   {[
                     { label: lang === 'pt' ? 'Ciclo' : 'Cycle', onClick: () => openModulePage('/harmonic-cycle') },
                     { label: lang === 'pt' ? 'Modos' : 'Modes', onClick: () => openModulePage('/greek-modes') },
                     { label: 'CAGED', onClick: () => openModulePage('/caged') },
                     { label: lang === 'pt' ? 'Acordes' : 'Chords', onClick: () => openModulePage('/chords') },
                     { label: 'Tri/Tetrad', onClick: () => openModulePage('/triads-tetrads') },
                   ].map(item => (
                     <button
                       key={item.label}
                       onClick={item.onClick}
                        className={`min-w-[96px] px-2 py-2 text-[8px] ${headerButtonBaseClass} ${headerButtonThemeClass}`}
                     >
                       {item.label}
                     </button>
                   ))}
                 </div>
                 <div className="grid grid-cols-5 gap-1.5">
                    <button onClick={() => openModulePage('/learn')} className={`min-w-[96px] px-2 py-2 text-[8px] ${headerButtonBaseClass} ${headerButtonThemeClass}`}>
                     {lang === 'pt' ? 'Aprender' : 'Learn'}
                   </button>
                    <button onClick={() => openModulePage('/practice')} className={`min-w-[96px] px-2 py-2 text-[8px] ${headerButtonBaseClass} ${headerButtonThemeClass}`}>
                     {lang === 'pt' ? 'Praticar' : 'Practice'}
                   </button>
                    <button onClick={() => openModulePage('/triads-tetrads?trainer=1')} className={`min-w-[96px] px-2 py-2 text-[8px] ${headerButtonBaseClass} ${headerButtonThemeClass}`}>
                     {lang === 'pt' ? 'Treinar tríade' : 'Triad train.'}
                   </button>
                    <button onClick={openMetronomeTool} className={`min-w-[96px] px-2 py-2 text-[8px] ${headerButtonBaseClass} ${headerButtonThemeClass}`}>
                     {lang === 'pt' ? 'Metrônomo' : 'Metronome'}
                   </button>
                    <button onClick={openTunerTool} className={`min-w-[96px] px-2 py-2 text-[8px] ${headerButtonBaseClass} ${headerButtonThemeClass}`}>
                     {lang === 'pt' ? 'Afinador' : 'Tuner'}
                   </button>
                 </div>
                 <div className="grid grid-cols-3 gap-1.5">
                    <button onClick={() => openModulePage('/ecosystem')} className={`min-w-[96px] px-2 py-2 text-[8px] ${headerButtonBaseClass} ${headerButtonThemeClass}`}>
                     {lang === 'pt' ? 'Ecossistema' : 'Ecosystem'}
                   </button>
                    <button onClick={() => openModulePage('/theme-collection')} className={`min-w-[96px] px-2 py-2 text-[8px] ${headerButtonBaseClass} ${headerButtonThemeClass}`}>
                     {lang === 'pt' ? 'Coleções' : 'Collections'}
                   </button>
                    <button onClick={openMyInstruments} className={`min-w-[96px] px-2 py-2 text-[8px] ${headerButtonBaseClass} ${headerButtonThemeClass}`}>
                     {lang === 'pt' ? 'Instrumentos' : 'Instruments'}
                   </button>
                 </div>
               </div>
               <div className="hidden">
                 {[
                   { label: lang === 'pt' ? 'Aprender' : 'Learn', path: '/learn' },
                   { label: lang === 'pt' ? 'Praticar' : 'Practice', path: '/practice' },
                   { label: lang === 'pt' ? 'Ciclo' : 'Cycle', path: '/harmonic-cycle' },
                   { label: lang === 'pt' ? 'Acordes' : 'Chords', path: '/chords' },
                   { label: 'CAGED', path: '/caged' },
                   { label: lang === 'pt' ? 'Triades' : 'Triads', path: '/triads-tetrads' },
                   { label: lang === 'pt' ? 'Modos' : 'Modes', path: '/greek-modes' },
                   { label: lang === 'pt' ? 'Coleção' : 'Collection', path: '/theme-collection' },
                 ].map(item => (
                   <button
                     key={item.path}
                     onClick={() => openModulePage(item.path)}
                     className={`min-w-[74px] px-2 py-2 rounded-xl border transition-all ai-glow font-black text-[8px] uppercase ${isLight ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100' : 'border-zinc-700 text-zinc-100 hover:bg-zinc-800'}`}
                   >
                     {item.label}
                   </button>
                 ))}
               </div>
               <div className="flex flex-col gap-1.5">
	               <button
	                 onClick={() => setTheme(isLight ? 'dark' : 'light')}
                 className={`p-2 ${headerButtonBaseClass} ${headerButtonThemeClass}`}
                 title={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
                 aria-label={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
	               >
	                  {isLight ? <MoonIcon /> : <SunIcon />}
	               </button>
	               <button
	                 onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
	                 className={`px-3 py-2 text-[10px] ${headerButtonBaseClass} ${headerButtonThemeClass}`}
	                 title={lang === 'pt' ? 'English' : 'Português'}
	                 aria-label={lang === 'pt' ? 'Switch to English' : 'Mudar para português'}
	               >
	                 {lang === 'pt' ? 'EN' : 'PORT'}
	               </button>
               </div>
               <div className="flex flex-col gap-1.5">
	               <button
	                 onClick={() => window.dispatchEvent(new CustomEvent('ga-open-active-tour'))}
                 className={`p-2 text-xs ${headerButtonBaseClass} ${headerButtonThemeClass}`}
                 title={lang === 'pt' ? 'Tutorial' : 'Tutorial'}
                 aria-label={lang === 'pt' ? 'Abrir tutorial' : 'Open tutorial'}
               >
                 T
               </button>
               {/* LOAD / SAVE ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â SEPARADOS */}
                <a href="/legal/help.html" target="_blank" rel="noreferrer" className={`p-2 text-xs text-center ${headerButtonBaseClass} ${headerButtonThemeClass}`} title={lang === 'pt' ? 'Ajuda e perguntas frequentes' : 'Help and FAQ'} aria-label={lang === 'pt' ? 'Ajuda e perguntas frequentes' : 'Help and FAQ'}>
                 ?
               </a>
               </div>
<div className="flex flex-col gap-1.5">

  {/* LOAD */}
  <button
    onClick={() => projectFileInputRef.current?.click()}
    className={`
      px-3 md:px-4 py-1.5 md:py-2
      rounded-xl border font-black uppercase
      text-[9px] md:text-[10px]
      shadow-sm
      ${headerButtonBaseClass} ${headerActionButtonThemeClass}
      ${isLight ? 'hover:text-blue-600' : 'hover:text-blue-300'}
    `}
  >
    {lang === 'pt' ? 'ABRIR JSON' : 'OPEN JSON'}
  </button>

  {/* SAVE */}
  <button
    onClick={() => void exportProjectFile()}
    className={`
      px-3 md:px-4 py-1.5 md:py-2
      rounded-xl border font-black uppercase
      text-[9px] md:text-[10px]
      shadow-sm
      ${headerButtonBaseClass} ${headerActionButtonThemeClass}
      ${isLight ? 'hover:text-emerald-600' : 'hover:text-emerald-300'}
    `}
  >
    {lang === 'pt' ? 'SALVAR JSON' : 'SAVE JSON'}
  </button>

</div>


               {/* EXPORTAÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢O */}
<div className="flex flex-col items-center md:items-start leading-none">

  {/* TÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂTULO */}
  <span className={`
    text-[8px] md:text-[8px]
    font-black uppercase tracking-wider
    mb-1
    ${isLight ? 'text-zinc-500' : 'text-zinc-400'}
  `}>
    {lang === 'pt' ? 'Exportação' : 'Export'}
  </span>

  {/* BOTÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ES */}
  <div className="flex flex-col gap-1">
    <button
      onClick={handleExportPNG}
      className="
        bg-emerald-600
        px-3 md:px-5 py-1.5 md:py-2
        rounded-xl
        font-black
        text-[9px] md:text-[10px]
        text-white
        shadow-md
        active:scale-90
        transition-transform ai-glow
      "
    >
      PNG
    </button>

    <button
      onClick={handleExportPDF}
      className="
        bg-red-600
        px-3 md:px-5 py-1.5 md:py-2
        rounded-xl
        font-black
        text-[9px] md:text-[10px]
        text-white
        shadow-md
        active:scale-90
        transition-transform ai-glow
      "
    >
      PDF
    </button>
  </div>

</div>

<div className="relative">
  <button
    onClick={() => {
      window.dispatchEvent(new CustomEvent('ga-close-diagram-panels'));
      setShowProjectMenu(prev => !prev);
    }}
    className={`px-4 md:px-5 py-2 md:py-3 text-[10px] md:text-[11px] ${headerButtonBaseClass} ${headerActionButtonThemeClass} hover:border-blue-500`}
  >
    MENU
  </button>

  {showProjectMenu && (
    <div className={`absolute right-0 top-full z-[80] mt-3 max-h-[calc(100vh-112px)] w-[290px] overflow-y-auto rounded-2xl border p-4 shadow-2xl ring-1 ${isLight ? 'bg-[linear-gradient(160deg,#fbfdff_0%,#eef5fb_58%,#e8f0f8_100%)] border-[#aebed1] shadow-[0_24px_80px_rgba(71,85,105,0.24)] ring-white/80' : 'bg-[linear-gradient(160deg,#172033_0%,#111827_52%,#0c1322_100%)] border-blue-800/60 shadow-[0_30px_95px_rgba(0,0,0,0.72)] ring-white/5'}`}>
      <div className="space-y-4">
        <button onClick={() => { setShowLoadModal(true); setShowProjectMenu(false); }} className={`w-full px-3 py-2.5 text-[10px] font-black border rounded-xl transition-all uppercase ${isLight ? 'border-zinc-200 text-zinc-700 hover:border-blue-500 hover:text-blue-600' : 'border-zinc-700 text-zinc-200 hover:border-blue-500 hover:text-blue-400'}`}>
          {lang === 'pt' ? 'CARREGAR PROJETOS LOCAIS' : 'LOAD LOCAL PROJECTS'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => { void exportProjectFile(); setShowProjectMenu(false); }} className={`w-full px-3 py-2.5 text-[10px] font-black border rounded-xl transition-all uppercase ${isLight ? 'border-zinc-200 text-zinc-700 hover:border-emerald-500 hover:text-emerald-600' : 'border-zinc-700 text-zinc-200 hover:border-emerald-500 hover:text-emerald-400'}`}>
            {lang === 'pt' ? 'EXPORTAR JSON' : 'EXPORT JSON'}
          </button>
          <button onClick={() => { setShowProjectMenu(false); projectFileInputRef.current?.click(); }} className={`w-full px-3 py-2.5 text-[10px] font-black border rounded-xl transition-all uppercase ${isLight ? 'border-zinc-200 text-zinc-700 hover:border-blue-500 hover:text-blue-600' : 'border-zinc-700 text-zinc-200 hover:border-blue-500 hover:text-blue-400'}`}>
            {lang === 'pt' ? 'IMPORTAR JSON' : 'IMPORT JSON'}
          </button>
        </div>

        <button onClick={() => openModulePage('/profile')} className={`w-full px-3 py-2.5 text-[10px] font-black border rounded-xl transition-all uppercase ${isLight ? 'border-zinc-200 text-zinc-700 hover:border-blue-500 hover:text-blue-600' : 'border-zinc-700 text-zinc-200 hover:border-blue-500 hover:text-blue-400'}`}>
          {lang === 'pt' ? 'PERFIL' : 'PROFILE'}
        </button>
        <button
          onClick={() => {
            refreshLocalUserOptions();
            setShowLoginModal(true);
            setShowProjectMenu(false);
          }}
          className={`w-full px-3 py-2.5 text-[10px] font-black border rounded-xl transition-all uppercase ${isLight ? 'border-emerald-200 text-emerald-700 hover:border-emerald-400' : 'border-emerald-900/70 text-emerald-200 hover:border-emerald-500'}`}
        >
          {lang === 'pt' ? 'MIGRAR DADOS LOCAIS' : 'MIGRATE LOCAL DATA'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={openMyInstruments} className={`w-full px-3 py-2.5 text-[10px] font-black border rounded-xl transition-all uppercase ${isLight ? 'border-zinc-200 text-zinc-700 hover:border-blue-500 hover:text-blue-600' : 'border-zinc-700 text-zinc-200 hover:border-blue-500 hover:text-blue-400'}`}>
            {lang === 'pt' ? 'INSTRUMENTOS' : 'INSTRUMENTS'}
          </button>
          <button onClick={() => openModulePage('/theme-collection')} className={`w-full px-3 py-2.5 text-[10px] font-black border rounded-xl transition-all uppercase ${isLight ? 'border-zinc-200 text-zinc-700 hover:border-blue-500 hover:text-blue-600' : 'border-zinc-700 text-zinc-200 hover:border-blue-500 hover:text-blue-400'}`}>
            {lang === 'pt' ? 'Colecoes' : 'Collections'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 [&>button]:min-w-0">
          {[
            { label: lang === 'pt' ? 'ECOSSISTEMA' : 'ECOSYSTEM', path: '/ecosystem', wide: true },
            { label: lang === 'pt' ? 'APRENDER' : 'LEARN', path: '/learn' },
            { label: lang === 'pt' ? 'PRATICAR' : 'PRACTICE', path: '/practice' },
            { label: lang === 'pt' ? 'ACORDES' : 'CHORDS', path: '/chords' },
            { label: 'CAGED', path: '/caged' },
            { label: lang === 'pt' ? 'TRIADES' : 'TRIADS', path: '/triads-tetrads' },
            { label: lang === 'pt' ? 'MODOS' : 'MODES', path: '/greek-modes' },
            { label: translations[lang].harmonicCycle.menu, path: 'harmonic-cycle' },
          ].map(item => (
            <button key={item.path} onClick={() => item.path === 'harmonic-cycle' ? openHarmonicCycle() : openModulePage(item.path)} className={`flex min-h-[42px] w-full items-center justify-center rounded-xl border px-2 py-2.5 text-center text-[10px] font-black uppercase transition-all ${item.path === 'harmonic-cycle' ? 'col-span-2' : ''} ${isLight ? 'border-zinc-200 text-zinc-700 hover:border-blue-500 hover:text-blue-600' : 'border-zinc-700 text-zinc-200 hover:border-blue-500 hover:text-blue-400'}`}>
              {item.label}
            </button>
          ))}
        </div>

        <button onClick={togglePrimaryLeftHanded} className={`w-full rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase transition-all ${primaryLeftHanded ? 'border-blue-600 bg-blue-600 text-white' : isLight ? 'border-zinc-200 text-zinc-700 hover:border-blue-500 hover:text-blue-600' : 'border-zinc-700 text-zinc-200 hover:border-blue-500 hover:text-blue-400'}`}>
          {lang === 'pt' ? 'CANHOTO' : 'LEFT-HANDED'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-xl border p-1.5 ${isLight ? 'border-zinc-200' : 'border-zinc-700'}`}>
            <p className="mb-1 px-1 text-[8px] font-black uppercase text-zinc-400">{lang === 'pt' ? 'Guitarra' : 'Guitar'}</p>
            <div className="grid grid-cols-3 gap-1">
              {(['guitar-6', 'guitar-7', 'guitar-8'] as InstrumentType[]).map(instrument => (
                <button key={instrument} onClick={() => updatePrimaryInstrument(instrument)} className={`rounded-lg px-2 py-2 text-[9px] font-black uppercase ${primaryInstrument === instrument ? 'bg-blue-600 text-white' : isLight ? 'bg-zinc-50 text-zinc-700' : 'bg-zinc-800 text-zinc-200'}`}>
                  {instrument.replace('guitar-', '')}
                </button>
              ))}
            </div>
          </div>
          <div className={`rounded-xl border p-1.5 ${isLight ? 'border-zinc-200' : 'border-zinc-700'}`}>
            <p className="mb-1 px-1 text-[8px] font-black uppercase text-zinc-400">{lang === 'pt' ? 'Baixo' : 'Bass'}</p>
            <div className="grid grid-cols-2 gap-1">
              {(['bass-4', 'bass-5'] as InstrumentType[]).map(instrument => (
                <button key={instrument} onClick={() => updatePrimaryInstrument(instrument)} className={`rounded-lg px-2 py-2 text-[9px] font-black uppercase ${primaryInstrument === instrument ? 'bg-blue-600 text-white' : isLight ? 'bg-zinc-50 text-zinc-700' : 'bg-zinc-800 text-zinc-200'}`}>
                  {instrument.replace('bass-', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleLogout} className={`w-full rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase transition-all ${isLight ? 'border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50' : 'border-red-950/70 text-red-300 hover:border-red-700 hover:bg-red-950/20'}`}>
            {lang === 'pt' ? 'SAIR DA CONTA' : 'LOG OUT'}
          </button>
          <button onClick={() => { setShowProjectMenu(false); void handleLogout(); }} className={`w-full rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase transition-all ${isLight ? 'border-zinc-200 text-zinc-700 hover:border-blue-500 hover:text-blue-600' : 'border-zinc-700 text-zinc-200 hover:border-blue-500 hover:text-blue-400'}`}>
            {lang === 'pt' ? 'TROCAR CONTA' : 'SWITCH ACCOUNT'}
          </button>
        </div>

        <button onClick={() => { setShowSupportModal(true); setShowProjectMenu(false); }} className={`w-full px-3 py-2.5 text-[10px] font-black border rounded-xl transition-all uppercase ${isLight ? 'border-zinc-200 text-zinc-700 hover:border-blue-500 hover:text-blue-600' : 'border-zinc-700 text-zinc-200 hover:border-blue-500 hover:text-blue-400'}`}>
          APOIAR O PROJETO
        </button>
      </div>
    </div>
  )}
</div>


{/* GLOBAL TRANSPOSE ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â HEADER */}
<div className="hidden flex-col items-center leading-none select-none">

  {/* LABEL */}
  <span className={`
    text-[8px] font-black uppercase tracking-widest mb-1
    ${isLight ? 'text-zinc-500' : 'text-zinc-400'}
  `}>
    {lang === 'pt'
      ? 'Transposicao Global'
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
      ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¹ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢
    </button>

  </div>
</div>


               <div className="hidden items-center gap-3 ml-3">
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
    PORT
  </button>

  <button
    onClick={() => setLang('en')}
    className={`px-2 py-1 text-[9px] font-black rounded ${
      lang === 'en'
        ? 'bg-blue-600 text-white'
        : 'text-zinc-500'
    }`}
  >
    ENG
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
        ? 'pt-16 md:pt-48'
        : 'pt-24 md:pt-48'
  }`}
>

        {returnContext && !isExporting && (
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[24px] border animate-in fade-in slide-in-from-top-2 duration-500 ${isLight ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-blue-950/20 border-blue-500/30 shadow-2xl backdrop-blur-sm'}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">
                  {returnContext.source === 'learn' ? (lang === 'pt' ? 'Sessão de estudo ativa' : 'Active study session') : (lang === 'pt' ? 'Sessão de prática ativa' : 'Active practice session')}
                </p>
                <h3 className={`text-sm font-black uppercase tracking-tight ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>
                  {returnContext.label}
                </h3>
              </div>
            </div>
            <button
              onClick={handleReturnToContext}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              {lang === 'pt' ? 'Voltar' : 'Return'}
            </button>
          </div>
        )}

        {activeInstruction && (
          <FretboardInstructionCard 
            instruction={activeInstruction} 
            isLight={isLight} 
            lang={lang} 
            onClose={() => {
              clearInstructionTimeout();
              setInstruction(null);
            }} 
          />
        )}

        {!isExporting && (!authUser || localUserOptions.length > 0) && (
          <div className={`rounded-[24px] border p-4 md:p-5 shadow-xl ${isLight ? 'border-blue-100 bg-white/92 text-zinc-800' : 'border-blue-900/50 bg-[#07111f]/92 text-zinc-100'}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${isLight ? 'text-blue-600' : 'text-blue-300'}`}>
                  {lang === 'pt' ? 'Migração de dados locais' : 'Local data migration'}
                </p>
                <h2 className="mt-1 text-lg font-black uppercase tracking-tight">
                  {lang === 'pt'
                    ? 'Leve seus projetos antigos, desbloqueios, conquistas e instrumentos para a conta sincronizada'
                    : 'Move your old projects, unlocks, achievements and instruments into your synced account'}
                </h2>
                <p className={`mt-2 max-w-4xl text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {lang === 'pt'
                    ? `Se você já usava o Guitar Architect com um nome local, entre ou crie sua conta e use "Migrar dados locais" até ${LOCAL_MIGRATION_DEADLINE_PT}. Depois desse prazo, a migração assistida poderá ser encerrada; o JSON continuará como backup manual.`
                    : `If you used Guitar Architect with a local name, sign in or create your account and use "Migrate local data" by ${LOCAL_MIGRATION_DEADLINE_EN}. After that date, assisted migration may be discontinued; JSON will remain available as a manual backup.`}
                </p>
              </div>
              <button
                onClick={() => {
                  refreshLocalUserOptions();
                  setShowLoginModal(true);
                }}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-[10px] font-black uppercase text-white shadow-[0_14px_34px_rgba(37,99,235,0.26)] transition hover:bg-blue-500 active:scale-95"
              >
                {authUser
                  ? (lang === 'pt' ? 'Migrar dados locais' : 'Migrate local data')
                  : (lang === 'pt' ? 'Entrar / criar conta' : 'Sign in / create account')}
              </button>
            </div>
          </div>
        )}

        {instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="relative mb-8 md:mb-12 scale-90 md:scale-100">
                <img src={displayedBrandAssets.hero} alt={`Guitar Architect Hero - ${displayedBrandAssets.label}`} className="w-full max-w-[280px] md:max-w-lg rounded-[24px] md:rounded-[40px] shadow-2xl" />
             </div>
             <button
               onClick={() => addInstance()}
               className="px-8 md:px-12 py-4 md:py-5 rounded-xl font-black uppercase text-[10px] md:text-xs text-white shadow-xl active:scale-95 transition-transform"
               style={{
                 background: `linear-gradient(135deg, ${displayedBrandAssets.accent}, ${displayedBrandAssets.accentShadow})`,
                 boxShadow: `0 18px 46px ${displayedBrandAssets.accentShadow}`,
               }}
             >
               Criar Primeiro Diagrama
             </button>
          </div>
        ) : (
          instances.map((inst, idx) => (
            <FretboardInstance key={inst.id} state={inst} updateState={(s) => updateInstance(inst.id, s)} onRemove={() => setInstances(prev => prev.filter(i => i.id !== inst.id))} onMove={(dir) => { const newList = [...instances]; const tIdx = dir === 'up' ? idx - 1 : idx + 1; if (tIdx >= 0 && tIdx < newList.length) { [newList[idx], newList[tIdx]] = [newList[tIdx], newList[idx]]; setInstances(newList); setActiveInstanceId(newList[tIdx].id); } }} onAdd={addInstance} isFirst={idx === 0} isLast={idx === instances.length - 1} diagramNumber={idx + 1} theme={theme} lang={lang} isActive={(activeInstanceId || instances[0]?.id) === inst.id} onActivate={() => setActiveInstanceId(inst.id)} isExporting={isExporting} globalTranspose={globalTranspose} onGlobalTranspose={handleGlobalTranspose} showTips={showTips} onToggleTips={() => setShowTips(prev => !prev)} />
          ))
        )}
      </div>

      <footer className={`py-10 border-t ${isExporting ? 'hidden' : 'hidden md:block'} ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-900'}`}>
         <div className="max-w-[1700px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
               <LogoIcon brand={displayedBrandAssets} variant="footer" />
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Guitar Architect • DPDDA-tech</p>
            </div>
            <div className="flex gap-4 md:gap-8 text-[10px] font-black uppercase text-zinc-500">
               <a href="/legal/privacy.html" target="_blank" className="hover:text-blue-600 transition-colors">Privacidade</a>
               <a href="/legal/terms.html" target="_blank" className="hover:text-blue-600 transition-colors">Termos</a>
               <a href="/legal/license.html" target="_blank" className="hover:text-blue-600 transition-colors">Licença</a>
               <a href="/legal/help.html" target="_blank" className="hover:text-blue-600 transition-colors">Ajuda</a>
               <a href="#" onClick={() => setShowSupportModal(true)} className="hover:text-blue-600 transition-colors cursor-pointer">Apoie o projeto</a>
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>© 2026</p>
         </div>
      </footer>

      {showLoginModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
          <div className={`max-h-[calc(100vh-32px)] w-full max-w-md overflow-y-auto rounded-[40px] border p-6 shadow-2xl md:p-8 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
             <div className="flex flex-col items-center mb-4">
                <LogoIcon brand={displayedBrandAssets} variant="default" />
                <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-center">
                  {lang === 'pt' ? 'Conta Guitar Architect' : 'Guitar Architect Account'}
                </h2>
                <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                  {authUser
                    ? (lang === 'pt' ? 'Conta sincronizada' : 'Synced account')
                    : (lang === 'pt' ? 'Entre, crie conta ou continue localmente' : 'Sign in, create an account or continue locally')}
                </p>
             </div>

             <div className={`mb-6 rounded-3xl border p-4 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/60 border-zinc-800'}`}>
               <div className="grid grid-cols-2 gap-2 mb-4">
                 <button
                   type="button"
                   onClick={() => {
                     setAuthMode('signin');
                     setAuthStatus('idle');
                     setAuthMessage('');
                   }}
                   className={`rounded-2xl py-3 text-[10px] font-black uppercase transition-all ${authMode === 'signin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : (isLight ? 'bg-white text-zinc-500 border border-zinc-200' : 'bg-zinc-900 text-zinc-400 border border-zinc-800')}`}
                 >
                   {lang === 'pt' ? 'Entrar' : 'Sign in'}
                 </button>
                 <button
                   type="button"
                   onClick={() => {
                     setAuthMode('signup');
                     setAuthStatus('idle');
                     setAuthMessage('');
                   }}
                   className={`rounded-2xl py-3 text-[10px] font-black uppercase transition-all ${authMode === 'signup' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : (isLight ? 'bg-white text-zinc-500 border border-zinc-200' : 'bg-zinc-900 text-zinc-400 border border-zinc-800')}`}
                 >
                   {lang === 'pt' ? 'Criar conta' : 'Create account'}
                 </button>
               </div>
               <div className="grid gap-3">
                 <input
                   type="email"
                   autoComplete="email"
                   placeholder={lang === 'pt' ? 'E-mail' : 'E-mail'}
                   value={authEmail}
                   onChange={e => setAuthEmail(e.target.value)}
                   className={`w-full rounded-2xl border p-3 text-sm font-bold outline-none transition-all ${isLight ? 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-500' : 'bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-blue-500'}`}
                 />
                 <input
                   type="password"
                   autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                   placeholder={lang === 'pt' ? 'Senha' : 'Password'}
                   value={authPassword}
                   onChange={e => setAuthPassword(e.target.value)}
                   onKeyDown={e => {
                     if (e.key === 'Enter' && authEmail.trim() && authPassword.trim()) {
                       void handleSupabaseAuth();
                     }
                   }}
                   className={`w-full rounded-2xl border p-3 text-sm font-bold outline-none transition-all ${isLight ? 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-500' : 'bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-blue-500'}`}
                 />
                 <button
                   type="button"
                   onClick={() => void handleSupabaseAuth()}
                   disabled={authStatus === 'loading'}
                   className={`w-full rounded-2xl py-4 text-[11px] font-black uppercase shadow-xl active:scale-95 transition-all ${authStatus === 'loading' ? 'bg-zinc-400 text-white cursor-wait' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                 >
                   {authStatus === 'loading'
                     ? (lang === 'pt' ? 'Conectando...' : 'Connecting...')
                     : authMode === 'signin'
                       ? (lang === 'pt' ? 'Entrar na conta' : 'Sign in')
                       : (lang === 'pt' ? 'Criar conta Guitar Architect' : 'Create Guitar Architect account')}
                 </button>
                 <button
                   type="button"
                   onClick={() => void handleGoogleAuth()}
                   disabled={authStatus === 'loading'}
                   className={`w-full rounded-2xl border py-4 text-[11px] font-black uppercase shadow-sm active:scale-95 transition-all ${authStatus === 'loading' ? 'cursor-wait opacity-70' : ''} ${isLight ? 'border-zinc-200 bg-white text-zinc-800 hover:border-blue-300' : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-blue-500'}`}
                 >
                   {lang === 'pt' ? 'Continuar com Google' : 'Continue with Google'}
                 </button>
                 {authMessage && (
                   <p className={`text-center text-[10px] font-bold leading-relaxed ${authStatus === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                     {authMessage}
                   </p>
                 )}
               </div>
             </div>

              {(allowLocalIdentity || authUser) ? (
      <div className="mb-5 flex items-center gap-3">
                <div className={`h-px flex-1 ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                  {lang === 'pt' ? 'Identidade local' : 'Local identity'}
                </span>
                <div className={`h-px flex-1 ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
              </div>
              ) : (
                <div className={`mb-6 rounded-3xl border p-4 text-center ${isLight ? 'border-blue-100 bg-blue-50 text-blue-800' : 'border-blue-900/50 bg-blue-950/20 text-blue-200'}`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em]">
                    {lang === 'pt' ? 'Sessao encerrada' : 'Session ended'}
                  </p>
                  <p className="mt-2 text-[11px] font-bold leading-relaxed">
                    {lang === 'pt'
                      ? 'Para voltar aos dados sincronizados, entre novamente na sua conta.'
                      : 'To return to synced data, sign in to your account again.'}
                  </p>
                </div>
              )}

             {authUser && localUserOptions.length > 0 && (
               <div className={`mb-6 rounded-3xl border p-4 ${isLight ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-950/20 border-emerald-900/40'}`}>
                 <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                   {lang === 'pt' ? 'Migrar dados locais' : 'Migrate local data'}
                 </p>
                 <p className={`mt-2 text-[11px] font-bold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                   {lang === 'pt'
                     ? 'Encontramos identidades locais neste navegador. Voce pode mesclar esses projetos na sua conta sincronizada.'
                     : 'Local identities were found in this browser. You can merge those projects into your synced account.'}
                 </p>
                 <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto pr-1">
                   {localUserOptions.map(localUser => (
                     <button
                       key={localUser}
                       type="button"
                       onClick={() => void handleMigrateLocalIdentity(localUser)}
                       disabled={migrationStatus === 'loading'}
                       className={`rounded-2xl border px-3 py-3 text-[10px] font-black uppercase transition active:scale-95 disabled:cursor-wait ${isLight ? 'border-emerald-200 bg-white text-emerald-700 hover:border-emerald-400' : 'border-emerald-900/60 bg-zinc-950 text-emerald-200 hover:border-emerald-500'}`}
                     >
                       {lang === 'pt' ? `Migrar ${localUser}` : `Migrate ${localUser}`}
                     </button>
                   ))}
                 </div>
                 {migrationMessage && (
                   <p className={`mt-3 text-center text-[10px] font-bold ${migrationStatus === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                     {migrationMessage}
                   </p>
                 )}
               </div>
             )}
              {(allowLocalIdentity || authUser) && (
               <div className="relative mb-8">
               <input 
                 autoFocus 
                 placeholder="Nome do Autor (ex: Prof. Jimmy H)..." 
                 value={user} 
                 onChange={e => setUser(e.target.value)} 
 onKeyDown={e => {
  if (e.key === 'Enter' && user.trim()) {
    if (!canUseDisplayName(user.trim(), authUser?.email)) {
      alert(getDisplayNameError(lang));
      return;
    }
    switchUserSession(authUser?.id || 'guest', user.trim());
    setShowLoginModal(false);
  }
}}


                 className={`w-full p-4 rounded-2xl font-bold outline-none border transition-all text-center text-sm md:text-base placeholder:text-zinc-400 placeholder:font-normal placeholder:opacity-50 ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-900 focus:border-blue-500' : 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-blue-500'}`} 
               />
               {!user && (
                 <p className="absolute -bottom-5 left-0 w-full text-center text-[9px] font-black uppercase text-zinc-400 tracking-tighter opacity-40">Apenas sugestÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o. Digite o que desejar.</p>
               )}
              </div>
              )}
              
              {(allowLocalIdentity || authUser) && (
<button
  onClick={() => {
    if (user.trim()) {
      if (!canUseDisplayName(user.trim(), authUser?.email)) {
        alert(getDisplayNameError(lang));
        return;
      }
      switchUserSession(authUser?.id || 'guest', user.trim());
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
              )}

            <button
              onClick={() => setShowLoginModal(false)}
              className={`mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border transition-all uppercase text-[10px] font-black tracking-widest ${isLight ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' : 'bg-red-950/10 border-red-500/40 text-red-400 hover:bg-red-900/20 hover:border-red-500/60 shadow-lg shadow-red-900/10'}`}
            >
              <span className="text-xs">↩</span>
              {lang === 'pt' ? 'Continuar como visitante' : 'Continue as guest'}
            </button>
</div>
</div>
)}
      {showImportModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
           <div className={`w-full max-w-2xl rounded-[32px] p-6 md:p-8 border shadow-3xl ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black italic text-blue-500 uppercase tracking-tighter">{t.importTitle}</h2>
                 <button onClick={() => setShowImportModal(false)} className="text-zinc-500 text-2xl hover:text-red-500 transition-colors">ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</button>
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

<SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} isLight={theme === 'light'} />
<MyInstruments
  isOpen={showMyInstruments}
  onClose={closeMyInstruments}
  onToggleTheme={() => setTheme(isLight ? 'dark' : 'light')}
  onToggleLang={() => setLang(lang === 'pt' ? 'en' : 'pt')}
  theme={theme}
  lang={lang}
  onInstrumentsChanged={handleInstrumentsChanged}
  authUserId={authUser?.id}
/>

</div>
);
};
export default FretboardPanel;

