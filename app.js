/* Lógica común a todas las páginas: cabecera, pie, idiomas, catálogo y carrito */
const B=document.body.dataset,PAGE=B.page,PCAT=B.cat||null;
const KEYS=["all","atc","private","instrument","commercial"];
const PAGES={atc:"atc.html",private:"private-pilot.html",instrument:"instrument.html",commercial:"commercial.html"};
const EMO={atc:"🎧",private:"🛩️",instrument:"🎛️",commercial:"🛫"};
const GR={atc:"#2ea3f2,#12305f",private:"#00b894,#0b3d5e",instrument:"#e17055,#2d3436",commercial:"#d63031,#0b1d3a"};
const FL={es:"es",en:"us",pt:"br",fr:"fr"};
const SUP=Object.keys(T);
let lang=localStorage.getItem("lang")||"es";
if(!SUP.includes(lang))lang="es";
let cart=JSON.parse(localStorage.getItem("cart")||"[]"),cat=PCAT||"all";
const t=k=>(T[lang]&&T[lang][k])||T.es[k]||k;
const $=id=>document.getElementById(id);
const on=p=>PAGE===p||(p==="courses"&&PCAT)?"class='act'":"";

/* ---------- Cabecera y pie ---------- */
function shell(){
 $("hdr").innerHTML=`<header><div class="wrap nav">
 <a href="index.html" class="logo"><img src="assets/img/logo-white.png" alt="eFlight School"></a>
 <nav id="nav"><ul>
  <li><a href="index.html" ${on("home")} data-i18n="n_home"></a></li>
  <li><a href="about.html" ${on("about")} data-i18n="n_about"></a></li>
  <li class="has-sub"><a href="courses.html" ${on("courses")} data-i18n="n_courses"></a>
   <ul class="sub">
    <li><a href="courses.html" data-i18n="n_allc"></a></li>
    ${["atc","private","instrument","commercial"].map(k=>`<li><a href="${PAGES[k]}" data-i18n="c_${k}"></a></li>`).join("")}
   </ul></li>
  <li><a href="faq.html" ${on("faq")} data-i18n="n_faq"></a></li>
  <li><a href="contact.html" ${on("contact")} data-i18n="n_contact"></a></li>
 </ul></nav>
 <div style="display:flex;gap:14px;align-items:center">
  <div class="langs" id="langs">
   <button class="lcur" onclick="event.stopPropagation();toggleLang()" aria-label="Language"><img id="curflag" src="https://flagcdn.com/w40/es.png" alt=""><span class="arr">▾</span></button>
   <ul class="lmenu" id="lmenu">
    <li data-l="es" onclick="setLang('es')"><img src="https://flagcdn.com/w40/es.png" alt="">Español</li>
    <li data-l="en" onclick="setLang('en')"><img src="https://flagcdn.com/w40/us.png" alt="">English</li>
    <li data-l="pt" onclick="setLang('pt')"><img src="https://flagcdn.com/w40/br.png" alt="">Português</li>
    <li data-l="fr" onclick="setLang('fr')"><img src="https://flagcdn.com/w40/fr.png" alt="">Français</li>
   </ul>
  </div>
  <button class="cartbtn" onclick="toggleCart()" aria-label="Cart">🛒<b id="cnt">0</b></button>
  <button class="menu" onclick="$('nav').classList.toggle('open')">☰</button>
 </div></div></header>`;
 $("ftr").innerHTML=`<footer><div class="wrap"><div class="fg">
  <div><div class="logo" style="margin-bottom:10px"><img src="assets/img/logo-white.png" alt="eFlight School"></div><p data-i18n="ft_desc"></p><p style="margin-top:10px">📞 +1 (786) 846 3505<br>✉️ info@eflightschool.com</p></div>
  <div><h4 data-i18n="ft_explore"></h4><ul><li><a href="courses.html" data-i18n="n_courses"></a></li><li><a href="about.html" data-i18n="n_about"></a></li><li><a href="faq.html">FAQ</a></li><li><a href="contact.html" data-i18n="n_contact"></a></li></ul></div>
  <div><h4 data-i18n="ft_legal"></h4><ul><li data-i18n="terms"></li><li data-i18n="privacy"></li></ul></div>
 </div><div class="copy" data-i18n="copy"></div></div></footer>
 <div id="ov" onclick="toggleCart()"></div>
 <aside id="drawer"><header><b data-i18n="cart_h"></b><button class="cartbtn" onclick="toggleCart()">✕</button></header>
 <div id="items"></div><div class="tot"><div class="row"><span data-i18n="total"></span><span id="total">$0</span></div><button class="btn" style="width:100%" onclick="checkout()" data-i18n="checkout"></button></div></aside>
 <div id="toast"></div>`;
}

