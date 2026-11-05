(()=>{
/* ============================================================
   CONTENT SOURCE
   Swap this one line for the WordPress endpoint later:
   const CONTENT_URL='/wp-json/baseborn/v1/world';
   ============================================================ */
const CONTENT_URL='content.json';
fetch(CONTENT_URL,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(boot)
  .catch(e=>{const p=document.querySelector('#press');if(p){p.textContent='Could not load world content. '+e.message;p.style.animation='none';p.style.opacity=1}console.error(e)});

function boot(C){
const $=s=>document.querySelector(s);
const RED=0xc8202b,GOLD=0xd4ac0d,BLUE=0x2f63c9;
const mobile=()=>innerWidth<=720;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const rnd=(a,b)=>a+Math.random()*(b-a);
const dec=(()=>{const t=document.createElement('textarea');return h=>{t.innerHTML=h==null?'':String(h);return t.value}})();

/* scene layout: where each pin and camera sits. All copy lives in content.json */
const LAYOUT={
 room:{rack:{pos:[-5.1,4.9,-3.4],off:[3,5,8]},wall:{pos:[1.2,5.9,-5.9],off:[.4,4,9]},dresser:{pos:[-.9,3.2,-5.4],off:[.5,5,7]},window:{pos:[-3.75,5.2,-5.9],off:[1,3.5,8]},
   desk:{pos:[3.4,3.4,-5.2],off:[-.5,4.5,7]},table:{pos:[.4,2.6,2.3],off:[.5,6,7]},crate:{pos:[-4.5,2.2,4.5],off:[2.5,4,7]},arcade:{pos:[4.9,5,4.6],off:[-2.5,4,7]},
   crt:{pos:[2.7,2.8,4.6],off:[0,4,6]},poach:{pos:[-3.6,4.6,-4.6],off:[1.5,3,7]},cypher:{pos:[-.9,2.6,.2],off:[.5,4,6]},neo:{pos:[4.7,2.6,-1],off:[-1.5,6,6]}},
 city:{supply:{pos:[-11,10,24],off:[13,17,25]},house:{pos:[-12,9,5],off:[10,14,18]},academy:{pos:[19,8,11],off:[-6,14,20]},ind:{pos:[19,18,-11],off:[-8,18,22]},
   records:{pos:[16,9,-37],off:[-6,14,20]},rooftop:{pos:[-14,11,-24],off:[8,14,16]},alley:{pos:[-32,23,-4],off:[12,26,32]},gas:{pos:[29,8,33],off:[-4,9,17]}}
};
const bySlug=a=>Object.fromEntries((a||[]).map(x=>[x.slug,x]));
const FD=bySlug(C.foundlings),PG=bySlug(C.pages),SH=bySlug(C.shop_links);
const UI=Object.assign({},(C.site&&C.site.ui)||{});
const SG=C.signage||{};
const routeOf=l=>!l?'#':l.type==='shop'?((SH[l.ref]&&SH[l.ref].acf.url)||'#'):l.type==='page'?((PG[l.ref]&&PG[l.ref].link)||'#'):l.type==='scene'?'@'+l.ref:l.type==='external'?(l.url||'#'):'#';
function toLoc(p){const a=p.acf||{},f=a.foundling?FD[a.foundling]:null,lay=(LAYOUT[a.scene]||{})[p.slug];
  if(!lay)console.warn('No layout for location',p.slug);
  return {id:p.slug,short:dec(a.short_title||p.title.rendered),name:dec(p.title.rendered),
    tag:dec(a.tag||(f?f.acf.nickname.toUpperCase():'')),c:a.accent||(f?f.acf.color:'#efe6d4'),who:dec(a.subtitle||(f?f.acf.traits:'')),
    body:dec(a.body),ctas:(a.ctas||[]).map(c=>[dec(c.label),routeOf(c.link)]),pos:(lay||{pos:[0,3,0]}).pos,off:(lay||{off:[0,8,10]}).off}}
const sceneList=sc=>(C.locations||[]).filter(l=>l.acf&&l.acf.scene===sc).sort((a,b)=>(a.acf.menu_order||0)-(b.acf.menu_order||0)).map(toLoc);
const ROOM=sceneList('room'),CITY=sceneList('city');
const LISTS={room:ROOM,city:CITY};
{const set=(q,v,html)=>{const e=$(q);if(e&&v!=null){html?e.innerHTML=v:e.textContent=v}};
 set('.logo',`${UI.logo||'BASEBORN'} ☠ <small>${UI.logo_sub||''}</small>`,true);
 set('#loader h1',UI.loader_title);set('#loader .sub',UI.loader_sub);set('#press',UI.loader_loading);
 set('#eSound',UI.enter_sound);set('#eQuiet',UI.enter_quiet);set('#hintTxt',UI.hint_mouse,true);
 set('#bIndex',UI.index_button);set('#iClose',UI.index_close);
 const h3=document.querySelectorAll('#index h3');if(h3[0]&&UI.index_room)h3[0].textContent=UI.index_room;if(h3[1]&&UI.index_city)h3[1].textContent=UI.index_city;
 set('#pPrev',UI.panel_prev);set('#pNext',UI.panel_next);set('#bSound',UI.sound_off);
 const w=$('#where');if(w)w.innerHTML=`${UI.where_prefix||'You are in'} <b id="whereTxt">${UI.where_room||'the room'}</b>`;
 if(C.site&&C.site.name)document.title=dec(C.site.name)+' · World'}
const sg=(k,i,fb)=>{const v=SG[k];return dec(Array.isArray(v)?(v[i]!=null?v[i]:fb):(v!=null?v:fb))};

/* ============================================================
   RENDERER + HELPERS
   ============================================================ */
const canvas=$('#c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
const camera=new THREE.PerspectiveCamera(36,innerWidth/innerHeight,0.3,900);
let sizeFX=null,fxOn=true;
let PIX=0.8;
function resize(){renderer.setPixelRatio(Math.max(.5,Math.min(devicePixelRatio,2)*PIX));renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();sizeFX&&sizeFX()}
resize();addEventListener('resize',resize);
let S;
const M=(c,o={})=>new THREE.MeshPhongMaterial(Object.assign({color:c,flatShading:true,shininess:6},o));
const B=c=>new THREE.MeshBasicMaterial({color:c});
function box(w,h,d,mat,x=0,y=0,z=0,parent=S){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y+h/2,z);parent.add(m);return m}
function cyl(rt,rb,h,seg,mat,x=0,y=0,z=0,parent=S){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat);m.position.set(x,y+h/2,z);parent.add(m);return m}
function plane(w,h,mat,x,y,z,ry=0,parent=S){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.y=ry;parent.add(m);return m}
function tex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}t.anisotropy=4;t.userData={c,g};return t}
function skull(g,cx,cy,s,col='#111',bg='#e9dfc8'){
  g.fillStyle=col;g.beginPath();g.arc(cx,cy,s,0,7);g.fill();g.fillRect(cx-s*.62,cy+s*.45,s*1.24,s*.62);
  for(const k of[-1,1]){g.beginPath();g.moveTo(cx+k*s*.75,cy-s*.55);g.quadraticCurveTo(cx+k*s*1.5,cy-s*1.2,cx+k*s*1.05,cy-s*2);g.lineTo(cx+k*s*.35,cy-s*.85);g.fill()}
  g.fillStyle=bg;g.beginPath();g.ellipse(cx-s*.36,cy,s*.24,s*.32,0,0,7);g.ellipse(cx+s*.36,cy,s*.24,s*.32,0,0,7);g.fill();
  g.beginPath();g.moveTo(cx,cy+s*.42);g.lineTo(cx-s*.1,cy+s*.26);g.lineTo(cx+s*.1,cy+s*.26);g.fill();
  for(let i=-2;i<=2;i++)g.fillRect(cx+i*s*.22-1,cy+s*.68,2,s*.36);
}
function paper(g,w,h,base='#d9ceb4'){g.fillStyle=base;g.fillRect(0,0,w,h);for(let i=0;i<w*h/60;i++){g.fillStyle=`rgba(60,40,20,${Math.random()*.08})`;g.fillRect(Math.random()*w,Math.random()*h,2,2)}
  const gr=g.createRadialGradient(w/2,h/2,w*.2,w/2,h/2,w*.8);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(70,40,10,.35)');g.fillStyle=gr;g.fillRect(0,0,w,h)}
function hl(g,txt,x,y,size,col='#111',align='center',font='Anton, Impact, sans-serif'){g.fillStyle=col;g.font=`${size}px ${font}`;g.textAlign=align;g.textBaseline='alphabetic';g.fillText(txt,x,y)}
function lines(g,x,y,w,n,gap=10){g.fillStyle='rgba(20,20,20,.55)';for(let i=0;i<n;i++)g.fillRect(x,y+i*gap,w*(.6+Math.random()*.4),3)}
function neonTex(rows,w=512,h=256,board='#120d0b',frame=null){return tex(w,h,(g)=>{g.fillStyle=board;g.fillRect(0,0,w,h);
  if(frame){g.strokeStyle=frame;g.lineWidth=8;g.shadowColor=frame;g.shadowBlur=18;g.strokeRect(10,10,w-20,h-20)}
  rows.forEach(r=>{g.font=`${r.s}px ${r.f||'Anton, Impact, sans-serif'}`;g.textAlign='center';g.textBaseline='middle';
    for(const [b,a] of[[28,r.c],[12,r.c],[0,'#fff6e8']]){g.shadowColor=r.c;g.shadowBlur=b;g.fillStyle=b?r.c:a;g.globalAlpha=b?1:.55;g.fillText(r.t,w/2,r.y)}g.globalAlpha=1;
    g.shadowBlur=0;g.fillStyle=r.c;g.globalAlpha=.85;g.fillText(r.t,w/2,r.y);g.globalAlpha=1})})}

/* light beam, cone and contact shadow textures */
const beamTex=tex(64,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.55,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.globalCompositeOperation='destination-in';const e=g.createLinearGradient(0,0,w,0);e.addColorStop(0,'rgba(0,0,0,0)');e.addColorStop(.5,'rgba(0,0,0,1)');e.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=e;g.fillRect(0,0,w,h)});
const blobTex=tex(128,128,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(0,0,0,.85)');r.addColorStop(.5,'rgba(0,0,0,.4)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,w,h)});
const aoTex=tex(8,128,(g,w,h)=>{const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,'rgba(0,0,0,.75)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,w,h)});
const blobMat=new THREE.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
function blob(parent,x,y,z,w,d,o=1){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),o===1?blobMat:Object.assign(blobMat.clone(),{opacity:o}));m.rotation.x=-Math.PI/2;m.position.set(x,y+.02,z);m.renderOrder=1;parent.add(m);return m}
function aoStrip(parent,len,depth,x,z,ry){const m=new THREE.Mesh(new THREE.PlaneGeometry(len,depth),new THREE.MeshBasicMaterial({map:aoTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));m.rotation.order='YXZ';m.rotation.set(-Math.PI/2,ry,0);m.position.set(x,.025,z);parent.add(m);return m}

/* ============================================================
   FOUNDLINGS v2 : from the head turnarounds and pose sheet
   smooth vinyl skull, hollow oval eyes, toothy grin, horn collars,
   stacked disc neck, rounded ribs, knob joints, chunky feet
   ============================================================ */
const GEO={};
const sph=(r,ws=14,hs=10)=>GEO['s'+r+ws]||(GEO['s'+r+ws]=new THREE.SphereGeometry(r,ws,hs));
function horn(len,r,curls,mat,stub){
  const root=new THREE.Group(),n=curls.length,h=len/n,nn=stub?2:n;let parent=root;
  const col=new THREE.Mesh(new THREE.TorusGeometry(r*1.02,r*.32,8,16),mat);col.rotation.x=Math.PI/2;col.position.y=.02;root.add(col);
  for(let k=0;k<nn;k++){const r0=r*(1-k/n*.82),r1=r*(1-(k+1)/n*.82);
    const g=new THREE.CylinderGeometry(stub&&k===nn-1?r0*.98:r1,r0,h,14,1,stub&&k===nn-1);g.translate(0,h/2,0);
    const m=new THREE.Mesh(g,mat);parent.add(m);
    const j=new THREE.Group();j.position.y=h;m.add(j);
    if(!stub||k<nn-1){const ball=new THREE.Mesh(sph(Math.max(r1,.01),12,8),mat);j.add(ball)}
    j.rotation.z=curls[k]||0;parent=j}
  if(stub){ // broken jagged crown, hollow inside
    const rr=r*(1-(nn-1)/n*.82);
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2,c=new THREE.Mesh(new THREE.ConeGeometry(rr*.32,rr*(.5+Math.random()*.7),4),mat);c.position.set(Math.cos(a)*rr*.82,0,Math.sin(a)*rr*.82);c.rotation.set(rnd(-.2,.2),0,rnd(-.2,.2));parent.add(c)}
    const hole=new THREE.Mesh(new THREE.CircleGeometry(rr*.8,12),B(0x140c04));hole.rotation.x=-Math.PI/2;hole.position.y=-.02;parent.add(hole)}
  return root;
}
function limb(l1,l2,r,mat){
  const root=new THREE.Group();root.add(new THREE.Mesh(sph(r*1.7),mat));
  const b1=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.9,l1,12),mat);b1.position.y=-l1/2;root.add(b1);
  const mid=new THREE.Group();mid.rotation.order='YXZ';mid.position.y=-l1;root.add(mid);
  mid.add(new THREE.Mesh(sph(r*1.55),mat));
  const b2=new THREE.Mesh(new THREE.CylinderGeometry(r*.9,r*.82,l2,12),mat);b2.position.y=-l2/2;mid.add(b2);
  const end=new THREE.Group();end.position.y=-l2;mid.add(end);end.add(new THREE.Mesh(sph(r*1.35),mat));
  root.rotation.order='XYZ';return {root,mid,end};
}
const HORNS={
  poach:{tilt:.42,curls:[.0,.08,.16,.22,.26,.28],len:1.15},
  cypher:{tilt:.3,curls:[.0,.1,.17,.22,.26,.3],len:1.1},
  neo:{tilt:.42,curls:[.18,.24,.12,-.25,-.6,-.8],len:1.0}
};
function foundling(color,type,pose='stand',bakeIt=false){
  const g=new THREE.Group(),mat=new THREE.MeshPhongMaterial({color,shininess:42,specular:0x3a2a2a}),
    dark=new THREE.MeshBasicMaterial({color:0x070505});
  const S2=(r,sx,sy,sz,m,x,y,z,p)=>{const s=new THREE.Mesh(sph(r),m);s.scale.set(sx,sy,sz);s.position.set(x,y,z);p.add(s);return s};
  const hips=new THREE.Group();hips.position.y=1.95;g.add(hips);
  S2(.4,1,.5,.7,mat,0,0,0,hips);
  for(const sx of[-1,1]){const t=new THREE.Mesh(new THREE.TorusGeometry(.15,.075,10,18),mat);t.position.set(sx*.22,-.04,.16);t.rotation.y=sx*.4;hips.add(t)}
  const torso=new THREE.Group();torso.position.y=.16;hips.add(torso);
  const spine=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,1.4,10),mat);spine.position.set(0,.7,-.1);torso.add(spine);
  const ribs=5;for(let i=0;i<ribs;i++){const w=.44+i*.055;S2(1,w,.105,w*.74,mat,0,.22+i*.23,0,torso)}
  const chestTop=.22+(ribs-1)*.23+.1;
  const neck=new THREE.Group();neck.position.y=chestTop;torso.add(neck);
  [[.14,.07,.05],[.14,.07,.15],[.14,.07,.25],[.2,.07,.35]].forEach(([r,h,y])=>{const d=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),mat);d.position.y=y;neck.add(d);const rim=new THREE.Mesh(new THREE.TorusGeometry(r,h/2,6,16),mat);rim.rotation.x=Math.PI/2;rim.position.y=y;neck.add(rim)});
  const head=new THREE.Group();head.position.y=.78;neck.add(head);
  S2(.7,1,1,1.02,mat,0,.14,-.02,head);                         // cranium
  S2(.48,1.05,.62,.86,mat,0,-.36,.17,head);                     // muzzle and teeth block
  for(const sx of[-1,1]){S2(.2,.9,1.3,.5,dark,sx*.27,.04,.6,head);S2(.12,1,.8,.9,mat,sx*.5,-.22,.38,head)}
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.075,.14,3),dark);nose.position.set(0,-.2,.68);nose.rotation.set(Math.PI,0,0);head.add(nose);
  const mouth=new THREE.Mesh(new THREE.BoxGeometry(.66,.022,.04),dark);mouth.position.set(0,-.43,.58);head.add(mouth);
  for(let i=-3;i<=3;i++){const t=new THREE.Mesh(new THREE.BoxGeometry(.018,.24,.04),dark);t.position.set(i*.085,-.43,.585-Math.abs(i)*.012);head.add(t)}
  const H=HORNS[type]||HORNS.poach;
  const mk=(side,stub)=>{const h=horn(H.len,.15,H.curls.map(c=>c*side),mat,stub);h.position.set(side*.42,.6,-.02);h.rotation.z=-side*H.tilt;head.add(h)};
  if(type==='cypher'){mk(1,false);mk(-1,true)}else{mk(-1,false);mk(1,false)}
  const arms=[-1,1].map(sx=>{const a=limb(.7,.66,.08,mat);a.root.position.set(sx*.62,chestTop-.08,0);torso.add(a.root);
    S2(.13,1,.9,.6,mat,0,-.12,0,a.end);
    for(let f=0;f<4;f++){const fi=new THREE.Mesh(new THREE.CylinderGeometry(.032,.028,.22,8),mat);fi.position.set(-.09+f*.06,-.3,.02);fi.rotation.z=(f-1.5)*.12;a.end.add(fi);const tip=new THREE.Mesh(sph(.034,8,6),mat);tip.position.set(-.09+f*.06+(f-1.5)*-.014,-.41,.02);a.end.add(tip)}
    return a});
  const legs=[-1,1].map(sx=>{const l=limb(.85,.82,.1,mat);l.root.position.set(sx*.3,-.14,0);hips.add(l.root);
    S2(.3,1,.55,1.45,mat,0,-.1,.17,l.end);return l});
  const rig={g,hips,torso,neck,head,arms,legs,type,mat};
  pose&&applyPose(rig,pose);
  g.scale.setScalar(.78);
  if(bakeIt)bake(rig);
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  return rig;
}
/* bake a posed figure into two merged meshes so the city stays fast */
function bake(rig){
  const g=rig.g;g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert();
  const buckets=new Map();
  g.traverse(o=>{if(!o.isMesh)return;const key=o.material.uuid;if(!buckets.has(key))buckets.set(key,{mat:o.material,pos:[],nor:[]});
    const geo=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone());geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));
    const b=buckets.get(key);b.pos.push(geo.attributes.position.array);b.nor.push(geo.attributes.normal.array)});
  while(g.children.length)g.remove(g.children[0]);
  buckets.forEach(b=>{const cat=arrs=>{let n=0;arrs.forEach(a=>n+=a.length);const out=new Float32Array(n);let o=0;arrs.forEach(a=>{out.set(a,o);o+=a.length});return out};
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(cat(b.pos),3));geo.setAttribute('normal',new THREE.BufferAttribute(cat(b.nor),3));
    const m=new THREE.Mesh(geo,b.mat);m.castShadow=true;m.receiveShadow=true;g.add(m)});
  rig.baked=true;
}
function can(rig,i=1){const c=new THREE.Group(),m=rig.mat;const b=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.34,12),m);c.add(b);const t=new THREE.Mesh(new THREE.CylinderGeometry(.05,.08,.08,10),m);t.position.y=.21;c.add(t);const n=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,.05),B(0x111111));n.position.set(0,.27,.04);c.add(n);c.position.set(0,-.2,.1);c.rotation.x=-1.3;rig.arms[i].end.add(c);c.traverse(o=>o.castShadow=true)}
function applyPose(r,p){
  const [aL,aR]=r.arms,[lL,lR]=r.legs,A=(l,a,b)=>{l.root.rotation.set(a[0],a[1]||0,a[2]||0);if(b)l.mid.rotation.set(b[0],b[1]||0,b[2]||0)};
  switch(p){
  case 'stand':A(aL,[.05,0,-.14],[-.25]);A(aR,[-.05,0,.14],[-.3]);A(lL,[0,0,-.05]);A(lR,[0,0,.05]);break;
  case 'swagger':r.hips.position.y=1.82;A(aL,[.2,0,-.45],[-.6]);A(aR,[-.2,0,1.15],[-.35]);A(lL,[-.15,0,-.32],[.35]);A(lR,[.1,0,.32],[.3]);r.torso.rotation.z=-.06;r.neck.rotation.z=.1;break;
  case 'cross':A(aL,[-.45,0,-.12],[-1.75,1.25]);A(aR,[-.45,0,.12],[-1.75,-1.25]);A(lL,[0,0,-.08]);A(lR,[0,0,.08]);r.neck.rotation.x=.12;break;
  case 'lean':A(aR,[.15,0,.55],[-1.3,-1.4]);A(aL,[-.05,0,-.15],[-.35]);A(lL,[-.12,0,.12],[.1]);A(lR,[0,0,.05]);r.g.rotation.z=.07;r.neck.rotation.z=-.12;break;
  case 'leanWall':A(aR,[-.6,0,.75],[-.5]);A(aL,[.05,0,-.2],[-.4]);A(lL,[-.2,0,.25],[.15]);A(lR,[0,0,.05]);r.g.rotation.z=.14;break;
  case 'spray':A(aR,[-1.45,0,.32],[-.12]);can(r,1);A(aL,[.1,0,-.55],[-.45]);A(lL,[-.1,0,-.22],[.15]);A(lR,[.1,0,.25],[.15]);r.neck.rotation.y=-.2;break;
  case 'sprayWide':A(aR,[-1.5,0,.2],[-.1]);can(r,1);A(aL,[-.2,0,-1.35],[-.3]);A(lL,[-.3,0,-.4],[.5]);A(lR,[.2,0,.35],[.2]);r.hips.position.y=1.8;break;
  case 'sit':r.hips.position.y=.34;r.torso.rotation.x=-.12;A(lL,[-1.95,0,-.12],[2.3]);A(lR,[-1.95,0,.12],[2.3]);A(aL,[-1.0,0,-.06],[-.95]);A(aR,[-1.0,0,.06],[-.95]);r.neck.rotation.x=.18;break;
  case 'crossleg':r.hips.position.y=.34;A(lL,[-1.45,0,-1.05],[2.5]);A(lR,[-1.45,0,1.05],[2.5]);A(aL,[-.45,0,-.3],[-.9]);A(aR,[-.45,0,.3],[-.9]);break;
  case 'ledge':r.hips.position.y=.1;A(lL,[-1.5,0,-.15],[1.55]);A(lR,[-1.3,0,.2],[1.2]);A(aL,[.35,0,-.25],[-.15]);A(aR,[.35,0,.25],[-.15]);r.torso.rotation.x=-.15;break;
  case 'lie':r.g.rotation.x=-Math.PI/2;r.neck.rotation.x=.25;r.head.rotation.y=.35;A(aL,[0,0,-1.25],[0,0,-.4]);A(aR,[-.2,0,1.05],[-.5]);A(lL,[-.15,0,-.32]);A(lR,[-.35,0,.28],[.6]);break;
  case 'crawl':r.hips.position.y=1.22;r.torso.rotation.x=1.35;r.neck.rotation.x=-1.1;A(aL,[-1.45,0,-.1],[-.1]);A(aR,[-1.2,0,.12],[-.35]);A(lL,[-.25,0,-.08],[1.5]);A(lR,[-.2,0,.08],[1.5]);break;
  case 'climb':A(aR,[-2.85,0,.25],[-.2]);A(aL,[-2.3,0,-.45],[-.7]);A(lR,[-1.15,0,.15],[1.6]);A(lL,[-.3,0,-.12],[.5]);r.neck.rotation.x=-.35;break;
  case 'crouchSpray':r.hips.position.y=1.0;r.torso.rotation.x=.3;A(lL,[-1.6,0,-.22],[2.3]);A(lR,[-.35,0,.22],[2.4]);A(aR,[-1.35,0,.2],[-.15]);can(r,1);A(aL,[-.6,0,-.25],[-.8]);r.neck.rotation.x=-.25;break;
  case 'walk':A(lL,[-.45,0,-.04],[.25]);A(lR,[.35,0,.04],[.4]);A(aL,[.4,0,-.12],[-.3]);A(aR,[-.4,0,.12],[-.4]);r.neck.rotation.x=.05;break;
  }
}

