import React from 'react';
import { PracticeProgress } from '../../data/practiceData';
import PracticeProgressBar from './PracticeProgressBar';

interface PracticeStatsPanelProps {
  progress: PracticeProgress;
  totalExercises: number;
  isLight: boolean;
}

const PracticeStatsPanel: React.FC<PracticeStatsPanelProps> = ({ progress, totalExercises, isLight }) => {
  const completion = totalExercises > 0 ? Math.round((progress.completed.length / totalExercises) * 100) : 0;

  return (
    <section className={`rounded-2xl border p-5 ${isLight ? 'border-[#d2deeb] bg-white/88 shadow-[0_12px_30px_rgba(71,85,105,0.09)]' : 'border-blue-950/50 bg-[#080d16]/84'}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">Status de treino</p>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <div>
          <p className="text-[9px] font-black uppercase text-zinc-500">Streak</p>
          <p className="mt-1 text-2xl font-black">{progress.streak}</p>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase text-zinc-500">Concluídos</p>
          <p className="mt-1 text-2xl font-black">{progress.completed.length}</p>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase text-zinc-500">Minutos</p>
          <p className="mt-1 text-2xl font-black">{progress.practicedMinutes}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-[9px] font-black uppercase text-zinc-500">
          <span>Progresso geral</span>
          <span>{completion}%</span>
        </div>
        <PracticeProgressBar value={completion} isLight={isLight} />
      </div>
    </section>
  );
};

export default PracticeStatsPanel;
