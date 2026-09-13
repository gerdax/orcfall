import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';
import {Population,drawPerson} from '../src/population.js';
import {fishingHuts,riverGround} from '../src/countryside.js';
import {collides} from '../src/geometry.js';
test('fishermen stand on dry clear banks, fish into water and do not duplicate',()=>{
 const w=new World(),hut=fishingHuts(w,-2000,-2000,2000,2000)[0],chunks=w.region(hut.x-80,hut.y-80,hut.x+80,hut.y+80),p=new Population();
 p.sync(w,chunks);const people=()=>[...p.actors.values()].filter(a=>a.type==='fisherman');assert.ok(people().length);
 const a=people()[0];assert.notEqual(riverGround(w,a.x,a.y),'water');assert.equal(riverGround(w,a.x-a.side*22,a.y),'water');assert.ok(!chunks.flatMap(c=>c.objects).some(o=>collides(a.x,a.y,o,6)));
 p.sync(w,chunks);assert.equal(people().length,1);p.strike(a,0,[],0);assert.equal(a.hp,3);
 for(const time of [0,9]){let count=0;drawPerson({set fillStyle(v){},fillRect(...v){assert.ok(v.every(Number.isInteger));count++}},a,time);assert.ok(count>30)}
 p.sync(w,[]);p.sync(w,chunks);assert.equal(people().length,1);
});
