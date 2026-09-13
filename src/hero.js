import {collides} from './geometry.js';
export const PALETTE={'.':null,'o':'#111b1b','h':'#482819','H':'#684025','l':'#865231','s':'#ce9556','S':'#e7b674','b':'#235274','B':'#32759c','c':'#71a5b0','t':'#493e2b','w':'#b6c6c5','W':'#e5e8d4'};
export const SPRITE=[
'................','......oooo......','.....ohhhho.....','....ohHHHhho....','....ohHlHHho....','....ohHHHhho....','...oohhhhhoo....','...obsssssbo....','..osBbssbBowo...','..osBBbbBBowWo..','...obBccBbowWo..','....obbBbooWo...','....otttoo......','....oo.oo.......','................','................'];
export function drawHero(ctx,x,y,dir='down',frame=0){const up=dir==='up';ctx.save();ctx.translate(Math.round(x)-8,Math.round(y)-8);if(dir==='left'){ctx.translate(16,0);ctx.scale(-1,1)}for(let row=0;row<16;row++)for(let col=0;col<16;col++){let c=SPRITE[row][col];if(up&&row>=7&&row<=9&&c==='s')c='h';if(up&&row===7)c=SPRITE[6][col];if(dir==='left'||dir==='right'){if(col<5&&row<8)c='.'}if(c==='.')continue;let dy=0;if(row>=12&&frame)dy=(col<7?1:-1)*(frame===1?1:-1);ctx.fillStyle=PALETTE[c];ctx.fillRect(col,row+dy,1,1)}ctx.restore()}
// Null dimensions mean an open world. Substeps prevent dashing through colliders.
export function moveActor(actor,dx,dy,dt,obstacles,width=null,height=null,speed=64){
  const len=Math.hypot(dx,dy);if(!len)return false;
  const startX=actor.x,startY=actor.y,distance=speed*dt;
  const steps=Math.max(1,Math.ceil(distance/3)),sx=dx/len*distance/steps,sy=dy/len*distance/steps;
  const legal=(x,y)=>(width===null||(x>12&&x<width-12))&&(height===null||(y>16&&y<height-12))&&!obstacles.some(o=>collides(x,y,o));
  for(let i=0;i<steps;i++){if(legal(actor.x+sx,actor.y))actor.x+=sx;if(legal(actor.x,actor.y+sy))actor.y+=sy;}
  return actor.x!==startX||actor.y!==startY;
}
