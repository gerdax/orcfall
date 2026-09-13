import {daylight,drawNight} from './day-night.js';
import {drawFishingGear} from './countryside.js';
import {healAtWell} from './healing.js';
import {Population,drawPerson,drawCorpse} from './population.js?v=0.10.2';
import {drawCastle} from './castles.js';
import {drawScenery} from './scenery.js';
import {drawSettlement,isSettlementObject} from './settlements.js?v=0.10.0';
import {World,CHUNK_SIZE,DEFAULT_SEED} from './world.js?v=0.10.2';
import {terrainSurface} from './terrain.js';
import {drawHero,moveActor} from './hero.js';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d');
let W=480,H=320,dayStarted=0;
const keys=new Set(),joy={x:0,y:0};
let population,world,hero,runestones=[],dummies,particles,paused=false,sound=false,audio,time=0,last=0,attackUntil=0,attackCooldown=0,dashUntil=0,dashCooldown=0,hits=0,messageTime=0;
let visibleChunks=[],nearbyObjects=[],collected=new Set(),explored=new Set(),distance=0;
const camera={x:0,y:0},rnd=Math.random;
function refreshWorld(){
  camera.x=Math.round(hero.x-W/2);camera.y=Math.round(hero.y-H/2);
  visibleChunks=world.region(camera.x-64,camera.y-64,camera.x+W+64,camera.y+H+64);
  nearbyObjects=visibleChunks.flatMap(c=>c.objects);
  runestones=visibleChunks.flatMap(c=>c.runes).filter(r=>!collected.has(r.id));
  population?.sync(world,visibleChunks);
  explored.add(`${Math.floor(hero.x/CHUNK_SIZE)}:${Math.floor(hero.y/CHUNK_SIZE)}`);
}
function reset(seed=world?.seed??DEFAULT_SEED){
  dayStarted=time;
  world=new World(seed);population=new Population();hero={x:0,y:0,dir:'down',moving:false,hp:6,hurtUntil:0};
  dummies=[{x:-26,y:64,r:7,flash:0}];particles=[];hits=0;collected=new Set();explored=new Set();distance=0;
  attackUntil=attackCooldown=dashUntil=dashCooldown=0;
  refreshWorld();notify('Witaj w osadzie. Dalej na szlaku czekają kolejne miasteczka.',6);
  updateUI();setPause(false);
}
function notify(message,duration=3){$('notice').textContent=message;messageTime=time+duration}
function updateUI(){
  $('health-fill').style.width=`${hero.hp/6*100}%`;$('health-fill').parentElement?.setAttribute('aria-label',`Zdrowie ${hero.hp} z 6`);
  $('runes').textContent=`◇ ${collected.size}`;
  const n=explored.size,label=n===1?'odkryty obszar':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'odkryte obszary':'odkrytych obszarów';
  $('quest').textContent=`${n} ${label} · ${Math.floor(distance/16)} m wędrówki`;
  $('seed').textContent=`ZIARNO ${world.seed}`;
}
function beep(freq,duration=.07){if(!sound)return;audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),v=audio.createGain();o.type='triangle';o.frequency.value=freq;v.gain.setValueAtTime(.035,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(v);v.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}
const angle=()=>({down:Math.PI/2,up:-Math.PI/2,left:Math.PI,right:0})[hero.dir];
function burst(x,y,color,n=12){for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,s=12+rnd()*35;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.5+rnd()*.3,color})}}
function attack(){if(paused||time<attackCooldown)return;attackUntil=time+.23;attackCooldown=time+.4;beep(175);const result=population.strike(hero,angle(),nearbyObjects,time);if(result.hits){beep(95);notify(result.kills?'Ork pokonany.':'Celny cios w orka!')}for(const d of dummies){const distance=Math.hypot(d.x-hero.x,d.y-hero.y),a=Math.atan2(d.y-hero.y,d.x-hero.x),diff=Math.atan2(Math.sin(a-angle()),Math.cos(a-angle()));if(distance<29&&(Math.abs(diff)<1.25||distance<12)){d.flash=time+.2;hits++;burst(d.x,d.y,'#dfc68b');notify('Celny cios! Kukła wytrzyma kolejny.');beep(110);updateUI()}}}
function dash(){if(paused||time<dashCooldown)return;dashUntil=time+.15;dashCooldown=time+1.1;beep(270)}
function setPause(value){value=value||hero.hp<=0;$('pause-title').textContent=hero.hp<=0?'Strażnik poległ.':'Las poczeka.';$('resume').textContent=hero.hp<=0?'Odrodź się w osadzie →':'Wróć do gry →';paused=value;$('overlay').hidden=!value;$('pause').textContent=value?'▶':'Ⅱ';$('pause').setAttribute('aria-label',value?'Wznów grę':'Pauza');keys.clear();joy.x=joy.y=0;$('stick').firstElementChild.style.transform='';$('state').textContent=value?'PAUZA':'GOTOWY DO DROGI'}
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Shift','Escape','w','a','s','d','W','A','S','D'].includes(e.key)){if(e.target instanceof HTMLButtonElement&&e.key===' ')return;e.preventDefault();if(e.key==='Escape'){if(!e.repeat)setPause(!paused);return}keys.add(e.key.toLowerCase());if(e.key===' ')attack();if(e.key==='Shift')dash()}});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>setPause(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)setPause(true)});
$('pause').onclick=()=>setPause(!paused);$('resume').onclick=()=>{if(hero.hp<=0){hero.x=hero.y=0;hero.hp=6;hero.hurtUntil=time+2;refreshWorld();updateUI()}setPause(false)};$('reset').onclick=()=>reset();$('new-world').onclick=()=>reset(Math.floor(Math.random()*4294967296));$('sound').onclick=()=>{sound=!sound;$('sound').textContent=`Dźwięk: ${sound?'wł.':'wył.'}`;$('sound').setAttribute('aria-pressed',sound);beep(440)};
$('attack').addEventListener('pointerdown',e=>{e.preventDefault();attack()});$('dash').addEventListener('pointerdown',e=>{e.preventDefault();dash()});
let pointer=null;const stick=$('stick');function updateStick(e){const r=stick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,len=Math.hypot(dx,dy),scale=Math.min(1,30/(len||1));joy.x=dx*scale/30;joy.y=dy*scale/30;stick.firstElementChild.style.transform=`translate(${dx*scale}px,${dy*scale}px)`}
stick.onpointerdown=e=>{if(paused||pointer!==null)return;pointer=e.pointerId;stick.setPointerCapture(pointer);updateStick(e)};stick.onpointermove=e=>{if(pointer===e.pointerId)updateStick(e)};function release(e){if(e.pointerId!==pointer)return;pointer=null;joy.x=joy.y=0;stick.firstElementChild.style.transform=''}stick.onpointerup=release;stick.onpointercancel=release;stick.onlostpointercapture=release;
function update(dt){time+=dt;const elapsed=time-dayStarted;population.night=elapsed>=180&&(elapsed-180)%180<60?Math.floor(elapsed/180):-1;let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'))+joy.x,dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'))+joy.y;if(Math.hypot(dx,dy)<.12)dx=dy=0;if(dx||dy)hero.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';if(time<dashUntil){dx=Math.cos(angle());dy=Math.sin(angle());if(rnd()<.7)burst(hero.x,hero.y,'#8e9b76',1)}const oldX=hero.x,oldY=hero.y;const uphill=Math.max(0,world.height(hero.x+dx*8,hero.y+dy*8)-world.height(hero.x,hero.y));hero.moving=moveActor(hero,dx,dy,dt,[...nearbyObjects,...dummies],null,null,(time<dashUntil?175:62)*(1-Math.min(.18,uphill*6)));distance+=Math.hypot(hero.x-oldX,hero.y-oldY);refreshWorld();population.update(dt,hero,nearbyObjects,time,(damage=1)=>{if(time<hero.hurtUntil||time<dashUntil||hero.hp<=0)return;hero.hp=Math.max(0,hero.hp-damage);hero.hurtUntil=time+1;burst(hero.x,hero.y,'#b65b45',8);beep(70);notify('Ork atakuje! Shift lub przycisk uniku pozwala uskoczyć.');if(hero.hp<=0)setPause(true)});if(healAtWell(hero,nearbyObjects,dt)){burst(hero.x,hero.y,'#a8d58b',6);notify('Woda ze studni przywraca życie.',1.5)}if(keys.has(' '))attack();for(const r of runestones){if(!collected.has(r.id)&&Math.hypot(hero.x-r.x,hero.y-r.y)<12){collected.add(r.id);burst(r.x,r.y,'#bfe5b2',22);notify('Runa odnaleziona. Las pamięta twoje kroki.');beep(780,.18);updateUI()}}for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);const terrain=world.sample(hero.x,hero.y);$('coords').textContent=`${Math.floor(hero.x)}, ${Math.floor(hero.y)} · WYS. ${Math.round(terrain.height*100)} m`;$('biome').textContent=`${terrain.biome} · ${daylight(time-dayStarted).label}`;updateUI();$('state').textContent=time<attackUntil?'CIOS MIECZEM':time<dashUntil?'UNIK':hero.moving?'W DRODZE':'GOTOWY DO DROGI';if(time>messageTime){const nearby=nearbyObjects.find(o=>o.label&&Math.hypot(hero.x-o.x,hero.y-o.y)<(o.w||0)/2+24);$('notice').textContent=nearby?.label??'WASD / strzałki · ruch    SPACJA · atak';}$('dash').style.opacity=time<dashCooldown?'.4':'1';$('stamina-fill').style.width=`${Math.min(100,Math.max(0,1-(dashCooldown-time)/1.1)*100)}%`}
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function dummy(d){let x=d.x|0,y=d.y|0;rect(x-7,y+3,16,4,'#344530');rect(x-1,y-2,3,10,'#625039');rect(x-9,y-3,19,3,'#a18351');rect(x-5,y-6,11,12,time<d.flash?'#e9d7a1':'#968153');rect(x-4,y-5,8,8,'#b39b61');rect(x-3,y-10,7,6,'#d0b77b');rect(x-1,y-8,2,2,'#705b3c');rect(x-5,y,11,2,'#745d3b')}
function draw(){
ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(-camera.x,-camera.y);
for(const chunk of visibleChunks)ctx.drawImage(terrainSurface(world,chunk),chunk.x,chunk.y);
for(const r of runestones){if(collected.has(r.id))continue;let bob=Math.sin(time*3+r.x)*1.5;ctx.globalAlpha=.12+Math.sin(time*3)*.04;rect(r.x-12,r.y-12,24,24,'#c9e8a6');ctx.globalAlpha=1;rect(r.x-4,r.y-5+bob,8,11,'#223f37');rect(r.x-3,r.y-6+bob,6,11,'#8bab83');rect(r.x-1,r.y-4+bob,2,6,'#ddf3ba');rect(r.x-2,r.y-1+bob,4,1,'#ddf3ba')}
// Low stone ring and fire; all scenery uses the same native pixel grid.
for(let i=0;i<8;i++){let a=i/8*Math.PI*2;rect(Math.cos(a)*13,-38+Math.sin(a)*8,5,4,'#8b907a')}
rect(-6,-40,12,3,'#39291c');rect(-4,-43,8,4,'#714029');
for(let i=-4;i<=4;i++){const flame=5+Math.round(Math.sin(time*10+i*2)*2)+(4-Math.abs(i));rect(i,-41-flame,1,flame,i%2?'#e1a239':'#b76325')}
rect(-1,-48,3,7,'#f0d275');
for(const corpse of population.corpses)drawCorpse(ctx,corpse,time);
const items=[...Array.from(population.actors.values(),a=>({y:a.y,draw:()=>drawPerson(ctx,a,time)})),...nearbyObjects.filter(o=>o.type!=='river-water').map(o=>({y:o.y,draw:()=>o.type.startsWith('castle-')?drawCastle(ctx,o,time):isSettlementObject(o)?(drawSettlement(ctx,o,time),o.fishing&&drawFishingGear(ctx,o)):drawScenery(ctx,o,hero)})),...dummies.map(o=>({y:o.y,draw:()=>dummy(o)})),{y:hero.y,draw:()=>{rect(hero.x-6,hero.y+5,13,3,'#293c2d');ctx.globalAlpha=time<hero.hurtUntil&&Math.floor(time*12)%2?.4:1;drawHero(ctx,hero.x,hero.y,hero.dir,hero.moving?1+(Math.floor(time*10)%2):0);ctx.globalAlpha=1;if(time<attackUntil){const progress=1-(attackUntil-time)/.23,a=angle()-1.2+progress*2.4;for(let i=0;i<10;i++){const aa=a-i*.075;rect(hero.x+Math.cos(aa)*20,hero.y+Math.sin(aa)*20,2,2,i<4?'#e7edcf':'#9dac98')}for(let i=7;i<20;i++)rect(hero.x+Math.cos(a)*i,hero.y+Math.sin(a)*i,2,2,'#dae1d4')}}}];items.sort((a,b)=>a.y-b.y).forEach(i=>i.draw());for(const p of particles){ctx.globalAlpha=Math.min(1,p.life*2);rect(p.x,p.y,2,2,p.color)}ctx.globalAlpha=1;
population.towers.draw(ctx);population.guards.draw(ctx);
ctx.restore();
drawNight(ctx,W,H,time-dayStarted);
drawMinimap();
// Quiet drifting motes add movement without softening the pixels.
for(let i=0;i<12;i++){ctx.globalAlpha=.2+Math.sin(time+i)*.15;rect((i*83+Math.sin(time*.3+i)*15+W)%W,(i*47-time*3+H*100)%H,1,1,'#efdd9f')}ctx.globalAlpha=1}
let mapTime=-1;
function drawMinimap(){
 if(time-mapTime<.35)return;mapTime=time;
 const m=$('minimap').getContext('2d');m.imageSmoothingEnabled=false;
 const left=hero.x-320,top=hero.y-320;
 for(let y=0;y<80;y+=2)for(let x=0;x<80;x+=2){
  const s=world.sample(left+x*8,top+y*8);
  m.fillStyle=s.river==='water'?'#396f7e':s.river==='bridge'?'#ad915e':s.path<16?'#655638':s.forest>.52?'#263c24':'#45572e';m.fillRect(x,y,2,2);
 }
 for(const t of world.townsIn(left,top,left+640,top+640))for(const o of t.objects){
  if(!['house','inn','stable','castle-keep','castle-tower','watchtower'].includes(o.type))continue;
  m.fillStyle=t.kind==='castle'?'#dcc389':'#94704b';m.fillRect(Math.round((o.x-left)/8)-2,Math.round((o.y-top)/8)-2,4,3);
 }
 for(const a of population.actors.values()){m.fillStyle=['orc','goblin'].includes(a.type)?'#d55d40':a.type==='merchant'?'#e1b75a':['knight','archer','spearman'].includes(a.type)?'#a4bfdc':'#cfcd94';m.fillRect(Math.round((a.x-left)/8),Math.round((a.y-top)/8),2,2)}
 m.fillStyle='#151a14';m.fillRect(37,37,7,7);m.fillStyle='#8fb8df';m.fillRect(39,38,3,5);m.fillStyle='#f2efda';m.fillRect(38,39,5,2);
}
function frame(now){const dt=Math.min((now-last)/1000,1/30);last=now;if(!paused)update(dt);draw();requestAnimationFrame(frame)}
function resizeViewport(){
 if(!canvas.parentElement)return;
 const parent=canvas.parentElement,scale=parent.clientWidth>=1000?3:2;
 W=Math.max(80,Math.floor(parent.clientWidth/scale));H=Math.max(80,Math.floor(parent.clientHeight/scale));
 canvas.width=W;canvas.height=H;canvas.style.width=`${W*scale}px`;canvas.style.height=`${H*scale}px`;
 ctx.imageSmoothingEnabled=false;if(world)refreshWorld();
}
window.addEventListener('resize',resizeViewport);
resizeViewport();
const portrait=$('portrait').getContext('2d');portrait.imageSmoothingEnabled=false;portrait.save();portrait.scale(2,2);drawHero(portrait,8,8);portrait.restore();
reset();requestAnimationFrame(frame);
