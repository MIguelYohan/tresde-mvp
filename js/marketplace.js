/** Vitrine e descoberta de prestadores. Usa a mesma persistência e os fluxos da SPA. */
Object.assign(App, {
    escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    },
    safeImage(value) {
        const url = String(value || '').replace(/^https:\/\/images\.unsplash\.com\/photo-1563245372-f21724e3856d.*$/, 'assets/illustrations/miniature.svg');
        return /^(https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,|assets\/)/i.test(url) ? this.escapeHTML(url) : '';
    },
    money(value) { return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); },
    categoryMatches(category, selected) {
        return !selected || category === selected || (category === 'Impressão 3D e Pintura' && ['Impressão 3D', 'Pintura Manual'].includes(selected));
    },
    searchMarketplace() {
        document.getElementById('filterSearch').value = document.getElementById('marketSearch').value.trim();
        this.navigateTo('explore');
        this.renderMakers();
        document.getElementById('opportunitiesHeading').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    selectCategory(category) {
        document.getElementById('filterCategory').value = category;
        this.applyExploreFilters();
    },
    toggleExploreFilters() {
        const panel = document.getElementById('exploreFilters');
        panel.hidden = !panel.hidden;
        document.getElementById('filterToggle').setAttribute('aria-expanded', String(!panel.hidden));
    },
    resetExploreFilters() {
        ['filterSearch', 'filterCategory', 'filterMaxBudget', 'filterDistance', 'marketSearch'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('filterMinRating').value = '0';
        this.applyExploreFilters();
        this.renderMakers();
    },
    applyExploreFilters() {
        const category = document.getElementById('filterCategory').value;
        document.querySelectorAll('.category-link').forEach(button => {
            const active = button.dataset.category === category;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        this.renderExploreRequests();
    },
    setHeroSlide(index) {
        const slides = [
            ['sua ideia.<br>outra dimensão.', 'Da primeira inspiração à peça que só você tem.', 'vamos dar<br>forma?', 'Encontre quem transforma a sua ideia em algo único.', 'começar minha ideia', () => this.openNewRequestModal()],
            ['feito à mão.<br>feito pra durar.', 'Histórias e cuidado em cada pequeno detalhe.', 'tem um toque<br>só seu.', 'Explore projetos de artesanato e crie novas possibilidades.', 'explorar artesanato', () => { this.selectCategory('Artesanato'); document.getElementById('opportunitiesHeading').scrollIntoView({ behavior: 'smooth' }); }],
            ['seu talento.<br>novas conexões.', 'O próximo projeto incrível pode ser o seu.', 'bora criar<br>juntos?', 'Abra as portas do seu ateliê para novas ideias.', 'quero ser prestador', () => this.openSellerUpgradeModal()]
        ];
        const slide = slides[index];
        if (!slide) return;
        document.getElementById('heroTitle').innerHTML = slide[0];
        document.getElementById('heroDescription').textContent = slide[1];
        document.getElementById('heroAsideTitle').innerHTML = slide[2];
        document.getElementById('heroAsideDescription').textContent = slide[3];
        const action = document.getElementById('heroAction');
        action.textContent = slide[4] + ' ↗';
        action.onclick = slide[5];
        document.querySelectorAll('.hero-pagination button').forEach((button, i) => {
            button.classList.toggle('active', index === i);
            button.setAttribute('aria-pressed', String(index === i));
        });
    },
    renderRequestTile(req, client, offersCount, currentUser) {
        const esc = this.escapeHTML;
        const image = req.attachments?.find(a => a.type === 'image' && this.safeImage(a.url));
        const location = client?.address ? `${client.address.cidade}, ${client.address.uf}` : 'Localização não informada';
        const action = currentUser?.id === req.clientId
            ? `<button class="btn btn-outline btn-sm" onclick="App.openOffersCompareModal('${esc(req.id)}')">ver propostas ↗</button>`
            : currentUser?.isSeller
                ? `<button class="btn btn-outline btn-sm" onclick="App.openSendOfferModal('${esc(req.id)}')">enviar oferta ↗</button>`
                : '<button class="btn btn-outline btn-sm" onclick="App.openSellerUpgradeModal()">quero criar essa ideia ↗</button>';
        return `<article class="request-tile">
            <div class="request-cover">${image ? `<img src="${this.safeImage(image.url)}" alt="Referência de ${esc(req.title)}" loading="lazy" onerror="this.hidden=true; this.nextElementSibling.hidden=false"><div class="request-fallback" hidden>${Icons.cube}</div>` : `<div class="request-fallback">${Icons.cube}</div>`}<span class="badge">${esc(req.status === 'Aberto' ? 'recebendo propostas' : 'em análise')}</span></div>
            <div class="request-tile-category"><span>${esc(req.category)}</span><span>${Icons.star} ${Number(client?.ratingAsClient || 0).toFixed(1)}</span></div>
            <h3>${esc(req.title)}</h3><div class="request-tile-price">${this.money(req.budget)}<span>orçamento estimado</span></div>
            <div class="request-tile-meta"><span>${Icons.mapPin}${esc(location)}</span><span>${Icons.calendar}${new Date(req.desiredDeadline + 'T00:00:00').toLocaleDateString('pt-BR')}</span></div>
            <div class="request-tile-footer"><span>${offersCount} ${offersCount === 1 ? 'proposta' : 'propostas'}</span>${action}</div>
        </article>`;
    },
    renderMakers() {
        const grid = document.getElementById('makersGrid');
        const category = document.getElementById('makerCategory').value;
        const maxPrice = Number(document.getElementById('makerPrice').value) || Infinity;
        const minRating = Number(document.getElementById('makerRating').value);
        const search = document.getElementById('marketSearch').value.trim().toLocaleLowerCase('pt-BR');
        const offers = StorageService.getOffers();
        const makers = StorageService.getUsers().filter(user => user.isSeller && user.sellerData).map(user => {
            const prices = [...(user.sellerData.stock || []).filter(item => item.quantity > 0 && item.active !== false).map(item => item.price), ...offers.filter(offer => offer.sellerId === user.id && offer.status !== 'Retirada').map(offer => offer.price)].filter(price => Number.isFinite(price) && price >= 0);
            return { user, from: prices.length ? Math.min(...prices) : null };
        }).filter(({ user, from }) => {
            const data = user.sellerData;
            return (!category || data.categories.some(c => this.categoryMatches(c, category))) && (maxPrice === Infinity || (from !== null && from <= maxPrice)) && (user.ratingAsSeller || 0) >= minRating && (!search || [user.name, data.businessName, data.skills, ...data.categories].join(' ').toLocaleLowerCase('pt-BR').includes(search));
        });
        grid.innerHTML = makers.length ? makers.map(({ user, from }) => `<article class="maker-card"><img src="${this.safeImage(user.avatar)}" alt="${this.escapeHTML(user.name)}" loading="lazy"><div><h3>${this.escapeHTML(user.sellerData.businessName || user.name)}</h3><p>${this.escapeHTML(user.sellerData.categories.join(' · '))}</p><p>${Icons.star} ${Number(user.ratingAsSeller || 0).toFixed(1)} · ${user.totalSellerReviews || 0} avaliações · ${this.escapeHTML(user.address?.cidade || '')}</p><p>${from === null ? 'Orçamento sob consulta' : 'Referências a partir de ' + this.money(from)}</p><button class="text-link" onclick="App.openMakerProfile('${this.escapeHTML(user.id)}')">conhecer o trabalho <span aria-hidden="true">↗</span></button></div></article>`).join('') : '<div class="empty-state"><h3>Nenhum prestador encontrado</h3><p>Tente outra especialidade, valor ou avaliação.</p></div>';
    },
    openMakerProfile(userId) {
        const user = StorageService.getUserById(userId);
        if (!user?.isSeller) return;
        const esc = this.escapeHTML;
        const data = user.sellerData;
        const reviews = StorageService.getReviews().filter(review => review.targetUserId === userId);
        const history = StorageService.getRequests().filter(req => req.assignedSellerId === userId && req.status === 'Concluído');
        document.getElementById('makerProfileContent').innerHTML = `<div class="maker-profile-heading"><img src="${this.safeImage(user.avatar)}" alt="${esc(user.name)}"><div><h2>${esc(data.businessName || user.name)}</h2><p>${esc(user.address?.cidade)} · ${esc(user.address?.uf)}</p><p>${Icons.star} ${Number(user.ratingAsSeller || 0).toFixed(1)} · ${user.totalSellerReviews || 0} avaliações</p></div></div><p>${esc(data.skills)}</p>
            <section class="maker-profile-section"><h3>Especialidades e qualificações</h3><p>${esc(data.categories.join(' · '))}</p><p>${esc(data.verificationInfo || 'Nenhuma qualificação informada.')}</p>${data.certificate ? this.portfolioMedia({ image: data.certificate, title: 'Certificado informado pelo prestador' }) : ''}</section>
            <section class="maker-profile-section"><h3>Portfólio</h3><div class="maker-portfolio">${(data.portfolio || []).map(item => `<div>${this.portfolioMedia(item)}<p>${esc(item.title)}</p></div>`).join('') || '<p>Este prestador ainda não adicionou trabalhos.</p>'}</div></section>
            <section class="maker-profile-section"><h3>Itens em estoque</h3>${(data.stock || []).filter(item => item.quantity > 0 && item.active !== false).map(item => `<p>${esc(item.name)} · ${this.money(item.price)} · ${item.quantity} disponíveis</p>`).join('') || '<p>Nenhum item disponível no momento.</p>'}</section>
            <section class="maker-profile-section"><h3>Trabalhos concluídos</h3>${history.map(req => `<p>${esc(req.title)}</p>`).join('') || '<p>Nenhum trabalho concluído na plataforma.</p>'}</section>
            <section class="maker-profile-section"><h3>Avaliações recebidas</h3>${reviews.map(review => `<p><strong>${esc(review.reviewerName)} · ${review.rating}/5</strong><br>${esc(review.comment || 'Sem comentário.')}</p>`).join('') || '<p>Nenhuma avaliação registrada.</p>'}</section>`;
        this.openModal('modalMaker');
    },
    canCancelRequest(req, user = StorageService.getCurrentUser()) {
        if (!req || !user) return false;
        if (['Aberto', 'Em análise'].includes(req.status)) return req.clientId === user.id;
        return req.status === 'Em andamento' && ['Recebido', 'Em Produção'].includes(req.productionStatus) && [req.clientId, req.assignedSellerId].includes(user.id);
    },
    openCancelRequestModal(requestId) {
        const req = StorageService.getRequestById(requestId);
        if (!this.canCancelRequest(req)) return this.showToast('Cancelamento disponível aos participantes antes da finalização da produção.', 'error');
        document.getElementById('cancelRequestId').value = req.id;
        document.getElementById('cancelReason').value = '';
        this.openModal('modalCancelRequest');
    },
    handleConfirmCancelRequest(event) {
        event.preventDefault();
        const req = StorageService.getRequestById(document.getElementById('cancelRequestId').value);
        const reason = document.getElementById('cancelReason').value.trim();
        if (!this.canCancelRequest(req)) return this.showToast('Este pedido não pode ser cancelado.', 'error');
        if (!reason || !Validators.validateText(reason).valid) return this.showToast('Informe uma justificativa válida, sem palavras proibidas.', 'error');
        const user = StorageService.getCurrentUser();
        req.status = 'Cancelado';
        req.statusHistory.push({ status: 'Cancelado', timestamp: new Date().toISOString(), note: `Cancelado por ${user.name}. Motivo: ${reason}` });
        StorageService.saveRequest(req);
        StorageService.getOffers(req.id).filter(offer => offer.status === 'Pendente').forEach(offer => { offer.status = 'Recusada'; StorageService.saveOffer(offer); });
        const recipients = new Set([req.clientId, req.assignedSellerId, ...StorageService.getOffers(req.id).map(offer => offer.sellerId)]);
        recipients.forEach(userId => { if (userId && userId !== user.id) StorageService.addNotification({ userId, title: 'Pedido cancelado', message: `${req.title}: ${reason}`, linkRequestId: req.id }); });
        this.closeModal('modalCancelRequest');
        this.navigateTo(this.currentView);
        this.updateInProgressBadge();
        this.updateNotificationBadge();
        this.showToast('Cancelamento registrado. Pagamentos deste protótipo são simulados.', 'success');
    },
    confirmReceipt(requestId) {
        const req = StorageService.getRequestById(requestId);
        const user = StorageService.getCurrentUser();
        if (!user || req?.clientId !== user.id || req.status !== 'Em andamento' || req.productionStatus !== 'Entregue') return;
        req.status = 'Concluído';
        req.receiptConfirmedAt = new Date().toISOString();
        req.statusHistory.push({ status: 'Concluído', timestamp: req.receiptConfirmedAt, note: 'Recebimento confirmado pelo cliente.' });
        StorageService.saveRequest(req);
        StorageService.addNotification({ userId: req.assignedSellerId, title: 'Recebimento confirmado', message: `O cliente confirmou o recebimento de "${req.title}".`, linkRequestId: req.id });
        this.renderInProgress();
        this.updateInProgressBadge();
        this.showToast('Recebimento confirmado! Agora vocês podem se avaliar.', 'success');
    }
});

// A moderação acontece antes dos manipuladores de envio de todos os formulários.
// Senhas, endereços de e-mail, URLs e números não são textos publicados.
document.addEventListener('submit', event => {
    for (const input of event.target.querySelectorAll('textarea, input[type="text"], input:not([type])')) {
        if (input.disabled || input.readOnly || ['portImage', 'editProfAvatar', 'editProfBanner'].includes(input.id) || input.closest('[hidden]')) continue;
        const result = Validators.validateText(input.value);
        if (!result.valid) {
            event.preventDefault();
            event.stopImmediatePropagation();
            App.showToast(result.message, 'error');
            input.focus();
            break;
        }
    }
}, true);

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('headerSearchIcon').innerHTML = Icons.search;
    document.getElementById('filterToggleIcon').innerHTML = Icons.tools;
    App.renderMakers();
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        const title = modal.querySelector('h2');
        if (title) { title.id ||= `${modal.id}Title`; modal.setAttribute('aria-labelledby', title.id); }
        modal.querySelectorAll('.modal-close-btn').forEach(button => button.setAttribute('aria-label', 'Fechar janela'));
    });
});

