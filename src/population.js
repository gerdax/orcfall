import {makeMerchant,updateMerchant,drawMerchant} from './merchants.js?v=0.9.2';
import {villageKnights,drawKnight} from './knights.js';
import {hash} from './world.js?v=0.9.3';
import {collides} from './geometry.js';
import {moveActor} from './hero.js';
export function clearLine(a,b,objects){const n=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/3);for(let i=1;i<=n;i++)if(objects.some(o=>collides(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,o,1)))return false;return true}
export class Population{
 constructor(){this.traders=new Map();this.corpses=[];this.actors=new Map();this.defeated=new Set();this.loaded=new Set()}
 sync(world,chunks){
  const present=new Set(chunks.map(c=>`${c.cx}:${c.cy}`));
  for(const [id,a] of this.actors)if(!['knight','merchant'].includes(a.type)&&!present.has(a.chunk)){this.actors.delete(id)}
  for(const key of this.loaded)if(!present.has(key))this.loaded.delete(key);
  const obstacles=chunks.flatMap(c=>c.objects);
  const towns=new Map();
  for(const c of chunks)for(const t of world.townsIn(c.x,c.y,c.x+128,c.y+128))if(t.kind!=='castle')towns.set(t.id,t);
  for(const [id,a] of this.actors)if(a.type==='knight'&&!towns.has(a.townId))this.actors.delete(id);
  for(const town of towns.values())if(!this.actors.has(`${town.id}:merchant`)){let a=this.traders.get(town.id);if(!a){a=makeMerchant(town,world);if(a)this.traders.set(town.id,a)}if(a)this.actors.set(a.id,a)}
  for(const [id,a] of this.actors)if(a.type==='merchant'&&!towns.has(a.townId)&&!present.has(`${Math.floor(a.x/128)}:${Math.floor(a.y/128)}`))this.actors.delete(id);
  for(const a of this.traders.values())if(present.has(`${Math.floor(a.x/128)}:${Math.floor(a.y/128)}`))this.actors.set(a.id,a);
  for(const town of towns.values())if(!this.actors.has(`${town.id}:knight:0`))for(const a of villageKnights(town))this.actors.set(a.id,{...a,patrolObstacles:town.objects});

  for(const c of chunks){const key=`${c.cx}:${c.cy}`;if(this.loaded.has(key))continue;this.loaded.add(key);
   const town=world.townAt(c.x+64,c.y+64),human=!!town;
   if(hash(c.cx,c.cy,world.seed+901)>(human?.85:.24))continue;
   for(let i=0;i<16;i++){
    const x=c.x+16+hash(c.cx*31+i,c.cy,world.seed+902)*96,y=c.y+16+hash(c.cx,c.cy*31+i,world.seed+903)*96;
    if(human?(!world.townAt(x,y)||world.pathDistance(x,y)>18):(world.townAt(x,y)||Math.hypot(x,y)<290))continue;
    if(obstacles.some(o=>collides(x,y,o,9)))continue;
    const id=`${key}:npc`;if(this.defeated.has(id))break;
    this.actors.set(id,{id,chunk:key,type:human?'human':'orc',x,y,homeX:x,homeY:y,hp:3,dir:'down',moving:false,timer:0,cooldown:0,windup:0,flash:0,variant:Math.floor(hash(c.cx,c.cy,world.seed+904)*3)});break;
   }
  }
 }
 update(dt,hero,objects,time,hurt){
  this.corpses=this.corpses.filter(c=>time<c.expiresAt);
  for(const a of this.actors.values()){
   if(a.type==='merchant'){updateMerchant(a,dt);continue}
   a.cooldown=Math.max(0,a.cooldown-dt);a.timer-=dt;
   const d=Math.hypot(hero.x-a.x,hero.y-a.y),hostile=a.type==='orc'&&d<110&&Math.hypot(hero.x-a.homeX,hero.y-a.homeY)<175&&clearLine(a,hero,objects);
   a.moving=false;
   if(a.windup>0){a.windup-=dt;if(a.windup<=0){if(d<23&&clearLine(a,hero,objects))hurt();a.cooldown=1.2}continue}
   if(hostile&&d<20){if(a.cooldown<=0)a.windup=.45;continue}
   if(a.timer<=0){const phase=hash(Math.floor(time/3),a.homeX|0,a.homeY|0)*Math.PI*2;a.targetX=a.homeX+Math.cos(phase)*(a.type==='human'?26:38);a.targetY=a.homeY+Math.sin(phase)*(a.type==='human'?26:38);a.timer=3}
   const dx=(hostile?hero.x:a.targetX??a.x)-a.x,dy=(hostile?hero.y:a.targetY??a.y)-a.y;
   if(Math.hypot(dx,dy)>3){a.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';a.moving=moveActor(a,dx,dy,dt,a.patrolObstacles??objects,null,null,hostile?36:a.type==='human'?13:17)}
  }
 }
 strike(hero,angle,objects,time){let hits=0,kills=0;for(const [id,a] of this.actors){if(a.type!=='orc')continue;const d=Math.hypot(a.x-hero.x,a.y-hero.y),dir=Math.atan2(a.y-hero.y,a.x-hero.x)-angle;if(d<30&&(d<12||Math.cos(dir)>Math.cos(1.25))&&clearLine(hero,a,objects)){a.hp--;a.flash=time+.18;a.windup=0;a.cooldown=.5;hits++;if(a.hp<=0){this.corpses.push({...a,expiresAt:time+10});this.actors.delete(id);this.defeated.add(id);kills++}}}return {hits,kills}}
}
const HUMAN=['................','......oooo......','.....ohhhho.....','.....ohHHho.....','.....osssso.....','.....osSsso.....','......osso......','....ooccccoo....','...osccccccso...','...osccccccso...','....occcccco....','.....obbbbo.....','.....oboboo.....','.....oo.oo......','................','................'];
const ORC=['................','.....oooooo.....','....ogGGGggo....','...ogGGGGGGgo...','...ogYgGGYggo...','....oggggggo....','....oWgggWo.....','...ootttttoo....','..ogotTTttogo...','..ogotttttogo...','...ootttttoo....','....obbbbbo.....','....obboobbo....','....ooo.ooo.....','................','................'];
export function drawPerson(ctx,a,time){if(a.type==='merchant'){drawMerchant(ctx,a,time);return}if(a.type==='knight'){drawKnight(ctx,a,time);return}const orc=a.type==='orc',rows=orc?ORC:HUMAN,palette={o:'#17201b',h:'#593824',H:'#8f663c',s:'#c99568',S:'#e8b982',c:['#92764d','#806280','#668984'][a.variant],b:'#3a3024',g:'#486338',G:'#79914b',Y:'#e3c77b',W:'#ded3a4',t:'#483d2c',T:'#776044'};const x=Math.round(a.x)-8,y=Math.round(a.y)-8;ctx.fillStyle='#293c2d';ctx.fillRect(x+2,y+13,13,3);for(let r=0;r<16;r++)for(let c=0;c<16;c++){let p=rows[r][c];if(!palette[p])continue;if(a.dir==='up'&&r>3&&r<7)p=orc?'g':'h';ctx.fillStyle=time<a.flash?'#eee1bd':palette[p];const step=r>11&&a.moving?(Math.floor(time*7)%2?1:-1)*(c<8?1:-1):0;ctx.fillRect(x+c,y+r+step,1,1)}if(orc){ctx.fillStyle='#6e5840';ctx.fillRect(x+15,y+6,1,7);ctx.fillStyle='#a7ada0';ctx.fillRect(x+14,y+5,4,4);ctx.fillStyle='#182019';ctx.fillRect(x+2,y-5,13,3);ctx.fillStyle=a.windup>0?'#efb853':'#b44535';ctx.fillRect(x+3,y-4,Math.ceil(11*a.hp/3),1);if(a.windup>0){ctx.fillStyle='#efb853';ctx.fillRect(x+7,y-12,2,4);ctx.fillRect(x+7,y-7,2,1)}}}

// A flattened, sideways sprite, with a dropped axe, on the same pixel grid.
export function drawCorpse(ctx,a,time){
 const x=Math.round(a.x)-8,y=Math.round(a.y)-5;
 const rows=['...oooo.........','..ogGGgooooo....','..ogGggottttoo..','..oggggotTttbbo.','...oWoottttbbbo.','....ooooottooo..','.........oo.....'];
 const colors={o:'#20251d',g:'#496039',G:'#6e8145',W:'#b9b596',t:'#4b4030',T:'#68553a',b:'#342f25'};
 ctx.save();ctx.globalAlpha=Math.min(1,Math.max(0,(a.expiresAt-time)/2));
 ctx.fillStyle='#2c3727';ctx.fillRect(x+1,y+5,17,3);
 for(let r=0;r<rows.length;r++)for(let c=0;c<rows[r].length;c++)if(colors[rows[r][c]]){ctx.fillStyle=colors[rows[r][c]];ctx.fillRect(x+c,y+r,1,1)}
 ctx.fillStyle='#756044';ctx.fillRect(x+12,y+9,7,1);ctx.fillStyle='#949b8d';ctx.fillRect(x+17,y+8,3,3);ctx.restore();
}
