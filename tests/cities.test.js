import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';
test('rare cities are larger, fortified and reproducible; start stays a village',()=>{
 const w=new World();let cities=0,total=0;
 assert.notEqual(w.getTown(0,0).kind,'city');
 for(let x=-8;x<=8;x++)for(let y=-8;y<=8;y++){
  const t=w.getTown(x,y);if(!t)continue;total++;
  if(t.kind==='city'){cities++;assert.ok(t.objects.filter(o=>o.type==='house').length>=10);assert.ok(t.fortified);assert.ok(t.courtyards.some(c=>c.x===0&&c.y===0));assert.deepEqual(t,new World().getTown(x,y))}
 }
 assert.ok(cities>0&&cities/total<.15);
});
