import React, { useEffect, useMemo, useState } from 'react';
import { getTeensTheme } from '../utils/ecosystemPreferences';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

type ImageItem = {
  src: string;
  alt: string;
};

type Chapter = {
  id: string;
  title: string;
  summary: string;
  content: React.ReactNode;
};

const images: ImageItem[] = [
  { src: '/teens/garage/evh/01.evh6imagens.webp', alt: 'Painel de seis imagens com etapas da EVH Frankenstein Tribute' },
  { src: '/teens/garage/evh/02.evhoriginal.webp', alt: 'Referência da guitarra Frankenstein original de Eddie Van Halen' },
  { src: '/teens/garage/evh/03.evhfullfront.webp', alt: 'Resultado final esperado da frente da réplica EVH Frankenstein' },
  { src: '/teens/garage/evh/04.evhfullback.webp', alt: 'Resultado final esperado do verso da réplica EVH Frankenstein' },
  { src: '/teens/garage/evh/05.evh1front.webp', alt: 'Fase 1 base preta na frente do corpo da guitarra' },
  { src: '/teens/garage/evh/06.evh1back.webp', alt: 'Fase 1 base preta no verso do corpo da guitarra' },
  { src: '/teens/garage/evh/07.evh2front.webp', alt: 'Fase 2 camada branca na frente com mascaramento parcial' },
  { src: '/teens/garage/evh/08.evh2back.webp', alt: 'Fase 2 camada branca no verso com sobreposição de fitas' },
  { src: '/teens/garage/evh/09.evh3front.webp', alt: 'Fase 3 camada vermelha na frente revelando composição final' },
  { src: '/teens/garage/evh/10.evh3back.webp', alt: 'Fase 3 camada vermelha no verso com padrão final' },
  { src: '/teens/garage/evh/011.evhplydetail.webp', alt: 'Detalhe do escudo preto recortado e acabamento da EVH tribute' },
  { src: '/teens/garage/evh/012.evhquarter.webp', alt: 'Detalhe do quarter de 1971 aplicado na guitarra' },
  { src: '/teens/garage/evh/013.evhquarterposition.webp', alt: 'Posição do quarter e marcas visuais no corpo da guitarra' },
  { src: '/teens/garage/evh/014.evhhs.webp', alt: 'Headstock com aspecto envelhecido e queimado no estilo Frankenstein' },
  { src: '/teens/garage/evh/evh0front.webp', alt: 'Corpo da guitarra visto de frente para referência de materiais básicos' },
  { src: '/teens/garage/evh/evh0back.webp', alt: 'Corpo da guitarra visto de trás para referência de materiais básicos' },
  { src: '/teens/garage/evh/evh0.2front.webp', alt: 'Pré-etapa da base preta com visual frontal do corpo da guitarra' },
  { src: '/teens/garage/evh/evh0.2back.webp', alt: 'Pré-etapa da base preta com visual traseiro do corpo da guitarra' },
  { src: '/teens/garage/evh/evhneck.webp', alt: 'Braço da guitarra antes e depois da preparação de envelhecimento visual' },
  { src: '/teens/garage/evh/evhreflectors.webp', alt: 'Detalhe dos refletores aplicados na traseira da Frankenstrat' },
  { src: '/teens/garage/evh/evhreflectors2.webp', alt: 'Visão lateral dos refletores na traseira da Frankenstrat' },
  { src: '/teens/garage/evh/evhborbol.webp', alt: 'Detalhe do laço de pintura no horn superior esquerdo da guitarra' },
  { src: '/teens/garage/evh/evhrelic.webp', alt: 'Exemplo visual de relic e desgaste aplicado no instrumento' },
  { src: '/teens/garage/evh/evhplydetail2.webp', alt: 'Detalhe adicional de acabamento e construção da Frankenstein tribute' },
];

