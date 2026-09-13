import {hash} from './world.js?v=0.10.0';
import {riverGround} from './countryside.js';
export function campsIn(world,left,top,right,bottom){
 world.camps??=new Map();const result=[];
 for(let gy=Math.floor((top-90)/512);gy<=Math.floor((bottom+90)/512);gy++)for(let gx=Math.floor((left-90)/512);gx<=Math.floor((right+90)/512);gx++){
  const id=`${gx}:${gy}`;
  if(!world.camps.has(id)){
   const x=gx*512+256,y=gy*512+256;let valid=hash(gx,gy,world.seed+2201)<.5;
   for(let dy=-80;dy<=80&&valid;dy+=16)for(let dx=-80;dx<=80;dx+=16)if(world.townAt(x+dx,y+dy)||riverGround(world,x+dx,y+dy)||world.pathDistance(x+dx,y+dy)<24){valid=false;break}
   world.camps.set(id,valid?{id,x,y}:null);
  }
  const c=world.camps.get(id);if(c&&c.x+90>=left&&c.x-90<=right&&c.y+90>=top&&c.y-90<=bottom)result.push(c);
 }
 while(world.camps.size>128)world.camps.delete(world.camps.keys().next().value);
 return result;
}
export function campObjects(c){return [
 {type:'camp-tent',x:c.x-37,y:c.y-30,w:32,h:24,label:'Obóz orków i goblinów'},
 {type:'camp-tent',x:c.x+37,y:c.y-30,w:32,h:24},
 {type:'camp-fire',x:c.x,y:c.y+12,w:12,h:12,decorative:true},
 {type:'crate',x:c.x-42,y:c.y+25,w:12,h:12},
 {type:'barrel',x:c.x+42,y:c.y+25,w:8,h:10}];}
export function campResidents(c){return [[0,-35,'orc',true],[-25,12,'orc'],[25,12,'orc'],[-20,42,'goblin'],[20,42,'goblin'],[0,58,'goblin']].map(([dx,dy,type,boss],i)=>({id:`camp:${c.id}:${i}`,type,boss:!!boss,x:c.x+dx,y:c.y+dy,homeX:c.x+dx,homeY:c.y+dy,hp:boss?10:type==='orc'?3:2,maxHp:boss?10:type==='orc'?3:2,dir:'down',moving:false,timer:0,cooldown:0,windup:0,flash:0,variant:i%3,chunk:`${Math.floor((c.x+dx)/128)}:${Math.floor((c.y+dy)/128)}`}));}
export function drawCamp(ctx,o,time){const x=Math.round(o.x),y=Math.round(o.y),p=(dx,dy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
 if(o.type==='camp-tent'){
  p(-18,6,38,9,'#293526');for(let row=0;row<26;row++){const half=3+Math.floor(row*.58);p(-half,row-20,half,1,'#aa8c58');p(0,row-20,half,1,'#75603e')}
  p(-5,-3,10,11,'#29271e');p(-1,-22,2,30,'#453827');p(9,-29,1,18,'#5f4931');p(10,-29,10,7,'#903d2e');p(13,-27,3,3,'#292920');
 }else{p(-9,-4,18,10,'#575849');p(-6,-2,12,5,'#3e2e20');for(let i=-4;i<=4;i++){const h=6+Math.round(Math.sin(time*9+i)*2)+4-Math.abs(i);p(i,-h,1,h,i%2?'#e3ad44':'#bd642c')}p(-1,-7,2,6,'#f0d780')}
}
export function drawChief(ctx,a,time){const x=Math.round(a.x),y=Math.round(a.y),p=(dx,dy,w,h,c)=>{ctx.fillStyle=time<a.flash?'#e4d9b3':c;ctx.fillRect(x+dx,y+dy,w,h)};
 p(-10,7,22,4,'#293c2d');p(-8,-5,16,14,'#242a20');p(-7,-4,14,10,'#574532');p(-10,-4,4,8,'#617741');p(7,-4,4,8,'#617741');p(-7,-16,14,13,'#283523');p(-6,-15,12,10,'#78934d');p(-5,-11,3,2,'#d6c25e');p(2,-11,3,2,'#d6c25e');p(-4,-6,2,4,'#e0d7af');p(3,-6,2,4,'#e0d7af');p(-6,6,5,5,'#322b22');p(2,6,5,5,'#322b22');p(-7,-2,14,3,'#888476');p(12,-9,2,21,'#8d7044');p(9,-10,9,6,'#a5aba0');p(-12,-23,24,4,'#20231d');p(-11,-22,Math.ceil(22*a.hp/10),2,'#c95536');}
