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

const PRINCIPLES = [
  {
    pt: { title: 'Resolver problemas reais', body: 'Todo produto deve resolver um problema real. Nunca será desenvolvido apenas porque "vende".' },
    en: { title: 'Solve real problems', body: 'Every product must solve a real problem. It will never be developed just because it "sells".' },
  },
  {
    pt: { title: 'Qualidade Guitar Architect', body: 'Todo produto deve possuir qualidade compatível com a marca Guitar Architect. Não buscamos o menor preço. Buscamos o melhor equilíbrio entre qualidade, funcionalidade e acessibilidade.' },
    en: { title: 'Guitar Architect quality', body: 'Every product must have quality compatible with the Guitar Architect brand. We do not look for the lowest price. We look for the best balance between quality, functionality and accessibility.' },
  },
  {
    pt: { title: 'Viabilidade econômica', body: 'Nunca lançaremos produtos cuja fabricação seja inviável economicamente. Se um produto exigir um investimento incompatível com sua proposta, ele permanecerá apenas como conceito.' },
    en: { title: 'Economic viability', body: 'We will never launch products whose manufacturing is not economically viable. If a product requires an investment incompatible with its proposal, it will remain only as a concept.' },
  },
  {
    pt: { title: 'Aprimorar, não reinventar', body: 'Sempre que possível utilizaremos processos industriais já existentes. Nosso objetivo é personalizar e aprimorar soluções reais, e não reinventar produtos que já funcionam muito bem.' },
    en: { title: 'Improve, not reinvent', body: 'Whenever possible we will use existing industrial processes. Our goal is to customize and improve real solutions, not reinvent products that already work very well.' },
  },
  {
    pt: { title: 'Estágio de desenvolvimento claro', body: 'Todo produto deverá comunicar claramente seu estágio de desenvolvimento: Ideação, Pesquisa, Prototipagem conceitual, Consulta pública, Consulta a fornecedores, Prototipagem física, Validação, Aprovação, Disponibilização.' },
    en: { title: 'Clear development stage', body: 'Every product must clearly communicate its development stage: Ideation, Research, Concept prototyping, Public consultation, Supplier consultation, Physical prototyping, Validation, Approval, Availability.' },
  },
  {
    pt: { title: 'Qualidade acima de quantidade', body: 'Não criaremos produtos apenas para ampliar catálogo. Preferimos dez excelentes produtos do que cem produtos medianos.' },
    en: { title: 'Quality above quantity', body: 'We will not create products just to expand the catalog. We prefer ten excellent products over a hundred average ones.' },
  },
  {
    pt: { title: 'Parcerias alinhadas', body: 'Toda parceria institucional deverá respeitar os mesmos princípios de qualidade e transparência.' },
    en: { title: 'Aligned partnerships', body: 'Every institutional partnership must respect the same principles of quality and transparency.' },
  },
  {
    pt: { title: 'Escuta da comunidade', body: 'O feedback da comunidade será considerado durante todo o processo de desenvolvimento.' },
    en: { title: 'Listening to the community', body: 'Community feedback will be considered throughout the entire development process.' },
  },
  {
    pt: { title: 'Fornecedores nacionais', body: 'Sempre que possível priorizaremos fornecedores nacionais.' },
    en: { title: 'National suppliers', body: 'Whenever possible we will prioritize national suppliers.' },
  },
  {
    pt: { title: 'Crescimento no mesmo ritmo', body: 'O Gear deverá crescer no mesmo ritmo do Guitar Architect. A qualidade da experiência será sempre mais importante do que a velocidade de expansão.' },
    en: { title: 'Growth at the same pace', body: 'Gear must grow at the same pace as Guitar Architect. The quality of the experience will always matter more than the speed of expansion.' },
  },
] as const;

const GearCurationManualPage: React.FC = () => {
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
              {isPt ? 'Manual de Curadoria' : 'Curation Manual'}
            </h1>
            <p className="mt-3 text-zinc-500 font-bold uppercase text-[12px] md:text-sm tracking-[0.2em]">
              {isPt ? 'Versão 1.0' : 'Version 1.0'}
            </p>
          </div>

          <div className={`rounded-[40px] border p-8 md:p-12 ${cardClass}`}>
            <div className="space-y-8 text-sm md:text-base">

              <section>
                <div className="space-y-3">
                  <p>{isPt ? 'O Gear não nasceu para vender produtos.' : 'Gear was not created to sell products.'}</p>
                  <p>{isPt ? 'Nasceu para selecionar soluções.' : 'It was created to select solutions.'}</p>
                  <p>
                    {isPt
                      ? 'Todo item apresentado pelo Guitar Architect deverá possuir uma justificativa clara para existir.'
                      : 'Every item presented by Guitar Architect must have a clear justification for existing.'}
                  </p>
                  <p>
                    {isPt
                      ? 'Nossa intenção é construir uma linha de produtos pequena, útil, durável e coerente com aquilo que acreditamos como músicos.'
                      : 'Our intention is to build a small, useful, durable product line coherent with what we believe as musicians.'}
                  </p>
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section className={`rounded-3xl border p-6 text-center ${accentPanelClass}`}>
                <h2 className={`text-sm font-black uppercase tracking-widest mb-4 ${accentTextClass}`}>
                  {isPt ? 'Antes dos princípios' : 'Before the principles'}
                </h2>
                <div className={`mx-auto max-w-2xl space-y-3 text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                  <p>
                    {isPt
                      ? 'Este documento não foi criado para estabelecer regras aos fabricantes.'
                      : 'This document was not created to set rules for manufacturers.'}
                  </p>
                  <p>{isPt ? 'Foi criado para estabelecer regras para nós mesmos.' : 'It was created to set rules for ourselves.'}</p>
                  <p>
                    {isPt
                      ? 'Toda decisão envolvendo produtos Gear deverá respeitar estes princípios.'
                      : 'Every decision involving Gear products must respect these principles.'}
                  </p>
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-5">{isPt ? 'Princípios' : 'Principles'}</h2>
                <div className="space-y-4">
                  {PRINCIPLES.map((principle, index) => (
                    <div key={principle.pt.title} className={`rounded-2xl border p-5 ${panelClass}`}>
                      <div className="flex items-start gap-4">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${accentPanelClass} ${accentValueClass}`}>
                          {index + 1}
                        </span>
                        <div>
                          <h3 className={`text-sm font-black uppercase tracking-tight ${accentTextClass}`}>{principle[lang].title}</h3>
                          <p className={`mt-2 text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>{principle[lang].body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section className={`rounded-3xl border p-6 text-center ${accentPanelClass}`}>
                <p className={`text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                  {isPt
                    ? 'Este documento poderá evoluir continuamente conforme amadurecem o ecossistema Guitar Architect e sua linha de produtos.'
                    : 'This document may keep evolving as the Guitar Architect ecosystem and its product line mature.'}
                </p>
                <p className={`mt-4 text-xs font-black uppercase tracking-widest ${accentTextClass}`}>
                  {isPt ? 'Versão 1.0' : 'Version 1.0'}
                </p>
              </section>

              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-tight">{isPt ? 'Manual de Curadoria' : 'Curation Manual'}</p>
                <p className={`mt-1 text-[11px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {isPt ? 'Documento institucional do Guitar Architect' : 'A Guitar Architect institutional document'}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />
    </>
  );
};

export default GearCurationManualPage;
