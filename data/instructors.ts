export type InstructorCategory =
  | 'institutional'
  | 'communication'
  | 'journey'
  | 'luthiery'
  | 'gear'
  | 'maintenance'
  | 'harmony'
  | 'beginner'
  | 'theory'
  | 'practice'
  | 'rhythm'
  | 'earTraining'
  | 'rock'
  | 'metal'
  | 'blues'
  | 'jazz'
  | 'bass'
  | 'advanced';

export type AppLang = 'pt' | 'en';

export interface LocalizedText {
  pt: string;
  en: string;
}

export interface LocalizedList {
  pt: string[];
  en: string[];
}

export interface InstructorImageFit {
  scale?: number;
  x?: number;
  y?: number;
}

export interface InstructorProfile {
  id: string;
  name: string;
  title: LocalizedText;
  shortDescription: LocalizedText;
  longDescription: LocalizedText;
  personality: LocalizedList;
  strengths: LocalizedList;
  categories: InstructorCategory[];
  relatedModules: LocalizedList;
  unlockLabel: LocalizedText;
  cardImage: string;
  /** Optional hero/profile image for the individual architect page (e.g. character with instrument or in practice). Falls back to cardImage when absent. */
  heroImage?: string;
  quote: LocalizedText;
  imageFit?: InstructorImageFit;
}

export const instructorCategoryLabels: Record<AppLang, Record<InstructorCategory, string>> = {
  pt: {
    institutional: 'Institucional',
    communication: 'Comunicação',
    journey: 'Jornada',
    luthiery: 'Luthieria',
    gear: 'Equipamentos',
    maintenance: 'Manutenção',
    harmony: 'Harmonia',
    beginner: 'Iniciantes',
    theory: 'Teoria',
    practice: 'Prática',
    rhythm: 'Ritmo',
    earTraining: 'Percepção',
    rock: 'Rock',
    metal: 'Metal',
    blues: 'Blues',
    jazz: 'Jazz',
    bass: 'Baixo & Bases',
    advanced: 'Avançado',
  },
  en: {
    institutional: 'Institutional',
    communication: 'Communication',
    journey: 'Journey',
    luthiery: 'Luthiery',
    gear: 'Gear',
    maintenance: 'Maintenance',
    harmony: 'Harmony',
    beginner: 'Beginners',
    theory: 'Theory',
    practice: 'Practice',
    rhythm: 'Rhythm',
    earTraining: 'Ear Training',
    rock: 'Rock',
    metal: 'Metal',
    blues: 'Blues',
    jazz: 'Jazz',
    bass: 'Bass & Foundations',
    advanced: 'Advanced',
  },
};

export const getInstructorCategoryLabel = (category: InstructorCategory, lang: AppLang): string =>
  instructorCategoryLabels[lang][category];

const instructorCardPath = (id: string) => `/instructors/1000/${id}-card-instructor.webp`;
const instructorProfilePath = (id: string) => `/instructors/1400/${id}-profile.webp`;

