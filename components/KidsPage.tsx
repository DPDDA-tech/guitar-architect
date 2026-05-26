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
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />

      <div className="relative mx-auto max-w-5xl">
        <header className="flex flex-col items-center text-center mb-12 animate-in fade-in zoom-in-95 duration-1000">
          <img src="/gakidslogo.webp" alt="GA Kids" className="w-32 h-32 md:w-48 md:h-48 object-contain mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-emerald-500">
            Guitar Architect Kids
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-bold opacity-80 leading-relaxed">
            Um espaco ludico para descobrir instrumentos, cores, sons e as primeiras notas musicais de forma divertida.
          </p>
          <span className="mt-6 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Obra em andamento
          </span>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {[
            {
              title: 'Oficina de Guitarras',
              path: '/kids/workshop',
              icon: (
                <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none">
                  <rect x="6" y="30" width="18" height="10" rx="5" fill="#34d399" />
                  <rect x="20" y="28" width="14" height="6" rx="3" fill="#fbbf24" />
                  <circle cx="36" cy="17" r="6" fill="#60a5fa" />
                  <circle cx="36" cy="17" r="2" fill="#ffffff" />
                </svg>
              ),
            },
            {
              title: 'Descobrindo as Notas',
              icon: (
                <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none">
                  <circle cx="16" cy="34" r="6" fill="#f472b6" />
                  <circle cx="31" cy="30" r="6" fill="#a78bfa" />
                  <rect x="20" y="12" width="4" height="20" rx="2" fill="#f472b6" />
                  <rect x="35" y="10" width="4" height="18" rx="2" fill="#a78bfa" />
                  <path d="M24 12l13-3v6l-13 3z" fill="#c4b5fd" />
                </svg>
              ),
            },
            {
              title: 'Primeiros Sons',
              icon: (
                <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none">
                  <path d="M8 20h8l10-8v24l-10-8H8z" fill="#22d3ee" />
                  <path d="M31 18c3 2 3 10 0 12" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                  <path d="M36 14c5 4 5 16 0 20" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              title: 'Jogos Musicais',
              icon: (
                <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none">
                  <rect x="6" y="14" width="36" height="20" rx="10" fill="#f59e0b" />
                  <circle cx="16" cy="24" r="2.5" fill="#fff" />
                  <rect x="14.5" y="19" width="3" height="10" rx="1.5" fill="#fff" />
                  <circle cx="31" cy="22" r="2.2" fill="#fff" />
                  <circle cx="35.5" cy="26.5" r="2.2" fill="#fff" />
                </svg>
              ),
            },
          ].map((module, idx) => {
            const isAvailable = Boolean(module.path);
            return (
              <button
                key={module.title}
                onClick={() => {
                  if (module.path) navigateTo(module.path);
                }}
                style={{ animationDelay: `${idx * 100}ms` }}
                className={`p-8 rounded-[32px] border border-dashed flex flex-col items-center text-center transition-all animate-in fade-in slide-in-from-bottom-4 ${isAvailable ? 'opacity-100 hover:-translate-y-1 cursor-pointer' : 'opacity-60 hover:opacity-100 cursor-default'} ${isLight ? 'border-emerald-200 bg-white shadow-sm' : 'border-emerald-900/40 bg-emerald-950/20'}`}
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/10">
                  {module.icon}
                </span>
                <h3 className="text-sm font-black uppercase tracking-tight">{module.title}</h3>
                <p className="mt-2 text-[10px] font-bold opacity-50 tracking-widest">{isAvailable ? 'DISPONIVEL' : 'EM BREVE'}</p>
              </button>
            );
          })}
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
