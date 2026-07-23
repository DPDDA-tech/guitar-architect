import React, { useEffect, useState } from 'react';
import { loadConfig } from '../utils/persistence';
import { getGlobalLang, getGlobalTheme, setGlobalPreferences } from '../utils/ecosystemPreferences';
import AppFooter from './AppFooter';
import GearProductGalleryModal from './GearProductGalleryModal';
import GearProductFeedbackModal from './GearProductFeedbackModal';

type ThemeMode = 'light' | 'dark';
type AppLang = 'pt' | 'en';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

type GearProductStatus =
  | 'idea'
  | 'research'
  | 'concept_prototyping'
  | 'public_consultation'
  | 'supplier_consultation'
  | 'physical_prototyping'
  | 'validation'
  | 'approved'
  | 'available';

interface GearProductVariant {
  id: string;
  label: string;
  image: string;
}

interface GearProduct {
  id: string;
  name: string;
  description: { pt: string; en: string };
  status: GearProductStatus;
  image: string;
  gallery?: string[];
  variants?: GearProductVariant[];
}

const STATUS_LABELS: Record<GearProductStatus, { emoji: string; pt: string; en: string }> = {
  idea: { emoji: '⚫', pt: 'Ideação', en: 'Ideation' },
  research: { emoji: '🔵', pt: 'Pesquisa', en: 'Research' },
  concept_prototyping: { emoji: '🟣', pt: 'Em prototipagem conceitual', en: 'In concept prototyping' },
  public_consultation: { emoji: '🔷', pt: 'Consulta pública', en: 'Public consultation' },
  supplier_consultation: { emoji: '🟧', pt: 'Consulta a fornecedores', en: 'Supplier consultation' },
  physical_prototyping: { emoji: '🟤', pt: 'Prototipagem física', en: 'Physical prototyping' },
  validation: { emoji: '🟡', pt: 'Em validação', en: 'In validation' },
  approved: { emoji: '🟢', pt: 'Aprovado', en: 'Approved' },
  available: { emoji: '✅', pt: 'Disponível', en: 'Available' },
};

const STATUS_BADGE_CLASSES: Record<GearProductStatus, { light: string; dark: string }> = {
  idea: { light: 'border-zinc-200 bg-zinc-50 text-zinc-700', dark: 'border-zinc-700 bg-zinc-900/40 text-zinc-300' },
  research: { light: 'border-blue-200 bg-blue-50 text-blue-700', dark: 'border-blue-900/60 bg-blue-950/30 text-blue-300' },
  concept_prototyping: { light: 'border-violet-200 bg-violet-50 text-violet-700', dark: 'border-violet-900/60 bg-violet-950/30 text-violet-300' },
  public_consultation: { light: 'border-cyan-200 bg-cyan-50 text-cyan-700', dark: 'border-cyan-900/60 bg-cyan-950/30 text-cyan-300' },
  supplier_consultation: { light: 'border-orange-200 bg-orange-50 text-orange-700', dark: 'border-orange-900/60 bg-orange-950/30 text-orange-300' },
  physical_prototyping: { light: 'border-amber-300 bg-amber-50 text-amber-800', dark: 'border-amber-800/60 bg-amber-950/40 text-amber-200' },
  validation: { light: 'border-amber-200 bg-amber-50 text-amber-700', dark: 'border-amber-900/60 bg-amber-950/30 text-amber-300' },
  approved: { light: 'border-teal-200 bg-teal-50 text-teal-700', dark: 'border-teal-900/60 bg-teal-950/30 text-teal-300' },
  available: { light: 'border-emerald-200 bg-emerald-50 text-emerald-700', dark: 'border-emerald-900/60 bg-emerald-950/30 text-emerald-300' },
};

const GEAR_PLACEHOLDER_IMAGE = '/gear/shared/product-placeholder.webp';

const handleGearImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (!image.dataset.fallbackApplied) {
    image.dataset.fallbackApplied = 'true';
    image.src = GEAR_PLACEHOLDER_IMAGE;
  }
};

const ROADMAP_IMAGE_FRAMES: Record<string, { image: string; position: string; alt: { pt: string; en: string } }> = {
  idea: {
    image: '/gear/shared/roadmap-idea.webp',
    position: 'object-center',
    alt: { pt: 'Conceito inicial de produto da linha Gear', en: 'Initial product concept for the Gear line' },
  },
  research: {
    image: '/gear/shared/roadmap-research.webp',
    position: 'object-center',
    alt: { pt: 'Pesquisa e estudo técnico de produto da linha Gear', en: 'Research and technical study of a Gear line product' },
  },
  prototyping: {
    image: '/gear/shared/roadmap-prototyping.webp',
    position: 'object-center',
    alt: { pt: 'Protótipo conceitual de produto da linha Gear', en: 'Conceptual prototype of a Gear line product' },
  },
  validating: {
    image: '/gear/shared/roadmap-validation.webp',
    position: 'object-center',
    alt: { pt: 'Palheta submetida a medição e ensaio de validação', en: 'Pick undergoing measurement and validation testing' },
  },
  available: {
    image: '/gear/shared/roadmap-available.webp',
    position: 'object-center',
    alt: { pt: 'Produto aprovado e preparado para disponibilização', en: 'Product approved and prepared for release' },
  },
};

