// ============================================================================
// SOUND MANAGER — synthesized audio (no asset files needed).
//
// We use the Web Audio API directly: every "sample" is built from oscillators
// and gain envelopes. This keeps the bundle dependency-free at the cost of
// some setup code per instrument.
//
// Public API (named exports):
//   initAudio(), toggleMusic()
//   playSFX(freq, dur, type, vol)
//   playNote(noteIdx)        — rising scale on note pickup
//   playRecruit()            — three-note recruit jingle
//   playInstrument(animalIdx, freq, vel, when)
//   playMusicChord()         — full A-minor chord with all four animals
//   wakeUpAudioContext()     — resume the ctx after user gesture (autoplay)
// ============================================================================

import { CONFIG }      from '../config.js';
import { ANIMAL_DATA } from '../data/animals.js';

let audioCtx        = null;
let musicEnabled    = true;
let musicGain       = null;
let musicScheduler  = null;
let nextNoteTime    = 0;
let beatIndex       = 0;

export function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    musicGain = audioCtx.createGain();
    musicGain.gain.value = CONFIG.MUSIC_VOLUME_ON;
    musicGain.connect(audioCtx.destination);
    startMusicLoop();
    document.getElementById('audioBtn').classList.add('show');
  } catch (e) {
    console.warn('Audio init failed', e);
  }
}

/** Resume the AudioContext if the browser parked it (autoplay policy). */
export function wakeUpAudioContext() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

/** A short percussive blip. Used for UI feedback and combat hits. */
export function playSFX(freq, dur = 0.18, type = 'triangle', vol = 0.12) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.connect(g); g.connect(audioCtx.destination);
  const t = audioCtx.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o.stop(t + dur + 0.05);
}

const NOTE_FREQS = [523.25, 587.33, 659.25, 783.99, 880];

export function playNote(idx) {
  playSFX(NOTE_FREQS[idx % NOTE_FREQS.length], 0.22, 'triangle', 0.10);
}

export function getNoteFreq(idx) {
  return NOTE_FREQS[idx % NOTE_FREQS.length];
}

export function playRecruit() {
  playSFX(523.25, 0.14, 'triangle', 0.10);
  setTimeout(() => playSFX(659.25, 0.14, 'triangle', 0.10), 80);
  setTimeout(() => playSFX(783.99, 0.22, 'triangle', 0.10), 160);
}

// === Per-animal instrument synth ===
export function playInstrument(animalIdx, freq, vel = 0.8, when) {
  if (!audioCtx) return;
  if (when == null) when = audioCtx.currentTime;
  const data = ANIMAL_DATA[animalIdx];
  const type = data.instrument.type;

  if (type === 'drum') {
    // Bass kick: very low, sharp decay, with a click
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(120, when);
    o.frequency.exponentialRampToValueAtTime(40, when + 0.15);
    o.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vel * 0.5, when + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.25);
    o.start(when); o.stop(when + 0.3);
    // Click
    const click = audioCtx.createOscillator();
    const cg = audioCtx.createGain();
    click.type = 'square';
    click.frequency.value = 300;
    click.connect(cg); cg.connect(audioCtx.destination);
    cg.gain.setValueAtTime(vel * 0.15, when);
    cg.gain.exponentialRampToValueAtTime(0.001, when + 0.03);
    click.start(when); click.stop(when + 0.04);
  } else if (type === 'lute') {
    // Plucked string with low-pass
    const o1 = audioCtx.createOscillator();
    const o2 = audioCtx.createOscillator();
    const g  = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, when);
    filter.frequency.exponentialRampToValueAtTime(700, when + 0.4);
    o1.type = 'triangle'; o2.type = 'sine';
    o1.frequency.value = freq; o2.frequency.value = freq * 2;
    o1.connect(filter); o2.connect(filter); filter.connect(g);
    g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vel * 0.4, when + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.6);
    o1.start(when); o2.start(when);
    o1.stop(when + 0.7); o2.stop(when + 0.7);
  } else if (type === 'violin') {
    // Sustained violin: slow attack, vibrato
    const o  = audioCtx.createOscillator();
    const o2 = audioCtx.createOscillator();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    const g  = audioCtx.createGain();
    o.type = 'sawtooth';
    o2.type = 'sawtooth';
    o.frequency.value  = freq;
    o2.frequency.value = freq * 1.005; // slight detune
    lfo.frequency.value = 5;
    lfoGain.gain.value = freq * 0.008;
    lfo.connect(lfoGain);
    lfoGain.connect(o.frequency);
    lfoGain.connect(o2.frequency);
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2400;
    o.connect(filter); o2.connect(filter); filter.connect(g);
    g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vel * 0.18, when + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.7);
    o.start(when); o2.start(when); lfo.start(when);
    o.stop(when + 0.8); o2.stop(when + 0.8); lfo.stop(when + 0.8);
  } else if (type === 'flute') {
    // Pure flute-like: sine + breath
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = freq * 2;
    o.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vel * 0.25, when + 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.5);
    o.start(when); o.stop(when + 0.55);
  }
}

