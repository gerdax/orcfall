import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';
import {drawSettlement} from '../src/settlements.js?v=0.10.3';
test('each village has a visible chief tower without overlapping other buildings',()=>{
 for(let seed=1;seed<=20;seed++){
  const w=new World(seed),t=w.getTown(0,0),towers=t.objects.filter(o=>o.type==='chief-tower');assert.equal(towers.length,1);
  const a=towers[0];assert.ok(!t.objects.some(o=>o!==a&&!o.decorative&&Math.abs(a.x-o.x)<(a.w+(o.w??16))/2&&Math.abs(a.y-o.y)<(a.h+(o.h??16))/2));
  assert.ok(w.pathDistance(a.x,a.y)>20);
  let area=0;drawSettlement({set fillStyle(v){},fillRect(...v){assert.ok(v.every(Number.isInteger));area+=v[2]*v[3]}},a);assert.ok(area>1000);
 }
});
