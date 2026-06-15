import React, { useState } from 'react';
import { loadConfig } from '../utils/persistence';
import { getGlobalLang, getGlobalTheme, setGlobalPreferences } from '../utils/ecosystemPreferences';
import { SUPPORTER_PIX_KEY, SUPPORTER_CONTACT_EMAIL } from '../utils/supporterConstants';
import AppFooter from './AppFooter';
import SupportModal from './SupportModal';

type ThemeMode = 'light' | 'dark';
type AppLang = 'pt' | 'en';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const navigateToCollectionSection = (anchorId: string) => {
  navigateTo('/theme-collection');
  window.setTimeout(() => {
    document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 250);
};

const Season1Page: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => getGlobalTheme());
  const [lang, setLang] = useState<AppLang>(() => getGlobalLang());
  const [showSupportModal, setShowSupportModal] = useState(false);
  const isLight = theme === 'light';

  const handleToggleTheme = () => {
    const current = loadConfig();
    const nextTheme: ThemeMode = isLight ? 'dark' : 'light';
    const next = { ...(current || {}), theme: nextTheme, lang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(nextTheme, lang);
    setTheme(nextTheme);
  };

  const handleToggleLang = () => {
    const current = loadConfig();
    const nextLang: AppLang = lang === 'pt' ? 'en' : 'pt';
    const next = { ...(current || {}), theme, lang: nextLang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(theme, nextLang);
    setLang(nextLang);
  };

  const gridStyle = {
    backgroundImage: `linear-gradient(${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  };

  const actionClass = isLight
    ? 'border-zinc-300 bg-white text-zinc-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:border-blue-400'
    : 'border-zinc-700 bg-zinc-900 text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:border-blue-500';

  const cardClass = isLight
    ? 'border-zinc-200 bg-white/85'
    : 'border-zinc-800 bg-zinc-900/70';

  const t = (lang === 'pt'
    ? {
        title: 'Temporada 1',
        subtitle: 'Apoiadores Oficiais do Guitar Architect',
        back: '← Voltar ao App',
        s1Title: '1. O que é a Temporada 1',
        s1: [
          'A Season 1 marca a fase inicial de construção do Guitar Architect.',
          'Os apoiadores ajudam a construir e expandir o ecossistema.',
          'Cada contribuição registrada no perfil soma progresso e pode desbloquear selos colecionáveis exclusivos.',
        ],
        s2Title: '2. Como funcionam os apoios',
        s2: [
          'As contribuições são cumulativas.',
          'O valor total registrado no perfil define o nível de apoiador.',
          'Ao atingir uma nova faixa, o usuário mantém os selos anteriores e desbloqueia o novo selo.',
          'Os selos são pessoais e vinculados ao perfil do usuário.',
          'A posse do arquivo de imagem não representa desbloqueio oficial.',
          'O reconhecimento oficial depende do registro no sistema do Guitar Architect.',
          'As faixas, temporadas e recompensas poderão evoluir em versões futuras.',
        ],
        s3Title: '3. Validade da Season 1',
        s3: 'A Season 1 permanece aberta para registros de apoio até 31/05/2027.',
        s4Title: '4. Como apoiar nesta fase',
        s4: 'Nesta fase inicial, o apoio é registrado manualmente. Após realizar a contribuição, o apoiador poderá enviar o comprovante para validação e liberação do selo correspondente no perfil.',
        s5Title: '5. Dados de apoio',
        pix: 'Chave Pix:',
        contact: 'Contato:',
        s6Title: '6. Avisos importantes',
        s6: [
          'Contribuições são opcionais.',
          'Contribuições não desbloqueiam funcionalidades.',
          'O Guitar Architect continua utilizável independentemente de apoio.',
          'O apoio é uma forma de participar da construção e evolução do projeto.',
        ],
        becomeSupporter: 'Tornar-se apoiador',
        viewBadges: 'Ver selos na coleção',
      }
    : {
        title: 'Season 1',
        subtitle: 'Official Supporters of Guitar Architect',
        back: '← Back to App',
        s1Title: '1. What is Season 1',
        s1: [
          'Season 1 marks the initial building phase of Guitar Architect.',
          'Supporters help build and expand the ecosystem.',
          'Each contribution registered in the profile adds progress and may unlock exclusive collectible badges.',
        ],
        s2Title: '2. How support works',
        s2: [
          'Contributions are cumulative.',
          'The total amount registered in the profile defines the supporter level.',
          'When a new range is reached, the user keeps previous badges and unlocks the new one.',
          'Badges are personal and tied to the user profile.',
          'Owning the image file does not represent an official unlock.',
          'Official recognition depends on registration inside the Guitar Architect system.',
          'Ranges, seasons and rewards may evolve in future versions.',
        ],
        s3Title: '3. Season 1 validity',
        s3: 'Season 1 remains open for support registrations until May 31, 2027.',
        s4Title: '4. How to support in this phase',
        s4: 'In this initial phase, support is registered manually. After contributing, the supporter may send proof for validation and badge release in the profile.',
        s5Title: '5. Support details',
        pix: 'PIX key:',
        contact: 'Contact:',
        s6Title: '6. Important notices',
        s6: [
          'Contributions are optional.',
          'Contributions do not unlock features.',
          'Guitar Architect remains fully usable regardless of support.',
          'Supporting is a way to take part in the construction and evolution of the project.',
        ],
        becomeSupporter: 'Become a supporter',
        viewBadges: 'View badges in collection',
      });

  return (
    <>
      <div className={`relative min-h-screen p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
        <div className="absolute inset-0 pointer-events-none opacity-50" style={gridStyle} />

        <div className="relative mx-auto max-w-[1000px] py-6">
          <div className="mb-8 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => navigateTo('/ecosystem')}
              className="inline-flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest hover:underline"
            >
              {t.back}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleTheme}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-black transition-all ${actionClass}`}
                aria-label={isLight ? (lang === 'pt' ? 'Ativar modo escuro' : 'Enable dark mode') : (lang === 'pt' ? 'Ativar modo claro' : 'Enable light mode')}
              >
                {isLight ? '🌙' : '☀️'}
              </button>
              <button
                type="button"
                onClick={handleToggleLang}
                className={`min-h-[36px] rounded-xl border px-3 py-2 text-[11px] font-black uppercase transition-all ${actionClass}`}
              >
                {lang.toUpperCase()}
              </button>
            </div>
          </div>

          <div className="text-center mb-10">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">
              {lang === 'pt' ? 'Temporada 1 / Season 1' : 'Season 1 / Temporada 1'}
            </p>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
              {t.title.toUpperCase()}
            </h1>
            <p className="mt-3 text-zinc-500 font-bold uppercase text-[12px] md:text-sm tracking-[0.2em]">
              {t.subtitle}
            </p>
          </div>

          <div className={`rounded-[40px] border p-8 md:p-12 shadow-2xl ${cardClass}`}>
            <div className="space-y-8 text-sm md:text-base">
              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{t.s1Title}</h2>
                <ul className="list-disc ml-5 space-y-2">
                  {t.s1.map(item => <li key={item}>{item}</li>)}
                </ul>
              </section>

              <hr className={isLight ? 'border-zinc-100' : 'border-zinc-800'} />

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{t.s2Title}</h2>
                <ol className="space-y-2">
                  {t.s2.map((item, index) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-blue-400/60 text-[10px] font-black text-blue-500">{index + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="rounded-3xl border border-blue-200/60 bg-blue-50/60 p-6 dark:border-blue-900/40 dark:bg-blue-950/20">
                <h2 className="text-lg font-black uppercase tracking-tight mb-2 text-blue-700 dark:text-blue-400">{t.s3Title}</h2>
                <p className="font-bold">{t.s3}</p>
              </section>

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{t.s4Title}</h2>
                <p>{t.s4}</p>
              </section>

              <section id="season-1-payment-info" className={`rounded-2xl border p-6 ${cardClass}`}>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{t.s5Title}</h2>
                <div className="space-y-2 font-bold">
                  <p>{t.pix} <span className="text-blue-600 dark:text-blue-400">{SUPPORTER_PIX_KEY}</span></p>
                  <p>{t.contact} <span className="text-blue-600 dark:text-blue-400">{SUPPORTER_CONTACT_EMAIL}</span></p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4">{t.s6Title}</h2>
                <ul className="list-disc ml-5 space-y-2">
                  {t.s6.map(item => <li key={item}>{item}</li>)}
                </ul>
              </section>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setShowSupportModal(true)}
                className="rounded-xl border border-blue-400/55 bg-blue-600 px-6 py-3 text-[11px] font-black uppercase text-white shadow-lg shadow-blue-950/20 hover:bg-blue-700"
              >
                {t.becomeSupporter}
              </button>
              <button
                type="button"
                onClick={() => navigateToCollectionSection('supporter-rewards-grid')}
                className={`rounded-xl border px-6 py-3 text-[11px] font-black uppercase ${isLight ? 'border-slate-200 bg-white text-slate-700' : 'border-slate-700 bg-slate-950/70 text-slate-200'}`}
              >
                {t.viewBadges}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />

      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} isLight={isLight} lang={lang} />
    </>
  );
};

export default Season1Page;
