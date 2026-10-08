import { supabase, demoMode } from './supabase';
const unwrap = result => { if(result.error)throw result.error; return result.data; };
let demo;
const getDemo = async () => demo ||= await import('./demo');
async function readTable(table) {
  const rows=[];
  // PostgREST limits each page; retain records beyond the first 1,000 rows.
  for(let start=0;;start+=1000) {
    const page=unwrap(await supabase.from(table).select('*').order('id').range(start,start+999));
    rows.push(...page);if(page.length<1000)return rows;
  }
}
export async function loadData() {
  if(demoMode) return (await getDemo()).readDemo();
  const { data: { session }, error }=await supabase.auth.getSession(); if(error)throw error;
  const publicTables=['profiles','stock','portfolio','requests','reviews'];
  const privateTables=session?['private_profiles','offers','messages','notifications','payments']:[];
  const entries=await Promise.all([...publicTables,...privateTables].map(async table=>[table,await readTable(table)]));
  const stats=unwrap(await supabase.rpc('marketplace_stats'));
  const tables=Object.fromEntries(entries); const name=id=>tables.profiles.find(u=>u.id===id)?.name || 'Usuário';
  const users=tables.profiles.map(p=>{
    const privateData=tables.private_profiles?.find(x=>x.id===p.id)?.data || {};
    const rating=role=>{const reviews=tables.reviews.filter(r=>r.target_id===p.id && r.target_role===role);return {average:reviews.length?reviews.reduce((n,r)=>n+r.rating,0)/reviews.length:0,count:reviews.length};};
    return {...privateData,id:p.id,name:p.name,publicStats:stats.makers[p.id],avatar:p.avatar,banner:p.banner,address:{...privateData.address,cidade:p.city,uf:p.state},isSeller:p.is_seller,email:p.id===session?.user.id?session.user.email:undefined,ratingAsClient:rating('client').average,totalClientReviews:rating('client').count,ratingAsSeller:rating('seller').average,totalSellerReviews:rating('seller').count,sellerData:p.is_seller?{businessName:p.business_name,cnpj:privateData.cnpj,categories:p.categories,skills:p.skills,verificationInfo:p.verification_info,certificate:p.certificate,stock:tables.stock.filter(x=>x.seller_id===p.id).map(x=>({...x.data,id:x.id})),portfolio:tables.portfolio.filter(x=>x.seller_id===p.id).map(x=>({...x.data,id:x.id}))}:undefined};
  });
  const requests=await Promise.all(tables.requests.map(async r=>({...r.data,id:r.id,offerCount:stats.offerCounts[r.id],clientId:r.client_id,clientName:name(r.client_id),assignedSellerId:r.seller_id,selectedOfferId:r.selected_offer_id,status:r.status,productionStatus:r.production_status,statusHistory:r.status_history,createdAt:r.created_at,attachments:await Promise.all((r.data.attachments || []).map(async file=>{if(!file.path)return file;const result=await supabase.storage.from('request-files').createSignedUrl(file.path,3600);return {...file,url:result.data?.signedUrl || ''};}))})));
  return {users,requests,currentUserId:session?.user.id,offers:(tables.offers||[]).map(o=>({...o.data,id:o.id,requestId:o.request_id,sellerId:o.seller_id,sellerName:name(o.seller_id),status:o.status,counterOffer:o.counter_offer,createdAt:o.created_at})),messages:(tables.messages||[]).map(m=>({id:m.id,requestId:m.request_id,senderId:m.sender_id,senderName:name(m.sender_id),text:m.text,timestamp:m.created_at})),reviews:tables.reviews.map(r=>({id:r.id,requestId:r.request_id,reviewerId:r.reviewer_id,reviewerName:name(r.reviewer_id),targetUserId:r.target_id,targetRole:r.target_role,rating:r.rating,comment:r.comment,createdAt:r.created_at})),notifications:(tables.notifications||[]).map(n=>({id:n.id,userId:n.user_id,title:n.title,message:n.message,linkRequestId:n.request_id,read:n.read,timestamp:n.created_at})),payments:tables.payments||[]};
}
export async function mutate(action,payload) {
  if(demoMode) { const mod=await getDemo(); const next=mod.transition(mod.readDemo(),action,payload);mod.writeDemo(next);return; }
  unwrap(await supabase.rpc('marketplace_action',{action,payload}));
}
export async function switchDemo(userId) { if(!demoMode)throw new Error('Disponível apenas na demonstração.');const mod=await getDemo();const next=mod.readDemo();next.currentUserId=userId;mod.writeDemo(next); }
export async function resetDemo() { if(demoMode)(await getDemo()).resetDemo(); }
export async function upload(file,scope,userId,requestId) {
  const ext=file.name.split('.').pop().toLowerCase();const types={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',pdf:'application/pdf',stl:'application/octet-stream',obj:'application/octet-stream'};
  if(!types[ext] || (scope==='image' && !types[ext].startsWith('image/')) || (scope==='public' && ['stl','obj'].includes(ext)))throw new Error('Formato de arquivo não suportado.');
  if(file.size>750*1024)throw new Error('Use um arquivo de até 750 KB.');
  const meta={name:file.name,type:types[ext].startsWith('image/')?'image':ext==='pdf'?'file':'stl',size:`${Math.ceil(file.size/1024)} KB`,bytes:file.size};
  if(demoMode) {const url=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.replace(/^data:[^;]*;/,`data:${types[ext]};`));reader.onerror=reject;reader.readAsDataURL(file);});return {...meta,url};}
  const bucket=scope==='request'?'request-files':'public-media';const path=`${userId}/${scope==='request'?requestId+'/':''}${crypto.randomUUID()}.${ext}`;
  unwrap(await supabase.storage.from(bucket).upload(path,file,{contentType:types[ext],upsert:false}));
  const url=bucket==='public-media'?supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl:unwrap(await supabase.storage.from(bucket).createSignedUrl(path,3600)).signedUrl;
  return {...meta,path,url};
}
