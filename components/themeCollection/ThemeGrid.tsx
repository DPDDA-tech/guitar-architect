import React from 'react';
import { ThemeCategory, ThemeCollectionItem } from '../../features/themeCollection/themeTypes';
import { getThemeCategoryTitle } from '../../features/themeCollection/themeCopy';
import ThemeCard from './ThemeCard';

interface ThemeGridProps {
  title?: string;
  category: ThemeCategory;
  items: ThemeCollectionItem[];
  activeThemeId: string;
  isLight: boolean;
  lang: 'pt' | 'en';
  onSelect: (themeId: string) => void;
  onPreview: (theme: ThemeCollectionItem) => void;
  collapsible?: boolean;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

const ThemeGrid: React.FC<ThemeGridProps> = ({
  title,
  category,
  items,
  activeThemeId,
  isLight,
  lang,
  onSelect,
  onPreview,
  collapsible = false,
  isOpen = true,
  onToggleOpen,
}) => {
  const categoryItems = items.filter(item => item.category === category);
  if (categoryItems.length === 0) return null;

  const displayTitle = title ?? getThemeCategoryTitle(category, lang);
  const hiddenClass = collapsible && !isOpen ? 'hidden' : '';

  return (
    <section className="mt-8">
      {collapsible && (
        <button
          type="button"
          onClick={onToggleOpen}
          className={`mb-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.99] ${isLight ? 'border-blue-300 bg-blue-100/95 text-blue-900' : 'border-blue-700/80 bg-blue-950/70 text-blue-100'}`}
          aria-expanded={isOpen}
        >
          <span>{displayTitle}</span>
          <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
      )}
      <div className={`mb-4 flex items-end justify-between gap-4 ${hiddenClass}`}>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-blue-300">{lang === 'pt' ? 'Coleção' : 'Collection'}</p>
          <h2 className="mt-1 text-xl font-black uppercase tracking-tight">{displayTitle}</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-700 text-slate-400'}`}>
          {categoryItems.filter(item => item.unlocked).length}/{categoryItems.length}
        </span>
      </div>
      <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${hiddenClass}`}>
        {categoryItems.map(item => (
          <ThemeCard key={item.id} theme={item} isActive={activeThemeId === item.id} isLight={isLight} lang={lang} onSelect={onSelect} onPreview={onPreview} />
        ))}
      </div>
    </section>
  );
};

export default ThemeGrid;
