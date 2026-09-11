import * as THREE from 'three';

// A small room grid; every edge is sampled against the same character collider.
export function roomPath(player,goal,doorOpen){
  const start=player.position.clone();goal=goal.clone().setY(start.y);
  const clear=(a,b)=>{
    const count=Math.max(1,Math.ceil(a.distanceTo(b)/.08));
    for(let i=1;i<=count;i++){
      const t=i/count;
      if(!player.canStand(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,doorOpen))return false;
    }
    return true;
  };
  if(!player.canStand(goal.x,goal.z,doorOpen))return [];
  if(clear(start,goal))return [goal];
  const step=.25,queue=[start],parents=[-1],seen=new Set();
  const key=p=>`${Math.round(p.x/step)},${Math.round(p.z/step)}`;
  seen.add(key(start));
  for(let cursor=0;cursor<queue.length&&cursor<4000;cursor++){
    const point=queue[cursor];
    if(clear(point,goal)){
      const path=[goal];for(let index=cursor;index>0;index=parents[index])path.unshift(queue[index]);
      return path;
    }
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const next=point.clone().add(new THREE.Vector3(dx*step,0,dz*step)),id=key(next);
      if(seen.has(id)||!clear(point,next))continue;
      seen.add(id);parents.push(cursor);queue.push(next);
    }
  }
  return [];
}
