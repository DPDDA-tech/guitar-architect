import React from 'react';
import type { Lang } from '../i18n';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

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
  const logoHref = logoAlt.includes('Kids') ? '/kids'
    : logoAlt.includes('Teens') ? '/teens'
    : logoAlt.includes('Studio') ? '/studio'
    : '/ecosystem';

  const logoAriaLabel = logoAlt.includes('Kids')
    ? (lang === 'pt' ? 'Ir para a página inicial Kids' : 'Go to Kids home')
    : logoAlt.includes('Teens')
    ? (lang === 'pt' ? 'Ir para a página inicial Teens' : 'Go to Teens home')
    : logoAlt.includes('Studio')
    ? (lang === 'pt' ? 'Ir para a página inicial Studio' : 'Go to Studio home')
    : (lang === 'pt' ? 'Ir para o ecossistema Guitar Architect' : 'Go to Guitar Architect ecosystem');

  return (
    <>
      <footer className={`border-t ${compact ? 'py-5 md:py-6' : 'py-10'} ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-900 bg-zinc-950'}`}>
        <div className="mx-auto flex max-w-[1700px] flex-col items-center justify-between gap-6 px-6 md:flex-row md:px-10">
          <div className="flex items-center gap-3">
            {logoSrc ? (
              <a
                href={logoHref}
                onClick={e => { e.preventDefault(); navigateTo(logoHref); }}
                aria-label={logoAriaLabel}
                className="inline-flex cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <img src={logoSrc} alt={logoAlt} className={logoClassName} />
              </a>
            ) : null}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Guitar Architect<sup aria-label="marca" className="text-[8px]">™</sup> • DPDDA-tech
              </p>
              <p className="text-[9px] font-normal uppercase tracking-wide text-zinc-500">
                {lang === 'pt'
                  ? 'Marca Mista Depositada no INPI • Processo Nº 944083625'
                  : 'Mixed Trademark Application Filed with the Brazilian INPI • Case No. 944083625'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-black uppercase text-zinc-500 md:gap-8">
            <a
              href="/season-1"
              onClick={event => {
                event.preventDefault();
                navigateTo('/season-1');
              }}
              className="cursor-pointer transition-colors hover:text-blue-600"
            >
              {lang === 'pt' ? 'Temporada 1' : 'Season 1'}
            </a>
            <a
              href="/about"
              onClick={event => {
                event.preventDefault();
                navigateTo('/about');
              }}
              className="cursor-pointer transition-colors hover:text-blue-600"
            >
              {lang === 'pt' ? 'Sobre' : 'About'}
            </a>
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
            <a
              href="mailto:contato@guitararchitect.com.br"
              aria-label={lang === 'pt' ? 'Enviar e-mail para o suporte do Guitar Architect' : 'Send an email to Guitar Architect support'}
              className="transition-colors hover:text-blue-600"
            >
              {lang === 'pt' ? 'Suporte' : 'Support'}
            </a>
          </div>

          <p className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            © 2026
          </p>
        </div>
      </footer>
    </>
  );
};

export default AppFooter;
