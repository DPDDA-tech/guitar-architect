import React from 'react';
import { PracticeDifficulty, PracticeExercise } from '../../data/practiceData';
import PracticeTimer from './PracticeTimer';

interface PracticeExerciseCardProps {
  exercise: PracticeExercise;
  isLight: boolean;
  completed: boolean;
  currentBpm?: number;
  onStart: (exercise: PracticeExercise) => void;
  onIncreaseBpm: (exercise: PracticeExercise) => void;
  onResetBpm: (exercise: PracticeExercise) => void;
}

const difficultyLabel: Record<PracticeDifficulty, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  'fretboard-master': 'Mestre do Braço',
};

const difficultyClass: Record<PracticeDifficulty, string> = {
  beginner: 'border-emerald-400/30 text-emerald-200 bg-emerald-950/22',
  intermediate: 'border-blue-400/30 text-blue-200 bg-blue-950/24',
  advanced: 'border-violet-400/30 text-violet-200 bg-violet-950/24',
  'fretboard-master': 'border-amber-400/30 text-amber-200 bg-amber-950/22',
};

const lightDifficultyClass: Record<PracticeDifficulty, string> = {
  beginner: 'border-emerald-200 text-emerald-700 bg-emerald-50',
  intermediate: 'border-blue-200 text-blue-700 bg-blue-50',
  advanced: 'border-violet-200 text-violet-700 bg-violet-50',
  'fretboard-master': 'border-amber-200 text-amber-700 bg-amber-50',
};

const PracticeExerciseCard: React.FC<PracticeExerciseCardProps> = ({
  exercise,
  isLight,
  completed,
  currentBpm,
  onStart,
  onIncreaseBpm,
  onResetBpm,
}) => {
  const bpm = currentBpm || exercise.bpmStart;

  return (
    <article className={`rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 ${isLight ? 'border-[#d2deeb] bg-white/95 text-slate-900 shadow-[0_12px_30px_rgba(71,85,105,0.09)] hover:border-blue-300' : 'border-blue-900/65 bg-[linear-gradient(145deg,#08101c,#050914)] text-slate-100 shadow-[0_18px_46px_rgba(2,6,23,0.55),inset_0_1px_0_rgba(96,165,250,0.05)] hover:border-blue-700/85'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-300">{exercise.type}</p>
          <h3 className="mt-2 text-lg font-black tracking-tight">{exercise.title}</h3>
        </div>
        {completed && (
          <span className={`rounded-full border px-2.5 py-1.5 text-[8px] font-black uppercase ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-emerald-800/60 bg-emerald-950/30 text-emerald-200'}`}>
            Concluído
          </span>
        )}
      </div>
      <p className={`mt-3 text-sm font-semibold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{exercise.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-full border px-2.5 py-1.5 text-[9px] font-black uppercase ${isLight ? lightDifficultyClass[exercise.difficulty] : difficultyClass[exercise.difficulty]}`}>
          {difficultyLabel[exercise.difficulty]}
        </span>
        {exercise.focus.map(focus => (
          <span key={focus} className={`rounded-full border px-2.5 py-1.5 text-[9px] font-black uppercase ${isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-blue-900/55 bg-[#070b12] text-slate-400'}`}>
            {focus}
          </span>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
        <PracticeTimer minutes={exercise.durationMinutes} isLight={isLight} />
        <div className={`rounded-xl border px-3 py-2 text-center ${isLight ? 'border-blue-100 bg-white text-blue-700' : 'border-blue-900/65 bg-[#0b1424] text-blue-200 shadow-[inset_0_1px_0_rgba(96,165,250,0.05)]'}`}>
          <p className="text-[8px] font-black uppercase tracking-[0.18em] opacity-70">BPM</p>
          <p className="mt-1 text-lg font-black tabular-nums">{bpm || '--'}{exercise.bpmTarget ? `/${exercise.bpmTarget}` : ''}</p>
        </div>
      </div>
      {exercise.bpmStart && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => onIncreaseBpm(exercise)} className={`rounded-lg border px-3 py-2 text-[9px] font-black uppercase ${isLight ? 'border-slate-200 bg-white text-slate-700' : 'border-blue-900/55 bg-[#050914] text-slate-300'}`}>
            +5 BPM
          </button>
          <button onClick={() => onResetBpm(exercise)} className={`rounded-lg border px-3 py-2 text-[9px] font-black uppercase ${isLight ? 'border-slate-200 bg-white text-slate-700' : 'border-blue-900/55 bg-[#050914] text-slate-300'}`}>
            Reset
          </button>
        </div>
      )}
      <button
        onClick={() => onStart(exercise)}
        className="mt-4 w-full rounded-xl border border-blue-400/30 bg-[linear-gradient(180deg,#4f8df3,#2563eb)] px-4 py-3 text-[10px] font-black uppercase text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_12px_24px_rgba(37,99,235,0.20)] transition hover:-translate-y-0.5"
      >
        Iniciar treino
      </button>
    </article>
  );
};

export default PracticeExerciseCard;
