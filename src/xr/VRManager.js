import * as THREE from 'three';

export class VRManager {
  constructor(renderer,scene,bunker,player,interaction,puzzles,enterMode,exitMode,notice) {
    Object.assign(this,{renderer,scene,bunker,player,interaction,puzzles,enterMode,exitMode,notice});
    this.camera=new THREE.PerspectiveCamera(60,1,.05,80);this.rig=new THREE.Group();this.rig.add(this.camera);scene.add(this.rig);
    this.controllers=[];this.sources=new Map();this.grabs=new Map();this.contacts=new Map();this.snapReady=true;
    for(let i=0;i<2;i++){
      const controller=renderer.xr.getController(i);this.rig.add(controller);this.controllers.push(controller);
      controller.addEventListener('connected',event=>this.sources.set(controller,event.data));
      controller.addEventListener('disconnected',()=>{this.sources.delete(controller);this.release(controller);});
      controller.addEventListener('selectstart',()=>this.select(controller));
      controller.addEventListener('squeezestart',()=>this.grab(controller));
      controller.addEventListener('squeezeend',()=>this.release(controller));
    }
    this.position=new THREE.Vector3();this.direction=new THREE.Vector3();this.ray=new THREE.Raycaster();
  }
  async start() {
    if(this.renderer.xr.isPresenting||this.starting)return;
    this.starting=true;let session;
    try{
      session=await navigator.xr.requestSession('immersive-vr',{requiredFeatures:['local-floor']});
      this.renderer.xr.setReferenceSpaceType('local-floor');
      this.rig.position.copy(this.player.position);this.rig.position.y=0;this.rig.rotation.set(0,0,0);
      this.camera.position.set(0,0,0);this.camera.rotation.set(0,0,0);
      this.session=session;session.addEventListener('end',()=>this.end(),{once:true});
      this.enterMode('vr',this.camera);await this.renderer.xr.setSession(session);
    }catch(error){if(session)await session.end();this.notice(`تعذر بدء VR: ${error.message}`);}
    finally{this.starting=false;}
  }
  end(){this.session=null;for(const controller of this.controllers)this.release(controller);this.contacts.clear();this.interaction.highlight(null);this.exitMode();}
  release(controller){
    const held=this.grabs.get(controller);
    if(held?.rest){held.rest.parent.add(held.target.object);held.target.object.position.copy(held.rest.position);held.target.object.quaternion.copy(held.rest.quaternion);held.target.object.scale.copy(held.rest.scale);}
    this.grabs.delete(controller);
  }
  target(controller) {
    controller.updateWorldMatrix(true,false);controller.getWorldPosition(this.position);
    this.direction.set(0,0,-1).applyQuaternion(controller.getWorldQuaternion(new THREE.Quaternion()));
    this.ray.set(this.position,this.direction);return this.interaction.pick(this.ray);
  }
  pulse(controller) {
    const actuator=this.sources.get(controller)?.gamepad?.hapticActuators?.[0];
    if(actuator)Promise.resolve(actuator.pulse(.25,45)).catch(()=>{});
  }
  select(controller) {
    if(!this.session)return;
    const target=this.target(controller);
    if(this.interaction.activate(target,1,this.position.clone()))this.pulse(controller);
  }
  grab(controller) {
    if(!this.session)return;
    const target=this.target(controller);
    if(!target||!this.interaction.reachable(target,this.position.clone()))return;
    const held={target,quaternion:controller.getWorldQuaternion(new THREE.Quaternion()),position:this.position.clone()};
    if(target.kind==='inspect'){
      if(!this.interaction.activate(target,1,this.position.clone()))return;
      held.rest={parent:target.object.parent,position:target.object.position.clone(),quaternion:target.object.quaternion.clone(),scale:target.object.scale.clone()};
      controller.attach(target.object);target.object.position.set(0,0,-.2);
    }
    this.grabs.set(controller,held);
  }
  update(dt) {
    if(!this.session)return;
    let highlighted=null;
    for(const controller of this.controllers){
      const source=this.sources.get(controller);if(!source)continue;
      const axes=source.gamepad?.axes??[];
      if(source.handedness==='left'&&axes.length>=4){
        const x=Math.abs(axes[2])>.15?axes[2]:0,z=Math.abs(axes[3])>.15?axes[3]:0;
        if(x||z){
          const head=this.renderer.xr.getCamera();
          const forward=new THREE.Vector3(0,0,-1).applyQuaternion(head.getWorldQuaternion(new THREE.Quaternion()));forward.y=0;forward.normalize();
          const right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0));
          const delta=right.multiplyScalar(x).addScaledVector(forward,-z).clampLength(0,1).multiplyScalar(dt*1.6);
          const headPosition=head.getWorldPosition(new THREE.Vector3());const next=headPosition.clone();
          this.player.move(next,delta,this.puzzles.door.phase==='OPEN');this.rig.position.add(next.sub(headPosition));
        }
      }
      if(source.handedness==='right'&&axes.length>=4){
        if(Math.abs(axes[2])<.3)this.snapReady=true;
        if(Math.abs(axes[2])>.7&&this.snapReady){
          const head=this.renderer.xr.getCamera().getWorldPosition(new THREE.Vector3());
          this.rig.rotation.y-=Math.sign(axes[2])*Math.PI/6;this.rig.updateMatrixWorld(true);
          const after=this.renderer.xr.getCamera().getWorldPosition(new THREE.Vector3());this.rig.position.add(head.sub(after));this.snapReady=false;
        }
      }
      const target=this.target(controller);if(target&&this.interaction.reachable(target,this.position.clone()))highlighted=target;
      const hold=this.grabs.get(controller);
      if(hold){
        const current=controller.getWorldQuaternion(new THREE.Quaternion());
        const delta=hold.quaternion.clone().invert().multiply(current);
        const angle=2*Math.atan2(delta.z,delta.w);
        if(hold.target.kind==='rotate'&&Math.abs(angle)>.45){
          if(this.interaction.activate(hold.target,angle<0?1:-1,this.position.clone()))this.pulse(controller);
          hold.quaternion.copy(current);
        }else if(hold.target.kind==='pull'&&this.position.distanceTo(hold.position)>.12){
          if(this.interaction.activate(hold.target,1,this.position.clone()))this.pulse(controller);this.grabs.delete(controller);
        }
      }
      // Direct close-range press, with withdrawal required before another press.
      const tip=controller.getWorldPosition(new THREE.Vector3());
      const near=this.bunker.targets.find(t=>t.kind==='press'&&this.interaction.visible(t.object)&&new THREE.Box3().setFromObject(t.object).distanceToPoint(tip)<.025);
      if(near&&this.contacts.get(controller)!==near){
        if(this.interaction.activate(near,1,tip))this.pulse(controller);
      }
      this.contacts.set(controller,near??null);
    }
    this.interaction.highlight(highlighted);
    const head=this.renderer.xr.getCamera().getWorldPosition(new THREE.Vector3());
    if(head.x>1.85&&head.x<3.45&&head.z< -6.1)this.puzzles.dispatch({type:'escape'});
  }
}
