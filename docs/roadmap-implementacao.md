# Plano de implementação — Novo Ienvia

Este é um produto amplo. A execução será incremental, com testes em cada marco; “desenvolver o sistema todo” não será tratado como promessa de estar pronto em uma única etapa. O documento `requisitos-decisoes-perguntas.md` continua sendo a fonte de verdade das decisões do produto.

## Regras de execução

- Não acessar nem imprimir segredos de `.env`. Não fazer chamadas a Meta/Evolution/WhatsApp nem enviar mensagens reais sem aprovação específica e testes controlados.
- Cada módulo tem sua rota própria; nenhum módulo deve buscar/carregar datasets inteiros na navegação inicial.
- Separação de rotas, por si só, não garante desempenho. Implementar autorização tenant-scoped, paginação/cursor, índices, limites, processamento assíncrono, idempotência, métricas e testes de carga.
- Todo recurso que altera/suprime/envia dados externos terá confirmação, trilha de auditoria, modo seguro e testes sem envio real antes da ativação.
- Políticas aprovadas de retenção e exclusão são requisitos, mas a implementação deve validar como aplicá-las no armazenamento compartilhado e backups antes de afirmar apagamento completo.

## Marcos

1. **Fundação web — primeira iteração concluída:** Next.js App Router + TypeScript, layout responsivo e rotas independentes. Conteúdo segue demonstrativo.
2. **UI demonstrativa dos módulos — primeira iteração concluída:** Inbox com fila/timeline/handoff; CRM com busca/filtros, criação local, consentimento, vínculos manuais e exportação CSV demonstrativa; campanha com fluxo de rascunho/prévia/checkbox de confirmação sem dispatch; IA com treinamento rascunho/publicação simulada, controles por instância e biblioteca de áudio; canais com cadastro local sem pareamento; relatórios e políticas do workspace demonstrativos. Nenhuma dessas ações persiste ou acessa serviços externos.
3. **Modelo de dados e autenticação Supabase — migrations iniciais aplicadas ao projeto Ienvia após autorização:** `supabase/migrations/0001_core.sql` traz tenancy, owner/operator, contatos, instâncias, conversas, mensagens, outbox, eventos, pedidos de eliminação e helpers RLS; `0002_consent_campaigns.sql` adiciona anexos, vínculo manual entre perfis, trilha de consentimento, campanhas pontuais, destinatários, convites e jobs de exportação/ciclo de vida. Wrappers SSR, login/proxy e APIs tenant-scoped paginadas para conversas/contatos foram preparados. Migrations e um subconjunto de RLS/constraints passaram no harness efêmero PGlite e as tabelas foram verificadas no projeto. Ainda precisa revisão especializada de RLS/identidades master/support/convites, teste de PostgREST/Storage e validação de políticas com usuários reais antes de persistir dados de usuários.
4. **Inbox/CRM persistentes:** consultas paginadas, filtros e autorização por workspace; testes RLS e integridade; mídia e exportação.
5. **Conexões e agente local:** Evolution/Baileys, eventos canônicos, deduplicação idempotente, estado desconectado e recuperação; integração controlada sem mensagens de produção.
6. **IA, treinamentos e áudios:** drafts/publicação, provedor por tarefa, handoff seguro, transcrição e áudio autorizado; testes com mocks e limites/custos.
7. **Campanhas WhatsApp:** consentimento/opt-out, prévia exata, confirmação, throttling, pause/retry, idempotência e nunca contornar limites do canal.
8. **Instagram:** somente após validar permissões/App Review, janelas e elegibilidade; DMs e comentários separados, sem publishing; Marketing Messages desligadas até validação oficial.
9. **Operação, privacidade e escala:** exportações, retenção/exclusão, backup de objetos, restore testado, auditoria, observabilidade, rate limiting, threat modeling, teste de carga e revisão de segurança.
10. **Entrega:** deploy staging, smoke tests, revisão/aceite do usuário e, só então, produção. Nenhuma credencial/deploy será usado sem autorização específica.

## Estado atual