const GEAR_PRODUCTS: GearProduct[] = [
  {
    id: 'blueprint-journal',
    name: 'Blueprint Journal',
    description: {
      pt: 'Estamos estudando um caderno de prática que reúna pauta musical, tablatura, diagramas, planejamento de estudos e registro de evolução.',
      en: 'We are studying a practice notebook that brings together sheet music, tablature, diagrams, study planning and progress logs.',
    },
    status: 'public_consultation',
    image: '/gear/products/blueprint-journals/01-main.webp',
  },
  {
    id: 'desk-mat-studio',
    name: 'Desk Mat Studio',
    description: {
      pt: 'Estamos estudando um desk mat amplo para organizar a bancada de estudo, prática e produção musical.',
      en: 'We are studying a large desk mat to organize the study, practice and music production bench.',
    },
    status: 'public_consultation',
    image: '/gear/products/desk-mat-studio/01-main.webp',
  },
  {
    id: 'cleaning-kit',
    name: 'Kit de Limpeza',
    description: {
      pt: 'Estamos estudando um conjunto de itens para limpeza e conservação cotidiana do instrumento.',
      en: 'We are studying a set of items for everyday instrument cleaning and care.',
    },
    status: 'public_consultation',
    image: '/gear/products/cleaning-kits/01-main.webp',
  },
  {
    id: 'premium-cap',
    name: 'Boné Premium',
    description: {
      pt: 'Estamos estudando um boné bordado que represente a identidade visual do Guitar Architect com acabamento premium.',
      en: 'We are studying an embroidered cap that represents the Guitar Architect visual identity with premium finishing.',
    },
    status: 'public_consultation',
    image: '/gear/products/premium-caps/01-main.webp',
    variants: [
      { id: 'green', label: 'Verde', image: '/gear/products/premium-caps/02-green.webp' },
      { id: 'purple', label: 'Roxo', image: '/gear/products/premium-caps/03-purple.webp' },
    ],
  },
  {
    id: 'pedalboard-dust-cover',
    name: 'Dust Cover para Pedaleira',
    description: {
      pt: 'Estamos estudando uma capa leve para proteger pedaleiras e pedais contra poeira entre uma sessão e outra.',
      en: 'We are studying a lightweight cover to protect pedalboards and pedals from dust between sessions.',
    },
    status: 'public_consultation',
    image: '/gear/products/pedalboard-dust-covers/01-main.webp',
    variants: [
      { id: 'green', label: 'Verde', image: '/gear/products/pedalboard-dust-covers/02-green.webp' },
      { id: 'purple', label: 'Roxo', image: '/gear/products/pedalboard-dust-covers/03-purple.webp' },
    ],
  },
  {
    id: 'pedalboard-soft-case',
    name: 'Soft Case para Pedaleira',
    description: {
      pt: 'Estamos estudando uma soft case leve para organizar, proteger e transportar pedaleiras no dia a dia.',
      en: 'We are studying a lightweight soft case to organize, protect and carry pedalboards day to day.',
    },
    status: 'public_consultation',
    image: '/gear/products/pedalboard-softcases/01-main.webp',
    variants: [
      { id: 'green', label: 'Verde', image: '/gear/products/pedalboard-softcases/02-green.webp' },
      { id: 'purple', label: 'Roxo', image: '/gear/products/pedalboard-softcases/03-purple.webp' },
    ],
  },
  {
    id: 'modular-organizer-case',
    name: 'Maleta Organizadora Modular',
    description: {
      pt: 'Estamos estudando uma maleta robusta e modular para organizar acessórios, cabos, ferramentas e pequenos equipamentos.',
      en: 'We are studying a rugged, modular case to organize accessories, cables, tools and small gear.',
    },
    status: 'public_consultation',
    image: '/gear/products/organizer-cases/01-main.webp',
    gallery: [
      '/gear/products/organizer-cases/02-open-dividers.webp',
      '/gear/products/organizer-cases/03-open-empty.webp',
      '/gear/products/organizer-cases/04-closed.webp',
      '/gear/products/organizer-cases/05-metal-badge-concept.webp',
    ],
  },
  {
    id: 'maintenance-kit',
    name: 'Kit de Manutenção',
    description: {
      pt: 'Estamos estudando um conjunto organizado de ferramentas essenciais para ajustes e manutenção básica do instrumento.',
      en: 'We are studying an organized set of essential tools for basic instrument setup and maintenance.',
    },
    status: 'public_consultation',
    image: '/gear/products/adjustment-kits/01-main.webp',
    gallery: ['/gear/products/adjustment-kits/02-open-detail.webp'],
  },
  {
    id: 'mug',
    name: 'Caneca',
    description: {
      pt: 'Estamos estudando uma linha de canecas para o cotidiano de estudo, prática e trabalho do músico.',
      en: 'We are studying a line of mugs for the musician’s everyday study, practice and work routine.',
    },
    status: 'public_consultation',
    image: '/gear/products/mugs/01-main.webp',
    variants: [
      { id: 'green', label: 'Verde', image: '/gear/products/mugs/02-green.webp' },
      { id: 'purple', label: 'Roxo', image: '/gear/products/mugs/03-purple.webp' },
      { id: 'white-blue', label: 'Branco e azul', image: '/gear/products/mugs/04-white-blue.webp' },
      { id: 'white-green', label: 'Branco e verde', image: '/gear/products/mugs/05-white-green.webp' },
      { id: 'white-purple', label: 'Branco e roxo', image: '/gear/products/mugs/06-white-purple.webp' },
    ],
  },
  {
    id: 'picks',
    name: 'Palhetas',
    description: {
      pt: 'Estamos estudando uma linha própria de palhetas em diferentes espessuras, voltada a distintos estilos e formas de execução.',
      en: 'We are studying our own line of picks in different thicknesses, aimed at different styles and playing techniques.',
    },
    status: 'public_consultation',
    image: '/gear/products/picks/01-main.webp',
    gallery: ['/gear/products/picks/02-open-details.webp', '/gear/products/picks/03-single-pick.webp'],
  },
  {
    id: 'pick-tin',
    name: 'Caixa Metálica para Palhetas',
    description: {
      pt: 'Estamos estudando um estojo metálico compacto para guardar e transportar palhetas com segurança.',
      en: 'We are studying a compact metal tin to safely store and carry picks.',
    },
    status: 'public_consultation',
    image: '/gear/products/pick-tins/01-main.webp',
    gallery: ['/gear/products/pick-tins/02-open.webp'],
  },
  {
    id: 'headphone-stand',
    name: 'Suporte para Fones',
    description: {
      pt: 'Estamos estudando um suporte de mesa para manter os fones organizados e acessíveis durante a prática e a produção musical.',
      en: 'We are studying a desk stand to keep headphones organized and accessible during practice and production.',
    },
    status: 'public_consultation',
    image: '/gear/products/headphone-stands/01-main.webp',
    gallery: ['/gear/products/headphone-stands/02-concept.webp'],
  },
  {
    id: 'pedalboard-mat',
    name: 'Pedalboard Mat',
    description: {
      pt: 'Estamos estudando uma base para pedaleiras que ajude a proteger o piso, organizar cabos e delimitar o espaço de uso do equipamento.',
      en: 'We are studying a pedalboard base that helps protect the floor, organize cables and define the equipment’s footprint.',
    },
    status: 'public_consultation',
    image: '/gear/products/pedalboard-mats/01-main.webp',
  },
  {
    id: 'thermal-line',
    name: 'Linha Térmica',
    description: {
      pt: 'Estamos estudando uma linha de copos, canecas e garrafas térmicas para acompanhar o músico em estudos, ensaios, trabalho e deslocamentos.',
      en: 'We are studying a line of thermal cups, mugs and bottles to accompany musicians through study, rehearsals, work and travel.',
    },
    status: 'public_consultation',
    image: '/gear/products/thermal-line/01-main.webp',
    gallery: [
      '/gear/products/thermal-line/02-bottles.webp',
      '/gear/products/thermal-line/03-tumblers.webp',
      '/gear/products/thermal-line/04-travel-cups.webp',
    ],
  },
  {
    id: 'guitar-premium-bag',
    name: 'Bag Premium para Guitarra',
    description: {
      pt: 'Estamos estudando uma bag leve, acolchoada e funcional para proteger e transportar o instrumento no dia a dia.',
      en: 'We are studying a lightweight, padded and functional bag to protect and carry the instrument day to day.',
    },
    status: 'public_consultation',
    image: '/gear/products/guitar-premium-bags/01-main.webp',
    variants: [
      { id: 'green', label: 'Verde', image: '/gear/products/guitar-premium-bags/02-green.webp' },
      { id: 'purple', label: 'Roxo', image: '/gear/products/guitar-premium-bags/03-purple.webp' },
    ],
  },
];