/* ============================================================
   SCENE A: THE ROOM (bedroom v2)
   ============================================================ */
const room=new THREE.Scene();S=room;room.background=new THREE.Color(0x0b0907);
const RL={};
{
  const W=12,D=12,HGT=7.2,zb=-D/2-.2;
  const brick=tex(512,512,(g,w,h)=>{g.fillStyle='#120c0a';g.fillRect(0,0,w,h);const bw=64,bh=26;
    for(let y=0;y<h;y+=bh)for(let x=-(y/bh%2)*bw/2;x<w;x+=bw){const v=30+Math.random()*30;g.fillStyle=`rgb(${v+18|0},${v*.62|0},${v*.5|0})`;g.fillRect(x+2,y+2,bw-4,bh-4);
      for(let k=0;k<14;k++){g.fillStyle=`rgba(0,0,0,${Math.random()*.25})`;g.fillRect(x+Math.random()*bw,y+Math.random()*bh,3,2)}}},[2.2,1.6]);
  const wood=tex(512,512,(g,w,h)=>{const pw=42;for(let x=0;x<w;x+=pw){let y=-Math.random()*200;while(y<h){const L=120+Math.random()*200,v=44+Math.random()*26;
    g.fillStyle=`rgb(${v+26|0},${v*.58|0},${v*.3|0})`;g.fillRect(x,y,pw-2,L-2);for(let k=0;k<10;k++){g.fillStyle=`rgba(20,10,4,${Math.random()*.35})`;g.fillRect(x+Math.random()*pw,y,1.5,L)}
    g.fillStyle='rgba(0,0,0,.7)';g.fillRect(x,y+L-2,pw,2);y+=L}g.fillStyle='#0d0805';g.fillRect(x+pw-2,0,2,h)}},[3,3]);
  const darkwood=tex(256,256,(g,w,h)=>{g.fillStyle='#3a2414';g.fillRect(0,0,w,h);for(let i=0;i<140;i++){g.fillStyle=`rgba(${Math.random()<.5?0:110},${Math.random()<.5?0:60},0,${Math.random()*.25})`;g.fillRect(0,Math.random()*h,w,1+Math.random()*2)}});
  const woodM=new THREE.MeshPhongMaterial({map:darkwood,shininess:18});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshPhongMaterial({map:wood,shininess:30,specular:0x2a1a10}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;room.add(floor);
  const wallM=new THREE.MeshPhongMaterial({map:brick,shininess:2});
  // back wall with two window openings
  box(.5,HGT,.4,wallM,-5.75,0,zb);
  box(3.5,1.5,.4,wallM,-3.75,0,zb);box(3.5,HGT-6,.4,wallM,-3.75,6,zb);
  box(4.6,HGT,.4,wallM,.3,0,zb);
  box(1.6,2.3,.4,wallM,3.4,0,zb);box(1.6,HGT-5.6,.4,wallM,3.4,5.6,zb);
  box(1.8,HGT,.4,wallM,5.1,0,zb);
  box(.4,HGT,D,wallM,W/2+.2,0,0);                                // right wall
  box(W,.25,.1,woodM,0,0,-D/2+.05);box(.1,.25,D,woodM,W/2-.05,0,0);
  const sky=tex(64,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#ffd590');gr.addColorStop(.55,'#ff9a3c');gr.addColorStop(1,'#8a3c18');g.fillStyle=gr;g.fillRect(0,0,w,h)});
  RL.skyMat=new THREE.MeshBasicMaterial({map:sky});
  plane(3.6,4.8,RL.skyMat,-3.75,3.8,zb-.6);plane(1.8,3.6,RL.skyMat,3.4,4,zb-.6);
  const frame=M(0x2a1a10);
  [[-5.5,1.5,4.5],[-3.75,1.5,4.5],[-2,1.5,4.5],[2.6,2.3,3.3],[4.2,2.3,3.3]].forEach(([x,y,h])=>box(.16,h,.3,frame,x,y,-D/2-.05));
  box(3.6,.18,.4,frame,-3.75,1.4,-D/2+.05);box(1.7,.18,.4,frame,3.4,2.2,-D/2+.05);
  const slatM=M(0xc49458,{shininess:18});
  for(let y=1.65;y<5.95;y+=.2){const s=box(3.4,.1,.07,slatM,-3.75,y,-D/2+.12);s.rotation.x=.55}
  for(let y=2.45;y<5.55;y+=.2){const s=box(1.5,.1,.07,slatM,3.4,y,-D/2+.12);s.rotation.x=.55}
  box(3.5,.25,.3,M(0x8a6438),-3.75,5.9,-D/2+.15);box(1.6,.25,.3,M(0x8a6438),3.4,5.5,-D/2+.15);
  // lights
  RL.hemi=new THREE.HemisphereLight(0xffc89a,0x1a0d06,.42);room.add(RL.hemi);
  RL.sun=new THREE.DirectionalLight(0xffa24a,2.2);RL.sun.position.set(-9,10,-26);RL.sun.target.position.set(.5,0,2);room.add(RL.sun.target);
  RL.sun.castShadow=true;Object.assign(RL.sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:2,far:60});RL.sun.shadow.mapSize.set(2048,2048);RL.sun.shadow.bias=-.0006;RL.sun.shadow.radius=3.5;room.add(RL.sun);
  RL.bounce=new THREE.PointLight(0xff8a3a,.5,16,2);RL.bounce.position.set(-1,1,-1);room.add(RL.bounce);
  RL.fill=new THREE.PointLight(0xffb070,.55,24,2);RL.fill.position.set(1,7,5);room.add(RL.fill);
  // LED sign
  const led=tex(1024,256,(g,w,h)=>{g.fillStyle='#0a0303';g.fillRect(0,0,w,h);const c=document.createElement('canvas');c.width=96;c.height=26;const q=c.getContext('2d');q.fillStyle='#fff';q.font='12px Anton, Impact';q.textBaseline='top';q.textAlign='center';q.fillText(sg('led_sign',0,'BASEBORN'),48,0);q.fillText(sg('led_sign',1,'IND.'),48,13);
    const d=q.getImageData(0,0,96,26).data;for(let y=0;y<26;y++)for(let x=0;x<96;x++){const on=d[(y*96+x)*4]>110;g.fillStyle=on?'#ff2a1c':'#2a0a08';g.beginPath();g.arc(x*10.6+6,y*9.6+8,3.6,0,7);g.fill()}});
  box(3.2,1.3,.25,M(0x111),3.5,5.75,-D/2+.15);plane(3,1.15,new THREE.MeshBasicMaterial({map:led}),3.5,6.4,-D/2+.29);
  RL.ledLight=new THREE.PointLight(0xff2a1c,.9,8,2);RL.ledLight.position.set(3.5,6.2,-5);room.add(RL.ledLight);
  // posters
  const posterM=(w,h,draw)=>new THREE.MeshPhongMaterial({map:tex(w,h,draw),shininess:3});
  const P=(w,h,x,y,draw,rot=0,z=-D/2+.02,ry=0)=>{const m=plane(w,h,posterM(Math.round(w*90),Math.round(h*90),draw),x,y,z,ry);m.rotation.z=rot;m.receiveShadow=true;return m};
  P(2.1,2.9,1.15,4.55,(g,w,h)=>{paper(g,w,h);hl(g,'BASEBORN',w/2,h*.15,h*.12);hl(g,'INDUSTRIES',w/2,h*.28,h*.11);skull(g,w/2,h*.6,w*.17);g.font=`${h*.045}px monospace`;g.textAlign='center';g.fillStyle='#111';g.fillText('IMBASEBORN.COM',w/2,h*.93)},.01);
  P(1.4,2,-1.15,4.95,(g,w,h)=>{paper(g,w,h,'#cfc6b0');hl(g,'BASEBORN',w/2,h*.13,h*.1);hl(g,'ACADEMIES',w/2,h*.24,h*.1);skull(g,w/2,h*.55,w*.16);lines(g,w*.1,h*.78,w*.8,5,h*.04)},-.03);
  [[2.35,6.3],[2.35,5.4],[2.35,4.5],[2.35,3.5],[-.4,6.6],[-1.7,6.5],[.2,6.55]].forEach(([x,y],i)=>P(.5,.75,x,y,(g,w,h)=>{paper(g,w,h,['#d9ceb4','#1a1a1a','#cfc6b0'][i%3]);
    const ink=i%3===1?'#e9dfc8':'#111',bg=i%3===1?'#1a1a1a':'#e9dfc8';if(i%2)skull(g,w/2,h*.55,w*.22,ink,bg);else hl(g,'BB',w/2,h*.62,h*.38,ink)},rnd(-.08,.08),-D/2+.03+i*.001));
  // right wall posters
  const R=(w,h,z,y,draw)=>P(w,h,W/2-.02,y,draw,0,z,-Math.PI/2);
  R(1.3,1.9,-4.9,5.6,(g,w,h)=>{g.fillStyle='#141414';g.fillRect(0,0,w,h);hl(g,'LITO',w/2,h*.3,h*.24,'#d4ac0d');skull(g,w/2,h*.66,w*.18,'#c8202b','#141414')});
  R(1.4,1.1,-3.2,3.6,(g,w,h)=>{paper(g,w,h,'#1c1c1c');hl(g,'STARSUS',w/2,h*.4,h*.24,'#e9dfc8');hl(g,'IND.',w/2,h*.72,h*.24,'#e9dfc8')});
  R(1.2,1.6,-3.1,5.6,(g,w,h)=>{paper(g,w,h,'#2a1410');skull(g,w/2,h*.55,w*.22,'#e9dfc8','#2a1410')});
  R(1,1.3,-4.9,3.6,(g,w,h)=>{paper(g,w,h,'#d4c9ae');hl(g,'LITO.',w/2,h*.3,h*.2);lines(g,w*.1,h*.45,w*.8,6,h*.07)});

  // rack along left side + shelf with caps and cans
  const pipe=M(0x2b2b2e,{shininess:80,specular:0x666666});
  const rx=-5.2,rz0=-5.4,rz1=-1.9;
  for(const z of[rz0,rz1])for(const dx of[-.35,.35])cyl(.06,.06,4.7,6,pipe,rx+dx,0,z);
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,3.6,6),pipe);bar.rotation.x=Math.PI/2;bar.position.set(rx,4.6,(rz0+rz1)/2);room.add(bar);
  const hood=[0x5a5a58,0x4a4a46,0x3c3f46,0x55524a,0x2e3440,0x5c5f5a,0x48443c,0x3a3a40];
  hood.forEach((c,i)=>{const z=rz0+.25+i*.42,sh=new THREE.Group();
    box(1.1,1.7,.14,M(c,{shininess:2}),0,-1.9,0,sh);box(.24,1.1,.14,M(c),-.62,-1.5,0,sh);box(.24,1.1,.14,M(c),.62,-1.5,0,sh);
    if(i%3===0){const lbl=plane(.7,.18,new THREE.MeshBasicMaterial({map:tex(128,32,(g,w,h)=>{g.fillStyle='rgba(0,0,0,0)';g.clearRect(0,0,w,h);hl(g,'BASEBORN',w/2,h*.85,h*.8,'#d8d0bc')}),transparent:true}),0,-1.2,.08,0,sh)}
    const hg=new THREE.Mesh(new THREE.TorusGeometry(.18,.025,4,8,Math.PI),woodM);hg.position.y=-.1;sh.add(hg);
    sh.position.set(rx,4.6,z);sh.rotation.y=Math.PI/2+rnd(-.12,.12);room.add(sh)});
  // shelf unit
  const sx0=-5.35,sz=.15;
  box(1.3,3.2,.12,woodM,sx0,0,sz-1.5);box(1.3,3.2,.12,woodM,sx0,0,sz+1.5);
  for(const y of[0,.9,1.8,2.7])box(1.3,.1,3.1,woodM,sx0,y,sz);
  for(let k=0;k<4;k++){const cp=new THREE.Mesh(new THREE.SphereGeometry(.32,10,6,0,Math.PI*2,0,Math.PI/2),M([0x1a1a1a,0xb8402c,0x26282e,0xd4ac0d][k]));cp.position.set(sx0+.1,2.8,sz-1.1+k*.72);room.add(cp);
    const brim=box(.5,.04,.5,cp.material,sx0+.45,2.8,sz-1.1+k*.72)}
  [[RED],[GOLD],[0xcfcfcf],[BLUE],[0xb0b0b0],[RED]].forEach(([c],k)=>cyl(.12,.12,.55,10,M(c,{shininess:70}),sx0+.15,1.9,sz-1.2+k*.48));
  for(let k=0;k<3;k++)for(let j=0;j<3;j++)box(.9,.15,.85,M([0x2a2a2a,0x3a3a40,0x4a4a46][k],{shininess:2}),sx0,1+j*.16,sz-1+k*1);
  for(let k=0;k<2;k++){const bxm=box(1.1,.7,1.3,M(0x5a3a22),sx0,.1,sz-.75+k*1.5);plane(.9,.3,new THREE.MeshBasicMaterial({map:tex(128,40,(g,w,h)=>{g.fillStyle='#5a3a22';g.fillRect(0,0,w,h);hl(g,sg('crate_label',0,'BASEBORN IND.'),w/2,h*.75,h*.6,'#1a0f08')})}),sx0+.56,.45,sz-.75+k*1.5,Math.PI/2)}

  // dresser
  const dx=-.9,dz=-5.45;
  box(2.4,2.2,1,woodM,dx,0,dz);
  for(let i=0;i<3;i++){box(2.2,.58,.05,M(0x4a2e1a),dx,.2+i*.68,dz+.51);for(const k of[-.55,.55]){const kn=new THREE.Mesh(new THREE.SphereGeometry(.06,6,4),M(0xb08a3a,{shininess:90}));kn.position.set(dx+k,.5+i*.68,dz+.57);room.add(kn)}}
  box(2.55,.1,1.1,woodM,dx,2.2,dz);
  const plant=(x,z,s=1)=>{cyl(.28*s,.2*s,.45*s,8,M(0xa0522d),x,2.3,z);for(let i=0;i<10;i++){const lf=new THREE.Mesh(new THREE.SphereGeometry(.22*s,6,4),M([0x3d6b2e,0x4f7d34][i%2]));lf.scale.set(1,.4,1.8);lf.position.set(x+rnd(-.25,.25)*s,2.3+.6*s+rnd(0,.5)*s,z+rnd(-.25,.25)*s);lf.rotation.set(rnd(-1,1),rnd(0,3),rnd(-1,1));room.add(lf)}};
  plant(dx-.75,dz-.05,1);plant(dx-.2,dz-.15,.75);
  const clk=new THREE.Mesh(new THREE.CylinderGeometry(.26,.26,.14,14),M(0xb08a3a,{shininess:90}));clk.rotation.x=Math.PI/2;clk.position.set(dx+.4,2.6,dz+.1);room.add(clk);
  plane(.42,.42,new THREE.MeshBasicMaterial({map:tex(64,64,(g)=>{g.fillStyle='#efe6d4';g.beginPath();g.arc(32,32,30,0,7);g.fill();g.strokeStyle='#111';g.lineWidth=3;g.beginPath();g.moveTo(32,32);g.lineTo(32,12);g.moveTo(32,32);g.lineTo(46,38);g.stroke()}),transparent:true}),dx+.4,2.6,dz+.18);
  for(let k=0;k<4;k++)box(.7,.06,.5,M([0x7a2a20,0x222,0xd4ac0d,0x2a3a5a][k]),dx+.75,2.3+k*.065,dz+.1).rotation.y=k*.2;
  // desk with lamp
  const kx=3.4,kz=-5.25;
  box(2.6,.12,1.1,woodM,kx,1.55,kz);for(const [a,b] of[[-1.2,-.45],[1.2,-.45],[-1.2,.45],[1.2,.45]])box(.1,1.55,.1,woodM,kx+a,0,kz+b);
  box(.8,.4,1,woodM,kx+.85,1.15,kz);
  cyl(.2,.24,.08,10,M(0xb08a3a,{shininess:90}),kx-.8,1.67,kz-.1);
  const arm=box(.05,.8,.05,M(0xb08a3a,{shininess:90}),kx-.8,1.72,kz-.1);arm.rotation.z=.35;
  const shade=new THREE.Mesh(new THREE.ConeGeometry(.28,.36,12,1,true),M(0xb08a3a,{shininess:90,side:THREE.DoubleSide}));shade.position.set(kx-.55,2.5,kz);shade.rotation.z=-.7;room.add(shade);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),B(0xfff0c8));bulb.position.set(kx-.5,2.42,kz);room.add(bulb);
  RL.lamp=new THREE.PointLight(0xffc270,.9,6,2);RL.lamp.position.set(kx-.3,2.2,kz+.2);room.add(RL.lamp);
  for(let k=0;k<8;k++){const cd=plane(.32,.44,new THREE.MeshPhongMaterial({map:tex(32,44,(g,w,h)=>{g.fillStyle=['#c8202b','#efe6d4','#d4ac0d','#2f63c9'][k%4];g.fillRect(0,0,w,h);g.fillStyle='#111';g.fillRect(4,4,w-8,h*.5)}),shininess:3}),kx-.2+rnd(-.7,.9),1.62,kz+rnd(-.35,.35));cd.rotation.set(-Math.PI/2,0,rnd(-1,1))}
  const pad=plane(.7,.5,M(0xefe6d4),kx+.6,1.63,kz+.25);pad.rotation.set(-Math.PI/2,0,.3);
  cyl(.1,.1,.35,8,M(0x222),kx+1,1.61,kz-.3);for(let k=0;k<4;k++){const pc=box(.03,.5,.03,M([RED,GOLD,BLUE,0xefe6d4][k]),kx+1+rnd(-.05,.05),1.75,kz-.3);pc.rotation.z=rnd(-.3,.3)}
  // folding chair
  const ch=new THREE.Group();ch.position.set(kx+.2,0,kz+1.3);ch.rotation.y=.3;room.add(ch);
  box(.9,.08,.85,M(0x2a2a2a,{shininess:40}),0,1,0,ch);box(.9,.9,.08,M(0x2a2a2a,{shininess:40}),0,1.15,.42,ch);
  for(const a of[-.4,.4])for(const b of[-.38,.38]){const l=box(.05,1.02,.05,pipe,a,0,b,ch);l.rotation.x=b>0?-.1:.1}

  // bed
  const bx=4.7,bz0=-3.7,bz1=1.5,bzc=(bz0+bz1)/2,bl=bz1-bz0;
  box(2.5,.7,bl,woodM,bx,.2,bzc);
  for(let k=0;k<2;k++){box(.05,.45,1.6,M(0x2a1a10),bx-1.26,.32,bzc-1+k*2.1)}
  for(const [px,pz] of[[bx-1.2,bz0],[bx+1.2,bz0],[bx-1.2,bz1],[bx+1.2,bz1]])box(.2,1.1,.2,woodM,px,0,pz);
  box(2.5,1.5,.15,woodM,bx,.6,bz0);
  box(2.35,.45,bl-.2,M(0x6a6560,{shininess:2}),bx,.9,bzc);
  const sheet=new THREE.Mesh(new THREE.PlaneGeometry(2.6,4.1,10,10),M(0x5c5853,{shininess:3,side:THREE.DoubleSide}));
  {const p=sheet.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.random()*.08);sheet.geometry.computeVertexNormals()}
  sheet.rotation.x=-Math.PI/2;sheet.position.set(bx-.05,1.38,bzc+.4);room.add(sheet);
  const pil=box(1.7,.35,.8,M(0x7a756c,{shininess:2}),bx,1.35,bz0+.6);pil.rotation.x=-.12;

  // record table (stack of vinyl) with papers and cup
  const tx=.4,tz=2.3;
  for(let k=0;k<12;k++){const d=cyl(1.3,1.3,.11,24,M(k%3===2?0x1c1410:0x0c0b0a,{shininess:70,specular:0x333333}),tx+rnd(-.05,.05),k*.115,tz+rnd(-.05,.05));}
  const news=(title,sub)=>new THREE.MeshPhongMaterial({map:tex(256,320,(g,w,h)=>{paper(g,w,h,'#e1dccd');g.fillStyle='#111';g.font='13px serif';g.textAlign='center';g.fillText(sub,w/2,22);g.fillRect(14,28,w-28,2);
    const ws=title.split('|');ws.forEach((t,i)=>hl(g,t,w/2,78+i*46,44));g.fillStyle='#666';g.fillRect(16,ws.length*46+60,w*.45,90);lines(g,w*.55,ws.length*46+62,w*.38,8,11);lines(g,16,ws.length*46+162,w-32,8,11)}),shininess:3});
  const n1=plane(1,1.25,news('BASEBORN','BASEBORN DAILY'),tx-.35,1.4,tz+.25);n1.rotation.set(-Math.PI/2,0,.2);
  const n2=plane(1,1.25,news('CREATE OR DIE','BASEBORN GAZETTE'),tx+.35,1.41,tz-.3);n2.rotation.set(-Math.PI/2,0,-.4);
  for(let k=0;k<3;k++){const st=plane(.28,.28,new THREE.MeshBasicMaterial({map:tex(48,48,(g)=>{g.fillStyle='#1a1a1a';g.fillRect(0,0,48,48);skull(g,24,28,9,'#e9dfc8','#1a1a1a')})}),tx+rnd(-.9,.9),1.42,tz+rnd(-.9,.9));st.rotation.set(-Math.PI/2,0,rnd(0,3))}
  cyl(.15,.12,.42,12,M(0xefe6d4),tx+.75,1.39,tz+.5);
  // record crate with sleeves and a big plant
  const cx=-4.5,cz=4.5;
  const crateT=tex(128,128,(g,w,h)=>{g.fillStyle='#1a1008';g.fillRect(0,0,w,h);g.fillStyle='#4a2e18';for(let y=0;y<h;y+=22)g.fillRect(0,y,w,15)});
  box(1.8,1.2,1.6,new THREE.MeshPhongMaterial({map:crateT,shininess:10}),cx,0,cz);
  for(let k=0;k<6;k++){const sl=plane(1.4,1.4,new THREE.MeshPhongMaterial({map:tex(128,128,(g,w,h)=>{g.fillStyle=k%2?'#1a1a1a':'#d9ceb4';g.fillRect(0,0,w,h);hl(g,'BASEBORN',w/2,h*.22,h*.15,k%2?'#e9dfc8':'#111');hl(g,'INDUSTRIES',w/2,h*.37,h*.12,k%2?'#e9dfc8':'#111');skull(g,w/2,h*.68,w*.17,k%2?'#e9dfc8':'#111',k%2?'#1a1a1a':'#d9ceb4')}),shininess:4}),cx,1.25,cz-.55+k*.2);sl.rotation.x=-.35+k*.05}
  for(let i=0;i<16;i++){const lf=new THREE.Mesh(new THREE.SphereGeometry(.4,6,4),M([0x2f5a26,0x3d6b2e][i%2]));lf.scale.set(1,.3,2.2);lf.position.set(cx-.9+rnd(-.6,.6),1.3+rnd(0,1.6),cz-1.2+rnd(-.6,.6));lf.rotation.set(rnd(-1,1),rnd(0,3),rnd(-.8,.8));room.add(lf)}
  // arcade
  const ax=4.9,az=4.6,ar=new THREE.Group();ar.position.set(ax,0,az);ar.rotation.y=-.45;room.add(ar);
  const cab=M(0x1d1a18,{shininess:18});
  box(1.7,4.4,1.5,cab,0,0,-.2,ar);
  const marq=tex(256,64,(g,w,h)=>{g.fillStyle='#1a0e06';g.fillRect(0,0,w,h);g.shadowColor='#ffb33c';g.shadowBlur=14;hl(g,sg('arcade_marquee',0,'BASEBORN'),w/2,h*.8,h*.72,'#ffc04a')});
  plane(1.5,.5,new THREE.MeshBasicMaterial({map:marq}),0,4.05,.56,0,ar);
  RL.game=tex(160,128,()=>{});
  const scr=plane(1.3,1.05,new THREE.MeshBasicMaterial({map:RL.game}),0,2.95,.52,0,ar);scr.rotation.x=-.12;
  const cp=box(1.6,.25,.8,cab,0,1.9,.65,ar);cp.rotation.x=.25;
  [[-.45,RED],[-.15,BLUE],[.15,GOLD],[.45,RED],[-.3,BLUE],[.3,GOLD]].forEach(([x,c],i)=>cyl(.06,.06,.06,8,B(c),x,2.12,.55+(i>3?.2:0),ar));
  cyl(.03,.03,.25,5,M(0x111),-.55,2.1,.85,ar);const knob=new THREE.Mesh(new THREE.SphereGeometry(.08,6,4),M(RED));knob.position.set(-.55,2.37,.85);ar.add(knob);
  RL.arcLight=new THREE.PointLight(0x8a6cff,.8,7,2);RL.arcLight.position.set(ax-.6,3,az+1.4);room.add(RL.arcLight);
  RL.marqLight=new THREE.PointLight(0xffa83c,.6,5,2);RL.marqLight.position.set(ax-.4,4.3,az+1);room.add(RL.marqLight);
  // CRT on a small cabinet
  const tvx=2.7,tvz=4.6,tv=new THREE.Group();tv.position.set(tvx,0,tvz);tv.rotation.y=-.2;room.add(tv);
  box(1.6,.9,1.3,M(0x1f1b18),0,0,0,tv);box(1.5,1.25,1.3,M(0x2a2622,{shininess:20}),0,.9,0,tv);
  RL.noise=tex(80,60,()=>{});
  plane(1.05,.85,new THREE.MeshBasicMaterial({map:RL.noise}),-.12,1.52,.66,0,tv);
  for(const y of[1.25,1.6])cyl(.06,.06,.06,8,M(0x777),.55,y,.66,tv);
  RL.tvLight=new THREE.PointLight(0xbfd0ff,.5,5,2);RL.tvLight.position.set(tvx-.3,1.8,tvz+1.2);room.add(RL.tvLight);
  // the brothers
  RL.poach=foundling(RED,'poach',null);applyPose(RL.poach,'stand');
  RL.poach.arms[0].root.rotation.set(-.35,0,-1.05);RL.poach.arms[0].mid.rotation.x=-.25;     // hand on the rack
  RL.poach.g.position.set(-3.6,0,-4.6);RL.poach.g.rotation.y=.15;room.add(RL.poach.g);
  RL.cypher=foundling(GOLD,'cypher','crawl');RL.cypher.g.position.set(-.9,0,.2);RL.cypher.g.rotation.y=-.7;room.add(RL.cypher.g);
  RL.neo=foundling(BLUE,'neo','lie');RL.neo.g.position.set(bx-.1,1.5,bz1-.6);RL.neo.g.rotation.z=.12;room.add(RL.neo.g);
  room.traverse(o=>{if(o.isMesh&&!o.material.isMeshBasicMaterial){o.castShadow=true;o.receiveShadow=true}});
  floor.castShadow=false;
  // contact shadows
  blob(room,-3.6,0,-4.6,1.9,1.9);blob(room,-.9,0,.2,2.6,3);blob(room,.4,0,2.3,3.6,3.6);blob(room,-4.5,0,4.5,2.6,2.4);
  blob(room,2.7,0,4.6,2.4,2);blob(room,4.9,0,4.6,2.6,2.4);blob(room,-.9,0,-5.3,3.2,1.6);blob(room,4.7,0,-1.1,3,6);blob(room,3.6,0,-4.1,1.6,1.6,.6);
  aoStrip(room,12,1.4,0,-5.3,0);aoStrip(room,12,1.4,5.3,0,-Math.PI/2);
  // light beams through the blinds
  RL.beamMat=new THREE.MeshBasicMaterial({map:beamTex,color:0xffb060,transparent:true,opacity:.13,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const sd=new THREE.Vector3().subVectors(RL.sun.target.position,RL.sun.position).normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),sd);
  const beam=(x,y,w,L)=>{const g=new THREE.Group();g.position.set(x,y,-5.95);g.quaternion.copy(q);
    for(const a of[0,Math.PI/2]){const geo=new THREE.PlaneGeometry(w,L);geo.translate(0,-L/2,0);const m=new THREE.Mesh(geo,RL.beamMat);m.rotation.y=a;g.add(m)}room.add(g)};
  for(let i=0;i<7;i++)beam(-5.1+i*.5,rnd(2.4,5.2),.55,13);for(let i=0;i<3;i++)beam(2.9+i*.5,rnd(3,4.8),.45,10);
  // dust floating in the light
  {const N=420,pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=rnd(-5.5,4);pos[i*3+1]=rnd(.2,6.5);pos[i*3+2]=rnd(-5.8,2.5)}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
   RL.dustMat=new THREE.PointsMaterial({color:0xffd8a0,size:.045,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false});RL.dust=new THREE.Points(g,RL.dustMat);room.add(RL.dust)}
}
function drawGame(t){const {g,c}=RL.game.userData,w=c.width,h=c.height;
  g.fillStyle='#2a0a1a';g.fillRect(0,0,w,h);g.fillStyle='#5a1a2a';for(let i=0;i<6;i++)g.fillRect(((i*37-t*20)%w+w)%w,20+i*6,24,40-i*4);
  g.fillStyle='#3a2a6a';g.fillRect(0,h-26,w,26);g.fillStyle='#ffb33c';for(let x=0;x<w;x+=8)g.fillRect(x,h-26,4,2);
  const fig=(x,col)=>{g.fillStyle=col;g.fillRect(x,h-50,8,8);g.fillRect(x+1,h-42,6,10);g.fillRect(x,h-32,3,6);g.fillRect(x+5,h-32,3,6)};
  fig(30+Math.sin(t*3)*6,'#c8202b');fig(70,'#d4ac0d');fig(110+Math.cos(t*2.6)*8,'#2f63c9');
  g.fillStyle='#fff';g.font='9px monospace';g.fillText('1UP 2100',6,12);g.fillText('HIGH SCORE 1990',60,12);RL.game.needsUpdate=true}
