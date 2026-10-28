/* Course player: video, syllabus, notes, comments, completion. */
let lessonId=null, player, pane="com";
function cid(){return +new URLSearchParams(location.search).get("id")||1}
function poster(c){return coursePoster(c)}
function current(syl){return syl.lessons.find(l=>l.id===lessonId)||syl.lessons[0]}
function go(id){lessonId=id;const u=new URL(location.href);u.searchParams.set("lesson",id);history.replaceState(null,"",u);if(EFSStore.user())EFSStore.setLast(cid(),id);renderLearn()}
function renderLearn(){
 const c=courseById(cid());const root=$("app");if(!c||!root)return;
 const syl=buildSyllabus(c);
 if(!lessonId)lessonId=new URLSearchParams(location.search).get("lesson")||(EFSStore.prog(c.id).last)||syl.lessons[0].id;
 const lesson=current(syl);const owned=EFSStore.owns(c.id);const preview=lesson===syl.lessons[0];
 const prog=EFSStore.prog(c.id);const st=EFSStore.stats(c.id,syl.lessons.length);
 document.title=lesson.title+" | "+c.t[lang];
 if(!owned&&!preview){root.innerHTML=`<div class="wrap" style="padding:40px 0"><h1>${esc(c.t[lang])}</h1><p>${ico(PATH.lock,18)} ${t("dk_lock")}</p><a class="btn" href="confirm.html?id=${c.id}">${t("dk_buy")} · $${c.p}</a></div>`;return}
 const idx=syl.lessons.findIndex(l=>l.id===lesson.id);
 const prev=syl.lessons[idx-1], next=syl.lessons[idx+1];
 const done=!!prog.done[lesson.id];
 root.innerHTML=`<div class="player">
  <div><div id="stage" class="trailer" style="border-radius:0"></div>
   <div class="pbody">
    <h1 style="font-size:1.4rem">${esc(lesson.title)}</h1>
    <p>${esc(c.t[lang])} · ${fmtMin(lesson.min)} · ${st.pct}% </p>
    <div class="progbar" style="margin:8px 0 14px"><i style="width:${st.pct}%"></i></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
     <button class="btn s" ${prev?"":"disabled"} onclick="${prev?`go('${prev.id}')`:""}">${t("pl_prev")}</button>
     <button class="btn s" onclick="mark(${!done})">${done?t("pl_undone"):t("pl_done")}</button>
     <button class="btn s" ${next?"":"disabled"} onclick="${next?`go('${next.id}')`:""}">${t("pl_next")}</button>
     ${st.complete?`<a class="btn s" href="my-courses.html?cert=${c.id}">${t("pl_cert")}</a>`:""}
    </div>
    <div class="ptabs" style="margin-top:16px">
     ${[["com","pl_com"],["notes","pl_notes"],["res","pl_res"]].map(([k,lab])=>`<button class="${pane===k?"on":""}" onclick="pane='${k}';renderLearn()">${t(lab)}</button>`).join("")}
    </div>
    <div id="pane"></div>
   </div></div>
  <aside class="side"><div style="padding:12px"><b>${esc(c.t[lang])}</b><div class="progbar" style="margin-top:8px"><i style="width:${st.pct}%"></i></div><small>${st.pct}% · ${st.done}/${syl.lessons.length}</small></div>
   ${syl.units.map(u=>`<div><div style="padding:8px 12px;font-weight:700;background:#f5f8fc">${esc(u.code)} ${esc(u.title)}</div>${u.lessons.map(l=>`<button class="lessbtn ${l.id===lesson.id?"on":""}" onclick="go('${l.id}')"><span class="tick ${prog.done[l.id]?"on":""}"></span><span>${esc(l.title)}<br><small style="color:var(--mut)">${fmtMin(l.min)}</small></span></button>`).join("")}</div>`).join("")}
  </aside></div>`;
 if(player)player.stop();
 player=mountPlayer($("stage"),{poster:poster(c),src:lesson.video,title:lesson.title,seconds:10,onEnded:()=>{if(EFSStore.user())mark(true)}});
 const paneEl=$("pane");
 if(pane==="notes"){
  const note=(prog.notes&&prog.notes[lesson.id])||"";
  paneEl.innerHTML=`<textarea class="note" id="note">${esc(note)}</textarea><button class="btn s" style="margin-top:8px" onclick="saveN()">${t("dk_send")}</button>`;
 }else if(pane==="res"){
  paneEl.innerHTML=`<p>${ico(PATH.clipboard,16)} ${esc(lesson.resource.name)}</p><p class="phbanner">${t("res_empty")}</p>`;
 }else paneEl.innerHTML=commentPane(c,lesson);
}
function commentPane(c,lesson){
 const all=EFSStore.comments(c.id,lesson.id);
 const top=all.filter(x=>!x.parentId);
 function one(cm,reply){
  const kids=all.filter(x=>x.parentId===cm.id).map(k=>one(k,true)).join("");
  return `<article class="comment ${reply?"reply":""}"><b>${esc(cm.name)}</b> <small>${new Date(cm.at).toLocaleString()}</small><p>${esc(cm.text)}</p>
   <button class="likebtn" onclick="likeC('${cm.id}')">${t("pl_like")} ${cm.likes.length}</button>
   ${reply?"":`<button class="likebtn" onclick="document.getElementById('re-${cm.id}').hidden=false">${t("pl_reply")}</button>
   <form id="re-${cm.id}" hidden onsubmit="return sendC(event,'${lesson.id}','${cm.id}')"><input name="text" required><button class="btn s">${t("pl_reply")}</button></form>`}
   ${kids}</article>`;
 }
 const form=EFSStore.user()?`<form onsubmit="return sendC(event,'${lesson.id}','')" style="margin-top:8px"><textarea name="text" required placeholder="${esc(t("pl_write"))}" rows="3"></textarea><button class="btn s">${t("dk_send")}</button></form>`:`<p><a href="account.html?next=${encodeURIComponent(location.pathname+location.search)}">${t("login")}</a></p>`;
 return (top.length?top.map(c=>one(c,false)).join(""):`<p>${t("pl_empty")}</p>`)+form;
}
function sendC(ev,lesson,parent){ev.preventDefault();if(!EFSStore.user()){toast(t("need_login"));return false}EFSStore.addComment(cid(),lesson,new FormData(ev.target).get("text"),parent||null);renderLearn();return false}
function likeC(id){if(!EFSStore.user()){toast(t("need_login"));return}EFSStore.likeComment(id);renderLearn()}
function mark(on){if(!EFSStore.user()){toast(t("need_login"));return}EFSStore.toggleDone(cid(),lessonId,on);renderLearn()}
function saveN(){if(!EFSStore.user()){toast(t("need_login"));return}EFSStore.saveNote(cid(),lessonId,$("note").value);toast(t("saved_ok"))}
window.onLang=renderLearn;
renderLearn();
