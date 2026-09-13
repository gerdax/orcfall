import {collides} from './geometry.js';
// Trade routes follow the north/south trunk road to another village.
export function makeMerchant(town,world){
 if(!world)return null;
 const [gx,gy]=town.id.split(':').map(Number);
 let destination;
 for(const sign of [1,-1]){
 for(let distance=1;distance<=6&&!destination;distance++){
  const candidate=world.getTown(gx,gy+sign*distance);
  if(candidate?.kind==='castle')break;
  if(candidate)destination=candidate;
 }
 }
 if(!destination)return null;
 const route=[];
 const travelSign=Math.sign(destination.y-town.y);
 for(let y=town.y;travelSign*(destination.y-y)>=0;y+=travelSign*4){
  const local=world.townAt(gx*1280-world.warp(y),y);
  let x=gx*1280-world.warp(y);
  if(local){const dy=y-local.y,r=Math.abs(dy),u=Math.max(0,Math.min(1,(r-200)/60)),blend=u*u*(3-2*u);
   x=local.x-(1-blend)*Math.sin(dy/70)*11-blend*(world.warp(y)-world.warp(local.y));
  }
  if(local){
   const base=x;let found=false;
   for(let offset=0;offset<=32&&!found;offset++)for(const sign of [1,-1]){
    const candidate=base+offset*sign;
    if(!local.objects.some(o=>collides(candidate,y,o,10))){x=candidate;found=true;break}
   }
   if(!found)return null;
  }
  route.push({x,y});
 }
 route.push({x:destination.x,y:destination.y});
 const start=route[0];return {id:`${town.id}:merchant`,townId:town.id,destinationId:destination.id,type:'merchant',...start,route,index:1,direction:1,dir:'down',moving:false,wait:0};
}
export function updateMerchant(a,dt){
 a.moving=false;if(a.wait>0){a.wait-=dt;return}
 const target=a.route[a.index],dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy),step=30*dt;
 a.dir=dy>=0?'down':'up';
 if(d<=step){a.x=target.x;a.y=target.y;a.index+=a.direction;
  if(a.index>=a.route.length||a.index<0){a.direction*=-1;a.index+=a.direction*2;a.wait=8}
 }else{a.x+=dx/d*step;a.y+=dy/d*step;a.moving=true}
}
export function drawMerchant(ctx,a,time){
 const x=Math.round(a.x),y=Math.round(a.y),s=a.dir==='up'?-1:1;
 const p=(dx,dy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+(s>0?dy:-dy-h),w,h)};
 p(-9,-12,20,31,'#303d29');
 // Cart, iron-rimmed wheels, canvas cover and cargo.
 p(-9,-10,3,7,'#252724');p(7,-10,3,7,'#252724');p(-8,-9,1,5,'#a4a28b');p(8,-9,1,5,'#a4a28b');
 p(-7,-15,14,15,'#493424');p(-6,-14,12,13,'#967249');
 for(let i=-12;i<-2;i+=3)p(-6,i,12,1,'#60462c');
 p(-6,-16,12,7,'#c4b583');p(-5,-17,10,2,'#ddd0a0');p(-1,-16,2,7,'#a3956f');
 p(-5,-7,5,4,'#b69050');p(1,-7,4,4,'#765534');
 // Seated merchant: brown hat, face, burgundy coat.
 p(-3,-3,6,4,'#793f35');p(-2,-5,4,3,'#d0a074');p(-3,-7,6,2,'#4b3628');
 p(-4,0,1,9,'#725735');p(3,0,1,9,'#725735');
 // Harnessed horse with animated legs.
 const step=a.moving?(Math.floor(time*7)%2?1:-1):0;
 p(-4,8+step,2,8,'#30281f');p(2,8-step,2,8,'#30281f');
 p(-3,5,6,11,'#866345');p(-2,6,3,8,'#aa8158');p(-1,14,4,6,'#8e6b49');p(0,18,3,3,'#56412d');
 p(-1,13,1,5,'#382c22');p(-3,9,6,2,'#493d2c');p(0,16,1,1,'#1e231c');
}
