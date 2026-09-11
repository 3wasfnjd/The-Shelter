import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {thumbstickAxes} from '../src/xr/XRInput.js';
import {ARManager} from '../src/xr/ARManager.js';
import {BunkerScene} from '../src/BunkerScene.js';
import {PlayerController} from '../src/PlayerController.js';
test('Quest thumbsticks and two-axis controllers map to movement',()=>{
 assert.deepEqual(thumbstickAxes({axes:[0,0,.6,-.8]}),[.6,-.8]);
 assert.deepEqual(thumbstickAxes({axes:[.6,-.8]}),[.6,-.8]);assert.deepEqual(thumbstickAxes(),[]);
});
test('AR shows the avatar while VR stays first person',()=>{
 const nodes={FrontWall:{},Roof:{}};const bunker={player:{},node:(_,name)=>nodes[name]};
 BunkerScene.prototype.setMode.call(bunker,'ar');assert.equal(bunker.player.visible,true);assert.equal(nodes.Roof.visible,false);
 BunkerScene.prototype.setMode.call(bunker,'vr');assert.equal(bunker.player.visible,false);assert.equal(nodes.Roof.visible,true);
});
test('AR destination moves the character within collisions',()=>{
 const player=Object.create(PlayerController.prototype);
 player.position=new THREE.Vector3(0,0,2);player.radius=.25;
 player.bunker={colliders:[{x0:-1,x1:1,z0:-.6,z1:.6}],player:{rotation:{}}};
 player.walk=player.idle={setEffectiveWeight(){}};
 const ar=Object.create(ARManager.prototype);ar.interaction={player};ar.puzzles={door:{phase:'LOCKED'},dispatch(){assert.fail('no premature escape');}};
 ar.destination=new THREE.Vector3(0,0,-2);
 for(let i=0;i<120;i++)ar.movePlayer(1/60);
 assert.ok(player.position.z<2&&player.position.z>=.85);assert.equal(ar.destination,null);
});
test('AR placement requires a selected surface and preserves scale and rotation',()=>{
 const ar=Object.create(ARManager.prototype);let cancelled=0;
 Object.assign(ar,{session:{},placed:false,hasPose:false,surfaceLocked:false,scale:.15,yaw:Math.PI/2,previewPose:new THREE.Matrix4().makeTranslation(1,2,3),bunker:{root:new THREE.Group()},ui:{hidden:false},hitSource:{cancel(){cancelled++;}},refreshUI(){},notice(){}});
 ar.confirmPlacement();assert.equal(ar.placed,false);
 ar.lockSurface();assert.equal(ar.surfaceLocked,false);
 ar.hasPose=true;ar.lockSurface();ar.applyPreview();
 assert.equal(ar.surfaceLocked,true);assert.deepEqual(ar.bunker.root.position.toArray(),[1,2,3]);
 assert.equal(ar.bunker.root.scale.x,.15);
 assert.ok(new THREE.Vector3(0,0,1).applyQuaternion(ar.bunker.root.quaternion).distanceTo(new THREE.Vector3(1,0,0))<1e-6);
 ar.confirmPlacement();assert.equal(ar.placed,true);assert.equal(ar.ui.hidden,true);assert.equal(cancelled,1);
 ar.confirmPlacement();assert.equal(cancelled,1);
});
test('AR overlay taps cannot place the room; controller selection uses two steps',()=>{
 const ar=Object.create(ARManager.prototype);
 Object.assign(ar,{session:{},placed:false,hasPose:true,surfaceLocked:false,overlay:true,refreshUI(){},confirmPlacement(){this.placed=true;}});
 ar.select({});assert.equal(ar.surfaceLocked,false);assert.equal(ar.placed,false);
 ar.overlay=false;ar.select({});assert.equal(ar.surfaceLocked,true);assert.equal(ar.placed,false);
 ar.select({});assert.equal(ar.placed,true);
});
