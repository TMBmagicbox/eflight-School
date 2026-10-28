function poster(c){return "assets/img/"+(IMG_MAP[c.k]||"hero1.jpg")}
function renderMy(){
 const root=$("app");if(!root)return;
 const u=EFSStore.user();
 if(!u){root.innerHTML=`<div class="wrap" style="padding:40px 0"><h1>${t("my_h")}</h1><p>${t("need_login")}</p><a class="btn" href="account.html?next=my-courses.html">${t("login")}</a></div>`;return}
 const certId=+new URLSearchParams(location.search).get("cert");
 const owned=EFSStore.purchases().map(p=>courseById(p.courseId)).filter(Boolean);
 const cards=owned.map(c=>{
  const syl=buildSyllabus(c);const st=EFSStore.stats(c.id,syl.lessons.length);
  const last=st.last|| (syl.lessons[0]&&syl.lessons[0].id);
  return `<article class="gcard" style="display:grid;grid-template-columns:160px 1fr;gap:0"><img src="${poster(c)}" alt="" style="height:100%"><div style="padding:12px"><b>${esc(c.t[lang])}</b>
   <div class="progbar" style="margin:8px 0"><i style="width:${st.pct}%"></i></div><small>${st.pct}% · ${st.done}/${syl.lessons.length}</small>
   <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><a class="btn s" href="learn.html?id=${c.id}&lesson=${encodeURIComponent(last||"")}">${st.done?t("continue_lbl"):t("open_player")}</a>
   ${st.complete?`<a class="btn s" href="my-courses.html?cert=${c.id}">${t("pl_cert")}</a>`:""}</div></div></article>`;
 }).join("")||`<p>${t("empty_my")}</p><a class="btn" href="courses.html">${t("n_courses")}</a>`;
 let cert="";
 if(certId){
  const c=courseById(certId);const syl=c&&buildSyllabus(c);const st=c&&EFSStore.stats(c.id,syl.lessons.length);
  if(c&&st.complete)cert=`<article class="cert" id="cert"><img src="assets/img/logo.png" alt="eFlight School"><p>${t("cert_h")}</p><h2>${esc(u.name)}</h2><p>${t("cert_done")}</p><h3>${esc(c.t[lang])}</h3><p>${new Date().toLocaleDateString()}</p><p class="phbanner">${t("cert_demo")}</p><button class="btn no-print" onclick="print()">${t("cert_print")}</button></article>`;
 }
 root.innerHTML=`<section class="pagehead"><div class="wrap"><h1>${t("my_h")}</h1><p>${esc(u.name)}</p></div></section>
  <section><div class="wrap"><div class="demo-strip" style="border-radius:12px;margin-bottom:16px">${t("co2_demo")}</div>
  ${cert}<div class="gallery" style="grid-template-columns:1fr">${cards}</div>
  <form onsubmit="return redeemMy(event)" style="display:flex;gap:8px;margin-top:20px;max-width:420px"><input name="code" placeholder="${esc(t("redeem_ph"))}" required><button class="btn">${t("dk_redeem")}</button></form>
  </div></section>`;
}
function redeemMy(ev){ev.preventDefault();const r=EFSStore.redeem(new FormData(ev.target).get("code"));toast(r.ok?t("code_ok"):t("code_bad"));if(r.ok)renderMy();return false}
window.onLang=renderMy;
renderMy();
