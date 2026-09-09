import { PowerPuzzle } from './puzzles/PowerPuzzle.js';
import { PressurePuzzle } from './puzzles/PressurePuzzle.js';
import { EvidencePuzzle } from './puzzles/EvidencePuzzle.js';
import { ControlPuzzle } from './puzzles/ControlPuzzle.js';
import { DoorPuzzle } from './puzzles/DoorPuzzle.js';

export class PuzzleManager {
  constructor() {
    this.power = new PowerPuzzle(); this.pressure = new PressurePuzzle();
    this.evidence = new EvidencePuzzle(); this.control = new ControlPuzzle();
    this.door = new DoorPuzzle(); this.escaped = false; this.listeners = new Set();
  }
  get state() {
    if (this.escaped) return 'ESCAPED';
    if (this.door.phase !== 'LOCKED') return 'DOOR_UNLOCKED';
    if (this.control.authorized) return 'SECURITY_AUTHORIZED';
    if (this.evidence.complete) return 'EVIDENCE_COMPLETE';
    if (this.pressure.stable) return 'PRESSURE_STABLE';
    return this.power.online ? 'POWER_ON' : 'POWER_OFF';
  }
  get stage() {
    if (this.escaped) return 'THE SHELTER — ESCAPED';
    if (this.door.phase === 'OPEN') return 'BUNKER 17 UNLOCKED — اعبر المخرج';
    if (this.control.authorized) return 'النظام 5/5 — باب الخروج';
    if (this.evidence.complete) return 'النظام 4/5 — لوحة التحكم';
    if (this.pressure.stable) return 'النظام 3/5 — الأدلة';
    return this.power.online ? 'النظام 2/5 — الضغط' : 'النظام 1/5 — الطاقة';
  }
  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  emit(event) { for (const listener of this.listeners) listener(event); }
  dispatch(action) {
    if (!action || this.escaped) return { ok: false };
    const before = this.state;
    let ok = false; let clue;
    switch (action.type) {
      case 'power': ok = this.power.rotate(action.index); break;
      case 'pressure': if (this.power.online) ok = this.pressure.turn(action.index, action.direction); break;
      case 'evidence': if (this.pressure.stable) { clue = this.evidence.inspect(action.id); ok = !!clue; } break;
      case 'symbol': if (this.evidence.complete) ok = this.control.press(action.symbol); break;
      case 'reset': if (this.evidence.complete) { this.control.reset(); ok = true; } break;
      case 'key': if (this.control.authorized) ok = this.door.key(action.value); break;
      case 'safety': if (this.control.authorized) ok = this.door.safety(); break;
      case 'wheel': if (this.control.authorized) ok = this.door.rotate(); break;
      case 'release': if (this.control.authorized) ok = this.door.release(); break;
      case 'escape': if (this.door.phase === 'OPEN') { this.escaped = true; ok = true; } break;
    }
    const error = (action.type === 'symbol' && this.control.error) || (action.type === 'key' && this.door.error);
    const event = { ok, error, action, clue, before, state: this.state, changed: before !== this.state };
    this.emit(event);
    return event;
  }
  update(dt) {
    const before = this.door.phase;
    this.door.update(dt);
    if (before !== this.door.phase) this.emit({ ok: true, state: this.state, changed: true, action: { type: 'door-open' } });
  }
}
