import React, { useEffect, useState } from 'react';
import { getKidsTheme } from '../utils/ecosystemPreferences';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';

type Difficulty = 'easy' | 'medium' | 'hard';

type Instrument = {
  key: string;
  label: string;
  image: string;
};

type MemoryCard = {
  id: number;
  instrumentKey: string;
  label: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const INSTRUMENTS: Instrument[] = [
  { key: 'classicS', label: 'Classic S', image: '/kids/workshop/classic-s.webp' },
  { key: 'singleCut', label: 'Single Cut', image: '/kids/workshop/single-cut.webp' },
  { key: 'explorer', label: 'Explorer', image: '/kids/workshop/explorer.webp' },
  { key: 'flyingV', label: 'Flying V', image: '/kids/workshop/flyingv.webp' },
  { key: 'contrabaixo', label: 'Contrabaixo', image: '/kids/workshop/contrabaixo.webp' },
  { key: 'violao', label: 'Violao', image: '/kids/workshop/violao.webp' },
  { key: 'banjo', label: 'Banjo', image: '/kids/workshop/banjo.webp' },
  { key: 'semiAcustica', label: 'Semi-acústica', image: '/kids/workshop/semi-acustica.webp' },
];

const PAIRS_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 4,
  medium: 6,
  hard: 8,
};

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

const createDeck = (difficulty: Difficulty): MemoryCard[] => {
  const pairCount = PAIRS_BY_DIFFICULTY[difficulty];
  const selected = INSTRUMENTS.slice(0, pairCount);
  const duplicated = selected.flatMap((instrument) => [instrument, instrument]);
  const shuffled = shuffle(duplicated);
  return shuffled.map((instrument, index) => ({
    id: index + 1,
    instrumentKey: instrument.key,
    label: instrument.label,
    image: instrument.image,
    isFlipped: false,
    isMatched: false,
  }));
};

const KidsMemoryGamePage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [cards, setCards] = useState<MemoryCard[]>(() => createDeck('easy'));
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const isLight = theme === 'light';


  const startNewGame = (difficulty: Difficulty = selectedDifficulty) => {
    setCards(createDeck(difficulty));
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setGameCompleted(false);
    setIsLocked(false);
  };

  useEffect(() => {
    startNewGame(selectedDifficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDifficulty]);

  useEffect(() => {
    if (matchedCards.length > 0 && matchedCards.length === cards.length) {
      setGameCompleted(true);
    }
  }, [matchedCards, cards.length]);

  const handleCardClick = (id: number) => {
    if (isLocked) return;

    const current = cards.find((card) => card.id === id);
    if (!current || current.isFlipped || current.isMatched) return;
    if (flippedCards.length >= 2) return;

    const updated = cards.map((card) => (card.id === id ? { ...card, isFlipped: true } : card));
    const newFlipped = [...flippedCards, id];

    setCards(updated);
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstId, secondId] = newFlipped;
      const first = updated.find((card) => card.id === firstId);
      const second = updated.find((card) => card.id === secondId);

      if (first && second && first.instrumentKey === second.instrumentKey) {
        const matchedIds = [firstId, secondId];
        setCards((prev) => prev.map((card) => (matchedIds.includes(card.id) ? { ...card, isMatched: true } : card)));
        setMatchedCards((prev) => [...prev, ...matchedIds]);
        setFlippedCards([]);
      } else {
        setIsLocked(true);
        window.setTimeout(() => {
          setCards((prev) => prev.map((card) => (newFlipped.includes(card.id) ? { ...card, isFlipped: false } : card)));
          setFlippedCards([]);
          setIsLocked(false);
        }, 750);
      }
    }
  };

  const gridColsClass = cards.length <= 8
    ? 'grid-cols-2 sm:grid-cols-4'
    : cards.length <= 12
      ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6'
      : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8';

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>

      <main className="relative mx-auto max-w-[1400px]">
        <EcosystemPageActions ecosystem="kids" isLight={isLight} backLabel="Voltar ao Kids" backPath="/kids" />
        <InternalEcosystemHeader ecosystem="kids" isLight={isLight} title="Jogo da Memória" subtitle="Encontre os pares de instrumentos." />

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">Dificuldade</span>
              {([
          { key: 'easy',   label: 'Fácil' },
          { key: 'medium', label: 'Médio' },
          { key: 'hard',   label: 'Difícil' },
              ] as Array<{ key: Difficulty; label: string }>).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedDifficulty(item.key)}
                  className={`min-h-[40px] rounded-xl border px-3 py-2 text-xs font-black uppercase text-center leading-tight ${selectedDifficulty === item.key ? 'border-amber-500 bg-amber-500 text-white' : isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-black uppercase tracking-wider text-amber-500">Movimentos: {moves}</div>
          </div>

          {gameCompleted && (
            <div className={`mb-4 rounded-xl border px-3 py-3 text-sm font-black ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
            VocÉ encontrou todos os instrumentos!
            </div>
          )}

          <div className={`grid gap-2 md:gap-3 ${gridColsClass}`}>
            {cards.map((card) => {
              const showFront = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`relative aspect-[3/4] min-h-[96px] sm:min-h-[118px] md:min-h-[126px] lg:min-h-[132px] xl:min-h-[138px] overflow-hidden rounded-2xl border transition-all active:scale-95 ${isLight ? 'border-slate-300' : 'border-zinc-700'}`}
                >
                  {showFront ? (
                    <div className="flex h-full w-full flex-col items-center justify-between p-2 bg-white text-zinc-900">
                      <img src={card.image} alt={card.label} className="mt-1 h-[70%] w-full object-contain" />
                      <p className="mb-1 text-[10px] font-black uppercase tracking-tight">{card.label}</p>
                    </div>
                  ) : (
                    <div className={`flex h-full w-full flex-col items-center justify-center gap-2 ${isLight ? 'bg-slate-100' : 'bg-zinc-900'}`}>
                      <div className="text-xl">?</div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-500">GA Kids</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className={`sticky bottom-2 z-20 mt-4 grid gap-2 rounded-2xl border px-3 py-3 sm:flex sm:flex-row sm:justify-center ${isLight ? 'border-slate-200 bg-white/95' : 'border-zinc-700 bg-zinc-950/90 backdrop-blur-sm'}`}>
            <button onClick={() => startNewGame()} className="min-h-[44px] rounded-xl border border-amber-500 bg-amber-500 px-4 py-2 text-xs font-black uppercase text-center leading-tight text-white hover:bg-amber-400">
              Novo jogo
            </button>
            <button onClick={() => navigateTo('/kids/games')} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              Voltar aos Jogos
            </button>
            <button onClick={() => navigateTo('/kids')} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              Voltar ao Kids
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default KidsMemoryGamePage;