/** All four animals play together — A-minor chord. Used for "play music" attack. */
export function playMusicChord() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const A_MINOR = [220, 261.63, 329.63, 440, 523.25, 659.25];
  // Donkey: bass drum hit
  playInstrument(0, 110, 0.9, t);
  // Dog: lute chord
  playInstrument(1, A_MINOR[3], 0.7, t + 0.04);
  // Cat: violin sustain
  playInstrument(2, A_MINOR[4], 0.8, t + 0.08);
  // Rooster: flute high
  playInstrument(3, A_MINOR[5], 0.7, t + 0.12);
  // Add another beat to give weight
  setTimeout(() => {
    if (!audioCtx) return;
    const t2 = audioCtx.currentTime;
    playInstrument(0, 110, 0.7, t2);
    playInstrument(1, A_MINOR[2], 0.6, t2 + 0.03);
    playInstrument(2, A_MINOR[5], 0.6, t2 + 0.06);
    playInstrument(3, A_MINOR[5] * 1.5, 0.6, t2 + 0.09);
  }, 300);
}

// === Lute background music: A minor pattern ===
const A_MINOR_PATTERN = [
  [220, 0.7], [330, 0.5], [440, 0.5], [330, 0.3],
  [261.63, 0.7], [329.63, 0.5], [392, 0.5], [329.63, 0.3],
  [220, 0.7], [349.23, 0.5], [440, 0.5], [349.23, 0.3],
  [261.63, 0.7], [329.63, 0.5], [392, 0.5], [440, 0.5],
];
const SIXTEENTH = 60 / CONFIG.BPM / 4;

function pluck(freq, vel, when) {
  if (!audioCtx || !musicGain) return;
  const o1 = audioCtx.createOscillator();
  const o2 = audioCtx.createOscillator();
  const g  = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2200, when);
  filter.frequency.exponentialRampToValueAtTime(800, when + 0.4);
  o1.type = 'triangle';
  o2.type = 'sine';
  o1.frequency.value = freq;
  o2.frequency.value = freq * 2;
  o1.connect(filter); o2.connect(filter);
  filter.connect(g);
  g.connect(musicGain);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vel * 0.55, when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.6);
  o1.start(when); o2.start(when);
  o1.stop(when + 0.7); o2.stop(when + 0.7);
}

function startMusicLoop() {
  if (!audioCtx) return;
  nextNoteTime = audioCtx.currentTime + 0.1;
  beatIndex = 0;
  if (musicScheduler) clearInterval(musicScheduler);
  musicScheduler = setInterval(() => {
    if (!audioCtx || !musicEnabled) return;
    while (nextNoteTime < audioCtx.currentTime + 0.2) {
      const cell = A_MINOR_PATTERN[beatIndex % A_MINOR_PATTERN.length];
      if (cell) {
        pluck(cell[0], cell[1], nextNoteTime);
        if (beatIndex % 4 === 0) {
          pluck(cell[0] / 2, cell[1] * 0.7, nextNoteTime);
        }
      }
      nextNoteTime += SIXTEENTH * 2;
      beatIndex++;
    }
  }, 30);
}

export function toggleMusic() {
  musicEnabled = !musicEnabled;
  if (musicGain) {
    musicGain.gain.value = musicEnabled ? CONFIG.MUSIC_VOLUME_ON : CONFIG.MUSIC_VOLUME_OFF;
  }
  document.getElementById('audioBtn').textContent = musicEnabled ? '♪' : '𝅘𝅥';
}
