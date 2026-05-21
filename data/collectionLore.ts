export type CollectionLoreTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6';

export type CollectionLoreGroup = 'collection' | 'agallery' | 'collectors';

export type CollectionLoreCategory =
  | 'classic_headstock'
  | 'artist_series'
  | 'extended_range'
  | 'bass_collection'
  | 'collector_badge'
  | 'anniversary'
  | 'legendary';

export type CollectionLoreTone = 'educational' | 'playful' | 'premium' | 'mythic';
export type CollectionLoreLang = 'pt' | 'en';

export interface LocalizedLoreText {
  pt: string;
  en: string;
}

export interface CollectionLoreItem {
  id: string;
  fileName: string;
  title: LocalizedLoreText;
  tier: CollectionLoreTier;
  collection: CollectionLoreGroup;
  category: CollectionLoreCategory;
  tone: CollectionLoreTone;
  shortText: LocalizedLoreText;
  history?: LocalizedLoreText;
  artistInfluence?: LocalizedLoreText;
  technicalIdentity?: LocalizedLoreText;
  yearFounded?: string;
  country?: LocalizedLoreText;
  founder?: string;
  tags?: string[];
  legalNote?: LocalizedLoreText;
}

export const COLLECTION_LORE_LEGAL_NOTE: LocalizedLoreText = {
  pt: 'Referência visual educativa e colecionável, sem afiliação com marcas ou artistas mencionados.',
  en: 'Educational and collectible visual reference, with no affiliation to mentioned brands or artists.',
};

const legalNote = COLLECTION_LORE_LEGAL_NOTE;

const lore = (
  id: string,
  fileName: string,
  title: LocalizedLoreText,
  tier: CollectionLoreTier,
  collection: CollectionLoreGroup,
  category: CollectionLoreCategory,
  tone: CollectionLoreTone,
  shortText: LocalizedLoreText,
  tags: string[] = [],
  includeLegalNote = true,
): CollectionLoreItem => ({
  id,
  fileName,
  title,
  tier,
  collection,
  category,
  tone,
  shortText,
  tags,
  legalNote: includeLegalNote ? legalNote : undefined,
});

