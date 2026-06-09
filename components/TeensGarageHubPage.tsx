import React from 'react';
import { getTeensLang, getTeensTheme } from '../utils/ecosystemPreferences';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const soonProjects: string[] = ['Strat Neo Tribute', 'Offset Street Lab', 'Superstrat Future Build'];
const projectBadges: string[] = ['DIY', 'EVH', 'Custom Paint', 'Garage Build'];

const TeensGarageHubPage: React.FC = () => {
  const lang = getTeensLang();
  const isLight = getTeensTheme() === 'light';

  const copy = lang === 'pt'
    ? {
        breadcrumb: 'GA Teens / Garagem',
        title: 'GARAGEM',
        subtitle: 'A oficina visual do GA Teens: builds icônicos, pintura custom e experimentos de identidade sonora.',
        body: 'Aqui você aprende como guitarras lendárias foram pensadas, pintadas, modificadas e transformadas em instrumentos únicos.',
        backTeens: 'Voltar ao Teens',
        studio: 'Ir para Studio',
        projectTitle: 'EVH Frankenstein Tribute',
        projectStatus: 'Disponível',
        projectDescription: 'Um guia visual para entender e recriar a estética Red • White • Black da guitarra mais icônica de Eddie Van Halen.',
        projectCta: 'EXPLORAR PROJETO',
        soon: 'Em breve',
      }
    : {
        breadcrumb: 'GA Teens / Garagem',
        title: 'GARAGEM',
        subtitle: 'The GA Teens visual workshop: iconic builds, custom paint and sonic identity experiments.',
        body: 'Learn how legendary guitars were designed, painted, modified and transformed into one-of-a-kind instruments.',
        backTeens: 'Back to Teens',
        studio: 'Go to Studio',
        projectTitle: 'EVH Frankenstein Tribute',
        projectStatus: 'Available',
        projectDescription: 'A visual guide to understand and recreate the Red • White • Black aesthetic of Eddie Van Halen\'s most iconic guitar.',
        projectCta: 'EXPLORE PROJECT',
        soon: 'Coming soon',
      };

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? 'rgba(148,163,184,0.35)' : 'rgba(139,92,246,0.18)'} 1px, transparent 1px)`,
    backgroundSize: '100% 28px',
  };

  return (
    <div className={`min-h-screen relative p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-[#03010a] text-violet-50'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />

      <div className="relative mx-auto max-w-6xl">
        <EcosystemPageActions ecosystem="teens" isLight={isLight} backLabel={copy.backTeens} backPath="/teens" />

        <InternalEcosystemHeader ecosystem="teens" isLight={isLight} title={copy.title} subtitle={copy.subtitle} />

        <section className={`overflow-hidden rounded-3xl border p-5 md:p-6 ${isLight ? 'border-violet-200 bg-white/90' : 'border-violet-700/45 bg-zinc-900/65'}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">{copy.breadcrumb}</p>
        </section>

        <section className="mt-9 space-y-5">
          <article className={`rounded-3xl border p-5 md:p-6 ${isLight ? 'border-violet-200 bg-violet-50/60' : 'border-violet-600/35 bg-violet-950/20'}`}>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.9fr)] lg:items-center xl:grid-cols-[minmax(0,1.35fr)_minmax(460px,0.85fr)]">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400">Projeto 001 · {copy.projectStatus}</p>
                <h2 className="mt-2 max-w-[12ch] text-3xl font-black md:text-4xl">{copy.projectTitle}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {projectBadges.map((badge) => (
                    <span key={badge} className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${isLight ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-violet-500/40 bg-violet-500/10 text-violet-300'}`}>
                      {badge}
                    </span>
                  ))}
                </div>
                <p className={`mt-4 text-sm leading-7 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{copy.projectDescription}</p>
                <button
                  type="button"
                  onClick={() => navigateTo('/teens/garage/evh-frankenstein-tribute')}
                  className="mt-5 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-rose-600 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-white"
                >
                  {copy.projectCta}
                </button>
              </div>

              <div className="rounded-2xl bg-black/20 p-2.5">
                <img
                  src="/teens/garage/evh/01.evh6imagens.webp"
                  alt="Painel com seis etapas visuais do projeto EVH Frankenstein Tribute"
                  loading="lazy"
                  className="w-full rounded-xl object-cover shadow-lg"
                />
              </div>
            </div>
          </article>

          <div className="grid gap-5 md:grid-cols-3">
            {soonProjects.map((title) => (
              <article key={title} className={`rounded-3xl border p-5 ${isLight ? 'border-zinc-300 bg-white/80' : 'border-zinc-700 bg-zinc-900/60'}`}>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">{copy.soon}</p>
                <h3 className="mt-2 text-lg font-black">{title}</h3>
                <p className={`mt-3 text-sm leading-6 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Builds em preparação para os próximos capítulos da Garagem.
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('/teens')}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] transition-all hover:from-violet-500 hover:to-fuchsia-500 active:scale-95"
          >
            {copy.backTeens}
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/studio')}
            className="rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-500 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(8,145,178,0.3)] transition-all hover:from-cyan-500 hover:to-sky-400 active:scale-95"
          >
            {copy.studio}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeensGarageHubPage;
