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

// Gallery lightbox: tap any gallery photo to open it full-screen and swipe through the set.
const galleryFigures=[...document.querySelectorAll('.gallery-grid figure')];
if(galleryFigures.length){
  galleryFigures.forEach((figure,index)=>{
    figure.setAttribute('role','button');
    figure.setAttribute('tabindex','0');
    figure.setAttribute('aria-label',`Open photo ${index+1} of ${galleryFigures.length}`);
  });

  const lightbox=document.createElement('div');
  lightbox.className='vt-lightbox';
  lightbox.setAttribute('aria-hidden','true');
  lightbox.innerHTML=`<button class="vt-lightbox-close" type="button" aria-label="Close photo viewer">×</button><button class="vt-lightbox-prev" type="button" aria-label="Previous photo">‹</button><figure class="vt-lightbox-stage"><img alt=""><figcaption></figcaption></figure><button class="vt-lightbox-next" type="button" aria-label="Next photo">›</button><div class="vt-lightbox-count"></div>`;
  document.body.appendChild(lightbox);

  const lbImg=lightbox.querySelector('img');
  const lbCaption=lightbox.querySelector('figcaption');
  const lbCount=lightbox.querySelector('.vt-lightbox-count');
  let currentIndex=0;
  let touchStartX=0;
  let touchStartY=0;

  const renderLightbox=index=>{
    currentIndex=(index+galleryFigures.length)%galleryFigures.length;
    const figure=galleryFigures[currentIndex];
    const img=figure.querySelector('img');
    const caption=figure.querySelector('figcaption');
    lbImg.src=img.currentSrc||img.src;
    lbImg.alt=img.alt||'';
    lbCaption.textContent=caption?.textContent?.trim()||'';
    lbCaption.hidden=!lbCaption.textContent;
    lbCount.textContent=`${currentIndex+1} / ${galleryFigures.length}`;
  };

  const openLightbox=index=>{
    renderLightbox(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    document.body.classList.add('lightbox-open');
    lightbox.querySelector('.vt-lightbox-close').focus({preventScroll:true});
  };
  const closeLightbox=()=>{
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    document.body.classList.remove('lightbox-open');
  };
  const nextPhoto=()=>renderLightbox(currentIndex+1);
  const prevPhoto=()=>renderLightbox(currentIndex-1);

  galleryFigures.forEach((figure,index)=>{
    figure.addEventListener('click',()=>openLightbox(index));
    figure.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openLightbox(index);}});
  });
  lightbox.querySelector('.vt-lightbox-close').addEventListener('click',closeLightbox);
  lightbox.querySelector('.vt-lightbox-next').addEventListener('click',nextPhoto);
  lightbox.querySelector('.vt-lightbox-prev').addEventListener('click',prevPhoto);
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox();});
  document.addEventListener('keydown',e=>{
    if(!lightbox.classList.contains('open'))return;
    if(e.key==='Escape')closeLightbox();
    if(e.key==='ArrowRight')nextPhoto();
    if(e.key==='ArrowLeft')prevPhoto();
  });
  lightbox.addEventListener('touchstart',e=>{
    const t=e.changedTouches[0];touchStartX=t.clientX;touchStartY=t.clientY;
  },{passive:true});
  lightbox.addEventListener('touchend',e=>{
    const t=e.changedTouches[0];
    const dx=t.clientX-touchStartX;
    const dy=t.clientY-touchStartY;
    if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)){dx<0?nextPhoto():prevPhoto();}
    else if(dy>90&&Math.abs(dy)>Math.abs(dx)){closeLightbox();}
  },{passive:true});

  const lightboxStyle=document.createElement('style');
  lightboxStyle.textContent=`body.lightbox-open{overflow:hidden}.gallery-grid figure{cursor:zoom-in}.vt-lightbox{position:fixed;inset:0;z-index:1000;background:rgba(2,14,23,.96);display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transition:opacity .2s ease,visibility .2s ease;touch-action:pan-y}.vt-lightbox.open{opacity:1;visibility:visible}.vt-lightbox-stage{margin:0;width:min(92vw,1200px);height:min(82vh,900px);display:flex;flex-direction:column;align-items:center;justify-content:center}.vt-lightbox-stage img{max-width:100%;max-height:calc(100% - 42px);width:auto;height:auto;object-fit:contain;border-radius:4px;box-shadow:0 20px 60px rgba(0,0,0,.35)}.vt-lightbox-stage figcaption{color:#fff;margin-top:14px;font-size:13px;letter-spacing:.04em}.vt-lightbox-close,.vt-lightbox-prev,.vt-lightbox-next{position:absolute;border:0;background:rgba(255,255,255,.10);color:#fff;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(7px)}.vt-lightbox-close{top:18px;right:18px;width:44px;height:44px;border-radius:50%;font-size:29px;line-height:1}.vt-lightbox-prev,.vt-lightbox-next{top:50%;transform:translateY(-50%);width:48px;height:64px;border-radius:999px;font-size:38px;font-weight:300}.vt-lightbox-prev{left:18px}.vt-lightbox-next{right:18px}.vt-lightbox-count{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);color:#cbd5d9;font-size:11px;font-weight:800;letter-spacing:.12em}.vt-lightbox button:focus-visible{outline:2px solid #b8ef13;outline-offset:3px}@media(max-width:600px){.vt-lightbox{background:rgba(2,14,23,.985)}.vt-lightbox-stage{width:100vw;height:100svh;padding:72px 14px 58px}.vt-lightbox-stage img{max-width:100%;max-height:calc(100svh - 160px);border-radius:2px}.vt-lightbox-stage figcaption{font-size:12px;margin-top:12px}.vt-lightbox-close{top:max(16px,env(safe-area-inset-top));right:14px;width:42px;height:42px}.vt-lightbox-prev,.vt-lightbox-next{width:40px;height:54px;font-size:32px;background:rgba(0,0,0,.18)}.vt-lightbox-prev{left:8px}.vt-lightbox-next{right:8px}.vt-lightbox-count{bottom:max(16px,env(safe-area-inset-bottom));font-size:10px}.gallery-grid figure:active img{transform:scale(.99)}}`;
  document.head.appendChild(lightboxStyle);
}
