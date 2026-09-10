import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PlayerController } from '../src/PlayerController.js';

function controller(){
  const player=Object.create(PlayerController.prototype);
  player.radius=.25;player.bunker={colliders:[{x0:-1,z0:-.6,x1:1,z1:.6}]};
  player.target=new THREE.Vector3();player.angle=Math.PI/4;player.camera=new THREE.PerspectiveCamera(35,1,.1,100);return player;
}
test('movement slides along blockers and cannot tunnel through workbench',()=>{
  const player=controller(),position=new THREE.Vector3(0,0,2);
  player.move(position,new THREE.Vector3(0,0,-4),false);
  assert.ok(position.z>=.85);assert.equal(player.canStand(0,0),false);
  assert.equal(player.canStand(4.4,2),false);assert.equal(player.canStand(2.65,-6),false);
  assert.equal(player.canStand(2.65,-6,true),true);assert.equal(player.canStand(0,-6,true),false);
});
test('full room fits desktop/mobile frustums at both rotation limits',()=>{
  const player=controller();
  for(const [width,height] of [[1440,900],[390,844],[844,390]])for(const angle of [Math.PI/6,Math.PI/4,Math.PI/3]){
    player.angle=angle;player.resize(width,height);
    for(const x of [-4.5,4.5])for(const y of [0,3.8])for(const z of [-7,5.5]){
      const projected=new THREE.Vector3(x,y,z).project(player.camera);
      assert.ok(Math.abs(projected.x)<1&&Math.abs(projected.y)<1&&Math.abs(projected.z)<1,`${width}×${height}: room outside frame`);
    }
  }
});


test('focused controls fit portrait and landscape without using full-room distance',()=>{
  const player=controller();
  const bounds=new THREE.Box3(new THREE.Vector3(-3.8,.8,1.7),new THREE.Vector3(-3.1,2.4,3.2));
  for(const [width,height] of [[1440,900],[390,844],[844,390]])for(const angle of [-Math.PI/2,0,Math.PI/2]){
    player.focus();player.resize(width,height);const roomDistance=player.camera.position.distanceTo(player.target);
    player.focus(bounds,angle+Math.PI/8);player.resize(width,height);
    assert.ok(player.camera.position.distanceTo(player.target)<roomDistance*.5);
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
      const point=new THREE.Vector3(x,y,z).project(player.camera);
      assert.ok(Math.abs(point.x)<1&&Math.abs(point.y)<1&&Math.abs(point.z)<1);
    }
    player.focus();assert.equal(player.focusBounds,null);assert.equal(player.zoom,1);
  }
});