// Canonical list of published Gear product ids. Exported so the
// submit-gear-feedback Edge Function's own allowlist (duplicated there
// because Edge Functions cannot import from outside their directory) can be
// tested for drift against this single source of truth — see
// tests/gear-feedback-function.test.ts.
export const GEAR_PRODUCT_IDS = GEAR_PRODUCTS.map(product => product.id);

const ROADMAP_TIMELINE = [
  { pt: 'Ideação', en: 'Ideation' },
  { pt: 'Pesquisa', en: 'Research' },
  { pt: 'Prototipagem conceitual', en: 'Concept prototyping' },
  { pt: 'Consulta pública', en: 'Public consultation' },
  { pt: 'Consulta a fornecedores', en: 'Supplier consultation' },
  { pt: 'Prototipagem física', en: 'Physical prototyping' },
  { pt: 'Validação', en: 'Validation' },
  { pt: 'Aprovação', en: 'Approval' },
  { pt: 'Disponibilização', en: 'Availability' },
] as const;

const PARTNER_CATEGORIES = [
  { pt: 'Produtos têxteis', en: 'Textile products' },
  { pt: 'Impressão premium', en: 'Premium printing' },
  { pt: 'Produtos em couro', en: 'Leather products' },
  { pt: 'Madeira', en: 'Wood' },
  { pt: 'Produtos metálicos', en: 'Metal products' },
  { pt: 'Cases', en: 'Cases' },
  { pt: 'Acessórios musicais', en: 'Musical accessories' },
  { pt: 'Organização', en: 'Organization' },
  { pt: 'Ferramentas', en: 'Tools' },
] as const;

