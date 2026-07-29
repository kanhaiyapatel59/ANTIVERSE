// Web Audio API procedural cinematic space sound generator
class SpaceAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.initialized = false;
    this.droneOsc = null;
    this.subOsc = null;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn("AudioContext not supported or blocked", e);
    }
  }

  startCinematicAudio() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    // Deep Sub Bass Drone (Deep Space Ambience)
    this.subOsc = this.ctx.createOscillator();
    const subFilter = this.ctx.createBiquadFilter();
    const subGain = this.ctx.createGain();

    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(45, now);
    this.subOsc.frequency.exponentialRampToValueAtTime(32, now + 3.2);

    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(120, now);

    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.exponentialRampToValueAtTime(0.35, now + 1.2);
    subGain.gain.exponentialRampToValueAtTime(0.1, now + 3.2);

    this.subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.masterGain);
    this.subOsc.start(now);
    this.subOsc.stop(now + 3.5);

    // Cosmic Sweep / Atmospheric Dive Whoosh
    const bufferSize = this.ctx.sampleRate * 3.2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(1200, now + 2.5);
    noiseFilter.frequency.exponentialRampToValueAtTime(300, now + 3.2);
    noiseFilter.Q.setValueAtTime(3, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.18, now + 2.2);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 3.2);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    whiteNoise.start(now);
  }

  playHudBeep() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

export const spaceAudio = new SpaceAudioEngine();
