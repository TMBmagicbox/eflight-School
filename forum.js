/* Course forum. Empty until the signed-in student posts. No sample threads. */
function forumCourse(){return courseById(+new URLSearchParams(location.search).get("id")||1)}
function ago(ts){const m=Math.round((Date.now()-ts)/60000);if(m<60)return m+" min";const h=Math.round(m/60);if(h<48)return h+" h";return Math.round(h/24)+" d"}
function rich(s){
 let h=esc(s);
 h=h.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>');
 h=h.replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>");
 h=h.replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g,"$1<i>$2</i>");
 h=h.replace(/^&gt; (.+)$/gm,"<blockquote>$1</blockquote>");
 h=h.replace(/^- (.+)$/gm,"<li>$1</li>");
 h=h.replace(/(?:<li>[\s\S]*?<\/li>\s*)+/g,m=>"<ul>"+m+"</ul>");
 return h.replace(/\n/g,"<br>");
}
function wrapSel(id,pre,post){
 const el=document.getElementById(id);if(!el)return;
 const a=el.selectionStart,b=el.selectionEnd,v=el.value;
 el.value=v.slice(0,a)+pre+v.slice(a,b)+post+v.slice(b);
 el.focus();
}
function forumSub(c,on){
 return `<nav class="fsub"><a class="${on==="foro"?"on":""}" href="forum.html?id=${c.id}">${t("forum_foro")}</a><a class="${on==="act"?"on":""}" href="forum.html?id=${c.id}&view=act">${t("forum_act")}</a><a class="${on==="stu"?"on":""}" href="forum.html?id=${c.id}&view=stu">${t("forum_stu")}</a></nav>`;
}
function topicRows(c,q){
 const rows=EFSStore.topics(c.id).filter(row=>{
  if(!q)return true;const hay=(row.title+" "+row.body+" "+row.practice).toLowerCase();return hay.indexOf(q)>=0;
 });
 if(!rows.length)return `<p class="phbanner">${t("forum_empty")}</p>`;
 return rows.map(row=>{
  const replies=EFSStore.posts(row.id).length;
  return `<a class="trow" href="forum.html?id=${c.id}&topic=${row.id}">
   <span class="avatar">${esc(row.name.slice(0,1).toUpperCase())}</span>
   <span><span class="pchip ${row.practice?"":"hide"}">${esc(row.practice)}</span><b>${esc(row.title)}</b><br><small>${t("forum_by")} ${esc(row.name)} · ${ico(PATH.heart||PATH.star,14)} ${row.likes.length} · ${replies}</small></span>
   <span class="tmeta">${row.pinned?t("forum_pinned"):ago(row.at)}</span></a>`;
 }).join("");
}
function forumPanel(c){
 if(!EFSStore.owns(c.id))return `<h2>${t("dk_community")}</h2><p>${ico(PATH.lock,18)} ${t("dk_lock")}</p>`;
 const q=new URLSearchParams(location.search).get("q")||"";
 return `<div class="forumhead"><h2>${t("forum_h")}</h2><a class="btn ghost" href="forum.html?id=${c.id}&new=1">${t("forum_add")}</a></div>
  <form class="fsearch" action="forum.html" method="get"><input type="hidden" name="id" value="${c.id}"><input name="q" value="${esc(q)}" placeholder="${esc(t("forum_search"))}"></form>
  ${topicRows(c,q.toLowerCase())}`;
}
function practiceOptions(c,selected){
 const syl=buildSyllabus(c);
 const chips=[].concat(...syl.units.map(u=>u.tasks.map(task=>task.chip)));
 return `<option value="">${t("forum_none_practice")}</option>`+chips.map(ch=>`<option ${ch===selected?"selected":""}>${esc(ch)}</option>`).join("");
}
function renderForum(){
 const c=forumCourse();const root=$("app");if(!c||!root)return;
 if(!EFSStore.owns(c.id)){root.innerHTML=`<div class="wrap" style="padding:40px 0"><h1>${esc(c.t[lang])}</h1><p>${ico(PATH.lock,18)} ${t("dk_lock")}</p><a class="btn" href="confirm.html?id=${c.id}">${t("dk_buy")}</a></div>`;return}
 const q=new URLSearchParams(location.search);
 const view=q.get("view")||"foro";
 const topicId=q.get("topic");
 const showNew=q.get("new")==="1";
 const practice=q.get("practice")||"";
 document.title=t("forum_h")+" | "+c.t[lang];
 let main="";
 if(topicId)main=threadHTML(c,topicId);
 else if(view==="act")main=activityHTML(c);
 else if(view==="stu")main=studentsHTML(c);
 else main=`<div class="forumhead"><h2>${t("forum_h")}</h2></div>
  <form class="fsearch" onsubmit="return forumSearch(event)"><input id="fq" value="${esc(q.get("q")||"")}" placeholder="${esc(t("forum_search"))}"></form>
  ${showNew||practice?composer(c,practice):`<p><button class="btn ghost" onclick="location.href='forum.html?id=${c.id}&new=1'">${t("forum_add")}</button></p>`}
  ${topicRows(c,(q.get("q")||"").toLowerCase())}`;
 root.innerHTML=`<div class="wrap forumlayout"><div>
  <div class="bc"><a href="my-courses.html">${t("my_h")}</a> › <a href="course.html?id=${c.id}">${esc(c.t[lang])}</a> › ${t("dk_community")}</div>
  <nav class="tabsbar tabsnav"><a href="course.html?id=${c.id}">${t("dk_info")}</a><a href="learn.html?id=${c.id}">${t("dk_content")}</a><a class="on" href="forum.html?id=${c.id}">${t("dk_community")}</a><a href="course.html?id=${c.id}&tab=projects">${t("dk_projects")}</a></nav>
  <h1 class="ctitle">${esc(c.t[lang])}</h1>
  ${main}
 </div><aside class="uside">${forumSub(c,topicId?"foro":view)}${rateCardForum(c)}</aside></div>
 <a class="backtop" href="#">${t("back_top")}</a>`;
}
function composer(c,practice){
 return `<form class="composer" onsubmit="return postTopic(event)">
  <input name="title" required placeholder="${esc(t("forum_title"))}">
  <div class="tools"><button type="button" onclick="wrapSel('fbody','**','**')">B</button><button type="button" onclick="wrapSel('fbody','*','*')">I</button><button type="button" onclick="wrapSel('fbody','[','](https://)')">${t("tool_link")}</button><button type="button" onclick="wrapSel('fbody','\\n- ','')">≡</button><button type="button" onclick="wrapSel('fbody','\\n> ','')">“</button></div>
  <textarea id="fbody" name="body" required rows="5" placeholder="${esc(t("forum_body"))}"></textarea>
  <label>${t("forum_practice")} <select name="practice">${practiceOptions(c,practice)}</select></label>
  <label class="pin"><input type="checkbox" name="pin"> ${t("forum_pin")}</label>
  <button class="btn">${t("forum_add")}</button></form>`;
}
function postTopic(ev){
 ev.preventDefault();if(!EFSStore.user()){toast(t("need_login"));return false}
 const fd=new FormData(ev.target);const c=forumCourse();
 const r=EFSStore.addTopic(c.id,fd.get("title"),fd.get("body"),fd.get("practice"),fd.get("pin"));
 if(!r.ok){toast(t("acc_fields"));return false}
 location.href="forum.html?id="+c.id+"&topic="+r.id;return false;
}
function forumSearch(ev){ev.preventDefault();const c=forumCourse();location.href="forum.html?id="+c.id+"&q="+encodeURIComponent(document.getElementById("fq").value);return false}
function threadHTML(c,id){
 const row=EFSStore.topic(id);
 if(!row||row.courseId!==c.id)return `<p>${t("forum_empty")}</p>`;
 const me=EFSStore.user();
 const following=me&&row.followers.indexOf(me.id)>=0;
 const sort=new URLSearchParams(location.search).get("sort")||"new";
 let posts=EFSStore.posts(id).filter(p=>!p.parentId);
 posts=posts.sort((a,b)=>sort==="old"?a.at-b.at:b.at-a.at);
 const replies=EFSStore.posts(id);
 return `<p><a href="forum.html?id=${c.id}">← ${t("forum_h")}</a></p>
  <h2>${row.practice?`<span class="pchip">${esc(row.practice)}</span> `:""}${esc(row.title)}</h2>
  <p class="muted">${t("forum_by")} ${esc(row.name)} · ${ago(row.at)} · ${replies.length} ${t("forum_replies")}</p>
  <div class="tbody">${rich(row.body)}</div>
  <div class="facts"><button class="btn s" onclick="EFSStore.toggleFollow('${row.id}');renderForum()">${following?t("forum_following"):t("forum_follow")}</button>
   <button class="btn s" onclick="EFSStore.toggleTopicLike('${row.id}');renderForum()">${t("pl_like")} ${row.likes.length}</button>
   ${me&&me.id===row.userId?`<button class="textbtn" onclick="EFSStore.togglePin('${row.id}');renderForum()">${row.pinned?t("forum_pinned"):t("forum_pin")}</button>`:""}
  </div>
  <div class="sortrow"><b>${replies.length} ${t("forum_replies")}</b>
   <a href="forum.html?id=${c.id}&topic=${id}&sort=new">${t("forum_sort_new")}</a>
   <a href="forum.html?id=${c.id}&topic=${id}&sort=old">${t("forum_sort_old")}</a></div>
  ${posts.map(p=>postHTML(id,p,replies)).join("")||`<p class="phbanner">${t("forum_no_replies")}</p>`}
  <form class="composer" onsubmit="return postReply(event,'${id}','')">
   <div class="tools"><button type="button" onclick="wrapSel('rbody','**','**')">B</button><button type="button" onclick="wrapSel('rbody','*','*')">I</button><button type="button" onclick="wrapSel('rbody','[','](https://)')">${t("tool_link")}</button></div>
   <textarea id="rbody" name="text" required rows="4" placeholder="${esc(t("forum_body"))}"></textarea>
   <button class="btn">${t("forum_pub")}</button></form>`;
}
function postHTML(topicId,p,all){
 const kids=all.filter(x=>x.parentId===p.id);
 return `<article class="comment"><span class="avatar">${esc(p.name.slice(0,1).toUpperCase())}</span><div><b>${esc(p.name)}</b> <small>${ago(p.at)}</small><div>${rich(p.text)}</div>
  <button class="likebtn" onclick="document.getElementById('re-${p.id}').hidden=false">${t("pl_reply")}</button>
  <button class="likebtn" onclick="EFSStore.togglePostLike('${p.id}');renderForum()">${t("pl_like")} ${p.likes.length}</button>
  <form id="re-${p.id}" hidden onsubmit="return postReply(event,'${topicId}','${p.id}')"><input name="text" required><button class="btn s">${t("pl_reply")}</button></form>
  ${kids.map(k=>`<div class="reply"><b>${esc(k.name)}</b> <small>${ago(k.at)}</small><div>${rich(k.text)}</div><button class="likebtn" onclick="EFSStore.togglePostLike('${k.id}');renderForum()">${t("pl_like")} ${k.likes.length}</button></div>`).join("")}
 </div></article>`;
}
function postReply(ev,topicId,parent){ev.preventDefault();if(!EFSStore.user()){toast(t("need_login"));return false}
 EFSStore.addPost(topicId,new FormData(ev.target).get("text"),parent||null);renderForum();return false}
