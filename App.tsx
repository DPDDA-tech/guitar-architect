import { useEffect, useState } from "react";
import FretboardPanel from "./components/FretboardPanel";
import { Lang, i18n } from "./i18n";

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>(i18n.getLanguage());

  useEffect(() => {
    document.title = "Guitar Architect — Interactive Fretboard";

    const description =
      "Professional interactive fretboard for guitarists. Design scales, chords, and harmonic structures visually in real time.";

    let meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", description);
  }, []);

  // Apenas persiste idioma — os componentes continuam lendo do i18n.ts
  const changeLanguage = (l: Lang) => {
    i18n.setLanguage(l);
    setLang(l);
    window.location.reload(); // força re-render geral sem refatoração
  };

  return (
    <>
      {/* Toggle simples de idioma */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          className="px-2 py-1 text-sm bg-zinc-800 rounded"
          onClick={() => changeLanguage("pt")}
        >
          PT
        </button>
        <button
          className="px-2 py-1 text-sm bg-zinc-800 rounded"
          onClick={() => changeLanguage("en")}
        >
          EN
        </button>
      </div>

      <FretboardPanel />
    </>
  );
};

export default App;
