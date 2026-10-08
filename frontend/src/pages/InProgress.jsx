import { useApp } from '../context';
import { Icon, Modal } from '../components/common';

export default function InProgress() {
const { actions, field, slots, elementProps, activeClass, busy, recovery } = useApp();
return (<section id="view-in-progress" className="view-section" {...elementProps("view-in-progress", {})}>
                <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "marginBottom": "20px"}}>
                    <div >
                        <h1 style={{"fontSize": "22px", "fontWeight": "800"}}>Acompanhamento de Produção & Chat</h1>
                        <p style={{"color": "var(--text-secondary)", "fontSize": "13.5px"}}>Monitore o avanço do trabalho, comunique-se via chat dedicado e efetue pagamentos ou avaliações.</p>
                    </div>
                </div>

                <div id="inProgressListContainer" {...elementProps("inProgressListContainer", {})}>{slots.inProgressListContainer}</div>
            </section>);
}