const BASE_COLLECTION_LORE: CollectionLoreItem[] = [
  lore('lore-tier0-ga6-oficial', 'tier0-ga6-oficial.webp', { pt: 'Stratocaster School', en: 'Stratocaster School' }, 'T0', 'collection', 'classic_headstock', 'educational', {
    pt: 'Referência a uma das silhuetas mais reconhecíveis da guitarra elétrica moderna, associada à clareza, versatilidade e linguagem popular.',
    en: 'A reference to one of the most recognizable silhouettes in modern electric guitar culture, associated with clarity, versatility and popular musical language.',
  }, ['guitar6', 'classic']),
  lore('lore-tier0-ga78-oficial', 'tier0-ga78-oficial.webp', { pt: 'Extended Foundation', en: 'Extended Foundation' }, 'T0', 'collection', 'extended_range', 'premium', {
    pt: 'Visual de extended range moderna para representar alcance ampliado, afinações graves e vocabulário progressivo.',
    en: 'A modern extended-range visual identity representing expanded register, lower tunings and progressive vocabulary.',
  }, ['extended', 'modern']),
  lore('lore-tier0-gab45-oficial', 'tier0-gab45-oficial.webp', { pt: 'Bass Foundation', en: 'Bass Foundation' }, 'T0', 'collection', 'bass_collection', 'educational', {
    pt: 'Base visual para baixos de quatro e cinco cordas, ligada a pulso, fundamento harmônico e sustentação rítmica.',
    en: 'A visual foundation for four and five-string basses, connected to pulse, harmonic grounding and rhythmic support.',
  }, ['bass', 'foundation']),

  lore('lore-tier1-ga6-iba', 'tier1-ga6-iba.webp', { pt: 'Modern Precision', en: 'Modern Precision' }, 'T1', 'collection', 'classic_headstock', 'premium', {
    pt: 'Inspirada em linhas modernas associadas a guitarras de alta tocabilidade, precisão técnica e linguagem fusion.',
    en: 'Inspired by modern lines associated with high-playability guitars, technical precision and fusion vocabulary.',
  }, ['guitar6', 'modern']),
  lore('lore-tier1-ga6-tag', 'tier1-ga6-tag.webp', { pt: 'Brazilian Modern', en: 'Brazilian Modern' }, 'T1', 'collection', 'classic_headstock', 'educational', {
    pt: 'Referência a uma escola brasileira moderna, com visual direto, funcional e conectado ao estudo popular do instrumento.',
    en: 'A reference to a modern Brazilian school of instrument design, direct, functional and connected to practical study.',
  }, ['guitar6', 'brazil']),
  lore('lore-tier1-ga6-tele', 'tier1-ga6-tele.webp', { pt: 'Tele Heritage', en: 'Tele Heritage' }, 'T1', 'collection', 'classic_headstock', 'premium', {
    pt: 'Homenagem estética a uma linguagem visual seca, brilhante e articulada, muito ligada a country, rock e bases limpas.',
    en: 'An aesthetic homage to a dry, bright and articulate visual language often connected to country, rock and clean rhythm parts.',
  }, ['guitar6', 'classic']),
  lore('lore-tier1-ga6-yam', 'tier1-ga6-yam.webp', { pt: 'Pacific Session', en: 'Pacific Session' }, 'T1', 'collection', 'classic_headstock', 'educational', {
    pt: 'Inspirada na versatilidade visual das guitarras de estudo sério: simples, confiável e pronta para muitos estilos.',
    en: 'Inspired by the visual versatility of serious study guitars: simple, reliable and ready for many styles.',
  }, ['guitar6', 'session']),
  lore('lore-tier1-gab45-5c', 'tier1-gab45-5c.webp', { pt: 'Five String Foundation', en: 'Five String Foundation' }, 'T1', 'collection', 'bass_collection', 'educational', {
    pt: 'Baixo moderno de cinco cordas para representar extensão grave, estabilidade rítmica e linguagem contemporânea.',
    en: 'A modern five-string bass identity representing low-register extension, rhythmic stability and contemporary language.',
  }, ['bass5', 'modern']),

  lore('lore-tier2-ga6-explorer', 'tier2-ga6-.webp', { pt: 'Angular Explorer', en: 'Angular Explorer' }, 'T2', 'collection', 'classic_headstock', 'premium', {
    pt: 'Silhueta angular inspirada na agressividade clássica do hard rock e metal, com presença visual imediata.',
    en: 'An angular silhouette inspired by the classic aggression of hard rock and metal, with immediate visual presence.',
  }, ['guitar6', 'metal']),
  lore('lore-tier2-ga6-12c', 'tier2-ga6-12c.webp', { pt: 'Twelve String Air', en: 'Twelve String Air' }, 'T2', 'collection', 'classic_headstock', 'educational', {
    pt: 'Referência ao universo das guitarras de 12 cordas, conhecidas por brilho, ambiência e textura harmônica ampla.',
    en: 'A reference to the world of 12-string guitars, known for shimmer, ambience and broad harmonic texture.',
  }, ['guitar6', '12-string']),
  lore('lore-tier2-ga6-dimdar', 'tier2-ga6-dimdar.webp', { pt: 'Southern Shred', en: 'Southern Shred' }, 'T2', 'collection', 'artist_series', 'premium', {
    pt: 'Inspirada em uma estética extrema ligada ao metal groove, harmônicos agressivos e ataques de palheta marcantes.',
    en: 'Inspired by an extreme visual language connected to groove metal, aggressive harmonics and striking pick attacks.',
  }, ['guitar6', 'metal']),
  lore('lore-tier2-ga6-fbh70', 'tier2-ga6-fbh70.webp', { pt: 'Big Head Seventies', en: 'Big Head Seventies' }, 'T2', 'collection', 'classic_headstock', 'educational', {
    pt: 'Referência aos headstocks grandes dos anos 70, ligados a uma era visualmente expansiva da guitarra elétrica.',
    en: 'A reference to large 1970s headstocks, connected to a visually expansive era of electric guitar history.',
  }, ['guitar6', '70s']),
  lore('lore-tier2-ga6-flv', 'tier2-ga6-flv.webp', { pt: 'Flying Metal', en: 'Flying Metal' }, 'T2', 'collection', 'classic_headstock', 'premium', {
    pt: 'Flying V inspirada na estética clássica do metal tradicional: teatral, direta e feita para palco.',
    en: 'A Flying V-inspired identity rooted in traditional metal aesthetics: theatrical, direct and stage-ready.',
  }, ['guitar6', 'metal']),
  lore('lore-tier2-ga6-gib', 'tier2-ga6-gib.webp', { pt: 'Open Book Memory', en: 'Open Book Memory' }, 'T2', 'collection', 'classic_headstock', 'educational', {
    pt: 'Referência ao desenho open book clássico, associado a sustain, blues, rock e acordes densos.',
    en: 'A reference to the classic open-book outline, associated with sustain, blues, rock and dense chords.',
  }, ['guitar6', 'classic']),
  lore('lore-tier2-ga6-hss', 'tier2-ga6-hss.webp', { pt: 'Headless Geometry', en: 'Headless Geometry' }, 'T2', 'collection', 'extended_range', 'premium', {
    pt: 'Inspirada na linguagem headless moderna, com foco em ergonomia, equilíbrio e visual técnico-minimalista.',
    en: 'Inspired by modern headless design language, focused on ergonomics, balance and technical minimalism.',
  }, ['guitar6', 'headless']),
  lore('lore-tier2-ga6-prs', 'tier2-ga6-prs.webp', { pt: 'Boutique Contour', en: 'Boutique Contour' }, 'T2', 'collection', 'classic_headstock', 'premium', {
    pt: 'Referência ao refinamento visual boutique: curvas limpas, acabamento sofisticado e ponte entre rock e fusion.',
    en: 'A reference to boutique visual refinement: clean curves, sophisticated finish and a bridge between rock and fusion.',
  }, ['guitar6', 'boutique']),
  lore('lore-tier2-ga6-ryric', 'tier2-ga6-ryric.webp', { pt: 'Jangle Memory', en: 'Jangle Memory' }, 'T2', 'collection', 'classic_headstock', 'educational', {
    pt: 'Inspirada em linhas clássicas associadas a timbres brilhantes, arpejos abertos e linguagem pop dos anos 60.',
    en: 'Inspired by classic lines associated with bright tones, open arpeggios and 1960s pop language.',
  }, ['guitar6', 'jangle']),
  lore('lore-tier2-ga6-suh', 'tier2-ga6-suh.webp', { pt: 'Modern Custom', en: 'Modern Custom' }, 'T2', 'collection', 'classic_headstock', 'premium', {
    pt: 'Referência a uma estética premium moderna, associada a instrumentos de alta precisão e estudo profissional.',
    en: 'A reference to a modern premium aesthetic, associated with high-precision instruments and professional study.',
  }, ['guitar6', 'premium']),
  lore('lore-tier2-ga6-zawyl', 'tier2-ga6-zawyl.webp', { pt: 'Bullseye Force', en: 'Bullseye Force' }, 'T2', 'collection', 'artist_series', 'premium', {
    pt: 'Inspirada em uma linguagem visual agressiva ligada a riffs pesados, vibratos largos e identidade de palco.',
    en: 'Inspired by an aggressive visual language connected to heavy riffs, wide vibrato and strong stage identity.',
  }, ['guitar6', 'heavy']),

  lore('lore-tier3-ga6-budguy', 'tier3 - ga6 - budguy.webp', { pt: 'Polka Blues', en: 'Polka Blues' }, 'T3', 'collection', 'artist_series', 'playful', {
    pt: 'Inspirada na expressividade visual do blues elétrico, com fraseado vocal, bends amplos e presença de palco.',
    en: 'Inspired by the visual expressiveness of electric blues, with vocal phrasing, wide bends and stage presence.',
  }, ['guitar6', 'blues']),
  lore('lore-tier3-ga6-jmayer', 'tier3 - ga6 - jmayer.webp', { pt: 'Modern Blues Session', en: 'Modern Blues Session' }, 'T3', 'collection', 'artist_series', 'premium', {
    pt: 'Referência ao blues moderno de timbre limpo, dinâmica controlada e frases econômicas com forte identidade.',
    en: 'A reference to modern blues with clean tone, controlled dynamics and economical phrases with strong identity.',
  }, ['guitar6', 'blues']),
  lore('lore-tier3-ga6-metall', 'tier3 - ga6 - metall.webp', { pt: 'Thrash Architecture', en: 'Thrash Architecture' }, 'T3', 'collection', 'artist_series', 'premium', {
    pt: 'Inspirada na estética thrash: palhetada precisa, riffs angulares, energia escura e impacto rítmico.',
    en: 'Inspired by thrash aesthetics: precise picking, angular riffs, dark energy and rhythmic impact.',
  }, ['guitar6', 'thrash']),
  lore('lore-tier3-ga6-svai', 'tier3 - ga6 - svai.webp', { pt: 'Cosmic Virtuoso', en: 'Cosmic Virtuoso' }, 'T3', 'collection', 'artist_series', 'mythic', {
    pt: 'Referência a uma identidade técnica e futurista, ligada a whammy, intervalos amplos e imaginário virtuoso.',
    en: 'A reference to a technical and futuristic identity, connected to whammy work, wide intervals and virtuoso imagination.',
  }, ['guitar6', 'virtuoso']),
  lore('lore-tier3-ga6-tedg', 'tier3 - ga6 - tedg.webp', { pt: 'Arena Wildcard', en: 'Arena Wildcard' }, 'T3', 'collection', 'artist_series', 'premium', {
    pt: 'Item de acervo com referência visual ainda em calibragem editorial, preservado como linguagem de palco e energia rock.',
    en: 'An archive item with its visual reference still under editorial calibration, preserved as stage language and rock energy.',
  }, ['guitar6', 'arena']),
  lore('lore-tier3-ga6-ericlap', 'tier3 - ga6 -ericlap.webp', { pt: 'Slowhand Elegance', en: 'Slowhand Elegance' }, 'T3', 'collection', 'artist_series', 'premium', {
    pt: 'Inspirada na elegância clássica do blues-rock, com visual contido, fraseado melódico e timbre cantado.',
    en: 'Inspired by classic blues-rock elegance, with restrained visuals, melodic phrasing and a singing tone.',
  }, ['guitar6', 'blues']),
  lore('lore-tier3-gab45-clif', 'tier3 - gab45 - clif.webp', { pt: 'Distorted Low End', en: 'Distorted Low End' }, 'T3', 'collection', 'bass_collection', 'premium', {
    pt: 'Referência a um baixo agressivo, distorcido e melódico, onde a linha grave também vira protagonista.',
    en: 'A reference to aggressive, distorted and melodic bass language, where the low end becomes a protagonist.',
  }, ['bass', 'metal']),
  lore('lore-tier3-gab45-ged', 'tier3 - gab45 - ged.webp', { pt: 'Progressive Low End', en: 'Progressive Low End' }, 'T3', 'collection', 'bass_collection', 'premium', {
    pt: 'Inspirada em uma linguagem progressiva de baixo, com ataque presente, linhas melódicas e precisão rítmica.',
    en: 'Inspired by progressive bass language, with present attack, melodic lines and rhythmic precision.',
  }, ['bass', 'prog']),
  lore('lore-tier3-gab45-lemm', 'tier3 - gab45 - lemm.webp', { pt: 'Overdrive Bass', en: 'Overdrive Bass' }, 'T3', 'collection', 'bass_collection', 'premium', {
    pt: 'Referência a uma estética crua e agressiva, onde o baixo ocupa o espaço de motor rítmico e parede sonora.',
    en: 'A reference to a raw and aggressive aesthetic, where bass acts as both rhythmic engine and sound wall.',
  }, ['bass', 'rock']),

  lore('lore-tier4-ga6-bbking', 'tier4-ga6-bbking.webp', { pt: 'Lucille Memory', en: 'Lucille Memory' }, 'T4', 'collection', 'artist_series', 'mythic', {
    pt: 'Inspirada na sofisticação blues, vibrato vocal e frases que transformam poucas notas em narrativa.',
    en: 'Inspired by blues sophistication, vocal vibrato and phrases that turn a few notes into narrative.',
  }, ['guitar6', 'blues']),
  lore('lore-tier4-ga6-beat', 'tier4-ga6-beat.webp', { pt: 'British Chime', en: 'British Chime' }, 'T4', 'collection', 'artist_series', 'premium', {
    pt: 'Referência estética ao universo beat, aos timbres jangly e a uma escrita de acordes clara e memorável.',
    en: 'An aesthetic reference to beat-era language, jangly tones and clear, memorable chord writing.',
  }, ['guitar6', 'british']),
  lore('lore-tier4-ga6-evh', 'tier4-ga6-evh.webp', { pt: 'Arena Burst', en: 'Arena Burst' }, 'T4', 'collection', 'artist_series', 'mythic', {
    pt: 'Inspirada em uma linguagem visual explosiva, ligada a tapping, harmônicos, energia de palco e reinvenção técnica.',
    en: 'Inspired by an explosive visual language connected to tapping, harmonics, stage energy and technical reinvention.',
  }, ['guitar6', 'arena']),
  lore('lore-tier4-ga6-jimhendrix', 'tier4-ga6-jimhendrix.webp', { pt: 'Reverse Psychedelic', en: 'Reverse Psychedelic' }, 'T4', 'collection', 'artist_series', 'mythic', {
    pt: 'Referência à Stratocaster invertida, fuzz, psicodelia e uma abordagem expansiva do instrumento como voz.',
    en: 'A reference to the reversed Stratocaster, fuzz, psychedelia and an expansive approach to the instrument as a voice.',
  }, ['guitar6', 'psychedelic']),
  lore('lore-tier4-ga6-kirhm', 'tier4-ga6-kirhm.webp', { pt: 'Lead Explorer', en: 'Lead Explorer' }, 'T4', 'collection', 'artist_series', 'mythic', {
    pt: 'Explorer inspirada na agressividade visual do thrash, associada a solos cortantes e fraseado dramático.',
    en: 'An Explorer-inspired identity rooted in thrash visual aggression, cutting solos and dramatic phrasing.',
  }, ['guitar6', 'thrash']),
  lore('lore-tier4-ga6-slash', 'tier4-ga6-slash.webp', { pt: 'Velvet Top', en: 'Velvet Top' }, 'T4', 'collection', 'artist_series', 'premium', {
    pt: 'Inspirada na linguagem clássica do rock de Les Paul, sustain longo, bends emotivos e fraseado cantado.',
    en: 'Inspired by classic Les Paul rock language, long sustain, emotional bends and singing lead phrasing.',
  }, ['guitar6', 'rock']),
  lore('lore-tier4-ga6-srv', 'tier4-ga6-srv.webp', { pt: 'Texas Heavy Blues', en: 'Texas Heavy Blues' }, 'T4', 'collection', 'artist_series', 'mythic', {
    pt: 'Referência ao blues pesado, ataque forte, cordas grossas e energia intensa em linguagem tradicional.',
    en: 'A reference to heavy blues, strong attack, thick strings and intense energy inside a traditional language.',
  }, ['guitar6', 'blues']),
  lore('lore-tier4-gab45-flea', 'tier4-gab45-flea.webp', { pt: 'Funk Voltage', en: 'Funk Voltage' }, 'T4', 'collection', 'bass_collection', 'playful', {
    pt: 'Inspirada na energia visual do funk-rock, slap explosivo, movimento corporal e linhas graves saltitantes.',
    en: 'Inspired by funk-rock visual energy, explosive slap, physical movement and bouncing bass lines.',
  }, ['bass', 'funk']),
  lore('lore-tier4-gab45-jaco', 'tier4-gab45-jaco.webp', { pt: 'Fretless Voice', en: 'Fretless Voice' }, 'T4', 'collection', 'bass_collection', 'mythic', {
    pt: 'Referência à estética fretless, harmônicos artificiais, melodias graves e um baixo que canta.',
    en: 'A reference to fretless aesthetics, artificial harmonics, low-register melodies and a bass that sings.',
  }, ['bass', 'fretless']),
  lore('lore-tier4-gab45-paulm', 'tier4-gab45-paulm.webp', { pt: 'Violin Bass Legacy', en: 'Violin Bass Legacy' }, 'T4', 'collection', 'bass_collection', 'mythic', {
    pt: 'Inspirada no baixo violin, associado a linhas melódicas, simplicidade elegante e imaginário beat.',
    en: 'Inspired by violin-bass imagery, associated with melodic lines, elegant simplicity and beat-era memory.',
  }, ['bass', 'classic']),

  lore('lore-tier5-tga6-angyo', 'tier5-tga6-angyo.webp', { pt: 'Schoolboy Thunder', en: 'Schoolboy Thunder' }, 'T5', 'collection', 'artist_series', 'mythic', {
    pt: 'Inspirada em uma SG agressiva, riffs diretos, energia elétrica e linguagem rock sem rodeios.',
    en: 'Inspired by an aggressive SG-style language, direct riffs, electric energy and no-frills rock vocabulary.',
  }, ['guitar6', 'rock']),
  lore('lore-tier5-tga6-bmay', 'tier5-tga6-bmay.webp', { pt: 'Red Special Orbit', en: 'Red Special Orbit' }, 'T5', 'collection', 'artist_series', 'mythic', {
    pt: 'Referência a uma linguagem orquestral de guitarra, harmonias em camadas e identidade visual singular.',
    en: 'A reference to orchestral guitar language, layered harmonies and a singular visual identity.',
  }, ['guitar6', 'orchestral']),
  lore('lore-tier5-tga6-dgil', 'tier5-tga6-dgil.webp', { pt: 'Ambient Sustain', en: 'Ambient Sustain' }, 'T5', 'collection', 'artist_series', 'mythic', {
    pt: 'Inspirada em uma linguagem atmosférica, bends longos, delay expressivo e fraseado espacial.',
    en: 'Inspired by atmospheric guitar language, long bends, expressive delay and spacious phrasing.',
  }, ['guitar6', 'ambient']),
  lore('lore-tier5-tga6-keyric', 'tier5-tga6-keyric.webp', { pt: 'Open G Classic', en: 'Open G Classic' }, 'T5', 'collection', 'artist_series', 'premium', {
    pt: 'Referência ao rock cru, riffs em afinações abertas, economia harmônica e assinatura rítmica inconfundível.',
    en: 'A reference to raw rock, open-tuning riffs, harmonic economy and unmistakable rhythmic identity.',
  }, ['guitar6', 'open-g']),

  lore('lore-tier6-ga6-jhdrix', 'tier6 - ga6 - jhdrix.webp', { pt: 'Mythic Psychedelic', en: 'Mythic Psychedelic' }, 'T6', 'collection', 'legendary', 'mythic', {
    pt: 'Versão estilizada ligada a uma linguagem lendária de fuzz, palco, improviso e expansão total da guitarra.',
    en: 'A stylized version connected to legendary fuzz, stage presence, improvisation and total guitar expansion.',
  }, ['guitar6', 'legendary']),
  lore('lore-tier6-ga78-tabas', 'tier6 - ga78 - tabas.webp', { pt: 'Extended Architect', en: 'Extended Architect' }, 'T6', 'collection', 'extended_range', 'mythic', {
    pt: 'Inspirada na estética progressiva das extended range modernas, com polirritmia, precisão e desenho futurista.',
    en: 'Inspired by modern extended-range progressive aesthetics, with polyrhythm, precision and futuristic design.',
  }, ['extended', 'prog']),
  lore('lore-tier6-gab45-jpast', 'tier6 - gab45 - jpast.webp', { pt: 'Fretless Architect', en: 'Fretless Architect' }, 'T6', 'collection', 'legendary', 'mythic', {
    pt: 'Versão estilizada inspirada em uma linguagem icônica de baixo fretless, harmônicos e melodias fluidas.',
    en: 'A stylized version inspired by iconic fretless bass language, harmonics and fluid melodies.',
  }, ['bass', 'legendary']),

  ...Array.from({ length: 10 }, (_, index): CollectionLoreItem => {
    const year = index + 1;
    return lore(
      `lore-anniversary-${year}`,
      year === 1 ? 'ga1ano.webp' : `ga${year}anos.webp`,
      { pt: `${year} ${year === 1 ? 'ano' : 'anos'} de Guitar Architect`, en: `${year} ${year === 1 ? 'year' : 'years'} of Guitar Architect` },
      'T0',
      'agallery',
      'anniversary',
      'premium',
      {
        pt: 'Um marco da evolução contínua do Guitar Architect, liberado como registro histórico para usuários daquele ciclo.',
        en: 'A milestone in the ongoing evolution of Guitar Architect, released as a historical marker for users of that cycle.',
      },
      ['anniversary', 'legacy'],
      false,
    );
  }),
  lore('lore-collector-01', 'toc01.webp', { pt: 'Primeiro Instrumento', en: 'First Instrument' }, 'T0', 'collectors', 'collector_badge', 'playful', {
    pt: 'Primeiro instrumento no arsenal. A coleção começa quando o primeiro som ganha nome.',
    en: 'First instrument in the arsenal. The collection begins when the first sound gets a name.',
  }, ['collector', 'instrument'], false),
  lore('lore-collector-03', 'toc03.webp', { pt: 'Coleção em Forma', en: 'Collection Taking Shape' }, 'T1', 'collectors', 'collector_badge', 'playful', {
    pt: 'A coleção começou a tomar forma: três instrumentos já contam histórias diferentes.',
    en: 'The collection has started to take shape: three instruments already tell different stories.',
  }, ['collector', 'instrument'], false),
  lore('lore-collector-05', 'toc05.webp', { pt: 'Pequeno Estúdio', en: 'Small Studio' }, 'T2', 'collectors', 'collector_badge', 'playful', {
    pt: 'Agora já existe um pequeno estúdio aí. Cinco instrumentos mudam completamente o mapa sonoro.',
    en: 'Now there is a small studio in there. Five instruments completely change the sound map.',
  }, ['collector', 'instrument'], false),
  lore('lore-collector-08', 'toc08.webp', { pt: 'Arsenal Sonoro', en: 'Sonic Arsenal' }, 'T3', 'collectors', 'collector_badge', 'playful', {
    pt: 'Você definitivamente não consegue escolher só um. Oito instrumentos já formam uma paleta autoral.',
    en: 'You definitely cannot choose just one. Eight instruments already form a personal palette.',
  }, ['collector', 'instrument'], false),
  lore('lore-collector-10', 'toc10.webp', { pt: 'Patrimônio Musical', en: 'Musical Heritage' }, 'T4', 'collectors', 'collector_badge', 'playful', {
    pt: 'Isso já deixou de ser coleção. Virou patrimônio musical, arquivo afetivo e laboratório de timbres.',
    en: 'This is no longer just a collection. It has become musical heritage, emotional archive and tone laboratory.',
  }, ['collector', 'instrument'], false),
];

