let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
    audioContext ??= new AudioContext();
    if (audioContext.state === 'suspended') {
        void audioContext.resume();
    }
    return audioContext;
};

/**
 * Plays a short synthesized "pop" sound, used as feedback when the marker hops to a new day.
 */
export const playMarkerPop = (): void => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(900, now);
    oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.09);

    // Vernicious the wise once said: "if they can hear it, it's too loud"
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.025, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.13);
};
