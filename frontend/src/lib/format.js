export const money = value => Number(value || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export const date = value => value ? new Date(value.length===10?value+'T00:00:00':value).toLocaleDateString('pt-BR') : '—';
export const steps = ['Recebido','Em Produção','Finalizado','Enviado','Entregue'];
export const categoryMatches = (category, selected) => !selected || category===selected || (category==='Impressão 3D e Pintura' && ['Impressão 3D','Pintura Manual'].includes(selected));
export const safeURL = value => /^(https?:\/\/|\/assets\/|assets\/|data:(image\/(png|jpeg|webp)|application\/(pdf|octet-stream));base64,)/i.test(value || '') ? value : '';
export const safeImage = value => /^https:\/\/images\.unsplash\.com\/photo-1563245372-f21724e3856d/.test(value || '') ? '/assets/illustrations/miniature.svg' : /^(https?:\/\/|\/assets\/|assets\/|data:image\/(png|jpeg|webp);base64,)/i.test(value || '') ? value : '';
export const canCancel = (req,user) => !!req && !!user && (['Aberto','Em análise'].includes(req.status)?req.clientId===user.id:req.status==='Em andamento' && ['Recebido','Em Produção'].includes(req.productionStatus) && [req.clientId,req.assignedSellerId].includes(user.id));
