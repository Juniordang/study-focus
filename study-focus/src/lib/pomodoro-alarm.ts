let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;

  audioContext ??= new AudioContext();
  return audioContext;
};

export const unlockPomodoroAlarm = async () => {
  const context = getAudioContext();
  if (!context || context.state !== "suspended") return;

  await context.resume();
};

const playTone = (
  context: AudioContext,
  frequency: number,
  startsAt: number,
  duration: number,
) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startsAt);

  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.6, startsAt + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startsAt);
  oscillator.stop(startsAt + duration + 0.04);
};

export const playPomodoroAlarm = async () => {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    await context.resume();
  }

  const now = context.currentTime;
  const notes = [880, 1174.66, 880];

  notes.forEach((frequency, index) => {
    playTone(context, frequency, now + index * 0.32, 0.22);
  });
};
