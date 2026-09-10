import * as THREE from 'three';
import {interactionPrompt} from './systems/InteractionPrompt.js';

export class InteractionSystem {
  constructor(bunker,player,puzzles,canvas,onFeedback) {
    this.bunker=bunker;this.player=player;this.puzzles=puzzles;this.onFeedback=onFeedback;this.mode='web';
    this.ray=new THREE.Raycaster();this.point=new THREE.Vector3();this.selected=null;this.hover=null;this.materials=[];
    this.focusButton=document.querySelector('#focus');
    this.card=document.querySelector('#context-card');this.cardTitle=document.querySelector('#context-title');this.cardHint=document.querySelector('#context-hint');
    const focus=()=>{
      if(this.player.zoom<1){this.player.focus();this.focusButton.textContent='تكبير الجهاز';return;}
      const target=this.hover;if(!target)return;
      let station=target.object;while(station.parent&&station.parent!==this.bunker.root)station=station.parent;
      // Frame the actual controls, not the room shell or the furniture origin.
      const bounds=new THREE.Box3();
      for(const candidate of this.bunker.targets){
        let group=candidate.object;while(group.parent&&group.parent!==this.bunker.root)group=group.parent;
        if(group===station&&this.visible(candidate.object))bounds.expandByObject(candidate.object);
      }
      if(target.action.type==='power')bounds.expandByObject(this.bunker.node('power','PowerCabinet'));
      if(bounds.isEmpty())return;
      bounds.expandByScalar(.22);
      this.player.focus(bounds,station.rotation.y+Math.PI/8);this.focusButton.textContent='إنهاء التكبير';
    };
    this.focusButton.addEventListener('click',focus);
    addEventListener('keydown',event=>{if(this.mode==='web'&&event.code==='KeyF'&&!event.repeat)focus();});
    let down=null;
    canvas.addEventListener('pointerdown',e=>{if(!down)down={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()};});
    canvas.addEventListener('pointerup',e=>{
      if(!down||down.id!==e.pointerId)return;
      if(this.mode!=='web'||(e.pointerType==='touch'&&player.touchJoystick.moved)){down=null;return;}
      if(Math.hypot(e.clientX-down.x,e.clientY-down.y)<7){
        const rect=canvas.getBoundingClientRect();
        this.ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),player.camera);
        this.selected=this.pick(this.ray);
        if(this.selected)this.activate(this.selected,performance.now()-down.time>450?-1:1);
      }
      down=null;
    });
    canvas.addEventListener('pointercancel',e=>{if(down?.id===e.pointerId)down=null;});
    canvas.addEventListener('lostpointercapture',e=>{if(down?.id===e.pointerId)down=null;});
    addEventListener('keydown',e=>{
      if(this.mode==='web'&&e.code==='KeyE'&&!e.repeat&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))this.activate(this.hover,e.shiftKey?-1:1);
    });

  }
  visible(object){for(let node=object;node;node=node.parent)if(!node.visible)return false;return true;}
  pick(ray) {
    this.bunker.root.updateMatrixWorld(true);
    // The first actual surface occludes objects behind it, including closed drawers.
    const hit=ray.intersectObject(this.bunker.root,true).find(h=>this.visible(h.object)&&!this.isPlayer(h.object));
    this.lastHit=hit??null;
    if(!hit)return null;
    for(let node=hit.object;node;node=node.parent){const target=this.bunker.targets.find(t=>t.object===node);if(target)return target;}
    return null;
  }
  isPlayer(object){for(let node=object;node;node=node.parent)if(node===this.bunker.player)return true;return false;}
  reachable(target,origin=null) {
    if(!target||!this.visible(target.object))return false;
    if(this.mode==='ar')return true;
    target.object.getWorldPosition(this.point);
    const from=origin??this.bunker.player.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,1.3,0));
    if(from.distanceTo(this.point)>2)return false;
    this.ray.set(from,this.point.clone().sub(from).normalize());
    return this.pick(this.ray)===target;
  }
  activate(target,direction=1,origin=null) {
    if(!this.reachable(target,origin))return false;
    if(target.action.type==='prop'){this.bunker.prop(target.action.id);this.onFeedback({ok:true,action:target.action},target);return true;}
    const result=this.puzzles.dispatch({...target.action,direction});this.onFeedback(result,target);return result.ok;
  }
  highlight(target) {
    if(target===this.highlighted)return;
    for(const [material,color,intensity] of this.materials){material.emissive.copy(color);material.emissiveIntensity=intensity;}
    this.materials=[];this.highlighted=target;
    target?.object.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.emissive){this.materials.push([m,m.emissive.clone(),m.emissiveIntensity]);m.emissive.setHex(0x847b3c);m.emissiveIntensity=.6;}});
  }
  update() {
    if(this.mode!=='web')return;
    this.bunker.player.visible=!this.player.focusBounds;
    // A selected fine control stays selected until out of reach. Otherwise choose nearest visible control.
    let target=this.selected&&interactionPrompt(this.selected.action,this.puzzles,this.bunker)&&this.reachable(this.selected)?this.selected:null;
    if(!target){
      let distance=Infinity;
      for(const candidate of this.bunker.targets){
        if(!interactionPrompt(candidate.action,this.puzzles,this.bunker)||!this.reachable(candidate))continue;
        candidate.object.getWorldPosition(this.point);
        const d=this.point.distanceToSquared(this.bunker.player.position);
        if(d<distance){distance=d;target=candidate;}
      }
    }
    const focused=!!this.player.focusBounds;
    const prompt=target?interactionPrompt(target.action,this.puzzles,this.bunker):null;
    this.card.hidden=!target&&!focused;this.card.dataset.focused=String(focused);
    this.cardTitle.textContent=prompt?.title??'اكتمل الإجراء';
    this.cardHint.textContent=prompt?.hint??'';this.cardHint.hidden=!prompt?.hint;
    this.focusButton.textContent=focused?'×':'فحص الجهاز';
    this.focusButton.setAttribute('aria-label',focused?'إنهاء فحص الجهاز':'فحص الجهاز');
    this.focusButton.disabled=!target&&!focused;
    this.hover=target;this.highlight(target);
  }
}
