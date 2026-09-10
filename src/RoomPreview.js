import * as THREE from 'three';
import { ASSET_SLOTS } from './assets.js';
import { PlayerController } from './PlayerController.js';
import { LightingManager } from './systems/LightingManager.js';

/** Walkable asset review, explicitly separate from the incomplete puzzle build. */
export async function startRoomPreview(assets,loaded) {
  const furniture = await assets.load('room-furniture.glb');
  const renderer = new THREE.WebGLRenderer({canvas:document.querySelector('#game'),antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();scene.background=new THREE.Color(0x232b27);
  const root=new THREE.Group();scene.add(root);
  const shell=loaded.get('shell').root;
  shell.getObjectByName('FrontWall').visible=false;shell.getObjectByName('Roof').visible=false;
  root.add(shell,loaded.get('props').root,furniture.scene);
  const player=loaded.get('player').root;player.position.set(0,0,3.8);root.add(player);
  root.traverse(object=>{if(object.isMesh){object.castShadow=true;object.receiveShadow=true;}});
  const colliders=ASSET_SLOTS.filter(s=>s.collider).map(s=>({
    x0:s.position[0]+s.collider[0],z0:s.position[2]+s.collider[1],
    x1:s.position[0]+s.collider[2],z1:s.position[2]+s.collider[3],
  }));
  // Actual imported preview furnishings, not the absent power/pressure stations.
  colliders.splice(0,2);
  colliders.push({x0:3.3,x1:4,z0:2.45,z1:3.95},{x0:-.1,x1:.5,z0:1.1,z1:1.7},
    {x0:3.3,x1:3.9,z0:-2.5,z1:-1.5},{x0:-4.03,x1:-3.37,z0:4.07,z1:4.73});
  const bunker={root,player,models:loaded,colliders};
  const controller=new PlayerController(bunker,renderer.domElement);
  const lighting=new LightingManager(scene,bunker);
  const displayState={power:{online:true},door:{open:0}};
  document.querySelector('#loading').hidden=true;
  document.querySelector('#hud').hidden=false;
  document.querySelector('#controls').hidden=false;
  document.querySelector('#interact').hidden=true;
  document.querySelector('#stage').textContent='معاينة الغرفة والشخصية — الألغاز غير مكتملة';
  document.querySelector('#help').textContent='WASD / الأسهم: حركة · عصا الجوال: حركة · اسحب لتدوير الكاميرا';
  const back=document.querySelector('#back-preview');back.hidden=false;
  back.addEventListener('click',()=>location.reload(),{once:true});
  addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);controller.resize(innerWidth,innerHeight);});
  let previous=0;
  renderer.setAnimationLoop(time=>{
    const dt=Math.min(previous?(time-previous)/1000:0,.05);previous=time;
    controller.update(dt,false);lighting.update(displayState,dt,'web');renderer.render(scene,controller.camera);
  });
}