function drawNoise(){const {g,c}=RL.noise.userData,d=g.createImageData(c.width,c.height);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0);RL.noise.needsUpdate=true}

/* ============================================================
   SCENE B: STARSUS CO. (coastal street)
   ============================================================ */
const city=new THREE.Scene();S=city;
const fog=new THREE.Fog(0x9cc4dc,120,320);city.fog=fog;city.background=new THREE.Color(0x9cc4dc);
const CL={neon:[],wet:[]};
CL.hemi=new THREE.HemisphereLight(0xcfe6ff,0x4a3a22,.85);city.add(CL.hemi);
CL.sun=new THREE.DirectionalLight(0xffd29a,1.35);CL.sun.position.set(45,60,40);CL.sun.castShadow=true;
Object.assign(CL.sun.shadow.camera,{left:-70,right:70,top:70,bottom:-70,near:1,far:260});CL.sun.shadow.mapSize.set(2048,2048);CL.sun.shadow.bias=-.0008;CL.sun.shadow.radius=2.5;city.add(CL.sun);
const neonLight=(c,x,y,z,dist=18)=>{const l=new THREE.PointLight(c,.3,dist,2);l.position.set(x,y,z);city.add(l);CL.neon.push(l);return l};
// textures
const cobble=tex(256,256,(g,w,h)=>{g.fillStyle='#231d18';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=14)for(let x=(y/14%2)*7-7;x<w;x+=14){const v=80+Math.random()*55;g.fillStyle=`rgb(${v|0},${v*.86|0},${v*.7|0})`;g.beginPath();g.ellipse(x+7,y+7,6,5.6,Math.random(),0,7);g.fill()}});
const stucco=tex(256,256,(g,w,h)=>{g.fillStyle='#b5a383';g.fillRect(0,0,w,h);for(let i=0;i<320;i++){g.fillStyle=`rgba(${50+Math.random()*40|0},${45+Math.random()*30|0},30,${Math.random()*.2})`;g.beginPath();g.arc(Math.random()*w,Math.random()*h,Math.random()*16,0,7);g.fill()}
  for(let k=0;k<5;k++){const x=Math.random()*w,y=Math.random()*h;for(let r=0;r<4;r++)for(let c=0;c<3;c++){g.fillStyle='#7a3a28';g.fillRect(x+c*12+(r%2)*6,y+r*7,11,6)}}
  for(let i=0;i<10;i++){g.fillStyle='rgba(40,60,20,.25)';g.fillRect(Math.random()*w,h-20-Math.random()*30,20+Math.random()*30,40)}},[1,1]);
