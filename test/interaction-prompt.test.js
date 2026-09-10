import test from 'node:test';import assert from 'node:assert/strict';
import {interactionPrompt} from '../src/systems/InteractionPrompt.js';
import {PuzzleManager} from '../src/PuzzleManager.js';
test('door prompts follow mechanical phases and clear requires an entry',()=>{
 const p=new PuzzleManager();const prompt=action=>interactionPrompt(action,p);
 assert.equal(prompt({type:'key',value:'7'}),null);p.control.authorized=true;
 assert.ok(prompt({type:'key',value:'7'}));assert.equal(prompt({type:'key',value:'clear'}),null);
 p.door.entry='7';assert.ok(prompt({type:'key',value:'clear'}));
 for(const [phase,type] of [['CODE_ACCEPTED','safety'],['SAFETY_RELEASED','wheel'],['WHEEL_RELEASED','release']]){
  p.door.phase=phase;for(const candidate of ['safety','wheel','release'])assert.equal(!!prompt({type:candidate}),candidate===type);
  assert.equal(prompt({type:'key',value:'7'}),null);
 }
});
test('solved systems and empty reset are not suggested',()=>{
 const p=new PuzzleManager();assert.ok(interactionPrompt({type:'power'},p));p.power.online=true;assert.equal(interactionPrompt({type:'power'},p),null);
 for(const id of ['operations','emergency','memo','maintenance'])p.evidence.inspect(id);
 assert.equal(interactionPrompt({type:'reset'},p),null);p.control.entry.push('III');assert.ok(interactionPrompt({type:'reset'},p));
});
test('paired evidence prompts advance to hidden clue then yield to control and door',()=>{
 const p=new PuzzleManager(),b={drawerOpen:false,lockerOpen:false};
 p.power.online=true;p.pressure.stable=true;
 const prompt=(type,id)=>interactionPrompt({type,id},p,b);
 for(const [first,second,prop,open] of [['operations','memo','drawer','drawerOpen'],['maintenance','emergency','locker','lockerOpen']]){
  assert.ok(prompt('evidence',first));assert.equal(prompt('prop',prop),null);assert.equal(prompt('evidence',second),null);
  p.evidence.inspect(first);assert.equal(prompt('evidence',first),null);assert.ok(prompt('prop',prop));
  b[open]=true;assert.equal(prompt('prop',prop),null);assert.ok(prompt('evidence',second));p.evidence.inspect(second);
  assert.equal(prompt('evidence',second),null);
 }
 assert.ok(prompt('symbol'));assert.equal(prompt('key'),null);
 for(const symbol of ['III','△','✕','○'])p.dispatch({type:'symbol',symbol});
 assert.equal(prompt('symbol'),null);assert.ok(interactionPrompt({type:'key',value:'7'},p,b));
});
