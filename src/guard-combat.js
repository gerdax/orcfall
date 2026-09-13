import {moveActor} from './hero.js';
import {clearLine} from './population.js';
export const isGuard=a=>['knight','spearman','archer'].includes(a.type);
export class GuardCombat{
 constructor(){this.arrows=[]}
 updateProjectiles(dt,actors,objects,time,damage){
  this.arrows=this.arrows.filter(p=>{
   p.age+=dt;if(p.age<p.duration)return true;
   const target=actors.get(p.targetId);
   if(target&&['orc','goblin'].includes(target.type)&&Math.hypot(target.x-p.tx,target.y-p.ty)<14&&clearLine(p,target,objects))damage(target,time);
   return false;
  });
 }
 update(a,dt,actors,objects,time,damage){
  const obstacles=a.patrolObstacles?[...a.patrolObstacles,...objects]:objects;
  let enemy=null,nearest=150;
  for(const o of actors.values())if(['orc','goblin'].includes(o.type)&&Math.hypot(o.x-a.homeX,o.y-a.homeY)<200){
   const d=Math.hypot(o.x-a.x,o.y-a.y);if(d<nearest&&clearLine(a,o,obstacles)){enemy=o;nearest=d}
  }
  a.combatCooldown=Math.max(0,(a.combatCooldown||0)-dt);
  if(!enemy){
   a.strikeTime=0;
   if(!a.returning)return false;
   const dx=a.homeX-a.x,dy=a.homeY-a.y;
   if(Math.hypot(dx,dy)<5){a.returning=false;a.timer=0;return false}
   a.moving=moveActor(a,dx,dy,dt,obstacles,null,null,24);return true;
  }
  a.returning=true;a.moving=false;
  const dx=enemy.x-a.x,dy=enemy.y-a.y;
  a.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';
  const range=a.type==='archer'?105:a.type==='spearman'?29:21;
  if(nearest>range){a.strikeTime=0;a.moving=moveActor(a,dx,dy,dt,obstacles,null,null,32);return true}
  if(a.combatCooldown>0)return true;
  if(a.type==='archer'){
   this.arrows.push({x:a.x,y:a.y,tx:enemy.x,ty:enemy.y,targetId:enemy.id,age:0,duration:Math.max(.15,nearest/180)});
   a.combatCooldown=1.25;a.attackFlash=time+.2;
  }else{
   a.strikeTime=(a.strikeTime||0)+dt;
   if(a.strikeTime>=.25){damage(enemy,time);a.strikeTime=0;a.combatCooldown=.85;a.attackFlash=time+.2}
  }
  return true;
 }
 draw(ctx){for(const p of this.arrows){const t=Math.min(1,p.age/p.duration),x=p.x+(p.tx-p.x)*t,y=p.y+(p.ty-p.y)*t,angle=Math.atan2(p.ty-p.y,p.tx-p.x);
  for(let i=0;i<6;i++){ctx.fillStyle=i?'#bba16b':'#e4e8d9';ctx.fillRect(Math.round(x-Math.cos(angle)*i),Math.round(y-Math.sin(angle)*i),1,1)}
 }}
}