const cityBrick=tex(256,256,(g,w,h)=>{g.fillStyle='#1c1210';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=12)for(let x=-(y/12%2)*12;x<w;x+=24){const v=40+Math.random()*28;g.fillStyle=`rgb(${v+24|0},${v*.6|0},${v*.48|0})`;g.fillRect(x+1,y+1,22,10)}},[3,4]);
const tile=tex(128,128,(g,w,h)=>{g.fillStyle='#5a2216';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=10)for(let x=(y/10%2)*8;x<w;x+=16){const v=130+Math.random()*60;g.fillStyle=`rgb(${v|0},${v*.4|0},${v*.25|0})`;g.beginPath();g.arc(x+8,y+10,8,Math.PI,0);g.fill()}},[4,4]);
const stuccoM=c=>new THREE.MeshPhongMaterial({map:stucco,color:c,shininess:3});
const brickM=c=>new THREE.MeshPhongMaterial({map:cityBrick,color:c,shininess:3});
// ground, water, skyline
{const gnd=new THREE.Mesh(new THREE.PlaneGeometry(400,240),M(0x3e4a2c));gnd.rotation.x=-Math.PI/2;gnd.position.set(0,-.05,60);gnd.receiveShadow=true;city.add(gnd);
 CL.water=new THREE.MeshPhongMaterial({color:0x2f7ea0,shininess:110,specular:0xaaddff,flatShading:false});
 const wat=new THREE.Mesh(new THREE.PlaneGeometry(500,260,40,20),CL.water);wat.rotation.x=-Math.PI/2;wat.position.set(0,-.6,-190);city.add(wat);CL.wat=wat;
 box(260,1.4,2,stuccoM(0x8a8070),0,-.6,-60);
 const winT=tex(64,128,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);for(let y=4;y<h;y+=8)for(let x=4;x<w;x+=8)if(Math.random()<.55){g.fillStyle=Math.random()<.8?'#ffd28a':'#9fc8ff';g.fillRect(x,y,4,5)}},[2,4]);
 CL.sky=new THREE.MeshPhongMaterial({color:0x8a9aa8,emissive:0xffffff,emissiveMap:winT,emissiveIntensity:0,shininess:20});
 for(let i=0;i<46;i++){const x=-150+i*6.6+rnd(-2,2),h=18+Math.random()*58*(1-Math.abs(x)/220),w=5+Math.random()*6;box(w,h,w,CL.sky,x,-.5,-150-Math.random()*40)}
 const tw=box(10,92,10,CL.sky,26,-.5,-165);
 const top=plane(16,5,new THREE.MeshBasicMaterial({map:neonTex([{t:sg('skyline_sign',0,'BASEBORN IND.'),c:'#ff2a1c',s:110,y:128}],512,256,'#100606')}),26,96,-159.9);
 for(let i=0;i<14;i++){const x=-90+i*13,hh=6+Math.random()*10;box(9,hh,7,stuccoM([0xd8c8a8,0xc89a78,0xe0d0b8][i%3]),x,-.5,-75-Math.random()*8)}
}
// the street: a curving cobblestone ribbon
const curve=new THREE.CatmullRomCurve3([V(-4,0,64),V(0,0,46),V(4,0,30),V(8,0,16),V(6,0,2),V(-1,0,-12),V(0,0,-28),V(5,0,-44),V(2,0,-58)]);
function ribbon(width,offset,y,mat,n=220,vs=.12){const pos=[],uv=[],idx=[],L=curve.getLength();
  for(let i=0;i<=n;i++){const t=i/n,p=curve.getPointAt(t),tg=curve.getTangentAt(t),nx=-tg.z,nz=tg.x,ln=Math.hypot(nx,nz)||1;
    for(const s of[-1,1]){const o=offset+s*width/2;pos.push(p.x+nx/ln*o,y,p.z+nz/ln*o);uv.push((s+1)/2*width*vs,t*L*vs)}
    if(i<n){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);m.receiveShadow=true;city.add(m);return m}
const cobbleT=cobble.clone();cobbleT.needsUpdate=true;cobbleT.wrapS=cobbleT.wrapT=THREE.RepeatWrapping;
CL.road=new THREE.MeshPhongMaterial({map:cobbleT,shininess:8,specular:0x111111,side:THREE.DoubleSide});CL.wet.push(CL.road);
ribbon(9,0,.03,CL.road);
CL.walk=new THREE.MeshPhongMaterial({map:cobbleT,color:0xb8aa96,shininess:6,specular:0x111111,side:THREE.DoubleSide});CL.wet.push(CL.walk);
ribbon(3.4,-6.2,.22,CL.walk);ribbon(3.4,6.2,.22,CL.walk);
ribbon(.35,-4.6,.26,M(0x6a645a,{side:THREE.DoubleSide}));ribbon(.35,4.6,.26,M(0x6a645a,{side:THREE.DoubleSide}));
ribbon(.18,-3.9,.06,B(0xd4ac0d));ribbon(.18,3.9,.06,B(0xd4ac0d));
function decal(txt,t,size,col='rgba(230,220,200,.75)',rot=0,font='Anton, Impact'){const p=curve.getPointAt(t),tg=curve.getTangentAt(t);
  const tx=tex(1024,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.font=`${h*.62}px ${font}`;g.textAlign='center';g.textBaseline='middle';g.fillStyle=col;g.fillText(txt,w/2,h/2)});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size/4),new THREE.MeshPhongMaterial({map:tx,transparent:true,depthWrite:false,shininess:30}));
  m.rotation.order='YXZ';m.rotation.set(-Math.PI/2,Math.atan2(tg.x,tg.z)+Math.PI+rot,0);m.position.set(p.x,.08,p.z);city.add(m);return m}
