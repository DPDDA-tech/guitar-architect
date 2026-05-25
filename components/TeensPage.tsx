import React, { useState } from 'react';
import { loadConfig } from '../utils/persistence';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const TeensPage: React.FC = () => {
  const [theme] = useState(() => loadConfig()?.theme || 'dark');
  const isLight = theme === 'light';

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? '#8b5cf608' : '#8b5cf605'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#8b5cf608' : '#8b5cf605'} 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
  };

  return (
    <div className={`min-h-screen relative p-6 md:p-12 transition-all duration-500 ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-[#03010a] text-violet-50'}`}>
      {/* Safe Background Grid */}
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent_50%)]" />

      <div className="relative mx-auto max-w-5xl">
        <header className="flex flex-col items-center text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-violet-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src="/gateenslogo.webp" alt="GA Teens" className="relative w-36 h-36 md:w-52 md:h-52 object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-transform group-hover:scale-105" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-violet-500">
            GA Teens
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-bold opacity-80 leading-relaxed italic">
            Desafios, riffs, treino guiado e evolução musical para a próxima geração de arquitetos do som.
          </p>
          <span className="mt-6 px-5 py-2 rounded-full border border-violet-500/50 bg-violet-500/10 text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            Acesso Antecipado ⚡
          </span>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {[
            { title: 'Riff Challenges', icon: '⚡', color: 'border-violet-500' },
            { title: 'Scale Hunter', icon: '🎯', color: 'border-cyan-500' },
            { title: 'Chord Builder', icon: '🧱', color: 'border-fuchsia-500' },
            { title: 'Rhythm Lab', icon: '🧪', color: 'border-amber-500' },
          ].map((module, idx) => (
            <div key={module.title} style={{ animationDelay: `${idx * 150}ms` }} className={`group relative p-8 rounded-[40px] border bg-zinc-950/40 backdrop-blur-md flex flex-col items-center text-center transition-all animate-in fade-in zoom-in-95 hover:border-violet-400 hover:bg-zinc-900/60 shadow-2xl`}>
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-b-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <span className="text-5xl mb-6 group-hover:scale-110 transition-transform">{module.icon}</span>
              <h3 className="text-sm font-black uppercase tracking-tight">{module.title}</h3>
              <p className="mt-3 text-[9px] font-black opacity-40 tracking-[0.2em] group-hover:text-violet-400 transition-colors uppercase">
                Level Locked
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 mt-16">
          <button
            onClick={() => navigateTo('/ecosystem')}
            className="px-12 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black uppercase text-xs shadow-[0_10px_30px_rgba(139,92,246,0.3)] transition-all active:scale-95"
          >
            Explorar Ecossistema
          </button>

          <button
            onClick={() => navigateTo('/')}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
          >
            Modo Profissional (Core)
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeensPage;