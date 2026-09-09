export const CLUES = Object.freeze([
  { id: 'operations', symbol: 'III', order: 1, label: 'كتاب العمليات' },
  { id: 'emergency', symbol: '△', order: 2, label: 'بطاقة خزانة الطوارئ' },
  { id: 'memo', symbol: '✕', order: 3, label: 'مذكرة المكتب' },
  { id: 'maintenance', symbol: '○', order: 4, label: 'سجل الصيانة' },
]);
export class EvidencePuzzle {
  constructor() { this.found = new Set(); }
  inspect(id) {
    const clue = CLUES.find(item => item.id === id);
    if (!clue) return null;
    this.found.add(id);
    return clue;
  }
  get complete() { return this.found.size === CLUES.length; }
}
