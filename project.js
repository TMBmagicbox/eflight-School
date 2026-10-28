/* Final-project editor and gallery. The gallery stays empty until this student publishes. */
function projectPanel(c){
 const list=EFSStore.projects(c.id);
 const box=EFSStore.owns(c.id)?`<div class="publishbox"><span>${ico(PATH.clipboard,22)}</span><div><b>${t("proj_box")}</b><br><a class="btn" href="project.html?id=${c.id}">${t("proj_pub")}</a></div></div>`:"";
 const cards=list.map(p=>`<a class="pcard" href="project.html?id=${c.id}&project=${p.id}"><span class="phg">${p.image?`<img src="${p.image}" alt="">`:""}</span><b>${esc(p.title)}</b><small>${esc(p.name)}</small></a>`).join("");
 return `${box}<h2>${t("dk_stu")}</h2>${cards?`<div class="pgallery">${cards}</div>`:`<p class="phbanner">${t("proj_gallery_empty")}</p>`}`;
}
function renderProject(){
 const q=new URLSearchParams(location.search);
 const c=courseById(+q.get("id")||1);const root=$("app");if(!c||!root)return;
 if(!EFSStore.owns(c.id)){root.innerHTML=`<div class="wrap" style="padding:40px 0"><p>${ico(PATH.lock,18)} ${t("dk_lock")}</p><a class="btn" href="confirm.html?id=${c.id}">${t("dk_buy")}</a></div>`;return}
 const existing=q.get("project")&&EFSStore.project(q.get("project"));
 const mine=existing&&EFSStore.user()&&existing.userId===EFSStore.user().id?existing:null;
 const model=mine?{id:mine.id,title:mine.title,intro:mine.intro||"",materials:mine.materials||"",steps:mine.steps&&mine.steps.length?mine.steps:[{title:"",image:mine.image||"",link:""}]}
  :{id:"",title:"",intro:"",materials:"",steps:[{title:"",image:"",link:""}]};
 window.__proj=JSON.parse(JSON.stringify(model));
 document.title=t("proj_box")+" | "+c.t[lang];
 root.innerHTML=`<div class="wrap editor">
  <div class="bc"><a href="course.html?id=${c.id}&tab=projects">${esc(c.t[lang])}</a> › ${t("dk_projects")}</div>
  <header class="edhead"><img src="${coursePoster(c)}" alt=""><div><input id="ptitle" value="${esc(model.title)}" placeholder="${esc(t("dk_proj_title"))}"></div>
   <button class="btn ghost" onclick="saveProj(true)">${t("proj_draft")}</button>
   <button class="btn" onclick="saveProj(false)">${t("proj_publish")}</button></header>
  <p class="phbanner">${t("proj_help")}</p>
  <section class="stepcard"><h2>${t("proj_intro")}</h2><textarea id="pintro" rows="4" placeholder="${esc(t("proj_intro_ph"))}">${esc(model.intro)}</textarea></section>
  <section class="stepcard"><h2>${t("proj_mat")}</h2><textarea id="pmats" rows="3" placeholder="${esc(t("proj_mat_ph"))}">${esc(model.materials)}</textarea></section>
  <div id="steps"></div>
  <button class="textbtn" onclick="addStep()">+ ${t("proj_add")}</button>
 </div>`;
 drawSteps();
}
function drawSteps(){
 const box=document.getElementById("steps");if(!box)return;
 box.innerHTML=window.__proj.steps.map((s,i)=>`<section class="stepcard"><h2>${t("proj_step")} ${i+1}</h2>
  <input value="${esc(s.title)}" placeholder="${esc(t("proj_step_ph"))}" oninput="__proj.steps[${i}].title=this.value">
  <label class="filepick">${t("proj_img")}<input type="file" accept="image/*" onchange="readStepImg(event,${i})"></label>
  ${s.image?`<img class="stepimg" src="${s.image}" alt="">`:""}
  <input value="${esc(s.link)}" placeholder="${esc(t("proj_link"))}" oninput="__proj.steps[${i}].link=this.value">
 </section>`).join("");
}
function addStep(){window.__proj.steps.push({title:"",image:"",link:""});drawSteps()}
function readStepImg(ev,i){
 const file=ev.target.files&&ev.target.files[0];if(!file)return;
 if(file.size>180000){toast(t("acc_fields"));return}
 const fr=new FileReader();fr.onload=()=>{window.__proj.steps[i].image=fr.result;drawSteps()};fr.readAsDataURL(file);
}
function saveProj(asDraft){
 const c=+new URLSearchParams(location.search).get("id");
 const data=window.__proj;
 data.title=document.getElementById("ptitle").value;
 data.intro=document.getElementById("pintro").value;
 data.materials=document.getElementById("pmats").value;
 data.courseId=c;data.draft=asDraft;
 const r=EFSStore.saveProject(data);
 if(!r.ok){toast(t("acc_fields"));return}
 toast(asDraft?t("proj_draft"):t("proj_publish"));
 if(!asDraft)location.href="course.html?id="+c+"&tab=projects";
 else if(!data.id)location.href="project.html?id="+c+"&project="+r.id;
}
if(document.body.dataset.page==="project"){window.onLang=renderProject;renderProject()}