const badges: string[] = ['DIY', 'Intermediário', '8–20 horas', 'Custom Paint'];
const microBadges: string[] = ['Paint Layer I', 'Frankie Builder', 'DIY Spirit'];
const progressLabels: string[] = ['Referência', 'Materiais', 'Base preta', 'Branco', 'Vermelho', 'Detalhes', 'Relic', 'Montagem', 'Resultado', 'Espírito'];

interface ImageCardProps {
  item: ImageItem;
  onOpen: (item: ImageItem) => void;
  wide?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ item, onOpen, wide = false }) => (
  <button
    type="button"
    onClick={() => onOpen(item)}
    className="w-full rounded-2xl bg-zinc-100/40 p-2 text-left shadow-sm transition hover:shadow-md"
    aria-label={`Ampliar imagem: ${item.alt}`}
  >
    <img
      src={item.src}
      alt={item.alt}
      loading="lazy"
      className={`w-full rounded-xl object-contain ${wide ? 'max-h-[440px]' : 'max-h-[320px] md:max-h-[300px]'}`}
    />
  </button>
);

const renderParagraph = (isLight: boolean, text: string) => (
  <p className={`text-sm leading-7 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{text}</p>
);

const TeensGarageEvhPage: React.FC = () => {
  const isLight = getTeensTheme() === 'light';
  const [activeImage, setActiveImage] = useState<ImageItem | null>(null);
  const [expandedChapterId, setExpandedChapterId] = useState<string>('sec-1');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveImage(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const chapters: Chapter[] = useMemo(() => [
    {
      id: 'sec-1',
      title: 'Seção 1 — Referência original',
      summary: 'Observe as imperfeições e a lógica visual do instrumento original.',
      content: (
        <div className="space-y-4">
          {renderParagraph(isLight, 'Antes de começar, observe a referência. A Frankenstein original ficou famosa não apenas pelas cores, mas pelo conjunto de imperfeições: desgaste real, ferragens modificadas, peças improvisadas e uma pintura que parece quase caótica. O objetivo do projeto não é buscar perfeição de fábrica, mas compreender a lógica visual da guitarra.')}
          <ImageCard item={images[1]} onOpen={setActiveImage} wide />
        </div>
      ),
    },
    {
      id: 'sec-2',
      title: 'Seção 2 — Materiais básicos',
      summary: 'Checklist essencial para uma réplica acessível e convincente.',
      content: (
        <div className="space-y-4">
          <ul className={`list-disc space-y-1 pl-5 text-sm leading-7 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
            <li>corpo estilo Strat/Superstrat;</li><li>lixas 220, 400 e 600;</li><li>primer;</li><li>tinta spray preta;</li><li>tinta spray branca;</li><li>tinta spray vermelha;</li><li>fita crepe azul ou fita automotiva;</li><li>estilete;</li><li>luvas;</li><li>máscara;</li><li>verniz opcional;</li><li>hardware conforme o nível de fidelidade desejado.</li>
          </ul>
          <div className="grid gap-3 md:grid-cols-2">
            <ImageCard item={images[14]} onOpen={setActiveImage} />
            <ImageCard item={images[15]} onOpen={setActiveImage} />
          </div>
        </div>
      ),
    },
    {
      id: 'sec-3',
      title: 'Seção 3 — Fase 1: Base preta',
      summary: 'Primer, camadas leves e linhas agressivas com mascaramento inicial.',
      content: (
        <div className="space-y-4">
          {renderParagraph(isLight, 'Prepare o corpo, lixe a superfície e aplique primer. Depois, pinte toda a peça de preto em camadas leves. Após a secagem, use fita para preservar as linhas que continuarão pretas nas etapas seguintes. As faixas não precisam ser perfeitamente simétricas. O visual da Frankenstein depende justamente de linhas agressivas, cruzamentos inesperados e certa irregularidade.')}
          <div className="grid gap-3 md:grid-cols-2"><ImageCard item={images[4]} onOpen={setActiveImage} /><ImageCard item={images[5]} onOpen={setActiveImage} /></div>
        </div>
      ),
    },
    {
      id: 'sec-4',
      title: 'Seção 4 — Fase 2: Camada branca',
      summary: 'Sobreposição de fitas e construção da fase Black & White.',
      content: (
        <div className="space-y-4">
          {renderParagraph(isLight, 'Com parte do preto protegida pela fita, aplique a tinta branca. Essa etapa cria a fase Black & White, visualmente forte por si só. Depois da secagem, novas áreas podem ser mascaradas para preservar tanto linhas pretas quanto partes brancas. A sobreposição das fitas é o que cria a sensação de camadas.')}
          <div className="grid gap-3 md:grid-cols-2"><ImageCard item={images[16]} onOpen={setActiveImage} /><ImageCard item={images[17]} onOpen={setActiveImage} /></div>
          <div className="grid gap-3 md:grid-cols-2"><ImageCard item={images[6]} onOpen={setActiveImage} /><ImageCard item={images[7]} onOpen={setActiveImage} /></div>
        </div>
      ),
    },
    {
      id: 'sec-5',
      title: 'Seção 5 — Fase 3: Camada vermelha',
      summary: 'Revelação da assinatura visual Red • White • Black.',
      content: (
        <div className="space-y-4">
          {renderParagraph(isLight, 'Aplique o vermelho por cima das áreas expostas, sempre em camadas finas. Evite uma cobertura grossa demais. O resultado mais convincente surge quando o acabamento mantém pequenas variações, desgaste e sensação de construção manual. Após a secagem, remova as fitas com cuidado para revelar a composição final Red • White • Black.')}
          <div className="grid gap-3 md:grid-cols-2"><ImageCard item={images[8]} onOpen={setActiveImage} /><ImageCard item={images[9]} onOpen={setActiveImage} /></div>
        </div>
      ),
    },
    {
      id: 'sec-6',
      title: 'Seção 6 — Detalhes icônicos',
      summary: 'Elementos que reforçam o caráter Frankenstein.',
      content: (
        <div className="space-y-6">
          <section className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-[0.12em] text-violet-300">Braço envelhecido</h4>
            {renderParagraph(isLight, 'Com o corpo em cura, o próximo foco é o braço. Um caminho comum para envelhecimento visual controlado é trabalhar com lixa fina (como grão 800) e pigmento escuro em camadas suaves, sempre removendo excessos aos poucos. O segredo é paciência: exagerar na primeira passada costuma deixar o braço artificial.')}
            <ImageCard item={images[18]} onOpen={setActiveImage} wide />
          </section>

          <section className="grid gap-4 md:grid-cols-2 md:items-start">
            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase tracking-[0.12em] text-violet-300">Laço no horn superior</h4>
              {renderParagraph(isLight, 'O “laço” no chifre superior esquerdo não é erro de pintura: ele nasce do mascaramento em curva. Visualmente, parece uma gota vazada preta e branca cercada pelo vermelho.')}
              {renderParagraph(isLight, 'Para reproduzir esse detalhe, faça a curva com fita fina de boa qualidade (3 mm ou 6 mm ajuda bastante) ainda na fase em que as áreas pretas e brancas estão definidas. Depois, aplique o vermelho por cima e remova a fita com cuidado para revelar o desenho do laço.')}
              {renderParagraph(isLight, 'Na mesma região, o prendedor de palheta da Frankenstein segue a lógica DIY do projeto: em vez de peça refinada de fábrica, a referência mais comum é um pequeno tubing plástico autocolante, adaptado manualmente para uso prático em palco.')}
            </div>
            <ImageCard item={images[21]} onOpen={setActiveImage} />
          </section>

          <section className="mt-3 grid gap-4 md:grid-cols-2 md:items-start">
            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase tracking-[0.12em] text-violet-300">Headstock e marcas</h4>
              {renderParagraph(isLight, 'No headstock, uma marca registrada da estética EVH são as queimaduras próximas às tarraxas. Para uma réplica educacional, vale simular essas marcas com muito cuidado, mantendo irregularidade natural e sem transformar tudo em “efeito decorativo”.')}
            </div>
            <ImageCard item={images[13]} onOpen={setActiveImage} />
          </section>

          <section className="grid gap-4 md:grid-cols-2 md:items-start">
            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase tracking-[0.12em] text-violet-300">Quarter de 1971</h4>
              {renderParagraph(isLight, 'Outro ponto clássico é o quarter de 1971, associado ao ajuste mecânico da ponte em fases antigas do instrumento. Em réplicas, o que importa é posicionamento convincente, leitura visual da moeda e desgaste coerente com o restante da guitarra.')}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <ImageCard item={images[11]} onOpen={setActiveImage} />
              <ImageCard item={images[12]} onOpen={setActiveImage} />
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-[0.12em] text-violet-300">Refletores traseiros</h4>
            {renderParagraph(isLight, 'Na traseira, os refletores automotivos reforçam o lado performático da Frankenstein. O conjunto costuma misturar peças redondas e ovais em arranjo aparentemente aleatório. Essa falta de simetria faz parte da identidade do projeto e conversa com o espírito experimental do instrumento.')}
            <div className="grid gap-3 md:grid-cols-2">
              <ImageCard item={images[19]} onOpen={setActiveImage} />
              <ImageCard item={images[20]} onOpen={setActiveImage} />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 md:items-start">
            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase tracking-[0.12em] text-violet-300">Escudo cortado</h4>
              {renderParagraph(isLight, 'O escudo parcial recortado é um dos traços visuais mais fáceis de reconhecer. O recorte irregular ajuda a manter o ar de instrumento modificado em uso real, não de peça de vitrine.')}
            </div>
            <ImageCard item={images[10]} onOpen={setActiveImage} />
          </section>

          <section className="grid gap-4 md:grid-cols-2 md:items-start">
            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase tracking-[0.12em] text-violet-300">Volume com knob de tone</h4>
              {renderParagraph(isLight, 'Outro detalhe clássico é o controle único de volume com estética de knob de tone reaproveitado, solução prática que reforça a linguagem DIY e funcional da Frankenstein.')}
            </div>
            <ImageCard item={images[23]} onOpen={setActiveImage} />
          </section>
          <p className={`rounded-2xl border p-3 text-xs font-bold ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-700/40 bg-cyan-950/20 text-cyan-200'}`}>
            Curiosidade rápida: o posicionamento “caótico” de alguns detalhes visuais também era uma forma de provocar imitadores.
          </p>
        </div>
      ),
    },
    {
      id: 'sec-7',
      title: 'Seção 7 — Relic e acabamento',
      summary: 'Desgaste consciente para evitar caricatura.',
      content: (
        <div className="space-y-4">
          {renderParagraph(isLight, 'O desgaste deve ser aplicado com moderação. Pequenas áreas de tinta removida, bordas gastas e marcas pontuais podem deixar o instrumento mais convincente. O excesso, porém, pode transformar a réplica em caricatura. A melhor regra é observar referências reais e criar marcas apenas onde o uso faria sentido.')}
          <ImageCard item={images[22]} onOpen={setActiveImage} wide />
        </div>
      ),
    },
    {
      id: 'sec-8',
      title: 'Seção 8 — Montagem final',
      summary: 'Instalação funcional e estética direta ao ponto.',
      content: renderParagraph(isLight, 'Após a pintura e a cura da tinta, instale ponte, captador, elétrica, braço e demais componentes. Para uma estética próxima da Frankenstein, muitos builders utilizam configuração simples, com humbucker principal, escudo parcial, knob único e hardware com aparência funcional, não luxuosa.'),
    },
    {
      id: 'sec-9',
      title: 'Seção 9 — Resultado final esperado',
      summary: 'Payoff visual após a progressão completa da pintura.',
      content: (
        <div className="space-y-4">
          {renderParagraph(isLight, 'A réplica final deve evidenciar o contraste entre vermelho, branco e preto, com linhas irregulares, camadas sobrepostas, marcas de uso e aparência experimental. A frente concentra a identidade visual mais reconhecível; o verso ajuda a entender a continuidade do padrão e a lógica da pintura no corpo inteiro.')}
          <div className="grid gap-3 md:grid-cols-2"><ImageCard item={images[2]} onOpen={setActiveImage} /><ImageCard item={images[3]} onOpen={setActiveImage} /></div>
        </div>
      ),
    },
    {
      id: 'sec-10',
      title: 'Seção 10 — O espírito da Frankenstein',
      summary: 'Criatividade acima da perfeição.',
      content: (
        <div className="space-y-4">
          {renderParagraph(isLight, 'A Frankenstein nunca foi sobre perfeição. Ela representa experimentação, criatividade e coragem para modificar o próprio instrumento. Cada réplica terá pequenas diferenças, e isso faz parte do processo. No Garage do GA Teens, o objetivo é entender como identidade visual, construção e som se conectam.')}
          <p className={`rounded-2xl border p-3 text-xs font-bold ${isLight ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-violet-700/40 bg-violet-950/20 text-violet-200'}`}>
            Eddie provavelmente aprovaria esse caos.
          </p>
        </div>
      ),
    },
  ], [isLight]);

  const completedCount = chapters.filter((chapter) => completed[chapter.id]).length;
  const progressPercent = Math.round((completedCount / chapters.length) * 100);

  const toggleChapter = (id: string) => {
    setExpandedChapterId((prev) => (prev === id ? '' : id));
  };

  const toggleCompleted = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? 'rgba(148,163,184,0.35)' : 'rgba(129,140,248,0.25)'} 1px, transparent 1px)`,
    backgroundSize: '100% 28px',
  };

  return (
    <div className={`min-h-screen relative p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-[#03010a] text-violet-50'}`}>
      <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigateTo('/teens')}
          className={`mb-4 rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/60 text-violet-200'}`}
        >
          Voltar ao Teens
        </button>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">GA Teens / Garagem / EVH Frankenstein Tribute</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => navigateTo('/teens/garage')} className={`rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] ${isLight ? 'border-violet-300 bg-white text-violet-700' : 'border-violet-700 bg-violet-950/60 text-violet-200'}`}>
            Voltar à Garagem
          </button>
        </div>

        <header className={`mt-5 rounded-3xl border p-6 md:p-9 ${isLight ? 'border-violet-200 bg-white/90' : 'border-violet-700/45 bg-zinc-900/65'}`}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-start">
            <div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">EVH Frankenstein Tribute</h1>
              <p className={`mt-4 max-w-4xl text-base font-bold leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Como criar uma réplica visual inspirada na fase Red • White • Black da guitarra Frankenstein.</p>
              <div className="mt-4 flex flex-wrap gap-2">{badges.map((badge) => <span key={badge} className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${isLight ? 'border-cyan-300 bg-cyan-50 text-cyan-700' : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'}`}>{badge}</span>)}</div>
              <div className="mt-3 flex flex-wrap gap-2">{microBadges.map((badge) => <span key={badge} className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${isLight ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-amber-500/40 bg-amber-500/10 text-amber-200'}`}>{badge}</span>)}</div>
              <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-amber-400">Cada Frankenstein é única.</p>
              <p className={`mt-2 max-w-4xl text-sm leading-7 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Este tutorial é uma homenagem visual e educacional inspirada na Frankenstein, não uma reprodução oficial licenciada.</p>
              <p className={`mt-4 max-w-4xl text-sm leading-7 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>A Frankenstein de Eddie Van Halen não era uma guitarra perfeita. Ela nasceu de experimentos, peças misturadas, pintura improvisada e uma busca obsessiva por identidade sonora. Este guia mostra uma forma acessível de recriar a estética clássica Red • White • Black, usando a sequência de pintura mais comum entre builders modernos: preto, branco e vermelho.</p>
              <p className={`mt-4 rounded-2xl border p-3 text-sm leading-7 ${isLight ? 'border-violet-200 bg-violet-50 text-zinc-700' : 'border-violet-700/50 bg-violet-950/20 text-zinc-300'}`}>Embora existam discussões sobre a ordem histórica exata da pintura da guitarra original, muitos builders atuais utilizam a sequência PRETO → BRANCO → VERMELHO porque ela facilita o mascaramento, cria profundidade visual e gera um resultado muito convincente para réplicas DIY.</p>
            </div>

            <div className="space-y-4">
              <div className={`rounded-2xl border p-3 ${isLight ? 'border-violet-200 bg-violet-50/60' : 'border-violet-700/40 bg-violet-950/20'}`}>
                <ImageCard item={images[0]} onOpen={setActiveImage} wide />
              </div>

              <div className={`rounded-2xl border p-4 ${isLight ? 'border-violet-200 bg-violet-50/60' : 'border-violet-700/40 bg-violet-950/20'}`}>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-400">Projeto 001 — EVH Frankenstein Tribute</p>
                <div className={`mt-3 h-2 w-full rounded-full ${isLight ? 'bg-violet-100' : 'bg-zinc-800'}`}>
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className={`mt-2 text-xs font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{progressPercent}% concluído · {completedCount}/{chapters.length} etapas</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {progressLabels.map((label, index) => (
                    <span key={label} className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${completed[`sec-${index + 1}`] ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-300' : isLight ? 'border-zinc-300 bg-white text-zinc-500' : 'border-zinc-700 bg-zinc-900 text-zinc-400'}`}>
                      {index + 1}. {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-7 space-y-4">
          {chapters.map((chapter) => {
            const isExpanded = expandedChapterId === chapter.id;
            return (
              <article key={chapter.id} className={`overflow-hidden rounded-3xl border transition-all ${isLight ? 'border-violet-200 bg-white/90' : 'border-violet-700/40 bg-zinc-900/60'}`}>
                <div className="flex flex-col gap-3 p-4 md:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter.id)}
                      className="flex min-w-[240px] flex-1 items-center gap-3 text-left"
                      aria-expanded={isExpanded}
                      aria-controls={`${chapter.id}-content`}
                    >
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-black ${isLight ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-violet-500/50 bg-violet-900/40 text-violet-200'}`}>
                        {isExpanded ? '−' : '+'}
                      </span>
                      <div>
                        <h3 className="text-base font-black md:text-lg">{chapter.title}</h3>
                        <p className={`mt-1 text-xs ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{chapter.summary}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCompleted(chapter.id)}
                      className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] ${completed[chapter.id] ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-300' : isLight ? 'border-zinc-300 bg-white text-zinc-500' : 'border-zinc-700 bg-zinc-900 text-zinc-400'}`}
                    >
                      {completed[chapter.id] ? 'Concluída' : 'Marcar etapa'}
                    </button>
                  </div>
                  <div id={`${chapter.id}-content`} className={`grid transition-all duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="max-w-4xl pt-2 pb-1">{chapter.content}</div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('/teens')}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] transition-all hover:from-violet-500 hover:to-fuchsia-500 active:scale-95"
          >
            Voltar ao Teens
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/studio')}
            className="rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-500 px-8 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(8,145,178,0.3)] transition-all hover:from-cyan-500 hover:to-sky-400 active:scale-95"
          >
            Ir para Studio
          </button>
        </div>
      </div>

      {activeImage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Visualização ampliada de imagem" onClick={() => setActiveImage(null)}>
          <button type="button" className="absolute right-4 top-4 rounded-full bg-white px-3 py-2 text-xs font-black uppercase text-zinc-900" onClick={() => setActiveImage(null)} aria-label="Fechar imagem ampliada">Fechar</button>
          <img src={activeImage.src} alt={activeImage.alt} className="max-h-[90vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default TeensGarageEvhPage;
