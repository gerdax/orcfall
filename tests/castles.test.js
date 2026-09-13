import test from 'node:test';
import assert from 'node:assert/strict';
import {World,hash} from '../src/world.js';
import {makeCastle,CASTLE_CHANCE,castleGround,drawCastle} from '../src/castles.js';
import {moveActor} from '../src/hero.js';

test('castles are rare, reproducible and never replace the starting village',()=>{
 const w=new World(8431);assert.notEqual(w.getTown(0,0).kind,'castle');
 let count=0,site;
 for(let y=-30;y<=30;y++)for(let x=-30;x<=30;x++)if((x||y)&&hash(x,y,w.seed+419)<CASTLE_CHANCE){count++;site=[x,y]}
 assert.ok(count>90&&count<210);
 const c=w.getTown(...site);assert.equal(c.kind,'castle');assert.deepEqual(c,new World(w.seed).getTown(...site));
 w.towns.clear();w.chunks.clear();assert.deepEqual(w.getTown(...site),c);
 const chunks=w.region(c.x-160,c.y-150,c.x+160,c.y+150),objects=chunks.flatMap(c=>c.objects);
 assert.equal(objects.filter(o=>o.type.startsWith('castle-')).length,c.objects.filter(o=>o.type.startsWith('castle-')).length);
 assert.ok(!objects.some(o=>['tree','rock'].includes(o.type)&&Math.abs(o.x-c.x)<145&&Math.abs(o.y-c.y)<135));
});
test('castle bridges and all gates are open; moat and walls stop movement',()=>{
 const c=makeCastle(1,1,0,0,8431);
 for(const [x,y,dx,dy] of [[0,140,0,-1],[0,-140,0,1],[-150,0,1,0],[150,0,-1,0]]){
  const p={x,y};moveActor(p,dx,dy,2.3,c.objects,null,null,62);
  assert.ok(Math.abs(p.x)<16&&Math.abs(p.y)<16);
 }
 const water={x:45,y:140};moveActor(water,0,-1,1,c.objects,null,null);assert.ok(water.y>110);
 const wall={x:140,y:40};moveActor(wall,-1,0,1,c.objects.filter(o=>o.type!=='castle-water'),null,null);assert.ok(wall.x>=95);
 assert.equal(castleGround(c,0,99),'bridge');assert.equal(castleGround(c,50,99),'water');assert.equal(castleGround(c,0,30),'courtyard');
});
test('castle artwork stays on the common integer pixel grid',()=>{
 let n=0;const ctx={fillStyle:'',fillRect(...args){assert.ok(args.every(Number.isInteger));n++}};
 for(const o of makeCastle(1,1,0,0,42).objects)if(o.type.startsWith('castle-'))drawCastle(ctx,o);
 assert.ok(n>500);
});
