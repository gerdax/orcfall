import test from 'node:test';
import assert from 'node:assert/strict';
import {healAtWell} from '../src/healing.js';
import {Population} from '../src/population.js';
test('well heals gradually, caps health and resets progress outside reach',()=>{
 const hero={x:20,y:0,hp:4},well={type:'well',x:0,y:0,w:12,h:12};
 assert.equal(healAtWell(hero,[well],.5),0);assert.equal(healAtWell(hero,[well],.5),1);
 hero.x=50;healAtWell(hero,[well],1);assert.equal(hero.hp,5);
 hero.x=20;assert.equal(healAtWell(hero,[well],.5),0);healAtWell(hero,[well],4);assert.equal(hero.hp,6);
 hero.hp=0;healAtWell(hero,[well],5);assert.equal(hero.hp,0);
 hero.hp=3;healAtWell(hero,[well,{x:10,y:0,w:2,h:40}],5);assert.equal(hero.hp,3);
});
test('dead orcs remain for ten seconds without attacking, then disappear',()=>{
 const p=new Population(),hero={x:0,y:0};p.actors.set('orc',{id:'orc',type:'orc',x:15,y:0,hp:1});
 p.strike(hero,0,[],2);assert.equal(p.corpses.length,1);assert.equal(p.actors.size,0);
 p.update(1,hero,[],11,()=>assert.fail('corpse cannot attack'));assert.equal(p.corpses.length,1);
 p.sync({},[]);assert.equal(p.corpses.length,1);
 p.update(1,hero,[],12,()=>{});assert.equal(p.corpses.length,0);assert.ok(p.defeated.has('orc'));
});
