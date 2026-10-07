# TresDê

Protótipo de requisições de impressão 3D e artesanato, em HTML, CSS e JavaScript, com persistência em `localStorage`.

O visual segue a composição da referência fornecida: cabeçalho com busca, categorias, banner com chamada lateral e vitrine com imagens. A paleta usa **#BD6F35** e **#D6D6D6**. A estrutura da SPA e os dados já existentes são preservados.

## Executar

```sh
python3 -m http.server 8000
```

Acesse `http://localhost:8000`. Não há etapa de build nem dependências de execução. Imagens externas, fonte Sora e consulta de CEP precisam de conexão; o banner e a ilustração da miniatura são locais.

## Estrutura

- `index.html`: telas e formulários existentes, vitrine e perfis públicos.
- `css/styles.css`: estilos globais, paleta e adaptação para celular e tablet.
- `js/app.js`: autenticação, requisições, ofertas, produção, avaliações e notificações.
- `js/marketplace.js`: busca, filtros, perfis públicos, uploads, cancelamento, confirmação de recebimento e acessibilidade dos modais.
- `js/storage.js`: dados de demonstração e persistência local.
- `js/validators.js`: validações cadastrais, datas e lista de palavras proibidas.
- `js/geo.js` e `js/icons.js`: proximidade aproximada e ícones.
- `assets/illustrations/miniature.svg`: referência visual local para a miniatura.
- `tests/marketplace.cjs`: teste de integração em navegador.

## Requisitos no protótipo

| Requisitos | Comportamento |
| --- | --- |
| RS01–RS03 | Cadastro, edição do perfil e preferências, foto/banner, login, logout e recuperação de senha demonstrativa. |
| RS04 | Estoque, portfólio com imagem/PDF e documento de certificação informado pelo prestador. Perfil público mostra trabalhos e qualificações. |
| RS05 | Criar, revisar antes de publicar, editar e cancelar pedidos antes do aceite, com texto, prazo, orçamento e anexos. |
| RS06 | Painel de pedidos abertos compatíveis com as categorias do prestador e filtro de proximidade. |
| RS07–RS08 | Enviar, editar e retirar propostas; histórico, comparação de preço/prazo/local, negociação, aceite, recusa e acesso ao perfil público. |
| RS09–RS10 | Sequência Recebido → Em Produção → Finalizado → Enviado → Entregue; histórico com datas. Cancelamento pelos participantes até o fim da etapa Em Produção, com justificativa. |
| RS11 | Localização e distância aproximadas, usando os endereços cadastrados. |
| RS12–RS13 | Cliente confirma recebimento após a entrega. Participantes podem avaliar uma única vez por pedido concluído, de 1 a 5. |
| RS14 | Aceite com simulação de pagamento PIX/cartão pelo valor da oferta selecionada. |
| RS15–RS16 | Chat de até 400 caracteres e notificações locais de mensagens, ofertas e alterações do pedido. |
| RS17 | Descoberta de prestadores por especialidade, preço de referência e avaliação. Valores de referência vêm de estoque disponível e ofertas. |
| RS18–RS20 | Verificação de sessão/papel nos fluxos, layout responsivo e moderação dos textos publicados com lista local de palavras proibidas. |

## Demonstração e limites

Os controles de **Simular Usuário** e **Resetar Dados** ficam no rodapé, em **modo demonstração**. Os perfis iniciais são Mariana (cliente), Carlos (prestador), Ana (prestadora) e Lucas (cliente). Alterar o visual não reinicializa a base existente.

A aplicação continua sendo um protótipo local. Autenticação, recuperação de senha, pagamentos e notificações não integram serviços externos de produção. E-mail/telefone são validados pelo formato, sem comprovação de titularidade. Certificados são documentos declarados pelo prestador, sem validação de autenticidade. A localização é estimada. O cancelamento registra o encerramento e avisa os envolvidos, sem processar estorno real.

Arquivos têm limite de 750 KB por arquivo, até cinco anexos por pedido e aproximadamente 1 MB total por pedido, devido ao armazenamento do navegador. Imagens aceitas: PNG, JPEG e WebP; portfólio/certificados também aceitam PDF; requisições também aceitam STL e OBJ. Textos passam por uma lista básica de palavras, não por um serviço de moderação contextual. Um serviço de produção requer backend para credenciais, permissões, armazenamento de arquivos, verificação de contatos, recuperação por token, pagamentos e notificações entre dispositivos.

## Validação

Com o servidor local aberto e Playwright instalado em um ambiente de testes:

```sh
node tests/marketplace.cjs
```

Para uma instalação externa, informe `PLAYWRIGHT_MODULE` com o caminho do módulo; `PLAYWRIGHT_BROWSERS_PATH` pode apontar para os navegadores instalados. `TEST_URL` permite usar outra porta. Nenhuma dependência de teste é carregada pela aplicação.

O teste usa um contexto novo de navegador, sem alterar os dados do navegador do usuário. Verifica filtros, perfis, persistência dos anexos, publicação no celular, ofertas, permissões, pagamento simulado, chat/moderação, produção, recebimento, avaliações, cancelamento, PDF e ausência de overflow em cinco larguras.
