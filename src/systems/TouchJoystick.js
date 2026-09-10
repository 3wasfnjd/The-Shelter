// Own only canvas touches: HUD buttons and mouse camera gestures stay independent.
export class TouchJoystick {
  constructor(canvas,base,knob,stick,enabled) {
    Object.assign(this,{canvas,base,knob,stick,enabled,id:null,moved:false});
    canvas.addEventListener('pointerdown',event=>{
      if(event.pointerType!=='touch'||this.id!==null||!enabled())return;
      this.id=event.pointerId;this.moved=false;this.x=event.clientX;this.y=event.clientY;
      base.style.left=`${this.x}px`;base.style.top=`${this.y}px`;base.dataset.active='true';
      canvas.setPointerCapture(this.id);
    });
    canvas.addEventListener('pointermove',event=>{
      if(event.pointerId!==this.id)return;
      if(!enabled()){this.clear();return;}
      const x=event.clientX-this.x,y=event.clientY-this.y,length=Math.hypot(x,y);
      if(length>=7)this.moved=true;
      const amount=Math.min(1,Math.max(0,(length-7)/31));
      stick.set(length?x/length*amount:0,length?y/length*amount:0);
      knob.style.transform=`translate(${stick.x*26}px,${stick.y*26}px)`;
    });
    for(const type of ['pointerup','pointercancel','lostpointercapture']){
      canvas.addEventListener(type,event=>{if(event.pointerId===this.id)this.clear();});
    }
  }
  clear() {
    const id=this.id;this.id=null;this.stick.set(0,0);
    this.base.dataset.active='false';this.knob.style.transform='';
    // Keep moved until the next touch so pointerup cannot activate a puzzle after dragging.
    if(id!==null&&this.canvas.hasPointerCapture(id))this.canvas.releasePointerCapture(id);
  }
}
