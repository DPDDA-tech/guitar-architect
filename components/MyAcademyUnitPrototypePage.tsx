import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NMC_RIT_001 } from '../data/learningUnits/nmcRit001';
import type { LearningInteraction } from '../types/learningUnit';
import type { MyAcademyNextPreference, MyAcademyPerception } from '../types/myAcademyJourney';
import { navigateToPath } from '../utils/fretboardNavigation';
import { createNmcRit001SelfRecord, saveMyAcademySelfRecord } from '../utils/myAcademyJourney';
import { useGlobalPreferences } from '../utils/useGlobalPreferences';
import GlobalPreferenceControls from './GlobalPreferenceControls';
import AccessiblePulse from './myAcademy/AccessiblePulse';
import MyAcademyCompanionChooser from './myAcademy/MyAcademyCompanionChooser';

const StepMarker = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center gap-2" aria-label={`Etapa ${current + 1} de ${total}`}>
    {Array.from({ length: total }, (_, index) => (
      <span key={index} aria-hidden="true" className={`h-1.5 flex-1 rounded-full ${index <= current ? 'bg-cyan-300' : 'bg-slate-800'}`} />
    ))}
  </div>
);

const MyAcademyUnitPrototypePage: React.FC = () => {
  const { theme, lang, setTheme, setLang } = useGlobalPreferences();
  const isLight = theme === 'light';
  const [step, setStep] = useState(0);
  const [conceptDecision, setConceptDecision] = useState<'check' | 'skip' | null>(null);
  const [conceptChoice, setConceptChoice] = useState<string | null>(null);
  const [interaction, setInteraction] = useState<LearningInteraction | null>(null);
  const [perception, setPerception] = useState<MyAcademyPerception | null>(null);
  const [nextPreference, setNextPreference] = useState<MyAcademyNextPreference | null>(null);
  const [recordSaved, setRecordSaved] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const totalSteps = 8;
  const activity = step >= 1 && step <= 3 ? NMC_RIT_001.activities[step - 1] : null;
  const conceptFeedback = useMemo(
    () => NMC_RIT_001.conceptCheck.choices.find(choice => choice.id === conceptChoice)?.feedback,
    [conceptChoice],
  );

  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const saveRecord = () => {
    saveMyAcademySelfRecord(createNmcRit001SelfRecord({
      unitVersion: NMC_RIT_001.version,
      interaction,
      perception,
      nextPreference,
    }));
    setRecordSaved(true);
  };

  const goNext = () => setStep(current => Math.min(totalSteps - 1, current + 1));
  const goBack = () => setStep(current => Math.max(0, current - 1));

  return (
    <div className={`min-h-screen ${isLight ? 'blueprint-grid-light bg-slate-100 text-slate-900' : 'blueprint-grid-dark bg-zinc-950 text-zinc-100'}`}>
      <header className={`sticky top-0 z-40 border-b px-4 py-3 backdrop-blur-xl ${isLight ? 'border-slate-200 bg-white/95' : 'border-blue-950/70 bg-[#050914]/95'}`}>
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => navigateToPath('/my-academy')} className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 ${isLight ? 'border-slate-300 bg-white text-slate-700 hover:border-cyan-500' : 'border-slate-700 text-slate-200 hover:border-blue-400'}`}>
              Voltar ao My Academy
            </button>
            <div className="ml-auto text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">My Academy · experiência guiada</p>
              <p className="mt-1 text-xs font-bold text-slate-400">Pulso e regularidade</p>
            </div>
            <GlobalPreferenceControls theme={theme} lang={lang} onThemeChange={setTheme} onLangChange={setLang} />
          </div>
          <div className="mt-3"><StepMarker current={step} total={totalSteps} /></div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
        {lang === 'en' && (
          <p role="status" className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${isLight ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-amber-700/60 bg-amber-950/35 text-amber-100'}`}>
            This first guided experience is currently available in Portuguese only.
          </p>
        )}

        <section className="rounded-[2rem] border border-blue-900/45 bg-[linear-gradient(145deg,rgba(8,13,22,0.98),rgba(3,7,18,0.96))] p-5 shadow-[0_30px_100px_rgba(2,6,23,0.62)] sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-300">
            {step === 0 ? 'Iniciação · Ritmo' : activity?.eyebrow ?? (step === 4 ? 'Pausa opcional' : step === 5 ? 'Conferir a ideia' : step === 6 ? 'Próximo passo' : 'Escolhas abertas')}
          </p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-3xl font-black tracking-tight text-white outline-none sm:text-4xl">
            {step === 0 ? NMC_RIT_001.title : activity?.title ?? (step === 4 ? 'Como você está se sentindo?' : step === 5 ? 'Conferir a ideia principal' : step === 6 ? 'O que você prefere fazer agora?' : 'Escolha como seguir')}
          </h1>

          {step === 0 && (
            <div className="mt-6">
              <div className="mb-5 flex items-center gap-4 rounded-2xl border border-cyan-400/25 bg-cyan-950/20 p-4">
                <img src="/instructors/1000/clara-card-instructor.webp" alt="Clara, guia do My Academy" className="h-16 w-16 rounded-2xl object-cover" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Clara acompanha esta etapa</p>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-cyan-100/80">Vamos começar por uma experiência simples: perceber uma referência que se repete no tempo.</p>
                </div>
              </div>
              <div className="space-y-4 text-base font-semibold leading-relaxed text-slate-300">
                {NMC_RIT_001.opening.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <div className="mt-6 rounded-2xl border border-cyan-500/25 bg-cyan-950/18 p-4">
                <p className="text-sm font-bold leading-relaxed text-cyan-100">{NMC_RIT_001.subtitle}</p>
                <p className="mt-2 text-xs font-semibold text-cyan-200/70">Percurso completo estimado: 4–7 minutos. Você pode parar ao final de qualquer microatividade.</p>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Como esta experiência funciona</p>
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
                  {step === 3 && <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-blue-300">Ferramenta do Studio · exploração livre</p>}
                  <AccessiblePulse allowTempoChange={step === 3} />
                </div>
              )}
              {step === 2 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setInteraction('played')} aria-pressed={interaction === 'played'} className={`min-h-14 rounded-xl border px-4 text-sm font-black ${interaction === 'played' ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100' : 'border-slate-700 bg-slate-950/50 text-slate-200'}`}>Experimentei com som</button>
                  <button type="button" onClick={() => setInteraction('observed')} aria-pressed={interaction === 'observed'} className={`min-h-14 rounded-xl border px-4 text-sm font-black ${interaction === 'observed' ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100' : 'border-slate-700 bg-slate-950/50 text-slate-200'}`}>Preferi apenas perceber</button>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="mt-6">
              <div className="rounded-3xl border border-cyan-400/25 bg-cyan-950/20 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Uma pausa com Clara</p>
                <p className="mt-2 text-lg font-black leading-relaxed text-cyan-50">E então, como você está se sentindo em relação ao que vimos até aqui?</p>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-cyan-100/75">Se quiser, você pode responder a algumas perguntas para conferir a ideia principal. Não é uma prova e sua resposta não bloqueia o caminho.</p>
              </div>
              <div className="mt-5 grid gap-3" role="group" aria-label="Escolha como deseja seguir">
                <button type="button" onClick={() => { setConceptDecision('check'); setStep(5); }} className="min-h-12 rounded-xl border border-cyan-400/40 bg-cyan-600/20 px-4 text-sm font-black text-cyan-50">Quero conferir o que entendi</button>
                <button type="button" onClick={() => { setConceptDecision('skip'); setStep(6); }} className="min-h-12 rounded-xl border border-slate-700 bg-slate-950/55 px-4 text-sm font-black text-slate-200">Prefiro seguir sem responder</button>
                <button type="button" onClick={() => setStep(0)} className="min-h-12 rounded-xl border border-slate-700 px-4 text-sm font-black text-slate-300">Quero rever a explicação</button>
              </div>
            </div>
          )}

          {step === 5 && conceptDecision === 'check' && (
            <div className="mt-6">
              <p className="text-base font-bold leading-relaxed text-slate-200">{NMC_RIT_001.conceptCheck.prompt}</p>
              <div className="mt-4 space-y-3" role="radiogroup" aria-label={NMC_RIT_001.conceptCheck.prompt}>
                {NMC_RIT_001.conceptCheck.choices.map(choice => (
                  <button key={choice.id} type="button" role="radio" aria-checked={conceptChoice === choice.id} onClick={() => setConceptChoice(choice.id)} className={`w-full rounded-2xl border p-4 text-left text-sm font-bold leading-relaxed ${conceptChoice === choice.id ? 'border-cyan-300 bg-cyan-400/12 text-cyan-50' : 'border-slate-800 bg-slate-950/50 text-slate-300'}`}>{choice.label}</button>
                ))}
              </div>
              {conceptFeedback && <div className="mt-4 rounded-2xl border border-cyan-400/25 bg-cyan-950/20 p-4 text-sm font-semibold leading-relaxed text-cyan-100" role="status">{conceptFeedback}</div>}
              <p className="mt-4 text-xs font-semibold text-slate-500">Esta pergunta é opcional, não bloqueia a jornada e não avalia sua execução.</p>
            </div>
          )}

          {step === 6 && (
            <div className="mt-6 space-y-6">
              <fieldset>
                <legend className="text-sm font-black text-white">O que você prefere fazer agora?</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {NMC_RIT_001.selfRecord.nextPreferences.map(option => (
                    <button key={option.id} type="button" aria-pressed={nextPreference === option.id} onClick={() => setNextPreference(option.id as MyAcademyNextPreference)} className={`min-h-12 rounded-xl border px-3 text-sm font-bold ${nextPreference === option.id ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100' : 'border-slate-700 bg-slate-950/50 text-slate-300'}`}>{option.label}</button>
                  ))}
                </div>
              </fieldset>
              <details className="group rounded-2xl border border-slate-700 bg-slate-950/45">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-black text-slate-200"><span>Registrar como foi esta experiência — opcional</span><span aria-hidden="true" className="text-lg text-cyan-300">+</span></summary>
                <div className="space-y-6 border-t border-slate-800 p-4">
                  <fieldset><legend className="text-sm font-black text-white">O que você experimentou?</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{NMC_RIT_001.selfRecord.interactions.map(option => <button key={option.id} type="button" aria-pressed={interaction === option.id} onClick={() => setInteraction(option.id)} className={`min-h-12 rounded-xl border px-3 text-sm font-bold ${interaction === option.id ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100' : 'border-slate-700 bg-slate-950/50 text-slate-300'}`}>{option.label}</button>)}</div></fieldset>
                  <fieldset><legend className="text-sm font-black text-white">Como você percebeu a repetição?</legend><div className="mt-3 space-y-2">{NMC_RIT_001.selfRecord.perceptions.map(option => <button key={option.id} type="button" aria-pressed={perception === option.id} onClick={() => setPerception(option.id as MyAcademyPerception)} className={`min-h-12 w-full rounded-xl border px-3 text-left text-sm font-bold ${perception === option.id ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100' : 'border-slate-700 bg-slate-950/50 text-slate-300'}`}>{option.label}</button>)}</div></fieldset>
                </div>
              </details>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={saveRecord} className="min-h-12 rounded-xl border border-cyan-400/40 bg-cyan-600/20 px-4 text-sm font-black text-cyan-100">Salvar escolhas neste dispositivo</button>
                <button type="button" onClick={() => setStep(7)} className="min-h-12 rounded-xl bg-blue-600 px-4 text-sm font-black text-white">Continuar</button>
              </div>
              {recordSaved && <p className="text-center text-sm font-bold text-cyan-300" role="status">Autorregistro salvo localmente. Ele descreve apenas as escolhas que você declarou.</p>}
            </div>
          )}

          {step === 7 && (
            <div className="mt-6 space-y-5">
              <div className="rounded-3xl border border-cyan-400/30 bg-cyan-950/20 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Clara organiza o próximo passo</p>
                <p className="mt-2 text-lg font-black text-cyan-100">A experiência de pulso permanece disponível.</p>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-cyan-100/75">O GA apenas organiza caminhos possíveis a partir das escolhas que você fez. Você continua livre para repetir, explorar ou voltar ao mapa.</p>
              </div>
              <MyAcademyCompanionChooser lang={lang} />
              <div className="grid gap-3">
                <button type="button" onClick={() => setStep(1)} className="min-h-12 rounded-xl border border-slate-700 bg-slate-950/60 px-4 text-sm font-black text-slate-100">Repetir a experiência</button>
                <button type="button" onClick={() => navigateToPath('/studio')} className="min-h-12 rounded-xl border border-blue-400/40 bg-blue-600 px-4 text-sm font-black text-white">Explorar o Studio livremente</button>
                <button type="button" onClick={() => navigateToPath('/my-academy')} className="min-h-12 rounded-xl border border-slate-700 px-4 text-sm font-black text-slate-300">Sair da jornada</button>
              </div>
            </div>
          )}

          {step < 6 && step !== 4 && (
            <div className="mt-8 flex gap-3 border-t border-slate-800 pt-5">
              {step > 0 && <button type="button" onClick={goBack} className="min-h-12 flex-1 rounded-xl border border-slate-700 px-4 text-sm font-black text-slate-300">Voltar</button>}
              <button type="button" onClick={goNext} className="min-h-12 flex-[1.4] rounded-xl bg-blue-600 px-4 text-sm font-black text-white">{step === 0 ? 'Começar' : 'Continuar'}</button>
            </div>
          )}
        </section>

        <p className="mx-auto mt-5 max-w-xl text-center text-[11px] font-semibold leading-relaxed text-slate-500">Sem pontuação, bloqueio ou certificação. As escolhas opcionais são armazenadas somente neste dispositivo.</p>
      </main>
    </div>
  );
};

export default MyAcademyUnitPrototypePage;
