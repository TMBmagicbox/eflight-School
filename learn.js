/* Unit player: one page per unit, lessons stacked, tasks, resources. */
let players=[];
function cid(){return +new URLSearchParams(location.search).get("id")||1}
function poster(c){return coursePoster(c)}
function unitOf(syl){
 const q=new URLSearchParams(location.search);
 const want=q.get("unit");
 if(want&&syl.units.some(u=>u.code===want))return want;
 const lesson=q.get("lesson")||(EFSStore.user()&&EFSStore.prog(cid()).last);
 if(lesson){const l=syl.lessons.find(x=>x.id===lesson);if(l)return l.unit}
 const prog=EFSStore.user()?EFSStore.prog(cid()):{units:{}};
 const open=syl.units.find(u=>!(prog.units||{})[u.code]);
 return (open||syl.units[0]).code;
}
function goUnit(code){
 const u=new URL(location.href);u.searchParams.set("unit",code);u.searchParams.delete("lesson");
 history.pushState(null,"",u);renderLearn();window.scrollTo(0,0);
}
function renderLearn(){
 players.forEach(p=>p.stop&&p.stop());players=[];
 const c=courseById(cid());const root=$("app");if(!c||!root)return;
 const syl=buildSyllabus(c);const code=unitOf(syl);
 const unit=syl.units.find(u=>u.code===code)||syl.units[0];
 const owned=EFSStore.owns(c.id);const preview=unit===syl.units[0];
 if(!owned&&!preview){root.innerHTML=`<div class="wrap" style="padding:40px 0"><h1>${esc(c.t[lang])}</h1><p>${ico(PATH.lock,18)} ${t("dk_lock")}</p><a class="btn" href="confirm.html?id=${c.id}">${t("dk_buy")} · $${c.p}</a></div>`;return}
 const prog=EFSStore.user()?EFSStore.prog(c.id):{units:{},tasks:{},resume:{},done:{}};
 const st=EFSStore.stats(c.id,syl.lessons.length,syl.units.length);
 const done=!!(prog.units||{})[unit.code];
 const idx=syl.units.findIndex(u=>u.code===unit.code);
 const next=syl.units[idx+1];
 document.title=unit.title+" | "+c.t[lang];
 if(EFSStore.user()&&unit.lessons[0])EFSStore.setLast(c.id,unit.lessons[0].id);
 const tabs=courseTabs(c,"content");
 root.innerHTML=`<div class="unitpage">
  <div class="umain">
   <div class="bc"><a href="index.html">${t("n_home")}</a> › <a href="my-courses.html">${t("my_h")}</a> › <a href="course.html?id=${c.id}">${esc(c.t[lang])}</a> › ${esc(unit.code)}</div>
   ${tabs}
   <h1 class="ctitle">${esc(c.t[lang])}</h1>
   <p class="byline">${t("dk_by")} ${esc(t("sy_teacher"))}, ${esc(t("sy_role"))}</p>
   <h2>${esc(unit.code)} · ${esc(unit.title)} ${done?`<span class="donechip">${t("unit_done")}</span>`:""}</h2>
   <p>${esc(unit.blurb)}</p>
   ${unit.lessons.map(l=>lessonBlock(c,l,prog)).join("")}
   <h2 id="tareas">${t("tasks_h")}</h2>
   ${unit.tasks.map(task=>`<div class="taskrow"><label><input type="checkbox" ${prog.tasks&&prog.tasks[task.id]?"checked":""} onchange="taskToggle('${task.id}',this.checked)"> ${esc(task.title)}</label> <span class="pchip">${esc(task.chip)}</span> <a href="forum.html?id=${c.id}&practice=${encodeURIComponent(task.chip)}">${t("task_open")}</a></div>`).join("")}
   <h2 id="recursos">${t("res_h")}</h2>
   ${unit.resources.map(r=>`<div class="resrow"><span class="kind">${esc(r.kind)}</span><div><b>${esc(r.name)}</b><br><small>${esc(t("res_ph"))}</small></div><button class="btn s" data-name="${esc(r.name)}" onclick="dlRes(this.dataset.name)">${t("res_dl")}</button></div>`).join("")}
   <div class="unitend">
    <button class="btn" onclick="markUnit(${!done})">${done?t("unmark_unit"):t("mark_unit")}</button>
    ${next?`<button class="textbtn" onclick="goUnit('${next.code}')">${t("next_unit")} ${ico(PATH.chevR,16)}</button>`:`<a class="textbtn" href="forum.html?id=${c.id}">${t("go_forum")}</a>`}
   </div>
  </div>
  <aside class="uside">
   <p class="kicker">${t("sum_h")}</p>
   <p class="kicker">${t("units_h")}</p>
   ${syl.units.map(u=>{
    const on=!!(prog.units||{})[u.code];
    return `<a class="urow ${u.code===unit.code?"on":""}" href="learn.html?id=${c.id}&unit=${u.code}"><span class="ubadge">${esc(u.code)}</span><span>${esc(u.title)}</span><span class="tick ${on?"on":""}"></span></a>`;
   }).join("")}
   <a class="textbtn" href="#recursos">${t("res_h")}</a>
   ${rateCard(c)}
  </aside>
 </div>
 <div class="mobuy"><b>${st.pct}%</b><span>${st.unitsDone}/${syl.units.length}</span></div>`;
 window.__efsStopOthers=me=>{players.forEach(p=>{if(p!==me)p.stop()})};
 unit.lessons.forEach(l=>{
  const box=document.getElementById("stage-"+l.id); if(!box)return;
  const resume=(prog.resume&&prog.resume[l.id])||0;
  const dur=Math.max(20,Math.round(l.min*60));
  players.push(mountPlayer(box,{
   poster:poster(c),src:l.video,title:l.title,seconds:dur,startAt:resume,resumeAt:resume,
   playLabel:l.title,
   onTime:s=>{if(EFSStore.user()&&s>1)EFSStore.setResume(c.id,l.id,s)},
   onNext:()=>{const i=unit.lessons.findIndex(x=>x.id===l.id);const n=unit.lessons[i+1];if(n)document.getElementById("les-"+n.id).scrollIntoView({behavior:"smooth",block:"start"})}
  }));
 });
}
function lessonBlock(c,l,prog){
 const resume=(prog.resume&&prog.resume[l.id])||0;
 const dur=Math.max(20,Math.round(l.min*60));
 const hint=resume>2?`<p class="resume">${t("resume_at")} · ${clock(resume)} / ${clock(dur)}</p>`:"";
 return `<article class="lessonblock" id="les-${l.id}">
  <h3>${esc(l.title)}</h3>
  <p class="muted">${ico(PATH.clock,14)} ${fmtMin(l.min)}</p>
  ${hint}
  <div class="trailer" id="stage-${l.id}"></div>
  <p>${esc(t("lesson_blurb"))}</p>
 </article>`;
}
function clock(s){s=Math.floor(s);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function courseTabs(c,on){
 const item=(key,href,label)=>`<a class="${on===key?"on":""}" href="${href}">${label}</a>`;
 return `<nav class="tabsbar tabsnav">
  ${item("info","course.html?id="+c.id,t("dk_info"))}
  ${item("content","learn.html?id="+c.id+"&unit="+unitOf(buildSyllabus(c)),t("dk_content"))}
  ${item("community","forum.html?id="+c.id,t("dk_community"))}
  ${item("projects","course.html?id="+c.id+"&tab=projects",t("dk_projects"))}
 </nav>`;
}
function rateCard(c){
 if(!EFSStore.owns(c.id))return "";
 const prog=EFSStore.prog(c.id);
 if(prog.dismissRate)return "";
 if(EFSStore.reviews(c.id).some(r=>EFSStore.user()&&r.userId===EFSStore.user().id))return "";
 return `<div class="ratecard"><button type="button" class="x" onclick="EFSStore.dismissRate(${c.id});renderLearn()" aria-label="×">×</button>
  <h3>${t("rate_q")}</h3><p>${t("rate_p")}</p>
  <a class="btn" href="course.html?id=${c.id}&tab=info#reviews">${t("rate_btn")}</a></div>`;
}
function taskToggle(id,on){if(!EFSStore.user()){toast(t("need_login"));renderLearn();return}EFSStore.toggleTask(cid(),id,on)}
function markUnit(on){
 if(!EFSStore.user()){toast(t("need_login"));return}
 const c=courseById(cid());const syl=buildSyllabus(c);const code=unitOf(syl);
 const unit=syl.units.find(u=>u.code===code);
 EFSStore.toggleUnit(c.id,code,on,unit.lessons.map(l=>l.id));
 renderLearn();
}
function dlRes(name){
 const blob=new Blob([t("res_ph")+"\n\n"+name+"\n"],{type:"text/plain"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="eFlight-placeholder.txt";a.click();
}
window.onLang=renderLearn;
window.addEventListener("popstate",renderLearn);
renderLearn();
