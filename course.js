/* Domestika-style landing for one catalog course. */
let tab="info", trailer;
function cid(){return +new URLSearchParams(location.search).get("id")||1}
function poster(c){return "assets/img/"+(IMG_MAP[c.k]||"hero1.jpg")}
function when(ts){const d=Date.now()-ts;const m=Math.round(d/60000);if(m<60)return m+" min";const h=Math.round(m/60);if(h<48)return h+" h";return Math.round(h/24)+" d"}

function buyBox(c, syl){
 const pct=discountPct(c), own=EFSStore.owns(c.id), sum=EFSStore.reviewSummary(c.id);
 const price=own?`<p>${t("co2_own")}</p><a class="btn" href="learn.html?id=${c.id}">${t("open_player")}</a>`
  :`<div class="pricebig">$${c.p} <s>$${c.o}</s></div><div class="offtag">${pct}% ${t("dk_off")}</div>
    <a class="btn" href="confirm.html?id=${c.id}">${ico(PATH.card,16)} ${t("dk_buy")}</a>
    <a class="btn ghost" href="confirm.html?id=${c.id}&gift=1">${t("dk_gift")}</a>
    <form class="redeem" onsubmit="return redeemInline(event,${c.id})"><input name="code" placeholder="${esc(t("redeem_ph"))}"><button class="btn ghost" type="submit">${t("dk_redeem")}</button></form>`;
 return `<div class="buycard"><div class="lbl">${t("dk_by")}</div><h2>${esc(c.t[lang])}</h2>${price}
  <ul class="checks"><li>${t("dk_forever")}</li><li>${t("dk_pace")}</li></ul></div>
  <div class="regcard"><div>${t("dk_regular")}</div><b>$${c.o}</b></div>
  <ul class="facts">
   <li>${ico(PATH.star,16,true)} ${sum.positive==null?"—":sum.positive+"%"} ${t("dk_positive")} (${sum.count})</li>
   <li>${ico(PATH.users,16)} ${sum.students} ${t("dk_students")}</li>
   <li>${ico(PATH.film,16)} ${syl.lessons.length} ${t("lessons")} · ${t("dk_ph_banner").split(".")[0]}</li>
   <li>${ico(PATH.clock,16)} ${c.h} h · ${c.n} ${t("lessons")}</li>
   <li>${ico(PATH.gauge,16)} ${t("dk_level")}: ${t("l_"+c.l)}</li>
   <li>${ico(PATH.headphones?PATH.headset:PATH.radio,16)} ${t("audio_note")}</li>
  </ul>
  <div class="teachmini"><img src="assets/img/logo.png" alt=""><div><b>${esc(t("sy_teacher"))}</b><br><small>${esc(t("sy_role"))}</small></div></div>`;
}
function redeemInline(ev,id){ev.preventDefault();const u=EFSStore.user();if(!u){location.href="account.html?next="+encodeURIComponent(location.pathname+location.search);return false}
 const r=EFSStore.redeem(new FormData(ev.target).get("code"));toast(r.ok?t("code_ok"):t("code_bad"));if(r.ok)location.href="my-courses.html";return false}

