import test from 'node:test';
import assert from 'node:assert/strict';
import {SPRITE,PALETTE,moveActor} from '../src/hero.js';
test('sprite is exactly 16×16 and uses a defined palette',()=>{assert.equal(SPRITE.length,16);for(const row of SPRITE){assert.equal(row.length,16);for(const c of row)assert.ok(c in PALETTE)}});
test('diagonal movement is normalized',()=>{const a={x:100,y:100};moveActor(a,1,1,1,[],480,320);assert.ok(Math.abs(Math.hypot(a.x-100,a.y-100)-64)<.001)});
test('obstacles block the hero while allowing sliding',()=>{const a={x:100,y:100};moveActor(a,1,1,.1,[{x:110,y:100,r:5}],480,320);assert.equal(a.x,100);assert.ok(a.y>100)});
test('world boundaries block movement',()=>{const a={x:13,y:100};moveActor(a,-1,0,.1,[],480,320);assert.equal(a.x,13)});
