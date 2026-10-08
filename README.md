# TresDê

Marketplace de impressão 3D e artesanato migrado para **React + Vite + Supabase**, preservando o CSS, a fonte Sora, os SVGs, o banner, as cinco telas e os formulários do protótipo. O novo aplicativo está em `frontend/`.

## Executar

Requer Node.js **22.12+** (ou uma versão LTS posterior compatível).

```sh
cd frontend
npm ci
cp .env.example .env
```

Escolha um dos modos abaixo e execute:

```sh
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente `http://localhost:5173`.

### Com Supabase

1. Crie um projeto Supabase. No SQL Editor, execute **em ordem** os arquivos de `supabase/migrations/`. Alternativamente, com a CLI Supabase instalada, execute na raiz do repositório:

   ```sh
   supabase login
   supabase link --project-ref SEU_PROJECT_REF
   supabase db push
   ```

2. Configure `frontend/.env`:

   ```dotenv
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE_PUBLICA
   VITE_DEMO_MODE=false
   ```

   Também é aceita a chave `anon` legada em `VITE_SUPABASE_ANON_KEY`. **Nunca** coloque `service_role`, `sb_secret_...`, senha do banco ou segredos em variáveis `VITE_*`: elas são incluídas no JavaScript público. O Vite bloqueia chaves privilegiadas reconhecidas antes de iniciar ou gerar o bundle; o cliente também faz a verificação. `.env` está no `.gitignore`.

3. Em **Authentication → URL Configuration**, configure a Site URL e as URLs de redirecionamento para o endereço do frontend. Em desenvolvimento, inclua `http://localhost:5173` e `http://127.0.0.1:5173`. Em produção, use o domínio HTTPS publicado. Habilite cadastro e confirmação por e-mail e configure o envio de e-mails no projeto para confirmação e recuperação de senha.
4. Reinicie o Vite após alterar `.env`. Cadastre uma conta e confirme o e-mail. Para enviar propostas, ative o perfil de prestador com as especialidades correspondentes. A recuperação envia um link por e-mail; a nova senha é definida depois de abrir esse link.

As migrations criam as tabelas, as funções, o gatilho de cadastro, as políticas RLS e os buckets. A base de produção começa vazia; nenhuma conta fictícia ou senha do protótipo é enviada ao Supabase.

Para Supabase local, com CLI e Docker disponíveis, execute `supabase start` e `supabase db reset` na raiz. Use a URL/chave pública mostradas pela CLI. `db reset` apaga a base **local** e reaplica as migrations. As confirmações de e-mail podem ser consultadas na caixa de e-mail de desenvolvimento indicada pela CLI.

### Demonstração sem credenciais

No `frontend/.env`:

```dotenv
VITE_DEMO_MODE=true
```

Reinicie o Vite. O rodapé oferece **modo demonstração → Simular Usuário**, com Mariana, Carlos, Ana e Lucas. Esse modo usa um adaptador local isolado e não acessa o Supabase. Login/cadastro e recuperação reais ficam disponíveis no modo Supabase; na demonstração, use o seletor de contas.

A persistência usa `tresde_react_demo_v1`. Se as chaves antigas `tresde_*` existirem **na mesma origem do navegador**, a primeira abertura copia os dados para a demonstração, removendo senhas da cópia e preservando os originais. Mudar de porta/domínio muda a origem: para reaproveitar dados antigos, execute o Vite na mesma origem/porta usada pelo protótipo, após encerrar o servidor anterior. Resetar a demonstração só substitui a chave nova.

Contas locais antigas não são contas autenticadas. Não há importação automática delas para produção: identidades e titularidade precisam ser vinculadas a contas reais antes de uma importação administrativa. O aplicativo não envia dados antigos do navegador para o Supabase.

## Análise e conversão

| Antes | Agora |
| --- | --- |
| `index.html`: cinco seções e modais | Páginas React em `src/pages/`, cabeçalho e diálogos em `src/components/` |
| `app.js` / `marketplace.js`: `innerHTML`, eventos globais e alterações diretas do DOM | Estado React, eventos JSX, componentes de cards, chat, arquivos e modais com gerenciamento de foco |
| `css/styles.css`, fonte Sora, SVGs e ilustração | CSS original em `src/styles.css`, com ajustes pontuais para os componentes; assets em `public/assets/` |
| `validators.js` / `geo.js` | Módulos reutilizáveis; validação cadastral e estimativa de distância preservadas |
| Senhas e sessão simulada no navegador | Supabase Auth para cadastro, confirmação por e-mail, login, logout, sessão e recuperação por link |
| Usuários com todos os campos em uma coleção pública local | `profiles` público e `private_profiles` exclusivo do titular, com CPF, contato, endereço completo, nascimento, preferências e CNPJ |
| Pedidos, ofertas, mensagens, notificações, avaliações e pagamentos em `localStorage` | Tabelas protegidas por RLS e operações transacionais autenticadas |
| Estoque e portfólio dentro do usuário | Tabelas `stock` e `portfolio`, vinculadas ao prestador |
| Arquivos como base64 | Supabase Storage com limites de upload e permissões; base64 apenas na demonstração |

