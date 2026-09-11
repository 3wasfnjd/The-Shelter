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
