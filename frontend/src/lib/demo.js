// Explicit offline sandbox. Never used when Supabase mode is enabled.
import seed from '../data/demo.json';
import Validators from './validators';
const key = 'tresde_react_demo_v1';
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
export const steps = ['Recebido', 'Em Produção', 'Finalizado', 'Enviado', 'Entregue'];
export const categoryMatches = (a,b) => !b || a===b || (a==='Impressão 3D e Pintura' && ['Impressão 3D','Pintura Manual'].includes(b));
export function readDemo() {
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  const data = structuredClone(seed);
  // Copy the old prototype without modifying its keys or retaining passwords.
  if (localStorage.getItem('tresde_initialized')) {
    for (const collection of Object.keys(data)) {
      try { const old = JSON.parse(localStorage.getItem('tresde_'+collection)); if (Array.isArray(old)) data[collection]=old; } catch { /* use seed */ }
    }
  }
  data.users.forEach(u => delete u.password);
  data.currentUserId=data.users[0]?.id;
  return data;
}
export function writeDemo(data) { localStorage.setItem(key,JSON.stringify(data)); }
export function resetDemo() { const data=structuredClone(seed); data.currentUserId=data.users[0].id; writeDemo(data); return data; }
export function transition(input, action, payload={}) {
  const db=structuredClone(input), user=db.users.find(u=>u.id===db.currentUserId);
  const require = (condition,message='Você não tem permissão para esta ação.') => { if (!condition) throw new Error(message); };
  require(user,'Entre na sua conta para continuar.');
  const d=payload.data || {};
  for(const text of [d.title,d.description,d.name,d.notes,d.skills,d.businessName,d.verificationInfo,payload.reason,payload.comment,payload.text]) { const result=Validators.validateText(text); require(result.valid,result.message); }
  const offer=db.offers.find(o=>o.id===payload.offerId);
  const req=db.requests.find(r=>r.id===(offer?.requestId || payload.requestId || payload.id));
  const notify=(userId,title,message,requestId)=>{if(userId && userId!==user.id)db.notifications.unshift({id:id(),userId,title,message,linkRequestId:requestId,read:false,timestamp:now()});};
  const change=(collection,item)=>{const i=db[collection].findIndex(x=>x.id===item.id);if(i<0)db[collection].unshift(item);else db[collection][i]=item;};
  const history=(status,note)=>req.statusHistory.push({status,note,timestamp:now()});
  if(action==='save_profile') Object.assign(user,d);
  else if(action==='save_seller') {require(d.categories?.length && d.businessName,'Informe nome comercial e especialidades.'); user.isSeller=true;user.sellerData={...user.sellerData,...d};}
  else if(/^(save|delete)_(stock|portfolio)$/.test(action)) {
    require(user.isSeller); const collection=action.split('_')[1], items=user.sellerData[collection] ||= [];
    const index=items.findIndex(x=>x.id===payload.id);
    if(action.startsWith('delete')) {require(index>=0);items.splice(index,1);}else if(index>=0)items[index]={...d,id:payload.id};else items.push({...d,id:id()});
  } else if(action==='read_notifications') db.notifications.forEach(n=>{if(n.userId===user.id && (!payload.id || payload.id===n.id))n.read=true;});
  else if(action==='save_request') {
    require(d.title && d.description && d.budget>0 && Validators.validateFutureDate(d.desiredDeadline).valid,'Informe título, descrição, orçamento e prazo válidos.');
    if(req){ require(req.clientId===user.id && ['Aberto','Em análise'].includes(req.status));Object.assign(req,d); }
    else { const r={...d,id:payload.id || id(),clientId:user.id,clientName:user.name,status:'Aberto',createdAt:now(),statusHistory:[{status:'Aberto',timestamp:now(),note:'Requisição publicada.'}]};db.requests.unshift(r);db.users.filter(u=>u.isSeller && u.sellerData.categories.some(c=>categoryMatches(d.category,c))).forEach(u=>notify(u.id,'Nova requisição compatível',d.title,r.id)); }
  } else {
    require(req,'Pedido não encontrado.');
    const open=['Aberto','Em análise'].includes(req.status);
    if(action==='save_offer') {
      require(user.isSeller && req.clientId!==user.id && open && user.sellerData.categories.some(c=>categoryMatches(req.category,c)));
      require(d.price>0 && d.notes && Validators.validateFutureDate(d.deadlineDate).valid && d.deadlineDate<=req.desiredDeadline,'Valor, descrição ou prazo inválidos.');
      if(offer)require(offer.sellerId===user.id && ['Pendente','Negociando'].includes(offer.status));
      else require(!db.offers.some(o=>o.requestId===req.id && o.sellerId===user.id && ['Pendente','Negociando','Aceita'].includes(o.status)),'Você já enviou uma oferta. Edite a existente.');
      change('offers',{...offer,...d,id:offer?.id || id(),requestId:req.id,sellerId:user.id,sellerName:user.name,status:'Pendente',counterOffer:null,createdAt:offer?.createdAt || now()});
      if(req.status==='Aberto'){req.status='Em análise';history('Em análise','Proposta recebida.');}notify(req.clientId,'Nova proposta recebida',req.title,req.id);
    } else if(['withdraw_offer','reject_offer','negotiate','respond_counter','accept_offer'].includes(action)) {
      require(offer && open && ['Pendente','Negociando'].includes(offer.status));
      require(['withdraw_offer','respond_counter'].includes(action)?offer.sellerId===user.id:req.clientId===user.id);
      if(action==='withdraw_offer')offer.status='Retirada';
      if(action==='reject_offer')offer.status='Recusada';
      if(action==='negotiate'){require(d.price>0 && d.deadlineDate<=req.desiredDeadline && Validators.validateFutureDate(d.deadlineDate).valid,'Contraproposta inválida.');offer.counterOffer=d;offer.status='Negociando';}
      if(action==='respond_counter'){require(offer.status==='Negociando');if(payload.accept)Object.assign(offer,offer.counterOffer);offer.counterOffer=null;offer.status='Pendente';}
      if(action==='accept_offer') {
        require(offer.status==='Pendente' && Validators.validateFutureDate(offer.deadlineDate).valid,'Proposta pendente de confirmação ou prazo vencido.');
        db.offers.filter(o=>o.requestId===req.id && ['Pendente','Negociando'].includes(o.status)).forEach(o=>o.status=o.id===offer.id?'Aceita':'Recusada');
        Object.assign(req,{status:'Em andamento',productionStatus:'Recebido',selectedOfferId:offer.id,assignedSellerId:offer.sellerId});history('Recebido','Proposta aceita; pagamento simulado.');
        db.payments.push({id:id(),requestId:req.id,clientId:user.id,sellerId:offer.sellerId,amount:offer.price,method:payload.method,status:'Simulado',transactionDate:now()});
      }
      notify(user.id===req.clientId?offer.sellerId:req.clientId,'Proposta atualizada',req.title,req.id);
    } else if(action==='cancel_request') {
      require((open && req.clientId===user.id)||(req.status==='Em andamento' && ['Recebido','Em Produção'].includes(req.productionStatus) && [req.clientId,req.assignedSellerId].includes(user.id)));
      require(payload.reason?.trim().length>=3,'Informe uma justificativa.'); req.status='Cancelado';history('Cancelado',payload.reason);
      db.offers.filter(o=>o.requestId===req.id).forEach(o=>{if(['Pendente','Negociando'].includes(o.status))o.status='Recusada';notify(o.sellerId,'Pedido cancelado',payload.reason,req.id);});
    } else if(action==='advance_production') {require(req.assignedSellerId===user.id && req.status==='Em andamento' && req.productionStatus!=='Entregue');req.productionStatus=steps[steps.indexOf(req.productionStatus)+1];history(req.productionStatus,'Produção atualizada.');notify(req.clientId,'Produção atualizada',req.title,req.id);}
    else if(action==='confirm_receipt') {require(req.clientId===user.id && req.status==='Em andamento' && req.productionStatus==='Entregue');req.status='Concluído';history('Concluído','Recebimento confirmado.');notify(req.assignedSellerId,'Recebimento confirmado',req.title,req.id);}
    else if(action==='send_message') {require([req.clientId,req.assignedSellerId].includes(user.id) && ['Em andamento','Concluído'].includes(req.status));require(payload.text?.trim() && payload.text.length<=400);db.messages.push({id:id(),requestId:req.id,senderId:user.id,senderName:user.name,text:payload.text.trim(),timestamp:now()});notify(user.id===req.clientId?req.assignedSellerId:req.clientId,'Nova mensagem',req.title,req.id);}
    else if(action==='review') {require(req.status==='Concluído' && [req.clientId,req.assignedSellerId].includes(user.id));require(!db.reviews.some(r=>r.requestId===req.id && r.reviewerId===user.id),'Você já avaliou este pedido.');require(Number.isInteger(payload.rating) && payload.rating>=1 && payload.rating<=5);const targetUserId=user.id===req.clientId?req.assignedSellerId:req.clientId;db.reviews.push({id:id(),requestId:req.id,reviewerId:user.id,reviewerName:user.name,targetUserId,targetRole:user.id===req.clientId?'seller':'client',rating:payload.rating,comment:payload.comment,createdAt:now()});}
    else throw new Error('Ação desconhecida.');
  }
  if(action==='review') {
    for(const target of db.users) for(const role of ['client','seller']) {
      const reviews=db.reviews.filter(r=>r.targetUserId===target.id && r.targetRole===role);
      if(reviews.length){target[role==='seller'?'ratingAsSeller':'ratingAsClient']=reviews.reduce((sum,r)=>sum+r.rating,0)/reviews.length;target[role==='seller'?'totalSellerReviews':'totalClientReviews']=reviews.length;}
    }
  }
  return db;
}
