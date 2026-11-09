import { createSupabaseServerClient } from '@/lib/supabase/server';

const MAX_PAGE_SIZE = 50;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONSENT = new Set(['unknown','opted_in','opted_out','restricted']);
type ContactRow = { id:string; display_name:string; phone_e164:string|null; email:string|null; channel:string; instance_id:string|null; consent_status:string; created_at:string; updated_at:string };
export type ContactPageCursor = { createdAt:string; id:string };

export async function getContactPage(input:{workspaceId:string;cursor?:ContactPageCursor|null;limit?:number;search?:string;consent?:string}) {
  if(!UUID_RE.test(input.workspaceId)) throw new Error('workspaceId inválido');
  const limit=Number.isFinite(input.limit)?Math.max(1,Math.min(MAX_PAGE_SIZE,Math.floor(input.limit!))):30;
  const supabase=await createSupabaseServerClient();
  let query=supabase.from('contacts')
    .select('id,display_name,phone_e164,email,channel,instance_id,consent_status,created_at,updated_at')
    .eq('workspace_id',input.workspaceId)
    .is('erased_at',null)
    .order('created_at',{ascending:false}).order('id',{ascending:false}).limit(limit+1);
  if(input.consent&&CONSENT.has(input.consent)) query=query.eq('consent_status',input.consent);
  const term=input.search?.trim().slice(0,80);
  if(term) query=query.ilike('display_name',`%${term.replace(/[\\%_]/g,'\\$&')}%`);
  const cursor=input.cursor;
  if(cursor&&UUID_RE.test(cursor.id)&&!Number.isNaN(new Date(cursor.createdAt).getTime())){
    const createdAt=new Date(cursor.createdAt).toISOString();
    query=query.or(`created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${cursor.id})`);
  }
  const {data,error}=await query;
  if(error) throw new Error(`Falha ao consultar contatos: ${error.message}`);
  const rows=(data??[]) as unknown as ContactRow[];
  const hasMore=rows.length>limit;
  const items=rows.slice(0,limit);
  const last=items.at(-1);
  return {items,nextCursor:hasMore&&last?{createdAt:last.created_at,id:last.id}:null};
}
