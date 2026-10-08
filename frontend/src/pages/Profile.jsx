import { useApp } from '../context';
import { Icon, Modal } from '../components/common';

export default function Profile() {
const { actions, field, slots, elementProps, activeClass, busy, recovery } = useApp();
return (<section id="view-profile" className="view-section" {...elementProps("view-profile", {})}>
                <div className="card" style={{"marginBottom": "24px"}}>
                    <div className="profile-banner-wrapper" id="profileBannerDisplay" {...elementProps("profileBannerDisplay", {})}>
                        <img alt="Avatar" className="profile-avatar-large" id="profileAvatarDisplay" {...elementProps("profileAvatarDisplay", {})} />
                    </div>
                    <div className="profile-info-header">
                        <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "flex-start", "flexWrap": "wrap", "gap": "15px"}}>
                            <div >
                                <h1 style={{"fontSize": "22px", "fontWeight": "800"}} id="profileDisplayName" {...elementProps("profileDisplayName", {"fontSize": "22px", "fontWeight": "800"})}>{slots.profileDisplayName}</h1>
                                <p style={{"color": "var(--text-secondary)", "fontSize": "13.5px"}} id="profileDisplayEmail" {...elementProps("profileDisplayEmail", {"color": "var(--text-secondary)", "fontSize": "13.5px"})}>{slots.profileDisplayEmail}</p>
                                <div style={{"display": "flex", "gap": "8px", "marginTop": "8px", "alignItems": "center"}} id="profileBadgesArea" {...elementProps("profileBadgesArea", {"display": "flex", "gap": "8px", "marginTop": "8px", "alignItems": "center"})}>{slots.profileBadgesArea}</div>
                            </div>
                            <div className="profile-actions" style={{"display": "flex", "gap": "10px"}}>
                                <button className="btn btn-secondary" onClick={(event) => { actions.openEditProfileModal() }}>
                                    <span className="btn-icon" id="profileBtnEdit" {...elementProps("profileBtnEdit", {})}><Icon name="edit" /></span>
                                    <span >Editar Dados Cadastrais</span>
                                </button>
                                <button className="btn btn-accent" id="btnSellerUpgradeProfile" onClick={(event) => { actions.openSellerUpgradeModal() }} {...elementProps("btnSellerUpgradeProfile", {})}>
                                    <span className="btn-icon" id="profileBtnUpgrade" {...elementProps("profileBtnUpgrade", {})}><Icon name="tools" /></span>
                                    <span >Dados de Vendedor</span>
                                </button>
                            </div>
                        </div>

                        
                        <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(220px, 1fr))", "gap": "16px", "marginTop": "20px"}}>
                            <div style={{"background": "#f8fafc", "border": "1px solid var(--border-color)", "borderRadius": "var(--radius-md)", "padding": "14px"}}>
                                <div style={{"fontSize": "11.5px", "color": "var(--text-muted)", "fontWeight": "700", "textTransform": "uppercase"}}>Reputação como Cliente</div>
                                <div style={{"display": "flex", "alignItems": "center", "gap": "8px", "marginTop": "6px"}}>
                                    <span style={{"fontSize": "22px", "fontWeight": "800", "color": "var(--text-primary)"}} id="clientRatingValue" {...elementProps("clientRatingValue", {"fontSize": "22px", "fontWeight": "800", "color": "var(--text-primary)"})}>{slots.clientRatingValue}</span>
                                    <div id="clientRatingStars" {...elementProps("clientRatingStars", {})}>{slots.clientRatingStars}</div>
                                    <span style={{"fontSize": "12px", "color": "var(--text-muted)"}} id="clientRatingCount" {...elementProps("clientRatingCount", {"fontSize": "12px", "color": "var(--text-muted)"})}>{slots.clientRatingCount}</span>
                                </div>
                            </div>
                            <div id="sellerReputationBox" style={{"background": "#f8fafc", "border": "1px solid var(--border-color)", "borderRadius": "var(--radius-md)", "padding": "14px", "display": "none"}} {...elementProps("sellerReputationBox", {"background": "#f8fafc", "border": "1px solid var(--border-color)", "borderRadius": "var(--radius-md)", "padding": "14px", "display": "none"})}>
                                <div style={{"fontSize": "11.5px", "color": "var(--text-muted)", "fontWeight": "700", "textTransform": "uppercase"}}>Reputação como Prestador</div>
                                <div style={{"display": "flex", "alignItems": "center", "gap": "8px", "marginTop": "6px"}}>
                                    <span style={{"fontSize": "22px", "fontWeight": "800", "color": "var(--text-primary)"}} id="sellerRatingValue" {...elementProps("sellerRatingValue", {"fontSize": "22px", "fontWeight": "800", "color": "var(--text-primary)"})}>{slots.sellerRatingValue}</span>
                                    <div id="sellerRatingStars" {...elementProps("sellerRatingStars", {})}>{slots.sellerRatingStars}</div>
                                    <span style={{"fontSize": "12px", "color": "var(--text-muted)"}} id="sellerRatingCount" {...elementProps("sellerRatingCount", {"fontSize": "12px", "color": "var(--text-muted)"})}>{slots.sellerRatingCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div className="card-body">
                        <h3 style={{"fontSize": "15px", "marginBottom": "12px", "borderBottom": "1px solid #f1f5f9", "paddingBottom": "8px"}}>Dados Pessoais e Endereço</h3>
                        <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(240px, 1fr))", "gap": "16px", "fontSize": "13.5px"}}>
                            <div ><strong >CPF:</strong> <span id="profileDisplayCPF" {...elementProps("profileDisplayCPF", {})}>{slots.profileDisplayCPF}</span></div>
                            <div ><strong >Data de Nascimento:</strong> <span id="profileDisplayBirth" {...elementProps("profileDisplayBirth", {})}>{slots.profileDisplayBirth}</span></div>
                            <div ><strong >Telefone:</strong> <span id="profileDisplayPhone" {...elementProps("profileDisplayPhone", {})}>{slots.profileDisplayPhone}</span></div>
                            <div ><strong >Gênero:</strong> <span id="profileDisplayGender" {...elementProps("profileDisplayGender", {})}>{slots.profileDisplayGender}</span></div><div ><strong >Preferências:</strong> <span id="profileDisplayPreferences" {...elementProps("profileDisplayPreferences", {})}>{slots.profileDisplayPreferences}</span></div>
                            <div ><strong >CEP:</strong> <span id="profileDisplayCEP" {...elementProps("profileDisplayCEP", {})}>{slots.profileDisplayCEP}</span></div>
                            <div ><strong >Endereço Completo:</strong> <span id="profileDisplayAddress" {...elementProps("profileDisplayAddress", {})}>{slots.profileDisplayAddress}</span></div>
                        </div>

                        
                        <div id="profileSellerDetailsArea" style={{"marginTop": "24px", "display": "none"}} {...elementProps("profileSellerDetailsArea", {"marginTop": "24px", "display": "none"})}>
                            <h3 style={{"fontSize": "15px", "marginBottom": "12px", "borderBottom": "1px solid #f1f5f9", "paddingBottom": "8px", "color": "var(--accent-dark)"}}>
                                Credenciais e Qualificações Profissionais
                            </h3>
                            <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(240px, 1fr))", "gap": "16px", "fontSize": "13.5px", "marginBottom": "14px"}}>
                                <div ><strong >Razão Social / Nome Comercial:</strong> <span id="profileDisplayBusinessName" {...elementProps("profileDisplayBusinessName", {})}>{slots.profileDisplayBusinessName}</span></div>
                                <div ><strong >CNPJ:</strong> <span id="profileDisplayCNPJ" {...elementProps("profileDisplayCNPJ", {})}>{slots.profileDisplayCNPJ}</span></div>
                                <div style={{"gridColumn": "1 / -1"}}><strong >Verificação / Certificações:</strong> <span id="profileDisplayVerification" {...elementProps("profileDisplayVerification", {})}>{slots.profileDisplayVerification}</span></div>
                                <div style={{"gridColumn": "1 / -1"}}><strong >Áreas de Atuação:</strong> <span id="profileDisplayCategories" {...elementProps("profileDisplayCategories", {})}>{slots.profileDisplayCategories}</span></div>
                                <div style={{"gridColumn": "1 / -1"}}><strong >Habilidades e Equipamentos:</strong> <span id="profileDisplaySkills" {...elementProps("profileDisplaySkills", {})}>{slots.profileDisplaySkills}</span></div>
                            </div>
                        </div>

                        
                        <div style={{"marginTop": "24px"}}>
                            <h3 style={{"fontSize": "15px", "marginBottom": "12px", "borderBottom": "1px solid #f1f5f9", "paddingBottom": "8px"}}>Avaliações e Comentários Recebidos</h3>
                            <div id="profileReviewsList" style={{"display": "flex", "flexDirection": "column", "gap": "10px"}} {...elementProps("profileReviewsList", {"display": "flex", "flexDirection": "column", "gap": "10px"})}>{slots.profileReviewsList}</div>
                        </div>
                    </div>
                </div>
            </section>);
}
