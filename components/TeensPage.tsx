import React, { useState } from 'react';
import { getTeensLang, getTeensTheme } from '../utils/ecosystemPreferences';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const TeensPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const [lang, setLang] = useState<'pt' | 'en'>(() => getTeensLang());
  const isLight = theme === 'light';

  const copy = lang === 'pt'
    ? {
        title: 'GA Teens',
        subtitle: 'Desafios, riffs, treino guiado e evolução musical para a próxima geração de arquitetos do som.',
        earlyAccess: 'Acesso antecipado',
        ecosystem: 'Explorar Ecossistema',
        studio: 'Modo Profissional (Studio)',
        locked: 'Nível bloqueado',
        theme: 'Tema',
        light: 'Claro',
        dark: 'Escuro',
      }
    : {
        title: 'GA Teens',
        subtitle: 'Challenges, riffs, guided practice and musical growth for the next generation of sound architects.',
        earlyAccess: 'Early access',
        ecosystem: 'Explore Ecosystem',
        studio: 'Professional Mode (Studio)',
        locked: 'Level locked',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
      };

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ga_teens_theme', next);
      return next;
    });
  };

  const handleToggleLang = () => {
    setLang((prev) => {
      const next = prev === 'pt' ? 'en' : 'pt';
      localStorage.setItem('ga_teens_lang', next);
      return next;
    });
  };

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? '#cbd5e1' : '#312e81'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#cbd5e1' : '#312e81'} 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
  };

  return (
    <div className={`min-h-screen relative p-6 md:p-12 transition-all duration-500 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-[#03010a] text-violet-50'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent_50%)]" />

      <div className="relative mx-auto max-w-5xl">
        <header className={`relative flex flex-col items-center text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 ${isLight ? 'rounded-[36px] border border-violet-200/70 bg-white/75 backdrop-blur-sm px-4 py-8 md:px-8 md:py-10 shadow-[0_20px_50px_rgba(139,92,246,0.08)]' : ''}`}>
          <div className="hidden md:flex absolute right-0 top-2 items-center gap-2">
            <button
              onClick={handleToggleTheme}
              className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/70 text-violet-200'}`}
            >
              {copy.theme}: {isLight ? copy.light : copy.dark}
            </button>
            <button
              onClick={handleToggleLang}
              className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/70 text-violet-200'}`}
            >
              {lang.toUpperCase()}
            </button>
          </div>

          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-violet-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src="/gateenslogo.webp" alt="GA Teens" className="relative w-36 h-36 md:w-52 md:h-52 object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-transform group-hover:scale-105" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-violet-500">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-bold opacity-80 leading-relaxed italic">
            {copy.subtitle}
          </p>
          <span className="mt-6 px-5 py-2 rounded-full border border-violet-500/50 bg-violet-500/10 text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            {copy.earlyAccess}
          </span>

          <div className="mt-3 flex md:hidden gap-2">
            <button
              onClick={handleToggleTheme}
              className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/70 text-violet-200'}`}
            >
              {copy.theme}: {isLight ? copy.light : copy.dark}
            </button>
            <button
              onClick={handleToggleLang}
              className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/70 text-violet-200'}`}
            >
              {lang.toUpperCase()}
            </button>
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {[
            { title: 'Riff Challenges', icon: '⚡' },
            { title: 'Scale Hunter', icon: '🎯' },
            { title: 'Chord Builder', icon: '🧱' },
            { title: 'Rhythm Lab', icon: '🧪' },
          ].map((module, idx) => (
            <div key={module.title} style={{ animationDelay: `${idx * 150}ms` }} className={`group relative p-8 rounded-[40px] border backdrop-blur-md flex flex-col items-center text-center transition-all animate-in fade-in zoom-in-95 hover:border-violet-400 shadow-2xl ${isLight ? 'border-violet-200 bg-white/85 hover:bg-white' : 'border-violet-800/40 bg-zinc-950/40 hover:bg-zinc-900/60'}`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-b-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-5xl mb-6 group-hover:scale-110 transition-transform">{module.icon}</span>
              <h3 className="text-sm font-black uppercase tracking-tight">{module.title}</h3>
              <p className="mt-3 text-[9px] font-black opacity-40 tracking-[0.2em] group-hover:text-violet-400 transition-colors uppercase">
                {copy.locked}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 mt-16">
          <button
            onClick={() => navigateTo('/ecosystem')}
            className="px-12 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black uppercase text-xs shadow-[0_10px_30px_rgba(139,92,246,0.3)] transition-all active:scale-95"
          >
            {copy.ecosystem}
          </button>

          <button
            onClick={() => navigateTo('/studio')}
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-500 hover:text-white'}`}
          >
            {copy.studio}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeensPage;
