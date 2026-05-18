import React from 'react';
import { PracticeExercise } from '../../data/practiceData';
import PracticeTimer from './PracticeTimer';

interface PracticeMissionCardProps {
  mission: PracticeExercise;
  currentBpm?: number;
  isLight: boolean;
  onStart: (exercise: PracticeExercise) => void;
}

const PracticeMissionCard: React.FC<PracticeMissionCardProps> = ({ mission, currentBpm, isLight, onStart }) => (
  <section className={`relative overflow-hidden rounded-2xl border p-6 ${isLight ? 'border-blue-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(230,240,255,0.9))] shadow-[0_22px_70px_rgba(37,99,235,0.14)]' : 'border-blue-800/50 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.22),transparent_34%),linear-gradient(135deg,rgba(8,13,22,0.98),rgba(3,7,18,0.94))] shadow-[0_28px_90px_rgba(2,6,23,0.5)]'}`}>
    <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">Missão de hoje</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight">{mission.title}</h2>
        <p className={`mt-2 max-w-3xl text-sm font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          {mission.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase ${isLight ? 'border-blue-200 bg-white text-blue-700' : 'border-blue-900/70 bg-blue-950/30 text-blue-200'}`}>
            {mission.type}
          </span>
          <span className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase ${isLight ? 'border-emerald-200 bg-white text-emerald-700' : 'border-emerald-900/70 bg-emerald-950/20 text-emerald-200'}`}>
            {currentBpm || mission.bpmStart || 0} BPM
          </span>
          <span className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase ${isLight ? 'border-amber-200 bg-white text-amber-700' : 'border-amber-900/70 bg-amber-950/20 text-amber-200'}`}>
            {mission.targetCount ? `${mission.targetCount} alvos` : `${mission.durationMinutes} min`}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
        <PracticeTimer minutes={mission.durationMinutes} isLight={isLight} />
        <button
          onClick={() => onStart(mission)}
          className="rounded-xl border border-blue-400/30 bg-[linear-gradient(180deg,#4f8df3,#2563eb)] px-6 py-4 text-[10px] font-black uppercase text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_16px_32px_rgba(37,99,235,0.24)] transition hover:-translate-y-0.5"
        >
          Iniciar missão
        </button>
      </div>
    </div>
  </section>
);

export default PracticeMissionCard;
