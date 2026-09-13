import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';
import {drawSettlement} from '../src/settlements.js';
import {buildingDoor,collides} from '../src/geometry.js';
import {moveActor} from '../src/hero.js';

test('towns contain houses, inn, stable, well and gated fences, without duplicated chunk objects',()=>{
 const w=new World(8431),t=w.getTown(0,0),chunks=w.region(-256,-256,256,256);
 for(const type of ['house','inn','stable','well','fence','horse'])assert.ok(t.objects.some(o=>o.type===type));
 const objects=chunks.flatMap(c=>c.objects).filter(o=>!['tree','rock'].includes(o.type));
 assert.equal(objects.length,t.objects.length);
 assert.equal(new Set(objects.map(o=>`${o.type}:${o.x}:${o.y}`)).size,objects.length);
 for(const o of chunks.flatMap(c=>c.objects).filter(o=>['tree','rock'].includes(o.type)))assert.ok(!t.objects.some(b=>Math.abs(b.x-o.x)<b.w/2+20&&Math.abs(b.y-o.y)<b.h/2+28));
});
test('distant settlements reproduce after cache eviction and stay separated',()=>{
 const w=new World(444),towns=w.townsIn(-4000,-4000,4000,4000);
 assert.ok(towns.length>10);
 for(const a of towns)for(const b of towns)if(a.id!==b.id)assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>800);
 const original=w.getTown(-2,1);for(let i=0;i<80;i++)w.getTown(i,7);
 assert.deepEqual(w.getTown(-2,1),original);assert.ok(w.towns.size<=64);
});
test('main streets and stable gate are walkable; house walls block movement',()=>{
 const w=new World(),t=w.getTown(0,0),obs=t.objects;
 const p={x:0,y:150};moveActor(p,0,-1,5,obs,null,null,62);assert.ok(p.y<-150);
 const q={x:-150,y:0};moveActor(q,1,0,5,obs,null,null,62);assert.ok(q.x>150);
 const stable=obs.find(o=>o.type==='stable');const gate={x:stable.x+stable.w/2+6,y:stable.y};moveActor(gate,1,0,.55,obs.filter(o=>o.type==='fence'),null,null,62);assert.ok(gate.x>stable.x+stable.w/2+35);
 const house=obs.find(o=>o.type==='house'),actor={x:house.x,y:house.y+60};moveActor(actor,0,-1,2,[house],null,null,62);assert.ok(actor.y>house.y);assert.equal(collides(actor.x,actor.y,house),false);
});
test('every settlement drawing operation uses integer native pixels',()=>{
 let count=0;const ctx={fillStyle:'',fillRect(...args){assert.ok(args.every(Number.isInteger));count++}};
 for(const o of new World().getTown(0,0).objects)drawSettlement(ctx,o);
 assert.ok(count>200);
});

test('many seeds give distinct layouts with reachable doors and no overlapping buildings',()=>{
 const layouts=new Set(),signatures=new Set();
 for(let seed=1;seed<=30;seed++){
  const w=new World(seed),t=w.getTown(0,0),buildings=t.objects.filter(o=>['house','inn','stable'].includes(o.type));
  assert.ok(buildings.length>=7&&buildings.length<=10);
  assert.ok(new Set(buildings.map(o=>o.angle)).size>=3);
  assert.ok(buildings.some(o=>o.angle%90!==0));
  layouts.add(t.layout);signatures.add(buildings.map(o=>`${o.x},${o.y},${o.w}`).join('|'));
  for(const a of buildings)for(const b of buildings)if(a!==b)
   assert.ok(Math.abs(a.x-b.x)>(a.w+b.w)/2+10||Math.abs(a.y-b.y)>(a.h+b.h)/2+10,`overlap seed ${seed}`);
  const legal=(x,y)=>!t.objects.some(o=>collides(x,y,o));
  const queue=[[0,0]],seen=new Set(['0,0']);
  for(let i=0;i<queue.length;i++){
   const [x,y]=queue[i];for(const [dx,dy] of [[4,0],[-4,0],[0,4],[0,-4]]){
    const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;
    if(Math.abs(nx)>260||Math.abs(ny)>260||seen.has(key)||!legal(nx,ny))continue;
    seen.add(key);queue.push([nx,ny]);
   }
  }
  for(const b of buildings){const door=buildingDoor(b);assert.ok(queue.some(([x,y])=>Math.hypot(x-door.x,y-door.y)<5),`unreachable ${b.type} seed ${seed}`)}
 }
 assert.equal(layouts.size,3);assert.ok(signatures.size>25);
});


test('rotated footprint leaves its empty bounding-box corners walkable',()=>{
 const o={x:0,y:0,w:58,h:58,sourceW:60,sourceH:20,angle:45};
 assert.equal(collides(0,0,o),true);
 assert.equal(collides(-24,24,o),false);
 const actor={x:-70,y:-70};moveActor(actor,1,1,2,[o],null,null,64);
 assert.equal(collides(actor.x,actor.y,o),false);assert.ok(actor.x<0);
});
