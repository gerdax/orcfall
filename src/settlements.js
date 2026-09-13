import {drawChiefTower} from './chief-tower.js';
import {drawCamp} from './camps.js?v=0.10.2';
import {drawWatchtower} from './watchtowers.js';
import {drawPalisade} from './palisades.js?v=0.8.1';
import {rotatedBounds,buildingDoor,collides} from './geometry.js';
// Buildings share the hero's native 1 px grid: no high-resolution textures.
export const TOWN_SPACING=1280;
export function makeTown(gx,gy,x,y,seed){
 const names=['Brzeziny','Dębowiec','Kamienny Bród','Lipowa Dolina','Borki','Zielone Łęgi'];
 const name=names[Math.abs((gx*7+gy*13+seed)%names.length)];
 let state=(seed^Math.imul(gx,73856093)^Math.imul(gy,19349663))>>>0;
 state=Math.imul(state^(state>>>16),0x7feb352d);state=Math.imul(state^(state>>>15),0x846ca68b);state=(state^(state>>>16))>>>0;
 const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 const layout=Math.floor(random()*3),objects=[],lanes=[],courtyards=[],reservations=[];
 const add=(type,dx,dy,w,h,extra={})=>{const o={type,x:x+Math.round(dx),y:y+Math.round(dy),w,h,...extra};objects.push(o);return o};
 const clear=(dx,dy,w,h)=>Math.abs(dx)-w/2>26&&Math.abs(dy)-h/2>26&&Math.abs(dx)+w/2<238&&Math.abs(dy)+h/2<238&&!reservations.some(o=>Math.abs(dx-o.x)<(w+o.w)/2+16&&Math.abs(dy-o.y)<(h+o.h)/2+16);
 const place=(type,dx,dy,sw,sh,angle)=>{
  const bounds=rotatedBounds(sw,sh,angle);
  if(!clear(dx,dy,bounds.w,bounds.h))return null;
  const o=add(type,dx,dy,bounds.w,bounds.h,{sourceW:sw,sourceH:sh,angle,roofStyle:Math.floor(random()*3),label:type==='inn'?'Oberża Pod Dębem':type==='stable'?'Stajnia':undefined});
  reservations.push({x:dx,y:dy,w:bounds.w,h:bounds.h});return o;
 };
 const inn=place('inn',-95-Math.round(random()*22),-83-Math.round(random()*32),58,40,random()>.5?20:-20);
 const stable=place('stable',76+Math.round(random()*12),-96-Math.round(random()*20),54,38,random()>.5?15:-15);
 // The paddock follows the stable's footprint. Its gate has its own access path.
 const left=stable.x-x+stable.w/2+16,right=left+48,top=stable.y-y-24,bottom=top+48;
 for(let xx=left;xx<=right;xx+=8){add('fence',xx,top,8,3);add('fence',xx,bottom,8,3)}
 for(let yy=top+8;yy<bottom;yy+=8){add('fence',right,yy,3,8);if(Math.abs(yy-(top+24))>9)add('fence',left,yy,3,8)}
 add('horse',left+25,top+24,12,7,{decorative:true});add('trough',right-10,bottom-9,13,5);
 reservations.push({x:(left+right)/2,y:(top+bottom)/2,w:56,h:56});
 const gate={x:x+Math.round(left-8),y:y+Math.round(top+24)};
 const clusters=[{x:-115,y:111},{x:116,y:112},{x:-135,y:-149}];
 if(layout===1)courtyards.push(...clusters.slice(0,2).map(c=>({...c,r:21})));
 const target=5+Math.floor(random()*4);
 let houses=0;
 for(let attempt=0;attempt<400&&houses<target;attempt++){
  let dx,dy;
  if(layout===0){dx=(random()>.5?1:-1)*(63+random()*74);dy=-195+random()*390}
  else if(layout===1){const c=clusters[attempt%3],a=random()*Math.PI*2,r=48+random()*20;dx=c.x+Math.cos(a)*r;dy=c.y+Math.sin(a)*r}
  else{const c=clusters[attempt%3];dx=c.x+(random()-.5)*140;dy=c.y+(random()-.5)*145}
  dx=Math.round(dx);dy=Math.round(dy);
  const sw=30+Math.floor(random()*9)*2,sh=24+Math.floor(random()*6)*2;
  let tx=0,ty=0;
  if(layout===1){const c=clusters[attempt%3];tx=c.x;ty=c.y}
  else if(Math.abs(dx)<Math.abs(dy)){ty=dy}else{tx=dx}
  const heading=Math.atan2(-(tx-dx),ty-dy)*180/Math.PI;
  const angle=Math.round(heading/15)*15+(Math.floor(random()*3)-1)*15;
  const bounds=rotatedBounds(sw,sh,angle);
  if(courtyards.some(c=>Math.abs(dx-c.x)<bounds.w/2+c.r+3&&Math.abs(dy-c.y)<bounds.h/2+c.r+3))continue;
  if(place('house',dx,dy,sw,sh,angle))houses++;
 }
 add('well',27,25,12,12,{label:'Studnia'});add('sign',-20,32,5,5,{label:name});
 // Route to actual oriented doors, avoiding all walls and fences.
 const targets=objects.filter(o=>o.sourceW).map(o=>buildingDoor(o));targets.push(gate);
 const step=4,limit=260,side=limit*2/step+1,total=side*side;
 const parent=new Int32Array(total).fill(-1),queue=new Int32Array(total);
 const key=(ix,iy)=>iy*side+ix,start=(side*side-1)/2;parent[start]=start;queue[0]=start;
 let end=1;
 for(let q=0;q<end;q++){
  const id=queue[q],ix=id%side,iy=Math.floor(id/side);
  for(const [sx,sy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const nx=ix+sx,ny=iy+sy;if(nx<0||ny<0||nx>=side||ny>=side)continue;
   const next=key(nx,ny);if(parent[next]!==-1)continue;
   if(objects.some(o=>collides(x+nx*step-limit,y+ny*step-limit,o,7)))continue;
   parent[next]=id;queue[end++]=next;
  }
 }
 for(const door of targets){
  let closest=-1,best=Infinity;
  for(let q=0;q<end;q++){const id=queue[q],dx=(id%side)*step-limit-(door.x-x),dy=Math.floor(id/side)*step-limit-(door.y-y),d=dx*dx+dy*dy;if(d<best){best=d;closest=id}}
  if(best>36)continue;
  const points=[];let cursor=closest;
  while(cursor!==start){const px=(cursor%side)*step-limit,py=Math.floor(cursor/side)*step-limit;points.push({x:px,y:py});if(Math.min(Math.abs(px+Math.sin(py/70)*11),Math.abs(py+Math.sin(px/85)*9))<7)break;cursor=parent[cursor]}
  for(let i=0;i<points.length-1;){let j=i+1;const dx=points[j].x-points[i].x,dy=points[j].y-points[i].y;while(j+1<points.length&&points[j+1].x-points[j].x===dx&&points[j+1].y-points[j].y===dy)j++;lanes.push({ax:points[i].x,ay:points[i].y,bx:points[j].x,by:points[j].y});i=j}
 }
 return {id:`${gx}:${gy}`,x,y,name,layout,lanes,courtyards,objects};
}
function drawSettlementShape(ctx,o,time=0){
 const x=Math.round(o.x),y=Math.round(o.y);
 const p=(dx,dy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x+dx),Math.round(y+dy),w,h)};
 if(['house','inn','stable'].includes(o.type)){
  const w=o.w,h=o.h,l=-w/2,t=-h/2;
  p(l+2,t+3,w,h,'#2e3828');p(l,t,w,h,'#352a23');
  p(l+2,t+2,w-4,h-4,'#b1a17b');
  p(l+2,h/2-6,w-4,4,'#8b7758');
  const roof=o.roofStyle===2?['#273c30','#40573d','#637750']:o.type==='stable'?['#4b442b','#71633b','#8a7949']:o.type==='inn'?['#422c23','#66412f','#865b3c']:['#3b3025','#5c4833','#7c6546'];
  p(l-2,t-3,w+4,h-3,roof[0]);
  p(l,t-2,w/2,h-5,roof[2]);p(0,t-2,w/2,h-5,roof[1]);
  for(let row=t+2;row<h/2-7;row+=4){p(l,row,w,1,roof[0]);for(let col=l+3;col<w/2;col+=7)p(col+(row%8?2:0),row-2,1,2,roof[0])}
  for(let yy=t;yy<h/2-7;yy++)for(let xx=l;xx<w/2;xx++){
   const grain=((xx*17+yy*37+o.x*3+o.y*7)%31+31)%31;
   if(grain<2)p(xx,yy,1,1,roof[0]);else if(grain===30)p(xx,yy,1,1,roof[2]);
  }
  p(l-3,h/2-7,w+6,2,'#30291f');
  p(-1,t-3,2,h-3,'#aa8d5a');
  p(-4,h/2-6,8,6,'#342d24');p(-3,h/2-5,5,5,'#685039');p(2,h/2-3,1,1,'#d1b269');
  p(l+5,h/2-5,5,3,'#35474a');p(w/2-10,h/2-5,5,3,'#35474a');
  if(o.type!=='stable'){p(l+7,t+2,5,7,'#4e4840');p(l+8,t+1,4,3,'#aaa58d');}
  if(o.type==='inn'){
   p(w/2+1,h/2-7,1,9,'#3b3025');p(w/2+2,h/2-6,8,7,'#382f24');p(w/2+3,h/2-5,5,5,'#d6bd78');
   p(w/2+4,h/2-4,2,3,'#785536');p(w/2+6,h/2-4,1,2,'#785536');
  }
  if(o.type==='stable'){p(-10,h/2-6,20,6,'#302c22');p(-8,h/2-4,7,3,'#c5ad66');}
 }else if(o.type==='barrel'){
  p(-3,-5,6,11,'#30271c');p(-4,-3,8,7,'#694d30');p(-2,-4,2,9,'#8b6940');p(2,-3,1,7,'#4f3925');
  p(-3,-5,6,2,'#98917a');p(-4,-1,8,1,'#44483e');p(-3,4,6,1,'#97907a');p(-2,-4,4,1,'#493b28');
 }else if(o.type==='crate'){
  p(-6,-6,12,12,'#2f291d');p(-5,-5,10,10,'#765a37');
  for(let dx=-3;dx<5;dx+=3)p(dx,-4,1,8,'#463923');p(-5,-4,10,1,'#a18350');p(-5,3,10,1,'#a18350');p(-4,-5,1,10,'#9a7b48');p(4,-5,1,10,'#4d3b24');
 }else if(o.type==='well'){
  p(-7,-4,14,11,'#3b443b');p(-6,-5,12,10,'#969889');p(-4,-3,8,6,'#324951');p(-3,-2,5,3,'#52717a');
  p(-7,-7,2,11,'#6d5134');p(5,-7,2,11,'#6d5134');p(-8,-8,16,3,'#9c7950');p(-1,-5,1,7,'#c7b791');p(-2,1,4,3,'#807057');
 }else if(o.type==='fence'){
  p(-o.w/2,-o.h/2+2,o.w,o.h,'#34402d');
  if(o.w>o.h){p(-4,-2,8,1,'#b49867');p(-4,1,8,1,'#816847');p(-4,-3,2,7,'#b49c70')}
  else{p(-1,-4,1,8,'#ab8b5a');p(1,-4,1,8,'#705937');p(-2,-4,5,2,'#b49c70')}
 }else if(o.type==='horse'){
  p(-6,-2,11,6,'#392b21');p(-5,-3,8,5,'#927052');p(-3,-2,5,3,'#b18a61');p(3,-5,3,5,'#856346');p(4,-6,1,2,'#362a21');p(-6,1,1,4,'#332b22');p(2,1,1,4,'#332b22');p(-8,-1,3,1,'#3b2b22');
 }else if(o.type==='trough'){
  p(-6,-2,13,5,'#655541');p(-5,-1,11,2,'#627f7b');p(-5,2,2,2,'#413a2b');p(4,2,2,2,'#413a2b');
 }else if(o.type==='sign'){
  p(-1,-1,2,8,'#725438');p(-6,-4,12,5,'#3e3326');p(-5,-3,10,3,'#b19b65');p(1,-2,3,1,'#625239');
 }
}
export function isSettlementObject(o){return !['tree','rock'].includes(o.type)}