O código antigo na raiz (`index.html`, `css/`, `js/`, `assets/` e `tests/marketplace.cjs`) foi preservado como referência e não é carregado pelo frontend React. O comando antigo `python3 -m http.server` executa o protótipo, não a migração.

## Estrutura

```text
frontend/
  src/
    App.jsx                 estado, navegação e ações dos formulários
    context.js              contexto compartilhado
    components/             cabeçalho, diálogos, cards, chat e componentes comuns
    pages/                  explorar, pedidos, ateliê, produção e perfil
    lib/                    Supabase, repositório, validação, formatação e demonstração
    data/demo.json          dados fictícios sem senhas
    styles.css              estilos originais e ajustes de integração
  public/assets/            SVGs e ilustração originais
  tests/                    testes de SQL/RLS e navegador
  .env.example
  package.json
  package-lock.json
  vite.config.js
supabase/
  migrations/               esquema, RLS, regras e estatísticas públicas
  functions/README.md       por que não há Edge Functions neste estágio
  config.toml               configuração de desenvolvimento local
README.md
```

Dependências de execução: React, React DOM e o cliente oficial Supabase. Vite e seu plugin React são usados no desenvolvimento/build; Playwright e PGlite são exclusivos dos testes. Não há biblioteca de UI, roteamento ou gerenciamento global de estado adicional.

## Regras de backend e arquivos

- Todas as tabelas do aplicativo têm RLS. Perfis públicos, avaliações, portfólio, estoque ativo e pedidos abertos podem ser consultados publicamente. Dados pessoais são exclusivos do titular. Propostas são visíveis ao autor e ao cliente do pedido. Chat e pagamentos são exclusivos dos participantes; notificações são exclusivas do destinatário.
- Clientes não possuem acesso direto de escrita às tabelas. `marketplace_action` autentica `auth.uid()`, verifica propriedade/papel, valida cada transição e bloqueia o pedido durante operações concorrentes. Aceite, seleção do prestador, recusa das demais propostas e pagamento simulado são uma transação. O valor vem da oferta registrada no banco.
- Somente o prestador contratado avança **Recebido → Em Produção → Finalizado → Enviado → Entregue**. Somente o cliente confirma o recebimento. Avaliações exigem conclusão e são únicas por autor/pedido. Cancelamentos após o aceite só são permitidos até **Em Produção**.
- `marketplace_stats` publica somente contagens de ofertas, preços mínimos de referência e títulos/categorias de trabalhos concluídos, preservando a vitrine sem expor as propostas individuais ou os dados privados do pedido.
- `public-media` contém fotos, capas, portfólio e certificados declarados publicamente pelo prestador. `request-files` é privado: somente o proprietário envia ao próprio caminho; a leitura acompanha a visibilidade do pedido e exige que o arquivo esteja anexado a ele. Links assinados expiram em uma hora e são renovados nas consultas. Anexos de pedidos abertos são visíveis na vitrine, como no protótipo.
- Arquivos: até 750 KB cada; até cinco anexos e 1 MB total por pedido no formulário. Imagens PNG/JPEG/WebP; PDF para portfólio/certificados; pedidos também aceitam STL/OBJ. Remover um anexo da edição remove sua referência no pedido; objetos já enviados não são apagados automaticamente do Storage.
- A interface atualiza dados após operações, a cada 15 segundos enquanto a aba está visível e ao recuperar foco. Essa atualização permite chat e notificações entre sessões sem exigir Realtime.

## Build e validação

```sh
cd frontend
npm run build
npm run preview
npm test
```

`npm test` aplica as migrations no motor PostgreSQL do PGlite, com fixtures das APIs `auth`/`storage` do Supabase, e testa operações permitidas e negadas, isolamento RLS, transições, negociação, moderação e valores do pagamento. É uma validação local da lógica SQL, não uma conexão a um projeto hospedado.

Para o teste de interface (o script inicia e encerra seu próprio Vite em modo demonstração):

```sh
cd frontend
npx playwright install chromium
npm run test:browser
```

O teste usa um contexto novo de navegador, percorre o fluxo de pedido até avaliação, portfólio PDF, estoque e cinco larguras de tela. Capturas ficam em `frontend/test-results/`. `TEST_URL` permite usar um servidor de demonstração já iniciado em outra porta; `PLAYWRIGHT_BROWSERS_PATH` permite usar outra instalação dos navegadores.

Para publicar, configure as variáveis do frontend antes do build e hospede `frontend/dist`. Aplique as migrations e configure os redirecionamentos do Auth para o domínio publicado. Mantenha `VITE_DEMO_MODE=false`.

## Limites preservados

Pagamentos continuam **simulados**: não há cobrança, cartão real, liberação de valores ou estorno. Não informe dados reais de cartão. Certificados são declarados pelo prestador; distância é estimada a partir de cidade/UF; a moderação usa a lista básica do protótipo, também aplicada às operações no banco. Fontes/imagens externas e ViaCEP dependem de internet. Integrações de pagamento reais exigirão backend com segredos e webhooks próprios.

A conexão a um Supabase hospedado e o envio real de e-mails precisam ser verificados depois de configurar as credenciais do seu projeto. Referências utilizadas: [RLS do Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [Auth por senha](https://supabase.com/docs/guides/auth/passwords) e [Vite](https://vite.dev/guide/).
