'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { WorkspaceProvider,useWorkspace } from '@/components/workspace-context';

const sections = [
  { label: 'Workspace', items: [
    { href: '/visao-geral', label: 'Visão geral', icon: '◫' },
    { href: '/inbox', label: 'Inbox', icon: '▤', badge: '12' },
    { href: '/contatos', label: 'Contatos', icon: '♙' },
    { href: '/campanhas', label: 'Campanhas', icon: '➤' },
  ]},
  { label: 'Atendimento inteligente', items: [
    { href: '/ia-automacao', label: 'IA e automação', icon: '✳' },
    { href: '/canais-instancias', label: 'Canais e instâncias', icon: '⌁', badge: '3/5' },
  ]},
  { label: 'Gestão', items: [
    { href: '/relatorios', label: 'Relatórios', icon: '⌁' },
    { href: '/configuracoes', label: 'Configurações', icon: '⚙' },
  ]},
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return <WorkspaceProvider><ShellContent>{children}</ShellContent></WorkspaceProvider>;
}
function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { workspaces,activeWorkspace,selectWorkspace,loading,demo } = useWorkspace();
  const title = sections.flatMap(section => section.items).find(item => item.href === pathname)?.label ?? 'Ienvia';
  const initials=(name:string)=>name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
  return <div className="app-frame">
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Link className="brand" href="/visao-geral" onClick={() => setSidebarOpen(false)}><span className="brand-symbol">✳</span><span>ienvia</span></Link>
      <div className="workspace-picker-wrap"><button className="workspace-switch" type="button" aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}><span className="workspace-logo">{activeWorkspace?initials(activeWorkspace.name):'—'}</span><span className="workspace-text"><strong>{loading?'Carregando…':activeWorkspace?.name??'Sem workspace'}</strong><small>{demo?'Demonstração local':activeWorkspace?.role==='owner'?'Workspace do proprietário':activeWorkspace?'Workspace compartilhado':'Acesso pendente'}</small></span><span className="chevron">⌄</span></button>
        {menuOpen&&<div className="workspace-menu" role="menu">{workspaces.length?workspaces.map(w=><button role="menuitem" key={w.id} onClick={()=>{selectWorkspace(w.id);setMenuOpen(false)}} className={w.id===activeWorkspace?.id?'workspace-option selected':''}><span className="workspace-option-mark">{initials(w.name)}</span><span><strong>{w.name}</strong><small>{w.role==='owner'?'Proprietário':'Operador'}</small></span>{w.id===activeWorkspace?.id&&<b>✓</b>}</button>):<p>{loading?'Carregando seus espaços…':demo?'Workspace de demonstração':'Nenhum workspace ativo disponível.'}</p>}</div>}
      </div>
      <nav aria-label="Navegação principal">{sections.map(section => <div className="nav-section" key={section.label}><p className="nav-heading">{section.label}</p>{section.items.map(item => <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`nav-link ${pathname === item.href ? 'nav-active' : ''}`} aria-current={pathname === item.href ? 'page' : undefined}><span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}</Link>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="agent-status"><span className={`online-dot ${demo?'demo-dot':''}`}/><div><strong>Agente local</strong><small>{demo?'Não conectado · demonstração':'Estado da conexão não carregado'}</small></div></div><div className="profile-row"><span className="avatar">{demo?'MA':'U'}</span><span><strong>{demo?'Marina Alves':'Conta autenticada'}</strong><small>{demo?'Proprietária':'Sessão Supabase'}</small></span><span className="chevron">⌄</span></div></div>
    </aside>
    {sidebarOpen && <button className="sidebar-scrim" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}
    <div className="main-column">
      <header className="topbar"><button className="mobile-menu" type="button" aria-label="Abrir navegação" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button><div className="breadcrumbs"><span>{activeWorkspace?.name??'Workspace'}</span><span className="crumb-sep">/</span><strong>{title}</strong></div><div className="top-actions"><div className="search-box"><span aria-hidden="true">⌕</span><span>Buscar contatos, conversas...</span><kbd>⌘ K</kbd></div><button className="icon-button" aria-label="Notificações">♧<i/></button><span className="avatar top-avatar">{demo?'MA':'U'}</span></div></header>
      <main className="main-content">{children}<div className="prototype-note"><span>ⓘ</span><span>{demo?'Protótipo funcional. Dados ilustrativos; sem integração com backend/canais ou envio.':'Interface conectada a uma sessão autenticada; os módulos ainda não estão ligados a dados reais.'}</span></div></main>
    </div>
  </div>;
}
