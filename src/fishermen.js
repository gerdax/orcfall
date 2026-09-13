import {riverCenter,riverGround} from './countryside.js';
import {collides} from './geometry.js';
export function makeFisherman(world,hut,objects){
 for(let offset=20;offset<=68;offset+=8){
  const y=hut.y+offset,x=Math.round(riverCenter(world,hut.x,y)+hut.side*40),floatX=x-hut.side*22;
  if(riverGround(world,floatX,y)!=='water'||objects.some(o=>collides(x,y,o,6)))continue;
  return {id:`fisher:${hut.x}:${hut.y}`,type:'fisherman',x,y,side:hut.side,chunk:`${Math.floor(hut.x/128)}:${Math.floor(hut.y/128)}`,hp:3,phase:Math.abs(hut.y%9)};
 }
 return null;
}
export function drawFisherman(ctx,a,time){
 const x=Math.round(a.x),y=Math.round(a.y),s=-a.side,p=(dx,dy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
 p(-6,5,13,3,'#293c2d');p(-4,-2,8,8,'#514a33');p(-3,-1,6,5,'#8b8453');p(-3,5,2,3,'#3e3227');p(1,5,2,3,'#3e3227');
 p(-3,-7,6,5,'#c19a70');p(-5,-8,10,2,'#a99155');p(-3,-11,6,3,'#c4ae70');p(s>0?2:-4,-1,3,2,'#d0ad7b');
 const catching=(time+a.phase)%10>8;
 for(let i=0;i<17;i++)p(s*(i+3),-Math.floor(i*.55)-(catching?4:0),1,1,'#b3935d');
 const endY=catching?-10:0;
 for(let i=-9;i<endY;i++)p(s*22,i,1,1,'#c4c8a4');
 if(catching){p(s*22,-10,4,2,'#b4d0c1');p(s*22-1,-11,1,4,'#698f94')}
 else{p(s*22,0,2,2,'#c45b3d');if(Math.floor(time*3)%2)p(s*22-2,3,6,1,'#759ea0')}
 p(7,3,5,5,'#786c4e');p(8,2,3,1,'#b1aa8c');
}
