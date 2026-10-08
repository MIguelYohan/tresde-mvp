import { useApp } from '../context';
import { Icon, Modal } from '../components/common';

export default function SellerPanel() {
const { actions, field, slots, elementProps, activeClass, busy, recovery } = useApp();
return (<section id="view-seller-panel" className="view-section" {...elementProps("view-seller-panel", {})}>
                
                <div id="sellerUpgradeBanner" style={{"display": "none", "background": "#ffffff", "borderRadius": "var(--radius-lg)", "padding": "36px", "border": "1px solid var(--border-color)", "textAlign": "center", "marginBottom": "30px"}} {...elementProps("sellerUpgradeBanner", {"display": "none", "background": "#ffffff", "borderRadius": "var(--radius-lg)", "padding": "36px", "border": "1px solid var(--border-color)", "textAlign": "center", "marginBottom": "30px"})}>
                    <div id="sellerBannerIcon" style={{"marginBottom": "12px"}} {...elementProps("sellerBannerIcon", {"marginBottom": "12px"})}><Icon name="tools" /></div>
                    <h2 style={{"fontSize": "20px", "marginBottom": "8px"}}>Torne-se um Prestador / Vendedor no TresDê</h2>
                    <p style={{"color": "var(--text-secondary)", "maxWidth": "600px", "margin": "0 auto 20px", "fontSize": "14px"}}>
                        Você está atualmente cadastrado como cliente. Ative seu perfil de vendedor para enviar propostas de orçamento, gerenciar estoque de insumos e expor seu portfólio de impressão 3D e artesanato.
                    </p>
                    <button className="btn btn-accent btn-lg" onClick={(event) => { actions.openSellerUpgradeModal() }}>
                        Ativar Cadastro de Prestador
                    </button>
                </div>

                
                <div id="sellerActiveContent" {...elementProps("sellerActiveContent", {})}>
                    <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "marginBottom": "20px", "flexWrap": "wrap", "gap": "15px"}}>
                        <div >
                            <h1 style={{"fontSize": "22px", "fontWeight": "800"}}>Painel do Prestador</h1>
                            <p style={{"color": "var(--text-secondary)", "fontSize": "13.5px"}}>Gerencie suas ofertas enviadas, pedidos em produção, portfólio e estoque.</p>
                        </div>
                        <div className="profile-actions" style={{"display": "flex", "gap": "10px"}}>
                            <button className="btn btn-secondary" onClick={(event) => { actions.openStockModal() }}>
                                <span className="btn-icon" id="sellerBtnStock" {...elementProps("sellerBtnStock", {})}><Icon name="box" /></span>
                                <span >Gerenciar Estoque</span>
                            </button>
                            <button className="btn btn-secondary" onClick={(event) => { actions.openPortfolioModal() }}>
                                <span className="btn-icon" id="sellerBtnPortfolio" {...elementProps("sellerBtnPortfolio", {})}><Icon name="image" /></span>
                                <span >Gerenciar Portfólio</span>
                            </button>
                        </div>
                    </div>

                    
                    <div className="seller-tabs" style={{"display": "flex", "borderBottom": "2px solid var(--border-color)", "marginBottom": "20px", "gap": "8px"}}>
                        <button className="btn btn-sm btn-secondary seller-subtab-btn active" onClick={(event) => { actions.switchSellerSubTab('compatible', event.currentTarget) }} {...activeClass("btn btn-sm btn-secondary seller-subtab-btn", "sellerTab", "compatible")}>
                            Pedidos Compatíveis
                        </button>
                        <button className="btn btn-sm btn-secondary seller-subtab-btn" onClick={(event) => { actions.switchSellerSubTab('my-offers', event.currentTarget) }} {...activeClass("btn btn-sm btn-secondary seller-subtab-btn", "sellerTab", "my-offers")}>
                            Minhas Ofertas Enviadas (<span id="sellerOffersCount" {...elementProps("sellerOffersCount", {})}>{slots.sellerOffersCount}</span>)
                        </button>
                        <button className="btn btn-sm btn-secondary seller-subtab-btn" onClick={(event) => { actions.switchSellerSubTab('stock-view', event.currentTarget) }} {...activeClass("btn btn-sm btn-secondary seller-subtab-btn", "sellerTab", "stock-view")}>
                            Meu Estoque
                        </button>
                        <button className="btn btn-sm btn-secondary seller-subtab-btn" onClick={(event) => { actions.switchSellerSubTab('portfolio-view', event.currentTarget) }} {...activeClass("btn btn-sm btn-secondary seller-subtab-btn", "sellerTab", "portfolio-view")}>
                            Meu Portfólio
                        </button>
                    </div>

                    
                    <div id="sellerSubtab-compatible" {...elementProps("sellerSubtab-compatible", {})}>
                        <label className="form-label" htmlFor="sellerDistance">Proximidade dos pedidos da sua área de atuação</label>
                        <select id="sellerDistance" className="form-select" style={{"maxWidth": "280px"}} {...field("sellerDistance", "text")} {...elementProps("sellerDistance", {"maxWidth": "280px"})}><option value="">Todo o Brasil</option><option value="25">Até 25 km</option><option value="100">Até 100 km</option><option value="500">Até 500 km</option></select>
                        <div id="sellerCompatibleGrid" className="grid-cards" {...elementProps("sellerCompatibleGrid", {})}>{slots.sellerCompatibleGrid}</div>
                    </div>

                    
                    <div id="sellerSubtab-my-offers" style={{"display": "none"}} {...elementProps("sellerSubtab-my-offers", {"display": "none"})}>
                        <div id="sellerMyOffersGrid" className="grid-cards" {...elementProps("sellerMyOffersGrid", {})}>{slots.sellerMyOffersGrid}</div>
                    </div>

                    
                    <div id="sellerSubtab-stock-view" style={{"display": "none"}} {...elementProps("sellerSubtab-stock-view", {"display": "none"})}>
                        <div style={{"background": "#ffffff", "borderRadius": "var(--radius-lg)", "border": "1px solid var(--border-color)", "padding": "20px"}}>
                            <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "marginBottom": "16px"}}>
                                <h3 style={{"fontSize": "16px"}}>Itens Catalogados no Estoque</h3>
                                <button className="btn btn-primary btn-sm" onClick={(event) => { actions.openStockModal(null) }}>
                                    <span className="btn-icon" id="stockBtnAdd" {...elementProps("stockBtnAdd", {})}><Icon name="plus" /></span>
                                    <span >Adicionar Item</span>
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead >
                                        <tr >
                                            <th >Item / Produto</th>
                                            <th >Categoria</th>
                                            <th >Quantidade</th>
                                            <th >Preço Unitário</th>
                                            <th >Status</th>
                                            <th >Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody id="sellerStockTableBody" {...elementProps("sellerStockTableBody", {})}>{slots.sellerStockTableBody}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    
                    <div id="sellerSubtab-portfolio-view" style={{"display": "none"}} {...elementProps("sellerSubtab-portfolio-view", {"display": "none"})}>
                        <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "marginBottom": "16px"}}>
                            <h3 style={{"fontSize": "16px"}}>Trabalhos e Peças Anteriores</h3>
                            <button className="btn btn-primary btn-sm" onClick={(event) => { actions.openPortfolioModal(null) }}>
                                <span className="btn-icon" id="portfolioBtnAdd" {...elementProps("portfolioBtnAdd", {})}><Icon name="plus" /></span>
                                <span >Adicionar ao Portfólio</span>
                            </button>
                        </div>
                        <div id="sellerPortfolioGrid" className="grid-cards" {...elementProps("sellerPortfolioGrid", {})}>{slots.sellerPortfolioGrid}</div>
                    </div>
                </div>
            </section>);
}
