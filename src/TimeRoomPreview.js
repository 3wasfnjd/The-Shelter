import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

export async function startTimeRoomPreview(){
  const loading=document.querySelector('#loading');
  document.querySelector('#loading-status').textContent='تحميل تجربة غرفة الزمن…';
  const model=await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}assets/previews/time-room.glb`,event=>{
    if(event.total)document.querySelector('#progress').value=event.loaded/event.total;
  });
  const renderer=new THREE.WebGLRenderer({canvas:document.querySelector('#game'),antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#222a2d');
  const root=model.scene;scene.add(root);root.updateMatrixWorld(true);
  const original=new THREE.Box3().setFromObject(root),size=original.getSize(new THREE.Vector3());
  root.scale.multiplyScalar(10/Math.max(size.x,size.z));root.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(root),center=box.getCenter(new THREE.Vector3());
  root.position.sub(new THREE.Vector3(center.x,box.min.y,center.z));root.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(root);const target=bounds.getCenter(new THREE.Vector3());
  const roof=root.getObjectByName('Roof'),walls=root.getObjectByName('Walls');
  if(roof)roof.visible=false;
  scene.add(new THREE.HemisphereLight(0xe0efff,0x70624e,2));
  const key=new THREE.DirectionalLight(0xffe1af,3);key.position.set(4,10,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0xb9d9ff,1.5);fill.position.set(-5,6,-4);scene.add(fill);
  const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.05,150);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);
  controls.enableDamping=true;controls.minDistance=2;controls.maxDistance=60;controls.maxPolarAngle=Math.PI*.85;
  const fit=()=>{
    const radius=bounds.getSize(new THREE.Vector3()).length()/2;
    const angle=Math.min(THREE.MathUtils.degToRad(camera.fov/2),Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect));
    camera.position.copy(target).add(new THREE.Vector3(1,.85,1).normalize().multiplyScalar(radius/Math.sin(angle)*1.08));controls.target.copy(target);controls.update();
  };
  fit();
  const panel=document.createElement('aside');panel.className='time-preview-panel';panel.dir='rtl';
  panel.innerHTML='<strong>تجربة غرفة الزمن</strong><p>اسحب للدوران · قرّب بإصبعين. هذه معاينة للموديل قبل تركيب الألغاز.</p><div><button data-roof>إظهار السقف</button><button data-walls>إخفاء الجدران</button><button data-fit>عرض الغرفة كاملة</button><a href="./">العودة للعبة</a></div><small>Time-Room — Claudio · CC BY 4.0 · خامات مخففة للمعاينة</small>';
  const roofButton=panel.querySelector('[data-roof]');roofButton.disabled=!roof;
  roofButton.onclick=()=>{roof.visible=!roof.visible;roofButton.textContent=roof.visible?'إخفاء السقف':'إظهار السقف';};
  const wallsButton=panel.querySelector('[data-walls]');wallsButton.disabled=!walls;
  wallsButton.onclick=()=>{walls.visible=!walls.visible;wallsButton.textContent=walls.visible?'إخفاء الجدران':'إظهار الجدران';};
  panel.querySelector('[data-fit]').onclick=fit;document.body.append(panel);loading.hidden=true;
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
  renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
}
