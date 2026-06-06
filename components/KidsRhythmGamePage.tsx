import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getKidsTheme } from '../utils/ecosystemPreferences';

const navigateTo = (path: string) => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('ga-route-change'));
};

type KidsRhythmSong = {
  id: string;
  title: string;
  bpm: number;
  beats: number[];
  duration: number;
};

type FallingBeat = {
  id: string;
  icon: string;
  spawnTime: number;
  targetTime: number;
  position: number;
  hit: boolean;
  accuracy?: 'perfect' | 'good' | 'ok';
};

const SONGS: KidsRhythmSong[] = [
  {
    id: 'twinkle',
    title: 'Brilha Brilha Estrelinha',
    bpm: 60,
    beats: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44],
    duration: 48,
  },
  {
    id: 'birthday',
    title: 'Parabéns pra Você',
    bpm: 72,
    beats: [0, 3, 6, 9, 12, 15, 18, 21, 24, 27],
    duration: 30,
  },
  {
    id: 'atirei',
    title: 'Atirei o Pau no Gato',
    bpm: 80,
    beats: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
    duration: 24,
  },
  {
    id: 'butterfly',
    title: 'Borboletinha',
    bpm: 65,
    beats: [0, 4, 8, 12, 16, 20, 24, 28],
    duration: 32,
  },
  {
    id: 'ciranda',
    title: 'Ciranda Cirandinha',
    bpm: 70,
    beats: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36],
    duration: 40,
  },
  {
    id: 'cabeca',
    title: 'Cabeça Ombro Joelho e Pé',
    bpm: 75,
    beats: [0, 3, 6, 9, 12, 15, 18, 21, 24],
    duration: 27,
  },
  {
    id: 'rua',
    title: 'Se Essa Rua Fosse Minha',
    bpm: 68,
    beats: [0, 4, 8, 12, 16, 20, 24, 28],
    duration: 32,
  },
  {
    id: 'marcha',
    title: 'Marcha Soldado',
    bpm: 82,
    beats: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18],
    duration: 20,
  },
];

const BEAT_ICONS = ['🎸', '⭐', '🎵', '🎶', '🌟', '🎹'];

const POSITIVE_FEEDBACK = [
  { text: '🌟 Boa!', color: 'text-emerald-500' },
  { text: '✨ Demais!', color: 'text-amber-500' },
  { text: '🎵 Incrível!', color: 'text-cyan-500' },
  { text: '🎸 Perfeito!', color: 'text-violet-500' },
  { text: '⭐ Show!', color: 'text-pink-500' },
  { text: '🎶 Mandou bem!', color: 'text-lime-500' },
];

const NOTES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
};

// Melodias reais de cada música
const SONG_MELODIES: Record<string, number[]> = {
  twinkle: [NOTES.C4, NOTES.C4, NOTES.G4, NOTES.G4, NOTES.A4, NOTES.A4, NOTES.G4, NOTES.F4, NOTES.F4, NOTES.E4, NOTES.E4, NOTES.D4],
  birthday: [NOTES.G4, NOTES.G4, NOTES.A4, NOTES.G4, NOTES.C5, NOTES.B4, NOTES.G4, NOTES.G4, NOTES.A4, NOTES.G4],
  atirei: [NOTES.C4, NOTES.D4, NOTES.E4, NOTES.C4, NOTES.C4, NOTES.D4, NOTES.E4, NOTES.C4, NOTES.E4, NOTES.F4, NOTES.G4, NOTES.G4],
  butterfly: [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.E4, NOTES.C4, NOTES.E4, NOTES.G4, NOTES.E4],
  ciranda: [NOTES.C4, NOTES.D4, NOTES.E4, NOTES.G4, NOTES.A4, NOTES.G4, NOTES.E4, NOTES.D4, NOTES.C4, NOTES.C4],
  cabeca: [NOTES.C4, NOTES.C4, NOTES.C4, NOTES.D4, NOTES.E4, NOTES.E4, NOTES.E4, NOTES.F4, NOTES.G4],
  rua: [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.A4, NOTES.G4, NOTES.E4, NOTES.C4, NOTES.D4],
  marcha: [NOTES.C4, NOTES.C4, NOTES.E4, NOTES.E4, NOTES.G4, NOTES.G4, NOTES.E4, NOTES.E4, NOTES.C4, NOTES.C4],
};

