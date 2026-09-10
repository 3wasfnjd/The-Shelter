import * as THREE from 'three';

export class InteractionSystem {
  constructor(bunker,player,puzzles,canvas,onFeedback) {
    this.bunker=bunker;this.player=player;this.puzzles=puzzles;this.onFeedback=onFeedback;this.mode='web';
    this.ray=new THREE.Raycaster();this.point=new THREE.Vector3();this.selected=null;this.hover=null;this.materials=[];
    this.button=document.querySelector('#interact');
    this.focusButton=document.querySelector('#focus');
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
      if(bounds.isEmpty())return;
      bounds.expandByScalar(.22);
      this.player.focus(bounds);this.focusButton.textContent='عرض الغرفة';
    };
    this.focusButton.addEventListener('click',focus);
    addEventListener('keydown',event=>{if(this.mode==='web'&&event.code==='KeyF'&&!event.repeat)focus();});
    let down=null;
    canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,time:performance.now()};});
    canvas.addEventListener('pointerup',e=>{
      if(this.mode!=='web'||!down)return;
      if(Math.hypot(e.clientX-down.x,e.clientY-down.y)<7){
        const rect=canvas.getBoundingClientRect();
        this.ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),player.camera);
        this.selected=this.pick(this.ray);
        if(this.selected)this.activate(this.selected,performance.now()-down.time>450?-1:1);
      }
      down=null;
    });
    canvas.addEventListener('pointercancel',()=>{down=null;});
    addEventListener('keydown',e=>{
      if(this.mode==='web'&&e.code==='KeyE'&&!e.repeat&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))this.activate(this.hover,e.shiftKey?-1:1);
    });
    let press=0;
    this.button.addEventListener('pointerdown',()=>{press=performance.now();});
    this.button.addEventListener('click',()=>{this.activate(this.hover,performance.now()-press>450?-1:1);press=0;});
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
    // A selected fine control stays selected until out of reach. Otherwise choose nearest visible control.
    let target=this.reachable(this.selected)?this.selected:null;
    if(!target){
      let distance=Infinity;
      for(const candidate of this.bunker.targets){
        if(!this.reachable(candidate))continue;
        candidate.object.getWorldPosition(this.point);
        const d=this.point.distanceToSquared(this.bunker.player.position);
        if(d<distance){distance=d;target=candidate;}
      }
    }
    this.focusButton.textContent=this.player.focusBounds?'عرض الغرفة':'تكبير الجهاز';
    this.hover=target;this.button.disabled=!target;this.focusButton.disabled=!target&&this.player.zoom===1;this.button.textContent=target?.label??'اقترب من جهاز';this.highlight(target);
  }
}
