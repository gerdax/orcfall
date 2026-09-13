import test from 'node:test';
import assert from 'node:assert/strict';
import {daylight,drawNight} from '../src/day-night.js';
test('night starts every three minutes with dusk and dawn within a minute',()=>{
 assert.equal(daylight(179).darkness,0);
 for(const start of [180,360,540]){
  assert.equal(daylight(start).label,'ZMIERZCH');assert.equal(daylight(start+5).darkness,.5);
  assert.equal(daylight(start+20).darkness,1);assert.equal(daylight(start+55).darkness,.5);
  assert.equal(daylight(start+60).darkness,0);
 }
 assert.equal(daylight(0).label,'DZIEŃ');
});
test('night tint preserves context and stays translucent',()=>{
 let saved=0,restored=0,draws=0;
 const ctx={save(){saved++},restore(){restored++},set globalAlpha(v){assert.ok(v>0&&v<.6)},set fillStyle(v){},fillRect(){draws++}};
 drawNight(ctx,480,320,0);assert.equal(draws,0);drawNight(ctx,480,320,200);assert.equal(draws,1);assert.equal(saved,restored);
});
