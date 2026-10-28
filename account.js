function renderAccount(){
 const root=$("app");if(!root)return;
 const u=EFSStore.user();
 const next=new URLSearchParams(location.search).get("next");
 if(u){root.innerHTML=`<div class="authbox"><h1>${t("acc_h")}</h1><p><b>${esc(u.name)}</b><br>${esc(u.email)}</p>
  <p style="margin:12px 0"><a class="btn" href="my-courses.html">${t("my_h")}</a></p>
  <button class="btn o" style="color:var(--navy);border-color:var(--navy)" onclick="EFSStore.logout();applyLang()">${t("logout")}</button>
  <p class="phbanner" style="margin-top:16px">${t("co2_demo")}</p></div>`;return}
 root.innerHTML=`<div class="authbox"><h1>${t("acc_h")}</h1>
  <div class="ptabs"><button id="t-in" class="on" onclick="flip('in')">${t("acc_in")}</button><button id="t-up" onclick="flip('up')">${t("acc_up")}</button></div>
  <form id="f-in" class="coform" onsubmit="return goAcc(event,'in')"><input name="email" type="email" required placeholder="${esc(t("acc_email"))}"><input name="password" type="password" required placeholder="${esc(t("acc_pass"))}"><button class="btn">${t("acc_in")}</button></form>
  <form id="f-up" class="coform" hidden onsubmit="return goAcc(event,'up')"><input name="name" required placeholder="${esc(t("acc_name"))}"><input name="email" type="email" required placeholder="${esc(t("acc_email"))}"><input name="password" type="password" required placeholder="${esc(t("acc_pass"))}"><button class="btn">${t("acc_up")}</button></form>
  <p class="phbanner">${t("co2_demo")}</p></div>`;
}
function flip(mode){["in","up"].forEach(m=>{$("f-"+m).hidden=m!==mode;$("t-"+m).classList.toggle("on",m===mode)})}
function goAcc(ev,mode){ev.preventDefault();const fd=new FormData(ev.target);
 const r=mode==="up"?EFSStore.register(fd.get("name"),fd.get("email"),fd.get("password")):EFSStore.login(fd.get("email"),fd.get("password"));
 if(!r.ok){toast(t(r.error==="exists"?"acc_exists":r.error==="bad"?"acc_bad":"acc_fields"));return false}
 const next=new URLSearchParams(location.search).get("next");
 if(next)location.href=next;else {applyLang()}
 return false}
window.onLang=renderAccount;
renderAccount();
