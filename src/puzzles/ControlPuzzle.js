import { CLUES } from './EvidencePuzzle.js';
export class ControlPuzzle {
  constructor() { this.entry = []; this.authorized = false; this.error = false; }
  press(symbol) {
    if (this.authorized || !CLUES.some(c => c.symbol === symbol)) return false;
    this.error = false;
    this.entry.push(symbol);
    if (this.entry.length === 4) {
      this.authorized = this.entry.every((value, index) => value === CLUES[index].symbol);
      this.error = !this.authorized;
      if (this.error) this.entry = [];
    }
    return true;
  }
  reset() { if (!this.authorized) { this.entry = []; this.error = false; } }
}
