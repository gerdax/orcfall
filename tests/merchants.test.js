import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';
import {makeMerchant,updateMerchant,drawMerchant} from '../src/merchants.js';
import {Population} from '../src/population.js';
test('horse carts follow safe routes, turn and pause at endpoints',()=>{
 for(let seed=1;seed<=8;seed++){
  const t=new World(seed).getTown(0,0),a=makeMerchant(t);assert.ok(a);
  let turned=false,paused=false;
  for(let i=0;i<1500;i++){updateMerchant(a,1/30);turned ||= a.direction===-1;paused ||= a.wait>0;assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y))}
  assert.ok(turned&&paused);let pixels=0;drawMerchant({set fillStyle(v){},fillRect(...v){assert.ok(v.every(Number.isInteger));pixels+=v[2]*v[3]}},a,1);assert.ok(pixels>100);
 }
});
test('merchant remains unique across chunk updates and is friendly',()=>{
 const w=new World(),p=new Population(),chunks=w.region(-100,-100,100,100);
 for(let i=0;i<3;i++)p.sync(w,chunks);
 const traders=[...p.actors.values()].filter(a=>a.type==='merchant');assert.equal(traders.length,1);
 const a=traders[0];p.strike(a,0,[],1);assert.ok(p.actors.has(a.id));p.sync(w,[]);assert.equal(p.actors.size,0);
});