const KidsRhythmGamePage: React.FC = () => {
  const [theme] = useState(() => getKidsTheme());
  const [selectedSong, setSelectedSong] = useState<KidsRhythmSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fallingBeats, setFallingBeats] = useState<FallingBeat[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('text-emerald-500');
  const [characterHit, setCharacterHit] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const beatSpawnIntervalRef = useRef<number | null>(null);
  const fallingBeatsRef = useRef<FallingBeat[]>([]);
  const beatIndexRef = useRef(0);
  const startTimeRef = useRef(0);
  const currentMelodyRef = useRef<number[]>([]);

  const isLight = theme === 'light';
  const travelTimeMs = 3000;

  const playHappyNote = useCallback((frequency: number, volume = 0.3) => {
    const ctx = audioContextRef.current;
    if (!ctx) {
      console.log('AudioContext não existe');
      return;
    }
    console.log('tocando nota', frequency);

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(frequency * 2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(volume * 0.3, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(ctx.destination);
    gain2.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.5);
    osc2.stop(now + 0.4);
  }, []);

  const playSuccessSound = useCallback(() => {
    playHappyNote(NOTES.C4, 0.3);
    setTimeout(() => playHappyNote(NOTES.E4, 0.3), 50);
    setTimeout(() => playHappyNote(NOTES.G4, 0.3), 100);
  }, [playHappyNote]);

  const spawnBeat = useCallback((playSound = true) => {
    if (!audioContextRef.current) return;

    const now = (Date.now() - startTimeRef.current) / 1000;
    const icon = BEAT_ICONS[Math.floor(Math.random() * BEAT_ICONS.length)];

    const beat: FallingBeat = {
      id: `${now}-${Math.random()}`,
      icon,
      spawnTime: now,
      targetTime: now + travelTimeMs / 1000,
      position: 0,
      hit: false,
    };

    // Tocar nota da melodia da música escolhida
    if (playSound && currentMelodyRef.current.length > 0) {
      const noteIndex = beatIndexRef.current % currentMelodyRef.current.length;
      const note = currentMelodyRef.current[noteIndex];
      playHappyNote(note, 0.25);
    }

    setFallingBeats((prev) => [...prev, beat]);
  }, [travelTimeMs, playHappyNote]);

  const handleClick = useCallback(() => {
    if (!isPlaying || gameCompleted) return;
    if (!audioContextRef.current) return;

    const now = (Date.now() - startTimeRef.current) / 1000;

    console.log('🎯 handleClick - now:', now.toFixed(3));
    console.log('📊 Beats disponíveis:', fallingBeatsRef.current.map(b => `${b.icon} pos=${b.position.toFixed(1)}% hit=${b.hit}`));

    const candidate = fallingBeatsRef.current
      .filter((b) => !b.hit && b.position >= 65 && b.position <= 85)
      .sort((a, b) => Math.abs(75 - a.position) - Math.abs(75 - b.position))[0];

    console.log('✅ candidate:', candidate ? `${candidate.icon} pos=${candidate.position.toFixed(1)}% target=${candidate.targetTime.toFixed(3)}` : 'NENHUM');

    if (!candidate) {
      console.log('❌ Nenhum beat na hit zone (65-85%)');
      return;
    }

    const timeDiff = Math.abs(now - candidate.targetTime) * 1000;
    const positionDiff = Math.abs(75 - candidate.position);

    console.log('⏱️  timeDiff:', timeDiff.toFixed(1), 'ms | positionDiff:', positionDiff.toFixed(1), '%');

    // Usar APENAS position check - mais confiável que time
    let accuracy: 'perfect' | 'good' | 'ok';
    let points: number;

    if (positionDiff <= 3) {
      accuracy = 'perfect';
      points = 10;
    } else if (positionDiff <= 7) {
      accuracy = 'good';
      points = 7;
    } else {
      accuracy = 'ok';
      points = 5;
    }

    console.log('🎵 HIT registrado!', accuracy, points, 'pts');

    setFallingBeats((prev) =>
      prev.map((b) => (b.id === candidate.id ? { ...b, hit: true, accuracy } : b))
    );

    // Som de acerto removido para não atrapalhar a melodia da música
    // playSuccessSound();

    setScore((prev) => prev + points);
    setCombo((prev) => prev + 1);
    setTotalHits((prev) => prev + 1);

    const randomFeedback = POSITIVE_FEEDBACK[Math.floor(Math.random() * POSITIVE_FEEDBACK.length)];
    setFeedback(randomFeedback.text);
    setFeedbackColor(randomFeedback.color);

    setCharacterHit(true);
    setTimeout(() => setCharacterHit(false), 300);

    setTimeout(() => setFeedback(''), 1500);
  }, [isPlaying, gameCompleted, playSuccessSound]);

  const enableAudio = useCallback(() => {
    console.log('Ativando áudio...');
    // Criar AudioContext diretamente no click
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    audioContextRef.current = new AudioCtx();
    console.log('AudioContext criado, state:', audioContextRef.current.state);

    // Tocar nota de teste AUDÍVEL para confirmar que funciona
    playHappyNote(NOTES.A4, 0.5);

    setAudioReady(true);
  }, [playHappyNote]);

  const startSong = useCallback((song: KidsRhythmSong) => {
    if (!audioContextRef.current) return;

    startTimeRef.current = Date.now();

    console.log('🎵 Iniciando música:', song.title);

    // Carregar melodia específica da música
    currentMelodyRef.current = SONG_MELODIES[song.id] || [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.A4];

    setSelectedSong(song);
      setIsPlaying(true);
      setFallingBeats([]);
      setScore(0);
      setCombo(0);
      setTotalHits(0);
      setFeedback('');
      setGameCompleted(false);
      beatIndexRef.current = 0;

      const beatInterval = (60 / song.bpm) * 1000;

      const spawnLoop = window.setInterval(() => {
        if (beatIndexRef.current < song.beats.length) {
          void spawnBeat();
          beatIndexRef.current++;
        } else {
          clearInterval(spawnLoop);
          setTimeout(() => {
            setIsPlaying(false);
            setGameCompleted(true);
            setFeedback('🏆 Você completou a música!');
            setFeedbackColor('text-emerald-500');
          }, travelTimeMs + 2000);
        }
      }, beatInterval);

      beatSpawnIntervalRef.current = spawnLoop;
  }, [spawnBeat, travelTimeMs]);

  const stopSong = useCallback(() => {
    if (beatSpawnIntervalRef.current) {
      clearInterval(beatSpawnIntervalRef.current);
      beatSpawnIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPlaying(false);
    setFallingBeats([]);
    setSelectedSong(null);
    setGameCompleted(false);
  }, []);

  useEffect(() => {
    fallingBeatsRef.current = fallingBeats;
  }, [fallingBeats]);

  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      if (!audioContextRef.current) return;

      const now = (Date.now() - startTimeRef.current) / 1000;

      setFallingBeats((prev) =>
        prev
          .map((beat) => {
            const elapsed = now - beat.spawnTime;
            const progress = Math.min(110, (elapsed / (travelTimeMs / 1000)) * 100);
            return { ...beat, position: progress };
          })
          .filter((beat) => beat.position <= 110)
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, travelTimeMs]);

  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleClick]);

  useEffect(() => {
    return () => {
      stopSong();
    };
  }, [stopSong]);

  return (
    <div className={`min-h-screen relative overflow-hidden p-4 md:p-8 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <main className="relative mx-auto max-w-5xl">
        <header className="mb-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-500">Guitar Architect Kids</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-tight">Toque no Tempo</h1>
          <p className={`mt-3 text-sm md:text-base font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            Toque no ritmo das músicas e veja o personagem dançar!
          </p>
        </header>

        {!audioReady && !selectedSong && (
          <div className="mb-6 max-w-md mx-auto">
            <button
              onClick={() => void enableAudio()}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xl font-black uppercase rounded-2xl border-4 border-amber-600 px-8 py-6 active:scale-95 transition-all shadow-[0_0_30px_rgba(251,191,36,0.4)] animate-pulse"
            >
              🔊 Ativar Som
            </button>
            <p className={`mt-3 text-xs text-center ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Clique para permitir sons no jogo
            </p>
          </div>
        )}

        {!selectedSong && audioReady && (
          <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {SONGS.map((song) => (
              <button
                key={song.id}
                onClick={() => void startSong(song)}
                className={`rounded-2xl border p-4 transition-all hover:scale-105 ${
                  isLight ? 'border-emerald-300 bg-white hover:border-emerald-500' : 'border-emerald-600/70 bg-emerald-950/70 hover:border-emerald-400'
                }`}
              >
                <p className={`font-black uppercase text-sm ${isLight ? 'text-emerald-800' : 'text-emerald-200'}`}>{song.title}</p>
                <p className={`mt-1 text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{song.beats.length} batidas · {song.bpm} BPM</p>
              </button>
            ))}
          </section>
        )}

        {selectedSong && (
          <section className={`rounded-3xl border p-4 md:p-6 max-w-lg mx-auto ${isLight ? 'border-emerald-200 bg-white/90' : 'border-emerald-600/70 bg-emerald-950/70'}`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-amber-500">{selectedSong.title}</p>
                <p className={`text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>{selectedSong.bpm} BPM</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black">
                  Pontos: <span className="text-emerald-500">{score}</span>
                </p>
                {combo >= 5 && (
                  <p className="text-sm font-black">
                    Combo: <span className="text-amber-500">{combo}</span> 🔥
                  </p>
                )}
              </div>
            </div>

            <div
              className="relative h-[500px] w-32 mx-auto bg-gradient-to-b from-transparent via-emerald-100/20 to-transparent border-x-2 border-emerald-300/30 rounded-2xl cursor-pointer"
              onClick={() => void handleClick()}
            >
              {fallingBeats.map((beat) => (
                <div
                  key={beat.id}
                  className={`absolute left-1/2 -translate-x-1/2 text-4xl filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] pointer-events-none transition-all ${
                    beat.hit ? 'opacity-0 scale-150' : ''
                  }`}
                  style={{
                    top: `${beat.position}%`,
                    transition: beat.hit ? 'all 0.2s ease-out' : 'none',
                  }}
                >
                  {beat.icon}
                </div>
              ))}

              <div className="absolute left-0 right-0 pointer-events-none" style={{ top: '75%', transform: 'translateY(-50%)' }}>
                <div className="h-2 bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 shadow-[0_0_20px_rgba(251,191,36,0.8)] rounded-full animate-pulse" />

                <div className={`absolute top-4 left-1/2 -translate-x-1/2 transition-transform ${characterHit ? 'scale-125' : 'scale-100'}`}>
                  <svg viewBox="0 0 100 100" className="w-20 h-20">
                    <circle cx="50" cy="50" r="35" fill="#34d399" />
                    <circle cx="40" cy="42" r="4" fill="#000" />
                    <circle cx="60" cy="42" r="4" fill="#000" />
                    <path d="M35 60 Q50 70 65 60" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <circle cx="30" cy="35" r="3" fill="#fbbf24" />
                    <circle cx="70" cy="35" r="3" fill="#fbbf24" />
                  </svg>
                  {characterHit && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-ping">✨</div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => void handleClick()}
              disabled={!isPlaying || gameCompleted}
              className="mt-6 w-full h-20 bg-amber-500 hover:bg-amber-400 text-white text-xl font-black uppercase rounded-2xl border-4 border-amber-600 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              TOQUE AQUI!
            </button>

            {feedback && (
              <div className={`mt-4 text-center text-2xl font-black ${feedbackColor} animate-in fade-in zoom-in duration-300`}>
                {feedback}
              </div>
            )}

            {gameCompleted && (
              <div className={`mt-4 rounded-2xl border p-4 ${isLight ? 'border-emerald-300 bg-emerald-50' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  Total de acertos: {totalHits} de {selectedSong.beats.length}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              {gameCompleted && (
                <button
                  onClick={() => void startSong(selectedSong)}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-white rounded-xl border-4 border-amber-600 px-4 py-3 text-sm font-black uppercase active:scale-95 transition-transform"
                >
                  🔄 Tocar de Novo
                </button>
              )}
              <button
                onClick={stopSong}
                className={`w-full rounded-xl border px-4 py-3 text-xs font-black uppercase ${
                  isLight ? 'border-slate-300 bg-white hover:border-emerald-400' : 'border-zinc-700 bg-zinc-950 hover:border-emerald-500'
                }`}
              >
                Escolher Outra Música
              </button>
            </div>
          </section>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => navigateTo('/kids/games')}
            className="rounded-xl border border-emerald-500 bg-emerald-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-emerald-500"
          >
            Voltar aos Jogos
          </button>
          <button
            onClick={() => navigateTo('/kids')}
            className={`rounded-xl border px-5 py-3 text-xs font-black uppercase ${
              isLight ? 'border-slate-300 bg-white hover:border-emerald-400' : 'border-zinc-700 bg-zinc-950 hover:border-emerald-500'
            }`}
          >
            Voltar ao Kids
          </button>
        </div>

        <div className={`mt-6 max-w-2xl mx-auto text-center text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
          <p>
            💡 Para pais e educadores: nesta atividade a criança aprende a sentir o pulso musical clicando no momento certo. Toque no botão ou pressione ESPAÇO quando os símbolos chegarem à linha colorida.
          </p>
        </div>
      </main>
    </div>
  );
};

export default KidsRhythmGamePage;
