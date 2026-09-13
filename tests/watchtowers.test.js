import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';
import {drawSettlement} from '../src/settlements.js?v=0.9.3';
test('every village has two visible, separately owned towers clear of buildings',()=>{
 for(let seed=1;seed<=16;seed++){
  const w=new World(seed),town=w.getTown(0,0),towers=town.objects.filter(o=>o.type==='watchtower');assert.equal(towers.length,2);
  for(const tower of towers){
   assert.ok(!town.objects.some(o=>o!==tower&&!o.decorative&&Math.abs(tower.x-o.x)<(o.w??16)/2+9&&Math.abs(tower.y-o.y)<(o.h??16)/2+9));
   assert.ok(w.pathDistance(tower.x,tower.y)>20);
   const chunk=w.getChunk(Math.floor(tower.x/128),Math.floor(tower.y/128));assert.equal(chunk.objects.filter(o=>o.type==='watchtower'&&o.x===tower.x&&o.y===tower.y).length,1);
   let pixels=0;drawSettlement({set fillStyle(v){},fillRect(...v){assert.ok(v.every(Number.isInteger));pixels+=v[2]*v[3]}},tower);assert.ok(pixels>300);
  }
 }
});