export const instructors: InstructorProfile[] = [
  {
    id: 'alice',
    name: 'Alice',
    title: { pt: 'Primeiros Passos', en: 'First Steps' },
    shortDescription: {
      pt: 'Acolhe quem está começando e transforma os primeiros contatos com a música em uma experiência leve e sem intimidação.',
      en: 'Welcomes beginners and turns first contact with music into a light, judgment-free experience.',
    },
    longDescription: {
      pt: 'Alice conduz o início da jornada musical com calma e clareza. Sua trilha é pensada para quem nunca tocou ou está retomando o instrumento, priorizando confiança antes de complexidade — cada conceito é apresentado no seu tempo certo.',
      en: 'Alice guides the start of the musical journey with calm and clarity. Her track is designed for those who have never played or are returning to the instrument, prioritizing confidence before complexity — every concept is introduced at just the right pace.',
    },
    personality: { pt: ['Acolhedora', 'Paciente', 'Didática'], en: ['Welcoming', 'Patient', 'Didactic'] },
    strengths: {
      pt: ['Primeiros contatos com o instrumento', 'Redução da intimidação inicial', 'Explicações simples e diretas'],
      en: ['First contact with the instrument', 'Reducing early intimidation', 'Simple, direct explanations'],
    },
    categories: ['beginner', 'practice'],
    relatedModules: { pt: ['Kids', 'Aprender'], en: ['Kids', 'Learn'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('alice'),
    heroImage: instructorProfilePath('alice'),
    quote: {
      pt: 'Todo mundo começa do mesmo lugar: pelo primeiro som.',
      en: 'Everyone starts in the same place: with the first sound.',
    },
  },
  {
    id: 'arthur',
    name: 'Arthur',
    title: { pt: 'Fundamentos e Teoria', en: 'Foundations and Theory' },
    shortDescription: {
      pt: 'Organiza a teoria musical em uma lógica clara, transformando regras soltas em uma estrutura que faz sentido.',
      en: "Organizes music theory into clear logic, turning loose rules into a structure that makes sense.",
    },
    longDescription: {
      pt: 'Arthur acredita que teoria bem explicada não trava o músico — liberta. Ele guia o estudante pelos fundamentos da música com uma abordagem estruturada, conectando cada conceito teórico a uma aplicação prática no braço do instrumento.',
      en: "Arthur believes that well-explained theory doesn't hold musicians back — it sets them free. He guides students through the fundamentals of music with a structured approach, connecting every theoretical concept to a practical application on the fretboard.",
    },
    personality: { pt: ['Metódico', 'Claro', 'Lógico'], en: ['Methodical', 'Clear', 'Logical'] },
    strengths: {
      pt: ['Fundamentos musicais', 'Organização de conceitos', 'Lógica por trás da teoria'],
      en: ['Musical fundamentals', 'Organizing concepts', 'The logic behind theory'],
    },
    categories: ['beginner', 'theory'],
    relatedModules: { pt: ['Aprender', 'Ciclo Harmônico'], en: ['Learn', 'Harmonic Cycle'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('arthur'),
    heroImage: instructorProfilePath('arthur'),
    quote: {
      pt: 'Teoria não é obstáculo. É o mapa que você usa para não se perder.',
      en: "Theory isn't an obstacle. It's the map you use so you don't get lost.",
    },
  },
  {
    id: 'bill',
    name: 'Bill',
    title: { pt: 'Blues e Feeling', en: 'Blues and Feeling' },
    shortDescription: {
      pt: 'Ensina blues e fraseado com foco em expressão — tocar com intenção, não apenas repetir escalas.',
      en: 'Teaches blues and phrasing with a focus on expression — playing with intention, not just repeating scales.',
    },
    longDescription: {
      pt: 'Bill trabalha a improvisação a partir do sentimento por trás de cada nota. Sua trilha explora o blues como linguagem: frases, bends, dinâmica e respiração musical, sempre incentivando o estudante a tocar aquilo que realmente quer dizer.',
      en: 'Bill works on improvisation from the feeling behind each note. His track explores the blues as a language: phrasing, bends, dynamics and musical breathing, always encouraging students to play what they truly want to say.',
    },
    personality: { pt: ['Expressivo', 'Intuitivo', 'Caloroso'], en: ['Expressive', 'Intuitive', 'Warm'] },
    strengths: {
      pt: ['Fraseado com intenção', 'Improvisação', 'Expressividade no toque'],
      en: ['Phrasing with intention', 'Improvisation', 'Expressiveness in playing'],
    },
    categories: ['blues', 'practice'],
    relatedModules: { pt: ['Praticar', 'Acordes'], en: ['Practice', 'Chords'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('bill'),
    heroImage: instructorProfilePath('bill'),
    quote: {
      pt: 'Uma nota bem sentida vale mais que dez notas apressadas.',
      en: 'One deeply felt note is worth more than ten rushed ones.',
    },
  },
  {
    id: 'clara',
    name: 'Clara',
    title: { pt: 'Método e Organização', en: 'Method and Organization' },
    shortDescription: {
      pt: 'Transforma estudo disperso em rotina — disciplina e método para quem quer evoluir de forma consistente.',
      en: 'Turns scattered study into routine — discipline and method for those who want to progress consistently.',
    },
    longDescription: {
      pt: 'Clara ajuda o estudante a construir uma rotina de estudo real: metas pequenas, revisão constante e progresso mensurável. Sua trilha combina fundamentos, teoria leve e prática guiada em uma estrutura fácil de manter no dia a dia.',
      en: "Clara helps students build a real study routine: small goals, constant review and measurable progress. Her track combines fundamentals, light theory and guided practice into a structure that's easy to maintain day to day.",
    },
    personality: { pt: ['Organizada', 'Disciplinada', 'Encorajadora'], en: ['Organized', 'Disciplined', 'Encouraging'] },
    strengths: {
      pt: ['Rotina de estudo', 'Organização de metas', 'Consistência ao longo do tempo'],
      en: ['Study routine', 'Goal organization', 'Consistency over time'],
    },
    categories: ['beginner', 'theory', 'practice'],
    relatedModules: { pt: ['Praticar', 'Aprender'], en: ['Practice', 'Learn'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('clara'),
    heroImage: instructorProfilePath('clara'),
    quote: {
      pt: 'Progresso não é sobre intensidade. É sobre continuar.',
      en: "Progress isn't about intensity. It's about continuing.",
    },
  },
  {
    id: 'dean',
    name: 'Dean',
    title: { pt: 'Rock e Riffs', en: 'Rock and Riffs' },
    shortDescription: {
      pt: 'Especialista em riffs e repertório de rock, focado em construir a linguagem do estilo na prática.',
      en: "A riffs and rock repertoire specialist, focused on building the style's language through practice.",
    },
    longDescription: {
      pt: 'Dean guia o estudante pelo vocabulário do rock: riffs marcantes, power chords, dinâmica de banda e repertório reconhecível. Sua trilha equilibra técnica com atitude, sempre trazendo música real como referência.',
      en: "Dean guides students through the vocabulary of rock: memorable riffs, power chords, band dynamics and recognizable repertoire. His track balances technique with attitude, always bringing real music in as a reference.",
    },
    personality: { pt: ['Direto', 'Energético', 'Objetivo'], en: ['Direct', 'Energetic', 'Objective'] },
    strengths: {
      pt: ['Riffs de rock', 'Repertório', 'Linguagem do estilo'],
      en: ['Rock riffs', 'Repertoire', 'The language of the style'],
    },
    categories: ['rock', 'practice'],
    relatedModules: { pt: ['Praticar', 'Acordes'], en: ['Practice', 'Chords'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('dean'),
    heroImage: instructorProfilePath('dean'),
    quote: {
      pt: 'Um bom riff diz tudo antes mesmo do vocal entrar.',
      en: "A good riff says it all before the vocals even come in.",
    },
  },
  {
    id: 'diana',
    name: 'Diana',
    title: { pt: 'Embaixadora do GA', en: 'GA Ambassador' },
    shortDescription: {
      pt: 'Porta-voz virtual do GA, apresenta a jornada, comunica novidades e conecta o usuário aos ambientes do ecossistema.',
      en: "GA's virtual spokesperson, introducing the journey, sharing updates, and connecting users to the ecosystem's environments.",
    },
    longDescription: {
      pt: 'Diana é a Embaixadora do GA. Ela apresenta o ecossistema, conecta Kids, Teens, Studio e os Arquitetos Musicais, comunica novidades e ajuda o usuário a entender como teoria, prática e percepção se transformam em uma construção musical estruturada. Sua presença representa a visão institucional do GA: aprender música com direção, identidade e progressão.',
      en: 'Diana is the GA Ambassador. She introduces the ecosystem, connects Kids, Teens, Studio and the Music Architects, shares updates, and helps users understand how theory, practice and ear training come together into a structured musical journey. Her presence represents GA\'s institutional vision: learning music with direction, identity and progression.',
    },
    personality: { pt: ['Acolhedora', 'Motivadora', 'Estratégica'], en: ['Welcoming', 'Motivating', 'Strategic'] },
    strengths: {
      pt: ['Apresentação da jornada', 'Comunicação institucional', 'Conexão entre ambientes do ecossistema'],
      en: ['Introducing the journey', 'Institutional communication', 'Connecting ecosystem environments'],
    },
    categories: ['institutional', 'communication', 'journey'],
    relatedModules: { pt: ['Ecossistema', 'Kids', 'Teens', 'Studio'], en: ['Ecosystem', 'Kids', 'Teens', 'Studio'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('diana'),
    heroImage: instructorProfilePath('diana'),
    quote: {
      pt: 'Uma boa jornada musical não começa no improviso. Ela começa com direção.',
      en: "A good musical journey doesn't start with improvisation. It starts with direction.",
    },
  },
  {
    id: 'erika',
    name: 'Erika',
    title: { pt: 'Baixo & Bases', en: 'Bass & Foundations' },
    shortDescription: {
      pt: 'Mostra como o baixo sustenta a harmonia — tônicas, condução e a base que segura toda a música.',
      en: 'Shows how bass supports harmony — roots, voice leading and the foundation that holds all music together.',
    },
    longDescription: {
      pt: 'Erika trabalha o baixo como elemento estrutural da música: como as tônicas se conectam à harmonia, como a condução de linhas cria movimento, e como a base sustenta tudo o que acontece por cima dela.',
      en: 'Erika treats bass as a structural element of music: how roots connect to harmony, how voice leading creates movement, and how the foundation supports everything happening above it.',
    },
    personality: { pt: ['Firme', 'Estruturada', 'Precisa'], en: ['Steady', 'Structured', 'Precise'] },
    strengths: {
      pt: ['Condução harmônica', 'Fundamentos do baixo', 'Base musical sólida'],
      en: ['Harmonic guidance', 'Bass fundamentals', 'A solid musical foundation'],
    },
    categories: ['bass', 'rhythm'],
    relatedModules: { pt: ['Praticar', 'Ciclo Harmônico'], en: ['Practice', 'Harmonic Cycle'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('erika'),
    heroImage: instructorProfilePath('erika'),
    quote: {
      pt: 'A base não aparece — ela sustenta tudo o que aparece.',
      en: "The foundation doesn't show — it holds up everything that does.",
    },
  },
  {
    id: 'fred',
    name: 'Fred',
    title: { pt: 'Arquitetura do Braço', en: 'Fretboard Architecture' },
    shortDescription: {
      pt: 'Visualiza harmonia e estrutura musical diretamente no braço do instrumento, como um mapa.',
      en: 'Visualizes harmony and musical structure directly on the fretboard, like a map.',
    },
    longDescription: {
      pt: 'Fred é o arquiteto da visualização: ele conecta teoria e harmonia a mapas visuais do braço, mostrando como acordes, escalas e intervalos se organizam espacialmente. Sua trilha é ideal para quem já entende o básico e quer enxergar o instrumento como estrutura.',
      en: 'Fred is the architect of visualization: he connects theory and harmony to visual maps of the fretboard, showing how chords, scales and intervals are organized spatially. His track is ideal for those who already understand the basics and want to see the instrument as structure.',
    },
    personality: { pt: ['Analítico', 'Visual', 'Estruturado'], en: ['Analytical', 'Visual', 'Structured'] },
    strengths: {
      pt: ['Visualização do braço', 'Harmonia aplicada', 'Estrutura musical'],
      en: ['Fretboard visualization', 'Applied harmony', 'Musical structure'],
    },
    categories: ['theory', 'advanced'],
    relatedModules: { pt: ['Tríades e Tétrades', 'Ciclo Harmônico'], en: ['Triads and Tetrads', 'Harmonic Cycle'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('fred'),
    heroImage: instructorProfilePath('fred'),
    quote: {
      pt: 'Todo acorde tem uma planta baixa. Basta aprender a lê-la.',
      en: 'Every chord has a blueprint. You just need to learn how to read it.',
    },
  },
  {
    id: 'hiroshi',
    name: 'Hiroshi',
    title: { pt: 'Precisão e Técnica', en: 'Precision and Technique' },
    shortDescription: {
      pt: 'Foca em técnica e estudo metódico, priorizando precisão antes de velocidade.',
      en: 'Focuses on technique and methodical study, prioritizing precision before speed.',
    },
    longDescription: {
      pt: 'Hiroshi acredita que técnica sólida vem de repetição consciente, não de pressa. Sua trilha trabalha precisão de movimento, controle e estudo metódico, preparando o estudante para desafios técnicos mais avançados.',
      en: "Hiroshi believes solid technique comes from conscious repetition, not haste. His track works on movement precision, control and methodical study, preparing students for more advanced technical challenges.",
    },
    personality: { pt: ['Preciso', 'Disciplinado', 'Detalhista'], en: ['Precise', 'Disciplined', 'Detail-oriented'] },
    strengths: {
      pt: ['Técnica apurada', 'Estudo metódico', 'Controle de movimento'],
      en: ['Refined technique', 'Methodical study', 'Movement control'],
    },
    categories: ['theory', 'practice', 'advanced'],
    relatedModules: { pt: ['Praticar', 'CAGED'], en: ['Practice', 'CAGED'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('hiroshi'),
    heroImage: instructorProfilePath('hiroshi'),
    quote: {
      pt: 'Precisão primeiro. Velocidade é consequência.',
      en: 'Precision first. Speed follows.',
    },
  },
  {
    id: 'jax',
    name: 'Jax',
    title: { pt: 'Rock Moderno', en: 'Modern Rock' },
    shortDescription: {
      pt: 'Explora performance, timbre e riffs modernos com uma abordagem contemporânea do rock.',
      en: 'Explores performance, tone and modern riffs with a contemporary take on rock.',
    },
    longDescription: {
      pt: 'Jax conecta técnica a performance: como um riff soa em contexto de banda, como o timbre molda a intenção musical e como o rock moderno reinterpreta a tradição do estilo. Sua trilha é voltada a quem já toca e quer refinar presença e som.',
      en: "Jax connects technique to performance: how a riff sounds in a band context, how tone shapes musical intent, and how modern rock reinterprets the style's tradition. His track is aimed at those who already play and want to refine their presence and sound.",
    },
    personality: { pt: ['Moderno', 'Confiante', 'Criativo'], en: ['Modern', 'Confident', 'Creative'] },
    strengths: {
      pt: ['Performance', 'Timbre e sonoridade', 'Riffs contemporâneos'],
      en: ['Performance', 'Tone and sound', 'Contemporary riffs'],
    },
    categories: ['rock', 'practice'],
    relatedModules: { pt: ['Praticar', 'Acordes'], en: ['Practice', 'Chords'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('jax'),
    heroImage: instructorProfilePath('jax'),
    quote: {
      pt: 'O riff certo não é só tocado — é sentido no peito.',
      en: "The right riff isn't just played — it's felt in the chest.",
    },
  },
  {
    id: 'juan',
    name: 'Juan',
    title: { pt: 'Baixo e Ritmo', en: 'Bass and Rhythm' },
    shortDescription: {
      pt: 'Trabalha groove, pulso e fundamentos rítmicos a partir do baixo.',
      en: 'Works on groove, pulse and rhythmic fundamentals from the bass.',
    },
    longDescription: {
      pt: 'Juan une baixo e ritmo em uma só trilha: pulso constante, groove que sustenta a banda e fundamentos rítmicos que se aplicam a qualquer estilo. Ideal para quem quer tocar com mais consistência e menos esforço.',
      en: 'Juan brings bass and rhythm together in one track: a steady pulse, groove that holds the band together, and rhythmic fundamentals that apply to any style. Ideal for those who want to play with more consistency and less effort.',
    },
    personality: { pt: ['Rítmico', 'Constante', 'Groovy'], en: ['Rhythmic', 'Steady', 'Groovy'] },
    strengths: {
      pt: ['Groove', 'Pulso rítmico', 'Fundamentos do baixo'],
      en: ['Groove', 'Rhythmic pulse', 'Bass fundamentals'],
    },
    categories: ['bass', 'rhythm'],
    relatedModules: { pt: ['Praticar', 'Radar de Intervalos'], en: ['Practice', 'Interval Radar'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('juan'),
    heroImage: instructorProfilePath('juan'),
    quote: {
      pt: 'Groove não se força. Se sente e se repete.',
      en: "Groove isn't forced. It's felt and repeated.",
    },
  },
  {
    id: 'kael',
    name: 'Kael',
    title: { pt: 'Metal e Técnica Pesada', en: 'Metal and Heavy Technique' },
    shortDescription: {
      pt: 'Especialista em metal, palhetada e riffs pesados, com foco em intensidade e precisão.',
      en: 'A metal specialist in picking and heavy riffs, focused on intensity and precision.',
    },
    longDescription: {
      pt: 'Kael conduz o estudante pelo universo do metal: palhetada alternada, riffs pesados, dinâmica de intensidade e técnica de alta exigência. Sua trilha é voltada a quem busca desafio técnico real.',
      en: 'Kael guides students through the world of metal: alternate picking, heavy riffs, intensity dynamics and highly demanding technique. His track is aimed at those seeking a real technical challenge.',
    },
    personality: { pt: ['Intenso', 'Exigente', 'Focado'], en: ['Intense', 'Demanding', 'Focused'] },
    strengths: {
      pt: ['Palhetada e técnica pesada', 'Riffs de metal', 'Intensidade controlada'],
      en: ['Picking and heavy technique', 'Metal riffs', 'Controlled intensity'],
    },
    categories: ['metal', 'advanced'],
    relatedModules: { pt: ['Praticar', 'CAGED'], en: ['Practice', 'CAGED'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('kael'),
    heroImage: instructorProfilePath('kael'),
    quote: {
      pt: 'Intensidade sem controle é ruído. Com técnica, é impacto.',
      en: "Intensity without control is noise. With technique, it's impact.",
    },
  },
  {
    id: 'leo',
    name: 'Leo',
    title: { pt: 'Repertório e Fundamentos', en: 'Repertoire and Fundamentals' },
    shortDescription: {
      pt: 'Constrói repertório e acompanhamento com uma trilha tranquila e sem pressão.',
      en: 'Builds repertoire and accompaniment with a calm, pressure-free track.',
    },
    longDescription: {
      pt: 'Leo foca em repertório real: músicas completas, acompanhamento e fundamentos aplicados na prática. Sua trilha é ideal para quem quer tocar músicas inteiras desde cedo, sem depender apenas de exercícios isolados.',
      en: 'Leo focuses on real repertoire: complete songs, accompaniment and fundamentals applied in practice. His track is ideal for those who want to play whole songs early on, without relying only on isolated exercises.',
    },
    personality: { pt: ['Tranquilo', 'Prático', 'Acessível'], en: ['Calm', 'Practical', 'Approachable'] },
    strengths: {
      pt: ['Repertório aplicado', 'Acompanhamento', 'Fundamentos na prática'],
      en: ['Applied repertoire', 'Accompaniment', 'Fundamentals in practice'],
    },
    categories: ['beginner', 'practice'],
    relatedModules: { pt: ['Aprender', 'Praticar'], en: ['Learn', 'Practice'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('leo'),
    heroImage: instructorProfilePath('leo'),
    quote: {
      pt: 'Aprender uma música inteira ensina mais do que dez exercícios soltos.',
      en: 'Learning one whole song teaches more than ten scattered exercises.',
    },
  },
  {
    id: 'mel',
    name: 'Mel',
    title: { pt: 'Percepção e Escuta', en: 'Ear Training and Listening' },
    shortDescription: {
      pt: 'Desenvolve ouvido, percepção de intervalos e escuta ativa como base do aprendizado musical.',
      en: 'Develops the ear, interval perception and active listening as the foundation of musical learning.',
    },
    longDescription: {
      pt: 'Mel trabalha a música pelo ouvido: reconhecimento de intervalos, percepção rítmica e escuta ativa. Sua trilha ajuda o estudante a identificar o que ouve antes mesmo de tocar, fortalecendo a conexão entre percepção e execução.',
      en: 'Mel approaches music through the ear: interval recognition, rhythmic perception and active listening. Her track helps students identify what they hear before they even play it, strengthening the connection between perception and execution.',
    },
    personality: { pt: ['Perceptiva', 'Atenta', 'Curiosa'], en: ['Perceptive', 'Attentive', 'Curious'] },
    strengths: {
      pt: ['Percepção de intervalos', 'Escuta ativa', 'Reconhecimento auditivo'],
      en: ['Interval perception', 'Active listening', 'Ear recognition'],
    },
    categories: ['earTraining', 'rhythm'],
    relatedModules: { pt: ['Radar de Intervalos', 'Praticar'], en: ['Interval Radar', 'Practice'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('mel'),
    heroImage: instructorProfilePath('mel'),
    quote: {
      pt: 'Antes de tocar a nota certa, é preciso ouvi-la de verdade.',
      en: 'Before playing the right note, you need to truly hear it.',
    },
  },
  {
    id: 'nina',
    name: 'Nina',
    title: { pt: 'Groove & Ritmo', en: 'Groove & Rhythm' },
    shortDescription: {
      pt: 'Explora levadas, síncope e groove com influência de funk, soul e ritmos brasileiros.',
      en: 'Explores grooves, syncopation and feel with influences from funk, soul and Brazilian rhythms.',
    },
    longDescription: {
      pt: 'Nina traz groove para o centro da prática: levadas sincopadas, funk, soul e ritmos brasileiros aplicados ao instrumento. Sua trilha ajuda o estudante a sair da rigidez métrica e tocar com balanço real.',
      en: 'Nina puts groove at the center of practice: syncopated grooves, funk, soul and Brazilian rhythms applied to the instrument. Her track helps students break out of metric rigidity and play with real swing.',
    },
    personality: { pt: ['Rítmica', 'Envolvente', 'Vibrante'], en: ['Rhythmic', 'Engaging', 'Vibrant'] },
    strengths: {
      pt: ['Groove e levadas', 'Síncope', 'Ritmos brasileiros'],
      en: ['Groove and feel', 'Syncopation', 'Brazilian rhythms'],
    },
    categories: ['rhythm', 'practice'],
    relatedModules: { pt: ['Praticar', 'Radar de Intervalos'], en: ['Practice', 'Interval Radar'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('nina'),
    heroImage: instructorProfilePath('nina'),
    quote: {
      pt: 'Ritmo bom é aquele que faz o corpo responder antes da mente.',
      en: 'Good rhythm is what makes the body respond before the mind.',
    },
  },
  {
    id: 'rick',
    name: 'Rick',
    title: { pt: 'Pegada e Ritmo', en: 'Feel and Rhythm' },
    shortDescription: {
      pt: 'Foca em ritmo corporal, pegada e prática diária consistente.',
      en: 'Focuses on body rhythm, feel and consistent daily practice.',
    },
    longDescription: {
      pt: 'Rick trabalha o ritmo como algo que se sente no corpo, não apenas se conta. Sua trilha incentiva prática diária, pegada firme e consistência rítmica, formando uma base sólida para qualquer estilo musical.',
      en: 'Rick treats rhythm as something felt in the body, not just counted. His track encourages daily practice, a firm feel and rhythmic consistency, building a solid foundation for any musical style.',
    },
    personality: { pt: ['Consistente', 'Firme', 'Disciplinado'], en: ['Consistent', 'Steady', 'Disciplined'] },
    strengths: {
      pt: ['Pegada rítmica', 'Prática diária', 'Consistência'],
      en: ['Rhythmic feel', 'Daily practice', 'Consistency'],
    },
    categories: ['rhythm', 'practice'],
    relatedModules: { pt: ['Praticar', 'Aprender'], en: ['Practice', 'Learn'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('rick'),
    heroImage: instructorProfilePath('rick'),
    quote: {
      pt: 'Ritmo se treina todo dia, um pouco de cada vez.',
      en: 'Rhythm is trained every day, a little at a time.',
    },
  },
  {
    id: 'roxie',
    name: 'Roxie',
    title: { pt: 'Rock Alternativo', en: 'Alternative Rock' },
    shortDescription: {
      pt: 'Traz atitude e criatividade do rock alternativo, com foco em riffs autorais e presença de palco.',
      en: 'Brings the attitude and creativity of alternative rock, with a focus on original riffs and stage presence.',
    },
    longDescription: {
      pt: 'Roxie estimula o estudante a criar sua própria voz musical: riffs alternativos, atitude de palco e criatividade aplicada. Sua trilha é voltada especialmente ao público Teens, unindo técnica e expressão pessoal.',
      en: 'Roxie encourages students to create their own musical voice: alternative riffs, stage attitude and applied creativity. Her track is aimed especially at the Teens audience, blending technique with personal expression.',
    },
    personality: { pt: ['Criativa', 'Autêntica', 'Ousada'], en: ['Creative', 'Authentic', 'Bold'] },
    strengths: {
      pt: ['Atitude e presença', 'Criatividade musical', 'Riffs alternativos'],
      en: ['Attitude and presence', 'Musical creativity', 'Alternative riffs'],
    },
    categories: ['rock', 'practice'],
    relatedModules: { pt: ['Teens', 'Praticar'], en: ['Teens', 'Practice'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('roxie'),
    heroImage: instructorProfilePath('roxie'),
    quote: {
      pt: 'Seu jeito de tocar também é sua assinatura.',
      en: 'Your way of playing is also your signature.',
    },
  },
  {
    id: 'sofia',
    name: 'Sofia',
    title: { pt: 'Acordes e Expressividade', en: 'Chords and Expressiveness' },
    shortDescription: {
      pt: 'Trabalha harmonia aplicada, acompanhamento e expressividade com foco em repertório.',
      en: 'Works on applied harmony, accompaniment and expressiveness with a focus on repertoire.',
    },
    longDescription: {
      pt: 'Sofia mostra como acordes vão muito além de shapes fixos: harmonia aplicada, condução harmônica, acompanhamento e articulação transformam o mesmo acorde em algo único. Sua trilha conecta a teoria a uma aplicação prática real no repertório.',
      en: 'Sofia shows how chords go far beyond fixed shapes: applied harmony, voice leading, accompaniment and articulation turn the same chord into something unique. Her track connects theory to a real practical application in repertoire.',
    },
    personality: { pt: ['Acolhedora', 'Clara', 'Expressiva'], en: ['Welcoming', 'Clear', 'Expressive'] },
    strengths: {
      pt: ['Harmonia aplicada ao repertório', 'Acordes e acompanhamento', 'Condução harmônica', 'Expressividade musical'],
      en: ['Harmony applied to repertoire', 'Chords and accompaniment', 'Harmonic voice leading', 'Musical expressiveness'],
    },
    categories: ['harmony', 'practice'],
    relatedModules: {
      pt: ['Acordes', 'Tríades e Tétrades', 'Studio', 'Praticar'],
      en: ['Chords', 'Triads and Tetrads', 'Studio', 'Practice'],
    },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('sofia'),
    heroImage: instructorProfilePath('sofia'),
    quote: {
      pt: 'Um bom acorde não é apenas uma forma no braço: é uma escolha de cor, movimento e expressão.',
      en: "A good chord isn't just a shape on the fretboard: it's a choice of color, movement and expression.",
    },
  },
  {
    id: 'tom',
    name: 'Tom',
    title: { pt: 'Luthieria e Setup', en: 'Luthiery and Setup' },
    shortDescription: {
      pt: 'Especialista em regulagem, conservação, manutenção e ajustes práticos para manter o instrumento confortável, estável e pronto para tocar.',
      en: 'A specialist in setup, upkeep, maintenance and practical adjustments to keep the instrument comfortable, stable and ready to play.',
    },
    longDescription: {
      pt: 'Tom cuida da parte física da jornada musical: instrumentos, regulagens, conservação, pequenos reparos, timbres e escolhas de equipamento. Sua função é ajudar o usuário a entender que tocar melhor também depende de um instrumento confortável, estável e bem cuidado.',
      en: 'Tom takes care of the physical side of the musical journey: instruments, setups, upkeep, minor repairs, tones and gear choices. His role is to help users understand that playing better also depends on a comfortable, stable and well cared-for instrument.',
    },
    personality: { pt: ['Descontraído', 'Direto', 'Acolhedor'], en: ['Laid-back', 'Direct', 'Welcoming'] },
    strengths: {
      pt: [
        'Regulagem básica e conforto do instrumento',
        'Conservação, limpeza e troca de cordas',
        'Timbres, captadores e equipamentos',
        'Customização e cultura de instrumentos',
      ],
      en: [
        'Basic setup and instrument comfort',
        'Upkeep, cleaning and string changes',
        'Tones, pickups and gear',
        'Instrument customization and culture',
      ],
    },
    categories: ['luthiery', 'gear', 'maintenance'],
    relatedModules: {
      pt: ['Custom Shop', 'Manutenção do Instrumento', 'Equipamentos e Timbres', 'EVH / Frankenstrat'],
      en: ['Custom Shop', 'Instrument Maintenance', 'Gear and Tones', 'EVH / Frankenstrat'],
    },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('tom'),
    heroImage: instructorProfilePath('tom'),
    quote: {
      pt: 'Instrumento bem cuidado responde melhor, afina melhor e inspira mais.',
      en: 'A well cared-for instrument responds better, tunes better and inspires more.',
    },
  },
  {
    id: 'victor',
    name: 'Victor',
    title: { pt: 'Jazz e Harmonia', en: 'Jazz and Harmony' },
    shortDescription: {
      pt: 'Explora acordes sofisticados, condução harmônica e a linguagem do jazz.',
      en: 'Explores sophisticated chords, voice leading and the language of jazz.',
    },
    longDescription: {
      pt: 'Victor conduz o estudante por harmonias mais sofisticadas: acordes estendidos, substituições e condução musical típicas do jazz. Sua trilha é voltada a quem já domina o básico e quer aprofundar a compreensão harmônica.',
      en: 'Victor guides students through more sophisticated harmony: extended chords, substitutions and musical voice leading typical of jazz. His track is aimed at those who already master the basics and want to deepen their harmonic understanding.',
    },
    personality: { pt: ['Sofisticado', 'Reflexivo', 'Refinado'], en: ['Sophisticated', 'Reflective', 'Refined'] },
    strengths: {
      pt: ['Harmonia avançada', 'Acordes sofisticados', 'Condução musical'],
      en: ['Advanced harmony', 'Sophisticated chords', 'Musical voice leading'],
    },
    categories: ['jazz', 'harmony', 'theory', 'advanced'],
    relatedModules: { pt: ['Ciclo Harmônico', 'Tríades e Tétrades'], en: ['Harmonic Cycle', 'Triads and Tetrads'] },
    unlockLabel: { pt: 'Mentoria em breve', en: 'Mentorship coming soon' },
    cardImage: instructorCardPath('victor'),
    heroImage: instructorProfilePath('victor'),
    quote: {
      pt: 'Harmonia sofisticada não é sobre complicar — é sobre enxergar mais opções.',
      en: "Sophisticated harmony isn't about complicating things — it's about seeing more options.",
    },
  },
];

export const getInstructorById = (id: string): InstructorProfile | undefined =>
  instructors.find(instructor => instructor.id === id);

export const instructorSpotlightGroups: string[][] = [
  ['diana', 'nina', 'victor', 'bill'],
  ['alice', 'rick', 'hiroshi', 'roxie'],
  ['erika', 'kael', 'mel', 'arthur'],
  ['sofia', 'juan', 'fred', 'dean'],
  ['clara', 'jax', 'leo', 'tom'],
];

export const getDailyInstructorSpotlightGroup = (date: Date = new Date()): InstructorProfile[] => {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
  const group = instructorSpotlightGroups[dayOfYear % instructorSpotlightGroups.length];
  return group
    .map(id => getInstructorById(id))
    .filter((instructor): instructor is InstructorProfile => Boolean(instructor));
};
