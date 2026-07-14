import React, { useEffect, useMemo, useState } from 'react';
import { loadConfig } from '../utils/persistence';
import { getGlobalLang, getGlobalTheme, setGlobalPreferences } from '../utils/ecosystemPreferences';
import {
  getInstructorAreaLabel,
  getInstructorAudienceLevelLabel,
  instructorMatchesPublicFilters,
  instructors,
  type InstructorArea,
  type InstructorAudienceLevel,
} from '../data/instructors';
import InstructorCard from './InstructorCard';
import AppFooter from './AppFooter';

type ThemeMode = 'light' | 'dark';
type AppLang = 'pt' | 'en';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const areaFilters: InstructorArea[] = ['kids', 'teens', 'studio'];
const levelFilters: InstructorAudienceLevel[] = ['earlyEducation', 'beginner', 'intermediate', 'advanced'];

const GALLERY_SCROLL_KEY = 'ga_instructors_gallery_scroll';

const InstructorsGalleryPage: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => getGlobalTheme());
  const [lang, setLang] = useState<AppLang>(() => getGlobalLang());
  const [areaFilter, setAreaFilter] = useState<InstructorArea | null>(null);
  const [levelFilter, setLevelFilter] = useState<InstructorAudienceLevel | null>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(GALLERY_SCROLL_KEY);
    } catch {
      // sessionStorage indisponível — mantém o topo da página.
    }
    if (stored === null) return;
    const scrollY = Number(stored);
    if (!Number.isFinite(scrollY)) return;
    // A chave só é removida quando a restauração realmente ocorre (dentro do
    // rAF), não ao montar o efeito. Isso evita que a dupla montagem do
    // React.StrictMode (mount → cleanup → mount) consuma a chave e cancele o
    // frame antes que a montagem final tenha a chance de restaurar o scroll.
    const frame = requestAnimationFrame(() => {
      try {
        sessionStorage.removeItem(GALLERY_SCROLL_KEY);
      } catch {
        // sessionStorage indisponível — nada a remover.
      }
      window.scrollTo(0, scrollY);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleToggleTheme = () => {
    const current = loadConfig();
    const nextTheme: ThemeMode = isLight ? 'dark' : 'light';
    const next = { ...(current || {}), theme: nextTheme, lang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(nextTheme, lang);
    setTheme(nextTheme);
  };

  const handleToggleLang = () => {
    const current = loadConfig();
    const nextLang: AppLang = lang === 'pt' ? 'en' : 'pt';
    const next = { ...(current || {}), theme, lang: nextLang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(theme, nextLang);
    setLang(nextLang);
  };

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  };

  const actionClass = isLight
    ? 'border-zinc-300 bg-white text-zinc-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:border-blue-400'
    : 'border-zinc-700 bg-zinc-900 text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:border-blue-500';

  const noticeClass = isLight
    ? 'border-blue-100 bg-blue-50/70 text-blue-800'
    : 'border-[rgba(30,64,175,0.4)] bg-[rgba(10,20,36,0.92)] text-blue-200';

  const filteredInstructors = useMemo(
    () => instructors.filter(instructor => instructorMatchesPublicFilters(instructor, areaFilter, levelFilter)),
    [areaFilter, levelFilter],
  );

  const t = lang === 'pt'
    ? {
        back: '← Voltar ao App',
        eyebrow: 'Guitar Architect',
        title: 'Nossos Arquitetos Musicais',
        subtitle: 'Conheça os personagens virtuais que futuramente orientarão sua jornada no Guitar Architect. Cada Arquiteto Musical representa uma forma particular de viver, compreender e se relacionar com a música.',
        noticeTitle: 'Galeria em construção',
        noticeBody: 'Os perfis já estão disponíveis. Em breve, os Arquitetos Musicais serão conectados a trilhas, dicas, desafios, recomendações personalizadas e desbloqueios progressivos.',
        fictionalNotice: 'Os Arquitetos Musicais são personagens fictícios criados para fins educacionais e de identidade visual do Guitar Architect. Suas imagens foram geradas por inteligência artificial, e seus nomes, perfis e características são fictícios. Qualquer semelhança com pessoas reais, vivas ou falecidas, é mera coincidência.',
        filterLabel: 'Filtrar Arquitetos',
      }
    : {
        back: '← Back to App',
        eyebrow: 'Guitar Architect',
        title: 'Our Music Architects',
        subtitle: 'Meet the virtual characters who will one day help guide your journey through Guitar Architect. Each Music Architect represents a distinct way of living, understanding, and relating to music.',
        noticeTitle: 'Gallery in progress',
        noticeBody: 'Profiles are already available. Soon, the Music Architects will be connected to tracks, tips, challenges, personalized recommendations and progressive unlocks.',
        fictionalNotice: 'The Music Architects are fictional characters created for educational and visual identity purposes within Guitar Architect. Their images were generated by artificial intelligence, and their names, profiles, and characteristics are fictional. Any resemblance to real persons, living or deceased, is purely coincidental.',
        filterLabel: 'Filter Music Architects',
      };

  const clearFilters = () => {
    setAreaFilter(null);
    setLevelFilter(null);
  };

  return (
    <>
      <div className={`relative min-h-screen p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
        <div className="absolute inset-0 pointer-events-none opacity-50" style={gridStyle} />

        <div className="relative mx-auto max-w-[1200px] py-6">
          <div className="mb-8 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => navigateTo('/ecosystem')}
              className="inline-flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest hover:underline"
            >
              {t.back}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleTheme}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-black transition-all ${actionClass}`}
                aria-label={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
              >
                {isLight ? <MoonIcon /> : <SunIcon />}
              </button>
              <button
                type="button"
                onClick={handleToggleLang}
                className={`min-h-[36px] rounded-xl border px-3 py-2 text-[11px] font-black uppercase transition-all ${actionClass}`}
              >
                {lang.toUpperCase()}
              </button>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">
              {t.eyebrow}
            </p>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
              {t.title}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base font-semibold leading-relaxed text-zinc-500">
              {t.subtitle}
            </p>
          </div>

          <div className={`mx-auto mb-10 max-w-3xl rounded-2xl border p-5 text-center ${noticeClass}`}>
            <p className="text-xs font-black uppercase tracking-widest">{t.noticeTitle}</p>
            <p className="mt-2 text-xs md:text-sm leading-relaxed opacity-90">{t.noticeBody}</p>
            <p className="mt-3 text-[11px] leading-relaxed opacity-70">{t.fictionalNotice}</p>
          </div>

          <div className="mb-5">
            <p className={`mb-2 text-center text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t.filterLabel}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={clearFilters}
                aria-pressed={!areaFilter && !levelFilter}
                className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                  !areaFilter && !levelFilter
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : actionClass
                }`}
              >
                {lang === 'pt' ? 'Todos' : 'All'}
              </button>
              <div
                role="group"
                aria-label={lang === 'pt' ? 'Área de atuação' : 'Area'}
                className="flex flex-wrap items-center justify-center gap-2"
              >
                {areaFilters.map(area => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setAreaFilter(current => current === area ? null : area)}
                    aria-pressed={areaFilter === area}
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                      areaFilter === area
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : actionClass
                    }`}
                  >
                    {getInstructorAreaLabel(area, lang)}
                  </button>
                ))}
              </div>
              <span
                aria-hidden="true"
                className={`mx-1 hidden h-5 w-px md:block ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`}
              />
              <div
                role="group"
                aria-label={lang === 'pt' ? 'Nível' : 'Level'}
                className="flex flex-wrap items-center justify-center gap-2"
              >
                {levelFilters.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setLevelFilter(current => current === level ? null : level)}
                    aria-pressed={levelFilter === level}
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                      levelFilter === level
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : actionClass
                    }`}
                  >
                    {getInstructorAudienceLevelLabel(level, lang)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredInstructors.map(instructor => (
              <InstructorCard key={instructor.id} instructor={instructor} isLight={isLight} lang={lang} />
            ))}
          </div>
        </div>
      </div>

      <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />
    </>
  );
};

export default InstructorsGalleryPage;
