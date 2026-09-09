// N/E/S/W ports; each turn is clockwise. This is connectivity, not a PIN.
const PORTS = [[1,3],[2,3],[0,2],[0,1],[0,1],[1,3]];
const INITIAL = [1,1,0,2,1,0];
export class PowerPuzzle {
  constructor() { this.turns = [...INITIAL]; this.online = false; }
  rotate(index) {
    if (this.online || !Number.isInteger(index) || index < 0 || index >= 6) return false;
    this.turns[index] = (this.turns[index] + 1) % 4;
    this.online = this.connected().includes(5);
    return true;
  }
  ports(index) { return PORTS[index].map(p => (p + this.turns[index]) % 4); }
  connected() {
    const visited = new Set();
    if (!this.ports(0).includes(3)) return [];
    const queue = [0];
    while (queue.length) {
      const i = queue.shift();
      if (visited.has(i)) continue;
      visited.add(i);
      for (const direction of this.ports(i)) {
        const x = i % 3 + [0,1,0,-1][direction];
        const y = Math.floor(i / 3) + [-1,0,1,0][direction];
        if (x < 0 || x >= 3 || y < 0 || y >= 2) continue;
        const neighbor = y * 3 + x;
        if (this.ports(neighbor).includes((direction + 2) % 4)) queue.push(neighbor);
      }
    }
    // The final module must also expose the CONTROL SYSTEM output to the east.
    if (!this.ports(5).includes(1)) visited.delete(5);
    return [...visited];
  }
}
