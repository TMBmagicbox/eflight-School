/* Lógica común a todas las páginas: cabecera, pie, idiomas, catálogo y carrito */
const B=document.body.dataset,PAGE=B.page,PCAT=B.cat||null;
const KEYS=["all","atc","private","instrument","commercial"];
const PAGES={atc:"atc.html",private:"private-pilot.html",instrument:"instrument.html",commercial:"commercial.html"};
const IMG_MAP={atc:"atc.jpg",private:"private.jpg",instrument:"instruments.jpg",commercial:"comercial.jpg"};
const COURSE_IMG={1:"c1.jpg",2:"c2.jpg",3:"private.jpg",4:"hero2.jpg",5:"c5.jpg",6:"c6.jpg",7:"instruments.jpg",8:"instruments2.jpg",9:"comercial.jpg",10:"c10.jpg",11:"comercial2.jpg",12:"flex.jpg"};
function coursePoster(c){return "assets/img/"+(COURSE_IMG[c.id]||IMG_MAP[c.k]||"hero1.jpg")}
const SLIDER_IMGS={
  atc:["atc.jpg","atc2.jpg"],
  private:["private.jpg","private2.jpg"],
  instrument:["instruments.jpg","instruments2.jpg"],
  commercial:["comercial.jpg","comercial2.jpg"]
};
const GR={atc:"#2ea3f2,#12305f",private:"#00b894,#0b3d5e",instrument:"#e17055,#2d3436",commercial:"#d63031,#0b1d3a"};
/* Iconos planos (Lucide, ISC). El trazo usa currentColor para seguir los colores del sitio. */
function ico(inner,size=18,fill=false){return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill?"currentColor":"none"}" stroke="${fill?"none":"currentColor"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`}
const PATH={
 headset:'<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
 radio:'<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
 plane:'<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
 wind:'<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',
 cloud:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
 compass:'<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
 gauge:'<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
 trend:'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
 takeoff:'<path d="M2 22h20"/><path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z"/>',
 settings:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
 clipboard:'<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
 star:'<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
 clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
 film:'<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
 trash:'<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
 menu:'<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
 x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
 chev:'<path d="m6 9 6 6 6-6"/>',
chevR:'<path d="m9 18 6-6-6-6"/>',
 check:'<path d="M20 6 9 17l-5-5"/>',
 card:'<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
 bank:'<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
 alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
 lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
 up:'<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
 down:'<path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/>'
};
function courseIcon(key,size=22){return ico(PATH[key]||PATH.plane,size)}
function catIcon(k,size=48){return ico({atc:PATH.radio,private:PATH.plane,instrument:PATH.gauge,commercial:PATH.takeoff}[k]||PATH.plane,size)}
function stars(n){return `<span class="starline">${ico(PATH.star,13,true).repeat(n)}</span>`}
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
  <li class="only-m"><a href="my-courses.html" ${on("mycourses")} data-i18n="my_h"></a></li>
  <li class="only-m"><a href="account.html" class="acct-link" ${on("account")} data-i18n="login"></a></li>
 </ul></nav>
 <div style="display:flex;gap:14px;align-items:center">
  <a href="my-courses.html" class="only-d" data-i18n="my_h"></a>
  <a href="account.html" class="only-d acct-link" data-i18n="login"></a>
  <div class="langs" id="langs">
   <button class="lcur" onclick="event.stopPropagation();toggleLang()" aria-label="Language"><img id="curflag" src="https://flagcdn.com/w40/es.png" alt=""><span class="arr">${ico(PATH.chev,14)}</span></button>
   <ul class="lmenu" id="lmenu">
    <li data-l="es" onclick="setLang('es')"><img src="https://flagcdn.com/w40/es.png" alt="">Español</li>
    <li data-l="en" onclick="setLang('en')"><img src="https://flagcdn.com/w40/us.png" alt="">English</li>
    <li data-l="pt" onclick="setLang('pt')"><img src="https://flagcdn.com/w40/br.png" alt="">Português</li>
    <li data-l="fr" onclick="setLang('fr')"><img src="https://flagcdn.com/w40/fr.png" alt="">Français</li>
   </ul>
  </div>
  <button class="cartbtn" onclick="toggleCart()" aria-label="Cart"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><b id="cnt">0</b></button>
  <button class="menu" onclick="$('nav').classList.toggle('open')" aria-label="Menu">${ico(PATH.menu,26)}</button>
 </div></div></header>`;
 $("ftr").innerHTML=`<footer><div class="wrap"><div class="fg">
  <div><div class="logo" style="margin-bottom:10px"><img src="assets/img/logo-white.png" alt="eFlight School"></div><p data-i18n="ft_desc"></p><p style="margin-top:10px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> +1 (786) 846 3505<br><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> info@eflightschool.com</p></div>
  <div><h4 data-i18n="ft_explore"></h4><ul><li><a href="courses.html" data-i18n="n_courses"></a></li><li><a href="about.html" data-i18n="n_about"></a></li><li><a href="faq.html">FAQ</a></li><li><a href="contact.html" data-i18n="n_contact"></a></li></ul></div>
  <div><h4 data-i18n="ft_legal"></h4><ul><li data-i18n="terms"></li><li data-i18n="privacy"></li></ul></div>
 </div><div class="copy" data-i18n="copy"></div></div></footer>
 <div id="ov" onclick="toggleCart()"></div>
 <aside id="drawer"><header><b data-i18n="cart_h"></b><button class="cartbtn" onclick="toggleCart()" aria-label="Close">${ico(PATH.x,22)}</button></header>
 <div id="items"></div><div class="tot"><div class="row"><span data-i18n="total"></span><span id="total">$0</span></div><button class="btn" style="width:100%" onclick="checkout()" data-i18n="checkout"></button></div></aside>
 <div id="toast"></div>`;
}

