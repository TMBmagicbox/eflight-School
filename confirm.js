/* Confirm-purchase screen. Demo charge lives in EFSStore.payments.charge. */
let method="card", code="";
function cid(){return +new URLSearchParams(location.search).get("id")}
function gift(){return new URLSearchParams(location.search).get("gift")==="1"}
function poster(c){return coursePoster(c)}
function renderConfirm(){
 const c=courseById(cid());const root=$("app");if(!c||!root){if(root)root.innerHTML=`<div class="wrap" style="padding:40px 0"><p>${t("none")}</p></div>`;return}
 const u=EFSStore.user();const priced=EFSStore.price(c,code);const own=EFSStore.owns(c.id)&&!gift();
 const auth=u?`<p><b>${esc(u.name)}</b> · ${esc(u.email)} <button class="textbtn" onclick="EFSStore.logout();renderConfirm()">${t("logout")}</button></p>`
  :`<p>${t("co2_have")} <button class="textbtn" onclick="$('loginf').hidden=false;$('signupf').hidden=true">${t("acc_in")}</button></p>
    <form id="signupf" class="coform" onsubmit="return authGo(event,'up')"><input name="name" placeholder="${esc(t("acc_name"))}" required><input name="email" type="email" placeholder="${esc(t("acc_email"))}" required><input name="password" type="password" placeholder="${esc(t("acc_pass"))}" required><button class="btn">${t("co2_create")}</button></form>
    <form id="loginf" hidden class="coform" style="margin-top:8px" onsubmit="return authGo(event,'in')"><input name="email" type="email" placeholder="${esc(t("acc_email"))}" required><input name="password" type="password" placeholder="${esc(t("acc_pass"))}" required><button class="btn">${t("co2_in")}</button></form>`;
 root.innerHTML=`<div class="demo-strip">${t("co2_demo")} EFLIGHT10 = 10%.</div>
  <section class="pagehead"><div class="wrap"><h1>${t("co2_h")}</h1></div></section>
  <section><div class="wrap course-layout"><div class="cobox">
   ${auth}
   ${gift()?`<label>${t("co2_gift_for")}<input id="giftfor" type="email" placeholder="name@email.com"></label>`:""}
   <h2 style="margin-top:18px">${t("co2_pay")}</h2>
   <label class="payopt ${method==="card"?"on":""}"><input type="radio" name="m" ${method==="card"?"checked":""} onchange="method='card';renderConfirm()"> ${ico(PATH.card,18)} ${t("co2_card")}</label>
   <label class="payopt ${method==="paypal"?"on":""}"><input type="radio" name="m" ${method==="paypal"?"checked":""} onchange="method='paypal';renderConfirm()"> ${ico(PATH.bank,18)} ${t("co2_pp")}</label>
   <p class="sec">${ico(PATH.lock,16)} ${t("co2_legal")}</p>
   ${own?`<p>${t("co2_own")}</p><a class="btn" href="my-courses.html">${t("co2_go")}</a>`:`<button class="btn" style="margin-top:12px" onclick="payNow()" ${u?"":"disabled"}>${t("dk_buy")} · $${priced.amount.toFixed(2)}</button>`}
  </div><aside class="buycol"><div class="buycard"><h2>${t("co2_sum")}</h2>
   <div class="it"><img src="${poster(c)}" alt="" style="width:64px;height:48px;object-fit:cover;border-radius:8px"><div><b>${esc(c.t[lang])}</b><br><s>$${c.o}</s> $${priced.amount.toFixed(2)}</div></div>
   <form class="codeform" onsubmit="return applyCode(event)"><input id="code" value="${esc(code)}" placeholder="${esc(t("co2_code"))}"><button class="btn s">${t("co2_apply")}</button></form>
   <div class="row" style="display:flex;justify-content:space-between;font-weight:800"><span>${t("co2_total")}</span><span>$${priced.amount.toFixed(2)}</span></div>
   <p id="msg"></p>
  </div></aside></div></section>`;
}
function authGo(ev,mode){ev.preventDefault();const fd=new FormData(ev.target);
 const r=mode==="up"?EFSStore.register(fd.get("name"),fd.get("email"),fd.get("password")):EFSStore.login(fd.get("email"),fd.get("password"));
 if(!r.ok){toast(t(r.error==="exists"?"acc_exists":r.error==="bad"?"acc_bad":"acc_fields"));return false}
 applyLang();return false}
function applyCode(ev){ev.preventDefault();const c=courseById(cid());const raw=$("code").value;const p=EFSStore.price(c,raw);code=p.off?p.code:"";toast(p.off?t("code_ok"):t("code_bad"));renderConfirm();return false}
async function payNow(){
 const c=courseById(cid());if(!EFSStore.user()){toast(t("need_login"));return}
 const btn=document.querySelector(".cobox .btn");if(btn)btn.disabled=true;
 const res=await EFSStore.checkout({course:c,method,code,gift:gift(),giftFor:($("giftfor")||{}).value||""});
 if(res.redirect)return;
 if(res.needsPaypal){toast("PayPal");if(btn)btn.disabled=false;return}
 if(res.giftCode){$("msg").textContent=t("gift_made")+" "+res.giftCode;toast(res.giftCode);return}
 cart=cart.filter(id=>id!==c.id);save();
 location.href="my-courses.html?bought="+c.id;
}
window.onLang=renderConfirm;
renderConfirm();
