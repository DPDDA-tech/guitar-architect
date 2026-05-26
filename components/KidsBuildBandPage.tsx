import React, { useMemo, useState } from 'react';
import { getKidsTheme } from '../utils/ecosystemPreferences';

type SlotId = 'lead' | 'bass' | 'rhythm';
type Role = 'lead' | 'bass' | 'rhythm';
type ChallengeId = 'free' | 'rock' | 'acoustic' | 'findBass';

type BandInstrument = {
  id: string;
  label: string;
  role: Role;
  image: string;
  feedback: string;
};

type Challenge = {
  id: ChallengeId;
  title: string;
  description: string;
  expected: Partial<Record<SlotId, string[]>>;
};

const instruments: BandInstrument[] = [
  { id: 'classic-s', label: 'Classic S', role: 'lead', image: '/kids/workshop/classic-s.webp', feedback: 'Legal! Agora sua banda pode tocar melodias.' },
  { id: 'single-cut', label: 'Single Cut', role: 'lead', image: '/kids/workshop/single-cut.webp', feedback: 'Muito bom! Esse instrumento ajuda nos riffs e solos.' },
  { id: 'explorer', label: 'Explorer', role: 'lead', image: '/kids/workshop/explorer.webp', feedback: 'Que estilo! Sua banda ganhou energia para os solos.' },
  { id: 'flyingv', label: 'Flying V', role: 'lead', image: '/kids/workshop/flyingv.webp', feedback: 'Visual radical! Sua banda esta pronta para melodias fortes.' },
  { id: 'contrabaixo', label: 'Contrabaixo', role: 'bass', image: '/kids/workshop/contrabaixo.webp', feedback: 'Boa! Sua banda agora tem sons graves.' },
  { id: 'violao', label: 'Violao', role: 'rhythm', image: '/kids/workshop/violao.webp', feedback: 'O violao ajuda no ritmo da musica.' },
  { id: 'semi-acustica', label: 'Semi-acustica', role: 'rhythm', image: '/kids/workshop/semi-acustica.webp', feedback: 'Perfeito! A semi-acustica traz base e som cheio.' },
  { id: 'banjo', label: 'Banjo', role: 'rhythm', image: '/kids/workshop/banjo.webp', feedback: 'Que divertido! O banjo da brilho para o ritmo.' },
];

const slotInfo: Array<{ id: SlotId; label: string; icon: string }> = [
  { id: 'lead', label: 'Instrumento Principal (Solo)', icon: '??' },
  { id: 'bass', label: 'Instrumento Grave (Graves)', icon: '??' },
  { id: 'rhythm', label: 'Instrumento de Ritmo (Base)', icon: '??' },
];

const challenges: Challenge[] = [
  {
    id: 'free',
    title: 'Modo Livre',
    description: 'Escolha os instrumentos que voce quiser e monte sua banda.',
    expected: {},
  },
  {
    id: 'rock',
    title: 'Monte uma banda de rock',
    description: 'Sugestao: Flying V ou Explorer, Contrabaixo e uma base de ritmo.',
    expected: {
      lead: ['flyingv', 'explorer'],
      bass: ['contrabaixo'],
      rhythm: ['classic-s', 'single-cut', 'semi-acustica'],
    },
  },
  {
    id: 'acoustic',
    title: 'Monte uma banda acustica',
    description: 'Use instrumentos de madeira e som natural.',
    expected: {
      lead: ['semi-acustica', 'violao'],
      bass: ['contrabaixo'],
      rhythm: ['violao', 'banjo', 'semi-acustica'],
    },
  },
  {
    id: 'findBass',
    title: 'Encontre um instrumento de sons graves',
    description: 'Descubra qual instrumento segura os sons graves da banda.',
    expected: {
      bass: ['contrabaixo'],
    },
  },
];

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

