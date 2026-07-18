import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { LearningModality } from '../../types/learningUnit';

const LAST_TEMPO_KEY = 'ga_my_academy_last_tempo';

const clampTempo = (value: number) => Math.min(160, Math.max(40, Math.round(value)));

const getStoredTempo = (fallback: number) => {
  if (typeof window === 'undefined') return fallback;
  const stored = Number(window.localStorage.getItem(LAST_TEMPO_KEY));
  return Number.isFinite(stored) ? clampTempo(stored) : fallback;
};

interface AccessiblePulseProps {
  initialTempo?: number;
  allowTempoChange?: boolean;
}

const AccessiblePulse: React.FC<AccessiblePulseProps> = ({
  initialTempo = 72,
  allowTempoChange = false,
}) => {
  const [modality, setModality] = useState<LearningModality>('visual');
  const [tempo, setTempo] = useState(() => getStoredTempo(initialTempo));
  const [running, setRunning] = useState(false);
  const [pulseOn, setPulseOn] = useState(false);
  const [volume, setVolume] = useState(35);
  const [announcement, setAnnouncement] = useState('Pulso parado. Sinal visual disponível; som desligado.');
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  const visualEnabled = modality !== 'auditory';
  const audioEnabled = modality !== 'visual';

  const playClick = useCallback(() => {
    const context = audioContextRef.current;
    if (!context || !audioEnabled || context.state !== 'running') return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.frequency.setValueAtTime(760, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.006, (volume / 100) * 0.055), now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.085);
  }, [audioEnabled, volume]);

  const beat = useCallback(() => {
    setPulseOn(true);
    window.setTimeout(() => setPulseOn(false), Math.min(150, (60_000 / tempo) * 0.3));
    playClick();
  }, [playClick, tempo]);

  useEffect(() => {
    if (!running) return undefined;
    beat();
    intervalRef.current = window.setInterval(beat, 60_000 / tempo);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [beat, running, tempo]);

  useEffect(() => () => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    void audioContextRef.current?.close();
  }, []);

  const ensureAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  const selectModality = async (next: LearningModality) => {
    if (next !== 'visual') await ensureAudioContext();
    setModality(next);
    setAnnouncement(
      next === 'visual'
        ? 'Rota visual selecionada. O som está desligado.'
        : next === 'auditory'
          ? 'Rota sonora selecionada. Ajuste o volume do aparelho para um nível confortável.'
          : 'Rotas visual e sonora selecionadas. Ajuste o volume do aparelho para um nível confortável.',
    );
  };

  const toggleRunning = async () => {
    if (!running && audioEnabled) await ensureAudioContext();
    setRunning(value => !value);
    setAnnouncement(running ? 'Pulso pausado.' : `Pulso iniciado em ${tempo} batidas por minuto.`);
  };

  const updateTempo = (nextTempo: number) => {
    const clamped = clampTempo(nextTempo);
    setTempo(clamped);
    window.localStorage.setItem(LAST_TEMPO_KEY, String(clamped));
    setAnnouncement(`Velocidade ajustada para ${clamped} batidas por minuto.`);
  };

  return (
    <section className="rounded-3xl border border-blue-500/30 bg-[#07101d]/95 p-4 shadow-[0_24px_70px_rgba(2,6,23,0.5)] sm:p-5" aria-label="Referência de pulsos">
      <p className="sr-only" aria-live="polite">{announcement}</p>

      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Escolha como perceber os pulsos">
        {([
          ['visual', 'Visual'],
          ['auditory', 'Som'],
          ['combined', 'Os dois'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={modality === id}
            onClick={() => void selectModality(id)}
            className={`min-h-12 rounded-xl border px-2 text-xs font-black uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
              modality === id
                ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100'
                : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-blue-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex min-h-40 items-center justify-center rounded-3xl border border-blue-950 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18),rgba(2,6,23,0.92)_62%)]">
        {visualEnabled ? (
          <div
            aria-hidden="true"
            className={`h-20 w-20 rounded-full border-4 transition-all duration-100 motion-reduce:transition-none ${
              pulseOn
                ? 'scale-125 border-cyan-200 bg-cyan-300 shadow-[0_0_48px_rgba(103,232,249,0.72)]'
                : 'scale-100 border-blue-400 bg-blue-600/40 shadow-[0_0_20px_rgba(37,99,235,0.28)]'
            }`}
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-950/30" aria-hidden="true">
            <span className="text-3xl">♪</span>
          </div>
        )}
      </div>

      {audioEnabled && (
        <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-950/20 p-3">
          <p className="text-xs font-bold leading-relaxed text-amber-100">
            O som só começa quando você aciona o pulso. Ajuste o volume do aparelho para um nível confortável.
          </p>
          <label className="mt-3 block text-xs font-black uppercase tracking-wide text-amber-200" htmlFor="ga-pulse-volume">
            Volume interno: {volume}%
          </label>
          <input
            id="ga-pulse-volume"
            type="range"
            min="10"
            max="70"
            step="5"
            value={volume}
            onChange={event => setVolume(Number(event.target.value))}
            aria-valuetext={`${volume} por cento; ajuste também o volume do aparelho`}
            className="mt-2 w-full accent-amber-300"
          />
        </div>
      )}

      {allowTempoChange && (
        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => updateTempo(tempo - 8)}
              aria-label="Deixar o pulso mais lento"
              className="h-11 w-11 rounded-xl border border-slate-600 text-xl font-black text-slate-100 hover:border-cyan-300"
            >
              −
            </button>
            <div className="text-center">
              <p className="text-3xl font-black text-white">{tempo}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">BPM · sua escolha</p>
            </div>
            <button
              type="button"
              onClick={() => updateTempo(tempo + 8)}
              aria-label="Deixar o pulso mais rápido"
              className="h-11 w-11 rounded-xl border border-slate-600 text-xl font-black text-slate-100 hover:border-cyan-300"
            >
              +
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => void toggleRunning()}
        className={`mt-4 min-h-12 w-full rounded-xl px-5 text-sm font-black uppercase tracking-[0.15em] text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
          running ? 'bg-slate-700 hover:bg-slate-600' : 'bg-blue-600 shadow-lg shadow-blue-950/40 hover:bg-blue-500'
        }`}
      >
        {running ? 'Pausar pulsos' : 'Iniciar pulsos'}
      </button>
    </section>
  );
};

export default AccessiblePulse;
