// Presentation only: PuzzleManager remains the authority for successful escape.
export class EndingSystem {
  constructor({renderer,player,interaction,audio,imageURL,root=document}) {
    Object.assign(this,{renderer,player,interaction,audio});this.active=false;
    this.panel=root.querySelector('#ending');this.title=root.querySelector('#ending-title');
    root.querySelector('#ending-image').src=imageURL;
    root.querySelector('#ending-replay').addEventListener('click',()=>location.reload());
    root.querySelector('#ending-mute').addEventListener('click',event=>{
      event.currentTarget.setAttribute('aria-pressed',String(audio.mute()));
    });
    this.hud=['#hud','#controls','#modes','#notice'].map(id=>root.querySelector(id));
  }
  async update(puzzles) {
    if(!puzzles.escaped||this.active)return;
    this.active=true;this.player.enabled=false;this.player.clear();
    this.interaction.mode='ending';this.interaction.highlight(null);
    // The ending is a 2D illustration, not a VR panorama. Return to the browser first.
    const session=this.renderer.xr.getSession();
    if(session)try{await session.end();}catch(error){console.warn('Leave XR to view the ending.',error);}
    this.hud.forEach(element=>{element.hidden=true;});
    this.panel.hidden=false;this.title.focus();
  }
}
