import React, { useCallback, useState } from 'react';
import { NMC_RIT_001 } from '../data/learningUnits/nmcRit001';
import { getEcosystemBrandAsset } from '../utils/ecosystemBrandAssets';
import { navigateToPath } from '../utils/fretboardNavigation';
import {
  getMyAcademySuggestion,
  loadMyAcademyIntroSeen,
  loadMyAcademySelfRecord,
  markMyAcademyIntroSeen,
} from '../utils/myAcademyJourney';
import { getMyAcademyWelcomeMode } from '../utils/myAcademyMapPresentation';
import { useGlobalPreferences } from '../utils/useGlobalPreferences';
import AppFooter from './AppFooter';
import GlobalPreferenceControls from './GlobalPreferenceControls';
import MyAcademyCurriculumMap from './myAcademy/MyAcademyCurriculumMap';
import MyAcademyWelcome from './myAcademy/MyAcademyWelcome';

const MyAcademyPage: React.FC = () => {
  const { theme, lang, setTheme, setLang } = useGlobalPreferences();
  const isLight = theme === 'light';
  const isPt = lang === 'pt';
  const academyLogo = getEcosystemBrandAsset('academy', theme);
  const selfRecord = loadMyAcademySelfRecord();
  const [isFirstAccess] = useState(() => !loadMyAcademyIntroSeen() && !selfRecord);
  const [mapOpen, setMapOpen] = useState(isFirstAccess);
  const [focusMapRequest, setFocusMapRequest] = useState(0);
  const suggestion = selfRecord ? getMyAcademySuggestion(selfRecord.nextPreference, lang) : null;

  const declaredChoices = selfRecord
    ? [
        selfRecord.interaction
          ? NMC_RIT_001.selfRecord.interactions.find(option => option.id === selfRecord.interaction)?.label
          : null,
        selfRecord.perception
          ? NMC_RIT_001.selfRecord.perceptions.find(option => option.id === selfRecord.perception)?.label
          : null,
        selfRecord.nextPreference
          ? NMC_RIT_001.selfRecord.nextPreferences.find(option => option.id === selfRecord.nextPreference)?.label
          : null,
      ].filter((choice): choice is string => Boolean(choice))
    : [];

  const recordedAt = selfRecord
    ? new Intl.DateTimeFormat(isPt ? 'pt-BR' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(selfRecord.recordedAt))
    : null;

  const principles = isPt ? [
    {
      label: 'Direção',
      title: 'Você enxerga o caminho',
      text: 'Os assuntos deixam de aparecer como peças soltas e passam a ocupar um lugar compreensível dentro da jornada.',
    },
    {
      label: 'Aplicação',
      title: 'A teoria encontra o instrumento',
      text: 'Cada tema deverá se conectar a exercícios, práticas guiadas ou ferramentas do Studio sempre que isso fizer sentido.',
    },
    {
      label: 'Liberdade',
      title: 'Sugestão não é bloqueio',
      text: 'Você poderá seguir o roteiro sugerido, revisar, explorar outros assuntos ou avançar por conta própria.',
    },
  ] : [
    {
      label: 'Direction',
      title: 'You can see the path',
      text: 'Topics stop appearing as isolated pieces and begin to occupy a clear place within the journey.',
    },
    {
      label: 'Application',
      title: 'Theory meets the instrument',
      text: 'Each topic should connect to exercises, guided practice or Studio tools whenever that connection is useful.',
    },
    {
      label: 'Freedom',
      title: 'A suggestion is not a lock',
      text: 'You may follow the suggested route, review, explore other subjects or move ahead on your own.',
    },
  ];

  const rememberMapEngagement = useCallback(() => {
    markMyAcademyIntroSeen();
  }, []);

  const openJourneyMap = () => {
    rememberMapEngagement();
    setMapOpen(true);
    setFocusMapRequest(current => current + 1);
    window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      document.getElementById('mapa')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  };

  const openPilotUnit = () => {
    rememberMapEngagement();
    navigateToPath('/my-academy/prototype/nmc-rit-001');
  };

  const nowPanel = (
    <section id="agora" className={`scroll-mt-20 border-y px-5 py-12 sm:py-16 ${isLight ? 'border-cyan-100 bg-cyan-50/55' : 'border-cyan-950/70 bg-cyan-950/15'}`} aria-labelledby="my-academy-now-title">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{isPt ? 'Agora' : 'Now'}</p>
          <h2 id="my-academy-now-title" className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${isLight ? 'text-slate-950' : 'text-slate-50'}`}>
            {isPt ? 'Um próximo passo explicado, sem limitar sua exploração.' : 'An explained next step, without limiting your exploration.'}
          </h2>
          <p className={`mt-4 text-sm font-semibold leading-relaxed sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            {isPt
              ? 'A sugestão considera somente o autorregistro salvo neste dispositivo e usa uma regra direta, sem recomendação por IA.'
              : 'The suggestion considers only the self-record saved on this device and uses a direct rule, without AI recommendations.'}
          </p>
        </div>

        {!selfRecord ? (
          <article className={`mt-8 rounded-[2rem] border p-6 sm:p-8 ${isLight ? 'border-cyan-200 bg-white shadow-[0_18px_55px_rgba(15,76,129,0.08)]' : 'border-cyan-800/60 bg-slate-950/75'}`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
              {isPt ? 'Primeira experiência sugerida' : 'Suggested first experience'}
            </p>
            <h3 className={`mt-3 text-2xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
              {isPt ? 'Pulso e regularidade' : 'Pulse and regularity'}
            </h3>
            <p className={`mt-4 max-w-3xl text-sm font-semibold leading-relaxed sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {isPt
                ? 'Sugerimos esta unidade porque ela apresenta a relação entre percepção, prática e ferramentas que será usada ao longo do My Academy.'
                : 'We suggest this unit because it introduces the relationship between perception, practice and tools that will be used throughout My Academy.'}
            </p>
            <button
              type="button"
              onClick={openPilotUnit}
              className="mt-6 min-h-12 rounded-xl bg-cyan-700 px-6 text-sm font-black text-white shadow-lg shadow-cyan-950/15 transition hover:bg-cyan-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
            >
              {isPt ? 'Começar' : 'Start'}
            </button>
          </article>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <article className={`rounded-[2rem] border p-6 sm:p-8 ${isLight ? 'border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]' : 'border-slate-700 bg-slate-950/75'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                {isPt ? 'Registro recente' : 'Recent record'}
              </p>
              <h3 className={`mt-3 text-2xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                {isPt ? 'Pulso e regularidade' : 'Pulse and regularity'}
              </h3>
              <p className="mt-2 text-xs font-bold text-slate-500">NMC-RIT-001 · {recordedAt}</p>
              <div className="mt-6">
                <p className={`text-xs font-black uppercase tracking-[0.16em] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {isPt ? 'Escolhas declaradas' : 'Declared choices'}
                </p>
                {declaredChoices.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {declaredChoices.map(choice => (
                      <li key={choice} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-slate-700 bg-slate-900 text-slate-200'}`}>
                        {choice}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500">
                    {isPt ? 'Nenhuma escolha opcional foi declarada.' : 'No optional choice was declared.'}
                  </p>
                )}
              </div>
            </article>

            {suggestion && (
              <article className={`rounded-[2rem] border p-6 sm:p-8 ${isLight ? 'border-cyan-200 bg-[linear-gradient(145deg,#ffffff,#eafaff)] shadow-[0_18px_55px_rgba(15,76,129,0.08)]' : 'border-cyan-800/60 bg-[linear-gradient(145deg,#08101f,#092231)]'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                  {isPt ? 'Sugestão a partir da sua escolha' : 'Suggestion based on your choice'}
                </p>
                <h3 className={`mt-3 text-2xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>{suggestion.title}</h3>
                <p className={`mt-4 text-sm font-semibold leading-relaxed sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{suggestion.explanation}</p>
                {suggestion.destination === '#mapa' ? (
                  <button
                    type="button"
                    onClick={openJourneyMap}
                    className="mt-6 min-h-12 rounded-xl bg-cyan-700 px-6 text-sm font-black text-white shadow-lg shadow-cyan-950/15 transition hover:bg-cyan-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
                  >
                    {suggestion.actionLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigateToPath(suggestion.destination)}
                    className="mt-6 min-h-12 rounded-xl bg-cyan-700 px-6 text-sm font-black text-white shadow-lg shadow-cyan-950/15 transition hover:bg-cyan-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
                  >
                    {suggestion.actionLabel}
                  </button>
                )}
              </article>
            )}
          </div>
        )}
      </div>
    </section>
  );

  const curriculumMap = (
    <MyAcademyCurriculumMap
      lang={lang}
      open={mapOpen}
      isFirstAccess={isFirstAccess}
      hasSelfRecord={Boolean(selfRecord)}
      focusMapRequest={focusMapRequest}
      onOpenChange={setMapOpen}
      onEngage={rememberMapEngagement}
    />
  );

  return (
    <div className={`min-h-screen ${isLight ? 'bg-[#f7f9fc] text-slate-950' : 'bg-[#050914] text-slate-100'}`}>
      <header className={`sticky top-0 z-40 border-b px-4 py-3 backdrop-blur-xl ${isLight ? 'border-slate-200/80 bg-white/90' : 'border-blue-950/70 bg-[#050914]/92'}`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigateToPath('/')}
            className={`min-h-10 rounded-xl border px-4 text-[10px] font-black uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 ${isLight ? 'border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-700' : 'border-slate-700 bg-slate-950/75 text-slate-100 hover:border-cyan-400'}`}
          >
            {isPt ? 'Voltar ao ecossistema' : 'Back to ecosystem'}
          </button>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
          <p className={`text-right text-[9px] font-black uppercase tracking-[0.22em] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
            Guitar Architect · My Academy
          </p>
          <GlobalPreferenceControls theme={theme} lang={lang} onThemeChange={setTheme} onLangChange={setLang} />
          </div>
        </div>
      </header>

      <main>
        <section className={`relative overflow-hidden border-b px-5 py-10 sm:py-14 ${isLight ? 'border-cyan-100 bg-[linear-gradient(140deg,#ffffff_0%,#eefaff_48%,#f8f4e8_100%)]' : 'border-cyan-950/70 bg-[linear-gradient(140deg,#050914_0%,#07182a_52%,#171409_100%)]'} ${isFirstAccess ? 'lg:py-20' : 'lg:py-14'}`}>
          <div className={`pointer-events-none absolute inset-0 opacity-55 [background-size:28px_28px] ${isLight ? '[background-image:linear-gradient(#dbe8f2_1px,transparent_1px),linear-gradient(90deg,#dbe8f2_1px,transparent_1px)]' : '[background-image:linear-gradient(#17314c_1px,transparent_1px),linear-gradient(90deg,#17314c_1px,transparent_1px)]'}`} />
          <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div className={`mx-auto w-full ${isFirstAccess ? 'max-w-[420px]' : 'max-w-[330px]'}`}>
              <img
                src={academyLogo}
                alt="Guitar Architect My Academy"
                className="aspect-square w-full object-contain"
              />
            </div>

            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                {isPt ? 'Direção sem julgamento' : 'Direction without judgement'}
              </p>
              <h1 className={`mt-4 max-w-3xl font-black leading-[1.02] tracking-[-0.04em] ${isLight ? 'text-slate-950' : 'text-white'} ${isFirstAccess ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-4xl sm:text-5xl'}`}>
                {isPt ? 'Sua jornada musical começa com um mapa.' : 'Your musical journey begins with a map.'}
              </h1>
              <p className={`mt-5 max-w-2xl text-base font-semibold leading-relaxed sm:text-lg ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {isPt
                  ? 'O My Academy organiza o conhecimento musical, conecta teoria e aplicação e mostra caminhos possíveis. Você continua livre para decidir o ritmo, revisar, explorar ou pular assuntos.'
                  : 'My Academy organizes musical knowledge, connects theory and application, and shows possible paths. You remain free to choose your pace, review, explore or skip topics.'}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openJourneyMap}
                  className="min-h-12 rounded-xl bg-cyan-700 px-6 text-sm font-black text-white shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
                >
                  {isPt ? 'Conhecer o mapa da jornada' : 'Explore the journey map'}
                </button>
                <button
                  type="button"
                  onClick={openPilotUnit}
                  className={`min-h-12 rounded-xl border px-6 text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 ${isLight ? 'border-slate-300 bg-white text-slate-700 hover:border-cyan-500' : 'border-slate-700 bg-slate-950/75 text-slate-100 hover:border-cyan-400'}`}
                >
                  {isPt ? 'Experimentar a primeira unidade' : 'Try the first unit'}
                </button>
              </div>
              <p className={`mt-4 max-w-2xl text-xs font-semibold leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {isPt
                  ? 'Protótipo gratuito e experimental. O Guitar Architect não atribui notas e não julga sua execução.'
                  : 'Free experimental prototype. Guitar Architect does not grade or judge your performance.'}
              </p>
            </div>
          </div>
        </section>

        {isFirstAccess && <MyAcademyWelcome lang={lang} isLight={isLight} mode={getMyAcademyWelcomeMode(true)} />}
        {isFirstAccess && curriculumMap}
        {nowPanel}
        {!isFirstAccess && curriculumMap}
        {!isFirstAccess && <MyAcademyWelcome lang={lang} isLight={isLight} mode={getMyAcademyWelcomeMode(false)} />}

        <section className="px-5 py-12 sm:py-16" aria-labelledby="my-academy-how-title">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{isPt ? 'Como funciona' : 'How it works'}</p>
              <h2 id="my-academy-how-title" className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${isLight ? 'text-slate-950' : 'text-white'}`}>
                {isPt ? 'Um ambiente para compreender caminhos possíveis.' : 'A place to understand possible paths.'}
              </h2>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {principles.map((principle, index) => (
                <article key={principle.label} className={`rounded-[2rem] border p-6 ${isLight ? 'border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]' : 'border-slate-700 bg-slate-950/65'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{principle.label}</span>
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-700 bg-cyan-950 text-cyan-200'}`}>{index + 1}</span>
                  </div>
                  <h3 className={`mt-5 text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{principle.title}</h3>
                  <p className={`mt-3 text-sm font-semibold leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{principle.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-14 sm:pb-20" aria-labelledby="my-academy-diana-title">
          <article className={`mx-auto max-w-7xl rounded-[2rem] border p-6 sm:p-8 ${isLight ? 'border-amber-200 bg-[linear-gradient(145deg,#fffdf7,#fff8e8)]' : 'border-amber-800/50 bg-[linear-gradient(145deg,#111827,#211b0c)]'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">Diana</p>
            <h2 id="my-academy-diana-title" className={`mt-3 text-2xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
              {isPt ? 'Acolhimento conectado a todo o ecossistema.' : 'Welcome connected across the ecosystem.'}
            </h2>
            <p className={`mt-4 max-w-4xl text-sm font-semibold leading-relaxed sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {isPt
                ? 'Diana acolhe e orienta as pessoas entre os diferentes ambientes do Guitar Architect. Futuramente, uma conversa personalizada poderá considerar instrumento, experiência declarada, objetivos, tempo e preferências sem transformar essas informações em julgamento.'
                : 'Diana welcomes and guides people across Guitar Architect’s different environments. In the future, a personalized conversation may consider instrument, declared experience, goals, time and preferences without turning that information into judgement.'}
            </p>
            <span className={`mt-5 inline-flex rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] ${isLight ? 'border-amber-300 bg-white/70 text-amber-800' : 'border-amber-700 bg-amber-950/60 text-amber-200'}`}>
              {isPt ? 'Orientação personalizada futura' : 'Future personalized guidance'}
            </span>
          </article>
        </section>
      </main>

      <AppFooter
        isLight={isLight}
        lang={lang}
        logoSrc={academyLogo}
        logoAlt="Guitar Architect My Academy"
        logoClassName="h-14 w-14 object-contain"
      />
    </div>
  );
};

export default MyAcademyPage;
