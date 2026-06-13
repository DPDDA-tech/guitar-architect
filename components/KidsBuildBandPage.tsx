import React, { useEffect, useState } from 'react';
import { getKidsLang, getKidsTheme } from '../utils/ecosystemPreferences';
import AppFooter from './AppFooter';
import EcosystemPageActions from './ecosystem/EcosystemPageActions';
import InternalEcosystemHeader from './ecosystem/InternalEcosystemHeader';

type SlotId = 'lead' | 'bass' | 'rhythm';
type Role = 'lead' | 'bass' | 'rhythm';
type ChallengeId = 'free' | 'rock' | 'acoustic' | 'findBass';

type BandInstrument = {
  id: string;
  label: { pt: string; en: string };
  role: Role;
  image: string;
  feedback: { pt: string; en: string };
};

type Challenge = {
  id: ChallengeId;
  title: { pt: string; en: string };
  description: { pt: string; en: string };
  expected: Partial<Record<SlotId, string[]>>;
};

const instruments: BandInstrument[] = [
  { id: 'classic-s', label: { pt: 'Classic S', en: 'Classic S' }, role: 'lead', image: '/kids/workshop/classic-s.webp', feedback: { pt: 'Legal! Agora sua banda pode tocar melodias.', en: 'Nice! Now your band can play melodies.' } },
  { id: 'single-cut', label: { pt: 'Single Cut', en: 'Single Cut' }, role: 'lead', image: '/kids/workshop/single-cut.webp', feedback: { pt: 'Muito bom! Esse instrumento ajuda nos riffs e solos.', en: 'Great! This instrument helps with riffs and solos.' } },
  { id: 'explorer', label: { pt: 'Explorer', en: 'Explorer' }, role: 'lead', image: '/kids/workshop/explorer.webp', feedback: { pt: 'Que estilo! Sua banda ganhou energia para os solos.', en: 'So much style! Your band gained energy for solos.' } },
  { id: 'flyingv', label: { pt: 'Flying V', en: 'Flying V' }, role: 'lead', image: '/kids/workshop/flyingv.webp', feedback: { pt: 'Visual radical! Sua banda está pronta para melodias fortes.', en: 'Bold look! Your band is ready for strong melodies.' } },
  { id: 'contrabaixo', label: { pt: 'Contrabaixo', en: 'Bass' }, role: 'bass', image: '/kids/workshop/contrabaixo.webp', feedback: { pt: 'Boa! Sua banda agora tem sons graves.', en: 'Great! Your band now has low sounds.' } },
  { id: 'violao', label: { pt: 'Violão', en: 'Acoustic Guitar' }, role: 'rhythm', image: '/kids/workshop/violao.webp', feedback: { pt: 'O violão ajuda no ritmo da música.', en: 'The acoustic guitar helps with the rhythm.' } },
  { id: 'semi-acustica', label: { pt: 'Semiacústica', en: 'Semi-Acoustic' }, role: 'rhythm', image: '/kids/workshop/semi-acustica.webp', feedback: { pt: 'Perfeito! A semiacústica traz base e som cheio.', en: 'Perfect! The semi-acoustic brings support and a full sound.' } },
  { id: 'banjo', label: { pt: 'Banjo', en: 'Banjo' }, role: 'rhythm', image: '/kids/workshop/banjo.webp', feedback: { pt: 'Que divertido! O banjo dá brilho para o ritmo.', en: 'So fun! The banjo adds sparkle to the rhythm.' } },
];

const slotInfo: Array<{ id: SlotId; label: { pt: string; en: string }; icon: string }> = [
  { id: 'lead', label: { pt: 'Instrumento Principal (Solo)', en: 'Main Instrument (Lead)' }, icon: '🎸' },
  { id: 'bass', label: { pt: 'Instrumento Grave (Graves)', en: 'Low Instrument (Bass)' }, icon: '🎵' },
  { id: 'rhythm', label: { pt: 'Instrumento de Ritmo (Base)', en: 'Rhythm Instrument (Backing)' }, icon: '🥁' },
];

