import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';
import {riverGround,riverCenter,fishingHuts,fieldAt} from '../src/countryside.js';
import {moveActor} from '../src/hero.js';
import {collides} from '../src/geometry.js';
test('river water blocks movement and road bridges cross it for several seeds',()=>{
 for(const seed of [1,42,8431]){
  const w=new World(seed);let x=640,y=0;
  for(let i=0;i<20;i++){x=riverCenter(w,x,y);y=-w.warp(x)}
  assert.equal(riverGround(w,x,y),'bridge');
  const objects=w.region(x-100,y-80,x+100,y+80).flatMap(c=>c.objects);
  const hero={x:x-70,y:-w.warp(x-70)};
  for(let i=0;i<240;i++){const dy=-w.warp(hero.x+3)-hero.y;moveActor(hero,1,Math.max(-1,Math.min(1,dy)),1/60,objects)}
  assert.ok(hero.x>x+65,`bridge blocked for ${seed}`);
  const wetY=y+90,wetX=riverCenter(w,x,wetY),wet=w.region(wetX-64,wetY-64,wetX+64,wetY+64).flatMap(c=>c.objects);
  assert.equal(riverGround(w,wetX,wetY),'water');assert.ok(wet.some(o=>collides(wetX,wetY,o)));
 }
});
test('fields and fishing huts are reproducible, dry and leave roads open',()=>{
 const w=new World(),huts=fishingHuts(w,-2000,-2000,2000,2000);assert.ok(huts.length>0);
 assert.deepEqual(huts,fishingHuts(new World(),-2000,-2000,2000,2000));
 for(const h of huts){assert.ok(w.pathDistance(h.x,h.y)>=55);assert.equal(riverGround(w,h.x,h.y),null)}
 let fields=0;for(let y=-240;y<240;y+=8)for(let x=-240;x<240;x+=8)if(fieldAt(w,x,y))fields++;
 assert.ok(fields>100);
});
