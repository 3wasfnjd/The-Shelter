# وثيقة تصميم اللعبة — THE SHELTER: BUNKER 17

## 1) تعريف المشروع

**اسم اللعبة:** THE SHELTER  
**الموقع داخل اللعبة:** BUNKER 17 — CONTROL ROOM  
**النوع:** 3D Escape Room / Puzzle / Survival Atmosphere  
**المنصات المستهدفة:** Web, Mobile, Meta Quest VR, WebXR AR

اللعبة تدور بالكامل داخل **غرفة تحكم عسكرية واحدة كبيرة ومفصلة** داخل ملجأ تحت الأرض. الهدف ليس بناء عدد كبير من الغرف، بل تقديم غرفة واحدة قوية بصريًا وميكانيكيًا تحتوي على سلسلة ألغاز مترابطة تؤثر في البيئة وتفتح الطريق إلى باب الخروج النهائي.

تسلسل اللعب الأساسي:

**الطاقة → الضغط → الأدلة → لوحة التحكم → باب الخروج**

كل مرحلة تغير حالة الملجأ بصريًا وصوتيًا وتفتح المرحلة التالية.

---

## 2) الهوية الفنية

### المراجع البصرية العامة

- Synty Studios POLYGON-style 3D environments.
- Quaternius Ultimate House Interior Pack.
- Quaternius Survival Pack.
- ithappy Military FREE Low-Poly 3D Models Pack.
- Kenney Furniture Kit.
- Stylized low-poly isometric survival games.
- 3D cutaway-room and miniature diorama environments.

تستخدم هذه المراجع فقط لفهم الاتجاه البصري العام، مثل مستوى التبسيط الهندسي، كثافة التفاصيل، الألوان، الإضاءة، نسب المجسمات، وضوح الـSilhouette، وطريقة تقديم الغرفة.

**لا يتم نسخ** موديلات أو خرائط أو واجهات أو شخصيات أو شعارات أو تصميمات محمية من هذه المراجع. يجب أن يكون BUNKER 17 تصميمًا أصليًا.

### الاتجاه الفني الرسمي

**Premium Stylized Low-Poly Military Survival Diorama**

المطلوب بيئة Low-Poly احترافية وليست بدائية. يجب أن تتميز بـ:

- هندسة مبسطة لكنها مقصودة.
- أشكال Chunky واضحة.
- Silhouettes قوية.
- نسب مبالغ فيها قليلًا.
- ألوان منظمة ومتناسقة.
- خامات Stylized قريبة من Hand-Painted look.
- إضاءة ناعمة.
- Ambient Shadows واضحة.
- Ambient Occlusion خفيف.
- وضوح جيد للعناصر التفاعلية.

### ما يجب تجنبه

- Photorealism.
- Voxel Art.
- Pixel Art.
- Toon outlines الثقيلة.
- البيئة المصنوعة من مكعبات وأسطوانات بدائية واضحة.
- خامات شديدة الواقعية لا تتناسب مع الستايل.
- خلط أصول واقعية جدًا مع أصول Stylized بشكل غير متجانس.

---

## 3) تصميم الغرفة

اللعبة تحتوي على **غرفة رئيسية واحدة** بمقاس تقريبي:

- العرض: 8–10 أمتار.
- الطول: 10–12 مترًا.
- الارتفاع: 3.5–4 أمتار.

يجب أن تبدو كملجأ عسكري / ورشة صيانة / غرفة تحكم للبقاء، وليس صندوقًا فارغًا.

### تكوين الغرفة

**الجهة اليسرى:**
- شبكة مواسير.
- صمامات.
- عدادات ضغط.
- خطوط تبريد.

**الجهة اليمنى:**
- خزائن عسكرية.
- رفوف.
- وثائق.
- صناديق معدات.
- أدلة قابلة للفحص.

**المنتصف:**
- Workbench أو مكتب معدني.
- أدوات.
- ملفات.
- أجهزة صغيرة.
- عناصر Environmental Storytelling.

**منطقة الطاقة:**
- مولد.
- لوحة توزيع كهربائية.
- قواطع.
- Junction Boxes.
- كابلات.

**الجدار الخلفي:**
- لوحة التحكم الرئيسية.
- شاشات CRT.
- مؤشرات.
- مفاتيح.
- أزرار.

**الجدار النهائي:**
- باب Blast Door كبير يمثل الهدف الرئيسي للعبة.

### خصائص البيئة

يجب أن تحتوي الغرفة على:

