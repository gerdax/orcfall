import {hash} from './world.js?v=0.10.0';
export function riverCenter(world,x,y){const band=Math.round((x-640)/1280);return band*1280+640+Math.sin(y/210+world.seed%17)*43+Math.sin(y/530)*26}
// Shared eight-pixel shoreline cells keep water rendering and collision identical.
export function riverGround(world,x,y){
 const px=Math.floor(x/8)*8+4,py=Math.floor(y/8)*8+4;
 const d=Math.abs(px-riverCenter(world,px,py));
 if(d>36)return null;
 const road=Math.abs(py+world.warp(px)-Math.round((py+world.warp(px))/640)*640);
 if(road<20)return 'bridge';
 return d<28?'water':'bank';
}
export function fishingHuts(world,left,top,right,bottom){
 const huts=[];
 for(let gx=Math.floor((left-740)/1280);gx<=Math.ceil((right-540)/1280);gx++)for(let gy=Math.floor((top-340)/640);gy<=Math.ceil((bottom+340)/640);gy++){
  if(hash(gx,gy,world.seed+1201)>.6)continue;
  let y=gy*640+110;const side=hash(gx,gy,world.seed+1202)>.5?1:-1;
  let x=Math.round(riverCenter(world,gx*1280+640,y)+side*68);
  for(let attempt=0;attempt<8&&world.pathDistance(x,y)<55;attempt++){y+=24;x=Math.round(riverCenter(world,gx*1280+640,y)+side*68)}
  if(world.pathDistance(x,y)<55)continue;
  if(x<left-48||x>right+48||y<top-48||y>bottom+48)continue;
  huts.push({type:'house',x,y,w:32,h:28,sourceW:32,sourceH:28,angle:0,roofStyle:1,label:'Chata rybacka',fishing:true,side});
 }
 return huts;
}
export function fieldAt(world,x,y){
 const t=world.townAt(x,y);if(!t||t.kind==='castle')return false;
 const dx=Math.abs(x-t.x),dy=Math.abs(y-t.y);
 return dx>155&&dx<235&&dy>100&&dy<210&&world.pathDistance(x,y)>24&&!t.objects.some(o=>Math.abs(x-o.x)<(o.w||16)/2+12&&Math.abs(y-o.y)<(o.h||16)/2+12);
}
export function drawFishingGear(ctx,o){
 const x=Math.round(o.x),y=Math.round(o.y),r=(dx,dy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
 r(19,9,9,7,'#493c29');r(20,9,7,2,'#9d8251');r(19,15,9,1,'#b49a66');
 r(-22,4,1,17,'#786748');r(-13,4,1,17,'#786748');
 for(let i=0;i<4;i++){r(-21,6+i*3,8,1,'#a9a288');r(-21+i*2,6,1,10,'#a9a288')}
 r(-8,21,15,5,'#584330');r(-6,22,11,2,'#92714a');
}
