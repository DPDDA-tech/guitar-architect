import { useState } from "react";
import { motion } from "framer-motion";
import NewDiagramWizard from "./components/NewDiagramWizard";

const COPY = {
  en: {
    heroTitle: "Guitar Architect",
    heroSubtitle: "Interactive Fretboard & Visual Music Theory Platform",
    heroTagline:
      "Design scales, chords, and harmonic systems visually — a modern tool for guitarists, composers, and educators.",
    primaryCTA: "Launch App",
    secondaryCTA: "Switch to Portuguese",

    valueTitle: "Why Guitar Architect",
    values: [
      {
        title: "Visual Music Theory",
        text: "Explore scales, intervals, and harmony directly on a real-time interactive fretboard.",
      },
      {
        title: "Professional Workflow",
        text: "Build triads, tetrads, and harmonic layers for composition, practice, and teaching.",
      },
      {
        title: "Installable Platform",
        text: "Use Guitar Architect as a web app or install it as a PWA on desktop and mobile.",
      },
    ],

    audienceTitle: "Built for",
    audiences: [
      {
        title: "Guitarists",
        text: "Practice and visualize scales, modes, and chord systems across the fretboard.",
      },
      {
        title: "Composers",
        text: "Design harmonic structures and progressions with architectural precision.",
      },
      {
        title: "Educators",
        text: "Teach music theory using an interactive and intuitive visual interface.",
      },
    ],

    techTitle: "Modern Architecture",
    techPoints: [
      "Single Page Application (SPA)",
      "Installable Progressive Web App (PWA)",
      "Offline-ready core experience",
      "Local-first project storage",
      "High-performance SVG rendering",
    ],

    finalCTA: "Start Building Your Guitar Architecture",
    footer: "© Guitar Architect — Interactive Music Software Platform",
  },

  pt: {
    heroTitle: "Guitar Architect",
    heroSubtitle: "Plataforma Visual de Fretboard & Teoria Musical",
    heroTagline:
      "Desenhe escalas, acordes e sistemas harmônicos visualmente — uma ferramenta moderna para guitarristas, compositores e educadores.",
    primaryCTA: "Abrir Aplicação",
    secondaryCTA: "Mudar para Inglês",

    valueTitle: "Por que Guitar Architect",
    values: [
      {
        title: "Teoria Musical Visual",
        text: "Explore escalas, intervalos e harmonia diretamente em um braço interativo em tempo real.",
      },
      {
        title: "Fluxo Profissional",
        text: "Construa tríades, tétrades e camadas harmônicas para composição, prática e ensino.",
      },
      {
        title: "Plataforma Instalável",
        text: "Use como app web ou instale como PWA no desktop e no celular.",
      },
    ],

    audienceTitle: "Feito para",
    audiences: [
      {
        title: "Guitarristas",
        text: "Pratique e visualize escalas, modos e sistemas de acordes no braço da guitarra.",
      },
      {
        title: "Compositores",
        text: "Desenhe estruturas harmônicas e progressões com precisão arquitetônica.",
      },
      {
        title: "Educadores",
        text: "Ensine teoria musical com uma interface visual, intuitiva e interativa.",
      },
    ],

    techTitle: "Arquitetura Moderna",
    techPoints: [
      "Single Page Application (SPA)",
      "Progressive Web App (PWA) instalável",
      "Experiência principal offline",
      "Armazenamento local-first de projetos",
      "Renderização SVG de alta performance",
    ],

    finalCTA: "Comece a Construir sua Arquitetura Musical",
    footer: "© Guitar Architect — Plataforma de Software Musical Interativo",
  },
};

function Button({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline";
}) {
  const base = "rounded-2xl px-8 py-4 text-lg transition border";
  const styles =
    variant === "outline"
      ? "border-zinc-600 text-zinc-200 hover:bg-zinc-800"
      : "bg-white text-zinc-900 hover:bg-zinc-200";

  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800">
      {children}
    </div>
  );
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-8">{children}</div>;
}

