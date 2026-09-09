export class PressurePuzzle {
  constructor() { this.valves = [0,0,0]; this.stable = false; }
  get readings() {
    const [a,b,c] = this.valves;
    return [20+10*a+5*b-5*c, 30-5*a+10*b+5*c, 25+5*a-5*b+10*c];
  }
  turn(index, direction = 1) {
    if (this.stable || !Number.isInteger(index) || index < 0 || index > 2 || !Number.isFinite(direction)) return false;
    const next = Math.max(0, Math.min(6, this.valves[index] + Math.sign(direction)));
    if (next === this.valves[index]) return false;
    this.valves[index] = next;
    this.stable = this.readings.every(value => value >= 45 && value <= 55);
    return true;
  }
}
