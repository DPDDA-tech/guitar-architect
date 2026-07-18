import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NMC_RIT_001 } from '../data/learningUnits/nmcRit001';
import type { LearningInteraction } from '../types/learningUnit';
import { navigateToPath } from '../utils/fretboardNavigation';
import AccessiblePulse from './myAcademy/AccessiblePulse';

const RECORD_KEY = 'ga_my_academy_nmc_rit_001_self_record';

const StepMarker = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center gap-2" aria-label={`Etapa ${current + 1} de ${total}`}>
    {Array.from({ length: total }, (_, index) => (
      <span
        key={index}
        aria-hidden="true"
        className={`h-1.5 flex-1 rounded-full ${index <= current ? 'bg-cyan-300' : 'bg-slate-800'}`}
      />
    ))}
  </div>
);

const MyAcademyUnitPrototypePage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [conceptChoice, setConceptChoice] = useState<string | null>(null);
  const [interaction, setInteraction] = useState<LearningInteraction | null>(null);
  const [perception, setPerception] = useState<string | null>(null);
  const [nextPreference, setNextPreference] = useState<string | null>(null);
  const [recordSaved, setRecordSaved] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const totalSteps = 7;
  const activity = step >= 1 && step <= 3 ? NMC_RIT_001.activities[step - 1] : null;
  const conceptFeedback = useMemo(
    () => NMC_RIT_001.conceptCheck.choices.find(choice => choice.id === conceptChoice)?.feedback,
    [conceptChoice],
  );

  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const goNext = () => setStep(current => Math.min(totalSteps - 1, current + 1));
  const goBack = () => setStep(current => Math.max(0, current - 1));

  const saveRecord = () => {
    const record = {
      unitId: NMC_RIT_001.id,
      unitVersion: NMC_RIT_001.version,
      recordedAt: new Date().toISOString(),
      declaredByUser: true,
      interaction,
      perception,
      nextPreference,
    };
    window.localStorage.setItem(RECORD_KEY, JSON.stringify(record));
    setRecordSaved(true);
  };

  const selectedConcept = NMC_RIT_001.conceptCheck.choices.find(choice => choice.id === conceptChoice);

  return (
    <div className="blueprint-grid-dark min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-blue-950/70 bg-[#050914]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigateToPath('/')}
              className="rounded-xl border border-slate-700 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-200 hover:border-blue-400"
            >
              Sair do protótipo
            </button>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">My Academy · protótipo interno</p>
              <p className="mt-1 text-xs font-bold text-slate-400">{NMC_RIT_001.id} · v{NMC_RIT_001.version}</p>
            </div>
          </div>
          <div className="mt-3">
            <StepMarker current={step} total={totalSteps} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
        <section className="rounded-[2rem] border border-blue-900/45 bg-[linear-gradient(145deg,rgba(8,13,22,0.98),rgba(3,7,18,0.96))] p-5 shadow-[0_30px_100px_rgba(2,6,23,0.62)] sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-300">
            {step === 0 ? 'Iniciação · Ritmo' : activity?.eyebrow ?? (step === 4 ? 'Compreensão' : step === 5 ? 'Autorregistro opcional' : 'Próximo passo')}
          </p>

          <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-3xl font-black tracking-tight text-white outline-none sm:text-4xl">
            {step === 0
              ? NMC_RIT_001.title
              : activity?.title
                ?? (step === 4 ? 'O que ficou claro?' : step === 5 ? 'Como foi para você?' : 'Experiência encerrada')}
          </h1>

          {step === 0 && (
            <div className="mt-6">
              <div className="space-y-4 text-base font-semibold leading-relaxed text-slate-300">
                {NMC_RIT_001.opening.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <div className="mt-6 rounded-2xl border border-cyan-500/25 bg-cyan-950/18 p-4">
                <p className="text-sm font-bold leading-relaxed text-cyan-100">{NMC_RIT_001.subtitle}</p>
                <p className="mt-2 text-xs font-semibold text-cyan-200/70">Percurso completo estimado: 4–7 minutos. Você pode parar ao final de qualquer microatividade.</p>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">O que o GA não fará</p>
                <ul className="mt-3 space-y-2 text-sm font-semibold leading-relaxed text-slate-300">
                  {NMC_RIT_001.boundaries.map(item => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            </div>
          )}

          {activity && (
            <div className="mt-6">
              <ol className="space-y-3 text-sm font-semibold leading-relaxed text-slate-300">
                {activity.instructions.map((instruction, index) => (
                  <li key={instruction} className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-950/45 p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">{index + 1}</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>

              {(step === 1 || step === 3) && (
                <div className="mt-5">
                  {step === 3 && <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-blue-300">Studio contextual · sem pontuação</p>}
                  <AccessiblePulse
                    allowTempoChange={step === 3}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setInteraction('played')} aria-pressed={interaction === 'played'} className={`min-h-14 rounded-xl border px-4 text-sm font-black ${interaction === 'played' ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100' : 'border-slate-700 bg-slate-950/50 text-slate-200'}`}>
                    Experimentei com som
                  </button>
                  <button type="button" onClick={() => setInteraction('observed')} aria-pressed={interaction === 'observed'} className={`min-h-14 rounded-xl border px-4 text-sm font-black ${interaction === 'observed' ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100' : 'border-slate-700 bg-slate-950/50 text-slate-200'}`}>
                    Preferi apenas perceber
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="mt-6">
              <p className="text-base font-bold leading-relaxed text-slate-200">{NMC_RIT_001.conceptCheck.prompt}</p>
              <div className="mt-4 space-y-3" role="radiogroup" aria-label={NMC_RIT_001.conceptCheck.prompt}>
                {NMC_RIT_001.conceptCheck.choices.map(choice => (
                  <button
                    key={choice.id}
                    type="button"
                    role="radio"
                    aria-checked={conceptChoice === choice.id}
                    onClick={() => setConceptChoice(choice.id)}
                    className={`w-full rounded-2xl border p-4 text-left text-sm font-bold leading-relaxed transition ${conceptChoice === choice.id ? 'border-cyan-300 bg-cyan-400/12 text-cyan-50' : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-blue-500'}`}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              {conceptFeedback && (
                <div className={`mt-4 rounded-2xl border p-4 text-sm font-semibold leading-relaxed ${selectedConcept?.expected ? 'border-emerald-400/35 bg-emerald-950/25 text-emerald-100' : 'border-amber-400/30 bg-amber-950/20 text-amber-100'}`} role="status">
                  {conceptFeedback}
                </div>
              )}
              <p className="mt-4 text-xs font-semibold text-slate-500">Esta pergunta pode sugerir revisão, mas não bloqueia a jornada e não avalia sua execução.</p>
            </div>
          )}

          {step === 5 && (
            <div className="mt-6 space-y-6">
              <fieldset>
                <legend className="text-sm font-black text-white">O que você experimentou?</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {NMC_RIT_001.selfRecord.interactions.map(option => (
                    <button key={option.id} type="button" aria-pressed={interaction === option.id} onClick={() => setInteraction(option.id)} className={`min-h-12 rounded-xl border px-3 text-sm font-bold ${interaction === option.id ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100' : 'border-slate-700 bg-slate-950/50 text-slate-300'}`}>{option.label}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-black text-white">Como você percebeu a repetição?</legend>
                <div className="mt-3 space-y-2">
                  {NMC_RIT_001.selfRecord.perceptions.map(option => (
                    <button key={option.id} type="button" aria-pressed={perception === option.id} onClick={() => setPerception(option.id)} className={`min-h-12 w-full rounded-xl border px-3 text-left text-sm font-bold ${perception === option.id ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100' : 'border-slate-700 bg-slate-950/50 text-slate-300'}`}>{option.label}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-black text-white">O que prefere fazer agora?</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {NMC_RIT_001.selfRecord.nextPreferences.map(option => (
                    <button key={option.id} type="button" aria-pressed={nextPreference === option.id} onClick={() => setNextPreference(option.id)} className={`min-h-12 rounded-xl border px-3 text-sm font-bold ${nextPreference === option.id ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100' : 'border-slate-700 bg-slate-950/50 text-slate-300'}`}>{option.label}</button>
                  ))}
                </div>
              </fieldset>
              <button type="button" onClick={saveRecord} className="min-h-12 w-full rounded-xl border border-emerald-400/40 bg-emerald-600/20 px-4 text-sm font-black text-emerald-100 hover:bg-emerald-600/30">
                Salvar este autorregistro neste dispositivo
              </button>
              {recordSaved && <p className="text-center text-sm font-bold text-emerald-300" role="status">Autorregistro salvo localmente. Ele não constitui avaliação nem prova de domínio.</p>}
            </div>
          )}

          {step === 6 && (
            <div className="mt-6">
              <div className="rounded-3xl border border-cyan-400/30 bg-cyan-950/20 p-5">
                <p className="text-lg font-black text-cyan-100">Você explorou a ideia de pulso.</p>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-cyan-100/75">O GA não conclui que você “dominou” o assunto. Ele apenas organiza o próximo caminho a partir das escolhas que você fez.</p>
              </div>
              <div className="mt-5 grid gap-3">
                <button type="button" onClick={() => setStep(1)} className="min-h-12 rounded-xl border border-slate-700 bg-slate-950/60 px-4 text-sm font-black text-slate-100 hover:border-blue-400">Repetir a experiência</button>
                <button type="button" onClick={() => navigateToPath('/studio')} className="min-h-12 rounded-xl border border-blue-400/40 bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-500">Explorar o Studio livremente</button>
                <button type="button" onClick={() => navigateToPath('/')} className="min-h-12 rounded-xl border border-slate-700 px-4 text-sm font-black text-slate-300 hover:border-slate-500">Voltar ao ecossistema</button>
              </div>
            </div>
          )}

          {step < 6 && (
            <div className="mt-8 flex gap-3 border-t border-slate-800 pt-5">
              {step > 0 && (
                <button type="button" onClick={goBack} className="min-h-12 flex-1 rounded-xl border border-slate-700 px-4 text-sm font-black text-slate-300 hover:border-slate-500">Voltar</button>
              )}
              <button type="button" onClick={goNext} className="min-h-12 flex-[1.4] rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-lg shadow-blue-950/40 hover:bg-blue-500">
                {step === 0 ? 'Começar' : step === 5 ? 'Encerrar experiência' : 'Continuar'}
              </button>
            </div>
          )}
        </section>

        <p className="mx-auto mt-5 max-w-xl text-center text-[11px] font-semibold leading-relaxed text-slate-500">
          Protótipo interno · sem pontuação, bloqueio ou certificação · dados de teste armazenados somente neste dispositivo.
        </p>
      </main>
    </div>
  );
};

export default MyAcademyUnitPrototypePage;