/* ---------- Idioma ---------- */
function toggleLang(){$("langs").classList.toggle("open")}
document.addEventListener("click",()=>{const l=$("langs");l&&l.classList.remove("open")});
function setLang(l){lang=l;localStorage.setItem("lang",l);applyLang()}
function pageTitle(){
 if(PCAT)return t("p_"+PCAT+"_h")+" | eFlight School";
 return {home:t("title"),about:t("ab_title")+" | eFlight School",courses:t("cat_h")+" | eFlight School",faq:t("faq_h")+" | eFlight School",contact:t("ct_h")+" | eFlight School"}[PAGE]||t("title");
}
function applyLang(){
 document.documentElement.lang=lang;
 document.title=pageTitle();
 const m=document.querySelector("meta[name=description]");if(m)m.content=PCAT?t("p_"+PCAT+"_d"):t("desc");
 $("curflag").src="https://flagcdn.com/w40/"+FL[lang]+".png";
 document.querySelectorAll("#lmenu li").forEach(li=>li.classList.toggle("on",li.dataset.l===lang));
 $("langs").classList.remove("open");
 renderCats();renderCatPage();buildFilters();
 document.querySelectorAll("[data-i18n]").forEach(e=>e.innerHTML=t(e.dataset.i18n));
 document.querySelectorAll("[data-i18n-ph]").forEach(e=>e.placeholder=t(e.dataset.i18nPh));
 const pl=$("pil");if(pl){const x=t("pil").split("|");pl.innerHTML=`<h2>${x[0]}</h2><h2>${x[1]}</h2><p>${x[2]}</p>`}
 render();drawCart();
}

/* ---------- Tarjetas de categorías (inicio) ---------- */
function imgBox(k,cls){return `<div class="${cls}" style="background:linear-gradient(135deg,${GR[k]})"><span class="ph">${EMO[k]}</span><img src="assets/img/${k}.jpg" alt="${t('p_'+k+'_h')}" onerror="this.remove()"></div>`}
function renderCats(){
 const box=$("catcards");if(!box)return;
 box.innerHTML=["atc","private","instrument","commercial"].map(k=>`<a class="ccard" href="${PAGES[k]}">${imgBox(k,"cimg")}<div class="cbody"><h3>${t("p_"+k+"_h")}</h3><p>${t("p_"+k+"_d")}</p><span class="more">${t("cat_view")} →</span></div></a>`).join("");
}

