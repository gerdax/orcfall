// Two wooden lookout towers, beside the north and south approaches.
export function addWatchtowers(town){
 if(town.kind==='castle')return;
 for(const side of [-1,1]){
  let spot;
  for(const yOffset of [214,190,166,142,118,94]){
   for(const xOffset of [48,-48,76,-76,104,-104,132,-132,160,-160,188,-188,216,-216]){
    const x=town.x+xOffset,y=town.y+side*yOffset;
    if(town.objects.some(o=>!o.decorative&&Math.abs(x-o.x)<(o.w??16)/2+22&&Math.abs(y-o.y)<(o.h??16)/2+22))continue;
    spot={x,y};break;
   }
   if(spot)break;
  }
  if(!spot)throw new Error(`No space for watchtower in ${town.id}`);
  town.objects.push({type:'watchtower',...spot,w:18,h:18,label:'Wieża strażnicza'});
 }
}
export function drawWatchtower(ctx,o){
 const x=Math.round(o.x),y=Math.round(o.y),p=(dx,dy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
 p(-10,-3,25,16,'#293728');
 // Tall supports and braces above the collision footprint.
 for(const dx of [-8,5]){p(dx,-28,3,37,'#443322');p(dx,-27,1,35,'#a08250')}
 for(let i=0;i<14;i++){p(-6+i,-17+i,2,2,'#705333');p(6-i,-17+i,2,2,'#876740')}
 p(-3,-20,1,29,'#ad915e');p(2,-20,1,29,'#755737');
 for(let dy=-18;dy<9;dy+=4)p(-3,dy,6,1,'#b39864');
 p(-12,-28,24,8,'#3a2c21');p(-11,-28,22,5,'#9c7b4b');
 for(let dx=-10;dx<12;dx+=4)p(dx,-27,1,4,'#685034');
 // Guard under the roof; raised parapet and pointed shingle roof.
 p(-3,-37,6,6,'#252d2c');p(-2,-36,4,4,'#a4b6b5');p(-2,-32,5,5,'#355475');
 p(-12,-32,2,9,'#a58b58');p(10,-32,2,9,'#765636');p(-12,-30,24,2,'#c0a16a');
 p(-14,-39,28,3,'#342b22');p(-11,-42,22,3,'#68523a');p(-7,-45,14,3,'#92764c');p(-3,-47,6,2,'#b09360');
 p(10,-48,1,11,'#7a6545');p(11,-48,7,4,'#8d4235');p(11,-44,4,2,'#b45b41');
}
