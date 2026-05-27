import React, { useState } from 'react';

interface TeensGarageSectionProps {
  isLight: boolean;
  lang: 'pt' | 'en';
}

export const TeensGarageSection: React.FC<TeensGarageSectionProps> = ({ isLight, lang }) => {
  const [expanded, setExpanded] = useState(false);

  const copy = lang === 'pt'
    ? {
        title: 'Garage',
        subtitle: 'Monte, personalize e entenda guitarras iconicas sem precisar comecar com equipamento caro.',
        activeTitle: 'EVH Frankenstrat Tribute',
        activeDescription: 'Uma guitarra caotica, listrada e lendaria que mostra como criatividade, timbre e atitude podem transformar um formato Strat em algo unico.',
        level: 'Intermediario',
        focus: 'Visual, timbre e cultura rock',
        blocksTitle: 'Pecas e conceitos',
        blocks: [
          'Humbucker na ponte',
          'Ponte tremolo/Floyd Rose',
          'Corpo estilo Strat',
          'Pintura listrada vermelha, preta e branca',
          'DIY tribute',
        ],
        gaIdea: 'Ideia GA: entenda como cada escolha muda som, pegada e identidade.',
        warning: 'Projeto educativo e inspirado; nao e replica oficial.',
        cta: expanded ? 'Fechar projeto' : 'Explorar projeto',
        soon: 'Em breve',
      }
    : {
        title: 'Garage',
        subtitle: 'Build, customize and decode iconic guitars without starting with expensive gear.',
        activeTitle: 'EVH Frankenstrat Tribute',
        activeDescription: 'A chaotic, striped, legendary guitar showing how creativity, tone and attitude can turn a Strat-style platform into something unique.',
        level: 'Intermediate',
        focus: 'Visual identity, tone and rock culture',
        blocksTitle: 'Parts and concepts',
        blocks: [
          'Bridge humbucker',
          'Tremolo/Floyd Rose bridge concept',
          'Strat-style body',
          'Red, black and white stripe paint concept',
          'DIY tribute mindset',
        ],
        gaIdea: 'GA idea: understand how each choice changes tone, feel and identity.',
        warning: 'Educational inspired project; not an official replica.',
        cta: expanded ? 'Close project' : 'Explore project',
        soon: 'Coming soon',
      };

  return (
    <section className={`mb-12 rounded-[28px] border p-4 md:p-6 ${isLight ? 'border-violet-200 bg-white/85' : 'border-violet-800/40 bg-zinc-950/45'}`}>
      <div className="mb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-400">Experimental</p>
        <h2 className="mt-2 text-2xl md:text-3xl font-black uppercase tracking-tight">{copy.title}</h2>
        <p className={`mt-2 text-sm md:text-base font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>{copy.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className={`md:col-span-2 rounded-3xl border p-4 md:p-5 ${isLight ? 'border-violet-200 bg-violet-50/60' : 'border-violet-600/40 bg-violet-950/20'}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Inspired by rock history</p>
              <h3 className="mt-1 text-lg md:text-xl font-black">{copy.activeTitle}</h3>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${isLight ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-amber-500/50 bg-amber-500/10 text-amber-300'}`}>
              {copy.level}
            </span>
          </div>

          <p className={`mt-3 text-sm font-bold leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{copy.activeDescription}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${isLight ? 'border-cyan-300 bg-cyan-50 text-cyan-700' : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'}`}>
              {copy.focus}
            </span>
          </div>

          {expanded && (
            <div className="mt-4 rounded-2xl border border-violet-400/35 bg-black/10 p-3 md:p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">{copy.blocksTitle}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {copy.blocks.map((item) => (
                  <span
                    key={item}
                    className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${isLight ? 'border-zinc-300 bg-white text-zinc-700' : 'border-zinc-600 bg-zinc-900 text-zinc-200'}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className={`mt-3 text-sm font-bold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{copy.gaIdea}</p>
              <p className="mt-2 text-[11px] font-black uppercase tracking-[0.14em] text-amber-300">{copy.warning}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition-all hover:from-violet-500 hover:to-fuchsia-500 active:scale-95"
          >
            {copy.cta}
          </button>
        </article>

        {['Strat Neo Tribute', 'Offset Street Lab', 'Superstrat Future Build'].map((title) => (
          <article
            key={title}
            className={`rounded-3xl border p-4 ${isLight ? 'border-zinc-300 bg-white/70' : 'border-zinc-700 bg-zinc-900/50'}`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{copy.soon}</p>
            <h4 className="mt-2 text-sm font-black uppercase tracking-[0.12em]">{title}</h4>
            <p className={`mt-2 text-xs font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Tribute inspired by iconic guitar culture, visual experimentation and tone identity.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

