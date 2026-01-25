import { useEffect } from "react";
import FretboardPanel from "./components/FretboardPanel";

const App: React.FC = () => {
  useEffect(() => {
    document.title = "Guitar Architect — Interactive Fretboard";

    const description = "Professional interactive fretboard for guitarists. Design scales, chords, and harmonic structures visually in real time.";
    let meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", description);
  }, []);

  return <FretboardPanel />;
};

export default App;
