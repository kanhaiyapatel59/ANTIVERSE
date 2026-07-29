// Multilingual Voice Command Recognition Utility (English + Hindi)

let recognition = null;

export const initVoiceRecognition = (onCommandDetected, onError) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Web Speech Recognition API is not supported in this browser.');
    if (onError) onError('Speech Recognition not supported in browser');
    return null;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US'; // Supports en-US / hi-IN recognition

  recognition.onresult = (event) => {
    const lastResultIndex = event.results.length - 1;
    const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
    console.log('🎙️ Voice Command Heard:', transcript);

    const action = parseVoiceCommand(transcript);
    if (action && onCommandDetected) {
      onCommandDetected(action, transcript);
    }
  };

  recognition.onerror = (event) => {
    console.warn('Voice recognition error:', event.error);
    if (onError) onError(event.error);
  };

  return recognition;
};

/**
 * Parses English & Hindi spoken directives into system actions
 */
export const parseVoiceCommand = (transcript) => {
  const text = transcript.toLowerCase();

  if (text.includes('thermal') || text.includes('थर्मल') || text.includes('heat')) {
    return { type: 'SWITCH_VISUAL_MODE', payload: 'thermal' };
  }
  if (text.includes('optical') || text.includes('normal view') || text.includes('rgb')) {
    return { type: 'SWITCH_VISUAL_MODE', payload: 'optical' };
  }
  if (text.includes('bounding') || text.includes('box') || text.includes('detect')) {
    return { type: 'SWITCH_VISUAL_MODE', payload: 'bounding' };
  }
  if (text.includes('export pdf') || text.includes('download report') || text.includes('पीडीएफ') || text.includes('report')) {
    return { type: 'EXPORT_PDF' };
  }
  if (text.includes('dispatch') || text.includes('send alert') || text.includes('डिस्पैच') || text.includes('whatsapp')) {
    return { type: 'DISPATCH_ALL' };
  }
  if (text.includes('weather') || text.includes('मौसम')) {
    return { type: 'NAVIGATE', payload: '/weather' };
  }
  if (text.includes('commander') || text.includes('orchestrator') || text.includes('कमांड')) {
    return { type: 'NAVIGATE', payload: '/commander' };
  }
  if (text.includes('prediction') || text.includes('surge')) {
    return { type: 'NAVIGATE', payload: '/prediction' };
  }

  return null;
};

export const startVoiceListening = () => {
  if (recognition) {
    try { recognition.start(); } catch (e) {}
  }
};

export const stopVoiceListening = () => {
  if (recognition) {
    try { recognition.stop(); } catch (e) {}
  }
};
