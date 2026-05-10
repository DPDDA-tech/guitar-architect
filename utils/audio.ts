import { CHROMATIC_SCALE, normalizeNote } from '../music/musicTheory';
import type { InstrumentType } from '../types';

type AudioContextConstructor = typeof AudioContext;

const NOTE_MIDI: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11
};

const DEFAULT_OPEN_MIDI: Record<InstrumentType, number[]> = {
  'guitar-6': [64, 59, 55, 50, 45, 40],
  'guitar-7': [64, 59, 55, 50, 45, 40, 35],
  'guitar-8': [64, 59, 55, 50, 45, 40, 35, 30],
  'bass-4': [43, 38, 33, 28],
  'bass-5': [43, 38, 33, 28, 23]
};

let sharedContext: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!sharedContext) sharedContext = new AudioCtor();
  return sharedContext;
};

const midiToFrequency = (midi: number) => 440 * (2 ** ((midi - 69) / 12));

export const getOpenStringMidi = (instrumentType: InstrumentType, tuning: string[], stringIndex: number) => {
  const fallbackMidi = DEFAULT_OPEN_MIDI[instrumentType]?.[stringIndex] ?? DEFAULT_OPEN_MIDI['guitar-6'][Math.min(stringIndex, 5)];
  const targetPitch = NOTE_MIDI[normalizeNote(tuning[stringIndex] || '')];
  if (targetPitch === undefined) return fallbackMidi;

  const baseOctave = Math.floor(fallbackMidi / 12);
  const candidates = [baseOctave - 1, baseOctave, baseOctave + 1]
    .map(octave => octave * 12 + targetPitch)
    .filter(midi => midi >= 12 && midi <= 108);

  return candidates.reduce((best, midi) => Math.abs(midi - fallbackMidi) < Math.abs(best - fallbackMidi) ? midi : best, candidates[0] ?? fallbackMidi);
};

export const getFrequencyForPosition = (instrumentType: InstrumentType, tuning: string[], stringIndex: number, fret: number) => {
  const midi = getOpenStringMidi(instrumentType, tuning, stringIndex) + fret;
  return midiToFrequency(midi);
};

export const getFrequencyForNoteName = (note: string, octave = 4) => {
  const pitch = NOTE_MIDI[normalizeNote(note)];
  if (pitch === undefined || !CHROMATIC_SCALE.includes(normalizeNote(note))) return 440;
  return midiToFrequency((octave + 1) * 12 + pitch);
};

export const playFrequencies = async (frequencies: number[], options?: { duration?: number; stagger?: number; volume?: number }) => {
  const context = getAudioContext();
  if (!context || frequencies.length === 0) return false;
  if (context.state === 'suspended') await context.resume();

  const duration = options?.duration ?? 0.85;
  const stagger = options?.stagger ?? 0;
  const volume = Math.min(0.12, options?.volume ?? 0.08);
  const now = context.currentTime;

  frequencies.forEach((frequency, index) => {
    const start = now + index * stagger;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume / Math.sqrt(frequencies.length), start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  });

  return true;
};

export const playSingleNote = (frequency: number) => playFrequencies([frequency], { duration: 0.55, volume: 0.075 });

export const playChord = (frequencies: number[]) => (
  playFrequencies([...new Set(frequencies.map(frequency => Math.round(frequency * 100) / 100))], {
    duration: 1.2,
    stagger: 0.018,
    volume: 0.1
  })
);
