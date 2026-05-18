import React from 'react';
import { PracticeExercise } from '../../data/practiceData';
import PracticeExerciseCard from './PracticeExerciseCard';

interface PracticeCategorySectionProps {
  title: string;
  description: string;
  exercises: PracticeExercise[];
  isLight: boolean;
  completed: string[];
  bpmByExercise: Record<string, number>;
  onStart: (exercise: PracticeExercise) => void;
  onIncreaseBpm: (exercise: PracticeExercise) => void;
  onResetBpm: (exercise: PracticeExercise) => void;
}

const PracticeCategorySection: React.FC<PracticeCategorySectionProps> = ({
  title,
  description,
  exercises,
  isLight,
  completed,
  bpmByExercise,
  onStart,
  onIncreaseBpm,
  onResetBpm,
}) => {
  if (exercises.length === 0) return null;

  return (
    <section className="mt-7">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">{title}</p>
          <p className={`mt-1 text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{description}</p>
        </div>
        <span className={`w-fit rounded-full border px-3 py-2 text-[10px] font-black uppercase ${isLight ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-blue-800/60 bg-blue-950/30 text-blue-200'}`}>
          {exercises.length} treinos
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {exercises.map(exercise => (
          <PracticeExerciseCard
            key={exercise.id}
            exercise={exercise}
            isLight={isLight}
            completed={completed.includes(exercise.id)}
            currentBpm={bpmByExercise[exercise.id]}
            onStart={onStart}
            onIncreaseBpm={onIncreaseBpm}
            onResetBpm={onResetBpm}
          />
        ))}
      </div>
    </section>
  );
};

export default PracticeCategorySection;
