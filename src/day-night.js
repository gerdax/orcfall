// Night starts at 3:00, 6:00, 9:00... of active play and lasts one minute.
export function daylight(elapsed){
 if(elapsed<180)return {darkness:0,label:'DZIEŃ'};
 const phase=(elapsed-180)%180;
 const smooth=t=>t*t*(3-2*t);
 if(phase<10)return {darkness:smooth(phase/10),label:'ZMIERZCH'};
 if(phase<50)return {darkness:1,label:'NOC'};
 if(phase<60)return {darkness:1-smooth((phase-50)/10),label:'ŚWIT'};
 return {darkness:0,label:'DZIEŃ'};
}
export function drawNight(ctx,width,height,elapsed){
 const {darkness}=daylight(elapsed);if(!darkness)return;
 ctx.save();ctx.globalAlpha=darkness*.53;ctx.fillStyle='#08152f';ctx.fillRect(0,0,width,height);ctx.restore();
}
