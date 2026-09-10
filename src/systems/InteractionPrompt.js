// Only the contextual UI is filtered; PuzzleManager still validates every action.
export function interactionPrompt(action,p,bunker={}) {
  if(!action||p.escaped)return null;
  const {type,id,value}=action;
  if(type==='power')return p.power.online?null:{title:'لوحة الطاقة',label:'أدر قطعة التوصيل',hint:'صل مصدر الطاقة بالمصباح.'};
  if(type==='pressure')return !p.power.online||p.pressure.stable?null:{title:'صمامات الضغط',label:'أدر الصمام',hint:'الهدف 45–55 PSI · ضغطة مطولة للعكس.'};
  if(type==='evidence'||type==='prop'){
    if(!p.pressure.stable||p.evidence.complete)return null;
    const desk=['operations','memo','drawer'].includes(id);
    const first=desk?'operations':'maintenance',second=desk?'memo':'emergency';
    const found=p.evidence.found,open=desk?bunker.drawerOpen:bunker.lockerOpen;
    if(found.has(first)&&found.has(second))return null;
    const title=desk?'أدلة المكتب والدرج':'أدلة الصيانة والطوارئ';
    if(!found.has(first))return type==='evidence'&&id===first
      ?{title,label:desk?'افحص كتاب العمليات':'افحص سجل الصيانة',hint:desk?'ابدأ بكتاب العمليات على المكتب.':'ابدأ بسجل الصيانة بجانب خزانة الطوارئ.'}:null;
    const hint=desk?'يوجد دليل آخر داخل درج المكتب.':'يوجد دليل آخر داخل خزانة الطوارئ.';
    if(!found.has(second)){
      if(type==='prop'&&!open)return {title,label:desk?'افتح الدرج':'افتح الخزانة',hint};
      if(type==='evidence'&&id===second&&open)return {title,label:'افحص الدليل الثاني',hint};
    }
    return null;
  }
  if(type==='symbol'||type==='reset'){
    if(!p.evidence.complete||p.control.authorized||(type==='reset'&&!p.control.entry.length))return null;
    return {title:'لوحة التحكم',label:type==='reset'?'مسح الرموز':`اضغط ${action.symbol}`,hint:'أدخل الرموز حسب ترتيب الأدلة.'};
  }
  if(!p.control.authorized)return null;
  if(type==='key'&&p.door.phase==='LOCKED'){
    if(value==='clear'&&!p.door.entry.length)return null;
    return {title:'رمز الباب',label:value==='clear'?'مسح الرمز':`اضغط ${value}`,hint:'أدخل الرمز الذي ظهر على شاشة التحكم.'};
  }
  if(type==='safety'&&p.door.phase==='CODE_ACCEPTED')return {title:'قفل الأمان',label:'حرّر القفل',hint:''};
  if(type==='wheel'&&p.door.phase==='SAFETY_RELEASED')return {title:'عجلة الباب',label:'أدر العجلة',hint:''};
  if(type==='release'&&p.door.phase==='WHEEL_RELEASED')return {title:'مقبض الباب',label:'اسحب المقبض',hint:''};
  return null;
}
