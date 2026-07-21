import React, { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { getSupabaseDisplayName } from '../../src/lib/userIdentity';
import MyAcademyCompanionChooser from './MyAcademyCompanionChooser';

interface MyAcademyCompanionIntroProps {
  lang: 'pt' | 'en';
}

const MyAcademyCompanionIntro: React.FC<MyAcademyCompanionIntroProps> = ({ lang }) => {
  const isPt = lang === 'pt';
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data.user) return;
      const name = getSupabaseDisplayName(data.user);
      if (name) setDisplayName(name);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const greeting = displayName
    ? (isPt ? `Olá, ${displayName}!` : `Hello, ${displayName}!`)
    : (isPt ? 'Olá!' : 'Hello!');

  return (
    <details className="group mt-6 rounded-3xl border border-cyan-900/70 bg-[#07111f]">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-5 py-4 text-left">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">{isPt ? 'Escolha seu Arquiteto para esta etapa' : 'Choose your Architect for this step'}</p>
          <p className="mt-1 text-sm font-black text-white">{isPt ? 'Alice ou Arthur podem acompanhar seus próximos passos' : 'Alice or Arthur can accompany your next steps'}</p>
        </div>
        <span aria-hidden="true" className="text-xl font-black text-cyan-300 transition group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-cyan-900/60 p-4 sm:p-5">
        <p className="text-sm font-semibold leading-relaxed text-slate-300">
          {greeting} {isPt
            ? 'Você chegou a um momento da jornada em que pode escolher um Arquiteto para acompanhar seus próximos passos.'
            : 'You have reached a point in the journey where you can choose an Architect to accompany your next steps.'}
        </p>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">
          {isPt
            ? 'O currículo será o mesmo. O que muda é a perspectiva presente em algumas explicações, experiências opcionais e sínteses desta etapa.'
            : 'The curriculum stays the same. What changes is the perspective present in some explanations, optional experiments and summaries of this step.'}
        </p>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">
          {isPt
            ? 'Alice ajudará você a perceber como os conteúdos ganham som, expressão e intenção musical.'
            : 'Alice will help you notice how content gains sound, expression and musical intent.'}
        </p>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">
          {isPt
            ? 'Arthur ajudará você a compreender como os elementos se organizam, se relacionam e formam a estrutura da música.'
            : 'Arthur will help you understand how elements are organized, relate to each other and form the structure of music.'}
        </p>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">
          {isPt
            ? 'Escolha quem deseja ter mais próximo agora. Depois de concluir esta etapa, se quiser, você poderá voltar e escolher o outro Arquiteto para experimentar uma forma diferente de trabalhar o mesmo assunto.'
            : 'Choose who you would like to have closer right now. After completing this step, if you want, you can come back and choose the other Architect to try a different way of working on the same subject.'}
        </p>
        <div className="mt-4"><MyAcademyCompanionChooser lang={lang} /></div>
      </div>
    </details>
  );
};

export default MyAcademyCompanionIntro;
