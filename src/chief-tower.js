// A single masonry residence for the village chief; castles already have a keep.
export function addChiefTower(town){
 if(town.kind==='castle')return;
 let spot;
 for(let y=-180;y<=180&&!spot;y+=12)for(let x=-180;x<=180;x+=12){
  if(Math.abs(x)<48||Math.abs(y)<48)continue;
  if(town.objects.some(o=>!o.decorative&&Math.abs(town.x+x-o.x)<(o.w??16)/2+27&&Math.abs(town.y+y-o.y)<(o.h??16)/2+27))continue;
  if(town.lanes.some(l=>{const dx=l.bx-l.ax,dy=l.by-l.ay,t=Math.max(0,Math.min(1,((x-l.ax)*dx+(y-l.ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-l.ax-t*dx,y-l.ay-t*dy)<35}))continue;
  spot={x:town.x+x,y:town.y+y};break;
 }
 if(!spot)throw new Error(`No space for chief tower in ${town.id}`);
 town.objects.push({type:'chief-tower',...spot,w:30,h:28,label:'Wieża wodza wioski'});
}
export function drawChiefTower(ctx,o){
 const x=Math.round(o.x),y=Math.round(o.y),p=(dx,dy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
 p(-15,2,35,15,'#2c352c');p(-16,-35,32,48,'#343b3a');p(-14,-34,28,46,'#777e7b');p(5,-34,9,46,'#5b6363');
 for(let row=-32;row<11;row+=5){p(-14,row,28,1,'#414b4b');for(let col=-13;col<14;col+=8){const xx=col+((row+32)%10?4:0);if(xx<14)p(xx,row-4,1,4,'#4f5958')}}
 p(-14,-34,2,43,'#a2a7a0');p(-17,-36,34,4,'#9ca39d');p(-17,-33,34,1,'#4d5653');p(-14,-44,28,8,'#424c49');p(-12,-42,24,5,'#6e7872');
 for(let col=-17;col<=11;col+=7){p(col,-46,6,11,'#5c6562');p(col,-46,6,2,'#c0c4b7');p(col,-44,2,8,'#969f96')}
 for(const col of [-9,7]){p(col,-25,4,9,'#303a38');p(col+1,-24,1,6,'#b8b897');p(col-1,-16,6,2,'#a3a99e')}
 p(-5,1,10,11,'#343830');p(-4,2,8,10,'#6a5037');p(-3,3,1,8,'#9c7a4c');p(2,7,1,1,'#ddc77b');p(-6,12,12,2,'#a2a591');
 p(-4,-14,8,12,'#733a35');p(-3,-13,6,2,'#bea36b');p(-1,-10,2,5,'#ceb575');
 p(9,-58,1,18,'#594b35');p(10,-58,12,6,'#91473c');p(10,-52,8,2,'#b56748');p(14,-56,3,3,'#d0b36d');
}
