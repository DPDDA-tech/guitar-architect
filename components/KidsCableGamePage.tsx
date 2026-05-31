import React, { useState } from 'react';
import { getKidsTheme } from '../utils/ecosystemPreferences';

type CableInstrument = {
  id: string;
  label: string;
  image: string;
  description: string;
};

const INSTRUMENTS_POOL: CableInstrument[] = [
  { id: 'contrabaixo', label: 'Contrabaixo', image: '/kids/workshop/contrabaixo.webp', description: 'Faz os sons graves da banda.' },
  { id: 'violao', label: 'Violao', image: '/kids/workshop/violao.webp', description: 'Acompanha músicas e canções.' },
  { id: 'banjo', label: 'Banjo', image: '/kids/workshop/banjo.webp', description: 'Tem som brilhante e divertido.' },
  { id: 'flyingv', label: 'Flying V', image: '/kids/workshop/flyingv.webp', description: 'Tem visual radical do rock.' },
  { id: 'classic-s', label: 'Classic S', image: '/kids/workshop/classic-s.webp', description: 'E versátil e aparece em muitos estilos.' },
  { id: 'semi-acustica', label: 'Semi-acústica', image: '/kids/workshop/semi-acustica.webp', description: 'Tem som cheio e combina com jazz e blues.' },
];

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const createRound = () => {
  const selected = shuffle(INSTRUMENTS_POOL).slice(0, 4);
  const descriptions = shuffle(selected.map(item => ({ id: item.id, text: item.description })));
  return { selected, descriptions };
};

const KidsCableGamePage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [roundData, setRoundData] = useState(() => createRound());
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);

  const isLight = theme === 'light';


  const usedDescriptionIds = Object.values(matches);

  const resetGame = () => {
    setRoundData(createRound());
    setSelectedInstrumentId(null);
    setMatches({});
    setFeedback('');
    setGameCompleted(false);
  };

  const handleDescriptionClick = (descriptionId: string) => {
    if (!selectedInstrumentId || gameCompleted) return;

    if (descriptionId === selectedInstrumentId) {
      const nextMatches = { ...matches, [selectedInstrumentId]: descriptionId };
      setMatches(nextMatches);
      setFeedback('Boa conexão! Cabo ligado.');
      setSelectedInstrumentId(null);

      if (Object.keys(nextMatches).length === roundData.selected.length) {
        setGameCompleted(true);
        setFeedback('Você ligou todos os cabos!');
      }
    } else {
      setFeedback('Quase! Tente ligar em outra descrição.');
      setSelectedInstrumentId(null);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>

      <main className="relative mx-auto max-w-6xl">
        <header className="mb-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-500">Guitar Architect Kids</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Ligue os Cabos</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Ligue cada instrumento à descrição correta.
          </p>
        </header>

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-amber-500">Instrumentos</p>
              <div className="space-y-3">
                {roundData.selected.map((instrument) => {
                  const isMatched = Boolean(matches[instrument.id]);
                  const isSelected = selectedInstrumentId === instrument.id;
                  return (
                    <button
                      key={instrument.id}
                      onClick={() => {
                        if (!isMatched) setSelectedInstrumentId(instrument.id);
                      }}
                      className={`w-full rounded-2xl border p-3 text-left transition-all ${isMatched ? 'border-emerald-500 bg-emerald-500/15' : isSelected ? 'border-amber-500 bg-amber-500/15' : isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={instrument.image} alt={instrument.label} className="h-14 w-14 rounded-lg object-contain bg-white/80 p-1" />
                        <div className="min-w-0">
                          <p className="text-sm font-black uppercase">{instrument.label}</p>
                          <p className="text-[11px] font-bold opacity-70">{isMatched ? 'Cabo ligado' : 'Clique para selecionar'}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-amber-500">Descrições</p>
              <div className="space-y-3">
                {roundData.descriptions.map((desc) => {
                  const isUsed = usedDescriptionIds.includes(desc.id);
                  return (
                    <button
                      key={desc.id}
                      onClick={() => handleDescriptionClick(desc.id)}
                      disabled={isUsed || !selectedInstrumentId || gameCompleted}
                      className={`w-full rounded-2xl border px-3 py-4 text-left transition-all ${isUsed ? 'border-emerald-500 bg-emerald-500/15' : isLight ? 'border-slate-300 bg-white hover:border-amber-400' : 'border-zinc-700 bg-zinc-950 hover:border-amber-500'} disabled:opacity-70`}
                    >
                      <p className="text-xs font-bold leading-relaxed">{desc.text}</p>
                      {isUsed && <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">Cabo conectado</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {feedback && (
            <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black ${feedback.startsWith('Quase') ? (isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-500/30 bg-amber-500/10 text-amber-200') : (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200')}`}>
              {feedback}
            </div>
          )}

          <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <button onClick={resetGame} className="rounded-xl border border-amber-500 bg-amber-500 px-4 py-2 text-xs font-black uppercase text-white hover:bg-amber-400">
              Novo jogo
            </button>
            <button onClick={() => navigateTo('/kids/games')} className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              Voltar aos Jogos
            </button>
            <button onClick={() => navigateTo('/kids')} className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              Voltar ao Kids
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default KidsCableGamePage;