// Uploads locais: limites pequenos são necessários para persistência no navegador.
Object.assign(App, {
    readLocalFile(file, extensions) {
        return new Promise((resolve, reject) => {
            const extension = file.name.split('.').pop().toLowerCase();
            if (!extensions.includes(extension)) return reject(new Error('Formato não suportado. Use ' + extensions.join(', ') + '.'));
            if (file.size > 750 * 1024) return reject(new Error('Use um arquivo de até 750 KB neste protótipo.'));
            const usage = Object.keys(localStorage).reduce((total, key) => total + (localStorage.getItem(key)?.length || 0), 0);
            if (usage + file.size * 2 > 4 * 1024 * 1024) return reject(new Error('O armazenamento está próximo do limite. Remova anexos antigos antes de continuar.'));
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
            reader.onload = () => {
                const mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', pdf: 'application/pdf', stl: 'application/octet-stream', obj: 'application/octet-stream' }[extension];
                resolve(String(reader.result).replace(/^data:[^;]*;/, `data:${mime};`));
            };
            reader.readAsDataURL(file);
        });
    },
    async uploadIntoField(input, targetId, allowPDF = false) {
        const file = input.files[0];
        if (!file) return;
        const form = input.closest('form');
        const submit = form?.querySelector('[type="submit"]');
        if (submit) submit.disabled = true;
        try {
            const result = await this.readLocalFile(file, allowPDF ? ['jpg', 'jpeg', 'png', 'webp', 'pdf'] : ['jpg', 'jpeg', 'png', 'webp']);
            document.getElementById(targetId).value = result;
            this.showToast('Arquivo carregado. Salve o formulário para confirmar.', 'success');
        } catch (error) { this.showToast(error.message, 'error'); }
        finally { if (submit) submit.disabled = false; input.value = ''; }
    },
    async handleFileSelection(event) {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        const submit = document.querySelector('#formRequest [type="submit"]');
        if (submit) submit.disabled = true;
        try {
            for (const file of files) {
                if (this.activeAttachments.length >= 5) throw new Error('Adicione no máximo 5 anexos por pedido.');
                const url = await this.readLocalFile(file, ['jpg', 'jpeg', 'png', 'webp', 'stl', 'obj', 'pdf']);
                const ext = file.name.split('.').pop().toLowerCase();
                const totalSize = this.activeAttachments.reduce((sum, item) => sum + (item.url?.length || 0), 0);
                if (totalSize + url.length > 1500000) throw new Error('Os anexos do pedido devem somar até 1 MB.');
                this.activeAttachments.push({ name: this.escapeHTML(file.name), type: ['stl', 'obj'].includes(ext) ? 'stl' : ext === 'pdf' ? 'file' : 'image', size: `${Math.ceil(file.size / 1024)} KB`, url });
            }
            this.showToast('Anexos carregados.', 'success');
        } catch (error) { this.showToast(error.message, 'error'); }
        finally { event.target.value = ''; this.renderActiveAttachments(); if (submit) submit.disabled = false; }
    },
    portfolioMedia(item) {
        const url = String(item.image || '');
        if (/^data:application\/pdf;base64,/i.test(url) || /^https?:\/\/[^\s]+\.pdf(?:[?#].*)?$/i.test(url)) {
            return `<a class="btn btn-outline" href="${this.escapeHTML(url)}" download="portfolio.pdf" target="_blank" rel="noopener">${Icons.file} Abrir portfólio PDF</a>`;
        }
        return `<img src="${this.safeImage(url)}" alt="${this.escapeHTML(item.title)}" loading="lazy">`;
    }
});

// Foco e teclado em todos os modais existentes.
const baseOpenModal = App.openModal;
const baseCloseModal = App.closeModal;
const modalFocus = new Map();
let modalLayer = 1000;
App.openModal = function(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modalFocus.set(id, document.activeElement);
    baseOpenModal.call(this, id);
    modal.style.zIndex = String(++modalLayer);
    document.body.classList.add('modal-open');
    modal.querySelector('input:not([type="hidden"]), button, select, textarea')?.focus();
};
App.closeModal = function(id) {
    baseCloseModal.call(this, id);
    if (!document.querySelector('.modal-overlay.show')) document.body.classList.remove('modal-open');
    modalFocus.get(id)?.focus();
};
document.addEventListener('keydown', event => {
    const modals = Array.from(document.querySelectorAll('.modal-overlay.show')).sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex));
    const modal = modals.at(-1);
    if (!modal) return;
    if (event.key === 'Escape') { App.closeModal(modal.id); return; }
    if (event.key !== 'Tab') return;
    const elements = Array.from(modal.querySelectorAll('button, input, textarea, select, a[href], [tabindex="0"]')).filter(el => !el.disabled && el.getClientRects().length);
    const first = elements[0], last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});

App.requestAttachmentLinks = function(req) {
    const attachments = (req.attachments || []).filter(item => /^(https?:\/\/|data:(image\/(png|jpeg|webp)|application\/(pdf|octet-stream));base64,)/i.test(item.url || ''));
    return attachments.length ? `<div class="request-attachments">${attachments.map(item => `<a class="btn btn-secondary btn-sm" href="${this.escapeHTML(item.url)}" download="${this.escapeHTML(item.name)}" target="_blank" rel="noopener">${Icons.paperclip} ${this.escapeHTML(item.name)}</a>`).join('')}</div>` : '';
};
