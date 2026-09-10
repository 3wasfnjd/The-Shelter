import {NodeIO} from '@gltf-transform/core';
import {getBounds,prune,dedup} from '@gltf-transform/functions';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const source=process.argv[2];if(!source)throw Error('Pass low_poly_electrical_wirespipe_set.glb');
const io=new NodeIO(),doc=await io.read(source),scene=doc.getRoot().listScenes()[0];
const parts=doc.getRoot().listNodes().find(n=>n.getName()==='RootNode');
if(!parts)throw Error('Expected source kit hierarchy');
// Keep the artist-authored example assembly, not the spare-parts catalogue.
for(const child of [...parts.listChildren()])if(!/^(ExamplePipe|Tiny_Straight)/.test(child.getName()))parts.removeChild(child);
await doc.transform(prune());
const {min,max}=getBounds(scene),scale=2.3/(max[2]-min[2]);
const centered=doc.createNode('CenteredPipeAssembly').setScale([scale,scale,scale]).setTranslation(min.map((v,i)=>-(v+max[i])/2*scale));
for(const child of [...scene.listChildren()]){scene.removeChild(child);centered.addChild(child);}
const wall=doc.createNode('DecorativePipeNetwork').setRotation([0,-Math.SQRT1_2,0,Math.SQRT1_2]);wall.addChild(centered);scene.addChild(wall);
for(const texture of doc.getRoot().listTextures()){
 const image=await loadImage(Buffer.from(texture.getImage()));const ratio=Math.min(1,512/Math.max(image.width,image.height));
 const canvas=createCanvas(Math.max(1,Math.round(image.width*ratio)),Math.max(1,Math.round(image.height*ratio)));
 canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
 texture.setImage(canvas.toBuffer('image/png')).setMimeType('image/png');
}
await doc.transform(dedup(),prune());
await io.write('public/assets/models/decorative-pipes.glb',doc);
console.log('Prepared wall network:',getBounds(scene));
