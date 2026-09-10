import * as THREE from 'three';
import './style.css';
import { ASSET_SLOTS,assetURL } from './assets.js';
import { AssetManager } from './systems/AssetManager.js';
import { AudioManager } from './systems/AudioManager.js';
import { FullscreenManager } from './systems/FullscreenManager.js';
import { EndingSystem } from './systems/EndingSystem.js';
import { LightingManager } from './systems/LightingManager.js';
import { BunkerScene } from './BunkerScene.js';
import { PlayerController } from './PlayerController.js';
import { InteractionSystem } from './InteractionSystem.js';
import { PuzzleManager } from './PuzzleManager.js';
import { VRManager } from './xr/VRManager.js';
import { ARManager } from './xr/ARManager.js';

const $=selector=>document.querySelector(selector);
let noticeTimer;
function notice(message){clearTimeout(noticeTimer);$('#notice').textContent=message;noticeTimer=setTimeout(()=>{$('#notice').textContent='';},6000);}
function blocked(title,problems=[]){
  $('#loading-status').textContent=title;$('#loading').hidden=false;$('#start').hidden=true;
  $('#missing').replaceChildren(...problems.map(problem=>{const li=document.createElement('li');li.textContent=problem;return li;}));
}

async function boot(){
  const assets=new AssetManager();
  const {loaded,problems}=await assets.loadSlots(ASSET_SLOTS,value=>{$('#progress').value=value;});
  if(problems.length){
    blocked('أصول الغرفة غير مكتملة. لا تتوفر نسخة قابلة للعب حتى إضافة الموديلات المطلوبة.',problems.map(({slot,message})=>`${slot.file} — ${message}`));
    if(['shell','props','player'].every(id=>loaded.has(id))){
      $('#preview-assets').hidden=false;
      $('#preview-assets').addEventListener('click',async()=>{
        $('#preview-assets').disabled=true;
        try{
          const {startRoomPreview}=await import('./RoomPreview.js');
          await startRoomPreview(assets,loaded);
        }catch(error){blocked('تعذر تشغيل معاينة الأصول.',[error.message]);$('#preview-assets').disabled=false;}
      });
    }
    return;
  }
  const renderer=new THREE.WebGLRenderer({canvas:$('#game'),antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.xr.enabled=true;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x232b27);
  const bunker=new BunkerScene(scene,loaded);const puzzles=new PuzzleManager();
  const player=new PlayerController(bunker,$('#game'));player.resize(innerWidth,innerHeight);
  const lighting=new LightingManager(scene,bunker);const audio=new AudioManager(player.camera,bunker.root);
  let mode='web',camera=player.camera,started=false;
  const interaction=new InteractionSystem(bunker,player,puzzles,$('#game'),(event,target)=>{
    if(event.ok)bunker.feedback(target);
    const world=target.object.getWorldPosition(new THREE.Vector3());audio.feedback(event,bunker.root.worldToLocal(world));
    if(event.clue){
      let next='';
      if(puzzles.evidence.complete)next='اكتملت الأدلة — توجه إلى لوحة التحكم وأدخل الرموز بترتيب الأرقام.';
      else if(['operations','memo'].includes(event.clue.id))next=!puzzles.evidence.found.has('memo')?'الدليل الثاني داخل درج المكتب.':'تابع البحث عند سجل الصيانة وخزانة الطوارئ.';
      else next=!puzzles.evidence.found.has('emergency')?'الدليل الثاني داخل خزانة الطوارئ.':'تابع البحث في المكتب والدرج.';
      notice(`${event.clue.label}: ${event.clue.symbol} — ${event.clue.order} · ${next}`);
    }
    else if(!event.ok)notice('هذا الإجراء غير متاح الآن — افحص الأنظمة السابقة.');
    else if(event.error)notice('إدخال غير صحيح — تمت إعادة الضبط.');
  });
  const enterMode=(next,xrCamera)=>{
    mode=next;camera=xrCamera;player.enabled=false;player.clear();player.focus();interaction.mode=next;interaction.highlight(null);
    bunker.setMode(next);audio.setCamera(xrCamera);scene.background=next==='ar'?null:new THREE.Color(0x232b27);
    $('#hud').hidden=true;$('#controls').hidden=true;$('#modes').hidden=true;
  };
  const exitMode=()=>{
    mode='web';camera=player.camera;player.enabled=!ending.active;interaction.mode=ending.active?'ending':'web';bunker.setMode('web');
    audio.setCamera(camera);scene.background=new THREE.Color(0x232b27);$('#hud').hidden=ending.active;$('#controls').hidden=ending.active;$('#modes').hidden=ending.active;
    renderer.setSize(innerWidth,innerHeight);player.resize(innerWidth,innerHeight);
  };
  const vr=new VRManager(renderer,scene,bunker,player,interaction,puzzles,enterMode,exitMode,notice);
  const ar=new ARManager(renderer,bunker,interaction,puzzles,enterMode,exitMode,notice);
  const fullscreen=new FullscreenManager($('#fullscreen'),notice);
  const ending=new EndingSystem({renderer,player,interaction,audio,imageURL:assetURL('freedom-sunset.webp','images')});
  $('#vr').addEventListener('click',()=>vr.start());$('#ar').addEventListener('click',()=>ar.start());
  $('#mute').addEventListener('click',()=>{$('#mute').setAttribute('aria-pressed',String(audio.mute()));});
  for(const [id,type] of [['vr','immersive-vr'],['ar','immersive-ar']]){
    const supported=!!navigator.xr&&await navigator.xr.isSessionSupported(type).catch(()=>false);$('#'+id).disabled=!supported;
    $('#'+id).title=supported?'دخول':'غير متاح في هذا المتصفح أو الجهاز';
  }
  puzzles.subscribe(event=>{if(event.changed){$('#stage').textContent=puzzles.stage;notice(puzzles.stage);}});
  addEventListener('resize',()=>{if(mode==='web'){renderer.setSize(innerWidth,innerHeight);player.resize(innerWidth,innerHeight);}});
  bunker.setMode('web');bunker.sync(puzzles,0);lighting.update(puzzles,0,'web');renderer.render(scene,camera);
  $('#loading-status').textContent='الغرفة جاهزة';$('#start').hidden=false;
  // Audio is optional and may be loaded only after an intentional user gesture.
  $('#start').addEventListener('click',async()=>{
    if(started)return;started=true;$('#loading').hidden=true;$('#hud').hidden=false;$('#controls').hidden=false;$('#modes').hidden=false;
    $('#stage').textContent=puzzles.stage;
    // Request within the click gesture, before any awaits consume activation.
    void fullscreen.enter();
    await audio.unlock().catch(()=>{});await audio.load();
    if(audio.missing.length)notice('بعض ملفات الصوت غير متوفرة.');
  },{once:true});
  let last=0;
  renderer.setAnimationLoop((time,frame)=>{
    const dt=Math.min(last?(time-last)/1000:0,.05);last=time;if(!started)return;
    if(ending.active){renderer.render(scene,camera);return;}
    interaction.highlight(null); // Restore materials before applying this frame's state.
    puzzles.update(dt);player.update(dt,puzzles.door.phase==='OPEN');
    if(mode==='ar')ar.update(frame);
    if(mode==='web'&&player.position.x>1.85&&player.position.x<3.45&&player.position.z< -6.1&&!puzzles.escaped)puzzles.dispatch({type:'escape'});
    bunker.sync(puzzles,dt);lighting.update(puzzles,dt,mode);if(mode==='vr')vr.update(dt);interaction.update();audio.update(puzzles);void ending.update(puzzles);
    renderer.render(scene,camera);
  });
}
boot().catch(error=>{console.error(error);blocked('تعذر تحميل غرفة التحكم.',[error.message]);});
