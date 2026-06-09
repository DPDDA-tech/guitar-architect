import React, { useState } from 'react';
import { getKidsLang, getKidsTheme } from '../utils/ecosystemPreferences';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const games = [
  {
    title: { pt: 'Jogo da Memória', en: 'Memory Game' },
    description: { pt: 'Encontre pares de instrumentos e treine sua memória musical.', en: 'Find matching pairs of instruments and train your musical memory.' },
    available: true,
    path: '/kids/games/memory',
  },
  {
    title: { pt: 'Qual É o Instrumento?', en: 'Which Instrument Is It?' },
    description: { pt: 'Descubra o instrumento certo a partir de pistas visuais.', en: 'Discover the correct instrument from visual clues.' },
    available: true,
    path: '/kids/games/identify',
  },
  {
    title: { pt: 'Ligue os Cabos', en: 'Connect the Cables' },
    description: { pt: 'Ligue cada instrumento à descrição correta e complete os pares.', en: 'Match each instrument to the correct description and complete the pairs.' },
    available: true,
    path: '/kids/games/cables',
  },
  {
    title: { pt: 'Toque no Tempo', en: 'Keep the Beat' },
    description: { pt: 'Toque no ritmo das músicas e veja o personagem dançar!', en: 'Tap to the rhythm and watch the character dance!' },
    available: true,
    path: '/kids/games/rhythm',
  },
  {
    title: { pt: 'Monte a Banda', en: 'Build the Band' },
    description: { pt: 'Escolha os instrumentos e monte sua primeira banda.', en: 'Choose the instruments and build your first band.' },
    available: true,
    path: '/kids/build-band',
  },
] as const;

const KidsGamesPage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [lang] = useState(() => getKidsLang());
  const isLight = theme === 'light';
  const isPt = lang === 'pt';

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <main className="relative mx-auto max-w-6xl">
        <EcosystemPageActions ecosystem="kids" isLight={isLight} backLabel={isPt ? "Voltar ao Kids" : "Back to Kids"} backPath="/kids" />
        <InternalEcosystemHeader ecosystem="kids" isLight={isLight} title={isPt ? "Jogos Musicais" : "Music Games"} subtitle={isPt ? "Brinque, descubra instrumentos e treine sua memória musical." : "Play, discover instruments and train your musical memory."} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {games.map((game) => (
            <div key={isPt ? game.title.pt : game.title.en} className={`rounded-3xl border p-5 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
              <p className="text-sm font-black uppercase tracking-tight">{isPt ? game.title.pt : game.title.en}</p>
              <p className={`mt-2 text-xs font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>{isPt ? game.description.pt : game.description.en}</p>
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-amber-500">{game.available ? (isPt ? 'DISPONÍVEL' : 'AVAILABLE') : (isPt ? 'Em breve' : 'Coming soon')}</p>
              {game.available ? (
                <button
                  onClick={() => navigateTo(game.path)}
                  className="mt-3 min-h-[44px] w-full rounded-xl border border-amber-500 bg-amber-500 px-3 py-2 text-xs font-black uppercase text-white hover:bg-amber-400"
                >
                  {isPt ? 'Jogar' : 'Play'}
                </button>
              ) : (
                <button
                  disabled
                  className={`mt-3 min-h-[44px] w-full rounded-xl border px-3 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 text-slate-400' : 'border-zinc-700 text-zinc-500'}`}
                >
                  {isPt ? 'Em breve' : 'Coming soon'}
                </button>
              )}
            </div>
          ))}
        </section>

        <div className="mt-8 grid gap-3 sm:flex sm:flex-col sm:items-center">
          <button onClick={() => navigateTo('/kids')} className="min-h-[44px] rounded-xl border border-emerald-500 bg-emerald-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-emerald-500">
            {isPt ? 'Voltar ao Kids' : 'Back to Kids'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default KidsGamesPage;
