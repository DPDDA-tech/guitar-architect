import React, { useState } from 'react';
import { getKidsLang, getKidsTheme } from '../utils/ecosystemPreferences';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';

type WorkshopModelKey =
  | 'classicS'
  | 'singleCut'
  | 'modern'
  | 'explorer'
  | 'flyingV'
  | 'superstrat'
  | 'contrabaixo'
  | 'violao'
  | 'semiAcustica'
  | 'banjo';

type PartKey = 'body' | 'neck' | 'headstock' | 'details';

type LocalizedText = {
  pt: string;
  en: string;
};

type InstrumentInfo = {
  title: LocalizedText;
  summary: LocalizedText;
  sound: LocalizedText;
  styles: {
    pt: string[];
    en: string[];
  };
  curiosity: LocalizedText;
};

type Hotspot = {
  left: string;
  top: string;
  width: string;
  height: string;
};

const MODEL_IMAGE_MAP: Record<WorkshopModelKey, string> = {
  classicS: '/kids/workshop/classic-s.webp',
  singleCut: '/kids/workshop/single-cut.webp',
  modern: '/kids/workshop/modern.webp',
  explorer: '/kids/workshop/explorer.webp',
  flyingV: '/kids/workshop/flyingv.webp',
  superstrat: '/kids/workshop/superstrat.webp',
  contrabaixo: '/kids/workshop/contrabaixo.webp',
  violao: '/kids/workshop/violao.webp',
  semiAcustica: '/kids/workshop/semi-acustica.webp',
  banjo: '/kids/workshop/banjo.webp',
};

const MODEL_OPTIONS: Array<{ key: WorkshopModelKey; label: LocalizedText }> = [
  { key: 'classicS', label: { pt: 'Classic S', en: 'Classic S' } },
  { key: 'singleCut', label: { pt: 'Single Cut', en: 'Single Cut' } },
  { key: 'modern', label: { pt: 'Modern', en: 'Modern' } },
  { key: 'explorer', label: { pt: 'Explorer', en: 'Explorer' } },
  { key: 'flyingV', label: { pt: 'Flying V', en: 'Flying V' } },
  { key: 'superstrat', label: { pt: 'Superstrat', en: 'Superstrat' } },
  { key: 'semiAcustica', label: { pt: 'Semi Acústica', en: 'Semi-Acoustic' } },
  { key: 'contrabaixo', label: { pt: 'Contrabaixo', en: 'Bass' } },
  { key: 'violao', label: { pt: 'Violão Kids', en: 'Kids Acoustic Guitar' } },
  { key: 'banjo', label: { pt: 'Banjo Kids', en: 'Kids Banjo' } },
];

const PART_OPTIONS: Array<{ key: PartKey; label: LocalizedText }> = [
  { key: 'body', label: { pt: 'Corpo', en: 'Body' } },
  { key: 'neck', label: { pt: 'Braço', en: 'Neck' } },
  { key: 'headstock', label: { pt: 'Mão / Headstock', en: 'Head / Headstock' } },
  { key: 'details', label: { pt: 'Captadores / Detalhes', en: 'Pickups / Details' } },
];

const partInfo: Record<PartKey, { title: LocalizedText; text: LocalizedText }> = {
  body: {
    title: { pt: 'Corpo', en: 'Body' },
    text: {
      pt: 'É a parte principal. Define formato, peso e muito da personalidade visual do instrumento.',
      en: 'This is the main part. It defines the shape, weight, and much of the instrument’s visual personality.',
    },
  },
  neck: {
    title: { pt: 'Braço', en: 'Neck' },
    text: {
      pt: 'É onde ficam os trastes e as notas. Aqui a mão desliza para tocar grave, médio e agudo.',
      en: 'This is where the frets and notes are. Your hand slides here to play low, middle, and high sounds.',
    },
  },
  headstock: {
    title: { pt: 'Mão / Headstock', en: 'Head / Headstock' },
    text: {
      pt: 'Também chamada de headstock. É onde ficam as tarraxas usadas para afinar.',
      en: 'Also called the headstock. This is where the tuning pegs are used to tune the instrument.',
    },
  },
  details: {
    title: { pt: 'Captadores / Detalhes', en: 'Pickups / Details' },
    text: {
      pt: 'Podem captar som, proteger a pintura ou dar estilo. Cada modelo usa detalhes diferentes.',
      en: 'They can capture sound, protect the finish, or add style. Each model uses different details.',
    },
  },
};