decal(sg('road_url',0,'IMBASEBORN.COM'),.13,14,'rgba(230,220,200,.7)',1.2);
decal(sg('road_tag',0,'LITO'),.3,5,'rgba(212,172,13,.85)',.1);
// building helper (facade faces local +z)
function building({x,z,ry=0,w=10,h=8,d=8,mat,roof='tile'}){
  const gp=new THREE.Group();gp.position.set(x,0,z);gp.rotation.y=ry;city.add(gp);
  box(w,h,d,mat,0,0,0,gp);
  if(roof==='tile'){const r=new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w,d)/2*1.08,3.2,4),new THREE.MeshPhongMaterial({map:tile,shininess:4}));r.rotation.y=Math.PI/4;r.scale.set(w/Math.hypot(w,d)*1.5,1,d/Math.hypot(w,d)*1.5);r.position.y=h+1.6;gp.add(r)}
  else{box(w+.4,.5,d+.4,mat,0,h,0,gp)}
  return gp}
const winMat=new THREE.MeshPhongMaterial({color:0x2a3038,emissive:0xffb85a,emissiveIntensity:0,shininess:80});
function win(gp,x,y,z,w=1.3,h=1.6){box(w+.25,h+.25,.15,M(0x3a2414),x,y-.12,z,gp);plane(w,h,winMat,x,y+h/2,z+.09,0,gp)}
function lampPost(x,z,ry=0,streetSign=false){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;city.add(g);
  const iron=M(0x2a2a28,{shininess:60});cyl(.22,.3,.6,8,iron,0,0,0,g);cyl(.12,.14,8,8,iron,0,.6,0,g);
  const arc=new THREE.Mesh(new THREE.TorusGeometry(1,.08,6,12,Math.PI/2),iron);arc.position.set(-1,8.6,0);g.add(arc);
  const head=new THREE.Mesh(new THREE.ConeGeometry(.45,.5,10),iron);head.position.set(-1.95,8.4,0);g.add(head);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),new THREE.MeshBasicMaterial({color:0xffe2a8}));bulb.position.set(-1.95,8.05,0);g.add(bulb);
  if(!CL.coneMat)CL.coneMat=new THREE.MeshBasicMaterial({map:beamTex,color:0xffcf88,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  if(!CL.coneGeo){CL.coneGeo=new THREE.ConeGeometry(2.6,7.9,20,1,true);CL.coneGeo.translate(0,-3.95,0)}
  {const cone=new THREE.Mesh(CL.coneGeo,CL.coneMat);cone.position.set(-1.95,8.25,0);g.add(cone);const pool=blob(g,-1.95,0,0,5,5,.0);pool.material=CL.poolMat||(CL.poolMat=new THREE.MeshBasicMaterial({map:blobTex,color:0xffc070,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}))}
  if(streetSign)plane(3,.8,new THREE.MeshBasicMaterial({map:tex(256,68,(q,w,h)=>{q.fillStyle='#1d5a36';q.fillRect(0,0,w,h);q.strokeStyle='#e9e0c8';q.lineWidth=3;q.strokeRect(4,4,w-8,h-8);hl(q,sg('street_sign',0,'STARSUS CO.'),w/2,h*.74,h*.55,'#e9e0c8')}),side:THREE.DoubleSide}),-.2,6.4,0,Math.PI/2,g);
  const l=new THREE.PointLight(0xffc878,.0,20,2);g.localToWorld(l.position.set(-1.95,7.7,0));city.add(l);CL.lamps=(CL.lamps||[]).concat(l)}
function palm(x,z,h=11){const g=new THREE.Group();g.position.set(x,0,z);city.add(g);let p=g,lean=rnd(-.08,.08);
  const tr=M(0x6a5038);for(let i=0;i<8;i++){const s=new THREE.Mesh(new THREE.CylinderGeometry(.32-i*.02,.38-i*.02,h/8,7),tr);s.position.y=h/16;const j=new THREE.Group();j.position.y=h/8;j.rotation.z=lean;j.rotation.x=lean*.6;const seg=new THREE.Group();seg.add(s);seg.add(j);p.add(seg);p=j}
  const fm=new THREE.MeshPhongMaterial({color:0x3f7a2c,side:THREE.DoubleSide,shininess:8});
  for(let i=0;i<9;i++){const fg=new THREE.PlaneGeometry(1.1,5.2,1,6);const pa=fg.attributes.position;for(let k=0;k<pa.count;k++){const y=pa.getY(k)+2.6;pa.setY(k,y);pa.setZ(k,-y*y*.06);pa.setX(k,pa.getX(k)*(1-y/6))}fg.computeVertexNormals();
    const f=new THREE.Mesh(fg,fm);f.rotation.set(-1.05,i/9*Math.PI*2,0,'YXZ');p.add(f)}}
function bush(x,z,s=1){for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.IcosahedronGeometry(1.2*s,0),M([0x3d6b2e,0x2f5a26,0x4f7d34][i]));b.position.set(x+rnd(-1,1)*s,.9*s,z+rnd(-1,1)*s);b.scale.y=.8;city.add(b)}}
function car(col,x,z,ry){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;city.add(g);
  const paint=new THREE.MeshPhongMaterial({color:col,shininess:70,specular:0x555555});
  box(2.1,.9,4.6,paint,0,.45,0,g);const cab=box(1.9,.8,2.4,paint,0,1.35,-.15,g);
  const gl=new THREE.MeshPhongMaterial({color:0x0e1418,shininess:120,specular:0x99aabb});
  plane(1.7,.7,gl,0,1.75,1.07,0,g).rotation.x=-.5;plane(1.7,.7,gl,0,1.75,-1.37,Math.PI,g).rotation.x=-.5;
  for(const [a,b] of[[-1,1.4],[1,1.4],[-1,-1.4],[1,-1.4]]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.3,12),M(0x111));wh.rotation.z=Math.PI/2;wh.position.set(a*1.02,.42,b);g.add(wh)}
  for(const a of[-.7,.7])box(.4,.18,.05,B(0xfff2c0),a,.75,2.31,g);for(const a of[-.7,.7])box(.4,.18,.05,B(0xaa1010),a,.75,-2.31,g);blob(g,0,0,0,3,5.6);return g}
