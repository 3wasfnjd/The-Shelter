// User-supplied artwork, retained as a single noninteractive cable bundle.
import {NodeIO} from '@gltf-transform/core';
import {getBounds} from '@gltf-transform/functions';
const source=process.argv[2];
if(!source)throw new Error('Pass the original bunch_of_electric_wires.glb path');
const io=new NodeIO(),doc=await io.read(source),scene=doc.getRoot().listScenes()[0];
const {min,max}=getBounds(scene),scale=1.4/(max[0]-min[0]);
const centered=doc.createNode('CenteredWireArt').setTranslation(min.map((v,i)=>-(v+max[i])/2*scale)).setScale([scale,scale,scale]);
for(const child of [...scene.listChildren()]){scene.removeChild(child);centered.addChild(child);}
// Original lies on XZ; hang it on the left wall in YZ with outward-facing detail.
const wall=doc.createNode('DecorativeWireBundle').setRotation([0,0,-Math.SQRT1_2,Math.SQRT1_2]);
wall.addChild(centered);scene.addChild(wall);
await io.write('public/assets/models/decorative-wires.glb',doc);
console.log('Wall decoration bounds:',getBounds(scene));
