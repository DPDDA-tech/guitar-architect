import React from 'react';
import { getGlobalLang } from '../utils/ecosystemPreferences';
import { navigateToPath } from '../utils/fretboardNavigation';
import AppFooter from './AppFooter';

type JourneyMoment = {
  number: string;
  title: string;
  description: string;
  status: string;
  available?: boolean;
};

const MyAcademyPage: React.FC = () => {
  const lang = getGlobalLang();
  const isPt = lang === 'pt';

  const moments: JourneyMoment[] = isPt ? [
    {
      number: '0',
      title: 'Descoberta',
      description: 'Conhecer o ambiente, explorar livremente e futuramente conversar com Diana sobre instrumento, experiência, objetivos e tempo disponível.',
      status: 'Onboarding em construção',
    },
    {
      number: '1',
      title: 'Iniciação',
      description: 'Pulso, produção sonora, orientação no instrumento e primeiras conexões entre o que você percebe, compreende e experimenta.',
      status: 'Primeira experiência disponível',
      available: true,
    },
    {
      number: '2',
      title: 'Fundamentos',
      description: 'Ritmo, intervalos, notas, escalas, acordes, percepção, leitura aplicada e recursos técnicos essenciais.',
      status: 'Mapa editorial definido',
    },
    {
      number: '3',
      title: 'Consolidação',
      description: 'Conectar fundamentos, ampliar repertório de aplicações e reconhecer relações no braço do instrumento.',
      status: 'Conteúdo em planejamento',
    },
    {
      number: '4',
      title: 'Desenvolvimento',
      description: 'Aprofundar linguagem, harmonia, técnica, percepção e criação conforme os objetivos escolhidos.',
      status: 'Conteúdo em planejamento',
    },
    {
      number: '5',
      title: 'Autonomia',
      description: 'Usar o conhecimento para estudar, analisar, criar, praticar e tomar decisões musicais com independência crescente.',
      status: 'Conteúdo em planejamento',
    },
    {
      number: '6',
      title: 'Pré-profissionalização',
      description: 'Maturidade funcional para projetos mais complexos, sem equivalência automática, certificação ou julgamento profissional.',
      status: 'Horizonte curricular',
    },
  ] : [
    {
      number: '0',
      title: 'Discovery',
      description: 'Meet the environment, explore freely and, in the future, talk with Diana about your instrument, experience, goals and available time.',
      status: 'Onboarding in development',
    },
    {
      number: '1',
      title: 'Initiation',
      description: 'Pulse, sound production, instrument orientation and the first links between what you perceive, understand and try.',
      status: 'First experience available',
      available: true,
    },
    {
      number: '2',
      title: 'Fundamentals',
      description: 'Rhythm, intervals, notes, scales, chords, ear training, applied reading and essential technical resources.',
      status: 'Editorial map defined',
    },
    {
      number: '3',
      title: 'Consolidation',
      description: 'Connect fundamentals, expand practical applications and recognize relationships across the fretboard.',
      status: 'Content being planned',
    },
    {
      number: '4',
      title: 'Development',
      description: 'Deepen language, harmony, technique, perception and creation according to your chosen goals.',
      status: 'Content being planned',
    },
    {
      number: '5',
      title: 'Autonomy',
      description: 'Use knowledge to study, analyze, create, practise and make musical decisions with increasing independence.',
      status: 'Content being planned',
    },
    {
      number: '6',
      title: 'Pre-professionalization',
      description: 'Functional maturity for more complex projects, without automatic equivalence, certification or professional judgement.',
      status: 'Curricular horizon',
    },
  ];

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

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigateToPath('/')}
            className="min-h-10 rounded-xl border border-slate-300 bg-white px-4 text-[10px] font-black uppercase tracking-wider text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700"
          >
            {isPt ? 'Voltar ao ecossistema' : 'Back to ecosystem'}
          </button>
          <p className="text-right text-[9px] font-black uppercase tracking-[0.22em] text-cyan-700">
            Guitar Architect · My Academy
          </p>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-cyan-100 bg-[linear-gradient(140deg,#ffffff_0%,#eefaff_48%,#f8f4e8_100%)] px-5 py-10 sm:py-14 lg:py-20">
          <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:linear-gradient(#dbe8f2_1px,transparent_1px),linear-gradient(90deg,#dbe8f2_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div className="mx-auto w-full max-w-[420px]">
              <img
                src="/gamyacademylogo.webp"
                alt="Guitar Architect My Academy"
                className="aspect-square w-full object-contain drop-shadow-[0_28px_42px_rgba(15,76,129,0.18)]"
              />
              <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {isPt ? 'Identidade visual provisória · em revisão' : 'Provisional visual identity · under review'}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-700">
                {isPt ? 'Direção sem julgamento' : 'Direction without judgement'}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                {isPt ? 'Sua jornada musical começa com um mapa.' : 'Your musical journey begins with a map.'}
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-relaxed text-slate-600 sm:text-lg">
                {isPt
                  ? 'O My Academy organiza o conhecimento musical, conecta teoria e aplicação e mostra caminhos possíveis. Você continua livre para decidir o ritmo, revisar, explorar ou pular assuntos.'
                  : 'My Academy organizes musical knowledge, connects theory and application, and shows possible paths. You remain free to choose your pace, review, explore or skip topics.'}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigateToPath('/my-academy/prototype/nmc-rit-001')}
                  className="min-h-12 rounded-xl bg-cyan-700 px-6 text-sm font-black text-white shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-600"
                >
                  {isPt ? 'Experimentar a primeira unidade' : 'Try the first unit'}
                </button>
                <a
                  href="#mapa"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-black text-slate-700 transition hover:border-cyan-500"
                >
                  {isPt ? 'Ver o percurso completo' : 'See the complete path'}
                </a>
              </div>
              <p className="mt-4 max-w-2xl text-xs font-semibold leading-relaxed text-slate-500">
                {isPt
                  ? 'Protótipo gratuito e experimental. O Guitar Architect não atribui notas, não certifica domínio e não julga sua execução.'
                  : 'Free experimental prototype. Guitar Architect does not grade, certify mastery or judge your performance.'}
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-700">{isPt ? 'Como funciona' : 'How it works'}</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {isPt ? 'Um ambiente para saber onde você está e o que pode vir depois.' : 'A place to see where you are and what may come next.'}
              </h2>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {principles.map((principle, index) => (
                <article key={principle.label} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">{principle.label}</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-sm font-black text-cyan-800">{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-black tracking-tight text-slate-900">{principle.title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">{principle.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="mapa" className="border-y border-slate-200 bg-slate-950 px-5 py-12 text-white sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">{isPt ? 'Mapa geral' : 'General map'}</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  {isPt ? 'Sete momentos de uma jornada aberta.' : 'Seven moments in an open journey.'}
                </h2>
                <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-400 sm:text-base">
                  {isPt
                    ? 'A sequência oferece direção, mas não funciona como uma escada fechada. Os conteúdos poderão ser visitados conforme experiência, objetivos e curiosidade.'
                    : 'The sequence offers direction, but it is not a closed staircase. Topics may be visited according to experience, goals and curiosity.'}
                </p>
              </div>
              <p className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">
                {isPt ? '1 experiência disponível agora' : '1 experience available now'}
              </p>
            </div>

            <ol className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {moments.map(moment => (
                <li key={moment.number} className={`relative overflow-hidden rounded-[1.75rem] border p-5 ${moment.available ? 'border-cyan-300/55 bg-cyan-950/35' : 'border-slate-800 bg-slate-900/65'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${moment.available ? 'bg-cyan-300 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>{moment.number}</span>
                    <span className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-[0.14em] ${moment.available ? 'border-cyan-300/40 text-cyan-200' : 'border-slate-700 text-slate-500'}`}>{moment.status}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-black tracking-tight text-white">{moment.title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-400">{moment.description}</p>
                  {moment.available && (
                    <button
                      type="button"
                      onClick={() => navigateToPath('/my-academy/prototype/nmc-rit-001')}
                      className="mt-5 min-h-11 w-full rounded-xl bg-cyan-600 px-4 text-xs font-black text-white transition hover:bg-cyan-500"
                    >
                      {isPt ? 'Abrir Pulso e regularidade' : 'Open Pulse and regularity'}
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-5 py-12 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-amber-200 bg-[linear-gradient(145deg,#fffdf7,#fff8e8)] p-6 sm:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">Diana</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{isPt ? 'O acolhimento virá antes do roteiro.' : 'Welcome will come before the route.'}</h2>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-600">
                {isPt
                  ? 'No onboarding futuro, Diana ajudará a registrar o que você já conhece, qual instrumento utiliza, onde quer chegar e quanto tempo pretende dedicar — sem aplicar prova de entrada.'
                  : 'In the future onboarding, Diana will help record what you already know, your instrument, where you want to go and how much time you wish to dedicate — without an entrance test.'}
              </p>
              <span className="mt-5 inline-flex rounded-full border border-amber-300 bg-white/70 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-amber-800">
                {isPt ? 'Funcionalidade futura' : 'Future feature'}
              </span>
            </article>

            <article className="rounded-[2rem] border border-cyan-200 bg-[linear-gradient(145deg,#f8feff,#eafaff)] p-6 sm:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700">Clara</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{isPt ? 'Um cronograma poderá nascer das suas escolhas.' : 'A schedule may grow from your choices.'}</h2>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-600">
                {isPt
                  ? 'Clara poderá transformar objetivos e disponibilidade em uma sugestão de rotina, lembretes e retomadas. O cronograma continuará sendo um apoio, nunca uma obrigação.'
                  : 'Clara may turn goals and availability into a suggested routine, reminders and return points. The schedule will remain support, never an obligation.'}
              </p>
              <span className="mt-5 inline-flex rounded-full border border-cyan-300 bg-white/70 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-800">
                {isPt ? 'Funcionalidade futura' : 'Future feature'}
              </span>
            </article>
          </div>
        </section>

        <section className="px-5 pb-14 sm:pb-20">
          <div className="mx-auto max-w-4xl rounded-[2.25rem] border border-cyan-200 bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,76,129,0.10)] sm:p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-700">{isPt ? 'Primeiro passo' : 'First step'}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{isPt ? 'Experimente antes de definirmos o restante.' : 'Try it before we define the rest.'}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-slate-600 sm:text-base">
              {isPt
                ? 'A unidade Pulso e regularidade testa a linguagem, as microatividades, a acessibilidade e a ligação com o Studio. Ela é uma amostra do modelo, não um curso completo.'
                : 'The Pulse and regularity unit tests language, microactivities, accessibility and the Studio connection. It is a sample of the model, not a complete course.'}
            </p>
            <button
              type="button"
              onClick={() => navigateToPath('/my-academy/prototype/nmc-rit-001')}
              className="mt-7 min-h-12 rounded-xl bg-cyan-700 px-7 text-sm font-black text-white shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-600"
            >
              {isPt ? 'Iniciar experiência experimental' : 'Start experimental experience'}
            </button>
          </div>
        </section>
      </main>

      <AppFooter
        isLight
        lang={lang}
        logoSrc="/gamyacademylogo.webp"
        logoAlt="Guitar Architect My Academy"
        logoClassName="h-14 w-14 object-contain"
      />
    </div>
  );
};

export default MyAcademyPage;
