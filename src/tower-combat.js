// Arrows arc above fences; damage is applied only when the projectile arrives.
export class TowerCombat{
 constructor(){this.cooldowns=new Map();this.arrows=[]}
 update(dt,objects,actors,time,damage){
  this.arrows=this.arrows.filter(a=>{
   a.age+=dt;
   if(a.age<a.duration)return true;
   const target=actors.get(a.targetId);
   if(target&&['orc','goblin'].includes(target.type)&&Math.hypot(target.x-a.tx,target.y-a.ty)<18)damage(target,time);
   return false;
  });
  const towers=objects.filter(o=>o.type==='watchtower'),active=new Set();
  for(const tower of towers){
   const id=`${tower.x}:${tower.y}`;active.add(id);
   if(time<(this.cooldowns.get(id)??0))continue;
   let target=null,nearest=150;
   for(const a of actors.values())if(['orc','goblin'].includes(a.type)&&a.hp>0){const d=Math.hypot(tower.x-a.x,tower.y-a.y);if(d<nearest){nearest=d;target=a}}
   if(!target)continue;
   this.arrows.push({x:tower.x,y:tower.y-32,tx:target.x,ty:target.y,targetId:target.id,age:0,duration:Math.max(.2,nearest/190)});
   this.cooldowns.set(id,time+1.3);
  }
  for(const [id,until] of this.cooldowns)if(!active.has(id)&&time>=until)this.cooldowns.delete(id);
 }
 draw(ctx){
  for(const a of this.arrows){
   const t=Math.min(1,a.age/a.duration),x=a.x+(a.tx-a.x)*t,y=a.y+(a.ty-a.y)*t-Math.sin(t*Math.PI)*12;
   const angle=Math.atan2(a.ty-a.y,a.tx-a.x);
   for(let i=0;i<6;i++){ctx.fillStyle=i===0?'#e2e7d6':'#c2a16b';ctx.fillRect(Math.round(x-Math.cos(angle)*i),Math.round(y-Math.sin(angle)*i),1,1)}
  }
 }
}
