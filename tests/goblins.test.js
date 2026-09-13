import test from 'node:test';
import assert from 'node:assert/strict';
import {Population,drawPerson} from '../src/population.js';
import {World} from '../src/world.js';
test('goblins spawn in wilderness and can be defeated with sword and tower arrows',()=>{
 const w=new World(),p=new Population();p.sync(w,w.region(-700,-700,700,700));
 const goblin=[...p.actors.values()].find(a=>a.type==='goblin');assert.ok(goblin);assert.equal(goblin.hp,2);assert.equal(w.townAt(goblin.x,goblin.y),null);
 p.strike(goblin,0,[],0);assert.equal(goblin.hp,1);
 p.towers.update(.01,[{type:'watchtower',x:goblin.x-20,y:goblin.y}],p.actors,1,(a,t)=>p.damageOrc(a,t));
 p.towers.update(1,[],p.actors,2,(a,t)=>p.damageOrc(a,t));assert.ok(p.defeated.has(goblin.id));
 let pixels=0;drawPerson({set fillStyle(v){},fillRect(...v){assert.ok(v.every(Number.isInteger));pixels++}},goblin,3);assert.ok(pixels>30);
});
