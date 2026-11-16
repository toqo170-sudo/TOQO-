
import * as THREE from 'three';
import './style.css';

document.querySelector('#app').innerHTML = `
<div id="world"></div><div class="hud">
 <div class="top"><div><div class="logo">TOQO</div><div class="chip">BATTLE ROYALE · ONLINE TEST</div></div>
 <div class="right"><div class="chip">👥 <span id="count">1</span></div><div class="chip">☠ <span id="kills">0</span></div><div class="chip">❤️ 100<div class="health"><i></i></div></div></div></div>
 <div class="middle"><b>جزيرة TOQO</b><div class="chip" id="net">جاري الاتصال بالخادم...</div></div>
 <div class="hint">WASD للحركة · Space للقفز · زر الإطلاق للتصويب</div>
 <div class="bottom"><div class="stick" id="stick"><div class="nub" id="nub"></div></div>
 <div class="buttons"><button class="act" id="jump">قفز</button><button class="act fire" id="fire">إطلاق</button></div></div>
</div>
<div class="modal" id="welcome"><div class="panel"><h1>TOQO</h1><p>نموذج باتل رويال ثلاثي الأبعاد. تحرّك في ساحة التدريب، جرّب التصويب، وافتح اللعبة في أكثر من نافذة لاختبار مزامنة اللاعبين عبر الخادم.</p><button class="start" id="start">ابدأ اللعب</button><p style="font-size:11px">الأونلاين يعمل بعد تشغيل خادم Node.js على جهاز أو استضافة متاحة.</p></div></div>`;

const scene=new THREE.Scene();scene.background=new THREE.Color(0x8eb9cb);scene.fog=new THREE.Fog(0x8eb9cb,45,130);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,300);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;document.querySelector('#world').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xeaf7ff,0x52634b,1.4));
const sun=new THREE.DirectionalLight(0xffedce,1.4);sun.position.set(-30,55,20);sun.castShadow=true;scene.add(sun);
const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.85});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(220,220),mat(0x527c50));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const sea=new THREE.Mesh(new THREE.PlaneGeometry(500,500),mat(0x277f9b));sea.rotation.x=-Math.PI/2;sea.position.y=-.18;scene.add(sea);
function box(x,y,z,a,b,c,m){const o=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;}
box(-13,2,-18,18,4,12,mat(0x77888a));box(-13,4.1,-18,19,.3,13,mat(0x303c42));
box(18,1.8,-24,13,3.6,10,mat(0xaaa184));box(18,3.7,-24,14,.3,11,mat(0x3b4547));
for(let i=0;i<55;i++){let x=(Math.random()-.5)*115,z=(Math.random()-.5)*115;if(Math.abs(x)<24&&Math.abs(z)<28)continue;const t=new THREE.Mesh(new THREE.CylinderGeometry(.15,.25,2,7),mat(0x59442f));t.position.set(x,1,z);scene.add(t);const crown=new THREE.Mesh(new THREE.ConeGeometry(1.6,4,7),mat(0x315a3b));crown.position.set(x,3.7,z);crown.castShadow=true;scene.add(crown);}
function makeAvatar(color=0x273e5d){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.46,.9,5,10),mat(color));body.position.y=1.15;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.28,14,12),mat(0xc99d7c));head.position.y=2;g.add(head);const pack=new THREE.Mesh(new THREE.BoxGeometry(.52,.7,.24),mat(0x8b5b3a));pack.position.set(0,1.25,.45);g.add(pack);g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g);return g;}
const player=makeAvatar(0x293b66);player.position.set(0,0,8);
const remote=new Map();let started=false,kills=0,vy=0,onGround=true;const keys={};
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Space'&&onGround){vy=8;onGround=false}});
addEventListener('keyup',e=>keys[e.code]=false);
let joy={x:0,y:0},drag=false,origin;
const stick=document.querySelector('#stick'),nub=document.querySelector('#nub');
stick.addEventListener('pointerdown',e=>{drag=true;stick.setPointerCapture(e.pointerId);const r=stick.getBoundingClientRect();origin={x:r.left+r.width/2,y:r.top+r.height/2};moveJoy(e)});
stick.addEventListener('pointermove',e=>{if(drag)moveJoy(e)});
function moveJoy(e){let dx=e.clientX-origin.x,dy=e.clientY-origin.y,l=Math.hypot(dx,dy),m=38;if(l>m){dx=dx/l*m;dy=dy/l*m}joy={x:dx/m,y:dy/m};nub.style.left=33+dx+'px';nub.style.top=33+dy+'px'}
function endJoy(){drag=false;joy={x:0,y:0};nub.style.left='33px';nub.style.top='33px'}
stick.addEventListener('pointerup',endJoy);stick.addEventListener('pointercancel',endJoy);
document.querySelector('#jump').addEventListener('pointerdown',()=>{if(onGround){vy=8;onGround=false}});
const wsUrl=`ws://${location.hostname||'localhost'}:2567`;let socket;
function connect(){try{socket=new WebSocket(wsUrl);socket.onopen=()=>document.querySelector('#net').textContent='متصل بالخادم';socket.onclose=()=>document.querySelector('#net').textContent='وضع محلي — الخادم غير متصل';socket.onerror=()=>{};socket.onmessage=e=>{const msg=JSON.parse(e.data);if(msg.type==='state'){const ids=new Set();for(const p of msg.players){if(p.id===msg.id)continue;ids.add(p.id);let a=remote.get(p.id);if(!a){a=makeAvatar(0x873f78);remote.set(p.id,a)}a.position.set(p.x,0,p.z);a.rotation.y=p.rot||0;}for(const [id,a] of remote){if(!ids.has(id)){scene.remove(a);remote.delete(id)}}document.querySelector('#count').textContent=msg.players.length;}}}catch{}}
connect();
function send(type,data={}){if(socket?.readyState===1)socket.send(JSON.stringify({type,...data}))}
document.querySelector('#fire').addEventListener('pointerdown',()=>{if(!started)return;kills++;document.querySelector('#kills').textContent=kills;send('shoot')});
document.querySelector('#start').onclick=()=>{started=true;document.querySelector('#welcome').style.display='none';send('join')};
const clock=new THREE.Clock();let sendTimer=0;
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);if(started){let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-joy.y,s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+joy.x;const v=new THREE.Vector3(s,0,-f);if(v.length()>1)v.normalize();player.position.addScaledVector(v,7*dt);if(v.lengthSq()>.01)player.rotation.y=Math.atan2(v.x,-v.z);vy-=19*dt;player.position.y+=vy*dt;if(player.position.y<=0){player.position.y=0;vy=0;onGround=true}sendTimer+=dt;if(sendTimer>.05){send('move',{x:player.position.x,z:player.position.z,rot:player.rotation.y});sendTimer=0}const target=new THREE.Vector3(player.position.x+Math.sin(player.rotation.y)*5,player.position.y+4,player.position.z+Math.cos(player.rotation.y)*7+5);camera.position.lerp(target,.13);camera.lookAt(player.position.x,player.position.y+1.2,player.position.z-2)}else{camera.position.set(0,10,20);camera.lookAt(0,0,-12)}renderer.render(scene,camera)}
animate();addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
