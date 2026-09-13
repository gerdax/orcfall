// One thirteen-orc wave per village per night, retained across chunk reloads.
export function spawnRaid(town,night,world){
 return Array.from({length:13},(_,i)=>{
 const y=town.y-280-i*18,x=town.x-(world.warp(y)-world.warp(town.y));
 return {id:`raid:${night}:${town.id}:${i}`,townId:town.id,type:'orc',raid:true,x,y,homeX:x,homeY:y,targetX:town.x,targetY:town.y,hp:3,dir:'down',moving:false,timer:0,cooldown:0,windup:0,flash:0,variant:i%3};
 });
}
