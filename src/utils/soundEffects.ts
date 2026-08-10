// Web Audio API synthesizer for authentic retro Pokemon battle sound effects

export type DamageTier = 'light' | 'medium' | 'heavy' | 'massive';

export interface DamageHitSoundOptions {
  damage: number;
  maxHp: number;
  isCrit?: boolean;
  isSuperEffective?: boolean;
  isImmune?: boolean;
  typeEffectiveness?: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Button click / menu sound
  public playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // =========================================================================
  // DAMAGE-BASED HIT SOUND EFFECTS (타격 데미지별 사운드)
  // =========================================================================

  // 1. Light Hit / Scratch / Chip Damage (< 20% HP or low damage)
  public playHitLight() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // 2. Medium / Normal Standard Damage (20% ~ 45% HP)
  public playHitMedium() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(240, now);
    osc1.frequency.exponentialRampToValueAtTime(55, now + 0.14);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(120, now);
    osc2.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.15);
    osc2.stop(now + 0.15);
  }

  // 3. Heavy Impact Damage (45% ~ 70% HP - powerful slam)
  public playHitHeavy() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const oscCrunch = this.ctx.createOscillator();
    const oscSub = this.ctx.createOscillator();
    const gainCrunch = this.ctx.createGain();
    const gainSub = this.ctx.createGain();

    // Heavy crunchy punch
    oscCrunch.type = 'sawtooth';
    oscCrunch.frequency.setValueAtTime(280, now);
    oscCrunch.frequency.exponentialRampToValueAtTime(45, now + 0.22);
    gainCrunch.gain.setValueAtTime(0.32, now);
    gainCrunch.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    // Deep sub-woofer impact
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(95, now);
    oscSub.frequency.exponentialRampToValueAtTime(28, now + 0.28);
    gainSub.gain.setValueAtTime(0.35, now);
    gainSub.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    oscCrunch.connect(gainCrunch);
    gainCrunch.connect(this.ctx.destination);
    oscSub.connect(gainSub);
    gainSub.connect(this.ctx.destination);

    oscCrunch.start(now);
    oscSub.start(now);
    oscCrunch.stop(now + 0.24);
    oscSub.stop(now + 0.28);
  }

  // 4. Massive / Devastating Damage (>= 70% HP or OHKO - earth-shattering blast)
  public playHitMassive() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const oscSnap = this.ctx.createOscillator();
    const oscCrunch = this.ctx.createOscillator();
    const oscSub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // High transient impact snap
    oscSnap.type = 'square';
    oscSnap.frequency.setValueAtTime(800, now);
    oscSnap.frequency.exponentialRampToValueAtTime(160, now + 0.06);

    // Mid crunchy explosion
    oscCrunch.type = 'sawtooth';
    oscCrunch.frequency.setValueAtTime(360, now);
    oscCrunch.frequency.exponentialRampToValueAtTime(35, now + 0.38);

    // Deep sub bass quake
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(110, now);
    oscSub.frequency.exponentialRampToValueAtTime(20, now + 0.42);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    oscSnap.connect(gain);
    oscCrunch.connect(gain);
    oscSub.connect(gain);
    gain.connect(this.ctx.destination);

    oscSnap.start(now);
    oscCrunch.start(now);
    oscSub.start(now);

    oscSnap.stop(now + 0.08);
    oscCrunch.stop(now + 0.38);
    oscSub.stop(now + 0.42);
  }

  // 5. Immune / Deflect Sound (0x damage / Balloon / Shield ping)
  public playImmune() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1318.51, now); // E6
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.08); // A6

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now);
    osc2.frequency.exponentialRampToValueAtTime(2093, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.16);
    osc2.stop(now + 0.16);
  }

  // 6. Resisted Hit Sound (0.5x, 0.25x dull thud)
  public playResist() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Standard hit method (backward compatible with optional damage ratio)
  public playHit(damageRatioOrAmount?: number) {
    if (damageRatioOrAmount === undefined) {
      this.playHitMedium();
      return;
    }
    // If passed ratio (< 1) or flat amount (> 1)
    const ratio = damageRatioOrAmount > 1 ? damageRatioOrAmount / 150 : damageRatioOrAmount;
    if (ratio < 0.2) {
      this.playHitLight();
    } else if (ratio < 0.45) {
      this.playHitMedium();
    } else if (ratio < 0.7) {
      this.playHitHeavy();
    } else {
      this.playHitMassive();
    }
  }

  // Super effective hit sound with damage tier scaling
  public playSuperEffective(tier: DamageTier = 'medium') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.16); // A5

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(293.66, now);
    const bassEndFreq = tier === 'massive' ? 30 : tier === 'heavy' ? 45 : 70;
    const dur = tier === 'massive' ? 0.38 : tier === 'heavy' ? 0.28 : 0.22;
    osc2.frequency.exponentialRampToValueAtTime(bassEndFreq, now + dur);

    gain.gain.setValueAtTime(tier === 'massive' ? 0.35 : 0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);

    // If heavy or massive, layer an extra sub-bass impact
    if (tier === 'heavy' || tier === 'massive') {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(100, now);
      subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.32);
      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.32);
    }
  }

  // Critical hit fanfare with damage tier scaling
  public playCritical(tier: DamageTier = 'medium') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.035);
      gain.gain.setValueAtTime(0.2, now + idx * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.035);
      osc.stop(now + idx * 0.035 + 0.1);
    });

    // Layer the impact underneath the sparkle
    if (tier === 'massive') {
      this.playHitMassive();
    } else if (tier === 'heavy') {
      this.playHitHeavy();
    } else {
      this.playHitMedium();
    }
  }

  // Combined Critical + Super Effective Ultimate Strike
  public playCriticalSuperEffective(tier: DamageTier = 'heavy') {
    this.playCritical(tier);
    this.playSuperEffective(tier);
  }

  // Master damage sound router
  public playDamageHit(options: DamageHitSoundOptions) {
    const { damage, maxHp, isCrit, isSuperEffective, isImmune, typeEffectiveness } = options;

    if (isImmune || damage <= 0 || typeEffectiveness === 0) {
      this.playImmune();
      return;
    }

    const ratio = Math.max(0, damage / Math.max(1, maxHp));

    let tier: DamageTier = 'medium';
    if (ratio < 0.2) {
      tier = 'light';
    } else if (ratio < 0.45) {
      tier = 'medium';
    } else if (ratio < 0.7) {
      tier = 'heavy';
    } else {
      tier = 'massive';
    }

    if (isCrit && isSuperEffective) {
      this.playCriticalSuperEffective(tier);
    } else if (isCrit) {
      this.playCritical(tier);
    } else if (isSuperEffective) {
      this.playSuperEffective(tier);
    } else if (typeEffectiveness !== undefined && typeEffectiveness < 1.0) {
      if (tier === 'light') {
        this.playResist();
      } else {
        this.playHitLight();
      }
    } else {
      switch (tier) {
        case 'light':
          this.playHitLight();
          break;
        case 'medium':
          this.playHitMedium();
          break;
        case 'heavy':
          this.playHitHeavy();
          break;
        case 'massive':
          this.playHitMassive();
          break;
      }
    }
  }

  // Pokemon Faint sound
  public playFaint() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Healing / Pokemon Center restore sound
  public playHeal() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const melody = [523.25, 587.33, 659.25, 783.99, 659.25, 783.99];
    melody.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.14);
    });
  }

  // Victory fanfare
  public playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const fanfare = [
      { f: 523.25, d: 0.12 }, // C
      { f: 523.25, d: 0.12 }, // C
      { f: 523.25, d: 0.12 }, // C
      { f: 659.25, d: 0.24 }, // E
      { f: 587.33, d: 0.12 }, // D
      { f: 659.25, d: 0.12 }, // E
      { f: 783.99, d: 0.45 }, // G
    ];

    let t = now;
    fanfare.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + n.d);
      t += n.d * 0.9;
    });
  }

  // Stat boost / rank up fanfare
  public playStatBuff() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.18, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.12);
    });
  }

  // Stat drop / rank down warble
  public playStatDebuff() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [659.25, 523.25, 415.3, 311.13];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0.15, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.1);
    });
  }

  // Elemental & Move-Specific Audio Synthesizer (나무위키 기반 스킬 고유 사운드)
  public playMoveVFXSound(
    type: string,
    category: string,
    power: number = 80,
    moveId: string = '',
    moveName: string = ''
  ) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Specific Move Audio Synthesizers
    if (moveId === 'fire_blast' || moveName === '불대문자') {
      // Fire Blast: Fiery flare buildup -> Massive detonation
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(90, now);
      osc1.frequency.exponentialRampToValueAtTime(450, now + 0.12);
      osc1.frequency.exponentialRampToValueAtTime(35, now + 0.45);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(250, now);
      osc2.frequency.exponentialRampToValueAtTime(50, now + 0.45);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
      return;
    }

    if (moveId === 'thunderbolt' || moveName === '10만볼트' || moveId === 'thunder' || moveName === '번개') {
      // Thunderbolt / Thunder: High-voltage crackling burst
      [0, 0.03, 0.07, 0.12, 0.18, 0.25].forEach((offset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(idx % 2 === 0 ? 1400 : 700, now + offset);
        osc.frequency.exponentialRampToValueAtTime(120, now + offset + 0.06);
        gain.gain.setValueAtTime(0.28, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.06);
      });
      return;
    }

    if (moveId === 'close_combat' || moveName === '인파이트') {
      // Close Combat: Rapid multi-hit flurry
      [0, 0.07, 0.14, 0.21, 0.28, 0.35].forEach((offset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320 - idx * 25, now + offset);
        osc.frequency.exponentialRampToValueAtTime(60, now + offset + 0.05);
        gain.gain.setValueAtTime(0.25, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.05);
      });
      return;
    }

    if (moveId === 'leaf_blade' || moveName === '리프블레이드' || moveId === 'x_scissor' || moveName === '시저크로스') {
      // Leaf Blade / X-Scissor: Crisp sharp blade slice
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.18);
      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
      return;
    }

    if (moveId === 'crunch' || moveName === '깨물어부수기') {
      // Crunch: Dual-phase snapping crunch
      [0, 0.12].forEach((offset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(idx === 0 ? 400 : 250, now + offset);
        osc.frequency.exponentialRampToValueAtTime(40, now + offset + 0.1);
        gain.gain.setValueAtTime(0.3, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.1);
      });
      return;
    }

    if (moveId === 'moonblast' || moveName === '문포스') {
      // Moonblast: Celestial fairy chord bloom
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.18, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.3);
      });
      return;
    }

    if (moveId === 'swords_dance' || moveName === '칼춤') {
      // Swords Dance: Triple metal ring
      [880, 1174.66, 1760].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
      return;
    }

    if (category === 'status') {
      this.playStatBuff();
      return;
    }

    switch (type) {
      case '불꽃': {
        // Fire burst: Low rumble to fiery flare
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case '물': {
        // Water surge: bubbling sine wave oscillations
        [0, 0.06, 0.12, 0.18].forEach((offset, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320 + idx * 80, now + offset);
          osc.frequency.exponentialRampToValueAtTime(180, now + offset + 0.12);

          gain.gain.setValueAtTime(0.2, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.12);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.12);
        });
        break;
      }
      case '전기': {
        // High voltage electric zaps
        [0, 0.04, 0.08, 0.14, 0.2].forEach((offset, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(idx % 2 === 0 ? 880 : 1320, now + offset);
          osc.frequency.exponentialRampToValueAtTime(220, now + offset + 0.05);

          gain.gain.setValueAtTime(0.22, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.05);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.05);
        });
        break;
      }
      case '얼음': {
        // Crystalline ice shatter
        [659.25, 880, 1174.66, 1760].forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.18, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.15);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.15);
        });
        break;
      }
      case '격투':
      case '바위':
      case '땅': {
        // Heavy impact thud / earthquake
        const osc = this.ctx.createOscillator();
        const oscSub = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);

        oscSub.type = 'triangle';
        oscSub.frequency.setValueAtTime(90, now);
        oscSub.frequency.exponentialRampToValueAtTime(30, now + 0.3);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        oscSub.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        oscSub.start(now);
        osc.stop(now + 0.3);
        oscSub.stop(now + 0.3);
        break;
      }
      case '에스퍼':
      case '페어리': {
        // Mystical cosmic chime
        [587.33, 739.99, 880, 1174.66, 1479.98].forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);

          gain.gain.setValueAtTime(0.16, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.2);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.2);
        });
        break;
      }
      case '드래곤': {
        // Epic roar energy surge
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.exponentialRampToValueAtTime(660, now + 0.2);
        osc1.frequency.exponentialRampToValueAtTime(110, now + 0.4);

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(110, now);
        osc2.frequency.exponentialRampToValueAtTime(330, now + 0.2);
        osc2.frequency.exponentialRampToValueAtTime(55, now + 0.4);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.4);
        osc2.stop(now + 0.4);
        break;
      }
      case '고스트':
      case '악': {
        // Eerie shadow resonance
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.35);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      default: {
        // Fast kinetic strike (Normal, Flying, Bug, Steel, Poison, Grass)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
    }
  }
}

export const sounds = new SoundEngine();