const LORE_DETAILS: Record<string, Partial<CollectionLoreItem>> = {
  'lore-tier0-ga6-oficial': {
    history: {
      pt: 'A Stratocaster ajudou a definir a guitarra moderna com ergonomia inovadora, três captadores e enorme versatilidade sonora.',
      en: 'The Stratocaster helped define the modern electric guitar through innovative ergonomics, three pickups and broad sonic versatility.',
    },
    technicalIdentity: {
      pt: 'Corpo confortável, ataque claro, timbre articulado e forte presença em blues, rock, pop, funk e fusion.',
      en: 'Comfortable body design, clear attack, articulate tone and strong presence in blues, rock, pop, funk and fusion.',
    },
    yearFounded: '1954',
    country: { pt: 'Estados Unidos', en: 'United States' },
    founder: 'Leo Fender',
  },
  'lore-tier0-ga78-oficial': {
    history: {
      pt: 'As guitarras extended range ampliaram o vocabulário moderno ao levar registros graves, acordes abertos e riffs polirrítmicos para o centro da linguagem progressiva.',
      en: 'Extended-range guitars expanded modern vocabulary by bringing lower registers, open voicings and polyrhythmic riffs into progressive language.',
    },
    technicalIdentity: {
      pt: 'Tensão de cordas mais grave, alcance ampliado e visual técnico pensado para precisão e arquitetura harmônica.',
      en: 'Lower string tension planning, expanded range and a technical visual identity built for precision and harmonic architecture.',
    },
  },
  'lore-tier0-gab45-oficial': {
    history: {
      pt: 'O baixo elétrico moderno consolidou a ponte entre harmonia e ritmo, tornando o groove uma estrutura central da música popular.',
      en: 'The modern electric bass became the bridge between harmony and rhythm, making groove a central structure in popular music.',
    },
    technicalIdentity: {
      pt: 'Foco em fundamento, estabilidade rítmica, leitura do campo harmônico e condução entre acordes.',
      en: 'Focused on foundation, rhythmic stability, harmonic-field awareness and movement between chords.',
    },
  },
  'lore-tier1-ga6-iba': {
    history: {
      pt: 'A escola moderna de guitarras técnicas ganhou força ao combinar braços rápidos, ergonomia agressiva e grande presença no rock instrumental.',
      en: 'The modern school of technical guitars grew by combining fast necks, aggressive ergonomics and strong presence in instrumental rock.',
    },
    technicalIdentity: {
      pt: 'Pensada para palhetada precisa, legato, fusão e estudo técnico com sensação de instrumento contemporâneo.',
      en: 'Designed around precise picking, legato, fusion and technical study with a contemporary instrument feel.',
    },
  },
  'lore-tier1-ga6-tag': {
    history: {
      pt: 'A referência brasileira reforça a ideia de instrumento acessível, versátil e conectado à prática real de estudantes e músicos de palco.',
      en: 'The Brazilian reference reinforces the idea of an accessible, versatile instrument connected to real practice for students and stage players.',
    },
    technicalIdentity: {
      pt: 'Visual direto, vocação para estudo diário e boa transição entre acordes, escalas e repertório popular.',
      en: 'Direct visual language, daily-study vocation and smooth transition between chords, scales and popular repertoire.',
    },
  },
  'lore-tier1-ga6-tele': {
    history: {
      pt: 'A Telecaster se tornou símbolo de simplicidade funcional, ataque brilhante e enorme presença em country, rock e música de estúdio.',
      en: 'The Telecaster became a symbol of functional simplicity, bright attack and huge presence in country, rock and studio music.',
    },
    technicalIdentity: {
      pt: 'Ataque seco, leitura clara de acordes e resposta dinâmica excelente para bases limpas e riffs objetivos.',
      en: 'Dry attack, clear chord reading and excellent dynamic response for clean rhythm parts and direct riffs.',
    },
    yearFounded: '1950',
    country: { pt: 'Estados Unidos', en: 'United States' },
  },
  'lore-tier1-ga6-yam': {
    history: {
      pt: 'As guitarras de perfil session representam confiabilidade, neutralidade musical e capacidade de atravessar estilos sem impor uma estética única.',
      en: 'Session-style guitars represent reliability, musical neutrality and the ability to cross genres without imposing a single aesthetic.',
    },
    technicalIdentity: {
      pt: 'Boa plataforma para escalas, acordes, técnica inicial e exploração de timbres sem excesso de especialização.',
      en: 'A solid platform for scales, chords, early technique and tone exploration without excessive specialization.',
    },
  },
  'lore-tier1-gab45-5c': {
    history: {
      pt: 'O baixo de cinco cordas abriu espaço para registros graves mais profundos em gospel, fusion, metal, pop moderno e música de estúdio.',
      en: 'The five-string bass opened deeper low-register territory in gospel, fusion, metal, modern pop and studio work.',
    },
    technicalIdentity: {
      pt: 'Ideal para estudar extensão grave, controle de ruído, digitação ampla e condução harmônica com mais alcance.',
      en: 'Ideal for studying low-register extension, muting control, wider fingering and harmonic movement with greater range.',
    },
  },
  'lore-tier2-ga6-explorer': {
    history: {
      pt: 'A Explorer marcou a cultura rock por unir geometria futurista e presença visual extrema, tornando-se ícone de palco pesado.',
      en: 'The Explorer marked rock culture by combining futuristic geometry with extreme visual presence, becoming a heavy-stage icon.',
    },
    technicalIdentity: {
      pt: 'Forma angular, atitude agressiva e associação natural com riffs fortes, power chords e postura de palco.',
      en: 'Angular form, aggressive attitude and natural association with strong riffs, power chords and stage stance.',
    },
  },
  'lore-tier2-ga6-12c': {
    history: {
      pt: 'As guitarras de 12 cordas ganharam espaço em arranjos pop e folk por criar brilho coral e sensação de largura harmônica.',
      en: 'Twelve-string guitars found space in pop and folk arrangements by creating choral shimmer and harmonic width.',
    },
    technicalIdentity: {
      pt: 'Som dobrado, ataque cintilante, arpejos largos e textura ideal para camadas atmosféricas.',
      en: 'Doubled sound, shimmering attack, wide arpeggios and texture suited for atmospheric layers.',
    },
  },
  'lore-tier2-ga6-dimdar': {
    artistInfluence: {
      pt: 'O universo associado a Dimebag Darrell remete a riffs de groove metal, harmônicos gritados e energia extrema.',
      en: 'The universe associated with Dimebag Darrell evokes groove-metal riffs, screaming harmonics and extreme energy.',
    },
    technicalIdentity: {
      pt: 'Identidade agressiva para palhetada forte, bends radicais, riffs sincopados e estudo de precisão pesada.',
      en: 'Aggressive identity for strong picking, radical bends, syncopated riffs and heavy precision study.',
    },
  },
  'lore-tier2-ga6-fbh70': {
    history: {
      pt: 'Os grandes headstocks dos anos 70 carregam uma assinatura visual ligada a palco, psicodelia tardia e rock de alto volume.',
      en: 'Large 1970s headstocks carry a visual signature tied to stage presence, late psychedelia and loud rock.',
    },
    technicalIdentity: {
      pt: 'Visual de época com sensação de instrumento robusto, aberto e feito para bases fortes.',
      en: 'Period visual language with the feeling of a robust, open instrument built for strong rhythm parts.',
    },
  },
  'lore-tier2-ga6-flv': {
    history: {
      pt: 'A Flying V tornou-se um dos formatos mais reconhecíveis do rock e do metal por seu visual agressivo e futurista.',
      en: 'The Flying V became one of rock and metal’s most recognizable shapes through its aggressive and futuristic look.',
    },
    technicalIdentity: {
      pt: 'Formato teatral, forte leitura de palco e associação direta com riffs, solos e energia de performance.',
      en: 'Theatrical shape, strong stage readability and direct association with riffs, solos and performance energy.',
    },
  },
  'lore-tier2-ga6-gib': {
    history: {
      pt: 'Criada por Orville Gibson no início do século XX, a escola Gibson tornou-se símbolo de sustain encorpado, visual clássico e sonoridade marcante.',
      en: 'Founded by Orville Gibson in the early 20th century, the Gibson school became a symbol of thick sustain, classic visuals and distinctive tone.',
    },
    technicalIdentity: {
      pt: 'Vocação para timbres densos, acordes cheios, leads cantados e linguagem de blues, jazz e rock clássico.',
      en: 'Suited for dense tones, full chords, singing leads and blues, jazz and classic-rock language.',
    },
    country: { pt: 'Estados Unidos', en: 'United States' },
    founder: 'Orville Gibson',
  },
  'lore-tier2-ga6-hss': {
    history: {
      pt: 'As guitarras headless modernizaram ergonomia, equilíbrio e precisão, tornando-se símbolo da guitarra progressiva contemporânea.',
      en: 'Headless guitars modernized ergonomics, balance and precision, becoming symbols of contemporary progressive guitar.',
    },
    technicalIdentity: {
      pt: 'Construção compacta, resposta estável e visual técnico ideal para estudo moderno e extended vocabulary.',
      en: 'Compact construction, stable response and technical visual identity suited for modern study and extended vocabulary.',
    },
  },
  'lore-tier2-ga6-prs': {
    history: {
      pt: 'A PRS uniu acabamento refinado, ergonomia moderna e versatilidade sonora, consolidando-se como referência premium contemporânea.',
      en: 'PRS combined refined finishing, modern ergonomics and tonal versatility, becoming a contemporary premium reference.',
    },
    technicalIdentity: {
      pt: 'Equilíbrio entre sustain, conforto, clareza e estética boutique voltada a músicos versáteis.',
      en: 'Balance between sustain, comfort, clarity and boutique aesthetics for versatile players.',
    },
  },
  'lore-tier2-ga6-ryric': {
    history: {
      pt: 'Conhecida por timbres brilhantes e visual distinto, a Rickenbacker tornou-se um dos símbolos da invasão britânica dos anos 60.',
      en: 'Known for bright tones and distinctive visuals, Rickenbacker became one of the symbols of the 1960s British Invasion.',
    },
    technicalIdentity: {
      pt: 'Timbre jangle, acordes abertos, arpejos cintilantes e forte presença em pop, rock alternativo e arranjos limpos.',
      en: 'Jangle tone, open chords, shimmering arpeggios and strong presence in pop, alternative rock and clean arrangements.',
    },
  },
  'lore-tier2-ga6-suh': {
    history: {
      pt: 'A estética boutique moderna prioriza precisão, acabamento discreto e performance profissional sem perder musicalidade.',
      en: 'Modern boutique aesthetics prioritize precision, understated finishing and professional performance without losing musicality.',
    },
    technicalIdentity: {
      pt: 'Vocação para afinação estável, resposta clara, técnica refinada e transição fluida entre timbres.',
      en: 'Built around tuning stability, clear response, refined technique and fluid transition between tones.',
    },
  },
  'lore-tier2-ga6-zawyl': {
    artistInfluence: {
      pt: 'O universo associado a Zakk Wylde remete a vibratos largos, riffs pesados, pentatônicas agressivas e presença visual marcante.',
      en: 'The universe associated with Zakk Wylde evokes wide vibrato, heavy riffs, aggressive pentatonics and strong visual presence.',
    },
    technicalIdentity: {
      pt: 'Ideal para estudos de bend, vibrato, palhetada forte e fraseado pentatônico pesado.',
      en: 'Ideal for bend, vibrato, strong picking and heavy pentatonic phrasing studies.',
    },
  },
  'lore-tier3-ga6-budguy': {
    artistInfluence: {
      pt: 'Buddy Guy é referência de blues elétrico expressivo, com dinâmica explosiva, fraseado vocal e teatralidade emocional.',
      en: 'Buddy Guy is a reference in expressive electric blues, with explosive dynamics, vocal phrasing and emotional theatricality.',
    },
    technicalIdentity: {
      pt: 'Bends amplos, repetição expressiva, dinâmica extrema e resposta emocional imediata.',
      en: 'Wide bends, expressive repetition, extreme dynamics and immediate emotional response.',
    },
  },
  'lore-tier3-ga6-jmayer': {
    artistInfluence: {
      pt: 'John Mayer representa uma ponte entre blues moderno, pop sofisticado e fraseado limpo de forte controle dinâmico.',
      en: 'John Mayer represents a bridge between modern blues, sophisticated pop and clean phrasing with strong dynamic control.',
    },
    technicalIdentity: {
      pt: 'Double-stops, tríades pequenas, bends contidos, grooves limpos e melodia em primeiro plano.',
      en: 'Double-stops, small triads, restrained bends, clean grooves and melody in the foreground.',
    },
  },
  'lore-tier3-ga6-metall': {
    artistInfluence: {
      pt: 'O universo Metallica consolidou a palhetada precisa, riffs de thrash e energia rítmica pesada como linguagem global.',
      en: 'The Metallica universe consolidated precise picking, thrash riffs and heavy rhythmic energy as a global language.',
    },
    technicalIdentity: {
      pt: 'Downpicking, riffs palm-muted, tensão harmônica e articulação firme em alta energia.',
      en: 'Downpicking, palm-muted riffs, harmonic tension and firm articulation at high energy.',
    },
  },
  'lore-tier3-ga6-svai': {
    artistInfluence: {
      pt: 'Steve Vai tornou-se referência de virtuosismo moderno ao unir teatralidade, técnica extrema e linguagem harmônica sofisticada.',
      en: 'Steve Vai became a reference in modern virtuosity by combining theatricality, extreme technique and sophisticated harmonic language.',
    },
    technicalIdentity: {
      pt: 'Intervalos amplos, whammy bar, legato fluido, modulações e fraseado de imaginação cinematográfica.',
      en: 'Wide intervals, whammy bar, fluid legato, modulations and cinematic imagination in phrasing.',
    },
  },
  'lore-tier3-ga6-tedg': {
    history: {
      pt: 'Referência ao universo sonoro associado ao The Edge, em que delay, repetição e textura transformam acordes simples em arquitetura espacial.',
      en: 'A reference to the sonic universe associated with The Edge, where delay, repetition and texture turn simple chords into spatial architecture.',
    },
    artistInfluence: {
      pt: 'A linguagem do U2 mostrou como guitarra pode funcionar como ambiente, pulso e paisagem, criando identidade por camadas rítmicas e ecos precisos.',
      en: 'U2’s guitar language showed how the instrument can become atmosphere, pulse and landscape, building identity through rhythmic layers and precise echoes.',
    },
    technicalIdentity: {
      pt: 'Delay pontuado, acordes suspensos, arpejos repetitivos, uso de espaço e construção rítmica minimalista.',
      en: 'Dotted delay, suspended chords, repeated arpeggios, use of space and minimalist rhythmic construction.',
    },
  },
  'lore-tier3-ga6-ericlap': {
    artistInfluence: {
      pt: 'Eric Clapton ajudou a consolidar uma abordagem melódica e expressiva do blues-rock, marcada por bends vocais, sustain limpo e fraseado contido.',
      en: 'Eric Clapton helped consolidate a melodic and expressive blues-rock approach marked by vocal bends, clean sustain and restrained phrasing.',
    },
    technicalIdentity: {
      pt: 'Elegância, economia de notas, resolução melódica e timbre voltado à expressividade.',
      en: 'Elegance, note economy, melodic resolution and tone shaped around expressiveness.',
    },
  },
  'lore-tier3-gab45-clif': {
    artistInfluence: {
      pt: 'Cliff Burton expandiu o papel do baixo no metal ao usar distorção, fraseado melódico e presença quase solista.',
      en: 'Cliff Burton expanded the role of bass in metal through distortion, melodic phrasing and almost soloistic presence.',
    },
    technicalIdentity: {
      pt: 'Drive, linhas agressivas, passagens melódicas e domínio de energia em registros graves.',
      en: 'Drive, aggressive lines, melodic passages and command of energy in the low register.',
    },
  },
  'lore-tier3-gab45-ged': {
    artistInfluence: {
      pt: 'Geddy Lee elevou o baixo progressivo com linhas independentes, ataque presente e pensamento melódico dentro de métricas complexas.',
      en: 'Geddy Lee elevated progressive bass with independent lines, present attack and melodic thinking inside complex meters.',
    },
    technicalIdentity: {
      pt: 'Linhas móveis, articulação clara, independência rítmica e condução harmônica ativa.',
      en: 'Moving lines, clear articulation, rhythmic independence and active harmonic movement.',
    },
  },
  'lore-tier3-gab45-lemm': {
    artistInfluence: {
      pt: 'Lemmy transformou o baixo em motor de rock cru, com ataque distorcido, postura frontal e energia implacável.',
      en: 'Lemmy turned bass into a raw rock engine, with distorted attack, front-facing stance and relentless energy.',
    },
    technicalIdentity: {
      pt: 'Ataque forte, saturação, riffs diretos e sensação de parede sonora.',
      en: 'Strong attack, saturation, direct riffs and a wall-of-sound feel.',
    },
  },
  'lore-tier4-ga6-bbking': {
    artistInfluence: {
      pt: 'B.B. King mostrou que uma nota pode carregar uma história inteira quando vibrato, silêncio e intenção estão no centro.',
      en: 'B.B. King showed that a single note can carry a whole story when vibrato, silence and intention are central.',
    },
    technicalIdentity: {
      pt: 'Vibrato vocal, frases curtas, controle de espaço e resolução emocional.',
      en: 'Vocal vibrato, short phrases, control of space and emotional resolution.',
    },
  },
  'lore-tier4-ga6-beat': {
    artistInfluence: {
      pt: 'O universo Beatles/Rickenbacker remete a timbres brilhantes, arranjos econômicos e melodias que redefiniram a música pop.',
      en: 'The Beatles/Rickenbacker universe evokes bright tones, economical arrangements and melodies that redefined pop music.',
    },
    technicalIdentity: {
      pt: 'Acordes abertos, arpejos limpos, brilho de médio-agudo e forte identidade de arranjo.',
      en: 'Open chords, clean arpeggios, upper-mid brightness and strong arrangement identity.',
    },
  },
  'lore-tier4-ga6-evh': {
    artistInfluence: {
      pt: 'Eddie Van Halen redefiniu a guitarra de palco com tapping, harmônicos, timbre explosivo e uma linguagem visual imediatamente reconhecível.',
      en: 'Eddie Van Halen redefined stage guitar with tapping, harmonics, explosive tone and instantly recognizable visual language.',
    },
    technicalIdentity: {
      pt: 'Tapping, alavanca, harmônicos, velocidade e sensação de diversão técnica.',
      en: 'Tapping, whammy work, harmonics, speed and a sense of technical playfulness.',
    },
  },
  'lore-tier4-ga6-jimhendrix': {
    artistInfluence: {
      pt: 'Jimi Hendrix redefiniu a guitarra elétrica ao unir psicodelia, blues e experimentação sonora, expandindo os limites técnicos e criativos do instrumento.',
      en: 'Jimi Hendrix redefined electric guitar by uniting psychedelia, blues and sonic experimentation, expanding the instrument’s technical and creative limits.',
    },
    technicalIdentity: {
      pt: 'Fuzz, alavanca, acordes com polegar, feedback musical e sensação de instrumento vivo.',
      en: 'Fuzz, whammy bar, thumbed chords, musical feedback and the feeling of a living instrument.',
    },
  },
  'lore-tier4-ga6-kirhm': {
    artistInfluence: {
      pt: 'Kirk Hammett consolidou uma estética de solos dramáticos, wah expressivo e linguagem lead dentro do thrash metal.',
      en: 'Kirk Hammett consolidated an aesthetic of dramatic solos, expressive wah and lead language inside thrash metal.',
    },
    technicalIdentity: {
      pt: 'Wah, pentatônicas rápidas, cromatismos, tensão e ataque cortante.',
      en: 'Wah, fast pentatonics, chromaticism, tension and cutting attack.',
    },
  },
  'lore-tier4-ga6-slash': {
    artistInfluence: {
      pt: 'Slash representa uma linguagem clássica de rock marcada por sustain, bends emotivos e solos que soam cantáveis.',
      en: 'Slash represents a classic rock language marked by sustain, emotional bends and solos that feel singable.',
    },
    technicalIdentity: {
      pt: 'Pentatônicas, vibrato largo, timbre quente e fraseado melódico.',
      en: 'Pentatonics, wide vibrato, warm tone and melodic phrasing.',
    },
  },
  'lore-tier4-ga6-srv': {
    artistInfluence: {
      pt: 'Stevie Ray Vaughan trouxe ao blues moderno ataque intenso, shuffle pesado e uma presença física que transformava dinâmica em identidade.',
      en: 'Stevie Ray Vaughan brought intense attack, heavy shuffle and physical presence to modern blues, turning dynamics into identity.',
    },
    technicalIdentity: {
      pt: 'Cordas pesadas, ataque forte, shuffle, double-stops e vibrato agressivo.',
      en: 'Heavy strings, strong attack, shuffle, double-stops and aggressive vibrato.',
    },
  },
  'lore-tier4-gab45-flea': {
    artistInfluence: {
      pt: 'Flea associou baixo a movimento, energia funk, slap explosivo e presença cênica irreverente.',
      en: 'Flea associated bass with movement, funk energy, explosive slap and irreverent stage presence.',
    },
    technicalIdentity: {
      pt: 'Slap, ghost notes, grooves saltitantes e interação forte com bateria.',
      en: 'Slap, ghost notes, bouncing grooves and strong interaction with drums.',
    },
  },
  'lore-tier4-gab45-jaco': {
    artistInfluence: {
      pt: 'Jaco Pastorius transformou o baixo fretless em voz solista, explorando harmônicos, melodias e articulação fluida.',
      en: 'Jaco Pastorius turned fretless bass into a solo voice, exploring harmonics, melodies and fluid articulation.',
    },
    technicalIdentity: {
      pt: 'Fretless, harmônicos, linhas melódicas, groove refinado e afinação sensível.',
      en: 'Fretless tone, harmonics, melodic lines, refined groove and sensitive intonation.',
    },
  },
  'lore-tier4-gab45-paulm': {
    artistInfluence: {
      pt: 'Paul McCartney consolidou o baixo como ferramenta melódica dentro da canção, com linhas memoráveis e função harmônica clara.',
      en: 'Paul McCartney established bass as a melodic tool inside songwriting, with memorable lines and clear harmonic function.',
    },
    technicalIdentity: {
      pt: 'Contramelodias, simplicidade musical, condução de acordes e identidade de arranjo.',
      en: 'Countermelodies, musical simplicity, chord movement and arrangement identity.',
    },
  },
  'lore-tier5-tga6-angyo': {
    artistInfluence: {
      pt: 'Angus Young representa rock direto, riffs cortantes, energia física e uma abordagem de palco elétrica.',
      en: 'Angus Young represents direct rock, cutting riffs, physical energy and an electric stage approach.',
    },
    technicalIdentity: {
      pt: 'Riffs objetivos, blues-rock acelerado, vibrato forte e dinâmica de banda ao vivo.',
      en: 'Direct riffs, fast blues-rock, strong vibrato and live-band dynamics.',
    },
  },
  'lore-tier5-tga6-bmay': {
    artistInfluence: {
      pt: 'Brian May criou uma linguagem orquestral de guitarra, usando camadas, harmonias e timbres vocais de grande personalidade.',
      en: 'Brian May created an orchestral guitar language using layers, harmonies and highly personal vocal-like tones.',
    },
    technicalIdentity: {
      pt: 'Harmonias em camadas, sustain lírico, timbre nasal e pensamento de arranjo.',
      en: 'Layered harmonies, lyrical sustain, nasal tone and arrangement-driven thinking.',
    },
  },
  'lore-tier5-tga6-dgil': {
    artistInfluence: {
      pt: 'David Gilmour é referência de fraseado atmosférico, bends longos, silêncio expressivo e construção emocional lenta.',
      en: 'David Gilmour is a reference for atmospheric phrasing, long bends, expressive silence and slow emotional construction.',
    },
    technicalIdentity: {
      pt: 'Delay, sustain, bends controlados, vibrato amplo e uso dramático do espaço.',
      en: 'Delay, sustain, controlled bends, wide vibrato and dramatic use of space.',
    },
  },
  'lore-tier5-tga6-keyric': {
    artistInfluence: {
      pt: 'Keith Richards representa o riff como arquitetura: afinações abertas, economia de notas e groove como centro da composição.',
      en: 'Keith Richards represents the riff as architecture: open tunings, note economy and groove at the center of composition.',
    },
    technicalIdentity: {
      pt: 'Open G, riffs secos, acordes parciais e sensação rítmica orgânica.',
      en: 'Open G, dry riffs, partial chords and organic rhythmic feel.',
    },
  },
  'lore-tier6-ga6-jhdrix': {
    artistInfluence: {
      pt: 'Jimi Hendrix permanece como símbolo de liberdade criativa, expandindo timbre, palco e improvisação para além das fronteiras tradicionais.',
      en: 'Jimi Hendrix remains a symbol of creative freedom, expanding tone, stagecraft and improvisation beyond traditional boundaries.',
    },
    technicalIdentity: {
      pt: 'Item mítico para representar domínio expressivo, experimentação e imaginação total no braço.',
      en: 'A mythic item representing expressive mastery, experimentation and total fretboard imagination.',
    },
  },
  'lore-tier6-ga78-tabas': {
    artistInfluence: {
      pt: 'Tosin Abasi ajudou a popularizar uma abordagem moderna das extended range guitars, combinando polirritmia, técnica avançada e estética futurista.',
      en: 'Tosin Abasi helped popularize a modern approach to extended-range guitars, combining polyrhythm, advanced technique and futuristic aesthetics.',
    },
    technicalIdentity: {
      pt: 'Tapping, híbridos rítmicos, clusters, afinações graves e precisão arquitetônica.',
      en: 'Tapping, rhythmic hybrids, clusters, low tunings and architectural precision.',
    },
  },
  'lore-tier6-gab45-jpast': {
    artistInfluence: {
      pt: 'Jaco Pastorius permanece como referência máxima de baixo fretless, musicalidade melódica e identidade sonora imediatamente reconhecível.',
      en: 'Jaco Pastorius remains a central reference for fretless bass, melodic musicianship and instantly recognizable sound identity.',
    },
    technicalIdentity: {
      pt: 'Item mítico para representar fluência grave, harmônicos, fraseado e voz própria no baixo.',
      en: 'A mythic item representing low-end fluency, harmonics, phrasing and a personal voice on bass.',
    },
  },
};

export const COLLECTION_LORE: CollectionLoreItem[] = BASE_COLLECTION_LORE.map(item => ({
  ...item,
  ...(LORE_DETAILS[item.id] ?? {}),
}));

export const getCollectionLoreByFileName = (fileName: string) => (
  COLLECTION_LORE.find(item => item.fileName.toLowerCase() === fileName.toLowerCase())
);

export const getCollectionLoreByPath = (path?: string | null) => {
  if (!path) return undefined;
  const fileName = decodeURIComponent(path.split('/').pop() || '');
  return getCollectionLoreByFileName(fileName);
};
