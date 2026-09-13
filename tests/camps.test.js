import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';
import {campsIn,campResidents,drawCamp,drawChief} from '../src/camps.js';
import {Population} from '../src/population.js';
import {collides} from '../src/geometry.js';
test('camps contain both species and a chief on clear wilderness ground',()=>{
 const w=new World(),camps=campsIn(w,-2000,-2000,2000,2000);assert.ok(camps.length>0);
 assert.deepEqual(camps,campsIn(new World(),-2000,-2000,2000,2000));
 for(const c of camps.slice(0,5)){
  const chunks=w.region(c.x-100,c.y-100,c.x+100,c.y+100),objects=chunks.flatMap(c=>c.objects),residents=chunks.flatMap(c=>c.campActors);
  assert.equal(residents.length,6);assert.equal(residents.filter(a=>a.boss).length,1);assert.equal(residents.filter(a=>a.type==='goblin').length,3);
  for(const a of residents)assert.ok(!objects.some(o=>collides(a.x,a.y,o)));
  const p=new Population();p.sync(w,chunks);const boss=residents.find(a=>a.boss),live=p.actors.get(boss.id);for(let i=0;i<10;i++)p.damageOrc(live,0);
  p.sync(w,[]);p.sync(w,chunks);assert.ok(!p.actors.has(boss.id));
  let area=0;const ctx={set fillStyle(v){},fillRect(...v){assert.ok(v.every(Number.isInteger));area+=v[2]*v[3]}};
  drawChief(ctx,boss,1);for(const o of objects.filter(o=>o.type.startsWith('camp-')))drawCamp(ctx,o,1);assert.ok(area>500);
 }
});

test('camps vary from one to three tents without blocking residents',async()=>{
 const {campObjects}=await import('../src/camps.js');const counts=new Set();
 for(let seed=1;seed<=5;seed++){
  const camps=campsIn(new World(seed),-2000,-2000,2000,2000);
  for(const c of camps){const objects=campObjects(c),tents=objects.filter(o=>o.type==='camp-tent');counts.add(tents.length);
   assert.equal(tents.length,c.tentCount);
   for(const a of campResidents(c))assert.ok(!objects.some(o=>collides(a.x,a.y,o)));
  }
 }
 assert.deepEqual([...counts].sort(),[1,2,3]);
});
