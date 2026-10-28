/* eFlight data layer — demo adapter.
   Everything user-specific (accounts, purchases, progress, reviews, comments,
   projects) goes through EFSStore. The UI must not touch localStorage itself.

   To go live, replace this file with an adapter that has the same methods
   and talks to Supabase (or another backend). Suggested mapping:
     users/session     -> Supabase Auth (never store passwords in the browser)
     purchases         -> table purchases (user_id, course_id, amount, provider, provider_ref)
     progress          -> table lesson_progress (user_id, course_id, lesson_id, done_at, note, last)
     reviews           -> table reviews
     comments          -> table lesson_comments (parent_id for replies)
     projects          -> table projects + Supabase Storage for images
     charge()          -> Stripe Checkout or PayPal order, then webhook writes the purchase
   Row Level Security must key every row on auth.uid(). Do not use the
   service role in the static site. See the pull request for the full list.
*/
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
(function(){
 const KEY="efs.learn.v1";
 const CODES={"EFLIGHT10":0.10};
 function blank(){return {users:[],session:null,purchases:[],progress:{},reviews:[],comments:[],projects:[],saved:[],topics:[],posts:[]}}
 function load(){try{return Object.assign(blank(),JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){return blank()}}
 function save(db){localStorage.setItem(KEY,JSON.stringify(db))}
 function uid(){return Math.random().toString(36).slice(2,10)}
 function hash(s){let h=5381;s=String(s);for(let i=0;i<s.length;i++)h=((h<<5)+h)+s.charCodeAt(i);return "h"+(h>>>0).toString(16)}
 function user(){const db=load();return db.users.find(u=>u.id===db.session)||null}
 function must(){const u=user();if(!u)throw new Error("auth");return u}

 const Payments={
  /* Plug-in point. Return {ok:true, demo:true} or redirect to a provider.
     A live Stripe/PayPal call belongs here, not in the pages. */
  async charge(order){
   const cfg=window.EFS_CONFIG||{};
   if(order.method==="stripe"&&cfg.stripePaymentLink){
    const u=new URL(cfg.stripePaymentLink);
    if(order.email)u.searchParams.set("prefilled_email",order.email);
    location.href=u.toString();
    return {ok:false,redirect:true};
   }
   if(order.method==="paypal"&&cfg.paypalClientId){
    return {ok:false,needsPaypal:true,clientId:cfg.paypalClientId,currency:cfg.currency||"USD"};
   }
   return {ok:true,demo:true,providerRef:"demo-"+uid()};
  }
 };

 function grant(db,userId,courseId,extra){
  if(db.purchases.some(p=>p.userId===userId&&p.courseId===courseId&&!p.giftCode))return;
  db.purchases.push(Object.assign({id:uid(),userId,courseId,at:Date.now(),amount:0,method:"grant"},extra||{}));
 }

 window.EFSStore={
  adapter:"localStorage",
  payments:Payments,
  user,
  register(name,email,password){
   const db=load();
   email=String(email||"").trim().toLowerCase();
   if(!name||!/^\S+@\S+\.\S+$/.test(email)||String(password||"").length<4)return {ok:false,error:"fields"};
   if(db.users.some(u=>u.email===email))return {ok:false,error:"exists"};
   const u={id:uid(),name:String(name).trim(),email,passHash:hash(password),created:Date.now()};
   db.users.push(u);db.session=u.id;save(db);return {ok:true,user:u};
  },
  login(email,password){
   const db=load();
   email=String(email||"").trim().toLowerCase();
   const u=db.users.find(x=>x.email===email&&x.passHash===hash(password));
   if(!u)return {ok:false,error:"bad"};
   db.session=u.id;save(db);return {ok:true,user:u};
  },
  logout(){const db=load();db.session=null;save(db)},
  owns(courseId){const u=user();if(!u)return false;return load().purchases.some(p=>p.userId===u.id&&p.courseId===+courseId&&!p.giftCode)},
  purchases(){const u=user();if(!u)return [];return load().purchases.filter(p=>p.userId===u.id&&!p.giftCode)},
  price(course,code){
   let amount=course.p,off=0;
   code=String(code||"").trim().toUpperCase();
   if(code&&CODES[code]){off=CODES[code];amount=Math.round(course.p*(1-off)*100)/100}
   amount=Math.round(amount*100)/100;
   return {amount,off,code:off?code:"",currency:(window.EFS_CONFIG||{}).currency||"USD"};
  },
  async checkout(opts){
   const u=must();
   const course=opts.course;
   const priced=this.price(course,opts.code);
   if(opts.gift){
    const giftCode="GIFT-"+uid().toUpperCase();
    const db=load();
    db.purchases.push({id:uid(),userId:u.id,courseId:course.id,at:Date.now(),amount:priced.amount,method:opts.method||"demo",giftCode,giftFor:opts.giftFor||"",code:priced.code});
    save(db);
    return {ok:true,demo:true,giftCode};
   }
   if(this.owns(course.id))return {ok:true,already:true};
   const pay=await Payments.charge({method:opts.method||"demo",amount:priced.amount,currency:priced.currency,courseId:course.id,email:u.email});
   if(pay.redirect)return pay;
   if(pay.needsPaypal)return pay;
   const db=load();
   grant(db,u.id,course.id,{amount:priced.amount,method:opts.method||"demo",code:priced.code,providerRef:pay.providerRef});
   save(db);
   return {ok:true,demo:!!pay.demo};
  },
  redeem(code){
   const u=must();
   code=String(code||"").trim().toUpperCase();
   const db=load();
   const gift=db.purchases.find(p=>p.giftCode&&p.giftCode.toUpperCase()===code);
   if(!gift)return {ok:false,error:"code"};
   if(gift.redeemedBy)return {ok:false,error:"used"};
   gift.redeemedBy=u.id;gift.redeemedAt=Date.now();
   grant(db,u.id,gift.courseId,{amount:0,method:"gift",code});
   save(db);return {ok:true,courseId:gift.courseId};
  },
  grantCurrent(courseId,method){
   const u=user();if(!u)return false;
   const db=load();grant(db,u.id,+courseId,{method:method||"cart-demo",amount:0});save(db);return true;
  },
  prog(courseId){
   const empty={done:{},last:null,notes:{},units:{},resume:{},tasks:{},dismissRate:false};
   const u=user();if(!u)return empty;
   return Object.assign({}, empty, load().progress[u.id+":"+courseId]||{});
  },
  _putProg(courseId,fn){
   const u=must();const db=load();const k=u.id+":"+courseId;
   const p=Object.assign({done:{},last:null,notes:{},units:{},resume:{},tasks:{},dismissRate:false}, db.progress[k]||{});
   fn(p);db.progress[k]=p;save(db);return p;
  },
  setLast(courseId,lessonId){return this._putProg(courseId,p=>{p.last=lessonId})},
  toggleDone(courseId,lessonId,on){return this._putProg(courseId,p=>{if(on)p.done[lessonId]=Date.now();else delete p.done[lessonId];p.last=lessonId})},
  saveNote(courseId,lessonId,text){return this._putProg(courseId,p=>{p.notes[lessonId]=String(text||"").slice(0,4000)})},
  setResume(courseId,lessonId,seconds){return this._putProg(courseId,p=>{p.resume[lessonId]=Math.max(0,Math.round(seconds));p.last=lessonId})},
  toggleTask(courseId,taskId,on){return this._putProg(courseId,p=>{if(on)p.tasks[taskId]=Date.now();else delete p.tasks[taskId]})},
  toggleUnit(courseId,unitCode,on,lessonIds){
   return this._putProg(courseId,p=>{
    if(on)p.units[unitCode]=Date.now(); else delete p.units[unitCode];
    (lessonIds||[]).forEach(id=>{if(on)p.done[id]=Date.now();else delete p.done[id]});
   });
  },
  dismissRate(courseId){return this._putProg(courseId,p=>{p.dismissRate=true})},
  stats(courseId,lessonCount,unitCount){
   const p=this.prog(courseId);
   const done=Object.keys(p.done).length;
   const unitsDone=Object.keys(p.units||{}).length;
   const pct=unitCount?Math.round(unitsDone/unitCount*100):(lessonCount?Math.round(done/lessonCount*100):0);
   const complete=(unitCount>0&&unitsDone>=unitCount)||(lessonCount>0&&done>=lessonCount);
   return {done,pct,last:p.last,complete,unitsDone,unitCount:unitCount||0};
  },
  reviews(courseId){return load().reviews.filter(r=>r.courseId===+courseId).sort((a,b)=>b.at-a.at)},
  reviewSummary(courseId){
   const list=this.reviews(courseId);
   const pos=list.filter(r=>r.positive).length;
   return {count:list.length,positive:list.length?Math.round(pos/list.length*100):null,students:load().purchases.filter(p=>p.courseId===+courseId&&!p.giftCode).length};
  },
  addReview(courseId,positive,text){
   const u=must();const db=load();
   if(db.reviews.some(r=>r.courseId===+courseId&&r.userId===u.id))return {ok:false,error:"once"};
   db.reviews.push({id:uid(),courseId:+courseId,userId:u.id,name:u.name,positive:!!positive,text:String(text||"").slice(0,1000),at:Date.now(),likes:[]});
   save(db);return {ok:true};
  },
  likeReview(id){
   const u=must();const db=load();const r=db.reviews.find(x=>x.id===id);if(!r)return;
   r.likes=r.likes||[];const i=r.likes.indexOf(u.id);if(i>=0)r.likes.splice(i,1);else r.likes.push(u.id);save(db);
  },
  comments(courseId,lessonId){
   return load().comments.filter(c=>c.courseId===+courseId&&(!lessonId||c.lessonId===lessonId)).sort((a,b)=>a.at-b.at);
  },
  addComment(courseId,lessonId,text,parentId){
   const u=must();text=String(text||"").trim().slice(0,1000);if(!text)return {ok:false};
   const db=load();
   db.comments.push({id:uid(),courseId:+courseId,lessonId,userId:u.id,name:u.name,text,parentId:parentId||null,at:Date.now(),likes:[]});
   save(db);return {ok:true};
  },
  likeComment(id){
   const u=must();const db=load();const c=db.comments.find(x=>x.id===id);if(!c)return;
   c.likes=c.likes||[];const i=c.likes.indexOf(u.id);if(i>=0)c.likes.splice(i,1);else c.likes.push(u.id);save(db);
  },
  projects(courseId,opts){
   const all=load().projects.filter(p=>p.courseId===+courseId).sort((a,b)=>b.at-a.at);
   if(opts&&opts.mine){const u=user();return all.filter(p=>u&&p.userId===u.id)}
   return all.filter(p=>!p.draft);
  },
  project(id){return load().projects.find(p=>p.id===id)||null},
  addProject(courseId,title,image){
   return this.saveProject({courseId,title,image,intro:"",materials:"",steps:[{title:"",image:image||"",link:""}],draft:false});
  },
  saveProject(data){
   const u=must();
   const title=String(data.title||"").trim().slice(0,120);
   if(!title)return {ok:false,error:"title"};
   const steps=(data.steps||[]).slice(0,12).map(s=>{
    let image=s.image||"";
    if(image&&(String(image).length>280000||String(image).indexOf("data:image/")!==0))image="";
    return {title:String(s.title||"").slice(0,160),image,link:String(s.link||"").slice(0,400)};
   });
   const db=load();
   let row=data.id&&db.projects.find(p=>p.id===data.id&&p.userId===u.id);
   const cover=(steps.find(s=>s.image)||{}).image||data.image||"";
   const fields={title,intro:String(data.intro||"").slice(0,4000),materials:String(data.materials||"").slice(0,2000),steps,draft:!!data.draft,image:cover,at:Date.now()};
   if(row)Object.assign(row,fields);
   else{row=Object.assign({id:uid(),courseId:+data.courseId,userId:u.id,name:u.name},fields);db.projects.push(row)}
   save(db);return {ok:true,id:row.id};
  },
  topics(courseId){return load().topics.filter(t=>t.courseId===+courseId).sort((a,b)=>(b.pinned-a.pinned)||(b.at-a.at))},
  topic(id){return load().topics.find(t=>t.id===id)||null},
  addTopic(courseId,title,body,practice,pinned){
   const u=must();title=String(title||"").trim().slice(0,140);body=String(body||"").trim().slice(0,4000);
   if(!title||!body)return {ok:false,error:"fields"};
   const db=load();
   const row={id:uid(),courseId:+courseId,userId:u.id,name:u.name,title,body,practice:String(practice||"").slice(0,40),pinned:!!pinned,at:Date.now(),likes:[],followers:[]};
   db.topics.push(row);save(db);return {ok:true,id:row.id};
  },
  toggleTopicLike(id){return this._toggleArr("topics",id,"likes")},
  toggleFollow(id){return this._toggleArr("topics",id,"followers")},
  togglePin(id){
   const u=must();const db=load();const row=db.topics.find(t=>t.id===id&&t.userId===u.id);if(!row)return;
   row.pinned=!row.pinned;save(db);
  },
  posts(topicId){return load().posts.filter(p=>p.topicId===topicId).sort((a,b)=>a.at-b.at)},
  addPost(topicId,text,parentId){
   const u=must();text=String(text||"").trim().slice(0,4000);if(!text)return {ok:false};
   const db=load();if(!db.topics.some(t=>t.id===topicId))return {ok:false};
   db.posts.push({id:uid(),topicId,userId:u.id,name:u.name,text,parentId:parentId||null,at:Date.now(),likes:[]});
   save(db);return {ok:true};
  },
  togglePostLike(id){return this._toggleArr("posts",id,"likes")},
  _toggleArr(bucket,id,field){
   const u=must();const db=load();const row=(db[bucket]||[]).find(x=>x.id===id);if(!row)return;
   row[field]=row[field]||[];const i=row[field].indexOf(u.id);if(i>=0)row[field].splice(i,1);else row[field].push(u.id);save(db);
  },
  toggleSaved(courseId){
   const u=must();const db=load();const k=u.id+":"+courseId;
   const i=db.saved.indexOf(k);if(i>=0)db.saved.splice(i,1);else db.saved.push(k);save(db);return i<0;
  },
  saved(courseId){const u=user();if(!u)return false;return load().saved.indexOf(u.id+":"+courseId)>=0}
 };
})();
