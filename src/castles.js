// A rare landmark shares the same deterministic streaming contract as villages.
export const CASTLE_CHANCE=.04;
export function makeCastle(gx,gy,x,y,seed){
 const names=['Zamek Czerwonej Korony','Warownia Jastrzębia','Zamek Kamiennej Straży','Twierdza Starego Boru'];
 const name=names[Math.abs((seed+gx*7+gy*11)%names.length)],objects=[];
 const add=(type,dx,dy,w,h,extra={})=>objects.push({type,x:x+dx,y:y+dy,w,h,...extra});
 for(const side of [-1,1]){
  for(const part of [-1,1]){
   add('castle-wall',part*51,side*72,66,12);
   add('castle-wall',side*84,part*45,12,54);
   // Water has real collision; four broad bridges interrupt the moat.
   add('castle-water',part*68,side*99,104,22);
   add('castle-water',side*111,part*53,22,74);
  }
 }
 for(const dx of [-84,84])for(const dy of [-72,72])add('castle-tower',dx,dy,28,28);
 add('castle-keep',-36,-29,42,40,{label:name});
 for(const dy of [-72,72])add('castle-gate',0,dy,32,8,{decorative:true,label:dy>0?'Brama zamkowa':undefined});
 for(const dx of [-84,84])add('castle-sidegate',dx,0,8,32,{decorative:true});
 add('well',37,32,12,12,{label:'Studnia zamkowa'});
 return {id:`${gx}:${gy}`,kind:'castle',x,y,name,layout:'castle',lanes:[],courtyards:[],objects};
}
export function castleGround(t,x,y){
 if(t?.kind!=='castle')return null;
 const dx=Math.abs(x-t.x),dy=Math.abs(y-t.y);
 if(dx<=122&&dy<=110&&(dx>=100||dy>=88))return (dx<16||dy<16)?'bridge':'water';
 if(dx<98&&dy<86)return 'courtyard';
 return null;
}
export function drawCastle(ctx,o,time=0){
 if(o.type==='castle-water')return;
 const p=(dx,dy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(o.x+dx),Math.round(o.y+dy),w,h)};
 const stone=(l,t,w,h)=>{
  p(l+3,t+4,w,h,'#252c26');p(l,t,w,h,'#554f49');p(l+1,t+1,w-2,h-2,'#9b9580');
  for(let y=t+2;y<t+h-1;y+=5){p(l+1,y,w-2,1,'#736c5e');for(let x=l+3+((y-t)%10?3:0);x<l+w-1;x+=8)p(x,y-3,1,3,'#807766')}
  p(l+1,t+1,w-2,2,'#c2b797');p(l+w-3,t+3,2,h-4,'#756d60');
 };
 const roof=(cx,cy,r)=>{
  for(let row=0;row<r+7;row++){
   const half=Math.max(1,Math.round(row*r/(r+6)));
   p(cx-half,cy+row,half*2+1,1,'#572b24');p(cx-half+1,cy+row,half,1,row%4===0?'#813e2b':'#b75c37');
   if(half>1)p(cx+1,cy+row,half-1,1,row%4===0?'#612d24':'#8b402d');
  }
  p(cx,cy-8,1,10,'#d3b17a');p(cx+1,cy-7,7,4,'#a7472a');p(cx+5,cy-6,4,3,'#bc6434');
 };
 if(o.type==='castle-wall'){
  stone(-o.w/2,-o.h/2-7,o.w,o.h+7);
  if(o.w>o.h){p(-o.w/2+2,-o.h/2-5,o.w-4,4,'#494b42');for(let x=-o.w/2;x<o.w/2;x+=8)stone(x,-o.h/2-10,5,6)}
  else{p(-2,-o.h/2-4,4,o.h-2,'#494b42');for(let y=-o.h/2-7;y<o.h/2;y+=8)stone(-o.w/2-2,y,5,5)}
 }else if(o.type==='castle-tower'){
  stone(-13,-20,26,34);p(-6,-10,3,7,'#3d3e37');p(4,-10,3,7,'#3d3e37');p(-13,5,26,2,'#beb291');roof(0,-42,16);
 }else if(o.type==='castle-keep'){
  stone(-21,-30,42,50);p(-4,7,8,13,'#35382f');p(-3,10,6,10,'#654632');
  p(-13,-13,4,9,'#343c34');p(9,-13,4,9,'#343c34');p(-21,1,42,3,'#c8bb99');
  for(let x=-22;x<=18;x+=8)stone(x,-34,5,7);
  stone(-12,-44,24,17);roof(0,-64,16);
  p(11,-6,7,17,'#712a25');p(13,-5,3,12,'#b04a2d');p(13,0,3,3,'#d6b26b');
 }else if(o.type==='castle-gate'){
  p(-17,-14,34,5,'#605d50');p(-16,-16,32,3,'#b2a68a');
  for(let x=-15;x<=13;x+=7)p(x,-20,4,5,'#bbb090');
  p(-16,-10,2,15,'#6d5336');p(14,-10,2,15,'#6d5336');
 }else if(o.type==='castle-sidegate'){
  p(-7,-17,14,2,'#b4a88c');p(-7,15,14,2,'#b4a88c');
 }
}
