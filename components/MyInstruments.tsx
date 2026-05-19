import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InstrumentMaintenance, ThemeMode, UserInstrument } from '../types';
import {
  compressInstrumentPhoto,
  createEmptyInstrument,
  deleteInstrument,
  listInstruments,
  replaceInstruments,
  saveInstrument
} from '../utils/instrumentRegistry';
import { loadConfig } from '../utils/persistence';

interface MyInstrumentsProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
  theme: ThemeMode;
  lang: 'pt' | 'en';
}

type InstrumentSortKey = 'purchaseDate' | 'paidValue' | 'manufactureYear' | 'brandModel' | 'updatedAt';
type SortDirection = 'desc' | 'asc';

const fieldGroups: Array<{ titlePt: string; titleEn: string; fields: Array<[keyof UserInstrument, string, string]> }> = [
  {
    titlePt: 'Informações Básicas',
    titleEn: 'Basic Info',
    fields: [
      ['brand', 'Marca', 'Brand'],
      ['model', 'Modelo', 'Model'],
      ['version', 'Versão', 'Version'],
      ['color', 'Cor', 'Color'],
      ['originCountry', 'País de Origem', 'Country of Origin'],
      ['serialNumber', 'Número de Série', 'Serial Number'],
      ['manufactureYear', 'Ano de Fabricação', 'Year'],
      ['strings', 'Número de Cordas', 'Strings'],
      ['purchaseDate', 'Data da Compra', 'Purchase Date'],
      ['paidValue', 'Valor Pago', 'Paid Value'],
      ['stringGauge', 'Encordamento', 'String Gauge'],
      ['nutMaterial', 'Material do Nut', 'Nut Material'],
      ['lastStringChange', 'Última Troca de Cordas', 'Last String Change'],
    ],
  },
  {
    titlePt: 'Especificações Técnicas',
    titleEn: 'Technical Specs',
    fields: [
      ['bodyType', 'Tipo do Corpo', 'Body Type'],
      ['bridgeType', 'Tipo de Ponte', 'Bridge Type'],
      ['fretCount', 'Número de Trastes', 'Frets'],
      ['fretType', 'Tipo de Traste', 'Fret Type'],
      ['neckShape', 'Tipo de Braço', 'Neck Shape'],
      ['fretboardRadius', 'Raio da Escala', 'Fretboard Radius'],
    ],
  },
  {
    titlePt: 'Captadores',
    titleEn: 'Pickups',
    fields: [
      ['bridgePickup', 'Captador Ponte', 'Bridge Pickup'],
      ['middlePickup', 'Captador Meio', 'Middle Pickup'],
      ['neckPickup', 'Captador Braço', 'Neck Pickup'],
    ],
  },
  {
    titlePt: 'Madeiras',
    titleEn: 'Woods',
    fields: [
      ['bodyWood', 'Madeira do Corpo', 'Body Wood'],
      ['topWood', 'Madeira do Tampo', 'Top Wood'],
      ['neckWood', 'Madeira do Braço', 'Neck Wood'],
      ['fretboardWood', 'Madeira da Escala', 'Fretboard Wood'],
    ],
  },
];

const display = (value: unknown) => {
  const text = String(value || '').trim();
  return text || '-';
};

const normalizeDateInput = (value: string): string => {
  const raw = value.trim();
  if (!raw) return '';

  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 8 && digits.length !== 6) return raw;

  const day = Number.parseInt(digits.slice(0, 2), 10);
  const month = Number.parseInt(digits.slice(2, 4), 10);
  const rawYear = Number.parseInt(digits.slice(4), 10);
  const year = digits.length === 6 ? (rawYear >= 50 ? 1900 + rawYear : 2000 + rawYear) : rawYear;
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return raw;
  }

  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
};

const parseBrazilianDate = (value: string): number => {
  const normalized = normalizeDateInput(value);
  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return Number.NEGATIVE_INFINITY;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? Number.NEGATIVE_INFINITY : date.getTime();
};

