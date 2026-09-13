import {drawSettlement} from '../src/settlements.js?v=0.8.1';
import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';
import {collides} from '../src/geometry.js';
import {moveActor} from '../src/hero.js';
import {drawPalisade} from '../src/palisades.js';
test('only large villages are fortified; four roads cross gates and logs block movement',()=>{
 let count=0;
 for(let seed=1;seed<=10;seed++){
  const w=new World(seed),t=w.getTown(0,0),walls=t.objects.filter(o=>o.type.startsWith('palisade'));
  assert.equal(!!walls.length,t.objects.filter(o=>o.type==='house').length>=7);
  if(!walls.length)continue;count++;
  for(const horizontal of [true,false])for(const sign of [-1,1]){
   const edge=t.kind==='city'?368:248,fixed=sign*edge;let best=Infinity,center=0;
   for(let n=-180;n<=180;n++){const d=w.pathDistance(t.x+(horizontal?n:fixed),t.y+(horizontal?fixed:n));if(d<best){best=d;center=n}}
   const a={x:t.x+(horizontal?center:sign*(edge-28)),y:t.y+(horizontal?sign*(edge-28):center)};
   moveActor(a,horizontal?0:sign,horizontal?sign:0,1,walls,null,null,56);
   assert.ok(Math.abs((horizontal?a.y-t.y:a.x-t.x))>edge+22,'gate must be passable');
  }
  assert.ok(walls.some(o=>collides(o.x,o.y,o)));
  const streamed=w.region(t.x-280,t.y-280,t.x+280,t.y+280).flatMap(c=>c.objects).filter(o=>o.type.startsWith('palisade'));
  assert.equal(streamed.length,walls.length);
  for(const o of walls){assert.ok(o.w<=24&&o.h<=24);drawPalisade({set fillStyle(v){},fillRect(...args){assert.ok(args.every(Number.isInteger))}},o)}
 }
 assert.ok(count>0);
});

test('settlement renderer emits visible pixels for every palisade collider',()=>{
 const w=new World();let town;
 for(let i=0;i<20;i++){town=w.getTown(i,0);if(town?.fortified)break}
 assert.ok(town.fortified);
 for(const o of town.objects.filter(o=>o.type.startsWith('palisade'))){
  let pixels=0;const ctx={fillStyle:'',fillRect(x,y,width,height){assert.ok(Number.isFinite(x)&&Number.isFinite(y));pixels+=width*height}};
  drawSettlement(ctx,o);assert.ok(pixels>0,`${o.type} must be drawn by the game renderer`);
 }
});
