/* Placeholder player. If opts.src is an http(s) URL, a real <video> is used.
   Otherwise a timed stand-in runs so the owner can swap the file later. */
function mountPlayer(root, opts){
 if(opts.src && /^https?:/i.test(opts.src)){
  root.innerHTML=`<div class="stagev"><video class="realv" controls playsinline poster="${esc(opts.poster||"")}" src="${esc(opts.src)}"></video></div>`;
  const v=root.querySelector("video");
  v.addEventListener("ended",()=>opts.onEnded&&opts.onEnded());
  return {stop(){v.pause()}};
 }
 let sec=0, playing=false, timer=null;
 const total=opts.seconds||12;
 root.innerHTML=`<div class="stagev phv">
  <img alt="" src="${esc(opts.poster||"")}">
  <button type="button" class="bigplay" aria-label="${esc(opts.playLabel||"Play")}">${ico('<polygon points="6 3 20 12 6 21 6 3"/>',28,true)}</button>
  <p class="phlabel">${esc(t("dk_ph_short"))}</p>
  <div class="vbar"><i></i><span class="vt">0:00</span><b>${esc(opts.title||"")}</b><span class="vr"></span></div>
 </div>`;
 const bar=root.querySelector(".vbar i"), el=root.querySelector(".vt"), rem=root.querySelector(".vr"), btn=root.querySelector(".bigplay");
 function clock(s){s=Math.floor(s);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
 function draw(){bar.style.width=(sec/total*100)+"%";el.textContent=clock(sec);rem.textContent="-"+clock(total-sec)}
 function stop(){playing=false;clearInterval(timer);btn.style.display=""}
 function play(){
  playing=true;btn.style.display="none";
  timer=setInterval(()=>{sec=Math.min(total,sec+0.25);draw();if(sec>=total){stop();opts.onEnded&&opts.onEnded()}},250);
 }
 btn.onclick=()=>playing?stop():play();
 root.querySelector(".phv").addEventListener("click",e=>{if(e.target===btn||btn.contains(e.target))return;playing?stop():play()});
 draw();
 return {stop};
}
