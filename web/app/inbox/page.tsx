'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@/components/workspace-context';

type Stage = 'ai' | 'waiting' | 'human' | 'resolved' | 'new' | 'waiting_customer' | 'archived';
type Message = { id: string | number; direction: 'in' | 'out'; text: string; time: string; sender: string };
type Conversation = { id: string | number; initials: string; name: string; preview: string; channel: string; owner: string; stage: Stage; time: string; unread?: number; phone: string; tag: string; messages: Message[]; engine?: string };

const seed: Conversation[] = [
  { id: 1, initials: 'CS', name: 'Camila Souza', preview: 'Olá! Gostaria de saber mais sobre os planos.', channel: 'WhatsApp · Vendas', owner: 'IA · Vendas', stage: 'ai', time: '10:42', unread: 2, phone: '+55 11 998••-2041', tag: 'Novo lead', messages: [{id:1,direction:'in',text:'Olá! Gostaria de saber mais sobre os planos.',time:'10:38',sender:'Camila Souza'},{id:2,direction:'out',text:'Oi, Camila! Claro, posso te ajudar. O que é mais importante para você neste momento?',time:'10:39',sender:'IA · Vendas'},{id:3,direction:'in',text:'Queria entender como funciona para uma equipe pequena.',time:'10:42',sender:'Camila Souza'}] },
  { id: 2, initials: 'AF', name: 'Ana Ferreira', preview: 'Você pode me ajudar com o pedido?', channel: 'WhatsApp · Suporte', owner: 'Aguardando humano', stage: 'waiting', time: '10:18', unread: 1, phone: '+55 21 987••-1168', tag: 'Pedido #3842', messages: [{id:1,direction:'in',text:'Meu pedido ainda não chegou e o prazo era ontem.',time:'10:09',sender:'Ana Ferreira'},{id:2,direction:'out',text:'Sinto muito pelo atraso. Vou encaminhar para uma pessoa da equipe verificar o status para você.',time:'10:10',sender:'IA · Suporte'},{id:3,direction:'in',text:'Você pode me ajudar com o pedido?',time:'10:18',sender:'Ana Ferreira'}] },
  { id: 3, initials: 'JM', name: 'João Mendes', preview: 'Qual o horário de funcionamento?', channel: 'WhatsApp · Suporte', owner: 'IA · Suporte', stage: 'ai', time: '09:56', phone: '+55 31 991••-6730', tag: 'Dúvida', messages: [{id:1,direction:'in',text:'Qual o horário de funcionamento?',time:'09:56',sender:'João Mendes'}] },
  { id: 4, initials: 'RL', name: 'Rafael Lima', preview: 'Perfeito, obrigado pelo retorno!', channel: 'WhatsApp · Vendas', owner: 'Marina Alves', stage: 'resolved', time: '09:31', phone: '+55 41 999••-4120', tag: 'Pós-venda', messages: [{id:1,direction:'in',text:'Consegui acessar a minha conta, obrigado!',time:'09:28',sender:'Rafael Lima'},{id:2,direction:'out',text:'Que bom, Rafael! Se precisar de algo, estamos por aqui.',time:'09:31',sender:'Marina Alves'}] },
  { id: 5, initials: 'BC', name: 'Beatriz Costa', preview: 'Quero atualizar meu cadastro.', channel: 'WhatsApp · Suporte', owner: 'Marina Alves', stage: 'human', time: '09:14', phone: '+55 85 988••-0094', tag: 'Cadastro', messages: [{id:1,direction:'in',text:'Quero atualizar meu cadastro.',time:'09:12',sender:'Beatriz Costa'},{id:2,direction:'out',text:'Claro, Beatriz. Vou te orientar por aqui.',time:'09:14',sender:'Marina Alves'}] },
];
const stageLabel: Record<Stage,string> = { ai: 'Em atendimento pela IA', waiting: 'Aguardando humano', human: 'Em atendimento humano', waiting_customer:'Aguardando cliente', resolved: 'Resolvida', new:'Nova', archived:'Arquivada' };
const stageFromDb=(stage:string):Stage=>stage==='waiting_human'?'waiting':stage==='ai'||stage==='human'||stage==='resolved'||stage==='new'||stage==='waiting_customer'||stage==='archived'?stage:'new';
const initials=(name:string)=>name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();

