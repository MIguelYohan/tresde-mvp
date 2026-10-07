/**
 * Módulo de Ícones SVG do Sistema TresDê
 * Carrega ícones SVG a partir dos arquivos em assets/icons/ e os disponibiliza
 * como strings HTML inline para injeção dinâmica em toda a interface.
 *
 * Os SVGs são carregados via fetch, recebem a classe CSS .icon (ou variante)
 * e ficam disponíveis na API global window.Icons.
 */

const Icons = {
    // -------------------------------------------------------
    // Mapeamento: nome interno → { file, class, width, height, extraAttrs }
    // -------------------------------------------------------
    _registry: {
        search:     { file: 'search.svg',         cls: 'icon', w: 18, h: 18 },
        box:        { file: 'box.svg',             cls: 'icon', w: 18, h: 18 },
        tools:      { file: 'tools.svg',           cls: 'icon', w: 18, h: 18 },
        activity:   { file: 'activity.svg',        cls: 'icon', w: 18, h: 18 },
        user:       { file: 'user.svg',            cls: 'icon', w: 18, h: 18 },
        bell:       { file: 'bell.svg',            cls: 'icon', w: 18, h: 18 },
        plus:       { file: 'plus.svg',            cls: 'icon', w: 16, h: 16 },
        paperclip:  { file: 'paperclip.svg',       cls: 'icon', w: 16, h: 16 },
        cube:       { file: 'cube.svg',            cls: 'icon', w: 16, h: 16 },
        image:      { file: 'image.svg',           cls: 'icon', w: 16, h: 16 },
        file:       { file: 'file.svg',            cls: 'icon', w: 16, h: 16 },
        check:      { file: 'check.svg',           cls: 'icon', w: 16, h: 16 },
        x:          { file: 'x.svg',               cls: 'icon', w: 16, h: 16 },
        edit:       { file: 'edit.svg',            cls: 'icon', w: 14, h: 14 },
        trash:      { file: 'trash.svg',           cls: 'icon', w: 14, h: 14 },
        refresh:    { file: 'refresh.svg',         cls: 'icon', w: 14, h: 14 },
        star:       { file: 'star.svg',            cls: 'icon icon-star', w: 16, h: 16, extra: { fill: '#f59e0b', stroke: '#f59e0b', 'stroke-width': '1.5' } },
        starOutline:{ file: 'star-outline.svg',    cls: 'icon icon-star-outline', w: 16, h: 16, extra: { fill: 'none', stroke: '#cbd5e1', 'stroke-width': '1.5' } },
        logout:     { file: 'logout.svg',          cls: 'icon', w: 14, h: 14 },
        creditCard: { file: 'credit-card.svg',     cls: 'icon', w: 18, h: 18 },
        qrCode:     { file: 'qr-code.svg',         cls: 'icon', w: 18, h: 18 },
        mapPin:     { file: 'map-pin.svg',         cls: 'icon', w: 14, h: 14 },
        calendar:   { file: 'calendar.svg',        cls: 'icon', w: 14, h: 14 },
        chat:       { file: 'message-square.svg',  cls: 'icon', w: 14, h: 14 },
        alert:      { file: 'alert-circle.svg',    cls: 'icon', w: 16, h: 16 },
        logo:       { file: 'logo.svg',            cls: 'icon-logo', w: 22, h: 22 },
    },

    // Caminho base dos ícones SVG
    _basePath: 'assets/icons/',

    // Cache de SVGs já carregados (string HTML pronta)
    _cache: {},

    // Indicador de se os ícones já foram carregados
    _loaded: false,

    /**
     * Carrega todos os SVGs do registro de forma assíncrona,
     * processa-os e popula as propriedades do objeto Icons.
     * Retorna uma Promise que resolve quando tudo está pronto.
     */
    async loadAll() {
        const entries = Object.entries(this._registry);

        const promises = entries.map(async ([name, meta]) => {
            try {
                const resp = await fetch(this._basePath + meta.file);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                let svg = await resp.text();

                // Processa o SVG: aplica classe, dimensões e atributos extras
                svg = this._processSvg(svg, meta);
                this._cache[name] = svg;
            } catch (err) {
                console.warn(`[Icons] Falha ao carregar ${meta.file}:`, err.message);
                // Mantém o fallback inline se já existir
            }
        });

        await Promise.all(promises);

        // Popula as propriedades diretas do objeto Icons
        for (const [name] of entries) {
            if (this._cache[name]) {
                this[name] = this._cache[name];
            }
        }

        this._loaded = true;
    },

    /**
     * Processa um SVG raw: substitui/injeta class, width, height e atributos extras.
     */
    _processSvg(svgText, meta) {
        // Usar DOMParser para manipulação segura
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText.trim(), 'image/svg+xml');
        const svg = doc.querySelector('svg');

        if (!svg) return svgText;

        // Define classe CSS
        svg.setAttribute('class', meta.cls);

        // Define dimensões
        svg.setAttribute('width', String(meta.w));
        svg.setAttribute('height', String(meta.h));

        // Atributos extras (fill, stroke, etc.)
        if (meta.extra) {
            for (const [attr, val] of Object.entries(meta.extra)) {
                svg.setAttribute(attr, val);
            }
        }

        // Serializa de volta para string
        const serializer = new XMLSerializer();
        return serializer.serializeToString(svg);
    },

    // -------------------------------------------------------
    // Helpers de renderização (mantidos iguais)
    // -------------------------------------------------------
    renderStars(rating = 5, max = 5) {
        const rounded = Math.round(rating);
        let html = '';
        for (let i = 1; i <= max; i++) {
            html += i <= rounded ? this.star : this.starOutline;
        }
        return `<span class="star-rating-icons">${html}</span>`;
    },

    get(name) {
        return this[name] || '';
    }
};

// ---------------------------------------------------------------------------
// Fallbacks síncronos: SVGs inline mínimos para renderização imediata.
// Serão sobrescritos assim que loadAll() completar.
// ---------------------------------------------------------------------------
Icons.search     = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
Icons.box        = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
Icons.tools      = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
Icons.activity   = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
Icons.user       = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
Icons.bell       = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;
Icons.plus       = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
Icons.paperclip  = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`;
Icons.cube       = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline><polyline points="7.5 19.79 7.5 14.6 3 12"></polyline><polyline points="21 12 16.5 14.6 16.5 19.79"></polyline><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
Icons.image      = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
Icons.file       = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
Icons.check      = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
Icons.x          = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
Icons.edit       = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
Icons.trash      = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
Icons.refresh    = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`;
Icons.star       = `<svg class="icon icon-star" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
Icons.starOutline= `<svg class="icon icon-star-outline" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
Icons.logout     = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`;
Icons.creditCard = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
Icons.qrCode     = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;
Icons.mapPin     = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
Icons.calendar   = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
Icons.chat       = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
Icons.alert      = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
Icons.logo       = `<svg class="icon-logo" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;

window.Icons = Icons;
