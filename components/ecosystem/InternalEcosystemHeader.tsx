import React from 'react';

type InternalEcosystemHeaderProps = {
  ecosystem: 'kids' | 'teens';
  isLight: boolean;
  title: string;
  subtitle: string;
};

export const InternalEcosystemHeader: React.FC<InternalEcosystemHeaderProps> = ({
  ecosystem,
  isLight,
  title,
  subtitle,
}) => {
  const brandLabel = ecosystem === 'kids' ? 'GUITAR ARCHITECT KIDS' : 'GUITAR ARCHITECT TEENS';
  const brandClass = ecosystem === 'kids' ? 'text-emerald-500' : 'text-violet-400';

  return (
    <header className="mb-8 text-center">
      <p className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.35em] ${brandClass}`}>
        {brandLabel}
      </p>
      <h1 className={`mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
        {title}
      </h1>
      <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-black' : 'text-white'}`}>
        {subtitle}
      </p>
    </header>
  );
};

export default InternalEcosystemHeader;
