// Web Audio Procedural BGM Synthesizer for 4th Generation Pokemon League Battles
// Features sample-accurate scheduling, multi-track polyphony, percussion synthesis,
// real-time spectrum analysis for visualizers, and authentic Gen 4 Sinnoh compositions.

export type BgmTrackId = 'sinnoh_elite_four' | 'cynthia_champion' | 'sinnoh_league' | 'sinnoh_battle';

export interface BgmTrackInfo {
  id: BgmTrackId;
  name: string;
  nameEn: string;
  composer: string;
  description: string;
  bpm: number;
  icon: string;
}

export const BGM_TRACKS: BgmTrackInfo[] = [
  {
    id: 'sinnoh_elite_four',
    name: '4세대 신오 사천왕 배틀 테마',
    nameEn: 'Battle! Elite Four (Sinnoh / DP Pt)',
    composer: 'Junichi Masuda / Go Ichinose',
    description: '충격적인 인트로와 폭발적인 16비트 베이스라인의 신오 사천왕 결전 테마곡',
    bpm: 152,
    icon: '⚔️',
  },
  {
    id: 'cynthia_champion',
    name: '챔피언 난천 배틀 테마',
    nameEn: 'Battle! Champion Cynthia',
    composer: 'Junichi Masuda',
    description: '위압감 넘치는 피아노 도입부와 절망적인 템포의 최강 챔피언 배틀 명곡',
    bpm: 160,
    icon: '👑',
  },
  {
    id: 'sinnoh_league',
    name: '신오 포켓몬 리그 로비 테마',
    nameEn: 'Pokemon League (Day / Sinnoh)',
    composer: 'Go Ichinose',
    description: '사천왕에게 도전하기 전 결의를 다지는 웅장하고 결연한 리그 행진곡',
    bpm: 116,
    icon: '🏛️',
  },
  {
    id: 'sinnoh_battle',
    name: '신오 체육관 & 야생 배틀 테마',
    nameEn: 'Battle! Gym Leader & Trainer',
    composer: 'Junichi Masuda',
    description: '질주감 넘치는 신오 지방의 대표적인 전투 브금',
    bpm: 144,
    icon: '⚡',
  },
];

// Note name to frequency table
const NOTE_FREQS: Record<string, number> = {
  'C2': 65.41, 'C#2': 69.30, 'Db2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31,
  'F#2': 92.50, 'Gb2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'Ab2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'Bb2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'Db3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61,
  'F#3': 185.00, 'Gb3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'Ab3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'Gb4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'F#5': 739.99, 'Gb5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'Ab5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'Bb5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98, 'G6': 1567.98, 'A6': 1760.00,
  '_': 0, 'rest': 0,
};

function getFreq(note: string): number {
  return NOTE_FREQS[note] || 0;
}

interface NoteEvent {
  note: string; // e.g. "D4", "F#5", "_" for rest
  duration: number; // in 16th notes (1 = 16th, 2 = 8th, 4 = quarter, 8 = half, 16 = whole)
  vol?: number;
}

class BgmAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  private isPlaying: boolean = false;
  private currentTrack: BgmTrackId = 'sinnoh_elite_four';
  private volume: number = 0.55; // 0.0 to 1.0
  private isMuted: boolean = false;

  private nextStepTime: number = 0;
  private currentStep: number = 0;
  private timerId: number | null = null;
  private scheduleAheadSec: number = 0.15;
  private lookaheadMs: number = 25;

  private listeners: Set<() => void> = new Set();

  constructor() {
    // Load persisted settings if available
    try {
      const savedMuted = localStorage.getItem('pkmn_bgm_muted');
      if (savedMuted !== null) {
        this.isMuted = savedMuted === 'true';
      }
      const savedVol = localStorage.getItem('pkmn_bgm_volume');
      if (savedVol !== null) {
        this.volume = Math.max(0.05, Math.min(1.0, parseFloat(savedVol)));
      }
      const savedTrack = localStorage.getItem('pkmn_bgm_track');
      if (savedTrack && BGM_TRACKS.some(t => t.id === savedTrack)) {
        this.currentTrack = savedTrack as BgmTrackId;
      }
    } catch {
      // ignore
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.bgmGain = this.ctx.createGain();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;

        this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.28, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): BgmTrackId {
    return this.currentTrack;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('pkmn_bgm_volume', String(this.volume));
    } catch {
      // ignore
    }
    if (this.bgmGain && this.ctx) {
      const effectiveVol = this.isMuted ? 0 : this.volume * 0.28;
      this.bgmGain.gain.setTargetAtTime(effectiveVol, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('pkmn_bgm_muted', String(this.isMuted));
    } catch {
      // ignore
    }
    if (this.bgmGain && this.ctx) {
      const effectiveVol = this.isMuted ? 0 : this.volume * 0.28;
      this.bgmGain.gain.setTargetAtTime(effectiveVol, this.ctx.currentTime, 0.05);
    }
    this.notify();
    return this.isMuted;
  }

  public setTrack(trackId: BgmTrackId) {
    if (this.currentTrack === trackId) return;
    this.currentTrack = trackId;
    try {
      localStorage.setItem('pkmn_bgm_track', trackId);
    } catch {
      // ignore
    }
    if (this.isPlaying) {
      // Reset scheduler to beat 0 of new track seamlessly
      this.currentStep = 0;
      if (this.ctx) {
        this.nextStepTime = this.ctx.currentTime + 0.05;
      }
    }
    this.notify();
  }

  public play(trackId?: BgmTrackId) {
    this.init();
    if (!this.ctx) return;

    if (trackId && trackId !== this.currentTrack) {
      this.currentTrack = trackId;
      try {
        localStorage.setItem('pkmn_bgm_track', trackId);
      } catch {
        // ignore
      }
    }

    if (this.isPlaying) {
      this.notify();
      return;
    }

    this.isPlaying = true;
    this.currentStep = 0;
    this.nextStepTime = this.ctx.currentTime + 0.08;

    if (this.bgmGain) {
      const targetGain = this.isMuted ? 0 : this.volume * 0.28;
      this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.bgmGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }

    this.startScheduler();
    this.notify();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
    }
    this.notify();
  }

  public togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // Get real-time audio visualizer frequency data
  public getVisualizerData(): Uint8Array {
    if (!this.analyser || !this.isPlaying || this.isMuted) {
      return new Uint8Array(8);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  // Clock scheduler loop
  private startScheduler() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
    }
    this.timerId = window.setInterval(() => {
      this.scheduleTicks();
    }, this.lookaheadMs);
  }

  private scheduleTicks() {
    if (!this.isPlaying || !this.ctx) return;

    const trackInfo = BGM_TRACKS.find(t => t.id === this.currentTrack) || BGM_TRACKS[0];
    const secondsPer16th = 60 / (trackInfo.bpm * 4);

    while (this.nextStepTime < this.ctx.currentTime + this.scheduleAheadSec) {
      this.playStepAtTime(this.currentStep, this.nextStepTime, secondsPer16th, this.currentTrack);
      this.nextStepTime += secondsPer16th;
      this.currentStep++;
    }
  }

  // ==========================================
  // TRACK SOUND GENERATORS & COMPOSITIONS
  // ==========================================

  private playStepAtTime(step: number, time: number, stepSec: number, track: BgmTrackId) {
    if (!this.ctx || !this.bgmGain) return;

    switch (track) {
      case 'sinnoh_elite_four':
        this.renderEliteFourStep(step, time, stepSec);
        break;
      case 'cynthia_champion':
        this.renderCynthiaStep(step, time, stepSec);
        break;
      case 'sinnoh_league':
        this.renderLeagueStep(step, time, stepSec);
        break;
      case 'sinnoh_battle':
        this.renderSinnohBattleStep(step, time, stepSec);
        break;
    }
  }

  // ----------------------------------------------------
  // 1. SINNOH ELITE FOUR BATTLE THEME (4세대 사천왕 배틀)
  // ----------------------------------------------------
  private renderEliteFourStep(step: number, time: number, stepSec: number) {
    // 64-step looping sequence (4 bars of 16 steps in 4/4 time)
    const loopStep = step % 64;
    const bar = Math.floor(loopStep / 16);
    const beat16 = loopStep % 16;

    // --- A. DRUM & PERCUSSION CHANNEL ---
    // Punchy Kick: on beats 0, 4, 8, 12 + syncopated on 10 or 14
    const isKick = beat16 === 0 || beat16 === 4 || beat16 === 8 || beat16 === 12 || (bar % 2 === 1 && beat16 === 10);
    if (isKick) {
      this.synthesizeKick(time, 130, 42, 0.12, 0.35);
    }

    // Snare: on beats 4, 12, with ghost notes on 15
    const isSnare = beat16 === 4 || beat16 === 12 || (bar === 3 && beat16 === 14);
    if (isSnare) {
      this.synthesizeSnare(time, 0.14, 0.28);
    }

    // Hi-hat: 16th notes with velocity accents on the off-beats
    const isAccentHat = beat16 % 4 === 2;
    this.synthesizeHiHat(time, isAccentHat ? 0.08 : 0.04, isAccentHat ? 0.22 : 0.12);

    // Crash cymbal at start of phrase (loopStep === 0 or bar === 2 && beat16 === 0)
    if (loopStep === 0 || (bar === 2 && beat16 === 0)) {
      this.synthesizeCrash(time, 0.45, 0.3);
    }

    // --- B. DRIVING BASSLINE (16th note Sinnoh Bass Ostinato in Dm / F / Gm / A) ---
    // Bar 0: Dm (D2-D2-D3-D2-D2-D3-F2-D2...), Bar 1: F / Gm, Bar 2: Dm / Bb, Bar 3: A / C#m turn
    let bassNote = 'D2';
    if (bar === 0) {
      const bassSeq = ['D2', 'D2', 'D3', 'D2', 'D2', 'D3', 'F2', 'D2', 'D2', 'D2', 'D3', 'D2', 'F2', 'G2', 'Ab2', 'A2'];
      bassNote = bassSeq[beat16];
    } else if (bar === 1) {
      const bassSeq = ['F2', 'F2', 'F3', 'F2', 'G2', 'G2', 'G3', 'G2', 'Bb2', 'Bb2', 'A2', 'A2', 'G2', 'F2', 'E2', 'D2'];
      bassNote = bassSeq[beat16];
    } else if (bar === 2) {
      const bassSeq = ['D2', 'D2', 'D3', 'D2', 'C2', 'C2', 'C3', 'C2', 'Bb2', 'Bb2', 'Bb3', 'Bb2', 'A2', 'G2', 'F2', 'E2'];
      bassNote = bassSeq[beat16];
    } else {
      const bassSeq = ['A2', 'A2', 'A3', 'A2', 'C#3', 'C#3', 'E3', 'E3', 'A2', 'A2', 'G2', 'G2', 'F2', 'E2', 'D2', 'C#2'];
      bassNote = bassSeq[beat16];
    }
    this.synthesizeBass(time, bassNote, stepSec * 0.9, 0.26);

    // --- C. SYNTH BRASS CHORDS / ARPEGGIATOR (Channel 3) ---
    // Rhythmically stabs on off-beats and runs fast 16th arp on bars 2 & 3
    if (bar === 0) {
      if (beat16 === 2 || beat16 === 6 || beat16 === 10 || beat16 === 14) {
        this.synthesizeChord(time, ['F4', 'A4', 'D5'], stepSec * 1.5, 'sawtooth', 0.18);
      }
    } else if (bar === 1) {
      if (beat16 === 2 || beat16 === 6 || beat16 === 10 || beat16 === 14) {
        this.synthesizeChord(time, ['G4', 'Bb4', 'D5'], stepSec * 1.5, 'sawtooth', 0.18);
      }
    } else if (bar === 2) {
      // Rapid arpeggiation
      const arpNotes = ['D4', 'F4', 'A4', 'D5', 'C4', 'E4', 'G4', 'C5', 'Bb3', 'D4', 'F4', 'Bb4', 'A3', 'C#4', 'E4', 'A4'];
      this.synthesizeLead(time, arpNotes[beat16], stepSec * 0.8, 'triangle', 0.16);
    } else {
      if (beat16 % 4 === 0) {
        this.synthesizeChord(time, ['E4', 'A4', 'C#5'], stepSec * 2.5, 'sawtooth', 0.2);
      }
    }

    // --- D. MAIN LEAD MELODY (Junichi Masuda High-Octane Sinnoh Lead) ---
    // Melodic sequence across 64 steps
    const melodyMap: Record<number, { note: string; len: number }> = {
      // Bar 0: D5 -> F5 -> E5 -> D5 staccatos
      0: { note: 'A5', len: 3 },
      3: { note: 'F5', len: 2 },
      5: { note: 'G5', len: 2 },
      7: { note: 'A5', len: 3 },
      10: { note: 'D6', len: 4 },
      14: { note: 'C6', len: 2 },

      // Bar 1: Bb5 -> A5 -> G5 -> F5 -> G5 -> A5
      16: { note: 'Bb5', len: 3 },
      19: { note: 'A5', len: 2 },
      21: { note: 'G5', len: 2 },
      23: { note: 'F5', len: 2 },
      25: { note: 'E5', len: 2 },
      27: { note: 'D5', len: 2 },
      29: { note: 'E5', len: 3 },

      // Bar 2: D5 -> F5 -> A5 -> D6 Climax Run
      32: { note: 'D5', len: 2 },
      34: { note: 'F5', len: 2 },
      36: { note: 'A5', len: 2 },
      38: { note: 'D6', len: 3 },
      41: { note: 'C6', len: 2 },
      43: { note: 'Bb5', len: 2 },
      45: { note: 'A5', len: 3 },

      // Bar 3: G5 -> F5 -> E5 -> D5 -> C#5 -> D5 Fast Cadence
      48: { note: 'G5', len: 2 },
      50: { note: 'F5', len: 2 },
      52: { note: 'E5', len: 2 },
      54: { note: 'F5', len: 2 },
      56: { note: 'G5', len: 2 },
      58: { note: 'A5', len: 2 },
      60: { note: 'C#6', len: 2 },
      62: { note: 'D6', len: 2 },
    };

    const mel = melodyMap[loopStep];
    if (mel) {
      this.synthesizeLeadWithVibrato(time, mel.note, mel.len * stepSec * 0.95, 0.28);
    }
  }

  // ----------------------------------------------------
  // 2. CHAMPION CYNTHIA BATTLE THEME (챔피언 난천 배틀)
  // ----------------------------------------------------
  private renderCynthiaStep(step: number, time: number, stepSec: number) {
    const loopStep = step % 64;
    const bar = Math.floor(loopStep / 16);
    const beat16 = loopStep % 16;

    // Fast relentless drums
    const isKick = beat16 === 0 || beat16 === 6 || beat16 === 8 || beat16 === 12;
    if (isKick) this.synthesizeKick(time, 140, 48, 0.1, 0.38);

    const isSnare = beat16 === 4 || beat16 === 12 || beat16 === 14;
    if (isSnare) this.synthesizeSnare(time, 0.12, 0.3);

    this.synthesizeHiHat(time, 0.05, beat16 % 2 === 0 ? 0.2 : 0.1);

    if (loopStep === 0) this.synthesizeCrash(time, 0.5, 0.35);

    // Rapid Cynthia Piano/Harpsichord Arpeggio
    // G#m / E / F# / B sequence
    let arpNote = 'G#3';
    const cynthiaArps: Record<number, string[]> = {
      0: ['G#3', 'B3', 'D#4', 'G#4', 'B4', 'D#5', 'G#5', 'D#5', 'B4', 'G#4', 'D#4', 'B3', 'G#3', 'B3', 'D#4', 'F#4'],
      1: ['E3', 'G#3', 'B3', 'E4', 'G#4', 'B4', 'E5', 'B4', 'G#4', 'E4', 'B3', 'G#3', 'E3', 'G#3', 'B3', 'D#4'],
      2: ['F#3', 'A#3', 'C#4', 'F#4', 'A#4', 'C#5', 'F#5', 'C#5', 'A#4', 'F#4', 'C#4', 'A#3', 'F#3', 'A#3', 'C#4', 'E4'],
      3: ['D#3', 'F#3', 'A#3', 'D#4', 'F#4', 'A#4', 'D#5', 'A#4', 'F#4', 'D#4', 'A#3', 'F#3', 'D#3', 'F#3', 'A#3', 'C#4'],
    };

    arpNote = (cynthiaArps[bar] && cynthiaArps[bar][beat16]) || 'G#4';
    this.synthesizeLead(time, arpNote, stepSec * 0.85, 'triangle', 0.2);

    // Cynthia Driving Sub-Bass
    const rootBass = bar === 0 ? 'G#2' : bar === 1 ? 'E2' : bar === 2 ? 'F#2' : 'D#2';
    if (beat16 % 4 === 0 || beat16 % 4 === 2) {
      this.synthesizeBass(time, rootBass, stepSec * 1.8, 0.28);
    }

    // High Dramatic Cynthia Melody
    const cynthiaMel: Record<number, { note: string; len: number }> = {
      0: { note: 'D#6', len: 4 },
      4: { note: 'B5', len: 3 },
      7: { note: 'A#5', len: 2 },
      9: { note: 'G#5', len: 4 },
      13: { note: 'A#5', len: 3 },

      16: { note: 'B5', len: 4 },
      20: { note: 'G#5', len: 3 },
      23: { note: 'F#5', len: 2 },
      25: { note: 'E5', len: 4 },
      29: { note: 'F#5', len: 3 },

      32: { note: 'G#5', len: 4 },
      36: { note: 'A#5', len: 3 },
      39: { note: 'B5', len: 2 },
      41: { note: 'C#6', len: 3 },
      44: { note: 'D#6', len: 4 },

      48: { note: 'F#6', len: 4 },
      52: { note: 'E6', len: 3 },
      55: { note: 'D#6', len: 3 },
      58: { note: 'C#6', len: 3 },
      61: { note: 'D#6', len: 3 },
    };

    const mel = cynthiaMel[loopStep];
    if (mel) {
      this.synthesizeLeadWithVibrato(time, mel.note, mel.len * stepSec * 0.95, 0.32);
    }
  }

  // ----------------------------------------------------
  // 3. SINNOH POKEMON LEAGUE LOBBY (신오 리그 로비)
  // ----------------------------------------------------
  private renderLeagueStep(step: number, time: number, stepSec: number) {
    const loopStep = step % 64;
    const bar = Math.floor(loopStep / 16);
    const beat16 = loopStep % 16;

    // Gentle Marching Snare / Timpani
    if (beat16 === 0 || beat16 === 8) {
      this.synthesizeKick(time, 100, 38, 0.25, 0.25);
    }
    if (beat16 === 4 || beat16 === 12 || beat16 === 14) {
      this.synthesizeSnare(time, 0.2, 0.16);
    }

    // Majestic French Horn / Brass Chords
    if (beat16 === 0) {
      if (bar === 0) this.synthesizeChord(time, ['C4', 'E4', 'G4', 'C5'], stepSec * 15, 'sawtooth', 0.16);
      if (bar === 1) this.synthesizeChord(time, ['G3', 'B3', 'D4', 'G4'], stepSec * 15, 'sawtooth', 0.16);
      if (bar === 2) this.synthesizeChord(time, ['A3', 'C4', 'E4', 'A4'], stepSec * 15, 'sawtooth', 0.16);
      if (bar === 3) this.synthesizeChord(time, ['F3', 'A3', 'C4', 'F4'], stepSec * 15, 'sawtooth', 0.16);
    }

    // Noble Trumpet Melody
    const leagueMel: Record<number, { note: string; len: number }> = {
      0: { note: 'C5', len: 6 },
      6: { note: 'D5', len: 2 },
      8: { note: 'E5', len: 6 },
      14: { note: 'G5', len: 2 },

      16: { note: 'D5', len: 8 },
      24: { note: 'B4', len: 4 },
      28: { note: 'G4', len: 4 },

      32: { note: 'A4', len: 6 },
      38: { note: 'B4', len: 2 },
      40: { note: 'C5', len: 6 },
      46: { note: 'E5', len: 2 },

      48: { note: 'D5', len: 8 },
      56: { note: 'C5', len: 8 },
    };

    const mel = leagueMel[loopStep];
    if (mel) {
      this.synthesizeLeadWithVibrato(time, mel.note, mel.len * stepSec * 0.95, 0.26);
    }
  }

  // ----------------------------------------------------
  // 4. SINNOH GYM & BATTLE THEME (신오 체육관 & 배틀)
  // ----------------------------------------------------
  private renderSinnohBattleStep(step: number, time: number, stepSec: number) {
    const loopStep = step % 64;
    const bar = Math.floor(loopStep / 16);
    const beat16 = loopStep % 16;

    if (beat16 === 0 || beat16 === 8 || beat16 === 10) this.synthesizeKick(time, 130, 45, 0.1, 0.35);
    if (beat16 === 4 || beat16 === 12) this.synthesizeSnare(time, 0.12, 0.25);
    this.synthesizeHiHat(time, 0.04, 0.15);

    // Fast funk bass
    const bassNote = bar % 2 === 0 ? (beat16 % 4 === 0 ? 'A2' : 'E3') : (beat16 % 4 === 0 ? 'G2' : 'D3');
    this.synthesizeBass(time, bassNote, stepSec * 0.9, 0.24);

    const battleMel: Record<number, { note: string; len: number }> = {
      0: { note: 'E5', len: 3 },
      3: { note: 'G5', len: 3 },
      6: { note: 'A5', len: 4 },
      10: { note: 'B5', len: 3 },
      13: { note: 'C6', len: 3 },

      16: { note: 'D6', len: 4 },
      20: { note: 'C6', len: 2 },
      22: { note: 'B5', len: 2 },
      24: { note: 'A5', len: 4 },
      28: { note: 'G5', len: 4 },

      32: { note: 'A5', len: 4 },
      36: { note: 'E5', len: 4 },
      40: { note: 'G5', len: 4 },
      44: { note: 'D5', len: 4 },

      48: { note: 'E5', len: 6 },
      54: { note: 'F#5', len: 2 },
      56: { note: 'G5', len: 4 },
      60: { note: 'A5', len: 4 },
    };

    const mel = battleMel[loopStep];
    if (mel) {
      this.synthesizeLeadWithVibrato(time, mel.note, mel.len * stepSec * 0.9, 0.26);
    }
  }

  // ==========================================
  // SYNTHESIS VOICES (Web Audio Nodes)
  // ==========================================

  // 1. Kick Drum
  private synthesizeKick(time: number, startFreq: number, endFreq: number, dur: number, vol: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + dur);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  // 2. Snare Drum (White Noise + Bandpass filter)
  private synthesizeSnare(time: number, dur: number, vol: number) {
    if (!this.ctx || !this.bgmGain) return;

    // Noise buffer
    const bufferSize = this.ctx.sampleRate * dur;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.Q.setValueAtTime(1.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + dur);
  }

  // 3. Hi-Hat
  private synthesizeHiHat(time: number, dur: number, vol: number) {
    if (!this.ctx || !this.bgmGain) return;

    const bufferSize = this.ctx.sampleRate * dur;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    noise.start(time);
    noise.stop(time + dur);
  }

  // 4. Crash Cymbal
  private synthesizeCrash(time: number, dur: number, vol: number) {
    if (!this.ctx || !this.bgmGain) return;

    const bufferSize = this.ctx.sampleRate * dur;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(5500, time);
    filter.Q.setValueAtTime(1.0, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    noise.start(time);
    noise.stop(time + dur);
  }

  // 5. Punchy Bass (Sawtooth + Sub-Sine)
  private synthesizeBass(time: number, note: string, dur: number, vol: number) {
    if (!this.ctx || !this.bgmGain) return;
    const freq = getFreq(note);
    if (freq <= 0) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 0.5, time); // Sub-octave

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(180, time + dur);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + dur);
    osc2.stop(time + dur);
  }

  // 6. Lead Synth with Vibrato & Filter Envelope
  private synthesizeLeadWithVibrato(time: number, note: string, dur: number, vol: number) {
    if (!this.ctx || !this.bgmGain) return;
    const freq = getFreq(note);
    if (freq <= 0) return;

    // Dual oscillator (Square + Sawtooth) for rich retro Gen 4 timbre
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 1.003, time); // Subtle chorus detune

    // Pitch vibrato
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(6.0, time); // 6 Hz vibrato
    lfoGain.gain.setValueAtTime(4.0, time); // +/- 4 Hz modulation
    lfo.connect(osc1.frequency);
    lfo.connect(osc2.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, time);
    filter.frequency.exponentialRampToValueAtTime(1200, time + dur);

    // ADSR Envelope
    const attack = 0.02;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(vol, time + attack);
    gain.gain.exponentialRampToValueAtTime(0.005, time + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    lfo.start(time);
    osc1.start(time);
    osc2.start(time);
    lfo.stop(time + dur);
    osc1.stop(time + dur);
    osc2.stop(time + dur);
  }

  // 7. General Lead (Triangle / Pulse)
  private synthesizeLead(time: number, note: string, dur: number, type: OscillatorType, vol: number) {
    if (!this.ctx || !this.bgmGain) return;
    const freq = getFreq(note);
    if (freq <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + dur);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  // 8. Chords (Multi-voice polyphony)
  private synthesizeChord(time: number, notes: string[], dur: number, type: OscillatorType, vol: number) {
    if (!this.ctx || !this.bgmGain) return;
    const voiceVol = vol / notes.length;

    notes.forEach(n => {
      const freq = getFreq(n);
      if (freq <= 0) return;

      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(voiceVol, time);
      gain.gain.exponentialRampToValueAtTime(0.005, time + dur);

      osc.connect(gain);
      gain.connect(this.bgmGain!);

      osc.start(time);
      osc.stop(time + dur);
    });
  }
}

export const bgmEngine = new BgmAudioEngine();
