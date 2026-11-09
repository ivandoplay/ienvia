import { NextRequest,NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMessagePage,type MessageCursor } from '@/lib/data/conversations';

export const dynamic='force-dynamic';
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function decode(raw:string|null):MessageCursor|null{if(!raw||raw.length>400)return null;try{const v=JSON.parse(Buffer.from(raw,'base64url').toString('utf8')) as Partial<MessageCursor>;if(typeof v.id!=='string'||!UUID_RE.test(v.id)||typeof v.occurredAt!=='string'||Number.isNaN(new Date(v.occurredAt).getTime()))return null;return{id:v.id,occurredAt:v.occurredAt}}catch{return null}}
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store, max-age=0'}});
export async function GET(request:NextRequest,context:{params:Promise<{workspaceId:string;conversationId:string}>}){
 const {workspaceId,conversationId}=await context.params;if(!UUID_RE.test(workspaceId)||!UUID_RE.test(conversationId))return json({error:'Identificador inválido.'},400);
 try{const supabase=await createSupabaseServerClient();const {data:{user},error}=await supabase.auth.getUser();if(error||!user)return json({error:'Autenticação necessária.'},401);const params=request.nextUrl.searchParams;const amount=Number(params.get('limit')??40);const limit=Number.isFinite(amount)?Math.max(1,Math.min(50,Math.floor(amount))):40;const raw=params.get('before');const before=decode(raw);if(raw&&!before)return json({error:'Cursor inválido.'},400);const page=await getMessagePage({workspaceId,conversationId,before,limit});const nextCursor=page.nextCursor?Buffer.from(JSON.stringify(page.nextCursor)).toString('base64url'):null;return json({items:page.items,nextCursor})}
 catch(error){console.error('conversation timeline failed',error instanceof Error?error.name:'unknown');return json({error:'Não foi possível carregar a timeline.'},503)}
}
