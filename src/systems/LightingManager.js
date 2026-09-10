import * as THREE from 'three';
export class LightingManager {
  constructor(scene,bunker) {
    this.fill=new THREE.HemisphereLight(0xbccbd8,0x72604b,1.45);scene.add(this.fill);
    this.key=new THREE.DirectionalLight(0xffd8aa,2.1);this.key.position.set(3,9,5);
    this.key.castShadow=true;this.key.shadow.mapSize.set(1024,1024);
    Object.assign(this.key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.1,far:35});
    this.key.shadow.bias=-.0005;this.key.shadow.normalBias=.025;scene.add(this.key);
    this.practicals=[[-2,3.3,-2],[2,3.3,2]].map(position=>{
      const light=new THREE.PointLight(0xffc47d,0,11,2);light.position.fromArray(position);bunker.root.add(light);return light;
    });
    this.emergency=new THREE.PointLight(0xff3e25,10,8,2);this.emergency.position.set(-3,2.8,3);bunker.root.add(this.emergency);
    this.exit=new THREE.PointLight(0xfff5da,0,8,2);this.exit.position.set(2.65,2,-6.4);bunker.root.add(this.exit);
  }
  update(puzzles,dt,mode) {
    const t=1-Math.exp(-dt*2);
    this.powerBlend=THREE.MathUtils.lerp(this.powerBlend??0,puzzles.power.online?1:0,t);
    // Point-light intensity/range scale with the diorama; global fill stays readable.
    const scale=mode==='ar'?.1:1;
    for(const light of this.practicals)light.intensity=(5+this.powerBlend*30)*scale*scale;
    this.emergency.intensity=(10-8*this.powerBlend)*scale*scale;
    this.exit.intensity=puzzles.door.open*65*scale*scale;
    for(const light of [...this.practicals,this.emergency,this.exit]){light.distance=(light===this.practicals[0]||light===this.practicals[1]?11:8)*scale;}
    this.key.castShadow=mode!=='ar';
  }
}