- Base Next.js + TypeScript em `web/`, rotas independentes para Visão geral, Inbox, Contatos, Campanhas, IA/Automação, Canais, Relatórios e Configurações.
- Next build e checagem TypeScript passaram; rotas responderam HTTP 200 no ambiente de desenvolvimento.
- Em modo demo, os módulos usam fixtures locais e operações explicitamente simuladas. Se Supabase estiver configurado, o seletor carrega memberships ativas; Inbox lê páginas/timelines tenant-scoped e somente leitura; CRM busca por página/cursor e cria contato manual sem permitir definir consentimento. As outras áreas ainda não persistem dados.
- Schema/RLS, wrappers SSR, login/proxy, seletor de workspace, endpoints tenant-scoped de workspaces/Inbox/timeline e contatos (GET paginado + POST manual e RPC de consentimento) adicionados. Exigem sessão, respeitam RLS e retornam `private, no-store`; cadastro manual não aceita consentimento nem ID externo. App local conectado ao projeto `Ienvia` via URL + chave publishable (guardados em `.env.local`, ignorado no Git); nenhuma service-role foi colocada no app. Auth requer sessão. O signup público foi desativado por segurança até provisionar o owner e um fluxo de convites.
- Harness PGlite aplica migrations em banco efêmero e testa subconjunto de isolamento cross-workspace, grants de colunas, owner/operator, consentimento append-only, sem escrita browser de mensagem/outbox/dispatch, vínculo manual, dedupe e auditoria service-role — passou. As duas migrations também foram aplicadas ao novo projeto Supabase e a existência das tabelas foi verificada. Isso não substitui teste PostgREST/RLS com contas e papéis reais.
- Próxima etapa: configurar ligação frontend ao projeto, criar/invitar o primeiro owner com processo controlado, gerar tipos Supabase, testar auth/PostgREST/RLS; histórico paginado de consentimento. Ainda não há worker, canais conectados, envio ou uso de dados reais.
- Impedimentos conscientes para produção: revisão do desenho de identidades master/owner/membro e convite; validar provedor e arquitetura de backup de mídia; testes de permissões Meta/Evolution; aceite específico antes de integrações/envios.

### Progresso incremental — consentimento CRM (2026-11-05)

- Corrigida a RPC para `public.record_contact_consent` (necessária para PostgREST), mantendo revogação a `public`/`anon`, execução apenas para `authenticated`, checagem de membership, evidência obrigatória em grant/reconfirm e atualização atômica da trilha append-only e estado corrente.
- CRM autenticado agora pode registrar eventos por finalidade (global, marketing ou atualizações de serviço), ação, origem e referência de evidência. Cadastro manual continua sem atribuir opt-in. A API exige sessão, UUID válido, origem same-origin quando presente, validação de payload e usa a RPC; não disponibiliza escrita direta nas tabelas.
- Histórico de consentimento agora tem GET autenticado, RLS, `no-store`, ordenação recente e limite de 50 eventos; o CRM apresenta ações, finalidade, origem, data e referência de evidência. O fluxo não substitui revisão jurídica da base legal, verificação de evidências ou validação com Supabase Auth/PostgREST real.
- Verificações do código: `npm run check`, `npm run test:db` (PGlite), `npm run build` e `npm audit` aprovados; zero vulnerabilidades reportadas. PGlite segue sendo teste parcial, não certificação de segurança.
- Supabase: projeto novo `Ienvia` criado na organização conectada, região `sa-east-1` (São Paulo), plano Free; ref `jazvdlkyvwquoednmljf`, host `db.jazvdlkyvwquoednmljf.supabase.co`. Após confirmação explícita, migrations `0001_core` e `0002_consent_campaigns` foram aplicadas; histórico e tabelas de consentimento/campanhas conferidos. DB/Auth/REST saudáveis. `.env.local` aponta para URL e chave publishable do projeto, está em `.gitignore`; service-role não está no app. Auth signup está desativado e não há usuários/workspaces/memberships ainda. Endpoint Auth health confirmou HTTP 200; requests sem sessão foram bloqueadas/redirected como esperado.
- GitHub/Vercel: repo privado `https://github.com/ivandoplay/ienvia` criado e conectado ao projeto Vercel `ienvia`; arquivos locais de ambiente/segredos foram excluídos do Git. Deploy de produção `dpl_EWL8LuD79Ap8dm3nidH1cv3ZiSbz` concluiu em `READY`, alias verificado `https://ienvia.vercel.app`. Env Vercel contém apenas a URL e chave publishable do Supabase (sem service-role). `web/vercel.json` posiciona funções em São Paulo (`gru1`), perto do banco.
- Smoke tests online: `/login` HTTP 200; `/inbox` redireciona para autenticação; raiz redireciona para login. `npm run check`, `npm run test:db`, `npm run build` e `npm audit` passaram; zero vulnerabilidades reportadas.
- Próximas entregas: revisar e validar RLS/PostgREST com usuários/roles reais; conectar a aplicação sem expor service role; histórico paginado de consentimento; depois persistência de rascunhos de campanha sem dispatch até haver confirmação e guardas de elegibilidade.
