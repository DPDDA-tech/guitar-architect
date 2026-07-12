(() => {
  const readConfig = () => {
    try {
      return JSON.parse(localStorage.getItem('ga_config') || '{}');
    } catch {
      return {};
    }
  };

  const config = readConfig();
  const globalLang = localStorage.getItem('ga_lang');
  const globalTheme = localStorage.getItem('ga_theme');
  let lang = globalLang === 'en' || globalLang === 'pt'
    ? globalLang
    : (config.lang === 'en' ? 'en' : 'pt');
  const isDark = globalTheme === 'dark' || globalTheme === 'light'
    ? globalTheme === 'dark'
    : config.theme === 'dark';
  const page = location.pathname.split('/').pop() || '';

  const MOON_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z" /></svg>';
  const SUN_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>';

  document.documentElement.classList.toggle('dark', isDark);

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

    .legal-footer {
      border-color: #e2e8f0;
      color: #64748b;
    }
    .legal-footer a {
      color: #64748b;
      transition: color 0.15s;
    }
    .legal-footer a:hover {
      color: #2563eb;
    }
    html.dark .legal-footer {
      border-color: rgba(37, 99, 235, 0.35);
      color: #93a5c4;
    }
    html.dark .legal-footer a {
      color: #93a5c4;
    }
    html.dark .legal-footer a:hover {
      color: #93c5fd;
    }

    html.dark [data-theme-toggle],
    html.dark [data-lang-toggle] {
      border-color: #3f3f46 !important;
      background: #18181b !important;
      color: #e4e4e7 !important;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04) !important;
    }
    html.dark [data-theme-toggle]:hover,
    html.dark [data-lang-toggle]:hover {
      border-color: #3b82f6 !important;
    }

    [data-lang][hidden] {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  const copy = {
    'help.html': {
      title: ['Ajuda e Perguntas Frequentes - Guitar Architect', 'Help and FAQ - Guitar Architect'],
      eyebrow: ['Guitar Architect', 'Guitar Architect'],
      h1: ['Ajuda e FAQ', 'Help and FAQ'],
      subtitle: ['Guia Rápido e Dúvidas Frequentes', 'Quick Guide and Frequently Asked Questions'],
      date: ['Última atualização: 12 de julho de 2026', 'Last updated: July 12, 2026'],
    },
    'privacy.html': {
      title: ['Política de Privacidade - Guitar Architect', 'Privacy Policy - Guitar Architect'],
      eyebrow: ['Guitar Architect', 'Guitar Architect'],
      h1: ['Política de Privacidade', 'Privacy Policy'],
      subtitle: ['Tratamento de Dados e Privacidade dos Usuários', 'Data Processing and User Privacy'],
      date: ['Última atualização: 15 de junho de 2026', 'Last updated: June 15, 2026'],
    },
    'terms.html': {
      title: ['Termos de Uso - Guitar Architect', 'Terms of Use - Guitar Architect'],
      eyebrow: ['Guitar Architect', 'Guitar Architect'],
      h1: ['Termos de Uso', 'Terms of Use'],
      subtitle: ['Condições de Acesso e Utilização do Aplicativo', 'Access and Usage Conditions for the Application'],
      date: ['Última atualização: 15 de junho de 2026', 'Last updated: June 15, 2026'],
    },
    'license.html': {
      title: ['Licença de Uso - Guitar Architect', 'License - Guitar Architect'],
      eyebrow: ['Guitar Architect', 'Guitar Architect'],
      h1: ['Licença de Uso', 'License'],
      subtitle: ['Licenciamento do Código e do Produto', 'Code and Product Licensing'],
      date: ['Última atualização: 15 de junho de 2026', 'Last updated: June 15, 2026'],
    },
  }[page];

  if (!copy) return;

  const footerLabels = {
    season1: ['Temporada 1', 'Season 1'],
    privacy: ['Privacidade', 'Privacy'],
    terms: ['Termos', 'Terms'],
    license: ['Licença', 'License'],
    help: ['Ajuda', 'Help'],
    support: ['Suporte', 'Support'],
  };

  const themeBtn = document.querySelector('[data-theme-toggle]');
  const langBtn = document.querySelector('[data-lang-toggle]');

  const applyLang = (nextLang) => {
    lang = nextLang;
    const slot = lang === 'en' ? 1 : 0;

    document.documentElement.lang = lang === 'en' ? 'en-US' : 'pt-BR';
    document.title = copy.title[slot];

    document.querySelectorAll('[data-back-to-app]').forEach(link => {
      link.textContent = lang === 'en' ? '← Back to App' : '← Voltar ao App';
    });

    const aboutLink = document.querySelector('[data-about-link]');
    if (aboutLink) aboutLink.textContent = lang === 'en' ? 'About' : 'Sobre';

    const ecosystemLink = document.querySelector('[data-ecosystem-link]');
    if (ecosystemLink) {
      ecosystemLink.setAttribute('aria-label', lang === 'en'
        ? 'Go to the Guitar Architect ecosystem'
        : 'Ir para o ecossistema Guitar Architect');
    }

    document.querySelectorAll('[data-lang]').forEach(el => {
      el.hidden = el.getAttribute('data-lang') !== lang;
    });

    document.querySelectorAll('[data-footer-link]').forEach(link => {
      const labels = footerLabels[link.getAttribute('data-footer-link')];
      if (labels) link.textContent = labels[slot];
    });

    const footerTagline = document.querySelector('[data-footer-tagline]');
    if (footerTagline) {
      const taglines = [
        'Marca Mista Depositada no INPI • Processo Nº 944083625 • © 2026 Guitar Architect',
        'Mixed trademark application filed with the Brazilian INPI • Case no. 944083625 • © 2026 Guitar Architect',
      ];
      footerTagline.textContent = taglines[slot];
    }

    const h1 = document.querySelector('h1');
    if (h1) {
      const eyebrow = h1.previousElementSibling;
      if (eyebrow && eyebrow.tagName === 'P') eyebrow.textContent = copy.eyebrow[slot];

      h1.textContent = copy.h1[slot];

      const subtitle = h1.nextElementSibling;
      if (subtitle && subtitle.tagName === 'P') {
        subtitle.textContent = copy.subtitle[slot];
      }

      const dateEl = document.querySelector('[data-update-date]');
      if (dateEl) dateEl.textContent = copy.date[slot];
    }

    if (themeBtn) {
      const isDarkNow = document.documentElement.classList.contains('dark');
      themeBtn.setAttribute('aria-label', lang === 'en'
        ? (isDarkNow ? 'Enable light mode' : 'Enable dark mode')
        : (isDarkNow ? 'Ativar modo claro' : 'Ativar modo escuro'));
    }

    if (langBtn) langBtn.textContent = lang.toUpperCase();
  };

  applyLang(lang);

  if (themeBtn) {
    themeBtn.innerHTML = isDark ? SUN_SVG : MOON_SVG;
    themeBtn.addEventListener('click', () => {
      const nowDark = !document.documentElement.classList.contains('dark');
      document.documentElement.classList.toggle('dark', nowDark);
      themeBtn.innerHTML = nowDark ? SUN_SVG : MOON_SVG;
      themeBtn.setAttribute('aria-label', lang === 'en'
        ? (nowDark ? 'Enable light mode' : 'Enable dark mode')
        : (nowDark ? 'Ativar modo claro' : 'Ativar modo escuro'));
      const cfg = readConfig();
      cfg.theme = nowDark ? 'dark' : 'light';
      localStorage.setItem('ga_config', JSON.stringify(cfg));
      localStorage.setItem('ga_theme', cfg.theme);
    });
  }

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const nextLang = lang === 'pt' ? 'en' : 'pt';
      const cfg = readConfig();
      cfg.lang = nextLang;
      localStorage.setItem('ga_config', JSON.stringify(cfg));
      localStorage.setItem('ga_lang', nextLang);
      applyLang(nextLang);
    });
  }
})();
