# Implementation status — 2026-09-09

## Release status

**Asset-blocked systems implementation. Not the requested finished first playable.**

The starting repository at `b9dbfcb` contained only `README.md`, `docs/GAME_DESIGN_AR.md` and an empty `Text.text`. There were no game sources, models, textures or audio. Both required documents were read completely before coding. The design document remains the primary source of truth and is unchanged.

Nine explicit GLB slots replace assumptions about unavailable art. There is no primitive-art fallback. Because every required model is missing, the loader shows an honest blocking screen; it cannot display or validate a polished control room. This is a dependency limitation, not a change to the visual direction.

## Implemented in source

- Three.js/Vite local dependency build with relative URLs for GitHub Pages subdirectories.
- One 9 × 11 m room composition contract, correct station zones and separate interactive GLB node contracts.
- Free movement, room/furniture collisions, camera-relative WASD/arrows, joystick, fixed three-quarter camera with limited azimuth adjustment and portrait-aware room fitting.
- Shared puzzle manager with no dependency on rendering/input mode. All five puzzles, prerequisites, error resets, mechanical door phases and explicit exit transition.
- GLB loading/cache, skeleton-safe instances, missing-node and missing-animation diagnostics, actual completed-file progress.
- Imported-part rotation, gauge needles, moving door bolts/leaf/handle, press feedback, diegetic CRT/keypad textures, lighting changes and optional cached positional audio.
- Web selection and interaction, VR controller selection/near press, squeeze-and-twist controls, squeeze-and-pull handles, document pickup/restoration, left-stick movement and right-stick snap turn.
- AR surface detection, room-as-preview, placement confirmation and miniature selection with the same state. VR/AR mode changes retain the live puzzle manager; ending AR restores room transforms. Reloading the page starts a new game; disk persistence is not implemented.
- Minimal Arabic HUD and branded loading screen; no flat HTML puzzle modals.

## Verification

| Check | Result |
| --- | --- |
| Syntax and relative source imports | Passed `npm run check` |
| Puzzle progression, guards, mistakes, physical door sequence | Passed Node tests |
| Pressure coupling, reverse direction and bounds | Passed Node tests |
| Movement blockers and anti-tunnelling | Passed Node tests |
| Full shell/frustum fit at 1440×900, 390×844, 844×390 | Passed mathematical camera tests, not visual art QA |
| Production build | Passed `npm run build` |
| Static Pages-style `/The-Shelter/` index/JS/CSS URLs | Passed local HTTP checks; missing GLB correctly returns 404 |
| Browser loading-screen inspection | Blocked: browser refused local preview with `ERR_BLOCKED_BY_CLIENT`; no successful visual browser test claimed |
| Required model files | **Blocked: all nine absent**; `npm run check:assets` intentionally fails |
| Rendered room, lighting/art quality and actual Web playthrough | **Not verified: no models** |
| Actual Meta Quest VR / AR tracking, controllers and comfort | **Not verified: requires hardware and models** |
| Sound quality and performance budgets | **Not verified: recordings/models absent** |
| Live GitHub Pages playable deployment | **Not deployed; release is asset-blocked** |

The build currently has a ~630 kB minified engine/application JS chunk (~165 kB gzip). This is a build observation, not a performance result. Final triangle counts, draw calls, texture memory, contact AO and frame rates require actual assets. No decorative procedural geometry, replacement photorealistic assets, fake loading progress, invented final render or successful-device-test claim was added.

## Local setup and Pages

Requires Node 22+ and npm.

```sh
npm ci
npm run dev
npm run check
npm test
npm run check:assets
npm run build
```

`npm run check:assets` is expected to fail until the specified GLBs are provided. Install them under `public/assets/models/` using the [model contract](../public/assets/models/ASSET_REQUIREMENTS.md). Sound requirements are [here](../public/assets/audio/ASSET_REQUIREMENTS.md).

CI runs source checks, tests and production build. The separate **Deploy playable Bunker 17 to Pages** workflow is manual and requires the asset gate to pass before upload. When the room has passed visual/device QA, use GitHub Pages with **GitHub Actions** as its source and run that workflow. The bundle uses `./assets/…` URLs and no external Three.js CDN. Do not claim a successful Pages deployment merely because Vite builds.

## Final acceptance still required

