export type LearnModuleCategory =
  | 'theory'
  | 'practice'
  | 'tool'
  | 'fretboard'
  | 'harmony'
  | 'technique';

export type LearnActionType =
  | 'pendingFretboardAction'
  | 'navigate'
  | 'openTool'
  | 'startPractice';

export interface LearnAction {
  id: string;
  label: string;
  description?: string;
  type: LearnActionType;
  payload?: unknown;
  href?: string;
}

export interface LearnBlock {
  id: string;
  eyebrow: string;
  title?: string;
  body: string;
  examples?: string[];
}

export interface LearnModule {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  category: LearnModuleCategory;
  status?: 'active' | 'completed' | 'available';
  blocks: LearnBlock[];
  actions: LearnAction[];
  relatedTools?: LearnAction[];
}

const fretboardAction = (
  action: 'scale' | 'field' | 'triads' | 'progression',
  root: string,
  scaleType: string,
  extra: Record<string, unknown> = {},
) => ({
  source: 'study-module',
  action,
  root,
  displayRoot: root,
  scaleType,
  forceNewDiagram: true,
  ...extra,
});

const openToolAction = (tool: 'tuner' | 'metronome' | 'intervals' | 'exercises' | 'changes') => ({
  source: 'study-module',
  action: 'openTool',
  tool,
});

const startPracticeAction = (
  root = 'C',
  scaleType = 'Major (Ionian)',
  bpm = 80,
  extra: Record<string, unknown> = {},
) => ({
  source: 'study-module',
  action: 'startPractice',
  root,
  displayRoot: root,
  scaleType,
  bpm,
  tool: 'exercises',
  ...extra,
});

