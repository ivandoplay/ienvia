# Ienvia — primeiro incremento visual

Protótipo responsivo da Visão geral do workspace, criado em HTML/CSS/JS sem dependências externas. É intencionalmente uma interface de demonstração: números e eventos são fictícios; navegação e notificações locais são interativas, mas não há integração com Supabase, WhatsApp, Instagram ou envio de mensagens.

## Executar

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

A aplicação principal agora está em `../web/`, implementada em Next.js + TypeScript, com uma rota independente por módulo. Este HTML é mantido apenas como referência visual do primeiro rascunho. A próxima etapa técnica deve validar a organização das páginas e implementar o primeiro fluxo vertical da Inbox com dados demonstrativos; backend e chamadas reais continuam desligados.