const challenges: Challenge[] = [
  {
    id: 'free',
    title: { pt: 'Modo Livre', en: 'Free Mode' },
    description: { pt: 'Escolha os instrumentos que você quiser e monte sua banda.', en: 'Choose any instruments you want and build your band.' },
    expected: {},
  },
  {
    id: 'rock',
    title: { pt: 'Monte uma banda de rock', en: 'Build a rock band' },
    description: { pt: 'Sugestão: Flying V ou Explorer, Contrabaixo e uma base de ritmo.', en: 'Suggestion: Flying V or Explorer, Bass, and one rhythm instrument.' },
    expected: {
      lead: ['flyingv', 'explorer'],
      bass: ['contrabaixo'],
      rhythm: ['classic-s', 'single-cut', 'semi-acustica'],
    },
  },
  {
    id: 'acoustic',
    title: { pt: 'Monte uma banda acústica', en: 'Build an acoustic band' },
    description: { pt: 'Use instrumentos de madeira e som natural.', en: 'Use wooden instruments with a natural sound.' },
    expected: {
      lead: ['semi-acustica', 'violao'],
      bass: ['contrabaixo'],
      rhythm: ['violao', 'banjo', 'semi-acustica'],
    },
  },
  {
    id: 'findBass',
    title: { pt: 'Encontre um instrumento de sons graves', en: 'Find a low-sound instrument' },
    description: { pt: 'Descubra qual instrumento segura os sons graves da banda.', en: 'Find out which instrument holds the band’s low sounds.' },
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
  const [lang] = useState(() => getKidsLang());
  const [selectedSlot, setSelectedSlot] = useState<SlotId>('lead');
  const [selectedChallengeId, setSelectedChallengeId] = useState<ChallengeId>('free');
  const [bandSlots, setBandSlots] = useState<Partial<Record<SlotId, string>>>({});
  const [feedback, setFeedback] = useState('');

  const isLight = theme === 'light';
  const isPt = lang === 'pt';
  const selectedChallenge = challenges.find((item) => item.id === selectedChallengeId) ?? challenges[0];

  useEffect(() => {
    setFeedback(isPt ? 'Escolha um slot e clique em um instrumento para montar sua banda.' : 'Choose a slot and click an instrument to build your band.');
  }, [isPt]);


  const assignInstrument = (instrumentId: string) => {
    const instrument = instruments.find((item) => item.id === instrumentId);
    if (!instrument) return;

    setBandSlots((prev) => ({ ...prev, [selectedSlot]: instrument.id }));
    setFeedback(instrument.feedback[isPt ? 'pt' : 'en']);
  };

  const clearBand = () => {
    setBandSlots({});
    setFeedback(isPt ? 'Palco limpo! Agora monte uma nova banda.' : 'Stage cleared! Now build a new band.');
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
    <>
    <div className={`relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>

      <main className="relative mx-auto max-w-6xl">
        <EcosystemPageActions ecosystem="kids" isLight={isLight} backLabel={isPt ? "Voltar ao Kids" : "Back to Kids"} backPath="/kids" />
        <InternalEcosystemHeader ecosystem="kids" isLight={isLight} title={isPt ? "Monte a Banda" : "Build the Band"} subtitle={isPt ? "Escolha instrumentos para criar sua primeira banda." : "Choose instruments to create your first band."} />

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className={`rounded-3xl border p-4 md:p-5 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{isPt ? 'Desafio' : 'Challenge'}</p>
            <div className="mt-2 grid gap-2">
              {challenges.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => setSelectedChallengeId(challenge.id)}
                  className={`rounded-xl border px-3 py-2 text-left text-xs font-black transition-all ${selectedChallengeId === challenge.id ? 'border-emerald-500 bg-emerald-600 text-white' : isLight ? 'border-slate-300 bg-white hover:border-emerald-400' : 'border-zinc-700 bg-zinc-950 hover:border-emerald-500'}`}
                >
                  {challenge.title[isPt ? 'pt' : 'en']}
                </button>
              ))}
            </div>

            <div className={`mt-4 rounded-xl border px-3 py-3 text-xs font-bold ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'}`}>
              {selectedChallenge.description[isPt ? 'pt' : 'en']}
            </div>

            <button
              onClick={clearBand}
              className={`mt-4 w-full rounded-xl border px-3 py-3 text-xs font-black uppercase ${isLight ? 'border-slate-300 bg-white hover:border-emerald-400' : 'border-zinc-700 bg-zinc-950 hover:border-emerald-500'}`}
            >
              {isPt ? 'Limpar palco' : 'Clear stage'}
            </button>
          </aside>

          <div className={`rounded-3xl border p-4 md:p-6 ${isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800 bg-zinc-900/80'}`}>
            <div className={`rounded-2xl border p-4 md:p-5 transition-all ${isBandComplete ? 'border-emerald-400 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.25)]' : isLight ? 'border-slate-200 bg-slate-50/80' : 'border-zinc-700 bg-zinc-950/70'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{isPt ? 'Palco Futurista' : 'Futuristic Stage'}</p>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {slotInfo.map((slot) => {
                  const assignedId = bandSlots[slot.id];
                  const assignedInstrument = instruments.find((item) => item.id === assignedId);
                  const isActive = selectedSlot === slot.id;

                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`rounded-2xl border p-3 text-left transition-all ${isActive ? 'border-emerald-500 bg-emerald-500/15' : isLight ? 'border-slate-300 bg-white hover:border-emerald-400' : 'border-zinc-700 bg-zinc-900/70 hover:border-emerald-500'}`}
                    >
                      <p className="text-xs font-black uppercase">{slot.icon} {slot.label[isPt ? 'pt' : 'en']}</p>
                      {assignedInstrument ? (
                        <div className="mt-2 rounded-xl border border-white/15 bg-black/20 p-2">
                          <img src={assignedInstrument.image} alt={assignedInstrument.label[isPt ? 'pt' : 'en']} className="h-20 w-full rounded-lg object-contain" />
                          <p className="mt-1 text-[11px] font-black uppercase">{assignedInstrument.label[isPt ? 'pt' : 'en']}</p>
                        </div>
                      ) : (
                        <p className={`mt-2 text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{isPt ? 'Clique e escolha um instrumento' : 'Click and choose an instrument'}</p>
                      )}
                    </button>
                  );
                })}
              </div>

              {isBandComplete && (
                <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
                  {isPt ? 'Sua banda está pronta!' : 'Your band is ready!'}
                </div>
              )}

              {challengeCompleted && selectedChallenge.id !== 'free' && (
                <div className={`mt-3 rounded-xl border px-3 py-3 text-sm font-black ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
                  {isPt ? 'Desafio concluído! Você montou a combinação pedida.' : 'Challenge complete! You built the requested combination.'}
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{isPt ? 'Instrumentos disponíveis' : 'Available instruments'}</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {instruments.map((instrument) => (
                  <button
                    key={instrument.id}
                    onClick={() => assignInstrument(instrument.id)}
                    className={`rounded-2xl border p-3 text-left transition-all ${isLight ? 'border-slate-300 bg-white hover:border-emerald-400' : 'border-zinc-700 bg-zinc-950 hover:border-emerald-500'}`}
                  >
                    <img src={instrument.image} alt={instrument.label[isPt ? 'pt' : 'en']} className="h-24 w-full rounded-lg object-contain" />
                    <p className="mt-2 text-xs font-black uppercase">{instrument.label[isPt ? 'pt' : 'en']}</p>
                    <p className={`text-[10px] font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                      {instrument.role === 'bass' ? (isPt ? 'Graves' : 'Bass') : instrument.role === 'rhythm' ? (isPt ? 'Base/Ritmo' : 'Rhythm') : (isPt ? 'Solo/Melodia' : 'Lead/Melody')}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-black ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'}`}>
              {feedback}
            </div>

            <div className="mt-5 grid gap-2 sm:flex sm:flex-row">
              <button onClick={() => navigateTo('/kids/games')} className="min-h-[44px] rounded-xl border border-amber-500 bg-amber-500 px-4 py-2 text-xs font-black uppercase text-center leading-tight text-white hover:bg-amber-400">
                {isPt ? 'Voltar aos Jogos' : 'Back to Games'}
              </button>
              <button onClick={() => navigateTo('/kids')} className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-black uppercase text-center leading-tight ${isLight ? 'border-slate-300 bg-white' : 'border-zinc-700 bg-zinc-950'}`}>
                {isPt ? 'Voltar ao Kids' : 'Back to Kids'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>

    <AppFooter
      isLight={isLight}
      lang={lang}
      logoSrc="/gakidslogo.webp"
      logoAlt="Guitar Architect Kids"
    />
    </>
  );
};

export default KidsBuildBandPage;


