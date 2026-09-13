import {clearLine} from './population.js';
// Whole health points keep the HUD readable; leaving the well resets progress.
export function healAtWell(hero,objects,dt){
 const well=objects.find(o=>o.type==='well'&&Math.hypot(hero.x-o.x,hero.y-o.y)<=28&&clearLine(hero,o,objects.filter(other=>other!==o)));
 if(!well||hero.hp<=0||hero.hp>=6){hero.healTime=0;return 0}
 hero.healTime=(hero.healTime||0)+dt;
 const amount=Math.min(6-hero.hp,Math.floor(hero.healTime));
 hero.hp+=amount;hero.healTime-=amount;
 return amount;
}
