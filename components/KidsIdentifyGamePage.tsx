import React, { useMemo, useState } from 'react';
import { getKidsLang, getKidsTheme } from '../utils/ecosystemPreferences';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';

type Difficulty = 'easy' | 'medium' | 'hard';

type Instrument = {
  id: string;
  label: {
    pt: string;
    en: string;
  };
  image: string;
  category: 'guitarra' | 'baixo' | 'acustico';
  curiosity: {
    pt: string;
    en: string;
  };
};

type InstrumentQuestion = {
  correct: string;
  image: string;
  options: string[];
  cropPosition?: { x: number; y: number };
};

const instruments: Instrument[] = [
  { id: 'classic-s', label: { pt: 'Classic S', en: 'Classic S' }, image: '/kids/workshop/classic-s.webp', category: 'guitarra', curiosity: { pt: 'Esse modelo é muito usado no rock e no pop.', en: 'This model is widely used in rock and pop.' } },
  { id: 'single-cut', label: { pt: 'Single Cut', en: 'Single Cut' }, image: '/kids/workshop/single-cut.webp', category: 'guitarra', curiosity: { pt: 'Tem visual clássico e forte presença em riffs.', en: 'It has a classic look and a strong presence in riffs.' } },
  { id: 'explorer', label: { pt: 'Explorer', en: 'Explorer' }, image: '/kids/workshop/explorer.webp', category: 'guitarra', curiosity: { pt: 'Ficou famoso pelo formato ousado.', en: 'It became famous for its bold shape.' } },
  { id: 'flyingv', label: { pt: 'Flying V', en: 'Flying V' }, image: '/kids/workshop/flyingv.webp', category: 'guitarra', curiosity: { pt: 'Tem formato marcante e visual de palco.', en: 'It has a striking shape and a strong stage look.' } },
  { id: 'modern', label: { pt: 'Modern', en: 'Modern' }, image: '/kids/workshop/modern.webp', category: 'guitarra', curiosity: { pt: 'Modelo versátil para vários estilos.', en: 'A versatile model for many styles.' } },
  { id: 'superstrat', label: { pt: 'Superstrat', en: 'Superstrat' }, image: '/kids/workshop/superstrat.webp', category: 'guitarra', curiosity: { pt: 'Muito usada por quem gosta de tocar rápido.', en: 'Often used by players who like to play fast.' } },
  { id: 'semi-acustica', label: { pt: 'Semiacústica', en: 'Semi-Acoustic' }, image: '/kids/workshop/semi-acustica.webp', category: 'guitarra', curiosity: { pt: 'Mistura guitarra elétrica e violão.', en: 'It mixes electric guitar and acoustic guitar traits.' } },
  { id: 'contrabaixo', label: { pt: 'Contrabaixo', en: 'Bass' }, image: '/kids/workshop/contrabaixo.webp', category: 'baixo', curiosity: { pt: 'O contrabaixo faz os sons graves da banda.', en: 'The bass creates the low sounds in the band.' } },
  { id: 'violao', label: { pt: 'Violão', en: 'Acoustic Guitar' }, image: '/kids/workshop/violao.webp', category: 'acustico', curiosity: { pt: 'Muito usado para acompanhar canto e acordes.', en: 'It is often used to accompany singing and chords.' } },
  { id: 'banjo', label: { pt: 'Banjo', en: 'Banjo' }, image: '/kids/workshop/banjo.webp', category: 'acustico', curiosity: { pt: 'O banjo tem som brilhante e divertido.', en: 'The banjo has a bright and fun sound.' } },
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

const makeQuestion = (difficulty: Difficulty, isPt: boolean): InstrumentQuestion => {
  const groupedIds = difficulty === 'easy' ? instrumentGroups.easy : instrumentGroups.medium;
  const pool = instruments.filter((item) => groupedIds.includes(item.id));
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const distractorPool = pool.filter((item) => item.id !== correct.id);
  const distractors = shuffle(distractorPool).slice(0, 3);
  const options = shuffle([correct.label[isPt ? 'pt' : 'en'], ...distractors.map((item) => item.label[isPt ? 'pt' : 'en'])]);

  const cropPosition = difficulty === 'easy'
    ? undefined
    : { x: 20 + Math.floor(Math.random() * 61), y: 20 + Math.floor(Math.random() * 61) };

  return {
    correct: correct.label[isPt ? 'pt' : 'en'],
    image: correct.image,
    options,
    cropPosition,
  };
};

const KidsIdentifyGamePage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [lang] = useState(() => getKidsLang());
  const isLight = theme === 'light';
  const isPt = lang === 'pt';

  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentQuestion, setCurrentQuestion] = useState<InstrumentQuestion>(() => makeQuestion('easy', isPt));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [gameFinished, setGameFinished] = useState(false);

  const maxRounds = 8;
  const cropConfig: Record<Difficulty, { boxWidth: string; boxHeight: string; scale: number }> = {
    easy: { boxWidth: '100%', boxHeight: '100%', scale: 1 },
    medium: { boxWidth: '52%', boxHeight: '52%', scale: 1.9 },
    hard: { boxWidth: '36%', boxHeight: '36%', scale: 2.7 },
  };

  const difficultyOptions = isPt
    ? [{ key: 'easy', label: 'Fácil' }, { key: 'medium', label: 'Médio' }, { key: 'hard', label: 'Difícil' }]
    : [{ key: 'easy', label: 'Easy' }, { key: 'medium', label: 'Medium' }, { key: 'hard', label: 'Hard' }];

  const labelToInstrument = useMemo(() => {
    const map = new Map<string, Instrument>();
    instruments.forEach((item) => map.set(item.label[isPt ? 'pt' : 'en'], item));
    return map;
  }, [isPt]);

  const resetGame = (nextDifficulty: Difficulty = difficulty) => {
    setDifficulty(nextDifficulty);
    setCurrentQuestion(makeQuestion(nextDifficulty, isPt));
    setSelectedAnswer(null);
    setScore(0);
    setRound(1);
    setFeedback('');
    setGameFinished(false);
  };

  const correctInstrument = labelToInstrument.get(currentQuestion.correct);

  const handleAnswer = (option: string) => {
    if (selectedAnswer || gameFinished) return;
    setSelectedAnswer(option);

    if (option === currentQuestion.correct) {
      setScore((prev) => prev + 1);
      setFeedback(isPt ? 'Boa! Você reconheceu o instrumento!' : 'Great! You recognized the instrument!');
    } else {
      setFeedback(isPt ? 'Quase! Vamos tentar outro.' : 'Almost! Let’s try another one.');
    }
  };

  const handleNext = () => {
    if (round >= maxRounds) {
      setGameFinished(true);
      return;
    }

    setRound((prev) => prev + 1);
    setSelectedAnswer(null);
    setFeedback('');
    setCurrentQuestion(makeQuestion(difficulty, isPt));
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <main className="relative mx-auto max-w-6xl">
        <EcosystemPageActions ecosystem="kids" isLight={isLight} backLabel={isPt ? 'Voltar ao Kids' : 'Back to Kids'} backPath="/kids" />
        <InternalEcosystemHeader ecosystem="kids" isLight={isLight} title={isPt ? 'Qual é o Instrumento?' : 'Which Instrument Is It?'} subtitle={isPt ? 'Observe a imagem e escolha o instrumento certo.' : 'Look at the image and choose the right instrument.'} />

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">{isPt ? 'Dificuldade' : 'Difficulty'}</span>
              {difficultyOptions.map((item) => (
                <button
                  key={item.key}
                  onClick={() => resetGame(item.key as Difficulty)}
                  className={`min-h-[40px] rounded-xl border px-3 py-2 text-xs font-black uppercase text-center leading-tight ${difficulty === item.key ? 'border-amber-500 bg-amber-500 text-white' : isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-500">
              {isPt ? 'Rodada' : 'Round'}: {round}/{maxRounds} | {isPt ? 'Pontos' : 'Score'}: {score}
            </div>
          </div>

          <div className="relative mx-auto mb-5 flex min-h-[260px] max-w-3xl items-center justify-center overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10 p-4 md:min-h-[340px]">
            {difficulty === 'easy' ? (
              <img src={currentQuestion.image} alt={isPt ? 'Instrumento da rodada' : 'Instrument of the round'} className="h-full max-h-[300px] w-full object-contain transition-all duration-300" />
            ) : (
              <div className="relative overflow-hidden rounded-xl border-2 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.25)]" style={{ width: cropConfig[difficulty].boxWidth, height: cropConfig[difficulty].boxHeight }}>
                <img
                  src={currentQuestion.image}
                  alt={isPt ? 'Instrumento da rodada' : 'Instrument of the round'}
                  className="h-full w-full object-cover transition-all duration-300"
                  style={{ transform: `scale(${cropConfig[difficulty].scale})`, transformOrigin: 'center', objectPosition: `${currentQuestion.cropPosition?.x ?? 50}% ${currentQuestion.cropPosition?.y ?? 50}%` }}
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
            <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black animate-in fade-in slide-in-from-top-1 duration-300 ${feedback.startsWith(isPt ? 'Boa' : 'Great') ? (isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200') : (isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-500/30 bg-amber-500/10 text-amber-200')}`}>
              {feedback}
              {correctInstrument && <p className="mt-1 text-xs font-semibold opacity-90">{isPt ? 'Curiosidade' : 'Fun fact'}: {correctInstrument.curiosity[isPt ? 'pt' : 'en']}</p>}
            </div>
          )}

          <div className={`sticky bottom-2 z-20 mt-5 grid gap-2 rounded-2xl border px-3 py-3 sm:flex sm:flex-row sm:justify-center ${isLight ? 'border-slate-200 bg-white/95' : 'border-zinc-700 bg-zinc-950/90 backdrop-blur-sm'}`}>
            <button onClick={handleNext} disabled={selectedAnswer === null || gameFinished} className="min-h-[44px] rounded-xl border border-amber-500 bg-amber-500 px-4 py-2 text-xs font-black uppercase text-center leading-tight text-white disabled:opacity-50">
              {isPt ? 'Próximo' : 'Next'}
            </button>
            <button onClick={() => resetGame()} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              {isPt ? 'Novo jogo' : 'New game'}
            </button>
            <button onClick={() => navigateTo('/kids/games')} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              {isPt ? 'Voltar aos Jogos' : 'Back to Games'}
            </button>
            <button onClick={() => navigateTo('/kids')} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              {isPt ? 'Voltar ao Kids' : 'Back to Kids'}
            </button>
          </div>

          {gameFinished && (
            <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black ${isLight ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-blue-500/30 bg-blue-500/10 text-blue-200'}`}>
              {isPt ? `Fim do jogo! Você acertou ${score} de ${maxRounds}.` : `Game over! You got ${score} out of ${maxRounds}.`}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default KidsIdentifyGamePage;