export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "pt">("en");
  const [showWizard, setShowWizard] = useState(false);
  const [wizardType, setWizardType] = useState<'scale' | 'chord' | 'harmonic-field' | 'free'>('scale');
  const t = COPY[lang];

  const goToApp = () => {
    window.location.href = "/app";
  };

  const openWizard = (diagramType: 'scale' | 'chord' | 'harmonic-field' | 'free') => {
    setWizardType(diagramType);
    setShowWizard(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* HERO */}
      <section className="flex flex-col items-center justify-center px-6 py-32 text-center max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold tracking-tight"
        >
          {t.heroTitle}
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-xl md:text-2xl text-zinc-300"
        >
          {t.heroSubtitle}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-zinc-400"
        >
          {t.heroTagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Button onClick={goToApp}>{t.primaryCTA}</Button>
          <Button
            variant="outline"
            onClick={() => setLang(lang === "en" ? "pt" : "en")}
          >
            {t.secondaryCTA}
          </Button>
        </motion.div>
      </section>

      {/* CREATE FLOW */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <p className="text-sm uppercase tracking-[0.4em] text-blue-300 mb-4">
            {lang === 'pt' ? 'O que você quer criar?' : 'What do you want to create?'}
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
            {lang === 'pt'
              ? 'Comece seu próximo diagrama com um ponto de partida guiado.'
              : 'Start your next diagram with a guided starting point.'}
          </h2>
          <p className="mt-4 text-zinc-400 text-lg leading-8">
            {lang === 'pt'
              ? 'Escolha um tipo de diagrama e veja como o Guitar Architect prepara o fluxo para você.'
              : 'Choose a diagram type and see how Guitar Architect prepares the experience for you.'}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              type: 'scale',
              title: lang === 'pt' ? 'Escala' : 'Scale',
              description:
                lang === 'pt'
                  ? 'Visualize modos e padrões de escala no braço.'
                  : 'Visualize modes and scale patterns across the neck.',
              micro: lang === 'pt' ? 'Padrões melódicos em um clique.' : 'Melodic patterns in one click.',
              icon: (
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19V5h16v14H4Z" />
                  <path d="M8 7h8M8 12h8M8 17h5" />
                </svg>
              ),
              gradient: 'from-slate-950 via-zinc-900 to-blue-950',
            },
            {
              type: 'chord',
              title: lang === 'pt' ? 'Acorde' : 'Chord',
              description:
                lang === 'pt'
                  ? 'Construa acordes com inversões, voicings e CAGED.'
                  : 'Build chords with inversions, voicings, and CAGED.',
              micro: lang === 'pt' ? 'Harmonia com precisão e controle.' : 'Harmony with precision and control.',
              icon: (
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 19h14M12 5v14M5 12h14" />
                </svg>
              ),
              gradient: 'from-slate-950 via-zinc-900 to-emerald-950',
            },
            {
              type: 'harmonic-field',
              title: lang === 'pt' ? 'Campo Harmônico' : 'Harmonic Field',
              description:
                lang === 'pt'
                  ? 'Explore graus e progressões dentro de uma tonalidade.'
                  : 'Explore degrees and progressions inside a key.',
              micro: lang === 'pt' ? 'Mapeie a tonalidade com clareza.' : 'Map the key with clarity.',
              icon: (
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-fuchsia-300" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                  <path d="M4 7l8 10 8-10" />
                </svg>
              ),
              gradient: 'from-slate-950 via-zinc-900 to-fuchsia-950',
            },
            {
              type: 'free',
              title: lang === 'pt' ? 'Diagrama Livre' : 'Free Diagram',
              description:
                lang === 'pt'
                  ? 'Crie livremente com todos os controles já disponíveis.'
                  : 'Create freely with all controls already available.',
              micro: lang === 'pt' ? 'O fluxo aberto para sua própria criatividade.' : 'Open flow for your own creativity.',
              icon: (
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-sky-300" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18M3 12h18" />
                </svg>
              ),
              gradient: 'from-slate-950 via-zinc-900 to-sky-950',
            },
          ].map((card) => (
            <motion.button
              key={card.type}
              whileHover={{ y: -4 }}
              className={`group rounded-[32px] border border-zinc-800 bg-gradient-to-br ${card.gradient} p-8 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-500/30`}
              onClick={() => openWizard(card.type as 'scale' | 'chord' | 'harmonic-field' | 'free')}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 mb-6 text-white shadow-inner">
                {card.icon}
              </div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">{card.title}</h3>
                  <p className="text-sm uppercase tracking-[0.24em] text-blue-300 font-black">{card.micro}</p>
                </div>
              </div>
              <p className="text-zinc-300 leading-7">{card.description}</p>
              <div className="mt-8 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-blue-200 opacity-90 group-hover:text-white">
                {lang === 'pt' ? 'Iniciar' : 'Start'} →
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-6">
        {t.values.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card>
              <CardContent>
                <h3 className="text-xl font-semibold mb-2">{v.title}</h3>
                <p className="text-zinc-400">{v.text}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* AUDIENCE */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold mb-10 text-center">
          {t.audienceTitle}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {t.audiences.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card>
                <CardContent>
                  <h3 className="text-xl font-semibold mb-2">{a.title}</h3>
                  <p className="text-zinc-400">{a.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TECH */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-8">{t.techTitle}</h2>
        <ul className="space-y-3 text-zinc-400">
          {t.techPoints.map((p) => (
            <li key={p}>• {p}</li>
          ))}
        </ul>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-8">{t.finalCTA}</h2>
        <Button onClick={goToApp}>{t.primaryCTA}</Button>
      </section>

      {showWizard && (
        <NewDiagramWizard
          onCreate={() => setShowWizard(false)}
          onClose={() => setShowWizard(false)}
          lang={lang}
          initialDiagramType={wizardType}
        />
      )}
      
      {/* FOOTER */}


      {/* FOOTER */}
      <footer className="border-t border-zinc-800 py-8 text-center text-zinc-500 text-sm">
        {t.footer}
      </footer>
    </div>
  );
}
