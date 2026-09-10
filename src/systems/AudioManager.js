import * as THREE from 'three';
import { AUDIO_SLOTS,assetURL } from '../assets.js';

export class AudioManager {
  constructor(camera,root) {
    this.listener=new THREE.AudioListener();camera.add(this.listener);this.root=root;
    this.buffers=new Map();this.loops=new Map();this.voices=[];this.missing=[];this.muted=false;
  }
  async load() {
    const loader=new THREE.AudioLoader();
    await Promise.all(AUDIO_SLOTS.map(async slot=>{
      try{this.buffers.set(slot.id,await loader.loadAsync(assetURL(slot.file,'audio')));}
      catch{this.missing.push(slot.file);}
    }));
    if(this.buffers.has('music')&&!this.music){
      // A soundtrack belongs to the listener, independent of camera distance or XR scale.
      this.music=new THREE.Audio(this.listener);
      this.music.setBuffer(this.buffers.get('music')).setLoop(true).setVolume(.12);
      this.music.play();
    }
  }
  async unlock(){await this.listener.context.resume();}
  setCamera(camera){camera.add(this.listener);}
  mute(){this.muted=!this.muted;this.listener.setMasterVolume(this.muted?0:1);return this.muted;}
  play(id,position=null,loop=false) {
    if(!this.buffers.has(id)||this.voices.length>=16||this.loops.has(id))return;
    const sound=new THREE.PositionalAudio(this.listener);sound.setBuffer(this.buffers.get(id));
    sound.setRefDistance(2);sound.setMaxDistance(18);sound.setRolloffFactor(.7);sound.setVolume(loop?.12:.35);sound.setLoop(loop);
    if(position)sound.position.copy(position);else sound.position.set(0,1.5,0);
    this.root.add(sound);this.voices.push(sound);if(loop)this.loops.set(id,sound);sound.play();
  }
  update(puzzles) {
    this.voices=this.voices.filter(sound=>{if(sound.isPlaying)return true;sound.disconnect();sound.removeFromParent();return false;});
    this.play(puzzles.escaped?'escape':'ambience',null,true);
    if(puzzles.power.online&&!puzzles.escaped){this.play('electrical-hum',new THREE.Vector3(-3,1,2),true);this.play('ventilation',null,true);}
    if(puzzles.power.online&&!puzzles.escaped){
      this.play('pressure',new THREE.Vector3(-3.6,1,-2.3),true);
      const deviation=puzzles.pressure.readings.reduce((sum,value)=>sum+Math.abs(value-50),0)/150;
      this.loops.get('pressure')?.setVolume(.04+Math.min(1,deviation)*.1);
    }
    if(puzzles.escaped)for(const [id,sound] of this.loops)if(id!=='escape'){sound.stop();this.loops.delete(id);}
  }
  feedback(event,position) {
    if(!event.ok||event.error){this.play('error',position);return;}
    const type=event.action.type;
    this.play(({power:'relay',pressure:'valve',symbol:'keypad',key:'keypad',safety:'bolts',wheel:'bolts',release:'door',prop:'relay',evidence:'relay'})[type]??'confirm',position);
    if(event.changed){this.play('confirm',position);if(event.state==='POWER_ON')this.play('generator-start',position);}
  }
}
