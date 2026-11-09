import { createSupabaseServerClient } from '@/lib/supabase/server';
type MembershipRow={workspace_id:string;role:'owner'|'operator';status:'active'|'invited'|'suspended';workspaces:{id:string;name:string;status:string}|null};
export async function getMyWorkspaces(){
 const supabase=await createSupabaseServerClient();
 const {data,error}=await supabase.from('workspace_memberships').select('workspace_id,role,status,workspaces(id,name,status)').eq('status','active').order('workspace_id',{ascending:true}).limit(100);
 if(error)throw new Error(`Falha ao consultar workspaces: ${error.message}`);
 return ((data??[]) as unknown as MembershipRow[]).flatMap(row=>row.workspaces&&row.workspaces.status==='active'?[{id:row.workspace_id,name:row.workspaces.name,role:row.role,status:row.workspaces.status}]:[]);
}
