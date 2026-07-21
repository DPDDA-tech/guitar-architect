import React from 'react';
import { navigateToPath } from '../../utils/fretboardNavigation';

interface MyAcademyIntroTopicContentProps {
  itemId: string;
  lang: 'pt' | 'en';
}

type TopicCopy = {
  heading: string;
  paragraphs: readonly string[];
  points: readonly string[];
  character?: {
    name: string;
    image: string;
    role: string;
    profilePath?: string;
  };
  sourcesNote?: {
    label: string;
    items: readonly string[];
    linkLabel: string;
    linkPath: string;
  };
};

const topic = (pt: TopicCopy, en: TopicCopy): { pt: TopicCopy; en: TopicCopy } => ({ pt, en });

const clara = (rolePt: string, roleEn: string) => ({
  pt: { name: 'Clara', image: '/instructors/1000/clara-card-instructor.webp', role: rolePt, profilePath: '/instructors/clara' },
  en: { name: 'Clara', image: '/instructors/1000/clara-card-instructor.webp', role: roleEn, profilePath: '/instructors/clara' },
});

const tom = (rolePt: string, roleEn: string) => ({
  pt: { name: 'Tom', image: '/instructors/1000/tom-card-instructor.webp', role: rolePt, profilePath: '/instructors/tom' },
  en: { name: 'Tom', image: '/instructors/1000/tom-card-instructor.webp', role: roleEn, profilePath: '/instructors/tom' },
});

const helena = (rolePt: string, roleEn: string) => ({
  pt: { name: 'Dra. Helena Villaça', image: '/guests/helena/helena-card-guest.webp', role: rolePt, profilePath: '/especialistas/dra-helena' },
  en: { name: 'Dr. Helena Villaça', image: '/guests/helena/helena-card-guest.webp', role: roleEn, profilePath: '/especialistas/dra-helena' },
});

