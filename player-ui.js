/* Player. A real https URL uses <video>. Otherwise a timed stand-in runs
   so the owner can drop a file in later. opts.simple keeps the trailer chrome. */
function mountPlayer(root, opts){
 const total=Math.max(10, opts.seconds||12);
 const start=Math.min(total-0.25, Math.max(0, opts.startAt||0));
 if(opts.src && /^https?:/i.test(opts.src)) return mountReal(root, opts, total, start);
 return mountStandIn(root, opts, total, start);
}
function mountReal(root, opts, total, start){
 root.innerHTML=`<div class="stagev"><video class="realv" playsinline poster="${esc(opts.poster||"")}" src="${esc(opts.src)}"></video>${controlBar(opts)}</div>`;
 const v=root.querySelector("video");
 const api=bindControls(root, opts, {
  get(){return v.currentTime},
  set(s){v.currentTime=s},
  duration(){return v.duration||total},
  play(){return v.play()},
  pause(){v.pause()},
  paused(){return v.paused},
  rate(r){v.playbackRate=r}
 });
 if(start)v.currentTime=start;
 v.addEventListener("timeupdate",()=>{api.draw();if(opts.onTime&&!v.paused)opts.onTime(v.currentTime)});
 v.addEventListener("ended",()=>opts.onEnded&&opts.onEnded());
 v.addEventListener("play",()=>api.onPlay());
 return api;
}
function mountStandIn(root, opts, total, start){
 let sec=start, playing=false, timer=null, rate=1;
 root.innerHTML=`<div class="stagev phv">
  <img alt="" src="${esc(opts.poster||"")}">
  <button type="button" class="bigplay" aria-label="${esc(opts.playLabel||"Play")}">${ico('<polygon points="6 3 20 12 6 21 6 3"/>',28,true)}</button>
  <p class="phlabel">${esc(t("dk_ph_short"))}</p>
  <p class="ccdemo" hidden>${esc(t("cc_demo"))}</p>
  ${opts.simple?`<div class="vbar"><i></i><span class="vt">0:00</span><b>${esc(opts.title||"")}</b><span class="vr"></span></div>`:controlBar(opts)}
 </div>`;
 const api=bindControls(root, opts, {
  get(){return sec},
  set(s){sec=Math.max(0,Math.min(total,s))},
  duration(){return total},
  play(){if(playing)return;playing=true;const btn=root.querySelector(".bigplay");if(btn)btn.style.display="none";
   timer=setInterval(()=>{sec=Math.min(total,sec+rate);api.draw();if(opts.onTime)opts.onTime(sec);if(sec>=total){api.stop();opts.onEnded&&opts.onEnded()}},250)},
  pause(){playing=false;clearInterval(timer);const btn=root.querySelector(".bigplay");if(btn)btn.style.display=""},
  paused(){return !playing},
  rate(r){rate=r}
 });
 const stage=root.querySelector(".phv");
 const big=root.querySelector(".bigplay");
 if(big)big.onclick=e=>{e.stopPropagation();api.toggle()};
 stage.addEventListener("click",e=>{if(e.target.closest(".vcontrols,.bigplay"))return;if(!opts.simple)api.toggle()});
 api.draw();
 return api;
}
function controlBar(opts){
 if(opts.simple)return "";
 const b=(act,label,inner)=>`<button type="button" data-act="${act}" aria-label="${esc(label)}">${inner}</button>`;
 return `<div class="vcontrols">
  ${b("play",opts.playLabel||"Play",ico('<polygon points="6 3 20 12 6 21 6 3"/>',16,true))}
  ${b("back",t("back10"),"−10")}
  ${b("fwd",t("fwd10"),"+10")}
  ${b("next",t("next_les"),ico(PATH.chevR,16))}
  <span class="vt">0:00</span>
  <div class="vscrub" data-act="scrub"><i></i><em class="mark" hidden></em></div>
  <span class="vr">-0:00</span>
  ${b("mute",t("mute"),ico('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M16 9a5 5 0 0 1 0 6"/>',16))}
  ${b("cc",t("cc_on"),"CC")}
  ${b("rate",t("speed"),"1×")}
  ${b("pip",t("pip"),"PiP")}
  ${b("full",t("full"),ico('<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',16))}
 </div>`;
}
function bindControls(root, opts, media){
 const rates=[1,1.25,1.5,2]; let ri=0, muted=false;
 const scrub=root.querySelector(".vscrub");
 const fill=scrub&&scrub.querySelector("i");
 const mark=scrub&&scrub.querySelector(".mark");
 const vt=root.querySelector(".vt"), vr=root.querySelector(".vr");
 const playBtn=root.querySelector('[data-act="play"]');
 function clock(s){s=Math.max(0,Math.floor(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
 function draw(){
  const d=media.duration()||1, s=media.get();
  if(fill)fill.style.width=(s/d*100)+"%";
  const legacy=root.querySelector(".vbar i"); if(legacy)legacy.style.width=(s/d*100)+"%";
  if(vt)vt.textContent=clock(s);
  if(vr)vr.textContent="-"+clock(d-s);
  if(mark&&opts.resumeAt){mark.hidden=false;mark.style.left=Math.min(98,opts.resumeAt/d*100)+"%"}
 }
 function stop(){media.pause();draw()}
 function toggle(){media.paused()?media.play():media.pause();draw()}
 function seek(s){media.set(Math.max(0,Math.min(media.duration(),s)));draw();if(opts.onTime)opts.onTime(media.get())}
 function onPlay(){if(window.__efsStopOthers)window.__efsStopOthers(api);draw()}
 const api={stop,seek,draw,toggle,onPlay};
 root.querySelectorAll("[data-act]").forEach(btn=>{
  btn.addEventListener("click",e=>{
   e.stopPropagation();
   const act=btn.dataset.act;
   if(act==="play"){toggle();onPlay()}
   else if(act==="back")seek(media.get()-10);
   else if(act==="fwd")seek(media.get()+10);
   else if(act==="next")opts.onNext&&opts.onNext();
   else if(act==="mute"){muted=!muted;btn.classList.toggle("off",muted)}
   else if(act==="cc"){const c=root.querySelector(".ccdemo");if(c)c.hidden=!c.hidden;btn.classList.toggle("on",c&&!c.hidden)}
   else if(act==="rate"){ri=(ri+1)%rates.length;media.rate(rates[ri]);btn.textContent=String(rates[ri]).replace(/\.0$/,"")+"×"}
   else if(act==="pip"){const v=root.querySelector("video");if(v&&document.pictureInPictureEnabled)v.requestPictureInPicture().catch(()=>toast(t("pip_demo")));else toast(t("pip_demo"))}
   else if(act==="full"){const box=root.querySelector(".stagev");if(document.fullscreenElement)document.exitFullscreen();else box.requestFullscreen&&box.requestFullscreen()}
   else if(act==="scrub"){const r=btn.getBoundingClientRect();seek(((e.clientX-r.left)/r.width)*media.duration())}
  });
 });
 if(playBtn){
  const paint=()=>{playBtn.innerHTML=media.paused()?ico('<polygon points="6 3 20 12 6 21 6 3"/>',16,true):ico('<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',16)};
  const origDraw=draw;
  api.draw=function(){origDraw();paint()};
 }
 return api;
}
