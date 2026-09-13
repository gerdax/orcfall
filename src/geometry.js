// Visual bounds and actual footprint share one orientation in world space.
export function rotatedBounds(w,h,angle=0){
 const a=angle*Math.PI/180,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));
 return {w:Math.ceil(w*c+h*s),h:Math.ceil(w*s+h*c)};
}
export function localPoint(o,x,y){
 const a=(o.angle||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 return {x:o.x+x*c-y*s,y:o.y+x*s+y*c};
}
export function buildingDoor(o,padding=9){return localPoint(o,0,(o.sourceH??o.h)/2+padding)}
export function collides(x,y,o,radius=5){
 if(o.decorative)return false;
 if(o.w===undefined)return Math.hypot(x-o.x,y-o.y)<o.r+radius;
 const a=-(o.angle||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a),dx=x-o.x,dy=y-o.y;
 const lx=dx*c-dy*s,ly=dx*s+dy*c,w=o.sourceW??o.w,h=o.sourceH??o.h;
 return Math.hypot(Math.max(0,Math.abs(lx)-w/2),Math.max(0,Math.abs(ly)-h/2))<radius;
}
