# Required BUNKER 17 model slots

**Status: no model files supplied. The current application is asset-blocked, not a playable art build.**

`docs/GAME_DESIGN_AR.md` is authoritative. This document specifies integration details, not a new visual direction. Never replace these slots with crude primitive meshes, including primitive meshes merely exported to GLB. Use original/licensed, purpose-authored, premium stylized low-poly art. No photorealistic substitute packs.

## Shared export contract

- GLB 2.0; meters; +Y up. Apply object scale before export. Every buffer and texture must be embedded; no external URLs or missing texture sidecars.
- A station faces local +Z, has its origin at floor level and pivots on the actual moving parts. Node names are case-sensitive. Named targets may be groups containing several meshes.
- Match the desaturated military palette, chunky silhouettes, intentional bevels and restrained texture detail in the design document. Bake ambient/contact occlusion into textures or an AO map. Use shared material atlases where practical.
- Keep button faces, documents, traces, lamps and screen surfaces distinct from the housing. Do not join all moving parts into a single mesh. Keep nodes free of duplicate names.
- Screens are dedicated single-material, UV-mapped meshes occupying the complete [0,1] image area. Screen UV orientation must be checked against a readable upright runtime terminal. Text is drawn onto the imported screen mesh, not onto runtime plane geometry.
- Export readable document/clue textures. Numbers must appear on their individual clues only; do not display the entire ordered solution on a single prop.
- Per-station movement blockers in `src/assets.js` are room-axis-aligned. Keep solid furnishings within these footprints or adjust the colliders with the model placement. Preserve 0.8 m minimum walkways. No decorative collider should block a puzzle approach.
- Clue document front faces should face the controller's local +Z after pickup, with artwork upright and pivot near page center. Tune pickup orientation with the final model on Quest.
- Supply author/source/license records alongside every delivered model. Do not imply ownership of third-party art without evidence.

## File inventory

| File in this directory | Placement in room (x,y,z), yaw | Required named parts and modeling details |
| --- | --- | --- |
| `bunker-shell.glb` | (0,0,0), 0 | `Floor`, `FrontWall`, `Roof`, `ExitCorridor`, `CeilingLamp`, `EmergencyLamp`. Interior x −4.5…4.5, z −5.5…5.5, y 0…3.8. Modular back/side wall sections, industrial floor, cable conduits, ventilation, practical lamps and signage. Front wall and roof hide in Web/AR. All front wall occluders must be under `FrontWall`. Exit opening x 1.6…3.7 in rear wall, short corridor z −5.5…−7. Provide light haze/dust as authored transparent mesh/texture elements within the corridor, not random particle geometry. |
| `power-station.glb` | (−3.5,0,2.5), +90° | `Module_0`…`Module_5`, `Trace_0`…`Trace_5`, `PowerIndicator`, `GeneratorRotor`. Generator, junctions, wiring, distribution cabinet. Modules form 3 columns and 2 rows. Rotation around local Z; clockwise turns are negative Z rotations. Index 0 top-left through 5 bottom-right. Port directions at rest: 0 E/W; 1 S/W; 2 N/S; 3 N/E; 4 N/E; 5 E/W. Input enters west of module 0; control output exits east of module 5. Each `Trace_i` is a descendant of `Module_i` and uses emissive-capable material. Wires and labeling convey connectivity without guessing. |
| `pressure-station.glb` | (−3.6,0,−2.3), +90° | `Valve_0`…`Valve_2`, `Needle_0`…`Needle_2`, `PressureIndicator_0`…`PressureIndicator_2`. Pipes, flanges, three wheels and linked gauges. Wheel centers pivot on local Z. Each notch turns 60°, positions 0…6 with readable markings. Needle rest = 0 PSI; −270° = 100 PSI; mark 45–55 PSI green. Provide printed coupling diagram: valve A affects gauges (+10,−5,+5), B (+5,+10,−5), C (−5,+5,+10) PSI per notch. Do not print the final settings. |
| `military-storage.glb` | (3.55,0,0.7), −90° | `LockerDoor`, `LockerHandle`, `Clue_emergency`, `Clue_maintenance`. Olive lockers, shelves, survival equipment, staff card △—2, maintenance record ○—4. Handle must follow the door as a child. Door hinge local Y, opening −1.6 radians. Emergency clue inside locker, maintenance record readable on shelving. |
| `workbench.glb` | (0.2,0,0.2), 0 | `Drawer`, `DrawerHandle`, `Clue_operations`, `Clue_memo`. Desk, tools, communications device. Drawer moves +0.4 m local Z; handle follows drawer. Operations book III—1 on the desk; memo ✕—3 in the drawer as a child of `Drawer`. Do not bury the open drawer under another solid prop. |
| `control-console.glb` | (−0.9,0,−4.55), 0 | `Symbol_0`…`Symbol_3` labeled III, △, ✕, ○; `ResetButton`, `CRTScreen`, `SecurityIndicator`. CRT monitor housing, switches, gauges, raised physical button faces. Buttons recess −0.015 m on local Z. Runtime screen reveals 7314 only after authorization. |
| `blast-door.glb` | (2.65,0,−5.4), 0 | `DoorLeaf`, `SafetyLock`, `LockingWheel`, `ReleaseHandle`, `Bolt_0`…`Bolt_3`, `Key_0`…`Key_9`, `KeyClear`, `KeyDisplay`, `PowerLamp`, `PressureLamp`, `SecurityLamp`, `ExitLamp`. Leaf slides +2.2 m local X into a modeled pocket. Pocket must not obstruct console/corridor or open beyond shell art without an enclosure. Safety lock +90° local Z. Wheel four −90° increments. Handle −0.7 rad local X. Bolts 0/2 retract −0.2 m X, 1/3 +0.2 m X. Bolts, wheel, lock and handle should follow the leaf if mounted on it. Keypad and indicators stay on frame. |
| `survival-props.glb` | (0,0,0), 0 | Purpose-placed extinguisher near entry, maintenance kit by generator, wall warning signs, equipment. Keep walkways and sightlines clear. Decorative meshes must fit the shell, wall recesses or existing furniture footprints; add accurate colliders for new floor props. |
| `bunker-technician.glb` | (0,0,3.8), 0 | A 1.7 m technician, +Z forward, feet at origin, with `Idle` and `Walk` animation clips. No mannequin made of basic shapes. Efficient skinned mesh; materials match room art. |

## Acceptance before playable release

Run `npm run check:assets`. Then inspect every exported model in the application, verify pivots, UV orientation, clue legibility, cutaway walls, collisions and camera framing. Passing header/node checks does **not** establish visual quality or VR correctness. Asset budgets must be measured with the actual room on mobile and Quest; they cannot be certified from empty slots.
