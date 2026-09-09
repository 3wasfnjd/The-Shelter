import * as THREE from 'three';
import { ASSET_SLOTS } from './assets.js';
import { CLUES } from './puzzles/EvidencePuzzle.js';

export class BunkerScene {
  constructor(scene, loaded) {
    this.root = new THREE.Group(); this.root.name = 'Bunker17'; scene.add(this.root);
    this.models = new Map(); this.targets = []; this.colliders = []; this.animated = [];
    for (const slot of ASSET_SLOTS) {
      const asset = loaded.get(slot.id);
      if (!asset) throw new Error(`Required GLB missing: ${slot.file}`);
      asset.root.position.fromArray(slot.position); asset.root.rotation.y = slot.rotation ?? 0;
      this.root.add(asset.root); this.models.set(slot.id, asset);
      if (slot.collider) {
        // Collider coordinates are room-axis aligned offsets, not visible meshes.
        const [x,z] = [slot.position[0],slot.position[2]];
        const [x0,z0,x1,z1] = slot.collider;
        this.colliders.push({ x0:x+x0,z0:z+z0,x1:x+x1,z1:z+z1 });
      }
    }
    this.player = this.models.get('player').root;
    this.exit = new THREE.Vector3(2.65,0,-6.35);
    this.registerInteractions();
    this.screen = this.prepareScreen('console','CRTScreen');
    this.keyScreen = this.prepareScreen('door','KeyDisplay');
    this.lastScreen = ''; this.lastKey = '';
  }
  node(id, name) { return this.models.get(id).root.getObjectByName(name); }
  register(id, name, action, label, kind = 'press') {
    const object = this.node(id,name);
    if (!object) throw new Error(`Missing interaction node ${id}/${name}`);
    this.targets.push({ object, action, label, kind });
  }
  registerInteractions() {
    for (let i=0;i<6;i++) this.register('power',`Module_${i}`,{type:'power',index:i},'أدر وحدة التوصيل','rotate');
    for (let i=0;i<3;i++) this.register('pressure',`Valve_${i}`,{type:'pressure',index:i},'أدر الصمام · Shift/E أو ضغط مطوّل للعكس','rotate');
    for (const clue of CLUES) this.register(['operations','memo'].includes(clue.id)?'workbench':'storage',`Clue_${clue.id}`,{type:'evidence',id:clue.id},`افحص ${clue.label}`,'inspect');
    CLUES.forEach((clue,i) => this.register('console',`Symbol_${i}`,{type:'symbol',symbol:clue.symbol},clue.symbol));
    this.register('console','ResetButton',{type:'reset'},'مسح الإدخال');
    for (let i=0;i<10;i++) this.register('door',`Key_${i}`,{type:'key',value:String(i)},String(i));
    this.register('door','KeyClear',{type:'key',value:'clear'},'مسح');
    this.register('door','SafetyLock',{type:'safety'},'حرّر قفل الأمان');
    this.register('door','LockingWheel',{type:'wheel'},'أدر عجلة الباب','rotate');
    this.register('door','ReleaseHandle',{type:'release'},'اسحب ذراع التحرير','pull');
    this.register('storage','LockerHandle',{type:'prop',id:'locker'},'افتح خزانة الطوارئ','pull');
    this.register('workbench','DrawerHandle',{type:'prop',id:'drawer'},'افتح درج المكتب','pull');
  }
  prepareScreen(id, name) {
    const node = this.node(id,name);
    let mesh; node.traverse(object => { if (!mesh && object.isMesh) mesh=object; });
    if (!mesh?.geometry.attributes.uv) throw new Error(`${id}/${name} requires a UV-mapped screen mesh`);
    const canvas = document.createElement('canvas'); canvas.width=1024; canvas.height=512;
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace; texture.flipY=false;
    mesh.material = new THREE.MeshBasicMaterial({map:texture});
    return { canvas, texture };
  }
  writeScreen(screen, lines) {
    const ctx=screen.canvas.getContext('2d'); ctx.fillStyle='#0d201c'; ctx.fillRect(0,0,1024,512);
    ctx.fillStyle='#a7dbc0'; ctx.font='bold 52px monospace';
    lines.forEach((line,i)=>ctx.fillText(line,40,85+i*83)); screen.texture.needsUpdate=true;
  }
  light(id, name, active, off=0x771b18) {
    this.node(id,name)?.traverse(object=>{
      if (!object.isMesh) return;
      for (const material of Array.isArray(object.material)?object.material:[object.material]) {
        if (material.emissive) { material.emissive.setHex(active?0x6dcc9a:off); material.emissiveIntensity=active?.8:.18; }
      }
    });
  }
  rotate(id,name,value,axis='z') {
    const node=this.node(id,name);
    node.userData.restRotation ??= node.rotation.clone();
    node.rotation[axis]=node.userData.restRotation[axis]+value;
  }
  translate(id,name,value,axis='x') {
    const node=this.node(id,name);
    node.userData.restPosition ??= node.position.clone();
    node.position[axis]=node.userData.restPosition[axis]+value;
  }
  prop(id) {
    if (id==='locker') { this.lockerOpen=!this.lockerOpen; this.rotate('storage','LockerDoor',this.lockerOpen?-1.6:0,'y'); }
    if (id==='drawer') { this.drawerOpen=!this.drawerOpen; this.translate('workbench','Drawer',this.drawerOpen?.4:0,'z'); }
  }
  feedback(target) {
    if(target.kind!=='press')return;
    const object=target.object;
    const previous=this.animated.find(item=>item.object===object);
    if(previous){previous.time=0;return;}
    this.animated.push({object,rest:object.position.clone(),time:0});
  }
  setMode(mode) {
    this.player.visible=mode==='web';
    this.node('shell','FrontWall').visible=mode==='vr';
    this.node('shell','Roof').visible=mode==='vr';
  }
  sync(puzzles,dt) {
    this.animated=this.animated.filter(item=>{
      item.time+=dt;item.object.position.copy(item.rest);
      if(item.time>=.2)return false;
      item.object.position.z-=Math.sin(item.time/.2*Math.PI)*.015;return true;
    });
    const connected=puzzles.power.connected();
    for (let i=0;i<6;i++) { this.rotate('power',`Module_${i}`,-puzzles.power.turns[i]*Math.PI/2); this.light('power',`Trace_${i}`,connected.includes(i),0x000000); }
    this.light('power','PowerIndicator',puzzles.power.online);
    puzzles.pressure.readings.forEach((psi,i)=>{
      this.rotate('pressure',`Valve_${i}`,-puzzles.pressure.valves[i]*Math.PI/3);
      this.rotate('pressure',`Needle_${i}`,-(Math.max(0,Math.min(100,psi))/100)*Math.PI*1.5);
      this.light('pressure',`PressureIndicator_${i}`,psi>=45&&psi<=55);
    });
    this.light('console','SecurityIndicator',puzzles.control.authorized);
    this.light('door','PowerLamp',puzzles.power.online); this.light('door','PressureLamp',puzzles.pressure.stable);
    this.light('door','SecurityLamp',puzzles.control.authorized); this.light('door','ExitLamp',puzzles.door.phase==='OPEN');
    this.light('shell','CeilingLamp',puzzles.power.online,0x222222);
    this.light('shell','EmergencyLamp',false,puzzles.power.online?0x221111:0xff2918);
    if(puzzles.power.online) this.node('power','GeneratorRotor').rotation.z+=dt*8;
    const lines=puzzles.control.authorized?['SECURITY AUTHORIZED','DOOR ACCESS: 7314']:puzzles.control.error?['ACCESS DENIED','RETRY SEQUENCE']:puzzles.power.online?['POWER BUS ONLINE',puzzles.pressure.stable?'PRESSURE STABLE':'COOLING NOT STABLE',puzzles.control.entry.join('  ')]:['BACKUP POWER','RESTORE POWER BUS'];
    const signature=lines.join('|'); if(signature!==this.lastScreen) {this.writeScreen(this.screen,lines);this.lastScreen=signature;}
    const key=[puzzles.door.error?'INVALID CODE':puzzles.door.phase,puzzles.door.entry];
    if(key.join('|')!==this.lastKey) {this.writeScreen(this.keyScreen,key);this.lastKey=key.join('|');}
    this.rotate('door','SafetyLock',['LOCKED','CODE_ACCEPTED'].includes(puzzles.door.phase)?0:Math.PI/2);
    this.rotate('door','LockingWheel',-puzzles.door.wheel*Math.PI/2);
    this.rotate('door','ReleaseHandle',puzzles.door.open>0?-.7:0,'x');
    const bolt=Math.min(1,puzzles.door.open*5);
    for(let i=0;i<4;i++) this.translate('door',`Bolt_${i}`,(i%2?1:-1)*bolt*.2);
    this.translate('door','DoorLeaf',Math.max(0,(puzzles.door.open-.2)/.8)*2.2);
  }
}
