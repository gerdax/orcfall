import test from 'node:test';
import assert from 'node:assert/strict';
import {GuardCombat} from '../src/guard-combat.js';
test('all guard classes engage orcs, respect walls and return after combat',()=>{
 for(const type of ['knight','spearman','archer']){
  const c=new GuardCombat(),a={type,x:0,y:0,homeX:0,homeY:0},orc={id:'orc',type:'orc',x:70,y:0,hp:3},actors=new Map([['orc',orc]]);
  const damage=o=>{if(--o.hp===0)actors.delete(o.id)};
  for(let i=0;i<400;i++){const t=i/30;c.updateProjectiles(1/30,actors,[],t,damage);c.update(a,1/30,actors,[],t,damage)}
  assert.equal(actors.size,0,type);assert.ok(Math.hypot(a.x,a.y)<5,'guard returns to post');
  actors.set('orc',{...orc,hp:3});a.x=0;a.returning=false;
  const wall={x:30,y:0,w:8,h:100};assert.equal(c.update(a,.5,actors,[wall],20,()=>assert.fail()),false);
 }
});
