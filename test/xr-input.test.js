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

test('AR follows a route around furniture and accepts another destination',async()=>{
 const {roomPath}=await import('../src/systems/RoomNavigation.js');
 const player=Object.create(PlayerController.prototype);
 player.position=new THREE.Vector3(0,0,2);player.radius=.25;
 player.bunker={colliders:[{x0:-1,x1:1,z0:-.6,z1:.6}],player:{rotation:{}}};
 player.walk=player.idle={setEffectiveWeight(){}};
 const ar=Object.create(ARManager.prototype);ar.interaction={player};ar.puzzles={door:{phase:'LOCKED'},dispatch(){assert.fail('no premature escape');}};
 for(const goal of [new THREE.Vector3(0,0,-2),new THREE.Vector3(2,0,2)]){
  ar.route=roomPath(player,goal,false);assert.ok(ar.route.length);
  ar.destination=ar.route.shift();const first=ar.destination;ar.movePlayer(0);assert.equal(ar.destination,first);
  for(let i=0;i<600&&(ar.destination||ar.route.length);i++){ar.movePlayer(1/60);assert.ok(player.canStand(player.position.x,player.position.z,false));}
  assert.ok(player.position.distanceTo(goal)<.04,`stopped at ${player.position.toArray()}`);
 }
 assert.deepEqual(roomPath(player,new THREE.Vector3(0,0,0),false),[]);
});
test('AR thumbstick moves continuously in rotated miniature coordinates',()=>{
 const player=Object.create(PlayerController.prototype);player.radius=.25;player.position=new THREE.Vector3(0,0,2);
 player.bunker={colliders:[],player:{rotation:{}}};player.walk=player.idle={setEffectiveWeight(){}};
 const root=new THREE.Group();root.rotation.y=Math.PI/2;root.scale.setScalar(.1);
 const head=new THREE.PerspectiveCamera();head.updateMatrixWorld();
 const source={handedness:'left',gamepad:{axes:[0,0,0,-1]}};
 const ar=Object.create(ARManager.prototype);
 Object.assign(ar,{session:{inputSources:[source]},interaction:{player},bunker:{root},renderer:{xr:{updateCamera(){},getCamera(){return head;}}},puzzles:{door:{phase:'LOCKED'},dispatch(){assert.fail();}},route:[new THREE.Vector3()],destination:new THREE.Vector3()});
 for(let i=0;i<30;i++)assert.equal(ar.moveWithStick(1/60),true);
 assert.ok(player.position.x>1);assert.ok(Math.abs(player.position.z-2)<.001);assert.equal(ar.destination,null);
 source.gamepad.axes=[0,0,0,0];assert.equal(ar.moveWithStick(1/60),false);
 source.gamepad.axes=[0,0,0,1];assert.equal(ar.moveWithStick(1/60),true);
});
