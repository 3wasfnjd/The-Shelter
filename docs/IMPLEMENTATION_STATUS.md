# BUNKER 17 implementation status — 2026-09-10

All nine runtime model slots now contain GLBs. The earlier asset-blocked state has been resolved with assets selected from The-Shelter2 and user-authorized original lightweight puzzle models. This is a first playable prototype, with replaceable art, not a final commercial-quality environment.

The original README and `GAME_DESIGN_AR.md` were retained. The game continues to use one military low-poly cutaway control room, shared puzzle state and the documented five-puzzle progression.

## Assets

- Source repository: `3wasfnjd/The-Shelter2`, exact revision and source paths in `public/assets/models/selection.json`.
- Kenney character FBX converted to a self-contained GLB with skinning and Idle/Walk clips. Walk uses the supplied Run clip at reduced speed. The character texture is vertically corrected for glTF UV conventions.
- Quaternius modular architecture and selected Kenney props use a restrained matte military palette. Referenced texture paths in Quaternius were broken in the source repository; unused texture references were removed during the deliberate matte adaptation. Geometry is preserved and embedded.
- Original lightweight GLBs: power panel/generator, coupled pressure station, hinged emergency storage, workbench/drawer/clues, security console and mechanically sequenced blast door. Separate named nodes allow future art replacement. No visible Three.js primitive environment geometry is used at runtime.
- Shell gaps have original backing sheets. Front and near-side walls hide in Web/AR and return in VR. The door slides left behind its pocket after bolt retraction.
- Thirteen original synthesized WAV effects/loops provide temporary audio. Third-party source licenses are retained in `public/assets/licenses/`.

## Controls

- Desktop: WASD/arrows to move, click a nearby part or E to interact. Shift+E reverses a pressure valve. F or **تكبير الجهاز** focuses a nearby station; use **عرض الغرفة** to restore the whole-room view.
- Mobile: joystick to move, tap a nearby part to act, long press to reverse a valve, focus button for small controls. Drag the scene for limited camera rotation.
- VR: left stick movement, right stick snap turn, trigger selection, squeeze/twist wheels, squeeze/pull handles, pick up and return clues. Same state/logic. Hardware validation is still required.
- AR: surface detection and preview, select to place. Select imported parts; left/right half of each wheel decreases/increases pressure. Same live state is retained across modes. Actual tracking requires device QA.

## Verification

- Syntax/import checks and eight logic/collision/camera tests pass.
- All nine model headers, embedded dependencies, named parts and animation clips pass the asset gate.
- Node/Three GLTFLoader loads the actual complete asset set. Character skin bounds remain approximately 1.67–1.70 m through sampled Idle/Walk poses.
- Actual scene raycasting from legal standing positions reaches every interactive part with the appropriate furniture open. This is a geometry check, not a substitute for a browser playthrough.
- Offline geometry review was used to correct texture orientation, cutaway walls and shell gaps. Browser and device verification should be reported separately, based on observed results.
- Production deployment uses the Pages workflow on main pushes and runs syntax/tests/assets/build before upload. No source code imports depend on an external Three.js CDN.

## Rebuild

```sh
npm ci
npm run check
npm test
npm run check:assets
npm run check:runtime
npm run build
```

Regenerate original stations/audio: `npm run assets:build`. To re-import source geometry, clone the source revision alongside this repository, then run `npm run assets:import -- /path/to/The-Shelter2` followed by `npm run assets:build`. Keep source licenses and provenance. Model contracts are in `public/assets/models/ASSET_REQUIREMENTS.md`.

## Limitations

These temporary puzzle props and synthesized sounds are deliberately lightweight. Final art/AO, sound design, measured mobile/Quest frame rates and real-device XR comfort remain further work. Save-to-disk and teleport locomotion are not implemented; reload starts a new game. A mathematical/raycast test alone does not certify the experience on Meta Quest or iPhone.

## Files changed in this update

- `src/assets.js`: actual GLB contracts and WAV paths.
- `src/main.js`, `index.html`, `src/style.css`, `src/RoomPreview.js`: game boot, fallback asset preview and focus controls.
- `src/PlayerController.js`, `src/InteractionSystem.js`: station focus, keyboard focus fix and world interactions.
- `src/BunkerScene.js`: left-moving door matched to its modeled pocket.
- `src/systems/AudioManager.js`: prevents restarting powered loops after escape.
- `scripts/import-shelter2-assets.mjs`: reproducible source selection, assembly and FBX conversion.
- `scripts/build-puzzle-assets.mjs`: original offline articulated GLB authoring.
- `scripts/build-audio.py`: original PCM effects and loops.
- `scripts/audit-runtime.mjs`: actual model load, skin bounds, interaction accessibility and optional offline geometry view.
- `package.json`, `package-lock.json`: pinned authoring dependencies and verification commands.
- `.github/workflows/pages.yml`: automatic main deployment after checks.
- `public/assets/models/*.glb`: nine runtime assets plus a fallback preview furniture assembly.
- `public/assets/models/selection.json`: exact source provenance.
- `public/assets/audio/*.wav`: 13 original synthesized recordings.
- `public/assets/licenses/*.txt`: retained source licenses.
- The model/audio requirement documents and this status report now reflect supplied assets rather than missing slots.
