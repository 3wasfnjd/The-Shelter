import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector2} from 'three';
import {TouchJoystick} from '../src/systems/TouchJoystick.js';
function setup(){
 const handlers={},captures=new Set();
 const canvas={addEventListener:(t,f)=>(handlers[t]??=[]).push(f),setPointerCapture:id=>captures.add(id),hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id)};
 const base={style:{},dataset:{}},knob={style:{}},stick=new Vector2();let enabled=true;
 const joy=new TouchJoystick(canvas,base,knob,stick,()=>enabled);
 const fire=(type,x=500,y=300,id=1,pointerType='touch')=>handlers[type].forEach(f=>f({pointerId:id,clientX:x,clientY:y,pointerType}));
 return {joy,base,stick,fire,disable:()=>{enabled=false;}};
}
test('floating movement anchors anywhere, clamps speed and stops on release',()=>{
 const {joy,base,stick,fire}=setup();fire('pointerdown');assert.equal(base.style.left,'500px');assert.equal(stick.length(),0);
 fire('pointermove',600);assert.equal(stick.x,1);assert.equal(joy.moved,true);
 fire('pointermove');assert.equal(stick.length(),0);assert.equal(joy.moved,true);
 fire('pointerup');assert.equal(base.dataset.active,'false');assert.equal(joy.moved,true);
 fire('pointerdown',800,100);assert.equal(base.style.left,'800px');assert.equal(joy.moved,false);
});
test('small taps, extra fingers and mouse do not move the character',()=>{
 const {joy,stick,fire}=setup();fire('pointerdown',500,300,1,'mouse');assert.equal(joy.id,null);
 fire('pointerdown');fire('pointermove',504);assert.equal(stick.length(),0);assert.equal(joy.moved,false);
 fire('pointerdown',50,50,2);fire('pointermove',100,100,2);fire('pointerup',100,100,2);assert.equal(joy.id,1);
 fire('pointercancel');assert.equal(joy.id,null);assert.equal(stick.length(),0);
});
test('disabled input and interrupted capture release the joystick',()=>{
 const {joy,base,stick,fire,disable}=setup();fire('pointerdown');fire('pointermove',600);fire('lostpointercapture');assert.equal(stick.length(),0);
 fire('pointerdown');disable();fire('pointermove',600);assert.equal(base.dataset.active,'false');assert.equal(joy.id,null);
 fire('pointerdown');assert.equal(joy.id,null);
});
