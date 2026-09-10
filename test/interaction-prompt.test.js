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
