import { createSupabaseServerClient } from '@/lib/supabase/server';

const MAX_PAGE_SIZE = 50;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STAGES = new Set(['new','ai','waiting_human','human','waiting_customer','resolved','archived']);

type ConversationRow = {
  id: string; workspace_id: string; contact_id: string; instance_id: string; stage: string;
  assigned_user_id: string | null; assigned_label: string | null; automation_paused: boolean;
  activity_at: string; last_message_at: string | null; last_message_preview: string | null; unread_count: number;
};
type ContactRow = { id: string; display_name: string; phone_e164: string | null; channel: string };
type InstanceRow = { id: string; display_name: string; channel: string; engine: string };
export type ConversationCard = ConversationRow & { contact: ContactRow | null; instance: InstanceRow | null };
export type ConversationCursor = { activityAt: string; id: string };

function pageSize(value: number) { return Number.isFinite(value) ? Math.max(1, Math.min(MAX_PAGE_SIZE, Math.floor(value))) : 30; }
function canonicalCursor(cursor?: ConversationCursor | null): ConversationCursor | null {
  if (!cursor || !UUID_RE.test(cursor.id)) return null;
  const d = new Date(cursor.activityAt);
  return Number.isNaN(d.getTime()) ? null : { id: cursor.id, activityAt: d.toISOString() };
}

/** Tenant-scoped keyset page. RLS remains authoritative even if a caller guesses another workspace UUID. */
export async function getConversationPage(input: {
  workspaceId: string;
  cursor?: ConversationCursor | null;
  limit?: number;
  stage?: string;
  search?: string;
}): Promise<{ items: ConversationCard[]; nextCursor: ConversationCursor | null }> {
  if (!UUID_RE.test(input.workspaceId)) throw new Error('workspaceId inválido');
  const size = pageSize(input.limit ?? 30);
  const cursor = canonicalCursor(input.cursor);
  const supabase = await createSupabaseServerClient();
  let query = supabase.from('conversations')
    .select('id,workspace_id,contact_id,instance_id,stage,assigned_user_id,assigned_label,automation_paused,activity_at,last_message_at,last_message_preview,unread_count')
    .eq('workspace_id', input.workspaceId)
    .order('activity_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(size + 1);
  if (input.stage && STAGES.has(input.stage)) query = query.eq('stage', input.stage);
  if (cursor) query = query.or(`activity_at.lt.${cursor.activityAt},and(activity_at.eq.${cursor.activityAt},id.lt.${cursor.id})`);
  const term = input.search?.trim().slice(0, 100);
  if (term) query = query.ilike('last_message_preview', `%${term.replace(/[\\%_]/g, '\\$&')}%`);

  const { data, error } = await query;
  if (error) throw new Error(`Falha ao consultar conversas: ${error.message}`);
  const rows = (data ?? []) as unknown as ConversationRow[];
  const hasMore = rows.length > size;
  const page = rows.slice(0, size);
  const contactIds = [...new Set(page.map(row => row.contact_id))];
  const instanceIds = [...new Set(page.map(row => row.instance_id))];
  const [contactsResult, instancesResult] = await Promise.all([
    contactIds.length ? supabase.from('contacts').select('id,display_name,phone_e164,channel').eq('workspace_id', input.workspaceId).in('id', contactIds) : Promise.resolve({ data: [], error: null }),
    instanceIds.length ? supabase.from('instances').select('id,display_name,channel,engine').eq('workspace_id', input.workspaceId).in('id', instanceIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (contactsResult.error) throw new Error(`Falha ao consultar contatos: ${contactsResult.error.message}`);
  if (instancesResult.error) throw new Error(`Falha ao consultar instâncias: ${instancesResult.error.message}`);
  const contacts = new Map(((contactsResult.data ?? []) as unknown as ContactRow[]).map(row => [row.id, row]));
  const instances = new Map(((instancesResult.data ?? []) as unknown as InstanceRow[]).map(row => [row.id, row]));
  const items = page.map(row => ({ ...row, contact: contacts.get(row.contact_id) ?? null, instance: instances.get(row.instance_id) ?? null }));
  const last = page.at(-1);
  return { items, nextCursor: hasMore && last ? { activityAt: last.activity_at, id: last.id } : null };
}

export type MessageCursor = { occurredAt: string; id: string };
export type TimelineMessage = { id: string; direction: 'inbound'|'outbound'; actor_type: string; source_engine: string; status: string; body_text: string | null; occurred_at: string };

/** Fetch only the newest bounded timeline page. Use the returned cursor to load older history on demand. */
export async function getMessagePage(input: { workspaceId: string; conversationId: string; before?: MessageCursor | null; limit?: number }) {
  if (!UUID_RE.test(input.workspaceId) || !UUID_RE.test(input.conversationId)) throw new Error('Identificador inválido');
  const size = pageSize(input.limit ?? 40);
  const supabase = await createSupabaseServerClient();
  let query = supabase.from('messages')
    .select('id,direction,actor_type,source_engine,status,body_text,occurred_at')
    .eq('workspace_id', input.workspaceId)
    .eq('conversation_id', input.conversationId)
    .order('occurred_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(size + 1);
  const before = input.before;
  if (before && UUID_RE.test(before.id) && !Number.isNaN(new Date(before.occurredAt).getTime())) {
    const occurredAt = new Date(before.occurredAt).toISOString();
    query = query.or(`occurred_at.lt.${occurredAt},and(occurred_at.eq.${occurredAt},id.lt.${before.id})`);
  }
  const { data, error } = await query;
  if (error) throw new Error(`Falha ao consultar timeline: ${error.message}`);
  const rows = (data ?? []) as unknown as TimelineMessage[];
  const hasMore = rows.length > size;
  const page = rows.slice(0, size);
  const oldest = page.at(-1);
  return {
    items: page.reverse(),
    nextCursor: hasMore && oldest ? { occurredAt: oldest.occurred_at, id: oldest.id } : null,
  };
}
