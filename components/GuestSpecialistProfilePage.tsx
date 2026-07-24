import React, { useEffect, useState } from 'react';
import { loadConfig } from '../utils/persistence';
import { getGlobalLang, getGlobalTheme, setGlobalPreferences } from '../utils/ecosystemPreferences';
import { getGuestSpecialistById } from '../data/guestSpecialists';
import { getGuestSpecialistProfileContent } from '../data/guestSpecialistProfileContent';
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

interface GuestSpecialistProfilePageProps {
  specialistId: string;
}

const GuestSpecialistProfilePage: React.FC<GuestSpecialistProfilePageProps> = ({ specialistId }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => getGlobalTheme());
  const [lang, setLang] = useState<AppLang>(() => getGlobalLang());
  const specialist = getGuestSpecialistById(specialistId);
  const isLight = theme === 'light';

  useEffect(() => {
    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) {
        target.scrollIntoView({ block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [specialistId]);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = isLight ? 'dark' : 'light';
    const current = loadConfig();
    const next = { ...(current || {}), theme: nextTheme, lang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(nextTheme, lang);
    setTheme(nextTheme);
  };

  const toggleLang = () => {
    const nextLang: AppLang = lang === 'pt' ? 'en' : 'pt';
    const current = loadConfig();
    const next = { ...(current || {}), theme, lang: nextLang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(theme, nextLang);
    setLang(nextLang);
  };

  const content = specialist ? getGuestSpecialistProfileContent(specialist.id) : undefined;

  if (!specialist || specialist.status !== 'active' || !content) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-white">
        <button type="button" onClick={() => navigateTo('/instructors')} className="text-xs font-black uppercase tracking-widest text-blue-500">
          ← {lang === 'pt' ? 'Voltar à galeria' : 'Back to gallery'}
        </button>
        <p className="mt-8 text-sm text-zinc-400">{lang === 'pt' ? 'Especialista não encontrado.' : 'Specialist not found.'}</p>
      </main>
    );
  }

  const title = specialist.name ?? specialist.cardName ?? '';
  const guestBadgeLabel = specialist.guestBadgeLabel?.[lang] ?? (lang === 'pt' ? 'Especialista convidada' : 'Guest specialist');
  const specialty = specialist.specialty?.[lang] ?? '';
  const description = specialist.heroDescription?.[lang] ?? specialist.shortDescription?.[lang] ?? '';
  const quote = specialist.quote?.[lang] ?? '';
  const biographyParagraphs = (specialist.biography?.[lang] ?? '').split(/\n{2,}/).filter(Boolean);

  const gridStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  };

  const panelClass = isLight
    ? 'border-zinc-200 bg-white shadow-xl'
    : 'border-blue-950 bg-slate-950/90 shadow-[0_24px_80px_rgba(0,0,0,0.55)]';
  const softPanelClass = isLight
    ? 'border-zinc-200 bg-slate-50'
    : 'border-zinc-800 bg-zinc-900/60';
  const actionClass = isLight
    ? 'border-zinc-300 bg-white text-zinc-700 hover:border-blue-400'
    : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-blue-500';

  return (
    <>
      <main className={`relative min-h-screen overflow-hidden p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
        <div className="pointer-events-none absolute inset-0 opacity-50" style={gridStyle} />
        <div className="relative mx-auto max-w-[1100px] py-6">
          <header className="mb-8 flex items-center justify-between gap-3">
            <button type="button" onClick={() => navigateTo('/instructors')} className="text-xs font-black uppercase tracking-widest text-blue-500 hover:underline">
              ← {lang === 'pt' ? 'Voltar à galeria' : 'Back to gallery'}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-black transition-all ${actionClass}`}
                aria-label={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
              >
                {isLight ? <MoonIcon /> : <SunIcon />}
              </button>
              <button type="button" onClick={toggleLang} className={`h-9 rounded-xl border px-3 text-xs font-black uppercase ${actionClass}`}>{lang}</button>
            </div>
          </header>

          <section className={`overflow-hidden rounded-[36px] border ${panelClass}`}>
            {specialist.presentationVideo ? (
              <video controls preload="metadata" playsInline poster={specialist.profileImage} className="aspect-video w-full bg-black object-cover">
                <source src={specialist.presentationVideo} type="video/mp4" />
              </video>
            ) : null}
            <div className="p-7 text-center md:p-12">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-500">{guestBadgeLabel}</p>
              <h1 className="mt-3 text-4xl font-black uppercase tracking-tighter md:text-6xl">{title}</h1>
              <p className="mt-2 text-sm font-black uppercase tracking-widest text-blue-500">{specialty}</p>
              <p className={`mx-auto mt-4 max-w-3xl text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {content.taglineLine[lang]}
              </p>
              {quote ? <blockquote className={`mx-auto mt-7 max-w-3xl text-lg font-semibold italic leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}>“{quote}”</blockquote> : null}
              <p className={`mx-auto mt-6 max-w-3xl text-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{description}</p>
            </div>
          </section>

          <section className={`mt-8 rounded-3xl border p-6 md:p-8 ${panelClass}`}>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{content.identityTitle[lang]}</h2>
            <dl className="mt-5 grid gap-3 md:grid-cols-2">
              {content.identity.map(field => (
                <div key={field.label.pt} className={`rounded-2xl border p-4 ${softPanelClass}`}>
                  <dt className={`text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{field.label[lang]}</dt>
                  <dd className="mt-1 text-sm font-semibold leading-relaxed">{field.value[lang]}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`mt-6 rounded-3xl border p-6 md:p-8 ${panelClass}`}>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{content.backgroundTitle[lang]}</h2>
            {biographyParagraphs.map((paragraph, index) => (
              <p key={index} className={`mt-4 text-sm leading-7 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{paragraph}</p>
            ))}
          </section>

          <section className={`mt-6 rounded-3xl border p-6 md:p-8 ${panelClass}`}>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{content.philosophyTitle[lang]}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {content.principles.map(principle => (
                <article key={principle.heading.pt} className={`rounded-2xl border p-5 ${softPanelClass}`}>
                  <h3 className="text-sm font-black leading-snug">{principle.heading[lang]}</h3>
                  <p className={`mt-3 text-sm leading-6 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{principle.body[lang]}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`mt-6 rounded-3xl border p-6 md:p-8 ${panelClass}`}>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{content.methodTitle[lang]}</h2>
            <p className={`mt-3 text-sm leading-7 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {content.methodIntro[lang]}
            </p>
            <div className={`mt-5 grid gap-4 ${content.methodColumnsClass}`}>
              {content.methodSteps.map(step => (
                <article key={`${step.letter}-${step.heading.pt}`} className={`rounded-2xl border p-4 ${softPanelClass}`}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-lg font-black text-white">{step.letter}</div>
                  <h3 className="mt-4 text-sm font-black">{step.heading[lang]}</h3>
                  <p className={`mt-2 text-xs leading-5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{step.body[lang]}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`mt-6 rounded-3xl border p-6 md:p-8 ${panelClass}`}>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{content.whenToSeekTitle[lang]}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {content.whenToSeekItems.map(item => <div key={item.pt} className={`rounded-2xl border p-4 text-sm font-semibold ${softPanelClass}`}>{item[lang]}</div>)}
            </div>
          </section>

          <section id="fontes-e-referencias" className={`mt-6 scroll-mt-24 rounded-3xl border p-6 md:p-8 ${panelClass}`}>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{content.referencesTitle[lang]}</h2>
            <p className={`mt-3 text-sm leading-7 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {content.referencesIntro[lang]}
            </p>
            <div className="mt-5 space-y-6">
              {content.referenceGroups.map(group => (
                <div key={group.heading.pt}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{group.heading[lang]}</h3>
                    {group.kindLabel ? <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{group.kindLabel[lang]}</span> : null}
                  </div>
                  {group.items.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {group.items.map(item => (
                        <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className={`block rounded-2xl border p-4 text-sm font-bold transition hover:border-blue-500 ${softPanelClass}`}>{item.label} ↗</a>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <div className={`mt-6 rounded-3xl border p-6 text-sm leading-relaxed ${isLight ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-amber-900/60 bg-amber-950/30 text-amber-200'}`}>
            {content.disclaimerParagraphs.map((paragraph, index) => {
              const isFirst = index === 0;
              const isLast = index === content.disclaimerParagraphs.length - 1;
              return (
                <p key={index} className={`${isFirst ? '' : 'mt-3'} ${isLast ? 'text-xs opacity-75' : ''}`}>{paragraph[lang]}</p>
              );
            })}
          </div>
        </div>
      </main>
      <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />
    </>
  );
};

export default GuestSpecialistProfilePage;