const KidsBuildBandPage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [selectedSlot, setSelectedSlot] = useState<SlotId>('lead');
  const [selectedChallengeId, setSelectedChallengeId] = useState<ChallengeId>('free');
  const [bandSlots, setBandSlots] = useState<Partial<Record<SlotId, string>>>({});
  const [feedback, setFeedback] = useState('Escolha um slot e clique em um instrumento para montar sua banda.');

  const isLight = theme === 'light';
  const selectedChallenge = challenges.find((item) => item.id === selectedChallengeId) ?? challenges[0];

  const gridStyle = useMemo(() => ({
    backgroundImage: `linear-gradient(${isLight ? '#d1d5db' : '#1f2937'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? '#d1d5db' : '#1f2937'} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  }), [isLight]);

  const assignInstrument = (instrumentId: string) => {
    const instrument = instruments.find((item) => item.id === instrumentId);
    if (!instrument) return;

    setBandSlots((prev) => ({ ...prev, [selectedSlot]: instrument.id }));
    setFeedback(instrument.feedback);
  };

  const clearBand = () => {
    setBandSlots({});
    setFeedback('Palco limpo! Agora monte uma nova banda.');
  };

  const isBandComplete = slotInfo.every((slot) => Boolean(bandSlots[slot.id]));

  const challengeCompleted = (() => {
    if (selectedChallenge.id === 'free') return isBandComplete;

    return Object.entries(selectedChallenge.expected).every(([slotId, allowedIds]) => {
      if (!allowedIds || allowedIds.length === 0) return true;
      const selected = bandSlots[slotId as SlotId];
      return Boolean(selected && allowedIds.includes(selected));
    });
  })();

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <div className="absolute inset-0 pointer-events-none opacity-45" style={gridStyle} />

      <main className="relative mx-auto max-w-6xl">
        <header className="mb-6 md:mb-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-500">Guitar Architect Kids</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Monte a Banda</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Escolha instrumentos para criar sua primeira banda.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className={`rounded-3xl border p-4 md:p-5 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-500">Desafio</p>
            <div className="mt-2 grid gap-2">
              {challenges.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => setSelectedChallengeId(challenge.id)}
                  className={`rounded-xl border px-3 py-2 text-left text-xs font-black transition-all ${selectedChallengeId === challenge.id ? 'border-fuchsia-500 bg-fuchsia-600 text-white' : isLight ? 'border-slate-300 bg-white hover:border-fuchsia-400' : 'border-zinc-700 bg-zinc-950 hover:border-fuchsia-500'}`}
                >
                  {challenge.title}
                </button>
              ))}
            </div>

            <div className={`mt-4 rounded-xl border px-3 py-3 text-xs font-bold ${isLight ? 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900' : 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-100'}`}>
              {selectedChallenge.description}
            </div>

            <button
              onClick={clearBand}
              className={`mt-4 w-full rounded-xl border px-3 py-3 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-fuchsia-400' : 'border-zinc-700 bg-zinc-950 hover:border-fuchsia-500'}`}
            >
              Limpar palco
            </button>
          </aside>

          <div className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
            <div className={`rounded-2xl border p-4 md:p-5 transition-all ${isBandComplete ? 'border-fuchsia-400 bg-gradient-to-br from-fuchsia-500/10 via-cyan-500/5 to-emerald-500/10 shadow-[0_0_30px_rgba(217,70,239,0.25)]' : isLight ? 'border-slate-200 bg-slate-50/80' : 'border-zinc-700 bg-zinc-950/70'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-500">Palco Futurista</p>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {slotInfo.map((slot) => {
                  const assignedId = bandSlots[slot.id];
                  const assignedInstrument = instruments.find((item) => item.id === assignedId);
                  const isActive = selectedSlot === slot.id;

                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`rounded-2xl border p-3 text-left transition-all ${isActive ? 'border-fuchsia-500 bg-fuchsia-500/15' : isLight ? 'border-slate-300 bg-white hover:border-fuchsia-400' : 'border-zinc-700 bg-zinc-900/70 hover:border-fuchsia-500'}`}
                    >
                      <p className="text-xs font-black uppercase">{slot.icon} {slot.label}</p>
                      {assignedInstrument ? (
                        <div className="mt-2 rounded-xl border border-white/15 bg-black/20 p-2">
                          <img src={assignedInstrument.image} alt={assignedInstrument.label} className="h-20 w-full rounded-lg object-contain" />
                          <p className="mt-1 text-[11px] font-black uppercase">{assignedInstrument.label}</p>
                        </div>
                      ) : (
                        <p className={`mt-2 text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Clique e escolha um instrumento</p>
                      )}
                    </button>
                  );
                })}
              </div>

              {isBandComplete && (
                <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
                  Sua banda esta pronta! ?
                </div>
              )}

              {challengeCompleted && selectedChallenge.id !== 'free' && (
                <div className={`mt-3 rounded-xl border px-3 py-3 text-sm font-black ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
                  Desafio concluido! Voce montou a combinacao pedida.
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-500">Instrumentos disponiveis</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {instruments.map((instrument) => (
                  <button
                    key={instrument.id}
                    onClick={() => assignInstrument(instrument.id)}
                    className={`rounded-2xl border p-3 text-left transition-all ${isLight ? 'border-slate-300 bg-white hover:border-fuchsia-400' : 'border-zinc-700 bg-zinc-950 hover:border-fuchsia-500'}`}
                  >
                    <img src={instrument.image} alt={instrument.label} className="h-24 w-full rounded-lg object-contain" />
                    <p className="mt-2 text-xs font-black uppercase">{instrument.label}</p>
                    <p className={`text-[10px] font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                      {instrument.role === 'bass' ? 'Graves' : instrument.role === 'rhythm' ? 'Base/Ritmo' : 'Solo/Melodia'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black ${isLight ? 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900' : 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-100'}`}>
              {feedback}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button onClick={() => navigateTo('/kids/games')} className="rounded-xl border border-amber-500 bg-amber-500 px-4 py-2 text-xs font-black uppercase text-white hover:bg-amber-400">
                Voltar aos Jogos
              </button>
              <button onClick={() => navigateTo('/kids')} className={`rounded-xl border px-4 py-2 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
                Voltar ao Kids
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default KidsBuildBandPage;

