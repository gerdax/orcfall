export const xpNeeded=level=>40+(level-1)*25;
export function awardXP(hero,amount){
 hero.level??=1;hero.xp??=0;hero.maxHp??=6;hero.damage??=1;
 hero.xp+=Math.max(0,amount);let gained=0;
 while(hero.xp>=xpNeeded(hero.level)){
  hero.xp-=xpNeeded(hero.level);hero.level++;gained++;
  hero.maxHp=6+hero.level-1;hero.damage=1+Math.floor((hero.level-1)/3);hero.hp=hero.maxHp;
 }
 return gained;
}
export const enemyXP=a=>a.boss?60:a.type==='goblin'?10:20;