function activityHTML(c){
 const syl=buildSyllabus(c);const prog=EFSStore.prog(c.id);
 const rows=syl.units.map(u=>u.tasks.map(task=>`<div class="taskrow"><label><input type="checkbox" ${prog.tasks&&prog.tasks[task.id]?"checked":""} onchange="EFSStore.toggleTask(${c.id},'${task.id}',this.checked)"> ${esc(task.title)}</label> <span class="pchip">${esc(task.chip)}</span> <a href="forum.html?id=${c.id}&new=1&practice=${encodeURIComponent(task.chip)}">${t("task_open")}</a></div>`).join("")).join("");
 return `<h2>${t("activity_h")}</h2><p>${t("forum_empty_act")}</p>${rows}`;
}
function studentsHTML(c){
 const n=EFSStore.reviewSummary(c.id).students;
 const u=EFSStore.user();
 return `<h2>${t("forum_stu")}</h2><p>${t("students_n").replace("{n}",n)}</p><p class="phbanner">${t("students_empty")}</p>${u?`<p><span class="avatar">${esc(u.name.slice(0,1).toUpperCase())}</span> ${esc(u.name)}</p>`:""}`;
}
function rateCardForum(c){
 const prog=EFSStore.prog(c.id);const u=EFSStore.user();
 if(prog.dismissRate||EFSStore.reviews(c.id).some(r=>u&&r.userId===u.id))return "";
 return `<div class="ratecard"><button type="button" class="x" onclick="EFSStore.dismissRate(${c.id});renderForum()">×</button><h3>${t("rate_q")}</h3><p>${t("rate_p")}</p><a class="btn" href="course.html?id=${c.id}#reviews">${t("rate_btn")}</a></div>`;
}
if(document.body.dataset.page==="forum"){window.onLang=renderForum;renderForum()}
