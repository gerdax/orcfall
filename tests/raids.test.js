import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';
import {Population} from '../src/population.js';
test('night creates thirteen raiders per village only once, and next night creates a new wave',()=>{
 const w=new World(),p=new Population(),chunks=w.region(-100,-100,100,100);
 const raiders=()=>[...p.actors.values()].filter(a=>a.raid);
 p.sync(w,chunks);assert.equal(raiders().length,0);
 p.night=1;p.sync(w,chunks);assert.equal(raiders().length,13);
 const a=raiders()[0],start=a.y;
 for(let i=0;i<90;i++)p.update(1/30,{x:999,y:999},[],i/30,()=>{});
 assert.ok(a.y>start,'raid advances toward village');
 p.sync(w,chunks);assert.equal(raiders().length,13);
 p.damageOrc(a,4);p.damageOrc(a,4);p.damageOrc(a,4);
 p.sync(w,[]);p.sync(w,chunks);assert.equal(raiders().length,12);
 p.night=2;p.sync(w,chunks);assert.equal(raiders().length,25);
});
