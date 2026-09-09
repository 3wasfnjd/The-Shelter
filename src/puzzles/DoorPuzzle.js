export class DoorPuzzle {
  constructor() { this.entry = ''; this.phase = 'LOCKED'; this.wheel = 0; this.open = 0; this.error = false; }
  key(value) {
    if (this.phase !== 'LOCKED') return false;
    this.error = false;
    if (value === 'clear') { this.entry = ''; return true; }
    if (!/^[0-9]$/.test(value)) return false;
    this.entry += value;
    if (this.entry.length === 4) {
      if (this.entry === '7314') this.phase = 'CODE_ACCEPTED';
      else { this.error = true; this.entry = ''; }
    }
    return true;
  }
  safety() { if (this.phase !== 'CODE_ACCEPTED') return false; this.phase = 'SAFETY_RELEASED'; return true; }
  rotate() {
    if (this.phase !== 'SAFETY_RELEASED') return false;
    if (++this.wheel === 4) this.phase = 'WHEEL_RELEASED';
    return true;
  }
  release() { if (this.phase !== 'WHEEL_RELEASED') return false; this.phase = 'OPENING'; return true; }
  update(dt) {
    if (this.phase !== 'OPENING') return;
    this.open = Math.min(1, this.open + Math.max(0, Math.min(dt, .1)) / 5);
    if (this.open === 1) this.phase = 'OPEN';
  }
}
