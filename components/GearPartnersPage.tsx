import React, { useEffect, useState } from 'react';
import { loadConfig } from '../utils/persistence';
import { getGlobalLang, getGlobalTheme, setGlobalPreferences } from '../utils/ecosystemPreferences';
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

const GearPartnersPage: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => getGlobalTheme());
  const [lang, setLang] = useState<AppLang>(() => getGlobalLang());
  const isLight = theme === 'light';
  const isPt = lang === 'pt';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const gridStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  };

  const cardClass = isLight
    ? 'border-zinc-200 bg-white/95 shadow-2xl'
    : 'border-[rgba(30,64,175,0.45)] bg-[rgba(7,17,31,0.96)] shadow-[0_24px_80px_rgba(0,0,0,0.55)]';
  const panelClass = isLight
    ? 'border-zinc-200 bg-white'
    : 'border-[rgba(30,64,175,0.4)] bg-[rgba(10,20,36,0.92)] shadow-[0_12px_40px_rgba(0,0,0,0.45)]';
  const accentPanelClass = isLight
    ? 'border-blue-200/60 bg-blue-50/60'
    : 'border-[rgba(30,64,175,0.4)] bg-[rgba(10,20,36,0.92)] shadow-[0_12px_40px_rgba(0,0,0,0.45)]';
  const accentTextClass = isLight ? 'text-blue-700' : 'text-blue-300';
  const accentValueClass = isLight ? 'text-blue-600' : 'text-blue-400';
  const actionClass = isLight
    ? 'border-zinc-300 bg-white text-zinc-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:border-blue-400'
    : 'border-zinc-700 bg-zinc-900 text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:border-blue-500';

  const cycleSteps = isPt
    ? [
        { title: 'Curadoria', body: 'Os princípios que orientam cada escolha.', path: '/gear/curadoria' },
        { title: 'Laboratório Gear', body: 'Os projetos hoje em pesquisa e desenvolvimento.', path: '/gear' },
        { title: 'Parceiros homologados', body: 'Os fabricantes e parceiros oficialmente integrados a esta linha.', path: undefined },
      ]
    : [
        { title: 'Curation', body: 'The principles guiding every choice.', path: '/gear/curadoria' },
        { title: 'Gear Lab', body: 'The projects currently in research and development.', path: '/gear' },
        { title: 'Homologated partners', body: 'The manufacturers and partners officially integrated into this line.', path: undefined },
      ];

  return (
    <>
      <div className={`relative min-h-screen p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
        <div className="absolute inset-0 pointer-events-none opacity-50" style={gridStyle} />

        <div className="relative mx-auto max-w-[1000px] py-6">
          <div className="mb-8 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => navigateTo('/gear')}
              className="inline-flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest hover:underline"
            >
              {isPt ? '← Voltar ao Gear' : '← Back to Gear'}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-black transition-all ${actionClass}`}
                aria-label={isLight ? (isPt ? 'Ativar modo escuro' : 'Enable dark mode') : (isPt ? 'Ativar modo claro' : 'Enable light mode')}
              >
                {isLight ? <MoonIcon /> : <SunIcon />}
              </button>
              <button
                type="button"
                onClick={toggleLang}
                className={`min-h-[36px] rounded-xl border px-3 py-2 text-[11px] font-black uppercase transition-all ${actionClass}`}
              >
                {lang.toUpperCase()}
              </button>
            </div>
          </div>

          <div className="text-center mb-10">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Guitar Architect · Gear</p>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
              {isPt ? 'Parceiros do Gear' : 'Gear Partners'}
            </h1>
            <p className="mt-3 text-zinc-500 font-bold uppercase text-[12px] md:text-sm tracking-[0.2em]">
              {isPt ? 'Fabricantes e parceiros homologados pelo Guitar Architect.' : 'Manufacturers and partners homologated by Guitar Architect.'}
            </p>
          </div>

          <div className={`rounded-[40px] border p-8 md:p-12 ${cardClass}`}>
            <div className="space-y-8 text-sm md:text-base">

              <section>
                <div className="space-y-3">
                  <p>
                    {isPt
                      ? 'Esta página apresentará, oficialmente, os fabricantes e parceiros institucionais homologados pelo Guitar Architect dentro da linha Gear.'
                      : 'This page will officially present the manufacturers and institutional partners homologated by Guitar Architect within the Gear line.'}
                  </p>
                  <p>
                    {isPt
                      ? 'Nenhuma parceria foi fechada até o momento.'
                      : 'No partnership has been closed so far.'}
                  </p>
                  <p>
                    {isPt
                      ? 'Assim que uma parceria institucional for confirmada — em áreas como gráficas, fabricação de palhetas, confecção têxtil ou fornecimento de cases — ela passará a integrar esta página.'
                      : 'As soon as an institutional partnership is confirmed — in areas such as printing, pick manufacturing, textile production or case supply — it will start appearing on this page.'}
                  </p>
                </div>
                <p className={`mt-5 rounded-2xl border p-5 text-center text-sm font-black uppercase tracking-tight ${accentPanelClass} ${accentTextClass}`}>
                  {isPt ? 'Nenhum parceiro homologado no momento' : 'No homologated partner at the moment'}
                </p>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-2">{isPt ? 'Como o Gear se constrói' : 'How Gear is built'}</h2>
                <p className={`mb-5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {isPt
                    ? 'A evolução do Gear segue um ciclo simples e público.'
                    : 'Gear’s evolution follows a simple, public cycle.'}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {cycleSteps.map((step, index) => {
                    const content = (
                      <>
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${accentPanelClass} ${accentValueClass}`}>{index + 1}</span>
                        <h3 className={`mt-3 text-sm font-black uppercase tracking-tight ${accentTextClass}`}>{step.title}</h3>
                        <p className={`mt-2 text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>{step.body}</p>
                      </>
                    );
                    return step.path ? (
                      <button
                        key={step.title}
                        type="button"
                        onClick={() => navigateTo(step.path!)}
                        className={`rounded-2xl border p-5 text-left transition hover:border-blue-400 ${panelClass}`}
                      >
                        {content}
                      </button>
                    ) : (
                      <div key={step.title} className={`rounded-2xl border p-5 ${panelClass}`}>
                        {content}
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>

      <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />
    </>
  );
};

export default GearPartnersPage;
