'use client';

import { createContext,useContext,useEffect,useMemo,useState } from 'react';

export type WorkspaceSummary={id:string;name:string;role:'owner'|'operator';status:string};
type WorkspaceContextValue={workspaces:WorkspaceSummary[];activeWorkspace:WorkspaceSummary|null;activeWorkspaceId:string|null;selectWorkspace:(id:string)=>void;renameWorkspace:(id:string,name:string)=>void;loading:boolean;demo:boolean};
const Context=createContext<WorkspaceContextValue|null>(null);
const configured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const demoWorkspaces:WorkspaceSummary[]=[{id:'demo-workspace',name:'Acme Conecta',role:'owner',status:'active'}];

export function WorkspaceProvider({children}:{children:React.ReactNode}){
 const [workspaces,setWorkspaces]=useState<WorkspaceSummary[]>(configured?[]:demoWorkspaces);
 const [activeId,setActiveId]=useState<string|null>(configured?null:'demo-workspace');
 const [loading,setLoading]=useState(configured);
 useEffect(()=>{
  if(!configured)return;
  let alive=true;
  fetch('/api/workspaces',{cache:'no-store'}).then(async r=>{if(!r.ok)throw new Error('workspace list unavailable');return await r.json() as {items:WorkspaceSummary[]}}).then(data=>{
   if(!alive)return;const items=Array.isArray(data.items)?data.items.filter(w=>w.status==='active'):[];setWorkspaces(items);
   const stored=window.localStorage.getItem('ienvia.activeWorkspace');const selected=items.find(w=>w.id===stored)??items[0]??null;setActiveId(selected?.id??null);if(selected)window.localStorage.setItem('ienvia.activeWorkspace',selected.id);
  }).catch(()=>{if(alive){setWorkspaces([]);setActiveId(null)}}).finally(()=>{if(alive)setLoading(false)});
  return()=>{alive=false};
 },[]);
 const selectWorkspace=(id:string)=>{if(!workspaces.some(w=>w.id===id))return;setActiveId(id);if(typeof window!=='undefined')window.localStorage.setItem('ienvia.activeWorkspace',id)};
 const renameWorkspace=(id:string,name:string)=>setWorkspaces(previous=>previous.map(workspace=>workspace.id===id?{...workspace,name}:workspace));
 const value=useMemo(()=>({workspaces,activeWorkspace:workspaces.find(w=>w.id===activeId)??null,activeWorkspaceId:activeId,selectWorkspace,renameWorkspace,loading,demo:!configured}),[workspaces,activeId,loading]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useWorkspace(){const value=useContext(Context);if(!value)throw new Error('useWorkspace precisa estar dentro de WorkspaceProvider');return value;}
