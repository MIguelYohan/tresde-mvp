import { useApp } from '../context';
import { Icon, Modal } from '../components/common';

export default function ClientRequests() {
const { actions, field, slots, elementProps, activeClass, busy, recovery } = useApp();
return (<section id="view-client-requests" className="view-section" {...elementProps("view-client-requests", {})}>
                <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "marginBottom": "20px", "flexWrap": "wrap", "gap": "12px"}}>
                    <div >
                        <h1 style={{"fontSize": "22px", "fontWeight": "800"}}>Minhas Requisições</h1>
                        <p style={{"color": "var(--text-secondary)", "fontSize": "13.5px"}}>Gerencie seus pedidos, analise orçamentos recebidos e acompanhe o status de produção.</p>
                    </div>
                    <button className="btn btn-primary" onClick={(event) => { actions.openNewRequestModal() }}>
                        <span className="btn-icon" id="clientBtnPlus" {...elementProps("clientBtnPlus", {})}><Icon name="plus" /></span>
                        <span >Criar Nova Requisição</span>
                    </button>
                </div>

                
                <div style={{"display": "flex", "gap": "8px", "marginBottom": "20px", "overflowX": "auto", "paddingBottom": "5px"}}>
                    <button className="btn btn-sm btn-secondary filter-status-btn active" data-status="all" onClick={(event) => { actions.filterClientRequestsByStatus('all', event.currentTarget) }} {...activeClass("btn btn-sm btn-secondary filter-status-btn", "status", "all")}>Todas</button>
                    <button className="btn btn-sm btn-secondary filter-status-btn" data-status="Aberto" onClick={(event) => { actions.filterClientRequestsByStatus('Aberto', event.currentTarget) }} {...activeClass("btn btn-sm btn-secondary filter-status-btn", "status", "Aberto")}>Abertas</button>
                    <button className="btn btn-sm btn-secondary filter-status-btn" data-status="Em análise" onClick={(event) => { actions.filterClientRequestsByStatus('Em análise', event.currentTarget) }} {...activeClass("btn btn-sm btn-secondary filter-status-btn", "status", "Em análise")}>Em Análise</button>
                    <button className="btn btn-sm btn-secondary filter-status-btn" data-status="Em andamento" onClick={(event) => { actions.filterClientRequestsByStatus('Em andamento', event.currentTarget) }} {...activeClass("btn btn-sm btn-secondary filter-status-btn", "status", "Em andamento")}>Em Andamento</button>
                    <button className="btn btn-sm btn-secondary filter-status-btn" data-status="Concluído" onClick={(event) => { actions.filterClientRequestsByStatus('Concluído', event.currentTarget) }} {...activeClass("btn btn-sm btn-secondary filter-status-btn", "status", "Concluído")}>Concluídas</button>
                    <button className="btn btn-sm btn-secondary filter-status-btn" data-status="Cancelado" onClick={(event) => { actions.filterClientRequestsByStatus('Cancelado', event.currentTarget) }} {...activeClass("btn btn-sm btn-secondary filter-status-btn", "status", "Cancelado")}>Canceladas</button>
                </div>

                
                <div id="clientRequestsGrid" className="grid-cards" {...elementProps("clientRequestsGrid", {})}>{slots.clientRequestsGrid}</div>
            </section>);
}
