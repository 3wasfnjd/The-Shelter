// Replaceable GLB contracts: selected source art plus original lightweight puzzle props.
const sequence = (prefix, count) => Array.from({ length: count }, (_, i) => `${prefix}${i}`);
export const ASSET_SLOTS = [
  { id: 'shell', file: 'bunker-shell.glb', position: [0,0,0], nodes: ['Floor','FrontWall','Roof','ExitCorridor','CeilingLamp','EmergencyLamp'], description: '9 × 11 × 3.8 m modular cutaway shell, rear-right exit corridor, ducts, conduits, signage; baked AO' },
  { id: 'power', file: 'power-station.glb', position: [-3.5,0,2.5], rotation: Math.PI/2, nodes: [...sequence('Module_',6),...sequence('Trace_',6),'PowerIndicator','GeneratorRotor'], collider: [-.55,-.6,.55,.6], description: 'Generator, distribution board, six port-bearing circuit modules (3 columns × 2 rows), input/output labels, wiring, breakers' },
  { id: 'pressure', file: 'pressure-station.glb', position: [-3.6,0,-2.3], rotation: Math.PI/2, nodes: [...sequence('Valve_',3),...sequence('Needle_',3),...sequence('PressureIndicator_',3)], collider: [-.45,-1.2,.45,1.2], description: 'Cooling pipe network, three coupled valves, analog 0–100 PSI gauges with marked 45–55 green band; engraved directional effects' },
  { id: 'storage', file: 'military-storage.glb', position: [3.55,0,.7], rotation: -Math.PI/2, nodes: ['LockerDoor','LockerHandle','Clue_emergency','Clue_maintenance'], collider: [-.5,-1.5,.5,1.5], description: 'Olive lockers, emergency supplies, shelves, crates, staff card △—2 and maintenance record ○—4' },
  { id: 'workbench', file: 'workbench.glb', position: [.2,0,.2], nodes: ['Drawer','DrawerHandle','Clue_operations','Clue_memo'], collider: [-1.1,-.65,1.1,.65], description: 'Metal workbench, drawer, tools, radio, operations book III—1 and desk memo ✕—3' },
  { id: 'console', file: 'control-console.glb', position: [-.9,0,-4.55], nodes: [...sequence('Symbol_',4),'ResetButton','CRTScreen','SecurityIndicator'], collider: [-1.3,-.5,1.3,.5], description: 'Chunky military console, CRT with mapped screen, separate III △ ✕ ○ buttons, reset and lamps' },
  { id: 'door', file: 'blast-door.glb', position: [2.65,0,-5.4], nodes: ['DoorLeaf','SafetyLock','LockingWheel','ReleaseHandle',...sequence('Bolt_',4),...sequence('Key_',10),'KeyClear','KeyDisplay','PowerLamp','PressureLamp','SecurityLamp','ExitLamp'], description: 'Blast door in 2.1 m opening, keyed mechanical interlocks, retractable bolts, separate moving leaf and wheel' },
  { id: 'props', file: 'survival-props.glb', position: [0,0,0], nodes: [], description: 'Purpose-placed extinguisher, ventilation grilles, survival kit, maintenance props; no scattered random objects' },
  { id: 'player', file: 'bunker-technician.glb', position: [0,0,3.8], nodes: [], animations: ['Idle','Walk'], description: 'Kenney 1.7 m stylized character facing +Z, skinned with Idle/Walk clips, feet at origin' },
];

export const AUDIO_SLOTS = [
  'ambience','generator-start','electrical-hum','ventilation','relay','valve','pressure',
  'confirm','error','keypad','bolts','door','escape',
].map(id => ({ id, file: `${id}.wav` }));

export function assetURL(file, kind = 'models') {
  return `${import.meta.env.BASE_URL}assets/${kind}/${file}`;
}
