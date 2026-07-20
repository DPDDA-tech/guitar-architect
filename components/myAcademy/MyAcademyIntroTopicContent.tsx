import React from 'react';

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
};

const topic = (
  pt: TopicCopy,
  en: TopicCopy,
): { pt: TopicCopy; en: TopicCopy } => ({ pt, en });

const topicContent = {
  'M0-01-01': topic(
    {
      heading: 'Um mapa que conecta todo o ecossistema',
      paragraphs: [
        'O My Academy é a camada de orientação do Guitar Architect. Ele organiza assuntos, experiências, ferramentas e personagens em uma jornada compreensível, para que você saiba onde está, o que pode explorar e quais caminhos fazem sentido a partir dali.',
        'Kids, Teens e Studio continuam sendo ambientes independentes. O My Academy não os substitui: cria pontes entre eles e explica por que determinada atividade ou ferramenta pode ser útil em cada momento.',
      ],
      points: ['Kids favorece descoberta e curiosidade.', 'Teens aproxima descoberta, prática e desafios.', 'Studio oferece ferramentas de estudo e criação.', 'My Academy organiza essas possibilidades em uma jornada aberta.'],
      character: { name: 'Clara', image: '/instructors/1000/clara-card-instructor.webp', role: 'Guia da jornada', profilePath: '/instructors/clara' },
    },
    {
      heading: 'A map connecting the whole ecosystem',
      paragraphs: [
        'My Academy is Guitar Architect’s guidance layer. It organizes topics, experiences, tools and characters into an understandable journey, helping you see where you are, what you can explore and which paths may be useful from there.',
        'Kids, Teens and Studio remain independent environments. My Academy does not replace them: it creates bridges and explains why a certain activity or tool may be useful at each moment.',
      ],
      points: ['Kids supports discovery and curiosity.', 'Teens connects discovery, practice and challenges.', 'Studio provides study and creation tools.', 'My Academy organizes these possibilities into an open journey.'],
      character: { name: 'Clara', image: '/instructors/1000/clara-card-instructor.webp', role: 'Journey guide', profilePath: '/instructors/clara' },
    },
  ),
  'M0-01-02': topic(
    {
      heading: 'Direção sem transformar experiência em julgamento',
      paragraphs: [
        'O Guitar Architect pode explicar conceitos, propor experiências, apresentar ferramentas e organizar próximos passos. Essas sugestões partem do conteúdo disponível e das escolhas declaradas por você.',
        'O GA não observa sua execução física, não comprova domínio técnico e não transforma uma interação digital em diagnóstico musical. Por isso, não atribui aprovação, reprovação ou nível pessoal.',
      ],
      points: ['Sem notas ou ranking no My Academy.', 'Sem promessa de avaliação técnica automática.', 'Sem bloqueio do mapa por respostas ou pausas.', 'Com linguagem transparente sobre o que foi apenas declarado.'],
    },
    {
      heading: 'Direction without turning experience into judgement',
      paragraphs: [
        'Guitar Architect can explain concepts, propose experiences, present tools and organize possible next steps. Suggestions come from available content and choices explicitly declared by you.',
        'GA does not observe physical performance, verify technical mastery or turn a digital interaction into a musical diagnosis. It therefore does not assign approval, failure or a personal level.',
      ],
      points: ['No grades or My Academy ranking.', 'No promise of automatic technical assessment.', 'No map locks caused by answers or pauses.', 'Transparent language about declared information.'],
    },
  ),
  'M0-01-03': topic(
    {
      heading: 'Uma jornada orientada, mas nunca obrigatória',
      paragraphs: [
        'O My Academy pode destacar uma experiência como próximo passo, mas essa indicação não cria uma sequência obrigatória. Você continua livre para abrir o mapa completo, visitar outro território, repetir uma unidade, usar o Studio ou interromper a jornada.',
        'Revisar não significa retroceder, pular não significa falhar e explorar livremente não apaga o caminho sugerido.',
      ],
      points: ['Seguir uma sugestão quando ela fizer sentido.', 'Repetir para reencontrar uma ideia.', 'Revisar sem perder outras possibilidades.', 'Pular ou explorar livremente e retornar depois.'],
    },
    {
      heading: 'A guided journey that is never mandatory',
      paragraphs: [
        'My Academy may highlight an experience as a possible next step, but that suggestion does not create a mandatory sequence. You remain free to open the complete map, visit another territory, repeat a unit, use Studio or leave the journey.',
        'Reviewing does not mean moving backwards, skipping does not mean failing, and free exploration does not erase the suggested path.',
      ],
      points: ['Follow a suggestion when it is useful.', 'Repeat to revisit an idea.', 'Review without losing other possibilities.', 'Skip or explore freely and return later.'],
    },
  ),
  'M0-02-01': topic(
    {
      heading: 'Som e silêncio organizam a atenção',
      paragraphs: [
        'Som é uma vibração percebida; silêncio é a ausência relativa de um som que chama sua atenção. Na música, ambos têm função. Uma pausa pode separar ideias, criar expectativa ou dar espaço para que o som anterior seja compreendido.',
        'Antes de nomear notas ou ritmos, experimente perceber quando algo começa, quanto tempo permanece e quando termina.',
      ],
      points: ['Ouça o ambiente por alguns segundos.', 'Identifique um som contínuo e um som breve.', 'Perceba uma pausa entre dois acontecimentos.', 'Não há resposta avaliativa: o objetivo é notar.'],
      character: { name: 'Clara', image: '/instructors/1000/clara-card-instructor.webp', role: 'Convite à escuta', profilePath: '/instructors/clara' },
    },
    {
      heading: 'Sound and silence organize attention',
      paragraphs: [
        'Sound is a perceived vibration; silence is the relative absence of a sound calling your attention. In music, both have a function. A pause can separate ideas, build expectation or create space for the previous sound to be understood.',
        'Before naming notes or rhythms, notice when something begins, how long it remains and when it ends.',
      ],
      points: ['Listen to the environment for a few seconds.', 'Identify one continuous and one brief sound.', 'Notice a pause between two events.', 'There is no assessment: the goal is simply to notice.'],
      character: { name: 'Clara', image: '/instructors/1000/clara-card-instructor.webp', role: 'Listening invitation', profilePath: '/instructors/clara' },
    },
  ),
  'M0-02-02': topic(
    {
      heading: 'Quatro maneiras iniciais de descrever um som',
      paragraphs: [
        'Altura indica se percebemos um som como mais grave ou mais agudo. Duração indica quanto tempo ele permanece. Intensidade descreve a sensação de força ou volume. Timbre é o conjunto de características que nos permite distinguir fontes diferentes mesmo quando produzem alturas parecidas.',
        'Essas dimensões se combinam. Um mesmo som pode ser agudo, curto, suave e ter um timbre metálico.',
      ],
      points: ['Grave e agudo: altura.', 'Longo e curto: duração.', 'Forte e suave: intensidade.', 'A identidade da fonte sonora: timbre.'],
    },
    {
      heading: 'Four initial ways to describe a sound',
      paragraphs: [
        'Pitch describes whether a sound feels lower or higher. Duration describes how long it remains. Intensity describes perceived force or volume. Timbre is the set of qualities that lets us distinguish different sources even when they produce similar pitches.',
        'These dimensions combine. The same sound may be high, short, soft and metallic in timbre.',
      ],
      points: ['Low and high: pitch.', 'Long and short: duration.', 'Loud and soft: intensity.', 'The identity of the sound source: timbre.'],
    },
  ),
  'M0-02-03': topic(
    {
      heading: 'Você pode entrar pela escuta, pelo corpo ou pelo movimento',
      paragraphs: [
        'Algumas pessoas percebem primeiro pelo ouvido; outras compreendem melhor ao bater o pé, acompanhar com as mãos ou visualizar um movimento. Nenhuma dessas portas de entrada é inferior.',
        'O importante é reconhecer qual experiência torna a ideia mais clara e, depois, conectar essa percepção ao instrumento.',
      ],
      points: ['Escute sem tocar.', 'Marque uma pulsação com o corpo.', 'Observe o movimento que produz o som.', 'Compare qual abordagem tornou a ideia mais clara.'],
    },
    {
      heading: 'You may begin through listening, body or movement',
      paragraphs: [
        'Some people notice first through hearing; others understand better by tapping a foot, using their hands or visualizing movement. None of these entry points is inferior.',
        'What matters is recognizing which experience makes the idea clearer and then connecting that perception to the instrument.',
      ],
      points: ['Listen without playing.', 'Mark a pulse with your body.', 'Observe the movement producing the sound.', 'Compare which approach made the idea clearer.'],
    },
  ),
  'M0-03-01': topic(
    {
      heading: 'Reconheça o instrumento antes de exigir algo dele',
      paragraphs: [
        'Guitarra e baixo compartilham elementos: corpo, braço, cordas, captadores, controles e conexão de saída. O baixo geralmente trabalha em registro mais grave e costuma ter menos cordas, embora existam muitas variações.',
        'Neste primeiro contato, não é necessário memorizar modelos ou especificações. Basta localizar as partes principais e entender que cada uma participa da produção ou condução do som.',
      ],
      points: ['Corpo e braço formam a estrutura principal.', 'Cordas vibram e os captadores convertem essa vibração.', 'Controles alteram volume e características do sinal.', 'A saída conecta o instrumento ao restante do sistema.'],
      character: { name: 'Tom', image: '/instructors/1000/tom-card-instructor.webp', role: 'Luthieria e cuidado', profilePath: '/instructors/tom' },
    },
    {
      heading: 'Recognize the instrument before demanding anything from it',
      paragraphs: [
        'Guitar and bass share core elements: body, neck, strings, pickups, controls and output connection. Bass usually works in a lower register and often has fewer strings, although many variations exist.',
        'At this first contact, you do not need to memorize models or specifications. Locate the main parts and understand that each one participates in producing or carrying sound.',
      ],
      points: ['Body and neck form the main structure.', 'Strings vibrate and pickups convert that vibration.', 'Controls change volume and signal characteristics.', 'The output connects the instrument to the rest of the system.'],
      character: { name: 'Tom', image: '/instructors/1000/tom-card-instructor.webp', role: 'Luthiery and care', profilePath: '/instructors/tom' },
    },
  ),
  'M0-03-02': topic(
    {
      heading: 'O caminho básico do som',
      paragraphs: [
        'Ao tocar uma corda, ela vibra. Os captadores transformam essa vibração em sinal elétrico, que segue pelo circuito do instrumento, sai pelo cabo e chega a um amplificador, interface ou outro equipamento.',
        'Braço, casas e cordas ajudam a definir a altura produzida. Captadores, controles, cabos e equipamentos influenciam como o sinal chega aos seus ouvidos.',
      ],
      points: ['Cordas: origem da vibração.', 'Braço e casas: organização das alturas.', 'Captadores: conversão em sinal.', 'Cabo e equipamento: condução e reprodução.'],
      character: { name: 'Tom', image: '/instructors/1000/tom-card-instructor.webp', role: 'Especialista convidado', profilePath: '/instructors/tom' },
    },
    {
      heading: 'The basic signal path',
      paragraphs: [
        'When you play a string, it vibrates. Pickups turn that vibration into an electrical signal, which travels through the instrument circuit, leaves through the cable and reaches an amplifier, interface or other equipment.',
        'Neck, frets and strings help define pitch. Pickups, controls, cables and equipment influence how the signal reaches your ears.',
      ],
      points: ['Strings: source of vibration.', 'Neck and frets: pitch organization.', 'Pickups: signal conversion.', 'Cable and equipment: transmission and reproduction.'],
      character: { name: 'Tom', image: '/instructors/1000/tom-card-instructor.webp', role: 'Guest specialist', profilePath: '/instructors/tom' },
    },
  ),
  'M0-03-03': topic(
    {
      heading: 'Conforto e segurança vêm antes da insistência',
      paragraphs: [
        'Use a afinação como referência, mantenha volume confortável e faça pausas. Tensão leve decorrente de uma adaptação pode acontecer, mas dor persistente, aguda ou crescente não deve ser tratada como prova de esforço.',
        'Cabos devem ser conectados com cuidado e o volume pode ser reduzido antes de conectar ou desconectar equipamentos. Um instrumento estável e bem cuidado facilita a aprendizagem.',
      ],
      points: ['Confira a afinação sem transformar isso em cobrança.', 'Comece com volume baixo e confortável.', 'Faça pausas antes de perder concentração ou conforto.', 'Interrompa e procure orientação diante de dor relevante.'],
      character: { name: 'Tom', image: '/instructors/1000/tom-card-instructor.webp', role: 'Cuidado do instrumento', profilePath: '/instructors/tom' },
    },
    {
      heading: 'Comfort and safety come before persistence',
      paragraphs: [
        'Use tuning as a reference, keep volume comfortable and take breaks. Mild adaptation tension may occur, but persistent, sharp or increasing pain should not be treated as proof of effort.',
        'Connect cables carefully and reduce volume before connecting or disconnecting equipment. A stable, well cared-for instrument supports learning.',
      ],
      points: ['Check tuning without turning it into pressure.', 'Begin at a low, comfortable volume.', 'Pause before losing focus or comfort.', 'Stop and seek guidance when relevant pain appears.'],
      character: { name: 'Tom', image: '/instructors/1000/tom-card-instructor.webp', role: 'Instrument care', profilePath: '/instructors/tom' },
    },
  ),
  'M0-04-01': topic(
    {
      heading: 'O braço interativo é um mapa, não um teste',
      paragraphs: [
        'O Studio permite visualizar notas, intervalos, escalas, acordes e relações no braço. Nesta primeira exploração, o objetivo é compreender que uma indicação visual representa uma posição possível no instrumento real.',
        'Você pode abrir o braço, observar as cordas e casas e selecionar uma nota sem precisar memorizar ou executar nada.',
      ],
      points: ['Abra o Studio quando desejar.', 'Observe cordas e casas como coordenadas.', 'Selecione uma posição e veja sua identificação.', 'Retorne ao mapa sem obrigação de completar uma tarefa.'],
    },
    {
      heading: 'The interactive fretboard is a map, not a test',
      paragraphs: [
        'Studio lets you visualize notes, intervals, scales, chords and relationships across the fretboard. In this first exploration, the goal is to understand that a visual indication represents a possible position on the physical instrument.',
        'You may open the fretboard, observe strings and frets and select a note without memorizing or performing anything.',
      ],
      points: ['Open Studio whenever you wish.', 'Observe strings and frets as coordinates.', 'Select a position and see its identification.', 'Return to the map without completing a task.'],
    },
  ),
  'M0-04-02': topic(
    {
      heading: 'Experimente antes de procurar acerto',
      paragraphs: [
        'Toque uma corda, selecione uma posição no braço virtual, escute um som disponível ou apenas observe uma relação visual. O objetivo é estabelecer contato, não medir desempenho.',
        'Você pode repetir, alterar a ordem ou interromper. Uma primeira exploração bem-sucedida é aquela que desperta uma pergunta ou torna algum elemento menos estranho.',
      ],
      points: ['Escolha uma única ação simples.', 'Observe o que mudou quando você interagiu.', 'Repita somente se houver curiosidade.', 'Registre uma percepção, não uma nota.'],
    },
    {
      heading: 'Experiment before looking for correctness',
      paragraphs: [
        'Play a string, select a position on the virtual fretboard, listen to an available sound or simply observe a visual relationship. The goal is contact, not performance measurement.',
        'You may repeat, change the order or stop. A successful first exploration is one that creates a question or makes something feel less unfamiliar.',
      ],
      points: ['Choose one simple action.', 'Notice what changed when you interacted.', 'Repeat only when curiosity remains.', 'Record a perception, not a grade.'],
    },
  ),
  'M0-04-03': topic(
    {
      heading: 'Escolha conscientemente o próximo ponto',
      paragraphs: [
        'Depois da primeira exploração, você pode seguir a sugestão apresentada em “Onde estou agora”, abrir o mapa completo ou entrar livremente em outro ambiente. Nenhuma dessas escolhas invalida as demais.',
        'Alice pode acompanhar uma abordagem mais contemplativa e explicada; Arthur pode acrescentar pequenos desafios e impulso. A escolha é reversível e não altera o currículo.',
      ],
      points: ['Seguir a sugestão atual.', 'Abrir o mapa e escolher outro território.', 'Explorar o Studio livremente.', 'Escolher Alice, Arthur ou continuar sem acompanhante.'],
      character: { name: 'Alice e Arthur', image: '/instructors/1000/alice-card-instructor.webp', role: 'Acompanhamento opcional' },
    },
    {
      heading: 'Choose the next point deliberately',
      paragraphs: [
        'After the first exploration, you may follow the suggestion shown in “Where I am now”, open the complete map or freely enter another environment. None of these choices invalidates the others.',
        'Alice may accompany a more reflective and explained approach; Arthur may add small challenges and momentum. The choice is reversible and does not change the curriculum.',
      ],
      points: ['Follow the current suggestion.', 'Open the map and choose another territory.', 'Explore Studio freely.', 'Choose Alice, Arthur or continue without a companion.'],
      character: { name: 'Alice and Arthur', image: '/instructors/1000/alice-card-instructor.webp', role: 'Optional companions' },
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
                <a href={content.character.profilePath} className="mt-1 inline-flex text-xs font-bold text-cyan-300 hover:text-cyan-200">
                  {isPt ? 'Conhecer personagem' : 'Meet character'}
                </a>
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
      </div>
    </details>
  );
};

export default MyAcademyIntroTopicContent;
