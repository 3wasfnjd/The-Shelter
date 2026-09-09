import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { assetURL } from '../assets.js';

export class AssetManager {
  constructor() { this.loader = new GLTFLoader(); this.cache = new Map(); }
  load(file) {
    if (!this.cache.has(file)) this.cache.set(file, this.loader.loadAsync(assetURL(file)));
    return this.cache.get(file);
  }
  async loadSlots(slots, progress) {
    let completed = 0;
    const loaded = new Map(); const problems = [];
    // Bounded concurrency avoids flooding mobile devices with large simultaneous decodes.
    const queue = [...slots];
    await Promise.all(Array.from({ length: Math.min(3, slots.length) }, async () => {
      while (queue.length) {
        const slot = queue.shift();
        try {
          const gltf = await this.load(slot.file);
          const missing = slot.nodes.filter(name => !gltf.scene.getObjectByName(name));
          const clips = (slot.animations ?? []).filter(name => !gltf.animations.some(clip => clip.name === name));
          if (missing.length || clips.length) throw new Error(`Missing nodes/clips: ${[...missing,...clips].join(', ')}`);
          const instance = clone(gltf.scene);
          instance.traverse(object => {
            if (!object.isMesh) return;
            object.castShadow = true; object.receiveShadow = true;
            // Keep geometry shared; isolate materials for per-instance indicator feedback.
            object.material = Array.isArray(object.material) ? object.material.map(m => m.clone()) : object.material.clone();
          });
          loaded.set(slot.id, { root: instance, animations: gltf.animations });
        } catch (error) { problems.push({ slot, message: error.message }); }
        progress(++completed / slots.length);
      }
    }));
    return { loaded, problems };
  }
}