- Modular walls.
- Industrial flooring.
- Lockers.
- Shelves.
- Workbenches.
- Storage crates.
- Generators.
- Pipes.
- Control panels.
- Tools.
- Survival equipment.
- Ventilation ducts.
- Cable conduits.
- Warning signs.
- Labels.
- Documents.
- Fire extinguishers.
- Radio/communications equipment.
- Maintenance props.

العناصر لا توزع عشوائيًا. كل جزء من الغرفة له غرض بصري ووظيفي.

---

## 4) أسلوب الكاميرا حسب المنصة

### Web / Mobile

استخدم **Isometric Three-Quarter Top-Down Camera**.

الغرفة تعرض كـ **Cutaway Miniature Diorama** مع إخفاء أو إزالة الجدار الأمامي، بحيث يمكن رؤية الأرضية والجدران الجانبية والخلفية والأثاث والشخصية ومناطق الألغاز.

الشخصية تتحرك بحرية داخل كامل مساحة الغرفة.

الكاميرا تتبع الشخصية من زاوية ثابتة أو شبه ثابتة مع إمكانية دوران محدود إذا احتاج التصميم ذلك.

الهدف هو أن تبدو اللعبة كـ:

**Playable Military Diorama**

### VR — Meta Quest

في VR لا تستخدم الكاميرا Isometric.

يتم تحويل نفس البيئة إلى **First-Person Full-Scale Experience**.

يجب استخدام نفس:

- الغرفة.
- الموديلات.
- الألغاز.
- الحالات.
- الأصوات.
- Game State.

لكن تختلف طريقة الإدخال والعرض فقط.

### AR

في AR يتم استخدام WebXR Hit Test ثم وضع BUNKER 17 كـ **Interactive Miniature Diorama** على سطح حقيقي.

الحجم المقترح للمجسم:

**0.8–1.5 متر** حسب مساحة المستخدم.

يستطيع المستخدم مشاهدة الملجأ من مختلف الزوايا والتفاعل مع نفس الأنظمة والألغاز.

---

## 5) قواعد الموديلات

كل عنصر مرئي رئيسي يجب أن يكون موديلًا فعليًا بصيغة GLB أو glTF.

لا تستخدم BoxGeometry أو CylinderGeometry أو SphereGeometry لبناء النسخة المرئية النهائية من:

- الجدران.
- الأبواب.
- المواسير.
- الصمامات.
- المصابيح.
- الأثاث.
- لوحات التحكم.
- المولد.
- الرفوف.
- المعدات.

يمكن استخدام Geometry البسيط فقط في:

- Colliders.
- Hitboxes.
- Raycast zones.
- Invisible triggers.
- Debugging.

### العناصر التفاعلية يجب أن تكون منفصلة

مثال الباب:

- Door mesh.
- Handle mesh.
- Lock mesh.
- Wheel mesh.
- Bolts.

مثال لوحة الكهرباء:

- Panel body.
- Breaker switches.
- Indicator lights.
- Rotatable circuit modules.

مثال الصمام:

- Pipe body.
- Valve wheel.
- Gauge.
- Gauge needle.

مثال لوحة التحكم:

- Console.
- Buttons.
- Switches.
- Screens.
- Indicator lamps.

---

## 6) لوحة الألوان

استخدم Military Survival Stylized palette:

- Olive Green.
- Desaturated Army Green.
- Charcoal.
- Dark Grey.
- Warm Concrete Grey.
- Rust Brown.
- Muted Beige.
- Dark Steel.
- Emergency Red.
- Warning Yellow.
- Dim Cyan / Green للشاشات.

الألوان منخفضة التشبع نسبيًا، لكن يجب ألا تصبح الغرفة رمادية أو مظلمة بالكامل.

العناصر القابلة للتفاعل يمكن تمييزها بلون أو إضاءة خفيفة عند الاقتراب.

---

## 7) الإضاءة

الإضاءة Stylized وواضحة، وليست Photorealistic.

يجب أن تبقى تفاصيل الغرفة مرئية حتى قبل تشغيل الطاقة.

استخدم:

- Soft key light.
- Ambient fill.
- Contact shadows.
- Ambient Occlusion.
- Warm practical lights.
- Cool environmental fill.
- Emergency red accents.

### قبل إعادة الطاقة

- إضاءة طوارئ منخفضة.
- إضاءة محيطية كافية لرؤية تفاصيل الغرفة.
- بعض المؤشرات الحمراء.
- أجزاء محدودة من الأجهزة تعمل على backup power.

