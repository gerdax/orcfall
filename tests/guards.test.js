import test from 'node:test';
import assert from 'node:assert/strict';
import {Population,drawPerson} from '../src/population.js';
import {World} from '../src/world.js';
import {collides} from '../src/geometry.js';
test('villages retain exactly five of each guard type through streaming',()=>{
 for(const seed of [1,42,8431]){
 const w=new World(seed),p=new Population(),chunks=w.region(-100,-100,100,100);
 for(let i=0;i<3;i++)p.sync(w,chunks);
 for(const type of ['knight','archer','spearman']){
  const guards=[...p.actors.values()].filter(a=>a.type===type);assert.equal(guards.length,5);
  for(const a of guards){assert.ok(!a.patrolObstacles.some(o=>collides(a.x,a.y,o)));p.strike(a,0,[],0);assert.equal(a.hp,6);
   let area=0;drawPerson({set fillStyle(v){},fillRect(...v){assert.ok(v.every(Number.isInteger));area+=v[2]*v[3]}},a,1);assert.ok(area>50);
  }
 }
 p.sync(w,[]);p.sync(w,chunks);assert.equal([...p.actors.values()].filter(a=>['knight','archer','spearman'].includes(a.type)).length,15);
 }
});
