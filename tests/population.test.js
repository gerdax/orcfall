import test from 'node:test';
import assert from 'node:assert/strict';
import {Population,clearLine,drawPerson} from '../src/population.js';
import {World} from '../src/world.js';
const orc=()=>({id:'enemy',type:'orc',x:15,y:0,homeX:15,homeY:0,hp:3,timer:1,cooldown:0,windup:0,variant:0});
test('sword respects walls, spares humans and remembers defeated enemies',()=>{
 const p=new Population(),a=orc();p.actors.set(a.id,a);p.actors.set('friend',{...a,id:'friend',type:'human'});
 const hero={x:0,y:0};assert.equal(p.strike(hero,0,[{x:8,y:0,w:2,h:30}],0).hits,0);
 for(let i=0;i<3;i++)p.strike(hero,0,[],i);
 assert.equal(p.actors.has('enemy'),false);assert.equal(p.actors.get('friend').hp,3);assert.ok(p.defeated.has('enemy'));
 assert.equal(clearLine(hero,a,[{x:8,y:0,w:2,h:30}]),false);
});
test('orc attack has a windup and cooldown; leaving reach avoids damage',()=>{
 const p=new Population(),a=orc(),hero={x:0,y:0};p.actors.set(a.id,a);let damage=0;
 const tick=dt=>p.update(dt,hero,[],1,()=>damage++);
 tick(.01);assert.ok(a.windup>0);assert.equal(damage,0);tick(.5);assert.equal(damage,1);tick(.1);assert.equal(damage,1);
 a.cooldown=0;tick(.01);hero.x=-100;tick(.5);assert.equal(damage,1);
});
test('population reproduces and killed spawn stays gone after streaming',()=>{
 const w=new World(),chunks=w.region(-512,-512,512,512),p=new Population(),q=new Population();p.sync(w,chunks);q.sync(w,chunks);
 assert.deepEqual([...p.actors],[...q.actors]);assert.ok([...p.actors.values()].some(a=>a.type==='human'));assert.ok([...p.actors.values()].some(a=>a.type==='orc'));
 const a=[...p.actors.values()].find(a=>a.type==='orc');p.defeated.add(a.id);p.sync(w,[]);p.sync(w,chunks);assert.equal(p.actors.has(a.id),false);
});
test('people render on native integer pixels',()=>{
 const ctx={set fillStyle(v){},fillRect(...args){assert.ok(args.every(Number.isInteger))}};
 for(const type of ['human','orc'])drawPerson(ctx,{...orc(),type,x:1.4,y:2.6,moving:true},.3);
});