### بعد إعادة الطاقة

- تشغيل مصابيح السقف.
- تشغيل شاشات CRT.
- إضاءة لوحات التحكم.
- ظهور مؤشرات الأنظمة.
- انخفاض هيمنة اللون الأحمر.
- زيادة دفء ووضوح المشهد.

يجب أن يشعر اللاعب أن الغرفة عادت إلى الحياة.

---

## 8) أسلوب اللعب

اللعبة تعتمد على:

- الاستكشاف.
- المشي الحر.
- التفاعل مع الأجهزة.
- البحث عن الأدلة.
- تشغيل الأنظمة.
- حل الألغاز.
- قراءة Feedback من البيئة.

### Web / Desktop

- Keyboard للحركة.
- Mouse للكاميرا/الاختيار.
- زر تفاعل عند الاقتراب.

### Mobile

- Virtual Joystick.
- Touch Camera.
- Interaction button.

### VR

- 6DoF.
- WebXR Controllers.
- Physical interactions.
- Grab / Rotate / Press عند الإمكان.

---

## 9) فلسفة الألغاز

لا تستخدم ألغازًا تعتمد على الضغط العشوائي حتى تظهر الإجابة الصحيحة.

الألغاز يجب أن تعتمد على:

- Observation.
- Experimentation.
- Spatial reasoning.
- Mechanical logic.
- Environmental clues.
- Cause and effect.

كل لغز يجب أن يبدو جزءًا طبيعيًا من أنظمة الملجأ.

كل حل يجب أن ينتج عنه تغيير بصري وصوتي داخل البيئة.

---

## 10) اللغز الأول — نظام الطاقة

### الهدف

إعادة تشغيل الطاقة الرئيسية للملجأ.

### التصميم

لوحة كهربائية تحتوي على:

- Generator Input.
- Rotatable electrical modules.
- Junctions.
- Breakers.
- Indicator lights.
- Control-system output.

اللاعب يدور قطع التوصيل 90 درجة لإنشاء مسار متصل من:

**GENERATOR → POWER GRID → CONTROL SYSTEM**

### Feedback

- المسارات غير المتصلة تبقى مظلمة.
- الأجزاء المتصلة تضيء تدريجيًا.
- Relay clicks عند الدوران.
- Indicator أخضر عند اكتمال المسار.

### عند الحل

- تشغيل المولد.
- تشغيل المصابيح الرئيسية.
- تشغيل الشاشات.
- تشغيل بعض أصوات المراوح.
- ظهور حالة:

**POWER BUS ONLINE**

---

## 11) اللغز الثاني — نظام الضغط

### الهدف

موازنة ضغط خطوط التبريد.

### التصميم

شبكة مواسير فعلية على الجدار تحتوي على:

- 3 أو 4 صمامات.
- عدة خطوط.
- Analog pressure gauges.
- مؤشرات تحذير.

تدوير أي صمام يؤثر على أكثر من خط.

### شرط الحل

جميع العدادات يجب أن تكون داخل المجال:

**45–55 PSI**

### Feedback

- تحرك Gauge needles.
- دوران Valve wheels.
- تغير صوت تدفق الضغط.
- تغير مؤشرات اللون من الأحمر إلى الأخضر.

### عند الحل

**PRESSURE STABLE**

ويتم تفعيل النظام التالي.

---

## 12) اللغز الثالث — الأدلة

هذا لغز استكشاف داخل البيئة.

يجب توزيع الأدلة في أماكن منطقية، مثل:

- كتاب العمليات.
- خزانة الطوارئ.
- مذكرة المكتب.
- لوحة تحذير.
- بطاقة موظف.
- سجل صيانة.

كل دليل يحمل **رمزًا + رقم ترتيب**.

مثال:

- III — 1
- △ — 2
- ✕ — 3
- ○ — 4

الترتيب النهائي:

**III → △ → ✕ → ○**

لا يجب إظهار الإجابة النهائية مباشرة. اللاعب يستنتجها من الأدلة.

---

## 13) اللغز الرابع — لوحة التحكم الرئيسية

بعد استقرار الطاقة والضغط تصبح لوحة التحكم قابلة للاستخدام.

تتكون من:

- CRT monitors.
- Physical switches.
- Buttons.
- Indicator lamps.
- Gauges.
- Security input system.

يدخل اللاعب ترتيب الرموز المكتشف من الأدلة.

### في حالة الخطأ

- لمبة حمراء.
- Error beep.
- Reset.

