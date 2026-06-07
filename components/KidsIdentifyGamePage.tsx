import React, { useState } from 'react';
import { getKidsTheme } from '../utils/ecosystemPreferences';

type Difficulty = 'easy' | 'medium' | 'hard';

type Instrument = {
  id: string;
  label: string;
  image: string;
  category: 'guitarra' | 'baixo' | 'acustico';
  curiosity: string;
};

type InstrumentQuestion = {
  correct: string;
  image: string;
  options: string[];
  cropPosition?: { x: number; y: number };
};

const instruments: Instrument[] = [
  { id: 'classic-s', label: 'Classic S', image: '/kids/workshop/classic-s.webp', category: 'guitarra', curiosity: 'Esse modelo e muito usado no rock e no pop.' },
  { id: 'single-cut',  label: 'Single Cut',  image: '/kids/workshop/single-cut.webp',  category: 'guitarra', curiosity: 'Tem visual clássico e forte presença em riffs.' },
  { id: 'explorer', label: 'Explorer', image: '/kids/workshop/explorer.webp', category: 'guitarra', curiosity: 'Ficou famoso pelo formato ousado.' },
  { id: 'flyingv', label: 'Flying V', image: '/kids/workshop/flyingv.webp', category: 'guitarra', curiosity: 'Tem formato marcante e visual de palco.' },
  { id: 'modern',      label: 'Modern',      image: '/kids/workshop/modern.webp',      category: 'guitarra', curiosity: 'Modelo versátil para varios estilos.' },
  { id: 'superstrat',  label: 'Superstrat',  image: '/kids/workshop/superstrat.webp',  category: 'guitarra', curiosity: 'Muito usada por quem gosta de tocar rápido.' },
  { id: 'semi-acustica', label: 'Semi-acústica', image: '/kids/workshop/semi-acustica.webp', category: 'guitarra', curiosity: 'Mistura guitarra elétrica e violão.' },
  { id: 'contrabaixo', label: 'Contrabaixo', image: '/kids/workshop/contrabaixo.webp', category: 'baixo', curiosity: 'O contrabaixo faz os sons graves da banda.' },
  { id: 'violao', label: 'Violao', image: '/kids/workshop/violao.webp', category: 'acustico', curiosity: 'Muito usado para acompanhar canto e acordes.' },
  { id: 'banjo', label: 'Banjo', image: '/kids/workshop/banjo.webp', category: 'acustico', curiosity: 'O banjo tem som brilhante e divertido.' },
];

