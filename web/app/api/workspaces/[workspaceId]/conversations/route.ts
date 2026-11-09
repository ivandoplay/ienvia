import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getConversationPage, type ConversationCursor } from '@/lib/data/conversations';

export const dynamic = 'force-dynamic';
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function decodeCursor(raw:string|null):ConversationCursor|null{
 if(!raw||raw.length>400)return null;
 try{const value=JSON.parse(Buffer.from(raw,'base64url').toString('utf8')) as Partial<ConversationCursor>;if(typeof value.id!=='string'||!UUID_RE.test(value.id)||typeof value.activityAt!=='string'||Number.isNaN(new Date(value.activityAt).getTime()))return null;return{id:value.id,activityAt:value.activityAt}}catch{return null}
}
function json(body:unknown,status=200){return NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store, max-age=0'}})}
export async function GET(request:NextRequest,context:{params:Promise<{workspaceId:string}>}){
 const {workspaceId}=await context.params;if(!UUID_RE.test(workspaceId))return json({error:'Workspace inválido.'},400);
 try{
  const supabase=await createSupabaseServerClient();const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user)return json({error:'Autenticação necessária.'},401);
  const query=request.nextUrl.searchParams;const limitRaw=Number(query.get('limit')??30);const limit=Number.isFinite(limitRaw)?Math.max(1,Math.min(50,Math.floor(limitRaw))):30;
  const rawCursor=query.get('cursor');const cursor=decodeCursor(rawCursor);if(rawCursor&&!cursor)return json({error:'Cursor inválido.'},400);
  const page=await getConversationPage({workspaceId,cursor,limit,stage:query.get('stage')??undefined,search:query.get('q')??undefined});
  const nextCursor=page.nextCursor?Buffer.from(JSON.stringify(page.nextCursor)).toString('base64url'):null;
  return json({items:page.items,nextCursor});
 }catch(error){console.error('conversations page failed',error instanceof Error?error.name:'unknown');return json({error:'Não foi possível carregar as conversas.'},503)}
}
