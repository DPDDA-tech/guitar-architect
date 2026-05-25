import React, { useState } from 'react';
import { loadConfig } from '../utils/persistence';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const KidsPage: React.FC = () => {
  const [theme] = useState(() => loadConfig()?.theme || 'dark');
  const isLight = theme === 'light';

  const gridStyle = {
    backgroundImage: `radial-gradient(circle at 2px 2px, ${isLight ? '#10b98115' : '#10b98108'} 1px, transparent 0)`,
    backgroundSize: '32px 32px',
  };

  return (
    <div className={`min-h-screen relative p-6 md:p-12 transition-colors duration-700 ${isLight ? 'bg-emerald-50/40 text-emerald-900' : 'bg-[#051109] text-emerald-50'}`}>
      {/* Safe Background Grid */}
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />

      <div className="relative mx-auto max-w-5xl">
        <header className="flex flex-col items-center text-center mb-12 animate-in fade-in zoom-in-95 duration-1000">
          <img src="/gakidslogo.webp" alt="GA Kids" className="w-32 h-32 md:w-48 md:h-48 object-contain mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-emerald-500">
            Guitar Architect Kids
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-bold opacity-80 leading-relaxed">
            Um espaço lúdico para descobrir instrumentos, cores, sons e as primeiras notas musicais de forma divertida.
          </p>
          <span className="mt-6 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Obra em andamento 🚧
          </span>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {[
            { title: 'Oficina de Guitarras', icon: '🎨' },
            { title: 'Descobrindo as Notas', icon: '🎵' },
            { title: 'Primeiros Sons', icon: '🔊' },
            { title: 'Jogos Musicais', icon: '🎮' },
          ].map((module, idx) => (
            <div 
              key={module.title} 
              style={{ animationDelay: `${idx * 100}ms` }}
              className={`p-8 rounded-[32px] border border-dashed flex flex-col items-center text-center transition-all opacity-60 hover:opacity-100 animate-in fade-in slide-in-from-bottom-4 ${isLight ? 'border-emerald-200 bg-white shadow-sm' : 'border-emerald-900/40 bg-emerald-950/20'}`}
            >
              <span className="text-4xl mb-4">{module.icon}</span>
              <h3 className="text-sm font-black uppercase tracking-tight">{module.title}</h3>
              <p className="mt-2 text-[10px] font-bold opacity-50 tracking-widest">EM BREVE</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 mt-12">
          <button 
            onClick={() => navigateTo('/ecosystem')}
            className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
          >
            Voltar ao Ecossistema
          </button>
          <button 
            onClick={() => navigateTo('/')}
            className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            Ir para Guitar Architect Principal
          </button>
        </div>
      </div>
    </div>
  );
};

export default KidsPage;