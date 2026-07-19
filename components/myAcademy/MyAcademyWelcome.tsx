import React from 'react';

interface MyAcademyWelcomeProps {
  lang: 'pt' | 'en';
  isLight: boolean;
  mode?: 'expanded' | 'collapsible';
}

const MyAcademyWelcome: React.FC<MyAcademyWelcomeProps> = ({ lang, isLight, mode = 'expanded' }) => {
  const isPt = lang === 'pt';

  const welcomeContent = (
    <div className="grid overflow-hidden md:grid-cols-[220px_1fr]">
        <div className={`p-5 sm:p-7 ${isLight ? 'bg-[linear-gradient(145deg,#eafaff,#fff8e8)]' : 'bg-[linear-gradient(145deg,#092337,#211b0c)]'}`}>
          <img
            src="/instructors/1000/clara-card-instructor.webp"
            alt={isPt ? 'Clara, guia de jornada e organização do My Academy' : 'Clara, My Academy journey and organization guide'}
            className="mx-auto aspect-square w-full max-w-[180px] rounded-[1.5rem] object-cover shadow-lg"
          />
        </div>
        <div className="p-6 sm:p-8 md:self-center">
          <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
            {isPt ? 'Boas-vindas de Clara' : 'Welcome from Clara'}
          </p>
          <h2 id="my-academy-welcome-title" className={`mt-3 text-2xl font-black tracking-tight sm:text-3xl ${isLight ? 'text-slate-950' : 'text-white'}`}>
            {isPt ? 'Olá, eu sou Clara.' : 'Hello, I’m Clara.'}
          </h2>
          <div className={`mt-4 max-w-3xl space-y-3 text-sm font-semibold leading-relaxed sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            <p>
              {isPt
                ? 'Vou ajudar você a compreender como o My Academy se organiza e a encontrar caminhos possíveis para sua jornada musical.'
                : 'I’ll help you understand how My Academy is organized and find possible paths for your musical journey.'}
            </p>
            <p>
              {isPt
                ? 'O mapa oferece direção, mas não determina por onde você deve seguir. Você pode começar pela sugestão, explorar outros assuntos ou voltar ao que quiser, quando quiser.'
                : 'The map offers direction, but it does not decide where you must go. You can begin with the suggestion, explore other subjects or return to anything you choose, whenever you choose.'}
            </p>
          </div>
        </div>
    </div>
  );

  if (mode === 'collapsible') {
    return (
      <section id="my-academy-clara-welcome" tabIndex={-1} className="scroll-mt-20 px-5 py-8 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-700" aria-label={isPt ? 'Apresentação de Clara' : 'Introduction from Clara'}>
        <details className={`group mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] border ${isLight ? 'border-cyan-200 bg-white shadow-[0_16px_45px_rgba(15,76,129,0.07)]' : 'border-cyan-800/60 bg-slate-950/75'}`}>
          <summary className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-cyan-500 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
            <span>{isPt ? 'Rever a apresentação do mapa com Clara' : 'Review the map introduction with Clara'}</span>
            <span aria-hidden="true" className={`text-xl transition-transform group-open:rotate-45 motion-reduce:transition-none ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>+</span>
          </summary>
          <div className={`border-t ${isLight ? 'border-cyan-100' : 'border-cyan-900/70'}`}>{welcomeContent}</div>
        </details>
      </section>
    );
  }

  return (
    <section id="my-academy-clara-welcome" tabIndex={-1} className="scroll-mt-20 px-5 py-10 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-700 sm:py-14" aria-labelledby="my-academy-welcome-title">
      <div className={`mx-auto max-w-7xl overflow-hidden rounded-[2rem] border ${isLight ? 'border-cyan-200 bg-white shadow-[0_20px_65px_rgba(15,76,129,0.09)]' : 'border-cyan-800/60 bg-slate-950/75'}`}>
        {welcomeContent}
      </div>
    </section>
  );
};

export default MyAcademyWelcome;
