// Broad collision segments, individual sharpened logs drawn at native resolution.
export function addPalisade(town,warp){
 if(town.kind==='castle'||town.objects.filter(o=>o.type==='house').length<7)return;
 town.fortified=true;
 const edge=town.kind==='city'?368:248,blend=town.kind==='city'?1:.896,gap=56;
 for(const side of [-1,1])for(const horizontal of [true,false]){
  const offset=side*edge;
  const center=Math.round(horizontal?
   -(1-blend)*Math.sin(offset/70)*11-blend*(warp(town.y+offset)-warp(town.y)):
   -(1-blend)*Math.sin(offset/85)*9-blend*(warp(town.x+offset)-warp(town.x)));
  for(const [start,end] of [[-edge,center-gap/2],[center+gap/2,edge]]){
   for(let a=start;a<end;a+=24){const b=Math.min(a+24,end),length=b-a;
   town.objects.push({type:'palisade',x:town.x+(horizontal?(a+b)/2:offset),y:town.y+(horizontal?offset:(a+b)/2),w:horizontal?length:8,h:horizontal?8:length,horizontal});
   }
  }
  // Tall gate posts frame the opening without an overhead beam hiding travellers.
  for(const sign of [-1,1])town.objects.push({type:'palisade-post',x:town.x+(horizontal?center+sign*(gap/2+2):offset),y:town.y+(horizontal?offset:center+sign*(gap/2+2)),w:6,h:6});
 }
}
export function drawPalisade(ctx,o){
 const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const log=(x,y,height)=>{
  r(x-3,y-2,9,7,'#293524');r(x-3,y-height+3,6,height,'#392b20');
  r(x-2,y-height+2,4,height,'#80603b');r(x-2,y-height+4,1,height-2,'#b08b55');r(x+1,y-height+3,1,height-1,'#594129');
  r(x-1,y-height,2,3,'#bea16c');r(x,y-8,1,3,'#4e3826');
 };
 if(o.type==='palisade-post'){log(o.x,o.y,30);return}
 const length=o.horizontal?o.w:o.h,start=(o.horizontal?o.x:o.y)-length/2;
 const count=Math.max(1,Math.ceil(length/6));
 for(let i=0;i<count;i++){const p=start+(i+.5)*length/count;log(o.horizontal?p:o.x,o.horizontal?o.y:p,23+(Math.floor(p/6)%3+3)%3)}
 if(o.horizontal){r(o.x-o.w/2,o.y-6,o.w,2,'#4c3827');r(o.x-o.w/2,o.y-15,o.w,2,'#63482e')}
}