const instrumentInfo: Record<WorkshopModelKey, InstrumentInfo> = {
  classicS: {
    title: { pt: 'Classic S', en: 'Classic S' },
    summary: { pt: 'Guitarra versátil usada em rock, pop, blues e funk.', en: 'A versatile guitar used in rock, pop, blues, and funk.' },
    sound: { pt: 'Som brilhante, limpo e muito flexível.', en: 'Bright, clean, and very flexible sound.' },
    styles: { pt: ['Rock', 'Pop', 'Blues', 'Funk'], en: ['Rock', 'Pop', 'Blues', 'Funk'] },
    curiosity: { pt: 'É um dos formatos de guitarra mais reconhecidos no mundo.', en: 'It is one of the most recognizable guitar shapes in the world.' },
  },
  singleCut: {
    title: { pt: 'Single Cut', en: 'Single Cut' },
    summary: { pt: 'Modelo clássico com visual elegante e pegada forte.', en: 'A classic model with an elegant look and strong feel.' },
    sound: { pt: 'Som encorpado e cheio, muito bom para riffs.', en: 'Full-bodied sound, great for riffs.' },
    styles: { pt: ['Rock', 'Blues', 'Jazz'], en: ['Rock', 'Blues', 'Jazz'] },
    curiosity: { pt: 'Tem corte único no corpo, por isso o nome Single Cut.', en: 'It has a single cut in the body, which is why it is called Single Cut.' },
  },
  modern: {
    title: { pt: 'Modern', en: 'Modern' },
    summary: { pt: 'Modelo pensado para conforto e versatilidade.', en: 'A model designed for comfort and versatility.' },
    sound: { pt: 'Equilibrado, funcionando bem em vários timbres.', en: 'Balanced, working well across many tones.' },
    styles: { pt: ['Pop', 'Rock', 'Indie'], en: ['Pop', 'Rock', 'Indie'] },
    curiosity: { pt: 'Muitos modelos modernos misturam ideias de vários formatos antigos.', en: 'Many modern models mix ideas from older shapes.' },
  },
  explorer: {
    title: { pt: 'Explorer', en: 'Explorer' },
    summary: { pt: 'Formato marcante para quem gosta de visual ousado.', en: 'A striking shape for players who like a bold look.' },
    sound: { pt: 'Forte e presente, com ataque destacado.', en: 'Strong and present, with a sharp attack.' },
    styles: { pt: ['Rock', 'Hard Rock', 'Metal'], en: ['Rock', 'Hard Rock', 'Metal'] },
    curiosity: { pt: 'Foi criado para músicos que queriam algo totalmente diferente.', en: 'It was created for musicians who wanted something totally different.' },
  },
  flyingV: {
    title: { pt: 'Flying V', en: 'Flying V' },
    summary: { pt: 'Modelo famoso pelo desenho em V e atitude de palco.', en: 'A model famous for its V shape and stage attitude.' },
    sound: { pt: 'Direto e agressivo, ótimo para bases e solos fortes.', en: 'Direct and aggressive, great for heavy rhythm and solos.' },
    styles: { pt: ['Rock', 'Metal'], en: ['Rock', 'Metal'] },
    curiosity: { pt: 'Virou símbolo de shows energéticos e visuais futuristas.', en: 'It became a symbol of energetic shows and futuristic visuals.' },
  },
  superstrat: {
    title: { pt: 'Superstrat', en: 'Superstrat' },
    summary: { pt: 'Versão moderna para tocar rápido e com conforto.', en: 'A modern version made for speed and comfort.' },
    sound: { pt: 'Versátil, indo de limpo a distorções intensas.', en: 'Versatile, from clean sounds to intense distortion.' },
    styles: { pt: ['Rock', 'Metal', 'Fusion'], en: ['Rock', 'Metal', 'Fusion'] },
    curiosity: { pt: 'Ficou muito popular com guitarristas de técnica avançada.', en: 'It became very popular with technically advanced guitarists.' },
  },
  semiAcustica: {
    title: { pt: 'Semi Acústica', en: 'Semi-Acoustic' },
    summary: { pt: 'Mistura características de guitarra elétrica e violão.', en: 'It mixes electric guitar and acoustic guitar characteristics.' },
    sound: { pt: 'Quente e ressonante, com toque aveludado.', en: 'Warm and resonant, with a smooth touch.' },
    styles: { pt: ['Jazz', 'Blues', 'Pop'], en: ['Jazz', 'Blues', 'Pop'] },
    curiosity: { pt: 'Tem corpo com câmaras que ajudam na ressonância.', en: 'Its body has chambers that help with resonance.' },
  },
  contrabaixo: {
    title: { pt: 'Contrabaixo', en: 'Bass' },
    summary: { pt: 'Instrumento que segura os graves e a base da banda.', en: 'The instrument that holds the low end and the band’s foundation.' },
    sound: { pt: 'Grave e profundo, conectando ritmo e harmonia.', en: 'Low and deep, connecting rhythm and harmony.' },
    styles: { pt: ['Pop', 'Rock', 'Funk', 'Gospel'], en: ['Pop', 'Rock', 'Funk', 'Gospel'] },
    curiosity: { pt: 'Sem o baixo, a música perde muito do peso e da sustentação.', en: 'Without the bass, music loses much of its weight and support.' },
  },
  violao: {
    title: { pt: 'Violão Kids', en: 'Kids Acoustic Guitar' },
    summary: { pt: 'Instrumento popular para acompanhar voz e canções.', en: 'A popular instrument for accompanying voice and songs.' },
    sound: { pt: 'Natural e acolhedor, com boa dinâmica.', en: 'Natural and warm, with good dynamics.' },
    styles: { pt: ['Pop', 'Folk', 'MPB'], en: ['Pop', 'Folk', 'MPB'] },
    curiosity: { pt: 'Muitas pessoas aprendem suas primeiras músicas no violão.', en: 'Many people learn their first songs on the acoustic guitar.' },
  },
  banjo: {
    title: { pt: 'Banjo Kids', en: 'Kids Banjo' },
    summary: { pt: 'Instrumento tradicional de som brilhante e divertido.', en: 'A traditional instrument with a bright and fun sound.' },
    sound: { pt: 'Estalado, rápido e cheio de personalidade.', en: 'Snappy, quick, and full of personality.' },
    styles: { pt: ['Folk', 'Country'], en: ['Folk', 'Country'] },
    curiosity: { pt: 'Seu timbre é fácil de reconhecer logo nos primeiros acordes.', en: 'Its tone is easy to recognize in the very first chords.' },
  },
};

