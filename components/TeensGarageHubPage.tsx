import React from 'react';
import { getTeensLang, getTeensTheme } from '../utils/ecosystemPreferences';

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
        projectTitle: 'EVH Frankenstein Tribute',
        projectStatus: 'Available',
        projectDescription: 'A visual guide to understand and recreate the Red • White • Black aesthetic of Eddie Van Halen\'s most iconic guitar.',
        projectCta: 'EXPLORE PROJECT',
        soon: 'Coming soon',
      };

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? 'rgba(148,163,184,0.35)' : 'rgba(129,140,248,0.25)'} 1px, transparent 1px)`,
    backgroundSize: '100% 28px',
  };

  return (
    <div className={`min-h-screen relative p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-[#03010a] text-violet-50'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigateTo('/teens')}
          className={`mb-6 rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/60 text-violet-200'}`}
        >
          {copy.backTeens}
        </button>

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">{copy.breadcrumb}</p>

        <header className={`mt-3 overflow-hidden rounded-3xl border ${isLight ? 'border-violet-200 bg-white/90' : 'border-violet-700/45 bg-zinc-900/65'}`}>
          <div className="grid gap-8 p-7 md:grid-cols-[1.2fr,1fr] md:items-center md:gap-10 md:p-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">{copy.title}</h1>
              <p className={`mt-4 text-base font-bold leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{copy.subtitle}</p>
              <p className={`mt-4 text-[15px] leading-7 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{copy.body}</p>
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
        </header>

        <section className="mt-9 grid gap-5 md:grid-cols-2">
          <article className={`rounded-3xl border p-5 md:p-6 ${isLight ? 'border-violet-200 bg-violet-50/60' : 'border-violet-600/35 bg-violet-950/20'}`}>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400">Projeto 001 · {copy.projectStatus}</p>
            <h2 className="mt-2 text-2xl font-black">{copy.projectTitle}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {projectBadges.map((badge) => (
                <span key={badge} className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${isLight ? 'border-cyan-300 bg-cyan-50 text-cyan-700' : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'}`}>
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
          </article>

          {soonProjects.map((title) => (
            <article key={title} className={`rounded-3xl border p-5 ${isLight ? 'border-zinc-300 bg-white/80' : 'border-zinc-700 bg-zinc-900/60'}`}>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">{copy.soon}</p>
              <h3 className="mt-2 text-lg font-black">{title}</h3>
              <p className={`mt-3 text-sm leading-6 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Builds em preparação para os próximos capítulos da Garagem.
              </p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default TeensGarageHubPage;
