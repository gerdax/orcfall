import test from 'node:test';
import assert from 'node:assert/strict';
import {Population} from '../src/population.js';
const tower={type:'watchtower',x:0,y:0};
const actor=(id,type,x)=>({id,type,x,y:0,hp:3,homeX:x,homeY:0,cooldown:0,windup:0,timer:999,targetX:x,targetY:0});
test('towers shoot only nearby orcs, wait between shots and leave corpses',()=>{
 const p=new Population();for(const a of [actor('orc','orc',70),actor('far','orc',220),actor('friend','human',10)])p.actors.set(a.id,a);
 const tick=(dt,time)=>p.update(dt,{x:999,y:999},[tower],time,()=>{});
 tick(.01,0);assert.equal(p.towers.arrows.length,1);assert.equal(p.actors.get('orc').hp,3);
 tick(.5,.5);assert.equal(p.actors.get('orc').hp,2);assert.equal(p.towers.arrows.length,0);
 tick(.01,1.3);tick(.5,1.8);tick(.01,2.6);tick(.5,3.1);
 assert.ok(p.defeated.has('orc'));assert.equal(p.corpses.length,1);assert.equal(p.actors.get('friend').hp,3);assert.equal(p.actors.get('far').hp,3);
});
test('arrows can miss a moving target and render on integer pixels',()=>{
 const p=new Population(),a=actor('orc','orc',80);p.actors.set(a.id,a);
 p.towers.update(.01,[tower],p.actors,0,()=>assert.fail());let count=0;
 p.towers.draw({set fillStyle(v){},fillRect(...v){assert.ok(v.every(Number.isInteger));count++}});assert.ok(count>0);
 a.x=120;p.towers.update(1,[],p.actors,1,()=>assert.fail('moved target should evade arrow'));assert.equal(p.towers.arrows.length,0);
});
