// Replaceable GLB contracts: selected source art plus original lightweight puzzle props.
const sequence = (prefix, count) => Array.from({ length: count }, (_, i) => `${prefix}${i}`);
export const ASSET_SLOTS = [
  // AI-generated diorama shell (Tripo-style single mesh, no named sub-parts): a wide hexagonal
  // floor narrowing to a point on the -X side, where the archway/exit sits. See ROOM_FLOOR below
  // (measured directly against this position/rotation/scale — keep them in sync).
  { id: 'shell', file: 'shelter-room.glb', position: [0,0,0], rotation: 0, scale: 9.5, nodes: [], description: 'Salvaged bunker diorama shell (single decorated mesh, hexagonal floor plan, open archway on the -X side)' },
  { id: 'power', file: 'power-station.glb', position: [2.3,0,-2.7], rotation: 0, nodes: [...sequence('Module_',6),...sequence('Trace_',6),'PowerIndicator','GeneratorRotor','PowerCabinet','SourceBattery','SourceLead','OutputLead','OutputBulb'], collider: [-.55,-.95,.55,.95], description: 'Generator, distribution board, six port-bearing circuit modules (3 columns × 2 rows), input/output labels, wiring, breakers' },
  { id: 'pressure', file: 'pressure-station.glb', position: [2.3,0,2.7], rotation: Math.PI, nodes: [...sequence('Valve_',3),...sequence('Needle_',3),...sequence('PressureIndicator_',3)], collider: [-.45,-1.2,.45,1.2], description: 'Cooling pipe network, three coupled valves, analog 0–100 PSI gauges with marked 45–55 green band; engraved directional effects' },
  { id: 'storage', file: 'military-storage.glb', position: [.6,0,-3.1], rotation: Math.PI/2, nodes: ['LockerDoor','LockerHandle','Clue_emergency','Clue_maintenance'], collider: [-.5,-1.5,.5,1.5], description: 'Olive lockers, emergency supplies, shelves, crates, staff card △—2 and maintenance record ○—4' },
  { id: 'workbench', file: 'workbench.glb', position: [.6,0,3.1], rotation: -Math.PI/2, nodes: ['Drawer','DrawerHandle','Clue_operations','Clue_memo'], collider: [-1.1,-.65,1.1,.65], description: 'Metal workbench, drawer, tools, radio, operations book III—1 and desk memo ✕—3' },
  { id: 'console', file: 'control-console.glb', position: [-2.3,0,0], rotation: Math.PI/2, nodes: [...sequence('Symbol_',4),'ResetButton','CRTScreen','SecurityIndicator'], collider: [-1.3,-.5,1.3,.5], description: 'Chunky military console, CRT with mapped screen, separate III △ ✕ ○ buttons, reset and lamps' },
  { id: 'door', file: 'blast-door.glb', position: [-5,0,0], rotation: -Math.PI/2, nodes: ['DoorLeaf','SafetyLock','LockingWheel','ReleaseHandle',...sequence('Bolt_',4),...sequence('Key_',10),'KeyClear','KeyDisplay','PowerLamp','PressureLamp','SecurityLamp','ExitLamp'], description: 'Blast door set into the shell archway, keyed mechanical interlocks, retractable bolts, separate moving leaf and wheel' },
  { id: 'props', file: 'survival-props.glb', position: [0,0,0], nodes: [], description: 'Purpose-placed extinguisher, ventilation grilles, survival kit, maintenance props; no scattered random objects' },
  { id: 'wire-decoration', file: 'decorative-wires.glb', position: [2,2.3,-3.4], nodes: ['DecorativeWireBundle'], description: 'One static wall-mounted bundle near the generator; noninteractive artwork by romullus, CC BY-SA 4.0' },
  { id: 'pipe-decoration', file: 'decorative-pipes.glb', position: [-2.3,2.5,1.6], nodes: ['DecorativePipeNetwork'], description: 'Static wall pipe network behind the control area; Zillious, CC BY 4.0' },
  { id: 'player', file: 'bunker-technician.glb', position: [3.5,0,0], nodes: [], animations: ['Idle','Walk'], description: 'Kenney 1.7 m stylized character facing +Z, skinned with Idle/Walk clips, feet at origin' },
];

// Walkable floor for the new shell: a hexagon (measured against the shell's position/
// rotation/scale above) narrowing to a point on the -X side, plus a short rectangular
// corridor beyond that point, walkable once the door opens.
export const ROOM_FLOOR = [[-5,0],[-1.3,-4.6],[2.2,-4.4],[5,-2.7],[4.3,1.7],[0,4.2]];
export const EXIT_CORRIDOR = [-7.3,-1.3,-5,1.2]; // x0,z0,x1,z1

export const AUDIO_SLOTS = [
  'ambience','generator-start','electrical-hum','ventilation','relay','valve','pressure',
  'confirm','error','keypad','bolts','door','escape',
].map(id => ({ id, file: `${id}.wav` })).concat({id:'music',file:'sector-0.mp3'});

export function assetURL(file, kind = 'models') {
  return `${import.meta.env.BASE_URL}assets/${kind}/${file}`;
}
