import {riverGround,fieldAt} from './countryside.js';
import {castleGround} from './castles.js';
import {CHUNK_SIZE, hash} from './world.js';
const grass=['#263820','#30451f','#3b501f','#465b25','#50652b','#5a7130','#637933'];
const trail=['#625236','#705c3d','#806b46'];
// Height is sampled on a coarse lattice, but all visible edges and marks use
// the same native ONE pixel as the 16×16 hero. A fixed palette avoids fine noise.
export function terrainSurface(world,chunk){
 if(chunk.surface)return chunk.surface;
 const surface=document.createElement('canvas');surface.width=surface.height=CHUNK_SIZE;
 const ctx=surface.getContext('2d'),side=CHUNK_SIZE/4+1;
 const heights=new Float32Array(side*side),forests=new Float32Array(side*side);
 for(let j=0;j<side;j++)for(let i=0;i<side;i++){
  heights[j*side+i]=world.height(chunk.x+i*4,chunk.y+j*4);
  forests[j*side+i]=world.forest(chunk.x+i*4,chunk.y+j*4);
 }
 const sample=(field,x,y)=>{
  const gx=x/4,gy=y/4,i=Math.floor(gx),j=Math.floor(gy),u=gx-i,v=gy-j,k=j*side+i;
  return (field[k]*(1-u)+field[k+1]*u)*(1-v)+(field[k+side]*(1-u)+field[k+side+1]*u)*v;
 };
 const town=world.townAt(chunk.x+64,chunk.y+64);
 for(let y=0;y<CHUNK_SIZE;y++)for(let x=0;x<CHUNK_SIZE;x++){
  const wx=chunk.x+x,wy=chunk.y+y,h=sample(heights,x,y),f=sample(forests,x,y);
  const prev=y>0?sample(heights,x,y-1):world.height(wx,wy-1);
  const grain=hash(wx,wy,world.seed+91),path=world.pathDistance(wx,wy);
  const patch=hash(Math.floor(wx/3),Math.floor(wy/3),world.seed+93);
  const square=town&&(Math.hypot((wx-town.x)/1.35,wy-town.y)<30+patch*4||town.courtyards.some(c=>Math.hypot(wx-town.x-c.x,wy-town.y-c.y)<c.r+patch*3));
  let color;
  const castle=castleGround(town,wx,wy),river=riverGround(world,wx,wy);
  if(castle==='water')color=grain>.85?'#497e87':patch>.5?'#2f6474':'#34596a';
  else if(castle==='bridge')color=(Math.floor(wy-town.y)%5===0||Math.floor(wx-town.x)%19===0)?'#544431':'#97805a';
  else if(castle==='courtyard')color=(wy%5===0||(wx+(Math.floor(wy/5)%2)*4)%8===0)?'#626557':grain>.8?'#aaa58d':'#898b77';
  else if(river==='water')color=(wy%9===0&&wx%13<5)?'#6b9d9d':patch>.5?'#315e70':'#396f7e';
  else if(river==='bridge')color=wx%6===0?'#51402c':grain>.8?'#b39665':'#92754e';
  else if(river==='bank')color=grain>.6?'#8a8762':'#667454';
  else if(fieldAt(world,wx,wy))color=wy%7<2?'#4c3d25':wx%4===0&&wy%7>3?'#c4ac52':grain>.7?'#a89746':'#81723a';
  else if(square)color=grain>.82?'#877958':patch>.5?'#6d6449':'#766b4e';
  else if(path<9+patch*6&&(path<8||grain>.3))color=trail[grain>.82?2:grain<.22?0:1];
  else{
   let level=Math.max(0,Math.min(6,Math.floor(h*6+1-(f>.55?1:0))));
   if(Math.floor(h*11)!==Math.floor(prev*11))level=Math.max(0,Math.min(6,level+(h>prev?1:-1)));
   level=Math.max(0,Math.min(6,level+(patch>.7?1:patch<.2?-1:0)));
   color=grass[level];
   if(grain>.90)color=grass[Math.min(6,level+1)];if(grain<.10)color=grass[Math.max(0,level-1)];
   if(grain>.998)color='#bca75e';
  }
  ctx.fillStyle=color;ctx.fillRect(x,y,1,1);
 }
 chunk.surface=surface;return surface;
}
