import React, { useState } from 'react';
import { getKidsTheme } from '../utils/ecosystemPreferences';

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

type WorkshopModelOption = {
  key: WorkshopModelKey;
  label: string;
};

type PartKey = 'body' | 'neck' | 'headstock' | 'details';

type InstrumentInfo = {
  title: string;
  summary: string;
  sound: string;
  styles: string[];
  curiosity: string;
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

const MODEL_OPTIONS: WorkshopModelOption[] = [
  { key: 'classicS', label: 'Classic S' },
  { key: 'singleCut', label: 'Single Cut' },
  { key: 'modern', label: 'Modern' },
  { key: 'explorer', label: 'Explorer' },
  { key: 'flyingV', label: 'Flying V' },
  { key: 'superstrat', label: 'Superstrat' },
  { key: 'semiAcustica', label: 'Semi Acustica' },
  { key: 'contrabaixo', label: 'Contrabaixo' },
  { key: 'violao', label: 'Violao Kids' },
  { key: 'banjo', label: 'Banjo Kids' },
];

const partInfo: Record<PartKey, { title: string; text: string }> = {
  body: {
    title: 'Corpo',
    text: 'E a parte principal. Define formato, peso e muito da personalidade visual do instrumento.',
  },
  neck: {
    title: 'Braço',
    text: 'É onde ficam os trastes e as notas. Aqui a Mão desliza para tocar grave, Médio e agudo.',
  },
  headstock: {
    title: 'Mão da guitarra (headstock)',
    text: 'Também chamada de headstock. É onde ficam as tarraxas usadas para afinar.',
  },
  details: {
    title: 'Captadores ou detalhes',
    text: 'Podem captar som, proteger a pintura ou dar estilo. Cada modelo usa detalhes diferentes.',
  },
};

const instrumentInfo: Record<WorkshopModelKey, InstrumentInfo> = {
  classicS: {
    title: 'Classic S',
    summary: 'Guitarra versátil usada em rock, pop, blues e funk.',
    sound: 'Som brilhante, limpo e muito flexível.',
    styles: ['Rock', 'Pop', 'Blues', 'Funk'],
    curiosity: 'É um dos formatos de guitarra mais reconhecidos no mundo.',
  },
  singleCut: {
    title: 'Single Cut',
    summary: 'Modelo clássico com visual elegante e pegada forte.',
    sound: 'Som encorpado e cheio, muito bom para riffs.',
    styles: ['Rock', 'Blues', 'Jazz'],
    curiosity: 'Tem corte único no corpo, por isso o nome Single Cut.',
  },
  modern: {
    title: 'Modern',
    summary: 'Modelo pensado para conforto e versatilidade.',
    sound: 'Equilibrado, funcionando bem em varios timbres.',
    styles: ['Pop', 'Rock', 'Indie'],
    curiosity: 'Muitos modelos modernos misturam ideias de varios formatos antigos.',
  },
  explorer: {
    title: 'Explorer',
    summary: 'Formato marcante para quem gosta de visual ousado.',
    sound: 'Forte e presente, com ataque destacado.',
    styles: ['Rock', 'Hard Rock', 'Metal'],
    curiosity: 'Foi criado para musicos que queriam algo totalmente diferente.',
  },
  flyingV: {
    title: 'Flying V',
    summary: 'Modelo famoso pelo desenho em V e atitude de palco.',
    sound: 'Direto e agressivo, ótimo para bases e solos fortes.',
    styles: ['Rock', 'Metal'],
    curiosity: 'Virou símbolo de shows energéticos e visuais futuristas.',
  },
  superstrat: {
    title: 'Superstrat',
    summary: 'Versão moderna para tocar rápido e com conforto.',
    sound: 'Versátil, indo de limpo a distorções intensas.',
    styles: ['Rock', 'Metal', 'Fusion'],
    curiosity: 'Ficou muito popular com guitarristas de técnica avançada.',
  },
  semiAcustica: {
    title: 'Semi Acustica',
    summary: 'Mistura características de guitarra elétrica e violão.',
    sound: 'Quente e ressonante, com toque aveludado.',
    styles: ['Jazz', 'Blues', 'Pop'],
    curiosity: 'Tem corpo com câmaras que ajudam na ressonância.',
  },
  contrabaixo: {
    title: 'Contrabaixo',
    summary: 'Instrumento que segura os graves e a base da banda.',
    sound: 'Grave e profundo, conectando ritmo e harmonia.',
    styles: ['Pop', 'Rock', 'Funk', 'Gospel'],
    curiosity: 'Sem o baixo, a música perde muito do peso e da sustentação.',
  },
  violao: {
    title: 'Violao Kids',
    summary: 'Instrumento popular para acompanhar voz e canções.',
    sound: 'Natural e acolhedor, com boa dinâmica.',
    styles: ['Pop', 'Folk', 'MPB'],
    curiosity: 'Muitas pessoas aprendem suas primeiras músicas no violão.',
  },
  banjo: {
    title: 'Banjo Kids',
    summary: 'Instrumento tradicional de som brilhante e divertido.',
    sound: 'Estalado, rápido e cheio de personalidade.',
    styles: ['Folk', 'Country'],
    curiosity: 'Seu timbre é fácil de reconhecer logo nos primeiros acordes.',
  },
};

const partHotspots: Record<WorkshopModelKey, Record<PartKey, Hotspot>> = {
  classicS: {
    body: { left: '16%', top: '22%', width: '42%', height: '58%' },
    neck: { left: '53%', top: '44%', width: '28%', height: '12%' },
    headstock: { left: '80%', top: '40%', width: '12%', height: '16%' },
    details: { left: '26%', top: '38%', width: '18%', height: '22%' },
  },
  singleCut: {
    body: { left: '16%', top: '20%', width: '44%', height: '60%' },
    neck: { left: '54%', top: '44%', width: '27%', height: '12%' },
    headstock: { left: '80%', top: '40%', width: '12%', height: '16%' },
    details: { left: '28%', top: '40%', width: '17%', height: '20%' },
  },
  modern: {
    body: { left: '16%', top: '21%', width: '44%', height: '58%' },
    neck: { left: '54%', top: '44%', width: '27%', height: '12%' },
    headstock: { left: '80%', top: '40%', width: '12%', height: '16%' },
    details: { left: '29%', top: '40%', width: '16%', height: '20%' },
  },
  explorer: {
    body: { left: '14%', top: '20%', width: '50%', height: '62%' },
    neck: { left: '56%', top: '44%', width: '25%', height: '12%' },
    headstock: { left: '80%', top: '40%', width: '12%', height: '16%' },
    details: { left: '30%', top: '40%', width: '16%', height: '18%' },
  },
  flyingV: {
    body: { left: '14%', top: '20%', width: '52%', height: '64%' },
    neck: { left: '55%', top: '43%', width: '26%', height: '12%' },
    headstock: { left: '80%', top: '39%', width: '12%', height: '16%' },
    details: { left: '31%', top: '44%', width: '15%', height: '16%' },
  },
  superstrat: {
    body: { left: '16%', top: '21%', width: '44%', height: '58%' },
    neck: { left: '54%', top: '44%', width: '27%', height: '12%' },
    headstock: { left: '80%', top: '40%', width: '12%', height: '16%' },
    details: { left: '27%', top: '39%', width: '18%', height: '20%' },
  },
  semiAcustica: {
    body: { left: '15%', top: '20%', width: '46%', height: '60%' },
    neck: { left: '54%', top: '44%', width: '27%', height: '12%' },
    headstock: { left: '80%', top: '40%', width: '12%', height: '16%' },
    details: { left: '28%', top: '38%', width: '20%', height: '24%' },
  },
  contrabaixo: {
    body: { left: '16%', top: '20%', width: '44%', height: '60%' },
    neck: { left: '55%', top: '44%', width: '28%', height: '12%' },
    headstock: { left: '82%', top: '40%', width: '11%', height: '16%' },
    details: { left: '30%', top: '40%', width: '16%', height: '18%' },
  },
  violao: {
    body: { left: '17%', top: '19%', width: '42%', height: '62%' },
    neck: { left: '54%', top: '45%', width: '27%', height: '11%' },
    headstock: { left: '80%', top: '41%', width: '12%', height: '15%' },
    details: { left: '29%', top: '38%', width: '16%', height: '22%' },
  },
  banjo: {
    body: { left: '19%', top: '18%', width: '36%', height: '64%' },
    neck: { left: '52%', top: '45%', width: '30%', height: '11%' },
    headstock: { left: '81%', top: '40%', width: '12%', height: '16%' },
    details: { left: '26%', top: '35%', width: '20%', height: '28%' },
  },
};

const PART_OPTIONS: Array<{ key: PartKey; label: string }> = [
  { key: 'body', label: 'Corpo' },
  { key: 'neck',      label: 'Braço' },
  { key: 'headstock', label: 'Mão / Headstock' },
  { key: 'details', label: 'Captadores / Detalhes' },
];

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const KidsWorkshopPage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [selectedModel, setSelectedModel] = useState<WorkshopModelKey>('classicS');
  const [selectedPart, setSelectedPart] = useState<PartKey | null>(null);

  const isLight = theme === 'light';


  const selectedModelOption = MODEL_OPTIONS.find(option => option.key === selectedModel) ?? MODEL_OPTIONS[0];
  const selectedInstrument = instrumentInfo[selectedModel];
  const hotspot = selectedPart ? partHotspots[selectedModel][selectedPart] : null;

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>

      <main className="relative mx-auto max-w-6xl">
        <header className="mb-6 md:mb-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-500">Guitar Architect Kids</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Descobrindo os Instrumentos</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Escolha instrumentos e veja modelos em detalhes.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className={`rounded-3xl border p-4 md:p-5 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2">Instrumento</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as WorkshopModelKey)}
              className={`w-full rounded-xl border px-3 py-2 text-sm font-bold outline-none ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
            >
              {MODEL_OPTIONS.map(model => (
                <option key={model.key} value={model.key}>{model.label}</option>
              ))}
            </select>

            <div className="mt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Partes</p>
              <div className="grid grid-cols-2 gap-2">
                {PART_OPTIONS.map(part => (
                  <button
                    key={part.key}
                    onClick={() => setSelectedPart((prev) => (prev === part.key ? null : part.key))}
                    className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase transition-all ${selectedPart === part.key ? 'border-emerald-500 bg-emerald-600 text-white' : isLight ? 'border-slate-300 hover:border-emerald-400' : 'border-zinc-700 hover:border-emerald-500'}`}
                  >
                    {part.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedPart && (
              <div className={`mt-4 rounded-xl border px-3 py-3 text-xs leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300 ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'}`}>
                <p className="font-black uppercase tracking-wider text-[10px]">{partInfo[selectedPart].title}</p>
                <p className="mt-1 font-bold opacity-90">{partInfo[selectedPart].text}</p>
              </div>
            )}

            <button
              onClick={() => navigateTo('/kids')}
              className={`mt-6 w-full rounded-xl border px-3 py-3 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-emerald-400' : 'border-zinc-700 bg-zinc-950 hover:border-emerald-500'}`}
            >
              Voltar ao Kids
            </button>
          </aside>

          <div className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
            <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Preview</div>
            <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 p-4 md:min-h-[420px]">
              <img
                key={selectedModel}
                src={MODEL_IMAGE_MAP[selectedModel]}
                alt={`Preview ${selectedModelOption.label}`}
                className="max-h-[380px] w-full object-contain transition-all duration-300 ease-out md:max-h-[520px]"
                loading="eager"
              />
              {hotspot && (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-black/28" />
                  <div
                    className="pointer-events-none absolute rounded-xl border-2 border-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_0_24px_rgba(16,185,129,0.65)] transition-all duration-300"
                    style={{ left: hotspot.left, top: hotspot.top, width: hotspot.width, height: hotspot.height }}
                  />
                </>
              )}
            </div>
            <p className={`mt-3 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Modelo atual: {selectedModelOption.label}
            </p>
            <div className={`mt-3 rounded-xl border px-3 py-3 text-xs leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-300 ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'}`}>
              <p className="font-black uppercase tracking-wider text-[10px]">Sobre este modelo</p>
              <p className="mt-1 font-bold opacity-90">{selectedInstrument.summary}</p>
              <p className="mt-2 text-[11px] font-semibold opacity-90"><span className="font-black">Som/Papel:</span> {selectedInstrument.sound}</p>
              <p className="mt-2 text-[11px] font-semibold opacity-90"><span className="font-black">Estilos:</span> {selectedInstrument.styles.join(', ')}</p>
              <p className="mt-2 text-[11px] font-semibold opacity-90"><span className="font-black">Curiosidade:</span> {selectedInstrument.curiosity}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default KidsWorkshopPage;