function lessonCards(c,syl,limit){
 const img=poster(c);
 return syl.lessons.slice(0,limit||6).map(l=>`<a class="lcard" href="${EFSStore.owns(c.id)||l===syl.lessons[0]?"learn.html?id="+c.id+"&lesson="+encodeURIComponent(l.id):"confirm.html?id="+c.id}">
  <div class="im"><img src="${img}" alt=""><span>${ico('<polygon points="6 3 20 12 6 21 6 3"/>',12,true)}</span></div>
  <div><b>${esc(l.title)}</b><small>${fmtMin(l.min)} · ${t("pl_preview")}</small></div></a>`).join("");
}
function curriculum(c,syl){
 return syl.units.map(u=>`<div class="unit"><div><span class="ucode">${esc(u.code)}</span><b>${esc(u.title)}</b></div><ul>${u.lessons.map(l=>`<li>${ico(PATH.film,16)} ${esc(l.title)} <small style="color:var(--mut)">${fmtMin(l.min)}</small></li>`).join("")}</ul></div>`).join("");
}
function reviewsBlock(c){
 const list=EFSStore.reviews(c.id);
 const mine=EFSStore.user();
 const form=mine?`<form onsubmit="return postReview(event,${c.id})" class="coform" style="margin:12px 0"><b>${t("dk_your_review")}</b>
  <label><input type="radio" name="pos" value="1" checked> ${t("dk_pos")}</label>
  <label><input type="radio" name="pos" value="0"> ${t("dk_neg")}</label>
  <textarea name="text" required rows="3" placeholder="${esc(t("dk_your_review"))}"></textarea>
  <button class="btn s">${t("dk_send")}</button></form>`:`<p><a href="account.html?next=${encodeURIComponent("course.html?id="+c.id)}">${t("login")}</a></p>`;
 const items=list.map(r=>`<article class="rev"><div class="avatar">${esc(r.name.slice(0,1).toUpperCase())}</div><div><b>${esc(r.name)}</b> <small>${r.positive?"👍":"👎"} · ${when(r.at)}</small><p>${esc(r.text)}</p><button class="likebtn" onclick="EFSStore.likeReview('${r.id}');renderCourse()">${t("pl_like")} ${r.likes.length}</button></div></article>`).join("");
 return `<h2>${t("dk_reviews")}</h2><p class="phbanner">${t("dk_no_reviews")}</p>${form}${items||""}`;
}
function postReview(ev,id){ev.preventDefault();const fd=new FormData(ev.target);const r=EFSStore.addReview(id,fd.get("pos")==="1",fd.get("text"));if(!r.ok)toast(t("acc_exists"));renderCourse();return false}
function projectsBlock(c){
 const list=EFSStore.projects(c.id);
 const cards=list.map(p=>`<article class="gcard">${p.image?`<img src="${p.image}" alt="">`:`<div class="phg"></div>`}<p><b>${esc(p.title)}</b><br>${esc(p.name)}</p></article>`).join("");
 const form=EFSStore.user()?`<form onsubmit="return postProject(event,${c.id})" style="margin-top:12px"><input name="title" required placeholder="${esc(t("dk_proj_title"))}"><input name="file" type="file" accept="image/*"><button class="btn s" style="margin-top:8px">${t("dk_add_proj")}</button></form>`:"";
 return `<h2>${t("dk_stu")}</h2><p>${t("dk_empty_proj")}</p><div class="gallery">${cards}</div>${form}`;
}
function postProject(ev,id){
 ev.preventDefault();
 const fd=new FormData(ev.target);const file=fd.get("file");
 const go=(img)=> {const r=EFSStore.addProject(id,fd.get("title"),img);if(!r.ok)toast(t("acc_fields"));renderCourse()};
 if(file&&file.size){if(file.size>280000){toast(t("acc_fields"));return false}const fr=new FileReader();fr.onload=()=>go(fr.result);fr.readAsDataURL(file)}
 else go("");
 return false;
}
function infoPanels(c,syl){
 const topics=t("p_"+c.k+"_topics").split("|");
 const d=t("p_"+c.k+"_d");
 return `<p class="phbanner">${t("dk_ph_banner")}</p>
  <h2>${esc(c.t[lang])}</h2><p>${esc(d)}</p><p>${esc(t("ft_desc"))}</p>
  <h2 style="margin-top:22px">${t("dk_learn")}</h2><p>${syl.lessons.length} ${t("lessons")}</p>
  <div class="lesson-grid">${lessonCards(c,syl,6)}</div>
  <p style="margin:8px 0 18px"><button class="textbtn" onclick="tab='content';renderCourse()">${t("dk_view_all")}</button></p>
  <h2>${t("dk_included")}</h2>${topics.map(x=>`<p>${esc(x)}</p>`).join("")}
  <h2 style="margin-top:18px">${t("dk_project")}</h2><p>${esc(t("sy_project"))}</p>
  <div id="projects">${projectsBlock(c)}</div>
  <h2 style="margin-top:22px">${t("dk_who")}</h2><p>${esc(t("sy_who").replace("{title}",c.t[lang]))}</p>
  <h2 style="margin-top:18px">${t("dk_req")}</h2><p>${esc(t("sy_req"))}</p>
  <div id="reviews" style="margin-top:22px">${reviewsBlock(c)}</div>
  <h2 style="margin-top:22px">${t("dk_instructor")}</h2>
  <div class="teachmini"><img src="assets/img/logo.png" alt=""><div><b>${esc(t("sy_teacher"))}</b><br>${esc(t("sy_role"))}<p>${esc(t("sy_team"))} ${esc(t("ft_desc"))}</p></div></div>`;
}
function renderCourse(){
 const c=courseById(cid());const root=$("app");if(!c||!root)return;
 const syl=buildSyllabus(c);const sum=EFSStore.reviewSummary(c.id);const saved=EFSStore.saved(c.id);
 document.title=c.t[lang]+" | eFlight School";
 const main=tab==="content"?`<h2>${t("dk_content")}</h2>${curriculum(c,syl)}`
  :tab==="community"?(EFSStore.owns(c.id)?`<h2>${t("dk_community")}</h2><p><a class="btn" href="learn.html?id=${c.id}">${t("pl_com")}</a></p>`:`<h2>${t("dk_community")}</h2><p>${ico(PATH.lock,18)} ${t("dk_lock")}</p>`)
  :tab==="projects"?projectsBlock(c)
  :infoPanels(c,syl);
 root.innerHTML=`<div class="mini" id="mini"><div class="wrap"><img src="${poster(c)}" alt=""><b>${esc(c.t[lang])}</b><a class="btn s" href="${EFSStore.owns(c.id)?"learn.html?id="+c.id:"confirm.html?id="+c.id}">${EFSStore.owns(c.id)?t("continue_lbl"):t("dk_buy")}</a></div></div>
  <div class="wrap course-layout"><div>
   <div class="bc"><a href="index.html">${t("n_home")}</a> › <a href="courses.html">${t("n_courses")}</a> › ${esc(c.t[lang])}</div>
   ${c.r>=4.9?`<span class="badge">${t("l_"+c.l).toUpperCase()}</span>`:`<span class="badge">${t("l_"+c.l)}</span>`}
   <h1 class="ctitle">${esc(c.t[lang])}</h1>
   <p class="byline">${t("dk_by")} ${esc(t("sy_teacher"))}, ${esc(t("sy_role"))}</p>
   <div class="statbox">
    <div>${ico(PATH.star,16,true)} ${sum.positive==null?"—":sum.positive+"%"} ${t("dk_positive")} (${sum.count} ${t("dk_reviews")})</div>
    <div>${ico(PATH.users,16)} ${sum.students} ${t("dk_students")}</div>
    <div>${t("audio_lbl")}: ${t("audio_note")}</div>
   </div>
   <div class="tabsbar">
    ${[["info","dk_info"],["content","dk_content"],["community","dk_community"],["projects","dk_projects"]].map(([k,lab])=>`<button class="${tab===k?"on":""}" onclick="tab='${k}';renderCourse()">${k==="community"&&!EFSStore.owns(c.id)?ico(PATH.lock,14)+" ":""}${t(lab)}</button>`).join("")}
   </div>
   ${tab==="info"?`<div class="trailer" id="trailer"></div><div class="rowacts"><button onclick="shareCourse()">${t("dk_share")}</button><button onclick="saveCourse(${c.id})">${saved?t("dk_listed"):t("dk_list")}</button></div>`:""}
   ${main}
   ${tab==="info"?`<h2 style="margin-top:28px">${t("dk_content")}</h2>${curriculum(c,syl)}
    <h2 style="margin-top:28px">${t("dk_expect")}</h2><div class="expect">${[1,2,3,4,5,6].map(i=>`<article><h3>${t("ex"+i+"h")}</h3><p>${t("ex"+i+"p")}</p></article>`).join("")}</div>
    <h2 style="margin-top:28px">${t("dk_faq")}</h2>${["a","b","c","d"].map(k=>`<details><summary>${t("fq_"+k)}</summary><p>${t("fa_"+k)}</p></details>`).join("")}
    <h2 style="margin-top:28px">${t("dk_related")}</h2><div class="rel">${COURSES.filter(x=>x.id!==c.id).slice(0,4).map(x=>`<a href="course.html?id=${x.id}"><img src="${poster(x)}" alt=""><div><small>${t("l_"+x.l)}</small><b>${esc(x.t[lang])}</b><p>$${x.p} <s>$${x.o}</s></p></div></a>`).join("")}</div>`:""}
  </div><aside class="buycol">${buyBox(c,syl)}</aside></div>
  <div class="mobuy"><b>$${c.p}</b><a class="btn" href="${EFSStore.owns(c.id)?"learn.html?id="+c.id:"confirm.html?id="+c.id}">${EFSStore.owns(c.id)?t("continue_lbl"):t("dk_buy")}</a></div>`;
 if(tab==="info"){
  const box=$("trailer");
  if(trailer)trailer.stop();
  trailer=mountPlayer(box,{poster:poster(c),title:c.t[lang],seconds:12,playLabel:t("dk_trailer")});
 }
}
function shareCourse(){const url=location.href;if(navigator.clipboard)navigator.clipboard.writeText(url);toast(url)}
function saveCourse(id){if(!EFSStore.user()){toast(t("need_login"));return}EFSStore.toggleSaved(id);toast(t("saved_ok"));renderCourse()}
window.addEventListener("scroll",()=>{const m=$("mini");if(!m)return;m.classList.toggle("on",scrollY>520)});
window.onLang=renderCourse;
renderCourse();
