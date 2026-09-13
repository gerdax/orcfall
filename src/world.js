import {addChiefTower} from './chief-tower.js';
import {campsIn,campObjects,campResidents} from './camps.js?v=0.10.2';
import {addWatchtowers} from './watchtowers.js';
import {addPalisade} from './palisades.js?v=0.13.0';
import {riverGround,fishingHuts,fieldAt} from './countryside.js';
import {makeCastle,CASTLE_CHANCE} from './castles.js';
import {makeTown,TOWN_SPACING} from './settlements.js?v=0.13.0';
// All generation depends only on global coordinates and the world seed.
// Chunk order, cache eviction and exploration history cannot change terrain.
export const CHUNK_SIZE = 128;
export const DEFAULT_SEED = 8431;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
export function hash(x, y, seed = DEFAULT_SEED) {
  let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 1442695041);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function noise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
  return lerp(lerp(hash(ix, iy, seed), hash(ix + 1, iy, seed), fx),
    lerp(hash(ix, iy + 1, seed), hash(ix + 1, iy + 1, seed), fx), fy);
}
const gridDistance = n => Math.abs(n - Math.round(n / 640) * 640);
export class World {
  constructor(seed = DEFAULT_SEED, cacheLimit = 64) {
    this.seed = seed >>> 0;
    this.cacheLimit = cacheLimit;
    this.chunks = new Map();
    this.towns = new Map();
  }
  height(x, y) {
    return noise(x / 260, y / 260, this.seed + 17) * .76
      + noise(x / 105, y / 105, this.seed + 31) * .24;
  }
  forest(x, y) { return noise(x / 190, y / 190, this.seed + 83); }
  warp(t) {
    const phase=(this.seed%997)/159;
    return Math.sin(t/180+phase)*48+Math.sin(t/410)*76-Math.sin(phase)*48;
  }
  getTown(gx,gy){
    const key=`${gx}:${gy}`;
    if(this.towns.has(key))return this.towns.get(key);
    let town=null;
    const castle=(gx!==0||gy!==0)&&hash(gx,gy,this.seed+419)<CASTLE_CHANCE;
    if(castle||(gx===0&&gy===0)||hash(gx,gy,this.seed+151)<.72){
      let x=gx*TOWN_SPACING,y=gy*TOWN_SPACING;
      for(let i=0;i<32;i++){x=gx*TOWN_SPACING-this.warp(y);y=gy*TOWN_SPACING-this.warp(x)}
      town=(castle?makeCastle:makeTown)(gx,gy,Math.round(x),Math.round(y),this.seed,!castle&&((gx===0&&gy===0)||hash(gx,gy,this.seed+2301)<.07));
      addPalisade(town,t=>this.warp(t));
      addChiefTower(town);
      addWatchtowers(town);
    }
    this.towns.set(key,town);
    if(this.towns.size>64)this.towns.delete(this.towns.keys().next().value);
    return town;
  }
  townAt(x,y){
    const t=this.getTown(Math.round(x/TOWN_SPACING),Math.round(y/TOWN_SPACING));
    return t&&Math.max(Math.abs(x-t.x),Math.abs(y-t.y))<(t.radius??260)?t:null;
  }
  townsIn(left,top,right,bottom){
    const result=[];
    for(let gy=Math.floor((top-420)/TOWN_SPACING);gy<=Math.ceil((bottom+420)/TOWN_SPACING);gy++)
      for(let gx=Math.floor((left-420)/TOWN_SPACING);gx<=Math.ceil((right+420)/TOWN_SPACING);gx++){
        const t=this.getTown(gx,gy);
        if(t&&t.x+(t.radius??260)>=left&&t.x-(t.radius??260)<=right&&t.y+(t.radius??260)>=top&&t.y-(t.radius??260)<=bottom)result.push(t);
      }
    return result;
  }
  pathDistance(x,y){
    const town=this.townAt(x,y);
    if(town){
      const dx=x-town.x,dy=y-town.y,r=Math.max(Math.abs(dx),Math.abs(dy));
      const blend=smooth(Math.max(0,Math.min(1,(r-200)/60)));
      let distance=Math.min(Math.abs(dx+(1-blend)*Math.sin(dy/70)*11+blend*(this.warp(y)-this.warp(town.y))),Math.abs(dy+(1-blend)*Math.sin(dx/85)*9+blend*(this.warp(x)-this.warp(town.x))));
      for(const lane of town.lanes){
        const vx=lane.bx-lane.ax,vy=lane.by-lane.ay;
        const t=Math.max(0,Math.min(1,((dx-lane.ax)*vx+(dy-lane.ay)*vy)/(vx*vx+vy*vy||1)));
        distance=Math.min(distance,Math.hypot(dx-lane.ax-t*vx,dy-lane.ay-t*vy)+5);
      }
      return distance;
    }
    return Math.min(gridDistance(x+this.warp(y)),gridDistance(y+this.warp(x)));
  }
  sample(x, y) {
    const height = this.height(x, y), forest = this.forest(x, y), path = this.pathDistance(x, y);
    return {height, forest, path, river:riverGround(this,x,y), biome: this.townAt(x,y)?.name.toUpperCase() ?? (path < 12 ? 'LEŚNY TRAKT' : height > .63 ? 'ZIELONE WZGÓRZA' : forest > .52 ? 'STARY BÓR' : 'DZIKIE ŁĄKI')};
  }
  generateChunk(cx, cy) {
    const objects = [], runes = [], x0 = cx * CHUNK_SIZE, y0 = cy * CHUNK_SIZE;
    const camps=campsIn(this,x0,y0,x0+128,y0+128);
    for(const camp of camps)for(const o of campObjects(camp))if(Math.floor(o.x/128)===cx&&Math.floor(o.y/128)===cy)objects.push(o);
    const huts=fishingHuts(this,x0-40,y0-40,x0+CHUNK_SIZE+40,y0+CHUNK_SIZE+40);
    for(let y=y0;y<y0+CHUNK_SIZE;y+=8)for(let x=x0;x<x0+CHUNK_SIZE;x+=8)
      if(riverGround(this,x,y)==='water')objects.push({type:'river-water',x:x+4,y:y+4,w:8,h:8});
    for(const hut of huts)if(Math.floor(hut.x/CHUNK_SIZE)===cx&&Math.floor(hut.y/CHUNK_SIZE)===cy)objects.push(hut);
    for (let y = y0; y < y0 + CHUNK_SIZE; y += 32) {
      for (let x = x0; x < x0 + CHUNK_SIZE; x += 32) {
        const gx = x / 32, gy = y / 32;
        const px = x + 8 + hash(gx, gy, this.seed + 1) * 16;
        const py = y + 8 + hash(gx, gy, this.seed + 2) * 16;
        const town=this.getTown(Math.round(px/TOWN_SPACING),Math.round(py/TOWN_SPACING));
        const occupied=(town?.kind==='castle'&&Math.abs(px-town.x)<145&&Math.abs(py-town.y)<135)||town?.objects.some(o=>Math.abs(o.x-px)<(o.w??16)/2+22&&Math.abs(o.y-py)<(o.h??16)/2+30);
        if (camps.some(c=>Math.abs(px-c.x)<85&&Math.abs(py-c.y)<85)||riverGround(this,px,py)||fieldAt(this,px,py)||huts.some(o=>Math.abs(px-o.x)<40&&Math.abs(py-o.y)<45)||occupied || Math.hypot(px, py) < 75 || this.pathDistance(px, py) < 31) continue;
        const forest = this.forest(px, py), roll = hash(gx, gy, this.seed + 3);
        if (roll < Math.max(.025, (forest - .27) * 1.45)) {
          objects.push({type:'tree', x:Math.round(px), y:Math.round(py), r:7, variant:hash(gx,gy,this.seed+4)});
        } else if (hash(gx, gy, this.seed + 5) < .045 + Math.max(0, this.height(px,py) - .54) * .42) {
          objects.push({type:'rock', x:Math.round(px), y:Math.round(py), r:8, variant:hash(gx,gy,this.seed+6)});
        }
      }
    }
    // Runes sit on a trail or in open grass; never inside a collider.
    const rx = x0 + 24 + hash(cx,cy,this.seed+8)*80;
    const ry = y0 + 24 + hash(cx,cy,this.seed+9)*80;
    if (!riverGround(this,rx,ry)&&!huts.some(o=>Math.hypot(o.x-rx,o.y-ry)<45)&&!this.townAt(rx,ry) && hash(cx,cy,this.seed+7) < .35 && Math.hypot(rx,ry)>90 &&
        !objects.some(o => Math.hypot(o.x-rx,o.y-ry)<o.r+16)) {
      runes.push({id:`${cx}:${cy}`, x:rx, y:ry});
    }
    for(const town of this.townsIn(x0,y0,x0+CHUNK_SIZE,y0+CHUNK_SIZE))
      for(const o of town.objects)
        if(Math.floor(o.x/CHUNK_SIZE)===cx&&Math.floor(o.y/CHUNK_SIZE)===cy)objects.push(o);
    return {cx, cy, x:x0, y:y0, objects, runes, campActors:camps.flatMap(campResidents).filter(a=>a.chunk===`${cx}:${cy}`), surface:null};
  }
  getChunk(cx, cy) {
    const key = `${cx}:${cy}`;
    if (this.chunks.has(key)) {
      const chunk = this.chunks.get(key);
      this.chunks.delete(key); this.chunks.set(key, chunk);
      return chunk;
    }
    const chunk = this.generateChunk(cx, cy);
    this.chunks.set(key, chunk);
    while (this.chunks.size > this.cacheLimit) this.chunks.delete(this.chunks.keys().next().value);
    return chunk;
  }
  region(left, top, right, bottom) {
    const result = [];
    for (let cy=Math.floor(top/CHUNK_SIZE);cy<=Math.floor(bottom/CHUNK_SIZE);cy++)
      for (let cx=Math.floor(left/CHUNK_SIZE);cx<=Math.floor(right/CHUNK_SIZE);cx++) result.push(this.getChunk(cx,cy));
    return result;
  }
}