### في حالة النجاح

- شاشة النظام تعمل.
- SECURITY يتحول للأخضر.
- يتم كشف رمز الباب النهائي:

**7314**

يجب أن يظهر الرقم بطريقة منطقية داخل العالم، مثل شاشة CRT أو Terminal output.

---

## 14) اللغز الخامس — باب الملجأ

باب Blast Door هو النهاية الميكانيكية للعبة.

يحتوي على:

- Keypad.
- POWER indicator.
- PRESSURE indicator.
- SECURITY indicator.
- Locking mechanism.
- Large wheel / handle.
- Mechanical bolts.

الحالات المطلوبة قبل الفتح:

- POWER — ONLINE
- PRESSURE — STABLE
- SECURITY — AUTHORIZED

يدخل اللاعب:

**7314**

لكن إدخال الرمز لا يفتح الباب مباشرة.

### تسلسل الفتح

1. إدخال الكود.
2. تحرير Safety Lock.
3. تدوير Locking Wheel.
4. سحب Main Release Handle.
5. تراجع الأقفال المعدنية.
6. فتح الباب ببطء.

### Feedback

- أصوات أقفال ثقيلة.
- اهتزازات خفيفة.
- لمبة خروج خضراء.
- ضوء قوي خلف الباب.
- غبار خفيف يظهر في الضوء.

---

## 15) النهاية

خلف الباب:

- ممر قصير.
- ضوء خارجي قوي.
- هواء/ضباب خفيف.
- تغير في Ambient Sound.

النص النهائي:

**BUNKER 17 UNLOCKED**

ثم:

**THE SHELTER — ESCAPED**

---

## 16) الصوت

استخدم Spatial Audio قدر الإمكان.

الأصوات المطلوبة:

- Electrical hum.
- Generator startup.
- Fluorescent buzz.
- Ventilation.
- Valve rotation.
- Pipe pressure.
- Steam.
- Relay clicks.
- Switches.
- CRT electronics.
- Keypad.
- Warning alarms.
- Metal impacts.
- Blast-door bolts.
- Heavy door movement.
- Distant bunker ambience.

الموسيقى Ambient خفيفة ولا تغطي على أصوات البيئة.

---

## 17) Feedback والتفاعل

كل تفاعل يجب أن يعطي استجابة واضحة.

مثال الصمام:

- يدور فعليًا.
- يصدر صوتًا.
- يحرك Gauge needle.
- يغير قيمة الضغط.

مثال المفتاح:

- يتحرك ميكانيكيًا.
- يصدر Click.
- يغير ضوء النظام.

مثال الكود الخاطئ:

- Indicator أحمر.
- Error beep.

مثال الحل الصحيح:

- Indicator أخضر.
- صوت تأكيد.
- تغير حقيقي داخل الغرفة.

لا تعتمد فقط على رسائل نصية مثل Puzzle Solved.

---

## 18) واجهة المستخدم

HUD بسيط جدًا.

اعرض فقط:

- اسم اللعبة.
- المرحلة الحالية.
- Prompt تفاعل عند الحاجة.

أمثلة:

- النظام 1/5 — الطاقة
- النظام 2/5 — الضغط
- النظام 3/5 — الأدلة
- النظام 4/5 — لوحة التحكم
- النظام 5/5 — باب الخروج

أوامر تفاعل محتملة:

- تفاعل
- افحص
- أدر الصمام
- استخدم اللوحة
- افتح

يفضل أن تكون واجهات الألغاز داخل العالم نفسه بدل استخدام HTML modal كلما كان ذلك ممكنًا.

---

## 19) نظام التلميحات

إذا لم يحقق اللاعب تقدمًا لفترة طويلة، يمكن تقديم Hint تدريجي.

مثال الطاقة:

1. افحص مسار الطاقة من المولد.
2. بعض قطع التوصيل موجهة بالاتجاه الخاطئ.
3. يجب إنشاء مسار مستمر حتى وحدة التحكم.

لا تعرض الحل الكامل مباشرة.

---

## 20) VR — Meta Quest 3

في VR يجب أن تكون الألغاز قدر الإمكان تفاعلات ثلاثية الأبعاد فعلية.

مثال:

- الإمساك بعجلة الصمام وتدويرها.
- الضغط على زر فعلي.
- تحريك Switch.
- التقاط الوثيقة.
- تدوير عجلة الباب.
- سحب الذراع.

لا تجعل VR مجرد نسخة من نوافذ HTML الخاصة بالويب.

