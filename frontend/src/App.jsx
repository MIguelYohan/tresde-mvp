import { useCallback, useEffect, useRef, useState } from 'react';
import { AppContext } from './context';
import { demoMode, supabase } from './lib/supabase';
import { loadData, mutate, resetDemo, switchDemo, upload } from './lib/repository';
import Validators from './lib/validators';
import Geo from './lib/geo';
import { canCancel, categoryMatches, date, money, safeImage } from './lib/format';
import Header from './components/Header';
import Dialogs from './components/Dialogs';
import Explore from './pages/Explore';
import ClientRequests from './pages/ClientRequests';
import SellerPanel from './pages/SellerPanel';
import InProgress from './pages/InProgress';
import Profile from './pages/Profile';
import { Attachments, Empty, Icon, Picture, Stars } from './components/common';
import { MakerCard, MakerProfile, OfferCard, OrderCard, PortfolioCards, RequestCard, RequestTile, Reviews, StockRows } from './components/Marketplace';
const empty={users:[],requests:[],offers:[],messages:[],reviews:[],notifications:[],payments:[]};
const initialFields={filterMinRating:'0',makerRating:'0',regGender:'Não informado',editProfGender:'Não informado',stockQuantity:'1',stockActive:'true',reviewRating:'5'};
const slides=[['sua ideia.','outra dimensão.','Da primeira inspiração à peça que só você tem.','vamos dar','forma?','Encontre quem transforma a sua ideia em algo único.','começar minha ideia'],['feito à mão.','feito pra durar.','Histórias e cuidado em cada pequeno detalhe.','tem um toque','só seu.','Explore projetos de artesanato e crie novas possibilidades.','explorar artesanato'],['seu talento.','novas conexões.','O próximo projeto incrível pode ser o seu.','bora criar','juntos?','Abra as portas do seu ateliê para novas ideias.','quero ser prestador']];
export default function App() {
 const [data,setData]=useState(empty),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [view,setView]=useState('explore'),[modal,setModal]=useState(null),[authTab,setAuthTab]=useState('login'),[recovery,setRecovery]=useState(false);
 const [fields,setFields]=useState(initialFields),[busy,setBusy]=useState(false),[toast,setToast]=useState(null),[attachments,setAttachments]=useState([]);
 const [clientFilter,setClientFilter]=useState('all'),[sellerTab,setSellerTab]=useState('compatible'),[filterOpen,setFilterOpen]=useState(false),[notifOpen,setNotifOpen]=useState(false),[demoOpen,setDemoOpen]=useState(false),[slide,setSlide]=useState(0),[payMethod,setPayMethod]=useState('PIX'),[makerId,setMakerId]=useState(null),[compareId,setCompareId]=useState(null),[pending,setPending]=useState(null);
 const lock=useRef(false),revision=useRef(0),fileRef=useRef(null),toastTimer=useRef(null);
 const user=data.users.find(u=>u.id===data.currentUserId);
 const patch=values=>setFields(old=>({...old,...values}));
 const notify=(message,type='success')=>{clearTimeout(toastTimer.current);setToast({message,type});toastTimer.current=setTimeout(()=>setToast(null),6000);};
 const refresh=useCallback(async()=>{const rev=++revision.current;const next=await loadData();if(rev===revision.current){setData(next);setError('');}return next;},[]);
 useEffect(()=>{
  if(!demoMode && !supabase){setLoading(false);return;}
  let alive=true;refresh().catch(e=>{if(alive)setError(e.message);}).finally(()=>{if(alive)setLoading(false);});
  const reload=()=>{if(document.visibilityState==='visible')refresh().catch(e=>{if(alive)setError(e.message);});};
  const timer=setInterval(reload,15000);window.addEventListener('focus',reload);
  const subscription=supabase?.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){setRecovery(true);setAuthTab('forgot');setModal('modalAuth');}if(event==='SIGNED_OUT'){setView('explore');setFields(initialFields);setModal(null);setData(empty);}setTimeout(()=>{if(alive)reload();},0);});
  return ()=>{alive=false;++revision.current;clearInterval(timer);clearTimeout(toastTimer.current);window.removeEventListener('focus',reload);subscription?.data.subscription.unsubscribe();};
 },[refresh]);
 const run=async(task,{close=true,message='Alterações salvas.'}={})=>{
  if(lock.current)return false;lock.current=true;setBusy(true);
  try {await task();await refresh();if(close)setModal(null);if(message)notify(message);return true;}
  catch(e){notify(e.message || 'Não foi possível concluir. Tente novamente.','error');return false;}
  finally{lock.current=false;setBusy(false);}
 };
 const save=(action,payload,options)=>run(()=>mutate(action,payload),options);
 const needUser=()=>{if(!user){setAuthTab('login');setModal('modalAuth');return false;}return true;};
 const validate=(...results)=>{for(const r of results)if(!r.valid)throw new Error(r.message);};
 const getReq=id=>data.requests.find(r=>r.id===id),getOffer=id=>data.offers.find(o=>o.id===id);
 const text=id=>String(fields[id] ?? '').trim(),num=id=>Number(fields[id]);
 const requireSeller=()=>{if(!needUser())return false;if(!user.isSeller){raw.openSellerUpgradeModal();return false;}return true;};
 const raw={
  navigateTo(next){if(next!=='explore' && !needUser())return;setView(next);setNotifOpen(false);window.scrollTo({top:0,behavior:'smooth'});},
  openModal:setModal,closeModal(){if(!lock.current)setModal(null);},
  openAuthModal(tab='login'){setAuthTab(tab);setModal('modalAuth');},switchAuthTab:setAuthTab,
  toggleNotifDropdown(){setNotifOpen(v=>!v);},toggleDemo(){setDemoOpen(v=>!v);},toggleExploreFilters(){setFilterOpen(v=>!v);},setHeroSlide:setSlide,
  selectCategory(category){patch({filterCategory:category});},searchMarketplace(){patch({filterSearch:text('marketSearch')});setView('explore');},
  resetExploreFilters(){patch({marketSearch:'',filterSearch:'',filterCategory:'',filterMaxBudget:'',filterDistance:'',filterMinRating:'0'});},
  filterClientRequestsByStatus:setClientFilter,switchSellerSubTab:setSellerTab,
  async switchUser(id){if(!demoMode)return;setModal(null);setFields(initialFields);setAttachments([]);await switchDemo(id);await refresh();},
  async resetDatabase(){if(demoMode && confirm('Restaurar os dados da demonstração React?')){await resetDemo();await refresh();setView('explore');}},
  async logout(){await run(async()=>{if(demoMode)await switchDemo(null);else {const {error}=await supabase.auth.signOut();if(error)throw error;}setView('explore');setFields(initialFields);},{message:'Você encerrou a sessão.'});},
  async handleLogin(){
   if(demoMode){notify('Na demonstração, selecione uma conta fictícia no rodapé.','info');setModal(null);setDemoOpen(true);return;}
   await run(async()=>{const {error}=await supabase.auth.signInWithPassword({email:text('loginEmail'),password:fields.loginPassword});if(error)throw error;patch({loginPassword:''});},{message:'Bem-vindo de volta!'});
  },
  async fetchAddressByCEP(cep,prefix){
   if((cep || '').replace(/\D/g,'').length!==8)return;
   const result=await Validators.validateAndFetchCEP(cep);validate(result);
   patch(prefix==='reg'?{regAddress:result.address,regAddressCity:`${result.address.cidade} - ${result.address.uf}`,regAddressDistrict:result.address.bairro}:{editAddress:result.address,editProfCity:`${result.address.cidade} - ${result.address.uf}`});
  },
  async handleRegister(){
   if(demoMode)throw new Error('Cadastro real disponível no modo Supabase. Use as contas fictícias no rodapé.');
   validate(Validators.validateName(text('regName')),Validators.validateCPF(text('regCPF')),Validators.validateBirthDate(text('regBirth')),Validators.validateEmail(text('regEmail')),Validators.validatePhone(text('regPhone')),Validators.validatePassword(fields.regPassword));
   if(fields.regSellerCNPJ)validate(Validators.validateCNPJ(text('regSellerCNPJ')));
   await run(async()=>{
    const result=await Validators.validateAndFetchCEP(text('regCEP'));validate(result);
    const registration={cpf:text('regCPF').replace(/\D/g,''),birthDate:fields.regBirth,cep:text('regCEP'),address:result.address,phone:text('regPhone'),gender:fields.regGender};
    const seller=fields.regIsSeller?{businessName:text('regSellerBusiness'),cnpj:text('regSellerCNPJ'),categories:text('regSellerCategories').split(',').map(x=>x.trim()).filter(Boolean),skills:text('regSellerSkills')}:null;
    if(seller && (!seller.businessName || !seller.categories.length))throw new Error('Informe o nome comercial e ao menos uma especialidade.');
    const {error}=await supabase.auth.signUp({email:text('regEmail'),password:fields.regPassword,options:{emailRedirectTo:window.location.origin,data:{name:text('regName'),registration,seller}}});if(error)throw error;
    setFields(initialFields);
   },{message:'Cadastro enviado. Confira seu e-mail para confirmar a conta.'});
  },
  async handleForgotPassword(){
   if(demoMode)throw new Error('Recuperação por e-mail disponível no modo Supabase.');
   if(recovery)validate(Validators.validatePassword(fields.forgotNewPassword));
   await run(async()=>{const result=recovery?await supabase.auth.updateUser({password:fields.forgotNewPassword}):await supabase.auth.resetPasswordForEmail(text('forgotEmail'),{redirectTo:window.location.origin});if(result.error)throw result.error;patch({forgotNewPassword:''});if(recovery){setRecovery(false);history.replaceState(null,'',location.pathname);}}, {message:recovery?'Senha atualizada.':'Se o e-mail estiver cadastrado, você receberá um link de recuperação.'});
  },
  openNewRequestModal(id){if(!needUser())return;const r=typeof id==='string'?getReq(id):null;if(r && (r.clientId!==user.id || !['Aberto','Em análise'].includes(r.status)))return;patch({requestId:r?.id || crypto.randomUUID(),reqTitle:r?.title || '',reqCategory:r?.category || '',reqBudget:r?.budget || '',reqDeadline:r?.desiredDeadline || '',reqDescription:r?.description || '',reqAttachmentName:''});setAttachments(r?.attachments || []);setModal('modalRequest');},
  chooseRequestFile(){fileRef.current?.click();},
  async handleFileSelection(event){
   const files=Array.from(event.target.files || []);event.target.value='';if(!files.length || !needUser())return;
   await run(async()=>{if(attachments.length+files.length>5)throw new Error('Adicione no máximo cinco anexos.');if(attachments.reduce((sum,a)=>sum+(a.bytes || 0),0)+files.reduce((sum,f)=>sum+f.size,0)>1024*1024)throw new Error('Os anexos devem somar até 1 MB.');const next=[];for(const file of files)next.push(await upload(file,'request',user.id,fields.requestId));setAttachments(old=>[...old,...next]);},{close:false,message:'Anexos carregados. Salve o pedido para confirmar.'});
  },
  addAttachmentToRequest(){if(!text('reqAttachmentName'))return;if(attachments.length>=5)throw new Error('Máximo de cinco anexos.');setAttachments(old=>[...old,{name:text('reqAttachmentName'),type:'file'}]);patch({reqAttachmentName:''});},
  handlePreSubmitRequest(){validate(Validators.validateFutureDate(fields.reqDeadline));if(!text('reqTitle') || !text('reqDescription') || !fields.reqCategory || num('reqBudget')<=0)throw new Error('Preencha os campos obrigatórios.');setPending({id:fields.requestId,data:{title:text('reqTitle'),category:fields.reqCategory,budget:num('reqBudget'),desiredDeadline:fields.reqDeadline,description:text('reqDescription'),attachments:attachments.map(a=>a.path?(({url,...rest})=>rest)(a):a)}});setModal('modalConfirmRequest');},
  async executePublishRequest(){if(!pending)return;const ok=await save('save_request',pending,{message:'Requisição publicada.'});if(ok){setPending(null);setView('client-requests');}},
  openOffersCompareModal(id){if(!needUser())return;if(getReq(id)?.clientId!==user.id)throw new Error('Propostas restritas ao cliente do pedido.');setCompareId(id);setModal('modalOffersCompare');},
  openMakerProfile(id){setMakerId(id);setModal('modalMaker');},
  openSendOfferModal(requestId,offerId){if(!requireSeller())return;const r=getReq(requestId);if(!r || r.clientId===user.id || !['Aberto','Em análise'].includes(r.status))throw new Error('Pedido indisponível.');if(!user.sellerData.categories.some(c=>categoryMatches(r.category,c)))throw new Error('Pedido fora das suas especialidades.');const o=getOffer(offerId)||data.offers.find(o=>o.requestId===requestId && o.sellerId===user.id && ['Pendente','Negociando'].includes(o.status));patch({offerId:o?.id || '',offerRequestId:requestId,offerPrice:o?.price || '',offerDeadline:o?.deadlineDate || r.desiredDeadline,offerNotes:o?.notes || ''});setModal('modalOfferSend');},
  handleSaveOffer(){return save('save_offer',{requestId:fields.offerRequestId,offerId:fields.offerId || null,data:{price:num('offerPrice'),deadlineDate:fields.offerDeadline,notes:text('offerNotes')}},{message:'Oferta enviada.'});},
  withdrawOffer(offerId){return save('withdraw_offer',{offerId},{close:false,message:'Oferta retirada.'});},
  rejectOffer(offerId){return save('reject_offer',{offerId},{close:false,message:'Oferta recusada.'});},
  openNegotiateModal(id){const o=getOffer(id);patch({negotiateOfferId:id,negPrice:o.price,negDeadline:o.deadlineDate,negMessage:''});setModal('modalNegotiate');},
  handleConfirmNegotiation(){return save('negotiate',{offerId:fields.negotiateOfferId,data:{price:num('negPrice'),deadlineDate:fields.negDeadline,notes:text('negMessage')}},{message:'Contraproposta enviada.'});},
  respondCounter(offerId,accept){return save('respond_counter',{offerId,accept},{close:false,message:'Resposta enviada.'});},
  acceptOffer(id){if(!needUser())return;const o=getOffer(id);if(getReq(o?.requestId)?.clientId!==user.id)throw new Error('Somente o cliente pode aceitar a proposta.');patch({paymentOfferId:id,paymentRequestId:o.requestId});setPayMethod('PIX');setModal('modalPayment');},
  togglePayMethod:setPayMethod,copyPixCode(){notify('Este código é demonstrativo e não realiza pagamento.','info');},
  async handleProcessPayment(){const ok=await save('accept_offer',{offerId:fields.paymentOfferId,method:payMethod},{message:'Proposta aceita. Pagamento simulado registrado.'});if(ok)setView('in-progress');},
  openCancelRequestModal(id){if(!canCancel(getReq(id),user))throw new Error('Pedido não pode ser cancelado.');patch({cancelRequestId:id,cancelReason:''});setModal('modalCancelRequest');},
  handleConfirmCancelRequest(){return save('cancel_request',{requestId:fields.cancelRequestId,reason:text('cancelReason')},{message:'Cancelamento registrado.'});},
  advanceProductionStatus(requestId){return save('advance_production',{requestId},{close:false,message:'Produção atualizada.'});},
  confirmReceipt(requestId){return save('confirm_receipt',{requestId},{close:false,message:'Recebimento confirmado.'});},
  sendMessage(requestId,message){return save('send_message',{requestId,text:message},{close:false,message:null});},
  openReviewModal(id){const r=getReq(id);if(r.status!=='Concluído' || ![r.clientId,r.assignedSellerId].includes(user?.id))throw new Error('Avaliação indisponível.');patch({reviewRequestId:id,reviewTargetUserId:user.id===r.clientId?r.assignedSellerId:r.clientId,reviewRating:5,reviewComment:''});setModal('modalReview');},
  handleSaveReview(){return save('review',{requestId:fields.reviewRequestId,rating:num('reviewRating'),comment:text('reviewComment')},{message:'Avaliação registrada.'});},
  openEditProfileModal(){if(!needUser())return;patch({editProfName:user.name,editProfPhone:user.phone || '',editProfGender:user.gender || 'Não informado',editProfCEP:user.cep || '',editAddress:user.address,editProfCity:[user.address?.cidade,user.address?.uf].filter(Boolean).join(' - '),editProfAvatar:user.avatar || '',editProfBanner:user.banner || '',editProfPreferences:user.preferences || ''});setModal('modalEditProfile');},
  async handleSaveProfile(){validate(Validators.validateName(text('editProfName')),Validators.validatePhone(text('editProfPhone')));await run(async()=>{let address=fields.editAddress;if(text('editProfCEP') && text('editProfCEP')!==user.cep){const result=await Validators.validateAndFetchCEP(text('editProfCEP'));validate(result);address=result.address;}await mutate('save_profile',{data:{name:text('editProfName'),phone:text('editProfPhone'),gender:fields.editProfGender,cep:text('editProfCEP'),address,avatar:text('editProfAvatar'),banner:text('editProfBanner'),preferences:text('editProfPreferences')}});});},
  openSellerUpgradeModal(){if(!needUser())return;const s=user.sellerData || {};patch({sellerBusinessName:s.businessName || '',sellerCNPJ:s.cnpj || '',sellerVerification:s.verificationInfo || '',sellerCertificate:s.certificate || '',sellerCategoriesInput:s.categories?.join(', ') || '',sellerSkillsInput:s.skills || ''});setModal('modalSellerUpgrade');},
  handleSaveSellerData(){if(text('sellerCNPJ'))validate(Validators.validateCNPJ(text('sellerCNPJ')));return save('save_seller',{data:{businessName:text('sellerBusinessName'),cnpj:text('sellerCNPJ'),verificationInfo:text('sellerVerification'),certificate:text('sellerCertificate'),categories:text('sellerCategoriesInput').split(',').map(x=>x.trim()).filter(Boolean),skills:text('sellerSkillsInput')}});},
  openStockModal(id){if(!requireSeller())return;const item=user.sellerData.stock?.find(i=>i.id===id);patch({stockItemId:item?.id || '',stockName:item?.name || '',stockCategory:item?.category || '',stockQuantity:item?.quantity ?? 1,stockPrice:item?.price ?? '',stockActive:String(item?.active!==false),stockDescription:item?.description || ''});setModal('modalStock');},
  async handleSaveStockItem(){const ok=await save('save_stock',{id:fields.stockItemId || null,data:{name:text('stockName'),category:text('stockCategory'),quantity:num('stockQuantity'),price:num('stockPrice'),active:fields.stockActive==='true',description:text('stockDescription')}});if(ok){setView('seller-panel');setSellerTab('stock-view');}},
  deleteStock(id){if(confirm('Excluir este item do estoque?'))return save('delete_stock',{id},{close:false});},
  openPortfolioModal(id){if(!requireSeller())return;const item=user.sellerData.portfolio?.find(i=>i.id===id);patch({portfolioItemId:item?.id || '',portTitle:item?.title || '',portCategory:item?.category || '',portImage:item?.image || '',portDescription:item?.description || ''});setModal('modalPortfolio');},
  async handleSavePortfolioItem(){const ok=await save('save_portfolio',{id:fields.portfolioItemId || null,data:{title:text('portTitle'),category:text('portCategory'),image:text('portImage'),description:text('portDescription'),date:new Date().toISOString().slice(0,10)}});if(ok){setView('seller-panel');setSellerTab('portfolio-view');}},
  deletePortfolio(id){if(confirm('Excluir este trabalho do portfólio?'))return save('delete_portfolio',{id},{close:false});},
  async uploadIntoField(input,target,allowPDF){const file=input.files?.[0];if(!file || !needUser())return;input.value='';await run(async()=>{const uploaded=await upload(file,allowPDF?'public':'image',user.id);patch({[target]:uploaded.url});},{close:false,message:'Arquivo carregado. Salve o formulário para confirmar.'});},
  markAllNotificationsRead(){if(needUser())return save('read_notifications',{}, {close:false,message:null});},
  async openNotification(n){await save('read_notifications',{id:n.id},{close:false,message:null});setNotifOpen(false);const r=getReq(n.linkRequestId);if(r?.clientId===user?.id && ['Aberto','Em análise'].includes(r.status))raw.openOffersCompareModal(r.id);else raw.navigateTo(r && ['Em andamento','Concluído'].includes(r.status)?'in-progress':'seller-panel');}
 };
 // Central error boundary for event handlers, including asynchronous validation.
 const actions=Object.fromEntries(Object.entries(raw).map(([name,fn])=>[name,(...args)=>{
  try {
   const event=args[0];if(event?.type==='submit'){event.preventDefault();for(const input of event.currentTarget.querySelectorAll('textarea,input[type="text"]')){if(input.readOnly || /Image|Avatar|Banner|Certificate/.test(input.id))continue;validate(Validators.validateText(input.value));}}
   const result=fn(...args);return result?.catch?result.catch(e=>{notify(e.message,'error');return false;}):result;
  }catch(e){notify(e.message,'error');return false;}
 }]));
 const field=(id,type='text')=>({[type==='checkbox'?'checked':'value']:type==='checkbox'?!!fields[id]:fields[id]??'',onChange:e=>{let value=type==='checkbox'?e.target.checked:e.target.value;const mask=/CPF/.test(id)?'formatCPF':/CNPJ/.test(id)?'formatCNPJ':/CEP/.test(id)?'formatCEP':/Phone/.test(id)?'formatPhone':null;if(mask)value=Validators[mask](value);patch({[id]:value});}});
 const notifications=data.notifications.filter(n=>n.userId===user?.id).sort((a,b)=>b.timestamp.localeCompare(a.timestamp));
 const myOrders=data.requests.filter(r=>[r.clientId,r.assignedSellerId].includes(user?.id) && ['Em andamento','Concluído'].includes(r.status));
 const openRequests=data.requests.filter(r=>['Aberto','Em análise'].includes(r.status));
 const inRadius=(r,radius)=>{if(!radius)return true;if(!user?.address?.uf)return false;const distance=Geo.calculateProximity(user.address,data.users.find(u=>u.id===r.clientId)?.address).distanceKm;return distance!=null && distance<=Number(radius);};
 const search=text('filterSearch').toLocaleLowerCase('pt-BR');
 const explored=openRequests.filter(r=>(!search || `${r.title} ${r.description} ${r.category}`.toLocaleLowerCase('pt-BR').includes(search)) && categoryMatches(r.category,fields.filterCategory) && (!fields.filterMaxBudget || r.budget<=num('filterMaxBudget')) && inRadius(r,fields.filterDistance) && (data.users.find(u=>u.id===r.clientId)?.ratingAsClient || 0)>=num('filterMinRating'));
 const compatible=openRequests.filter(r=>r.clientId!==user?.id && user?.sellerData?.categories.some(c=>categoryMatches(r.category,c)) && inRadius(r,fields.sellerDistance));
 const makers=data.users.filter(u=>u.isSeller).map(maker=>{const prices=[...(maker.sellerData.stock || []).filter(s=>s.active!==false && s.quantity>0).map(s=>s.price),...data.offers.filter(o=>o.sellerId===maker.id && o.status!=='Retirada').map(o=>o.price)];return {maker,from:maker.publicStats ? maker.publicStats.referencePrice : prices.length?Math.min(...prices):null};}).filter(({maker,from})=>(!fields.makerCategory || maker.sellerData.categories.some(c=>categoryMatches(c,fields.makerCategory))) && (!fields.makerPrice || (from!=null && from<=num('makerPrice'))) && (maker.ratingAsSeller || 0)>=num('makerRating') && (!text('marketSearch') || [maker.name,maker.sellerData.businessName,maker.sellerData.skills,...maker.sellerData.categories].join(' ').toLowerCase().includes(text('marketSearch').toLowerCase())));
 const myOffers=data.offers.filter(o=>o.sellerId===user?.id),compared=data.offers.filter(o=>o.requestId===compareId).sort((a,b)=>a.price-b.price);
 const offersReq=getReq(fields.offerRequestId),paymentOffer=getOffer(fields.paymentOfferId),currentSlide=slides[slide];
 const cards=(items,Component)=>items.length?items.map(item=><Component key={item.id} {...(Component===OfferCard?{offer:item}:{req:item})}/>):<Empty/>;
 const slots={
  inProgressCount:myOrders.filter(r=>r.status==='Em andamento').length,notifCountBadge:notifications.filter(n=>!n.read).length,
  userHeaderArea:user?<div className="user-menu"><button className="avatar-button" aria-label="Abrir meu perfil" onClick={()=>actions.navigateTo('profile')}><Picture src={user.avatar} className="user-avatar-mini" alt="Avatar"/></button><div className="user-name-role"><span className="name">{user.name}</span><span className="role">{user.isSeller?'Prestador':'Cliente'}</span></div><button className="btn btn-sm btn-secondary" title="Sair da Sessão" onClick={actions.logout}><Icon name="logout"/></button></div>:<><button className="btn btn-secondary btn-sm" onClick={()=>actions.openAuthModal('login')}>Entrar</button><button className="btn btn-primary btn-sm" onClick={()=>actions.openAuthModal('register')}>Cadastrar</button></>,
  notifListContainer:notifications.length?notifications.map(n=><button key={n.id} className={`notif-item ${n.read?'':'unread'}`} onClick={()=>actions.openNotification(n)}><strong>{n.title}</strong><p>{n.message}</p><small>{date(n.timestamp)}</small></button>):<p className="empty-state">Nenhuma notificação no momento.</p>,
  heroTitle:<>{currentSlide[0]}<br/>{currentSlide[1]}</>,heroDescription:currentSlide[2],heroAsideTitle:<>{currentSlide[3]}<br/>{currentSlide[4]}</>,heroAsideDescription:currentSlide[5],heroAction:<>{currentSlide[6]} <span aria-hidden="true">↗</span></>,
  exploreResultsCount:`${explored.length} ${explored.length===1?'ideia encontrada':'ideias encontradas'}`,
  exploreRequestsGrid:explored.length?<>{cards(explored,RequestTile)}{explored.length===2 && !search && !fields.filterCategory && <aside className="idea-invite-tile"><Icon name="cube"/><span className="eyebrow">A PRÓXIMA IDEIA PODE SER SUA</span><h3 style={{marginTop:12}}>o que vamos<br/>criar agora?</h3><p>Conte o que você imagina e receba propostas de quem sabe fazer.</p><button className="btn btn-outline" onClick={()=>actions.openNewRequestModal()}>publicar minha ideia ↗</button></aside>}</>:<Empty title="Nenhuma ideia por aqui ainda"><p>Experimente outra busca ou ajuste os filtros para encontrar novos projetos.</p><button className="btn btn-outline" onClick={actions.resetExploreFilters}>limpar filtros</button></Empty>,
  makersGrid:makers.length?makers.map(m=><MakerCard key={m.maker.id} {...m}/>):<Empty title="Nenhum prestador encontrado"><p>Tente outra especialidade, valor ou avaliação.</p></Empty>,
  clientRequestsGrid:cards(data.requests.filter(r=>r.clientId===user?.id && (clientFilter==='all' || r.status===clientFilter)),RequestCard),sellerCompatibleGrid:cards(compatible,RequestTile),sellerOffersCount:myOffers.length,sellerMyOffersGrid:cards(myOffers,OfferCard),sellerStockTableBody:<StockRows/>,sellerPortfolioGrid:<PortfolioCards/>,inProgressListContainer:cards(myOrders,OrderCard),
  profileDisplayName:user?.name,profileDisplayEmail:user?.email,profileBadgesArea:<><span className="badge badge-primary">{user?.isSeller?'Prestador e cliente':'Cliente'}</span></>,clientRatingValue:Number(user?.ratingAsClient || 0).toFixed(1),clientRatingStars:<Stars rating={user?.ratingAsClient}/>,clientRatingCount:`(${user?.totalClientReviews || 0} avaliações)`,sellerRatingValue:Number(user?.ratingAsSeller || 0).toFixed(1),sellerRatingStars:<Stars rating={user?.ratingAsSeller}/>,sellerRatingCount:`(${user?.totalSellerReviews || 0} avaliações)`,profileDisplayCPF:user?.cpf || '—',profileDisplayBirth:date(user?.birthDate),profileDisplayPhone:user?.phone || '—',profileDisplayGender:user?.gender,profileDisplayPreferences:user?.preferences || '—',profileDisplayCEP:user?.cep,profileDisplayAddress:[user?.address?.logradouro,user?.address?.bairro,user?.address?.cidade,user?.address?.uf].filter(Boolean).join(', '),profileDisplayBusinessName:user?.sellerData?.businessName,profileDisplayCNPJ:user?.sellerData?.cnpj || '—',profileDisplayVerification:user?.sellerData?.verificationInfo,profileDisplayCategories:user?.sellerData?.categories.join(' · '),profileDisplaySkills:user?.sellerData?.skills,profileReviewsList:<Reviews userId={user?.id}/>,
  makerProfileContent:<MakerProfile maker={data.users.find(u=>u.id===makerId)}/>,authModalTitle:authTab==='login'?'Entrar na Conta':authTab==='register'?'Criar Conta':'Recuperar Senha',reqDescCounter:`${text('reqDescription').length} / 2000 caracteres`,
  reqAttachmentsList:attachments.map((a,i)=><div className="attachment-chip" key={i}><Icon name="file"/><span>{a.name}</span><button type="button" aria-label={`Remover ${a.name}`} onClick={()=>setAttachments(old=>old.filter((_,idx)=>i!==idx))}>×</button></div>),
  confirmTitle:pending?.data.title,confirmCategory:pending?.data.category,confirmBudget:money(pending?.data.budget),confirmDeadline:date(pending?.data.desiredDeadline),confirmDescription:pending?.data.description,confirmAttachmentsSummary:<Attachments items={attachments}/>,compareModalSub:getReq(compareId)?.title,compareOffersContainer:compared.length?compared.map(o=><OfferCard key={o.id} offer={o} compare/>):<Empty title="Nenhuma proposta recebida ainda"/>,offerReqTitle:offersReq?.title,offerReqSummary:<>{money(offersReq?.budget)} · prazo desejado: {date(offersReq?.desiredDeadline)}<p>{offersReq?.description}</p><Attachments items={offersReq?.attachments}/></>,paymentDisplayAmount:money(paymentOffer?.price),paymentDisplaySeller:paymentOffer?.sellerName,reviewTargetPrompt:`Como foi sua experiência com ${data.users.find(u=>u.id===fields.reviewTargetUserId)?.name || 'o participante'}?`,starInteractiveContainer:[1,2,3,4,5].map(n=><button key={n} type="button" className="star-btn" aria-label={`${n} estrelas`} onClick={()=>patch({reviewRating:n})}><Icon name={n<=num('reviewRating')?'star':'starOutline'}/></button>),ratingTextFeedback:`${fields.reviewRating} de 5 estrelas`
 };
 const elementProps=(id,style={})=>{
  if(id.startsWith('view-'))return {className:`view-section ${view===id.slice(5)?'active':''}`};
  const visible={sellerUpgradeBanner:!user?.isSeller,sellerActiveContent:!!user?.isSeller,sellerReputationBox:!!user?.isSeller,profileSellerDetailsArea:!!user?.isSeller,formLogin:authTab==='login',formRegister:authTab==='register',formForgot:authTab==='forgot',regSellerExtraFields:!!fields.regIsSeller,paymentAreaPIX:payMethod==='PIX',paymentAreaCard:payMethod==='Cartão'};
  if(id in visible)return {style:{...style,display:visible[id]?'block':'none'}};
  if(id.startsWith('sellerSubtab-'))return {style:{...style,display:sellerTab===id.slice(13)?'block':'none'}};
  if(id==='exploreFilters')return {hidden:!filterOpen};if(id==='filterToggle')return {'aria-expanded':filterOpen};
  if(id==='notifDropdown')return {className:`notif-dropdown ${notifOpen?'show':''}`};if(id==='notifCountBadge')return {style:{...style,display:notifications.some(n=>!n.read)?'':'none'}};
  if(id==='profileAvatarDisplay')return {src:safeImage(user?.avatar) || '/assets/icons/user.svg'};
  if(id==='profileBannerDisplay')return {style:{...style,backgroundImage:safeImage(user?.banner)?`url("${safeImage(user.banner).replace(/["\\\n\r]/g,'')}")`:undefined}};
  if(id.startsWith('btnTab'))return {className:`auth-tab-btn ${authTab===id.slice(6).toLowerCase()?'active':''}`};
  if(id==='heroAction')return {onClick:()=>slide===0?actions.openNewRequestModal():slide===1?actions.selectCategory('Artesanato'):actions.openSellerUpgradeModal()};
  if(id==='reqFileInput')return {ref:fileRef};
  if(id==='btnConfirmAndPublish')return {disabled:busy};
  if(id==='offerDeadline')return {max:offersReq?.desiredDeadline};
  if(id==='reqDeadline' || id==='offerDeadline' || id==='negDeadline')return {min:new Date().toLocaleDateString('en-CA')};
  return {};
 };
 const activeClass=(base,kind,value)=>{const selected={view,category:fields.filterCategory || '',status:clientFilter,sellerTab}[kind]===value;return {className:`${base.replace(/\bactive\b/g,'')} ${selected?'active':''}`,'aria-pressed':selected};};
 const context={data,user,view,modal,recovery,actions,field,slots,elementProps,activeClass,busy,slide,payMethod};
 if(!demoMode && !supabase)return <main className="container setup-screen"><h1>TresDê</h1><h2>Conecte seu Supabase</h2><p>Copie frontend/.env.example para frontend/.env e configure a URL e a chave pública. Aplique a migration conforme o README e reinicie o Vite.</p><p>Para explorar a demonstração local, use VITE_DEMO_MODE=true.</p></main>;
 if(loading)return <main className="container setup-screen" role="status">Carregando TresDê…</main>;
 return <AppContext.Provider value={context}><Header/>{error && <div className="container" role="alert"><p>Não foi possível atualizar os dados: {error}</p><button className="btn btn-secondary" onClick={()=>refresh().catch(e=>setError(e.message))}>Tentar novamente</button></div>}<main className="main-content"><div className="container"><Explore/><ClientRequests/><SellerPanel/><InProgress/><Profile/></div></main><footer className="site-footer"><div className="container"><a className="footer-brand" href="#" onClick={e=>{e.preventDefault();actions.navigateTo('explore');}}>TresDê<span>ideias ganham forma.</span></a><p>Impressão 3D, artesanato e conexões de verdade.</p>{demoMode && <button className="text-link" onClick={actions.toggleDemo}>modo demonstração</button>}</div></footer>{demoMode && <details id="demoControls" className="demo-controls" open={demoOpen} onToggle={e=>setDemoOpen(e.currentTarget.open)}><summary>Controles do protótipo acadêmico</summary><aside className="top-bar-academic"><div className="container"><div><span className="academic-badge">Demonstração local</span><span>Dados fictícios salvos neste navegador.</span></div><div className="demo-switcher"><label htmlFor="demoUserSelect">Simular Usuário:</label><select id="demoUserSelect" disabled={busy} value={user?.id || ''} onChange={e=>actions.switchUser(e.target.value)}><option value="">Selecione</option>{data.users.map(u=><option key={u.id} value={u.id}>{u.name} ({u.isSeller?'Prestador':'Cliente'})</option>)}</select><button className="btn btn-secondary btn-sm" onClick={actions.resetDatabase}>Resetar Dados</button></div></div></aside></details>}<Dialogs/><div id="toast-container" role="status" aria-live="polite">{toast && <div className={`toast ${toast.type} show`}><Icon name={toast.type==='error'?'alert':'check'}/><span>{toast.message}</span></div>}</div></AppContext.Provider>;
}
