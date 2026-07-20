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

const GuestSpecialistProfilePage: React.FC<{ specialistId: string }> = ({ specialistId }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => getGlobalTheme());
  const [lang, setLang] = useState<AppLang>(() => getGlobalLang());
  const isLight = theme === 'light';
  const specialist = getGuestSpecialistById(specialistId);

  useEffect(() => window.scrollTo(0, 0), [specialistId]);

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
  const panelClass = isLight
    ? 'border-zinc-200 bg-white/95 shadow-xl'
    : 'border-[rgba(30,64,175,0.45)] bg-[rgba(7,17,31,0.96)] shadow-[0_24px_80px_rgba(0,0,0,0.55)]';
  const actionClass = isLight
    ? 'border-zinc-300 bg-white text-zinc-700 hover:border-blue-400'
    : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-blue-500';

  if (!specialist || specialist.status !== 'active') {
    return (
      <div className={`min-h-screen p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
        <button onClick={() => navigateTo('/instructors')} className="text-xs font-black uppercase tracking-widest text-blue-500">← {lang === 'pt' ? 'Voltar à galeria' : 'Back to gallery'}</button>
      </div>
    );
  }

  const t = lang === 'pt'
    ? {
        back: '← Voltar à galeria', eyebrow: 'Especialista convidada', presentation: 'Apresentação', biography: 'Trajetória', philosophy: 'Filosofia profissional', areas: 'Áreas de orientação', profile: 'Perfil',
        fullName: 'Nome completo', age: 'Idade', birthplace: 'Local de nascimento', livesIn: 'Onde vive', occupation: 'Ocupação', instrument: 'Instrumento', role: 'Papel no GA',
        notice: 'Conteúdo educacional: as orientações apresentadas no Guitar Architect são gerais e não substituem consulta, exame físico, diagnóstico ou tratamento realizado por profissional de saúde. Em caso de dor persistente, formigamento, perda de força, limitação de movimento, trauma, alteração auditiva ou outro sintoma relevante, interrompa a atividade e procure atendimento profissional.',
        fictional: 'Dra. Helena é uma personagem fictícia criada para fins educacionais e narrativos. Sua imagem e seu vídeo foram gerados por inteligência artificial. Qualquer semelhança com pessoas reais é mera coincidência.',
      }
    : {
        back: '← Back to gallery', eyebrow: 'Guest specialist', presentation: 'Introduction', biography: 'Background', philosophy: 'Professional philosophy', areas: 'Guidance areas', profile: 'Profile',
        fullName: 'Full name', age: 'Age', birthplace: 'Place of birth', livesIn: 'Lives in', occupation: 'Occupation', instrument: 'Instrument', role: 'Role at GA',
        notice: 'Educational content: Guitar Architect provides general information and does not replace consultation, physical examination, diagnosis or treatment by a qualified health professional. In case of persistent pain, tingling, loss of strength, restricted movement, trauma, hearing changes or another relevant symptom, stop the activity and seek professional care.',
        fictional: 'Dr. Helena is a fictional character created for educational and narrative purposes. Her image and video were generated with artificial intelligence. Any resemblance to real people is purely coincidental.',
      };

  const profileItems = specialist.profile ? [
    [t.fullName, specialist.profile.fullName[lang]],
    [t.age, specialist.profile.age[lang]],
    [t.birthplace, specialist.profile.birthplace[lang]],
    [t.livesIn, specialist.profile.livesIn[lang]],
    [t.occupation, specialist.profile.occupation[lang]],
    [t.instrument, specialist.profile.instrument[lang]],
    [t.role, specialist.profile.role[lang]],
  ] : [];

  return (
    <>
      <main className={`relative min-h-screen p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
        <div className="absolute inset-0 pointer-events-none opacity-50" style={gridStyle} />
        <div className="relative mx-auto max-w-[1100px] py-6">
          <div className="mb-8 flex items-center justify-between gap-3">
            <button onClick={() => navigateTo('/instructors')} className="text-xs font-black uppercase tracking-widest text-blue-500 hover:underline">{t.back}</button>
            <div className="flex gap-2">
              <button onClick={handleToggleTheme} className={`h-9 rounded-xl border px-3 text-xs font-black ${actionClass}`}>{isLight ? '◐' : '☀'}</button>
              <button onClick={handleToggleLang} className={`h-9 rounded-xl border px-3 text-xs font-black uppercase ${actionClass}`}>{lang}</button>
            </div>
          </div>

          <section className={`overflow-hidden rounded-[36px] border ${panelClass}`}>
            <div className="grid md:grid-cols-[0.85fr_1.15fr]">
              <div className="min-h-[420px] bg-zinc-100">
                {specialist.profileImage && <img src={specialist.profileImage} alt={specialist.cardName} className="h-full w-full object-cover object-center" />}
              </div>
              <div className="flex flex-col justify-center p-7 md:p-12">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-500">{t.eyebrow}</p>
                <h1 className="mt-3 text-4xl font-black uppercase tracking-tighter md:text-6xl">{specialist.cardName}</h1>
                <p className="mt-2 text-sm font-black uppercase tracking-widest text-blue-500">{specialist.specialty[lang]}</p>
                <blockquote className={`mt-7 border-l-4 border-blue-500 pl-5 text-lg font-semibold italic leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}>“{specialist.quote?.[lang]}”</blockquote>
                <p className={`mt-6 text-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{specialist.shortDescription[lang]}</p>
              </div>
            </div>
          </section>

          {specialist.presentationVideo && (
            <section className={`mt-8 overflow-hidden rounded-3xl border p-4 md:p-6 ${panelClass}`}>
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-blue-500">{t.presentation}</h2>
              <video controls preload="metadata" playsInline poster={specialist.profileImage} className="aspect-video w-full rounded-2xl bg-black object-cover">
                <source src={specialist.presentationVideo} type="video/mp4" />
              </video>
            </section>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <section className={`rounded-3xl border p-6 ${panelClass}`}><h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{t.biography}</h2><p className={`mt-4 text-sm leading-7 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{specialist.biography?.[lang]}</p></section>
            <section className={`rounded-3xl border p-6 ${panelClass}`}><h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{t.philosophy}</h2><p className={`mt-4 text-sm leading-7 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{specialist.philosophy?.[lang]}</p></section>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <section className={`rounded-3xl border p-6 ${panelClass}`}><h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{t.areas}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{specialist.areas?.map(area => <div key={area.pt} className={`rounded-2xl border p-4 text-sm font-semibold ${isLight ? 'border-zinc-200 bg-slate-50' : 'border-zinc-800 bg-zinc-900/60'}`}>{area[lang]}</div>)}</div></section>
            <section className={`rounded-3xl border p-6 ${panelClass}`}><h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{t.profile}</h2><dl className="mt-4 space-y-4">{profileItems.map(([label, value]) => <div key={label}><dt className={`text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>)}</dl></section>
          </div>

          <div className={`mt-6 rounded-3xl border p-6 text-sm leading-relaxed ${isLight ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-amber-900/60 bg-amber-950/30 text-amber-200'}`}><p>{t.notice}</p><p className="mt-3 text-xs opacity-75">{t.fictional}</p></div>
        </div>
      </main>
      <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />
    </>
  );
};

export default GuestSpecialistProfilePage;
