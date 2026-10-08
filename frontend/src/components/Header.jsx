import { useApp } from '../context';
import { Icon, Modal } from '../components/common';

export default function Header() {
const { actions, field, slots, elementProps, activeClass, busy, recovery } = useApp();
return (<header className="header">
        <div className="header-main">
            <div className="container">
                <a href="#" className="logo" onClick={(event) => { actions.navigateTo('explore'); event.preventDefault(); }}>
                    <div className="logo-icon" id="headerLogoIcon">
                        <img className="logo-image" src={`${import.meta.env.BASE_URL}assets/icons/logo.svg`} alt="" width="36" height="36" />
                    </div>
                    <span >TresDê</span>
                </a>

                <form className="header-search" role="search" onSubmit={(event) => { event.preventDefault(); actions.searchMarketplace() }}>
                    <label className="sr-only" htmlFor="marketSearch">Buscar pedidos e prestadores</label>
                    <input id="marketSearch" type="search" placeholder="o que você quer criar hoje?" autoComplete="off" {...field("marketSearch", "search")} {...elementProps("marketSearch", {})} />
                    <button type="submit" aria-label="Buscar" disabled={busy}><span id="headerSearchIcon" {...elementProps("headerSearchIcon", {})}><Icon name="search" /></span></button>
                </form>
                
                <nav aria-label="Menu principal">
                    <ul className="nav-links" id="mainNavLinks" {...elementProps("mainNavLinks", {})}>
                        <li >
                            <button className="nav-btn active" data-view="explore" onClick={(event) => { actions.navigateTo('explore') }} {...activeClass("nav-btn active", "view", "explore")}>
                                <span className="nav-icon" id="navIconExplore" {...elementProps("navIconExplore", {})}><Icon name="search" /></span>
                                <span className="nav-label">explorar</span>
                                <span className="nav-tooltip">Explorar Pedidos</span>
                            </button>
                        </li>
                        <li >
                            <button className="nav-btn" data-view="client-requests" onClick={(event) => { actions.navigateTo('client-requests') }} {...activeClass("nav-btn", "view", "client-requests")}>
                                <span className="nav-icon" id="navIconClient" {...elementProps("navIconClient", {})}><Icon name="box" /></span>
                                <span className="nav-label">meus pedidos</span>
                                <span className="nav-tooltip">Minhas Requisições</span>
                            </button>
                        </li>
                        <li >
                            <button className="nav-btn" data-view="seller-panel" onClick={(event) => { actions.navigateTo('seller-panel') }} {...activeClass("nav-btn", "view", "seller-panel")}>
                                <span className="nav-icon" id="navIconSeller" {...elementProps("navIconSeller", {})}><Icon name="tools" /></span>
                                <span className="nav-label">meu ateliê</span>
                                <span className="nav-tooltip">Painel do Prestador</span>
                            </button>
                        </li>
                        <li >
                            <button className="nav-btn" data-view="in-progress" onClick={(event) => { actions.navigateTo('in-progress') }} {...activeClass("nav-btn", "view", "in-progress")}>
                                <span className="nav-icon" id="navIconProgress" {...elementProps("navIconProgress", {})}><Icon name="activity" /></span>
                                <span className="nav-label">Em Andamento (<span id="inProgressCount" {...elementProps("inProgressCount", {})}>{slots.inProgressCount}</span>)</span>
                                <span className="nav-tooltip">Em Andamento & Produção</span>
                            </button>
                        </li>
                        <li >
                            <button className="nav-btn" data-view="profile" onClick={(event) => { actions.navigateTo('profile') }} {...activeClass("nav-btn", "view", "profile")}>
                                <span className="nav-icon" id="navIconProfile" {...elementProps("navIconProfile", {})}><Icon name="user" /></span>
                                <span className="nav-label">Meu Perfil</span>
                                <span className="nav-tooltip">Meu Perfil</span>
                            </button>
                        </li>
                    </ul>
                </nav>

                
                <div className="header-actions">
                    
                    <div className="notif-wrapper">
                        <button className="notif-bell-btn" id="notifBellBtn" onClick={(event) => { actions.toggleNotifDropdown() }} title="Notificações" {...elementProps("notifBellBtn", {})}>
                            <span id="headerBellIcon" {...elementProps("headerBellIcon", {})}><Icon name="bell" /></span>
                            <span className="notif-badge" id="notifCountBadge" style={{"display": "none"}} {...elementProps("notifCountBadge", {"display": "none"})}>{slots.notifCountBadge}</span>
                        </button>
                        <div className="notif-dropdown" id="notifDropdown" {...elementProps("notifDropdown", {})}>
                            <div className="notif-header">
                                <span >Notificações</span>
                                <button className="btn btn-secondary btn-sm" onClick={(event) => { actions.markAllNotificationsRead() }}>Marcar lidas</button>
                            </div>
                            <div className="notif-list" id="notifListContainer" {...elementProps("notifListContainer", {})}>{slots.notifListContainer}</div>
                        </div>
                    </div>

                    
                    <button className="btn btn-primary btn-sm" onClick={(event) => { actions.openNewRequestModal() }}>
                        <span id="headerPlusIcon" {...elementProps("headerPlusIcon", {})}><Icon name="plus" /></span>
                        <span >quero criar</span>
                    </button>

                    
                    <div id="userHeaderArea" {...elementProps("userHeaderArea", {})}>{slots.userHeaderArea}</div>
                </div>
            </div>
        </div>
    </header>);
}
