# BUNKER 17 audio slots

No audio is currently supplied. Put licensed/original embedded audio files here; record source and license. Missing sound is non-fatal, but a silent build does not meet final audio acceptance. Sound is enabled only after the start gesture. Use restrained levels and seamless loops; preserve headroom for mechanisms.

| Filename | Purpose |
| --- | --- |
| `ambience.ogg` | Quiet seamless bunker atmosphere, distant rumble; ambient music may be part of this original mix |
| `generator-start.ogg` | Generator startup one-shot after POWER |
| `electrical-hum.ogg` | Quiet electrical/fluorescent/CRT buzz loop after POWER |
| `ventilation.ogg` | Soft fan loop after POWER |
| `relay.ogg` | Electrical module and small mechanical click |
| `valve.ogg` | Valve wheel movement |
| `pressure.ogg` | Seamless pipe flow/steam loop; loudness follows imbalance |
| `confirm.ogg` | Restrained successful system transition |
| `error.ogg` | Incorrect input / warning feedback |
| `keypad.ogg` | Button/keypad click |
| `bolts.ogg` | Heavy latch/bolt movement |
| `door.ogg` | Five-second mechanical blast-door movement |
| `escape.ogg` | Seamless exterior air/changed atmosphere |

Runtime uses positional audio, a 16-voice cap and cached buffers. Verify codec decoding on the supported mobile devices. If the final target needs another codec, change the manifest filenames to matching supported assets; do not silently remove audio. Precise bolt synchronization, spatial attenuation in AR and final mix levels require hardware QA with actual recordings.
