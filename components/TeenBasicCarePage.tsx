import React, { useMemo, useState } from 'react';
import { getTeensTheme } from '../utils/ecosystemPreferences';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

type CareSection = {
  id: string;
  title: string;
  items: string[];
  accent: string;
};

const SECTIONS: CareSection[] = [
  {
    id: 'after-playing',
    title: 'Depois de tocar',
    accent: '#22d3ee',
    items: [
      'Passar pano seco nas cordas.',
      'Remover suor e oleosidade das partes tocadas.',
      'Guardar o instrumento corretamente após o estudo.',
    ],
  },
  {
    id: 'storage',
    title: 'Onde guardar',
    accent: '#a855f7',
    items: [
      'Evitar sol direto por longos períodos.',
      'Evitar umidade e ambientes abafados.',
      'Evitar porta-malas ou locais muito quentes.',
    ],
  },
  {
    id: 'strings',
    title: 'Troca de cordas',
    accent: '#f59e0b',
    items: [
      'Observar quando o som perde brilho ou resposta.',
      'Reconhecer sinais de desgaste, ferrugem ou aspereza.',
      'Aprender a troca com segurança antes de fazer sozinho.',
    ],
  },
  {
    id: 'luthier',
    title: 'Quando procurar um luthier',
    accent: '#f472b6',
    items: [
      'Cordas muito altas ou desconfortáveis.',
      'Trastejamento frequente.',
      'Desafinação persistente.',
      'Dúvidas sobre tensor, ponte ou parte elétrica.',
    ],
  },
];

const TeenBasicCarePage: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() => getTeensTheme());
  const isLight = theme === 'light';

  const gridStyle = useMemo(
    () => ({
      backgroundImage: `linear-gradient(${isLight ? 'rgba(148,163,184,0.34)' : 'rgba(129,140,248,0.22)'} 1px, transparent 1px)`,
      backgroundSize: '100% 28px',
    }),
    [isLight]
  );

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 transition-colors duration-300 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#050312] text-violet-50'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.15),transparent_40%),radial-gradient(circle_at_82%_0%,rgba(168,85,247,0.14),transparent_44%)]" />

      <main className="relative mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-400">GA Teens</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Cuidados Básicos</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Pequenos cuidados que fazem seu instrumento durar muito mais.
          </p>
        </header>

        <section className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-indigo-900/70 bg-zinc-950/75'}`}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className={`rounded-3xl border p-5 md:p-6 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-indigo-800/70 bg-zinc-900/60'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">Visão geral</p>
              <h2 className="mt-3 text-2xl font-black uppercase tracking-tight">Cuidar bem evita problemas antes que eles cresçam</h2>
              <p className={`mt-3 max-w-2xl text-sm md:text-base font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                Esta área é para manutenção básica e preventiva de guitarra, baixo e violão. O foco aqui é criar bons hábitos
                de conservação, sem entrar em regulagens avançadas ou procedimentos que exigem ferramentas e experiência.
              </p>
              <div className={`mt-5 rounded-2xl border px-4 py-4 ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-900' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Regra desta área</p>
                <p className="mt-2 text-sm font-bold">
                  Quando surgir dúvida sobre ajuste de tensor, ponte, elétrica ou estrutura, o caminho mais seguro é procurar
                  orientação de um luthier.
                </p>
              </div>
            </div>

            <div className={`rounded-3xl border p-5 md:p-6 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-indigo-800/70 bg-zinc-900/60'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">Leitura rápida</p>
              <div className="mt-4">
                <svg viewBox="0 0 260 180" className="w-full" fill="none" aria-hidden="true">
                  <path d="M20 46H236" stroke="#334155" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
                  <path d="M20 62H236" stroke="#334155" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
                  <path d="M20 78H236" stroke="#334155" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
                  <path d="M20 94H236" stroke="#334155" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
                  <path d="M20 110H236" stroke="#334155" strokeOpacity="0.26" strokeWidth="2" strokeLinecap="round" />
                  <path d="M20 126H236" stroke="#334155" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />

                  <path d="M48 134C82 112 102 78 124 58C148 36 178 34 214 54" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
                  <path d="M58 148C94 128 126 96 154 76C178 58 198 54 224 64" stroke="#a855f7" strokeWidth="2.8" strokeLinecap="round" opacity="0.95" />
                  <path d="M110 36L126 26L142 36L126 46Z" stroke="#f59e0b" strokeWidth="2.4" strokeLinejoin="round" />
                  <circle cx="96" cy="52" r="3.5" fill="#22d3ee" />
                  <circle cx="154" cy="58" r="3.5" fill="#f472b6" />
                  <circle cx="176" cy="42" r="2.5" fill="#f59e0b" />
                  <path d="M74 144L88 128" stroke="#c084fc" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M168 26L182 12" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
              <p className={`mt-4 text-sm font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                Limpeza simples, armazenamento correto e atenção aos sinais do instrumento já resolvem uma grande parte dos
                problemas do dia a dia.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {SECTIONS.map((section) => (
              <article
                key={section.id}
                className={`rounded-3xl border p-5 md:p-6 ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950/80'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: section.accent }} />
                  <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: section.accent }}>
                    Tópico essencial
                  </p>
                </div>
                <h3 className="mt-3 text-xl font-black uppercase tracking-tight">{section.title}</h3>
                <ul className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-zinc-600'}`} />
                      <span className={`text-sm font-bold leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => navigateTo('/teens')}
            className="rounded-xl border border-violet-500 bg-violet-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-violet-500"
          >
            Voltar ao Teens
          </button>
          <button
            onClick={() => navigateTo('/studio')}
            className="rounded-xl border border-cyan-500 bg-cyan-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-cyan-500"
          >
            Ir para Studio
          </button>
        </div>
      </main>
    </div>
  );
};

export default TeenBasicCarePage;