// Rotation is rasterized once onto the native grid, never CSS/canvas-smoothed.
const buildingCache=new Map();
export function drawSettlement(ctx,o,time=0){
 if(o.type.startsWith('camp-')){drawCamp(ctx,o,time);return}
 if(o.type==='chief-tower'){drawChiefTower(ctx,o);return}
 if(o.type==='watchtower'){drawWatchtower(ctx,o);return}
 if(o.type.startsWith('palisade')){drawPalisade(ctx,o);return}
 if(o.sourceW===undefined){drawSettlementShape(ctx,o,time);return;}
 const key=[o.type,o.sourceW,o.sourceH,o.angle,o.roofStyle].join(':');
 if(!buildingCache.has(key)){
  const pixels=new Array(128*128),raster={fillStyle:'',fillRect(x,y,w,h){for(let py=y;py<y+h;py++)for(let px=x;px<x+w;px++){const ix=px+64,iy=py+64;if(ix>=0&&iy>=0&&ix<128&&iy<128)pixels[iy*128+ix]=this.fillStyle}}};
  drawSettlementShape(raster,{...o,x:0,y:0,w:o.sourceW,h:o.sourceH});
  const a=o.angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),runs=[];
  for(let y=-60;y<60;y++){
   let color=null,start=-60;
   for(let x=-60;x<=60;x++){
    const sx=Math.floor((x+.5)*c+(y+.5)*s)+64,sy=Math.floor(-(x+.5)*s+(y+.5)*c)+64;
    const next=x===60?null:pixels[sy*128+sx]??null;
    if(next!==color){if(color)runs.push([start,y,x-start,color]);color=next;start=x}
   }
  }
  buildingCache.set(key,runs);if(buildingCache.size>128)buildingCache.delete(buildingCache.keys().next().value);
 }
 for(const [x,y,w,color] of buildingCache.get(key)){ctx.fillStyle=color;ctx.fillRect(Math.round(o.x)+x,Math.round(o.y)+y,w,1)}
}
