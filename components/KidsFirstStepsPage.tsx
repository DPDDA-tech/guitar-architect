import React, { useState } from 'react';
import { getKidsLang, getKidsTheme } from '../utils/ecosystemPreferences';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';

type FirstStepsModelKey =
  | 'classicS'
  | 'singleCut'
  | 'explorer'
  | 'flyingV'
  | 'contrabaixo'
  | 'violao'
  | 'banjo';

type PartKey = 'body' | 'neck' | 'head' | 'detail';

const MODEL_OPTIONS: Array<{ key: FirstStepsModelKey; label: string }> = [
  { key: 'classicS', label: 'Classic S' },
  { key: 'singleCut', label: 'Single Cut' },
  { key: 'explorer', label: 'Explorer' },
  { key: 'flyingV', label: 'Flying V' },
  { key: 'contrabaixo', label: 'Contrabaixo' },
  { key: 'violao', label: 'Violão' },
  { key: 'banjo', label: 'Banjo' },
];

const PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
  '#111827', '#475569', '#9ca3af', '#f8fafc'
];

const DEFAULT_COLORS: Record<PartKey, string> = {
  body: '#3b82f6',
  neck: '#d6a56b',
  head: '#8b5e34',
  detail: '#f8fafc',
};

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const KidsFirstStepsPage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [lang] = useState(() => getKidsLang());
  const [selectedModel, setSelectedModel] = useState<FirstStepsModelKey>('classicS');
  const [selectedPart, setSelectedPart] = useState<PartKey>('body');
  const [colors, setColors] = useState<Record<PartKey, string>>(DEFAULT_COLORS);

  const isLight = theme === 'light';
  const isPt = lang === 'pt';

  const copy = {
    instrument: isPt ? 'Instrumento' : 'Instrument',
    parts: isPt ? 'Partes' : 'Parts',
    palette: isPt ? 'Paleta de Cores' : 'Color Palette',
    clear: isPt ? 'Limpar' : 'Clear',
    surprise: isPt ? 'Surpresa' : 'Surprise',
    preview: 'Preview',
    backKids: isPt ? 'Voltar ao Kids' : 'Back to Kids',
  };

  const localizedPartLabels: Record<PartKey, string> = {
    body: isPt ? 'Corpo' : 'Body',
    neck: isPt ? 'Braço' : 'Neck',
    head: isPt ? 'Mão / Headstock' : 'Head / Headstock',
    detail: isPt ? 'Detalhe' : 'Detail',
  };

  const localizedModelLabels: Record<FirstStepsModelKey, string> = {
    classicS: 'Classic S',
    singleCut: 'Single Cut',
    explorer: 'Explorer',
    flyingV: 'Flying V',
    contrabaixo: isPt ? 'Contrabaixo' : 'Bass',
    violao: isPt ? 'Violão' : 'Acoustic Guitar',
    banjo: 'Banjo',
  };

  const applyColor = (color: string) => {
    setColors(prev => ({ ...prev, [selectedPart]: color }));
  };

  const clearColors = () => {
    setColors(DEFAULT_COLORS);
    setSelectedPart('body');
  };

  const surpriseColors = () => {
    const randomColor = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];
    setColors({ body: randomColor(), neck: randomColor(), head: randomColor(), detail: randomColor() });
  };

  const renderInstrument = () => {
    const c = colors;
    switch (selectedModel) {
      case 'classicS':
        return (
          <svg viewBox="0 0 920 320" className="w-full h-auto max-w-[780px]" role="img" aria-label="Classic S outline to color">
            <path d="M120 86 C90 72 58 86 54 116 C50 146 66 180 98 194 C112 226 152 252 222 258 C314 266 420 232 458 178 C488 136 478 90 430 76 C394 44 320 38 248 52 C188 64 148 84 120 86 Z" fill={c.body} />
            <path d="M170 124 C152 132 144 148 150 162 C156 178 176 184 202 182 L292 176 C316 174 328 154 322 136 C316 118 296 110 266 110 C226 110 190 116 170 124 Z" fill={c.detail} opacity="0.95" />
            <rect x="456" y="144" width="220" height="20" rx="8" fill={c.neck} />
            <rect x="668" y="136" width="128" height="36" rx="14" fill={c.head} />
          </svg>
        );
      case 'singleCut':
        return (
          <svg viewBox="0 0 920 320" className="w-full h-auto max-w-[780px]" role="img" aria-label="Single Cut outline to color">
            <path d="M110 92 L250 60 L360 86 L458 134 L412 180 L500 246 L332 252 L224 208 L100 182 Z" fill={c.body} />
            <polygon points="226,112 318,118 286,170 196,160" fill={c.detail} opacity="0.92" />
            <rect x="464" y="144" width="220" height="20" rx="8" fill={c.neck} />
            <rect x="676" y="134" width="126" height="40" rx="10" fill={c.head} />
          </svg>
        );
      case 'explorer':
        return (
          <svg viewBox="0 0 920 320" className="w-full h-auto max-w-[780px]" role="img" aria-label="Explorer outline to color">
            <path d="M116 84 L306 148 L112 252 L238 252 L346 190 L460 252 L566 252 L372 148 L530 84 L364 118 Z" fill={c.body} />
            <polygon points="286,146 356,166 318,212 252,194" fill={c.detail} opacity="0.92" />
            <rect x="456" y="144" width="220" height="20" rx="8" fill={c.neck} />
            <rect x="676" y="132" width="124" height="44" rx="10" fill={c.head} />
          </svg>
        );
      case 'flyingV':
        return (
          <svg viewBox="0 0 920 320" className="w-full h-auto max-w-[780px]" role="img" aria-label="Flying V outline to color">
            <path d="M112 206 C148 136 220 92 304 94 C342 94 374 106 406 126 C368 138 344 158 334 182 C322 214 336 238 372 254 C292 266 204 254 150 228 C132 220 120 214 112 206 Z" fill={c.body} />
            <path d="M284 136 C304 136 318 146 320 160 C322 174 308 186 286 188 C266 190 246 184 238 172 C232 160 240 146 258 140 C266 138 274 136 284 136 Z" fill={c.detail} opacity="0.92" />
            <rect x="404" y="146" width="252" height="18" rx="8" fill={c.neck} />
            <rect x="668" y="128" width="132" height="42" rx="10" fill={c.head} />
          </svg>
        );
      case 'contrabaixo':
        return (
          <svg viewBox="0 0 920 320" className="w-full h-auto max-w-[780px]" role="img" aria-label="Bass outline to color">
            <path d="M106 94 C84 110 70 134 70 160 C70 198 98 228 150 242 C218 260 346 260 424 236 C492 214 534 178 534 136 C534 102 508 80 460 70 C414 50 360 44 298 47 C224 50 156 66 106 94 Z" fill={c.body} />
            <rect x="194" y="132" width="194" height="52" rx="24" fill={c.detail} opacity="0.9" />
            <rect x="472" y="142" width="320" height="18" rx="8" fill={c.neck} />
            <rect x="782" y="130" width="98" height="42" rx="10" fill={c.head} />
          </svg>
        );
      case 'violao':
        return (
          <svg viewBox="0 0 920 320" className="w-full h-auto max-w-[780px]" role="img" aria-label="Acoustic guitar outline to color">
            <path d="M214 70 C168 78 132 110 120 154 C106 206 134 248 192 262 C244 274 320 270 374 252 C430 232 460 198 454 154 C448 112 416 84 366 74 C326 52 276 48 214 70 Z" fill={c.body} />
            <circle cx="286" cy="160" r="34" fill={c.detail} opacity="0.9" />
            <rect x="450" y="145" width="214" height="18" rx="8" fill={c.neck} />
            <rect x="662" y="136" width="118" height="36" rx="10" fill={c.head} />
          </svg>
        );
      case 'banjo':
        return (
          <svg viewBox="0 0 920 320" className="w-full h-auto max-w-[780px]" role="img" aria-label="Banjo outline to color">
            <circle cx="268" cy="164" r="102" fill={c.body} />
            <circle cx="268" cy="164" r="62" fill={c.detail} opacity="0.9" />
            <rect x="368" y="147" width="254" height="14" rx="7" fill={c.neck} />
            <rect x="620" y="136" width="122" height="36" rx="10" fill={c.head} />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <main className="relative mx-auto max-w-6xl">
        <EcosystemPageActions ecosystem="kids" isLight={isLight} backLabel={copy.backKids} backPath="/kids" />
        <InternalEcosystemHeader ecosystem="kids" isLight={isLight} title="Primeiros Passos" subtitle="Pinte as figuras dos instrumentos." />

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className={`rounded-3xl border p-4 md:p-5 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]">{copy.instrument}</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as FirstStepsModelKey)}
              className={`w-full rounded-xl border px-3 py-2 text-sm font-bold outline-none ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}
            >
              {MODEL_OPTIONS.map(model => (
                <option key={model.key} value={model.key}>{localizedModelLabels[model.key]}</option>
              ))}
            </select>

            <p className="mb-2 mt-5 text-[10px] font-black uppercase tracking-[0.2em]">{copy.parts}</p>
            <div className="grid grid-cols-2 gap-2">
              {(['body', 'neck', 'head', 'detail'] as PartKey[]).map(part => (
                <button
                  key={part}
                  onClick={() => setSelectedPart(part)}
                  className={`min-h-[44px] rounded-xl border px-3 py-2 text-center text-xs font-black uppercase leading-tight transition-all ${selectedPart === part ? 'border-emerald-500 bg-emerald-600 text-white' : isLight ? 'border-slate-300 hover:border-emerald-400' : 'border-zinc-700 hover:border-emerald-500'}`}
                >
                  {localizedPartLabels[part]}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em]">{copy.palette}</p>
              <div className="grid grid-cols-8 gap-2">
                {PALETTE.map(color => (
                  <button
                    key={color}
                    onClick={() => applyColor(color)}
                    aria-label={`${isPt ? 'Aplicar cor' : 'Apply color'} ${color}`}
                    className={`h-8 w-8 rounded-lg border transition-transform hover:scale-105 ${colors[selectedPart] === color ? 'border-emerald-500 ring-2 ring-emerald-400' : isLight ? 'border-slate-300' : 'border-zinc-700'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button onClick={clearColors} className={`min-h-[44px] rounded-xl border px-3 py-3 text-center text-xs font-black uppercase leading-tight ${isLight ? 'border-slate-300 bg-white hover:border-slate-400' : 'border-zinc-700 bg-zinc-950 hover:border-zinc-500'}`}>
                {copy.clear}
              </button>
              <button onClick={surpriseColors} className="min-h-[44px] rounded-xl border border-emerald-500 bg-emerald-600 px-3 py-3 text-center text-xs font-black uppercase leading-tight text-white hover:bg-emerald-500">
                {copy.surprise}
              </button>
            </div>

            <button
              onClick={() => navigateTo('/kids')}
              className={`mt-3 min-h-[44px] w-full rounded-xl border px-3 py-3 text-center text-xs font-black uppercase leading-tight ${isLight ? 'border-slate-300 bg-white hover:border-emerald-400' : 'border-zinc-700 bg-zinc-950 hover:border-emerald-500'}`}
            >
              {copy.backKids}
            </button>
          </aside>

          <div className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
            <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-500">{copy.preview}</div>
            <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 p-4 md:min-h-[420px]">
              {renderInstrument()}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default KidsFirstStepsPage;