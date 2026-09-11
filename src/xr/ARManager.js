import * as THREE from 'three';

export class ARManager {
  constructor(renderer,bunker,interaction,puzzles,enterMode,exitMode,notice) {
    Object.assign(this,{renderer,bunker,interaction,puzzles,enterMode,exitMode,notice});
    this.camera=new THREE.PerspectiveCamera(60,1,.01,50);this.ray=new THREE.Raycaster();this.previewPose=new THREE.Matrix4();
  }
  async start(){
    if(this.renderer.xr.isPresenting||this.starting)return;
    this.starting=true;let session;
    try{
      session=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['hit-test'],optionalFeatures:['local-floor','dom-overlay'],domOverlay:{root:document.body}});
      this.session=session;this.placed=false;this.hasPose=false;this.destination=null;
      session.addEventListener('end',()=>this.end(),{once:true});
      this.renderer.xr.setReferenceSpaceType('local');
      this.enterMode('ar',this.camera);this.bunker.root.visible=false;
      await this.renderer.xr.setSession(session);
      const viewer=await session.requestReferenceSpace('viewer');
      const source=await session.requestHitTestSource({space:viewer});
      if(this.session!==session){source?.cancel();return;}
      this.hitSource=source;
      if(!source)throw new Error('Hit testing unavailable');
      session.addEventListener('select',event=>this.select(event));
      this.notice('وجّه الجهاز إلى سطح مستوٍ، ثم اضغط لتثبيت الملجأ.');
    }catch(error){if(session)await session.end();this.notice(`تعذر بدء AR: ${error.message}`);}
    finally{this.starting=false;}
  }
  end(){
    this.hitSource?.cancel();this.hitSource=null;this.session=null;this.placed=false;
    this.bunker.root.position.set(0,0,0);this.bunker.root.quaternion.identity();this.bunker.root.scale.setScalar(1);this.bunker.root.visible=true;
    this.exitMode();
  }
  select(event){
    if(!this.session)return;
    if(!this.placed){
      if(!this.hasPose)return;
      this.placed=true;this.hitSource?.cancel();this.hitSource=null;this.notice('حدد مكانًا على أرضية الغرفة لتحريك الشخصية، أو المس جهازًا للتفاعل.');return;
    }
    const reference=this.renderer.xr.getReferenceSpace();const pose=event.frame.getPose(event.inputSource.targetRaySpace,reference);
    if(!pose)return;
    const matrix=new THREE.Matrix4().fromArray(pose.transform.matrix);
    const origin=new THREE.Vector3().setFromMatrixPosition(matrix);const direction=new THREE.Vector3(0,0,-1).transformDirection(matrix);
    this.ray.set(origin,direction);const target=this.interaction.pick(this.ray);
    // Use the actual hit point on the wheel, so both directions work without an HTML overlay.
    let turnDirection=1;
    if(target?.action.type==='pressure'&&this.interaction.lastHit){
      const local=target.object.parent.worldToLocal(this.interaction.lastHit.point.clone()).sub(target.object.position);
      turnDirection=local.x<0?-1:1;
    }
    if(target){this.interaction.activate(target,turnDirection,origin);return;}
    // Use an actual visible floor hit, never a plane through furniture or walls.
    const hit=this.interaction.lastHit;
    if(!hit)return;
    const local=this.bunker.root.worldToLocal(hit.point.clone());
    const player=this.interaction.player;
    if(Math.abs(local.y)>.18||!player.canStand(local.x,local.z,this.puzzles.door.phase==='OPEN'))return;
    this.destination=local;
  }
  movePlayer(dt){
    const player=this.interaction.player;
    if(!this.destination)return;
    const delta=this.destination.clone().sub(player.position);delta.y=0;
    const distance=delta.length();
    if(distance<.08){this.destination=null;return;}
    delta.multiplyScalar(Math.min(distance,dt*2.2)/distance);
    const before=player.position.clone();
    player.move(player.position,delta,this.puzzles.door.phase==='OPEN');
    const moved=before.distanceToSquared(player.position)>.000001;
    if(moved)player.bunker.player.rotation.y=Math.atan2(delta.x,delta.z);
    else this.destination=null;
    player.walk.setEffectiveWeight(moved?1:0);player.idle.setEffectiveWeight(moved?0:1);
    if(player.position.x>1.85&&player.position.x<3.45&&player.position.z< -6.1)this.puzzles.dispatch({type:'escape'});
  }

  update(frame,dt=0){
    if(!this.session||!frame)return;
    if(this.placed){this.movePlayer(dt);this.interaction.player.mixer.update(dt);return;}
    if(!this.hitSource)return;
    const hits=frame.getHitTestResults(this.hitSource);const pose=hits[0]?.getPose(this.renderer.xr.getReferenceSpace());
    this.hasPose=!!pose;this.bunker.root.visible=this.hasPose;
    if(!pose)return;
    this.previewPose.fromArray(pose.transform.matrix);
    this.previewPose.decompose(this.bunker.root.position,this.bunker.root.quaternion,this.bunker.root.scale);
    this.bunker.root.scale.setScalar(.1); // 1.1 m room length, 1.25 m including exit corridor.
  }
}
