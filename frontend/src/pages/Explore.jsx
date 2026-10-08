import { useApp } from '../context';
import { Icon, Modal } from '../components/common';

export default function Explore() {
const { actions, field, slots, elementProps, activeClass, busy, recovery, slide } = useApp();
return (<section id="view-explore" className="view-section active" {...elementProps("view-explore", {})}>
                <nav className="category-nav" aria-label="Categorias de criação">
                    <button className="category-link active" data-category="" onClick={(event) => { actions.selectCategory('') }} {...activeClass("category-link", "category", "")}>para todas as ideias</button>
                    <button className="category-link" data-category="Impressão 3D" onClick={(event) => { actions.selectCategory('Impressão 3D') }} {...activeClass("category-link", "category", "Impressão 3D")}>impressão 3D</button>
                    <button className="category-link" data-category="Artesanato" onClick={(event) => { actions.selectCategory('Artesanato') }} {...activeClass("category-link", "category", "Artesanato")}>artesanato</button>
                    <button className="category-link" data-category="Personalização" onClick={(event) => { actions.selectCategory('Personalização') }} {...activeClass("category-link", "category", "Personalização")}>personalizados</button>
                    <button className="category-link" data-category="Pintura Manual" onClick={(event) => { actions.selectCategory('Pintura Manual') }} {...activeClass("category-link", "category", "Pintura Manual")}>pintura manual</button>
                    <button className="category-link" data-category="Prototipagem Rápida" onClick={(event) => { actions.selectCategory('Prototipagem Rápida') }} {...activeClass("category-link", "category", "Prototipagem Rápida")}>prototipagem</button>
                </nav>
                <div className="hero-layout">
                    <div className="hero-banner" id="heroBanner" {...elementProps("heroBanner", {})}>
                        <div className="hero-copy">
                            <span className="eyebrow">FEITO DE IDEIAS. FEITO PRA VOCÊ.</span>
                            <h1 id="heroTitle" {...elementProps("heroTitle", {})}>{slots.heroTitle}</h1>
                            <p id="heroDescription" {...elementProps("heroDescription", {})}>{slots.heroDescription}</p>
                            <span className="hero-signature">crie. conecte. transforme. <span aria-hidden="true">↗</span></span>
                        </div>
                        <div className="hero-art" aria-hidden="true">
                            <div className="art-orbit"></div><div className="art-spark">✳</div>
                            <div className="sculpture sculpture-back"><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i></div>
                            <div className="art-plinth"></div>
                            <div className="sculpture sculpture-front"><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i><i ></i></div>
                            <span className="art-label">do imaginário ao real</span>
                        </div>
                    </div>
                    <div className="hero-aside">
                        <span className="eyebrow">DO SEU JEITO</span>
                        <h2 id="heroAsideTitle" {...elementProps("heroAsideTitle", {})}>{slots.heroAsideTitle}</h2>
                        <p id="heroAsideDescription" {...elementProps("heroAsideDescription", {})}>{slots.heroAsideDescription}</p>
                        <button className="btn btn-outline" id="heroAction" onClick={(event) => { actions.openNewRequestModal() }} {...elementProps("heroAction", {})}>{slots.heroAction}</button>
                    </div>
                </div>
                <div className="hero-pagination" aria-label="Destaques">
                    <button className={slide===0 ? "active" : ""} aria-label="Destaque: sua ideia" aria-pressed={slide===0} onClick={(event) => { actions.setHeroSlide(0) }}></button>
                    <button className={slide===1 ? "active" : ""} aria-label="Destaque: feito à mão" aria-pressed={slide===1} onClick={(event) => { actions.setHeroSlide(1) }}></button>
                    <button className={slide===2 ? "active" : ""} aria-label="Destaque: quem cria" aria-pressed={slide===2} onClick={(event) => { actions.setHeroSlide(2) }}></button>
                </div>
                <div className="section-heading" id="opportunitiesHeading" {...elementProps("opportunitiesHeading", {})}>
                    <div ><span className="eyebrow">CONEXÕES QUE VIRAM CRIAÇÕES</span><h2 >ideias procurando um talento</h2><p >Um novo projeto pode começar com você.</p></div>
                    <button className="text-link" onClick={(event) => { actions.toggleExploreFilters() }} aria-expanded="false" aria-controls="exploreFilters" id="filterToggle" {...elementProps("filterToggle", {})}>filtrar pedidos <span id="filterToggleIcon" {...elementProps("filterToggleIcon", {})}><Icon name="tools" /></span></button>
                </div>
                
                <div className="filter-panel marketplace-filters" id="exploreFilters" hidden {...elementProps("exploreFilters", {})}>
                    <div className="filter-grid">
                        <div className="form-group" style={{"marginBottom": "0"}}>
                            <label className="form-label" htmlFor="filterSearch">Buscar por Palavra-chave:</label>
                            <input type="text" id="filterSearch" className="form-input" placeholder="Ex: action figure, suporte, resina..." {...field("filterSearch", "text")} {...elementProps("filterSearch", {})} />
                        </div>
                        <div className="form-group" style={{"marginBottom": "0"}}>
                            <label className="form-label" htmlFor="filterCategory">Categoria:</label>
                            <select id="filterCategory" className="form-select" {...field("filterCategory", "text")} {...elementProps("filterCategory", {})}>
                                <option value="">Todas as Categorias</option>
                                <option value="Impressão 3D">Impressão 3D</option>
                                <option value="Impressão 3D e Pintura">Impressão 3D e Pintura</option>
                                <option value="Artesanato">Artesanato</option>
                                <option value="Personalização">Personalização</option>
                                <option value="Pintura Manual">Pintura Manual</option>
                                <option value="Prototipagem Rápida">Prototipagem Rápida</option>
                            </select>
                        </div>
                        <div className="form-group" style={{"marginBottom": "0"}}>
                            <label className="form-label" htmlFor="filterMaxBudget">Orçamento Máximo:</label>
                            <select id="filterMaxBudget" className="form-select" {...field("filterMaxBudget", "text")} {...elementProps("filterMaxBudget", {})}>
                                <option value="">Qualquer Orçamento</option>
                                <option value="50">Até R$ 50,00</option>
                                <option value="100">Até R$ 100,00</option>
                                <option value="250">Até R$ 250,00</option>
                                <option value="500">Até R$ 500,00</option>
                                <option value="1000">Até R$ 1.000,00</option>
                            </select>
                        </div>
                        <div className="form-group" style={{"marginBottom": "0"}}>
                            <label className="form-label" htmlFor="filterDistance">Proximidade Máxima:</label>
                            <select id="filterDistance" className="form-select" {...field("filterDistance", "text")} {...elementProps("filterDistance", {})}>
                                <option value="">Todo o Brasil</option>
                                <option value="25">Mesma Região (Até 25 km)</option>
                                <option value="100">Mesmo Estado (Até 100 km)</option>
                                <option value="500">Região Próxima (Até 500 km)</option>
                            </select>
                        </div>
                        <div className="form-group" style={{"marginBottom": "0"}}>
                            <label className="form-label" htmlFor="filterMinRating">Reputação do Solicitante:</label>
                            <select id="filterMinRating" className="form-select" {...field("filterMinRating", "text")} {...elementProps("filterMinRating", {})}>
                                <option value="0">Todas as Avaliações</option>
                                <option value="4">4.0 estrelas ou mais</option>
                                <option value="4.5">4.5 estrelas ou mais</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="results-summary" id="exploreResultsCount" role="status" aria-live="polite" {...elementProps("exploreResultsCount", {})}>{slots.exploreResultsCount}</div>
                
                <div id="exploreRequestsGrid" className="grid-cards" {...elementProps("exploreRequestsGrid", {})}>{slots.exploreRequestsGrid}</div>
                <section className="makers-section" aria-labelledby="makersTitle">
                    <div className="section-heading"><div ><span className="eyebrow">GENTE QUE FAZ ACONTECER</span><h2 id="makersTitle" {...elementProps("makersTitle", {})}>encontre seu próximo criador</h2><p >Conheça os talentos por trás de cada detalhe.</p></div><span className="section-note">feito com talento, perto de você</span></div>
                    <div className="maker-filters">
                        <label >Categoria<select id="makerCategory" className="form-select" {...field("makerCategory", "text")} {...elementProps("makerCategory", {})}><option value="">Todas as especialidades</option><option >Impressão 3D</option><option >Artesanato</option><option >Personalização</option><option >Pintura Manual</option><option >Prototipagem Rápida</option></select></label>
                        <label >Faixa de preço<select id="makerPrice" className="form-select" {...field("makerPrice", "text")} {...elementProps("makerPrice", {})}><option value="">Qualquer valor</option><option value="100">Até R$ 100</option><option value="250">Até R$ 250</option><option value="500">Até R$ 500</option></select></label>
                        <label >Avaliação<select id="makerRating" className="form-select" {...field("makerRating", "text")} {...elementProps("makerRating", {})}><option value="0">Todas as avaliações</option><option value="4">4 estrelas ou mais</option><option value="4.5">4,5 estrelas ou mais</option></select></label>
                    </div>
                    <p className="filter-caption">Preços de referência de itens em estoque e ofertas. Cada projeto recebe um orçamento próprio.</p>
                    <div id="makersGrid" className="makers-grid" aria-live="polite" {...elementProps("makersGrid", {})}>{slots.makersGrid}</div>
                </section>
                <div className="creator-invite"><div ><span className="eyebrow">SEU TALENTO TEM ESPAÇO AQUI</span><h2 >você imagina. você faz. você vende.</h2><p >Mostre seu trabalho e encontre novas ideias para criar.</p></div><button className="btn btn-primary" onClick={(event) => { actions.openSellerUpgradeModal() }}>quero ser prestador <span aria-hidden="true">↗</span></button></div>
            </section>);
}
