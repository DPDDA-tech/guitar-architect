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