export const LEARN_MODULES: LearnModule[] = [
  {
    id: 'instrument-first-steps',
    order: 1,
    title: 'Primeiros passos no instrumento',
    subtitle: 'Entenda cordas, casas, notas e orientação no braço.',
    category: 'fretboard',
    status: 'active',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'O braço é uma grade musical. Cordas, casas e afinação determinam onde cada nota aparece.',
      },
      {
        id: 'in-ga',
        eyebrow: 'No Guitar Architect',
        body: 'Use o fretboard para visualizar notas, tônicas, oitavas e regiões equivalentes sem perder o instrumento e a afinação atuais.',
      },
      {
        id: 'fretboard',
        eyebrow: 'Aplicação no braço',
        body: 'Comece localizando a tônica, depois observe como a mesma nota reaparece em oitavas e regiões diferentes.',
        examples: ['C na 5ª corda, casa 3', 'C na 2ª corda, casa 1', 'C na 1ª corda, casa 8'],
      },
    ],
    actions: [
      { id: 'show-notes', label: 'Mostrar notas no braço', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)') },
      { id: 'show-octaves', label: 'Mostrar oitavas', type: 'openTool', payload: openToolAction('intervals') },
      { id: 'back-fretboard', label: 'Voltar ao fretboard', type: 'navigate', href: '/' },
    ],
    relatedTools: [
      { id: 'tool-fretboard', label: 'Fretboard', description: 'Visualização principal do instrumento.', type: 'navigate', href: '/' },
      { id: 'tool-intervals', label: 'Intervalos', description: 'Localize distâncias e oitavas.', type: 'openTool', payload: openToolAction('intervals') },
    ],
  },
  {
    id: 'tuning-pulse-preparation',
    order: 2,
    title: 'Afinação, pulso e preparação',
    subtitle: 'Use afinador e metrônomo antes de estudar.',
    category: 'tool',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Antes de estudar escalas e acordes, o instrumento precisa estar afinado e o estudo precisa ter pulso.',
      },
      {
        id: 'in-ga',
        eyebrow: 'No Guitar Architect',
        body: 'O afinador ajuda a preparar o instrumento. O metrônomo organiza o tempo e prepara exercícios com BPM.',
      },
      {
        id: 'routine',
        eyebrow: 'Rotina curta',
        body: 'Afine, defina o BPM e pratique uma sequência pequena antes de aumentar velocidade ou complexidade.',
        examples: ['Afinar cordas soltas', 'Metrônomo em 80 BPM', 'Tocar escala em semínimas'],
      },
    ],
    actions: [
      { id: 'open-tuner', label: 'Abrir afinador', type: 'openTool', payload: openToolAction('tuner') },
      { id: 'open-metronome', label: 'Abrir metrônomo', type: 'openTool', payload: openToolAction('metronome') },
      { id: 'start-bpm', label: 'Iniciar prática com BPM', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 80) },
    ],
    relatedTools: [
      { id: 'tool-tuner', label: 'Afinador', description: 'Prepare a afinação antes do estudo.', type: 'openTool', payload: openToolAction('tuner') },
      { id: 'tool-metronome', label: 'Metrônomo', description: 'Estude com pulso e BPM.', type: 'openTool', payload: openToolAction('metronome') },
    ],
  },
  {
    id: 'intervals-location',
    order: 3,
    title: 'Intervalos e localização no braço',
    subtitle: 'Cada casa é um semitom; cada distância tem função musical.',
    category: 'theory',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Intervalos representam a distância entre duas notas. Cada casa equivale a um semitom.',
        examples: ['C -> D = 2ª maior', 'C -> E = 3ª maior', 'C -> G = 5ª justa'],
      },
      {
        id: 'in-ga',
        eyebrow: 'No Guitar Architect',
        body: 'Use labels de intervalo e ferramentas de prática para transformar desenhos em relações musicais claras.',
      },
      {
        id: 'fretboard',
        eyebrow: 'Aplicação no braço',
        body: 'Semitom = 1 casa. Tom = 2 casas. Oitavas repetem padrões e ajudam a navegar sem depender de shapes isolados.',
      },
    ],
    actions: [
      { id: 'show-intervals', label: 'Mostrar intervalos', type: 'openTool', payload: openToolAction('intervals') },
      { id: 'apply-c', label: 'Aplicar em C', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)') },
      { id: 'show-octaves', label: 'Mostrar oitavas', type: 'openTool', payload: openToolAction('intervals') },
    ],
    relatedTools: [
      { id: 'tool-intervals', label: 'Intervalos', description: 'Treine distância e percepção espacial.', type: 'openTool', payload: openToolAction('intervals') },
      { id: 'tool-fretboard', label: 'Fretboard', description: 'Aplique a tônica e visualize no braço.', type: 'navigate', href: '/' },
    ],
  },
  {
    id: 'scales-patterns',
    order: 4,
    title: 'Escalas e padrões melódicos',
    subtitle: 'Escalas são mapas de notas em torno de uma tônica.',
    category: 'fretboard',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Escalas são conjuntos organizados de notas em torno de uma tônica. Elas criam caminhos melódicos, regiões e notas-alvo.',
        examples: ['C maior = C D E F G A B', 'A menor natural = A B C D E F G', 'D dórico = D E F G A B C'],
      },
      {
        id: 'in-ga',
        eyebrow: 'No Guitar Architect',
        body: 'Aplique tônica e escala no fretboard para enxergar graus, repetir padrões e conectar regiões.',
      },
      {
        id: 'fretboard',
        eyebrow: 'Aplicação no braço',
        body: 'Comece pela tônica, conecte oitavas e depois crie frases pequenas entre regiões vizinhas.',
      },
    ],
    actions: [
      { id: 'apply-major', label: 'Aplicar escala maior', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)') },
      { id: 'apply-minor', label: 'Aplicar menor natural', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'A', 'Natural Minor (Aeolian)') },
      { id: 'connect-regions', label: 'Conectar regiões', type: 'openTool', payload: openToolAction('intervals') },
    ],
    relatedTools: [
      { id: 'tool-scale', label: 'Aplicar escala', description: 'Mostra notas e tônica no braço.', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)') },
      { id: 'tool-metronome', label: 'Metrônomo', description: 'Transforme visualização em prática no tempo.', type: 'openTool', payload: openToolAction('metronome') },
    ],
  },
  {
    id: 'scale-bpm-practice',
    order: 5,
    title: 'Tocar escalas no BPM',
    subtitle: 'Pratique escala com metrônomo e reprodução visual no fretboard.',
    category: 'practice',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Estudar escala não é apenas visualizar notas. É tocar no tempo, com direção, repetição e controle.',
      },
      {
        id: 'in-ga',
        eyebrow: 'No Guitar Architect',
        body: 'Use o exercício de escala no BPM para ouvir e ver a sequência de notas no fretboard com metrônomo.',
      },
      {
        id: 'practice',
        eyebrow: 'Prática orientada',
        body: 'Comece lento, mantenha o som regular e avance apenas quando a sequência soar limpa.',
        examples: ['C maior em 80 BPM', 'Subir e descer a escala', 'Pausar, corrigir e repetir'],
      },
    ],
    actions: [
      { id: 'start-scale-bpm', label: 'Iniciar exercício de escala no BPM', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 80) },
      { id: 'open-metronome', label: 'Abrir metrônomo', type: 'openTool', payload: openToolAction('metronome') },
      { id: 'apply-scale', label: 'Aplicar escala no braço', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)') },
    ],
    relatedTools: [
      { id: 'tool-exercises', label: 'Exercícios', description: 'Sequência visual e prática no tempo.', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 80) },
      { id: 'tool-metronome', label: 'Metrônomo', description: 'Controle de pulso e BPM.', type: 'openTool', payload: openToolAction('metronome') },
    ],
  },
  {
    id: 'chords-triads-tetrads',
    order: 6,
    title: 'Acordes, tríades e tétrades',
    subtitle: 'Acordes nascem da escala e revelam funções.',
    category: 'harmony',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Acordes nascem da combinação de notas da escala. Tríades usam fundamental, terça e quinta. Tétrades adicionam a sétima.',
        examples: ['C = C E G', 'Dm = D F A', 'G7 = G B D F'],
      },
      {
        id: 'in-ga',
        eyebrow: 'No Guitar Architect',
        body: 'Visualize tríades, tétrades e campo harmônico para entender como acordes se distribuem pelo braço.',
      },
      {
        id: 'fretboard',
        eyebrow: 'Aplicação no braço',
        body: 'Procure pequenas formas em três ou quatro cordas, depois conecte inversões próximas.',
      },
    ],
    actions: [
      { id: 'show-triads', label: 'Visualizar tríades', type: 'pendingFretboardAction', payload: fretboardAction('triads', 'C', 'Major (Ionian)') },
      { id: 'show-tetrads-page', label: 'Explorar tríades/tétrades', type: 'navigate', href: '/triads-tetrads' },
      { id: 'show-field', label: 'Mostrar campo harmônico', type: 'pendingFretboardAction', payload: fretboardAction('field', 'C', 'Major (Ionian)') },
    ],
    relatedTools: [
      { id: 'tool-chords', label: 'Acordes', description: 'Construa e visualize estruturas.', type: 'navigate', href: '/chords' },
      { id: 'tool-triads', label: 'Tríades/Tétrades', description: 'Aprofunde voicings e inversões.', type: 'navigate', href: '/triads-tetrads' },
    ],
  },
  {
    id: 'harmonic-field-functions',
    order: 7,
    title: 'Campo harmônico e funções tonais',
    subtitle: 'Repouso, movimento e resolução dentro da tonalidade.',
    category: 'harmony',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'O campo harmônico mostra os acordes derivados de uma tonalidade. As funções tonais explicam repouso, movimento e resolução.',
        examples: ['C = tônica', 'F = subdominante', 'G = dominante'],
      },
      {
        id: 'in-ga',
        eyebrow: 'No Guitar Architect',
        body: 'Use o Ciclo Harmônico para entender relações tonais e volte ao fretboard para aplicar acordes e progressões.',
      },
      {
        id: 'practice',
        eyebrow: 'Prática orientada',
        body: 'Toque progressões curtas e observe como a dominante cria tensão antes da resolução para a tônica.',
      },
    ],
    actions: [
      { id: 'show-field', label: 'Mostrar campo harmônico', type: 'pendingFretboardAction', payload: fretboardAction('field', 'C', 'Major (Ionian)') },
      { id: 'practice-251', label: 'Praticar II - V - I', type: 'pendingFretboardAction', payload: fretboardAction('progression', 'C', 'Major (Ionian)', { progression: 'ii - V - I', chords: ['Dm', 'G', 'C'] }) },
      { id: 'cycle', label: 'Abrir Ciclo Harmônico', type: 'navigate', href: '/harmonic-cycle' },
    ],
    relatedTools: [
      { id: 'tool-cycle', label: 'Ciclo Harmônico', description: 'Mapa visual de tonalidades e funções.', type: 'navigate', href: '/harmonic-cycle' },
      { id: 'tool-field', label: 'Campo harmônico', description: 'Acordes derivados da escala.', type: 'pendingFretboardAction', payload: fretboardAction('field', 'C', 'Major (Ionian)') },
    ],
  },
  {
    id: 'caged-visualization',
    order: 8,
    title: 'CAGED e visualização do braço',
    subtitle: 'Organize acordes, escalas e arpejos em regiões conectadas.',
    category: 'technique',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'O CAGED organiza acordes, escalas e arpejos em regiões conectadas do braço.',
      },
      {
        id: 'in-ga',
        eyebrow: 'No Guitar Architect',
        body: 'Use a página CAGED para entender shapes e depois aplique escala maior no fretboard para conectar regiões.',
      },
      {
        id: 'practice',
        eyebrow: 'Prática orientada',
        body: 'Escolha uma tonalidade, visualize o shape e conecte com a escala antes de mudar de região.',
      },
    ],
    actions: [
      { id: 'open-caged', label: 'Abrir CAGED', type: 'navigate', href: '/caged' },
      { id: 'show-caged-shapes', label: 'Mostrar shapes CAGED', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)') },
      { id: 'connect-major-caged', label: 'Conectar escala maior ao CAGED', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)') },
    ],
    relatedTools: [
      { id: 'tool-caged', label: 'CAGED', description: 'Sistema de shapes conectados.', type: 'navigate', href: '/caged' },
      { id: 'tool-scale', label: 'Escala maior', description: 'Conecte shapes por graus.', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)') },
    ],
  },
  {
    id: 'greek-modes-colors',
    order: 9,
    title: 'Modos gregos e cores modais',
    subtitle: 'Reorganize notas por centros diferentes e ouça novas cores.',
    category: 'theory',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Modos são formas de reorganizar a mesma coleção de notas a partir de centros diferentes.',
        examples: ['Jônio', 'Dórico', 'Frígio', 'Lídio', 'Mixolídio', 'Eólio', 'Lócrio'],
      },
      {
        id: 'in-ga',
        eyebrow: 'No Guitar Architect',
        body: 'Abra Modos Gregos para comparar cores e aplique modos no fretboard para sentir a diferença melódica.',
      },
      {
        id: 'practice',
        eyebrow: 'Prática orientada',
        body: 'Compare jônio e mixolídio na mesma tônica para perceber como uma nota altera a função da frase.',
      },
    ],
    actions: [
      { id: 'open-modes', label: 'Abrir modos gregos', type: 'navigate', href: '/greek-modes' },
      { id: 'apply-dorian', label: 'Aplicar modo dórico', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'D', 'Dorian') },
      { id: 'compare-ionian-mixolydian', label: 'Comparar jônio e mixolídio', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'G', 'Mixolydian') },
    ],
    relatedTools: [
      { id: 'tool-modes', label: 'Modos Gregos', description: 'Estude cores modais.', type: 'navigate', href: '/greek-modes' },
      { id: 'tool-fretboard', label: 'Fretboard', description: 'Aplique modos no braço.', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'D', 'Dorian') },
    ],
  },
  {
    id: 'guided-improvisation',
    order: 10,
    title: 'Improvisação guiada',
    subtitle: 'Escolha notas com intenção rítmica, melódica e harmônica.',
    category: 'practice',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Improvisar é escolher notas com intenção rítmica, melódica e harmônica.',
      },
      {
        id: 'focus',
        eyebrow: 'Pontos de estudo',
        body: 'Trabalhe notas-alvo, motivos, tensão e resolução, fraseado, repetição e variação.',
        examples: ['Criar motivo de 3 notas', 'Resolver no grau 1', 'Repetir com variação rítmica'],
      },
      {
        id: 'in-ga',
        eyebrow: 'No Guitar Architect',
        body: 'Aplique pentatônica, visualize notas-alvo e pratique sobre progressões simples antes de expandir o campo harmônico.',
      },
    ],
    actions: [
      { id: 'apply-pentatonic', label: 'Aplicar pentatônica', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'A', 'Pentatonic Minor') },
      { id: 'show-targets', label: 'Mostrar notas-alvo', type: 'openTool', payload: openToolAction('intervals') },
      { id: 'practice-field', label: 'Praticar sobre campo harmônico', type: 'pendingFretboardAction', payload: fretboardAction('progression', 'C', 'Major (Ionian)', { progression: 'I - V - vi - IV', chords: ['C', 'G', 'Am', 'F'] }) },
    ],
    relatedTools: [
      { id: 'tool-exercises', label: 'Exercícios', description: 'Pratique frases com pulso.', type: 'startPractice', payload: startPracticeAction('A', 'Pentatonic Minor', 72) },
      { id: 'tool-cycle', label: 'Ciclo Harmônico', description: 'Escolha progressões e funções.', type: 'navigate', href: '/harmonic-cycle' },
    ],
  },
  {
    id: 'single-string-horizontal-study',
    order: 11,
    title: 'Estudo Horizontal (Uma Corda)',
    subtitle: 'Aprenda a escala como distância real no braço, não apenas como desenho.',
    category: 'technique',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'O braço não deve ser aprendido apenas como desenhos verticais. Uma única corda já contém relações intervalares completas.',
      },
      {
        id: 'goals',
        eyebrow: 'Objetivos',
        body: 'Localize notas, enxergue intervalos, encontre tônicas e reduza dependência de patterns fixos.',
        examples: ['Subir C maior em uma corda', 'Descer pela mesma corda', 'Marcar tônica e graus fortes'],
      },
      {
        id: 'future-mode',
        eyebrow: 'Preparado para engine',
        body: 'O payload já sinaliza Single String Mode para destacar uma corda, reduzir as demais e tocar a sequência automaticamente em etapa futura.',
      },
    ],
    actions: [
      { id: 'single-string-scale', label: 'Aplicar escala em 1 corda', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 70, { exerciseId: 'single-string-major-c', practiceMode: 'singleString', strings: [0] }) },
      { id: 'only-scale-notes', label: 'Mostrar notas da escala', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { practiceMode: 'singleString', strings: [0] }) },
      { id: 'horizontal-bpm', label: 'Exercício horizontal com BPM', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 70, { exerciseId: 'single-string-major-c', practiceMode: 'singleString', strings: [0], direction: 'ascending' }) },
    ],
    relatedTools: [
      { id: 'tool-exercises', label: 'Exercícios', description: 'Abre a área de prática com BPM.', type: 'openTool', payload: openToolAction('exercises') },
      { id: 'tool-intervals', label: 'Intervalos', description: 'Use distância para estudar uma corda.', type: 'openTool', payload: openToolAction('intervals') },
    ],
  },
  {
    id: 'hand-coordination',
    order: 12,
    title: 'Coordenação entre Mão Direita e Esquerda',
    subtitle: 'Sincronize dedos, ataque e mudança de corda com BPM progressivo.',
    category: 'technique',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Fluência depende da sincronia entre mão direita e esquerda. Velocidade sem coordenação só amplifica ruídos.',
      },
      {
        id: 'patterns',
        eyebrow: 'Exercícios',
        body: 'Use combinações pequenas de dedos antes de subir velocidade. O foco é precisão, relaxamento e consistência.',
        examples: ['1-2-3-4', '1-3-2-4', '1-4-2-3'],
      },
      {
        id: 'ga',
        eyebrow: 'No Guitar Architect',
        body: 'As ações já apontam para exercícios com metadados de dedo esperado e palhetada, preparando destaque visual futuro.',
      },
    ],
    actions: [
      { id: 'coordination-slow', label: 'Iniciar exercício lento', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 60, { exerciseId: 'chromatic-1234', practiceMode: 'coordination', fingering: [1, 2, 3, 4], picking: 'alternate' }) },
      { id: 'coordination-bpm', label: 'Aumentar BPM automaticamente', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 60, { exerciseId: 'chromatic-1234', autoBpmIncrease: true, bpmStep: 4 }) },
      { id: 'picking-direction', label: 'Mostrar direção da palheta', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 60, { exerciseId: 'chromatic-1234', showPickingDirection: true }) },
    ],
    relatedTools: [
      { id: 'tool-metronome', label: 'Metrônomo', description: 'Pulso constante para coordenação.', type: 'openTool', payload: openToolAction('metronome') },
      { id: 'tool-exercises', label: 'Exercícios', description: 'Área de treino técnico.', type: 'openTool', payload: openToolAction('exercises') },
    ],
  },
  {
    id: 'rhythmic-variations',
    order: 13,
    title: 'Variações Rítmicas',
    subtitle: 'Toque o mesmo material em subdivisões, acentos e deslocamentos.',
    category: 'practice',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'O mesmo padrão melódico deve ser estudado em múltiplas células rítmicas para virar música, não mecânica.',
      },
      {
        id: 'cells',
        eyebrow: 'Células rítmicas',
        body: 'A futura engine pode alternar subdivisão, acento e deslocamento métrico mantendo o mesmo conjunto de notas.',
        examples: ['Semínimas', 'Colcheias', 'Tercinas', 'Semicolcheias', 'Acentos 3+3+2'],
      },
      {
        id: 'integration',
        eyebrow: 'Integração',
        body: 'O metrônomo será o centro temporal do exercício; por ora, as ações já abrem prática e pulso juntos.',
      },
    ],
    actions: [
      { id: 'apply-rhythm', label: 'Aplicar ritmo ao exercício', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 72, { exerciseId: 'rhythm-subdivision-ladder', rhythmCell: 'eighths' }) },
      { id: 'subdivision', label: 'Trocar subdivisão', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 72, { exerciseId: 'rhythm-subdivision-ladder', subdivisions: ['quarters', 'eighths', 'triplets', 'sixteenths'] }) },
      { id: 'metronome', label: 'Abrir metrônomo', type: 'openTool', payload: openToolAction('metronome') },
    ],
    relatedTools: [
      { id: 'tool-metronome', label: 'Metrônomo', description: 'Pulso e subdivisão.', type: 'openTool', payload: openToolAction('metronome') },
      { id: 'tool-exercises', label: 'Exercícios BPM', description: 'Aplica ritmo à sequência.', type: 'openTool', payload: openToolAction('exercises') },
    ],
  },
  {
    id: 'chromatic-studies',
    order: 14,
    title: 'Estudos Cromáticos',
    subtitle: 'Controle mecânico, deslocamento horizontal e precisão por semitons.',
    category: 'technique',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'O estudo cromático desenvolve controle mecânico e percepção espacial sem exigir uma tonalidade específica.',
      },
      {
        id: 'patterns',
        eyebrow: 'Padrões',
        body: 'Pequenas permutações de dedos revelam tensões, atrasos e falhas de sincronização.',
        examples: ['1-2-3-4', '1-3-2-4', '1-4-2-3'],
      },
      {
        id: 'practice',
        eyebrow: 'Prática',
        body: 'Use loop, direção e BPM baixo. O objetivo é som limpo e movimento mínimo.',
      },
    ],
    actions: [
      { id: 'chromatic-start', label: 'Iniciar cromático', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 60, { exerciseId: 'chromatic-1234', practiceMode: 'chromatic', loop: true }) },
      { id: 'chromatic-bpm', label: 'Aplicar BPM', type: 'openTool', payload: openToolAction('metronome') },
      { id: 'chromatic-direction', label: 'Mudar direção', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 60, { exerciseId: 'chromatic-1324', direction: 'descending' }) },
    ],
    relatedTools: [
      { id: 'tool-exercises', label: 'Exercícios', description: 'Loop e controle de padrão.', type: 'openTool', payload: openToolAction('exercises') },
      { id: 'tool-metronome', label: 'Metrônomo', description: 'Controle de andamento.', type: 'openTool', payload: openToolAction('metronome') },
    ],
  },
  {
    id: 'diatonic-studies',
    order: 15,
    title: 'Estudos Diatônicos',
    subtitle: 'Estude tonalidade, graus e relativa menor em vez de shapes soltos.',
    category: 'harmony',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Estudar escalas é estudar tonalidade, direção e função. O desenho é consequência, não ponto final.',
      },
      {
        id: 'degrees',
        eyebrow: 'Graus',
        body: 'A tônica, a terça, a quinta e a sensível ajudam a organizar intenção melódica.',
        examples: ['I = repouso', 'III = cor maior/menor', 'V = estabilidade', 'VII = tensão'],
      },
      {
        id: 'relative',
        eyebrow: 'Relativa menor',
        body: 'A mesma armadura pode ganhar outro centro tonal. Use o Ciclo Harmônico para relacionar maior e menor.',
      },
    ],
    actions: [
      { id: 'apply-tonality', label: 'Aplicar tonalidade', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)') },
      { id: 'highlight-degrees', label: 'Destacar graus', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 76, { exerciseId: 'diatonic-degrees-c', showDegrees: true }) },
      { id: 'relative-minor', label: 'Estudar relativa menor', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'A', 'Natural Minor (Aeolian)') },
    ],
    relatedTools: [
      { id: 'tool-cycle', label: 'Ciclo Harmônico', description: 'Relacione maior e menor.', type: 'navigate', href: '/harmonic-cycle' },
      { id: 'tool-field', label: 'Campo harmônico', description: 'Acordes da tonalidade.', type: 'pendingFretboardAction', payload: fretboardAction('field', 'C', 'Major (Ionian)') },
    ],
  },
  {
    id: 'tremolo-picking-control',
    order: 16,
    title: 'Tremolo e Controle de Palhetada',
    subtitle: 'Repetições controladas para constância, ataque e resistência.',
    category: 'technique',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Repetições controladas fortalecem precisão e constância rítmica quando o movimento permanece relaxado.',
      },
      {
        id: 'modes',
        eyebrow: 'Modos',
        body: 'A futura engine pode variar repetições por nota e direção de palhetada.',
        examples: ['8 repetições', '6 repetições', '4 repetições', '3 repetições', '2 repetições'],
      },
      {
        id: 'control',
        eyebrow: 'Controle',
        body: 'O objetivo não é tocar forte; é tocar igual, limpo e no tempo.',
      },
    ],
    actions: [
      { id: 'start-tremolo', label: 'Iniciar tremolo', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 84, { exerciseId: 'tremolo-four-repeats', repetitionsPerNote: 4, picking: 'alternate' }) },
      { id: 'alternate-pick', label: 'Alternar direção da palheta', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 84, { exerciseId: 'tremolo-four-repeats', showPickingDirection: true }) },
      { id: 'control-bpm', label: 'Controlar BPM', type: 'openTool', payload: openToolAction('metronome') },
    ],
    relatedTools: [
      { id: 'tool-metronome', label: 'Metrônomo', description: 'Base temporal do tremolo.', type: 'openTool', payload: openToolAction('metronome') },
      { id: 'tool-exercises', label: 'Exercícios', description: 'Repetição controlada.', type: 'openTool', payload: openToolAction('exercises') },
    ],
  },
  {
    id: 'thirds-fourths-studies',
    order: 17,
    title: 'Estudos em Terças e Quartas',
    subtitle: 'Transforme escalas em relações intervalares cantáveis.',
    category: 'theory',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Escalas devem ser estudadas intervalarmente para revelar estrutura melódica, harmônica e visual.',
      },
      {
        id: 'intervals',
        eyebrow: 'Intervalos guiados',
        body: 'Terças aproximam escala e acorde. Quartas abrem sonoridade e deslocam a mão de modo musical.',
        examples: ['C-E, D-F, E-G', 'C-F, D-G, E-A'],
      },
      {
        id: 'application',
        eyebrow: 'Aplicação',
        body: 'Destaque o intervalo atual e toque em sequência para ouvir a escala sob outro ângulo.',
      },
    ],
    actions: [
      { id: 'thirds', label: 'Tocar em terças', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 72, { exerciseId: 'thirds-c-major', intervalStudy: 'thirds' }) },
      { id: 'fourths', label: 'Tocar em quartas', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 68, { exerciseId: 'fourths-c-major', intervalStudy: 'fourths' }) },
      { id: 'show-current-interval', label: 'Mostrar intervalo atual', type: 'openTool', payload: openToolAction('intervals') },
    ],
    relatedTools: [
      { id: 'tool-intervals', label: 'Intervalos', description: 'Compare distâncias no braço.', type: 'openTool', payload: openToolAction('intervals') },
      { id: 'tool-scale', label: 'Escala no braço', description: 'Base diatônica dos estudos.', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)') },
    ],
  },
  {
    id: 'full-fretboard-visualization',
    order: 18,
    title: 'Visualização Total do Braço',
    subtitle: 'Enxergue notas, regiões e relações sem depender de patterns.',
    category: 'fretboard',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'O músico deve enxergar notas, regiões e relações harmônicas em todo o braço.',
      },
      {
        id: 'tools',
        eyebrow: 'Ferramentas',
        body: 'Use visualização completa, tônicas, graus e conexões horizontais/verticais para navegar com intenção.',
      },
      {
        id: 'focus',
        eyebrow: 'Foco',
        body: 'Oculte informação irrelevante e destaque apenas o que a prática pede naquele momento.',
      },
    ],
    actions: [
      { id: 'no-shapes', label: 'Modo sem shapes', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { hideShapes: true, showDegrees: true }) },
      { id: 'full-tonality', label: 'Visualização completa', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { fullFretboard: true }) },
      { id: 'locate-tonics', label: 'Localizar tônicas', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { focus: 'tonics' }) },
    ],
    relatedTools: [
      { id: 'tool-fretboard', label: 'Fretboard', description: 'Mapa completo do instrumento.', type: 'navigate', href: '/' },
      { id: 'tool-intervals', label: 'Intervalos', description: 'Conexões entre regiões.', type: 'openTool', payload: openToolAction('intervals') },
    ],
  },
  {
    id: 'movable-mini-positions',
    order: 19,
    title: 'Mini Posições Móveis',
    subtitle: 'Domine pequenas regiões móveis antes de tentar o braço inteiro.',
    category: 'technique',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Dominar pequenas regiões móveis gera liberdade real no instrumento e reduz ansiedade visual.',
      },
      {
        id: 'regions',
        eyebrow: 'Regiões',
        body: 'Comece com duas cordas e três casas. Depois desloque a mesma lógica por semitons, tons e graus.',
        examples: ['2 cordas', '3 casas', 'Deslocamento gradual'],
      },
      {
        id: 'practice',
        eyebrow: 'Prática',
        body: 'Mova a mini posição mantendo tônica, direção e frase curta.',
      },
    ],
    actions: [
      { id: 'move-position', label: 'Mover posição', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 70, { practiceMode: 'miniPosition', strings: [1, 0], fretWindow: [5, 8] }) },
      { id: 'connect-regions', label: 'Conectar regiões', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { regionConnection: true }) },
      { id: 'practice-shift', label: 'Praticar deslocamento', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 70, { practiceMode: 'positionShift', fretWindow: [5, 8] }) },
    ],
    relatedTools: [
      { id: 'tool-exercises', label: 'Exercícios', description: 'Treino de deslocamento.', type: 'openTool', payload: openToolAction('exercises') },
      { id: 'tool-caged', label: 'CAGED', description: 'Regiões conectadas.', type: 'navigate', href: '/caged' },
    ],
  },
  {
    id: 'smart-practice-routine',
    order: 20,
    title: 'Rotina Inteligente de Estudos',
    subtitle: 'Organize tempo, BPM, tonalidades e exercícios com intenção.',
    category: 'practice',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Disciplina e organização são fundamentais para evolução. O melhor estudo reduz decisões e aumenta foco.',
      },
      {
        id: 'engine',
        eyebrow: 'Daily Practice Engine',
        body: 'A estrutura já prepara sorteio de exercícios, escalas, tonalidades, intervalos e BPM progressivo.',
        examples: ['Exercício aleatório', 'Tonalidade aleatória', 'BPM progressivo', 'Tempo de prática'],
      },
      {
        id: 'progress',
        eyebrow: 'Progresso',
        body: 'A progressão deve ser discreta e profissional: iniciado, em andamento, concluído.',
      },
    ],
    actions: [
      { id: 'start-routine', label: 'Iniciar rotina', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 72, { routineMode: 'daily', durationMinutes: 15 }) },
      { id: 'generate-practice', label: 'Gerar treino', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 72, { routineMode: 'randomized', randomize: ['exercise', 'key', 'interval'] }) },
      { id: 'save-progress', label: 'Preparar progresso', type: 'openTool', payload: openToolAction('exercises') },
    ],
    relatedTools: [
      { id: 'tool-exercises', label: 'Exercícios', description: 'Base da rotina diária.', type: 'openTool', payload: openToolAction('exercises') },
      { id: 'tool-metronome', label: 'Metrônomo', description: 'BPM progressivo.', type: 'openTool', payload: openToolAction('metronome') },
    ],
  },
  {
    id: 'legato-technique',
    order: 21,
    title: 'Técnica de Ligaduras',
    subtitle: 'Hammer-on, pull-off e legato com som limpo e controle de volume.',
    category: 'technique',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Ligaduras exigem precisão, som equilibrado e relaxamento. A nota ligada não deve sumir nem explodir.',
      },
      {
        id: 'patterns',
        eyebrow: 'Sequências',
        body: 'Comece com movimentos curtos e repita até manter volume parecido entre ataque e ligadura.',
        examples: ['Hammer-on', 'Pull-off', 'Legato em 3 notas'],
      },
      {
        id: 'practice',
        eyebrow: 'Prática',
        body: 'Use BPM baixo, loop curto e atenção ao ruído da corda vizinha.',
      },
    ],
    actions: [
      { id: 'start-legato', label: 'Iniciar legato', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 64, { exerciseId: 'legato-basic-ho-po', technique: 'legato' }) },
      { id: 'legato-bpm', label: 'Aplicar BPM', type: 'openTool', payload: openToolAction('metronome') },
      { id: 'repeat-pattern', label: 'Repetir padrão', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 64, { exerciseId: 'legato-basic-ho-po', loop: true }) },
    ],
    relatedTools: [
      { id: 'tool-exercises', label: 'Exercícios', description: 'Loop de ligaduras.', type: 'openTool', payload: openToolAction('exercises') },
      { id: 'tool-metronome', label: 'Metrônomo', description: 'Controle temporal.', type: 'openTool', payload: openToolAction('metronome') },
    ],
  },
  {
    id: 'noise-muting-control',
    order: 22,
    title: 'Controle de Ruídos e Abafamento',
    subtitle: 'Som limpo depende tanto das notas tocadas quanto das notas silenciadas.',
    category: 'technique',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Som limpo depende de controle de ruído, abafamento, sustain e consciência das cordas que não devem soar.',
      },
      {
        id: 'focus',
        eyebrow: 'Focos',
        body: 'Treine ruído entre cordas, controle de sustain e limpeza sonora em alternâncias pequenas.',
        examples: ['Abafar corda grave', 'Cortar sustain', 'Alternar duas cordas'],
      },
      {
        id: 'visual',
        eyebrow: 'Preparado para visual',
        body: 'Os payloads já sinalizam exercícios com dicas visuais e animações simples para uma engine futura.',
      },
    ],
    actions: [
      { id: 'muting-start', label: 'Iniciar abafamento', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 66, { exerciseId: 'muting-control-two-strings', technique: 'muting' }) },
      { id: 'two-strings', label: 'Exercício em duas cordas', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 66, { exerciseId: 'muting-control-two-strings', strings: [1, 0] }) },
      { id: 'open-tools', label: 'Abrir prática', type: 'openTool', payload: openToolAction('exercises') },
    ],
    relatedTools: [
      { id: 'tool-exercises', label: 'Exercícios', description: 'Treino de limpeza sonora.', type: 'openTool', payload: openToolAction('exercises') },
      { id: 'tool-tuner', label: 'Afinador', description: 'Cheque estabilidade de nota.', type: 'openTool', payload: openToolAction('tuner') },
    ],
  },
  {
    id: 'alternate-vs-sweep',
    order: 23,
    title: 'Alternate Picking vs Sweep Picking',
    subtitle: 'Compare direção, economia de movimento e clareza sonora.',
    category: 'technique',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Alternate picking alterna ataques. Sweep picking aproveita direção contínua em cordas adjacentes.',
      },
      {
        id: 'compare',
        eyebrow: 'Comparação visual',
        body: 'A futura camada visual pode mostrar setas de palhetada, direção de movimento e sincronização entre mãos.',
        examples: ['Baixo-cima', 'Cima-baixo', 'Sweep descendente', 'Sweep ascendente'],
      },
      {
        id: 'clarity',
        eyebrow: 'Clareza',
        body: 'A técnica só funciona quando cada nota soa separada e o ruído entre cordas fica controlado.',
      },
    ],
    actions: [
      { id: 'alternate', label: 'Treinar alternate', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 68, { exerciseId: 'picking-comparison-arpeggio', picking: 'alternate' }) },
      { id: 'sweep', label: 'Treinar sweep', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 62, { exerciseId: 'picking-comparison-arpeggio', picking: 'sweep' }) },
      { id: 'show-direction', label: 'Mostrar direção', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 62, { exerciseId: 'picking-comparison-arpeggio', showPickingDirection: true }) },
    ],
    relatedTools: [
      { id: 'tool-exercises', label: 'Exercícios', description: 'Comparação técnica.', type: 'openTool', payload: openToolAction('exercises') },
      { id: 'tool-chords', label: 'Acordes', description: 'Arpejos derivados de acordes.', type: 'navigate', href: '/chords' },
    ],
  },
  {
    id: 'fluency-development',
    order: 24,
    title: 'Desenvolvimento de Fluência',
    subtitle: 'Velocidade nasce de relaxamento, precisão e repetição consciente.',
    category: 'practice',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Velocidade é consequência de relaxamento, precisão, som limpo e repetição consciente.',
      },
      {
        id: 'bpm',
        eyebrow: 'BPM gradual',
        body: 'Suba pouco, só depois de manter regularidade. A futura engine pode aumentar BPM após ciclos limpos.',
        examples: ['60 BPM', '64 BPM', '68 BPM', '72 BPM'],
      },
      {
        id: 'continuous',
        eyebrow: 'Treino contínuo',
        body: 'Use timer, loop e repetição curta para praticar sem transformar tudo em corrida.',
      },
    ],
    actions: [
      { id: 'continuous-mode', label: 'Modo treino contínuo', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 68, { routineMode: 'continuous', durationMinutes: 10 }) },
      { id: 'auto-bpm', label: 'Aumentar BPM automático', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 68, { autoBpmIncrease: true, bpmStep: 3, successCycles: 4 }) },
      { id: 'open-metronome', label: 'Abrir metrônomo', type: 'openTool', payload: openToolAction('metronome') },
    ],
    relatedTools: [
      { id: 'tool-metronome', label: 'Metrônomo', description: 'Controle de andamento.', type: 'openTool', payload: openToolAction('metronome') },
      { id: 'tool-exercises', label: 'Exercícios', description: 'Loop e timer.', type: 'openTool', payload: openToolAction('exercises') },
    ],
  },
  {
    id: 'progressive-musical-studies',
    order: 25,
    title: 'Estudos Musicais Progressivos',
    subtitle: 'Transforme técnica em pequenas frases, estudos e mini etudes.',
    category: 'practice',
    status: 'available',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Exercícios mecânicos precisam virar música. Pequenos estudos melódicos conectam técnica, ouvido e intenção.',
      },
      {
        id: 'etudes',
        eyebrow: 'Mini estudos',
        body: 'Frases guiadas podem combinar escala, ritmo, direção e resolução com playback sincronizado.',
        examples: ['Frase de 4 compassos', 'Motivo + resposta', 'Resolução na tônica'],
      },
      {
        id: 'future',
        eyebrow: 'Próxima engine',
        body: 'A estrutura já prepara reprodução automática, highlight sincronizado no fretboard e BPM progressivo.',
      },
    ],
    actions: [
      { id: 'melodic-study', label: 'Iniciar estudo melódico', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 72, { studyMode: 'miniEtude', phraseLength: 8 }) },
      { id: 'sync-highlight', label: 'Preparar highlight sincronizado', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 72, { studyMode: 'miniEtude', syncHighlight: true }) },
      { id: 'progressive-bpm', label: 'BPM progressivo', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 72, { autoBpmIncrease: true, bpmStep: 2 }) },
    ],
    relatedTools: [
      { id: 'tool-exercises', label: 'Exercícios', description: 'Base para mini estudos.', type: 'openTool', payload: openToolAction('exercises') },
      { id: 'tool-field', label: 'Campo harmônico', description: 'Contexto musical das frases.', type: 'pendingFretboardAction', payload: fretboardAction('field', 'C', 'Major (Ionian)') },
    ],
  },
];

