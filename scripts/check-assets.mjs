import { readFile } from 'node:fs/promises';
import { ASSET_SLOTS,AUDIO_SLOTS } from '../src/assets.js';
let failed=0;
for(const slot of ASSET_SLOTS){
  const path=`public/assets/models/${slot.file}`;
  try{
    const data=await readFile(path);
    if(data.readUInt32LE(0)!==0x46546c67||data.readUInt32LE(4)!==2||data.readUInt32LE(8)!==data.length)throw new Error('Invalid GLB 2.0 header');
    if(data.readUInt32LE(16)!==0x4e4f534a)throw new Error('Missing JSON chunk');
    const gltf=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString());
    const names=new Set((gltf.nodes??[]).map(n=>n.name));const clips=new Set((gltf.animations??[]).map(n=>n.name));
    const missing=[...slot.nodes.filter(n=>!names.has(n)),...(slot.animations??[]).filter(n=>!clips.has(n))];
    if(missing.length)throw new Error(`Missing required nodes/clips: ${missing.join(', ')}`);
    if(!gltf.meshes?.length)throw new Error('GLB has no visible mesh art');
    for(const entry of [...(gltf.buffers??[]),...(gltf.images??[])]){
      if(entry.uri&&!entry.uri.startsWith('data:'))throw new Error('All GLB dependencies must be embedded');
    }
    console.log(`OK ${path}`);
  }catch(error){console.error(`BLOCKED ${path}: ${error.message}`);failed++;}
}
for(const slot of AUDIO_SLOTS){try{await readFile(`public/assets/audio/${slot.file}`);}catch{console.warn(`Optional audio missing: ${slot.file}`);}}
console.log(`${failed} required model slots unresolved. ${failed?'Not ready for playable deployment.':'Model headers/nodes passed; visual and device QA still required.'}`);
process.exitCode=failed?1:0;