export default function InboxPage() {
  const {activeWorkspaceId,demo,loading:workspaceLoading}=useWorkspace();
  const [conversations, setConversations] = useState<Conversation[]>(demo?seed:[]);
  const [selectedId, setSelectedId] = useState<string|number>(demo?1:'');
  const [filter, setFilter] = useState<'all'|Stage>('all');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [mobilePane, setMobilePane] = useState<'list'|'chat'>('list');
  const [backendMode,setBackendMode]=useState(!demo);
  const [dataLoading,setDataLoading]=useState(!demo);
  const [dataError,setDataError]=useState('');
  const selected = conversations.find(c => c.id === selectedId) ?? null;
  const filtered = useMemo(() => conversations.filter(c => (filter === 'all' || c.stage === filter) && `${c.name} ${c.preview} ${c.channel}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))), [conversations, filter, query]);
  const updateSelected = (updates: Partial<Conversation>) => setConversations(prev => prev.map(c => c.id === selectedId ? { ...c, ...updates } : c));
  const showNotice = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(''), 3200); };
  const select = (id: string|number) => { setSelectedId(id); setMobilePane('chat'); };

  useEffect(()=>{
    if(demo){setConversations(seed);setSelectedId(1);setBackendMode(false);setDataLoading(false);return}
    if(workspaceLoading)return;
    if(!activeWorkspaceId){setConversations([]);setSelectedId('');setBackendMode(true);setDataLoading(false);return}
    let alive=true;setDataLoading(true);setDataError('');setBackendMode(true);
    fetch(`/api/workspaces/${activeWorkspaceId}/conversations?limit=30`,{cache:'no-store'}).then(async r=>{if(!r.ok)throw new Error('Não foi possível carregar a fila.');return await r.json() as {items:Array<{id:string;stage:string;assigned_label:string|null;activity_at:string;last_message_preview:string|null;unread_count:number;automation_paused:boolean;contact:{display_name:string;phone_e164:string|null;channel:string}|null;instance:{display_name:string;channel:string;engine:string}|null}>}}).then(result=>{
      if(!alive)return;const mapped=result.items.map(row=>({id:row.id,initials:initials(row.contact?.display_name||'Contato'),name:row.contact?.display_name||'Contato',preview:row.last_message_preview||'Sem mensagens',channel:`${row.instance?.channel||'Canal'} · ${row.instance?.display_name||'Instância'}`,owner:row.assigned_label||'Sem responsável',stage:stageFromDb(row.stage),time:new Date(row.activity_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),phone:row.contact?.phone_e164||'—',tag:'',messages:[],engine:row.instance?.engine||'—'}));setConversations(mapped);setSelectedId(mapped[0]?.id??'');
    }).catch(e=>{if(alive){setConversations([]);setSelectedId('');setDataError(e instanceof Error?e.message:'Erro ao carregar conversas.')}}).finally(()=>{if(alive)setDataLoading(false)});
    return()=>{alive=false};
  },[activeWorkspaceId,demo,workspaceLoading]);

  useEffect(()=>{
    if(demo||!backendMode||!activeWorkspaceId||typeof selectedId!=='string'||!selectedId)return;
    let alive=true;
    fetch(`/api/workspaces/${activeWorkspaceId}/conversations/${selectedId}/messages?limit=40`,{cache:'no-store'}).then(async r=>{if(!r.ok)throw new Error('Timeline indisponível.');return await r.json() as {items:Array<{id:string;direction:'inbound'|'outbound';actor_type:string;body_text:string|null;occurred_at:string}>}}).then(result=>{if(!alive)return;const messages=result.items.map(m=>({id:m.id,direction:m.direction==='outbound'?'out' as const:'in' as const,text:m.body_text||'[Mídia]',time:new Date(m.occurred_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),sender:m.actor_type==='ai'?'IA':m.actor_type==='human'?'Atendente':m.actor_type==='contact'?(selected?.name||'Contato'):'Sistema'}));setConversations(prev=>prev.map(c=>c.id===selectedId?{...c,messages}:c))}).catch(()=>{if(alive)showNotice('Não foi possível carregar a timeline desta conversa.')});
    return()=>{alive=false};
  },[selectedId,activeWorkspaceId,demo,backendMode]);
  const sendDemoReply = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if(backendMode){showNotice('Envio real ainda está bloqueado até concluir o outbox autenticado e os testes do canal.');return} const text = draft.trim(); if (!text||!selected) return; updateSelected({ messages: [...selected.messages, { id: Date.now(), direction:'out', text, time:'agora', sender:'Marina Alves' }], preview:text, time:'agora', owner:'Marina Alves', stage:selected.stage === 'waiting' ? 'human' : selected.stage }); setDraft(''); showNotice('Resposta adicionada apenas à demonstração — nada foi enviado.'); };
  const claim = () => { if(backendMode){showNotice('Ação persistente indisponível até integrar transição auditada.');return} updateSelected({ stage:'human', owner:'Marina Alves' }); showNotice('Conversa assumida na demonstração. A IA permanece pausada.'); };
  const resumeAi = () => { if(backendMode){showNotice('Retomada persistente indisponível até integrar transição auditada.');return} if(!selected)return;updateSelected({ stage:'ai', owner:selected.channel.includes('Vendas')?'IA · Vendas':'IA · Suporte' }); showNotice('IA retomada explicitamente na demonstração.'); };
  const resolve = () => { if(backendMode){showNotice('Resolução persistente indisponível até integrar transição auditada.');return} updateSelected({ stage:'resolved', owner:'Marina Alves' }); showNotice('Conversa marcada como resolvida na demonstração.'); };
  const stageClass = (stage: Stage) => stage==='waiting'?'state-wait':stage==='resolved'?'state-done':stage==='human'?'state-live':'state-live';

  return <>
    <div className="page-heading inbox-heading"><div><p className="eyebrow">ATENDIMENTO</p><h1>Inbox</h1><p className="page-description">Acompanhe conversas, assuma atendimentos e mantenha o contexto em um só lugar.</p></div><div className="page-heading-actions"><button className="secondary-button">Todas as instâncias⌄</button><button className="secondary-button">⋯</button></div></div>
    <section className={`inbox-layout ${mobilePane==='chat'?'mobile-chat-open':''}`}>
      <aside className="inbox-list surface">
        <div className="inbox-list-head"><div><strong>Conversas</strong><span>{backendMode?`${conversations.length} nesta página`:'12 abertas · demo'}</span></div><button className="inbox-more" aria-label="Mais opções">＋</button></div>
        <label className="inbox-search"><span>⌕</span><input aria-label="Buscar conversas" placeholder="Buscar contato..." value={query} onChange={e=>setQuery(e.target.value)}/></label>
        <div className="inbox-filters" aria-label="Filtrar conversas">{[['all','Todas'],['waiting','Aguardando'],['human','Humano'],['resolved','Resolvidas']].map(([key,label])=><button key={key} className={filter===key?'filter-active':''} onClick={()=>setFilter(key as typeof filter)}>{label}</button>)}</div>
        <div className="conversation-list">{dataLoading?<div className="no-results">Carregando fila…</div>:dataError?<div className="no-results">{dataError}</div>:filtered.map(c=><button key={c.id} className={`conversation-item ${selected?.id===c.id?'conversation-selected':''}`} onClick={()=>select(c.id)}><span className="person-avatar conversation-avatar">{c.initials}</span><span className="conversation-copy"><span className="conversation-top"><strong>{c.name}</strong><time>{c.time}</time></span><span className="conversation-preview">{c.preview}</span><span className="conversation-bottom"><span>{c.channel}</span>{c.unread&&<b>{c.unread}</b>}</span></span></button>)}{!dataLoading&&!dataError&&filtered.length===0&&<div className="no-results">Nenhuma conversa neste filtro.</div>}</div>
        <div className="list-footer">{backendMode?`Página atual: ${filtered.length} conversas`:`Mostrando ${filtered.length} de ${conversations.length} conversas demonstrativas`}</div>
      </aside>
      <section className="thread-panel surface">
        {selected ? <>
          <header className="thread-head"><button className="back-to-list" onClick={()=>setMobilePane('list')}>← Conversas</button><span className="person-avatar thread-avatar">{selected.initials}</span><div className="thread-person"><strong>{selected.name}</strong><span>{selected.channel} · {selected.phone}</span></div><span className={`state-pill ${stageClass(selected.stage)}`}>{stageLabel[selected.stage]}</span><button className="thread-more" aria-label="Ações da conversa">⋯</button></header>
          <div className="thread-context"><span>◉</span><span>Motor <strong>{selected.engine||'Evolution'}</strong> · {backendMode?'timeline paginada do workspace':'timeline demonstrativa'}</span><button onClick={()=>showNotice(backendMode?'Detalhes de instância ainda não conectados.':'Dados da instância são apenas ilustrativos.')}>Ver instância</button></div>
          <div className="message-stream"><div className="day-divider"><span>{backendMode?'Mensagens mais recentes':'Hoje, 5 de novembro'}</span></div>{selected.messages.map(m=><div key={m.id} className={`message-row ${m.direction==='out'?'message-out':''}`}><div className="message-bubble"><span className="message-sender">{m.sender}</span><p>{m.text}</p><time>{m.time}</time></div></div>)}{backendMode&&selected.messages.length===0&&<div className="no-results">Carregando ou sem mensagens nesta conversa.</div>}</div>
          <div className="composer-area">{selected.stage==='waiting'&&<div className="handoff-banner"><span>↗</span><div><strong>Aguardando atendimento humano</strong><small>A IA não responderá até a equipe assumir e retomar explicitamente.</small></div><button onClick={claim} disabled={backendMode}>Assumir</button></div>}{selected.stage==='human'&&<div className="handoff-banner human-banner"><span>Ⅱ</span><div><strong>IA pausada nesta conversa</strong><small>Retome a IA somente quando quiser devolver o atendimento.</small></div><button onClick={resumeAi} disabled={backendMode}>Retomar IA</button></div>}
            <form className="composer" onSubmit={sendDemoReply}><textarea value={draft} onChange={e=>setDraft(e.target.value)} disabled={backendMode} placeholder={backendMode?'Envio ficará habilitado após integrar outbox e confirmação humana...':'Escreva uma resposta...'} aria-label="Escreva uma resposta" onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.currentTarget.form?.requestSubmit()}}}/><div className="composer-tools"><span>{backendMode?'Envio desabilitado até testes do canal':'Resposta manual · somente demonstração'}</span><div><button type="button" className="resolve-button" onClick={resolve} disabled={backendMode}>✓ Resolver</button><button className="send-demo-button" type="submit" disabled={backendMode||!draft.trim()}>Enviar ↗</button></div></div></form>
          </div>
        </> : <div className="module-empty">Selecione uma conversa</div>}
      </section>
      <aside className="contact-panel surface">{selected?<><div className="contact-profile"><span className="contact-big-avatar">{selected.initials}</span><strong>{selected.name}</strong><span>{selected.phone}</span><div><button onClick={()=>showNotice(backendMode?'Perfil de contato ainda não carregado nesta tela.':'Perfil CRM demonstrativo.')}>Ver perfil</button><button onClick={()=>showNotice('Edição de contato demonstrativa.')}>Editar</button></div></div><div className="contact-detail"><h3>Detalhes do contato</h3><dl><dt>Canal / instância</dt><dd>{selected.channel}</dd><dt>Responsável</dt><dd>{selected.owner}</dd><dt>Etapa</dt><dd><span className={`state-pill ${stageClass(selected.stage)}`}>{stageLabel[selected.stage]}</span></dd><dt>Etiqueta</dt><dd><span className="contact-tag">{selected.tag||'—'}</span></dd></dl></div><div className="contact-detail contact-history"><h3>Resumo</h3><p>As informações do perfil e histórico são limitadas ao contato selecionado.</p><button onClick={()=>showNotice('Histórico completo ainda não conectado.')}>Ver histórico completo →</button></div></>:<div className="module-empty">{dataLoading?'Carregando contato…':dataError||'Selecione uma conversa.'}</div>}</aside>
    </section>
    {notice&&<div className="inbox-toast" role="status">ⓘ &nbsp;{notice}</div>}
  </>;
}
