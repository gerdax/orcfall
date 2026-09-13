import {collides} from './geometry.js';
// Five stable identities per village, independent of chunk load order.
export function villageKnights(town,type='knight',occupied=[]){
 if(town.kind==='castle')return [];
 const result=[],posts=[[0,-65],[65,0],[0,65],[-65,0],[0,20]];
 for(let i=0;i<posts.length;i++){
  const [baseX,baseY]=posts[i],px=baseX+(type==='archer'?18:type==='spearman'?-18:0),py=baseY+(type==='archer'?-18:type==='spearman'?18:0);let position;
  for(let radius=0;radius<=120&&!position;radius+=8)for(let dy=-radius;dy<=radius&&!position;dy+=8)for(let dx=-radius;dx<=radius;dx+=8){
   if(radius&&Math.max(Math.abs(dx),Math.abs(dy))!==radius)continue;
   const x=town.x+px+dx,y=town.y+py+dy;
   if(town.objects.some(o=>collides(x,y,o,9))||[...occupied,...result].some(a=>Math.hypot(a.x-x,a.y-y)<16))continue;
   position={x,y};break;
  }
  if(!position)throw new Error(`No knight post in village ${town.id}`);
  result.push({id:`${town.id}:${type}:${i}`,townId:town.id,type,...position,homeX:position.x,homeY:position.y,hp:6,dir:'down',moving:false,timer:0,cooldown:0,windup:0,flash:0,variant:i%3});
 }
 return result;
}
export function drawKnight(ctx,a,time){
 const rows=['......rr........','.....oAAAo......','....oAAAAAo.....','....oAaAAAo.....','....ooaaooo.....','.....oAAAo......','...ooAAAAAoo....','..oAAaAAaAAAo...','..oBBBAAAAoWo...','..oBcBAAAAoWo...','..oBBBAAAAoWo...','...ooottttoWo...','.....oAAoo......','.....oo.oo......','................','................'];
 const colors={o:'#20292c',A:'#a4b6b5',a:'#586b74',B:'#304f79',c:'#d4b974',r:'#994a3e',t:'#4d4136',W:'#dfe4d2'};
 const x=Math.round(a.x)-8,y=Math.round(a.y)-8;ctx.fillStyle='#293c2d';ctx.fillRect(x+2,y+13,13,3);
 for(let row=0;row<16;row++)for(let col=0;col<16;col++){
  let p=rows[row][col];if(a.type!=='knight'&&p==='W')continue;if(!colors[p])continue;if(a.dir==='up'&&row===4&&col>4&&col<10)p='A';
  ctx.fillStyle=a.type==='archer'&&['A','a','B','r'].includes(p)?({A:'#74804e',a:'#465237',B:'#6c5436',r:'#567044'})[p]:a.type==='spearman'&&p==='B'?'#784739':colors[p];const step=row>=12&&a.moving?(col<8?1:-1)*(Math.floor(time*7)%2?1:-1):0;
  ctx.fillRect(x+(a.dir==='left'?15-col:col),y+row+step,1,1);
 }
}

export function drawGuard(ctx,a,time){
 drawKnight(ctx,a,time);
 if(time<(a.attackFlash||0)){ctx.fillStyle='#e4d4a1';ctx.fillRect(Math.round(a.x)+7,Math.round(a.y)-5,3,2)}
 const x=Math.round(a.x)+(a.dir==='left'?-7:7),y=Math.round(a.y);
 const p=(dx,dy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
 if(a.type==='spearman'){p(0,-13,1,23,'#ac8850');p(-1,-16,3,4,'#d3ded9');p(0,-18,1,2,'#edf0de')}
 if(a.type==='archer'){p(0,-7,1,14,'#d4c69b');p(1,-7,2,2,'#9e7945');p(3,-5,1,10,'#b28d50');p(1,5,2,2,'#9e7945');p(-2,-1,6,1,'#c7af75')}
}
