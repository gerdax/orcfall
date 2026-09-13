import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';

test('open-world loop: travel, camera, pause, restart and seed changes',async()=>{
 const events={},elements=new Map(),translations=[];
 const context=new Proxy({}, {get:(_,key)=>key==='translate'?((x,y)=>translations.push([x,y])):()=>{}});
 function element(id){if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',hidden:true,style:{},clientWidth:480,clientHeight:320,firstElementChild:{style:{}},getContext:()=>context,setAttribute(){},addEventListener(name,fn){events[id+name]=fn}});return elements.get(id)}
 globalThis.document={getElementById:element,createElement:()=>({getContext:()=>context}),addEventListener(){}};
 globalThis.window={addEventListener(name,fn){events[name]=fn}};
 globalThis.HTMLButtonElement=class {};
 let callback,now=0;globalThis.requestAnimationFrame=fn=>{callback=fn};
 await import('../src/game.js');
 function tick(seconds){for(let i=0;i<Math.ceil(seconds*30);i++){now+=1000/30;callback(now)}}
 function key(k,down=true){events[down?'keydown':'keyup']({key:k,preventDefault(){},target:{},repeat:false})}
 function walk(k,seconds){key(k);tick(seconds);key(k,false)}
 walk('a',1);assert.ok(parseInt(element('coords').textContent)<=-50);assert.match(element('coords').textContent,/, 0/);
 assert.ok(translations.some(([x])=>x>290));
 // Follow the generated westbound trail beyond several screens and chunk seams.
 const terrain=new World(8431);
 for(let frame=0;frame<900;frame++){
  const [x,y]=element('coords').textContent.split(',').map(parseFloat);
  let target=y,best=Infinity;
  for(let candidate=y-20;candidate<=y+20;candidate++){
   const score=terrain.pathDistance(x-12,candidate)+Math.abs(candidate-y)*.01;
   if(score<best){best=score;target=candidate}
  }
  key('a');key('w',false);key('s',false);
  if(target<y-2)key('w');if(target>y+2)key('s');tick(1/30);
 }
 key('a',false);key('w',false);key('s',false);
 assert.ok(parseInt(element('coords').textContent)<-1000,`exploration must continue beyond the old map: ${element('coords').textContent}`);
 assert.ok(parseInt(element('quest').textContent)>=8);

 element('pause').onclick();const before=element('coords').textContent;walk('d',1);assert.equal(element('coords').textContent,before);assert.equal(element('overlay').hidden,false);
 const seed=element('seed').textContent;
 element('reset').onclick();tick(.04);assert.equal(element('seed').textContent,seed);assert.equal(element('runes').textContent,'◇ 0');assert.match(element('coords').textContent,/^0, 0/);assert.equal(element('overlay').hidden,true);
 element('new-world').onclick();tick(.04);assert.notEqual(element('seed').textContent,seed);assert.match(element('coords').textContent,/^0, 0/);
});
