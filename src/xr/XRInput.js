// xr-standard reserves axes 0/1 for a touchpad and 2/3 for the thumbstick.
export function thumbstickAxes(gamepad){
 const axes=gamepad?.axes??[];
 if(axes.length>=4)return [axes[2],axes[3]];
 if(axes.length>=2)return [axes[0],axes[1]];
 return [];
}
