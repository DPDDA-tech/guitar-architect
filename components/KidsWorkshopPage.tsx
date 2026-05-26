import React, { useMemo, useState } from 'react';
import { loadConfig } from '../utils/persistence';

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

const PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
  '#111827', '#475569', '#9ca3af', '#f8fafc'
];

const PARTS = ['Corpo', 'Braco', 'Headstock', 'Escudo'] as const;

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const KidsWorkshopPage: React.FC = () => {
  const [theme] = useState(() => loadConfig()?.theme || 'dark');
  const [selectedModel, setSelectedModel] = useState<WorkshopModelKey>('classicS');
  const [selectedPart, setSelectedPart] = useState<string>('Corpo');

  const isLight = theme === 'light';

  const gridStyle = useMemo(() => ({
    backgroundImage: `linear-gradient(${isLight ? '#d1d5db' : '#1f2937'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#d1d5db' : '#1f2937'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  }), [isLight]);

  const selectedModelOption = MODEL_OPTIONS.find(option => option.key === selectedModel) ?? MODEL_OPTIONS[0];

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none opacity-45" style={gridStyle} />

      <main className="relative mx-auto max-w-6xl">
        <header className="mb-6 md:mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-500">Guitar Architect Kids</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Oficina de Guitarras</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Escolha um modelo, pinte as partes do instrumento e crie sua primeira guitarra.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className={`rounded-3xl border p-4 md:p-5 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2">Modelo</label>
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
                {PARTS.map(part => (
                  <button
                    key={part}
                    onClick={() => setSelectedPart(part)}
                    className={`rounded-xl border px-3 py-2 text-xs font-black uppercase transition-all ${selectedPart === part ? 'border-emerald-500 bg-emerald-600 text-white' : isLight ? 'border-slate-300 hover:border-emerald-400' : 'border-zinc-700 hover:border-emerald-500'}`}
                  >
                    {part}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Paleta de Cores</p>
              <div className="grid grid-cols-8 gap-2">
                {PALETTE.map(color => (
                  <button
                    key={color}
                    aria-label={`Cor ${color}`}
                    className={`h-8 w-8 rounded-lg border transition-transform hover:scale-105 ${isLight ? 'border-slate-300' : 'border-zinc-700'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button className={`rounded-xl border px-3 py-3 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-slate-400' : 'border-zinc-700 bg-zinc-950 hover:border-zinc-500'}`}>
                Limpar
              </button>
              <button className="rounded-xl border border-emerald-500 bg-emerald-600 px-3 py-3 text-xs font-black uppercase text-white hover:bg-emerald-500">
                Surpresa
              </button>
            </div>

            <button
              onClick={() => navigateTo('/kids')}
              className={`mt-3 w-full rounded-xl border px-3 py-3 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-emerald-400' : 'border-zinc-700 bg-zinc-950 hover:border-emerald-500'}`}
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
            </div>
            <p className={`mt-3 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Modelo atual: {selectedModelOption.label}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default KidsWorkshopPage;
