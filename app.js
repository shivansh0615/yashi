(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let motion = !reduced.matches, opened = false, mediaContext;
  const gs = window.gsap;
  if (gs && window.ScrollTrigger) gs.registerPlugin(ScrollTrigger);
  const portraits = [
    ['p5-5.jpg','the prettiest girl, my girl.'],['p5-3.jpg','café dates look better with you.'],
    ['p1-8.jpg','can we stay like this?'],['p1-3.jpg','one more mirror selfie.'],
    ['p2-4.jpg','nutties, flowers, and a little us.'],['p4-4.jpg','princess, obviously.'],
    ['p2-8.jpg','my favourite passenger.'],['p4-7.jpg','your hand in mine.'],
    ['p1-1.jpg','a little kiss.'],['p1-2.jpg','just happy to be here with you.'],
    ['p1-4.jpg','home is a person.'],['p1-5.jpg','pink bows suit us.'],['p1-6.jpg','this smile.'],
    ['p1-7.jpg','you, me, even through a screen.'],['p1-9.jpg','we found another mirror.'],['p1-10.jpg','my café date.'],
    ['p2-1.jpg','us, again.'],['p2-2.jpg','another little adventure.'],['p2-3.jpg','blurry photo, perfect memory.'],
    ['p2-5.jpg','a little closer.'],['p2-6.jpg','too close? never.'],['p2-7.jpg','my person.'],
    ['p3-1.jpg','look at us.'],['p3-2.jpg','my favourite view.'],['p3-3.jpg','just one more photo.'],
    ['p4-1.jpg','cutu on camera.'],['p4-2.jpg','princess behaviour.'],['p4-3.jpg','that smile, yashu.'],
    ['p4-5.jpg','a proper little date.'],['p4-6.jpg','more days like this.'],
    ['p5-1.jpg','you make everything look pretty.'],['p5-2.jpg','main character, always.'],['p5-4.jpg','meri favourite person.']
  ];
  const grid = $('#photo-grid');
  portraits.forEach(([file, caption],i) => {
    const button=document.createElement('button'); button.type='button';button.className='photo-button';button.setAttribute('aria-label','Open photograph: '+caption);
    const img=document.createElement('img'); img.src='assets/'+file;img.alt=caption;img.loading='lazy';img.decoding='async';img.width=720;img.height=960; button.append(img);
    button.addEventListener('click',()=>{ $('#lightbox-img').src=img.src;$('#lightbox-img').alt=caption;$('#lightbox-caption').textContent=caption;$('#lightbox').showModal(); });grid.append(button);
  });
  $('#lightbox-close').addEventListener('click',()=>$('#lightbox').close());
  $('#lightbox').addEventListener('click',e=>{if(e.target===$('#lightbox'))$('#lightbox').close();});
  $('#album-toggle').addEventListener('click',()=>{ const expanded=grid.classList.toggle('expanded');$('#album-toggle').setAttribute('aria-expanded',expanded);$('#album-toggle').textContent=expanded?'a little less':'more of us';window.ScrollTrigger?.refresh(); });
  function unlock(){
    if(opened)return;opened=true;
    $('#story').hidden=false;$('#story').inert=false;document.body.classList.remove('locked');
    const finish=()=>{$('#gate').remove();window.scrollTo(0,0);$('#home h1').focus({preventScroll:true});setupMotion();window.dispatchEvent(new Event('storyopen'));};
    if(gs&&motion)gs.to('#gate',{opacity:0,y:-25,duration:.65,onComplete:finish});else finish();
  }
  $('#unlock-form').addEventListener('submit',e=>{e.preventDefault();if($('#pass').value==='09072021')unlock();else{$('#pass-note').textContent='areyy yashu, wedding wala din. try again, cutu.';$('#pass').setAttribute('aria-invalid','true');if(gs&&motion)gs.fromTo('.pass-row',{x:-5},{x:0,duration:.25});}});
  $('#pass').addEventListener('input',()=>$('#pass').removeAttribute('aria-invalid'));
  function setupMotion(){
    mediaContext?.revert();if(!gs||!window.ScrollTrigger)return;
    $('.memories-wrap').classList.toggle('is-rest',!motion||innerWidth<1001); $('.memories-wrap').classList.toggle('is-live',motion&&innerWidth>=1001); mediaContext=gs.matchMedia();
    mediaContext.add('(min-width: 1001px)',()=>{
      if(!motion)return;
      const track=$('.memories-track');
      gs.to(track,{x:()=>-(track.scrollWidth-innerWidth),ease:'none',scrollTrigger:{trigger:'.memories-wrap',start:'top top',end:'bottom bottom',scrub:.55,invalidateOnRefresh:true}});
      gs.fromTo('.hero-photo',{rotate:-5,y:0},{rotate:2,y:45,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.7}});
    });
    if(motion){
      document.querySelectorAll('.section-intro,.her-heading,.vlog-heading,.album-heading,.letter-intro').forEach(el=>{gs.from(el.children,{y:24,opacity:.65,duration:.7,stagger:.09,scrollTrigger:{trigger:el,start:'top 88%',once:true},clearProps:'transform,opacity'});});
      document.querySelectorAll('.her-pictures figure,.vlog-pictures img,.still-photo').forEach((el,i)=>gs.from(el,{y:30,rotate:i%2?2:-2,duration:.8,scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
    }
    ScrollTrigger.refresh();
  }
  const milestones=[...document.querySelectorAll('[data-picture]')];let currentMilestone='',timelineTick=false;
  function updateTimeline(){
    if(!opened)return;
    const near=milestones.reduce((best,el)=>{const r=el.getBoundingClientRect(),b=best.getBoundingClientRect();return Math.abs(r.top+r.height/2-innerHeight*.48)<Math.abs(b.top+b.height/2-innerHeight*.48)?el:best;},milestones[0]);
    if(near.dataset.picture===currentMilestone)return;currentMilestone=near.dataset.picture;
    const img=$('#timeline-img'),video=$('#timeline-video'),isVideo=currentMilestone.endsWith('.mp4');img.hidden=isVideo;video.hidden=!isVideo;
    $('#timeline-note').textContent=near.dataset.note;
    if(isVideo){if(motion)video.play().catch(()=>{});}else{video.pause();img.src='assets/'+currentMilestone;img.alt=near.querySelector('h3').textContent+' '+near.querySelector('time').textContent;if(gs&&motion)gs.fromTo(img,{opacity:.6},{opacity:1,duration:.35});}
  }
  window.addEventListener('scroll',()=>{if(timelineTick)return;timelineTick=true;requestAnimationFrame(()=>{timelineTick=false;const r=$('#beginning').getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)updateTimeline();});},{passive:true});
  const videos=[...document.querySelectorAll('video')];
  const videoObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
    const v=e.target;v.dataset.visible=String(e.isIntersecting);if(e.isIntersecting&&motion&&!document.hidden)v.play().catch(()=>{});else v.pause();
  }),{threshold:.3});videos.forEach(v=>videoObserver.observe(v));
  document.addEventListener('visibilitychange',()=>{videos.forEach(v=>{if(document.hidden)v.pause();else if(v.dataset.visible==='true'&&motion)v.play().catch(()=>{});});});
  function setMotion(value){motion=value;document.body.classList.toggle('motion-paused',!value);$('#motion-toggle').textContent=value?'motion on':'motion off';$('#motion-toggle').setAttribute('aria-pressed',!value);window.dispatchEvent(new CustomEvent('motionchange',{detail:value}));if(opened)setupMotion();videos.forEach(v=>{if(!value)v.pause();else if(v.dataset.visible==='true')v.play().catch(()=>{});});}
  $('#motion-toggle').addEventListener('click',()=>setMotion(!motion));reduced.addEventListener('change',e=>setMotion(!e.matches));setMotion(motion);
  let moonClicks=0;
  $('#moon-button').addEventListener('click',()=>{const lines=['pretty, right? still second to you though.','haan haan, i’m looking. now come on a walk with me.','same moon, same me, still completely yours.'];$('#moon-reply').textContent=lines[moonClicks++%lines.length];window.dispatchEvent(new Event('moonlove'));});
  $('#letter-open').addEventListener('click',()=>{const button=$('#letter-open');if(button.classList.contains('open'))return;button.classList.add('open');button.setAttribute('aria-expanded','true');$('#love-letter').hidden=false;button.querySelector('.envelope-label').textContent='a little piece of my heart';if(gs&&motion)gs.from('#love-letter',{opacity:0,y:30,duration:.8});window.ScrollTrigger?.refresh();setTimeout(()=>$('#love-letter').scrollIntoView({behavior:motion?'smooth':'auto',block:'start'}),motion?500:0);});
  $('#ps-open').addEventListener('click',()=>{$('#date-surprise').hidden=false;$('#ps-open').setAttribute('aria-expanded','true');$('#ps-open').hidden=true;window.ScrollTrigger?.refresh();if(gs&&motion)gs.from('#date-surprise',{opacity:0,y:25,duration:.8});$('#date-surprise').scrollIntoView({behavior:motion?'smooth':'auto',block:'center'});burst();});
  $('#date-yes').addEventListener('click',()=>{$('#date-reply').textContent='it’s a date, princess. now send me a screenshot, i want to see that yes huhhh!';$('#date-yes').hidden=true;$('#calendar-link').hidden=false;burst();});
  $('#back-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:motion?'smooth':'auto'}));
  function burst(){if(!gs||!motion)return;for(let i=0;i<14;i++){const heart=document.createElement('span');heart.className='heart-burst';heart.innerHTML="<svg class=\"heart-icon\" viewBox=\"0 0 32 30\" aria-hidden=\"true\"><path d=\"M16 27C11 22 2 16 2 9A7 7 0 0 1 16 7A7 7 0 0 1 30 9C30 16 21 22 16 27Z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"/></svg>";heart.setAttribute('aria-hidden','true');heart.style.left=(35+Math.random()*30)+'vw';heart.style.top='65vh';document.body.append(heart);gs.to(heart,{x:(Math.random()-.5)*450,y:-150-Math.random()*300,rotate:(Math.random()-.5)*80,opacity:0,duration:1.5+Math.random(),onComplete:()=>heart.remove()});}}
  window.addEventListener('load',()=>window.ScrollTrigger?.refresh());
})();

