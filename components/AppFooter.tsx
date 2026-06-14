import React, { useState } from 'react';
import type { Lang } from '../i18n';
import SupportModal from './SupportModal';

interface AppFooterProps {
  isLight: boolean;
  lang: Lang;
  logoSrc?: string;
  logoAlt?: string;
  logoClassName?: string;
  compact?: boolean;
}

const AppFooter: React.FC<AppFooterProps> = ({
  isLight,
  lang,
  logoSrc,
  logoAlt = 'Guitar Architect',
  logoClassName = 'h-12 w-12 object-contain',
  compact = false,
}) => {
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      <footer className={`border-t ${compact ? 'py-5 md:py-6' : 'py-10'} ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-900 bg-zinc-950'}`}>
        <div className="mx-auto flex max-w-[1700px] flex-col items-center justify-between gap-6 px-6 md:flex-row md:px-10">
          <div className="flex items-center gap-3">
            {logoSrc ? <img src={logoSrc} alt={logoAlt} className={logoClassName} /> : null}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Guitar Architect<sup aria-label="marca" className="text-[8px]">™</sup> • DPDDA-tech
              </p>
              <p className="text-[9px] font-normal uppercase tracking-wide text-zinc-500">
                Pedido de registro no INPI Nº 944083625
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-black uppercase text-zinc-500 md:gap-8">
            <a href="/legal/privacy.html" target="_blank" rel="noreferrer" className="transition-colors hover:text-blue-600">
              {lang === 'pt' ? 'Privacidade' : 'Privacy'}
            </a>
            <a href="/legal/terms.html" target="_blank" rel="noreferrer" className="transition-colors hover:text-blue-600">
              {lang === 'pt' ? 'Termos' : 'Terms'}
            </a>
            <a href="/legal/license.html" target="_blank" rel="noreferrer" className="transition-colors hover:text-blue-600">
              {lang === 'pt' ? 'Licença' : 'License'}
            </a>
            <a href="/legal/help.html" target="_blank" rel="noreferrer" className="transition-colors hover:text-blue-600">
              {lang === 'pt' ? 'Ajuda' : 'Help'}
            </a>
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              className="cursor-pointer transition-colors hover:text-blue-600"
            >
              {lang === 'pt' ? 'Apoie o projeto' : 'Support the project'}
            </button>
          </div>

          <p className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            © 2026
          </p>
        </div>
      </footer>

      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        isLight={isLight}
        lang={lang}
      />
    </>
  );
};

export default AppFooter;
