function poster(c){return coursePoster(c)}
function myStatus(st){
 const n=st.unitsDone, y=st.unitCount;
 if(st.complete)return t("st_all").replace("{n}",n).replace("{y}",y);
 if(n===1)return t("st_first");
 if(n>1)return t("st_some").replace("{n}",n).replace("{y}",y);
 return t("st_start");
}
function renderMy(){
 const root=$("app");if(!root)return;
 const u=EFSStore.user();
 if(!u){root.innerHTML=`<div class="wrap" style="padding:40px 0"><h1>${t("my_h")}</h1><p>${t("need_login")}</p><a class="btn" href="account.html?next=my-courses.html">${t("login")}</a></div>`;return}
 const certId=+new URLSearchParams(location.search).get("cert");
 const owned=EFSStore.purchases().map(p=>courseById(p.courseId)).filter(Boolean);
 const cards=owned.map(c=>{
  const syl=buildSyllabus(c);const st=EFSStore.stats(c.id,syl.lessons.length,syl.units.length);
  const prog=EFSStore.prog(c.id);
  const open=syl.units.find(u=>!(prog.units||{})[u.code])||syl.units[0];
  const action=st.complete
    ?`<a class="btn" href="forum.html?id=${c.id}">${t("go_forum")}</a>`
    :`<a class="btn" href="learn.html?id=${c.id}&unit=${open.code}">${t("continue_lbl")}</a>`;
  return `<article class="mycard">
   <a class="mythumb" href="learn.html?id=${c.id}&unit=${open.code}"><img src="${poster(c)}" alt=""><span>${ico('<polygon points="6 3 20 12 6 21 6 3"/>',18,true)}</span></a>
   <div>
    <small class="kicker">${esc(t("c_"+c.k).toUpperCase())}</small>
    <h2><a href="course.html?id=${c.id}">${esc(c.t[lang])}</a></h2>
    <p class="byline">${t("dk_by")} ${esc(t("sy_teacher"))}</p>
    <div class="progbar thin"><i style="width:${st.pct}%"></i></div>
    <p class="statusline">${esc(myStatus(st))}</p>
    <div class="myacts">${action}<a class="textbtn" href="my-courses.html?cert=${c.id}">${t("certs")}</a></div>
   </div></article>`;
 }).join("")||`<p>${t("empty_my")}</p><a class="btn" href="courses.html">${t("n_courses")}</a>`;
 let cert="";
 if(certId){
  const c=courseById(certId);const syl=c&&buildSyllabus(c);const st=c&&EFSStore.stats(c.id,syl.lessons.length,syl.units.length);
  if(c&&st.complete)cert=`<article class="cert" id="cert"><img src="assets/img/logo.png" alt="eFlight School"><p>${t("cert_h")}</p><h2>${esc(u.name)}</h2><p>${t("cert_done")}</p><h3>${esc(c.t[lang])}</h3><p>${new Date().toLocaleDateString()}</p><p class="phbanner">${t("cert_demo")}</p><button class="btn no-print" onclick="print()">${t("cert_print")}</button></article>`;
  else if(c)cert=`<p class="phbanner">${t("cert_need")}</p>`;
 }
 const more=COURSES.filter(c=>!owned.some(o=>o.id===c.id)).slice(0,3).map(c=>`<a class="relcard" href="course.html?id=${c.id}"><img src="${poster(c)}" alt=""><b>${esc(c.t[lang])}</b><span>$${c.p}</span></a>`).join("");
 root.innerHTML=`<section class="pagehead"><div class="wrap"><h1>${t("my_h")}</h1><p>${esc(u.name)}</p></div></section>
  <section><div class="wrap">
  ${cert}<div class="mylist">${cards}</div>
  <form onsubmit="return redeemMy(event)" class="redeemrow"><input name="code" placeholder="${esc(t("redeem_ph"))}" required><button class="btn">${t("dk_redeem")}</button></form>
  <h2 style="margin-top:28px">${t("dk_related")}</h2><div class="relgrid">${more}</div>
  </div></section>`;
}
function redeemMy(ev){ev.preventDefault();const r=EFSStore.redeem(new FormData(ev.target).get("code"));toast(r.ok?t("code_ok"):t("code_bad"));if(r.ok)renderMy();return false}
window.onLang=renderMy;
renderMy();
