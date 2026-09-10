import test from 'node:test';
import assert from 'node:assert/strict';
import {EndingSystem} from '../src/systems/EndingSystem.js';
function setup(session=null){
  const elements=new Map();
  const root={querySelector(id){if(!elements.has(id))elements.set(id,{hidden:true,addEventListener(){},focus(){this.focused=true;}});return elements.get(id);}};
  const player={enabled:true,clear(){this.cleared=true;}};
  const interaction={mode:'web',highlight(){}};
  const ending=new EndingSystem({renderer:{xr:{getSession:()=>session}},player,interaction,audio:{},root,imageURL:'ending.webp'});
  return {ending,elements,player,interaction};
}
test('ending appears only after escape, locks input and runs once',async()=>{
  const {ending,elements,player,interaction}=setup();
  await ending.update({escaped:false});assert.equal(ending.active,false);
  await ending.update({escaped:true});assert.equal(ending.active,true);
  assert.equal(elements.get('#ending').hidden,false);assert.equal(elements.get('#ending-title').focused,true);
  assert.equal(player.enabled,false);assert.equal(player.cleared,true);assert.equal(interaction.mode,'ending');
  await ending.update({escaped:true});assert.equal(ending.active,true);
});
test('XR session ends before the ending image is revealed',async()=>{
  let finish,count=0;
  const {ending,elements}=setup({end(){count++;return new Promise(resolve=>{finish=resolve;});}});
  const pending=ending.update({escaped:true});assert.equal(ending.active,true);assert.equal(elements.get('#ending').hidden,true);
  await ending.update({escaped:true});assert.equal(count,1);
  finish();await pending;assert.equal(elements.get('#ending').hidden,false);
});
