/* Simulador de pago: PayPal / Stripe. Sin claves = modo demo. */
const CFG=window.EFS_CONFIG||{};
const DEMO=!CFG.paypalClientId&&!CFG.stripePaymentLink;
let method=CFG.paypalClientId||!CFG.stripePaymentLink?"pp":"stripe",done=false,ppLoaded=false;
const items=()=>cart.map(i=>COURSES.find(c=>c.id===i)).filter(Boolean);
const total=()=>items().reduce((s,c)=>s+c.p,0);
function who(){const n=$("cn").value.trim(),e=$("ce").value.trim();return n&&/\S+@\S+\.\S+/.test(e)?{n,e}:null}
function finish(){done=true;cart=[];save();renderCheckout()}
function pickMethod(m){method=m;renderCheckout()}
function payBtn(){
 if(!who())return toast(t("co_need"));
 if(method==="stripe"&&CFG.stripePaymentLink){
  const u=new URL(CFG.stripePaymentLink);u.searchParams.set("prefilled_email",who().e);location.href=u.toString();return}
 $("pbtn").disabled=true;$("pbtn").textContent=t("co_proc");
 setTimeout(finish,1200); /* simulación */
}
function loadPayPal(){
 if(ppLoaded)return;ppLoaded=true;
 const s=document.createElement("script");
 s.src="https://www.paypal.com/sdk/js?client-id="+encodeURIComponent(CFG.paypalClientId)+"&currency="+(CFG.currency||"USD");
 s.onload=()=>paypal.Buttons({
  onClick:(d,a)=>who()?a.resolve():(toast(t("co_need")),a.reject()),
  createOrder:(d,a)=>a.order.create({purchase_units:[{description:"eFlight School",amount:{value:total().toFixed(2),currency_code:CFG.currency||"USD"}}]}),
  onApprove:(d,a)=>a.order.capture().then(finish),
  onError:()=>toast(t("co_err"))
 }).render("#ppbox");
 document.head.appendChild(s);
}
function renderCheckout(){
 const box=$("co");if(!box)return;
 if(done){box.innerHTML=`<div class="okbox"><div class="okic">${ico(PATH.check,32)}</div><h2>${t("co_ok_h")}</h2><p>${t("co_ok_p")}</p><a class="btn" href="courses.html">${t("co_back")}</a></div>`;return}
 const list=items();
 if(!list.length){box.innerHTML=`<div class="okbox"><p>${t("co_empty")}</p><a class="btn" href="courses.html">${t("co_back")}</a></div>`;return}
 const keep={n:($("cn")||{}).value||"",e:($("ce")||{}).value||""};
 const showPP=!!CFG.paypalClientId&&method==="pp";
 box.innerHTML=`<div class="cogrid">
 <div class="cobox"><h2>${t("co_info")}</h2><div class="coform"><input id="cn" placeholder="${t("ph_name")}" value="${keep.n}"><input id="ce" type="email" placeholder="${t("ph_mail")}" value="${keep.e}"></div>
  <h2 style="margin-top:26px">${t("co_pay")}</h2>
  <div class="tabs"><button class="${method==="pp"?"on":""}" onclick="pickMethod('pp')">${ico(PATH.bank,18)} ${t("co_pp")}</button><button class="${method==="stripe"?"on":""}" onclick="pickMethod('stripe')">${ico(PATH.card,18)} ${t("co_stripe")}</button></div>
  ${DEMO?`<div class="demo">${ico(PATH.alert,18)}<span>${t("co_demo")}</span></div>`:""}
  ${showPP?`<div id="ppbox"></div>`:`<button class="btn" id="pbtn" style="width:100%;margin-top:14px" onclick="payBtn()">${DEMO?t("co_sim"):(method==="pp"?t("co_btn_pp"):t("co_btn_stripe"))} · $${total()}</button>`}
  <p class="sec">${ico(PATH.lock,16)}<span>${t("co_secure")}</span></p></div>
 <div class="cobox sum"><h2>${t("co_sum")}</h2>${list.map(c=>`<div class="it"><div class="ic" style="background:linear-gradient(135deg,${c.g})">${courseIcon(c.e)}</div><div><b>${c.t[lang]}</b></div><span>$${c.p}</span></div>`).join("")}
  <div class="row"><span>${t("total")}</span><span>$${total()}</span></div></div></div>`;
 if(showPP)loadPayPal(),paypalRetry();
}
function paypalRetry(){if(window.paypal&&!$("ppbox").children.length)paypal.Buttons({
  onClick:(d,a)=>who()?a.resolve():(toast(t("co_need")),a.reject()),
  createOrder:(d,a)=>a.order.create({purchase_units:[{description:"eFlight School",amount:{value:total().toFixed(2),currency_code:CFG.currency||"USD"}}]}),
  onApprove:(d,a)=>a.order.capture().then(finish),onError:()=>toast(t("co_err"))}).render("#ppbox")}
window.onLang=renderCheckout;
renderCheckout();
