import test from 'node:test';
import assert from 'node:assert/strict';
import { PuzzleManager } from '../src/PuzzleManager.js';
import { PowerPuzzle } from '../src/puzzles/PowerPuzzle.js';
import { PressurePuzzle } from '../src/puzzles/PressurePuzzle.js';

function power(manager){for(const index of [0,1,4])for(let turn=0;turn<3;turn++)manager.dispatch({type:'power',index});assert.equal(manager.power.online,true);}
function pressure(manager){for(const [index,count] of [[0,3],[1,2],[2,2]])for(let step=0;step<count;step++)manager.dispatch({type:'pressure',index});assert.equal(manager.pressure.stable,true);}
function evidence(manager){for(const id of ['memo','operations','maintenance','emergency'])manager.dispatch({type:'evidence',id});}
function security(manager){for(const symbol of ['III','△','✕','○'])manager.dispatch({type:'symbol',symbol});}

test('all later actions are rejected before their prerequisites',()=>{
  const p=new PuzzleManager();
  for(const action of [{type:'pressure',index:0},{type:'evidence',id:'memo'},{type:'symbol',symbol:'III'},{type:'key',value:'7'},{type:'safety'},{type:'wheel'},{type:'release'},{type:'escape'}])assert.equal(p.dispatch(action).ok,false);
  assert.equal(p.state,'POWER_OFF');assert.deepEqual(p.pressure.valves,[0,0,0]);
});

test('power requires a source connection AND correctly facing terminal output',()=>{
  const p=new PowerPuzzle();assert.equal(p.online,false);assert.deepEqual(p.connected(),[]);
  p.turns=[0,0,0,0,0,1];assert.equal(p.connected().includes(5),false);
  p.turns[5]=0;assert.equal(p.connected().includes(5),true);
  p.turns[0]=1;assert.deepEqual(p.connected(),[]);
  assert.equal(p.rotate(-1),false);assert.equal(p.rotate(NaN),false);
});

test('each pressure valve influences all lines; reverse and bounds work',()=>{
  for(let i=0;i<3;i++){
    const p=new PressurePuzzle();const before=p.readings;p.turn(i);
    assert.ok(p.readings.every((value,j)=>value!==before[j]));p.turn(i,-1);assert.deepEqual(p.readings,before);
    assert.equal(p.turn(i,-1),false);for(let j=0;j<12;j++)p.turn(i);assert.equal(p.valves[i],6);
  }
});

test('wrong symbol/code resets and cannot release mechanical locks',()=>{
  const p=new PuzzleManager();power(p);pressure(p);evidence(p);
  for(const symbol of ['○','✕','△','III'])p.dispatch({type:'symbol',symbol});
  assert.equal(p.control.error,true);assert.deepEqual(p.control.entry,[]);assert.equal(p.control.authorized,false);
  security(p);for(const value of '1111')p.dispatch({type:'key',value});
  assert.equal(p.door.error,true);assert.equal(p.door.entry,'');assert.equal(p.door.phase,'LOCKED');
  assert.equal(p.dispatch({type:'release'}).ok,false);
});

test('complete progression, mechanical sequence, timed door and escape',()=>{
  const p=new PuzzleManager();const states=[p.state];p.subscribe(event=>{if(event.changed)states.push(event.state);});
  power(p);pressure(p);evidence(p);
  assert.equal(p.evidence.found.size,4);p.dispatch({type:'evidence',id:'memo'});assert.equal(p.evidence.found.size,4);
  security(p);for(const value of '7314')p.dispatch({type:'key',value});
  assert.equal(p.door.phase,'CODE_ACCEPTED');assert.equal(p.door.open,0);
  assert.equal(p.dispatch({type:'wheel'}).ok,false);p.dispatch({type:'safety'});
  for(let i=0;i<3;i++)p.dispatch({type:'wheel'});
  assert.equal(p.dispatch({type:'release'}).ok,false);p.dispatch({type:'wheel'});p.dispatch({type:'release'});
  assert.equal(p.dispatch({type:'escape'}).ok,false);p.update(.05);assert.ok(p.door.open>0&&p.door.open<1);
  for(let i=0;i<101;i++)p.update(.05);
  assert.equal(p.door.phase,'OPEN');assert.equal(p.escaped,false);p.dispatch({type:'escape'});assert.equal(p.escaped,true);
  assert.deepEqual([...new Set(states)],['POWER_OFF','POWER_ON','PRESSURE_STABLE','EVIDENCE_COMPLETE','SECURITY_AUTHORIZED','DOOR_UNLOCKED','ESCAPED']);
});

test('Web, VR and AR actions operate on one puzzle instance',()=>{
  const state=new PuzzleManager();
  const web=action=>state.dispatch(action),vr=action=>state.dispatch(action),ar=action=>state.dispatch(action);
  for(const index of [0,1,4]){web({type:'power',index});vr({type:'power',index});ar({type:'power',index});}
  assert.equal(state.state,'POWER_ON');vr({type:'pressure',index:0});ar({type:'pressure',index:0,direction:-1});assert.equal(state.pressure.valves[0],0);
});