const GearPage: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => getGlobalTheme());
  const [lang, setLang] = useState<AppLang>(() => getGlobalLang());
  const [galleryProduct, setGalleryProduct] = useState<GearProduct | null>(null);
  const [feedbackProduct, setFeedbackProduct] = useState<GearProduct | null>(null);
  const isLight = theme === 'light';
  const isPt = lang === 'pt';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = isLight ? 'dark' : 'light';
    const current = loadConfig();
    const next = { ...(current || {}), theme: nextTheme, lang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(nextTheme, lang);
    setTheme(nextTheme);
  };

  const toggleLang = () => {
    const nextLang: AppLang = lang === 'pt' ? 'en' : 'pt';
    const current = loadConfig();
    const next = { ...(current || {}), theme, lang: nextLang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(theme, nextLang);
    setLang(nextLang);
  };

  const gridStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  };

  const cardClass = isLight
    ? 'border-zinc-200 bg-white/95 shadow-2xl'
    : 'border-[rgba(30,64,175,0.45)] bg-[rgba(7,17,31,0.96)] shadow-[0_24px_80px_rgba(0,0,0,0.55)]';
  const panelClass = isLight
    ? 'border-zinc-200 bg-white'
    : 'border-[rgba(30,64,175,0.4)] bg-[rgba(10,20,36,0.92)] shadow-[0_12px_40px_rgba(0,0,0,0.45)]';
  const accentPanelClass = isLight
    ? 'border-blue-200/60 bg-blue-50/60'
    : 'border-[rgba(30,64,175,0.4)] bg-[rgba(10,20,36,0.92)] shadow-[0_12px_40px_rgba(0,0,0,0.45)]';
  const accentTextClass = isLight ? 'text-blue-700' : 'text-blue-300';
  const actionClass = isLight
    ? 'border-zinc-300 bg-white text-zinc-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:border-blue-400'
    : 'border-zinc-700 bg-zinc-900 text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:border-blue-500';

  const roadmapGroups = isPt
    ? [
        { id: 'idea', badge: '⚫', title: 'Ideação', accent: isLight ? 'text-zinc-600' : 'text-zinc-400', border: isLight ? 'border-zinc-300' : 'border-zinc-700' },
        { id: 'research', badge: '🔵', title: 'Pesquisa', accent: isLight ? 'text-blue-600' : 'text-blue-400', border: isLight ? 'border-blue-200' : 'border-blue-900/60' },
        { id: 'prototyping', badge: '🟣', title: 'Prototipagem', accent: isLight ? 'text-violet-600' : 'text-violet-400', border: isLight ? 'border-violet-200' : 'border-violet-900/60' },
        { id: 'validating', badge: '🟡', title: 'Validação', accent: isLight ? 'text-amber-600' : 'text-amber-400', border: isLight ? 'border-amber-200' : 'border-amber-900/60' },
        { id: 'available', badge: '🟢', title: 'Disponibilização', accent: isLight ? 'text-emerald-600' : 'text-emerald-400', border: isLight ? 'border-emerald-200' : 'border-emerald-900/60' },
      ]
    : [
        { id: 'idea', badge: '⚫', title: 'Ideation', accent: isLight ? 'text-zinc-600' : 'text-zinc-400', border: isLight ? 'border-zinc-300' : 'border-zinc-700' },
        { id: 'research', badge: '🔵', title: 'Research', accent: isLight ? 'text-blue-600' : 'text-blue-400', border: isLight ? 'border-blue-200' : 'border-blue-900/60' },
        { id: 'prototyping', badge: '🟣', title: 'Prototyping', accent: isLight ? 'text-violet-600' : 'text-violet-400', border: isLight ? 'border-violet-200' : 'border-violet-900/60' },
        { id: 'validating', badge: '🟡', title: 'Validation', accent: isLight ? 'text-amber-600' : 'text-amber-400', border: isLight ? 'border-amber-200' : 'border-amber-900/60' },
        { id: 'available', badge: '🟢', title: 'Availability', accent: isLight ? 'text-emerald-600' : 'text-emerald-400', border: isLight ? 'border-emerald-200' : 'border-emerald-900/60' },
      ];

  const philosophyCards = isPt
    ? [
        { title: 'Curadoria, não catálogo', body: 'Não queremos vender centenas de produtos.' },
        { title: 'Uso real', body: 'Queremos indicar apenas aquilo que realmente utilizaríamos.' },
        { title: 'Justificativa técnica', body: 'Cada item deverá possuir uma justificativa técnica.' },
        { title: 'Sem margem como critério', body: 'Nenhum produto entrará apenas por possuir boa margem.' },
      ]
    : [
        { title: 'Curation, not a catalog', body: 'We do not want to sell hundreds of products.' },
        { title: 'Real use', body: 'We want to indicate only what we would actually use.' },
        { title: 'Technical justification', body: 'Every item must have a technical justification.' },
        { title: 'No margin as a criterion', body: 'No product will be included just because it has a good margin.' },
      ];

  const philosophyPrinciples = isPt
    ? ['Utilidade acima da estética', 'Qualidade acima da quantidade', 'Durabilidade acima do consumo', 'Transparência acima do marketing', 'Somente produtos que realmente utilizaríamos']
    : ['Usefulness above aesthetics', 'Quality above quantity', 'Durability above consumption', 'Transparency above marketing', 'Only products we would actually use'];

  const transparencyPoints = isPt
    ? [
        'Nem todos os produtos serão fabricados.',
        'Nem todos encontrarão parceiros industriais.',
        'Alguns permanecerão apenas como conceitos.',
        'Cada produto indicará claramente seu estágio de desenvolvimento.',
        'Nunca divulgaremos um produto como disponível antes de confirmar sua viabilidade técnica e econômica.',
      ]
    : [
        'Not every product will be manufactured.',
        'Not every product will find an industrial partner.',
        'Some will remain only as concepts.',
        'Each product will clearly indicate its development stage.',
        'We will never announce a product as available before confirming its technical and economic viability.',
      ];

  return (
    <>
      <div className={`relative min-h-screen p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
        <div className="absolute inset-0 pointer-events-none opacity-50" style={gridStyle} />

        <div className="relative mx-auto max-w-[1000px] py-6">
          <div className="mb-8 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => navigateTo('/ecosystem')}
              className="inline-flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest hover:underline"
            >
              {isPt ? '← Voltar ao App' : '← Back to App'}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-black transition-all ${actionClass}`}
                aria-label={isLight ? (isPt ? 'Ativar modo escuro' : 'Enable dark mode') : (isPt ? 'Ativar modo claro' : 'Enable light mode')}
              >
                {isLight ? <MoonIcon /> : <SunIcon />}
              </button>
              <button
                type="button"
                onClick={toggleLang}
                className={`min-h-[36px] rounded-xl border px-3 py-2 text-[11px] font-black uppercase transition-all ${actionClass}`}
              >
                {lang.toUpperCase()}
              </button>
            </div>
          </div>

          <div className="text-center mb-10">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Guitar Architect</p>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">GEAR</h1>
            <p className="mt-3 text-zinc-500 font-bold uppercase text-[12px] md:text-sm tracking-[0.2em]">
              {isPt ? 'Ferramentas, acessórios e soluções cuidadosamente selecionados para músicos.' : 'Tools, accessories and solutions carefully selected for musicians.'}
            </p>
          </div>

          <div className={`rounded-[40px] border p-8 md:p-12 ${cardClass}`}>
            <div className={`mb-8 overflow-hidden rounded-3xl border ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-blue-950/70 bg-zinc-900'}`}>
              <video
                width="1600"
                height="900"
                controls
                playsInline
                preload="metadata"
                poster="/gear/shared/diana-gear.webp"
                aria-label={isPt ? 'Vídeo institucional da Diana sobre a proposta do Gear.' : 'Institutional video by Diana about the Gear proposal.'}
                className="aspect-video h-auto w-full object-cover"
              >
                <source src="/gear/shared/diana-gear.mp4" type="video/mp4" />
                {isPt ? 'Vídeo institucional da Diana sobre a proposta do Gear.' : 'Institutional video by Diana about the Gear proposal.'}
              </video>
            </div>
            <div className="space-y-8 text-sm md:text-base">

              {/* Nossa missão */}
              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{isPt ? 'Nossa missão' : 'Our mission'}</h2>
                <div className="space-y-3">
                  <p>
                    {isPt
                      ? 'Muitos músicos passam anos comprando equipamentos que prometem resolver problemas que, na prática, continuam existindo.'
                      : 'Many musicians spend years buying equipment that promises to solve problems that, in practice, keep existing.'}
                  </p>
                  <p>{isPt ? 'O Gear nasceu para inverter essa lógica.' : 'Gear was created to invert that logic.'}</p>
                  <p>
                    {isPt
                      ? 'Antes de pensar em vender qualquer produto, buscamos compreender quais problemas realmente merecem ser resolvidos.'
                      : 'Before thinking about selling any product, we seek to understand which problems truly deserve to be solved.'}
                  </p>
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              {/* Hero text */}
              <section>
                <div className="space-y-3">
                  <p>
                    {isPt
                      ? 'O Guitar Architect acredita que bons equipamentos devem resolver problemas reais.'
                      : 'Guitar Architect believes good equipment should solve real problems.'}
                  </p>
                  <p>
                    {isPt
                      ? 'Por isso estamos desenvolvendo cuidadosamente uma linha de produtos baseada em utilidade, qualidade, durabilidade e coerência com nossa filosofia de ensino.'
                      : 'That is why we are carefully developing a product line based on usefulness, quality, durability and coherence with our teaching philosophy.'}
                  </p>
                  <p>
                    {isPt
                      ? 'Esta página acompanha publicamente essa construção.'
                      : 'This page publicly follows that construction.'}
                  </p>
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              {/* Por que existe o Gear? */}
              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{isPt ? 'Por que existe o Gear?' : 'Why does Gear exist?'}</h2>
                <div className="space-y-3">
                  <p>{isPt ? 'Aprender música vai muito além das aulas.' : 'Learning music goes far beyond lessons.'}</p>
                  <p>
                    {isPt
                      ? 'Também envolve organização, rotina de estudos, manutenção dos instrumentos, ergonomia, cuidado com os equipamentos e um ambiente agradável para praticar.'
                      : 'It also involves organization, a study routine, instrument maintenance, ergonomics, care for equipment and a pleasant environment for practice.'}
                  </p>
                  <p>{isPt ? 'O Gear nasceu para apoiar essa jornada.' : 'Gear was created to support that journey.'}</p>
                  <p>{isPt ? 'Nosso objetivo não é criar uma loja cheia de produtos.' : 'Our goal is not to create a store full of products.'}</p>
                  <p>
                    {isPt
                      ? 'Queremos desenvolver uma seleção pequena, útil e cuidadosamente escolhida para resolver problemas reais enfrentados por músicos em seu dia a dia.'
                      : 'We want to develop a small, useful and carefully chosen selection to solve real problems musicians face day to day.'}
                  </p>
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              {/* Nossa Filosofia */}
              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{isPt ? 'Nossa Filosofia' : 'Our Philosophy'}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {philosophyCards.map(card => (
                    <div key={card.title} className={`rounded-2xl border p-5 ${panelClass}`}>
                      <h3 className={`text-sm font-black uppercase tracking-tight ${accentTextClass}`}>{card.title}</h3>
                      <p className={`mt-2 text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>{card.body}</p>
                    </div>
                  ))}
                </div>
                <div className={`mt-4 rounded-2xl border p-5 ${panelClass}`}>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {philosophyPrinciples.map(principle => (
                      <li key={principle} className={`flex items-start gap-2 text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${isLight ? 'bg-blue-400' : 'bg-blue-500'}`} aria-hidden="true" />
                        {principle}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              {/* Manual de Curadoria */}
              <section className={`rounded-3xl border p-6 text-center ${accentPanelClass}`}>
                <h2 className={`text-lg font-black uppercase tracking-tight mb-3 ${accentTextClass}`}>{isPt ? 'Manual de Curadoria' : 'Curation Manual'}</h2>
                <p className={`mb-5 text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                  {isPt
                    ? 'Os critérios que orientam cada escolha estão documentados publicamente.'
                    : 'The criteria guiding every choice are publicly documented.'}
                </p>
                <button
                  type="button"
                  onClick={() => navigateTo('/gear/curadoria')}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-black text-white transition hover:bg-blue-500"
                >
                  {isPt ? 'Conheça nosso Manual de Curadoria' : 'See our Curation Manual'}
                </button>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              {/* Roadmap Gear */}
              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-2">{isPt ? 'Roadmap Gear' : 'Gear Roadmap'}</h2>
                <p className={`mb-5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {isPt ? 'O estágio público de cada frente de trabalho da linha Gear.' : 'The public stage of each Gear line workstream.'}
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {roadmapGroups.map(group => {
                    const frame = ROADMAP_IMAGE_FRAMES[group.id] ?? ROADMAP_IMAGE_FRAMES.idea;
                    const applyAvailableDarkTreatment = group.id === 'available' && !isLight;
                    return (
                      <div key={group.id} className={`rounded-2xl border p-4 ${panelClass}`}>
                        <h3 className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${group.accent}`}>
                          <span aria-hidden="true">{group.badge}</span> {group.title}
                        </h3>
                        <div className={`relative mt-3 aspect-[4/3] overflow-hidden rounded-xl border border-dashed ${group.border} ${isLight ? 'bg-zinc-50' : 'bg-zinc-900/40'}`}>
                          <img
                            src={frame.image}
                            alt={frame.alt[lang]}
                            loading="lazy"
                            onError={handleGearImageError}
                            className={`h-full w-full object-cover ${frame.position} ${applyAvailableDarkTreatment ? 'brightness-90 contrast-110' : ''}`}
                          />
                          {applyAvailableDarkTreatment && <div className="absolute inset-0 bg-black/10" aria-hidden="true" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className={`mt-6 text-center text-sm font-bold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                  {isPt
                    ? 'Cada conceito avança apenas quando demonstra viabilidade. Nem todos chegarão à disponibilização.'
                    : 'Each concept only advances once it demonstrates viability. Not all of them will reach availability.'}
                </p>

                <div className={`mt-6 rounded-2xl border p-5 ${panelClass}`}>
                  <p className={`mb-4 text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {isPt ? 'Linha do tempo de análise de viabilidade de um produto' : 'Product viability analysis timeline'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
                    {ROADMAP_TIMELINE.map((step, index) => (
                      <React.Fragment key={step.pt}>
                        <span className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-wide ${panelClass} ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}>
                          {step[lang]}
                        </span>
                        {index < ROADMAP_TIMELINE.length - 1 && (
                          <span className={`text-sm ${isLight ? 'text-zinc-300' : 'text-zinc-700'}`} aria-hidden="true">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              {/* Laboratório Gear */}
              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-2">{isPt ? 'Laboratório Gear' : 'Gear Lab'}</h2>
                <div className={`mb-5 space-y-2 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  <p>{isPt ? 'Conheça os projetos que atualmente estão sendo pesquisados e desenvolvidos pelo Guitar Architect.' : 'Meet the projects currently being researched and developed by Guitar Architect.'}</p>
                  <p>{isPt ? 'Alguns poderão chegar ao mercado.' : 'Some may reach the market.'}</p>
                  <p>{isPt ? 'Outros permanecerão apenas como estudos de viabilidade.' : 'Others will remain only as feasibility studies.'}</p>
                  <p>
                    {isPt ? 'Todos seguirão os princípios descritos em nosso ' : 'All of them will follow the principles described in our '}
                    <button type="button" onClick={() => navigateTo('/gear/curadoria')} className={`font-black underline ${accentTextClass}`}>
                      {isPt ? 'Manual de Curadoria' : 'Curation Manual'}
                    </button>
                    .
                  </p>
                </div>

                <div className={`mb-5 rounded-2xl border p-5 ${panelClass}`}>
                  <p className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {isPt ? 'Conceitos em análise' : 'Concepts under review'}
                  </p>
                  <p className={`mt-2 text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                    {isPt
                      ? 'As imagens apresentadas são estudos visuais e conceitos iniciais. Nenhum dos produtos exibidos foi ainda aprovado para fabricação ou comercialização.'
                      : 'The images shown are visual studies and early concepts. None of the products displayed here have been approved for manufacturing or sale.'}
                  </p>
                  <p className={`mt-2 text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                    {isPt
                      ? 'O Guitar Architect está apresentando essas propostas para ouvir a comunidade antes de decidir quais delas devem avançar para consulta a fornecedores, prototipagem física e validação.'
                      : 'Guitar Architect is presenting these proposals to hear from the community before deciding which ones should move forward to supplier consultation, physical prototyping and validation.'}
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {GEAR_PRODUCTS.map(product => {
                    const statusLabel = STATUS_LABELS[product.status];
                    const statusClass = isLight ? STATUS_BADGE_CLASSES[product.status].light : STATUS_BADGE_CLASSES[product.status].dark;
                    const hasExtras = (product.gallery?.length ?? 0) + (product.variants?.length ?? 0) > 0;
                    const imageBlock = (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        onError={handleGearImageError}
                        className="h-full w-full object-cover"
                      />
                    );
                    return (
                      <div key={product.id} className={`overflow-hidden rounded-2xl border ${panelClass}`}>
                        <div className={`aspect-[4/3] overflow-hidden ${isLight ? 'bg-zinc-100' : 'bg-zinc-900/60'}`}>
                          {hasExtras ? (
                            <button
                              type="button"
                              onClick={() => setGalleryProduct(product)}
                              aria-label={isPt ? `Ver todas as imagens de ${product.name}` : `View all images of ${product.name}`}
                              className="block h-full w-full cursor-zoom-in"
                            >
                              {imageBlock}
                            </button>
                          ) : imageBlock}
                        </div>
                        <div className="p-5">
                          <h3 className="text-sm font-black uppercase tracking-tight">{product.name}</h3>
                          <p className={`mt-2 text-xs font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            {product.description[lang]}
                          </p>
                          <p className={`mt-4 text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {isPt ? 'Status' : 'Status'}
                          </p>
                          <span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${statusClass}`}>
                            <span aria-hidden="true">{statusLabel.emoji}</span> {statusLabel[lang]}
                          </span>
                          {hasExtras && (
                            <button
                              type="button"
                              onClick={() => setGalleryProduct(product)}
                              className={`mt-3 block text-[11px] font-black uppercase tracking-widest hover:underline ${accentTextClass}`}
                            >
                              {isPt ? 'Ver todas as imagens' : 'View all images'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setFeedbackProduct(product)}
                            className={`mt-4 w-full min-h-10 rounded-xl border text-xs font-black uppercase tracking-widest transition ${isLight ? 'border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white' : 'border-blue-500 text-blue-300 hover:bg-blue-500 hover:text-white'}`}
                          >
                            {isPt ? 'Opinar sobre este conceito' : 'Share your opinion'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              {/* Transparência */}
              <section className={`rounded-3xl border p-6 ${accentPanelClass}`}>
                <h2 className={`text-lg font-black uppercase tracking-tight mb-4 ${accentTextClass}`}>{isPt ? 'Transparência' : 'Transparency'}</h2>
                <ul className="space-y-3 font-semibold">
                  {transparencyPoints.map(point => (
                    <li key={point} className="flex items-start gap-2">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${isLight ? 'bg-blue-400' : 'bg-blue-500'}`} aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              {/* Parcerias Institucionais */}
              <section className={`rounded-3xl border p-6 text-center ${panelClass}`}>
                <h2 className="text-lg font-black uppercase tracking-tight mb-3">
                  {isPt ? 'Quer construir com o Guitar Architect?' : 'Want to build with Guitar Architect?'}
                </h2>
                <div className={`mx-auto max-w-2xl space-y-3 text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                  <p>
                    {isPt
                      ? 'O Guitar Architect está aberto a conhecer fabricantes e empresas que compartilhem nossa visão de qualidade, funcionalidade e respeito ao músico.'
                      : 'Guitar Architect is open to meeting manufacturers and companies who share our vision of quality, functionality and respect for musicians.'}
                  </p>
                  <p>
                    {isPt
                      ? 'Se sua empresa desenvolve soluções relevantes para músicos e acredita que pode contribuir com a evolução da linha Gear, apresente sua proposta.'
                      : 'If your company develops solutions relevant to musicians and believes it can contribute to the evolution of the Gear line, present your proposal.'}
                  </p>
                  <p>
                    {isPt
                      ? 'Buscamos colaborações capazes de transformar conceitos em produtos consistentes, viáveis e alinhados à nossa comunidade.'
                      : 'We are looking for collaborations able to turn concepts into consistent, viable products aligned with our community.'}
                  </p>
                </div>

                <p className={`mt-6 text-sm font-black uppercase tracking-widest ${accentTextClass}`}>
                  {isPt ? 'Sua empresa atua em alguma destas áreas?' : 'Does your company work in any of these areas?'}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {PARTNER_CATEGORIES.map(category => (
                    <span key={category.pt} className={`rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-600' : 'border-zinc-700 bg-zinc-900/60 text-zinc-300'}`}>
                      {category[lang]}
                    </span>
                  ))}
                </div>

                <a
                  href="mailto:contato@guitararchitect.com.br"
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-500 px-6 text-sm font-black text-blue-500 transition hover:bg-blue-500 hover:text-white"
                >
                  {isPt ? 'Apresentar uma proposta' : 'Submit a proposal'}
                </a>
              </section>

            </div>
          </div>

          <p className={`mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {isPt ? 'Versão pública 0.1 · Atualizado em julho de 2026' : 'Public version 0.1 · Updated July 2026'}
          </p>
        </div>
      </div>

      <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />

      {galleryProduct && (
        <GearProductGalleryModal
          product={galleryProduct}
          lang={lang}
          isLight={isLight}
          onClose={() => setGalleryProduct(null)}
        />
      )}

      {feedbackProduct && (
        <GearProductFeedbackModal
          product={feedbackProduct}
          lang={lang}
          isLight={isLight}
          onClose={() => setFeedbackProduct(null)}
        />
      )}
    </>
  );
};

export default GearPage;
