// Web Audio API & Speech Synthesis Utilities for Disaster Emergency Broadcasts

let activeAudioCtx = null;
let sirenOsc1 = null;
let sirenOsc2 = null;

/**
 * Plays an authentic dual-tone emergency alert siren sound effect using Web Audio API
 */
export const playEmergencySiren = (durationMs = 2500) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    if (activeAudioCtx) {
      try { activeAudioCtx.close(); } catch (e) {}
    }

    const ctx = new AudioCtx();
    activeAudioCtx = ctx;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);

    // Osc 1: Sweeping Tone
    sirenOsc1 = ctx.createOscillator();
    sirenOsc1.type = 'sawtooth';
    sirenOsc1.frequency.setValueAtTime(600, ctx.currentTime);
    sirenOsc1.frequency.linearRampToValueAtTime(1200, ctx.currentTime + (durationMs / 2000));
    sirenOsc1.frequency.linearRampToValueAtTime(600, ctx.currentTime + (durationMs / 1000));

    // Osc 2: Pulsing Low Tone
    sirenOsc2 = ctx.createOscillator();
    sirenOsc2.type = 'sine';
    sirenOsc2.frequency.setValueAtTime(440, ctx.currentTime);

    sirenOsc1.connect(gainNode);
    sirenOsc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    sirenOsc1.start();
    sirenOsc2.start();

    setTimeout(() => {
      stopEmergencySiren();
    }, durationMs);
  } catch (err) {
    console.warn('Web Audio API siren playback warning:', err);
  }
};

/**
 * Stops any playing emergency siren sound
 */
export const stopEmergencySiren = () => {
  try {
    if (sirenOsc1) { sirenOsc1.stop(); sirenOsc1.disconnect(); sirenOsc1 = null; }
    if (sirenOsc2) { sirenOsc2.stop(); sirenOsc2.disconnect(); sirenOsc2 = null; }
    if (activeAudioCtx) { activeAudioCtx.close(); activeAudioCtx = null; }
  } catch (e) {}
};

/**
 * Text-to-Speech synthesizer reading out English or Hindi broadcast text
 */
export const speakAlertText = (text, options = {}) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel(); // Stop prior speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 0.95;
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume || 1.0;

  if (options.lang) {
    utterance.lang = options.lang;
  }

  // Attempt to select an authoritative clear voice
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    let matchedVoice = null;
    if (options.lang && options.lang.startsWith('hi')) {
      matchedVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi'));
    }
    if (!matchedVoice) {
      matchedVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'));
    }
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
};

/**
 * Stops all speech synthesis & siren playback
 */
export const stopAllAudio = () => {
  stopEmergencySiren();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
