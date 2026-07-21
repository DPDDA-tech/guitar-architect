import React, { useEffect, useState } from 'react';
import { loadConfig } from '../utils/persistence';
import { getGlobalLang, getGlobalTheme, setGlobalPreferences } from '../utils/ecosystemPreferences';
import { getGuestSpecialistById } from '../data/guestSpecialists';
import AppFooter from './AppFooter';

type ThemeMode = 'light' | 'dark';
type AppLang = 'pt' | 'en';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

interface GuestSpecialistProfilePageProps {
  specialistId: string;
}

const GuestSpecialistProfilePage: React.FC<GuestSpecialistProfilePageProps> = ({ specialistId }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => getGlobalTheme());
  const [lang, setLang] = useState<AppLang>(() => getGlobalLang());
  const specialist = getGuestSpecialistById(specialistId);
  const isLight = theme === 'light';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [specialistId]);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = isLight ? 'dark' : 'light';
    const current = loadConfig();
    const next = { ...(current || {}), theme: nextTheme, lang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(nextTheme, lang);
    setTheme(nextTheme);
  };

  const toggleLang = () => {
    const nextLang: AppLang = lang === 'pt' ? 'en' : 'pt';
    const current = loadConfig();
    const next = { ...(current || {}), theme, lang: nextLang };
    localStorage.setItem('ga_config', JSON.stringify(next));
    setGlobalPreferences(theme, nextLang);
    setLang(nextLang);
  };

  if (!specialist || specialist.status !== 'active') {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-white">
        <button type="button" onClick={() => navigateTo('/instructors')} className="text-xs font-black uppercase tracking-widest text-blue-500">
          ← {lang === 'pt' ? 'Voltar à galeria' : 'Back to gallery'}
        </button>
        <p className="mt-8 text-sm text-zinc-400">{lang === 'pt' ? 'Especialista não encontrado.' : 'Specialist not found.'}</p>
      </main>
    );
  }

  const title = specialist.name ?? specialist.cardName ?? 'Helena Mascarenhas de Mello Villaça';
  const specialty = specialist.specialty?.[lang] ?? '';
  const description = specialist.shortDescription?.[lang] ?? '';
  const quote = specialist.quote?.[lang] ?? '';
  const biography = specialist.biography?.[lang] ?? '';

  const gridStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#e2e8f0' : '#1e293b'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  };

  const panelClass = isLight
    ? 'border-zinc-200 bg-white shadow-xl'
    : 'border-blue-950 bg-slate-950/90 shadow-[0_24px_80px_rgba(0,0,0,0.55)]';
  const softPanelClass = isLight
    ? 'border-zinc-200 bg-slate-50'
    : 'border-zinc-800 bg-zinc-900/60';
  const actionClass = isLight
    ? 'border-zinc-300 bg-white text-zinc-700 hover:border-blue-400'
    : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-blue-500';

  const identity = lang === 'pt'
    ? [
        ['Nome completo', 'Helena Mascarenhas de Mello Villaça'],
        ['Nome de exibição', 'Dra. Helena'],
        ['Idade', '43 anos'],
        ['Data de nascimento', '18 de setembro'],
        ['Local de nascimento', 'Belo Horizonte, Minas Gerais'],
        ['Onde vive', 'Juiz de Fora, Minas Gerais'],
        ['Nacionalidade', 'Brasileira'],
        ['Profissão', 'Médica fisiatra'],
        ['Área de atuação', 'Saúde musculoesquelética e funcional de músicos'],
        ['Formação complementar', 'Medicina do esporte, ergonomia, dor musculoesquelética e reabilitação funcional'],
        ['Instrumento', 'Violão'],
        ['Nível musical', 'Amadora dedicada'],
        ['Papel no Guitar Architect', 'Especialista em Saúde do Músico'],
        ['Vínculo institucional', 'Consultora do Guitar Architect My Academy e integrante da rede de apoio à jornada musical'],
        ['Personagem', 'Fictícia, criada com auxílio de inteligência artificial'],
      ]
    : [
        ['Full name', 'Helena Mascarenhas de Mello Villaça'],
        ['Display name', 'Dr. Helena'],
        ['Age', '43 years old'],
        ['Date of birth', 'September 18'],
        ['Place of birth', 'Belo Horizonte, Minas Gerais, Brazil'],
        ['Lives in', 'Juiz de Fora, Minas Gerais, Brazil'],
        ['Nationality', 'Brazilian'],
        ['Profession', 'Physiatrist'],
        ['Field', 'Musculoskeletal and functional health for musicians'],
        ['Additional training', 'Sports medicine, ergonomics, musculoskeletal pain and functional rehabilitation'],
        ['Instrument', 'Acoustic guitar'],
        ['Musical level', 'Dedicated amateur'],
        ['Role at Guitar Architect', 'Musician Health Specialist'],
        ['Institutional link', 'Consultant to Guitar Architect My Academy and member of the musical journey support network'],
        ['Character', 'Fictional, created with the aid of artificial intelligence'],
      ];

  const principles = lang === 'pt'
    ? [
        ['O corpo não é apenas um suporte para o instrumento', 'Respiração, estabilidade, mobilidade, coordenação e controle de força participam diretamente da produção sonora e da execução.'],
        ['Dor não é requisito para evolução', 'Esforço e fadiga podem ocorrer, mas desconfortos persistentes ou progressivos não devem ser normalizados como prova de dedicação.'],
        ['A melhor postura não é uma posição rígida', 'Uma postura saudável combina estabilidade, mobilidade e variação, evitando sobrecarga prolongada e tensão desnecessária.'],
        ['A prevenção começa na rotina', 'Pequenos ajustes diários na prática, no ambiente e no uso do instrumento podem ser mais eficazes do que agir apenas depois do aparecimento de uma lesão.'],
      ]
    : [
        ['The body is not merely an instrument support', 'Breathing, stability, mobility, coordination and force control directly participate in sound production and performance.'],
        ['Pain is not a requirement for progress', 'Effort and fatigue may occur, but persistent or progressive discomfort should not be normalized as proof of dedication.'],
        ['The best posture is not rigid', 'Healthy posture combines stability, mobility and variation while avoiding prolonged overload and unnecessary tension.'],
        ['Prevention begins in the routine', 'Small daily adjustments to practice, environment and instrument use may be more effective than acting only after an injury appears.'],
      ];

  const pausa = lang === 'pt'
    ? [
        ['P', 'Perceba', 'Reconheça as sensações presentes antes, durante e depois da prática.'],
        ['A', 'Ajuste', 'Observe instrumento, cadeira, apoio, correia, tela, partitura e ambiente.'],
        ['U', 'Use menos tensão', 'Identifique força excessiva e movimentos desnecessários.'],
        ['S', 'Segmente o estudo', 'Divida a prática em blocos compatíveis com seu condicionamento e com a dificuldade do conteúdo.'],
        ['A', 'Avalie os sinais', 'Diferencie fadiga transitória de sintomas persistentes ou progressivos que exigem atenção profissional.'],
      ]
    : [
        ['P', 'Perceive', 'Notice sensations before, during and after practice.'],
        ['A', 'Adjust', 'Review the instrument, chair, support, strap, screen, score and environment.'],
        ['U', 'Use less tension', 'Identify excessive force and unnecessary movements.'],
        ['S', 'Segment practice', 'Divide practice into blocks suited to your conditioning and the difficulty of the material.'],
        ['A', 'Assess the signs', 'Distinguish temporary fatigue from persistent or progressive symptoms that require professional attention.'],
      ];

  const warningSigns = lang === 'pt'
    ? ['Dor persistente ou progressiva', 'Formigamento ou alteração de sensibilidade', 'Perda de força', 'Limitação de movimento', 'Trauma', 'Zumbido', 'Audição abafada ou redução auditiva', 'Outro sintoma que interfira na prática ou nas atividades diárias']
    : ['Persistent or progressive pain', 'Tingling or altered sensation', 'Loss of strength', 'Restricted movement', 'Trauma', 'Tinnitus', 'Muffled hearing or hearing reduction', 'Any symptom that interferes with practice or daily activities'];

  const references = lang === 'pt'
    ? [
        ['Organização Mundial da Saúde — Making Listening Safe', 'https://www.who.int/activities/making-listening-safe/'],
        ['Organização Mundial da Saúde — Safe listening', 'https://www.who.int/news-room/questions-and-answers/item/deafness-and-hearing-loss-safe-listening'],
        ['CDC/NIOSH — Reducing the Risk of Hearing Disorders among Musicians', 'https://www.cdc.gov/niosh/docs/wp-solutions/2015-184/'],
        ['Performing Arts Medicine Association', 'https://artsmed.org/'],
      ]
    : [
        ['World Health Organization — Making Listening Safe', 'https://www.who.int/activities/making-listening-safe/'],
        ['World Health Organization — Safe listening', 'https://www.who.int/news-room/questions-and-answers/item/deafness-and-hearing-loss-safe-listening'],
        ['CDC/NIOSH — Reducing the Risk of Hearing Disorders among Musicians', 'https://www.cdc.gov/niosh/docs/wp-solutions/2015-184/'],
        ['Performing Arts Medicine Association', 'https://artsmed.org/'],
      ];

  return (
    <>
      <main className={`relative min-h-screen overflow-hidden p-6 md:p-12 ${isLight ? 'bg-slate-50 text-zinc-900' : 'bg-zinc-950 text-white'}`}>
        <div className="pointer-events-none absolute inset-0 opacity-50" style={gridStyle} />
        <div className="relative mx-auto max-w-[1100px] py-6">
          <header className="mb-8 flex items-center justify-between gap-3">
            <button type="button" onClick={() => navigateTo('/instructors')} className="text-xs font-black uppercase tracking-widest text-blue-500 hover:underline">
              ← {lang === 'pt' ? 'Voltar à galeria' : 'Back to gallery'}
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={toggleTheme} className={`h-9 rounded-xl border px-3 text-xs font-black ${actionClass}`}>{isLight ? '◐' : '☀'}</button>
              <button type="button" onClick={toggleLang} className={`h-9 rounded-xl border px-3 text-xs font-black uppercase ${actionClass}`}>{lang}</button>
            </div>
          </header>

          <section className={`overflow-hidden rounded-[36px] border ${panelClass}`}>
            {specialist.presentationVideo ? (
              <video controls preload="metadata" playsInline poster={specialist.profileImage} className="aspect-video w-full bg-black object-cover">
                <source src={specialist.presentationVideo} type="video/mp4" />
              </video>
            ) : null}
            <div className="p-7 text-center md:p-12">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-500">{lang === 'pt' ? 'Especialista convidada' : 'Guest specialist'}</p>
              <h1 className="mt-3 text-4xl font-black uppercase tracking-tighter md:text-6xl">{title}</h1>
              <p className="mt-2 text-sm font-black uppercase tracking-widest text-blue-500">{specialty}</p>
              <p className={`mx-auto mt-4 max-w-3xl text-sm font-semibold leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {lang === 'pt' ? 'Saúde do músico · Prevenção de lesões · Ergonomia · Consciência corporal · Hábitos de estudo saudáveis' : 'Musician health · Injury prevention · Ergonomics · Body awareness · Healthy practice habits'}
              </p>
              {quote ? <blockquote className={`mx-auto mt-7 max-w-3xl text-lg font-semibold italic leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}>“{quote}”</blockquote> : null}
              <p className={`mx-auto mt-6 max-w-3xl text-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{description}</p>
            </div>
          </section>

          <section className={`mt-8 rounded-3xl border p-6 md:p-8 ${panelClass}`}>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{lang === 'pt' ? 'Identidade da personagem' : 'Character identity'}</h2>
            <dl className="mt-5 grid gap-3 md:grid-cols-2">
              {identity.map(([label, value]) => (
                <div key={label} className={`rounded-2xl border p-4 ${softPanelClass}`}>
                  <dt className={`text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{label}</dt>
                  <dd className="mt-1 text-sm font-semibold leading-relaxed">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`mt-6 rounded-3xl border p-6 md:p-8 ${panelClass}`}>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{lang === 'pt' ? 'Trajetória' : 'Background'}</h2>
            <p className={`mt-4 text-sm leading-7 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{biography}</p>
          </section>

          <section className={`mt-6 rounded-3xl border p-6 md:p-8 ${panelClass}`}>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{lang === 'pt' ? 'Filosofia profissional' : 'Professional philosophy'}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {principles.map(([heading, body]) => (
                <article key={heading} className={`rounded-2xl border p-5 ${softPanelClass}`}>
                  <h3 className="text-sm font-black leading-snug">{heading}</h3>
                  <p className={`mt-3 text-sm leading-6 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`mt-6 rounded-3xl border p-6 md:p-8 ${panelClass}`}>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{lang === 'pt' ? 'Método P.A.U.S.A.' : 'P.A.U.S.A. method'}</h2>
            <p className={`mt-3 text-sm leading-7 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {lang === 'pt' ? 'Ferramenta educacional criada para o GA, destinada à construção de hábitos mais conscientes. Não constitui protocolo médico.' : 'An educational tool created for GA to support more conscious habits. It is not a medical protocol.'}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {pausa.map(([letter, heading, body]) => (
                <article key={`${letter}-${heading}`} className={`rounded-2xl border p-4 ${softPanelClass}`}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-lg font-black text-white">{letter}</div>
                  <h3 className="mt-4 text-sm font-black">{heading}</h3>
                  <p className={`mt-2 text-xs leading-5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`mt-6 rounded-3xl border p-6 md:p-8 ${panelClass}`}>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{lang === 'pt' ? 'Quando procurar avaliação profissional' : 'When to seek professional assessment'}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {warningSigns.map((item) => <div key={item} className={`rounded-2xl border p-4 text-sm font-semibold ${softPanelClass}`}>{item}</div>)}
            </div>
          </section>

          <section className={`mt-6 rounded-3xl border p-6 md:p-8 ${panelClass}`}>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">{lang === 'pt' ? 'Fontes e referências' : 'Sources and references'}</h2>
            <p className={`mt-3 text-sm leading-7 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {lang === 'pt' ? 'As advertências e recomendações gerais desta página são apoiadas por instituições reconhecidas em saúde auditiva e medicina das artes performáticas.' : 'The general warnings and recommendations on this page are supported by recognized institutions in hearing health and performing arts medicine.'}
            </p>
            <div className="mt-5 space-y-3">
              {references.map(([label, href]) => (
                <a key={href} href={href} target="_blank" rel="noreferrer" className={`block rounded-2xl border p-4 text-sm font-bold transition hover:border-blue-500 ${softPanelClass}`}>{label} ↗</a>
              ))}
            </div>
          </section>

          <div className={`mt-6 rounded-3xl border p-6 text-sm leading-relaxed ${isLight ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-amber-900/60 bg-amber-950/30 text-amber-200'}`}>
            <p>{lang === 'pt' ? 'Conteúdo educacional: as orientações apresentadas são gerais e não substituem consulta, exame físico, diagnóstico ou tratamento por profissional habilitado. Em caso de sintomas persistentes, progressivos ou relevantes, interrompa a atividade e procure avaliação profissional.' : 'Educational content: the guidance presented is general and does not replace consultation, physical examination, diagnosis or treatment by a qualified professional. In case of persistent, progressive or relevant symptoms, stop the activity and seek professional assessment.'}</p>
            <p className="mt-3 text-xs opacity-75">{lang === 'pt' ? 'Dra. Helena é uma personagem fictícia criada para fins educacionais e narrativos. Sua imagem e seu vídeo foram gerados por inteligência artificial.' : 'Dr. Helena is a fictional character created for educational and narrative purposes. Her image and video were generated with artificial intelligence.'}</p>
          </div>
        </div>
      </main>
      <AppFooter isLight={isLight} lang={lang} logoSrc="/Logo Guitar.webp" logoAlt="Guitar Architect" compact />
    </>
  );
};

export default GuestSpecialistProfilePage;
