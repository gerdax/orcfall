import {hash} from './world.js?v=0.9.3';
// Native pixel silhouettes, shaded in small clusters; cached per variant.
const cache=new Map();
export function drawScenery(ctx,o,hero){
 const variant=Math.floor((o.variant??.5)*8),key=`${o.type}:${variant}`;
 if(!cache.has(key)){
  const c=document.createElement('canvas');c.width=64;c.height=72;const g=c.getContext('2d');
  const p=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h)};
  if(o.type==='tree'){
   p(26,53,17,5,'#1b2418');p(29,39,7,16,'#332a1d');p(30,39,2,15,'#735033');p(34,43,2,11,'#4b3824');
   const pine=variant<4;
   for(let y=2;y<52;y++)for(let x=5;x<58;x++){
    let inside=false;
    if(pine){for(let tier=0;tier<4;tier++){const top=3+tier*9,dy=y-top;if(dy>=0&&dy<20&&Math.abs(x-32)<dy*.82+2)inside=true}}
    else{const dx=(x-31)/23,dy=(y-27)/23;inside=dx*dx+dy*dy<.9+hash(Math.floor(x/4),Math.floor(y/4),variant)*.24;}
    if(!inside)continue;
    const n=hash(Math.floor(x/2),Math.floor(y/2),variant+871),shade=(x-8)/50+(y/60)*.45+n*.7;
    const colors=pine?['#456b37','#38592f','#294929','#203c25','#152e20']:['#84913c','#6c7f32','#536b2c','#3d5528','#263e23'];
    const edge=pine?(Math.abs(x-32)>(y%9+12)*.75):((x-31)**2+(y-27)**2>440);
    p(x,y,1,1,colors[Math.min(4,Math.floor(shade*2.4)+(edge?1:0))]);
    if(n>.85&&x<31&&y<36)p(x,y,1,1,pine?'#547744':'#91a044');
   }
  }else{
   for(let y=35;y<57;y++)for(let x=18;x<47;x++){
    const dx=(x-32)/14,dy=(y-46)/10;if(dx*dx+dy*dy>1+hash(x>>2,y>>2,variant)*.15)continue;
    const v=(x-18)/28+(y-35)/22+hash(x>>1,y>>1,variant)*.32;
    const colors=['#9a9b86','#808775','#686f60','#535c4d','#3b4538'];p(x,y,1,1,colors[Math.min(4,Math.floor(v*2.4))]);
   }
   p(21,54,7,2,'#546132');p(34,56,8,2,'#3e522d');
  }
  cache.set(key,c);
 }
 ctx.globalAlpha=o.type==='tree'&&Math.hypot(o.x-hero.x,o.y-hero.y)<25?.68:1;
 ctx.drawImage(cache.get(key),Math.round(o.x)-32,Math.round(o.y)-51);ctx.globalAlpha=1;
}
