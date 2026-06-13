import React, { useRef, useState } from 'react';
import { getKidsLang, getKidsTheme } from '../utils/ecosystemPreferences';
import AppFooter from './AppFooter';
import { loadConfig } from '../utils/persistence';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';
import {
  addKidsCustomGuitar,
  KidsCustomGuitar,
  loadKidsCustomGuitars,
} from '../utils/kidsCustomGuitarStorage';

// ─── navigation ───────────────────────────────────────────────────────────────
const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

// ─── guitar catalogue ─────────────────────────────────────────────────────────
const STANDARD_COLORS = ['black', 'blue', 'green', 'grey', 'pink', 'red', 'white', 'yellow'] as const;

interface GuitarModel {
  id: string;
  label: string;
  colors: readonly string[];
}

const GUITAR_MODELS: GuitarModel[] = [
  { id: 'classics',   label: 'Classic-S',     colors: ['black','blue','green','gray','pink','red','white','yellow','dgil','evh','relic','srv'] },
  { id: 'superstrat', label: 'Superstrat',    colors: STANDARD_COLORS },
  { id: 'modern',     label: 'Modern',        colors: STANDARD_COLORS },
  { id: 'explorer',   label: 'Explorer',      colors: STANDARD_COLORS },
  { id: 'flyingv',    label: 'Flying V',      colors: STANDARD_COLORS },
  { id: 'sinlgec',    label: 'Single Cut',    colors: STANDARD_COLORS },
  { id: 'semiac',     label: 'Semi Acústica', colors: [...STANDARD_COLORS, 'sunburst'] },
  { id: 'cbaixo',     label: 'Contrabaixo',   colors: STANDARD_COLORS },
  { id: 'violao',     label: 'Violão',        colors: STANDARD_COLORS },
  { id: 'banjo',      label: 'Banjo',         colors: STANDARD_COLORS },
];

const COLOR_LABELS_PT: Record<string, string> = {
  black: 'Preta', blue: 'Azul', green: 'Verde', grey: 'Cinza', gray: 'Cinza',
  pink: 'Rosa', red: 'Vermelha', white: 'Branca', yellow: 'Amarela',
  sunburst: 'Sunburst', dgil: 'Dave Gil', evh: 'EVH', relic: 'Relic', srv: 'SRV',
};

const COLOR_LABELS_EN: Record<string, string> = {
  black: 'Black', blue: 'Blue', green: 'Green', grey: 'Grey', gray: 'Gray',
  pink: 'Pink', red: 'Red', white: 'White', yellow: 'Yellow',
  sunburst: 'Sunburst', dgil: 'Dave Gil', evh: 'EVH', relic: 'Relic', srv: 'SRV',
};

const COLOR_SWATCHES: Record<string, string> = {
  black: '#1a1a1a', blue: '#2563eb', green: '#16a34a', grey: '#6b7280', gray: '#6b7280',
  pink: '#ec4899', red: '#dc2626', white: '#f8fafc', yellow: '#eab308',
  sunburst: 'linear-gradient(135deg,#854d0e 0%,#ca8a04 45%,#1a1a1a 100%)',
  dgil: 'linear-gradient(135deg,#dc2626 0%,#1a1a1a 50%,#dc2626 100%)',
  evh: 'linear-gradient(135deg,#dc2626 0%,#f8fafc 40%,#1a1a1a 70%,#dc2626 100%)',
  relic: '#7a6a54', srv: '#1e3a5f',
};

// resolves the actual filename — handles typo 'sinlgec/singlec' and 'classicsgray'
const guitarImagePath = (model: string, color: string): string => {
  if (model === 'sinlgec') {
    return `/kids/workshop/guitars/${color === 'red' ? 'singlec' : 'sinlgec'}${color}.webp`;
  }
  if (model === 'classics' && color === 'grey') {
    return '/kids/workshop/guitars/classicsgray.webp';
  }
  return `/kids/workshop/guitars/${model}${color}.webp`;
};

