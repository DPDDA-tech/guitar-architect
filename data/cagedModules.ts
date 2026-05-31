export type CagedModuleCategory =
  | 'theory'
  | 'fretboard'
  | 'visualization'
  | 'harmony'
  | 'practice'
  | 'improvisation';

export type CagedOverlay =
  | 'shape'
  | 'tonic'
  | 'triad'
  | 'arpeggio'
  | 'scale'
  | 'degrees'
  | 'horizontalConnection';

export type CagedAction = {
  id: string;
  label: string;
  type:
    | 'pendingFretboardAction'
    | 'navigate'
    | 'toggleOverlay'
    | 'startPractice';
  payload?: unknown;
};

export type CagedBlock = {
  id: string;
  eyebrow: string;
  title?: string;
  body: string;
  examples?: string[];
};

export type CagedModule = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  category: CagedModuleCategory;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  blocks: CagedBlock[];
  actions: CagedAction[];
};

const fretboardAction = (
  action: 'scale' | 'field' | 'triads' | 'progression' | 'startPractice',
  root = 'C',
  scaleType = 'Major (Ionian)',
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

const overlayAction = (overlay: CagedOverlay, extra: Record<string, unknown> = {}) => ({
  overlay,
  ...extra,
});

export const CAGED_OVERLAYS: { id: CagedOverlay; label: string; description: string }[] = [
  { id: 'shape', label: 'Shape', description: 'Região ativa do sistema CAGED.' },
  { id: 'tonic', label: 'Tônica', description: 'Ponto de orientação principal.' },
  { id: 'triad', label: 'Tríade', description: 'Núcleo harmônico do shape.' },
  { id: 'arpeggio', label: 'Arpejo', description: 'Acorde tocado como linha.' },
  { id: 'scale', label: 'Escala', description: 'Mapa melódico ao redor do shape.' },
  { id: 'degrees', label: 'Graus', description: 'Funções internas da escala.' },
  { id: 'horizontalConnection', label: 'Conexão', description: 'Ligação horizontal entre regiões.' },
];

export const CAGED_MODULES: CagedModule[] = [
  {
    id: 'what-is-caged',
    order: 1,
    title: 'O que é o sistema CAGED',
    subtitle: 'Cinco formas abertas organizando o braço inteiro.',
    category: 'theory',
    difficulty: 'beginner',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'O sistema CAGED organiza o braço em cinco regiões derivadas das formas abertas de C, A, G, E e D.',
        examples: ['C', 'A', 'G', 'E', 'D'],
      },
      {
        id: 'fretboard',
        eyebrow: 'No fretboard',
        body: 'As formas se conectam horizontalmente e permitem visualizar acordes, escalas e arpejos em regiões móveis.',
      },
      {
        id: 'music',
        eyebrow: 'Conexão musical',
        body: 'Improvisação, acompanhamento e visualização harmônica ficam mais intuitivos quando a tônica organiza cada região.',
      },
    ],
    actions: [
      { id: 'show-caged-shapes', label: 'Mostrar shapes CAGED', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { cagedMode: true, cagedAction: 'SHOW_CAGED_SHAPE', shape: 'E', overlays: ['shape', 'tonic'] }) },
      { id: 'show-regions', label: 'Mostrar regiões', type: 'toggleOverlay', payload: overlayAction('shape') },
      { id: 'highlight-tonics', label: 'Destacar tônicas', type: 'toggleOverlay', payload: overlayAction('tonic') },
    ],
  },
  {
    id: 'five-connected-forms',
    order: 2,
    title: 'As cinco formas conectadas',
    subtitle: 'C, A, G, E e D não são caixas isoladas.',
    category: 'visualization',
    difficulty: 'beginner',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'As cinco formas não são isoladas. Elas se sobrepõem e conectam o braço inteiro em uma sequência móvel.',
        examples: ['C -> A -> G -> E -> D'],
      },
      {
        id: 'fretboard',
        eyebrow: 'No fretboard',
        body: 'Observe a passagem de uma região para a próxima, usando tônicas e notas comuns como pontos de transição.',
      },
      {
        id: 'movement',
        eyebrow: 'Movimento',
        body: 'A transição deve parecer lateral e contínua, não um salto para outro desenho sem relação.',
      },
    ],
    actions: [
      { id: 'next-shape', label: 'Mostrar próximo shape', type: 'startPractice', payload: fretboardAction('startPractice', 'C', 'Major (Ionian)', { cagedAction: 'NEXT_CAGED_SHAPE', shapeSequence: ['C', 'A', 'G', 'E', 'D'], tool: 'exercises', bpm: 72 }) },
      { id: 'overlap', label: 'Mostrar sobreposição', type: 'toggleOverlay', payload: overlayAction('horizontalConnection', { animation: 'region-transition' }) },
      { id: 'horizontal', label: 'Navegar horizontalmente', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { cagedAction: 'CONNECT_CAGED_REGIONS', overlays: ['shape', 'horizontalConnection'] }) },
    ],
  },
  {
    id: 'tonic-in-each-shape',
    order: 3,
    title: 'Encontrando a tônica em cada shape',
    subtitle: 'A tônica é o centro gravitacional da região.',
    category: 'fretboard',
    difficulty: 'beginner',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'A tônica é o ponto de orientação principal do shape. Sem ela, CAGED vira apenas desenho decorado.',
      },
      {
        id: 'examples',
        eyebrow: 'Exemplos',
        body: 'A mesma lógica vale em qualquer tonalidade: encontre a tônica e o shape passa a ter direção.',
        examples: ['Shape E de C', 'Shape A de D', 'Shape G de G'],
      },
      {
        id: 'focus',
        eyebrow: 'Foco visual',
        body: 'Reduzir as demais notas e destacar tônicas ajuda a enxergar oitavas, pontos de repouso e resolução.',
      },
    ],
    actions: [
      { id: 'only-tonics', label: 'Mostrar somente tônicas', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { cagedAction: 'SHOW_CAGED_TONICS', focus: 'tonics', overlays: ['tonic'] }) },
      { id: 'alternate-shapes', label: 'Alternar shapes', type: 'startPractice', payload: fretboardAction('startPractice', 'C', 'Major (Ionian)', { cagedAction: 'ALTERNATE_CAGED_SHAPES', tool: 'exercises', bpm: 68 }) },
      { id: 'show-octaves', label: 'Mostrar oitavas', type: 'toggleOverlay', payload: overlayAction('tonic', { showOctaves: true }) },
    ],
  },
  {
    id: 'chord-arpeggio-scale',
    order: 4,
    title: 'Acorde, arpejo e escala na mesma região',
    subtitle: 'Um shape contém camadas harmônicas, não apenas uma forma.',
    category: 'harmony',
    difficulty: 'intermediate',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'O mesmo shape contém acorde, arpejo e escala. As camadas mudam a função visual da mesma região.',
      },
      {
        id: 'example',
        eyebrow: 'Exemplo',
        body: 'No shape E de C maior, o acorde C, o arpejo Cmaj7 e a escala C maior coexistem no mesmo território.',
        examples: ['Acorde C', 'Arpejo Cmaj7', 'Escala C maior'],
      },
      {
        id: 'overlay',
        eyebrow: 'Overlays',
        body: 'Ative ou desative acorde, arpejo e escala para entender o papel de cada camada.',
      },
    ],
    actions: [
      { id: 'show-chord', label: 'Mostrar acorde', type: 'pendingFretboardAction', payload: fretboardAction('triads', 'C', 'Major (Ionian)', { cagedAction: 'SHOW_CAGED_CHORD', shape: 'E', overlays: ['shape', 'triad'] }) },
      { id: 'show-arpeggio', label: 'Mostrar arpejo', type: 'toggleOverlay', payload: overlayAction('arpeggio', { chord: 'Cmaj7' }) },
      { id: 'show-scale', label: 'Mostrar escala', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { cagedAction: 'SHOW_CAGED_SCALE', shape: 'E', overlays: ['shape', 'scale'] }) },
    ],
  },
  {
    id: 'horizontal-connection',
    order: 5,
    title: 'Conexão horizontal entre shapes',
    subtitle: 'O braço deve ser visto lateralmente, não como boxes isolados.',
    category: 'visualization',
    difficulty: 'intermediate',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'O braço deve ser visto horizontalmente. As regiões são etapas de um mesmo mapa, não gavetas separadas.',
      },
      {
        id: 'fretboard',
        eyebrow: 'No fretboard',
        body: 'Linhas suaves de conexão e destaque da próxima posição ajudam a entender deslocamento lateral.',
      },
      {
        id: 'music',
        eyebrow: 'Conexão musical',
        body: 'Improvisar entre shapes fica natural quando você conecta notas-alvo em vez de trocar de box no escuro.',
      },
    ],
    actions: [
      { id: 'connect-regions', label: 'Conectar regiões', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { cagedAction: 'CONNECT_CAGED_REGIONS', overlays: ['horizontalConnection', 'tonic'] }) },
      { id: 'show-movement', label: 'Mostrar deslocamento', type: 'toggleOverlay', payload: overlayAction('horizontalConnection', { movement: 'lateral' }) },
      { id: 'navigate-neck', label: 'Navegar pelo braço', type: 'startPractice', payload: fretboardAction('startPractice', 'C', 'Major (Ionian)', { cagedAction: 'CAGED_HORIZONTAL_NAVIGATION', tool: 'exercises', bpm: 70 }) },
    ],
  },
  {
    id: 'barre-transposition',
    order: 6,
    title: 'Transposição por pestana',
    subtitle: 'Shapes abertos tornam-se móveis através da pestana.',
    category: 'fretboard',
    difficulty: 'intermediate',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Shapes abertos tornam-se móveis através da pestana. A forma permanece, mas a tônica muda.',
      },
      {
        id: 'examples',
        eyebrow: 'Exemplos',
        body: 'A forma E pode subir para F, G e A mantendo a mesma arquitetura relativa.',
        examples: ['E shape -> F', 'E shape -> G', 'E shape -> A'],
      },
      {
        id: 'application',
        eyebrow: 'Aplicação',
        body: 'Transpor deixa claro que CAGED é um sistema móvel, não uma coleção fixa de acordes abertos.',
      },
    ],
    actions: [
      { id: 'move-shape', label: 'Mover shape', type: 'startPractice', payload: fretboardAction('startPractice', 'F', 'Major (Ionian)', { cagedAction: 'MOVE_CAGED_SHAPE', shape: 'E', tool: 'exercises', bpm: 66 }) },
      { id: 'change-key', label: 'Alterar tonalidade', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'G', 'Major (Ionian)', { cagedAction: 'TRANSPOSE_CAGED_SHAPE', shape: 'E' }) },
      { id: 'show-barre', label: 'Mostrar pestana', type: 'toggleOverlay', payload: overlayAction('shape', { showBarre: true }) },
    ],
  },
  {
    id: 'major-scale-caged',
    order: 7,
    title: 'CAGED aplicado à escala maior',
    subtitle: 'A escala maior pode ser visualizada dentro das cinco regiões.',
    category: 'practice',
    difficulty: 'intermediate',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'A escala maior pode ser visualizada dentro das cinco regiões CAGED, sempre organizada por tônica e graus.',
      },
      {
        id: 'targets',
        eyebrow: 'Notas-alvo',
        body: 'Tônica, terça, quinta e sétima ajudam a transformar escala em frase com intenção.',
      },
      {
        id: 'connection',
        eyebrow: 'Conexão',
        body: 'Conecte regiões pela escala, mas mantenha o acorde como referência harmônica interna.',
      },
    ],
    actions: [
      { id: 'apply-major', label: 'Aplicar escala maior', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { cagedAction: 'SHOW_CAGED_SCALE', scale: 'major', overlays: ['shape', 'scale'] }) },
      { id: 'show-degrees', label: 'Mostrar graus', type: 'toggleOverlay', payload: overlayAction('degrees') },
      { id: 'connect-major', label: 'Conectar regiões', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { cagedAction: 'CONNECT_CAGED_REGIONS', overlays: ['degrees', 'horizontalConnection'] }) },
    ],
  },
  {
    id: 'pentatonics-inside-caged',
    order: 8,
    title: 'Pentatônicas dentro do CAGED',
    subtitle: 'Boxes pentatônicos ganham sentido quando ligados ao acorde.',
    category: 'improvisation',
    difficulty: 'intermediate',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'As pentatônicas podem ser organizadas pelas regiões do CAGED e relacionadas diretamente ao acorde do shape.',
      },
      {
        id: 'relation',
        eyebrow: 'Relação',
        body: 'A pentatônica deixa de ser um box solto quando você enxerga as notas do acorde dentro dela.',
      },
      {
        id: 'color',
        eyebrow: 'Blue note',
        body: 'A blue note pode ser adicionada como cor expressiva, sem esconder a estrutura principal.',
      },
    ],
    actions: [
      { id: 'show-pentatonic', label: 'Mostrar pentatônica', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'A', 'Pentatonic Minor', { cagedAction: 'SHOW_CAGED_PENTATONIC', overlays: ['shape', 'scale'] }) },
      { id: 'relation-chord', label: 'Mostrar relação com acorde', type: 'pendingFretboardAction', payload: fretboardAction('triads', 'A', 'Pentatonic Minor', { cagedAction: 'SHOW_PENTATONIC_CHORD_RELATION', overlays: ['triad', 'scale'] }) },
      { id: 'blue-note', label: 'Mostrar blue note', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'A', 'Blues', { cagedAction: 'SHOW_BLUE_NOTE', overlays: ['scale'] }) },
    ],
  },
  {
    id: 'triads-inside-caged',
    order: 9,
    title: 'Tríades dentro do CAGED',
    subtitle: 'Tríades pequenas revelam o núcleo harmônico de cada região.',
    category: 'harmony',
    difficulty: 'intermediate',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Tríades pequenas revelam o núcleo harmônico de cada região e tornam os shapes mais musicais.',
      },
      {
        id: 'sets',
        eyebrow: 'Grupos de cordas',
        body: 'Estude tríades em grupos de cordas e inversões para encontrar conduções próximas.',
      },
      {
        id: 'voice-leading',
        eyebrow: 'Voice leading',
        body: 'Conectar tríades por notas próximas cria movimento harmônico claro sem grandes saltos.',
      },
    ],
    actions: [
      { id: 'show-triads', label: 'Mostrar tríades', type: 'pendingFretboardAction', payload: fretboardAction('triads', 'C', 'Major (Ionian)', { cagedAction: 'SHOW_CAGED_TRIADS', overlays: ['shape', 'triad'] }) },
      { id: 'show-inversions', label: 'Mostrar inversões', type: 'pendingFretboardAction', payload: fretboardAction('triads', 'C', 'Major (Ionian)', { cagedAction: 'SHOW_CAGED_INVERSIONS', inversionCycle: true }) },
      { id: 'voice-leading', label: 'Mostrar voice leading', type: 'toggleOverlay', payload: overlayAction('horizontalConnection', { mode: 'voiceLeading' }) },
    ],
  },
  {
    id: 'connected-arpeggios',
    order: 10,
    title: 'Arpejos conectados',
    subtitle: 'Arpejos atravessam shapes e revelam condução harmônica.',
    category: 'harmony',
    difficulty: 'advanced',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'Arpejos atravessam shapes e revelam condução harmônica entre regiões.',
      },
      {
        id: 'movement',
        eyebrow: 'Movimento',
        body: 'Linhas conectando notas ajudam a enxergar o acorde como melodia em movimento.',
      },
      {
        id: 'application',
        eyebrow: 'Aplicação',
        body: 'Toque arpejos para resolver frases, destacar acordes e atravessar o braço com controle.',
      },
    ],
    actions: [
      { id: 'show-arpeggio', label: 'Mostrar arpejo', type: 'toggleOverlay', payload: overlayAction('arpeggio', { chord: 'Cmaj7' }) },
      { id: 'next-shape', label: 'Mostrar próximo shape', type: 'startPractice', payload: fretboardAction('startPractice', 'C', 'Major (Ionian)', { cagedAction: 'NEXT_ARPEGGIO_SHAPE', tool: 'exercises', bpm: 68 }) },
      { id: 'play-arpeggio', label: 'Tocar arpejo', type: 'startPractice', payload: fretboardAction('startPractice', 'C', 'Major (Ionian)', { cagedAction: 'PLAY_CAGED_ARPEGGIO', chord: 'Cmaj7', tool: 'exercises', bpm: 72 }) },
    ],
  },
  {
    id: 'caged-improvisation',
    order: 11,
    title: 'CAGED e improvisação',
    subtitle: 'Use regiões como mapas de intenção, não como prisões visuais.',
    category: 'improvisation',
    difficulty: 'advanced',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'CAGED não serve apenas para decorar acordes. Serve para improvisar com consciência visual.',
      },
      {
        id: 'targets',
        eyebrow: 'Notas-alvo',
        body: 'Tônicas, terças, quintas e sétimas funcionam como pontos seguros para criar frases.',
      },
      {
        id: 'modal',
        eyebrow: 'Conexão modal',
        body: 'A região CAGED pode receber pentatônica, escala maior, modos e arpejos conforme o contexto harmônico.',
      },
    ],
    actions: [
      { id: 'backing-region', label: 'Aplicar backing region', type: 'startPractice', payload: fretboardAction('startPractice', 'C', 'Major (Ionian)', { cagedAction: 'CAGED_BACKING_REGION', tool: 'exercises', bpm: 76 }) },
      { id: 'target-notes', label: 'Mostrar notas-alvo', type: 'toggleOverlay', payload: overlayAction('degrees', { targetDegrees: ['1', '3', '5', '7'] }) },
      { id: 'related-penta', label: 'Aplicar pentatônica relacionada', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'A', 'Pentatonic Minor', { cagedAction: 'RELATED_PENTATONIC', overlays: ['scale', 'tonic'] }) },
    ],
  },
  {
    id: 'full-neck-visualization',
    order: 12,
    title: 'Visualização completa do braço',
    subtitle: 'O objetivo final é enxergar o braço inteiro como sistema contínuo.',
    category: 'visualization',
    difficulty: 'advanced',
    blocks: [
      {
        id: 'concept',
        eyebrow: 'Conceito',
        body: 'O objetivo final é enxergar o braço inteiro como um sistema contínuo, sem depender de uma posição favorita.',
      },
      {
        id: 'full-neck',
        eyebrow: 'Full neck',
        body: 'Todos os shapes conectados mostram como acordes, arpejos e escalas atravessam o instrumento.',
      },
      {
        id: 'filters',
        eyebrow: 'Filtros',
        body: 'Oculte shapes, mostre apenas tônicas, mostre apenas graus ou destaque caminhos conforme o foco de estudo.',
      },
    ],
    actions: [
      { id: 'full-neck', label: 'Mostrar full neck', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { cagedAction: 'SHOW_FULL_CAGED_NECK', fullNeck: true, overlays: ['shape', 'tonic', 'horizontalConnection'] }) },
      { id: 'only-tonics', label: 'Mostrar apenas tônicas', type: 'pendingFretboardAction', payload: fretboardAction('scale', 'C', 'Major (Ionian)', { cagedAction: 'ONLY_CAGED_TONICS', focus: 'tonics' }) },
      { id: 'highlight-paths', label: 'Destacar caminhos', type: 'toggleOverlay', payload: overlayAction('horizontalConnection', { mode: 'pathways' }) },
    ],
  },
];