1. Deliver the original/licensed art and audio specified in the asset contracts. Inspect geometry, materials, hierarchy, screen UVs and animation pivots; run the asset gate.
2. Check emergency mode and POWER transition visually: all stations remain readable; practical lights/CRT screens turn on; emergency red becomes secondary; baked AO complements the single shadowed key light.
3. Walk around the workbench and all stations with keyboard and mobile joystick. Verify no tunnelling, blocked approaches, stuck pointers, wall occlusion or portrait cropping. Drag the camera only within the fixed diorama range.
4. Complete POWER from the physical port diagram. Disconnected traces stay dark. Every turn clicks and rotates a real module. Later systems reject early input.
5. Change every pressure valve both directions and verify all needles react. Web: Shift+E or long press reverses. VR: reverse wrist twist while squeezing. AR: touch the wheel's left half to decrease and right half to increase; this does not require DOM overlay. Physical targeting and comfort need explicit device QA before release.
6. Open the locker and desk drawer; read each scattered symbol/order clue. Closed furniture must physically occlude its contents. In VR pick up each document and return it; glyphs must remain readable.
7. Enter an incorrect symbol sequence, see/hear reset, then enter the inferred order. Only successful authorization reveals 7314 on the imported CRT screen.
8. Try every door part too early. Enter a wrong PIN, then 7314. Verify code does not open the door. Release safety, turn wheel four quarter-turns, pull handle; bolts retract before the five-second leaf slide. Walk/select the corridor to escape.
9. Enter VR mid-puzzle and return to Web without resetting progress. Repeat with AR; lose/reacquire surface before placement, confirm once, move viewpoint without re-placing, end session, verify Web transforms restored. Check controller disconnect, failed XR start and unsupported browser states.
10. On Meta Quest, test tracking/near presses/pulls/twists, locomotion collision, snap turn, scale and sound. Room-scale physical head movement is not forcibly clamped; this is a known comfort/safety boundary to assess with device testing. No teleport locomotion is implemented.
11. Measure mobile/Quest frame rate, draw calls, texture memory and loading behavior. Tune art, instancing, material sharing, LOD/compression and shadows based on measured bottlenecks.

## Changed-file inventory

| File | Change |
| --- | --- |
| `package.json` | Pinned Three.js/Vite dependencies and dev/build/check/test scripts |
| `package-lock.json` | Reproducible npm dependency tree |
| `.gitignore` | Excludes dependencies, generated builds and test outputs |
| `vite.config.js` | Relative base URL, ES2022 production target |
| `index.html` | Arabic application shell, loading screen, controls and mode buttons |
| `src/style.css` | Responsive restrained bunker UI styling |
| `src/main.js` | Boot, required-asset gate, composition, frame loop and shared mode lifecycle |
| `src/assets.js` | Model/audio slots, node names, positions, collider footprints and URL helper |
| `src/BunkerScene.js` | GLB composition, physical part binding, diegetic displays and feedback |
| `src/PlayerController.js` | Keyboard/touch movement, collisions, character animation, camera fitting |
| `src/InteractionSystem.js` | Occlusion-aware picking, proximity, highlighting and input dispatch |
| `src/PuzzleManager.js` | Shared progression, prerequisite guards and state events |
| `src/puzzles/PowerPuzzle.js` | Rotatable port graph and generator-to-control connectivity |
| `src/puzzles/PressurePuzzle.js` | Coupled valve pressures and 45–55 PSI stability condition |
| `src/puzzles/EvidencePuzzle.js` | Four distributed ordered clues and unique discovery tracking |
| `src/puzzles/ControlPuzzle.js` | Symbol input, error reset and security authorization |
| `src/puzzles/DoorPuzzle.js` | PIN, safety lock, wheel, release handle and timed opening |
| `src/systems/AssetManager.js` | Cached GLTF loading, bounded concurrency and contract validation |
| `src/systems/AudioManager.js` | Optional cached positional audio, loops, feedback and voice cap |
| `src/systems/LightingManager.js` | Readable fill/key, emergency/practical/exit lighting and AR scaling |
| `src/xr/VRManager.js` | Quest controller adapter, first-person rig, gestures and locomotion |
| `src/xr/ARManager.js` | Hit testing, room placement preview, miniature interaction and teardown |
| `scripts/check.mjs` | Syntax, relative import and prohibited geometry checks |
| `scripts/check-assets.mjs` | Required GLB headers, embedded dependencies, nodes and clip checks |
| `test/puzzles.test.js` | Progression, failure paths, coupling and shared-adapter tests |
| `test/movement.test.js` | Collision and landscape/portrait frustum tests |
| `.github/workflows/ci.yml` | Automated source/tests/build workflow |
| `.github/workflows/pages.yml` | Manual Pages workflow gated on required model availability |
| `public/assets/models/ASSET_REQUIREMENTS.md` | Exact missing-model/export/hierarchy/pivot specification |
| `public/assets/audio/ASSET_REQUIREMENTS.md` | Exact missing-sound inventory and integration requirements |
| `docs/IMPLEMENTATION_STATUS.md` | This status, validation limits, setup, acceptance and file inventory |

The existing README, design document and `Text.text` are unchanged. This inventory describes source implementation; it does not turn untested asset-dependent systems into a certified playable build.
