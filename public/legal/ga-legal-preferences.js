(() => {
  const safeBackToApp = (fallbackPath = '/ecosystem') => {
    try {
      const ref = document.referrer;
      if (ref) {
        const refUrl = new URL(ref);
        if (refUrl.origin === window.location.origin && window.history.length > 1) {
          window.history.back();
          return;
        }
      }
    } catch {}
    window.location.href = fallbackPath;
  };

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
  const lang = globalLang === 'en' || globalLang === 'pt'
    ? globalLang
    : (config.lang === 'en' ? 'en' : 'pt');
  const isDark = globalTheme === 'dark' || globalTheme === 'light'
    ? globalTheme === 'dark'
    : config.theme === 'dark';
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
  `;
  document.head.appendChild(style);

  const copy = {
    'help.html': {
      title: ['Ajuda e Perguntas Frequentes - Guitar Architect', 'Help and FAQ - Guitar Architect'],
      eyebrow: ['Guitar Architect', 'Guitar Architect'],
      h1: ['Ajuda e FAQ', 'Help and FAQ'],
      subtitle: ['Guia Rápido e Dúvidas Frequentes', 'Quick Guide and Frequently Asked Questions'],
      date: ['Última atualização: 15 de junho de 2026', 'Last updated: June 15, 2026'],
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

  const slot = lang === 'en' ? 1 : 0;
  document.title = copy.title[slot];

  const backLinks = document.querySelectorAll('[data-back-to-app]');
  backLinks.forEach(link => {
    link.textContent = lang === 'en' ? '← Back to App' : '← Voltar ao App';
    link.addEventListener('click', event => {
      event.preventDefault();
      safeBackToApp(link.getAttribute('href') || '/ecosystem');
    });
  });

  const h1 = document.querySelector('h1');
  if (h1) {
    const eyebrow = h1.previousElementSibling;
    if (eyebrow && eyebrow.tagName === 'P') eyebrow.textContent = copy.eyebrow[slot];

    h1.textContent = copy.h1[slot];

    const subtitle = h1.nextElementSibling;
    if (subtitle && subtitle.tagName === 'P') {
      subtitle.textContent = copy.subtitle[slot];

      const date = subtitle.nextElementSibling;
      if (date && date.tagName === 'P') date.textContent = copy.date[slot];
    }
  }

  const themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) {
    themeBtn.textContent = isDark ? '☀️' : '🌙';
    themeBtn.setAttribute('aria-label', lang === 'en'
      ? (isDark ? 'Enable light mode' : 'Enable dark mode')
      : (isDark ? 'Ativar modo claro' : 'Ativar modo escuro'));
    themeBtn.addEventListener('click', () => {
      const nowDark = !document.documentElement.classList.contains('dark');
      document.documentElement.classList.toggle('dark', nowDark);
      themeBtn.textContent = nowDark ? '☀️' : '🌙';
      const cfg = readConfig();
      cfg.theme = nowDark ? 'dark' : 'light';
      localStorage.setItem('ga_config', JSON.stringify(cfg));
      localStorage.setItem('ga_theme', cfg.theme);
    });
  }

  const langBtn = document.querySelector('[data-lang-toggle]');
  if (langBtn) {
    langBtn.textContent = lang.toUpperCase();
    langBtn.addEventListener('click', () => {
      const nextLang = lang === 'pt' ? 'en' : 'pt';
      const cfg = readConfig();
      cfg.lang = nextLang;
      localStorage.setItem('ga_config', JSON.stringify(cfg));
      localStorage.setItem('ga_lang', nextLang);
      window.location.reload();
    });
  }
})();
