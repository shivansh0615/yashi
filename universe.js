import * as THREE from './assets/three.module.js';
// One small canvas, no postprocessing, capped to 30fps for laptop battery life.
const container=document.querySelector('#universe');
let renderer;
try { renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'}); } catch { container.classList.add('fallback'); }
if(renderer){
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;container.append(renderer.domElement);container.classList.add('webgl-ready');
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,.1,100);camera.position.z=12;
  scene.add(new THREE.AmbientLight(0xffe4ed,1.7));const key=new THREE.DirectionalLight(0xfff1e9,3.2);key.position.set(-3,4,5);scene.add(key);const rim=new THREE.DirectionalLight(0xd36594,2.2);rim.position.set(3,-2,1);scene.add(rim);
  // Deterministic crater texture, generated locally; no model or network asset load.
  const textureCanvas=document.createElement('canvas');textureCanvas.width=textureCanvas.height=512;const ctx=textureCanvas.getContext('2d');ctx.fillStyle='#c2b9b7';ctx.fillRect(0,0,512,512);let seed=86;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  for(let i=0;i<1800;i++){const x=random()*512,y=random()*512,r=random()*14+1;ctx.fillStyle=`rgba(${random()>.6?'245,238,233':'102,96,99'},${random()*.24+.04})`;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();if(r>7){ctx.strokeStyle='#e3d8d244';ctx.lineWidth=1.5;ctx.stroke();}}
  const texture=new THREE.CanvasTexture(textureCanvas);texture.colorSpace=THREE.SRGBColorSpace;
  const moon=new THREE.Mesh(new THREE.SphereGeometry(1.12,40,28),new THREE.MeshStandardMaterial({map:texture,bumpMap:texture,bumpScale:.055,roughness:1,color:0xf1dfdf}));
  const group=new THREE.Group();group.add(moon);scene.add(group);
  const crown=new THREE.Group();const metal=new THREE.MeshStandardMaterial({color:0xe7a7bf,metalness:.75,roughness:.22});
  const band=new THREE.Mesh(new THREE.CylinderGeometry(.48,.45,.16,32,1,true),metal);crown.add(band);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const tip=new THREE.Mesh(new THREE.ConeGeometry(.16,.52,4),metal);tip.position.set(Math.cos(a)*.43,.26,Math.sin(a)*.43);tip.rotation.y=-a;crown.add(tip);const pearl=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),new THREE.MeshStandardMaterial({color:0xffe4ed,roughness:.25,metalness:.3}));pearl.position.set(Math.cos(a)*.43,.55,Math.sin(a)*.43);crown.add(pearl);}
  crown.position.set(.9,1.05,.3);crown.rotation.set(.2,.25,-.24);group.add(crown);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.55,.014,6,100),new THREE.MeshStandardMaterial({color:0xc54c7b,metalness:.65,roughness:.25}));ring.rotation.set(1.05,-.35,.2);group.add(ring);
  let story=false, motion=!matchMedia('(prefers-reduced-motion: reduce)').matches,last=0,visible=true,needsPaint=true,px=0,py=0;
  const coords={x:.8,y:.27,size:1};
  function place(){
    const mobile=innerWidth<651;
    if(!story){coords.x=mobile?.87:.82;coords.y=mobile?.19:.24;coords.size=mobile?.36:.63;visible=true;}
    else{const hero=document.querySelector('.hero').getBoundingClientRect(),space=document.querySelector('.moon-space').getBoundingClientRect();if(hero.bottom>0){coords.x=mobile?.88:.85;coords.y=mobile?.29:.52;coords.size=mobile?.42:.76;visible=true;}else if(space.top<innerHeight&&space.bottom>0){coords.x=(space.left+space.width*.47)/innerWidth;coords.y=(space.top+space.height*.43)/innerHeight;coords.size=mobile?.78:1.18;visible=true;}else visible=false;}
    container.style.opacity=visible?'1':'0';const h=2*Math.tan(THREE.MathUtils.degToRad(17.5))*12,w=h*camera.aspect;group.position.set((coords.x-.5)*w,(.5-coords.y)*h,0);group.scale.setScalar(coords.size);needsPaint=true;
  }
  function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);place();}window.addEventListener('resize',resize,{passive:true});window.addEventListener('scroll',place,{passive:true});window.addEventListener('storyopen',()=>{story=true;place();});window.addEventListener('motionchange',e=>{motion=e.detail;needsPaint=true;});
  window.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;px=(e.clientX/innerWidth-.5)*.12;py=(e.clientY/innerHeight-.5)*.1;needsPaint=true;},{passive:true});
  window.addEventListener('moonlove',()=>{if(window.gsap&&motion)gsap.to(group.rotation,{y:group.rotation.y+Math.PI*2,duration:2,ease:'power2.inOut'});});
  document.addEventListener('visibilitychange',()=>{needsPaint=true;});
  function render(t){requestAnimationFrame(render);if(document.hidden||!visible||t-last<33)return;if(!motion&&!needsPaint)return;last=t;needsPaint=false;if(motion){moon.rotation.y+=.0018;crown.rotation.y+=.003;group.rotation.x+=(py-group.rotation.x)*.035;group.rotation.z+=(-px-group.rotation.z)*.035;}renderer.render(scene,camera);}place();requestAnimationFrame(render);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();container.classList.remove('webgl-ready');});
}