export const LEARN_PRACTICE_TOOLS: LearnAction[] = [
  { id: 'practice-tuner', label: 'Afinador', description: 'Prepare o instrumento antes de estudar.', type: 'openTool', payload: openToolAction('tuner') },
  { id: 'practice-metronome', label: 'Metrônomo', description: 'Defina pulso e BPM.', type: 'openTool', payload: openToolAction('metronome') },
  { id: 'practice-scale-bpm', label: 'Exercício: escala no BPM', description: 'Toque a escala com sequência visual.', type: 'startPractice', payload: startPracticeAction('C', 'Major (Ionian)', 80) },
  { id: 'practice-scale', label: 'Aplicar escala no braço', description: 'Veja notas, tônica e graus.', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)') },
  { id: 'practice-field', label: 'Ver campo harmônico', description: 'Mostre acordes da tonalidade.', type: 'pendingFretboardAction', payload: fretboardAction('field', 'C', 'Major (Ionian)') },
  { id: 'practice-triads', label: 'Visualizar tríades', description: 'Ative tríades diatônicas.', type: 'pendingFretboardAction', payload: fretboardAction('triads', 'C', 'Major (Ionian)') },
  { id: 'practice-caged', label: 'Explorar CAGED', description: 'Abra o módulo CAGED.', type: 'navigate', href: '/caged' },
  { id: 'practice-modes', label: 'Explorar modos gregos', description: 'Abra o módulo de modos.', type: 'navigate', href: '/greek-modes' },
];
