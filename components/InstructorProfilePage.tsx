import React, { useEffect, useState } from 'react';
import { loadConfig } from '../utils/persistence';
import { getGlobalLang, getGlobalTheme, setGlobalPreferences } from '../utils/ecosystemPreferences';
import { getInstructorById, getInstructorCategoryLabel, instructors } from '../data/instructors';
import { getInstructorBeyondGAById } from '../data/instructorBeyondGA';
import AppFooter from './AppFooter';
import { AnalyticsEvents, trackEvent } from '../src/lib/analytics';

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

interface InstructorProfilePageProps {
  instructorId: string;
}

const InstructorProfilePage: React.FC<InstructorProfilePageProps> = ({ instructorId }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => getGlobalTheme());
  const [lang, setLang] = useState<AppLang>(() => getGlobalLang());
  const isLight = theme === 'light';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [instructorId]);

  useEffect(() => {
    const viewedInstructor = getInstructorById(instructorId);
    if (!viewedInstructor) return;
    trackEvent(AnalyticsEvents.VIEW_INSTRUCTOR_PROFILE, {
      instructor_id: viewedInstructor.id,
      instructor_name: viewedInstructor.name,
      instructor_title: viewedInstructor.title[lang],
      language: lang,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorId]);

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

  const cardClass = isLight
    ? 'border-zinc-200 bg-white/95 shadow-2xl'
    : 'border-[rgba(30,64,175,0.45)] bg-[rgba(7,17,31,0.96)] shadow-[0_24px_80px_rgba(0,0,0,0.55)]';

  const panelClass = isLight
    ? 'border-zinc-200 bg-white'
    : 'border-[rgba(30,64,175,0.4)] bg-[rgba(10,20,36,0.92)] shadow-[0_12px_40px_rgba(0,0,0,0.45)]';

  const noticeClass = isLight
    ? 'border-blue-100 bg-blue-50/70 text-blue-800'
    : 'border-[rgba(30,64,175,0.4)] bg-[rgba(10,20,36,0.92)] text-blue-200';

  const instructor = getInstructorById(instructorId);
  const isAmbassador = instructor?.id === 'diana';

  const t = lang === 'pt'
    ? {
        back: '← Voltar à galeria',
        notFoundTitle: 'Arquiteto musical não encontrado',
        notFoundBody: 'Este perfil ainda não existe ou o link está incorreto.',
        personalityTitle: 'Personalidade e estilo de mentoria',
        strengthsTitle: 'Pontos fortes',
        influencesTitle: 'Influências musicais',
        professionalReferencesTitle: 'Referências profissionais',
        musicalBackgroundTitle: 'A música na vida da Diana',
        favoritesTitle: 'Entre os favoritos',
        previousProfile: 'Perfil anterior',
        nextProfile: 'Próximo perfil',
        beyondGATitle: 'Além do GA',
        beyondGAIntro: 'Um pouco da pessoa por trás do Arquiteto.',
        fullName: 'Nome completo',
        age: 'Idade',
        birthplace: 'Local de nascimento',
        livesIn: 'Onde vive',
        otherConnections: 'Outros vínculos',
        occupation: 'Ocupação',
        hobbies: 'Hobbies',
        pastimes: 'Passatempos',
        favoriteFood: 'Comida favorita',
        favoriteDrink: 'Bebida favorita',
        unexpectedPlaylist: 'Fora da playlist esperada',
        quirk: 'Uma mania',
        cantStand: 'Não suporta',
        randomFact: 'Fato aleatório',
        confessableFlaw: 'Um defeito confessável',
        smallPleasure: 'Pequeno prazer',
        modulesTitle: 'Módulos e áreas relacionadas',
        noticeTitle: 'Acompanhamento em breve',
        noticeBody: 'A função de acompanhamento da sua jornada com este arquiteto musical ainda está em construção. Em breve, trilhas, dicas e desafios serão conectados a este perfil.',
        fictionalNotice: 'Este é um personagem fictício do Guitar Architect. A imagem foi gerada por inteligência artificial, e nome, perfil, aparência e características foram criados para fins educacionais e narrativos. Qualquer semelhança com pessoas reais, vivas ou falecidas, é mera coincidência.',
        available: 'Perfil disponível',
      }
    : {
        back: '← Back to gallery',
        notFoundTitle: 'Music architect not found',
        notFoundBody: 'This profile doesn’t exist yet, or the link is incorrect.',
        personalityTitle: 'Personality and mentoring style',
        strengthsTitle: 'Strengths',
        influencesTitle: 'Musical Influences',
        professionalReferencesTitle: 'Professional References',
        musicalBackgroundTitle: 'Music in Diana’s Life',
        favoritesTitle: 'Among Her Favorites',
        previousProfile: 'Previous profile',
        nextProfile: 'Next profile',
        beyondGATitle: 'Beyond GA',
        beyondGAIntro: 'A glimpse of the person behind the Architect.',
        fullName: 'Full name',
        age: 'Age',
        birthplace: 'Place of birth',
        livesIn: 'Lives in',
        otherConnections: 'Other connections',
        occupation: 'Occupation',
        hobbies: 'Hobbies',
        pastimes: 'Pastimes',
        favoriteFood: 'Favorite food',
        favoriteDrink: 'Favorite drink',
        unexpectedPlaylist: 'Outside the expected playlist',
        quirk: 'A quirk',
        cantStand: 'Can’t stand',
        randomFact: 'Random fact',
        confessableFlaw: 'A confessable flaw',
        smallPleasure: 'Small pleasure',
        modulesTitle: 'Related modules and areas',
        noticeTitle: 'Journey tracking coming soon',
        noticeBody: 'The journey-tracking feature for this music architect is still under construction. Soon, tracks, tips and challenges will be connected to this profile.',
        fictionalNotice: 'This is a fictional Guitar Architect character. The image was generated by artificial intelligence, and the name, profile, appearance, and characteristics were created for educational and narrative purposes. Any resemblance to real persons, living or deceased, is purely coincidental.',
        available: 'Profile available',
      };

  if (isAmbassador) {
    t.personalityTitle = lang === 'pt' ? 'Personalidade e estilo de comunicação' : 'Personality and communication style';
    t.noticeTitle = lang === 'pt' ? 'Guia da jornada em construção' : 'Journey guide in progress';
    t.noticeBody = lang === 'pt'
      ? 'Em breve, Diana ajudará a apresentar novidades, orientar caminhos dentro do ecossistema e conectar conteúdos, trilhas e desafios do Guitar Architect.'
      : 'Soon, Diana will help introduce updates, guide paths through the ecosystem, and connect Guitar Architect content, tracks, and challenges.';
  }

  if (!instructor) {
    return (
      <>
        <div className={`relative min-h-screen p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
          <div className="absolute inset-0 pointer-events-none opacity-50" style={gridStyle} />
          <div className="relative mx-auto max-w-[700px] py-16 text-center">
            <button
              type="button"
              onClick={() => navigateTo('/instructors')}
              className="mb-8 inline-flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest hover:underline"
            >
              {t.back}
            </button>
            <div className={`rounded-[40px] border p-10 ${cardClass}`}>
              <h1 className="text-2xl font-black uppercase tracking-tight">{t.notFoundTitle}</h1>
              <p className={`mt-3 text-sm ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{t.notFoundBody}</p>
            </div>
          </div>
        </div>
        <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />
      </>
    );
  }

  const imageFit = instructor.imageFit ?? {};
  const scale = imageFit.scale ?? 1;
  const x = imageFit.x ?? 0;
  const y = imageFit.y ?? 0;
  const heroImage = instructor.heroImage ?? instructor.cardImage;
  const instructorIndex = instructors.findIndex(item => item.id === instructor.id);
  const previousInstructor = instructors[(instructorIndex - 1 + instructors.length) % instructors.length];
  const nextInstructor = instructors[(instructorIndex + 1) % instructors.length];
  const beyondGA = getInstructorBeyondGAById(instructor.id);
  const beyondGAItems = beyondGA
    ? [
        { key: 'fullName', label: t.fullName, value: beyondGA.fullName[lang], wide: false },
        { key: 'age', label: t.age, value: beyondGA.age[lang], wide: false },
        { key: 'birthplace', label: t.birthplace, value: beyondGA.birthplace[lang], wide: false },
        { key: 'livesIn', label: t.livesIn, value: beyondGA.livesIn?.[lang], wide: false },
        { key: 'otherConnections', label: t.otherConnections, value: beyondGA.otherConnections?.[lang], wide: false },
        { key: 'occupation', label: t.occupation, value: beyondGA.occupation[lang], wide: true },
        { key: 'hobbies', label: t.hobbies, value: beyondGA.hobbies[lang], wide: false },
        { key: 'pastimes', label: t.pastimes, value: beyondGA.pastimes[lang], wide: true },
        { key: 'favoriteFood', label: t.favoriteFood, value: beyondGA.favoriteFood[lang], wide: false },
        { key: 'favoriteDrink', label: t.favoriteDrink, value: beyondGA.favoriteDrink[lang], wide: false },
        { key: 'unexpectedPlaylist', label: t.unexpectedPlaylist, value: beyondGA.unexpectedPlaylist[lang], wide: true },
        { key: 'quirk', label: t.quirk, value: beyondGA.quirk[lang], wide: true },
        { key: 'cantStand', label: t.cantStand, value: beyondGA.cantStand[lang], wide: true },
        { key: 'randomFact', label: t.randomFact, value: beyondGA.randomFact[lang], wide: true },
        { key: 'confessableFlaw', label: t.confessableFlaw, value: beyondGA.confessableFlaw[lang], wide: true },
        { key: 'smallPleasure', label: t.smallPleasure, value: beyondGA.smallPleasure[lang], wide: true },
      ].filter(item => Boolean(item.value))
    : [];

  return (
    <>
      <div className={`relative min-h-screen p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
        <div className="absolute inset-0 pointer-events-none opacity-50" style={gridStyle} />

        <div className="relative mx-auto max-w-[900px] py-6">
          <div className="mb-8 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => navigateTo('/instructors')}
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

          <nav
            className="mb-4 grid grid-cols-2 gap-2"
            aria-label={lang === 'pt' ? 'Navegação rápida entre perfis' : 'Quick profile navigation'}
          >
            <button
              type="button"
              onClick={() => navigateTo(`/instructors/${previousInstructor.id}`)}
              className={`min-w-0 rounded-xl border px-3 py-2.5 text-left transition-all ${actionClass}`}
              aria-label={`${t.previousProfile}: ${previousInstructor.name}, ${previousInstructor.title[lang]}`}
            >
              <span className="block break-words text-xs font-black uppercase tracking-tight">← {previousInstructor.name}</span>
              <span className="mt-0.5 block break-words text-[9px] font-bold uppercase tracking-wide opacity-60">
                {previousInstructor.title[lang]}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo(`/instructors/${nextInstructor.id}`)}
              className={`min-w-0 rounded-xl border px-3 py-2.5 text-right transition-all ${actionClass}`}
              aria-label={`${t.nextProfile}: ${nextInstructor.name}, ${nextInstructor.title[lang]}`}
            >
              <span className="block break-words text-xs font-black uppercase tracking-tight">{nextInstructor.name} →</span>
              <span className="mt-0.5 block break-words text-[9px] font-bold uppercase tracking-wide opacity-60">
                {nextInstructor.title[lang]}
              </span>
            </button>
          </nav>

          <div className={`overflow-hidden rounded-[40px] border ${cardClass}`}>
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
              {instructor.introVideo ? (
                <video
                  className="absolute inset-0 h-full w-full bg-black object-contain"
                  src={instructor.introVideo.src}
                  poster={instructor.introVideo.poster ?? heroImage}
                  controls
                  playsInline
                  preload="metadata"
                >
                  <img src={heroImage} alt={instructor.name} className="h-full w-full object-cover object-center" />
                </video>
              ) : (
                <img
                  src={heroImage}
                  alt={instructor.name}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  style={{ transform: `translate(${x}px, ${y}px) scale(${scale})` }}
                />
              )}
            </div>

            <div className="p-8 md:p-12">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{t.available}</p>
              <h1 className="mt-2 text-3xl md:text-5xl font-black italic uppercase tracking-tighter">{instructor.name}</h1>
              <p className="mt-1 text-sm md:text-base font-bold uppercase tracking-widest text-blue-500">{instructor.title[lang]}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {instructor.categories.map(category => (
                  <span
                    key={category}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {getInstructorCategoryLabel(category, lang)}
                  </span>
                ))}
              </div>

              <p className={`mt-6 text-sm md:text-base leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                {instructor.longDescription[lang]}
              </p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-tight mb-3">{t.personalityTitle}</h2>
                  <div className="flex flex-wrap gap-2">
                    {instructor.personality[lang].map(trait => (
                      <span
                        key={trait}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${isLight ? 'bg-blue-50 text-blue-700' : 'bg-blue-500/10 text-blue-300'}`}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-black uppercase tracking-tight mb-3">{t.strengthsTitle}</h2>
                  <ul className={`space-y-1.5 text-xs md:text-sm ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {instructor.strengths[lang].map(strength => (
                      <li key={strength}>• {strength}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {instructor.influences && instructor.influenceNote && (
                <section className={`mt-8 rounded-2xl border p-5 ${panelClass}`}>
                  <h2 className="text-sm font-black uppercase tracking-tight">{t.influencesTitle}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {instructor.influences[lang].map(influence => (
                      <span
                        key={influence}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${isLight ? 'bg-amber-50 text-amber-800' : 'bg-amber-400/10 text-amber-200'}`}
                      >
                        {influence}
                      </span>
                    ))}
                  </div>
                  <p className={`mt-4 text-xs md:text-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {instructor.influenceNote[lang]}
                  </p>
                </section>
              )}

              {instructor.professionalReferences && instructor.professionalReferenceNote && (
                <section className={`mt-8 rounded-2xl border p-5 ${panelClass}`}>
                  <h2 className="text-sm font-black uppercase tracking-tight">{t.professionalReferencesTitle}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {instructor.professionalReferences[lang].map(reference => (
                      <span
                        key={reference}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${isLight ? 'bg-amber-50 text-amber-800' : 'bg-amber-400/10 text-amber-200'}`}
                      >
                        {reference}
                      </span>
                    ))}
                  </div>
                  <p className={`mt-4 text-xs md:text-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {instructor.professionalReferenceNote[lang]}
                  </p>
                </section>
              )}

              {instructor.musicalBackground && instructor.listeningFavorites && instructor.listeningNote && (
                <section className={`mt-8 rounded-2xl border p-5 ${panelClass}`}>
                  <h2 className="text-sm font-black uppercase tracking-tight">{t.musicalBackgroundTitle}</h2>
                  <p className={`mt-3 text-xs md:text-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {instructor.musicalBackground[lang]}
                  </p>
                  <h3 className="mt-5 text-[11px] font-black uppercase tracking-widest text-blue-500">{t.favoritesTitle}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {instructor.listeningFavorites[lang].map(favorite => (
                      <span
                        key={favorite}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${isLight ? 'bg-amber-50 text-amber-800' : 'bg-amber-400/10 text-amber-200'}`}
                      >
                        {favorite}
                      </span>
                    ))}
                  </div>
                  <p className={`mt-4 text-xs md:text-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {instructor.listeningNote[lang]}
                  </p>
                </section>
              )}

              {beyondGAItems.length > 0 && (
                <section className={`mt-8 rounded-2xl border p-5 md:p-6 ${panelClass}`} aria-labelledby="beyond-ga-title">
                  <h2 id="beyond-ga-title" className="text-sm font-black uppercase tracking-tight">{t.beyondGATitle}</h2>
                  <p className={`mt-1 text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.beyondGAIntro}</p>
                  <dl className={`mt-5 grid gap-x-8 sm:grid-cols-2 ${isLight ? 'divide-zinc-200' : 'divide-zinc-800'}`}>
                    {beyondGAItems.map(item => (
                      <div
                        key={item.key}
                        className={`min-w-0 border-t py-4 ${item.wide ? 'sm:col-span-2' : ''} ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}
                      >
                        <dt className="text-[10px] font-black uppercase tracking-widest text-blue-500">{item.label}</dt>
                        <dd className={`mt-1 break-words text-xs md:text-sm leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              <blockquote className={`mt-8 rounded-2xl border p-5 text-center text-sm md:text-base font-black italic ${panelClass}`}>
                “{instructor.quote[lang]}”
              </blockquote>

              <div className="mt-8">
                <h2 className="text-sm font-black uppercase tracking-tight mb-3">{t.modulesTitle}</h2>
                <div className="flex flex-wrap gap-2">
                  {instructor.relatedModules[lang].map(module => (
                    <span
                      key={module}
                      className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${panelClass}`}
                    >
                      {module}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`mt-8 rounded-2xl border p-5 text-center ${noticeClass}`}>
                <p className="text-xs font-black uppercase tracking-widest">{t.noticeTitle}</p>
                <p className="mt-2 text-xs md:text-sm leading-relaxed opacity-90">{t.noticeBody}</p>
                <p className="mt-3 text-[11px] leading-relaxed opacity-70">{t.fictionalNotice}</p>
              </div>

              <nav className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto_1fr]" aria-label={lang === 'pt' ? 'Navegação entre perfis' : 'Profile navigation'}>
                <button
                  type="button"
                  onClick={() => navigateTo(`/instructors/${previousInstructor.id}`)}
                  className={`flex min-h-[64px] flex-col items-start justify-center rounded-xl border px-4 py-3 text-left transition-all ${actionClass}`}
                  aria-label={`${t.previousProfile}: ${previousInstructor.name}`}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">← {t.previousProfile}</span>
                  <span className="mt-1 text-sm font-black uppercase tracking-tight">{previousInstructor.name}</span>
                  <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide opacity-60">
                    {previousInstructor.title[lang]}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('/instructors')}
                  className={`inline-flex min-h-[64px] items-center justify-center rounded-xl border px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${actionClass}`}
                >
                  {t.back}
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo(`/instructors/${nextInstructor.id}`)}
                  className={`flex min-h-[64px] flex-col items-end justify-center rounded-xl border px-4 py-3 text-right transition-all ${actionClass}`}
                  aria-label={`${t.nextProfile}: ${nextInstructor.name}`}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{t.nextProfile} →</span>
                  <span className="mt-1 text-sm font-black uppercase tracking-tight">{nextInstructor.name}</span>
                  <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide opacity-60">
                    {nextInstructor.title[lang]}
                  </span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />
    </>
  );
};

export default InstructorProfilePage;
