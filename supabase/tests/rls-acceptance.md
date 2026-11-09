# Plano de testes Supabase/RLS — pré-condição de dados reais

As migrations são rascunhos e ainda não foram aplicadas nem executadas. Antes de habilitar persistência, automatizar estes cenários em Supabase local/staging e confirmar que resultados são negados em SQL/API, não apenas na interface.

## Isolamento entre workspaces

1. Usuário A (owner) só lê workspaces, contatos, conversas, mensagens, eventos de consentimento, campanhas, destinatários e anexos dos workspaces em que tem membership ativa.
2. Usuário B, membro apenas do workspace B, não lê nem altera nenhum ID do workspace A; testar REST e chamadas SQL autenticadas.
3. Usuário membro de A e B continua sem mover contato, conversa, mensagem ou campanha de um workspace para o outro; colunas tenant/identidade não podem ser editadas diretamente pelo cliente.
4. Membership suspensa ou convite pendente não autoriza leitura; remoção/suspensão de membership revoga acesso na próxima requisição.
5. IDs conhecidos de objetos de outro workspace não contornam RLS em anexos/downloads/exportações.

## Limites de papel e operações

6. Operador não altera política de retenção nem cria/aceita convites; owner pode alterar apenas políticas autorizadas.
7. Browser não cria workspace/membership, não insere mensagens, jobs, webhook events ou estado de destinatários; essas ações são server-side e auditadas.
8. Browser não altera status/confirmado/enviado de campanha. Campanha só entra em execução depois de prévia e confirmação autenticada; destinatários elegíveis são revalidados no dispatch.
9. Consentimento é append-only; opt-in exige referência de evidência via RPC validada, opt-out por finalidade fica separado do global, bloqueia fila antes do envio e não pode ser revertido por editar uma coluna de contato.
10. A ligação de perfis entre canais requer ação manual, trilha de auditoria e contatos da mesma empresa; nenhum merge ocorre por telefone/email automaticamente.
11. Master não consulta `private.audit_events` pelo client/browser. Entrada de suporte usa fluxo server-side de sessão auditada e escopo explícito.

## Idempotência, retenção e recuperação

12. Redelivery do mesmo webhook não cria segundo evento/mensagem; repetir a mesma chave idempotente não duplica job/destinatário.
13. Cursor temporal mantém ordenação estável sob novas mensagens; limites e filtros são respeitados e consultas não fazem full-scan sem índice.
14. Pedido de eliminação bloqueia envios logo no início; exclusões e exceções ficam auditáveis e são reaplicadas após restore.
15. Workspace reativado retorna com campanhas, automações e conexões externas pausadas até confirmação do owner.
16. Exportação gera manifesto e checksum, usa objeto privado/URL curta autenticada, e expira; mídia incluída é contada e recuperável.
17. Testes de carga cobrem 1–5 instâncias por workspace, 100 mil+ contatos, 10 mil mensagens/instância/dia e burst concentrado, com limite de memória/latência/custo documentado.

## Status

**Parcialmente executado** por `web/scripts/test-db-migrations.mjs` usando PGlite (PostgreSQL WASM): ambas as migrations foram aplicadas em banco efêmero; verificados isolamento de workspace em workspaces/contatos/mensagens, atribuição só a membro, grants de colunas, negação de escrita direta em mensagem/outbox/consentimento e dispatch de campanha, ligação manual dentro da mesma empresa, controle owner/operator, deduplicação e acesso service-role à auditoria. Os testes passaram.

Ainda não foram testados no Supabase local/staging: Auth real/cookies, PostgREST/RPC, Storage/políticas de bucket/URLs assinadas, master/support, convites ponta a ponta, ciclo de exclusão/restore/backups, todos os caminhos de abuso e comportamento/carga do provedor. A migração não foi aplicada a nenhum projeto. Não conectar dados reais até executar esses testes e revisar o schema/RLS.
