'use client';

import {FormEvent,useEffect,useState} from 'react';
import {ModulePage} from '@/components/module-page';
import {useWorkspace} from '@/components/workspace-context';

type Tab='geral'|'privacidade'|'acessos';
export default function SettingsPage(){
 const {activeWorkspace,activeWorkspaceId,loading:workspaceLoading,demo,renameWorkspace}=useWorkspace();
 const [tab,setTab]=useState<Tab>('geral');
 const [name,setName]=useState('');
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 useEffect(()=>{setName(activeWorkspace?.name??'')},[activeWorkspace?.id,activeWorkspace?.name]);
 const toast=(value:string)=>{setNotice(value);window.setTimeout(()=>setNotice(''),3500)};
 async function saveWorkspace(e:FormEvent){
  e.preventDefault();setError('');
  if(demo){setError('As alterações persistentes exigem sua sessão autenticada.');return}
  if(!activeWorkspaceId){setError('Nenhum workspace ativo está selecionado.');return}
  const cleanName=name.trim();
  if(!cleanName||cleanName.length>160){setError('Use um nome entre 1 e 160 caracteres.');return}
  setSaving(true);
  try{
   const response=await fetch(`/api/workspaces/${activeWorkspaceId}`,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({name:cleanName})});
   const data=await response.json() as {item?:{name:string};error?:string};
   if(!response.ok)throw new Error(data.error||'Não foi possível salvar.');
   renameWorkspace(activeWorkspaceId,data.item?.name??cleanName);
   toast('Nome do workspace salvo.');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao salvar as informações.')}
  finally{setSaving(false)}
 }
 return <>
  <ModulePage title="Configurações" description="Gerencie informações do seu workspace e confira o escopo do seu acesso."/>
  <div className="module-tabs">{([['geral','Workspace'],['privacidade','Dados e privacidade'],['acessos','Acessos']] as const).map(([key,label])=><button key={key} onClick={()=>setTab(key)} className={tab===key?'module-tab-active':''}>{label}</button>)}</div>
  {tab==='geral'&&<div className="settings-columns">
   <section className="surface settings-card">
    <div className="panel-title">Dados do workspace</div><div className="panel-subtitle">Estas informações pertencem somente à empresa/workspace selecionado.</div>
    <form onSubmit={saveWorkspace}>
     <label className="setting-field">Nome do workspace<input value={name} onChange={e=>setName(e.target.value)} maxLength={160} required disabled={workspaceLoading||saving||!activeWorkspaceId}/></label>
     {error&&<p className="login-error" role="alert">{error}</p>}
     <button className="primary-button" disabled={workspaceLoading||saving||!activeWorkspaceId}>{saving?'Salvando…':'Salvar alterações'}</button>
    </form>
    {!activeWorkspace&&<p className="report-note">{workspaceLoading?'Carregando workspace…':'Nenhum workspace ativo encontrado para esta sessão.'}</p>}
   </section>
   <section className="surface settings-card">
    <div className="panel-title">Seu nível de acesso</div><div className="panel-subtitle">A permissão é aplicada no servidor e também pelo banco de dados.</div>
    <div className="plan-row"><span>Workspace</span><strong>{activeWorkspace?.name??'—'}</strong></div>
    <div className="plan-row"><span>Função</span><strong>{activeWorkspace?.role==='owner'?'Proprietário (owner)':activeWorkspace?.role==='operator'?'Operador':'—'}</strong></div>
    <div className="report-note">O proprietário administra este workspace. Plano, cobrança e cotas ainda não têm controles de edição nesta versão.</div>
   </section>
  </div>}
  {tab==='privacidade'&&<section className="surface settings-card">
   <div className="panel-title">Dados e privacidade</div><div className="panel-subtitle">As políticas de retenção e os pedidos de titulares ainda não têm uma tela de edição conectada ao backend.</div>
   <p className="report-note">Não exibimos valores de demonstração nem afirmamos que uma alteração foi salva. Os dados do workspace permanecem como estão até a implementação dos controles auditados.</p>
  </section>}
  {tab==='acessos'&&<div className="settings-columns">
   <section className="surface settings-card">
    <div className="panel-title">Acesso ao workspace</div><div className="panel-subtitle">Sua sessão e sua função no workspace selecionado.</div>
    <div className="plan-row"><span>Função</span><strong>{activeWorkspace?.role==='owner'?'Proprietário (owner)':activeWorkspace?.role==='operator'?'Operador':'—'}</strong></div>
    <div className="report-note">Convites e gerenciamento de equipe ainda não estão disponíveis nesta tela.</div>
   </section>
   <section className="surface settings-card">
    <div className="panel-title">Administrador da plataforma</div><div className="panel-subtitle">Acesso de suporte global é diferente do acesso de proprietário da sua empresa.</div>
    <div className="policy-note"><strong>Escopo de segurança</strong><span>Você é proprietário do workspace Ienvia. Não concedi acesso Master global, que poderia atravessar workspaces de outros clientes.</span></div>
   </section>
  </div>}
  {notice&&<div className="inbox-toast" role="status">ⓘ &nbsp;{notice}</div>}
 </>;
}
