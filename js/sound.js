// ============================================================
// CODEX SOUND ENGINE (Synthesized via Web Audio API)
// Zero external assets required, instant 0ms latency, high fidelity
// ============================================================

class CodexSoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = localStorage.getItem('codex_sound_muted') === 'true';
        this.initOnFirstInteraction = this.initOnFirstInteraction.bind(this);
        
        // Listen to first user gesture to unlock AudioContext (browser policy)
        ['click', 'touchstart', 'keydown'].forEach(evt => {
            window.addEventListener(evt, this.initOnFirstInteraction, { once: true, passive: true });
        });
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    initOnFirstInteraction() {
        this.initContext();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('codex_sound_muted', this.isMuted);
        if (!this.isMuted) {
            this.playTabClick();
        }
        return this.isMuted;
    }

    // Realistic paper rustle sound when a page flips
    playPageFlip() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const duration = 0.38;

        // White/Pink noise buffer
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Pinkish-brown filter for organic paper texture
            data[i] = (lastOut + (0.04 * white)) / 1.04;
            lastOut = data[i];
            data[i] *= (1 - (i / bufferSize) * 0.7); // gentle slope
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Bandpass filter simulating air and parchment friction
        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(1400, now);
        bandpass.frequency.exponentialRampToValueAtTime(3200, now + duration * 0.4);
        bandpass.frequency.exponentialRampToValueAtTime(800, now + duration);
        bandpass.Q.setValueAtTime(1.8, now);

        // Highpass to eliminate dull thuds
        const highpass = this.ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(400, now);

        // Amplitude Envelope (ADSR)
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.28, now + 0.06);
        gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        noise.connect(bandpass);
        bandpass.connect(highpass);
        highpass.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);

        // Subtle crisp paper fiber snap at release
        setTimeout(() => {
            if (this.isMuted || !this.ctx) return;
            const snapTime = this.ctx.currentTime;
            const snapOsc = this.ctx.createOscillator();
            const snapGain = this.ctx.createGain();
            snapOsc.type = 'triangle';
            snapOsc.frequency.setValueAtTime(850, snapTime);
            snapOsc.frequency.exponentialRampToValueAtTime(120, snapTime + 0.04);
            snapGain.gain.setValueAtTime(0.08, snapTime);
            snapGain.gain.exponentialRampToValueAtTime(0.001, snapTime + 0.04);
            snapOsc.connect(snapGain);
            snapGain.connect(this.ctx.destination);
            snapOsc.start(snapTime);
            snapOsc.stop(snapTime + 0.04);
        }, 120);
    }

    // Heavy wax stamp seal impact sound
    playWaxSeal() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        // Deep resonance thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);

        // Sizzle / mechanical click
        const sizzle = this.ctx.createOscillator();
        const sizzleGain = this.ctx.createGain();
        sizzle.type = 'triangle';
        sizzle.frequency.setValueAtTime(2400, now);
        sizzle.frequency.exponentialRampToValueAtTime(400, now + 0.12);

        sizzleGain.gain.setValueAtTime(0.15, now);
        sizzleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        sizzle.connect(sizzleGain);
        sizzleGain.connect(this.ctx.destination);
        sizzle.start(now);
        sizzle.stop(now + 0.12);
    }

    // Crisp bookmark tab click
    playTabClick() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Delicate hover tone
    playHover() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(3200, now);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
    }
}

window.codexAudio = new CodexSoundEngine();
