import { NextRequest,NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getContactPage,type ContactPageCursor } from '@/lib/data/contacts';

export const dynamic='force-dynamic';
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function decodeCursor(raw:string|null):ContactPageCursor|null{if(!raw||raw.length>400)return null;try{const v=JSON.parse(Buffer.from(raw,'base64url').toString('utf8')) as Partial<ContactPageCursor>;if(typeof v.id!=='string'||!UUID_RE.test(v.id)||typeof v.createdAt!=='string'||Number.isNaN(new Date(v.createdAt).getTime()))return null;return{id:v.id,createdAt:v.createdAt}}catch{return null}}
function json(body:unknown,status=200){return NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store, max-age=0'}})}
export async function POST(request:NextRequest,context:{params:Promise<{workspaceId:string}>}){
 const {workspaceId}=await context.params;if(!UUID_RE.test(workspaceId))return json({error:'Workspace inválido.'},400);
 const origin=request.headers.get('origin');if(origin&&origin!==request.nextUrl.origin)return json({error:'Origem não permitida.'},403);
 const contentLength=Number(request.headers.get('content-length')??0);if(contentLength>16_384)return json({error:'Requisição muito grande.'},413);
 try{
  const supabase=await createSupabaseServerClient();const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user)return json({error:'Autenticação necessária.'},401);
  const body=await request.json() as {name?:unknown;phone?:unknown;email?:unknown};
  if(typeof body.name!=='string'||body.name.trim().length<1||body.name.trim().length>120)return json({error:'Nome inválido.'},400);
  if(body.phone!==undefined&&body.phone!==null&&(typeof body.phone!=='string'||body.phone.length>32))return json({error:'Telefone inválido.'},400);
  if(body.email!==undefined&&body.email!==null&&(typeof body.email!=='string'||body.email.length>254))return json({error:'E-mail inválido.'},400);
  const {data,error}=await supabase.from('contacts').insert({workspace_id:workspaceId,channel:'manual',display_name:body.name.trim(),phone_e164:typeof body.phone==='string'&&body.phone.trim()?body.phone.trim():null,email:typeof body.email==='string'&&body.email.trim()?body.email.trim():null}).select('id,display_name,phone_e164,email,channel,consent_status,created_at,updated_at').single();
  if(error)return json({error:'Não foi possível criar o contato.'},403);
  return json({item:data},201);
 }catch(error){console.error('contact create failed',error instanceof Error?error.name:'unknown');return json({error:'Requisição inválida.'},400)}
}
export async function GET(request:NextRequest,context:{params:Promise<{workspaceId:string}>}){
 const {workspaceId}=await context.params;if(!UUID_RE.test(workspaceId))return json({error:'Workspace inválido.'},400);
 try{
  const supabase=await createSupabaseServerClient();const {data:{user},error}=await supabase.auth.getUser();if(error||!user)return json({error:'Autenticação necessária.'},401);
  const q=request.nextUrl.searchParams;const size=Number(q.get('limit')??30);const limit=Number.isFinite(size)?Math.max(1,Math.min(50,Math.floor(size))):30;const raw=q.get('cursor');const cursor=decodeCursor(raw);if(raw&&!cursor)return json({error:'Cursor inválido.'},400);
  const page=await getContactPage({workspaceId,cursor,limit,search:q.get('q')??undefined,consent:q.get('consent')??undefined});
  const nextCursor=page.nextCursor?Buffer.from(JSON.stringify(page.nextCursor)).toString('base64url'):null;return json({items:page.items,nextCursor});
 }catch(error){console.error('contacts page failed',error instanceof Error?error.name:'unknown');return json({error:'Não foi possível carregar os contatos.'},503)}
}
