export class FullscreenManager {
  constructor(button,notice,doc=document,win=window) {
    Object.assign(this,{button,notice,doc,win});
    button.addEventListener('click',()=>void this.toggle());
    for(const event of ['fullscreenchange','webkitfullscreenchange'])doc.addEventListener(event,()=>this.sync());
    this.sync();
  }
  get active(){return !!(this.doc.fullscreenElement||this.doc.webkitFullscreenElement);}
  get standalone(){return this.win.matchMedia?.('(display-mode: standalone)').matches||this.win.navigator.standalone===true;}
  sync(){this.button.textContent=this.active?'تصغير الشاشة':'ملء الشاشة';this.button.setAttribute('aria-pressed',String(this.active));}
  async enter(){
    if(this.active||this.standalone)return true;
    const element=this.doc.documentElement;
    const request=element.requestFullscreen||element.webkitRequestFullscreen;
    if(request){
      try{await request.call(element,{navigationUI:'hide'});this.sync();return true;}catch{/* Keep playing if the browser denies the request. */}
    }
    const apple=/iPhone|iPad|iPod/.test(this.win.navigator.userAgent);
    this.notice(apple?'لإخفاء شريط Safari: مشاركة ← إضافة إلى الشاشة الرئيسية، ثم افتح اللعبة من أيقونتها.':'تعذر ملء الشاشة في هذا المتصفح. يمكنك متابعة اللعب.');
    return false;
  }
  async toggle(){
    if(!this.active)return this.enter();
    const exit=this.doc.exitFullscreen||this.doc.webkitExitFullscreen;
    try{await exit?.call(this.doc);this.sync();}catch{this.notice('تعذر تغيير حجم العرض.');}
  }
}
