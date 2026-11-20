let audioContext;

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function playTone(context, { frequency, duration, type, gain, detune = 0 }) {
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.detune.setValueAtTime(detune, now);

  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(gain, now + 0.004);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(envelope);
  envelope.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function playNoise(context, { duration, gain, filterFrequency, resonance = 1.2 }) {
  const now = context.currentTime;
  const frameCount = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const samples = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    samples[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();

  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(filterFrequency, now);
  filter.Q.setValueAtTime(resonance, now);

  envelope.gain.setValueAtTime(gain, now);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(context.destination);
  source.start(now);
  source.stop(now + duration + 0.02);
}

export function playLaunchSound() {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  playTone(context, { frequency: 2100, duration: 0.16, type: "sine", gain: 0.16 });
  playTone(context, { frequency: 3150, duration: 0.11, type: "triangle", gain: 0.08, detune: 8 });
  playTone(context, { frequency: 4300, duration: 0.07, type: "sine", gain: 0.04 });
}

export function playLandingSound() {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  playTone(context, { frequency: 1180, duration: 0.13, type: "sine", gain: 0.14 });
  playTone(context, { frequency: 1770, duration: 0.1, type: "sine", gain: 0.09, detune: 12 });
  playTone(context, {
    frequency: 2630,
    duration: 0.075,
    type: "triangle",
    gain: 0.06,
    detune: -18,
  });
  playTone(context, { frequency: 3980, duration: 0.05, type: "sine", gain: 0.035 });
  playNoise(context, {
    duration: 0.05,
    gain: 0.07,
    filterFrequency: 5200,
    resonance: 5,
  });
}
