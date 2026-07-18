import React, { useMemo, useState } from 'react';
import { loadConfig } from '../utils/persistence';
import { getGlobalLang, getGlobalTheme, setGlobalPreferences } from '../utils/ecosystemPreferences';
import AppFooter from './AppFooter';
import { getDailyInstructorSpotlightGroup } from '../data/instructors';
import { AnalyticsEvents, trackEvent } from '../src/lib/analytics';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

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

type ThemeMode = 'light' | 'dark';
type AppLang = 'pt' | 'en';

const EcosystemPage: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => getGlobalTheme());
  const [lang, setLang] = useState<AppLang>(() => getGlobalLang());
  const isLight = theme === 'light';
  const spotlightInstructors = useMemo(() => getDailyInstructorSpotlightGroup(), []);

  const actionClass = isLight
    ? 'border-zinc-300 bg-white text-zinc-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:border-blue-400'
    : 'border-zinc-700 bg-zinc-900 text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:border-blue-500';

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

  return (
    <>
    <div className={`relative p-6 md:p-12 pt-3 md:pt-5 [@media(max-height:800px)]:pt-2 max-lg:landscape:p-3 max-lg:landscape:pt-2 overflow-hidden overflow-x-hidden ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
      <div className="absolute inset-0 pointer-events-none opacity-50" style={gridStyle} />

      <div className="relative mx-auto max-w-6xl py-2 md:py-3 max-lg:landscape:py-0 text-center">
        <p className="mb-2 text-xs md:text-sm font-black uppercase tracking-[0.3em] text-blue-500 max-lg:landscape:text-[8px] max-lg:landscape:mb-0.5">
          Guitar Architect
        </p>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-normal leading-tight max-lg:landscape:text-lg">
          {lang === 'pt' ? (
            <>
              <span className="block">Construa sua jornada musical,</span>
              <span className="block">etapa por etapa</span>
            </>
          ) : (
            <>
              <span className="block">Build your musical journey,</span>
              <span className="block">step by step</span>
            </>
          )}
        </h1>

        <p className={`mt-3 mb-4 max-w-3xl mx-auto font-semibold text-base md:text-lg leading-relaxed tracking-normal normal-case max-lg:landscape:mt-1 max-lg:landscape:mb-2 max-lg:landscape:text-[9px] ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
          {lang === 'pt'
            ? 'Do primeiro contato com os instrumentos, notas e sons às ferramentas avançadas para guitarra e baixo, o Guitar Architect guia sua evolução musical com descoberta, prática, mapas visuais e construção harmônica.'
            : 'From the first contact with instruments, notes and sounds to advanced tools for guitar and bass, Guitar Architect guides your musical growth through discovery, practice, visual maps and harmonic construction.'}
        </p>

        <div className="mb-6 flex items-center justify-end gap-2 max-lg:landscape:mb-2">
          <button
            type="button"
            onClick={handleToggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${actionClass}`}
            aria-label={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
            title={isLight ? (lang === 'pt' ? 'Modo escuro' : 'Dark mode') : (lang === 'pt' ? 'Modo claro' : 'Light mode')}
          >
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>
          <button
            type="button"
            onClick={handleToggleLang}
            className={`min-h-[40px] rounded-xl border px-3 py-2 text-[11px] font-black uppercase transition-all ${actionClass}`}
            aria-label={lang === 'pt' ? 'Trocar idioma para inglês' : 'Switch language to Portuguese'}
            title={lang === 'pt' ? 'Idioma' : 'Language'}
          >
            {lang.toUpperCase()}
          </button>
        </div>

        <section className={`mx-auto mb-7 max-w-4xl rounded-[28px] border p-4 text-left shadow-xl md:flex md:items-center md:justify-between md:gap-6 md:p-6 max-lg:landscape:mb-3 max-lg:landscape:p-3 ${
          isLight
            ? 'border-cyan-200 bg-gradient-to-r from-white to-cyan-50'
            : 'border-cyan-500/30 bg-gradient-to-r from-slate-950 to-cyan-950/35'
        }`} aria-labelledby="my-academy-preview-title">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-600 max-lg:landscape:text-[8px]">
              {lang === 'pt' ? 'Novo · protótipo interno' : 'New · internal prototype'}
            </p>
            <h2 id="my-academy-preview-title" className={`mt-1 text-xl font-black tracking-tight md:text-2xl max-lg:landscape:text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
              My Academy
            </h2>
            <p className={`mt-1 max-w-2xl text-sm font-semibold leading-relaxed max-lg:landscape:text-[8px] max-lg:landscape:leading-tight ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {lang === 'pt'
                ? 'Experimente a primeira unidade da jornada: Pulso e regularidade, com rotas visual e sonora e sem pontuação.'
                : 'Try the first journey unit: Pulse and regularity, with visual and audio routes and no scoring.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/my-academy/prototype/nmc-rit-001')}
            className="mt-4 min-h-12 w-full shrink-0 rounded-xl bg-cyan-600 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-950/25 transition hover:bg-cyan-500 md:mt-0 md:w-auto max-lg:landscape:min-h-9 max-lg:landscape:py-1.5 max-lg:landscape:text-[8px]"
          >
            {lang === 'pt' ? 'Entrar no My Academy' : 'Enter My Academy'}
          </button>
        </section>

        <div className="grid gap-8 md:grid-cols-3 mb-10 md:mb-12 [@media(max-height:800px)]:mb-6 max-lg:landscape:grid-cols-3 max-lg:landscape:gap-2 max-lg:landscape:mb-2">
          {[
            {
              id: 'kids',
              title: 'KIDS',
              subtitle: lang === 'pt'
                ? 'Descubra sons, instrumentos, notas e conceitos musicais em uma experiência visual, lúdica e interativa feita para transformar os primeiros contatos com a música em exploração e descoberta.'
                : 'Discover sounds, instruments, notes and musical concepts through a visual, playful and interactive experience designed to turn those first encounters with music into exploration and discovery.',
              logo: '/gakidslogo.webp',
              path: '/kids',
              btn: 'bg-emerald-600',
              cta: lang === 'pt' ? 'Explorar Kids' : 'Explore Kids',
            },
            {
              id: 'teens',
              title: 'TEENS',
              subtitle: lang === 'pt'
                ? 'Desafios, prática guiada e evolução técnica progressiva por meio de escalas, intervalos, percepção, independência dos dedos, riffs e exercícios interativos.'
                : 'Challenges, guided practice and progressive technical development through scales, intervals, ear training, finger independence, riffs and interactive exercises.',
              logo: '/gateenslogo.webp',
              path: '/teens',
              btn: 'bg-violet-600',
              cta: lang === 'pt' ? 'Explorar Teens' : 'Explore Teens',
            },
            {
              id: 'studio',
              title: 'STUDIO',
              subtitle: lang === 'pt'
                ? 'Um laboratório musical interativo para explorar notas, escalas, intervalos, acordes e estruturas harmônicas diretamente no braço do instrumento, com ferramentas avançadas para estudantes, músicos e professores.'
                : 'An interactive music laboratory for exploring notes, scales, intervals, chords and harmonic structures directly on the instrument fretboard, with advanced tools for students, musicians and teachers.',
              logo: '/logogastudio.webp',
              path: '/studio',
              btn: 'bg-blue-600',
              cta: lang === 'pt' ? 'Explorar Studio' : 'Explore Studio',
            },
          ].map(area => {
            const isStudio = area.id === 'studio';
            return (
              <button
                key={area.id}
                onClick={() => navigateTo(area.path)}
                className={`group px-10 md:px-4 lg:px-12 py-7 md:py-9 [@media(max-height:800px)]:py-6 rounded-[64px] border transition-all duration-500 text-center flex flex-col items-center max-lg:landscape:px-2 max-lg:landscape:py-3 max-lg:landscape:rounded-3xl ${
                  isLight ? 'bg-white/80 border-zinc-200' : 'bg-zinc-900/80 border-zinc-800'
                } hover:-translate-y-2 shadow-2xl ${
                  isStudio
                    ? 'scale-[1.03] md:scale-[1.04] border-blue-400/60 shadow-[0_0_35px_rgba(37,99,235,0.28)] max-lg:landscape:scale-100'
                    : ''
                }`}
              >
                <div className="w-48 h-48 md:w-64 md:h-64 mb-6 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center max-lg:landscape:w-16 max-lg:landscape:h-16 max-lg:landscape:mb-1">
                  <img
                    src={area.logo}
                    alt={area.title}
                    className="w-full h-full object-contain drop-shadow-2xl max-lg:landscape:max-h-[12vh]"
                  />
                </div>

                <h2 className={`text-lg md:text-xl font-extrabold uppercase tracking-[0.18em] mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-200'} drop-shadow-[0_0_8px_rgba(148,163,184,0.15)] max-lg:landscape:text-[10px] max-lg:landscape:tracking-[0.1em] max-lg:landscape:mb-0.5`}>
                  {area.title}
                </h2>

                <p className={`text-[12px] font-medium leading-relaxed mb-7 normal-case whitespace-pre-line ${isLight ? 'text-zinc-500' : 'text-zinc-400'} max-lg:landscape:text-[7px] max-lg:landscape:mb-2 max-lg:landscape:leading-tight`}>
                  {area.subtitle}
                </p>

                <div className={`mt-auto px-8 ${isStudio ? 'py-4 text-[11px]' : 'py-3 text-[10px]'} rounded-xl ${area.btn} text-white font-black uppercase tracking-widest max-lg:landscape:px-3 max-lg:landscape:py-1.5 max-lg:landscape:text-[8px] max-lg:landscape:rounded-lg`}>
                  {area.cta}
                </div>
              </button>
            );
          })}
        </div>

        <p className={`mx-auto mb-8 max-w-2xl text-xs md:text-sm font-semibold leading-relaxed max-lg:landscape:hidden ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
          {lang === 'pt'
            ? 'Explore livremente. Para salvar evolução, instrumentos, colecionáveis e projetos, faça login pelo Studio.'
            : 'Explore freely. To save progress, instruments, collectibles and projects, sign in through Studio.'}
        </p>

        <div className="mx-auto mb-8 max-w-2xl max-lg:landscape:hidden">
          <p className={`text-base md:text-xl font-extrabold tracking-tight ${isLight ? 'text-zinc-800' : 'text-white'}`}>
            {lang === 'pt' ? 'Música também se constrói.' : 'Music is also built.'}
          </p>
          <p className={`mt-2 text-sm md:text-base leading-relaxed ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {lang === 'pt'
              ? 'O Guitar Architect transforma sons, instrumentos, escalas, acordes e ideias musicais em uma jornada visual — do primeiro contato à construção harmônica.'
              : 'Guitar Architect turns sounds, instruments, scales, chords and musical ideas into a visual journey — from first discovery to harmonic construction.'}
          </p>
        </div>

        <div className="mx-auto mb-2 flex flex-wrap items-center justify-center gap-3 max-lg:landscape:hidden">
          <button
            type="button"
            onClick={() => navigateTo('/about')}
            style={{ backgroundImage: 'linear-gradient(90deg, #009B66 0%, #7F3FE7 50%, #1E61E6 100%)' }}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_8px_20px_rgba(30,97,230,0.35)] transition-all hover:brightness-110"
          >
            {lang === 'pt' ? 'Entenda o Guitar Architect' : 'Understand Guitar Architect'}
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/brand')}
            className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${actionClass}`}
          >
            {lang === 'pt' ? 'Conheça nossa marca' : 'Meet our brand'}
          </button>
        </div>

        <div className="mx-auto mt-10 mb-2 max-w-2xl text-center max-lg:landscape:hidden">
          <p className={`text-base md:text-xl font-extrabold tracking-tight ${isLight ? 'text-zinc-800' : 'text-white'}`}>
            {lang === 'pt' ? 'Conheça nossos Mestres Arquitetos' : 'Meet our Master Architects'}
          </p>
          <p className={`mt-2 text-sm md:text-base leading-relaxed ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {lang === 'pt'
              ? 'São 19 Mestres Arquitetos, cada um com personalidade, trajetória e campo de especialização próprios. Ao lado deles, Diana Helena Moreau Fontenelle atua como Diretora de Experiência e Jornada. Juntos, esses 20 personagens fictícios futuramente acompanharão sua jornada por diferentes dimensões do universo da música e do ecossistema.'
              : 'There are 19 Master Architects, each with their own personality, background and field of expertise. Alongside them, Diana Helena Moreau Fontenelle serves as Director of Experience & Journey. Together, these 20 fictional characters will eventually accompany you through different dimensions of music and the ecosystem.'}
          </p>

          <div className="mt-5 flex items-center justify-center gap-4">
            {spotlightInstructors.map(instructor => (
              <button
                key={instructor.id}
                type="button"
                onClick={() => {
                  trackEvent(AnalyticsEvents.SELECT_INSTRUCTOR, {
                    instructor_id: instructor.id,
                    instructor_name: instructor.name,
                    source: 'ecosystem_home',
                    language: lang,
                  });
                  navigateTo(`/instructors/${instructor.id}`);
                }}
                className="flex flex-col items-center gap-1.5"
              >
                <span className={`h-14 w-14 overflow-hidden rounded-full border-2 transition-transform hover:scale-110 md:h-16 md:w-16 ${isLight ? 'border-white shadow-md' : 'border-zinc-800'}`}>
                  <img src={instructor.cardImage} alt={instructor.name} className="h-full w-full object-cover object-top" />
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wide ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {instructor.name}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigateTo('/instructors')}
            className={`mt-5 inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${actionClass}`}
          >
            {lang === 'pt' ? 'Ver todos os personagens' : 'See all characters'}
          </button>
        </div>
      </div>
    </div>

    <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />
    </>
  );
};

export default EcosystemPage;
