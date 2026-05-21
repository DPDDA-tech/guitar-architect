(() => {
  const readConfig = () => {
    try {
      return JSON.parse(localStorage.getItem('ga_config') || '{}');
    } catch {
      return {};
    }
  };

  const config = readConfig();
  const lang = config.lang === 'en' ? 'en' : 'pt';
  const isDark = config.theme === 'dark';
  const page = location.pathname.split('/').pop() || '';

  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.lang = lang === 'en' ? 'en-US' : 'pt-BR';

  const style = document.createElement('style');
  style.textContent = `
    html.dark .content-card .bg-white,
    html.dark .content-card .bg-zinc-50,
    html.dark .content-card .bg-zinc-100,
    html.dark .content-card .bg-blue-50,
    html.dark .content-card .bg-red-50 {
      background: rgba(8, 14, 26, 0.78) !important;
      border-color: rgba(37, 99, 235, 0.42) !important;
      color: #dbeafe !important;
      box-shadow: inset 0 1px 0 rgba(147, 197, 253, 0.08), 0 16px 42px rgba(0, 0, 0, 0.18);
    }

    html.dark .content-card .text-zinc-900,
    html.dark .content-card .text-zinc-800,
    html.dark .content-card .text-zinc-700,
    html.dark .content-card .text-zinc-600,
    html.dark .content-card .text-red-800,
    html.dark .content-card .text-blue-800 {
      color: #dbeafe !important;
    }

    html.dark .content-card .text-blue-600,
    html.dark .content-card .text-blue-500 {
      color: #93c5fd !important;
    }

    html.dark .content-card code,
    html.dark .content-card .bg-zinc-100 code {
      background: rgba(15, 23, 42, 0.84) !important;
      color: #bfdbfe !important;
    }
  `;
  document.head.appendChild(style);

  const copy = {
    'help.html': {
      title: ['Ajuda e Perguntas Frequentes - Guitar Architect', 'Help and FAQ - Guitar Architect'],
      h1: ['Ajuda e FAQ', 'Help and FAQ'],
      subtitle: ['Guia rapido do Guitar Architect 1.8.7', 'Quick guide for Guitar Architect 1.8.7'],
    },
    'privacy.html': {
      title: ['Politica de Privacidade - Guitar Architect', 'Privacy Policy - Guitar Architect'],
      h1: ['Politica de Privacidade', 'Privacy Policy'],
      subtitle: ['Ultima atualizacao: 18 de maio de 2026', 'Last updated: May 18, 2026'],
    },
    'terms.html': {
      title: ['Termos de Uso - Guitar Architect', 'Terms of Use - Guitar Architect'],
      h1: ['Termos de Uso', 'Terms of Use'],
      subtitle: ['Ultima atualizacao: 25 de janeiro de 2026', 'Last updated: January 25, 2026'],
    },
    'license.html': {
      title: ['Licenca de Uso - Guitar Architect', 'License - Guitar Architect'],
      h1: ['Licenca de Uso', 'License'],
      subtitle: ['Ultima atualizacao: 25 de janeiro de 2026', 'Last updated: January 25, 2026'],
    },
  }[page];

  if (!copy) return;

  const slot = lang === 'en' ? 1 : 0;
  document.title = copy.title[slot];

  const backLinks = document.querySelectorAll('a[href="/"]');
  backLinks.forEach(link => {
    link.textContent = lang === 'en' ? '← Back to App' : '← Voltar ao App';
  });

  const h1 = document.querySelector('h1');
  if (h1) h1.textContent = copy.h1[slot];

  const subtitle = document.querySelector('h1 + p');
  if (subtitle) subtitle.textContent = copy.subtitle[slot];
})();
