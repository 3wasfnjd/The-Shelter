import test from 'node:test';
import assert from 'node:assert/strict';
import {FullscreenManager} from '../src/systems/FullscreenManager.js';
function setup(request){
  const notes=[];const button={addEventListener(){},setAttribute(){}};
  const doc={documentElement:{requestFullscreen:request},addEventListener(){}};
  const win={navigator:{userAgent:'iPhone'},matchMedia:()=>({matches:false})};
  return {manager:new FullscreenManager(button,text=>notes.push(text),doc,win),notes};
}
test('fullscreen request is made immediately and rejection is nonfatal',async()=>{
  let called=false;const {manager,notes}=setup(()=>{called=true;return Promise.reject(new Error('Denied'));});
  const pending=manager.enter();assert.equal(called,true);assert.equal(await pending,false);assert.equal(notes.length,1);
});
test('supported fullscreen succeeds; unavailable API gives an iPhone fallback',async()=>{
  const supported=setup(()=>Promise.resolve());assert.equal(await supported.manager.enter(),true);assert.equal(supported.notes.length,0);
  const unsupported=setup();assert.equal(await unsupported.manager.enter(),false);assert.match(unsupported.notes[0],/الشاشة الرئيسية/);
});