const topicContent = {
  'M0-01-01': topic(
    {
      heading: 'Um mapa que conecta todo o ecossistema',
      paragraphs: [
        'O My Academy organiza assuntos, experiências, ferramentas e personagens para que você saiba onde está, o que pode explorar e quais caminhos fazem sentido a partir dali.',
        'Kids, Teens e Studio continuam independentes. O My Academy não replica tudo: ele explica por que um recurso já existente pode ser útil e conduz você até ele.',
      ],
      points: ['Kids favorece descoberta e curiosidade.', 'Teens aproxima prática e desafios.', 'Studio oferece ferramentas de estudo e criação.', 'My Academy conecta essas possibilidades.'],
      character: clara('Guia da jornada', 'Journey guide').pt,
    },
    {
      heading: 'A map connecting the whole ecosystem',
      paragraphs: [
        'My Academy organizes topics, experiences, tools and characters so you can see where you are, what you may explore and which paths may be useful from there.',
        'Kids, Teens and Studio remain independent. My Academy does not replicate everything: it explains why an existing resource may be useful and guides you to it.',
      ],
      points: ['Kids supports discovery and curiosity.', 'Teens connects practice and challenges.', 'Studio provides study and creation tools.', 'My Academy connects these possibilities.'],
      character: clara('Guia da jornada', 'Journey guide').en,
    },
  ),
  'M0-01-02': topic(
    {
      heading: 'Direção sem transformar experiência em julgamento',
      paragraphs: [
        'O Guitar Architect pode explicar conceitos, propor experiências e organizar próximos passos a partir do conteúdo disponível e das escolhas declaradas por você.',
        'O GA não observa sua execução física nem transforma uma interação digital em diagnóstico musical. Por isso, não atribui aprovação, reprovação ou nível pessoal.',
      ],
      points: ['Sem notas ou ranking.', 'Sem promessa de avaliação técnica automática.', 'Sem bloqueio do mapa por respostas ou pausas.', 'Com linguagem transparente sobre o que foi declarado.'],
    },
    {
      heading: 'Direction without turning experience into judgement',
      paragraphs: [
        'Guitar Architect can explain concepts, propose experiences and organize possible next steps from available content and choices declared by you.',
        'GA does not observe physical performance or turn a digital interaction into a musical diagnosis. It therefore does not assign approval, failure or a personal level.',
      ],
      points: ['No grades or ranking.', 'No promise of automatic technical assessment.', 'No map locks caused by answers or pauses.', 'Transparent language about declared information.'],
    },
  ),
  'M0-01-03': topic(
    {
      heading: 'Uma jornada orientada, mas nunca obrigatória',
      paragraphs: [
        'O My Academy pode destacar um próximo passo, mas isso não cria sequência obrigatória. Você pode abrir o mapa, visitar outro território, repetir uma unidade, usar o Studio ou interromper a jornada.',
        'Revisar não significa retroceder, pular não significa falhar e explorar livremente não apaga o caminho sugerido.',
      ],
      points: ['Seguir uma sugestão quando fizer sentido.', 'Repetir para reencontrar uma ideia.', 'Revisar sem perder outras possibilidades.', 'Pular ou explorar e retornar depois.'],
    },
    {
      heading: 'A guided journey that is never mandatory',
      paragraphs: [
        'My Academy may highlight a next step, but that does not create a mandatory sequence. You may open the map, visit another territory, repeat a unit, use Studio or leave the journey.',
        'Reviewing is not moving backwards, skipping is not failing, and free exploration does not erase the suggested path.',
      ],
      points: ['Follow a suggestion when useful.', 'Repeat to revisit an idea.', 'Review without losing other possibilities.', 'Skip or explore and return later.'],
    },
  ),
  'M0-02-01': topic(
    {
      heading: 'Som e silêncio organizam a atenção',
      paragraphs: [
        'Som é uma vibração percebida; silêncio é a ausência relativa de um som que chama sua atenção. Na música, ambos têm função.',
        'Antes de nomear notas ou ritmos, perceba quando algo começa, quanto tempo permanece e quando termina.',
      ],
      points: ['Ouça o ambiente por alguns segundos.', 'Identifique um som contínuo e um breve.', 'Perceba uma pausa.', 'O objetivo é notar, não acertar.'],
      character: clara('Convite à escuta', 'Listening invitation').pt,
    },
    {
      heading: 'Sound and silence organize attention',
      paragraphs: [
        'Sound is a perceived vibration; silence is the relative absence of a sound calling your attention. In music, both have a function.',
        'Before naming notes or rhythms, notice when something begins, how long it remains and when it ends.',
      ],
      points: ['Listen to the environment.', 'Identify one continuous and one brief sound.', 'Notice a pause.', 'The goal is noticing, not correctness.'],
      character: clara('Convite à escuta', 'Listening invitation').en,
    },
  ),
  'M0-02-02': topic(
    {
      heading: 'Quatro maneiras iniciais de descrever um som',
      paragraphs: [
        'Altura indica grave ou agudo. Duração indica quanto tempo o som permanece. Intensidade descreve força ou volume. Timbre permite distinguir fontes diferentes.',
        'Essas dimensões se combinam: um som pode ser agudo, curto, suave e metálico.',
      ],
      points: ['Grave e agudo: altura.', 'Longo e curto: duração.', 'Forte e suave: intensidade.', 'Identidade sonora: timbre.'],
    },
    {
      heading: 'Four initial ways to describe sound',
      paragraphs: [
        'Pitch describes low or high. Duration describes how long sound remains. Intensity describes force or volume. Timbre lets us distinguish different sources.',
        'These dimensions combine: a sound may be high, short, soft and metallic.',
      ],
      points: ['Low and high: pitch.', 'Long and short: duration.', 'Loud and soft: intensity.', 'Sound identity: timbre.'],
    },
  ),
  'M0-02-03': topic(
    {
      heading: 'Você pode entrar pela escuta, pelo corpo ou pelo movimento',
      paragraphs: [
        'Algumas pessoas percebem primeiro pelo ouvido; outras compreendem melhor ao bater o pé, usar as mãos ou visualizar o movimento. Nenhuma dessas portas é inferior.',
        'Reconheça qual experiência torna a ideia mais clara e depois conecte essa percepção ao instrumento.',
      ],
      points: ['Escute sem tocar.', 'Marque uma pulsação com o corpo.', 'Observe o movimento que produz o som.', 'Compare qual abordagem ajudou mais.'],
    },
    {
      heading: 'You may begin through listening, body or movement',
      paragraphs: [
        'Some people notice first through hearing; others understand better by tapping a foot, using their hands or visualizing movement. None of these entry points is inferior.',
        'Recognize which experience makes the idea clearer and then connect it to the instrument.',
      ],
      points: ['Listen without playing.', 'Mark a pulse with your body.', 'Observe the movement producing sound.', 'Compare which approach helped more.'],
    },
  ),
  'M0-03-01': topic(
    {
      heading: 'Instrumentos de cordas podem produzir som de formas diferentes',
      paragraphs: [
        'Violões, guitarras, baixos, banjos e outros instrumentos de cordas compartilham elementos como cordas, braço e corpo, mas não produzem nem projetam o som da mesma maneira.',
        'Instrumentos acústicos usam o corpo e a caixa acústica para ampliar a vibração. Eletroacústicos combinam essa projeção natural com captação. Elétricos dependem de captadores e equipamentos externos para reproduzir o sinal com volume funcional.',
      ],
      points: ['Acústico: corda, corpo e caixa acústica.', 'Eletroacústico: som natural e captação.', 'Elétrico: captador, sinal e equipamento.', 'Há muitas variações de forma, número de cordas e afinação.'],
      character: tom('Luthieria e cuidado', 'Luthiery and care').pt,
    },
    {
      heading: 'String instruments may produce sound in different ways',
      paragraphs: [
        'Acoustic guitars, electric guitars, basses, banjos and other string instruments share elements such as strings, neck and body, but they do not produce or project sound in the same way.',
        'Acoustic instruments use body and sound box to amplify vibration. Electro-acoustic instruments combine natural projection with pickup systems. Electric instruments rely on pickups and external equipment for functional volume.',
      ],
      points: ['Acoustic: string, body and sound box.', 'Electro-acoustic: natural sound and pickup.', 'Electric: pickup, signal and equipment.', 'There are many variations in shape, strings and tuning.'],
      character: tom('Luthieria e cuidado', 'Luthiery and care').en,
    },
  ),
  'M0-03-02': topic(
    {
      heading: 'Da vibração ao som que chega aos ouvidos',
      paragraphs: [
        'Em um violão ou banjo acústico, a vibração das cordas chega ao tampo e à caixa acústica, que movimentam o ar e projetam o som. Em instrumentos elétricos, captadores transformam a vibração em sinal elétrico.',
        'Nos eletroacústicos, os dois caminhos podem coexistir. O braço e as casas organizam as alturas; corpo, caixa, captadores, controles, cabos e amplificação influenciam o resultado final.',
      ],
      points: ['Corda: origem da vibração.', 'Caixa acústica: projeção natural.', 'Captador: conversão em sinal.', 'Amplificador ou interface: reprodução do sinal elétrico.'],
      character: tom('Especialista convidado', 'Guest specialist').pt,
    },
    {
      heading: 'From vibration to the sound reaching your ears',
      paragraphs: [
        'In an acoustic guitar or banjo, string vibration reaches the top and sound box, which move air and project sound. In electric instruments, pickups turn vibration into an electrical signal.',
        'Electro-acoustic instruments may use both paths. Neck and frets organize pitch; body, sound box, pickups, controls, cables and amplification shape the result.',
      ],
      points: ['String: source of vibration.', 'Sound box: natural projection.', 'Pickup: signal conversion.', 'Amplifier or interface: electrical signal reproduction.'],
      character: tom('Especialista convidado', 'Guest specialist').en,
    },
  ),
  'M0-03-03': topic(
    {
      heading: 'Afinar é ajustar cada corda a uma altura de referência',
      paragraphs: [
        'A afinação organiza as cordas em alturas definidas para que notas, acordes e relações musicais soem como esperado. O instrumento pode sair da afinação por mudanças de temperatura, cordas novas, uso, transporte ou variações de tensão.',
        'Um afinador identifica a altura produzida. Toque uma corda por vez, observe a indicação e ajuste lentamente a tarraxa até chegar à referência. A afinação padrão é um ponto de partida, não a única possibilidade; instrumentos diferentes podem usar quantidades de cordas e referências distintas.',
        'Afinar não é o mesmo que regular o instrumento. Se a corda estiver muito distante da referência, excessivamente tensa, não estabilizar ou houver dúvida, interrompa o ajuste e procure orientação.',
      ],
      points: ['Confira uma corda por vez.', 'Gire a tarraxa lentamente.', 'Use o afinador como referência, não como cobrança.', 'Pare se a corda ficar excessivamente tensa ou se houver dúvida sobre o ajuste.'],
      character: tom('Afinação e cuidado do instrumento', 'Tuning and instrument care').pt,
    },
    {
      heading: 'Tuning means adjusting each string to a reference pitch',
      paragraphs: [
        'Tuning organizes strings into defined pitches so notes, chords and musical relationships sound as expected. Instruments may go out of tune because of temperature, new strings, use, transport or tension changes.',
        'A tuner identifies the pitch being produced. Play one string at a time, observe the indication and slowly adjust the tuning peg until reaching the reference. Standard tuning is a starting point, not the only possibility; different instruments may use different string counts and references.',
        'Tuning is not the same as setting up the instrument. If a string is far from reference, excessively tense, unstable or you are unsure, stop adjusting and seek guidance.',
      ],
      points: ['Check one string at a time.', 'Turn the tuning peg slowly.', 'Use the tuner as a reference, not pressure.', 'Stop if the string becomes excessively tense or if you are unsure about the adjustment.'],
      character: tom('Afinação e cuidado do instrumento', 'Tuning and instrument care').en,
    },
  ),
  'M0-03-04': topic(
    {
      heading: 'O instrumento se ajusta a você, não o contrário',
      paragraphs: [
        'Altura da alça, apoio, ângulo do braço e distância em relação ao corpo influenciam a tensão nos ombros, punhos e mãos. Pequenos ajustes na forma de segurar ou apoiar o instrumento podem reduzir esforço desnecessário sem exigir equipamento especial.',
        'Sinais como formigamento, dor localizada, rigidez ou fadiga que não melhora com uma pausa curta merecem atenção — não como motivo de alarme, mas como informação para ajustar a prática.',
      ],
      points: ['Experimente diferentes apoios e alturas até sentir estabilidade.', 'Evite tensão fixa nos ombros e no pulso ao tocar.', 'Faça pausas antes que o desconforto se acumule.', 'Se a dor for persistente ou progressiva, procure avaliação profissional.'],
      character: helena('Especialista convidada em Saúde do Músico', 'Guest specialist in Musician Health').pt,
      sourcesNote: {
        label: 'Base desta orientação',
        items: [
          'Rotter et al. — revisão sistemática sobre queixas musculoesqueléticas em músicos.',
          'Foxman & Burgel — prevenção de distúrbios relacionados à prática musical.',
        ],
        linkLabel: 'Ver fontes completas no perfil da Dra. Helena Villaça',
        linkPath: '/especialistas/dra-helena#fontes-e-referencias',
      },
    },
    {
      heading: 'The instrument adjusts to you, not the other way around',
      paragraphs: [
        'Strap height, support, neck angle and distance from the body all influence tension in the shoulders, wrists and hands. Small adjustments to how you hold or support the instrument can reduce unnecessary effort without special equipment.',
        'Signs such as tingling, localized pain, stiffness or fatigue that does not improve with a short break deserve attention — not as a reason for alarm, but as information to adjust practice.',
      ],
      points: ['Try different supports and heights until you feel stable.', 'Avoid fixed tension in the shoulders and wrist while playing.', 'Take breaks before discomfort builds up.', 'If pain is persistent or progressive, seek professional assessment.'],
      character: helena('Especialista convidada em Saúde do Músico', 'Guest specialist in Musician Health').en,
      sourcesNote: {
        label: 'Basis for this guidance',
        items: [
          'Rotter et al. — systematic review on musculoskeletal complaints in musicians.',
          'Foxman & Burgel — prevention of playing-related musculoskeletal disorders.',
        ],
        linkLabel: 'See full sources on Dr. Helena Villaça’s profile',
        linkPath: '/especialistas/dra-helena#fontes-e-referencias',
      },
    },
  ),
  'M0-04-01': topic(
    {
      heading: 'O braço interativo é um mapa, não um teste',
      paragraphs: [
        'O Studio permite visualizar notas, intervalos, escalas, acordes e relações no braço. Nesta primeira exploração, o objetivo é perceber que uma indicação visual representa uma posição possível no instrumento real.',
        'Abra o recurso, observe cordas e casas e selecione uma posição sem obrigação de memorizar ou executar.',
      ],
      points: ['Cordas e casas funcionam como coordenadas.', 'Uma posição pode receber nomes e relações diferentes.', 'Explorar não significa dominar.', 'Você pode voltar ao mapa a qualquer momento.'],
    },
    {
      heading: 'The interactive fretboard is a map, not a test',
      paragraphs: [
        'Studio lets you visualize notes, intervals, scales, chords and relationships across the fretboard. The goal is to see that a visual indication represents a possible position on the real instrument.',
        'Open the resource, observe strings and frets and select a position without memorizing or performing.',
      ],
      points: ['Strings and frets work as coordinates.', 'A position may have different names and relationships.', 'Exploring is not mastering.', 'You may return to the map at any time.'],
    },
  ),
  'M0-04-02': topic(
    {
      heading: 'Experimente antes de procurar acerto',
      paragraphs: [
        'Toque uma corda, selecione uma posição no braço virtual, escute um som disponível ou observe uma relação visual. O objetivo é estabelecer contato, não medir desempenho.',
        'Uma primeira exploração bem-sucedida é aquela que desperta uma pergunta ou torna algum elemento menos estranho.',
      ],
      points: ['Escolha uma ação simples.', 'Observe o que mudou.', 'Repita somente se houver curiosidade.', 'Registre uma percepção, não uma nota.'],
    },
    {
      heading: 'Experiment before looking for correctness',
      paragraphs: [
        'Play a string, select a virtual fretboard position, listen to an available sound or observe a visual relationship. The goal is contact, not performance measurement.',
        'A successful first exploration creates a question or makes something feel less unfamiliar.',
      ],
      points: ['Choose one simple action.', 'Notice what changed.', 'Repeat only when curious.', 'Record a perception, not a grade.'],
    },
  ),
  'M0-04-03': topic(
    {
      heading: 'Escolha conscientemente o próximo ponto',
      paragraphs: [
        'Depois da exploração, você pode seguir a sugestão de “Onde estou agora”, abrir o mapa completo ou entrar livremente em outro ambiente. Nenhuma escolha invalida as demais.',
        'Alice pode acompanhar uma abordagem mais contemplativa e explicada; Arthur pode acrescentar pequenos desafios e impulso. A escolha é reversível e não altera o currículo.',
      ],
      points: ['Seguir a sugestão atual.', 'Abrir o mapa e escolher outro território.', 'Explorar o Studio livremente.', 'Escolher Alice, Arthur ou nenhum acompanhante.'],
    },
    {
      heading: 'Choose the next point deliberately',
      paragraphs: [
        'After exploring, you may follow the suggestion in “Where I am now”, open the full map or freely enter another environment. None of these choices invalidates the others.',
        'Alice may support a more reflective approach; Arthur may add small challenges and momentum. The choice is reversible and does not change the curriculum.',
      ],
      points: ['Follow the current suggestion.', 'Open the map and choose another territory.', 'Explore Studio freely.', 'Choose Alice, Arthur or no companion.'],
    },
  ),
} as const;

