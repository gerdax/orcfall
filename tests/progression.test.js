import test from 'node:test';
import assert from 'node:assert/strict';
import {awardXP} from '../src/progression.js';
import {Population} from '../src/population.js';
import {healAtWell} from '../src/healing.js';
test('levels carry excess XP, restore health and increase damage every three levels',()=>{
 const h={hp:2};assert.equal(awardXP(h,39),0);assert.equal(awardXP(h,2),1);assert.equal(h.xp,1);assert.equal(h.hp,7);
 awardXP(h,154);assert.equal(h.level,4);assert.equal(h.damage,2);assert.equal(h.maxHp,9);
 h.hp=8;healAtWell({...h,x:20,y:0},[],1);const hero={...h,x:20,y:0};healAtWell(hero,[{type:'well',x:0,y:0,w:12,h:12}],1);assert.equal(hero.hp,9);
});
test('only player kills award XP, once, and sword uses upgraded damage',()=>{
 const p=new Population(),a={id:'g',type:'goblin',x:10,y:0,hp:2};p.actors.set(a.id,a);
 assert.equal(p.strike({x:0,y:0,damage:2},0,[],0).xp,10);assert.equal(p.strike({x:0,y:0},0,[],1).xp,0);
});
