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
 function blank(){return {users:[],session:null,purchases:[],progress:{},reviews:[],comments:[],projects:[],saved:[]}}
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
   const u=user();if(!u)return {done:{},last:null,notes:{}};
   return load().progress[u.id+":"+courseId]||{done:{},last:null,notes:{}};
  },
  _putProg(courseId,fn){
   const u=must();const db=load();const k=u.id+":"+courseId;
   const p=db.progress[k]||{done:{},last:null,notes:{}};
   fn(p);db.progress[k]=p;save(db);return p;
  },
  setLast(courseId,lessonId){return this._putProg(courseId,p=>{p.last=lessonId})},
  toggleDone(courseId,lessonId,on){return this._putProg(courseId,p=>{if(on)p.done[lessonId]=Date.now();else delete p.done[lessonId];p.last=lessonId})},
  saveNote(courseId,lessonId,text){return this._putProg(courseId,p=>{p.notes[lessonId]=String(text||"").slice(0,4000)})},
  stats(courseId,lessonCount){
   const p=this.prog(courseId);
   const done=Object.keys(p.done).length;
   const pct=lessonCount?Math.round(done/lessonCount*100):0;
   return {done,pct,last:p.last,complete:lessonCount>0&&done>=lessonCount};
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
  projects(courseId){return load().projects.filter(p=>p.courseId===+courseId).sort((a,b)=>b.at-a.at)},
  addProject(courseId,title,image){
   const u=must();title=String(title||"").trim().slice(0,80);if(!title)return {ok:false,error:"title"};
   if(image&&(String(image).length>400000||String(image).indexOf("data:image/")!==0))return {ok:false,error:"image"};
   const db=load();
   db.projects.push({id:uid(),courseId:+courseId,userId:u.id,name:u.name,title,image:image||"",at:Date.now()});
   save(db);return {ok:true};
  },
  toggleSaved(courseId){
   const u=must();const db=load();const k=u.id+":"+courseId;
   const i=db.saved.indexOf(k);if(i>=0)db.saved.splice(i,1);else db.saved.push(k);save(db);return i<0;
  },
  saved(courseId){const u=user();if(!u)return false;return load().saved.indexOf(u.id+":"+courseId)>=0}
 };
})();
