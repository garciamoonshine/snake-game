// Web Audio API Sound Effects
class SoundManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.enabled = true;
  }

  beep(freq = 440, duration = 0.1, type = 'sine') {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  eatSound() { this.beep(660, 0.08, 'square'); }
  dieSound() {
    this.beep(200, 0.3, 'sawtooth');
    setTimeout(() => this.beep(100, 0.5, 'sawtooth'), 150);
  }
  levelUpSound() {
    [440, 550, 660, 880].forEach((f, i) => setTimeout(() => this.beep(f, 0.15), i * 100));
  }
}

window.soundManager = new SoundManager();