// representative image for the model picker (first standard color)
const modelThumbPath = (model: GuitarModel): string =>
  guitarImagePath(model.id, model.colors[0] as string);

// ─── step machine ─────────────────────────────────────────────────────────────
type Step = 'model' | 'color' | 'name' | 'saved';

// ─── component ────────────────────────────────────────────────────────────────
const KidsCustomShopPage: React.FC = () => {
  const [theme]    = useState(() => getKidsTheme());
  const [lang]     = useState(() => getKidsLang());
  const isLight    = theme === 'light';
  const isPt       = lang === 'pt';

  const config     = loadConfig();
  const userId     = config?.currentUser || null;
  const isLoggedIn = Boolean(userId && userId !== 'guest');

  const [step,           setStep]           = useState<Step>('model');
  const [selectedModel,  setSelectedModel]  = useState<GuitarModel | null>(null);
  const [selectedColor,  setSelectedColor]  = useState<string>('');
  const [guitarName,     setGuitarName]     = useState('');
  const [savedGuitar,    setSavedGuitar]    = useState<KidsCustomGuitar | null>(null);
  const [garageFullMsg,  setGarageFullMsg]  = useState(false);
  const [bannerDismissed,setBannerDismissed]= useState(false);
  const [isExporting,    setIsExporting]    = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const modelLabels = isPt ? { classics: 'Classic-S', superstrat: 'Superstrat', modern: 'Modern', explorer: 'Explorer', flyingv: 'Flying V', sinlgec: 'Single Cut', semiac: 'Semi Acústica', cbaixo: 'Contrabaixo', violao: 'Violão', banjo: 'Banjo' } : { classics: 'Classic-S', superstrat: 'Superstrat', modern: 'Modern', explorer: 'Explorer', flyingv: 'Flying V', sinlgec: 'Single Cut', semiac: 'Semi Acoustic', cbaixo: 'Bass', violao: 'Acoustic Guitar', banjo: 'Banjo' };
  const colorLabels = isPt ? COLOR_LABELS_PT : COLOR_LABELS_EN;

  const copy = {
    title:       isPt ? 'Custom Shop'                             : 'Custom Shop',
    subtitle:    isPt ? 'Crie o instrumento dos seus sonhos!'     : 'Build your dream instrument!',
    stepModel:   isPt ? 'Escolha o modelo'                        : 'Pick a model',
    stepColor:   isPt ? 'Escolha a cor'                           : 'Pick a color',
    stepName:    isPt ? 'Dê um nome à sua guitarra'               : 'Name your guitar',
    namePlaceholder: isPt ? 'Ex: Mega Vermelha'                   : 'Ex: Super Red',
    save:        isPt ? 'Salvar minha guitarra! 🚀'               : 'Save my guitar! 🚀',
    exportPng:   isPt ? 'Baixar como imagem 📸'                   : 'Download image 📸',
    newGuitar:   isPt ? 'Criar outra guitarra 🎨'                 : 'Create another 🎨',
    back:        isPt ? '← Voltar'                                : '← Back',
    backKids:    isPt ? 'Voltar ao Kids'                          : 'Back to Kids',
    savedTitle:  isPt ? 'Instrumento salvo!'                      : 'Instrument saved!',
    garageFullMsg: isPt
      ? '🏠 Sua garagem está cheia! A guitarra mais antiga foi guardada no depósito.'
      : '🏠 Your garage is full! The oldest guitar was stored in the depot.',
    bannerGuest: isPt
      ? '🎸 Os instrumentos criados aqui ficam salvos neste dispositivo. Para guardar na conta e acessar de qualquer lugar, peça a um responsável para entrar com a conta dele.'
      : '🎸 Guitars created here are saved on this device. To keep them in an account, ask a guardian to sign in.',
    bannerLoggedIn: isPt
      ? '✅ Você está conectado. As guitarras criadas aqui serão salvas na sua conta.'
      : '✅ You are signed in. Your guitars will be saved to your account.',
    chars: isPt ? 'caracteres' : 'characters',
    noName: isPt ? 'Digite um nome antes de salvar!' : 'Enter a name before saving!',
  };

  // ── derived ──────────────────────────────────────────────────────────────────
  const availableColors = selectedModel?.colors ?? [];
  const savedCount      = loadKidsCustomGuitars(userId).length;

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleSelectModel = (model: GuitarModel) => {
    setSelectedModel(model);
    setSelectedColor(model.colors[0] as string);
    setStep('color');
  };

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    setStep('name');
  };

  const handleSave = () => {
    if (!selectedModel || !selectedColor) return;
    const trimmed = guitarName.trim();
    if (!trimmed) { alert(copy.noName); return; }

    const { newGuitar, removedOldest } = addKidsCustomGuitar(
      { model: selectedModel.id, color: selectedColor, name: trimmed },
      userId,
    );
    setSavedGuitar(newGuitar);
    setGarageFullMsg(removedOldest);
    setBannerDismissed(true);
    setStep('saved');
  };

  const handleExportPng = async () => {
    if (!cardRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      const safeName = (savedGuitar?.name || 'guitarra').replace(/[^a-zA-Z0-9]/g, '-');
      link.download = `minha-guitarra-${safeName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  const handleNewGuitar = () => {
    setSelectedModel(null);
    setSelectedColor('');
    setGuitarName('');
    setSavedGuitar(null);
    setGarageFullMsg(false);
    setStep('model');
  };

  // ── styles ───────────────────────────────────────────────────────────────────
  const bg       = isLight ? 'bg-slate-50 text-emerald-900' : 'bg-[#051109] text-emerald-50';
  const cardBase = isLight
    ? 'border-emerald-200 bg-white shadow-md'
    : 'border-emerald-600/70 bg-emerald-950/70 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.22)]';
  const btnPrimary = 'rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-black uppercase px-6 py-3 text-sm transition-all shadow-lg shadow-emerald-900/20';
  const btnSecondary = isLight
    ? 'rounded-2xl border border-emerald-300 bg-white text-emerald-700 font-black uppercase px-5 py-2.5 text-xs transition-all hover:bg-emerald-50 active:scale-95'
    : 'rounded-2xl border border-emerald-600/70 bg-emerald-950/70 text-emerald-200 font-black uppercase px-5 py-2.5 text-xs transition-all hover:bg-emerald-900/50 active:scale-95';

  // ── banner ───────────────────────────────────────────────────────────────────
  const showBanner = !bannerDismissed;

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <>
    <div className={`p-5 md:p-10 transition-colors duration-700 ${bg}`}>
      <div className="mx-auto max-w-3xl">
          <EcosystemPageActions ecosystem="kids" isLight={isLight} backLabel={copy.backKids} backPath="/kids" />

        <InternalEcosystemHeader ecosystem="kids" isLight={isLight} title={copy.title} subtitle={copy.subtitle} />
        {step !== 'model' && step !== 'saved' && (
          <div className="mb-8 flex justify-center">
            <button onClick={() => setStep(step === 'color' ? 'model' : 'color')} className={btnSecondary}>
              {copy.back}
            </button>
          </div>
        )}

        {/* info banner for guardian */}
        {showBanner && (
          <div className={`mb-6 rounded-2xl border p-4 text-sm font-semibold leading-relaxed ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-700/60 bg-emerald-900/40 text-emerald-200'}`}>
            {isLoggedIn ? copy.bannerLoggedIn : copy.bannerGuest}
          </div>
        )}

        {/* garage full message */}
        {garageFullMsg && (
          <div className={`mb-6 rounded-2xl border p-4 text-sm font-bold ${isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-600/60 bg-amber-900/30 text-amber-200'}`}>
            {copy.garageFullMsg}
          </div>
        )}

        {/* ── STEP: model ── */}
        {step === 'model' && (
          <section>
            <h2 className="mb-5 text-xl font-black uppercase tracking-wide text-emerald-400">
              {copy.stepModel}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {GUITAR_MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => handleSelectModel(model)}
                  className={`group rounded-[22px] border p-4 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(16,185,129,0.25)] active:scale-95 ${cardBase}`}
                >
                  <img
                    src={modelThumbPath(model)}
                    alt={modelLabels[model.id as keyof typeof modelLabels] ?? model.label}
                    className="h-24 w-full object-contain mb-3 drop-shadow-md group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <span className="text-[13px] font-black uppercase tracking-wide">{modelLabels[model.id as keyof typeof modelLabels] ?? model.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── STEP: color ── */}
        {step === 'color' && selectedModel && (
          <section className="flex flex-col items-center">
            <h2 className="mb-5 text-xl font-black uppercase tracking-wide text-emerald-400">
              {copy.stepColor} — {modelLabels[selectedModel.id as keyof typeof modelLabels] ?? selectedModel.label}
            </h2>

            {/* preview of selected color */}
            <div className={`mb-6 rounded-[24px] border p-5 flex flex-col items-center ${cardBase}`}>
              <img
                src={guitarImagePath(selectedModel.id, selectedColor)}
                alt={`${modelLabels[selectedModel.id as keyof typeof modelLabels] ?? selectedModel.label} ${selectedColor}`}
                className="h-48 object-contain drop-shadow-xl transition-all duration-300"
              />
              <span className="mt-3 text-sm font-black uppercase opacity-75">
                {colorLabels[selectedColor] ?? selectedColor}
              </span>
            </div>

            {/* color swatches */}
            <div className="flex flex-wrap justify-center gap-3">
              {availableColors.map(color => {
                const swatch = COLOR_SWATCHES[color] ?? '#9ca3af';
                const isGradient = swatch.startsWith('linear-gradient');
                const isSelected = color === selectedColor;
                return (
                  <button
                    key={color}
                    title={colorLabels[color] ?? color}
                    onClick={() => setSelectedColor(color as string)}
                    style={isGradient ? { background: swatch } : { backgroundColor: swatch }}
                    className={`w-10 h-10 rounded-full border-4 transition-all active:scale-90 ${isSelected ? 'border-emerald-400 scale-110 shadow-[0_0_12px_rgba(52,211,153,0.6)]' : color === 'white' && isLight ? 'border-gray-300 hover:scale-110 hover:border-emerald-300/60' : 'border-transparent hover:scale-110 hover:border-emerald-300/60'}`}
                  />
                );
              })}
            </div>

            <button onClick={() => handleSelectColor(selectedColor)} className={`mt-8 ${btnPrimary}`}>
              {isPt ? `Escolher esta cor →` : `Choose this color →`}
            </button>
          </section>
        )}

        {/* ── STEP: name ── */}
        {step === 'name' && selectedModel && (
          <section className="flex flex-col items-center">
            <h2 className="mb-5 text-xl font-black uppercase tracking-wide text-emerald-400">
              {copy.stepName}
            </h2>

            {/* guitar preview */}
            <div className={`mb-6 rounded-[24px] border p-5 flex flex-col items-center ${cardBase}`}>
              <img
                src={guitarImagePath(selectedModel.id, selectedColor)}
                alt={`${modelLabels[selectedModel.id as keyof typeof modelLabels] ?? selectedModel.label} ${selectedColor}`}
                className="h-40 object-contain drop-shadow-xl"
              />
              <span className="mt-2 text-xs font-bold uppercase opacity-60">
                {modelLabels[selectedModel.id as keyof typeof modelLabels] ?? selectedModel.label} · {colorLabels[selectedColor] ?? selectedColor}
              </span>
            </div>

            <div className="w-full max-w-xs">
              <input
                type="text"
                value={guitarName}
                onChange={e => setGuitarName(e.target.value.slice(0, 20))}
                placeholder={copy.namePlaceholder}
                maxLength={20}
                className={`w-full rounded-2xl border px-5 py-4 text-lg font-black text-center outline-none transition-all focus:ring-2 focus:ring-emerald-400 ${isLight ? 'border-emerald-200 bg-white text-emerald-900' : 'border-emerald-600/70 bg-emerald-950/80 text-emerald-50'}`}
              />
              <p className="mt-2 text-center text-xs font-bold opacity-50">
                {guitarName.length}/20 {copy.chars}
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={!guitarName.trim()}
              className={`mt-6 ${btnPrimary} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500 disabled:active:scale-100`}
            >
              {copy.save}
            </button>
          </section>
        )}

        {/* ── STEP: saved ── */}
        {step === 'saved' && savedGuitar && selectedModel && (
          <section className="flex flex-col items-center">
            <h2 className="mb-6 text-2xl font-black uppercase tracking-wide text-emerald-400 animate-in fade-in zoom-in-95 duration-500">
              🎉 {copy.savedTitle}
            </h2>

            {/* guitar card for export */}
            <div
              ref={cardRef}
              className={`w-full max-w-sm rounded-[28px] border-2 p-7 flex flex-col items-center shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 ${isLight ? 'border-emerald-300 bg-white' : 'border-emerald-500/60 bg-[#071a0d]'}`}
            >
              <p className={`mb-1 text-[10px] font-black uppercase tracking-[0.35em] ${isLight ? 'text-emerald-400' : 'text-emerald-500'}`}>
                Guitar Architect Kids — Custom Shop
              </p>
              <img
                src={guitarImagePath(selectedModel.id, savedGuitar.color)}
                alt={savedGuitar.name}
                className="h-52 object-contain drop-shadow-2xl my-4"
              />
              <h3 className={`text-2xl font-black italic uppercase tracking-tight ${isLight ? 'text-emerald-800' : 'text-emerald-100'}`}>
                {savedGuitar.name}
              </h3>
              <p className={`mt-1 text-xs font-bold uppercase opacity-60`}>
                {modelLabels[selectedModel.id as keyof typeof modelLabels] ?? selectedModel.label} · {colorLabels[savedGuitar.color] ?? savedGuitar.color}
              </p>
            </div>

            {/* action buttons */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <button onClick={handleExportPng} disabled={isExporting} className={btnPrimary}>
                {isExporting ? '⏳ Exportando...' : copy.exportPng}
              </button>
              <button onClick={handleNewGuitar} className={btnSecondary}>
                {copy.newGuitar}
              </button>
              <p className={`text-[10px] font-bold opacity-40 uppercase tracking-widest`}>
                {isPt ? `${savedCount} guitarra(s) salva(s)` : `${savedCount} guitar(s) saved`}
              </p>
            </div>
          </section>
        )}

        {/* step indicator dots */}
        {step !== 'saved' && (
          <div className="mt-10 flex justify-center gap-2">
            {(['model', 'color', 'name'] as Step[]).map(s => (
              <div
                key={s}
                className={`h-2.5 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-emerald-400' : 'w-2.5 bg-emerald-400/30'}`}
              />
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={() => navigateTo('/kids')}
            className="rounded-xl border border-emerald-500 bg-emerald-600 px-8 py-4 text-xs font-black uppercase text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-500 active:scale-95"
          >
            {isPt ? 'Voltar ao Kids' : 'Back to Kids'}
          </button>
        </div>
      </div>
    </div>

    <AppFooter
      isLight={isLight}
      lang={lang}
      logoSrc="/gakidslogo.webp"
      logoAlt="Guitar Architect Kids"
    />
    </>
  );
};

export default KidsCustomShopPage;