// ---------- Baseborn Supply Co.
{const gp=building({x:-12,z:24,ry:.9,w:12,h:8,d:8,mat:stuccoM(0xd0bea0)});
 const sgn0=plane(7,2.9,new THREE.MeshBasicMaterial({map:neonTex([{t:sg('supply_sign',0,'BASEBORN'),c:'#ff2a1c',s:120,y:92},{t:sg('supply_sign',1,'SUPPLY CO.'),c:'#ffc23a',s:70,y:196}],512,256,'#1a1410')}),0,5.3,4.08,0,gp);
 plane(4,.7,new THREE.MeshBasicMaterial({map:tex(256,44,(g,w,h)=>{g.fillStyle='#2a2018';g.fillRect(0,0,w,h);hl(g,sg('supply_url',0,'IMBASEBORN.COM'),w/2,h*.75,h*.6,'#e9dfc8')})}),0,3.45,4.08,0,gp);
 win(gp,-3.4,.6,4.02,1.8,2);box(1.6,3,.2,M(0x5a3a22),.2,0,4.0,gp);win(gp,3.4,.8,4.02,1.6,1.8);win(gp,-2.5,5.2+1.2,-4.1);
 plane(.9,1.3,new THREE.MeshPhongMaterial({map:tex(64,96,(g,w,h)=>{g.fillStyle='#141414';g.fillRect(0,0,w,h);hl(g,'LITO',w/2,h*.4,h*.3,'#d4ac0d');skull(g,w/2,h*.72,10,'#c8202b','#141414')})}),-5.2,2.2,4.03,0,gp);
 // rack + caps table + crates out front
 const rk=new THREE.Group();rk.position.set(-3.4,0,6.2);rk.rotation.y=Math.PI/2;gp.add(rk);const iron=M(0x2a2a28,{shininess:60});
 for(const a of[-1.6,1.6])box(.08,2.8,.08,iron,a,0,0,rk);const rb=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,3.3,6),iron);rb.rotation.z=Math.PI/2;rb.position.y=2.75;rk.add(rb);
 [0xc8202b,0x2a2a40,0xe0d8c0,0xd4ac0d,0x3a5a8a,0x7a7a7a,0xb0502a,0x2f63c9].forEach((c,i)=>box(.14,1.4,.85,M(c,{shininess:3}),-1.4+i*.4,1.25,0,rk));
 const tb=new THREE.Group();tb.position.set(1.8,0,6);tb.rotation.y=.15;gp.add(tb);box(3,.15,1.5,M(0x5a3a22),0,1.25,0,tb);for(const [a,b] of[[-1.4,-.65],[1.4,-.65],[-1.4,.65],[1.4,.65]])box(.1,1.25,.1,M(0x3a2414),a,0,b,tb);
 for(let k=0;k<10;k++){const cp=new THREE.Mesh(new THREE.SphereGeometry(.26,10,6,0,Math.PI*2,0,Math.PI/2),M([RED,0x2a2a40,0xe0d8c0,BLUE,0x222][k%5]));cp.position.set(-1.1+(k%5)*.55,1.4,-.35+Math.floor(k/5)*.7);tb.add(cp)}
 const crateTx=tex(128,128,(g,w,h)=>{g.fillStyle='#8a6038';g.fillRect(0,0,w,h);g.strokeStyle='#5a3a1e';g.lineWidth=6;g.strokeRect(3,3,w-6,h-6);hl(g,'BASEBORN',w/2,h*.48,h*.2,'#2a1a0a');hl(g,'IND.',w/2,h*.72,h*.2,'#2a1a0a')});
 const crM=new THREE.MeshPhongMaterial({map:crateTx,shininess:4});[[-4.2,6,0],[-3.1,6.4,.3],[-3.7,5.9,0,1.05]].forEach(([a,b,r,y])=>{const c=box(1.05,1.05,1.05,crM,a,y||0,b,gp);c.rotation.y=r});
 neonLight(0xff3a2a,-7,6,24,16);
 CL.poachShop=foundling(RED,'poach','leanWall',true);CL.poachShop.g.scale.setScalar(1.05);gp.add(CL.poachShop.g);CL.poachShop.g.position.set(-5.4,0,4.6);CL.poachShop.g.rotation.y=.25;blob(gp,-5.4,0,4.6,1.8,1.8);
}
// ---------- The Foundlings' House
{const gp=building({x:-12.5,z:5,ry:.9,w:10,h:7,d:8,mat:stuccoM(0xc8b090)});win(gp,-2.5,1.2,4.02);win(gp,2.5,1.2,4.02);box(1.5,2.8,.2,M(0x3a2418),0,0,4.0,gp);win(gp,-2.5,4.4,4.02);win(gp,2.5,4.4,4.02)}
// ---------- Starsus Academy + Baseborn Ind. (right side)
{const gp=building({x:21,z:8,ry:-.9,w:12,h:9,d:8,mat:stuccoM(0xb8aa90),roof:'flat'});
 plane(7,2.6,new THREE.MeshBasicMaterial({map:neonTex([{t:sg('academy_sign',0,'STARSUS'),c:'#3a7bff',s:96,y:88},{t:sg('academy_sign',1,'ACADEMY'),c:'#3a7bff',s:82,y:186}],512,256,'#0a0d1a','#3a7bff')}),0,5.6,4.08,0,gp);
 box(1.6,3,.2,M(0x5a3a22),2.6,0,4.0,gp);win(gp,-2.5,1,4.02);
 for(let k=0;k<3;k++)plane(.9,1.3,new THREE.MeshPhongMaterial({map:tex(64,96,(g,w,h)=>{paper(g,w,h,['#d9ceb4','#1f2a4a','#c8202b'][k]);skull(g,w/2,h*.55,12,'#111',['#d9ceb4','#1f2a4a','#c8202b'][k])})}),-4.6+k*1.1,2,4.03,0,gp);
 box(3,.4,1.2,M(0x6a645a),2.6,0,4.6,gp);box(3,.4,.8,M(0x6a645a),2.6,.4,4.4,gp);
 neonLight(0x3a7bff,17,6,11,18);
 const g2=building({x:22,z:-14,ry:-.9,w:12,h:15,d:9,mat:stuccoM(0x9a9080),roof:'flat'});
 plane(7,2.8,new THREE.MeshBasicMaterial({map:neonTex([{t:sg('ind_sign',0,'BASEBORN'),c:'#ffc23a',s:96,y:92},{t:sg('ind_sign',1,'IND.'),c:'#ffc23a',s:96,y:190}],512,256,'#16110a')}),0,12.4,4.58,0,g2);
 for(let r=0;r<3;r++)for(let c=0;c<3;c++)win(g2,-3.5+c*3.5,1.2+r*3.4,4.52);
 neonLight(0xffb43a,17,12,-12,18);
}
// ---------- One Love Records
{const gp=building({x:19,z:-40,ry:-.9,w:11,h:8,d:8,mat:stuccoM(0xa89878)});
 plane(6,2.6,new THREE.MeshBasicMaterial({map:neonTex([{t:sg('records_sign',0,'ONE LOVE'),c:'#ff3a2a',s:96,y:92},{t:sg('records_sign',1,'RECORDS'),c:'#ffc23a',s:64,y:186}],512,256,'#1a120c')}),0,5.6,4.08,0,gp);
 const aw=box(6,.15,1.8,M(0x8a2a20),0,3.6,4.8,gp);aw.rotation.x=.25;box(1.5,3,.2,M(0x2a5a5a),0,0,4.0,gp);win(gp,-3,1,4.02,1.8,2);win(gp,3,1,4.02,1.8,2);
 neonLight(0xff4a2a,15,6,-36,16);
}
// ---------- Rooftop courtyard (on top of a building, left side)
{const gp=building({x:-15,z:-24,ry:.9,w:12,h:7,d:10,mat:stuccoM(0xa09070),roof:'flat'});
 const moss=tex(128,128,(g,w,h)=>{g.fillStyle='#6a6a58';g.fillRect(0,0,w,h);for(let i=0;i<300;i++){g.fillStyle=Math.random()<.6?`rgba(70,120,40,${Math.random()*.5})`:`rgba(30,30,20,${Math.random()*.3})`;g.fillRect(Math.random()*w,Math.random()*h,6,6)}g.strokeStyle='rgba(30,30,25,.6)';for(let k=0;k<6;k++){g.beginPath();g.moveTo(0,k*22);g.lineTo(w,k*22+rnd(-6,6));g.stroke()}},[2,2]);
 const mossM=new THREE.MeshPhongMaterial({map:moss,shininess:2}),top=new THREE.Group();top.position.y=7.5;gp.add(top);
 const fl=plane(11.4,9.4,mossM,0,.02,0,0,top);fl.rotation.x=-Math.PI/2;
 for(let i=0;i<40;i++){const gr=new THREE.Mesh(new THREE.ConeGeometry(.15,.6,3),M(0x5a9a3a));gr.position.set(rnd(-5.4,5.4),.3,rnd(-4.4,4.4));top.add(gr)}
 const wallB=box(11.4,2,.6,brickM(0x8a8a70),0,0,-4.5,top),wallL=box(.6,2,9.4,brickM(0x8a8a70),-5.4,0,0,top);
 const pillar=(x,z)=>{box(1.3,3,1.3,brickM(0x7a7a64),x,0,z,top);box(1.6,.35,1.6,mossM,x,3,z,top)};pillar(-5.4,-4.5);pillar(5.4,-4.5);pillar(5.4,4.4);
 plane(5,1.6,new THREE.MeshBasicMaterial({map:tex(512,160,(g,w,h)=>{g.clearRect(0,0,w,h);g.font='110px Anton, Impact';g.textAlign='center';g.lineWidth=10;g.strokeStyle='#d4ac0d';const rg=sg('rooftop_graffiti',0,'BASEBORN');g.strokeText(rg,w/2,128);g.fillStyle='#c8202b';g.fillText(rg,w/2,128)}),transparent:true}),-2,1.1,-4.18,0,top);
 plane(3,1.6,new THREE.MeshBasicMaterial({map:tex(256,140,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#d4ac0d';g.lineWidth=8;g.beginPath();for(let i=0;i<5;i++){g.moveTo(30+i*45,130);g.bezierCurveTo(10+i*45,40,80+i*45,10,60+i*45,90)}g.stroke()}),transparent:true}),3,1.1,-4.18,0,top);
 const bb=box(1.8,1.1,.7,M(0x8a3a2a,{shininess:30}),-3,0,1,top);bb.rotation.y=.4;
 const tvb=box(1.3,1.1,1.1,M(0x2a8a6a,{shininess:30}),3.8,0,-2.6,top);
 CL.rCy=foundling(GOLD,'cypher','spray',true);CL.rCy.g.position.set(-2.5,0,-2.6);CL.rCy.g.rotation.y=Math.PI;top.add(CL.rCy.g);
 CL.rPo=foundling(RED,'poach','cross',true);CL.rPo.g.position.set(1.5,0,-3);CL.rPo.g.rotation.y=.2;top.add(CL.rPo.g);
 CL.rNe=foundling(BLUE,'neo','sit',true);CL.rNe.g.position.set(4.4,0,3.4);CL.rNe.g.rotation.y=-.6;top.add(CL.rNe.g);blob(top,-2.5,0,-2.6,1.8,1.8);blob(top,1.5,0,-3,1.6,1.6);blob(top,4.4,0,3.4,2,2);
}
// ---------- Back alley: two brick towers, names on the walls
{const ax=-33;
 building({x:ax,z:6,w:11,h:11,d:9,mat:brickM(0x8a7060),roof:'flat'});
 const back=building({x:ax,z:-12,w:11,h:22,d:10,mat:brickM(0x7a6050),roof:'flat'});
 for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(!(r===3&&c===1))win(back,-3.5+c*3.5,1.5+r*4,5.03,1.3,1.8);
 const graff=(txt,col,w,h,x,y,z,ry=0)=>plane(w,h,new THREE.MeshBasicMaterial({map:tex(512,200,(g,W,H)=>{g.clearRect(0,0,W,H);g.font='150px Anton, Impact';g.textAlign='center';g.lineWidth=12;g.strokeStyle='#111';g.strokeText(txt,W/2,160);g.fillStyle=col;g.fillText(txt,W/2,160);g.fillStyle=col;for(let i=0;i<8;i++)g.fillRect(70+Math.random()*370,150,6,20+Math.random()*40)}),transparent:true}),x,y,z,ry);
 graff(sg('alley_graffiti',1,'CYPHER'),'#d4ac0d',9,3.5,ax,13.5,-6.94);
 graff(sg('alley_graffiti',0,'POACH'),'#c8202b',7,2.8,ax+1.5,24.2,-6.6);box(11.4,1,.5,brickM(0x6a5040),ax,22,-7.2);
 graff(sg('alley_graffiti',2,'NEO'),'#3a7bff',6,2.4,ax,7,10.53);
 const sgn=new THREE.Group();sgn.position.set(ax-3,25.5,-14);city.add(sgn);
 plane(12,3.6,new THREE.MeshBasicMaterial({map:neonTex([{t:sg('alley_sign',0,'BASEBORN'),c:'#ff2a1c',s:150,y:128}],512,256,'#0a0a14','#3a7bff')}),0,2,0,0,sgn);
 for(const a of[-5,5])box(.2,2,.2,M(0x333),a,0,-.2,sgn);
 neonLight(0xff2a1c,ax-3,25,-10,26);neonLight(0x3a7bff,ax,8,13,14);
 CL.aPo=foundling(RED,'poach','cross',true);CL.aPo.g.position.set(ax+2,22,-10);CL.aPo.g.scale.setScalar(1.05);city.add(CL.aPo.g);
 CL.aCy=foundling(GOLD,'cypher','climb',true);CL.aCy.g.position.set(ax+1,10.2,-6.75);CL.aCy.g.rotation.y=Math.PI;city.add(CL.aCy.g);
 CL.aNe=foundling(BLUE,'neo','ledge',true);CL.aNe.g.position.set(ax-2,11.2,1.8);CL.aNe.g.rotation.y=Math.PI;city.add(CL.aNe.g);
 box(1,1,1,M(0x6a4a2a),ax+4,0,-1);cyl(.5,.45,1.1,10,M(0x3a3a3a),ax-4,0,-2);
}
// ---------- Grill Comma gas station
{const gp=new THREE.Group();gp.position.set(30,0,32);gp.rotation.y=-.35;city.add(gp);
 const pad=plane(20,16,M(0x2a2a2c,{shininess:20}),0,.04,0,0,gp);pad.rotation.x=-Math.PI/2;CL.wet.push(pad.material);
 box(12.4,.8,3.4,M(0x202022,{shininess:30}),0,5,-.2,gp);
 for(const y of[5.15,5.45])box(12.5,.08,.08,B(0xffc23a),0,y,1.52,gp);for(const z of[-1.2,-.4,.4,1.2])box(12.3,.05,.06,B(0xffc23a),0,5.82,z,gp);
 for(const a of[-6,6])box(.25,5,.25,M(0x777,{shininess:60}),a,0,1.3,gp);
 const pump=(x,z)=>{box(1.8,.3,1,M(0x555),x,0,z,gp);box(1.2,2.4,.7,M(0x8a8a88,{shininess:60}),x,.3,z,gp);plane(.8,.5,B(0x99ffcc),x,2.1,z+.36,0,gp);
   plane(1,.25,new THREE.MeshBasicMaterial({map:tex(128,32,(g,w,h)=>{g.fillStyle='#111';g.fillRect(0,0,w,h);hl(g,sg('gas_pump',0,'PREMIUM UNLEADED'),w/2,h*.75,h*.6,'#ffc23a')})}),x,2.55,z+.36,0,gp);
   cyl(.18,.18,.9,10,M(RED,{shininess:60}),x-1.1,0,z+.2,gp)};
 pump(-3,3.2);pump(2.2,4.6);
 box(12,5,6,brickM(0x6a5a50),0,0,-4.5,gp);box(12.3,.5,6.3,M(0x111),0,5,-4.5,gp);
 const shelves=tex(256,128,(g,w,h)=>{g.fillStyle='#ffdca0';g.fillRect(0,0,w,h);for(let y=10;y<h;y+=28){g.fillStyle='#5a3a20';g.fillRect(0,y+20,w,4);for(let x=4;x<w;x+=10){g.fillStyle=['#c8202b','#2f63c9','#d4ac0d','#3a8a3a','#efe6d4'][Math.floor(Math.random()*5)];g.fillRect(x,y+4+Math.random()*4,8,16)}}});
 CL.shop=new THREE.MeshBasicMaterial({map:shelves});plane(7,3,CL.shop,1.8,2,-1.48,0,gp);
 plane(2.2,.8,new THREE.MeshBasicMaterial({map:neonTex([{t:sg('gas_open',0,'OPEN'),c:'#ffc23a',s:150,y:128}],512,256,'#120d06')}),-3.4,3.6,-1.47,0,gp);
 const top=new THREE.Group();top.position.set(-2,5.3,-4);gp.add(top);box(3,3,.4,M(0x111),0,0,0,top);
 plane(2.8,2.8,new THREE.MeshBasicMaterial({map:neonTex([{t:sg('gas_sign',0,'GRILL'),c:'#ffc23a',s:80,y:70},{t:sg('gas_sign',1,'COMMA'),c:'#ffc23a',s:80,y:150},{t:sg('gas_sign',2,'FOODS · DRINKS · FUEL'),c:'#ffc23a',s:30,y:220,f:'Space Mono, monospace'}],256,256,'#0a0806','#ffc23a')}),0,1.5,.22,0,top);
 const lp=new THREE.Group();lp.position.set(-7.5,0,5);gp.add(lp);cyl(.1,.12,7,8,M(0x2a2a28),0,0,0,lp);
 plane(1.4,2,new THREE.MeshBasicMaterial({map:tex(128,180,(g,w,h)=>{g.fillStyle='#111';g.fillRect(0,0,w,h);g.strokeStyle='#ffc23a';g.lineWidth=4;g.strokeRect(4,4,w-8,h-8);hl(g,sg('gas_lamp_sign',0,'ICE'),w/2,h*.25,h*.17,'#ffc23a');hl(g,sg('gas_lamp_sign',1,'COLDA?'),w/2,h*.45,h*.17,'#ffc23a');hl(g,sg('gas_lamp_sign',2,'SOLD HERE'),w/2,h*.85,h*.12,'#ffc23a')})}),.75,4.4,0,0,lp);
 const sc=car(0xa8acb0,0,0,0);gp.add(sc);sc.position.set(-5.8,0,1.6);sc.rotation.y=.15;
 neonLight(0xffc23a,28,9,30,16);
 CL.gPo=foundling(RED,'poach','lean',true);CL.gPo.g.position.set(-2.1,0,3.3);CL.gPo.g.rotation.y=-.6;gp.add(CL.gPo.g);
 CL.gCy=foundling(GOLD,'cypher','crouchSpray',true);CL.gCy.g.position.set(3.3,0,5.4);CL.gCy.g.rotation.y=-1.6;gp.add(CL.gCy.g);
 CL.gNe=foundling(BLUE,'neo','leanWall',true);CL.gNe.g.position.set(4.6,0,-.9);CL.gNe.g.rotation.y=.2;gp.add(CL.gNe.g);blob(gp,-2.1,0,3.3,1.8,1.8);blob(gp,3.3,0,5.4,2.2,2.2);blob(gp,4.6,0,-.9,1.6,1.6);
}
// street life
lampPost(12.5,22,Math.PI,true);lampPost(-6,38);lampPost(12,-24,Math.PI);lampPost(-6.5,-4);
[[-20,34],[-9,44],[16,30],[-22,14],[15,-36],[-8,-40],[26,-20],[-24,-36],[12,46],[-30,24],[36,8],[-40,-24]].forEach(([x,z])=>palm(x,z,rnd(9,13)));
[[-7,15],[-7.5,-14],[12.5,0],[12,-18],[-6.5,32],[14,40]].forEach(([x,z])=>bush(x,z,.8));
{const g=car(0x2a5a4e,-2.6,40,-.25);g.children[0].material.shininess=40}
CL.walker=foundling(GOLD,'walk','walk');{const p=curve.getPointAt(.24);CL.walker.g.position.set(p.x+1,0,p.z);CL.walker.g.rotation.y=-.2;city.add(CL.walker.g);blob(CL.walker.g,0,0,0,2.4,2.4)}
const movers=[];for(let i=0;i<2;i++){const g=car([0xc8202b,0x2f63c9][i],0,0,0);g.userData={t:i*.5,sp:.018+i*.006,side:i?1.9:-1.9};movers.push(g)}
// rain
{const N=2600,pos=new Float32Array(N*6);for(let i=0;i<N;i++){const x=rnd(-60,60),y=rnd(0,50),z=rnd(-60,60);pos.set([x,y,z,x+.05,y-.9,z],i*6)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 CL.rain=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x9fb0d0,transparent:true,opacity:.45}));CL.rain.visible=false;city.add(CL.rain)}
city.traverse(o=>{if(o.isMesh&&!o.material.isMeshBasicMaterial&&o!==CL.wat){o.castShadow=true;o.receiveShadow=true}});

/* ============================================================
   POST PROCESSING: bloom, tilt shift, color grade, grain, vignette
   ============================================================ */
const GradeShader={uniforms:{tDiffuse:{value:null},time:{value:0},night:{value:0},vig:{value:1}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform sampler2D tDiffuse;uniform float time;uniform float night;uniform float vig;varying vec2 vUv;
    float rnd(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}
    void main(){vec4 c=texture2D(tDiffuse,vUv);vec3 col=c.rgb;
      col=(col-0.5)*1.1+0.5;float l=dot(col,vec3(0.299,0.587,0.114));col=mix(vec3(l),col,1.14);
      col*=mix(vec3(1.05,1.0,0.92),vec3(0.92,0.98,1.08),night);
      float d=distance(vUv,vec2(0.5));col*=mix(1.0,smoothstep(0.9,0.32,d)*0.45+0.55,vig);
      col+=(rnd(vUv*vec2(1731.0,977.0)+fract(time))-0.5)*0.045;
      gl_FragColor=vec4(clamp(col,0.0,1.0),c.a);}`};
let composer,rp,bloom,tiltH,tiltV,grade;
try{
  composer=new THREE.EffectComposer(renderer);rp=new THREE.RenderPass(room,camera);composer.addPass(rp);
  bloom=new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.55,.6,.8);composer.addPass(bloom);
  tiltH=new THREE.ShaderPass(THREE.HorizontalTiltShiftShader);tiltV=new THREE.ShaderPass(THREE.VerticalTiltShiftShader);composer.addPass(tiltH);composer.addPass(tiltV);
  grade=new THREE.ShaderPass(GradeShader);composer.addPass(grade);
  sizeFX=()=>{const pr=renderer.getPixelRatio();composer.setPixelRatio(pr);composer.setSize(innerWidth,innerHeight)};sizeFX();
  document.querySelector('.vig')&&document.querySelector('.vig').remove();
}catch(e){console.warn('Post processing unavailable',e);fxOn=false;composer=null}
function renderFrame(t){const sc=active==='room'?room:city;
  if(fxOn&&composer){rp.scene=sc;const pr=renderer.getPixelRatio(),w=innerWidth*pr,h=innerHeight*pr,amt=active==='room'?1.6:3.4;
    tiltH.uniforms.h.value=amt/w;tiltV.uniforms.v.value=amt/h;tiltH.uniforms.r.value=tiltV.uniforms.r.value=active==='room'?.52:.5;
    grade.uniforms.time.value=t;grade.uniforms.night.value=isNight?1:0;composer.render()}
  else renderer.render(sc,camera)}

/* ============================================================
   CONTROLS
   ============================================================ */
const roomCtl=new THREE.OrbitControls(camera,renderer.domElement);
Object.assign(roomCtl,{enableDamping:true,dampingFactor:.08,enablePan:false,minDistance:6,maxDistance:48,minPolarAngle:.25,maxPolarAngle:1.2,minAzimuthAngle:-.45,maxAzimuthAngle:.95,rotateSpeed:.45,zoomSpeed:.8});
const cityCtl=new THREE.MapControls(camera,renderer.domElement);
Object.assign(cityCtl,{enableDamping:true,dampingFactor:.08,screenSpacePanning:false,minDistance:12,maxDistance:140,maxPolarAngle:1.15,minPolarAngle:.3,zoomSpeed:.9,panSpeed:1.1,rotateSpeed:.5});
roomCtl.enabled=cityCtl.enabled=false;
roomCtl.maxDistance=62;
roomCtl.enableZoom=cityCtl.enableZoom=false;   // zoom handled below so it eases
roomCtl.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};
cityCtl.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_PAN};
let active='room',ctl=roomCtl;
const HOME={
  room:()=>mobile()?{t:V(.3,1.2,-.4),p:V(.6,42,20)}:{t:V(.4,1.3,-.8),p:V(.6,20.5,14)},
  city:()=>mobile()?{t:V(0,0,-2),p:V(8,84,88)}:{t:V(2,0,-6),p:V(12,46,68)}
};
function clampCity(){const t=cityCtl.target,ox=t.x,oz=t.z;t.x=THREE.MathUtils.clamp(t.x,-55,55);t.z=THREE.MathUtils.clamp(t.z,-60,60);camera.position.x+=t.x-ox;camera.position.z+=t.z-oz}
let flying=false;
/* smooth zoom: wheel, pinch, buttons and keys all ease toward a target distance */
const Z={want:null,pt:null};
const curDist=()=>camera.position.distanceTo(ctl.target);
const zRay=new THREE.Raycaster(),zPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0),zNdc=new THREE.Vector2();
function groundAt(x,y){zNdc.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);zRay.setFromCamera(zNdc,camera);const p=new THREE.Vector3();return zRay.ray.intersectPlane(zPlane,p)?p:null}
function zoomBy(f,x,y){if(flying||!worldOn)return;const base=Z.want!=null?Z.want:curDist();
  Z.want=THREE.MathUtils.clamp(base*f,ctl.minDistance,ctl.maxDistance);Z.pt=(active==='city'&&f<1&&x!=null)?groundAt(x,y):null}
function applyZoom(dt){if(Z.want==null||flying)return;const cur=curDist(),nd=cur+(Z.want-cur)*(1-Math.exp(-dt*10));
  const dir=camera.position.clone().sub(ctl.target).normalize();
  if(Z.pt&&nd<cur){const sh=Z.pt.clone().sub(ctl.target).multiplyScalar(1-nd/cur);sh.y=0;ctl.target.add(sh)}
  camera.position.copy(ctl.target).addScaledVector(dir,nd);
  if(Math.abs(nd-Z.want)<.03){Z.want=null;Z.pt=null}}
addEventListener('wheel',e=>{if(e.target.closest&&e.target.closest('#panel,#index,#loader'))return;e.preventDefault();const dy=e.deltaMode===1?e.deltaY*33:e.deltaMode===2?e.deltaY*400:e.deltaY;
  zoomBy(Math.exp(THREE.MathUtils.clamp(dy,-160,160)*.0024),e.clientX,e.clientY)},{passive:false});
let pinch=null;
const tDist=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
addEventListener('touchstart',e=>{if(e.target.closest&&e.target.closest('#panel,#index'))return;if(e.touches.length===2)pinch={d:tDist(e.touches[0],e.touches[1]),base:Z.want!=null?Z.want:curDist()}},{passive:true});
addEventListener('touchmove',e=>{if(!pinch||e.touches.length!==2||flying||!worldOn)return;const a=e.touches[0],b=e.touches[1],d=tDist(a,b);
  Z.want=THREE.MathUtils.clamp(pinch.base*pinch.d/Math.max(d,1),ctl.minDistance,ctl.maxDistance);
  Z.pt=active==='city'&&d>pinch.d?groundAt((a.clientX+b.clientX)/2,(a.clientY+b.clientY)/2):null},{passive:true});
addEventListener('touchend',e=>{if(e.touches.length<2)pinch=null},{passive:true});
function recenter(){closePanel(false);Z.want=null;const h=HOME[active]();fly(h.t,h.p,1.3)}
$('#zIn')&&($('#zIn').onclick=()=>zoomBy(.68,innerWidth/2,innerHeight/2));
$('#zOut')&&($('#zOut').onclick=()=>zoomBy(1.5));
$('#zHome')&&($('#zHome').onclick=recenter);
addEventListener('keydown',e=>{if(e.target&&/input|textarea/i.test(e.target.tagName))return;
  if(e.key==='+'||e.key==='=')zoomBy(.75,innerWidth/2,innerHeight/2);if(e.key==='-'||e.key==='_')zoomBy(1.35);if(e.key==='0')recenter()});
function fly(t,p,dur=2,cb,arc=true){flying=true;ctl.enabled=false;Z.want=null;Z.pt=null;
  const t0=ctl.target.clone(),p0=camera.position.clone(),dist=p0.distanceTo(p),o={k:0};
  gsap.to(o,{k:1,duration:dur,ease:'power3.inOut',onUpdate:()=>{ctl.target.lerpVectors(t0,t,o.k);camera.position.lerpVectors(p0,p,o.k);
    if(arc)camera.position.y+=Math.sin(o.k*Math.PI)*Math.min(active==='room'?3:30,dist*.3);camera.lookAt(ctl.target)},
    onComplete:()=>{flying=false;ctl.enabled=true;ctl.update();cb&&cb()}})}
function flyToLoc(i){const L=LISTS[active][i];blip(520+i*40);
  const room=active==='room',t=V(L.pos[0],room?L.pos[1]-1:L.pos[1]*.45,L.pos[2]);let off=V(...L.off),p=t.clone().add(off);
  if(!mobile()){const dir=t.clone().sub(p).normalize(),r=dir.clone().cross(V(0,1,0)).normalize().multiplyScalar(room?1.8:5);t.add(r);p.add(r)}
  else{p=t.clone().add(off.multiplyScalar(room?1.45:1.3));const fw=t.clone().sub(p);fw.y=0;fw.normalize().multiplyScalar(room?2.2:8);t.sub(fw);p.sub(fw)}
  fly(t,p,room?1.5:1.9,()=>openPanel(i))}
function switchScene(key,cb){if(key===active)return cb&&cb();
  closePanel(false);ctl.enabled=false;
  gsap.to('#fade',{opacity:1,duration:.7,ease:'power2.in',onComplete:()=>{
    active=key;ctl=key==='room'?roomCtl:cityCtl;$('#whereTxt').textContent=key==='room'?(UI.where_room||'the room'):(UI.where_city||'Starsus Co.');
    if(key==='city'){ctl.target.set(-10,4,10);camera.position.set(-2,6,14)}else{ctl.target.set(-3.7,3.5,-6);camera.position.set(-3.7,4,-3)}
    camera.lookAt(ctl.target);gsap.to('#fade',{opacity:0,duration:.9,delay:.1});
    const h=HOME[key]();fly(h.t,h.p,key==='city'?3:2.4,cb)}})}

/* ============================================================
   PINS / PANEL / INDEX
   ============================================================ */
const pinWrap=$('#pins'),pins=[];
['room','city'].forEach(sc=>LISTS[sc].forEach((L,i)=>{const b=document.createElement('button');b.className='pin';b.style.setProperty('--c',L.c);
  b.innerHTML=`<span class="dot"></span><span class="lbl">${String(i+1).padStart(2,'0')} ${L.short}</span>`;
  b.addEventListener('click',e=>{e.stopPropagation();closeIndex();if(panelIdx>=0)closePanel(false);flyToLoc(i)});pinWrap.appendChild(b);
  pins.push({b,sc,i,v:V(L.pos[0],L.pos[1],L.pos[2])})}));
const tmp=new THREE.Vector3();
function updatePins(){const near=camera.position.distanceTo(ctl.target)<120;
  pins.forEach(p=>{const on=p.sc===active&&worldOn&&panelIdx!==p.i;if(!on){p.b.classList.add('hide');return}
    tmp.copy(p.v).project(camera);const vis=tmp.z<1&&Math.abs(tmp.x)<1.05&&Math.abs(tmp.y)<1.05;
    p.b.style.transform=`translate(${(tmp.x*.5+.5)*innerWidth-9}px,${(-tmp.y*.5+.5)*innerHeight-9}px)`;
    p.b.classList.toggle('hide',!vis);p.b.classList.toggle('near',near&&!mobile()&&active==='city')})}
let panelIdx=-1;const panel=$('#panel');
function openPanel(i){const L=LISTS[active][i];panelIdx=i;panel.style.setProperty('--c',L.c);
  $('#pNum').textContent=String(i+1).padStart(2,'0');$('#pTag').textContent=L.tag;$('#pTitle').textContent=L.name;$('#pBody').textContent=L.body;$('#pWho span').textContent=L.who;
  $('#pCtas').innerHTML=L.ctas.map(([t,r])=>`<button class="cta" data-r="${r}">${t}<span>→</span></button>`).join('');
  $('#hint').style.opacity=0;panel.classList.add('open');panel.setAttribute('aria-hidden','false');try{history.replaceState(null,'','#'+L.id)}catch(e){}}
function closePanel(back=true){if(panelIdx<0)return;panel.classList.remove('open');panel.setAttribute('aria-hidden','true');panelIdx=-1;
  try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
  if(back){const h=HOME[active]();fly(h.t,h.p,1.5)}}
$('#pClose').onclick=()=>closePanel();
const step=d=>{const n=LISTS[active].length,i=(panelIdx+d+n)%n;closePanel(false);flyToLoc(i)};
$('#pPrev').onclick=()=>step(-1);$('#pNext').onclick=()=>step(1);
$('#pCtas').addEventListener('click',e=>{const b=e.target.closest('.cta');if(!b)return;const r=b.dataset.r;
  if(r==='@city'){closePanel(false);fly(V(-3.75,3.8,-7),V(-3.75,4,-2.5),1.2,()=>switchScene('city'),false);return}
  if(r==='@room'){closePanel(false);fly(V(-12.5,3,5),V(-4,5,9),1.4,()=>switchScene('room'));return}
  toast((UI.route_toast||'Route ready:')+' '+r)});
addEventListener('keydown',e=>{if(e.key==='Escape'){closeIndex();closePanel()}if(panelIdx>=0&&e.key==='ArrowRight')step(1);if(panelIdx>=0&&e.key==='ArrowLeft')step(-1)});
const idx=$('#index');
['room','city'].forEach(sc=>{$(sc==='room'?'#iRoom':'#iCity').innerHTML=LISTS[sc].map((L,i)=>`<li><button data-s="${sc}" data-i="${i}" style="--c:${L.c}"><span>${String(i+1).padStart(2,'0')}</span>${L.short}<em>${L.tag}</em></button></li>`).join('')});
idx.addEventListener('click',e=>{const b=e.target.closest('button[data-s]');if(!b)return;closeIndex();closePanel(false);const sc=b.dataset.s,i=+b.dataset.i;
  if(sc===active)flyToLoc(i);else switchScene(sc,()=>flyToLoc(i))});
function closeIndex(){idx.classList.remove('open');$('#bIndex').classList.remove('on')}
$('#bIndex').onclick=()=>{const o=idx.classList.toggle('open');$('#bIndex').classList.toggle('on',o);blip(380)};
$('#iClose').onclick=closeIndex;

/* ============================================================
   DAY / RAINY NIGHT
   ============================================================ */
let isNight=false;
function setTime(night,instant){isNight=night;const d=instant?0:1.6,tw=(o,v)=>gsap.to(o,Object.assign({duration:d},v)),col=(c,hex)=>{const x=new THREE.Color(hex);tw(c,{r:x.r,g:x.g,b:x.b})};
  tw(RL.sun,{intensity:night?.5:2.2});col(RL.sun.color,night?0x5b7cff:0xffa24a);
  tw(RL.hemi,{intensity:night?.2:.42});tw(RL.bounce,{intensity:night?.15:.5});tw(RL.fill,{intensity:night?.25:.55});col(RL.skyMat.color,night?0x1c2650:0xffffff);
  tw(RL.ledLight,{intensity:night?1.8:.9});tw(RL.arcLight,{intensity:night?1.6:.8});tw(RL.tvLight,{intensity:night?1.1:.5});tw(RL.marqLight,{intensity:night?1.2:.6});tw(RL.lamp,{intensity:night?1.6:.9});
  const bg=night?0x07080e:0x9cc4dc;col(city.background,bg);col(fog.color,bg);tw(fog,{near:night?50:120,far:night?240:320});
  tw(CL.hemi,{intensity:night?.34:.85});tw(CL.sun,{intensity:night?.12:1.35});col(CL.sun.color,night?0x7088c8:0xffd29a);
  col(CL.water.color,night?0x0a1422:0x2f7ea0);tw(CL.sky,{emissiveIntensity:night?1:0});col(CL.sky.color,night?0x10141c:0x8a9aa8);
  tw(winMat,{emissiveIntensity:night?.9:0});
  CL.neon.forEach(l=>tw(l,{intensity:night?2.6:.3}));(CL.lamps||[]).forEach(l=>tw(l,{intensity:night?.9:0}));
  CL.wet.forEach(m=>{tw(m,{shininess:night?70:8});col(m.specular,night?0x8a8a8a:0x111111)});
  CL.rain.visible=night;
  if(RL.beamMat){tw(RL.beamMat,{opacity:night?.05:.13});col(RL.beamMat.color,night?0x6a86ff:0xffb060);tw(RL.dustMat,{opacity:night?.25:.7})}
  if(CL.coneMat){tw(CL.coneMat,{opacity:night?.16:0});tw(CL.poolMat,{opacity:night?.5:0})}
  if(bloom){tw(bloom,{strength:night?1.05:.5,threshold:night?.5:.82,radius:night?.7:.55})}
  $('#bTime').textContent=night?(UI.time_night||'Night'):(UI.time_day||'Day');
}
setTime(false,true);
$('#bTime').onclick=()=>{setTime(!isNight);blip(isNight?300:700)};

/* ============================================================
   AUDIO
   ============================================================ */
let ac,master,soundOn=false,rainGain;
function initAudio(){if(ac)return;ac=new (window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=0;master.connect(ac.destination);
  const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=480;lp.Q.value=4;lp.connect(master);
  [55,82.4,110.2,164.8].forEach((f,i)=>{const o=ac.createOscillator();o.type=i%2?'triangle':'sawtooth';o.frequency.value=f;o.detune.value=(i-1.5)*7;const g=ac.createGain();g.gain.value=.045;o.connect(g);g.connect(lp);o.start()});
  const lfo=ac.createOscillator();lfo.frequency.value=.07;const lg=ac.createGain();lg.gain.value=260;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
  const buf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1);
  const crack=ac.createBufferSource();crack.buffer=buf;crack.loop=true;const nf=ac.createBiquadFilter();nf.type='bandpass';nf.frequency.value=1800;const ng=ac.createGain();ng.gain.value=.015;crack.connect(nf);nf.connect(ng);ng.connect(master);crack.start();
  const rain=ac.createBufferSource();rain.buffer=buf;rain.loop=true;const rf=ac.createBiquadFilter();rf.type='highpass';rf.frequency.value=900;rainGain=ac.createGain();rainGain.gain.value=0;rain.connect(rf);rf.connect(rainGain);rainGain.connect(master);rain.start()}
function setSound(on){soundOn=on;try{initAudio();ac.resume();master.gain.cancelScheduledValues(ac.currentTime);master.gain.linearRampToValueAtTime(on?.9:0,ac.currentTime+.8)}catch(e){}
  $('#bSound').textContent=on?(UI.sound_on||'Sound on'):(UI.sound_off||'Sound off');$('#bSound').classList.toggle('on',on)}
function blip(f){if(!soundOn||!ac)return;const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.06,ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+.18);o.connect(g);g.connect(master);o.start();o.stop(ac.currentTime+.2)}
$('#bSound').onclick=()=>setSound(!soundOn);
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2200);blip(880)}
if('ontouchstart'in window&&UI.hint_touch)$('#hintTxt').innerHTML=UI.hint_touch;
let hinted=false;renderer.domElement.addEventListener('pointerdown',()=>{if(!hinted){hinted=true;setTimeout(()=>$('#hint').style.opacity=0,2500)}});

/* ============================================================
   LOOP
   ============================================================ */
let worldOn=false,frame=0,qT=performance.now(),qN=0;const clock=new THREE.Clock();
function loop(){const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;frame++;
  qN++;if(performance.now()-qT>2500){const f=qN*1000/(performance.now()-qT);if(worldOn&&f<32&&PIX>.5){PIX=Math.max(.5,PIX-.15);resize()}else if(worldOn&&f<24&&fxOn){fxOn=false}qT=performance.now();qN=0}
  if(!flying){applyZoom(dt);ctl.update();if(active==='city')clampCity()}
  if(active==='room'){
    if(frame%3===0)drawNoise();if(frame%2===0)drawGame(t);
    RL.poach.head.rotation.y=Math.sin(t*.5)*.3;RL.poach.torso.scale.y=1+Math.sin(t*1.6)*.012;
    RL.cypher.neck.rotation.y=Math.sin(t*.7)*.3;RL.cypher.arms[1].root.rotation.x=-1.2+Math.sin(t*1.4)*.12;
    RL.neo.torso.scale.y=1+Math.sin(t*1.1)*.02;RL.dust.rotation.y=Math.sin(t*.05)*.08;RL.dust.position.y=Math.sin(t*.3)*.15;RL.ledLight.intensity+=(Math.random()-.5)*.05;
  }else{
    movers.forEach(c=>{c.userData.t=(c.userData.t+c.userData.sp*dt)%1;const u=c.userData.t,p=curve.getPointAt(u),tg=curve.getTangentAt(u),nx=-tg.z,nz=tg.x;
      c.position.set(p.x+nx*c.userData.side,0,p.z+nz*c.userData.side);c.rotation.y=Math.atan2(tg.x,tg.z)+(c.userData.side>0?0:Math.PI)});
    {const u=(.24+t*.004)%1,p=curve.getPointAt(u),tg=curve.getTangentAt(u);CL.walker.g.position.set(p.x+1.2,0,p.z+.0);CL.walker.g.rotation.y=Math.atan2(tg.x,tg.z);
      const s=Math.sin(t*4);CL.walker.legs[0].root.rotation.x=-.45*s;CL.walker.legs[1].root.rotation.x=.45*s;CL.walker.arms[0].root.rotation.x=.4*s;CL.walker.arms[1].root.rotation.x=-.4*s;CL.walker.hips.position.y=1.95+Math.abs(Math.cos(t*4))*.06}
    
    if(CL.rain.visible){const a=CL.rain.geometry.attributes.position.array;for(let i=0;i<a.length;i+=6){a[i+1]-=dt*38;a[i+4]-=dt*38;if(a[i+4]<0){const y=50+Math.random()*4;a[i+1]=y;a[i+4]=y-.9}}CL.rain.geometry.attributes.position.needsUpdate=true}
    if(rainGain)rainGain.gain.value=isNight?.08:0;
  }
  if(rainGain&&active==='room')rainGain.gain.value=0;
  renderFrame(t);updatePins();requestAnimationFrame(loop)}
roomCtl.target.set(.4,1.3,-.8);camera.position.set(0,40,8);camera.lookAt(roomCtl.target);loop();

const fill=$('#barFill');gsap.to(fill,{width:'100%',duration:1.6,ease:'power2.inOut',onComplete:()=>{$('#enter').classList.add('show');$('#press').textContent=UI.loader_ready||'CHOOSE HOW TO ENTER'}});
function enter(sound){if(sound)setSound(true);$('#loader').classList.add('gone');worldOn=true;
  const h=location.hash.slice(1),ri=ROOM.findIndex(l=>l.id===h),ci=CITY.findIndex(l=>l.id===h);
  if(ci>=0){switchScene('city',()=>flyToLoc(ci));return}
  const home=HOME.room();fly(home.t,home.p,3,()=>{if(ri>=0)flyToLoc(ri)})}
$('#eSound').onclick=()=>enter(true);$('#eQuiet').onclick=()=>enter(false);
addEventListener('hashchange',()=>{if(!worldOn)return;const h=location.hash.slice(1),ri=ROOM.findIndex(l=>l.id===h),ci=CITY.findIndex(l=>l.id===h);
  if(ri>=0&&!(active==='room'&&panelIdx===ri))switchScene('room',()=>flyToLoc(ri));if(ci>=0&&!(active==='city'&&panelIdx===ci))switchScene('city',()=>flyToLoc(ci))});
window.__bb={flyToLoc,switchScene,setTime,camera,get ctl(){return ctl}};
}
})();
