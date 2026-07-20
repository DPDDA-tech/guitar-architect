import { ThemeCollectionItem } from './themeTypes';

const tier = (level: number, file: string) => `/tier${level}/${file}`;

const item = (
  id: string,
  name: string,
  category: ThemeCollectionItem['category'],
  image: string,
  instrumentFamily: ThemeCollectionItem['instrumentFamily'],
  rarity: ThemeCollectionItem['rarity'],
  description: string,
  unlockRequirement: string | undefined,
  glowColor: string,
  isDefault = false,
): ThemeCollectionItem => ({
  id,
  name,
  subtitle: category,
  category,
  rarity,
  instrumentFamily,
  unlocked: category === 'tier0',
  isDefault,
  image,
  placeholderGradient: `linear-gradient(135deg,rgba(2,6,23,0.94),${glowColor},rgba(15,23,42,0.88))`,
  description,
  unlockRequirement,
  glowColor,
});

export const THEME_REGISTRY: ThemeCollectionItem[] = [
  item('institutional-blue', 'Institutional Blue', 'tier0', '/logogastudio.webp', 'guitar6', 'common', 'Official six-string Guitar Architect Studio identity.', undefined, 'rgba(37,99,235,0.45)', true),
  item('bass-green', 'Bass Green', 'tier0', tier(0, 'tier0-gab45-oficial.webp'), 'bass4', 'common', 'Official bass identity for four and five-string workflows.', undefined, 'rgba(16,185,129,0.45)'),
  item('extended-purple', 'Extended Purple', 'tier0', tier(0, 'tier0-ga78-oficial.webp'), 'guitar7', 'common', 'Official extended guitar identity for seven and eight-string workflows.', undefined, 'rgba(168,85,247,0.45)'),

  item('apprentice-yam', 'Apprentice Studio', 'tier1', tier(1, 'tier1-ga6-yam.webp'), 'guitar6', 'common', 'A clean first-step guitar identity for daily study.', 'Login, explore the fretboard and apply your first study.', 'rgba(96,165,250,0.32)'),
  item('apprentice-iba', 'Apprentice Precision', 'tier1', tier(1, 'tier1-ga6-iba.webp'), 'guitar6', 'common', 'A focused identity for initial technique and scale practice.', 'Use practice tools and complete early exercises.', 'rgba(59,130,246,0.32)'),
  item('apprentice-tag', 'Apprentice Stage', 'tier1', tier(1, 'tier1-ga6-tag.webp'), 'guitar6', 'common', 'A direct rock-oriented identity for first riffs and chord maps.', 'Apply chords and save early diagrams.', 'rgba(14,165,233,0.32)'),
  item('apprentice-tele', 'Apprentice Chime', 'tier1', tier(1, 'tier1-ga6-tele.webp'), 'guitar6', 'common', 'A bright identity for open chords, triads and clean rhythm.', 'Study open positions and basic triads.', 'rgba(125,211,252,0.32)'),
  item('apprentice-bass-5c', 'Apprentice Low End', 'tier1', tier(1, 'tier1-gab45-5c.webp'), 'bass5', 'common', 'A first bass identity for pulse, groove and low-register maps.', 'Switch to bass and use the metronome.', 'rgba(52,211,153,0.32)'),

  item('pedreiro-foundation', 'Foundation Builder', 'tier2', tier(2, 'tier2-ga6-exp.webp'), 'guitar6', 'rare', 'A practical identity for completing the first real exercise cycle.', 'Complete three practical exercises.', 'rgba(148,163,184,0.34)'),
  item('pedreiro-12c', 'Twelve Map', 'tier2', tier(2, 'tier2-ga6-12c.webp'), 'guitar6', 'rare', 'A mapping identity for octave awareness and fretboard geography.', 'Apply scales and map intervals repeatedly.', 'rgba(96,165,250,0.34)'),
  item('pedreiro-dimdar', 'Diminished Frame', 'tier2', tier(2, 'tier2-ga6-dimdar.webp'), 'guitar6', 'rare', 'A harmonic identity for diminished colors and triad structure.', 'Study diminished triads and tetrads.', 'rgba(168,85,247,0.34)'),
  item('pedreiro-fbh70', 'Practice Frame', 'tier2', tier(2, 'tier2-ga6-fbh70.webp'), 'guitar6', 'rare', 'A workbench identity for first completed practice sessions.', 'Complete your first exercise.', 'rgba(59,130,246,0.34)'),
  item('pedreiro-flv', 'Alternate Bronze', 'tier2', tier(2, 'tier2-ga6-flv.webp'), 'guitar6', 'rare', 'A technique identity for alternate picking and synchronization.', 'Complete alternate picking basics.', 'rgba(245,158,11,0.34)'),
  item('pedreiro-gib', 'Major Scale Signal', 'tier2', tier(2, 'tier2-ga6-gib.webp'), 'guitar6', 'rare', 'A scale identity for major scale movement and BPM practice.', 'Play a major scale at 80 BPM.', 'rgba(239,68,68,0.34)'),
  item('pedreiro-hss', 'Technique Circuit', 'tier2', tier(2, 'tier2-ga6-hss.webp'), 'guitar6', 'rare', 'A technical circuit identity for repetitions and picking control.', 'Repeat technique exercises consistently.', 'rgba(34,197,94,0.34)'),
  item('pedreiro-prs', 'Routine Signal', 'tier2', tier(2, 'tier2-ga6-prs.webp'), 'guitar6', 'rare', 'A consistency identity for the first visible practice streak.', 'Maintain a three-day practice streak.', 'rgba(99,102,241,0.34)'),
  item('pedreiro-ryric', 'Echo Builder', 'tier2', tier(2, 'tier2-ga6-ryric.webp'), 'guitar6', 'rare', 'A spatial identity for delay-based diagrams and suspended voicings.', 'Create delay-based practice diagrams.', 'rgba(14,165,233,0.34)'),
  item('pedreiro-suh', 'Modern Builder', 'tier2', tier(2, 'tier2-ga6-suh.webp'), 'guitar6', 'rare', 'A modern identity for clean practice maps and extended vocabulary.', 'Save and revisit practice projects.', 'rgba(45,212,191,0.34)'),
  item('pedreiro-zawyl', 'Scale Cartographer', 'tier2', tier(2, 'tier2-ga6-zawyl.webp'), 'guitar6', 'rare', 'A cartography identity for recurring scale application.', 'Apply scales in multiple contexts.', 'rgba(56,189,248,0.34)'),

  item('contramestre-budguy', 'CAGED Foreman', 'tier3', tier(3, 'tier3 - ga6 - budguy.webp'), 'guitar6', 'epic', 'A blues-rock identity for CAGED navigation and connected shapes.', 'Complete CAGED studies.', 'rgba(251,146,60,0.38)'),
  item('contramestre-jmayer', 'Session Voice', 'tier3', tier(3, 'tier3 - ga6 - jmayer.webp'), 'guitar6', 'epic', 'A refined identity for triads, double-stops and melodic harmony.', 'Complete triad connection studies.', 'rgba(96,165,250,0.38)'),
  item('contramestre-metall', 'Heavy Signal', 'tier3', tier(3, 'tier3 - ga6 - metall.webp'), 'guitar6', 'epic', 'A heavy identity for riffs, energy and strong technique cycles.', 'Unlock enough tier 2 milestones.', 'rgba(239,68,68,0.38)'),
  item('contramestre-ericlap', 'Harmonic Voice', 'tier3', tier(3, 'tier3 - ga6 -ericlap.webp'), 'guitar6', 'epic', 'A vocal blues identity for tonal resolution and expressive phrasing.', 'Explore harmonic progressions.', 'rgba(245,158,11,0.38)'),
  item('contramestre-tedg', 'Echo Architect', 'tier3', tier(3, 'tier3 - ga6 - tedg.webp'), 'guitar6', 'epic', 'A delay-driven identity for suspended textures and rhythmic architecture.', 'Explore harmonic motion with progressions.', 'rgba(14,165,233,0.38)'),
  item('contramestre-svai', 'Modal Virtuoso', 'tier3', tier(3, 'tier3 - ga6 - svai.webp'), 'guitar7', 'epic', 'A modal identity for wide intervals and advanced Greek mode colors.', 'Apply Greek modes to the fretboard.', 'rgba(168,85,247,0.38)'),
  item('contramestre-clif', 'Bass Authority', 'tier3', tier(3, 'tier3 - gab45 - clif.webp'), 'bass4', 'epic', 'A bass identity for aggressive pulse and rhythmic precision.', 'Complete bass rhythmic precision.', 'rgba(34,197,94,0.38)'),
  item('contramestre-ged', 'Progressive Low End', 'tier3', tier(3, 'tier3 - gab45 - ged.webp'), 'bass4', 'epic', 'A progressive bass identity for melodic movement and odd-meter thinking.', 'Connect bass patterns with harmony.', 'rgba(45,212,191,0.38)'),
  item('contramestre-lemm', 'Motor Bass', 'tier3', tier(3, 'tier3 - gab45 - lemm.webp'), 'bass4', 'epic', 'A raw bass identity for drive, stamina and riff-based practice.', 'Complete endurance rhythm drills.', 'rgba(250,204,21,0.38)'),

  item('mestre-bbking', 'Blues Voice Mark', 'tier4', tier(4, 'tier4-ga6-bbking.webp'), 'guitar6', 'legendary', 'A master builder identity for phrasing, response and blues expression.', 'Unlock tier 3 harmonic milestones.', 'rgba(59,130,246,0.45)'),
  item('mestre-beat', 'British Chime', 'tier4', tier(4, 'tier4-ga6-beat.webp'), 'guitar6', 'legendary', 'A ringing identity for open chords, inversions and melodic rhythm.', 'Save open-chord and voicing diagrams.', 'rgba(203,213,225,0.45)'),
  item('mestre-jimhendrix', 'Reverse Psychedelic', 'tier4', tier(4, 'tier4-ga6-jimhendrix.webp'), 'guitar6', 'legendary', 'A psychedelic identity for expressive bends and expanded blues-rock language.', 'Unite technique, harmony and expression.', 'rgba(244,114,182,0.45)'),
  item('mestre-kirhm', 'Black Neon Eclipse', 'tier4', tier(4, 'tier4-ga6-kirhm.webp'), 'guitar6', 'legendary', 'A dark high-gain identity for contrast, speed and stage precision.', 'Complete advanced technique challenges.', 'rgba(251,113,133,0.45)'),
  item('mestre-srv', 'Texas Resolution', 'tier4', tier(4, 'tier4-ga6-srv.webp'), 'guitar6', 'legendary', 'A blues identity for strong attack, shuffle feel and vocal phrasing.', 'Explore blues resolution progressions.', 'rgba(96,165,250,0.45)'),
  item('mestre-evh', 'Arena Burst', 'tier4', tier(4, 'tier4-ga6-evh.webp'), 'guitar6', 'legendary', 'A high-energy identity for tapping, harmonics and arena phrasing.', 'Complete advanced picking and technique cycles.', 'rgba(249,115,22,0.45)'),
  item('mestre-slash', 'Velvet Top', 'tier4', tier(4, 'tier4-ga6-slash.webp'), 'guitar6', 'legendary', 'A warm lead identity for sustain, pentatonics and voice leading.', 'Complete voice-leading and sustain studies.', 'rgba(245,158,11,0.45)'),
  item('mestre-flea', 'Funk Low End', 'tier4', tier(4, 'tier4-gab45-flea.webp'), 'bass4', 'legendary', 'A bass identity for groove, articulation and percussive movement.', 'Complete groove and rhythm challenges.', 'rgba(16,185,129,0.45)'),
  item('mestre-jaco', 'Fretless Mind', 'tier4', tier(4, 'tier4-gab45-jaco.webp'), 'bass4', 'legendary', 'A bass identity for melodic fluency and harmonic awareness.', 'Complete melodic bass studies.', 'rgba(45,212,191,0.45)'),
  item('mestre-paulm', 'Songcraft Bass', 'tier4', tier(4, 'tier4-gab45-paulm.webp'), 'bass4', 'legendary', 'A bass identity for songcraft, movement and musical memory.', 'Complete bass arrangement studies.', 'rgba(250,204,21,0.45)'),

  item('engenheiro-dgil', 'Architect Infinity', 'tier5', tier(5, 'tier5-tga6-dgil.webp'), 'special', 'legendary', 'A mythic identity for total fretboard fluency and advanced musical systems.', 'Complete the central Architect curriculum.', 'rgba(96,165,250,0.52)'),
  item('engenheiro-keyric', 'Quantum Series', 'tier5', tier(5, 'tier5-tga6-keyric.webp'), 'special', 'legendary', 'A mythic identity for modulation, extended harmony and structural mastery.', 'Unlock advanced tier 4 milestones.', 'rgba(168,85,247,0.52)'),
  item('engenheiro-angyo', 'Midnight Starchild', 'tier5', tier(5, 'tier5-tga6-angyo.webp'), 'special', 'legendary', 'A mythic stage identity for bold shapes and confident performance language.', 'Complete performance-level diagrams.', 'rgba(217,70,239,0.52)'),
  item('engenheiro-bmay', 'Celestial Voice', 'tier5', tier(5, 'tier5-tga6-bmay.webp'), 'special', 'legendary', 'A mythic orchestral identity for harmony, resonance and melodic architecture.', 'Complete advanced voicing studies.', 'rgba(196,181,253,0.52)'),

  item('arquiteto-ga6-jhdrix', 'Architect Guitar Hero', 'tier6', tier(6, 'tier6 - ga6 - jhdrix.webp'), 'guitar6', 'legendary', 'The final six-string Architect identity for expressive mastery, musical command and complete fretboard fluency.', 'Unlock the Guitar Hero Architect achievement.', 'rgba(34,211,238,0.56)'),
  item('arquiteto-ga78-tabas', 'Architect Extended Hero', 'tier6', tier(6, 'tier6 - ga78 - tabas.webp'), 'guitar8', 'legendary', 'The final extended-range Architect identity for modern harmony, precision and wide-register control.', 'Unlock the Guitar Hero Architect achievement.', 'rgba(168,85,247,0.56)'),
  item('arquiteto-gab45-jpast', 'Architect Bass Hero', 'tier6', tier(6, 'tier6 - gab45 - jpast.webp'), 'bass5', 'legendary', 'The final bass Architect identity for groove, authority and full low-frequency command.', 'Unlock the Guitar Hero Architect achievement.', 'rgba(16,185,129,0.56)'),
];

export const DEFAULT_THEME_ID = 'institutional-blue';
