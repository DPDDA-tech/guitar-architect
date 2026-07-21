import React from 'react';
import { navigateToPath } from '../../utils/fretboardNavigation';
import { hasMyAcademyReturnContextForPath } from '../../utils/myAcademyReturnContext';
import { getLocalizedHeaderCopy } from './ecosystemPageCopy';

type InternalEcosystemHeaderProps = {
  ecosystem: 'kids' | 'teens';
  isLight: boolean;
  title: string;
  subtitle: string;
};

export const InternalEcosystemHeader: React.FC<InternalEcosystemHeaderProps> = ({ ecosystem, isLight, title, subtitle }) => {
  const brandLabel = ecosystem === 'kids' ? 'GUITAR ARCHITECT KIDS' : 'GUITAR ARCHITECT TEENS';
  const brandClass = ecosystem === 'kids' ? 'text-emerald-500' : 'text-violet-400';
  const copy = getLocalizedHeaderCopy(ecosystem, title, subtitle);
  const showAcademyReturn = hasMyAcademyReturnContextForPath(window.location.pathname);
  const isPt = document.documentElement.lang !== 'en';

  return (
    <header className="mb-8 text-center">
      {showAcademyReturn && (
        <div className="mb-5 flex justify-center">
          <button
            type="button"
            onClick={() => navigateToPath('/my-academy')}
            className={`min-h-11 rounded-full border px-5 text-xs font-black uppercase tracking-[0.1em] transition ${isLight ? 'border-cyan-700 bg-cyan-50 text-cyan-900 hover:bg-cyan-100' : 'border-cyan-400/50 bg-cyan-400/10 text-cyan-100 hover:border-cyan-300'}`}
          >
            {isPt ? 'Voltar ao mapa do My Academy' : 'Return to the My Academy map'}
          </button>
        </div>
      )}
      <p className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.35em] ${brandClass}`}>{brandLabel}</p>
      <h1 className={`mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>{copy.title}</h1>
      <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-black' : 'text-white'}`}>{copy.subtitle}</p>
    </header>
  );
};

export default InternalEcosystemHeader;
