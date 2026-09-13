import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';
import {Population,drawPerson} from '../src/population.js';
import {villageKnights} from '../src/knights.js';
import {collides} from '../src/geometry.js';
test('every village has five distinct safe knight posts',()=>{
 for(let seed=1;seed<=12;seed++){
 const t=new World(seed).getTown(0,0),a=villageKnights(t);
 assert.equal(a.length,5);assert.equal(new Set(a.map(k=>k.id)).size,5);
 assert.deepEqual(a,villageKnights(t));
 for(const k of a)assert.ok(!t.objects.some(o=>collides(k.x,k.y,o,9)));
 }
 assert.deepEqual(villageKnights({kind:'castle'}),[]);
});
test('streaming does not duplicate guards, friends survive swords, patrols avoid obstacles',()=>{
 const world=new World(),p=new Population(),chunks=world.region(-100,-100,100,100);
 p.sync(world,chunks);const guards=()=>[...p.actors.values()].filter(a=>a.type==='knight');assert.equal(guards().length,5);
 const initial=guards().map(a=>a.id);for(let i=0;i<5;i++)p.sync(world,chunks.slice().reverse());assert.equal(guards().length,5);
 const k=guards()[0];p.strike({x:k.x,y:k.y},0,[],1);assert.equal(k.hp,6);
 for(let i=0;i<120;i++)p.update(1/30,{x:0,y:0},chunks.flatMap(c=>c.objects),i/30,()=>{});
 for(const a of guards())assert.ok(!a.patrolObstacles.some(o=>collides(a.x,a.y,o)));
 p.sync(world,[]);assert.equal(guards().length,0);p.sync(world,chunks);assert.deepEqual(guards().map(a=>a.id),initial);
 let pixels=0;drawPerson({set fillStyle(v){},fillRect(...a){assert.ok(a.every(Number.isInteger));pixels++}},guards()[0],1);assert.ok(pixels>50);
});
