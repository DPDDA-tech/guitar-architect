import React, { useState } from 'react';
import { loadConfig } from '../utils/persistence';
import { getGlobalLang, getGlobalTheme, setGlobalPreferences } from '../utils/ecosystemPreferences';
import AppFooter from './AppFooter';
import ImageLightbox from './ImageLightbox';

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

const BrandPage: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => getGlobalTheme());
  const [lang, setLang] = useState<AppLang>(() => getGlobalLang());
  const isLight = theme === 'light';
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const openLightbox = (image: { src: string; alt: string }) => {
    setLightboxImage(image);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

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

  const accentPanelClass = isLight
    ? 'border-blue-200/60 bg-blue-50/60'
    : 'border-[rgba(30,64,175,0.4)] bg-[rgba(10,20,36,0.92)] shadow-[0_12px_40px_rgba(0,0,0,0.45)]';

  const accentTextClass = isLight ? 'text-blue-700' : 'text-blue-300';
  const accentValueClass = isLight ? 'text-blue-600' : 'text-blue-400';

  const t = (lang === 'pt'
    ? {
        eyebrow: 'Guitar Architect',
        title: 'Nossa Marca',
        subtitle: 'A identidade por trás do ecossistema Guitar Architect.',
        back: '← Voltar ao App',
        logoAlt: 'Identidade visual Guitar Architect',
        s1Title: 'O significado da marca',
        s1: [
          'A marca Guitar Architect foi concebida para representar a construção progressiva do conhecimento musical.',
          'A guitarra simboliza a prática; a palheta, o primeiro gesto de quem decide tocar; e a estrutura geométrica que sustenta o símbolo representa a arquitetura por trás de cada aprendizado — peça por peça, conceito por conceito, até formar um entendimento sólido.',
          'Mais do que um símbolo decorativo, a identidade visual do projeto carrega a ideia de evolução estruturada: do primeiro contato com o instrumento até o domínio consciente da teoria e da técnica.',
        ],
        s2Title: 'Por que Architect?',
        s2: [
          'O nome Architect não foi escolhido por acaso. Desde o início, o objetivo do projeto nunca foi apenas apresentar diagramas de braço, escalas ou acordes prontos.',
          'A proposta é ajudar cada músico a construir o próprio entendimento musical — peça por peça, camada por camada — da mesma forma que um arquiteto projeta e ergue uma construção sólida.',
          'Aprender música é, antes de tudo, um processo de construção: você parte de fundações simples, organiza conceitos, testa estruturas e, com o tempo, desenvolve uma arquitetura musical própria.',
        ],
        s2Quote: '“Defina sua etapa na construção musical.”',
        s3Title: 'A identidade visual',
        s3Intro: 'Cada elemento da logo carrega um significado direto, sem metáforas excessivas:',
        identityCards: [
          { title: 'A guitarra', body: 'Representa o instrumento, a prática e a execução: o ponto onde a teoria se transforma em som.' },
          { title: 'A palheta', body: 'Representa a identidade do guitarrista e o ponto de partida de toda jornada musical.' },
          { title: 'A estrutura geométrica', body: 'Representa construção, evolução e conhecimento estruturado — a base da metodologia do projeto.' },
          { title: 'O azul', body: 'Representa tecnologia, clareza e exploração: a linguagem visual que conecta todo o ecossistema.' },
        ],
        s3Manifesto: [
          'O efeito azul que atravessa a logo não representa ruptura, e sim construção. Assim como uma obra arquitetônica nasce primeiro como conceito, depois como projeto e, só então, como estrutura concluída, o conhecimento musical segue o mesmo caminho: começa disperso, em elementos simples — uma nota, um acorde, uma escala, uma descoberta — e, com o tempo, esses elementos passam a se conectar, formando algo mais sólido e significativo.',
          'Os fragmentos geométricos emergem da base do instrumento e se organizam progressivamente, como conceitos que encontram seu lugar dentro de uma estrutura maior. Eles representam a arquitetura musical sendo construída: conhecimento que deixa de ser disperso e se torna compreensão.',
          'É essa mesma ideia que sustenta o nome Guitar Architect e o convite por trás de cada etapa do ecossistema: defina sua etapa na construção musical.',
        ],
        s4Title: 'Um ecossistema em evolução',
        s4Intro: 'O Guitar Architect é dividido em três ambientes, cada um pensado para uma etapa da jornada musical.',
        s5Title: 'Nossa filosofia',
        s5: [
          'Acreditamos que aprender é construir. Compreender é mais importante do que decorar, e teoria e prática devem caminhar sempre juntas.',
          'O conhecimento musical não precisa ser absorvido de uma só vez — ele pode ser explorado de forma progressiva, no ritmo de cada pessoa, respeitando a etapa em que cada músico se encontra.',
        ],
        s5Quote: 'Defina sua etapa na construção musical: descoberta, prática guiada ou ferramentas avançadas.',
        s6Title: 'Marca e identidade',
        s6: 'Guitar Architect™ é a identidade utilizada pelo projeto. A marca possui pedido de registro perante o INPI, e essa proteção é complementar à proteção do código-fonte do aplicativo. Para detalhes formais sobre uso, licenciamento e termos legais, consulte os ',
        s6TermsLink: 'Termos de Uso',
        s6And: ' e a ',
        s6LicenseLink: 'Licença de Uso',
        s6End: ' do projeto.',
        s7Title: 'Descrição Técnica da Marca',
        s7Intro: 'A seguir apresenta-se uma descrição técnica da composição visual da marca Guitar Architect, contemplando seus elementos figurativos, nominativos e características gráficas predominantes.',
        s7Body: [
          'Descrição Técnica da Marca — Guitar Architect',
          'A marca mista é composta por elementos figurativo e nominativo dispostos verticalmente.',
          'O elemento figurativo consiste no contorno estilizado de uma palheta de guitarra, representado por linha curva em azul médio, dentro da qual se encontra a imagem de um braço de guitarra elétrica com headstock em madeira de tonalidade dourado-natural e seis tarraxas cromadas posicionadas na parte superior.',
          'A porção inferior do braço integra-se a uma composição de fragmentos geométricos triangulares e poligonais em tons de azul médio e azul-marinho, distribuídos lateralmente de forma equilibrada, formando um efeito visual de transição entre o instrumento e a estrutura geométrica.',
          'O contorno inferior da palheta funde-se à base dessa estrutura geométrica fragmentada, estabelecendo continuidade visual entre os elementos que compõem o conjunto.',
          'O elemento nominativo, posicionado abaixo do figurativo e centralizado, é formado pela expressão GUITAR ARCHITECT, grafada em duas partes tipograficamente distintas: GUITAR, em azul médio, e ARCHITECT, em azul-marinho escuro, ambas apresentadas em fonte sem serifa, de traço limpo e peso regular.',
          'O conjunto apresenta fundo branco, sem sombreamentos, efeitos de brilho ou texturas adicionais.',
        ],
        lightboxExpand: 'Ampliar',
        lightboxClose: 'Fechar',
        ecosystem: {
          kids: { title: 'KIDS', tagline: 'Descoberta', description: 'Representa os primeiros contatos com a música, utilizando elementos visuais mais coloridos, leves e acolhedores.', linkLabel: 'Conhecer Kids →' },
          teens: { title: 'TEENS', tagline: 'Exploração', description: 'Representa a fase de conexão entre conceitos, prática guiada e expansão do repertório musical.', linkLabel: 'Conhecer Teens →' },
          studio: { title: 'STUDIO', tagline: 'Construção', description: 'Representa o aprofundamento técnico, a experimentação consciente e o desenvolvimento contínuo da arquitetura musical.', linkLabel: 'Conhecer Studio →' },
        },
      }
    : {
        eyebrow: 'Guitar Architect',
        title: 'Our Brand',
        subtitle: 'The identity behind the Guitar Architect ecosystem.',
        back: '← Back to App',
        logoAlt: 'Guitar Architect visual identity',
        s1Title: 'The meaning behind the brand',
        s1: [
          'The Guitar Architect brand was designed to represent the progressive construction of musical knowledge.',
          'The guitar symbolizes practice; the pick, the first gesture of anyone who decides to play; and the geometric structure behind the symbol represents the architecture behind every step of learning — piece by piece, concept by concept, until a solid understanding takes shape.',
          'More than a decorative symbol, the project’s visual identity carries the idea of structured evolution: from the first contact with the instrument to the conscious mastery of theory and technique.',
        ],
        s2Title: 'Why Architect?',
        s2: [
          'The name Architect was not chosen by accident. From the start, the project’s goal was never just to show fretboard diagrams, scales or ready-made chords.',
          'The idea is to help every musician build their own musical understanding — piece by piece, layer by layer — the same way an architect designs and raises a solid structure.',
          'Learning music is, above all, a process of construction: you start from simple foundations, organize concepts, test structures and, over time, develop a musical architecture of your own.',
        ],
        s2Quote: '“Define your stage in the musical construction.”',
        s3Title: 'The visual identity',
        s3Intro: 'Each element of the logo carries a direct meaning, without excessive metaphors:',
        identityCards: [
          { title: 'The guitar', body: 'Represents the instrument, practice and performance: the point where theory turns into sound.' },
          { title: 'The pick', body: 'Represents the guitarist’s identity and the starting point of every musical journey.' },
          { title: 'The geometric structure', body: 'Represents construction, evolution and structured knowledge — the foundation of the project’s methodology.' },
          { title: 'The blue', body: 'Represents technology, clarity and exploration: the visual language that connects the whole ecosystem.' },
        ],
        s3Manifesto: [
          'The blue effect that runs through the logo does not represent rupture — it represents construction. Just as an architectural work is first born as a concept, then as a project, and only later as a finished structure, musical knowledge follows the same path: it begins scattered, in simple elements — a note, a chord, a scale, a discovery — and, over time, these elements start connecting, forming something more solid and meaningful.',
          'The geometric fragments emerge from the base of the instrument and organize themselves progressively, like concepts finding their place within a larger structure. They represent the musical architecture being built: knowledge that stops being scattered and becomes understanding.',
          'That is the same idea behind the name Guitar Architect, and the invitation behind every stage of the ecosystem: define your stage in the musical construction.',
        ],
        s4Title: 'An evolving ecosystem',
        s4Intro: 'Guitar Architect is divided into three environments, each designed for a stage of the musical journey.',
        s5Title: 'Our philosophy',
        s5: [
          'We believe that learning is building. Understanding matters more than memorizing, and theory and practice should always go hand in hand.',
          'Musical knowledge doesn’t need to be absorbed all at once — it can be explored progressively, at each person’s own pace, respecting the stage each musician is in.',
        ],
        s5Quote: 'Define your stage in the musical construction: discovery, guided practice or advanced tools.',
        s6Title: 'Brand and identity',
        s6: 'Guitar Architect™ is the identity used by the project. The brand has a registration request filed with INPI (the Brazilian Patent and Trademark Office), and this protection is complementary to the protection of the application’s source code. For formal details on usage, licensing and legal terms, please refer to the ',
        s6TermsLink: 'Terms of Use',
        s6And: ' and the ',
        s6LicenseLink: 'License',
        s6End: ' of the project.',
        s7Title: 'Technical Description of the Brand',
        s7Intro: 'The following presents a technical description of the visual composition of the Guitar Architect brand, covering its figurative and nominative elements and predominant graphic characteristics.',
        s7Body: [
          'Technical Description of the Brand — Guitar Architect',
          'The combined mark is composed of a figurative element and a nominative element arranged vertically.',
          'The figurative element consists of the outline of a guitar pick, represented by a curved line in medium blue, within which appears the image of a Stratocaster-style electric guitar neck, with a headstock in natural golden-tone maple wood and six chrome tuning pegs positioned at the top.',
          'The lower portion of the neck dissolves into triangular and polygonal geometric fragments in tones of medium blue and navy blue, arranged in a symmetrical lateral dispersion effect.',
          'The lower outline of the pick integrates with the base of the fragmented geometric element.',
          'The nominative element, positioned below the figurative element and centered, is formed by the expression GUITARARCHITECT, written in two typographically distinct parts: GUITAR in medium blue and ARCHITECT in dark navy blue, both in a clean-stroke, regular-weight sans-serif typeface.',
          'The composition has a white background, with no shading, glow effects, or additional textures.',
        ],
        lightboxExpand: 'Expand',
        lightboxClose: 'Close',
        ecosystem: {
          kids: { title: 'KIDS', tagline: 'Discovery', description: 'Represents the first contact with music, using visual elements that are more colorful, light and welcoming.', linkLabel: 'Discover Kids →' },
          teens: { title: 'TEENS', tagline: 'Exploration', description: 'Represents the phase of connecting concepts, guided practice and the expansion of musical repertoire.', linkLabel: 'Discover Teens →' },
          studio: { title: 'STUDIO', tagline: 'Construction', description: 'Represents technical depth, conscious experimentation and the continuous development of musical architecture.', linkLabel: 'Discover Studio →' },
        },
      });

  const ecosystemAreas = [
    { id: 'kids', logo: '/gakidslogo.webp', path: '/kids', accent: isLight ? 'text-emerald-600' : 'text-emerald-400', ...t.ecosystem.kids },
    { id: 'teens', logo: '/gateenslogo.webp', path: '/teens', accent: isLight ? 'text-violet-600' : 'text-violet-400', ...t.ecosystem.teens },
    { id: 'studio', logo: '/logogastudio.webp', path: '/studio', accent: isLight ? 'text-blue-600' : 'text-blue-400', ...t.ecosystem.studio },
  ];

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

          <div className="mb-10 flex justify-center">
            <div className={`w-full max-w-md rounded-[40px] border p-6 md:p-10 ${cardClass}`}>
              <button
                type="button"
                onClick={() => openLightbox({ src: '/nossamarcagatm.webp', alt: t.logoAlt })}
                className="mx-auto block w-full cursor-pointer rounded-2xl transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label={`${t.lightboxExpand} — ${t.logoAlt}`}
              >
                <img
                  src="/nossamarcagatm.webp"
                  alt={t.logoAlt}
                  className="mx-auto h-auto w-full max-w-[280px] object-contain md:max-w-[320px]"
                />
              </button>
            </div>
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
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{t.s2Title}</h2>
                <div className="space-y-3">
                  {t.s2.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                </div>
                <p className={`mt-5 rounded-2xl border p-5 text-center text-base font-black uppercase tracking-tight ${accentPanelClass} ${accentTextClass}`}>
                  {t.s2Quote}
                </p>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-2">{t.s3Title}</h2>
                <p className={`mb-5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{t.s3Intro}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {t.identityCards.map(card => (
                    <div key={card.title} className={`rounded-2xl border p-5 ${panelClass}`}>
                      <h3 className={`text-sm font-black uppercase tracking-tight ${accentValueClass}`}>{card.title}</h3>
                      <p className={`mt-2 text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>{card.body}</p>
                    </div>
                  ))}
                </div>
                <div className={`mt-6 rounded-2xl border p-6 ${panelClass}`}>
                  <div className="space-y-3 text-sm font-semibold leading-relaxed">
                    {t.s3Manifesto.map(paragraph => (
                      <p key={paragraph} className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-2">{t.s4Title}</h2>
                <p className={`mb-5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{t.s4Intro}</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {ecosystemAreas.map(area => (
                    <div
                      key={area.id}
                      className={`flex flex-col items-center rounded-2xl border p-5 text-center ${panelClass}`}
                    >
                      <button
                        type="button"
                        onClick={() => openLightbox({ src: area.logo, alt: area.title })}
                        className="mb-3 flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                        aria-label={`${t.lightboxExpand} — ${area.title}`}
                      >
                        <img src={area.logo} alt={area.title} className="h-full w-full object-contain" />
                      </button>
                      <h3 className="text-sm font-black uppercase tracking-tight">{area.title}</h3>
                      <p className={`mt-1 text-[11px] font-black uppercase tracking-widest ${area.accent}`}>{area.tagline}</p>
                      <p className={`mt-2 text-xs font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>{area.description}</p>
                      <button
                        type="button"
                        onClick={() => navigateTo(area.path)}
                        className={`mt-4 text-[11px] font-black uppercase tracking-widest underline-offset-2 transition hover:underline ${area.accent}`}
                      >
                        {area.linkLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section className={`rounded-3xl border p-6 ${accentPanelClass}`}>
                <h2 className={`text-lg font-black uppercase tracking-tight mb-4 ${accentTextClass}`}>{t.s5Title}</h2>
                <div className="space-y-3 font-semibold">
                  {t.s5.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                </div>
                <p className={`mt-5 text-center text-sm font-black uppercase tracking-tight ${accentTextClass}`}>
                  {t.s5Quote}
                </p>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className="text-base font-black uppercase tracking-tight mb-3">{t.s6Title}</h2>
                <p className={`text-xs font-semibold leading-relaxed ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {t.s6}
                  <a href="/legal/terms.html" target="_blank" rel="noreferrer" className={`underline ${accentValueClass}`}>{t.s6TermsLink}</a>
                  {t.s6And}
                  <a href="/legal/license.html" target="_blank" rel="noreferrer" className={`underline ${accentValueClass}`}>{t.s6LicenseLink}</a>
                  {t.s6End}
                </p>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className={`text-xs font-black uppercase tracking-[0.18em] mb-3 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.s7Title}</h2>
                <p className={`mb-4 text-xs leading-relaxed ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.s7Intro}</p>
                <div className={`rounded-2xl border p-5 md:p-6 ${panelClass}`}>
                  <p className={`mb-3 text-[11px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.s7Body[0]}</p>
                  <div className="space-y-3">
                    {t.s7Body.slice(1).map(paragraph => (
                      <p key={paragraph} className={`text-xs leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        src={lightboxImage?.src ?? ''}
        alt={lightboxImage?.alt ?? ''}
        closeLabel={t.lightboxClose}
      />

      <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />
    </>
  );
};

export default BrandPage;