export const MY_ACADEMY_INTRO_TOPIC_IDS = Object.keys(topicContent) as (keyof typeof topicContent)[];

export const isMyAcademyIntroTopicPublished = (itemId: string): itemId is keyof typeof topicContent => (
  itemId in topicContent
);

const MyAcademyIntroTopicContent: React.FC<MyAcademyIntroTopicContentProps> = ({ itemId, lang }) => {
  if (!isMyAcademyIntroTopicPublished(itemId)) return null;
  const content = topicContent[itemId][lang];
  const isPt = lang === 'pt';

  return (
    <details className="group mt-3 rounded-xl border border-cyan-400/25 bg-cyan-950/20">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-black text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
        <span>{isPt ? 'Abrir conteúdo' : 'Open content'}</span>
        <span aria-hidden="true" className="text-lg text-cyan-300 transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-cyan-400/20 px-4 py-4">
        {content.character && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-300/25 bg-amber-300/5 p-3">
            <img src={content.character.image} alt={content.character.name} className="h-12 w-12 rounded-full border-2 border-amber-300 object-cover object-top" />
            <div className="min-w-0">
              <p className="text-sm font-black text-white">{content.character.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-200">{content.character.role}</p>
              {content.character.profilePath && (
                <button type="button" onClick={() => navigateToPath(content.character!.profilePath!)} className="mt-1 inline-flex text-xs font-bold text-cyan-300 hover:text-cyan-200">
                  {isPt ? 'Conhecer personagem' : 'Meet character'}
                </button>
              )}
            </div>
          </div>
        )}
        <h5 className="text-base font-black leading-snug text-white">{content.heading}</h5>
        <div className="mt-3 space-y-3 text-sm font-semibold leading-relaxed text-slate-300">
          {content.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <ul className="mt-4 space-y-2">
          {content.points.map(pointCopy => (
            <li key={pointCopy} className="flex gap-2 text-sm font-semibold leading-relaxed text-slate-200">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
              <span>{pointCopy}</span>
            </li>
          ))}
        </ul>
        {content.sourcesNote && (
          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/40 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{content.sourcesNote.label}</p>
            <ul className="mt-2 space-y-1">
              {content.sourcesNote.items.map(sourceItem => (
                <li key={sourceItem} className="text-xs font-semibold leading-relaxed text-slate-300">{sourceItem}</li>
              ))}
            </ul>
            <a href={content.sourcesNote.linkPath} className="mt-2 inline-flex text-xs font-bold text-cyan-300 hover:text-cyan-200">
              {content.sourcesNote.linkLabel} ↗
            </a>
          </div>
        )}
      </div>
    </details>
  );
};

export default MyAcademyIntroTopicContent;
