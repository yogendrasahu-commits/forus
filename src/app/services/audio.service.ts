import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioCtx: AudioContext | null = null;
  private isBgmPlaying = false;
  private bgmIntervalId: any = null;
  private customAudio: HTMLAudioElement | null = null;
  private customAudioUrl: string | null = null;

  public isMuted = false;
  public volume = 0.35; // 0 to 1

  constructor() {}

  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public unlockAudioContext(): void {
    try {
      const ctx = this.initAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) {
      // Browser autoplay policy catch
    }
  }

  // --- Web Audio Synthesized Romantic Love Song Tracks ---
  public currentTrackIndex = 0;
  public readonly trackNames = [
    '✨ Enchanted Starlight (Romantic Harp & Bells)',
    '🎹 Tum Hi Ho & Soulmate Piano (Deep Emotional Romance)',
    '🌙 Moonlit Music Box (Sweet Love Lullaby)'
  ];

  // Track 1: Cmaj9 -> Am9 -> Fmaj7 -> Gadd9 (Dreamy & Uplifting)
  private readonly track1Chords = [
    [261.63, 329.63, 392.00, 493.88, 587.33, 659.25], // Cmaj9
    [220.00, 261.63, 329.63, 392.00, 493.88, 587.33], // Am9
    [174.61, 220.00, 261.63, 329.63, 392.00, 523.25], // Fmaj7
    [196.00, 246.94, 293.66, 392.00, 440.00, 587.33]  // Gadd9
  ];

  // Track 2: Am -> F -> C -> G (Passionate Bollywood / Ballad Progression)
  private readonly track2Chords = [
    [220.00, 261.63, 329.63, 440.00, 523.25, 659.25], // Am
    [174.61, 220.00, 261.63, 349.23, 440.00, 523.25], // F
    [130.81, 196.00, 261.63, 329.63, 392.00, 523.25], // C
    [196.00, 246.94, 293.66, 392.00, 493.88, 587.33]  // G
  ];

  // Track 3: G -> D/F# -> Em -> C (Sweet Tender Music Box)
  private readonly track3Chords = [
    [392.00, 493.88, 587.33, 783.99, 987.77], // G
    [369.99, 440.00, 587.33, 739.99, 880.00], // D/F#
    [329.63, 392.00, 493.88, 659.25, 783.99], // Em
    [261.63, 329.63, 392.00, 523.25, 659.25]  // C
  ];

  public get currentTrackName(): string {
    if (this.customAudioUrl) return '🎵 Custom Uploaded Love Song';
    return this.trackNames[this.currentTrackIndex];
  }

  public get isPlaying(): boolean {
    return this.isBgmPlaying;
  }

  public toggleBgm(): boolean {
    if (this.isBgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public switchTrack(index: number): void {
    this.currentTrackIndex = index % this.trackNames.length;
    this.customAudioUrl = null;
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }
    if (this.isBgmPlaying) {
      this.stopBgm();
      this.startBgm();
    }
  }

  public nextTrack(): void {
    this.switchTrack((this.currentTrackIndex + 1) % this.trackNames.length);
  }

  public startBgm(): void {
    if (this.customAudioUrl && this.customAudio) {
      this.customAudio.volume = this.volume;
      this.customAudio.play().then(() => {
        this.isBgmPlaying = true;
      }).catch(err => console.warn('Audio playback error', err));
      return;
    }

    try {
      this.initAudioContext();
      this.isBgmPlaying = true;
      let chordIndex = 0;

      const getActiveChords = () => {
        if (this.currentTrackIndex === 1) return this.track2Chords;
        if (this.currentTrackIndex === 2) return this.track3Chords;
        return this.track1Chords;
      };

      const playCurrentChord = () => {
        if (!this.isBgmPlaying || this.isMuted) return;
        const chords = getActiveChords();
        const notes = chords[chordIndex % chords.length];
        
        // Gentle acoustic arpeggiated chime
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            if (this.isBgmPlaying && !this.isMuted) {
              const waveType = this.currentTrackIndex === 2 ? 'triangle' : 'sine';
              this.playTone(freq, 2.8, waveType, 0.12 * this.volume);
            }
          }, idx * 380);
        });

        chordIndex = (chordIndex + 1) % chords.length;
      };

      playCurrentChord();
      this.bgmIntervalId = setInterval(playCurrentChord, 3500);
    } catch (e) {
      console.warn('Audio start failed', e);
    }
  }

  public stopBgm(): void {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }

  public setCustomAudio(fileOrUrl: File | string): void {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }

    if (typeof fileOrUrl === 'string') {
      this.customAudioUrl = fileOrUrl;
      this.customAudio = new Audio(fileOrUrl);
      this.customAudio.loop = true;
    } else {
      this.customAudioUrl = URL.createObjectURL(fileOrUrl);
      this.customAudio = new Audio(this.customAudioUrl);
      this.customAudio.loop = true;
    }

    if (this.isBgmPlaying) {
      this.startBgm();
    }
  }

  // --- Continuous Heartbeat Mode ---
  public isHeartbeatPlaying = false;
  private heartbeatInterval: any = null;

  public toggleHeartbeat(): boolean {
    if (this.isHeartbeatPlaying) {
      this.stopHeartbeat();
      return false;
    } else {
      this.startHeartbeat();
      return true;
    }
  }

  public startHeartbeat(): void {
    this.isHeartbeatPlaying = true;
    this.playHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isHeartbeatPlaying) {
        this.playHeartbeat();
      }
    }, 850); // ~70 BPM
  }

  public stopHeartbeat(): void {
    this.isHeartbeatPlaying = false;
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // --- Sound Effects ---

  public playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal: number = 0.15): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainVal, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  // Realistic heartbeat sound: "lub-dub"
  public playHeartbeat(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initAudioContext();
      const now = ctx.currentTime;

      // Lub
      this.playPulse(ctx, now, 60, 0.18, 0.28);
      // Dub
      this.playPulse(ctx, now + 0.16, 52, 0.22, 0.22);
    } catch (e) {}
  }

  private playPulse(ctx: AudioContext, time: number, freq: number, duration: number, volume: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(volume * this.volume, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  // Cute bubble/heart pop sound
  public playCutePop(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.15 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  }

  // Playful boing sound for games / wheel
  public playFunBoing(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(450, ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(350, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }

  // Cute kiss sound effect (gentle swoosh pop)
  public playKissSound(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.18 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }

  // Shimmering magic sparkle glissando
  public playMagicSparkle(): void {
    if (this.isMuted) return;
    const notes = [659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.4, 'sine', 0.08 * this.volume);
      }, idx * 50);
    });
  }

  // Playful dodging sound for NO button
  public playDodgeSound(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }

  // Romantic Harp Chime for letter / reveals
  public playHarpChime(): void {
    if (this.isMuted) return;
    const harpNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    harpNotes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 1.2, 'triangle', 0.1 * this.volume);
      }, idx * 70);
    });
  }

  // Grand Celebration fanfare for "YES!"
  public playCelebrationFanfare(): void {
    if (this.isMuted) return;
    const fanfare = [
      { f: 523.25, d: 0.15, wait: 0 },
      { f: 659.25, d: 0.15, wait: 150 },
      { f: 783.99, d: 0.2, wait: 300 },
      { f: 1046.50, d: 0.8, wait: 500 },
      { f: 880.00, d: 0.3, wait: 750 },
      { f: 1046.50, d: 1.5, wait: 950 }
    ];

    fanfare.forEach(item => {
      setTimeout(() => {
        this.playTone(item.f, item.d, 'sine', 0.22 * this.volume);
      }, item.wait);
    });
  }

  // High-tech cute laser scan chirp for fingerprint scanner
  public playScanChirp(step: number = 0): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 520 + (step * 35);
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 240, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }
}
