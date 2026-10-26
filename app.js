/* Lógica común a todas las páginas: cabecera, pie, idiomas, catálogo y carrito */
const B=document.body.dataset,PAGE=B.page,PCAT=B.cat||null;
const KEYS=["all","atc","private","instrument","commercial"];
const PAGES={atc:"atc.html",private:"private-pilot.html",instrument:"instrument.html",commercial:"commercial.html"};
const IMG_MAP={atc:"atc.jpg",private:"private.jpg",instrument:"instruments.jpg",commercial:"comercial.jpg"};
const SLIDER_IMGS={
  atc:["atc.jpg","atc2.jpg"],
  private:["private.jpg","private2.jpg"],
  instrument:["instruments.jpg","instruments2.jpg"],
  commercial:["comercial.jpg","comercial2.jpg"]
};
const ICONS={
  atc:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 12l4 2"/><circle cx="12" cy="12" r="2"/></svg>',
  private:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
  instrument:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 7v2M12 15v2M7 12h2M15 12h2"/></svg>',
  commercial:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12h20M12 2v20"/><path d="M4 6l8-4 8 4"/></svg>'
};
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
  <button class="cartbtn" onclick="toggleCart()" aria-label="Cart"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><b id="cnt">0</b></button>
  <button class="menu" onclick="$('nav').classList.toggle('open')">☰</button>
 </div></div></header>`;
 $("ftr").innerHTML=`<footer><div class="wrap"><div class="fg">
  <div><div class="logo" style="margin-bottom:10px"><img src="assets/img/logo-white.png" alt="eFlight School"></div><p data-i18n="ft_desc"></p><p style="margin-top:10px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> +1 (786) 846 3505<br><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> info@eflightschool.com</p></div>
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
 return {home:t("title"),checkout:t("co_h")+" | eFlight School",about:t("ab_title")+" | eFlight School",courses:t("cat_h")+" | eFlight School",faq:t("faq_h")+" | eFlight School",contact:t("ct_h")+" | eFlight School"}[PAGE]||t("title");
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
 if(window.onLang)onLang();
 if(PCAT) initCatSlider();
}

/* ---------- Tarjetas de categorías (inicio) ---------- */
function imgBox(k,cls){return `<div class="${cls}" style="background:linear-gradient(135deg,${GR[k]})"><span class="ph">${ICONS[k]||""}</span><img src="assets/img/${IMG_MAP[k]||k+'.jpg'}" alt="${t('p_'+k+'_h')}" onerror="this.remove()"></div>`}
function renderCats(){
 const box=$("catcards");if(!box)return;
 box.innerHTML=["atc","private","instrument","commercial"].map(k=>`<a class="ccard" href="${PAGES[k]}">${imgBox(k,"cimg")}<div class="cbody"><h3>${t("p_"+k+"_h")}</h3><p>${t("p_"+k+"_d")}</p><span class="more">${t("cat_view")} →</span></div></a>`).join("");
}

/* ---------- Página de categoría ---------- */
function atcBlock(){return `<section style="background:#fff"><div class="wrap"><p style="max-width:820px;margin-bottom:26px">${t("atc_intro")}</p><h2 style="margin-bottom:16px">${t("atc_kh")}</h2><div class="grid4">${[1,2,3,4,5].map(i=>{const x=t("atc_k"+i).split("|");return `<div class="feat"><h3>${x[0]}</h3><p>${x[1]}</p></div>`}).join("")}</div><p style="margin-top:26px;color:var(--mut);max-width:820px">${t("atc_outro")}</p></div></section>`}
function renderCatPage(){
 const main=$("main");if(!main||!PCAT)return;
 const k=PCAT,topics=t("p_"+k+"_topics").split("|");
 const slides=(SLIDER_IMGS[k]||[IMG_MAP[k]]).map((img,i)=>`<div class="slide ${i===0?'active':''}" style="background-image:url('assets/img/${img}')"></div>`).join('');
 main.innerHTML=`<section class="hero-slider cat-slider">
  <div class="slides">${slides}</div>
  <div class="wrap hero-content">
   <div class="bc"><a href="index.html">${t("n_home")}</a> › <a href="courses.html">${t("n_courses")}</a> › ${t("p_"+k+"_h")}</div>
   <h1>${t("p_"+k+"_h")}</h1>
   <p>${t("p_"+k+"_d")}</p>
  </div>
  <div class="slider-dots">${(SLIDER_IMGS[k]||[1]).map((_,i)=>`<span class="dot ${i===0?'active':''}" data-slide="${i}"></span>`).join('')}</div>
 </section>
 <section><div class="wrap two">
  ${imgBox(k,"cimg big")}
  <div><h2>${t("learn_h")}</h2><ul class="topics">${topics.map(x=>`<li>${x}</li>`).join("")}</ul></div>
 </div></section>
 ${k==="atc"?atcBlock():""}
 <section style="background:#fff"><div class="wrap"><div class="sh"><h2>${t("courses_in")}</h2></div><div class="courses" id="courses"></div></div></section>
 <section class="ctab"><div class="wrap"><h2>${t("cta_h")}</h2><p>${t("cta_p")}</p><a class="btn" href="courses.html">${t("n_allc")}</a></div></section>`;
}

function initCatSlider(){
 const slides=document.querySelectorAll('.cat-slider .slide');
 const dots=document.querySelectorAll('.cat-slider .dot');
 if(!slides.length) return;
 let current=0, timer;
 function goTo(n){slides[current].classList.remove('active');dots[current].classList.remove('active');current=n;slides[current].classList.add('active');dots[current].classList.add('active');}
 function next(){goTo((current+1)%slides.length);}
 function start(){timer=setInterval(next,6000);}
 dots.forEach(d=>d.addEventListener('click',()=>{goTo(+d.dataset.slide);clearInterval(timer);start();}));
 start();
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
 <div class="course"><div class="thumb" style="background:linear-gradient(135deg,${c.g})"><span class="lvl">${t('l_'+c.l)}</span>${ICONS[c.k]||""}</div>
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
 $("items").innerHTML=list.map(c=>`<div class="it"><div class="ic" style="background:linear-gradient(135deg,${c.g})">${ICONS[c.k]||""}</div><div><b>${c.t[lang]}</b><br>$${c.p}</div><button onclick="rm(${c.id})">🗑</button></div>`).join("")||`<p style='color:var(--mut);padding:20px 0'>${t('empty')}</p>`;
 $("total").textContent="$"+list.reduce((s,c)=>s+c.p,0);
}
function toggleCart(){$("drawer").classList.toggle("open");$("ov").classList.toggle("on")}
function checkout(){if(!cart.length)return toast(t("toast_empty"));location.href="checkout.html"}
function toast(m){const e=$("toast");e.textContent=m;e.classList.add("on");setTimeout(()=>e.classList.remove("on"),2200)}

shell();applyLang();
