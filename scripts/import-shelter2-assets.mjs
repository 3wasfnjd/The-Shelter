/** Reproducible selection/conversion. No procedural environment geometry. */
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,dirname,basename} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {Document,NodeIO,getBounds} from '@gltf-transform/core';
import {mergeDocuments,dedup,prune,unpartition} from '@gltf-transform/functions';
import * as THREE from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
const source=resolve(process.argv[2]??'../The-Shelter2');
const output=resolve('public/assets/models');
const q='assets/vendor/quaternius-scifi/Modular SciFi MegaKit[Standard]/glTF/';
const k='assets/vendor/kenney-furniture/Models/GLTF format/';
const selection={
  wall:q+'Walls/WallAstra_Straight.gltf',floor:q+'Platforms/Platform_DarkPlates.gltf',
  lower:q+'Walls/BottomMetal_Straight.gltf',light:q+'Props/Prop_Light_Wide.gltf',
  vent:q+'Props/Prop_Vent_Wide.gltf',cable:q+'Props/Prop_Cable_3.gltf',
  terminal:q+'Props/Prop_Computer.gltf',access:q+'Props/Prop_AccessPoint.gltf',
  chest:q+'Props/Prop_Chest.gltf',crate:q+'Props/Prop_Crate3.gltf',
  door:q+'Platforms/Door_Metal.gltf',frame:q+'Platforms/Door_Frame_Square.gltf',
  desk:k+'desk.glb',cabinet:k+'bookcaseClosedDoors.glb',shelf:k+'bookcaseOpen.glb',
  radio:k+'radio.glb',chair:k+'chairDesk.glb',box:k+'cardboardBoxClosed.glb',
};
await mkdir(output+'/modules',{recursive:true});await mkdir('public/assets/licenses',{recursive:true});
const io=new NodeIO();const documents=new Map();
for(const [id,path] of Object.entries(selection)){
  let doc;
  if(path.endsWith('.gltf')){
    const json=JSON.parse(await readFile(resolve(source,path),'utf8'));
    // Source texture URIs point at absent siblings. This intentional matte material
    // adaptation removes texture references, including photorealistic normal/metal maps.
    delete json.images;delete json.textures;delete json.samplers;
    delete json.extensionsUsed;delete json.extensionsRequired;
    for(const m of json.materials??[]){
      delete m.extensions;delete m.normalTexture;delete m.occlusionTexture;delete m.emissiveTexture;
      if(m.pbrMetallicRoughness){delete m.pbrMetallicRoughness.baseColorTexture;delete m.pbrMetallicRoughness.metallicRoughnessTexture;}
    }
    const resources={};for(const buffer of json.buffers)resources[buffer.uri]=await readFile(resolve(source,dirname(path),buffer.uri));
    doc=await io.readJSON({json,resources});
  }else doc=await io.read(resolve(source,path));
  for(const material of doc.getRoot().listMaterials()){
    const name=material.getName().toLowerCase();
    const color=/glass|screen/.test(name)?[.08,.22,.19,1]:/metal|trim_01/.test(name)?[.23,.27,.23,1]:/wood/.test(name)?[.32,.36,.22,1]:[.40,.43,.34,1];
    material.setBaseColorTexture(null).setNormalTexture(null).setMetallicRoughnessTexture(null).setOcclusionTexture(null).setEmissiveTexture(null);
    material.setBaseColorFactor(color).setMetallicFactor(.08).setRoughnessFactor(.88).setDoubleSided(true);
    if(id==='light')material.setEmissiveFactor([.3,.25,.13]);
  }
  await doc.transform(prune(),dedup(),unpartition());documents.set(id,doc);
  
}
function assembly(){const doc=new Document();const scene=doc.createScene('BUNKER17');return{doc,scene,cache:new Map()};}
function cloneNode(doc,node){const copy=doc.createNode(node.getName()).setMatrix(node.getMatrix()).setMesh(node.getMesh());for(const child of node.listChildren())copy.addChild(cloneNode(doc,child));return copy;}
function place(a,id,name,position,size,yaw=0,parent=a.scene,uniform=false){
  if(!a.cache.has(id)){
    const map=mergeDocuments(a.doc,documents.get(id));
    const imported=map.get(documents.get(id).getRoot().listScenes()[0]);
    const nodes=imported.listChildren();a.cache.set(id,nodes);imported.dispose();
  }
  const outer=a.doc.createNode(name),inner=a.doc.createNode(`${name}_model`);outer.addChild(inner);
  for(const node of a.cache.get(id))inner.addChild(cloneNode(a.doc,node));
  const b=getBounds(inner),extent=b.max.map((value,i)=>value-b.min[i]);
  let scale=extent.map((value,i)=>size[i]/Math.max(value,.001));if(uniform)scale=scale.map(()=>Math.min(...scale));
  inner.setScale(scale).setTranslation([-((b.min[0]+b.max[0])/2)*scale[0],-b.min[1]*scale[1],-((b.min[2]+b.max[2])/2)*scale[2]]);
  outer.setTranslation(position).setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]);parent.addChild(outer);return outer;
}
async function save(a,file){
  for(const nodes of a.cache.values())for(const node of nodes)if(!node.listParents().some(p=>p.propertyType==='Node'||p.propertyType==='Scene'))node.dispose();
  await a.doc.transform(prune(),dedup(),unpartition());await io.write(output+'/'+file,a.doc);
}
const shell=assembly();const floor=shell.doc.createNode('Floor');shell.scene.addChild(floor);
for(let x=0;x<6;x++)for(let z=0;z<7;z++)place(shell,'floor',`Floor_${x}_${z}`,[-3.75+x*1.5,-.14,-4.714+z*11/7],[1.5,.14,11/7],0,floor);
const front=shell.doc.createNode('FrontWall'),roof=shell.doc.createNode('Roof'),corridor=shell.doc.createNode('ExitCorridor');shell.scene.addChild(front).addChild(roof).addChild(corridor);
for(let x=0;x<6;x++){
 const px=-3.75+x*1.5;
 place(shell,'wall',`Front_${x}`,[px,0,5.55],[1.5,3.8,.25],Math.PI,front);
 if(px<1.4)place(shell,'wall',`Back_${x}`,[px,0,-5.55],[1.5,3.8,.25]);
}
// Finish wall alongside the 2.1 m doorway rather than sealing the exit opening.
place(shell,'wall','BackDoorRight',[4.1,0,-5.55],[.8,3.8,.25]);
place(shell,'wall','BackDoorLeft',[1.55,0,-5.55],[.1,3.8,.25]);
place(shell,'lower','DoorLintel',[2.65,3.0,-5.55],[2.1,.8,.28]);
for(let z=0;z<7;z++)for(const side of [-1,1])place(shell,'wall',`Side_${side}_${z}`,[side*4.55,0,-4.714+z*11/7],[11/7,3.8,.25],-side*Math.PI/2,side===1?front:shell.scene);
place(shell,'floor','RoofPanel',[0,3.8,0],[9,.12,11],0,roof);
place(shell,'floor','CorridorFloor',[2.65,-.14,-6.25],[2.1,.14,1.5],0,corridor);
for(const side of [-1,1])place(shell,'wall',`CorridorWall_${side}`,[2.65+side*1.1,0,-6.25],[1.5,3,.25],-side*Math.PI/2,corridor);
place(shell,'light','CeilingLamp',[-2,3.3,-3],[1,.2,.25]);place(shell,'light','EmergencyLamp',[3.8,2.7,3],[.5,.2,.2],-Math.PI/2);
place(shell,'vent','Ventilation',[-2,2.8,-5.35],[2,.5,.2]);await save(shell,'bunker-shell.glb');
const furniture=assembly();
place(furniture,'desk','Workbench',[.2,0,.2],[2.2,1.05,1.3],Math.PI,furniture.scene,true);
place(furniture,'cabinet','StorageCabinet',[3.55,0,.7],[2.5,2.3,.85],-Math.PI/2);
place(furniture,'shelf','EquipmentShelf',[3.65,0,3.2],[1.5,2.1,.7],-Math.PI/2);
place(furniture,'terminal','ControlTerminal',[-.9,0,-4.6],[1.5,1.8,.75]);
place(furniture,'door','BlastDoorBody',[2.65,0,-5.4],[2.05,2.95,.18]);
await save(furniture,'room-furniture.glb');
const props=assembly();
place(props,'radio','Radio',[.2,1.03,.2],[.36,.24,.25]);
place(props,'chair','TechnicianChair',[.2,0,1.4],[.6,.85,.6]);
place(props,'crate','EquipmentCrate',[-3.7,0,4.4],[.65,.65,.65]);
place(props,'chest','ToolChest',[3.6,0,-2],[1.0,.7,.6],-Math.PI/2);
place(props,'cable','WallConduit',[-4.35,2.9,0],[2.5,.2,.2],Math.PI/2);
await save(props,'survival-props.glb');
// Parse the user's character FBX and existing animation sources; no runtime FBX loader.
class NodeFileReader{readAsArrayBuffer(blob){blob.arrayBuffer().then(value=>{this.result=value;this.onloadend?.();});}}
globalThis.FileReader=NodeFileReader;
const manager=new THREE.LoadingManager();manager.addHandler(/.*/, {load:()=>new THREE.Texture()});const loader=new FBXLoader(manager);
async function fbx(name){const b=await readFile(resolve(source,`assets/kenney/${name}.fbx`));return loader.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');}
const character=await fbx('characterMedium');const idle=await fbx('idle');const run=await fbx('run');
character.traverse(object=>{if(object.isMesh)object.material=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85});});
const clips=[idle.animations.find(c=>c.name.endsWith('|Idle')),run.animations.find(c=>c.name.endsWith('|Run'))].map((clip,i)=>{
 const converted=clip.clone();converted.name=i?'Walk':'Idle';converted.tracks=converted.tracks.filter(track=>character.getObjectByName(track.name.slice(0,track.name.lastIndexOf('.'))));
 if(i){const speed=.75;for(const track of converted.tracks)track.times=track.times.map(t=>t/speed);converted.duration/=speed;}
 return converted;
});
// Evaluate the imported idle pose before normalization (the raw FBX is in a T pose).
const mixer=new THREE.AnimationMixer(character);mixer.clipAction(clips[0]).play();mixer.setTime(0);character.updateMatrixWorld(true);
const b=new THREE.Box3().setFromObject(character);const scale=1.7/(b.max.y-b.min.y);
const group=new THREE.Group();group.name='BunkerTechnician';group.add(character);character.scale.multiplyScalar(scale);
character.position.set(-(b.min.x+b.max.x)/2*scale,-b.min.y*scale,-(b.min.z+b.max.z)/2*scale);
const buffer=await new GLTFExporter().parseAsync(group,{binary:true,animations:clips,onlyVisible:true});
const characterDoc=await io.readBinary(new Uint8Array(buffer));
const image=await loadImage(await readFile(resolve(source,'assets/kenney/humanMaleA.png')));
const canvas=createCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.translate(0,image.height);ctx.scale(1,-1);ctx.drawImage(image,0,0);
const texture=characterDoc.createTexture('Kenney-humanMaleA').setImage(canvas.toBuffer('image/png')).setMimeType('image/png');
for(const material of characterDoc.getRoot().listMaterials())material.setBaseColorTexture(texture);
await characterDoc.transform(dedup(),prune(),unpartition());await io.write(output+'/bunker-technician.glb',characterDoc);
for(const [from,to] of [['assets/kenney/License.txt','Kenney-Animated-Characters-Retro.txt'],['assets/vendor/kenney-furniture/License.txt','Kenney-Furniture-Kit.txt'],['assets/vendor/quaternius-scifi/LICENSE.txt','Quaternius-Modular-SciFi.txt']])await copyFile(resolve(source,from),resolve('public/assets/licenses',to));
const revision=execFileSync('git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
await writeFile('public/assets/models/selection.json',JSON.stringify({repository:'https://github.com/3wasfnjd/The-Shelter2',revision,selection,character:['assets/kenney/characterMedium.fbx','assets/kenney/idle.fbx','assets/kenney/run.fbx','assets/kenney/humanMaleA.png'],adaptations:['Matte military materials','Embedded GLB dependencies','Room assembly','FBX conversion; Run clip slowed to Walk']},null,2)+'\n');
console.log('Imported selected assets; puzzle station contracts remain incomplete.');
