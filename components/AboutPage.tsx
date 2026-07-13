import React, { useEffect, useState } from 'react';
import { loadConfig } from '../utils/persistence';
import { getGlobalLang, getGlobalTheme, setGlobalPreferences } from '../utils/ecosystemPreferences';
import AppFooter from './AppFooter';

type ThemeMode = 'light' | 'dark';
type AppLang = 'pt' | 'en';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const AboutPage: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => getGlobalTheme());
  const [lang, setLang] = useState<AppLang>(() => getGlobalLang());
  const isLight = theme === 'light';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleToggleTheme = () => {
    const current = loadConfig();
    const nextTheme: ThemeMode = isLight ? 'dark' : 'light';
    const next = { ...(current || {}), theme: nextTheme, lang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(nextTheme, lang);
    setTheme(nextTheme);
  };

  const handleToggleLang = () => {
    const current = loadConfig();
    const nextLang: AppLang = lang === 'pt' ? 'en' : 'pt';
    const next = { ...(current || {}), theme, lang: nextLang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(theme, nextLang);
    setLang(nextLang);
  };

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  };

  const actionClass = isLight
    ? 'border-zinc-300 bg-white text-zinc-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:border-blue-400'
    : 'border-zinc-700 bg-zinc-900 text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:border-blue-500';

  const cardClass = isLight
    ? 'border-zinc-200 bg-white/95 shadow-2xl'
    : 'border-[rgba(30,64,175,0.45)] bg-[rgba(7,17,31,0.96)] shadow-[0_24px_80px_rgba(0,0,0,0.55)]';

  const panelClass = isLight
    ? 'border-zinc-200 bg-white'
    : 'border-[rgba(30,64,175,0.4)] bg-[rgba(10,20,36,0.92)] shadow-[0_12px_40px_rgba(0,0,0,0.45)]';

  const t = (lang === 'pt'
    ? {
        eyebrow: 'Guitar Architect',
        title: 'O que é o Guitar Architect?',
        subtitle: 'Ecossistema musical brasileiro para descoberta, prática e construção harmônica.',
        institutionalVideoLabel: 'Vídeo institucional sobre o Guitar Architect.',
        back: '← Voltar ao App',
        s1Title: 'Uma jornada de construção musical',
        s1: [
          'O Guitar Architect é um ecossistema musical brasileiro criado para acompanhar diferentes formas de descobrir, compreender, praticar, construir e viver a música.',
          'A proposta é simples: transformar conceitos musicais em experiências visuais, práticas e interativas, ajudando o usuário a sair do primeiro contato com os sons até a construção harmônica com mais consciência.',
        ],
        s2Title: 'Kids, Teens e Studio',
        s2Intro: 'O ecossistema é dividido em três grandes ambientes:',
        ecosystem: [
          { id: 'kids', logo: '/gakidslogo.webp', title: 'Kids', description: 'descoberta musical para crianças, iniciantes e primeiros contatos com sons, instrumentos e conceitos básicos.', accent: isLight ? 'text-emerald-600' : 'text-emerald-400' },
          { id: 'teens', logo: '/gateenslogo.webp', title: 'Teens', description: 'desafios, prática guiada, exercícios progressivos, riffs, escalas, intervalos e independência dos dedos.', accent: isLight ? 'text-violet-600' : 'text-violet-400' },
          { id: 'studio', logo: '/logogastudio.webp', title: 'Studio', description: 'ferramentas avançadas para visualizar harmonia, acordes, tríades, tétrades, mapas do braço do instrumento e estruturas musicais.', accent: isLight ? 'text-blue-600' : 'text-blue-400' },
        ],
        architectsTitle: 'Arquitetos Musicais: diferentes formas de viver a música',
        architects: [
          'O Guitar Architect passou a ser habitado por Arquitetos Musicais: personagens inteiramente fictícios, criados com inteligência artificial, que representam diferentes experiências, especialidades, personalidades e formas de viver, compreender e se relacionar com a música.',
          'Há quem acolherá os primeiros passos, quem organizará a teoria, quem explorará o peso de um riff, a liberdade do blues, a precisão dos intervalos, a função do baixo, a presença de palco ou as possibilidades da harmonia. Há também quem cuidará da jornada, da comunicação, da expressão, dos instrumentos e dos inúmeros caminhos que fazem parte de uma vida construída em torno da música.',
          'Cada Arquiteto possui identidade própria, história, referências e uma maneira particular de habitar esse universo. Alguns ajudarão a compreender, outros a praticar, criar, interpretar, cuidar, orientar, experimentar ou simplesmente enxergar a música por novos ângulos. Outros ainda estarão presentes ao longo da jornada para motivar, encorajar e manter aceso o interesse pelo aprendizado e pela descoberta musical.',
          'Juntos, eles darão rosto e voz às múltiplas perspectivas que compõem o ecossistema do Guitar Architect e contribuirão para tornar mais humana a relação entre descoberta, prática, instrumentos, sons, conhecimento e expressão.',
          'Seus nomes, histórias, trajetórias, características pessoais, referências, hábitos e demais elementos biográficos integram exclusivamente esse universo ficcional. Qualquer eventual semelhança com pessoas, fatos ou situações do mundo real é involuntária e puramente coincidente.',
          'Sua presença no projeto ainda demandará ajustes, aprofundamentos, desenvolvimento técnico e, em determinadas frentes, suporte de tecnologias e serviços externos. À medida que a plataforma evoluir, os Arquitetos poderão assumir novos papéis dentro do ecossistema, sem perder aquilo que os define desde o início: diferentes formas de viver, sentir, construir e compartilhar a música.',
        ],
        architectsLink: 'Conheça nossos Arquitetos →',
        s3Title: 'Guitarra, baixo e mapas visuais',
        s3: [
          'Embora a guitarra esteja no centro da identidade do projeto, o Guitar Architect também oferece configurações para baixo/contrabaixo de 4 e 5 cordas.',
          'A plataforma usa mapas visuais para ajudar estudantes, guitarristas, baixistas e professores a compreenderem como notas, intervalos, escalas e acordes se organizam no braço do instrumento.',
        ],
        s4Title: 'Da descoberta à construção harmônica',
        s4: [
          'No Guitar Architect, aprender música não é apenas memorizar desenhos ou repetir exercícios.',
          'A ideia é construir entendimento: reconhecer sons, visualizar relações, praticar com propósito e compreender como cada nota, intervalo e acorde participa da arquitetura musical.',
        ],
        accountTitle: 'Preciso criar conta para usar?',
        account: [
          'Não para começar. Boa parte do Guitar Architect pode ser explorada sem login, especialmente os ambientes Kids e Teens. O login é feito pelo Studio e permite sincronizar determinados projetos, instrumentos, itens da coleção, conquistas e preferências. Algumas áreas, como a progressão XP do Teens e determinados projetos do Kids, continuam locais.',
        ],
        s5Title: 'O que o Guitar Architect não é',
        s5: [
          'O Guitar Architect não é um plugin de efeitos, simulador de amplificador, DAW, banco de cifras ou simples coleção de exercícios.',
          'É um ambiente educacional interativo voltado ao aprendizado musical, à prática guiada e à visualização da construção harmônica.',
        ],
        s6Title: 'Marca brasileira e identidade própria',
        s6: [
          'O Guitar Architect é um projeto brasileiro desenvolvido pela DPDDA-tech, com identidade visual própria e marca mista depositada no INPI.',
          'A marca combina a ideia de guitarra com arquitetura musical: planejar, visualizar, praticar e construir uma jornada musical etapa por etapa.',
        ],
        s6Link: 'Conheça nossa marca →',
      }
    : {
        eyebrow: 'Guitar Architect',
        title: 'What is Guitar Architect?',
        subtitle: 'A Brazilian music ecosystem for discovery, practice and harmonic construction.',
        institutionalVideoLabel: 'Institutional video about Guitar Architect.',
        back: '← Back to App',
        s1Title: 'A musical construction journey',
        s1: [
          'Guitar Architect is a Brazilian music ecosystem designed to support different ways of discovering, understanding, practicing, building and living music.',
          'Its purpose is simple: to turn musical concepts into visual, practical and interactive experiences, helping users move from their first contact with sounds to harmonic construction with greater awareness.',
        ],
        s2Title: 'Kids, Teens and Studio',
        s2Intro: 'The ecosystem is divided into three main environments:',
        ecosystem: [
          { id: 'kids', logo: '/gakidslogo.webp', title: 'Kids', description: 'musical discovery for children, beginners and first contact with sounds, instruments and basic concepts.', accent: isLight ? 'text-emerald-600' : 'text-emerald-400' },
          { id: 'teens', logo: '/gateenslogo.webp', title: 'Teens', description: 'challenges, guided practice, progressive exercises, riffs, scales, intervals and finger independence.', accent: isLight ? 'text-violet-600' : 'text-violet-400' },
          { id: 'studio', logo: '/logogastudio.webp', title: 'Studio', description: 'advanced tools to visualize harmony, chords, triads, seventh chords, instrument fretboard maps and musical structures.', accent: isLight ? 'text-blue-600' : 'text-blue-400' },
        ],
        architectsTitle: 'Music Architects: different ways of living music',
        architects: [
          'Guitar Architect is now inhabited by Music Architects: entirely fictional characters created with artificial intelligence to represent different experiences, specialties, personalities and ways of living, understanding and relating to music.',
          'Some will welcome the very first steps; others will bring structure to theory or explore the weight of a riff, the freedom of the blues, the precision of intervals, the role of bass, stage presence or the possibilities of harmony. Others will look after the journey itself, communication, expression, instruments and the many paths that shape a life built around music.',
          'Each Architect has a distinct identity, story, set of references and way of inhabiting this universe. Some will help people understand; others will encourage practice, creation, interpretation, care, guidance, experimentation or simply offer new ways of seeing music. Others will accompany the journey by motivating, encouraging and keeping curiosity and musical discovery alive.',
          'Together, they will give a face and a voice to the many perspectives within the Guitar Architect ecosystem, helping make the relationship between discovery, practice, instruments, sound, knowledge and expression feel more human.',
          'Their names, stories, backgrounds, personal traits, references, habits and all other biographical details belong exclusively to this fictional universe. Any resemblance to real people, events or situations is unintended and purely coincidental.',
          'Their role in the project will still require refinement, deeper development, technical work and, in some areas, support from external technologies and services. As the platform evolves, the Architects may take on new roles across the ecosystem without losing what has defined them from the beginning: different ways of living, feeling, building and sharing music.',
        ],
        architectsLink: 'Meet our Architects →',
        s3Title: 'Guitar, bass and visual maps',
        s3: [
          'Although guitar is at the center of the project’s identity, Guitar Architect also supports 4-string and 5-string bass configurations.',
          'The platform uses visual maps to help students, guitarists, bassists and teachers understand how notes, intervals, scales and chords are organized across the instrument fretboard.',
        ],
        s4Title: 'From discovery to harmonic construction',
        s4: [
          'In Guitar Architect, learning music is not just about memorizing shapes or repeating exercises.',
          'The idea is to build understanding: recognize sounds, visualize relationships, practice with purpose and understand how each note, interval and chord takes part in musical architecture.',
        ],
        accountTitle: 'Do I need an account to use it?',
        account: [
          'Not to get started. Much of Guitar Architect can be explored without signing in, especially Kids and Teens. Sign-in is available through Studio and can sync selected projects, instruments, collection items, achievements and preferences. Some areas, including Teens XP progression and certain Kids projects, remain local.',
        ],
        s5Title: 'What Guitar Architect is not',
        s5: [
          'Guitar Architect is not an effects plugin, amp simulator, DAW, chord chart database or simple exercise collection.',
          'It is an interactive educational environment focused on music learning, guided practice and visualization of harmonic construction.',
        ],
        s6Title: 'Brazilian brand and original identity',
        s6: [
          'Guitar Architect is a Brazilian project developed by DPDDA-tech, with its own visual identity and mixed trademark application filed with the Brazilian INPI.',
          'The brand combines the idea of guitar with musical architecture: planning, visualizing, practicing and building a musical journey step by step.',
        ],
        s6Link: 'Meet our brand →',
      });

  const ecosystemPaths: Record<string, string> = { kids: '/kids', teens: '/teens', studio: '/studio' };

  return (
    <>
      <div className={`relative min-h-screen p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
        <div className="absolute inset-0 pointer-events-none opacity-50" style={gridStyle} />

        <div className="relative mx-auto max-w-[1000px] py-6">
          <div className="mb-8 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => navigateTo('/ecosystem')}
              className="inline-flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest hover:underline"
            >
              {t.back}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleTheme}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-black transition-all ${actionClass}`}
                aria-label={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
              >
                {isLight ? <MoonIcon /> : <SunIcon />}
              </button>
              <button
                type="button"
                onClick={handleToggleLang}
                className={`min-h-[36px] rounded-xl border px-3 py-2 text-[11px] font-black uppercase transition-all ${actionClass}`}
              >
                {lang.toUpperCase()}
              </button>
            </div>
          </div>

          <div className="text-center mb-10">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">
              {t.eyebrow}
            </p>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
              {t.title}
            </h1>
            <p className="mt-3 text-zinc-500 font-bold uppercase text-[12px] md:text-sm tracking-[0.2em]">
              {t.subtitle}
            </p>
          </div>

          <div className={`mb-10 overflow-hidden rounded-3xl border ${isLight ? 'border-zinc-200 bg-white shadow-xl' : 'border-blue-950/70 bg-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.45)]'}`}>
            <video
              width="1600"
              height="900"
              controls
              playsInline
              preload="metadata"
              poster="/institutional/diana/diana-about.webp"
              aria-label={t.institutionalVideoLabel}
              className="aspect-video h-auto w-full object-cover"
            >
              <source src="/institutional/diana/diana-about.mp4" type="video/mp4" />
              {t.institutionalVideoLabel}
            </video>
          </div>

          <div className={`rounded-[40px] border p-8 md:p-12 ${cardClass}`}>
            <div className="space-y-8 text-sm md:text-base">
              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{t.s1Title}</h2>
                <div className="space-y-3">
                  {t.s1.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-2">{t.s2Title}</h2>
                <p className={`mb-5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{t.s2Intro}</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {t.ecosystem.map(area => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => navigateTo(ecosystemPaths[area.id])}
                      className={`flex flex-col items-center rounded-2xl border p-5 text-center transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${panelClass}`}
                    >
                      <div className="mb-4 flex h-16 w-24 items-center justify-center">
                        <img src={area.logo} alt={area.title} className="h-full w-full object-contain" />
                      </div>
                      <h3 className={`text-sm font-black uppercase tracking-widest ${area.accent}`}>{area.title}</h3>
                      <p className={`mt-2 text-xs font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>{area.description}</p>
                    </button>
                  ))}
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{t.architectsTitle}</h2>
                <div className="space-y-3">
                  {t.architects.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('/instructors')}
                  className={`mt-5 text-[11px] font-black uppercase tracking-widest underline-offset-2 transition hover:underline ${isLight ? 'text-blue-600' : 'text-blue-400'}`}
                >
                  {t.architectsLink}
                </button>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{t.s3Title}</h2>
                <div className="space-y-3">
                  {t.s3.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{t.s4Title}</h2>
                <div className="space-y-3">
                  {t.s4.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{t.accountTitle}</h2>
                <div className="space-y-3">
                  {t.account.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{t.s5Title}</h2>
                <div className="space-y-3">
                  {t.s5.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{t.s6Title}</h2>
                <div className="space-y-3">
                  {t.s6.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('/brand')}
                  className={`mt-5 text-[11px] font-black uppercase tracking-widest underline-offset-2 transition hover:underline ${isLight ? 'text-blue-600' : 'text-blue-400'}`}
                >
                  {t.s6Link}
                </button>
              </section>
            </div>
          </div>
        </div>
      </div>

      <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />
    </>
  );
};

export default AboutPage;
