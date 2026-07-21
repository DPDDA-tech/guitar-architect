import React, { useEffect, useState } from 'react';
import type { MyAcademyCompanionId } from '../../types/myAcademyCompanion';
import {
  MY_ACADEMY_COMPANIONS,
  clearMyAcademyCompanionChoice,
  createMyAcademyCompanionChoice,
  loadMyAcademyCompanionChoice,
  saveMyAcademyCompanionChoice,
} from '../../utils/myAcademyCompanion';

interface MyAcademyCompanionChooserProps {
  lang: 'pt' | 'en';
  compact?: boolean;
}

const MyAcademyCompanionChooser: React.FC<MyAcademyCompanionChooserProps> = ({ lang, compact = false }) => {
  const [selectedId, setSelectedId] = useState<MyAcademyCompanionId | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelectedId(loadMyAcademyCompanionChoice()?.companionId ?? null);
  }, []);

  const choose = (companionId: MyAcademyCompanionId) => {
    saveMyAcademyCompanionChoice(createMyAcademyCompanionChoice(companionId));
    setSelectedId(companionId);
    setSaved(true);
  };

  const clear = () => {
    clearMyAcademyCompanionChoice();
    setSelectedId(null);
    setSaved(true);
  };

  const isPt = lang === 'pt';

  return (
    <section id="my-academy-companion-choice" className={`rounded-3xl border border-cyan-400/25 bg-slate-950/45 ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start gap-4">
        <img src="/instructors/1000/clara-card-instructor.webp" alt={isPt ? 'Clara, guia do My Academy' : 'Clara, My Academy guide'} className="h-14 w-14 shrink-0 rounded-full border-2 border-amber-300 object-cover object-top" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">{isPt ? 'Um convite de Clara' : 'An invitation from Clara'}</p>
          <h2 className="mt-1 text-lg font-black text-white">{isPt ? 'Quem você gostaria que acompanhasse os próximos passos?' : 'Who would you like to accompany your next steps?'}</h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">{isPt ? 'Esta escolha é opcional, pode ser alterada a qualquer momento e não muda o currículo nem bloqueia caminhos.' : 'This choice is optional, can be changed at any time, and does not change the curriculum or block paths.'}</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">{isPt ? 'Você encontrará ambos ao longo da jornada. Escolha apenas qual perspectiva deseja ter mais próxima neste momento.' : 'You will find both of them along the journey. Just choose which perspective you would like to have closer right now.'}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {MY_ACADEMY_COMPANIONS.map(companion => {
          const selected = selectedId === companion.id;
          return (
            <button
              key={companion.id}
              type="button"
              aria-pressed={selected}
              onClick={() => choose(companion.id)}
              className={`flex min-h-[148px] items-start gap-4 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${selected ? 'border-cyan-300 bg-cyan-400/12' : 'border-slate-700 bg-slate-950/60 hover:border-cyan-500/70'}`}
            >
              <img src={companion.image} alt={companion.name} className="h-20 w-20 shrink-0 rounded-full border-2 border-cyan-300/70 object-cover object-top shadow-lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-lg font-black text-white">{companion.name}</p>
                  {selected && <span className="rounded-full border border-cyan-300/60 bg-cyan-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-100">{isPt ? 'Escolhido' : 'Selected'}</span>}
                </div>
                <p className="mt-1 text-xs font-black uppercase tracking-wide text-cyan-300">{companion.title[lang]}</p>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-300">{companion.invitation[lang]}</p>
                {!compact && <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-500">{companion.emphasis[lang]}</p>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={clear} className="min-h-10 rounded-xl border border-slate-700 px-4 text-xs font-black text-slate-300 hover:border-slate-500">
          {selectedId ? (isPt ? 'Continuar sem acompanhante' : 'Continue without a companion') : (isPt ? 'Nenhum acompanhante por enquanto' : 'No companion for now')}
        </button>
        {saved && <p role="status" className="text-xs font-bold text-cyan-300">{selectedId ? (isPt ? 'Escolha salva neste dispositivo.' : 'Choice saved on this device.') : (isPt ? 'Escolha removida.' : 'Choice removed.')}</p>}
      </div>
    </section>
  );
};

export default MyAcademyCompanionChooser;