const partHotspots: Record<WorkshopModelKey, Record<PartKey, Hotspot>> = {
  classicS: { body: { left: '16%', top: '22%', width: '42%', height: '58%' }, neck: { left: '53%', top: '44%', width: '28%', height: '12%' }, headstock: { left: '80%', top: '40%', width: '12%', height: '16%' }, details: { left: '26%', top: '38%', width: '18%', height: '22%' } },
  singleCut: { body: { left: '16%', top: '20%', width: '44%', height: '60%' }, neck: { left: '54%', top: '44%', width: '27%', height: '12%' }, headstock: { left: '80%', top: '40%', width: '12%', height: '16%' }, details: { left: '28%', top: '40%', width: '17%', height: '20%' } },
  modern: { body: { left: '16%', top: '21%', width: '44%', height: '58%' }, neck: { left: '54%', top: '44%', width: '27%', height: '12%' }, headstock: { left: '80%', top: '40%', width: '12%', height: '16%' }, details: { left: '29%', top: '40%', width: '16%', height: '20%' } },
  explorer: { body: { left: '14%', top: '20%', width: '50%', height: '62%' }, neck: { left: '56%', top: '44%', width: '25%', height: '12%' }, headstock: { left: '80%', top: '40%', width: '12%', height: '16%' }, details: { left: '30%', top: '40%', width: '16%', height: '18%' } },
  flyingV: { body: { left: '14%', top: '20%', width: '52%', height: '64%' }, neck: { left: '55%', top: '43%', width: '26%', height: '12%' }, headstock: { left: '80%', top: '39%', width: '12%', height: '16%' }, details: { left: '31%', top: '44%', width: '15%', height: '16%' } },
  superstrat: { body: { left: '16%', top: '21%', width: '44%', height: '58%' }, neck: { left: '54%', top: '44%', width: '27%', height: '12%' }, headstock: { left: '80%', top: '40%', width: '12%', height: '16%' }, details: { left: '27%', top: '39%', width: '18%', height: '20%' } },
  semiAcustica: { body: { left: '15%', top: '20%', width: '46%', height: '60%' }, neck: { left: '54%', top: '44%', width: '27%', height: '12%' }, headstock: { left: '80%', top: '40%', width: '12%', height: '16%' }, details: { left: '28%', top: '38%', width: '20%', height: '24%' } },
  contrabaixo: { body: { left: '16%', top: '20%', width: '44%', height: '60%' }, neck: { left: '55%', top: '44%', width: '28%', height: '12%' }, headstock: { left: '82%', top: '40%', width: '11%', height: '16%' }, details: { left: '30%', top: '40%', width: '16%', height: '18%' } },
  violao: { body: { left: '17%', top: '19%', width: '42%', height: '62%' }, neck: { left: '54%', top: '45%', width: '27%', height: '11%' }, headstock: { left: '80%', top: '41%', width: '12%', height: '15%' }, details: { left: '29%', top: '38%', width: '16%', height: '22%' } },
  banjo: { body: { left: '19%', top: '18%', width: '36%', height: '64%' }, neck: { left: '52%', top: '45%', width: '30%', height: '11%' }, headstock: { left: '81%', top: '40%', width: '12%', height: '16%' }, details: { left: '26%', top: '35%', width: '20%', height: '28%' } },
};

