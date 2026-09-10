import {readFile,writeFile} from 'node:fs/promises';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {BunkerScene} from '../src/BunkerScene.js';
import {PuzzleManager} from '../src/PuzzleManager.js';
import {PlayerController} from '../src/PlayerController.js';
import {InteractionSystem} from '../src/InteractionSystem.js';
import {ASSET_SLOTS} from '../src/assets.js';
globalThis.self=globalThis;
globalThis.createImageBitmap=async blob=>loadImage(Buffer.from(await blob.arrayBuffer()));
globalThis.ProgressEvent=class{constructor(type,init){Object.assign(this,{type},init)}};
globalThis.document={createElement:()=>createCanvas(1024,512)};
const loader=new GLTFLoader(),loaded=new Map();
for(const slot of ASSET_SLOTS){const bytes=await readFile('public/assets/models/'+slot.file);const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.traverse(o=>{if(o.isMesh)o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();});loaded.set(slot.id,{root:gltf.scene,animations:gltf.animations});}
const scene=new THREE.Scene(),bunker=new BunkerScene(scene,loaded),puzzles=new PuzzleManager();bunker.setMode('web');bunker.sync(puzzles,0);
const mixer=new THREE.AnimationMixer(bunker.player);for(const name of ['Idle','Walk']){
 mixer.stopAllAction();mixer.clipAction(loaded.get('player').animations.find(c=>c.name===name)).play();
 for(const time of [0,.25,.5]){mixer.setTime(time);scene.updateMatrixWorld(true);bunker.player.traverse(o=>{if(o.isSkinnedMesh)o.computeBoundingBox();});const b=new THREE.Box3().setFromObject(bunker.player);const height=b.max.y-b.min.y;console.log(name,time,'height',height.toFixed(3));if(height<1.3||height>2.1)throw Error('Character animation scale mismatch');}
}
mixer.stopAllAction();mixer.clipAction(loaded.get('player').animations.find(c=>c.name==='Idle')).play();mixer.setTime(0);
const player=Object.create(PlayerController.prototype);Object.assign(player,{bunker,radius:.25});
const interaction=Object.create(InteractionSystem.prototype);Object.assign(interaction,{bunker,player,mode:'web',ray:new THREE.Raycaster(),point:new THREE.Vector3()});
bunker.prop('locker');bunker.prop('drawer');
const unavailable=[];
for(const target of bunker.targets){let reachable=false;
 for(let x=-4;x<=4&&!reachable;x+=.3)for(let z=-5;z<=5&&!reachable;z+=.3){if(!player.canStand(x,z))continue;bunker.player.position.set(x,0,z);scene.updateMatrixWorld(true);if(interaction.reachable(target))reachable=true;}
 if(!reachable)unavailable.push(target.object.name);
}
console.log('Unreachable targets with furniture open:',unavailable);if(unavailable.length)process.exitCode=1;
bunker.prop('locker');bunker.prop('drawer');bunker.player.position.set(0,0,3.8);scene.updateMatrixWorld(true);
let triangles=0,meshes=0;scene.traverse(n=>{if(n.isMesh){meshes++;triangles+=(n.geometry.index?.count??n.geometry.attributes.position.count)/3;}});console.log({meshes,triangles,skins:loaded.get('player').root.children.length});
if(process.argv.includes('--render')){
 const camera=new THREE.PerspectiveCamera(35,1.4,.1,100);camera.position.set(15,18,20);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
 const canvas=createCanvas(1400,1000),ctx=canvas.getContext('2d');ctx.fillStyle='#232b27';ctx.fillRect(0,0,1400,1000);const faces=[];
 scene.traverse(object=>{
  for(let parent=object;parent;parent=parent.parent)if(!parent.visible)return;
  if(!object.isMesh)return;const g=object.geometry,position=g.attributes.position,uv=g.attributes.uv,index=g.index;
  const material=Array.isArray(object.material)?object.material[0]:object.material;
  for(let i=0;i<(index?.count??position.count);i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);const world=ids.map(id=>{let p=new THREE.Vector3().fromBufferAttribute(position,id);if(object.isSkinnedMesh)object.applyBoneTransform(id,p);return p.applyMatrix4(object.matrixWorld);});
   const normal=new THREE.Vector3().crossVectors(world[1].clone().sub(world[0]),world[2].clone().sub(world[0])).normalize();const center=world[0].clone().add(world[1]).add(world[2]).divideScalar(3);
   if(normal.dot(camera.position.clone().sub(center))<=0&&material.side!==THREE.DoubleSide)continue;
   const projected=world.map(p=>p.clone().project(camera));if(projected.some(p=>Math.abs(p.z)>1))continue;
   faces.push({points:projected.map(p=>[(p.x*.5+.5)*1400,(-p.y*.5+.5)*1000]),depth:center.distanceToSquared(camera.position),color:material.color??new THREE.Color(1,1,1),light:.45+.5*Math.abs(normal.dot(new THREE.Vector3(.3,.8,.5).normalize())),image:material.map?.image,uv:uv?ids.map(id=>[uv.getX(id),uv.getY(id)]):null});
  }
 });
 faces.sort((a,b)=>b.depth-a.depth);
 for(const f of faces){ctx.beginPath();f.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();const c=f.color.clone().multiplyScalar(f.light).convertLinearToSRGB();ctx.fillStyle=`rgb(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)})`;ctx.fill();
  if(f.image&&f.uv){const s=f.uv.map(([u,v])=>[u*f.image.width,v*f.image.height]);const [p0,p1,p2]=f.points;const [s0,s1,s2]=s;const den=(s1[0]-s0[0])*(s2[1]-s0[1])-(s2[0]-s0[0])*(s1[1]-s0[1]);if(Math.abs(den)<1e-6)continue;
   const a=((p1[0]-p0[0])*(s2[1]-s0[1])-(p2[0]-p0[0])*(s1[1]-s0[1]))/den,b=((p1[1]-p0[1])*(s2[1]-s0[1])-(p2[1]-p0[1])*(s1[1]-s0[1]))/den,c=((p2[0]-p0[0])*(s1[0]-s0[0])-(p1[0]-p0[0])*(s2[0]-s0[0]))/den,d=((p2[1]-p0[1])*(s1[0]-s0[0])-(p1[1]-p0[1])*(s2[0]-s0[0]))/den;
   ctx.save();ctx.clip();ctx.setTransform(a,b,c,d,p0[0]-a*s0[0]-c*s0[1],p0[1]-b*s0[0]-d*s0[1]);ctx.drawImage(f.image,0,0);ctx.restore();
  }
 }
 await writeFile(process.env.BUNKER_AUDIT_IMAGE??'/tmp/bunker17-room-audit.png',canvas.toBuffer('image/png'));
}

// Exercise the authored lamp and terminals through the real shared puzzle state.
const glow=name=>{let intensity; bunker.node('power',name).traverse(o=>{if(o.isMesh)intensity=o.material.emissiveIntensity;});return intensity;};
if(!(glow('SourceLead')>0)||glow('OutputBulb')!==0)throw Error('Power terminal initial feedback is wrong');
for(const index of [0,1,4])for(let i=0;i<3;i++)puzzles.dispatch({type:'power',index});
bunker.sync(puzzles,0);
if(!puzzles.power.online||!(glow('OutputBulb')>0)||!(glow('OutputLead')>0))throw Error('Power lamp must light after a complete source-to-output path');
console.log('Power source and final lamp feedback: PASS');
