import {NextRequest,NextResponse} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabase/server';

export const dynamic='force-dynamic';
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store, max-age=0'}});

export async function PATCH(request:NextRequest,context:{params:Promise<{workspaceId:string}>}){
 const {workspaceId}=await context.params;
 if(!UUID_RE.test(workspaceId))return json({error:'Workspace inválido.'},400);
 const origin=request.headers.get('origin');
 if(origin&&origin!==request.nextUrl.origin)return json({error:'Origem não permitida.'},403);
 if(Number(request.headers.get('content-length')??0)>4000)return json({error:'Requisição muito grande.'},413);
 try{
  const supabase=await createSupabaseServerClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user)return json({error:'Autenticação necessária.'},401);
  const body=await request.json() as {name?:unknown};
  if(typeof body.name!=='string'||body.name.trim().length<1||body.name.trim().length>160)return json({error:'O nome deve ter de 1 a 160 caracteres.'},400);
  const {data:membership,error:membershipError}=await supabase.from('workspace_memberships').select('role,status').eq('workspace_id',workspaceId).eq('user_id',user.id).maybeSingle();
  if(membershipError)return json({error:'Não foi possível verificar seu acesso.'},500);
  if(!membership||membership.status!=='active'||membership.role!=='owner')return json({error:'Somente o proprietário ativo pode alterar estes dados.'},403);
  const {data,error}=await supabase.from('workspaces').update({name:body.name.trim()}).eq('id',workspaceId).select('id,name,status').maybeSingle();
  if(error){console.error('workspace update failed',error.code);return json({error:error.code==='42501'?'Acesso não autorizado.':'Não foi possível salvar as informações.'},error.code==='42501'?403:500)}
  if(!data)return json({error:'Workspace não encontrado ou indisponível.'},404);
  return json({item:data});
 }catch(error){console.error('workspace update request failed',error instanceof Error?error.name:'unknown');return json({error:'Requisição inválida.'},400)}
}
