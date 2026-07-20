import React from 'react';

interface MyAcademyIntroTopicContentProps {
  itemId: string;
  lang: 'pt' | 'en';
}

export const MY_ACADEMY_INTRO_TOPIC_IDS = [
  'M0-01-01',
  'M0-01-02',
  'M0-01-03',
] as const;

export const isMyAcademyIntroTopicPublished = (itemId: string): boolean => (
  MY_ACADEMY_INTRO_TOPIC_IDS.includes(itemId as (typeof MY_ACADEMY_INTRO_TOPIC_IDS)[number])
);

const topicContent = {
  'M0-01-01': {
    pt: {
      heading: 'Um mapa que conecta todo o ecossistema',
      paragraphs: [
        'O My Academy é a camada de orientação do Guitar Architect. Ele organiza assuntos, experiências, ferramentas e personagens em uma jornada compreensível, para que o usuário saiba onde está, o que pode explorar e quais caminhos fazem sentido a partir dali.',
        'Kids, Teens e Studio continuam sendo ambientes independentes. O My Academy não os substitui: ele cria pontes entre eles e mostra quando uma atividade lúdica, uma prática guiada ou uma ferramenta avançada pode contribuir para determinado objetivo musical.',
      ],
      points: [
        'Kids favorece descoberta, curiosidade e experimentação visual.',
        'Teens transforma descoberta em prática, desafios e evolução progressiva.',
        'Studio oferece ferramentas para estudar, visualizar, construir e registrar ideias musicais.',
        'My Academy organiza essas possibilidades em uma jornada aberta e contextualizada.',
      ],
    },
    en: {
      heading: 'A map connecting the whole ecosystem',
      paragraphs: [
        'My Academy is Guitar Architect’s guidance layer. It organizes topics, experiences, tools and characters into an understandable journey, helping users see where they are, what they can explore and which paths may be useful from there.',
        'Kids, Teens and Studio remain independent environments. My Academy does not replace them: it creates bridges between them and shows when a playful activity, guided practice or advanced tool may support a musical goal.',
      ],
      points: [
        'Kids supports discovery, curiosity and visual experimentation.',
        'Teens turns discovery into practice, challenges and progressive development.',
        'Studio provides tools to study, visualize, build and record musical ideas.',
        'My Academy organizes these possibilities into an open, contextual journey.',
      ],
    },
  },
  'M0-01-02': {
    pt: {
      heading: 'Direção sem transformar experiência em julgamento',
      paragraphs: [
        'O Guitar Architect pode explicar conceitos, propor experiências, apresentar ferramentas, sugerir revisões e organizar próximos passos. Essas sugestões partem do conteúdo disponível e das escolhas declaradas pelo próprio usuário.',
        'O GA não observa a execução física, não escuta o instrumento por esta experiência e não comprova precisão, coordenação, domínio técnico ou compreensão completa. Por isso, não atribui diagnóstico musical, aprovação, reprovação ou nível pessoal com base nessas interações.',
      ],
      points: [
        'Sem notas, percentuais de acerto ou ranking no My Academy.',
        'Sem promessa de avaliação técnica automática.',
        'Sem bloqueio do mapa por respostas, pausas ou escolhas diferentes.',
        'Com linguagem transparente sobre o que foi apenas declarado pelo usuário.',
      ],
    },
    en: {
      heading: 'Direction without turning experience into judgement',
      paragraphs: [
        'Guitar Architect can explain concepts, propose experiences, present tools, suggest reviews and organize possible next steps. These suggestions come from available content and choices explicitly declared by the user.',
        'GA does not observe physical performance, listen to the instrument through this experience or verify precision, coordination, technical mastery or complete understanding. It therefore does not assign a musical diagnosis, approval, failure or personal level from these interactions.',
      ],
      points: [
        'No grades, accuracy percentages or My Academy ranking.',
        'No promise of automatic technical assessment.',
        'No map locks caused by answers, pauses or different choices.',
        'Transparent language about information declared by the user.',
      ],
    },
  },
  'M0-01-03': {
    pt: {
      heading: 'Uma jornada orientada, mas nunca obrigatória',
      paragraphs: [
        'O My Academy pode destacar uma experiência como próximo passo, mas essa indicação não cria uma sequência obrigatória. O usuário continua livre para abrir o mapa completo, visitar outro território, repetir uma unidade, usar o Studio ou interromper a jornada.',
        'Revisar não significa retroceder, pular não significa falhar e explorar livremente não apaga o caminho sugerido. A função do mapa é reduzir a sensação de conteúdos desconectados, sem retirar autonomia de quem aprende.',
      ],
      points: [
        'Seguir a sugestão quando ela fizer sentido.',
        'Repetir uma experiência para reencontrar uma ideia.',
        'Revisar explicações sem perder outras possibilidades.',
        'Pular ou explorar livremente e retornar depois.',
      ],
    },
    en: {
      heading: 'A guided journey that is never mandatory',
      paragraphs: [
        'My Academy may highlight an experience as a possible next step, but that suggestion does not create a mandatory sequence. Users remain free to open the complete map, visit another territory, repeat a unit, use Studio or leave the journey.',
        'Reviewing does not mean moving backwards, skipping does not mean failing, and free exploration does not erase the suggested path. The map is designed to reduce the feeling of disconnected content without taking away learner autonomy.',
      ],
      points: [
        'Follow a suggestion when it is useful.',
        'Repeat an experience to revisit an idea.',
        'Review explanations without losing other possibilities.',
        'Skip or explore freely and return later.',
      ],
    },
  },
} as const;

const MyAcademyIntroTopicContent: React.FC<MyAcademyIntroTopicContentProps> = ({ itemId, lang }) => {
  if (!isMyAcademyIntroTopicPublished(itemId)) return null;
  const content = topicContent[itemId as keyof typeof topicContent][lang];
  const isPt = lang === 'pt';

  return (
    <details className="group mt-3 rounded-xl border border-cyan-400/25 bg-cyan-950/20">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-black text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
        <span>{isPt ? 'Abrir conteúdo' : 'Open content'}</span>
        <span aria-hidden="true" className="text-lg text-cyan-300 transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-cyan-400/20 px-4 py-4">
        <h5 className="text-base font-black leading-snug text-white">{content.heading}</h5>
        <div className="mt-3 space-y-3 text-sm font-semibold leading-relaxed text-slate-300">
          {content.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <ul className="mt-4 space-y-2">
          {content.points.map(point => (
            <li key={point} className="flex gap-2 text-sm font-semibold leading-relaxed text-slate-200">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
};

export default MyAcademyIntroTopicContent;