const normalizeMoneyInput = (value: string): string => {
  const raw = value.trim();
  if (!raw) return '';

  const clean = raw.replace(/[^\d,.]/g, '');
  const hasComma = clean.includes(',');
  let integerPart = '';
  let decimalPart = '00';

  if (hasComma) {
    const parts = clean.split(',');
    integerPart = parts.slice(0, -1).join('').replace(/\D/g, '');
    decimalPart = (parts[parts.length - 1] || '').replace(/\D/g, '').padEnd(2, '0').slice(0, 2);
  } else {
    integerPart = clean.replace(/\D/g, '');
  }

  const amount = Number(`${integerPart || '0'}.${decimalPart}`);
  if (Number.isNaN(amount)) return raw;

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const parseBrazilianMoney = (value: string): number => {
  const normalized = normalizeMoneyInput(value);
  const amount = Number(normalized.replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(amount) ? Number.NEGATIVE_INFINITY : amount;
};

const normalizeImportedInstrument = (input: Partial<UserInstrument>): UserInstrument => {
  const base = createEmptyInstrument();
  const now = new Date().toISOString();

  return {
    ...base,
    ...input,
    id: typeof input.id === 'string' && input.id ? input.id : crypto.randomUUID(),
    createdAt: typeof input.createdAt === 'string' && input.createdAt ? input.createdAt : now,
    updatedAt: now,
    purchaseDate: normalizeDateInput(input.purchaseDate || ''),
    lastStringChange: normalizeDateInput(input.lastStringChange || ''),
    paidValue: normalizeMoneyInput(input.paidValue || ''),
    maintenance: Array.isArray(input.maintenance) ? input.maintenance.map(entry => ({
      id: typeof entry.id === 'string' && entry.id ? entry.id : crypto.randomUUID(),
      date: typeof entry.date === 'string' && entry.date ? entry.date : now,
      title: typeof entry.title === 'string' ? entry.title : '',
      notes: typeof entry.notes === 'string' ? entry.notes : '',
    })) : [],
  };
};

const formatDate = (iso?: string) => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString();
};

const getInstrumentCardAccent = (strings: string) => {
  const count = Number.parseInt(strings, 10);

  if (count === 4 || count === 5) {
    return {
      border: 'border-green-300 hover:border-green-500',
      footer: 'bg-green-600 text-white',
      badge: 'bg-white text-green-700',
      muted: 'text-green-100',
    };
  }

  if (count === 7 || count === 8) {
    return {
      border: 'border-purple-300 hover:border-purple-500',
      footer: 'bg-purple-600 text-white',
      badge: 'bg-white text-purple-700',
      muted: 'text-purple-100',
    };
  }

  return {
    border: 'border-blue-300 hover:border-blue-500',
    footer: 'bg-blue-600 text-white',
    badge: 'bg-white text-blue-700',
    muted: 'text-blue-100',
  };
};

const getComparableValue = (instrument: UserInstrument, key: InstrumentSortKey): number | string => {
  if (key === 'purchaseDate') {
    return parseBrazilianDate(instrument.purchaseDate || '');
  }

  if (key === 'paidValue') {
    return parseBrazilianMoney(instrument.paidValue || '');
  }

  if (key === 'manufactureYear') {
    const value = Number.parseInt(instrument.manufactureYear || '', 10);
    return Number.isNaN(value) ? Number.NEGATIVE_INFINITY : value;
  }

  if (key === 'brandModel') {
    return `${instrument.brand} ${instrument.model} ${instrument.version}`.trim().toLowerCase();
  }

  const timestamp = Date.parse(instrument.updatedAt || '');
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
};

const exportInstrumentToPdf = async (instrument: UserInstrument, lang: 'pt' | 'en') => {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const margin = 14;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (height: number) => {
    if (y + height <= pageHeight - margin) return;
    pdf.addPage();
    y = margin;
  };

  const addLine = (label: string, value: unknown) => {
    ensureSpace(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text(label, margin, y);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(display(value), pageWidth - margin, y, { align: 'right', maxWidth: contentWidth * 0.52 });
    y += 8;
  };

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(15, 23, 42);
  pdf.text(lang === 'pt' ? 'Meus Instrumentos' : 'My Instruments', margin, y);
  y += 9;

  pdf.setFontSize(24);
  pdf.text(display(instrument.brand), margin, y);
  y += 9;
  pdf.setFontSize(13);
  pdf.setTextColor(100, 116, 139);
  pdf.text([instrument.model, instrument.version].filter(Boolean).join(' - ') || '-', margin, y);
  y += 10;

  if (instrument.photo) {
    ensureSpace(76);
    const imageType = instrument.photo.startsWith('data:image/png') ? 'PNG' : 'JPEG';
    pdf.addImage(instrument.photo, imageType, margin, y, contentWidth, 70, undefined, 'FAST');
    y += 78;
  }

  fieldGroups.forEach(group => {
    ensureSpace(18);
    pdf.setFillColor(241, 245, 249);
    pdf.roundedRect(margin, y - 5, contentWidth, 10, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    pdf.text(lang === 'pt' ? group.titlePt : group.titleEn, margin + 3, y + 2);
    y += 12;

    group.fields.forEach(([field, labelPt, labelEn]) => addLine(lang === 'pt' ? labelPt : labelEn, instrument[field]));
    y += 4;
  });

  if (instrument.notes) {
    ensureSpace(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    pdf.text(lang === 'pt' ? 'Observações' : 'Notes', margin, y);
    y += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(instrument.notes, contentWidth);
    ensureSpace(lines.length * 5);
    pdf.text(lines, margin, y);
    y += lines.length * 5 + 5;
  }

  ensureSpace(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(15, 23, 42);
  pdf.text(lang === 'pt' ? 'Histórico de Manutenções' : 'Maintenance History', margin, y);
  y += 8;

  if (instrument.maintenance.length === 0) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text(lang === 'pt' ? 'Nenhuma manutenção registrada.' : 'No maintenance registered.', margin, y);
  } else {
    instrument.maintenance.forEach(entry => {
      ensureSpace(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(15, 23, 42);
      pdf.text(entry.title, margin, y);
      pdf.text(formatDate(entry.date), pageWidth - margin, y, { align: 'right' });
      y += 5;
      if (entry.notes) {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        const lines = pdf.splitTextToSize(entry.notes, contentWidth);
        ensureSpace(lines.length * 5);
        pdf.text(lines, margin, y);
        y += lines.length * 5;
      }
      y += 4;
    });
  }

  const name = [instrument.brand, instrument.model, instrument.version].filter(Boolean).join('-') || 'instrumento';
  const fileName = `GA_${name.replace(/[^a-z0-9_-]+/gi, '_')}.pdf`;
  const blob = pdf.output('blob');
  const filePicker = (window as Window & {
    showSaveFilePicker?: (options: {
      suggestedName?: string;
      types?: Array<{ description: string; accept: Record<string, string[]> }>;
    }) => Promise<{ createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }> }>;
  }).showSaveFilePicker;

  if (filePicker) {
    try {
      const handle = await filePicker({
        suggestedName: fileName,
        types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (error) {
      if ((error as DOMException).name === 'AbortError') return;
    }
  }

  pdf.save(fileName);
};

const MyInstruments: React.FC<MyInstrumentsProps> = ({ isOpen, onClose, onToggleTheme, theme, lang }) => {
  const isLight = theme === 'light';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UserInstrument[]>([]);
  const [selected, setSelected] = useState<UserInstrument | null>(null);
  const [draft, setDraft] = useState<UserInstrument | null>(null);
  const [query, setQuery] = useState('');
  const [maintenanceTitle, setMaintenanceTitle] = useState('');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [sortKey, setSortKey] = useState<InstrumentSortKey>(() => {
    if (typeof window === 'undefined') return 'purchaseDate';
    return (window.localStorage.getItem('ga_instrument_sort_key') as InstrumentSortKey | null) || 'purchaseDate';
  });
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    if (typeof window === 'undefined') return 'desc';
    return (window.localStorage.getItem('ga_instrument_sort_direction') as SortDirection | null) || 'desc';
  });

  const t = {
    title: lang === 'pt' ? 'Meus Instrumentos' : 'My Instruments',
    subtitle: lang === 'pt' ? 'Registre fotos, especificações e manutenções.' : 'Track photos, specs and maintenance.',
    add: lang === 'pt' ? 'Adicionar instrumento' : 'Add instrument',
    exportJson: lang === 'pt' ? 'Exportar JSON' : 'Export JSON',
    importJson: lang === 'pt' ? 'Importar JSON' : 'Import JSON',
    sortBy: lang === 'pt' ? 'Ordenar por' : 'Sort by',
    direction: lang === 'pt' ? 'Direção' : 'Direction',
    newest: lang === 'pt' ? 'Maior / recente primeiro' : 'Highest / newest first',
    oldest: lang === 'pt' ? 'Menor / antigo primeiro' : 'Lowest / oldest first',
    edit: lang === 'pt' ? 'Editar' : 'Edit',
    save: lang === 'pt' ? 'Salvar' : 'Save',
    cancel: lang === 'pt' ? 'Cancelar' : 'Cancel',
    delete: lang === 'pt' ? 'Excluir' : 'Delete',
    pdf: 'PDF',
    close: lang === 'pt' ? 'Voltar ao app' : 'Back to app',
    search: lang === 'pt' ? 'Buscar por marca, modelo, cor, captadores...' : 'Search by brand, model, color, pickups...',
    photo: lang === 'pt' ? 'Adicionar foto' : 'Add photo',
    noPhoto: lang === 'pt' ? 'Sem foto' : 'No photo',
    empty: lang === 'pt' ? 'Nenhum instrumento cadastrado ainda.' : 'No instruments registered yet.',
    notes: lang === 'pt' ? 'Observações' : 'Notes',
    maintenance: lang === 'pt' ? 'Histórico de Manutenções' : 'Maintenance History',
    addMaintenance: lang === 'pt' ? 'Adicionar manutenção' : 'Add maintenance',
    maintenanceTitle: lang === 'pt' ? 'Servico realizado' : 'Service performed',
    maintenanceNotes: lang === 'pt' ? 'Notas' : 'Notes',
    themeToggle: isLight ? (lang === 'pt' ? 'Modo escuro' : 'Dark mode') : (lang === 'pt' ? 'Modo claro' : 'Light mode'),
  };

  useEffect(() => {
    if (!isOpen) return;
    const config = loadConfig();
    const userId = config?.currentUser;
    setCurrentUserId(userId);
    listInstruments(userId).then(setItems).catch(() => setItems([]));
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('ga_instrument_sort_key', sortKey);
    window.localStorage.setItem('ga_instrument_sort_direction', sortDirection);
  }, [sortKey, sortDirection]);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = term ? items.filter(item => [
      item.brand,
      item.model,
      item.version,
      item.color,
      item.bridgePickup,
      item.middlePickup,
      item.neckPickup,
      item.bodyWood,
      item.fretboardWood
    ].some(value => value.toLowerCase().includes(term))) : items;

    return [...filtered].sort((a, b) => {
      const valueA = getComparableValue(a, sortKey);
      const valueB = getComparableValue(b, sortKey);
      const direction = sortDirection === 'desc' ? -1 : 1;

      if (typeof valueA === 'string' || typeof valueB === 'string') {
        return String(valueA).localeCompare(String(valueB)) * (sortDirection === 'desc' ? -1 : 1);
      }

      if (valueA !== valueB) return (valueA - valueB) * direction;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [items, query, sortDirection, sortKey]);

  const sortOptions: Array<{ key: InstrumentSortKey; label: string }> = [
    { key: 'purchaseDate', label: lang === 'pt' ? 'Data da compra' : 'Purchase date' },
    { key: 'paidValue', label: lang === 'pt' ? 'Preço' : 'Price' },
    { key: 'manufactureYear', label: lang === 'pt' ? 'Ano de fabricação' : 'Year' },
    { key: 'brandModel', label: lang === 'pt' ? 'Marca / modelo' : 'Brand / model' },
    { key: 'updatedAt', label: lang === 'pt' ? 'Última atualização' : 'Last update' },
  ];

  const refresh = async () => {
    const next = await listInstruments(currentUserId);
    setItems(next);
    return next;
  };

  const startNew = () => {
    setSelected(null);
    setDraft(createEmptyInstrument());
  };

  const startEdit = (instrument: UserInstrument) => {
    setDraft({ ...instrument, maintenance: [...instrument.maintenance] });
  };

  const updateDraft = (field: keyof UserInstrument, value: string) => {
    setDraft(prev => prev ? { ...prev, [field]: value, updatedAt: new Date().toISOString() } : prev);
  };

  const handlePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !draft) return;
    setIsLoadingPhoto(true);
    try {
      const photo = await compressInstrumentPhoto(file);
      setDraft({ ...draft, photo, updatedAt: new Date().toISOString() });
    } finally {
      setIsLoadingPhoto(false);
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    const next = {
      ...draft,
      brand: draft.brand.trim(),
      model: draft.model.trim(),
      purchaseDate: normalizeDateInput(draft.purchaseDate),
      lastStringChange: normalizeDateInput(draft.lastStringChange),
      paidValue: normalizeMoneyInput(draft.paidValue),
      updatedAt: new Date().toISOString()
    };
    await saveInstrument(next, currentUserId);
    const list = await refresh();
    setDraft(null);
    setSelected(list.find(item => item.id === next.id) || next);
  };

  const exportBackup = () => {
    const payload = {
      schema: 'guitar-architect-instruments',
      exportedAt: new Date().toISOString(),
      instruments: items,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GA_Meus_Instrumentos_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const rawInstruments = Array.isArray(payload?.instruments) ? payload.instruments : Array.isArray(payload) ? payload : null;

      if (!rawInstruments) {
        throw new Error('Invalid backup');
      }

      const ok = window.confirm(lang === 'pt'
        ? 'Importar este backup e substituir os instrumentos salvos neste navegador?'
        : 'Import this backup and replace the instruments saved in this browser?');
      if (!ok) return;

      const instruments = rawInstruments.map((item: Partial<UserInstrument>) => normalizeImportedInstrument(item));
      await replaceInstruments(instruments, currentUserId);
      const next = await refresh();
      setSelected(next[0] || null);
      setDraft(null);
    } catch {
      alert(lang === 'pt' ? 'Arquivo de instrumentos invalido.' : 'Invalid instruments file.');
    }
  };

  const handleDelete = async (instrument: UserInstrument) => {
    const ok = window.confirm(lang === 'pt' ? 'Excluir este instrumento?' : 'Delete this instrument?');
    if (!ok) return;
    await deleteInstrument(instrument.id);
    await refresh();
    setSelected(null);
    setDraft(null);
  };

  const addMaintenance = async () => {
    if (!selected || !maintenanceTitle.trim()) return;
    const entry: InstrumentMaintenance = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      title: maintenanceTitle.trim(),
      notes: maintenanceNotes.trim(),
    };
    const next = {
      ...selected,
      maintenance: [entry, ...selected.maintenance],
      updatedAt: new Date().toISOString()
    };
    await saveInstrument(next, currentUserId);
    setSelected(next);
    await refresh();
    setMaintenanceTitle('');
    setMaintenanceNotes('');
  };

  if (!isOpen) return null;

  const shell = isLight
    ? 'border-zinc-200 bg-white/95 text-zinc-900 backdrop-blur'
    : 'border-zinc-800 bg-zinc-950/95 text-zinc-100 backdrop-blur';
  const panel = isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800';
  const input = `w-full rounded-xl border px-3 py-2 text-sm font-bold outline-none focus:border-blue-500 ${
    isLight
      ? 'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400'
      : 'border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500'
  }`;

  const form = draft && (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-4 ${panel}`}>
        <div className="grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
          <div>
            <button onClick={() => fileInputRef.current?.click()} className={`flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border text-sm font-black uppercase ${isLight ? 'border-zinc-200 bg-white text-zinc-500' : 'border-zinc-700 bg-zinc-950 text-zinc-400'}`}>
              {draft.photo ? <img src={draft.photo} className="h-full w-full object-cover" /> : (isLoadingPhoto ? '...' : t.photo)}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fieldGroups[0].fields.map(([field, labelPt, labelEn]) => (
              <label key={String(field)} className="space-y-1">
                <span className="text-[10px] font-black uppercase text-zinc-400">{lang === 'pt' ? labelPt : labelEn}</span>
                <input value={String(draft[field] || '')} onChange={event => updateDraft(field, event.target.value)} className={input} />
              </label>
            ))}
          </div>
        </div>
      </div>

      {fieldGroups.slice(1).map(group => (
        <div key={group.titleEn} className={`rounded-2xl border p-4 ${panel}`}>
          <h3 className="mb-3 text-sm font-black uppercase">{lang === 'pt' ? group.titlePt : group.titleEn}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.fields.map(([field, labelPt, labelEn]) => (
              <label key={String(field)} className="space-y-1">
                <span className="text-[10px] font-black uppercase text-zinc-400">{lang === 'pt' ? labelPt : labelEn}</span>
                <input value={String(draft[field] || '')} onChange={event => updateDraft(field, event.target.value)} className={input} />
              </label>
            ))}
          </div>
        </div>
      ))}

      <label className="space-y-1">
        <span className="text-[10px] font-black uppercase text-zinc-400">{t.notes}</span>
        <textarea value={draft.notes} onChange={event => updateDraft('notes', event.target.value)} className={`${input} min-h-28 resize-y`} />
      </label>
    </div>
  );

  const details = selected && !draft && (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => setSelected(null)} className={`rounded-xl border px-3 py-2 text-xs font-black uppercase ${isLight ? 'border-zinc-200' : 'border-zinc-700'}`}>←</button>
        <div className="flex gap-2">
          <button onClick={() => exportInstrumentToPdf(selected, lang)} className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-black uppercase">{t.pdf}</button>
          <button onClick={() => startEdit(selected)} className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-black uppercase">{t.edit}</button>
          <button onClick={() => handleDelete(selected)} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black uppercase text-white">{t.delete}</button>
        </div>
      </div>

      <div className={`overflow-hidden rounded-3xl border ${panel}`}>
        <div className={isLight ? 'aspect-[16/7] bg-white' : 'aspect-[16/7] bg-zinc-950'}>
          {selected.photo ? <img src={selected.photo} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm font-black uppercase text-zinc-400">{t.noPhoto}</div>}
        </div>
        <div className="p-5 text-center">
          <h2 className="text-2xl font-black">{display(selected.brand)}</h2>
          <p className="mt-1 font-bold text-zinc-500">{[selected.model, selected.version].filter(Boolean).join(' - ') || '-'}</p>
        </div>
      </div>

      {fieldGroups.map(group => (
        <div key={group.titleEn} className={`rounded-2xl border p-4 ${panel}`}>
          <h3 className="mb-3 text-base font-black">{lang === 'pt' ? group.titlePt : group.titleEn}</h3>
          {group.fields.map(([field, labelPt, labelEn]) => (
            <div key={String(field)} className={`flex justify-between gap-4 border-b py-2 text-sm last:border-b-0 ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
              <span className="text-zinc-500">{lang === 'pt' ? labelPt : labelEn}</span>
              <span className="text-right font-black">{display(selected[field])}</span>
            </div>
          ))}
        </div>
      ))}

      {selected.notes && (
        <div className={`rounded-2xl border p-4 ${panel}`}>
          <h3 className="mb-2 text-base font-black">{t.notes}</h3>
          <p className="whitespace-pre-wrap text-sm font-semibold text-zinc-500">{selected.notes}</p>
        </div>
      )}

      <div className={`rounded-2xl border p-4 ${panel}`}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-base font-black">{t.maintenance}</h3>
        </div>
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <input value={maintenanceTitle} onChange={event => setMaintenanceTitle(event.target.value)} className={input} placeholder={t.maintenanceTitle} />
          <input value={maintenanceNotes} onChange={event => setMaintenanceNotes(event.target.value)} className={input} placeholder={t.maintenanceNotes} />
          <button onClick={addMaintenance} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black uppercase text-white">{t.addMaintenance}</button>
        </div>
        <div className="mt-4 space-y-2">
          {selected.maintenance.length === 0 && <p className="text-center text-sm font-semibold text-zinc-500">{lang === 'pt' ? 'Nenhuma manutenção registrada ainda.' : 'No maintenance registered yet.'}</p>}
          {selected.maintenance.map(entry => (
            <div key={entry.id} className={`rounded-xl border p-3 ${isLight ? 'border-zinc-200 bg-white' : 'border-zinc-800 bg-zinc-950'}`}>
              <div className="flex justify-between gap-3 text-sm">
                <strong>{entry.title}</strong>
                <span className="text-zinc-500">{formatDate(entry.date)}</span>
              </div>
              {entry.notes && <p className="mt-1 text-sm text-zinc-500">{entry.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[120] overflow-y-auto p-3 md:p-8"
      style={{
        backgroundColor: isLight ? '#eef3f8' : '#05070b',
        backgroundImage: isLight
          ? 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)'
          : 'linear-gradient(rgba(59, 130, 246, 0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.18) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className={`mx-auto min-h-[90vh] max-w-7xl rounded-[28px] border p-4 shadow-2xl md:p-8 ${shell}`}>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${isLight ? 'text-blue-500' : 'text-blue-300'}`}>Guitar Architect</p>
            <h2 className={`mt-1 text-2xl font-black italic uppercase tracking-tight md:text-3xl ${isLight ? 'text-blue-600' : 'bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.18)]'}`}>{t.title}</h2>
            <p className={`mt-1 text-sm font-semibold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={startNew} className="rounded-xl bg-blue-600 px-4 py-3 text-xs font-black uppercase text-white">{t.add}</button>
            <button onClick={onToggleTheme} className={`rounded-xl border px-4 py-3 text-xs font-black uppercase ${isLight ? 'border-zinc-200' : 'border-zinc-700'}`}>{t.themeToggle}</button>
            <button onClick={exportBackup} className={`rounded-xl border px-4 py-3 text-xs font-black uppercase ${isLight ? 'border-zinc-200' : 'border-zinc-700'}`}>{t.exportJson}</button>
            <button onClick={() => backupInputRef.current?.click()} className={`rounded-xl border px-4 py-3 text-xs font-black uppercase ${isLight ? 'border-zinc-200' : 'border-zinc-700'}`}>{t.importJson}</button>
            <button onClick={onClose} className={`rounded-xl border px-4 py-3 text-xs font-black uppercase ${isLight ? 'border-zinc-200' : 'border-zinc-700'}`}>{t.close}</button>
            <input ref={backupInputRef} type="file" accept=".json,application/json" className="hidden" onChange={importBackup} />
          </div>
        </div>

        {draft ? (
          <>
            {form}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDraft(null)} className={`rounded-xl border px-4 py-3 text-xs font-black uppercase ${isLight ? 'border-zinc-200' : 'border-zinc-700'}`}>{t.cancel}</button>
              <button onClick={handleSave} className="rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase text-white">{t.save}</button>
            </div>
          </>
        ) : details || (
          <div className="space-y-5">
            <input value={query} onChange={event => setQuery(event.target.value)} className={input} placeholder={t.search} />
            <div className={`grid gap-2 rounded-2xl border p-3 md:grid-cols-[1fr_auto] md:items-end ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900'}`}>
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase text-zinc-400">{t.sortBy}</span>
                <select value={sortKey} onChange={event => setSortKey(event.target.value as InstrumentSortKey)} className={input}>
                  {sortOptions.map(option => (
                    <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
                className={`rounded-xl border px-4 py-3 text-xs font-black uppercase ${isLight ? 'border-zinc-200 bg-white text-zinc-700' : 'border-zinc-700 bg-zinc-950 text-zinc-100'}`}
                aria-label={t.direction}
                title={t.direction}
              >
                {sortDirection === 'desc' ? `↓ ${t.newest}` : `↑ ${t.oldest}`}
              </button>
            </div>
            {filteredItems.length === 0 ? (
              <div className={`rounded-2xl border p-10 text-center text-sm font-black uppercase text-zinc-500 ${panel}`}>{t.empty}</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map(item => {
                  const accent = getInstrumentCardAccent(item.strings);

                  return (
                    <button key={item.id} onClick={() => setSelected(item)} className={`overflow-hidden rounded-2xl border text-left transition-all hover:-translate-y-0.5 ${isLight ? 'bg-white' : 'bg-zinc-950'} ${accent.border}`}>
                      <div className={isLight ? 'aspect-[16/9] bg-zinc-100' : 'aspect-[16/9] bg-zinc-900'}>
                        {item.photo ? <img src={item.photo} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs font-black uppercase text-zinc-400">{t.noPhoto}</div>}
                      </div>
                      <div className={`p-4 ${accent.footer}`}>
                        <h3 className="text-lg font-black">{display(item.brand)}</h3>
                        <p className={`mt-1 text-sm font-bold ${accent.muted}`}>{[item.model, item.version].filter(Boolean).join(' - ') || '-'}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase">
                          <span className={`rounded-full px-2 py-1 ${accent.badge}`}>{display(item.strings)} cordas</span>
                          {item.lastStringChange && <span className="rounded-full bg-white/15 px-2 py-1 text-white">{lang === 'pt' ? 'Cordas' : 'Strings'}: {item.lastStringChange}</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInstruments;
