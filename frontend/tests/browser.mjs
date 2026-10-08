import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createServer } from 'vite';
let server;
if(!process.env.TEST_URL) {
 process.env.VITE_DEMO_MODE='true';
 server=await createServer({server:{host:'127.0.0.1',port:5178,strictPort:true},logLevel:'error'});
 await server.listen();
}
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1365,height:900}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
page.on('console',msg=>{if(msg.type()==='error' && /React|controlled|component|DOM property|attribute|unique.*key/i.test(msg.text()))errors.push(msg.text());});
page.on('dialog',dialog=>dialog.accept());
const check=(value,label)=>{assert.ok(value,label);console.log('OK:',label);};
const collection=name=>page.evaluate(name=>JSON.parse(localStorage.getItem('tresde_react_demo_v1') || '{}')[name] || [],name);
const switchUser=async id=>{await page.locator('#demoControls').evaluate(el=>el.open=true);await page.locator('#demoUserSelect').selectOption(id);await page.waitForFunction(id=>JSON.parse(localStorage.getItem('tresde_react_demo_v1')).currentUserId===id,id);};
const navigate=async view=>{const button=page.locator(`.nav-btn[data-view="${view}"]`);if(view==='profile' && !await button.isVisible())await page.getByRole('button',{name:'Abrir meu perfil',exact:true}).click();else await button.click();};
const submit=async form=>page.locator(form).evaluate(el=>el.requestSubmit());
try {
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5178',{waitUntil:'networkidle'});
 await page.waitForSelector('.request-tile');
 check(await page.locator('.request-tile:visible').count()===2,'Mural mostra os dois pedidos abertos');
 check(await page.locator('.maker-card').count()===2,'Vitrine de prestadores preservada');
 await page.locator('.category-link[data-category="Artesanato"]').click();
 check(await page.locator('.request-tile:visible').count()===0,'Filtro de categoria e estado vazio');
 await page.getByRole('button',{name:'limpar filtros',exact:true}).click();
 await page.locator('#makerCategory').selectOption('Artesanato');
 check(await page.locator('.maker-card').count()===1,'Especialidade filtra prestadores');
 await page.locator('#makerCategory').selectOption('');
 await page.locator('#makerPrice').selectOption('100');await page.locator('#makerRating').selectOption('4.5');
 check(await page.locator('.maker-card').count()===2,'Preço e reputação combinam');
 await page.locator('.maker-card button').first().click();
 check(await page.locator('#modalMaker').isVisible(),'Perfil público abre');
 await page.keyboard.press('Escape');check(await page.locator('#modalMaker').count()===0,'Escape fecha o modal');
 await page.getByRole('button',{name:'Destaque: feito à mão'}).click();
 check(await page.locator('#heroTitle').innerText()==='feito à mão.\nfeito pra durar.','Banner muda com estado React');
 await page.getByRole('button',{name:'Destaque: sua ideia',exact:true}).click();
 for(const width of [320,390,768,1024,1365]){await page.setViewportSize({width,height:900});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Sem overflow em ${width}px`);}
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'quero criar',exact:true}).click();
 await page.locator('#reqTitle').fill('Vaso geométrico personalizado');await page.locator('#reqCategory').selectOption('Impressão 3D');await page.locator('#reqBudget').fill('100');await page.locator('#reqDeadline').fill('2099-12-20');await page.locator('#reqDescription').fill('Vaso em PLA terracota de 15 centímetros.');
 await page.locator('#reqFileInput').setInputFiles({name:'referencia.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jOioAAAAASUVORK5CYII=','base64')});
 await page.waitForSelector('#reqAttachmentsList .attachment-chip');
 await submit('#formRequest');
 check(await page.locator('#modalConfirmRequest').isVisible(),'Pedido exige revisão antes de publicar');
 await page.locator('#btnConfirmAndPublish').click();
 await page.waitForSelector('#modalConfirmRequest',{state:'detached'});
 let req=(await collection('requests')).find(r=>r.title==='Vaso geométrico personalizado');check(req?.attachments[0].url.startsWith('data:image/png'),'Pedido e anexo persistidos na demonstração');
 await page.reload({waitUntil:'networkidle'});check((await collection('requests')).some(r=>r.id===req.id),'Pedido persiste ao recarregar');
 await switchUser('usr_carlos');
 const tile=page.locator('.request-tile:visible').filter({hasText:req.title});await tile.getByRole('button',{name:'enviar oferta'}).click();
 await page.locator('#offerPrice').fill('90');await page.locator('#offerDeadline').fill('2099-12-21');await page.locator('#offerNotes').fill('Impressão em PLA, acabamento fosco.');await submit('#formOffer');
 check(!(await collection('offers')).some(o=>o.requestId===req.id),'Prazo incompatível bloqueado');
 await page.locator('#offerDeadline').fill('2099-12-15');await submit('#formOffer');await page.waitForSelector('#modalOfferSend',{state:'detached'});
 let offer=(await collection('offers')).find(o=>o.requestId===req.id);check(offer?.price===90,'Prestador envia oferta');
 await switchUser('usr_mariana');await page.locator('.request-tile:visible').filter({hasText:req.title}).getByRole('button',{name:'ver propostas'}).click();
 await page.getByRole('button',{name:'Negociar',exact:true}).click();await page.locator('#negPrice').fill('85');await page.locator('#negMessage').fill('Retirada presencial.');await submit('#formNegotiate');await page.waitForSelector('#modalNegotiate',{state:'detached'});
 await switchUser('usr_carlos');await navigate('seller-panel');await page.getByRole('button',{name:/Minhas Ofertas Enviadas/}).click();
 await page.getByRole('button',{name:'Aceitar contraproposta',exact:true}).click();await page.waitForFunction(id=>JSON.parse(localStorage.getItem('tresde_react_demo_v1')).offers.find(o=>o.id===id).status==='Pendente',offer.id);
 await switchUser('usr_mariana');await navigate('client-requests');await page.locator('#clientRequestsGrid .card').filter({hasText:req.title}).getByRole('button',{name:'Comparar propostas'}).click();
 await page.getByRole('button',{name:'Aceitar proposta',exact:true}).click();check(await page.locator('#paymentDisplayAmount').innerText()==='R$ 85,00','Pagamento usa o valor negociado');await submit('#formPayment');await page.waitForSelector('#modalPayment',{state:'detached'});
 check((await collection('requests')).find(r=>r.id===req.id).productionStatus==='Recebido','Aceite inicia produção');
 await page.locator(`#chatInput_${req.id}`).fill('porra');await page.locator(`#chatInput_${req.id}`).press('Enter');await page.waitForSelector('.toast.error');
 check(!(await collection('messages')).some(m=>m.requestId===req.id),'Moderação do chat');
 await page.locator(`#chatInput_${req.id}`).fill('Podemos manter a cor terracota?');await page.locator(`#chatInput_${req.id}`).press('Enter');await page.waitForFunction(id=>JSON.parse(localStorage.getItem('tresde_react_demo_v1')).messages.some(m=>m.requestId===id),req.id);
 check(await page.getByRole('button',{name:/Avançar para/}).count()===0,'Cliente não pode avançar produção');
 await switchUser('usr_carlos');await navigate('in-progress');
 for(const step of ['Em Produção','Finalizado','Enviado','Entregue']){await page.getByRole('button',{name:`Avançar para: ${step}`,exact:true}).click();await page.waitForFunction(({id,step})=>JSON.parse(localStorage.getItem('tresde_react_demo_v1')).requests.find(r=>r.id===id).productionStatus===step,{id:req.id,step});}
 check(await page.getByRole('button',{name:'Confirmar recebimento',exact:true}).count()===0,'Recebimento exclusivo do cliente');
 await switchUser('usr_mariana');await navigate('in-progress');await page.getByRole('button',{name:'Confirmar recebimento',exact:true}).click();
 await page.waitForFunction(id=>JSON.parse(localStorage.getItem('tresde_react_demo_v1')).requests.find(r=>r.id===id).status==='Concluído',req.id);
 await page.locator('#inProgressListContainer > .card').filter({hasText:req.title}).getByRole('button',{name:'Avaliar o Prestador'}).click();await page.locator('#reviewComment').fill('Ótimo acabamento e comunicação.');await submit('#formReview');await page.waitForSelector('#modalReview',{state:'detached'});
 check((await collection('reviews')).filter(r=>r.requestId===req.id).length===1,'Avaliação salva após recebimento');
 check(await page.locator('#inProgressListContainer > .card').filter({hasText:req.title}).getByRole('button',{name:'Avaliação enviada'}).isDisabled(),'Avaliação duplicada bloqueada');
 await switchUser('usr_lucas');await navigate('in-progress');await page.getByRole('button',{name:'Cancelar pedido',exact:true}).click();await page.locator('#cancelReason').fill('O projeto não será mais necessário.');await submit('#formCancelRequest');await page.waitForSelector('#modalCancelRequest',{state:'detached'});check((await collection('requests')).find(r=>r.id==='req_103').status==='Cancelado','Participante cancela durante a produção');
 await switchUser('usr_carlos');await navigate('seller-panel');await page.getByRole('button',{name:'Gerenciar Portfólio',exact:true}).click();await page.locator('#portTitle').fill('Apresentação do ateliê');await page.locator('#portDescription').fill('Trabalhos em impressão 3D.');await page.locator('#portImageUpload').setInputFiles({name:'portfolio.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n%%EOF')});await page.waitForFunction(()=>document.querySelector('#portImage').value.startsWith('data:application/pdf'));await submit('#formPortfolio');await page.waitForSelector('#modalPortfolio',{state:'detached'});check((await collection('users')).find(u=>u.id==='usr_carlos').sellerData.portfolio.some(p=>p.title==='Apresentação do ateliê'),'Portfólio PDF salvo');
 await page.getByRole('button',{name:'Gerenciar Estoque',exact:true}).click();await page.locator('#stockName').fill('Filamento teste');await page.locator('#stockPrice').fill('59.90');await page.locator('#stockQuantity').fill('3');await page.locator('#stockActive').selectOption('false');await submit('#formStock');await page.waitForSelector('#modalStock',{state:'detached'});check((await collection('users')).find(u=>u.id==='usr_carlos').sellerData.stock.some(s=>s.name==='Filamento teste' && !s.active),'Estoque e disponibilidade salvos');
 for(const view of ['client-requests','seller-panel','in-progress','profile','explore']){await navigate(view);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Tela ${view} cabe no celular`);}
 await page.setViewportSize({width:1365,height:900});await page.getByTitle('Sair da Sessão').click();await page.waitForSelector('#userHeaderArea button:has-text("Entrar")');await navigate('profile');check(await page.locator('#modalAuth').isVisible(),'Área privada exige login');await page.keyboard.press('Escape');
 await switchUser('usr_mariana');await navigate('explore');
 await mkdir('test-results',{recursive:true});await page.setViewportSize({width:1365,height:900});await page.screenshot({path:'test-results/desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/mobile.png',fullPage:true});
 check(errors.length===0,`Sem erros React/JavaScript: ${errors.join('; ')}`);
} catch(error){await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/failure.png',fullPage:true});throw error;}
finally{await browser.close();await server?.close();}