const KidsWorkshopPage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [lang] = useState(() => getKidsLang());
  const [selectedModel, setSelectedModel] = useState<WorkshopModelKey>('classicS');
  const [selectedPart, setSelectedPart] = useState<PartKey | null>(null);

  const isLight = theme === 'light';
  const isPt = lang === 'pt';
  const selectedModelOption = MODEL_OPTIONS.find((option) => option.key === selectedModel) ?? MODEL_OPTIONS[0];
  const selectedInstrument = instrumentInfo[selectedModel];
  const hotspot = selectedPart ? partHotspots[selectedModel][selectedPart] : null;

  const goToInstrument = (direction: -1 | 1) => {
    const currentIndex = MODEL_OPTIONS.findIndex((option) => option.key === selectedModel);
    const nextIndex = (currentIndex + direction + MODEL_OPTIONS.length) % MODEL_OPTIONS.length;
    setSelectedModel(MODEL_OPTIONS[nextIndex].key);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <main className="relative mx-auto max-w-6xl">
        <EcosystemPageActions ecosystem="kids" isLight={isLight} backLabel={isPt ? 'Voltar ao Kids' : 'Back to Kids'} backPath="/kids" />
        <InternalEcosystemHeader ecosystem="kids" isLight={isLight} title={isPt ? 'Descobrindo os Instrumentos' : 'Discovering Instruments'} subtitle={isPt ? 'Escolha instrumentos e veja modelos em detalhes.' : 'Choose instruments and see models in detail.'} />

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className={`rounded-3xl border p-4 md:p-5 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2">{isPt ? 'Instrumento' : 'Instrument'}</label>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value as WorkshopModelKey)} className={`w-full rounded-xl border px-3 py-2 text-sm font-bold outline-none ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
              {MODEL_OPTIONS.map((model) => (
                <option key={model.key} value={model.key}>{model.label[isPt ? 'pt' : 'en']}</option>
              ))}
            </select>

            <div className="mt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">{isPt ? 'Partes' : 'Parts'}</p>
              <div className="grid grid-cols-2 gap-2">
                {PART_OPTIONS.map((part) => (
                  <button key={part.key} onClick={() => setSelectedPart((prev) => (prev === part.key ? null : part.key))} className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase transition-all ${selectedPart === part.key ? 'border-emerald-500 bg-emerald-600 text-white' : isLight ? 'border-slate-300 hover:border-emerald-400' : 'border-zinc-700 hover:border-emerald-500'}`}>
                    {part.label[isPt ? 'pt' : 'en']}
                  </button>
                ))}
              </div>
            </div>

            {selectedPart && (
              <div className={`mt-4 rounded-xl border px-3 py-3 text-xs leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300 ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'}`}>
                <p className="font-black uppercase tracking-wider text-[10px]">{partInfo[selectedPart].title[isPt ? 'pt' : 'en']}</p>
                <p className="mt-1 font-bold opacity-90">{partInfo[selectedPart].text[isPt ? 'pt' : 'en']}</p>
              </div>
            )}
          </aside>

          <div className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">{isPt ? 'Prévia' : 'Preview'}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => goToInstrument(-1)} aria-label={isPt ? 'Instrumento anterior' : 'Previous instrument'} className={`rounded-xl border px-3 py-1.5 text-[11px] font-black uppercase transition-all ${isLight ? 'border-slate-300 bg-white hover:border-emerald-400' : 'border-zinc-700 bg-zinc-950 hover:border-emerald-500'}`}>
                  ← {isPt ? 'Anterior' : 'Previous'}
                </button>
                <button onClick={() => goToInstrument(1)} aria-label={isPt ? 'Próximo instrumento' : 'Next instrument'} className={`rounded-xl border px-3 py-1.5 text-[11px] font-black uppercase transition-all ${isLight ? 'border-slate-300 bg-white hover:border-emerald-400' : 'border-zinc-700 bg-zinc-950 hover:border-emerald-500'}`}>
                  {isPt ? 'Próximo' : 'Next'} →
                </button>
              </div>
            </div>
            <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 p-4 md:min-h-[420px]">
              <img key={selectedModel} src={MODEL_IMAGE_MAP[selectedModel]} alt={`Preview ${selectedModelOption.label[isPt ? 'pt' : 'en']}`} className="max-h-[380px] w-full object-contain transition-all duration-300 ease-out md:max-h-[520px]" loading="eager" />
              {hotspot && (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-black/28" />
                  <div className="pointer-events-none absolute rounded-xl border-2 border-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_0_24px_rgba(16,185,129,0.65)] transition-all duration-300" style={{ left: hotspot.left, top: hotspot.top, width: hotspot.width, height: hotspot.height }} />
                </>
              )}
            </div>
            <p className={`mt-3 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>{isPt ? 'Modelo atual' : 'Current model'}: {selectedModelOption.label[isPt ? 'pt' : 'en']}</p>
            <div className={`mt-3 rounded-xl border px-3 py-3 text-xs leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-300 ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'}`}>
              <p className="font-black uppercase tracking-wider text-[10px]">{isPt ? 'Sobre este modelo' : 'About this model'}</p>
              <p className="mt-1 font-bold opacity-90">{selectedInstrument.summary[isPt ? 'pt' : 'en']}</p>
              <p className="mt-2 text-[11px] font-semibold opacity-90"><span className="font-black">{isPt ? 'Som/Papel' : 'Sound/Role'}:</span> {selectedInstrument.sound[isPt ? 'pt' : 'en']}</p>
              <p className="mt-2 text-[11px] font-semibold opacity-90"><span className="font-black">{isPt ? 'Estilos' : 'Styles'}:</span> {selectedInstrument.styles[isPt ? 'pt' : 'en'].join(', ')}</p>
              <p className="mt-2 text-[11px] font-semibold opacity-90"><span className="font-black">{isPt ? 'Curiosidade' : 'Fun fact'}:</span> {selectedInstrument.curiosity[isPt ? 'pt' : 'en']}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default KidsWorkshopPage;
