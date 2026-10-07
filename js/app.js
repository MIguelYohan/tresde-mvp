/**
 * TresDê - Módulo Principal da Aplicação (UI Controller & Business Flow)
 * Implementação 100% Client-Side com persistência em localStorage
 * Tipografia: Sora • Ícones: SVG System (sem emojis)
 */

const App = {
    currentView: 'explore',
    currentClientFilter: 'all',
    activeAttachments: [],
    selectedReviewRating: 5,
    pendingRequestData: null,

    init() {
        // Inicializa dados fictícios se for a primeira execução
        StorageService.initSeed();

        // Injeta ícones estáticos no layout (Header, Navbar, Topbar, Modais)
        // Usa os fallbacks inline síncronos para renderização imediata
        this.initStaticIcons();

        // Carrega os SVGs dos arquivos em assets/icons/ de forma assíncrona
        // e re-injeta os ícones com as versões carregadas dos arquivos
        Icons.loadAll().then(() => {
            this.initStaticIcons();
            this.renderUserHeader();
            this.navigateTo(this.currentView);
            console.log('[Icons] Ícones SVG carregados a partir de assets/icons/.');
        }).catch(err => {
            console.warn('[Icons] Falha parcial no carregamento dos ícones SVG:', err);
        });

        // Configura seletor de usuários acadêmicos
        this.renderDemoUserSwitcher();

        // Renderiza o cabeçalho do usuário
        this.renderUserHeader();

        // Atualiza contadores e notificações
        this.updateNotificationBadge();
        this.updateInProgressBadge();

        // Renderiza a view inicial
        this.navigateTo('explore');

        // Configura fechamento de dropdowns ao clicar fora
        document.addEventListener('click', (e) => {
            const notifDropdown = document.getElementById('notifDropdown');
            const notifBellBtn = document.getElementById('notifBellBtn');
            if (notifDropdown && notifBellBtn && !notifDropdown.contains(e.target) && !notifBellBtn.contains(e.target)) {
                notifDropdown.classList.remove('show');
            }
        });

        console.log('Sistema TresDê inicializado com sucesso.');
    },

    // ========================================================
    // INICIALIZAÇÃO DE ÍCONES SVG ESTÁTICOS NO DOM
    // ========================================================
    initStaticIcons() {
        const setIcon = (id, iconSvg) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = iconSvg;
        };

        // Header e Topbar
        setIcon('topUserIcon', Icons.user);
        setIcon('topRefreshIcon', Icons.refresh);
        setIcon('headerLogoIcon', Icons.logo);
        setIcon('navIconExplore', Icons.search);
        setIcon('navIconClient', Icons.box);
        setIcon('navIconSeller', Icons.tools);
        setIcon('navIconProgress', Icons.activity);
        setIcon('navIconProfile', Icons.user);
        setIcon('headerBellIcon', Icons.bell);
        setIcon('headerPlusIcon', Icons.plus);

        // Botões de Ações e Banners
        setIcon('exploreBtnPlus', Icons.plus);
        setIcon('clientBtnPlus', Icons.plus);
        setIcon('sellerBannerIcon', Icons.tools);
        setIcon('sellerBtnStock', Icons.box);
        setIcon('sellerBtnPortfolio', Icons.image);
        setIcon('stockBtnAdd', Icons.plus);
        setIcon('portfolioBtnAdd', Icons.plus);
        setIcon('profileBtnEdit', Icons.edit);
        setIcon('profileBtnUpgrade', Icons.tools);

        // Modais (Botões de Fechar e Ações)
        setIcon('authCloseIcon', Icons.x);
        setIcon('reqCloseIcon', Icons.x);
        setIcon('reqBtnChooseFile', Icons.file);
        setIcon('reqBtnAttach', Icons.paperclip);
        setIcon('reqBtnSubmitIcon', Icons.check);
        setIcon('confirmCloseIcon', Icons.x);
        setIcon('confirmCheckIcon', Icons.check);
        setIcon('compareCloseIcon', Icons.x);
        setIcon('offerCloseIcon', Icons.x);
        setIcon('cancelCloseIcon', Icons.x);
        setIcon('payCloseIcon', Icons.x);
        setIcon('payPixIcon', Icons.qrCode);
        setIcon('payCardIcon', Icons.creditCard);
        setIcon('paymentPixBigIcon', Icons.qrCode);
        setIcon('reviewCloseIcon', Icons.x);
        setIcon('stockCloseIcon', Icons.x);
        setIcon('portCloseIcon', Icons.x);
        setIcon('upgradeCloseIcon', Icons.x);
        setIcon('editProfCloseIcon', Icons.x);
        setIcon('negCloseIcon', Icons.x);
    },

    // ========================================================
    // NAVEGAÇÃO ENTRE ABAS / VIEWS COM HOVER TOOLTIP (REQUISITO 3)
    // ========================================================
    navigateTo(viewName) {
        if (viewName !== 'explore' && !StorageService.getCurrentUser()) { this.openAuthModal('login'); return; }
        this.currentView = viewName;

        // Atualiza botões da navbar
        document.querySelectorAll('#mainNavLinks .nav-btn').forEach(btn => {
            if (btn.getAttribute('data-view') === viewName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Oculta todas as seções e exibe a selecionada
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
        const targetView = document.getElementById(`view-${viewName}`);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Renderiza dados específicos da view
        switch (viewName) {
            case 'explore':
                this.renderExploreRequests();
                this.renderMakers();
                break;
            case 'client-requests':
                this.renderClientRequests();
                break;
            case 'seller-panel':
                this.renderSellerPanel();
                break;
            case 'in-progress':
                this.renderInProgress();
                break;
            case 'profile':
                this.renderProfile();
                break;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // ========================================================
    // USUÁRIO, SESSÃO E DEMONSTRAÇÃO ACADÊMICA
    // ========================================================
    renderDemoUserSwitcher() {
        const select = document.getElementById('demoUserSelect');
        if (!select) return;
        const users = StorageService.getUsers();
        const currentUser = StorageService.getCurrentUser();

        select.innerHTML = users.map(u => `
            <option value="${u.id}" ${currentUser && currentUser.id === u.id ? 'selected' : ''}>
                ${u.name} (${u.isSeller ? 'Prestador' : 'Cliente'})
            </option>
        `).join('');
    },

    switchUser(userId) {
        const user = StorageService.getUserById(userId);
        if (user) {
            document.querySelectorAll('.modal-overlay.show').forEach(modal => this.closeModal(modal.id));
            this.pendingRequestData = null;
            StorageService.setCurrentUser(user);
            this.renderUserHeader();
            this.updateNotificationBadge();
            this.updateInProgressBadge();
            this.navigateTo(this.currentView);
            this.showToast(`Usuário ativo alterado para: ${user.name}`, 'info');
        }
    },

    resetDatabase() {
        if (confirm('Deseja restaurar todos os dados fictícios originais de teste do protótipo? Suas alterações serão reiniciadas.')) {
            StorageService.resetSeed();
            this.init();
            this.showToast('Dados restaurados para o padrão de demonstração!', 'success');
        }
    },

    renderUserHeader() {
        const container = document.getElementById('userHeaderArea');
        const user = StorageService.getCurrentUser();

        if (user) {
            const roleBadge = user.isSeller ? 'Prestador' : 'Cliente';
            container.innerHTML = `
                <div class="user-menu"><button class="avatar-button" aria-label="Abrir meu perfil" onclick="App.navigateTo('profile')">
                    <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}" class="user-avatar-mini" alt="Avatar"></button>
                    <div class="user-name-role">
                        <span class="name">${user.name}</span>
                        <span class="role">${roleBadge}</span>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); App.logout();" style="margin-left: 6px; padding: 4px 6px;" title="Sair da Sessão">
                        ${Icons.logout}
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <button class="btn btn-secondary btn-sm" onclick="App.openAuthModal('login')">Entrar</button>
                <button class="btn btn-primary btn-sm" onclick="App.openAuthModal('register')">Cadastrar</button>
            `;
        }
    },

    logout() {
        StorageService.logout();
        this.renderUserHeader();
        this.navigateTo('explore');
        this.updateNotificationBadge();
        this.updateInProgressBadge();
        this.showToast('Você encerrou a sessão.', 'info');
        this.openAuthModal('login');
    },

    // ========================================================
    // CONTROLE DE MODAIS
    // ========================================================
    openModal(modalId) {
        const el = document.getElementById(modalId);
        if (el) el.classList.add('show');
    },

    closeModal(modalId) {
        const el = document.getElementById(modalId);
        if (el) el.classList.remove('show');
    },

    openAuthModal(tab = 'login') {
        this.switchAuthTab(tab);
        this.openModal('modalAuth');
    },

    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('formLogin').style.display = 'none';
        document.getElementById('formRegister').style.display = 'none';
        document.getElementById('formForgot').style.display = 'none';

        if (tab === 'login') {
            document.getElementById('btnTabLogin').classList.add('active');
            document.getElementById('formLogin').style.display = 'block';
            document.getElementById('authModalTitle').textContent = 'Entrar na Conta';
        } else if (tab === 'register') {
            document.getElementById('btnTabRegister').classList.add('active');
            document.getElementById('formRegister').style.display = 'block';
            document.getElementById('authModalTitle').textContent = 'Novo Cadastro de Cliente';
        } else if (tab === 'forgot') {
            document.getElementById('btnTabForgot').classList.add('active');
            document.getElementById('formForgot').style.display = 'block';
            document.getElementById('authModalTitle').textContent = 'Recuperar Senha';
        }
    },

    toggleSellerFieldsInRegister(checked) {
        const el = document.getElementById('regSellerExtraFields');
        if (el) el.style.display = checked ? 'block' : 'none';
    },

    // ========================================================
    // MÁSCARAS E VALIDAÇÃO DE INPUTS
    // ========================================================
    maskCPF(input) {
        input.value = Validators.formatCPF(input.value);
    },

    maskCNPJ(input) {
        input.value = Validators.formatCNPJ(input.value);
    },

    maskCEP(input) {
        input.value = Validators.formatCEP(input.value);
    },

    maskPhone(input) {
        input.value = Validators.formatPhone(input.value);
    },

    updateCharCounter(textarea, counterId, limit) {
        const counter = document.getElementById(counterId);
        if (!counter) return;
        const len = textarea.value.length;
        counter.textContent = `${len} / ${limit} caracteres`;
        counter.classList.toggle('limit-near', len > limit * 0.85);
        counter.classList.toggle('limit-exceeded', len >= limit);
    },

    async fetchAddressByCEP(cep, targetPrefix) {
        const clean = (cep || '').replace(/\D/g, '');
        if (clean.length !== 8) return;

        const cityInput = document.getElementById(`${targetPrefix === 'reg' ? 'regAddressCity' : targetPrefix === 'edit' ? 'editProfCity' : ''}`);
        const districtInput = document.getElementById(`${targetPrefix === 'reg' ? 'regAddressDistrict' : ''}`);
        const feedback = document.getElementById(`${targetPrefix === 'reg' ? 'regCEPFeedback' : 'editProfCEPFeedback'}`);

        if (feedback) {
            feedback.className = 'input-feedback info';
            feedback.textContent = 'Consultando CEP via API ViaCEP...';
        }

        const res = await Validators.validateAndFetchCEP(clean);
        if (res.valid && res.address) {
            if (cityInput) cityInput.value = `${res.address.cidade} - ${res.address.uf}`;
            if (districtInput) districtInput.value = res.address.bairro;
            if (feedback) {
                feedback.className = 'input-feedback info';
                feedback.textContent = `Endereço localizado: ${res.address.cidade}/${res.address.uf}`;
            }
        } else {
            if (feedback) {
                feedback.className = 'input-feedback error';
                feedback.textContent = res.message || 'CEP não localizado.';
            }
        }
    },

    // ========================================================
    // AUTENTICAÇÃO E CADASTROS
    // ========================================================
    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPassword').value;

        const user = StorageService.getUserByEmail(email);
        if (!user || user.password !== pass) {
            this.showToast('E-mail ou senha incorretos.', 'error');
            return;
        }

        StorageService.setCurrentUser(user);
        this.renderDemoUserSwitcher();
        this.renderUserHeader();
        this.closeModal('modalAuth');
        this.showToast(`Bem-vindo de volta, ${user.name}!`, 'success');
        this.navigateTo('explore');
    },

    async handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('regName').value.trim();
        const cpf = document.getElementById('regCPF').value.trim();
        const birth = document.getElementById('regBirth').value;
        const cep = document.getElementById('regCEP').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const gender = document.getElementById('regGender').value;
        const isSeller = document.getElementById('regIsSeller').checked;

        const nameVal = Validators.validateName(name);
        if (!nameVal.valid) {
            this.showToast(nameVal.message, 'error');
            return;
        }

        const cpfVal = Validators.validateCPF(cpf);
        if (!cpfVal.valid) {
            this.showToast(cpfVal.message, 'error');
            return;
        }
        if (StorageService.getUserByCPF(cpf)) {
            this.showToast('Já existe um usuário cadastrado com este CPF.', 'error');
            return;
        }

        const birthVal = Validators.validateBirthDate(birth);
        if (!birthVal.valid) {
            this.showToast(birthVal.message, 'error');
            return;
        }

        const cepVal = await Validators.validateAndFetchCEP(cep);
        if (!cepVal.valid) {
            this.showToast(cepVal.message, 'error');
            return;
        }

        const phoneVal = Validators.validatePhone(phone);
        if (!phoneVal.valid) {
            this.showToast(phoneVal.message, 'error');
            return;
        }

        const emailVal = Validators.validateEmail(email);
        if (!emailVal.valid) {
            this.showToast(emailVal.message, 'error');
            return;
        }
        if (StorageService.getUserByEmail(email)) {
            this.showToast('Este endereço de e-mail já está em uso.', 'error');
            return;
        }

        const passVal = Validators.validatePassword(password);
        if (!passVal.valid) {
            this.showToast(passVal.message, 'error');
            return;
        }

        let sellerData = null;
        if (isSeller) {
            const businessName = document.getElementById('regSellerBusiness').value.trim() || name;
            const cnpj = document.getElementById('regSellerCNPJ').value.trim();
            if (cnpj) {
                const cnpjVal = Validators.validateCNPJ(cnpj);
                if (!cnpjVal.valid) {
                    this.showToast(cnpjVal.message, 'error');
                    return;
                }
            }
            const categories = (document.getElementById('regSellerCategories').value || 'Impressão 3D, Artesanato').split(',').map(s => s.trim()).filter(Boolean);
            const skills = document.getElementById('regSellerSkills').value.trim() || 'Serviços de impressão 3D e artesanato personalizado.';

            sellerData = {
                businessName,
                cnpj,
                verificationInfo: cnpj ? 'Empresa cadastrada e verificada' : 'Artesão / Prestador Verificado',
                categories,
                skills,
                portfolio: [],
                stock: []
            };
        }

        const newUser = {
            id: 'usr_' + Date.now(),
            type: isSeller && sellerData?.cnpj ? 'PJ' : 'PF',
            name,
            cpf,
            birthDate: birth,
            cep: cepVal.address.cep,
            address: cepVal.address,
            phone,
            email,
            password,
            gender,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            banner: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
            isSeller,
            ratingAsClient: 5.0,
            ratingAsSeller: isSeller ? 5.0 : null,
            totalClientReviews: 0,
            totalSellerReviews: 0,
            createdAt: new Date().toISOString(),
            sellerData
        };

        StorageService.saveUser(newUser);
        StorageService.setCurrentUser(newUser);
        this.renderDemoUserSwitcher();
        this.renderUserHeader();
        this.closeModal('modalAuth');
        this.showToast('Cadastro realizado com sucesso!', 'success');
        this.navigateTo('explore');
    },

    handleForgotPassword(e) {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value.trim();
        const newPass = document.getElementById('forgotNewPassword').value;

        const user = StorageService.getUserByEmail(email);
        if (!user) {
            this.showToast('Nenhum usuário encontrado com este e-mail.', 'error');
            return;
        }

        const passVal = Validators.validatePassword(newPass);
        if (!passVal.valid) {
            this.showToast(passVal.message, 'error');
            return;
        }

        user.password = newPass;
        StorageService.saveUser(user);
        this.showToast('Senha redefinida com sucesso! Você já pode entrar.', 'success');
        this.switchAuthTab('login');
    },

    // ========================================================
    // REQUISIÇÕES: FLUXO DE PUBLICAÇÃO COM CONFIRMAÇÃO E ANEXOS (REQUISITO 2)
    // ========================================================
    openNewRequestModal(requestId = null) {
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) {
            this.showToast('Por favor, efetue login para criar uma requisição.', 'info');
            this.openAuthModal('login');
            return;
        }

        const form = document.getElementById('formRequest');
        form.reset();
        this.activeAttachments = [];

        if (requestId) {
            const req = StorageService.getRequestById(requestId);
            if (req) {
                document.getElementById('requestModalTitle').textContent = 'Editar Requisição';
                document.getElementById('requestId').value = req.id;
                document.getElementById('reqTitle').value = req.title;
                document.getElementById('reqCategory').value = req.category;
                document.getElementById('reqBudget').value = req.budget;
                document.getElementById('reqDeadline').value = req.desiredDeadline;
                document.getElementById('reqDescription').value = req.description;
                this.activeAttachments = [...(req.attachments || [])];
                this.updateCharCounter(document.getElementById('reqDescription'), 'reqDescCounter', 1000);
            }
        } else {
            document.getElementById('requestModalTitle').textContent = 'Publicar Requisição de Trabalho';
            document.getElementById('requestId').value = '';
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 5);
            document.getElementById('reqDeadline').value = tomorrow.toISOString().split('T')[0];
            this.updateCharCounter(document.getElementById('reqDescription'), 'reqDescCounter', 1000);
        }

        this.renderActiveAttachments();
        this.openModal('modalRequest');
    },

    // Seleção de arquivo real pelo input (Requisito 2)
    handleFileSelection(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const sizeFormatted = file.size > 1048576 
                ? (file.size / 1048576).toFixed(1) + ' MB'
                : Math.max(1, Math.round(file.size / 1024)) + ' KB';

            const ext = file.name.split('.').pop().toLowerCase();
            const type = (ext === 'stl' || ext === 'obj') ? 'stl' : ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? 'image' : 'file';

            this.activeAttachments.push({
                name: file.name,
                type,
                size: sizeFormatted,
                url: ''
            });
        }

        event.target.value = ''; // reseta input para permitir selecionar novamente
        this.renderActiveAttachments();
        this.showToast('Arquivo(s) adicionado(s) aos anexos!', 'info');
    },

    // Botão "Anexar" corrigido (Requisito 2)
    addAttachmentToRequest() {
        const input = document.getElementById('reqAttachmentName');
        const val = input.value.trim();

        if (!val) {
            // Se campo de texto estiver vazio, aciona a seleção de arquivo do computador
            document.getElementById('reqFileInput').click();
            return;
        }

        const ext = val.split('.').pop().toLowerCase();
        const type = (ext === 'stl' || ext === 'obj') ? 'stl' : ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? 'image' : 'file';

        this.activeAttachments.push({
            name: val,
            type,
            size: 'Remoto / URL',
            url: val.startsWith('http') ? val : ''
        });

        input.value = '';
        this.renderActiveAttachments();
        this.showToast('Anexo adicionado com sucesso!', 'info');
    },

    removeAttachment(index) {
        this.activeAttachments.splice(index, 1);
        this.renderActiveAttachments();
    },

    renderActiveAttachments() {
        const container = document.getElementById('reqAttachmentsList');
        if (!container) return;

        if (this.activeAttachments.length === 0) {
            container.innerHTML = `<span style="font-size: 12px; color: var(--text-muted); padding: 4px 0;">Nenhum anexo incluído ainda. Você pode anexar modelos STL 3D, fotos ou referências.</span>`;
            return;
        }

        container.innerHTML = this.activeAttachments.map((att, i) => {
            const iconSvg = att.type === 'stl' ? Icons.cube : att.type === 'image' ? Icons.image : Icons.file;
            const tagClass = att.type === 'stl' ? 'stl' : att.type === 'image' ? 'image' : '';
            return `
                <div class="attachment-card">
                    <div class="attachment-meta">
                        <span>${iconSvg}</span>
                        <span class="attachment-tag ${tagClass}">${att.type.toUpperCase()}</span>
                        <strong style="color: var(--text-primary); font-size: 13px;">${att.name}</strong>
                        ${att.size ? `<span style="color: var(--text-muted); font-size: 11px;">(${att.size})</span>` : ''}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="App.removeAttachment(${i})" style="padding: 3px 6px;" title="Remover este anexo">
                        ${Icons.x}
                    </button>
                </div>
            `;
        }).join('');
    },

    // Submissão prévia: validação e abertura do modal de confirmação (Requisito 2)
    handlePreSubmitRequest(e) {
        e.preventDefault();
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) return;

        const id = document.getElementById('requestId').value;
        const title = document.getElementById('reqTitle').value.trim();
        const category = document.getElementById('reqCategory').value;
        const budget = parseFloat(document.getElementById('reqBudget').value);
        const deadline = document.getElementById('reqDeadline').value;
        const description = document.getElementById('reqDescription').value.trim();

        const deadlineVal = Validators.validateFutureDate(deadline);
        if (!deadlineVal.valid) {
            this.showToast(deadlineVal.message, 'error');
            return;
        }

        if (!title || !description || description.length > 1000) return this.showToast('Informe título e descrição de até 1000 caracteres.', 'error');
        if (isNaN(budget) || budget < 0) {
            this.showToast('O orçamento estimado deve ser um número maior ou igual a zero.', 'error');
            return;
        }

        // Armazena dados temporários e abre a confirmação
        this.pendingRequestData = {
            id,
            clientId: currentUser.id,
            clientName: currentUser.name,
            title,
            category,
            budget,
            desiredDeadline: deadline,
            description,
            attachments: [...this.activeAttachments]
        };

        // Preenche os dados no modal de confirmação
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmCategory').textContent = category;
        document.getElementById('confirmBudget').textContent = `R$ ${budget.toFixed(2)}`;
        document.getElementById('confirmDeadline').textContent = new Date(deadline + 'T00:00:00').toLocaleDateString('pt-BR');
        document.getElementById('confirmDescription').textContent = description;

        const attachSummary = document.getElementById('confirmAttachmentsSummary');
        if (this.activeAttachments.length === 0) {
            attachSummary.innerHTML = `<span style="font-size: 12px; color: var(--text-muted);">Nenhum anexo adicionado.</span>`;
        } else {
            attachSummary.innerHTML = this.activeAttachments.map(att => `
                <div style="display: flex; align-items: center; gap: 6px; font-size: 12.5px;">
                    <span>${att.type === 'stl' ? Icons.cube : Icons.file}</span>
                    <span>${att.name}</span>
                </div>
            `).join('');
        }

        this.closeModal('modalRequest');
        this.openModal('modalConfirmRequest');
    },

    // Ação do Botão "Confirmar e Publicar Requisição" (Requisito 2)
    executePublishRequest() {
        if (!this.pendingRequestData) return;
        const currentUser = StorageService.getCurrentUser();
        const data = this.pendingRequestData;
        if (!currentUser || data.clientId !== currentUser.id) return this.showToast('Entre com o perfil que criou esta requisição.', 'error');

        let request;
        if (data.id) {
            // Edição de requisição existente
            request = StorageService.getRequestById(data.id);
            if (!request || request.clientId !== currentUser.id || (request.status !== 'Aberto' && request.status !== 'Em análise')) {
                this.showToast('Esta requisição não pode ser editada neste status.', 'error');
                this.closeModal('modalConfirmRequest');
                return;
            }
            request.title = data.title;
            request.category = data.category;
            request.budget = data.budget;
            request.desiredDeadline = data.desiredDeadline;
            request.description = data.description;
            request.attachments = data.attachments;
            request.statusHistory.push({
                status: request.status,
                timestamp: new Date().toISOString(),
                note: 'Requisição atualizada e confirmada pelo cliente'
            });
            this.showToast('Requisição confirmada e atualizada com sucesso!', 'success');
        } else {
            // Criação de nova requisição
            request = {
                id: 'req_' + Date.now(),
                clientId: currentUser.id,
                clientName: currentUser.name,
                title: data.title,
                category: data.category,
                budget: data.budget,
                desiredDeadline: data.desiredDeadline,
                description: data.description,
                attachments: data.attachments,
                status: 'Aberto',
                selectedOfferId: null,
                assignedSellerId: null,
                productionStatus: null,
                createdAt: new Date().toISOString(),
                statusHistory: [
                    { status: 'Aberto', timestamp: new Date().toISOString(), note: 'Requisição confirmada e publicada' }
                ]
            };

            // Notifica prestadores
            const users = StorageService.getUsers();
            users.filter(u => u.isSeller && u.id !== currentUser.id).forEach(seller => {
                StorageService.addNotification({
                    userId: seller.id,
                    title: 'Nova Requisição Publicada',
                    message: `${currentUser.name} publicou "${data.title}" na categoria ${data.category}.`,
                    linkRequestId: request.id
                });
            });

            this.showToast('Requisição confirmada e publicada com sucesso!', 'success');
        }

        StorageService.saveRequest(request);
        this.pendingRequestData = null;
        this.closeModal('modalConfirmRequest');
        this.renderExploreRequests();
        this.renderClientRequests();
        this.updateNotificationBadge();
    },

    openCancelRequestModal(requestId) {
        const req = StorageService.getRequestById(requestId);
        if (!req) return;
        if (req.status === 'Em andamento' || req.status === 'Concluído') {
            this.showToast('Requisições em produção não podem ser canceladas por este meio.', 'error');
            return;
        }

        document.getElementById('cancelRequestId').value = req.id;
        document.getElementById('cancelReason').value = '';
        this.openModal('modalCancelRequest');
    },

    handleConfirmCancelRequest(e) {
        e.preventDefault();
        const id = document.getElementById('cancelRequestId').value;
        const reason = document.getElementById('cancelReason').value.trim();

        if (!reason) {
            this.showToast('A justificativa de cancelamento é obrigatória.', 'error');
            return;
        }

        const req = StorageService.getRequestById(id);
        if (req) {
            req.status = 'Cancelado';
            req.statusHistory.push({
                status: 'Cancelado',
                timestamp: new Date().toISOString(),
                note: `Cancelado pelo cliente. Motivo: ${reason}`
            });
            StorageService.saveRequest(req);
            this.closeModal('modalCancelRequest');
            this.showToast('Requisição cancelada com sucesso.', 'info');
            this.renderClientRequests();
            this.renderExploreRequests();
        }
    },

    // ========================================================
    // RENDERIZAÇÃO: EXPLORAR REQUISIÇÕES (RS17) (SEM EMOJIS)
    // ========================================================
    renderExploreRequests() {
        const grid = document.getElementById('exploreRequestsGrid');
        if (!grid) return;

        const search = (document.getElementById('filterSearch')?.value || '').toLowerCase();
        const category = document.getElementById('filterCategory')?.value || '';
        const maxBudget = parseFloat(document.getElementById('filterMaxBudget')?.value) || Infinity;
        const maxDistance = parseFloat(document.getElementById('filterDistance')?.value) || Infinity;
        const minRating = parseFloat(document.getElementById('filterMinRating')?.value) || 0;

        const currentUser = StorageService.getCurrentUser();
        const allRequests = StorageService.getRequests();
        const allOffers = StorageService.getOffers();

        const filtered = allRequests.filter(req => {
            if (!['Aberto', 'Em análise'].includes(req.status) || req.assignedSellerId) return false;

            if (search && !req.title.toLowerCase().includes(search) && !req.description.toLowerCase().includes(search)) {
                return false;
            }

            if (!this.categoryMatches(req.category, category)) return false;
            if (req.budget > maxBudget) return false;

            const client = StorageService.getUserById(req.clientId);
            if (!client) return false;

            if (client.ratingAsClient < minRating) return false;

            if (currentUser && maxDistance !== Infinity) {
                const prox = GeoService.calculateProximity(currentUser.address, client.address);
                if (prox.distanceKm !== null && prox.distanceKm > maxDistance) {
                    return false;
                }
            }

            return true;
        });

        document.getElementById('exploreResultsCount').textContent = `${filtered.length} ${filtered.length === 1 ? 'ideia disponível' : 'ideias disponíveis'}`;
        if (!filtered.length) {
            grid.innerHTML = '<div class="empty-state"><h3>Nenhuma ideia por aqui ainda</h3><p>Experimente outra busca ou ajuste os filtros para encontrar novos projetos.</p><button class="btn btn-outline" onclick="App.resetExploreFilters()">limpar filtros</button></div>';
            return;
        }
        grid.innerHTML = filtered.map(req => this.renderRequestTile(req, StorageService.getUserById(req.clientId), allOffers.filter(o => o.requestId === req.id && o.status === 'Pendente').length, currentUser)).join('');
        if (filtered.length === 2 && !search && !category) grid.innerHTML += `<aside class="idea-invite-tile">${Icons.cube}<span class="eyebrow">A PRÓXIMA IDEIA PODE SER SUA</span><h3 style="margin-top:12px">o que vamos<br>criar agora?</h3><p>Conte o que você imagina e receba propostas de quem sabe fazer.</p><button class="btn btn-outline" onclick="App.openNewRequestModal()">publicar minha ideia ↗</button></aside>`;
    },

    applyExploreFilters() {
        this.renderExploreRequests();
    },

    // ========================================================
    // RENDERIZAÇÃO: MINHAS REQUISIÇÕES (CLIENTE)
    // ========================================================
    filterClientRequestsByStatus(status, btnElement) {
        this.currentClientFilter = status;
        document.querySelectorAll('.filter-status-btn').forEach(b => b.classList.remove('active', 'btn-primary'));
        btnElement.classList.add('active', 'btn-primary');
        this.renderClientRequests();
    },

    renderClientRequests() {
        const grid = document.getElementById('clientRequestsGrid');
        if (!grid) return;

        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                    <h3 style="font-size: 16px;">Você precisa estar autenticado para visualizar suas requisições.</h3>
                    <button class="btn btn-primary" style="margin-top: 12px;" onclick="App.openAuthModal('login')">Fazer Login</button>
                </div>
            `;
            return;
        }

        const allRequests = StorageService.getRequests().filter(r => r.clientId === currentUser.id);
        const allOffers = StorageService.getOffers();

        const filtered = allRequests.filter(req => {
            if (this.currentClientFilter === 'all') return true;
            return req.status === this.currentClientFilter;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                    <div style="margin-bottom: 12px;">${Icons.box}</div>
                    <h3 style="font-size: 16px;">Nenhuma requisição encontrada com status "${this.currentClientFilter === 'all' ? 'todos' : this.currentClientFilter}"</h3>
                    <button class="btn btn-primary" style="margin-top: 14px;" onclick="App.openNewRequestModal()">
                        ${Icons.plus} <span>Criar Nova Requisição</span>
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(req => {
            const offers = allOffers.filter(o => o.requestId === req.id);
            const statusClass = {
                'Aberto': 'badge-primary',
                'Em análise': 'badge-warning',
                'Em andamento': 'badge-accent',
                'Concluído': 'badge-success',
                'Cancelado': 'badge-danger'
            }[req.status] || 'badge-secondary';

            return `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <span class="badge ${statusClass}">${req.status}</span>
                            <span class="badge badge-secondary" style="margin-left: 4px;">${req.category}</span>
                        </div>
                        <strong style="color: var(--primary); font-size: 16px;">R$ ${req.budget.toFixed(2)}</strong>
                    </div>
                    <div class="card-body">
                        <h3 style="font-size: 15.5px; font-weight: 700;">${req.title}</h3>
                        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">
                            ${req.description.length > 130 ? req.description.substring(0, 130) + '...' : req.description}
                        </p>

                        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; margin-top: auto; padding-top: 10px; border-top: 1px solid #f1f5f9;">
                            <div><strong style="display: inline-flex; align-items: center; gap: 4px;">${Icons.calendar} Prazo:</strong> ${new Date(req.desiredDeadline + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                            <div><strong>Criado em:</strong> ${new Date(req.createdAt).toLocaleDateString('pt-BR')}</div>
                            <div><strong style="display: inline-flex; align-items: center; gap: 4px;">${Icons.paperclip} Anexos:</strong> ${req.attachments?.length || 0} arquivos</div>
                        </div>

                        <div style="background: #f8fafc; border-radius: var(--radius-sm); padding: 8px; font-size: 11px; color: var(--text-secondary); margin-top: 6px;">
                            <strong>Histórico:</strong> ${req.statusHistory ? req.statusHistory[req.statusHistory.length - 1].note : 'Publicado'}
                        </div>
                    </div>
                    <div class="card-footer">
                        <div>
                            ${req.status === 'Aberto' || req.status === 'Em análise' ? `
                                <button class="btn btn-secondary btn-sm" onclick="App.openNewRequestModal('${req.id}')" title="Editar">${Icons.edit}</button>
                                <button class="btn btn-danger btn-sm" onclick="App.openCancelRequestModal('${req.id}')" title="Cancelar Requisição">${Icons.x}</button>
                            ` : ''}
                        </div>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn btn-primary btn-sm" onclick="App.openOffersCompareModal('${req.id}')">
                                <span>Ofertas (${offers.length})</span>
                            </button>
                            ${req.status === 'Em andamento' || req.status === 'Concluído' ? `
                                <button class="btn btn-accent btn-sm" onclick="App.navigateTo('in-progress')">
                                    <span>Produção & Chat</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ========================================================
    // PAINEL DO VENDEDOR / PRESTADOR
    // ========================================================
    switchSellerSubTab(tab, btnElement) {
        document.querySelectorAll('.seller-subtab-btn').forEach(b => b.classList.remove('active', 'btn-primary'));
        if (btnElement) btnElement.classList.add('active', 'btn-primary');

        ['compatible', 'my-offers', 'stock-view', 'portfolio-view'].forEach(t => {
            const el = document.getElementById(`sellerSubtab-${t}`);
            if (el) el.style.display = t === tab ? 'block' : 'none';
        });

        if (tab === 'compatible') this.renderSellerCompatibleRequests();
        if (tab === 'my-offers') this.renderSellerMyOffers();
        if (tab === 'stock-view') this.renderSellerStock();
        if (tab === 'portfolio-view') this.renderSellerPortfolio();
    },

    renderSellerPanel() {
        const currentUser = StorageService.getCurrentUser();
        const banner = document.getElementById('sellerUpgradeBanner');
        const activeContent = document.getElementById('sellerActiveContent');

        if (!currentUser || !currentUser.isSeller) {
            if (banner) banner.style.display = 'block';
            if (activeContent) activeContent.style.display = 'none';
            return;
        }

        if (banner) banner.style.display = 'none';
        if (activeContent) activeContent.style.display = 'block';

        const myOffers = StorageService.getOffers().filter(o => o.sellerId === currentUser.id);
        const countBadge = document.getElementById('sellerOffersCount');
        if (countBadge) countBadge.textContent = myOffers.length;

        this.renderSellerCompatibleRequests();
    },

    renderSellerCompatibleRequests() {
        const grid = document.getElementById('sellerCompatibleGrid');
        if (!grid) return;

        const currentUser = StorageService.getCurrentUser();
        const allRequests = StorageService.getRequests();
        const myOffers = StorageService.getOffers().filter(o => o.sellerId === currentUser.id);

        const compatible = allRequests.filter(r => {
            const categories = currentUser.sellerData?.categories || [];
            const client = StorageService.getUserById(r.clientId);
            const radius = Number(document.getElementById('sellerDistance')?.value) || Infinity;
            const distance = GeoService.calculateProximity(currentUser.address, client?.address).distanceKm;
            return ['Aberto', 'Em análise'].includes(r.status) && !r.assignedSellerId && r.clientId !== currentUser.id && categories.some(category => this.categoryMatches(r.category, category)) && (radius === Infinity || (distance !== null && distance <= radius));
        });

        if (compatible.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                    <h3 style="font-size: 16px;">Nenhum pedido compatível em aberto no momento</h3>
                    <p style="color: var(--text-secondary); margin-top: 6px; font-size: 13.5px;">Novas requisições de clientes serão exibidas aqui para você enviar orçamentos.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = compatible.map(req => {
            const client = StorageService.getUserById(req.clientId);
            const myOffer = myOffers.find(o => o.requestId === req.id);
            const prox = GeoService.calculateProximity(currentUser.address, client?.address);

            return `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <span class="badge badge-primary">${req.category}</span>
                            <span class="badge badge-secondary" style="margin-left: 4px;">${req.status}</span>
                        </div>
                        <strong style="color: var(--primary); font-size: 16px;">Estimado: R$ ${req.budget.toFixed(2)}</strong>
                    </div>
                    <div class="card-body">
                        <h3 style="font-size: 15.5px; font-weight: 700;">${req.title}</h3>
                        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">
                            ${req.description}
                        </p>
                        <div style="font-size: 12px; margin-top: auto; padding-top: 10px; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 4px;">
                            <div><strong style="display: inline-flex; align-items: center; gap: 4px;">${Icons.calendar} Prazo Máximo:</strong> ${new Date(req.desiredDeadline + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                            <div><span class="proximity-chip">${Icons.mapPin} ${prox.label}</span></div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span><strong>Solicitante:</strong> ${client?.name}</span>
                                <span style="display: inline-flex; align-items: center; gap: 3px;">${Icons.star} ${client?.ratingAsClient || 5.0}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        ${myOffer ? `
                            <span class="badge badge-warning">Sua proposta: R$ ${myOffer.price.toFixed(2)} (${myOffer.status})</span>
                            <button class="btn btn-secondary btn-sm" onclick="App.openSendOfferModal('${req.id}', '${myOffer.id}')">Editar Proposta</button>
                        ` : `
                            <span>Pronto para orçar</span>
                            <button class="btn btn-accent btn-sm" onclick="App.openSendOfferModal('${req.id}')">Enviar Orçamento</button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderSellerMyOffers() {
        const grid = document.getElementById('sellerMyOffersGrid');
        if (!grid) return;

        const currentUser = StorageService.getCurrentUser();
        const myOffers = StorageService.getOffers().filter(o => o.sellerId === currentUser.id);

        if (myOffers.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                    <h3 style="font-size: 16px;">Você ainda não enviou propostas de orçamento</h3>
                    <p style="color: var(--text-secondary); margin-top: 6px; font-size: 13.5px;">Consulte a aba de Pedidos Compatíveis e envie sua primeira oferta!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = myOffers.map(off => {
            const req = StorageService.getRequestById(off.requestId);
            const statusClass = {
                'Pendente': 'badge-warning',
                'Aceita': 'badge-success',
                'Recusada': 'badge-danger',
                'Retirada': 'badge-secondary',
                'Negociando': 'badge-accent'
            }[off.status] || 'badge-secondary';

            return `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <span class="badge ${statusClass}">${off.status}</span>
                        </div>
                        <strong style="color: var(--primary); font-size: 17px;">R$ ${off.price.toFixed(2)}</strong>
                    </div>
                    <div class="card-body">
                        <h4 style="font-size: 15px; font-weight: 700;">${req ? req.title : 'Requisição associada'}</h4>
                        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 6px;">
                            <strong>Proposta:</strong> ${off.notes}
                        </p>
                        <div style="font-size: 12px; margin-top: auto; padding-top: 8px; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 4px;">
                            <div><strong>Prazo Ofertado:</strong> ${new Date(off.deadlineDate + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                            <div><strong>Enviada em:</strong> ${new Date(off.createdAt).toLocaleDateString('pt-BR')}</div>
                        </div>

                        ${off.counterOffer ? `
                            <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: var(--radius-sm); padding: 8px; margin-top: 8px; font-size: 12px;">
                                <strong>Contraproposta do Cliente:</strong> R$ ${off.counterOffer.price.toFixed(2)} - "${off.counterOffer.message}"
                            </div>
                        ` : ''}
                    </div>
                    <div class="card-footer">
                        ${off.status === 'Pendente' || off.status === 'Negociando' ? `
                            <button class="btn btn-secondary btn-sm" onclick="App.openSendOfferModal('${off.requestId}', '${off.id}')">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="App.retractOffer('${off.id}')">Retirar Oferta</button>
                        ` : off.status === 'Aceita' ? `
                            <span class="badge badge-success">Proposta Aprovada</span>
                            <button class="btn btn-accent btn-sm" onclick="App.navigateTo('in-progress')">Ir para Produção</button>
                        ` : `
                            <span style="font-size: 12px; color: var(--text-muted);">${off.status}</span>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },

    openSendOfferModal(requestId, offerId = null) {
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser || !currentUser.isSeller) {
            this.showToast('Apenas prestadores cadastrados podem enviar ofertas.', 'info');
            this.openSellerUpgradeModal();
            return;
        }

        const req = StorageService.getRequestById(requestId);
        if (!req) return;

        document.getElementById('offerRequestId').value = req.id;
        let references = document.getElementById('offerRequestAttachments');
        if (!references) { references = document.createElement('div'); references.id = 'offerRequestAttachments'; document.getElementById('offerReqSummary').after(references); }
        references.innerHTML = this.requestAttachmentLinks(req);
        document.getElementById('offerReqTitle').textContent = req.title;
        document.getElementById('offerReqSummary').textContent = `Orçamento Estimado: R$ ${req.budget.toFixed(2)} • Prazo Desejado: ${new Date(req.desiredDeadline + 'T00:00:00').toLocaleDateString('pt-BR')}`;

        if (offerId) {
            const off = StorageService.getOfferById(offerId);
            if (off) {
                document.getElementById('offerModalTitle').textContent = 'Editar Proposta de Orçamento';
                document.getElementById('offerId').value = off.id;
                document.getElementById('offerPrice').value = off.price;
                document.getElementById('offerDeadline').value = off.deadlineDate;
                document.getElementById('offerNotes').value = off.notes;
            }
        } else {
            document.getElementById('offerModalTitle').textContent = 'Enviar Proposta de Orçamento';
            document.getElementById('offerId').value = '';
            document.getElementById('offerPrice').value = req.budget;
            document.getElementById('offerDeadline').value = req.desiredDeadline;
            document.getElementById('offerNotes').value = '';
        }

        this.openModal('modalOfferSend');
    },

    handleSaveOffer(e) {
        e.preventDefault();
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser || !currentUser.isSeller) return;

        const offerId = document.getElementById('offerId').value;
        const reqId = document.getElementById('offerRequestId').value;
        const price = parseFloat(document.getElementById('offerPrice').value);
        const deadline = document.getElementById('offerDeadline').value;
        const notes = document.getElementById('offerNotes').value.trim();

        if (isNaN(price) || price < 0) {
            this.showToast('O preço ofertado deve ser um número maior ou igual a zero.', 'error');
            return;
        }

        const deadlineVal = Validators.validateFutureDate(deadline);
        if (!deadlineVal.valid) {
            this.showToast(deadlineVal.message, 'error');
            return;
        }

        const req = StorageService.getRequestById(reqId);
        if (!req || !['Aberto', 'Em análise'].includes(req.status) || req.assignedSellerId || req.clientId === currentUser.id) return this.showToast('Este pedido não está disponível para ofertas.', 'error');
        if (deadline > req.desiredDeadline) return this.showToast('O prazo ofertado deve respeitar o prazo do pedido.', 'error');

        let offer;
        if (offerId) {
            offer = StorageService.getOfferById(offerId);
            if (!offer || offer.sellerId !== currentUser.id || offer.requestId !== reqId || !['Pendente', 'Negociando'].includes(offer.status)) return this.showToast('Esta oferta não pode ser editada.', 'error');
            offer.price = price;
            offer.deadlineDate = deadline;
            offer.notes = notes;
            offer.status = 'Pendente';
            this.showToast('Oferta atualizada com sucesso!', 'success');
        } else {
            offer = {
                id: 'off_' + Date.now(),
                requestId: reqId,
                sellerId: currentUser.id,
                sellerName: `${currentUser.sellerData?.businessName || currentUser.name}`,
                sellerAvatar: currentUser.avatar,
                sellerRating: currentUser.ratingAsSeller || 5.0,
                price,
                deadlineDate: deadline,
                notes,
                status: 'Pendente',
                counterOffer: null,
                createdAt: new Date().toISOString()
            };

            if (req.status === 'Aberto') {
                req.status = 'Em análise';
                req.statusHistory.push({
                    status: 'Em análise',
                    timestamp: new Date().toISOString(),
                    note: `Proposta recebida de ${offer.sellerName}`
                });
                StorageService.saveRequest(req);
            }

            StorageService.addNotification({
                userId: req.clientId,
                title: 'Nova Oferta Recebida',
                message: `${offer.sellerName} enviou uma proposta de R$ ${price.toFixed(2)} para "${req.title}".`,
                linkRequestId: req.id
            });

            this.showToast('Proposta de orçamento enviada com sucesso!', 'success');
        }

        StorageService.saveOffer(offer);
        if (offerId) StorageService.addNotification({ userId: req.clientId, title: 'Oferta atualizada', message: `${offer.sellerName} atualizou a proposta para ${req.title}.`, linkRequestId: req.id });
        this.closeModal('modalOfferSend');
        this.renderSellerPanel();
        this.renderExploreRequests();
        this.updateNotificationBadge();
    },

    retractOffer(offerId) {
        if (!confirm('Deseja realmente retirar esta oferta? Ela não poderá mais ser aceita pelo cliente.')) return;
        const offer = StorageService.getOfferById(offerId);
        const req = offer && StorageService.getRequestById(offer.requestId);
        if (!offer || offer.sellerId !== StorageService.getCurrentUser()?.id || !['Pendente', 'Negociando'].includes(offer.status) || !req || !['Aberto', 'Em análise'].includes(req.status)) return this.showToast('Esta oferta não pode ser retirada.', 'error');
        if (offer) {
            offer.status = 'Retirada';
            StorageService.saveOffer(offer);
            StorageService.addNotification({ userId: req.clientId, title: 'Oferta retirada', message: `${offer.sellerName} retirou a proposta para ${req.title}.`, linkRequestId: req.id });
            this.showToast('Oferta retirada com sucesso.', 'info');
            this.renderSellerMyOffers();
        }
    },

    // ========================================================
    // COMPARAÇÃO, SELEÇÃO E NEGOCIAÇÃO DE OFERTAS
    // ========================================================
    openOffersCompareModal(requestId) {
        const req = StorageService.getRequestById(requestId);
        if (!req) return;

        const offers = StorageService.getOffers(requestId);
        const container = document.getElementById('compareOffersContainer');
        document.getElementById('compareModalSub').textContent = `Requisição: "${req.title}" • Orçamento Estimado: R$ ${req.budget.toFixed(2)}`;

        const currentUser = StorageService.getCurrentUser();
        const isClientOwner = currentUser && currentUser.id === req.clientId;

        if (offers.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px; background: #f8fafc; border-radius: var(--radius-md);">
                    <p style="color: var(--text-secondary);">Nenhuma proposta recebida até o momento para este pedido.</p>
                </div>
            `;
            this.openModal('modalOffersCompare');
            return;
        }

        container.innerHTML = offers.map(off => {
            const seller = StorageService.getUserById(off.sellerId);
            const prox = seller && currentUser ? GeoService.calculateProximity(currentUser.address, seller.address) : null;
            const diffPrice = off.price - req.budget;
            const priceComparisonText = diffPrice === 0 ? 'Exatamente o orçamento estimado' : diffPrice < 0 ? `R$ ${Math.abs(diffPrice).toFixed(2)} abaixo do orçamento` : `R$ ${diffPrice.toFixed(2)} acima do orçamento`;

            return `
                <div style="background: #ffffff; border: 2px solid ${off.status === 'Aceita' ? 'var(--success)' : 'var(--border-color)'}; border-radius: var(--radius-md); padding: 16px; box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <img src="${seller?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" style="width: 46px; height: 46px; border-radius: var(--radius-full); object-fit: cover;">
                            <div>
                                <h4 style="font-size: 15px; font-weight: 700;">${seller?.sellerData?.businessName || seller?.name || off.sellerName}</h4><button class="text-link" onclick="App.openMakerProfile('${off.sellerId}')">ver portfólio e avaliações ↗</button>
                                <div style="display: flex; gap: 8px; font-size: 12px; color: var(--text-secondary); margin-top: 2px; align-items: center;">
                                    <span style="display: inline-flex; align-items: center; gap: 2px;">${Icons.star} <strong>${seller?.ratingAsSeller || 5.0}</strong> (${seller?.totalSellerReviews || 0})</span>
                                    <span>•</span>
                                    <span>${seller?.sellerData?.verificationInfo || 'Prestador Verificado'}</span>
                                </div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 22px; font-weight: 800; color: var(--primary);">R$ ${off.price.toFixed(2)}</div>
                            <div style="font-size: 11px; color: ${diffPrice <= 0 ? 'var(--success)' : 'var(--accent-dark)'}; font-weight: 600;">
                                ${priceComparisonText}
                            </div>
                        </div>
                    </div>

                    <div style="background: #f8fafc; border-radius: var(--radius-sm); padding: 12px; margin: 14px 0; font-size: 13px;">
                        <strong>Proposta Técnica do Prestador:</strong>
                        <p style="margin-top: 4px; color: var(--text-secondary);">${off.notes}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 12px; margin-bottom: 14px;">
                        <div><strong style="display: inline-flex; align-items: center; gap: 4px;">${Icons.calendar} Prazo:</strong> ${new Date(off.deadlineDate + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                        ${prox ? `<div><span class="proximity-chip">${Icons.mapPin} ${prox.label}</span></div>` : ''}
                        <div><strong>Status:</strong> <span class="badge ${off.status === 'Aceita' ? 'badge-success' : 'badge-secondary'}">${off.status}</span></div>
                    </div>

                    ${isClientOwner && (req.status === 'Aberto' || req.status === 'Em análise') && off.status !== 'Retirada' && off.status !== 'Recusada' ? `
                        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                            <button class="btn btn-secondary btn-sm" onclick="App.openNegotiateModal('${off.id}')">Negociar</button>
                            <button class="btn btn-danger btn-sm" onclick="App.rejectOffer('${off.id}')">Recusar</button>
                            <button class="btn btn-success btn-sm" onclick="App.acceptOffer('${off.id}')">Aceitar Proposta</button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        this.openModal('modalOffersCompare');
    },

    acceptOffer(offerId) {
        const offer = StorageService.getOfferById(offerId);
        const targetRequest = offer && StorageService.getRequestById(offer.requestId);
        if (!targetRequest || targetRequest.clientId !== StorageService.getCurrentUser()?.id || !['Aberto', 'Em análise'].includes(targetRequest.status) || !['Pendente', 'Negociando'].includes(offer.status)) return this.showToast('Esta proposta não está disponível para esta ação.', 'error');
        if (!offer) return;
        const req = StorageService.getRequestById(offer.requestId);
        if (!req) return;

        document.getElementById('paymentRequestId').value = req.id;
        document.getElementById('paymentOfferId').value = offer.id;
        document.getElementById('paymentDisplayAmount').textContent = `R$ ${offer.price.toFixed(2)}`;
        document.getElementById('paymentDisplaySeller').textContent = `Prestador: ${offer.sellerName} • Prazo: ${new Date(offer.deadlineDate + 'T00:00:00').toLocaleDateString('pt-BR')}`;

        this.closeModal('modalOffersCompare');
        this.openModal('modalPayment');
    },

    rejectOffer(offerId) {
        if (!confirm('Deseja recusar esta proposta?')) return;
        const offer = StorageService.getOfferById(offerId);
        const targetRequest = offer && StorageService.getRequestById(offer.requestId);
        if (!targetRequest || targetRequest.clientId !== StorageService.getCurrentUser()?.id || !['Aberto', 'Em análise'].includes(targetRequest.status) || !['Pendente', 'Negociando'].includes(offer.status)) return this.showToast('Esta proposta não está disponível para esta ação.', 'error');
        if (offer) {
            offer.status = 'Recusada';
            StorageService.saveOffer(offer);

            StorageService.addNotification({
                userId: offer.sellerId,
                title: 'Proposta Recusada',
                message: `Sua proposta para o pedido foi recusada pelo cliente.`,
                linkRequestId: offer.requestId
            });

            this.showToast('Proposta recusada.', 'info');
            this.openOffersCompareModal(offer.requestId);
        }
    },

    openNegotiateModal(offerId) {
        const offer = StorageService.getOfferById(offerId);
        const targetRequest = offer && StorageService.getRequestById(offer.requestId);
        if (!targetRequest || targetRequest.clientId !== StorageService.getCurrentUser()?.id || !['Aberto', 'Em análise'].includes(targetRequest.status) || !['Pendente', 'Negociando'].includes(offer.status)) return this.showToast('Esta proposta não está disponível para esta ação.', 'error');
        if (!offer) return;

        document.getElementById('negotiateOfferId').value = offer.id;
        document.getElementById('negPrice').value = offer.price;
        document.getElementById('negDeadline').value = offer.deadlineDate;
        document.getElementById('negMessage').value = '';

        this.openModal('modalNegotiate');
    },

    handleConfirmNegotiation(e) {
        e.preventDefault();
        const offerId = document.getElementById('negotiateOfferId').value;
        const price = parseFloat(document.getElementById('negPrice').value);
        const deadline = document.getElementById('negDeadline').value;
        const message = document.getElementById('negMessage').value.trim();

        const offer = StorageService.getOfferById(offerId);
        const targetRequest = offer && StorageService.getRequestById(offer.requestId);
        if (!targetRequest || targetRequest.clientId !== StorageService.getCurrentUser()?.id || !['Aberto', 'Em análise'].includes(targetRequest.status) || !['Pendente', 'Negociando'].includes(offer.status)) return this.showToast('Esta proposta não está disponível para esta ação.', 'error');
        if (!offer) return;

        if (!Number.isFinite(price) || price < 0 || !Validators.validateFutureDate(deadline).valid || deadline > targetRequest.desiredDeadline) return this.showToast('Informe valor e prazo válidos para o pedido.', 'error');
        offer.status = 'Negociando';
        offer.counterOffer = {
            price,
            deadlineDate: deadline,
            message,
            timestamp: new Date().toISOString()
        };
        StorageService.saveOffer(offer);

        StorageService.addNotification({
            userId: offer.sellerId,
            title: 'Contraproposta Recebida',
            message: `O cliente solicitou negociação: R$ ${price.toFixed(2)}.`,
            linkRequestId: offer.requestId
        });

        this.closeModal('modalNegotiate');
        this.closeModal('modalOffersCompare');
        this.showToast('Contraproposta enviada ao prestador!', 'success');
        this.renderClientRequests();
    },

    // ========================================================
    // SIMULAÇÃO DE PAGAMENTO
    // ========================================================
    togglePayMethod(method) {
        document.getElementById('paymentAreaPIX').style.display = method === 'PIX' ? 'block' : 'none';
        document.getElementById('paymentAreaCard').style.display = method === 'Cartão' ? 'block' : 'none';
    },

    copyPixCode() {
        const input = document.getElementById('pixCodeCopy');
        input.select();
        navigator.clipboard.writeText(input.value);
        this.showToast('Código PIX copiado para a área de transferência!', 'success');
    },

    handleProcessPayment(e) {
        e.preventDefault();
        const reqId = document.getElementById('paymentRequestId').value;
        const offerId = document.getElementById('paymentOfferId').value;
        const method = document.querySelector('input[name="payMethod"]:checked')?.value || 'PIX';

        const req = StorageService.getRequestById(reqId);
        const offer = StorageService.getOfferById(offerId);
        if (!req || !offer || req.clientId !== StorageService.getCurrentUser()?.id || offer.requestId !== req.id || !['Aberto', 'Em análise'].includes(req.status) || !['Pendente', 'Negociando'].includes(offer.status)) return this.showToast('Pagamento indisponível para esta proposta.', 'error');

        const payment = {
            id: 'pay_' + Date.now(),
            requestId: req.id,
            clientId: req.clientId,
            sellerId: offer.sellerId,
            amount: offer.price,
            method,
            status: 'Aprovado',
            transactionDate: new Date().toISOString()
        };
        StorageService.addPayment(payment);

        offer.status = 'Aceita';
        StorageService.saveOffer(offer);

        const allOffers = StorageService.getOffers(req.id);
        allOffers.forEach(o => {
            if (o.id !== offer.id && ['Pendente', 'Negociando'].includes(o.status)) {
                o.status = 'Recusada';
                StorageService.saveOffer(o);
            }
        });

        req.status = 'Em andamento';
        req.selectedOfferId = offer.id;
        req.assignedSellerId = offer.sellerId;
        req.productionStatus = 'Recebido';
        req.statusHistory.push({
            status: 'Em andamento',
            timestamp: new Date().toISOString(),
            note: `Proposta de ${offer.sellerName} aceita. Pagamento de R$ ${offer.price.toFixed(2)} aprovado via ${method}.`
        });
        StorageService.saveRequest(req);

        StorageService.addNotification({
            userId: offer.sellerId,
            title: 'Sua Proposta foi Aceita!',
            message: `O cliente aceitou seu orçamento de R$ ${offer.price.toFixed(2)} para "${req.title}". O pedido está agora na esteira de produção.`,
            linkRequestId: req.id
        });

        this.closeModal('modalPayment');
        this.showToast('Pagamento confirmado e produção liberada com sucesso!', 'success');
        this.updateInProgressBadge();
        this.navigateTo('in-progress');
    },

    // ========================================================
    // ACOMPANHAMENTO DE PRODUÇÃO & CHAT
    // ========================================================
    updateInProgressBadge() {
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) return;
        const all = StorageService.getRequests().filter(r => {
            const isParticipant = r.clientId === currentUser.id || r.assignedSellerId === currentUser.id;
            return isParticipant && (r.status === 'Em andamento' || r.productionStatus);
        });
        const badge = document.getElementById('inProgressCount');
        if (badge) badge.textContent = all.length;
    },

    renderInProgress() {
        const container = document.getElementById('inProgressListContainer');
        if (!container) return;

        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                    <h3 style="font-size: 16px;">Faça login para acompanhar pedidos em produção e conversar no chat.</h3>
                </div>
            `;
            return;
        }

        const myOrders = StorageService.getRequests().filter(r => {
            const isParticipant = r.clientId === currentUser.id || r.assignedSellerId === currentUser.id;
            return isParticipant && (r.status === 'Em andamento' || r.status === 'Concluído');
        });

        if (myOrders.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                    <div style="margin-bottom: 12px;">${Icons.activity}</div>
                    <h3 style="font-size: 16px;">Nenhum pedido em produção no momento</h3>
                    <p style="color: var(--text-secondary); margin-top: 6px; font-size: 13.5px;">Assim que uma proposta for aceita e o pagamento simulado confirmado, o acompanhamento passo a passo e o chat aparecerão aqui.</p>
                </div>
            `;
            return;
        }

        const pipelineSteps = ['Recebido', 'Em Produção', 'Finalizado', 'Enviado', 'Entregue'];

        container.innerHTML = myOrders.map(req => {
            const client = StorageService.getUserById(req.clientId);
            const seller = StorageService.getUserById(req.assignedSellerId);
            const offer = StorageService.getOfferById(req.selectedOfferId);
            const messages = StorageService.getMessages(req.id);
            const isSeller = currentUser.id === req.assignedSellerId;
            const currentStepIdx = pipelineSteps.indexOf(req.productionStatus || 'Recebido');
            const prox = client && seller ? GeoService.calculateProximity(client.address, seller.address) : null;

            return `
                <div class="card" style="margin-bottom: 30px;">
                    <div class="card-header" style="background: #f8fafc;">
                        <div>
                            <span class="badge ${req.status === 'Concluído' ? 'badge-success' : 'badge-primary'}">${req.status}</span>
                            <span class="badge badge-secondary" style="margin-left: 6px;">${req.category}</span>
                            <h2 style="font-size: 17px; font-weight: 800; margin-top: 6px;">${req.title}</h2>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 19px; font-weight: 800; color: var(--primary);">
                                R$ ${offer ? offer.price.toFixed(2) : req.budget.toFixed(2)}
                            </div>
                            <span style="font-size: 11.5px; color: var(--success); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                                ${Icons.check} Pagamento Aprovado
                            </span>
                        </div>
                    </div>

                    <div class="card-body">
                        <!-- Pipeline de Produção Visual -->
                        <div style="margin: 10px 0 25px;">
                            <h4 style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px;">
                                Esteira de Produção & Rastreio
                            </h4>
                            <div class="production-pipeline">
                                ${pipelineSteps.map((step, idx) => {
                                    const isDone = idx < currentStepIdx || req.status === 'Concluído';
                                    const isActive = idx === currentStepIdx && req.status !== 'Concluído';
                                    return `
                                        <div class="pipeline-step ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''}">
                                            <div class="pipeline-dot">${isDone ? Icons.check : idx + 1}</div>
                                            <span class="pipeline-label">${step}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>

                            ${isSeller && req.status !== 'Concluído' ? `
                                <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; background: #fffbeb; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid #fef08a;">
                                    <span style="font-size: 13px; font-weight: 600; color: #854d0e; align-self: center;">
                                        Ação do Prestador:
                                    </span>
                                    ${currentStepIdx < pipelineSteps.length - 1 ? `
                                        <button class="btn btn-primary btn-sm" onclick="App.advanceProductionStatus('${req.id}')">
                                            Avançar para: "${pipelineSteps[currentStepIdx + 1]}"
                                        </button>
                                    ` : `
                                        <span>Aguardando confirmação de recebimento do cliente.</span>
                                    `}
                                </div>
                            ` : ''}
                        </div>

                        ${!isSeller && req.status === 'Em andamento' && req.productionStatus === 'Entregue' ? `<button class="btn btn-primary" style="margin-bottom: 20px" onclick="App.confirmReceipt('${req.id}')">Confirmar recebimento</button>` : ''}
                        ${this.canCancelRequest(req, currentUser) ? `<div style="margin-bottom: 20px"><button class="btn btn-secondary btn-sm" onclick="App.openCancelRequestModal('${req.id}')">Cancelar pedido</button><p class="filter-caption">Cancelamento permitido até o fim da etapa Em Produção.</p></div>` : ''}
                        <details style="margin-bottom: 20px"><summary>Histórico do pedido</summary>${(req.statusHistory || []).map(item => `<p class="filter-caption">${new Date(item.timestamp).toLocaleString('pt-BR')} · ${this.escapeHTML(item.status)} · ${this.escapeHTML(item.note)}</p>`).join('')}</details>
                        <!-- Grid com Detalhes do Pedido e Chat -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
                            <div>
                                <div style="background: #f8fafc; border-radius: var(--radius-md); padding: 14px; border: 1px solid var(--border-color); font-size: 13px; display: flex; flex-direction: column; gap: 8px;">
                                    <div><strong>Cliente:</strong> ${client?.name} (CEP: ${client?.cep || '---'})</div>
                                    <div><strong>Prestador:</strong> ${seller?.sellerData?.businessName || seller?.name} (CEP: ${seller?.cep || '---'})</div>
                                    ${prox ? `
                                        <div><strong>Raio Geográfico / Proximidade:</strong> <span class="proximity-chip">${Icons.mapPin} ${prox.label}</span></div>
                                        <div style="font-size: 11px; color: var(--text-muted);">${prox.description}</div>
                                    ` : ''}
                                    <div style="margin-top: 6px; border-top: 1px solid var(--border-color); padding-top: 8px;">
                                        <strong>Especificações da Peça:</strong>
                                        <p style="color: var(--text-secondary); margin-top: 2px;">${this.escapeHTML(req.description)}</p>${this.requestAttachmentLinks(req)}
                                    </div>
                                </div>

                                ${req.status === 'Concluído' ? `
                                    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--radius-md); padding: 14px; margin-top: 14px;">
                                        <h4 style="font-size: 13.5px; color: #065f46; font-weight: 700;">Pedido Concluído com Sucesso</h4>
                                        <p style="font-size: 12px; color: #047857; margin: 4px 0 10px;">Deixe sua avaliação sobre o trabalho para fortalecer a reputação na plataforma.</p>
                                        <button class="btn btn-success btn-sm" onclick="App.openReviewModal('${req.id}', '${isSeller ? req.clientId : req.assignedSellerId}', '${isSeller ? 'client' : 'seller'}')">
                                            Avaliar ${isSeller ? 'o Cliente' : 'o Prestador'}
                                        </button>
                                    </div>
                                ` : ''}
                            </div>

                            <div>
                                <div class="chat-container">
                                    <div class="chat-header">
                                        <span style="font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; gap: 5px;">
                                            ${Icons.chat} Chat do Pedido
                                        </span>
                                        <span style="font-size: 11px; color: var(--text-muted);">${messages.length} mensagens</span>
                                    </div>
                                    <div class="chat-messages" id="chatMessages_${req.id}">
                                        ${messages.length === 0 ? `
                                            <div style="text-align: center; color: var(--text-muted); font-size: 12px; margin: auto;">
                                                Nenhuma mensagem enviada ainda. Inicie a conversa abaixo!
                                            </div>
                                        ` : messages.map(m => {
                                            const isMe = m.senderId === currentUser.id;
                                            return `
                                                <div class="chat-bubble ${isMe ? 'sent' : 'received'}">
                                                    <div>${this.escapeHTML(m.text)}</div>
                                                    <div class="meta">
                                                        <span>${m.senderName}</span>
                                                        <span>${new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                    <div class="chat-input-area">
                                        <form onsubmit="App.handleSendChatMessage(event, '${req.id}')" style="display: flex; flex-direction: column; gap: 6px;">
                                            <div style="display: flex; gap: 8px;">
                                                <input type="text" id="chatInput_${req.id}" class="form-input" maxlength="400" placeholder="Digite uma mensagem (máx 400 caracteres)..." oninput="App.updateCharCounter(this, 'chatCounter_${req.id}', 400)" required autocomplete="off">
                                                <button type="submit" class="btn btn-primary btn-sm">Enviar</button>
                                            </div>
                                            <span class="char-counter" id="chatCounter_${req.id}">0 / 400 caracteres</span>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    advanceProductionStatus(requestId) {
        const req = StorageService.getRequestById(requestId);
        const user = StorageService.getCurrentUser();
        if (!user || req?.assignedSellerId !== user.id || req.status !== 'Em andamento') return;
        const steps = ['Recebido', 'Em Produção', 'Finalizado', 'Enviado', 'Entregue'];
        const index = steps.indexOf(req.productionStatus);
        if (index < 0 || index >= steps.length - 1) return;
        req.productionStatus = steps[index + 1];
        req.statusHistory.push({ status: req.productionStatus, timestamp: new Date().toISOString(), note: `Produção atualizada por ${user.name}.` });
        StorageService.saveRequest(req);
        StorageService.addNotification({ userId: req.clientId, title: 'Atualização de produção', message: `Seu pedido "${req.title}" avançou para ${req.productionStatus}.`, linkRequestId: req.id });
        this.renderInProgress();
        this.updateNotificationBadge();
        this.showToast('Andamento atualizado.', 'success');
    },

    handleSendChatMessage(e, requestId) {
        e.preventDefault();
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) return;

        const input = document.getElementById(`chatInput_${requestId}`);
        const text = input.value.trim();
        if (!text) return;

        if (text.length > 400) {
            this.showToast('A mensagem ultrapassa o limite de 400 caracteres.', 'error');
            return;
        }

        const req = StorageService.getRequestById(requestId);
        if (!req || ![req.clientId, req.assignedSellerId].includes(currentUser.id)) return;
        const moderation = Validators.validateText(text);
        if (!moderation.valid) return this.showToast(moderation.message, 'error');

        const newMsg = {
            id: 'msg_' + Date.now(),
            requestId,
            senderId: currentUser.id,
            senderName: currentUser.name,
            text,
            timestamp: new Date().toISOString()
        };
        StorageService.addMessage(newMsg);

        const targetUserId = currentUser.id === req.clientId ? req.assignedSellerId : req.clientId;
        if (targetUserId) {
            StorageService.addNotification({
                userId: targetUserId,
                title: `Nova Mensagem de ${currentUser.name}`,
                message: text.length > 60 ? text.substring(0, 60) + '...' : text,
                linkRequestId: requestId
            });
        }

        input.value = '';
        this.updateCharCounter(input, `chatCounter_${requestId}`, 400);
        this.renderInProgress();

        const chatBox = document.getElementById(`chatMessages_${requestId}`);
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    },

    // ========================================================
    // AVALIAÇÃO MÚTUA PÓS-SERVIÇO (COM ÍCONES SVG)
    // ========================================================
    openReviewModal(requestId, targetUserId, targetRole) {
        const targetUser = StorageService.getUserById(targetUserId);
        document.getElementById('reviewRequestId').value = requestId;
        document.getElementById('reviewTargetUserId').value = targetUserId;
        document.getElementById('reviewTargetRole').value = targetRole;
        document.getElementById('reviewComment').value = '';
        document.getElementById('reviewTargetPrompt').textContent = `Avalie ${targetRole === 'seller' ? 'o trabalho do prestador' : 'o cliente'} ${targetUser ? targetUser.name : ''}:`;

        this.renderInteractiveReviewStars();
        this.setReviewRating(5);
        this.openModal('modalReview');
    },

    renderInteractiveReviewStars() {
        const container = document.getElementById('starInteractiveContainer');
        if (!container) return;
        container.innerHTML = [1, 2, 3, 4, 5].map(star => `
            <span class="star-interactive" data-star="${star}" onclick="App.setReviewRating(${star})">
                ${Icons.star}
            </span>
        `).join('');
    },

    setReviewRating(rating) {
        this.selectedReviewRating = rating;
        document.getElementById('reviewRating').value = rating;

        const labels = {
            1: '1 estrela (Muito Ruim)',
            2: '2 estrelas (Ruim)',
            3: '3 estrelas (Regular)',
            4: '4 estrelas (Bom)',
            5: '5 estrelas (Excelente)'
        };
        document.getElementById('ratingTextFeedback').textContent = labels[rating] || `${rating} estrelas`;

        const stars = document.querySelectorAll('#starInteractiveContainer .star-interactive');
        stars.forEach((starEl, i) => {
            if (i < rating) {
                starEl.innerHTML = Icons.star;
            } else {
                starEl.innerHTML = Icons.starOutline;
            }
        });
    },

    handleSaveReview(e) {
        e.preventDefault();
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) return;

        const reqId = document.getElementById('reviewRequestId').value;
        const targetUserId = document.getElementById('reviewTargetUserId').value;
        const targetRole = document.getElementById('reviewTargetRole').value;
        const rating = parseInt(document.getElementById('reviewRating').value, 10);
        const comment = document.getElementById('reviewComment').value.trim();

        const request = StorageService.getRequestById(reqId);
        const expectedTarget = request?.clientId === currentUser.id ? request.assignedSellerId : request?.clientId;
        const expectedRole = request?.clientId === currentUser.id ? 'seller' : 'client';
        if (!request || request.status !== 'Concluído' || ![request.clientId, request.assignedSellerId].includes(currentUser.id) || targetUserId !== expectedTarget || targetRole !== expectedRole || rating < 1 || rating > 5 || !Number.isInteger(rating)) return this.showToast('Avaliação não permitida para este pedido.', 'error');
        if (StorageService.getReviews().some(r => r.requestId === reqId && r.reviewerId === currentUser.id)) return this.showToast('Você já avaliou este pedido.', 'info');
        const review = {
            id: 'rev_' + Date.now(),
            requestId: reqId,
            reviewerId: currentUser.id,
            reviewerName: currentUser.name,
            targetUserId,
            targetRole,
            rating,
            comment,
            createdAt: new Date().toISOString()
        };

        StorageService.addReview(review);

        StorageService.addNotification({
            userId: targetUserId,
            title: 'Você Recebeu uma Nova Avaliação',
            message: `${currentUser.name} avaliou você com ${rating} estrelas.`,
            linkRequestId: reqId
        });

        this.closeModal('modalReview');
        this.showToast('Avaliação registrada com sucesso! A reputação foi recalculada.', 'success');
        this.renderProfile();
    },

    // ========================================================
    // PERFIL DO USUÁRIO
    // ========================================================
    renderProfile() {
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) {
            this.openAuthModal('login');
            return;
        }

        document.getElementById('profileDisplayName').textContent = currentUser.name;
        document.getElementById('profileDisplayEmail').textContent = currentUser.email;

        const bannerEl = document.getElementById('profileBannerDisplay');
        if (currentUser.banner) {
            bannerEl.style.backgroundImage = `url('${currentUser.banner}')`;
        } else {
            bannerEl.style.backgroundImage = `linear-gradient(135deg, #2563eb, #8b5cf6)`;
        }

        const avatarEl = document.getElementById('profileAvatarDisplay');
        avatarEl.src = currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

        const badgesArea = document.getElementById('profileBadgesArea');
        badgesArea.innerHTML = `
            <span class="badge badge-primary">Cliente Ativo</span>
            ${currentUser.isSeller ? `<span class="badge badge-accent">Prestador</span>` : ''}
            <span class="badge badge-secondary">${currentUser.type || 'PF'}</span>
        `;

        document.getElementById('clientRatingValue').textContent = (currentUser.ratingAsClient || 5.0).toFixed(1);
        document.getElementById('clientRatingCount').textContent = `(${currentUser.totalClientReviews || 0} avaliações)`;
        document.getElementById('clientRatingStars').innerHTML = Icons.renderStars(currentUser.ratingAsClient || 5.0);

        const sellerBox = document.getElementById('sellerReputationBox');
        if (currentUser.isSeller) {
            sellerBox.style.display = 'block';
            document.getElementById('sellerRatingValue').textContent = (currentUser.ratingAsSeller || 5.0).toFixed(1);
            document.getElementById('sellerRatingCount').textContent = `(${currentUser.totalSellerReviews || 0} avaliações)`;
            document.getElementById('sellerRatingStars').innerHTML = Icons.renderStars(currentUser.ratingAsSeller || 5.0);
        } else {
            sellerBox.style.display = 'none';
        }

        document.getElementById('profileDisplayCPF').textContent = currentUser.cpf || '---';
        document.getElementById('profileDisplayBirth').textContent = currentUser.birthDate ? new Date(currentUser.birthDate + 'T00:00:00').toLocaleDateString('pt-BR') : '---';
        document.getElementById('profileDisplayPhone').textContent = currentUser.phone || 'Não informado';
        document.getElementById('profileDisplayPreferences').textContent = currentUser.preferences || 'Não informadas';
        document.getElementById('profileDisplayGender').textContent = currentUser.gender || 'Não informado';
        document.getElementById('profileDisplayCEP').textContent = currentUser.cep || '---';
        document.getElementById('profileDisplayAddress').textContent = currentUser.address ? `${currentUser.address.logradouro || ''}, ${currentUser.address.bairro || ''}, ${currentUser.address.cidade || ''} - ${currentUser.address.uf || ''}` : '---';

        const sellerArea = document.getElementById('profileSellerDetailsArea');
        const btnUpgrade = document.getElementById('btnSellerUpgradeProfile');
        if (currentUser.isSeller && currentUser.sellerData) {
            sellerArea.style.display = 'block';
            if (btnUpgrade) {
                btnUpgrade.innerHTML = `${Icons.tools} <span>Editar Credenciais</span>`;
            }
            document.getElementById('profileDisplayBusinessName').textContent = currentUser.sellerData.businessName || currentUser.name;
            document.getElementById('profileDisplayCNPJ').textContent = currentUser.sellerData.cnpj || 'Não cadastrado (Pessoa Física)';
            document.getElementById('profileDisplayVerification').textContent = currentUser.sellerData.verificationInfo || 'Sem certificações registradas';
            document.getElementById('profileDisplayCategories').textContent = (currentUser.sellerData.categories || []).join(', ') || 'Todas';
            document.getElementById('profileDisplaySkills').textContent = currentUser.sellerData.skills || '---';
        } else {
            sellerArea.style.display = 'none';
            if (btnUpgrade) {
                btnUpgrade.innerHTML = `${Icons.tools} <span>Tornar-se Prestador</span>`;
            }
        }

        const reviewsContainer = document.getElementById('profileReviewsList');
        const reviews = StorageService.getReviews(currentUser.id);
        if (reviews.length === 0) {
            reviewsContainer.innerHTML = `<span style="font-size: 13px; color: var(--text-muted);">Nenhuma avaliação recebida até o momento.</span>`;
        } else {
            reviewsContainer.innerHTML = reviews.map(r => `
                <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; font-size: 13px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong>${r.reviewerName}</strong>
                        <div>${Icons.renderStars(r.rating)}</div>
                    </div>
                    ${r.comment ? `<p style="margin-top: 6px; color: var(--text-secondary);">${r.comment}</p>` : ''}
                    <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px;">
                        ${new Date(r.createdAt).toLocaleDateString('pt-BR')} • Avaliação como ${r.targetRole === 'seller' ? 'Prestador' : 'Cliente'}
                    </span>
                </div>
            `).join('');
        }
    },

    openEditProfileModal() {
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) return;

        document.getElementById('editProfPreferences').value = currentUser.preferences || '';
        document.getElementById('editProfName').value = currentUser.name;
        document.getElementById('editProfPhone').value = currentUser.phone || '';
        document.getElementById('editProfGender').value = currentUser.gender || 'Não informado';
        document.getElementById('editProfCEP').value = currentUser.cep || '';
        document.getElementById('editProfCity').value = currentUser.address ? `${currentUser.address.cidade} - ${currentUser.address.uf}` : '';
        document.getElementById('editProfAvatar').value = currentUser.avatar || '';
        document.getElementById('editProfBanner').value = currentUser.banner || '';

        this.openModal('modalEditProfile');
    },

    async handleSaveProfile(e) {
        e.preventDefault();
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) return;

        const name = document.getElementById('editProfName').value.trim();
        const phone = document.getElementById('editProfPhone').value.trim();
        const gender = document.getElementById('editProfGender').value;
        const cep = document.getElementById('editProfCEP').value.trim();
        const avatar = document.getElementById('editProfAvatar').value.trim();
        const banner = document.getElementById('editProfBanner').value.trim();

        const nameVal = Validators.validateName(name);
        if (!nameVal.valid) {
            this.showToast(nameVal.message, 'error');
            return;
        }

        if (phone) {
            const phoneVal = Validators.validatePhone(phone);
            if (!phoneVal.valid) {
                this.showToast(phoneVal.message, 'error');
                return;
            }
        }

        let address = currentUser.address;
        if (cep && cep !== currentUser.cep) {
            const cepRes = await Validators.validateAndFetchCEP(cep);
            if (!cepRes.valid) {
                this.showToast(cepRes.message, 'error');
                return;
            }
            address = cepRes.address;
        }

        currentUser.preferences = document.getElementById('editProfPreferences').value.trim();
        currentUser.name = name;
        currentUser.phone = phone;
        currentUser.gender = gender;
        currentUser.cep = cep;
        currentUser.address = address;
        if (avatar) currentUser.avatar = avatar;
        if (banner) currentUser.banner = banner;

        StorageService.saveUser(currentUser);
        this.renderUserHeader();
        this.renderDemoUserSwitcher();
        this.renderProfile();
        this.closeModal('modalEditProfile');
        this.showToast('Perfil atualizado com sucesso!', 'success');
    },

    openSellerUpgradeModal() {
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) {
            this.openAuthModal('login');
            return;
        }

        document.getElementById('sellerCertificate').value = currentUser.sellerData?.certificate || '';
        if (currentUser.sellerData) {
            document.getElementById('sellerBusinessName').value = currentUser.sellerData.businessName || currentUser.name;
            document.getElementById('sellerCNPJ').value = currentUser.sellerData.cnpj || '';
            document.getElementById('sellerVerification').value = currentUser.sellerData.verificationInfo || '';
            document.getElementById('sellerCategoriesInput').value = (currentUser.sellerData.categories || []).join(', ');
            document.getElementById('sellerSkillsInput').value = currentUser.sellerData.skills || '';
        } else {
            document.getElementById('sellerBusinessName').value = currentUser.name;
            document.getElementById('sellerCNPJ').value = '';
            document.getElementById('sellerVerification').value = '';
            document.getElementById('sellerCategoriesInput').value = 'Impressão 3D, Artesanato';
            document.getElementById('sellerSkillsInput').value = '';
        }

        this.openModal('modalSellerUpgrade');
    },

    handleSaveSellerData(e) {
        e.preventDefault();
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser) return;

        const businessName = document.getElementById('sellerBusinessName').value.trim();
        const cnpj = document.getElementById('sellerCNPJ').value.trim();
        const verification = document.getElementById('sellerVerification').value.trim();
        const categories = document.getElementById('sellerCategoriesInput').value.split(',').map(c => c.trim()).filter(Boolean);
        const skills = document.getElementById('sellerSkillsInput').value.trim();

        if (cnpj) {
            const cnpjVal = Validators.validateCNPJ(cnpj);
            if (!cnpjVal.valid) {
                this.showToast(cnpjVal.message, 'error');
                return;
            }
            currentUser.type = 'PJ';
        }

        currentUser.isSeller = true;
        currentUser.sellerData = {
            businessName,
            cnpj,
            verificationInfo: verification || 'Qualificações não informadas',
            certificate: document.getElementById('sellerCertificate').value,
            categories,
            skills,
            portfolio: currentUser.sellerData?.portfolio || [],
            stock: currentUser.sellerData?.stock || []
        };
        if (!currentUser.ratingAsSeller) {
            currentUser.ratingAsSeller = 5.0;
            currentUser.totalSellerReviews = 0;
        }

        StorageService.saveUser(currentUser);
        this.renderUserHeader();
        this.renderDemoUserSwitcher();
        this.closeModal('modalSellerUpgrade');
        this.showToast('Credenciais de prestador salvas com sucesso!', 'success');
        this.navigateTo('seller-panel');
    },

    // ========================================================
    // CRUD DE ESTOQUE
    // ========================================================
    openStockModal(itemId = null) {
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser || !currentUser.sellerData) return;

        document.getElementById('formStock').reset();

        if (itemId) {
            const item = (currentUser.sellerData.stock || []).find(i => i.id === itemId);
            if (item) {
                document.getElementById('stockModalTitle').textContent = 'Editar Item do Estoque';
                document.getElementById('stockItemId').value = item.id;
                document.getElementById('stockName').value = item.name;
                document.getElementById('stockCategory').value = item.category || '';
                document.getElementById('stockQuantity').value = item.quantity;
                document.getElementById('stockPrice').value = item.price;
                document.getElementById('stockActive').value = item.active ? 'true' : 'false';
                document.getElementById('stockDescription').value = item.description || '';
            }
        } else {
            document.getElementById('stockModalTitle').textContent = 'Adicionar Item ao Estoque';
            document.getElementById('stockItemId').value = '';
        }

        this.openModal('modalStock');
    },

    handleSaveStockItem(e) {
        e.preventDefault();
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser || !currentUser.sellerData) return;

        const itemId = document.getElementById('stockItemId').value;
        const name = document.getElementById('stockName').value.trim();
        const category = document.getElementById('stockCategory').value.trim() || 'Geral';
        const quantity = parseInt(document.getElementById('stockQuantity').value, 10);
        const price = parseFloat(document.getElementById('stockPrice').value);
        const active = document.getElementById('stockActive').value === 'true';
        const description = document.getElementById('stockDescription').value.trim();

        if (isNaN(quantity) || quantity < 0) {
            this.showToast('A quantidade deve ser um número maior ou igual a zero.', 'error');
            return;
        }

        currentUser.sellerData.stock = currentUser.sellerData.stock || [];

        if (itemId) {
            const idx = currentUser.sellerData.stock.findIndex(i => i.id === itemId);
            if (idx >= 0) {
                currentUser.sellerData.stock[idx] = {
                    ...currentUser.sellerData.stock[idx],
                    name, category, quantity, price, active, description
                };
            }
            this.showToast('Item de estoque atualizado!', 'success');
        } else {
            currentUser.sellerData.stock.push({
                id: 'stk_' + Date.now(),
                name, category, quantity, price, active, description
            });
            this.showToast('Novo item cadastrado no estoque!', 'success');
        }

        StorageService.saveUser(currentUser);
        this.closeModal('modalStock');
        this.renderSellerStock();
    },

    toggleStockItemStatus(itemId) {
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser || !currentUser.sellerData?.stock) return;

        const item = currentUser.sellerData.stock.find(i => i.id === itemId);
        if (item) {
            item.active = !item.active;
            StorageService.saveUser(currentUser);
            this.showToast(`Item ${item.active ? 'ativado' : 'inativado'} no catálogo!`, 'info');
            this.renderSellerStock();
        }
    },

    deleteStockItem(itemId) {
        if (!confirm('Deseja excluir este item do catálogo de estoque?')) return;
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser || !currentUser.sellerData?.stock) return;

        currentUser.sellerData.stock = currentUser.sellerData.stock.filter(i => i.id !== itemId);
        StorageService.saveUser(currentUser);
        this.showToast('Item excluído do estoque.', 'info');
        this.renderSellerStock();
    },

    renderSellerStock() {
        const tbody = document.getElementById('sellerStockTableBody');
        if (!tbody) return;

        const currentUser = StorageService.getCurrentUser();
        const stock = currentUser?.sellerData?.stock || [];

        if (stock.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">Nenhum item em estoque no momento.</td></tr>`;
            return;
        }

        tbody.innerHTML = stock.map(item => `
            <tr>
                <td><strong>${item.name}</strong><br><span style="font-size: 11px; color: var(--text-muted);">${item.description || ''}</span></td>
                <td><span class="badge badge-secondary">${item.category}</span></td>
                <td><strong>${item.quantity}</strong> un</td>
                <td>R$ ${item.price.toFixed(2)}</td>
                <td>
                    <span class="badge ${item.active ? 'badge-success' : 'badge-danger'}">
                        ${item.active ? 'Disponível' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 4px;">
                        <button class="btn btn-secondary btn-sm" onclick="App.openStockModal('${item.id}')" title="Editar">${Icons.edit}</button>
                        <button class="btn ${item.active ? 'btn-danger' : 'btn-success'} btn-sm" onclick="App.toggleStockItemStatus('${item.id}')" title="${item.active ? 'Inativar' : 'Ativar'}">
                            ${item.active ? Icons.x : Icons.check}
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="App.deleteStockItem('${item.id}')" title="Excluir">${Icons.trash}</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // ========================================================
    // CRUD DE PORTFÓLIO
    // ========================================================
    openPortfolioModal(itemId = null) {
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser || !currentUser.sellerData) return;

        document.getElementById('formPortfolio').reset();

        if (itemId) {
            const item = (currentUser.sellerData.portfolio || []).find(p => p.id === itemId);
            if (item) {
                document.getElementById('portfolioModalTitle').textContent = 'Editar Trabalho do Portfólio';
                document.getElementById('portfolioItemId').value = item.id;
                document.getElementById('portTitle').value = item.title;
                document.getElementById('portCategory').value = item.category || '';
                document.getElementById('portImage').value = item.image;
                document.getElementById('portDescription').value = item.description;
            }
        } else {
            document.getElementById('portfolioModalTitle').textContent = 'Adicionar ao Portfólio';
            document.getElementById('portfolioItemId').value = '';
            document.getElementById('portImage').value = '';
        }

        this.openModal('modalPortfolio');
    },

    handleSavePortfolioItem(e) {
        e.preventDefault();
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser || !currentUser.sellerData) return;

        const itemId = document.getElementById('portfolioItemId').value;
        const title = document.getElementById('portTitle').value.trim();
        const category = document.getElementById('portCategory').value.trim() || 'Geral';
        const image = document.getElementById('portImage').value.trim();
        const description = document.getElementById('portDescription').value.trim();

        currentUser.sellerData.portfolio = currentUser.sellerData.portfolio || [];

        if (itemId) {
            const idx = currentUser.sellerData.portfolio.findIndex(p => p.id === itemId);
            if (idx >= 0) {
                currentUser.sellerData.portfolio[idx] = {
                    ...currentUser.sellerData.portfolio[idx],
                    title, category, image, description
                };
            }
            this.showToast('Item do portfólio atualizado!', 'success');
        } else {
            currentUser.sellerData.portfolio.push({
                id: 'port_' + Date.now(),
                title, category, image, description,
                date: new Date().toISOString().split('T')[0]
            });
            this.showToast('Trabalho adicionado ao seu portfólio!', 'success');
        }

        StorageService.saveUser(currentUser);
        this.closeModal('modalPortfolio');
        this.renderSellerPortfolio();
    },

    deletePortfolioItem(itemId) {
        if (!confirm('Deseja remover este trabalho do seu portfólio?')) return;
        const currentUser = StorageService.getCurrentUser();
        if (!currentUser || !currentUser.sellerData?.portfolio) return;

        currentUser.sellerData.portfolio = currentUser.sellerData.portfolio.filter(p => p.id !== itemId);
        StorageService.saveUser(currentUser);
        this.showToast('Trabalho removido do portfólio.', 'info');
        this.renderSellerPortfolio();
    },

    renderSellerPortfolio() {
        const grid = document.getElementById('sellerPortfolioGrid');
        if (!grid) return;

        const currentUser = StorageService.getCurrentUser();
        const portfolio = currentUser?.sellerData?.portfolio || [];

        if (portfolio.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                    <h3 style="font-size: 16px;">Nenhum trabalho cadastrado no portfólio</h3>
                    <p style="color: var(--text-secondary); margin-top: 6px; font-size: 13.5px;">Exiba suas melhores impressões 3D e artes manuais para atrair novos clientes.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = portfolio.map(item => `
            <div class="card">
                <div class="portfolio-media">${this.portfolioMedia(item)}</div>
                <div class="card-body">
                    <span class="badge badge-secondary" style="align-self: flex-start;">${item.category}</span>
                    <h4 style="font-size: 15px; font-weight: 700; margin-top: 6px;">${item.title}</h4>
                    <p style="font-size: 13px; color: var(--text-secondary);">${item.description}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-secondary btn-sm" onclick="App.openPortfolioModal('${item.id}')">${Icons.edit} Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="App.deletePortfolioItem('${item.id}')">${Icons.trash} Remover</button>
                </div>
            </div>
        `).join('');
    },

    // ========================================================
    // CENTRAL DE NOTIFICAÇÕES
    // ========================================================
    toggleNotifDropdown() {
        const el = document.getElementById('notifDropdown');
        if (!el) return;
        el.classList.toggle('show');
        if (el.classList.contains('show')) {
            this.renderNotificationsList();
        }
    },

    updateNotificationBadge() {
        const currentUser = StorageService.getCurrentUser();
        const badge = document.getElementById('notifCountBadge');
        if (!badge) return;
        if (!currentUser) { badge.style.display = 'none'; return; }

        const notifs = StorageService.getNotifications(currentUser.id);
        const unreadCount = notifs.filter(n => !n.read).length;

        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    },

    renderNotificationsList() {
        const container = document.getElementById('notifListContainer');
        const currentUser = StorageService.getCurrentUser();
        if (!container) return;
        if (!currentUser) { container.innerHTML = '<p class="empty-state">Entre para ver suas notificações.</p>'; return; }

        const notifs = StorageService.getNotifications(currentUser.id);

        if (notifs.length === 0) {
            container.innerHTML = `<div style="text-align: center; padding: 20px; font-size: 13px; color: var(--text-muted);">Nenhuma notificação no momento.</div>`;
            return;
        }

        container.innerHTML = notifs.map(n => `
            <div class="notif-item ${n.read ? '' : 'unread'}" onclick="App.handleNotifClick('${n.id}', '${n.linkRequestId}')">
                <div class="notif-item-title">${n.title}</div>
                <div class="notif-item-msg">${n.message}</div>
                <div class="notif-item-time">${new Date(n.timestamp).toLocaleDateString('pt-BR')} às ${new Date(n.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `).join('');
    },

    handleNotifClick(notifId, linkRequestId) {
        StorageService.markNotificationAsRead(notifId);
        this.updateNotificationBadge();
        document.getElementById('notifDropdown')?.classList.remove('show');

        if (linkRequestId) {
            const req = StorageService.getRequestById(linkRequestId);
            if (req) {
                if (req.status === 'Em andamento' || req.status === 'Concluído') {
                    this.navigateTo('in-progress');
                } else {
                    const currentUser = StorageService.getCurrentUser();
                    if (currentUser && currentUser.id === req.clientId) {
                        this.openOffersCompareModal(linkRequestId);
                    } else {
                        this.navigateTo('seller-panel');
                    }
                }
            }
        }
    },

    markAllNotificationsRead() {
        const currentUser = StorageService.getCurrentUser();
        if (currentUser) {
            StorageService.markAllNotificationsAsRead(currentUser.id);
            this.updateNotificationBadge();
            this.renderNotificationsList();
            this.showToast('Todas as notificações foram marcadas como lidas.', 'info');
        }
    },

    // ========================================================
    // TOASTS E FEEDBACK VISUAL (COM ÍCONES SVG)
    // ========================================================
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const iconMap = {
            success: Icons.check,
            error: Icons.alert,
            info: Icons.bell
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span style="display:inline-flex; align-items:center;">${iconMap[type] || Icons.bell}</span> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

window.App = App;

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
