import React, { useEffect } from 'react';
import FretboardPanel from './components/FretboardPanel';

const App: React.FC = () => {
  useEffect(() => {
    document.title = "Guitar Architect — Interactive Fretboard";
  }, []);

  return (
    <FretboardPanel />
  );
};

export default App;