const instrumentGroups: Record<'easy' | 'medium', string[]> = {
  easy: ['violao', 'banjo', 'contrabaixo', 'flyingv'],
  medium: ['classic-s', 'superstrat', 'modern', 'single-cut'],
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

const makeQuestion = (difficulty: Difficulty): InstrumentQuestion => {
  const groupedIds = difficulty === 'easy'
    ? instrumentGroups.easy
    : difficulty === 'medium'
      ? instrumentGroups.medium
      : instrumentGroups.medium;

  const pool = instruments.filter(item => groupedIds.includes(item.id));

  const correct = pool[Math.floor(Math.random() * pool.length)];

  const distractorPool = pool.filter(item => item.id !== correct.id);
  const distractors = shuffle(distractorPool).slice(0, 3);

  const options = shuffle([correct.label, ...distractors.map(item => item.label)]);

  const cropPosition = difficulty === 'easy'
    ? undefined
    : {
        x: 20 + Math.floor(Math.random() * 61),
        y: 20 + Math.floor(Math.random() * 61),
      };

  return {
    correct: correct.label,
    image: correct.image,
    options,
    cropPosition,
  };
};

const KidsIdentifyGamePage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentQuestion, setCurrentQuestion] = useState<InstrumentQuestion>(() => makeQuestion('easy'));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<string>('');
  const [gameFinished, setGameFinished] = useState(false);

  const isLight = theme === 'light';


  const maxRounds = 8;
  const cropConfig: Record<Difficulty, { boxWidth: string; boxHeight: string; scale: number }> = {
    easy: { boxWidth: '100%', boxHeight: '100%', scale: 1 },
    medium: { boxWidth: '52%', boxHeight: '52%', scale: 1.9 },
    hard: { boxWidth: '36%', boxHeight: '36%', scale: 2.7 },
  };

  const resetGame = (nextDifficulty: Difficulty = difficulty) => {
    setDifficulty(nextDifficulty);
    setCurrentQuestion(makeQuestion(nextDifficulty));
    setSelectedAnswer(null);
    setScore(0);
    setRound(1);
    setFeedback('');
    setGameFinished(false);
  };

  const correctInstrument = instruments.find(item => item.label === currentQuestion.correct);

  const handleAnswer = (option: string) => {
    if (selectedAnswer || gameFinished) return;

    setSelectedAnswer(option);

    if (option === currentQuestion.correct) {
      setScore(prev => prev + 1);
      setFeedback('Boa! Voc reconheceu o instrumento!');
    } else {
      setFeedback('Quase! Vamos tentar outro.');
    }
  };

  const handleNext = () => {
    if (round >= maxRounds) {
      setGameFinished(true);
      return;
    }

    setRound(prev => prev + 1);
    setSelectedAnswer(null);
    setFeedback('');
    setCurrentQuestion(makeQuestion(difficulty));
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>

      <main className="relative mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigateTo('/kids')}
          className={`mb-6 rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-all ${isLight ? 'border-emerald-300 bg-white text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.12)] hover:border-emerald-400 hover:shadow-[0_10px_24px_rgba(16,185,129,0.16)]' : 'border-emerald-500/70 bg-emerald-950/60 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.16),0_0_24px_rgba(16,185,129,0.18)] hover:border-emerald-400 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.22),0_0_30px_rgba(16,185,129,0.24)]'}`}
        >
          Voltar ao Kids
        </button>
        <header className="mb-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-500">Guitar Architect Kids</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Qual  o Instrumento?</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Observe a imagem e escolha o instrumento certo.
          </p>
        </header>

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
                  onClick={() => resetGame(item.key)}
                  className={`rounded-xl border px-3 py-2 text-xs font-black uppercase ${difficulty === item.key ? 'border-amber-500 bg-amber-500 text-white' : isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-500">Rodada: {round}/{maxRounds} | Pontos: {score}</div>
          </div>

          <div className="relative mx-auto mb-5 flex min-h-[260px] max-w-3xl items-center justify-center overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10 p-4 md:min-h-[340px]">
            {difficulty === 'easy' ? (
              <img
                src={currentQuestion.image}
                alt="Instrumento da rodada"
                className="h-full max-h-[300px] w-full object-contain transition-all duration-300"
              />
            ) : (
              <div
                className="relative overflow-hidden rounded-xl border-2 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.25)]"
                style={{ width: cropConfig[difficulty].boxWidth, height: cropConfig[difficulty].boxHeight }}
              >
                <img
                  src={currentQuestion.image}
                  alt="Instrumento da rodada"
                  className="h-full w-full object-cover transition-all duration-300"
                  style={{
                    transform: `scale(${cropConfig[difficulty].scale})`,
                    transformOrigin: 'center',
                    objectPosition: `${currentQuestion.cropPosition?.x ?? 50}% ${currentQuestion.cropPosition?.y ?? 50}%`,
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correct;
              const showResult = selectedAnswer !== null;

              let stateClass = isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950';
              if (showResult && isCorrect) stateClass = 'border-emerald-500 bg-emerald-500 text-white';
              if (showResult && isSelected && !isCorrect) stateClass = 'border-red-500 bg-red-500 text-white';

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null || gameFinished}
                  className={`rounded-xl border px-4 py-4 text-sm font-black uppercase transition-all ${stateClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black animate-in fade-in slide-in-from-top-1 duration-300 ${feedback.startsWith('Boa') ? (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200') : (isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-500/30 bg-amber-500/10 text-amber-200')}`}>
              {feedback}
              {correctInstrument && <p className="mt-1 text-xs font-semibold opacity-90">Curiosidade: {correctInstrument.curiosity}</p>}
            </div>
          )}

          <div className={`sticky bottom-2 z-20 mt-5 flex flex-col items-center gap-2 rounded-2xl border px-3 py-3 sm:flex-row sm:justify-center ${isLight ? 'border-slate-200 bg-white/95' : 'border-zinc-700 bg-zinc-950/90 backdrop-blur-sm'}`}>
            <button
              onClick={handleNext}
              disabled={selectedAnswer === null || gameFinished}
              className="rounded-xl border border-amber-500 bg-amber-500 px-4 py-2 text-xs font-black uppercase text-white disabled:opacity-50"
            >
              Próximo
            </button>
            <button onClick={() => resetGame()} className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              Novo jogo
            </button>
            <button onClick={() => navigateTo('/kids/games')} className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              Voltar aos Jogos
            </button>
            <button onClick={() => navigateTo('/kids')} className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              Voltar ao Kids
            </button>
          </div>

          {gameFinished && (
            <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black ${isLight ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-blue-500/30 bg-blue-500/10 text-blue-200'}`}>
            Fim do jogo! Voc acertou {score} de {maxRounds}.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default KidsIdentifyGamePage;



