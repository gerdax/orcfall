import test from 'node:test';
import assert from 'node:assert/strict';
import {World,CHUNK_SIZE} from '../src/world.js';
import {moveActor} from '../src/hero.js';

test('same seed reproduces objects regardless of generation order and eviction',()=>{
 const a=new World(123,3),b=new World(123);
 const before=a.getChunk(-7,8);a.region(500,500,1100,1100);
 assert.ok(a.chunks.size<=3);
 assert.deepEqual(a.getChunk(-7,8),before);
 b.getChunk(99,-102);assert.deepEqual(b.getChunk(-7,8),before);
 assert.notDeepEqual(new World(124).getChunk(-7,8),before);
});
test('negative chunks own their objects and terrain is continuous across seams',()=>{
 const w=new World(8431);
 for(let cy=-4;cy<=4;cy++)for(let cx=-4;cx<=4;cx++){
  const c=w.getChunk(cx,cy);
  for(const o of c.objects){assert.equal(Math.floor(o.x/CHUNK_SIZE),cx);assert.equal(Math.floor(o.y/CHUNK_SIZE),cy);if(o.type==='tree'||o.type==='rock'){assert.ok(w.pathDistance(o.x,o.y)>29);assert.ok(Math.hypot(o.x,o.y)>73)}}
  const boundary=(cx+1)*CHUNK_SIZE;
  assert.ok(Math.abs(w.height(boundary-.001,cy*128)-w.height(boundary+.001,cy*128))<.001);
 }
});
test('world has forests, clearings, hills, trails and rocks',()=>{
 const w=new World(8431);let lo=1,hi=0,forest=0,meadow=0,paths=0,trees=0,rocks=0;
 for(let y=-1800;y<1800;y+=64)for(let x=-1800;x<1800;x+=64){const s=w.sample(x,y);lo=Math.min(lo,s.height);hi=Math.max(hi,s.height);forest+=s.forest>.6;meadow+=s.forest<.35;paths+=s.path<12}
 for(const c of w.region(-600,-600,600,600)){trees+=c.objects.filter(o=>o.type==='tree').length;rocks+=c.objects.filter(o=>o.type==='rock').length}
 assert.ok(hi-lo>.5);assert.ok(forest>100&&meadow>100&&paths>30&&trees>50&&rocks>10);
});
test('open movement crosses former boundaries and zero in every direction',()=>{
 const p={x:0,y:0};assert.ok(moveActor(p,-1,-1,12,[],null,null));assert.ok(p.x<-500&&p.y<-500);
 moveActor(p,1,1,30,[],null,null);assert.ok(p.x>800&&p.y>800);
});
test('large steps cannot tunnel through a rock',()=>{
 const p={x:0,y:0};moveActor(p,1,0,1,[{x:35,y:0,r:8}],null,null,175);assert.ok(p.x<=22);
});
