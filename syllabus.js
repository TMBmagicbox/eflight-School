/* Placeholder syllabus built from the category topics already in extra.js.
   Lesson ids stay stable across languages. Set lesson.video to a URL to
   replace the placeholder player. Real files are not shipped. */
function buildSyllabus(course){
 const topics=(t("p_"+course.k+"_topics")||"").split("|").filter(Boolean);
 const intro=[
  {id:course.id+"-l1",title:t("sy_welcome"),min:8,video:""},
  {id:course.id+"-l2",title:t("sy_how"),min:10,video:""}
 ];
 const mid=Math.ceil(topics.length/2);
 const core=topics.map((title,i)=>({id:course.id+"-t"+i,title,min:8+(i%6)*2,video:""}));
 const fin=[{id:course.id+"-fp",title:t("sy_final"),min:15,video:"",project:true}];
 const units=[
  {code:"U1",title:t("sy_u1"),lessons:intro},
  {code:"U2",title:t("sy_u2"),lessons:core.slice(0,mid)},
  {code:"U3",title:t("sy_u3"),lessons:core.slice(mid)},
  {code:"FP",title:t("sy_final"),lessons:fin}
 ].filter(u=>u.lessons.length);
 units.forEach((u,i)=>{
  const n=i+1;
  u.blurb=t("unit_blurb");
  u.tasks=[
   {id:course.id+"-"+u.code+"-p1",chip:"PRÁCTICA "+n+".1",title:t("task_a")},
   {id:course.id+"-"+u.code+"-p2",chip:"PRÁCTICA "+n+".2",title:t("task_b")}
  ];
  u.resources=[
   {id:course.id+"-"+u.code+"-r1",name:t("res_pdf"),kind:"PDF"},
   {id:course.id+"-"+u.code+"-r2",name:t("res_doc"),kind:"DOC"}
  ];
 });
 const lessons=units.reduce((a,u)=>a.concat(u.lessons.map(l=>Object.assign({unit:u.code},l))),[]);
 lessons.forEach(l=>{l.placeholder=true;l.resource={name:t("sy_notes"),placeholder:true}});
 return {units,lessons,placeholder:true};
}
function courseById(id){return COURSES.find(c=>c.id===+id)||null}
function discountPct(c){return c.o>c.p?Math.round((1-c.p/c.o)*100):0}
function fmtMin(m){m=Math.round(m);const h=Math.floor(m/60),r=m%60;return h?h+" h "+r+" min":r+" min"}
/* esc() lives in store.js */
