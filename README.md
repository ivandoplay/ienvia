# Novo Ienvia

Aplicação web e especificação em andamento para o novo Ienvia. O escopo é amplo; a implementação ocorre em incrementos testáveis. O documento de decisões está em `docs/requisitos-decisoes-perguntas.md`; o plano de marcos, em `docs/roadmap-implementacao.md`.

## Aplicação web

```bash
cd web
npm install
npm run dev
```

Rotas principais: `/visao-geral`, `/inbox`, `/contatos`, `/campanhas`, `/ia-automacao`, `/canais-instancias`, `/relatorios`, `/configuracoes` e `/login`.

A aplicação usa Next.js App Router + TypeScript. A Inbox e os indicadores ainda usam dados fictícios e estado local; nenhuma mensagem é enviada. A integração SSR com Supabase está preparada. Quando configurada, seletor de workspace e leitura da Inbox/CRM usam rotas autenticadas com RLS; a Inbox é leitura somente e o CRM permite criar contatos manuais sem consentimento. Ainda não há credenciais de projeto configuradas nem persistência testada em Supabase real.

## Supabase

- `supabase/migrations/0001_core.sql` e `0002_consent_campaigns.sql` são propostas iniciais de schema/RLS e **não foram aplicadas nem validadas contra Postgres/Supabase**.
- Para configurar um ambiente local, copie `web/.env.example` para `web/.env.local` e use um projeto de desenvolvimento. Nunca use `SUPABASE_SERVICE_ROLE_KEY` no browser nem faça commit dos segredos.
- Antes de armazenar dados reais, revisar migração, políticas RLS e testes de isolamento cross-workspace; depois aplicar primeiro em projeto local/staging e executar testes de restore/segurança.

## Verificações atuais

- `npm run check` — TypeScript.
- `npm run build` — build de produção.
- `npm run test:db` — aplica migrations em banco efêmero PGlite e testa parte de RLS/constraints; não substitui Supabase local/staging.
- `npm audit` — dependências; no último ciclo, sem vulnerabilidades reportadas.
