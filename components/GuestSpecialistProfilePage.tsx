import React, { useEffect, useState } from 'react';
import { loadConfig } from '../utils/persistence';
import { getGlobalLang, getGlobalTheme, setGlobalPreferences } from '../utils/ecosystemPreferences';
import { getGuestSpecialistById } from '../data/guestSpecialists';
import AppFooter from './AppFooter';

type ThemeMode = 'light' | 'dark';
type AppLang = 'pt' | 'en';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

interface GuestSpecialistProfilePageProps {
  specialistId: string;
}

const GuestSpecialistProfilePage: React.FC<GuestSpecialistProfilePageProps> = ({ specialistId }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => getGlobalTheme());
  const [lang, setLang] = useState<AppLang>(() => getGlobalLang());
  const specialist = getGuestSpecialistById(specialistId);
  const isLight = theme === 'light';

  useEffect(() => {
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

  if (!specialist || specialist.status !== 'active') {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-white">
        <button type="button" onClick={() => navigateTo('/instructors')} className="text-xs font-black uppercase tracking-widest text-blue-500">
          ← {lang === 'pt' ? 'Voltar à galeria' : 'Back to gallery'}
        </button>
        <p className="mt-8 text-sm text-zinc-400">
          {lang === 'pt' ? 'Especialista não encontrado.' : 'Specialist not found.'}
        </p>
      </main>
    );
  }

  const title = specialist.cardName ?? specialist.name ?? 'Dra. Helena';
  const specialty = specialist.specialty?.[lang] ?? '';
  const description = specialist.shortDescription?.[lang] ?? '';
  const quote = specialist.quote?.[lang] ?? '';
  const biography = specialist.biography?.[lang] ?? '';
  const philosophy = specialist.philosophy?.[lang] ?? '';
  const areas = specialist.areas ?? [];

  const gridStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  };

  const panelClass = isLight
    ? 'border-zinc-200 bg-white shadow-xl'
    : 'border-blue-950 bg-slate-950/90 shadow-[0_24px_80px_rgba(0,0,0,0.55)]';

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
              <button type="button" onClick={toggleTheme} className="h-9 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-xs font-black text-zinc-200">
                {isLight ? '◐' : '☀'}
              </button>
              <button type="button" onClick={toggleLang} className="h-9 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-xs font-black uppercase text-zinc-200">
                {lang}
              </button>
            </div>
          </header>

          <section className={`overflow-hidden rounded-[36px] border ${panelClass}`}>
            <div className="grid md:grid-cols-[0.85fr_1.15fr]">
              <div className="min-h-[420px] bg-zinc-900">
                {specialist.profileImage ? (
                  <img src={specialist.profileImage} alt={title} className="h-full w-full object-cover object-center" />
                ) : null}
              </div>
              <div className="flex flex-col justify-center p-7 md:p-12">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-500">
                  {lang === 'pt' ? 'Especialista convidada' : 'Guest specialist'}
                </p>
                <h1 className="mt-3 text-4xl font-black uppercase tracking-tighter md:text-6xl">{title}</h1>
                <p className="mt-2 text-sm font-black uppercase tracking-widest text-blue-500">{specialty}</p>
                {quote ? <blockquote className="mt-7 border-l-4 border-blue-500 pl-5 text-lg font-semibold italic leading-relaxed">“{quote}”</blockquote> : null}
                <p className={`mt-6 text-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{description}</p>
              </div>
            </div>
          </section>

          {specialist.presentationVideo ? (
            <section className={`mt-8 rounded-3xl border p-4 md:p-6 ${panelClass}`}>
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-blue-500">
                {lang === 'pt' ? 'Apresentação' : 'Introduction'}
              </h2>
              <video controls preload="metadata" playsInline poster={specialist.profileImage} className="aspect-video w-full rounded-2xl bg-black object-cover">
                <source src={specialist.presentationVideo} type="video/mp4" />
              </video>
            </section>
          ) : null}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <section className={`rounded-3xl border p-6 ${panelClass}`}>
              <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{lang === 'pt' ? 'Trajetória' : 'Background'}</h2>
              <p className={`mt-4 text-sm leading-7 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{biography}</p>
            </section>
            <section className={`rounded-3xl border p-6 ${panelClass}`}>
              <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{lang === 'pt' ? 'Filosofia profissional' : 'Professional philosophy'}</h2>
              <p className={`mt-4 text-sm leading-7 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{philosophy}</p>
            </section>
          </div>

          <section className={`mt-6 rounded-3xl border p-6 ${panelClass}`}>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{lang === 'pt' ? 'Áreas de orientação' : 'Guidance areas'}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {areas.map((area) => (
                <div key={area.pt} className={`rounded-2xl border p-4 text-sm font-semibold ${isLight ? 'border-zinc-200 bg-slate-50' : 'border-zinc-800 bg-zinc-900/60'}`}>
                  {area[lang]}
                </div>
              ))}
            </div>
          </section>

          <div className={`mt-6 rounded-3xl border p-6 text-sm leading-relaxed ${isLight ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-amber-900/60 bg-amber-950/30 text-amber-200'}`}>
            <p>{lang === 'pt' ? 'Conteúdo educacional: as orientações são gerais e não substituem avaliação, diagnóstico ou tratamento por profissional de saúde.' : 'Educational content: this guidance is general and does not replace assessment, diagnosis or treatment by a health professional.'}</p>
            <p className="mt-3 text-xs opacity-75">{lang === 'pt' ? 'Dra. Helena é uma personagem fictícia criada para fins educacionais. Sua imagem e seu vídeo foram gerados por inteligência artificial.' : 'Dr. Helena is a fictional character created for educational purposes. Her image and video were generated with artificial intelligence.'}</p>
          </div>
        </div>
      </main>
      <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />
    </>
  );
};

export default GuestSpecialistProfilePage;