/* ---------- Página de categoría ---------- */
function atcBlock(){return `<section style="background:#fff"><div class="wrap"><p style="max-width:820px;margin-bottom:26px">${t("atc_intro")}</p><h2 style="margin-bottom:16px">${t("atc_kh")}</h2><div class="grid4">${[1,2,3,4,5].map(i=>{const x=t("atc_k"+i).split("|");return `<div class="feat"><h3>${x[0]}</h3><p>${x[1]}</p></div>`}).join("")}</div><p style="margin-top:26px;color:var(--mut);max-width:820px">${t("atc_outro")}</p></div></section>`}
function renderCatPage(){
 const main=$("main");if(!main||!PCAT)return;
 const k=PCAT,topics=t("p_"+k+"_topics").split("|");
 main.innerHTML=`<section class="phero"><div class="wrap">
  <div class="bc"><a href="index.html">${t("n_home")}</a> › <a href="courses.html">${t("n_courses")}</a> › ${t("p_"+k+"_h")}</div>
  <h1>${t("p_"+k+"_h")}</h1><p>${t("p_"+k+"_d")}</p></div></section>
 <section><div class="wrap two">
  ${imgBox(k,"cimg big")}
  <div><h2>${t("learn_h")}</h2><ul class="topics">${topics.map(x=>`<li>${x}</li>`).join("")}</ul></div>
 </div></section>
 ${k==="atc"?atcBlock():""}
 <section style="background:#fff"><div class="wrap"><div class="sh"><h2>${t("courses_in")}</h2></div><div class="courses" id="courses"></div></div></section>
 <section class="ctab"><div class="wrap"><h2>${t("cta_h")}</h2><p>${t("cta_p")}</p><a class="btn" href="courses.html">${t("n_allc")}</a></div></section>`;
}

/* ---------- Catálogo ---------- */
function buildFilters(){
 const f=$("filters");if(!f)return;
 f.innerHTML=KEYS.map(k=>`<button class="chip ${k===cat?'on':''}" onclick="setCat('${k}')">${t('c_'+k)}</button>`).join("");
}
function setCat(k){cat=k;buildFilters();render()}
function render(){
 const box=$("courses");if(!box)return;
 const qe=$("q"),q=qe?qe.value.toLowerCase():"";
 const list=COURSES.filter(c=>(cat==="all"||c.k===cat)&&c.t[lang].toLowerCase().includes(q));
 box.innerHTML=list.map(c=>`
 <div class="course"><div class="thumb" style="background:linear-gradient(135deg,${c.g})"><span class="lvl">${t('l_'+c.l)}</span>${c.e}</div>
 <div class="cb"><small style="color:var(--sky);font-weight:700">${t('c_'+c.k)}</small><h3>${c.t[lang]}</h3>
 <div class="meta"><span>⏱ ${c.h} h</span><span>🎬 ${c.n} ${t('lessons')}</span></div>
 <div class="stars">${"★".repeat(Math.round(c.r))} <span style="color:var(--mut)">${c.r}</span></div>
 <div class="cf"><div class="price">$${c.p}<s>$${c.o}</s></div><button class="btn s" onclick="add(${c.id})">${t('add')}</button></div></div></div>`).join("")||`<p style='text-align:center;grid-column:1/-1;color:var(--mut)'>${t('none')}</p>`;
}

/* ---------- Carrito ---------- */
function save(){localStorage.setItem("cart",JSON.stringify(cart));drawCart()}
function add(id){if(cart.includes(id))return toast(t("toast_in"));cart.push(id);save();toast(t("toast_added"))}
function rm(id){cart=cart.filter(i=>i!==id);save()}
function drawCart(){
 $("cnt").textContent=cart.length;
 const list=cart.map(i=>COURSES.find(c=>c.id===i));
 $("items").innerHTML=list.map(c=>`<div class="it"><div class="ic" style="background:linear-gradient(135deg,${c.g})">${c.e}</div><div><b>${c.t[lang]}</b><br>$${c.p}</div><button onclick="rm(${c.id})">🗑</button></div>`).join("")||`<p style='color:var(--mut);padding:20px 0'>${t('empty')}</p>`;
 $("total").textContent="$"+list.reduce((s,c)=>s+c.p,0);
}
function toggleCart(){$("drawer").classList.toggle("open");$("ov").classList.toggle("on")}
function checkout(){if(!cart.length)return toast(t("toast_empty"));toast(t("toast_demo"))}
function toast(m){const e=$("toast");e.textContent=m;e.classList.add("on");setTimeout(()=>e.classList.remove("on"),2200)}

shell();applyLang();
