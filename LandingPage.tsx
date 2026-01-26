import { useState } from "react";
import { motion } from "framer-motion";

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
  const t = COPY[lang];

  const goToApp = () => {
    window.location.href = "/app";
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

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 py-8 text-center text-zinc-500 text-sm">
        {t.footer}
      </footer>
    </div>
  );
}
