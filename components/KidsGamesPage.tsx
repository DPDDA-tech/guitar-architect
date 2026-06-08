import React, { useState } from 'react';
import { getKidsTheme } from '../utils/ecosystemPreferences';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const games = [
  {
    title: 'Jogo da Memória',
    description: 'Encontre pares de instrumentos e treine sua memória musical.',
    available: true,
    path: '/kids/games/memory',
  },
  {
    title: 'Qual É o Instrumento?',
    description: 'Descubra o instrumento certo a partir de pistas visuais.',
    available: true,
    path: '/kids/games/identify',
  },
  {
    title: 'Ligue os Cabos',
    description: 'Ligue cada instrumento à descrição correta e complete os pares.',
    available: true,
    path: '/kids/games/cables',
  },
  {
    title: 'Toque no Tempo',
    description: 'Toque no ritmo das músicas e veja o personagem dançar!',
    available: true,
    path: '/kids/games/rhythm',
  },
  {
    title: 'Monte a Banda',
    description: 'Escolha os instrumentos e monte sua primeira banda.',
    available: true,
    path: '/kids/build-band',
  },
] as const;

const KidsGamesPage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <main className="relative mx-auto max-w-6xl">
        <EcosystemPageActions ecosystem="kids" isLight={isLight} backLabel="Voltar ao Kids" backPath="/kids" />
        <InternalEcosystemHeader ecosystem="kids" isLight={isLight} title="Jogos Musicais" subtitle="Brinque, descubra instrumentos e treine sua memória musical." />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {games.map((game) => (
            <div key={game.title} className={`rounded-3xl border p-5 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
              <p className="text-sm font-black uppercase tracking-tight">{game.title}</p>
              <p className={`mt-2 text-xs font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>{game.description}</p>
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-amber-500">{game.available ? 'DISPONÍVEL' : 'Em breve'}</p>
              {game.available ? (
                <button
                  onClick={() => navigateTo(game.path)}
                  className="mt-3 min-h-[44px] w-full rounded-xl border border-amber-500 bg-amber-500 px-3 py-2 text-xs font-black uppercase text-white hover:bg-amber-400"
                >
                  Jogar
                </button>
              ) : (
                <button
                  disabled
                  className={`mt-3 min-h-[44px] w-full rounded-xl border px-3 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 text-slate-400' : 'border-zinc-700 text-zinc-500'}`}
                >
                  Em breve
                </button>
              )}
            </div>
          ))}
        </section>

        <div className="mt-8 grid gap-3 sm:flex sm:flex-col sm:items-center">
          <button onClick={() => navigateTo('/kids')} className="min-h-[44px] rounded-xl border border-emerald-500 bg-emerald-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-emerald-500">
            Voltar ao Kids
          </button>
        </div>
      </main>
    </div>
  );
};

export default KidsGamesPage;
