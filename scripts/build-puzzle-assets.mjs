/** Original lightweight replacement assets, authored as GLB meshes offline. */
import {Document,NodeIO} from '@gltf-transform/core';
import {dedup,prune,unpartition,mergeDocuments} from '@gltf-transform/functions';
import {createCanvas} from '@napi-rs/canvas';
import {mkdir,writeFile} from 'node:fs/promises';
const out='public/assets/models';await mkdir(out,{recursive:true});const io=new NodeIO();
const colors={olive:[.22,.28,.16,1],steel:[.16,.20,.19,1],edge:[.36,.40,.32,1],dark:[.055,.08,.07,1],cream:[.69,.66,.47,1],yellow:[.72,.49,.12,1],red:[.52,.10,.07,1],green:[.2,.58,.34,1],paper:[.77,.73,.57,1]};
function asset(){const doc=new Document();return{doc,buffer:doc.createBuffer(),scene:doc.createScene('Bunker17'),materials:new Map()};}
function material(a,key){if(!a.materials.has(key))a.materials.set(key,a.doc.createMaterial(key).setBaseColorFactor(colors[key]??colors.olive).setRoughnessFactor(.82).setMetallicFactor(.12));return a.materials.get(key);}
function mesh(a,name,positions,indices,mat,uvs=null){
 const p=[],n=[],uv=[];for(let i=0;i<indices.length;i+=3){const ids=indices.slice(i,i+3),v=ids.map(id=>positions.slice(id*3,id*3+3));
 const ab=v[1].map((x,j)=>x-v[0][j]),ac=v[2].map((x,j)=>x-v[0][j]);let normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];const length=Math.hypot(...normal)||1;normal=normal.map(x=>x/length);
 for(let j=0;j<3;j++){p.push(...v[j]);n.push(...normal);if(uvs)uv.push(...uvs.slice(ids[j]*2,ids[j]*2+2));}}
 const primitive=a.doc.createPrimitive().setAttribute('POSITION',a.doc.createAccessor().setType('VEC3').setArray(new Float32Array(p)).setBuffer(a.buffer)).setAttribute('NORMAL',a.doc.createAccessor().setType('VEC3').setArray(new Float32Array(n)).setBuffer(a.buffer)).setMaterial(typeof mat==='string'?material(a,mat):mat);
 if(uvs)primitive.setAttribute('TEXCOORD_0',a.doc.createAccessor().setType('VEC2').setArray(new Float32Array(uv)).setBuffer(a.buffer));
 return a.doc.createMesh(name).addPrimitive(primitive);
}
function node(a,name,parent=a.scene,pos=[0,0,0]){const n=a.doc.createNode(name).setTranslation(pos);parent.addChild(n);return n;}
function slab(a,name,w,h,d,pos,mat='olive',parent=a.scene,b=.035){
 b=Math.min(b,w/5,h/5,d/3);const p=[],ids=[];
 for(const [z,inset] of [[-d/2,b],[-d/2+b,0],[d/2-b,0],[d/2,b]]){const x=w/2-inset,y=h/2-inset,c=Math.min(.06,w/6,h/6);for(const [px,py] of [[-x+c,-y],[x-c,-y],[x,-y+c],[x,y-c],[x-c,y],[-x+c,y],[-x,y-c],[-x,-y+c]])p.push(px,py,z);}
 for(let layer=0;layer<3;layer++)for(let j=0;j<8;j++){const u=layer*8+j,v=layer*8+(j+1)%8;ids.push(u,v,v+8,u,v+8,u+8);}
 for(let j=1;j<7;j++){ids.push(0,j+1,j);ids.push(24,24+j,24+j+1);}
 return node(a,name,parent,pos).setMesh(mesh(a,name,p,ids,mat));
}
function rod(a,name,points,r,mat='steel',parent=a.scene,sides=8){
 const p=[],ids=[];
 for(let i=0;i<points.length;i++){
 const tangent=points[Math.min(i+1,points.length-1)].map((v,j)=>v-points[Math.max(0,i-1)][j]);let axis=Math.abs(tangent[1])>Math.abs(tangent[0])?[1,0,0]:[0,1,0];
 let u=[tangent[1]*axis[2]-tangent[2]*axis[1],tangent[2]*axis[0]-tangent[0]*axis[2],tangent[0]*axis[1]-tangent[1]*axis[0]],len=Math.hypot(...u)||1;u=u.map(x=>x/len);
 len=Math.hypot(...tangent)||1;const t=tangent.map(x=>x/len);const v=[t[1]*u[2]-t[2]*u[1],t[2]*u[0]-t[0]*u[2],t[0]*u[1]-t[1]*u[0]];
 for(let j=0;j<sides;j++){const angle=j/sides*Math.PI*2;p.push(...points[i].map((x,k)=>x+r*(u[k]*Math.cos(angle)+v[k]*Math.sin(angle))));}
 }
 for(let i=0;i<points.length-1;i++)for(let j=0;j<sides;j++){const x=i*sides+j,y=i*sides+(j+1)%sides;ids.push(x,y,y+sides,x,y+sides,x+sides);}
 return node(a,name,parent).setMesh(mesh(a,name,p,ids,mat));
}
function wheel(a,name,r,pos,parent=a.scene,mat='red'){
 const root=node(a,name,parent,pos);const points=Array.from({length:17},(_,i)=>[r*Math.cos(i/16*Math.PI*2),r*Math.sin(i/16*Math.PI*2),0]);rod(a,name+'_rim',points,r*.13,mat,root);
 for(let i=0;i<4;i++){const t=i*Math.PI/2;rod(a,name+'_spoke_'+i,[[0,0,0],[r*Math.cos(t),r*Math.sin(t),0]],r*.06,'edge',root);}
 slab(a,name+'_hub',r*.36,r*.36,r*.3,[0,0,0],'steel',root);return root;
}
function label(a,name,text,w,h,pos,parent=a.scene,opts={}){
 const canvas=createCanvas(512,256),ctx=canvas.getContext('2d');ctx.fillStyle=opts.background??'#19241d';ctx.fillRect(0,0,512,256);ctx.strokeStyle='#b8ac7c';ctx.lineWidth=6;ctx.strokeRect(8,8,496,240);
 ctx.fillStyle=opts.color??'#e4dcae';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`bold ${opts.fontSize??46}px sans-serif`;
 text.split('\n').forEach((line,i,lines)=>ctx.fillText(line,256,128+(i-(lines.length-1)/2)*(opts.spacing??62),476));
 const texture=a.doc.createTexture(name).setImage(canvas.toBuffer('image/png')).setMimeType('image/png');
 const mat=a.doc.createMaterial(name).setBaseColorTexture(texture).setRoughnessFactor(.95).setDoubleSided(true);
 const positions=[-w/2,-h/2,0,w/2,-h/2,0,w/2,h/2,0,-w/2,h/2,0];
 return node(a,name,parent,pos).setMesh(mesh(a,name,positions,[0,1,2,0,2,3],mat,[0,1,1,1,1,0,0,0]));
}
function lamp(a,name,pos,parent=a.scene){return slab(a,name,.1,.07,.04,pos,'red',parent,.01);}
function bolts(a,parent,x,y,z){for(const dx of [-x,x])for(const dy of [-y,y])slab(a,'Rivet',.035,.035,.035,[dx,dy,z],'edge',parent,.006);}
async function save(a,name){await a.doc.transform(dedup(),prune(),unpartition());await io.write(`${out}/${name}.glb`,a.doc);}
// Backing sheets close the modular kit's structural gaps without changing its authored ribs.
{
 const doc=await io.read(out+'/bunker-shell.glb');
 for(const n of doc.getRoot().listNodes())if(n.getName().startsWith('Backing_'))n.dispose();
 const a={doc,buffer:doc.getRoot().listBuffers()[0]??doc.createBuffer(),scene:doc.getRoot().listScenes()[0],materials:new Map()};
 const front=doc.getRoot().listNodes().find(n=>n.getName()==='FrontWall');
 for(let i=0;i<4;i++)slab(a,`Backing_Back_${i}`,1.51,3.78,.04,[-3.75+i*1.5,1.9,-5.64],'olive');
 slab(a,'Backing_ExitRight',.81,3.78,.04,[4.1,1.9,-5.64],'olive');
 for(let i=0;i<7;i++)for(const side of [-1,1]){
 const n=slab(a,`Backing_Side_${side}_${i}`,11/7+.01,3.78,.04,[side*4.64,1.9,-4.714+i*11/7],'olive',side===1?front:a.scene);
 n.setRotation([0,Math.sin(Math.PI/4),0,Math.cos(Math.PI/4)]);
 }
 for(let i=0;i<6;i++)slab(a,`Backing_Front_${i}`,1.51,3.78,.04,[-3.75+i*1.5,1.9,5.64],'olive',front);
 await save(a,'bunker-shell');
}
// POWER: 3x2 rotatable circuit tiles, with real visible directional traces.
{
 const a=asset();slab(a,'Generator',.95,.68,.75,[0,.34,-.06],'olive');
 for(let i=0;i<6;i++)slab(a,'GeneratorVent',.6,.025,.03,[0,.18+i*.075,.33],'dark');
 wheel(a,'GeneratorRotor',.16,[0,.4,.36],a.scene,'edge');
 slab(a,'PowerCabinet',1.12,1.03,.16,[0,1.38,0],'steel');bolts(a,a.scene,.5,.4,.1);
 const ports=[[1,3],[2,3],[0,2],[0,1],[0,1],[1,3]];
 for(let i=0;i<6;i++){
 const tile=slab(a,`Module_${i}`,.30,.30,.08,[-.35+(i%3)*.35,1.65-Math.floor(i/3)*.35,.13],'edge');
 const trace=node(a,`Trace_${i}`,tile,[0,0,.051]);
 for(const port of ports[i])rod(a,`Conductor_${i}_${port}`,[[0,0,0],[[0,.15,0],[.15,0,0],[0,-.15,0],[-.15,0,0]][port]],.023,'yellow',trace,6);
 }
 label(a,'GeneratorLabel','GENERATOR  >',.55,.14,[-.30,.94,.105]);label(a,'OutputLabel','> CONTROL',.45,.14,[.32,.94,.105]);
 label(a,'PowerTitle','01  /  POWER BUS',1.1,.18,[0,2.0,.12]);lamp(a,'PowerIndicator',[.47,1.99,.14]);
 await save(a,'power-station');
}
// PRESSURE: purpose-authored bent pipe mesh, individual valve wheels and needles.
{
 const a=asset();slab(a,'PipeBackplate',2.05,1.9,.09,[0,1.25,-.18],'steel');
 for(let i=0;i<3;i++){
 const x=-.68+i*.68;
 rod(a,`CoolingLine_${i}`,[[x,.15,-.04],[x,.45,.02],[x,1.45,.02],[x+.15,1.65,.02],[x+.15,2.15,.02]],.045,'edge');
 const v=wheel(a,`Valve_${i}`,.22,[x,1.0,.18]);
 label(a,`ValveName_${i}`,String.fromCharCode(65+i),.16,.12,[0,0,.06],v);
 const face=slab(a,`Gauge_${i}`,.43,.43,.065,[x,1.72,.11],'cream');
 const canvas=createCanvas(256,256),ctx=canvas.getContext('2d');ctx.fillStyle='#d4cfac';ctx.fillRect(0,0,256,256);ctx.strokeStyle='#477750';ctx.lineWidth=24;
 const start=Math.PI*.75;ctx.beginPath();ctx.arc(128,128,91,start+.45*Math.PI*1.5,start+.55*Math.PI*1.5);ctx.stroke();ctx.strokeStyle='#303b30';ctx.lineWidth=3;
 for(let tick=0;tick<=10;tick++){const t=start+tick/10*Math.PI*1.5;ctx.beginPath();ctx.moveTo(128+Math.cos(t)*85,128+Math.sin(t)*85);ctx.lineTo(128+Math.cos(t)*103,128+Math.sin(t)*103);ctx.stroke();}
 ctx.fillStyle='#293429';ctx.font='bold 24px sans-serif';ctx.textAlign='center';ctx.fillText('45–55 PSI',128,205);
 const texture=a.doc.createTexture('PressureDial').setImage(canvas.toBuffer('image/png')).setMimeType('image/png');const m=a.doc.createMaterial('Dial').setBaseColorTexture(texture).setRoughnessFactor(.9);
 node(a,'DialFace',face,[0,0,.036]).setMesh(mesh(a,'Dial',[-.19,-.19,0,.19,-.19,0,.19,.19,0,-.19,.19,0],[0,1,2,0,2,3],m,[0,1,1,1,1,0,0,0]));
 const needle=node(a,`Needle_${i}`,face,[0,0,.05]);rod(a,'NeedlePointer',[[0,0,0],[-.12,-.12,0]],.012,'red',needle,4);lamp(a,`PressureIndicator_${i}`,[x,1.39,.13]);
 }
 label(a,'PressureTitle','02  /  COOLING',1.7,.18,[0,2.32,.06]);
 label(a,'CouplingClue','A: +10 / -5 / +5\nB: +5 / +10 / -5\nC: -5 / +5 / +10',1.65,.45,[0,.42,.07],a.scene,{fontSize:34,spacing:68});
 await save(a,'pressure-station');
}
// STORAGE: segmented shell and hinged door (contents genuinely occluded when closed).
{
 const a=asset();
 for(const x of [-1.0,-.05,1.0])slab(a,'CabinetSide',.08,2.1,.65,[x,1.05,-.10]);
 slab(a,'CabinetBack',2.1,2.1,.08,[0,1.05,-.43]);
 for(const y of [.06,1.02,2.08])slab(a,'Shelf',2.1,.075,.65,[0,y,-.10],'edge');
 const door=node(a,'LockerDoor',a.scene,[-1.02,1.05,.26]);slab(a,'LockerLeaf',.94,2.02,.065,[.47,0,0],'olive',door);
 const handle=node(a,'LockerHandle',door,[.8,0,.08]);rod(a,'LockerPull',[[0,-.13,0],[0,-.13,.05],[0,.13,.05],[0,.13,0]],.02,'cream',handle);
 label(a,'EmergencyTitle','EMERGENCY',.78,.20,[.47,.64,.042],door);
 label(a,'Clue_emergency','△  —  2\nSTAFF / 17',.65,.36,[-.5,1.48,-.20],a.scene,{background:'#c3b98d',color:'#273229'});
 label(a,'Clue_maintenance','○  —  4\nMAINTENANCE',.72,.38,[.49,1.48,.01],a.scene,{background:'#c3b98d',color:'#273229'});
 slab(a,'SurvivalCase',.7,.4,.45,[.48,.30,-.08],'steel');label(a,'KitMark','17 / RESERVE',.55,.14,[.48,.33,.154]);
 await save(a,'military-storage');
}
// WORKBENCH: slotted drawer and separate readable documents.
{
 const a=asset();slab(a,'Worktop',2.2,.14,1.25,[0,1.02,0],'edge');
 for(const x of [-.95,.95])for(const z of [-.47,.47])slab(a,'BenchLeg',.10,.96,.10,[x,.48,z],'steel');
 slab(a,'DrawerHousingBack',1.08,.35,.08,[0,.78,-.2],'steel');
 for(const x of [-.52,.52])slab(a,'DrawerSide',.08,.35,.65,[x,.78,.16],'steel');
 const drawer=node(a,'Drawer',a.scene,[0,.63,.18]);slab(a,'DrawerBottom',.95,.05,.57,[0,0,0],'dark',drawer);
 slab(a,'DrawerFront',1.05,.34,.07,[0,.13,.32],'olive',drawer);
 const handle=node(a,'DrawerHandle',drawer,[0,.13,.39]);rod(a,'DrawerPull',[[-.16,0,0],[-.16,0,.03],[.16,0,.03],[.16,0,0]],.018,'cream',handle);
 const memo=label(a,'Clue_memo','✕  —  3\nDESK NOTE',.6,.3,[0,.03,.02],drawer,{background:'#c3b98d',color:'#273229'});memo.setRotation([-Math.sin(Math.PI/4),0,0,Math.cos(Math.PI/4)]);
 const book=slab(a,'OperationsBook',.62,.045,.40,[-.5,1.11,.22],'olive');
 const clue=label(a,'Clue_operations','III  —  1\nOPERATIONS',.55,.33,[-.5,1.14,.22],a.scene,{background:'#c3b98d',color:'#273229'});clue.setRotation([-Math.sin(Math.PI/4),0,0,Math.cos(Math.PI/4)]);
 label(a,'WorkbenchLabel','B17 / MAINTENANCE',1.2,.16,[0,.98,.639]);await save(a,'workbench');
}
// CONTROL: physical symbol keys and a replaceable, UV-mapped diegetic screen.
{
 const a=asset();slab(a,'ConsoleBase',2.15,1.0,.72,[0,.5,0]);slab(a,'ConsoleDeck',2.25,.12,.9,[0,1.05,.1],'edge');
 slab(a,'CRTHousing',1.3,.87,.42,[0,1.60,-.14],'steel');label(a,'CRTScreen','BUNKER 17',1.1,.65,[0,1.60,.078]);
 for(const [i,symbol] of ['III','△','✕','○'].entries()){
 const button=slab(a,`Symbol_${i}`,.30,.25,.08,[-.66+i*.44,1.12,.58],'cream');label(a,`SymbolLabel_${i}`,symbol,.24,.18,[0,0,.043],button,{fontSize:82});
 }
 const reset=slab(a,'ResetButton',.25,.20,.08,[.92,1.40,.28],'red');label(a,'ResetLabel','RESET',.22,.13,[0,0,.044],reset,{fontSize:43});
 lamp(a,'SecurityIndicator',[.91,1.71,.11]);label(a,'ConsoleTitle','04  /  SECURITY',1.55,.19,[0,2.13,.07]);await save(a,'control-console');
}
// BLAST DOOR: frame-mounted keypad; door-mounted moving locks and hardware.
{
 const a=asset();for(const x of [-1.13,1.13])slab(a,'DoorFrame',.20,3.1,.30,[x,1.55,0],'edge');slab(a,'DoorHeader',2.45,.22,.30,[0,3.08,0],'edge');
 slab(a,'DoorPocketCover',2.15,3.05,.16,[-2.19,1.525,.29],'steel');
 const door=slab(a,'DoorLeaf',2.05,2.96,.20,[0,1.48,.0],'olive');
 for(const y of [-.95,.95])slab(a,'Reinforcement',1.7,.14,.08,[0,y,.14],'edge',door);
 wheel(a,'LockingWheel',.34,[0,0,.23],door,'yellow');
 const lock=slab(a,'SafetyLock',.20,.25,.11,[-.48,.48,.21],'red',door);
 const handle=node(a,'ReleaseHandle',door,[.55,-.40,.24]);rod(a,'MainRelease',[[0,-.2,0],[0,-.2,.08],[0,.2,.08],[0,.2,0]],.03,'cream',handle);
 for(let i=0;i<4;i++)slab(a,`Bolt_${i}`,.30,.10,.13,[i%2?.94:-.94,i<2?.94:-.94,.18],'steel',door);
 const panel=slab(a,'KeypadHousing',.49,1.25,.12,[-1.48,1.45,.45],'steel');
 for(let i=0;i<10;i++){
 const row=i===0?3:Math.floor((i-1)/3),col=i===0?1:(i-1)%3;
 const key=slab(a,`Key_${i}`,.11,.115,.055,[-.14+col*.14,.14-row*.14,.10],'cream',panel);
 label(a,`Digit_${i}`,String(i),.085,.088,[0,0,.03],key,{fontSize:100});
 }
 const clear=slab(a,'KeyClear',.11,.115,.055,[.14,-.28,.10],'red',panel);label(a,'ClearText','C',.08,.08,[0,0,.031],clear,{fontSize:92});
 label(a,'KeyDisplay','LOCKED',.40,.20,[0,.43,.068],panel);
 ['PowerLamp','PressureLamp','SecurityLamp'].forEach((name,i)=>lamp(a,name,[-.15+i*.15,-.5,.08],panel));
 label(a,'DoorTitle','BUNKER 17 / EXIT',1.85,.24,[0,3.29,.02]);lamp(a,'ExitLamp',[0,2.90,.18]);
 label(a,'DoorSteps','1 CODE  2 SAFETY\n3 WHEEL  4 RELEASE',1.25,.28,[0,-1.20,.12],door,{fontSize:37});
 await save(a,'blast-door');
}
console.log('Built six original, lightweight, individually articulated puzzle station GLBs.');
