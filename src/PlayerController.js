import * as THREE from 'three';
import {TouchJoystick} from './systems/TouchJoystick.js';

export class PlayerController {
  constructor(bunker,canvas) {
    this.bunker=bunker; this.position=bunker.player.position; this.keys=new Set(); this.stick=new THREE.Vector2();
    this.overview=false; this.followTarget=this.position.clone().setY(1.2);
    this.enabled=true; this.angle=Math.PI/4; this.radius=.25; this.zoom=1; this.camera=new THREE.PerspectiveCamera(28,1,.1,150);
    this.target=new THREE.Vector3(0,0,0); this.forward=new THREE.Vector3(); this.right=new THREE.Vector3(); this.delta=new THREE.Vector3();
    this.mixer=new THREE.AnimationMixer(bunker.player);
    const clips=bunker.models.get('player').animations;
    this.idle=this.mixer.clipAction(clips.find(c=>c.name==='Idle')); this.walk=this.mixer.clipAction(clips.find(c=>c.name==='Walk'));
    this.idle.play(); this.walk.play(); this.walk.setEffectiveWeight(0);
    addEventListener('keydown',event=>{
      if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(event.code)) event.preventDefault();
      this.keys.add(event.code);
    });
    addEventListener('keyup',event=>this.keys.delete(event.code));
    addEventListener('blur',()=>this.clear());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear();});
    this.touchJoystick=new TouchJoystick(canvas,document.querySelector('#joystick'),document.querySelector('#stick'),this.stick,()=>this.enabled);
    const viewButton=document.querySelector('#room-view');
    viewButton.addEventListener('click',()=>{
      this.overview=!this.overview;this.focus();
      viewButton.textContent=this.overview?'متابعة الشخصية':'عرض الغرفة كاملة';
      viewButton.setAttribute('aria-pressed',String(this.overview));
      this.followTarget.set(this.position.x,1.2,this.position.z);
      this.resize(innerWidth,innerHeight);
    });
    let drag=null;
    canvas.addEventListener('pointerdown',event=>{if(this.enabled&&event.pointerType!=='touch')drag={id:event.pointerId,x:event.clientX};});
    canvas.addEventListener('pointermove',event=>{
      if(!drag||drag.id!==event.pointerId||!this.enabled)return;
      this.angle=THREE.MathUtils.clamp(this.angle+(event.clientX-drag.x)*.003,Math.PI/6,Math.PI/3);drag.x=event.clientX;
    });
    canvas.addEventListener('pointerup',()=>{drag=null;});canvas.addEventListener('pointercancel',()=>{drag=null;});
  }
  clear(){this.keys.clear();this.stick.set(0,0);this.touchJoystick?.clear();}
  focus(bounds=null,angle=this.angle){
    this.focusBounds=bounds?.clone()??null;this.focusAngle=bounds?angle:null;
    if(bounds)bounds.getCenter(this.target);else this.target.set(0,0,0);
    this.zoom=bounds?.24:1;
  }
  canStand(x,z,doorOpen=false) {
    const r=this.radius;
    const inRoom=x>-4.5+r&&x<4.5-r&&z>-5.5+r&&z<5.5-r;
    const inExit=doorOpen&&x>1.6+r&&x<3.7-r&&z>=-7&&z< -4.8;
    if(!inRoom&&!inExit)return false;
    return !this.bunker.colliders.some(b=>x>b.x0-r&&x<b.x1+r&&z>b.z0-r&&z<b.z1+r);
  }
  move(position,delta,doorOpen) {
    // Substeps stop tunnelling through thin obstacles after a slow frame.
    const count=Math.max(1,Math.ceil(delta.length()/.1));
    for(let i=0;i<count;i++){
      if(this.canStand(position.x+delta.x/count,position.z,doorOpen))position.x+=delta.x/count;
      if(this.canStand(position.x,position.z+delta.z/count,doorOpen))position.z+=delta.z/count;
    }
  }
  resize(width,height) {
    this.camera.aspect=width/height;this.camera.updateProjectionMatrix();
    // Center the occupied volume rather than the floor: a tighter reference-style diorama.
    if(!this.focusBounds){
      if(this.overview===false)this.target.copy(this.followTarget);
      else this.target.set(0,1.9,-.6);
    }
    // Fit all shell corners, including portrait screens, at every allowed camera azimuth.
    const angle=this.focusAngle??this.angle;
    this.camera.position.set(Math.sin(angle)*25,17.5,Math.cos(angle)*25).add(this.target);this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();
    const rotation=this.camera.quaternion.clone().invert();let distance=1;
    const tan=Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2));
    const margin=this.focusBounds?1.2:1.07;
    const bounds=this.focusBounds??new THREE.Box3(new THREE.Vector3(-4.8,0,-7),new THREE.Vector3(4.8,3.8,5.8));
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
      const p=new THREE.Vector3(x,y,z).sub(this.target).applyQuaternion(rotation);
      distance=Math.max(distance,p.z+Math.abs(p.x)/(tan*this.camera.aspect)*margin,p.z+Math.abs(p.y)/tan*margin);
    }
    // Close play deliberately crops distant room edges; overview retains the full-room fit.
    // Keep distance independent of player location so walking does not pump the zoom.
    if(!this.focusBounds&&this.overview===false)distance=Math.max(14,8/this.camera.aspect);
    this.camera.position.copy(new THREE.Vector3(0,0,distance).applyQuaternion(this.camera.quaternion).add(this.target));
    this.camera.updateMatrixWorld();
  }
  update(dt,doorOpen) {
    let moving=false;
    if(this.enabled){
      const x=Number(this.keys.has('KeyD')||this.keys.has('ArrowRight'))-Number(this.keys.has('KeyA')||this.keys.has('ArrowLeft'))+this.stick.x;
      const y=Number(this.keys.has('KeyS')||this.keys.has('ArrowDown'))-Number(this.keys.has('KeyW')||this.keys.has('ArrowUp'))+this.stick.y;
      this.forward.set(-Math.sin(this.angle),0,-Math.cos(this.angle));this.right.set(Math.cos(this.angle),0,-Math.sin(this.angle));
      this.delta.copy(this.right).multiplyScalar(x).addScaledVector(this.forward,-y);
      if(this.delta.lengthSq()>.001){
        if(this.focusBounds)this.focus();
        this.delta.clampLength(0,1).multiplyScalar(dt*2.2);this.move(this.position,this.delta,doorOpen);
        this.bunker.player.rotation.y=Math.atan2(this.delta.x,this.delta.z);moving=true;
      }
      this.followTarget.lerp(new THREE.Vector3(this.position.x,1.2,this.position.z),1-Math.exp(-dt*7));
      this.resize(innerWidth,innerHeight);
    }
    this.walk.setEffectiveWeight(moving?1:0);this.idle.setEffectiveWeight(moving?0:1);this.mixer.update(dt);
  }
}
