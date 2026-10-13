    (function(){
      var reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* ===== WhatsApp number (single source of truth) =====
         Qasim ka WhatsApp number: country code ke saath, "+" ke baghair.
         Khali string ("") chhorne par WhatsApp float button aur contact card nazar NAHIN aayenge. */
      var WHATSAPP_NUMBER="923135531925";
      (function wireWhatsApp(){
        var floatBtn=document.getElementById('wa-float');
        var card=document.querySelector('.whatsapp-card');
        if(WHATSAPP_NUMBER){
          var link="https://wa.me/"+String(WHATSAPP_NUMBER).replace(/\D/g,"");
          [floatBtn,card].forEach(function(a){if(a){a.href=link;a.target="_blank";a.rel="noopener"}});
        }else{
          if(floatBtn)floatBtn.style.display="none";
          if(card)card.style.display="none";
        }
      })();

      /* ===== 3D tilt (fine pointer only; touch devices skip) ===== */
      if(!reduceMotion&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){
        document.querySelectorAll('[data-tilt]').forEach(function(el){
          var max=parseFloat(el.getAttribute('data-tilt'))||6;
          el.addEventListener('mousemove',function(e){
            var r=el.getBoundingClientRect();
            var px=(e.clientX-r.left)/r.width-0.5,py=(e.clientY-r.top)/r.height-0.5;
            el.style.transform='perspective(1000px) rotateX('+(-py*max).toFixed(2)+'deg) rotateY('+(px*max).toFixed(2)+'deg)';
            el.style.setProperty('--gx',((px+0.5)*100).toFixed(1)+'%');
            el.style.setProperty('--gy',((py+0.5)*100).toFixed(1)+'%');
            el.classList.add('tilting');
          });
          el.addEventListener('mouseleave',function(){el.style.transform='';el.classList.remove('tilting')});
        });
      }

      var preloader=document.getElementById('preloader');
      function finishLoading(){if(preloader){preloader.classList.add('done')}}
      window.addEventListener('load',function(){window.setTimeout(finishLoading,reduceMotion?0:450)});window.setTimeout(finishLoading,1800);

      function scrollToTarget(target){if(!target)return;target.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'})}
      document.querySelectorAll('a[href^="#"]').forEach(function(anchor){anchor.addEventListener('click',function(e){var selector=anchor.getAttribute('href');if(!selector||selector==='#')return;var target=document.querySelector(selector);if(!target)return;e.preventDefault();scrollToTarget(target);if(history.replaceState)history.replaceState(null,'',selector)})});

      var clock=document.getElementById('nav-clock');function updateClock(){var now=new Date();clock.textContent=now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});clock.setAttribute('datetime',now.toISOString())}updateClock();window.setInterval(updateClock,60000);

      var searchToggle=document.getElementById('nav-search-toggle'),searchPanel=document.getElementById('site-search-panel'),siteSearch=document.getElementById('site-search-input'),searchResults=document.getElementById('site-search-results');
      function closeSearch(){searchPanel.hidden=true;searchToggle.setAttribute('aria-expanded','false')}
      function searchEntries(){var entries=[];document.querySelectorAll('#articles .article-card').forEach(function(item){var a=item.querySelector('a.article-card-link');entries.push({type:'Article',title:item.querySelector('h3').textContent,href:a?a.getAttribute('href'):'#'+item.id,haystack:item.textContent.toLowerCase()})});document.querySelectorAll('#services .service').forEach(function(item,index){if(!item.id)item.id='service-'+(index+1);entries.push({type:'Service',title:item.querySelector('h3').textContent,href:'services.html#'+item.id,haystack:item.textContent.toLowerCase()})});document.querySelectorAll('.video-card').forEach(function(item,index){if(!item.id)item.id='video-work-'+(index+1);entries.push({type:'Video',title:item.querySelector('h4').textContent,href:'work.html#'+item.id,haystack:item.textContent.toLowerCase()})});return entries}
      var siteEntries=searchEntries();function renderSearch(){var term=siteSearch.value.trim().toLowerCase();searchResults.innerHTML='';if(!term){searchResults.innerHTML='<p>Start typing to search articles, services and videos.</p>';return}var matches=siteEntries.filter(function(entry){return entry.haystack.indexOf(term)>-1}).slice(0,10);if(!matches.length){searchResults.innerHTML='<p>No matching articles, services or videos.</p>';return}matches.forEach(function(entry){var link=document.createElement('a');link.className='search-result';link.href=entry.href;link.setAttribute('role','option');link.innerHTML='<small>'+entry.type+'</small><strong></strong>';link.querySelector('strong').textContent=entry.title;searchResults.appendChild(link)})}
      searchToggle.addEventListener('click',function(e){e.stopPropagation();var open=searchPanel.hidden;searchPanel.hidden=!open;searchToggle.setAttribute('aria-expanded',String(open));if(open)window.setTimeout(function(){siteSearch.focus()},0)});siteSearch.addEventListener('input',renderSearch);

      var portraitRotations=Array.prototype.slice.call(document.querySelectorAll('.portrait-rotation'));
      function advancePortrait(frame){var portraits=Array.prototype.slice.call(frame.querySelectorAll('.rotating-portrait'));if(portraits.length<2)return;var currentIndex=portraits.findIndex(function(item){return item.classList.contains('is-active')});if(currentIndex<0)currentIndex=0;var nextIndex=(currentIndex+1)%portraits.length;portraits[currentIndex].classList.remove('is-active');portraits[currentIndex].setAttribute('aria-hidden','true');portraits[nextIndex].classList.add('is-active');portraits[nextIndex].removeAttribute('aria-hidden');frame.setAttribute('data-rotation-index',String(nextIndex));frame.dispatchEvent(new CustomEvent('portraitchange',{detail:{index:nextIndex}}))}
      window.__advancePortrait=advancePortrait;
      if(!reduceMotion){portraitRotations.forEach(function(frame,index){var interval=Number(frame.getAttribute('data-interval'))||150000;frame.setAttribute('data-rotation-index','0');window.setTimeout(function(){advancePortrait(frame);window.setInterval(function(){advancePortrait(frame)},interval)},interval+(index*1500))})}

      var menu=document.querySelector('.menu-btn'),nav=document.getElementById('nav-links');
      menu.addEventListener('click',function(){var open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close':'Menu'});
      nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Menu'}});
      document.querySelectorAll('#articles details').forEach(function(detail){detail.addEventListener('toggle',function(){if(detail.open){document.querySelectorAll('#articles details[open]').forEach(function(other){if(other!==detail)other.open=false})}})});

      var themeToggle=document.getElementById('theme-toggle'),themePanel=document.getElementById('theme-panel');
      var themeOptions=Array.prototype.slice.call(document.querySelectorAll('.theme-option'));
      function closeThemes(){themePanel.hidden=true;themeToggle.setAttribute('aria-expanded','false')}
      themeToggle.addEventListener('click',function(e){e.stopPropagation();var open=themePanel.hidden;themePanel.hidden=!open;themeToggle.setAttribute('aria-expanded',String(open))});
      themeOptions.forEach(function(option){option.addEventListener('click',function(){var theme=option.getAttribute('data-theme');document.documentElement.setAttribute('data-theme',theme);themeOptions.forEach(function(item){var selected=item===option;item.setAttribute('aria-checked',String(selected));item.querySelector('.theme-check').textContent=selected?'✓':''});closeThemes()})});
      document.addEventListener('click',function(e){if(!e.target.closest('.theme-picker'))closeThemes();if(!e.target.closest('.nav-search'))closeSearch()});

      var primaryReelGrid=document.getElementById('primary-reel-grid');
      var reelOrder={
        DeYR1TDvyiM:{date:'2026-10-11',likes:0},DeRRHFmJ8Mc:{date:'2026-10-09 03:14:57',likes:1},DeOpyglM39c:{date:'2026-10-08 02:52:31',likes:40},DeL8GjlOo71:{date:'2026-10-08 04:44:00',likes:0},DeGs3CSBJWr:{date:'2026-10-05 00:45:01',likes:2},DeENKa9pwS1:{date:'2026-10-04 01:30:09',likes:17},DeBEmauBVEE:{date:'2026-10-02 20:17:00',likes:4},Dd_e6VFBTzB:{date:'2026-10-01 20:10:15',likes:0},Dd8ix7vOPIS:{date:'2026-10-01 02:05:17',likes:0},Dd5i9_ByRpU:{date:'2026-09-29 22:08:52',likes:2},Dd21kuZBHoU:{date:'2026-09-28',likes:6},Ddx4AHkhuyV:{date:'2026-09-26 22:40:55',likes:2},DdvfLgfpTE0:{date:'2026-09-26 00:26:33',likes:10},DdqumiaBbj6:{date:'2026-09-24',likes:47},DdnzPZPPW3J:{date:'2026-09-23',likes:178},Ddk0WQ2hVSA:{date:'2026-09-21',likes:7},
        DdiSbRHOTKF:{date:'2026-09-20',likes:81},DdgakAzNozy:{date:'2026-09-20',likes:6},DddCkAuucPX:{date:'2026-09-18',likes:4},
        DdauE_gs1Xm:{date:'2026-09-17',likes:87},DdX6rvkhkMo:{date:'2026-09-16',likes:3},DdVpNJhPnNR:{date:'2026-09-15',likes:6},
        DdRJlxMuxNj:{date:'2026-09-14',likes:1145},DdO3cQDBdYT:{date:'2026-09-13',likes:5},DdLZO4ohVd4:{date:'2026-09-11',likes:22},
        DdJSHDyhTlq:{date:'2026-09-11',likes:13},DdGvaiRMXGK:{date:'2026-09-10',likes:8},DdD_utTNmg1:{date:'2026-09-09',likes:75},
        Dc9AgT2NXxB:{date:'2026-09-06',likes:26},Dc3vVsfNXIl:{date:'2026-09-04',likes:12},Dc0iroMhPrZ:{date:'2026-09-03',likes:25},
        Dcxz4lUBIXa:{date:'2026-09-02',likes:21},DcuwQDlBc1y:{date:'2026-08-31',likes:55},Dcnrw7_PLvp:{date:'2026-08-29',likes:67},
        DclyUnWOx7Y:{date:'2026-08-28',likes:1},Dcgl6LUBuUx:{date:'2026-08-26',likes:29},Dcaj90Atvlo:{date:'2026-08-24',likes:6},DbhkO_thAz0:{date:'2026-08-01',likes:14},
        DbuWa_itL_J:{date:'2026-08-06',likes:73},DbUo__ntnvU:{date:'2026-07-27',likes:186},DbPhNo_BH4w:{date:'2026-07-25',likes:86},DbIOo9vvGTx:{date:'2026-07-23',likes:876}
      };
      function reelMeta(card){var id=card.getAttribute('data-reel-id');return reelOrder[id]||reelOrder[id.replace(/-/g,'_')]||{date:'',likes:0}}
      if(primaryReelGrid){var orderedReels=Array.prototype.slice.call(primaryReelGrid.children);orderedReels.sort(function(a,b){var pinned=['DeYR1TDvyiM','DdRJlxMuxNj','DbhkO_thAz0','DcuwQDlBc1y','DbIOo9vvGTx','Dcaj90Atvlo','DbUo-_ntnvU','DdnzPZPPW3J','DeRRHFmJ8Mc','DeOpyglM39c','DeL8GjlOo71','DeGs3CSBJWr','DeENKa9pwS1','DeBEmauBVEE','Dd-e6VFBTzB','Dd8ix7vOPIS','Dd5i9_ByRpU'],aPinned=pinned.indexOf(a.getAttribute('data-reel-id')),bPinned=pinned.indexOf(b.getAttribute('data-reel-id'));if(aPinned>-1||bPinned>-1)return aPinned===-1?1:bPinned===-1?-1:aPinned-bPinned;var ma=reelMeta(a),mb=reelMeta(b);return mb.likes-ma.likes||mb.date.localeCompare(ma.date)});orderedReels.forEach(function(card,index){primaryReelGrid.appendChild(card);var kicker=card.querySelector('.video-kicker');if(kicker&&kicker.firstChild)kicker.firstChild.nodeValue='Reel '+String(index+1).padStart(2,'0')+' '})}

      var portfolioVideos=Array.prototype.slice.call(document.querySelectorAll('.selfhosted-video'));
      function pauseOtherVideos(active){portfolioVideos.forEach(function(video){if(video!==active){video.pause();video.closest('.video-card').classList.remove('is-playing')}})}
      function playVideo(video){pauseOtherVideos(video);if(!video.getAttribute('src')&&video.getAttribute('data-src')){video.src=video.getAttribute('data-src');video.load();}video.muted=true;video.playsInline=true;var card=video.closest('.video-card');var result=video.play();if(result&&result.then){result.then(function(){card.classList.add('is-playing');video.controls=true}).catch(function(){card.classList.remove('is-playing');video.controls=false})}else{card.classList.add('is-playing');video.controls=true}}
      function pauseVideo(video){video.pause();video.controls=false;video.closest('.video-card').classList.remove('is-playing')}
      portfolioVideos.forEach(function(video){var card=video.closest('.video-card'),trigger=card.querySelector('.video-trigger');function toggleVideo(){video.paused?playVideo(video):pauseVideo(video)}trigger.addEventListener('click',function(e){e.stopPropagation();toggleVideo()});video.addEventListener('click',function(e){e.stopPropagation();toggleVideo()});card.addEventListener('click',function(e){if(e.target.closest('a'))return;toggleVideo()});card.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&!e.target.closest('a')){e.preventDefault();toggleVideo()}});video.addEventListener('ended',function(){card.classList.remove('is-playing')})});
      var showreelFrame=document.querySelector('.showreel-frame'),showreelVideo=showreelFrame?showreelFrame.querySelector('.showreel-video'):null,showreelPlay=showreelFrame?showreelFrame.querySelector('.showreel-play'):null;
      if(showreelFrame&&showreelVideo&&showreelPlay){showreelPlay.addEventListener('click',function(){if(!showreelVideo.getAttribute('src')){showreelVideo.src=showreelVideo.getAttribute('data-src');showreelVideo.load();}showreelVideo.muted=false;var r=showreelVideo.play();if(r&&r.then){r.then(function(){showreelFrame.classList.add('is-playing');showreelVideo.controls=true}).catch(function(){})}});showreelVideo.addEventListener('click',function(){if(showreelVideo.paused){showreelVideo.play()}else{showreelVideo.pause()}});}

      if(document.getElementById('work-search')){var cards=Array.prototype.slice.call(document.querySelectorAll('.project-card'));
      var filters=Array.prototype.slice.call(document.querySelectorAll('.filter'));
      var sortButtons=Array.prototype.slice.call(document.querySelectorAll('.sort-button'));
      var count=document.getElementById('visible-count'),empty=document.getElementById('empty'),search=document.getElementById('work-search');
      var activeFilter='all',activeSort='newest';
      cards.forEach(function(card,index){card.setAttribute('data-order',String(index))});
      function applyPortfolio(){var term=search.value.trim().toLowerCase(),visible=0;cards.forEach(function(card){var category=card.getAttribute('data-category');var haystack=(card.getAttribute('data-title')+' '+(card.getAttribute('data-channel')||'')+' '+category).toLowerCase();var show=(activeFilter==='all'||category===activeFilter)&&(!term||haystack.indexOf(term)>-1);card.hidden=!show;if(show)visible++});count.textContent=visible;empty.classList.toggle('show',visible===0)}
      function sortPortfolio(){['featured-grid','work-grid'].forEach(function(id){var grid=document.getElementById(id);var items=Array.prototype.slice.call(grid.children);items.sort(function(a,b){if(activeSort==='popular'){var viewDiff=Number(b.getAttribute('data-views')||0)-Number(a.getAttribute('data-views')||0);if(viewDiff)return viewDiff}return Number(a.getAttribute('data-order'))-Number(b.getAttribute('data-order'))});items.forEach(function(item){grid.appendChild(item)})});applyPortfolio()}
      filters.forEach(function(button){button.addEventListener('click',function(){filters.forEach(function(b){b.classList.remove('active')});button.classList.add('active');activeFilter=button.getAttribute('data-filter');applyPortfolio()})});
      sortButtons.forEach(function(button){button.addEventListener('click',function(){sortButtons.forEach(function(b){b.classList.remove('active')});button.classList.add('active');activeSort=button.getAttribute('data-sort');sortPortfolio()})});search.addEventListener('input',applyPortfolio);applyPortfolio();}

      if(document.getElementById('project-modal')){var modal=document.getElementById('project-modal'),close=document.querySelector('.modal-close'),lastFocus=null;
      var lightbox=document.getElementById('lightbox'),lightboxImage=document.getElementById('lightbox-image'),lightboxClose=document.querySelector('.lightbox-close');
      function openModal(card){lastFocus=card;document.getElementById('modal-title').textContent=card.getAttribute('data-title');document.getElementById('modal-description').textContent=card.getAttribute('data-description');var cat=card.querySelector('.category').textContent.replace('Featured · ','');document.getElementById('modal-category').textContent=cat;var image=document.getElementById('modal-image'),src=card.getAttribute('data-image'),thumb=card.querySelector('img');if(src){image.parentElement.hidden=false;image.src=src;image.alt=thumb?thumb.alt:''}else{image.parentElement.hidden=true;image.removeAttribute('src');image.alt=''}var channel=card.getAttribute('data-channel'),views=card.getAttribute('data-views-label'),facts=document.getElementById('modal-facts');facts.innerHTML='';if(channel){var f1=document.createElement('span');f1.className='project-fact';f1.textContent=channel;facts.appendChild(f1)}if(views){var f2=document.createElement('span');f2.className='project-fact';f2.textContent=views+' views';facts.appendChild(f2)}facts.hidden=!channel;var projectLink=document.getElementById('modal-link'),href=card.getAttribute('data-link');projectLink.hidden=!href;projectLink.style.display=href?'inline-flex':'none';if(href)projectLink.href=href;else projectLink.removeAttribute('href');document.getElementById('modal-link-label').textContent=card.getAttribute('data-platform')==='YouTube'?'Watch on YouTube':'View original on Instagram';modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');close.focus()}
      function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');if(lastFocus)lastFocus.focus()}
      function openLightbox(){var image=document.getElementById('modal-image');if(!image.getAttribute('src'))return;lightboxImage.src=image.src;lightboxImage.alt=image.alt;lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');lightboxClose.focus()}
      function closeLightbox(){lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');lightboxImage.removeAttribute('src');document.querySelector('.modal-close').focus()}
      cards.forEach(function(card){card.addEventListener('click',function(){openModal(card)})});close.addEventListener('click',closeModal);modal.addEventListener('click',function(e){if(e.target===modal)closeModal()});document.querySelector('.modal-media').addEventListener('click',openLightbox);lightboxClose.addEventListener('click',closeLightbox);lightbox.addEventListener('click',function(e){if(e.target===lightbox)closeLightbox()});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&lightbox.classList.contains('open'))closeLightbox();else if(e.key==='Escape'&&modal.classList.contains('open'))closeModal()});}

      var progress=document.getElementById('scroll-progress'),backTop=document.getElementById('back-top');
      function onScroll(){var max=document.documentElement.scrollHeight-window.innerHeight,ratio=max>0?window.scrollY/max:0;progress.style.width=(ratio*100)+'%';backTop.classList.toggle('show',window.scrollY>600)}window.addEventListener('scroll',onScroll,{passive:true});onScroll();backTop.addEventListener('click',function(){window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'})});

      var sections=Array.prototype.slice.call(document.querySelectorAll('main [id]')),navAnchors=Array.prototype.slice.call(document.querySelectorAll('.nav-links>a'));
      if('IntersectionObserver' in window){var sectionObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){navAnchors.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id)})}})},{rootMargin:'-35% 0px -55% 0px'});sections.forEach(function(section){sectionObserver.observe(section)})}

      if(!reduceMotion&&window.matchMedia('(pointer:fine)').matches){var dot=document.querySelector('.cursor-dot'),ring=document.querySelector('.cursor-ring'),mx=0,my=0,rx=0,ry=0;window.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;dot.style.transform='translate('+(mx-2.5)+'px,'+(my-2.5)+'px)'});function cursorLoop(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;ring.style.transform='translate('+(rx-16)+'px,'+(ry-16)+'px)';requestAnimationFrame(cursorLoop)}cursorLoop();document.querySelectorAll('a,button,input,textarea,select').forEach(function(el){el.addEventListener('mouseenter',function(){ring.classList.add('hover')});el.addEventListener('mouseleave',function(){ring.classList.remove('hover')})});document.querySelectorAll('.btn').forEach(function(btn){btn.addEventListener('mousemove',function(e){var r=btn.getBoundingClientRect();btn.style.transform='translate('+((e.clientX-r.left-r.width/2)*.08)+'px,'+((e.clientY-r.top-r.height/2)*.08)+'px)'});btn.addEventListener('mouseleave',function(){btn.style.transform=''})})}

      var canvas=document.getElementById('hero-canvas');if(canvas&&!reduceMotion){var ctx=canvas.getContext('2d'),points=[];function resizeCanvas(){var rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);points=Array.from({length:Math.min(48,Math.floor(rect.width/24))},function(){return{x:Math.random()*rect.width,y:Math.random()*rect.height,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,r:Math.random()*1.5+.4}})}function draw(){var rect=canvas.getBoundingClientRect();ctx.clearRect(0,0,rect.width,rect.height);var color=getComputedStyle(document.documentElement).getPropertyValue('--gold-bright').trim();ctx.fillStyle=color;ctx.globalAlpha=.38;points.forEach(function(p){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>rect.width)p.vx*=-1;if(p.y<0||p.y>rect.height)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1;requestAnimationFrame(draw)}resizeCanvas();window.addEventListener('resize',resizeCanvas);draw()}

      if('IntersectionObserver' in window&&!reduceMotion){var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.08});document.querySelectorAll('.reveal').forEach(function(el){observer.observe(el)})}else{document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('visible')})}

      /* ===== Numbers bar: PLACEHOLDER STATS — Qasim to confirm the 4 real numbers ===== */
      var SITE_STATS={projects:120,clients:45,years:3,videos:160};
      (function(){var nums=document.querySelectorAll('.num-count');if(!nums.length)return;
        function animate(el,target){var start=null,dur=1400;function step(ts){if(!start)start=ts;var p=Math.min((ts-start)/dur,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(target*e);if(p<1)requestAnimationFrame(step)}if(reduceMotion){el.textContent=target;return}requestAnimationFrame(step)}
        function run(){nums.forEach(function(el){var key=el.getAttribute('data-stat');if(SITE_STATS[key]!=null)animate(el,SITE_STATS[key])})}
        if('IntersectionObserver' in window){var no=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){run();no.disconnect()}})},{threshold:.4});var numbersEl=document.getElementById('numbers');if(numbersEl){no.observe(numbersEl)}else{run()}}else{run()}
      })();
    })();