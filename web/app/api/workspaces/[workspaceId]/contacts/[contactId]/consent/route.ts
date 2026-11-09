import { NextRequest,NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
export const dynamic='force-dynamic';
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTIONS=new Set(['granted','withdrawn','opted_out','reconfirmed']);
const SOURCES=new Set(['whatsapp','instagram','web_form','manual','imported','paper_form','phone','other']);
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store, max-age=0'}});
export async function GET(_request:NextRequest,context:{params:Promise<{workspaceId:string;contactId:string}>}){
 const {workspaceId,contactId}=await context.params;
 if(!UUID_RE.test(workspaceId)||!UUID_RE.test(contactId))return json({error:'Identificador inválido.'},400);
 try{
  const supabase=await createSupabaseServerClient();const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user)return json({error:'Autenticação necessária.'},401);
  const {data,error}=await supabase.from('contact_consent_events').select('id,purpose,action,source,evidence_reference,occurred_at,created_at').eq('workspace_id',workspaceId).eq('contact_id',contactId).order('occurred_at',{ascending:false}).order('id',{ascending:false}).limit(50);
  if(error){console.error('consent history query failed',error.code);return json({error:error.code==='42501'?'Acesso não autorizado.':'Não foi possível carregar o histórico.'},error.code==='42501'?403:500)}
  return json({items:data??[]});
 }catch(error){console.error('consent history request failed',error instanceof Error?error.name:'unknown');return json({error:'Não foi possível carregar o histórico.'},500)}
}
export async function POST(request:NextRequest,context:{params:Promise<{workspaceId:string;contactId:string}>}){
 const {workspaceId,contactId}=await context.params;
 if(!UUID_RE.test(workspaceId)||!UUID_RE.test(contactId))return json({error:'Identificador inválido.'},400);
 const origin=request.headers.get('origin');if(origin&&origin!==request.nextUrl.origin)return json({error:'Origem não permitida.'},403);
 if(Number(request.headers.get('content-length')??0)>8192)return json({error:'Requisição muito grande.'},413);
 try{
  const supabase=await createSupabaseServerClient();const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user)return json({error:'Autenticação necessária.'},401);
  const body=await request.json() as {purpose?:unknown;action?:unknown;source?:unknown;evidenceReference?:unknown;occurredAt?:unknown};
  if(typeof body.purpose!=='string'||body.purpose.trim().length<1||body.purpose.trim().length>80)return json({error:'Finalidade inválida.'},400);
  if(typeof body.action!=='string'||!ACTIONS.has(body.action))return json({error:'Ação inválida.'},400);
  if(typeof body.source!=='string'||!SOURCES.has(body.source))return json({error:'Origem inválida.'},400);
  if(body.evidenceReference!==undefined&&body.evidenceReference!==null&&(typeof body.evidenceReference!=='string'||body.evidenceReference.length>2048))return json({error:'Referência de evidência inválida.'},400);
  if((body.action==='granted'||body.action==='reconfirmed')&&(typeof body.evidenceReference!=='string'||!body.evidenceReference.trim()))return json({error:'É necessária uma referência de evidência para registrar consentimento.'},400);
  const occurredAt=typeof body.occurredAt==='string'?new Date(body.occurredAt):new Date();if(Number.isNaN(occurredAt.getTime())||occurredAt.getTime()>Date.now()+5*60_000)return json({error:'Data de consentimento inválida.'},400);
  const {data,error}=await supabase.rpc('record_contact_consent',{p_workspace_id:workspaceId,p_contact_id:contactId,p_purpose:body.purpose.trim(),p_action:body.action,p_source:body.source,p_evidence_reference:typeof body.evidenceReference==='string'?body.evidenceReference.trim():null,p_occurred_at:occurredAt.toISOString()});
  if(error){console.error('consent RPC failed',error.code);return json({error:error.code==='42501'?'Acesso não autorizado.':error.code==='22023'?'Dados de consentimento inválidos.':'Não foi possível registrar o consentimento.'},error.code==='42501'?403:error.code==='22023'?400:500)}
  return json({eventId:data},201);
 }catch(error){console.error('consent request failed',error instanceof Error?error.name:'unknown');return json({error:'Requisição inválida.'},400)}
}