الهدف هو **Diegetic Interaction**.

---

## 21) AR

تدفق AR:

**ENTER AR → Surface Detection → Placement Preview → Confirm → Interact**

يتم عرض BUNKER 17 كمجسم مصغر كامل على سطح حقيقي.

يجب أن يحافظ AR على:

- Puzzle progression.
- Game State.
- Indicators.
- Lighting states.
- Feedback.

---

## 22) الأداء

المنصات المستهدفة:

- Desktop browser.
- iPhone/mobile browser.
- Android browser.
- Meta Quest 3.

استخدم:

- GLB/glTF.
- Model caching.
- Instancing.
- Shared materials.
- Texture atlases.
- KTX2/Basis عند الحاجة.
- Meshopt أو Draco عند الحاجة.
- Frustum culling.
- LOD عند الحاجة.
- Draw-call management.
- محدودية الإضاءات ذات الظلال الديناميكية.
- Static/baked lighting عندما يناسب.
- Colliders مبسطة وغير مرئية.

الهدف ليس Ultra Low-Poly، بل:

**High-Quality Stylized Low-Poly with efficient runtime performance.**

---

## 23) التحميل

أنشئ Loading Screen يحمل هوية اللعبة:

**THE SHELTER**

**LOADING BUNKER 17**

مع Progress حقيقي.

كل أصل فريد يتم تحميله مرة واحدة فقط، ثم يعاد استخدامه أو نسخه.

لا تعيد تحميل نفس GLTF لكل نسخة من المجسم.

---

## 24) تنظيم المشروع

المقترح:

```text
src/
  main.js
  BunkerScene.js
  PlayerController.js
  InteractionSystem.js
  PuzzleManager.js

  puzzles/
    PowerPuzzle.js
    PressurePuzzle.js
    EvidencePuzzle.js
    ControlPuzzle.js
    DoorPuzzle.js

  xr/
    VRManager.js
    ARManager.js

  systems/
    AssetManager.js
    AudioManager.js
    LightingManager.js
    SaveState.js
```

يجب فصل منطق الألغاز عن طرق الإدخال المختلفة.

يفضل وجود **Puzzle State Logic مشترك** مع Input Adapters مختلفة للويب وVR وAR.

---

## 25) Game State

استخدم حالات واضحة:

```text
POWER_OFF
POWER_ON
PRESSURE_STABLE
EVIDENCE_COMPLETE
SECURITY_AUTHORIZED
DOOR_UNLOCKED
ESCAPED
```

كل حالة تؤثر على البيئة.

مثال:

**POWER_ON**
- الأنوار تعمل.
- الشاشات تعمل.
- الأجهزة تبدأ بإصدار أصوات.

**PRESSURE_STABLE**
- مؤشرات المواسير تصبح خضراء.

**SECURITY_AUTHORIZED**
- لوحة الباب تصبح قابلة للاستخدام.

**DOOR_UNLOCKED**
- آلية الفتح الميكانيكية تصبح متاحة.

---

## 26) القصة البيئية

لا تحتاج اللعبة Cutscenes طويلة.

تروى القصة من خلال البيئة:

- سجلات صيانة.
- ملاحظات.
- صور.
- تحذيرات.
- معدات متروكة.
- آثار إخلاء سريع.
- أرقام غرف.
- وثائق ناقصة.
- شاشات قديمة.

الأسئلة التي يجب أن يخرج بها اللاعب:

- لماذا تم إخلاء BUNKER 17؟
- ماذا حدث للطاقم؟
- لماذا أغلق الباب؟
- هل كان الخطر خارج الملجأ أم داخله؟

لا تفسر كل شيء بشكل مباشر. اترك مساحة للغموض.

---

## 27) المبدأ النهائي

**QUALITY OVER QUANTITY**

غرفة واحدة ممتازة أفضل من عشر غرف متوسطة.

كل عنصر يجب أن يخدم واحدًا أو أكثر من:

- Atmosphere.
- Story.
- Gameplay.
- Puzzle.

النتيجة النهائية يجب أن تبدو كلعبة تجارية Stylized Escape Room، وليس كتجربة Three.js بسيطة.

### التجربة المستهدفة

**Web / Mobile:**
Playable Isometric Cutaway Diorama.

**Meta Quest VR:**
Full-scale immersive first-person bunker.

**AR:**
Interactive miniature bunker in the real world.

استخدم نفس الأصول ونفس Puzzle Logic ونفس Game State عبر جميع الأوضاع.
