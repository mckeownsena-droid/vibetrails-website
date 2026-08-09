const polish=document.createElement('link');polish.rel='stylesheet';polish.href='mobile-polish.css';document.head.appendChild(polish);
const menuBtn=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('.mobile-menu');
if(menuBtn&&mobileMenu){menuBtn.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');document.body.classList.toggle('menu-open',open);menuBtn.setAttribute('aria-expanded',String(open));menuBtn.textContent=open?'×':'☰';});mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileMenu.classList.remove('open');document.body.classList.remove('menu-open');menuBtn.setAttribute('aria-expanded','false');menuBtn.textContent='☰';}));}
document.querySelectorAll('.faq-q').forEach(btn=>btn.addEventListener('click',()=>{const item=btn.closest('.faq-item');const wasOpen=item.classList.contains('open');document.querySelectorAll('.faq-item').forEach(x=>x.classList.remove('open'));if(!wasOpen)item.classList.add('open');btn.setAttribute('aria-expanded',String(!wasOpen));}));
const bookingForm=document.querySelector('#bookingForm');
if(bookingForm){bookingForm.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(bookingForm);const text=[`Hi VibeTrails, I'd like to make an adventure enquiry.`,``,`Name: ${f.get('name')}`,`Phone: ${f.get('phone')}`,`Adventure: ${f.get('adventure')}`,`People: ${f.get('people')||'1'}`,`Preferred date: ${f.get('date')||'Flexible'}`,`Pickup area: ${f.get('pickup')||'Not specified'}`,``,`Message: ${f.get('message')||'Please send me details of the next available trip.'}`].join('\n');window.open('https://wa.me/233593132204?text='+encodeURIComponent(text),'_blank','noopener');const box=document.querySelector('.success-box');if(box)box.style.display='block';});}

const eventCountdown=document.querySelector('#eventCountdown');
if(eventCountdown){
  const eventTime=Date.UTC(2026,8,21,5,0,0);
  const unit=(n,singular,plural)=>`${n} ${n===1?singular:plural}`;
  const updateCountdown=()=>{
    const distance=eventTime-Date.now();
    if(distance<=0){eventCountdown.textContent='Adventure day is here!';return false;}
    const totalSeconds=Math.floor(distance/1000);
    const days=Math.floor(totalSeconds/86400);
    const hours=Math.floor((totalSeconds%86400)/3600);
    const minutes=Math.floor((totalSeconds%3600)/60);
    const seconds=totalSeconds%60;
    eventCountdown.textContent=`${unit(days,'day','days')}, ${unit(hours,'hour','hours')}, ${unit(minutes,'minute','minutes')}, ${unit(seconds,'second','seconds')} to the adventure`;
    return true;
  };
  updateCountdown();
  const countdownTimer=setInterval(()=>{if(!updateCountdown())clearInterval(countdownTimer);},1000);
}

// Real VibeTrails video moments. The videos are stored as compact base64 text assets
// so they can be delivered reliably through the existing static-site setup.
const b64ToBlobUrl=async path=>{
  const res=await fetch(path,{cache:'force-cache'});
  if(!res.ok)throw new Error(`Unable to load ${path}`);
  const b64=(await res.text()).trim();
  const binary=atob(b64);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes],{type:'video/mp4'}));
};

const story=document.querySelector('.story-split');
if(story){
  const section=document.createElement('section');
  section.className='video-moments';
  section.innerHTML=`<div class="wrap"><div class="video-moments-head"><div><p class="eyebrow">Real moments</p><h2 class="display">See the vibe.<br><span>Feel the trail.</span></h2></div><p>Real clips from VibeTrails experiences — the places, the people and the moments that make every trip worth remembering.</p></div><div class="video-moments-grid"><article class="video-card"><div class="video-shell"><video muted loop playsinline autoplay preload="metadata" poster="assets/waterfall.jpg" data-b64-video="assets/videos/waterfall-preview.b64"></video><span class="video-badge">Explore</span></div><h3>Chase the falls</h3><p>Nature feels different when you are right inside the story.</p></article><article class="video-card"><div class="video-shell"><video muted loop playsinline autoplay preload="metadata" poster="assets/community-games.jpg" data-b64-video="assets/videos/community-preview.b64"></video><span class="video-badge">Connect</span></div><h3>Come for the people</h3><p>Good energy, shared moments and memories made together.</p></article></div></div>`;
  story.insertAdjacentElement('afterend',section);
  const style=document.createElement('style');
  style.textContent=`.video-moments{padding:110px 0;background:#fff}.video-moments-head{display:flex;justify-content:space-between;align-items:end;gap:50px;margin-bottom:42px}.video-moments-head h2{font-size:clamp(48px,5.8vw,78px)}.video-moments-head h2 span{color:#617d08;font-weight:500}.video-moments-head>p{max-width:430px;color:#667075;line-height:1.75;margin:0}.video-moments-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.video-card{margin:0}.video-shell{position:relative;overflow:hidden;border-radius:10px;background:#071c2b;aspect-ratio:4/5}.video-shell video{width:100%;height:100%;display:block;object-fit:cover}.video-badge{position:absolute;left:16px;top:16px;background:#b8ef13;color:#031c31;border-radius:999px;padding:7px 10px;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.video-card h3{font-family:Arial,sans-serif;font-size:26px;letter-spacing:-.04em;margin:16px 0 7px}.video-card p{margin:0;color:#667075;line-height:1.65;font-size:14px}@media(max-width:600px){.video-moments{padding:68px 0}.video-moments-head{display:block;margin-bottom:28px}.video-moments-head h2{font-size:40px;line-height:.96}.video-moments-head>p{margin-top:18px;font-size:16px;line-height:1.65}.video-moments-grid{grid-template-columns:1fr 1fr;gap:10px}.video-shell{border-radius:8px}.video-card h3{font-size:18px;margin:11px 0 5px}.video-card p{font-size:12px;line-height:1.5}.video-badge{left:10px;top:10px;padding:6px 8px;font-size:8px}}`;
  document.head.appendChild(style);
  section.querySelectorAll('video[data-b64-video]').forEach(async video=>{
    try{
      video.src=await b64ToBlobUrl(video.dataset.b64Video);
      const tryPlay=()=>video.play().catch(()=>{});
      video.addEventListener('canplay',tryPlay,{once:true});
      document.addEventListener('visibilitychange',()=>{if(!document.hidden)tryPlay();});
    }catch(err){console.warn('VibeTrails video unavailable:',err);}
  });
}