/* ---------- Idioma ---------- */
function toggleLang(){$("langs").classList.toggle("open")}
document.addEventListener("click",()=>{const l=$("langs");l&&l.classList.remove("open")});
function setLang(l){lang=l;localStorage.setItem("lang",l);applyLang()}
function pageTitle(){
 if(PCAT)return t("p_"+PCAT+"_h")+" | eFlight School";
 const named={home:t("title"),checkout:t("co_h")+" | eFlight School",confirm:t("co2_h")+" | eFlight School",about:t("ab_title")+" | eFlight School",courses:t("cat_h")+" | eFlight School",faq:t("faq_h")+" | eFlight School",contact:t("ct_h")+" | eFlight School",mycourses:t("my_h")+" | eFlight School",account:t("acc_h")+" | eFlight School",learn:t("my_h")+" | eFlight School",course:t("n_courses")+" | eFlight School",forum:t("my_h")+" | eFlight School",project:t("my_h")+" | eFlight School"};
 return named[PAGE]||t("title");
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
 if(window.EFSStore){const u=EFSStore.user();document.querySelectorAll("a.acct-link, a.only-d[href='account.html']").forEach(a=>{
  if(u){a.textContent=u.name;a.title=u.name;a.removeAttribute("data-i18n")}
  else{a.dataset.i18n="login";a.textContent=t("login");a.removeAttribute("title")}
 })}
 if(window.onLang)onLang();
 if(PCAT) initCatSlider();
}

/* ---------- Tarjetas de categorías (inicio) ---------- */
function imgBox(k,cls){return `<div class="${cls}" style="background:linear-gradient(135deg,${GR[k]})"><span class="ph">${catIcon(k,64)}</span><img src="assets/img/${IMG_MAP[k]||k+'.jpg'}" alt="${t('p_'+k+'_h')}" onerror="this.remove()"></div>`}
function renderCats(){
 const box=$("catcards");if(!box)return;
 box.innerHTML=["atc","private","instrument","commercial"].map(k=>`<a class="ccard" href="${PAGES[k]}">${imgBox(k,"cimg")}<div class="cbody"><h3>${t("p_"+k+"_h")}</h3><p>${t("p_"+k+"_d")}</p><span class="more">${t("cat_view")} ${ico(PATH.chevR,14)}</span></div></a>`).join("");
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
 <div class="course"><div class="thumb" style="background:linear-gradient(135deg,${c.g})"><span class="lvl">${t('l_'+c.l)}</span><span class="ph">${courseIcon(c.e,42)}</span><img src="${coursePoster(c)}" alt="" onerror="this.remove()"></div>
 <div class="cb"><small style="color:var(--sky);font-weight:700">${t('c_'+c.k)}</small><h3><a href="course.html?id=${c.id}">${c.t[lang]}</a></h3>
 <div class="meta"><span>${ico(PATH.clock,14)} ${c.h} h</span><span>${ico(PATH.film,14)} ${c.n} ${t('lessons')}</span></div>
 <div class="stars">${stars(Math.round(c.r))} <span style="color:var(--mut)">${c.r}</span></div>
 <div class="cf"><div class="price">$${c.p}<s>$${c.o}</s></div><span style="display:flex;gap:6px"><a class="btn s" style="background:#fff;color:var(--navy);border:2px solid var(--navy)" href="course.html?id=${c.id}">${t('details')}</a><button class="btn s" onclick="add(${c.id})">${t('add')}</button></span></div></div></div>`).join("")||`<p style='text-align:center;grid-column:1/-1;color:var(--mut)'>${t('none')}</p>`;
}

/* ---------- Carrito ---------- */
function save(){localStorage.setItem("cart",JSON.stringify(cart));drawCart()}
function add(id){if(cart.includes(id))return toast(t("toast_in"));cart.push(id);save();toast(t("toast_added"))}
function rm(id){cart=cart.filter(i=>i!==id);save()}
function drawCart(){
 $("cnt").textContent=cart.length;
 const list=cart.map(i=>COURSES.find(c=>c.id===i));
 $("items").innerHTML=list.map(c=>`<div class="it"><div class="ic" style="background:linear-gradient(135deg,${c.g})">${courseIcon(c.e,22)}</div><div><b>${c.t[lang]}</b><br>$${c.p}</div><button onclick="rm(${c.id})" aria-label="Remove">${ico(PATH.trash,18)}</button></div>`).join("")||`<p style='color:var(--mut);padding:20px 0'>${t('empty')}</p>`;
 $("total").textContent="$"+list.reduce((s,c)=>s+c.p,0);
}
function toggleCart(){$("drawer").classList.toggle("open");$("ov").classList.toggle("on")}
function checkout(){if(!cart.length)return toast(t("toast_empty"));location.href="checkout.html"}
function toast(m){const e=$("toast");e.textContent=m;e.classList.add("on");setTimeout(()=>e.classList.remove("on"),2200)}

shell();applyLang();
