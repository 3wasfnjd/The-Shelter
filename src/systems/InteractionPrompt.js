// Only the contextual UI is filtered; PuzzleManager still validates every action.
export function interactionPrompt(action,p,bunker={}) {
  if(!action||p.escaped)return null;
  const {type,id,value}=action;
  if(type==='power')return p.power.online?null:{title:'لوحة الطاقة',label:'أدر قطعة التوصيل',hint:'صل مصدر الطاقة بالمصباح.'};
  if(type==='pressure')return !p.power.online||p.pressure.stable?null:{title:'صمامات الضغط',label:'أدر الصمام',hint:'الهدف 45–55 PSI · ضغطة مطولة للعكس.'};
  if(type==='evidence')return !p.pressure.stable?null:{title:'الأدلة',label:'افحص الدليل',hint:'لاحظ الرمز ورقم ترتيبه.'};
  if(type==='prop')return {title:id==='locker'?'خزانة الطوارئ':'درج المكتب',label:(id==='locker'?bunker.lockerOpen:bunker.drawerOpen)?'أغلق':'افتح',hint:''};
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
