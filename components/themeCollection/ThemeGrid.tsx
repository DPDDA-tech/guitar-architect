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
}

const ThemeGrid: React.FC<ThemeGridProps> = ({ title, category, items, activeThemeId, isLight, lang, onSelect }) => {
  const categoryItems = items.filter(item => item.category === category);
  if (categoryItems.length === 0) return null;

  const displayTitle = title ?? getThemeCategoryTitle(category, lang);

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-blue-300">{lang === 'pt' ? 'Coleção' : 'Collection'}</p>
          <h2 className="mt-1 text-xl font-black uppercase tracking-tight">{displayTitle}</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-700 text-slate-400'}`}>
          {categoryItems.filter(item => item.unlocked).length}/{categoryItems.length}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categoryItems.map(item => (
          <ThemeCard key={item.id} theme={item} isActive={activeThemeId === item.id} isLight={isLight} lang={lang} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
};

export default ThemeGrid;
