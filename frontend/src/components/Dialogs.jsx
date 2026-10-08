import { useApp } from '../context';
import { Icon, Modal } from '../components/common';

export default function Dialogs() {
const { actions, field, slots, elementProps, activeClass, busy, recovery, payMethod } = useApp();
return (<> <Modal id="modalMaker"><div className="modal-box modal-lg"><div className="modal-header"><h2 className="modal-title">Conheça o prestador</h2><button className="modal-close-btn" aria-label="Fechar perfil" onClick={(event) => { actions.closeModal('modalMaker') }}>×</button></div><div className="modal-body" id="makerProfileContent" {...elementProps("makerProfileContent", {})}>{slots.makerProfileContent}</div><div className="modal-footer"><button className="btn btn-primary" onClick={(event) => { actions.closeModal('modalMaker'); actions.openNewRequestModal() }}>publicar minha ideia</button></div></div></Modal><Modal id="modalAuth">
        <div className="modal-box">
            <div className="modal-header">
                <h2 className="modal-title" id="authModalTitle" {...elementProps("authModalTitle", {})}>{slots.authModalTitle}</h2>
                <button className="modal-close-btn" onClick={(event) => { actions.closeModal('modalAuth') }}><span id="authCloseIcon" {...elementProps("authCloseIcon", {})}><Icon name="x" /></span></button>
            </div>
            <div className="modal-body">
                <div style={{"display": "flex", "gap": "8px", "marginBottom": "20px", "borderBottom": "1px solid var(--border-color)", "paddingBottom": "10px"}}>
                    <button className="btn btn-sm btn-secondary auth-tab-btn active" id="btnTabLogin" onClick={(event) => { actions.switchAuthTab('login') }} {...elementProps("btnTabLogin", {})}>Entrar</button>
                    <button className="btn btn-sm btn-secondary auth-tab-btn" id="btnTabRegister" onClick={(event) => { actions.switchAuthTab('register') }} {...elementProps("btnTabRegister", {})}>Novo Cadastro</button>
                    <button className="btn btn-sm btn-secondary auth-tab-btn" id="btnTabForgot" onClick={(event) => { actions.switchAuthTab('forgot') }} {...elementProps("btnTabForgot", {})}>Recuperar Senha</button>
                </div>

                
                <form id="formLogin" onSubmit={(event) => { actions.handleLogin(event) }} {...elementProps("formLogin", {})}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="loginEmail">E-mail: <span className="required">*</span></label>
                        <input type="email" id="loginEmail" className="form-input" placeholder="seu@email.com" required {...field("loginEmail", "email")} {...elementProps("loginEmail", {})} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="loginPassword">Senha: <span className="required">*</span></label>
                        <input type="password" id="loginPassword" className="form-input" placeholder="••••••••" required {...field("loginPassword", "password")} {...elementProps("loginPassword", {})} />
                    </div>
                    <div className="modal-footer" style={{"padding": "16px 0 0", "background": "none"}}>
                        <button type="submit" className="btn btn-primary" style={{"width": "100%"}} disabled={busy}>Entrar na Conta</button>
                    </div>
                </form>

                
                <form id="formRegister" style={{"display": "none"}} onSubmit={(event) => { actions.handleRegister(event) }} {...elementProps("formRegister", {"display": "none"})}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="regName">Nome Completo: <span className="required">*</span></label>
                        <input type="text" id="regName" className="form-input" placeholder="Ex: Lucas Ferreira Silva" required {...field("regName", "text")} {...elementProps("regName", {})} />
                        <div className="input-feedback" id="regNameFeedback" {...elementProps("regNameFeedback", {})}></div>
                    </div>
                    <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "12px"}}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="regCPF">CPF: <span className="required">*</span></label>
                            <input type="text" id="regCPF" className="form-input" placeholder="000.000.000-00" maxLength="14" required {...field("regCPF", "text")} {...elementProps("regCPF", {})} />
                            <div className="input-feedback" id="regCPFFeedback" {...elementProps("regCPFFeedback", {})}></div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="regBirth">Data de Nascimento: <span className="required">*</span></label>
                            <input type="date" id="regBirth" className="form-input" required {...field("regBirth", "date")} {...elementProps("regBirth", {})} />
                            <div className="input-feedback" id="regBirthFeedback" {...elementProps("regBirthFeedback", {})}></div>
                        </div>
                    </div>
                    <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "12px"}}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="regCEP">CEP: <span className="required">*</span> (Busca ViaCEP)</label>
                            <input type="text" id="regCEP" className="form-input" placeholder="00000-000" maxLength="9" onBlur={(event) => { actions.fetchAddressByCEP(event.currentTarget.value, 'reg') }} required {...field("regCEP", "text")} {...elementProps("regCEP", {})} />
                            <div className="input-feedback" id="regCEPFeedback" {...elementProps("regCEPFeedback", {})}></div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="regPhone">Telefone (opcional):</label>
                            <input type="text" id="regPhone" className="form-input" placeholder="(00) 00000-0000" maxLength="15" {...field("regPhone", "text")} {...elementProps("regPhone", {})} />
                        </div>
                    </div>

                    <div style={{"display": "grid", "gridTemplateColumns": "2fr 1fr", "gap": "12px"}}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="regAddressCity">Cidade / UF:</label>
                            <input type="text" id="regAddressCity" className="form-input" placeholder="Consulta automática via CEP" readOnly {...field("regAddressCity", "text")} {...elementProps("regAddressCity", {})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="regAddressDistrict">Bairro:</label>
                            <input type="text" id="regAddressDistrict" className="form-input" placeholder="Bairro" readOnly {...field("regAddressDistrict", "text")} {...elementProps("regAddressDistrict", {})} />
                        </div>
                    </div>

                    <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "12px"}}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="regEmail">E-mail: <span className="required">*</span></label>
                            <input type="email" id="regEmail" className="form-input" placeholder="nome@email.com" required {...field("regEmail", "email")} {...elementProps("regEmail", {})} />
                            <div className="input-feedback" id="regEmailFeedback" {...elementProps("regEmailFeedback", {})}></div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="regGender">Gênero:</label>
                            <select id="regGender" className="form-select" {...field("regGender", "text")} {...elementProps("regGender", {})}>
                                <option value="Não informado">Não informado</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Masculino">Masculino</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="regPassword">Senha: <span className="required">*</span> (Alfanumérica, sem espaços, pelo menos 8 caracteres)</label>
                        <input type="password" id="regPassword" className="form-input" placeholder="Ex: senha123" required {...field("regPassword", "password")} {...elementProps("regPassword", {})} />
                        <div className="input-feedback" id="regPasswordFeedback" {...elementProps("regPasswordFeedback", {})}></div>
                    </div>

                    <div style={{"background": "#f8fafc", "border": "1px dashed var(--border-color)", "borderRadius": "var(--radius-md)", "padding": "12px", "marginBottom": "16px"}}>
                        <label style={{"display": "flex", "alignItems": "center", "gap": "8px", "fontWeight": "600", "cursor": "pointer", "fontSize": "13px"}}>
                            <input type="checkbox" id="regIsSeller" {...field("regIsSeller", "checkbox")} {...elementProps("regIsSeller", {})} />
                            Também quero cadastrar dados de Prestador/Vendedor agora
                        </label>
                    </div>

                    <div id="regSellerExtraFields" style={{"display": "none", "paddingTop": "10px", "borderTop": "1px solid var(--border-color)"}} {...elementProps("regSellerExtraFields", {"display": "none", "paddingTop": "10px", "borderTop": "1px solid var(--border-color)"})}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="regSellerBusiness">Razão Social ou Nome Fantasia:</label>
                            <input type="text" id="regSellerBusiness" className="form-input" placeholder="Ex: Oficina 3D Prototipagem ME" {...field("regSellerBusiness", "text")} {...elementProps("regSellerBusiness", {})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="regSellerCNPJ">CNPJ (Opcional):</label>
                            <input type="text" id="regSellerCNPJ" className="form-input" placeholder="00.000.000/0000-00" maxLength="18" {...field("regSellerCNPJ", "text")} {...elementProps("regSellerCNPJ", {})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="regSellerCategories">Área de Atuação:</label>
                            <input type="text" id="regSellerCategories" className="form-input" placeholder="Ex: Impressão 3D, Prototipagem, Pintura Manual" {...field("regSellerCategories", "text")} {...elementProps("regSellerCategories", {})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="regSellerSkills">Habilidades e Qualificações:</label>
                            <textarea id="regSellerSkills" className="form-textarea" placeholder="Descreva equipamentos, materiais e pós-processamento que domina..." {...field("regSellerSkills", "text")} {...elementProps("regSellerSkills", {})}></textarea>
                        </div>
                    </div>

                    <div className="modal-footer" style={{"padding": "16px 0 0", "background": "none"}}>
                        <button type="submit" className="btn btn-primary" style={{"width": "100%"}} disabled={busy}>Concluir Cadastro</button>
                    </div>
                </form>

                
                <form id="formForgot" style={{"display": "none"}} onSubmit={(event) => { actions.handleForgotPassword(event) }} {...elementProps("formForgot", {"display": "none"})}><p>Informe o e-mail cadastrado para receber o link de recuperação.</p><div className="form-group"><label className="form-label" htmlFor="forgotEmail">E-mail cadastrado:</label><input disabled={recovery} id="forgotEmail" type="email" className="form-input" required {...field('forgotEmail')} /></div>{recovery && <div className="form-group"><label className="form-label" htmlFor="forgotNewPassword">Nova senha:</label><input id="forgotNewPassword" type="password" className="form-input" minLength={8} required {...field('forgotNewPassword')} /></div>}<div className="modal-footer"><button className="btn btn-primary" type="submit" disabled={busy}>{recovery ? 'Salvar nova senha' : 'Enviar link de recuperação'}</button></div></form>
            </div>
        </div>
    </Modal><Modal id="modalRequest">
        <div className="modal-box modal-lg">
            <div className="modal-header">
                <h2 className="modal-title" id="requestModalTitle" {...elementProps("requestModalTitle", {})}>Publicar Requisição de Trabalho</h2>
                <button className="modal-close-btn" onClick={(event) => { actions.closeModal('modalRequest') }}><span id="reqCloseIcon" {...elementProps("reqCloseIcon", {})}><Icon name="x" /></span></button>
            </div>
            <form id="formRequest" onSubmit={(event) => { actions.handlePreSubmitRequest(event) }} {...elementProps("formRequest", {})}>
                <input type="hidden" id="requestId" {...field("requestId", "hidden")} {...elementProps("requestId", {})} />
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label" htmlFor="reqTitle">Título da Peça ou Projeto: <span className="required">*</span></label>
                        <input type="text" id="reqTitle" className="form-input" placeholder="Ex: Suporte para Fone de Ouvido com Calha de Cabo" required {...field("reqTitle", "text")} {...elementProps("reqTitle", {})} />
                    </div>
                    <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "14px"}}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reqCategory">Categoria: <span className="required">*</span></label>
                            <select id="reqCategory" className="form-select" required {...field("reqCategory", "text")} {...elementProps("reqCategory", {})}>
                                <option value="Impressão 3D">Impressão 3D</option>
                                <option value="Impressão 3D e Pintura">Impressão 3D e Pintura</option>
                                <option value="Artesanato">Artesanato</option>
                                <option value="Personalização">Personalização</option>
                                <option value="Prototipagem Rápida">Prototipagem Rápida</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reqBudget">Orçamento Estimado (R$): <span className="required">*</span></label>
                            <input type="number" id="reqBudget" className="form-input" min="0" step="0.01" placeholder="Ex: 120.00" required {...field("reqBudget", "number")} {...elementProps("reqBudget", {})} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reqDeadline">Prazo Desejado (deve ser posterior à data atual): <span className="required">*</span></label>
                        <input type="date" id="reqDeadline" className="form-input" required {...field("reqDeadline", "date")} {...elementProps("reqDeadline", {})} />
                        <div className="input-feedback" id="reqDeadlineFeedback" {...elementProps("reqDeadlineFeedback", {})}></div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reqDescription">Descrição Detalhada da Peça / Requisitos: <span className="required">*</span> (máx. 1000 caracteres)</label>
                        <textarea id="reqDescription" className="form-textarea" rows="4" maxLength="1000" placeholder="Descreva dimensões, tipo de material (PLA, Resina, Madeira), cor, acabamento e finalidade da peça..." required {...field("reqDescription", "text")} {...elementProps("reqDescription", {})}></textarea>
                        <span className="char-counter" id="reqDescCounter" {...elementProps("reqDescCounter", {})}>{slots.reqDescCounter}</span>
                    </div>

                    
                    <div className="form-group">
                        <label className="form-label">Anexos de Referência (Arquivos 3D .STL, Imagens ou Documentos):</label>
                        <input type="file" id="reqFileInput" multiple accept=".stl,.obj,.png,.jpg,.jpeg,.webp,.pdf" style={{"display": "none"}} onChange={(event) => { actions.handleFileSelection(event) }} {...elementProps("reqFileInput", {"display": "none"})} />
                        
                        <div style={{"display": "flex", "gap": "10px", "marginBottom": "10px", "flexWrap": "wrap"}}>
                            <button type="button" className="btn btn-secondary" onClick={(event) => { actions.chooseRequestFile() }}>
                                <span className="btn-icon" id="reqBtnChooseFile" {...elementProps("reqBtnChooseFile", {})}><Icon name="file" /></span>
                                <span >Selecionar Arquivo...</span>
                            </button>
                            <input type="text" id="reqAttachmentName" className="form-input" style={{"flex": "1", "minWidth": "200px"}} placeholder="Ou cole aqui a URL/nome do arquivo de referência..." {...field("reqAttachmentName", "text")} {...elementProps("reqAttachmentName", {"flex": "1", "minWidth": "200px"})} />
                            <button type="button" className="btn btn-secondary" id="btnAttachFile" onClick={(event) => { actions.addAttachmentToRequest() }} {...elementProps("btnAttachFile", {})}>
                                <span className="btn-icon" id="reqBtnAttach" {...elementProps("reqBtnAttach", {})}><Icon name="paperclip" /></span>
                                <span >Anexar</span>
                            </button>
                        </div>

                        
                        <div id="reqAttachmentsList" style={{"display": "flex", "flexDirection": "column", "gap": "8px"}} {...elementProps("reqAttachmentsList", {"display": "flex", "flexDirection": "column", "gap": "8px"})}>{slots.reqAttachmentsList}</div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={(event) => { actions.closeModal('modalRequest') }}>Cancelar</button>
                    
                    <button type="submit" className="btn btn-primary" id="btnSubmitRequest" {...elementProps("btnSubmitRequest", {})} disabled={busy}>
                        <span className="btn-icon" id="reqBtnSubmitIcon" {...elementProps("reqBtnSubmitIcon", {})}><Icon name="check" /></span>
                        <span >Avançar para Confirmação</span>
                    </button>
                </div>
            </form>
        </div>
    </Modal><Modal id="modalConfirmRequest">
        <div className="modal-box">
            <div className="modal-header">
                <h2 className="modal-title">Confirmar Envio da Requisição</h2>
                <button className="modal-close-btn" onClick={(event) => { actions.closeModal('modalConfirmRequest') }}><span id="confirmCloseIcon" {...elementProps("confirmCloseIcon", {})}><Icon name="x" /></span></button>
            </div>
            <div className="modal-body">
                <p style={{"fontSize": "13.5px", "color": "var(--text-secondary)", "marginBottom": "16px"}}>
                    Revise os dados abaixo antes de publicar seu pedido no mural para os prestadores:
                </p>

                <div className="confirm-summary-box">
                    <div className="confirm-summary-item">
                        <strong style={{"color": "var(--text-muted)", "fontSize": "12px", "textTransform": "uppercase"}}>Título do Projeto:</strong>
                        <span id="confirmTitle" style={{"fontWeight": "700", "textAlign": "right"}} {...elementProps("confirmTitle", {"fontWeight": "700", "textAlign": "right"})}>{slots.confirmTitle}</span>
                    </div>
                    <div className="confirm-summary-item">
                        <strong style={{"color": "var(--text-muted)", "fontSize": "12px", "textTransform": "uppercase"}}>Categoria:</strong>
                        <span id="confirmCategory" className="badge badge-primary" {...elementProps("confirmCategory", {})}>{slots.confirmCategory}</span>
                    </div>
                    <div className="confirm-summary-item">
                        <strong style={{"color": "var(--text-muted)", "fontSize": "12px", "textTransform": "uppercase"}}>Orçamento Estimado:</strong>
                        <span id="confirmBudget" style={{"fontWeight": "800", "color": "var(--primary)"}} {...elementProps("confirmBudget", {"fontWeight": "800", "color": "var(--primary)"})}>{slots.confirmBudget}</span>
                    </div>
                    <div className="confirm-summary-item">
                        <strong style={{"color": "var(--text-muted)", "fontSize": "12px", "textTransform": "uppercase"}}>Prazo Desejado:</strong>
                        <span id="confirmDeadline" {...elementProps("confirmDeadline", {})}>{slots.confirmDeadline}</span>
                    </div>
                    <div style={{"paddingTop": "8px"}}>
                        <strong style={{"color": "var(--text-muted)", "fontSize": "12px", "textTransform": "uppercase", "display": "block", "marginBottom": "4px"}}>Descrição:</strong>
                        <p id="confirmDescription" style={{"fontSize": "13px", "color": "var(--text-secondary)", "lineHeight": "1.4", "background": "#ffffff", "padding": "8px 12px", "borderRadius": "var(--radius-sm)", "border": "1px solid var(--border-color)"}} {...elementProps("confirmDescription", {"fontSize": "13px", "color": "var(--text-secondary)", "lineHeight": "1.4", "background": "#ffffff", "padding": "8px 12px", "borderRadius": "var(--radius-sm)", "border": "1px solid var(--border-color)"})}>{slots.confirmDescription}</p>
                    </div>
                    <div style={{"paddingTop": "6px"}}>
                        <strong style={{"color": "var(--text-muted)", "fontSize": "12px", "textTransform": "uppercase", "display": "block", "marginBottom": "4px"}}>Arquivos Anexados:</strong>
                        <div id="confirmAttachmentsSummary" style={{"display": "flex", "flexDirection": "column", "gap": "4px"}} {...elementProps("confirmAttachmentsSummary", {"display": "flex", "flexDirection": "column", "gap": "4px"})}>{slots.confirmAttachmentsSummary}</div>
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={(event) => { actions.closeModal('modalConfirmRequest'); actions.openModal('modalRequest'); }}>
                    Voltar e Ajustar
                </button>
                <button type="button" className="btn btn-success" id="btnConfirmAndPublish" onClick={(event) => { actions.executePublishRequest() }} {...elementProps("btnConfirmAndPublish", {})}>
                    <span className="btn-icon" id="confirmCheckIcon" {...elementProps("confirmCheckIcon", {})}><Icon name="check" /></span>
                    <span >Confirmar e Publicar Requisição</span>
                </button>
            </div>
        </div>
    </Modal><Modal id="modalOffersCompare">
        <div className="modal-box modal-lg">
            <div className="modal-header">
                <div >
                    <h2 className="modal-title">Comparar Propostas Recebidas</h2>
                    <p style={{"fontSize": "13px", "color": "var(--text-secondary)"}} id="compareModalSub" {...elementProps("compareModalSub", {"fontSize": "13px", "color": "var(--text-secondary)"})}>{slots.compareModalSub}</p>
                </div>
                <button className="modal-close-btn" onClick={(event) => { actions.closeModal('modalOffersCompare') }}><span id="compareCloseIcon" {...elementProps("compareCloseIcon", {})}><Icon name="x" /></span></button>
            </div>
            <div className="modal-body">
                <div id="compareOffersContainer" style={{"display": "flex", "flexDirection": "column", "gap": "16px"}} {...elementProps("compareOffersContainer", {"display": "flex", "flexDirection": "column", "gap": "16px"})}>{slots.compareOffersContainer}</div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={(event) => { actions.closeModal('modalOffersCompare') }}>Fechar</button>
            </div>
        </div>
    </Modal><Modal id="modalOfferSend">
        <div className="modal-box">
            <div className="modal-header">
                <h2 className="modal-title" id="offerModalTitle" {...elementProps("offerModalTitle", {})}>Enviar Oferta / Orçamento</h2>
                <button className="modal-close-btn" onClick={(event) => { actions.closeModal('modalOfferSend') }}><span id="offerCloseIcon" {...elementProps("offerCloseIcon", {})}><Icon name="x" /></span></button>
            </div>
            <form id="formOffer" onSubmit={(event) => { actions.handleSaveOffer(event) }} {...elementProps("formOffer", {})}>
                <input type="hidden" id="offerId" {...field("offerId", "hidden")} {...elementProps("offerId", {})} />
                <input type="hidden" id="offerRequestId" {...field("offerRequestId", "hidden")} {...elementProps("offerRequestId", {})} />
                <div className="modal-body">
                    <div style={{"background": "#f8fafc", "borderRadius": "var(--radius-md)", "padding": "12px", "marginBottom": "16px", "border": "1px solid var(--border-color)"}}>
                        <strong id="offerReqTitle" {...elementProps("offerReqTitle", {})}>{slots.offerReqTitle}</strong>
                        <div style={{"fontSize": "13px", "color": "var(--text-secondary)", "marginTop": "4px"}} id="offerReqSummary" {...elementProps("offerReqSummary", {"fontSize": "13px", "color": "var(--text-secondary)", "marginTop": "4px"})}>{slots.offerReqSummary}</div>
                    </div>
                    <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "14px"}}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="offerPrice">Preço Ofertado (R$): <span className="required">*</span></label>
                            <input type="number" id="offerPrice" className="form-input" min="0" step="0.01" placeholder="Ex: 95.00" required {...field("offerPrice", "number")} {...elementProps("offerPrice", {})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="offerDeadline">Prazo de Entrega: <span className="required">*</span></label>
                            <input type="date" id="offerDeadline" className="form-input" required {...field("offerDeadline", "date")} {...elementProps("offerDeadline", {})} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="offerNotes">Observações / Detalhes Técnicos da Proposta: <span className="required">*</span></label>
                        <textarea id="offerNotes" className="form-textarea" rows="3" placeholder="Especifique o material, tipo de preenchimento, acabamento e condições..." required {...field("offerNotes", "text")} {...elementProps("offerNotes", {})}></textarea>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={(event) => { actions.closeModal('modalOfferSend') }}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" id="btnSubmitOffer" {...elementProps("btnSubmitOffer", {})} disabled={busy}>Enviar Oferta</button>
                </div>
            </form>
        </div>
    </Modal><Modal id="modalCancelRequest">
        <div className="modal-box">
            <div className="modal-header">
                <h2 className="modal-title">Cancelar Requisição</h2>
                <button className="modal-close-btn" onClick={(event) => { actions.closeModal('modalCancelRequest') }}><span id="cancelCloseIcon" {...elementProps("cancelCloseIcon", {})}><Icon name="x" /></span></button>
            </div>
            <form id="formCancelRequest" onSubmit={(event) => { actions.handleConfirmCancelRequest(event) }} {...elementProps("formCancelRequest", {})}>
                <input type="hidden" id="cancelRequestId" {...field("cancelRequestId", "hidden")} {...elementProps("cancelRequestId", {})} />
                <div className="modal-body">
                    <p style={{"fontSize": "13.5px", "color": "var(--text-secondary)", "marginBottom": "14px"}}>
                        Tem certeza que deseja cancelar esta requisição? O cancelamento é permitido antes do aceite e, após o aceite, até o fim da etapa Em Produção. A justificativa será enviada aos envolvidos.
                    </p>
                    <div className="form-group">
                        <label className="form-label" htmlFor="cancelReason">Justificativa do Cancelamento: <span className="required">*</span></label>
                        <textarea id="cancelReason" className="form-textarea" rows="3" placeholder="Explique o motivo do cancelamento..." required {...field("cancelReason", "text")} {...elementProps("cancelReason", {})}></textarea>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={(event) => { actions.closeModal('modalCancelRequest') }}>Voltar</button>
                    <button type="submit" className="btn btn-danger" disabled={busy}>Confirmar Cancelamento</button>
                </div>
            </form>
        </div>
    </Modal><Modal id="modalPayment">
        <div className="modal-box">
            <div className="modal-header">
                <h2 className="modal-title">Simulação de Pagamento Seguro</h2>
                <button className="modal-close-btn" onClick={(event) => { actions.closeModal('modalPayment') }}><span id="payCloseIcon" {...elementProps("payCloseIcon", {})}><Icon name="x" /></span></button>
            </div>
            <form id="formPayment" onSubmit={(event) => { actions.handleProcessPayment(event) }} {...elementProps("formPayment", {})}>
                <input type="hidden" id="paymentRequestId" {...field("paymentRequestId", "hidden")} {...elementProps("paymentRequestId", {})} />
                <input type="hidden" id="paymentOfferId" {...field("paymentOfferId", "hidden")} {...elementProps("paymentOfferId", {})} />
                <div className="modal-body">
                    <div style={{"background": "#f8fafc", "borderRadius": "var(--radius-md)", "padding": "16px", "marginBottom": "16px", "border": "1px solid var(--border-color)"}}>
                        <div style={{"fontSize": "12.5px", "color": "var(--text-secondary)"}}>Valor Total do Serviço Contratado:</div>
                        <div style={{"fontSize": "26px", "fontWeight": "800", "color": "var(--primary)"}} id="paymentDisplayAmount" {...elementProps("paymentDisplayAmount", {"fontSize": "26px", "fontWeight": "800", "color": "var(--primary)"})}>{slots.paymentDisplayAmount}</div>
                        <div style={{"fontSize": "12px", "color": "var(--text-muted)", "marginTop": "4px"}} id="paymentDisplaySeller" {...elementProps("paymentDisplaySeller", {"fontSize": "12px", "color": "var(--text-muted)", "marginTop": "4px"})}>{slots.paymentDisplaySeller}</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Forma de Pagamento (Simulada):</label>
                        <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "10px"}}>
                            <label style={{"border": "1px solid var(--border-color)", "borderRadius": "var(--radius-md)", "padding": "12px", "display": "flex", "alignItems": "center", "gap": "8px", "cursor": "pointer"}}>
                                <input type="radio" name="payMethod" value="PIX" checked={payMethod==='PIX'} onChange={(event) => { actions.togglePayMethod('PIX') }} />
                                <span id="payPixIcon" {...elementProps("payPixIcon", {})}><Icon name="qrCode" /></span>
                                <strong >PIX</strong>
                            </label>
                            <label style={{"border": "1px solid var(--border-color)", "borderRadius": "var(--radius-md)", "padding": "12px", "display": "flex", "alignItems": "center", "gap": "8px", "cursor": "pointer"}}>
                                <input type="radio" name="payMethod" value="Cartão" checked={payMethod==='Cartão'} onChange={(event) => { actions.togglePayMethod('Cartão') }} />
                                <span id="payCardIcon" {...elementProps("payCardIcon", {})}><Icon name="creditCard" /></span>
                                <strong >Cartão de Crédito</strong>
                            </label>
                        </div>
                    </div>

                    
                    <div id="paymentAreaPIX" style={{"background": "#f1f5f9", "padding": "16px", "borderRadius": "var(--radius-md)", "textAlign": "center"}} {...elementProps("paymentAreaPIX", {"background": "#f1f5f9", "padding": "16px", "borderRadius": "var(--radius-md)", "textAlign": "center"})}>
                        <div id="paymentPixBigIcon" style={{"marginBottom": "8px"}} {...elementProps("paymentPixBigIcon", {"marginBottom": "8px"})}><Icon name="qrCode" /></div>
                        <p style={{"fontSize": "13px", "fontWeight": "700"}}>Chave PIX Simulada (Copia e Cola):</p>
                        <input type="text" id="pixCodeCopy" className="form-input" style={{"fontSize": "11px", "textAlign": "center", "margin": "8px 0"}} readOnly {...field("pixCodeCopy", "text")} {...elementProps("pixCodeCopy", {"fontSize": "11px", "textAlign": "center", "margin": "8px 0"})} />
                        <button type="button" className="btn btn-secondary btn-sm" onClick={(event) => { actions.copyPixCode() }}>Copiar Código PIX</button>
                    </div>

                    
                    <div id="paymentAreaCard" style={{"display": "none", "background": "#f1f5f9", "padding": "16px", "borderRadius": "var(--radius-md)"}} {...elementProps("paymentAreaCard", {"display": "none", "background": "#f1f5f9", "padding": "16px", "borderRadius": "var(--radius-md)"})}>
                        <div className="form-group">
                            <label className="form-label">Número do Cartão (Simulado):</label>
                            <input type="text" className="form-input" placeholder="4532 •••• •••• 8899" defaultValue="4532 9988 7766 1234" />
                        </div>
                        <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "10px"}}>
                            <div className="form-group" style={{"marginBottom": "0"}}>
                                <label className="form-label">Validade:</label>
                                <input type="text" className="form-input" placeholder="MM/AA" defaultValue="12/29" />
                            </div>
                            <div className="form-group" style={{"marginBottom": "0"}}>
                                <label className="form-label">CVV:</label>
                                <input type="text" className="form-input" placeholder="123" defaultValue="789" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={(event) => { actions.closeModal('modalPayment') }}>Cancelar</button>
                    <button type="submit" className="btn btn-success" disabled={busy}>Confirmar e Liberar Produção</button>
                </div>
            </form>
        </div>
    </Modal><Modal id="modalReview">
        <div className="modal-box">
            <div className="modal-header">
                <h2 className="modal-title">Avaliação do Trabalho</h2>
                <button className="modal-close-btn" onClick={(event) => { actions.closeModal('modalReview') }}><span id="reviewCloseIcon" {...elementProps("reviewCloseIcon", {})}><Icon name="x" /></span></button>
            </div>
            <form id="formReview" onSubmit={(event) => { actions.handleSaveReview(event) }} {...elementProps("formReview", {})}>
                <input type="hidden" id="reviewRequestId" {...field("reviewRequestId", "hidden")} {...elementProps("reviewRequestId", {})} />
                <input type="hidden" id="reviewTargetUserId" {...field("reviewTargetUserId", "hidden")} {...elementProps("reviewTargetUserId", {})} />
                <input type="hidden" id="reviewTargetRole" {...field("reviewTargetRole", "hidden")} {...elementProps("reviewTargetRole", {})} />
                <input type="hidden" id="reviewRating" {...field("reviewRating", "hidden")} {...elementProps("reviewRating", {})} />
                <div className="modal-body">
                    <p style={{"fontSize": "13.5px", "marginBottom": "16px"}} id="reviewTargetPrompt" {...elementProps("reviewTargetPrompt", {"fontSize": "13.5px", "marginBottom": "16px"})}>{slots.reviewTargetPrompt}</p>
                    <div style={{"textAlign": "center", "marginBottom": "20px"}}>
                        <div id="starInteractiveContainer" style={{"display": "inline-flex", "gap": "8px"}} {...elementProps("starInteractiveContainer", {"display": "inline-flex", "gap": "8px"})}>{slots.starInteractiveContainer}</div>
                        <div style={{"fontWeight": "700", "color": "var(--accent-dark)", "marginTop": "8px", "fontSize": "14px"}} id="ratingTextFeedback" {...elementProps("ratingTextFeedback", {"fontWeight": "700", "color": "var(--accent-dark)", "marginTop": "8px", "fontSize": "14px"})}>{slots.ratingTextFeedback}</div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reviewComment">Comentário / Depoimento (opcional):</label>
                        <textarea id="reviewComment" className="form-textarea" rows="3" placeholder="Destaque a qualidade do acabamento, prazo, atenção aos detalhes e embalagem..." {...field("reviewComment", "text")} {...elementProps("reviewComment", {})}></textarea>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={(event) => { actions.closeModal('modalReview') }}>Fechar</button>
                    <button type="submit" className="btn btn-primary" disabled={busy}>Registrar Avaliação</button>
                </div>
            </form>
        </div>
    </Modal><Modal id="modalStock">
        <div className="modal-box">
            <div className="modal-header">
                <h2 className="modal-title" id="stockModalTitle" {...elementProps("stockModalTitle", {})}>Item do Estoque</h2>
                <button className="modal-close-btn" onClick={(event) => { actions.closeModal('modalStock') }}><span id="stockCloseIcon" {...elementProps("stockCloseIcon", {})}><Icon name="x" /></span></button>
            </div>
            <form id="formStock" onSubmit={(event) => { actions.handleSaveStockItem(event) }} {...elementProps("formStock", {})}>
                <input type="hidden" id="stockItemId" {...field("stockItemId", "hidden")} {...elementProps("stockItemId", {})} />
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label" htmlFor="stockName">Nome do Produto / Insumo: <span className="required">*</span></label>
                        <input type="text" id="stockName" className="form-input" placeholder="Ex: Filamento PLA Wood 1kg" required {...field("stockName", "text")} {...elementProps("stockName", {})} />
                    </div>
                    <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "12px"}}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="stockCategory">Categoria:</label>
                            <input type="text" id="stockCategory" className="form-input" placeholder="Ex: Insumos, Decoração, Acessórios" {...field("stockCategory", "text")} {...elementProps("stockCategory", {})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="stockQuantity">Quantidade: <span className="required">*</span></label>
                            <input type="number" id="stockQuantity" className="form-input" min="0" required {...field("stockQuantity", "number")} {...elementProps("stockQuantity", {})} />
                        </div>
                    </div>
                    <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "12px"}}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="stockPrice">Preço Unitário (R$): <span className="required">*</span></label>
                            <input type="number" id="stockPrice" className="form-input" min="0" step="0.01" placeholder="0.00" required {...field("stockPrice", "number")} {...elementProps("stockPrice", {})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="stockActive">Disponibilidade:</label>
                            <select id="stockActive" className="form-select" {...field("stockActive", "text")} {...elementProps("stockActive", {})}>
                                <option value="true">Ativo no Catálogo</option>
                                <option value="false">Inativo / Indisponível</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="stockDescription">Descrição:</label>
                        <textarea id="stockDescription" className="form-textarea" rows="2" placeholder="Características e especificações..." {...field("stockDescription", "text")} {...elementProps("stockDescription", {})}></textarea>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={(event) => { actions.closeModal('modalStock') }}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={busy}>Salvar Item</button>
                </div>
            </form>
        </div>
    </Modal><Modal id="modalPortfolio">
        <div className="modal-box">
            <div className="modal-header">
                <h2 className="modal-title" id="portfolioModalTitle" {...elementProps("portfolioModalTitle", {})}>Trabalho no Portfólio</h2>
                <button className="modal-close-btn" onClick={(event) => { actions.closeModal('modalPortfolio') }}><span id="portCloseIcon" {...elementProps("portCloseIcon", {})}><Icon name="x" /></span></button>
            </div>
            <form id="formPortfolio" onSubmit={(event) => { actions.handleSavePortfolioItem(event) }} {...elementProps("formPortfolio", {})}>
                <input type="hidden" id="portfolioItemId" {...field("portfolioItemId", "hidden")} {...elementProps("portfolioItemId", {})} />
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label" htmlFor="portTitle">Título do Trabalho: <span className="required">*</span></label>
                        <input type="text" id="portTitle" className="form-input" placeholder="Ex: Miniatura em Resina com Pintura Realista" required {...field("portTitle", "text")} {...elementProps("portTitle", {})} />
                    </div>
                    <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "12px"}}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="portCategory">Categoria:</label>
                            <input type="text" id="portCategory" className="form-input" placeholder="Ex: Impressão 3D, Artesanato" {...field("portCategory", "text")} {...elementProps("portCategory", {})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="portImage">Imagem ou PDF (arquivo ou URL): <span className="required">*</span></label>
                            <input type="text" id="portImage" className="form-input" placeholder="https://..." required {...field("portImage", "text")} {...elementProps("portImage", {})} />
                        <label className="file-upload-label" htmlFor="portImageUpload">Enviar imagem ou PDF · até 750 KB</label><input id="portImageUpload" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => { actions.uploadIntoField(event.currentTarget, 'portImage', true) }} {...elementProps("portImageUpload", {})} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="portDescription">Descrição da Peça e Técnicas Utilizadas: <span className="required">*</span></label>
                        <textarea id="portDescription" className="form-textarea" rows="3" placeholder="Descreva os materiais, parâmetros de impressão e acabamento..." required {...field("portDescription", "text")} {...elementProps("portDescription", {})}></textarea>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={(event) => { actions.closeModal('modalPortfolio') }}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={busy}>Salvar no Portfólio</button>
                </div>
            </form>
        </div>
    </Modal><Modal id="modalSellerUpgrade">
        <div className="modal-box">
            <div className="modal-header">
                <h2 className="modal-title">Dados de Vendedor / Prestador</h2>
                <button className="modal-close-btn" onClick={(event) => { actions.closeModal('modalSellerUpgrade') }}><span id="upgradeCloseIcon" {...elementProps("upgradeCloseIcon", {})}><Icon name="x" /></span></button>
            </div>
            <form id="formSellerUpgrade" onSubmit={(event) => { actions.handleSaveSellerData(event) }} {...elementProps("formSellerUpgrade", {})}>
                <div className="modal-body">
                    <p style={{"fontSize": "13px", "color": "var(--text-secondary)", "marginBottom": "16px"}}>
                        Cadastre suas informações profissionais para começar a ofertar orçamentos e prestar serviços na plataforma.
                    </p>
                    <div className="form-group">
                        <label className="form-label" htmlFor="sellerBusinessName">Nome Comercial ou Razão Social: <span className="required">*</span></label>
                        <input type="text" id="sellerBusinessName" className="form-input" placeholder="Ex: Oficina 3D Prototipagem ME" required {...field("sellerBusinessName", "text")} {...elementProps("sellerBusinessName", {})} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="sellerCNPJ">CNPJ (Opcional, mas verificado):</label>
                        <input type="text" id="sellerCNPJ" className="form-input" placeholder="00.000.000/0000-00" maxLength="18" {...field("sellerCNPJ", "text")} {...elementProps("sellerCNPJ", {})} />
                        <div className="input-feedback" id="sellerCNPJFeedback" {...elementProps("sellerCNPJFeedback", {})}></div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="sellerVerification">Dados de Verificação / Certificações:</label>
                        <input type="text" id="sellerVerification" className="form-input" placeholder="Ex: Registro Técnico CREA, MEI Ativo, Certificação em Manufatura Aditiva" {...field("sellerVerification", "text")} {...elementProps("sellerVerification", {})} />
                    </div>
                    <div className="form-group"><label className="form-label" htmlFor="sellerCertificateUpload">Certificado (imagem ou PDF, até 750 KB)</label><input id="sellerCertificateUpload" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => { actions.uploadIntoField(event.currentTarget, 'sellerCertificate', true) }} {...elementProps("sellerCertificateUpload", {})} /><input id="sellerCertificate" type="hidden" {...field("sellerCertificate", "hidden")} {...elementProps("sellerCertificate", {})} /><p className="filter-caption">Documento informado pelo prestador. A autenticidade não é verificada automaticamente.</p></div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="sellerCategoriesInput">Áreas de Atuação (separadas por vírgula):</label>
                        <input type="text" id="sellerCategoriesInput" className="form-input" placeholder="Ex: Impressão 3D, Resina SLA, Pintura, Artesanato" {...field("sellerCategoriesInput", "text")} {...elementProps("sellerCategoriesInput", {})} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="sellerSkillsInput">Habilidades, Máquinas e Qualificações:</label>
                        <textarea id="sellerSkillsInput" className="form-textarea" rows="3" placeholder="Detalhes das tecnologias (FDM, SLA), volumes de impressão, acabamentos e pós-cura..." {...field("sellerSkillsInput", "text")} {...elementProps("sellerSkillsInput", {})}></textarea>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={(event) => { actions.closeModal('modalSellerUpgrade') }}>Cancelar</button>
                    <button type="submit" className="btn btn-accent" disabled={busy}>Salvar Credenciais</button>
                </div>
            </form>
        </div>
    </Modal><Modal id="modalEditProfile">
        <div className="modal-box">
            <div className="modal-header">
                <h2 className="modal-title">Editar Meu Perfil</h2>
                <button className="modal-close-btn" onClick={(event) => { actions.closeModal('modalEditProfile') }}><span id="editProfCloseIcon" {...elementProps("editProfCloseIcon", {})}><Icon name="x" /></span></button>
            </div>
            <form id="formEditProfile" onSubmit={(event) => { actions.handleSaveProfile(event) }} {...elementProps("formEditProfile", {})}>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label" htmlFor="editProfName">Nome Completo: <span className="required">*</span></label>
                        <input type="text" id="editProfName" className="form-input" required {...field("editProfName", "text")} {...elementProps("editProfName", {})} />
                        <div className="input-feedback" id="editProfNameFeedback" {...elementProps("editProfNameFeedback", {})}></div>
                    </div>
                    <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "12px"}}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="editProfPhone">Telefone:</label>
                            <input type="text" id="editProfPhone" className="form-input" {...field("editProfPhone", "text")} {...elementProps("editProfPhone", {})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="editProfGender">Gênero:</label>
                            <select id="editProfGender" className="form-select" {...field("editProfGender", "text")} {...elementProps("editProfGender", {})}>
                                <option value="Não informado">Não informado</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Masculino">Masculino</option>
                            </select>
                        </div>
                    </div>
                    <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "12px"}}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="editProfCEP">CEP: (Consulta ViaCEP)</label>
                            <input type="text" id="editProfCEP" className="form-input" maxLength="9" onBlur={(event) => { actions.fetchAddressByCEP(event.currentTarget.value, 'edit') }} {...field("editProfCEP", "text")} {...elementProps("editProfCEP", {})} />
                            <div className="input-feedback" id="editProfCEPFeedback" {...elementProps("editProfCEPFeedback", {})}></div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="editProfCity">Cidade / UF:</label>
                            <input type="text" id="editProfCity" className="form-input" readOnly {...field("editProfCity", "text")} {...elementProps("editProfCity", {})} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="editProfAvatar">URL da Foto de Perfil (Avatar):</label>
                        <input type="text" id="editProfAvatar" className="form-input" placeholder="https://..." {...field("editProfAvatar", "text")} {...elementProps("editProfAvatar", {})} />
                        <label className="file-upload-label" htmlFor="editProfAvatarUpload">Enviar foto · até 750 KB</label><input id="editProfAvatarUpload" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { actions.uploadIntoField(event.currentTarget, 'editProfAvatar', false) }} {...elementProps("editProfAvatarUpload", {})} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="editProfBanner">URL da Imagem de Capa (Banner):</label>
                        <input type="text" id="editProfBanner" className="form-input" placeholder="https://..." {...field("editProfBanner", "text")} {...elementProps("editProfBanner", {})} />
                        <label className="file-upload-label" htmlFor="editProfBannerUpload">Enviar banner · até 750 KB</label><input id="editProfBannerUpload" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { actions.uploadIntoField(event.currentTarget, 'editProfBanner', false) }} {...elementProps("editProfBannerUpload", {})} />
                    </div>
                    <div className="form-group"><label className="form-label" htmlFor="editProfPreferences">Preferências de criação</label><input id="editProfPreferences" type="text" className="form-input" maxLength="200" placeholder="Ex.: decoração, miniaturas, materiais recicláveis" {...field("editProfPreferences", "text")} {...elementProps("editProfPreferences", {})} /></div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={(event) => { actions.closeModal('modalEditProfile') }}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={busy}>Salvar Alterações</button>
                </div>
            </form>
        </div>
    </Modal><Modal id="modalNegotiate">
        <div className="modal-box">
            <div className="modal-header">
                <h2 className="modal-title">Negociar Proposta de Orçamento</h2>
                <button className="modal-close-btn" onClick={(event) => { actions.closeModal('modalNegotiate') }}><span id="negCloseIcon" {...elementProps("negCloseIcon", {})}><Icon name="x" /></span></button>
            </div>
            <form id="formNegotiate" onSubmit={(event) => { actions.handleConfirmNegotiation(event) }} {...elementProps("formNegotiate", {})}>
                <input type="hidden" id="negotiateOfferId" {...field("negotiateOfferId", "hidden")} {...elementProps("negotiateOfferId", {})} />
                <div className="modal-body">
                    <p style={{"fontSize": "13px", "color": "var(--text-secondary)", "marginBottom": "14px"}}>
                        Envie uma contraproposta de valor ou prazo para o prestador. Uma notificação será gerada para ele responder.
                    </p>
                    <div style={{"display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "12px"}}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="negPrice">Contraproposta de Valor (R$):</label>
                            <input type="number" id="negPrice" className="form-input" min="0" step="0.01" required {...field("negPrice", "number")} {...elementProps("negPrice", {})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="negDeadline">Prazo Sugerido:</label>
                            <input type="date" id="negDeadline" className="form-input" required {...field("negDeadline", "date")} {...elementProps("negDeadline", {})} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="negMessage">Mensagem para o Prestador:</label>
                        <textarea id="negMessage" className="form-textarea" rows="3" placeholder="Ex: Consigo fechar por esse valor com retirada presencial..." required {...field("negMessage", "text")} {...elementProps("negMessage", {})}></textarea>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={(event) => { actions.closeModal('modalNegotiate') }}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={busy}>Enviar Contraproposta</button>
                </div>
            </form>
        </div>
    </Modal> </>);
}
