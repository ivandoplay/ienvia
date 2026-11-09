import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const db = new PGlite({ extensions: { pg_trgm } });
const userA = '00000000-0000-4000-8000-000000000001';
const userB = '00000000-0000-4000-8000-000000000002';
const operatorA = '00000000-0000-4000-8000-000000000003';
const wsA = '10000000-0000-4000-8000-000000000001';
const wsB = '10000000-0000-4000-8000-000000000002';
const instA = '20000000-0000-4000-8000-000000000001';
const instB = '20000000-0000-4000-8000-000000000002';
const contactA1 = '30000000-0000-4000-8000-000000000001';
const contactA2 = '30000000-0000-4000-8000-000000000002';
const contactB = '30000000-0000-4000-8000-000000000003';
const convA = '40000000-0000-4000-8000-000000000001';
const convB = '40000000-0000-4000-8000-000000000002';

async function asUser(userId, fn) {
  await db.exec('begin');
  try {
    await db.exec('set local role authenticated');
    await db.query("select set_config('request.jwt.claim.sub', $1, true)", [userId]);
    return await fn();
  } finally {
    await db.exec('rollback');
  }
}
async function expectDenied(fn, message) {
  await db.exec('savepoint expect_denied');
  let denied = false;
  try { await fn(); } catch { denied = true; await db.exec('rollback to savepoint expect_denied'); }
  await db.exec('release savepoint expect_denied');
  assert.equal(denied, true, message);
}

try {
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key);
    create or replace function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
  `);
  for (const file of ['0001_core.sql', '0002_consent_campaigns.sql', '0003_workspace_owner_settings.sql', '0004_platform_master_identity_rpc.sql']) {
    const sql = await fs.readFile(path.join(root, 'supabase', 'migrations', file), 'utf8');
    await db.exec(sql);
    console.log(`✓ migration ${file}`);
  }

  await db.exec(`
    insert into auth.users(id) values ('${userA}'),('${userB}'),('${operatorA}');
    insert into public.workspaces(id,name) values ('${wsA}','Workspace A'),('${wsB}','Workspace B');
    insert into public.workspace_memberships(workspace_id,user_id,role,status,joined_at) values
      ('${wsA}','${userA}','owner','active',now()),('${wsB}','${userB}','owner','active',now()),('${wsA}','${operatorA}','operator','active',now());
    insert into public.workspace_data_policies(workspace_id) values ('${wsA}'),('${wsB}');
    insert into public.instances(id,workspace_id,channel,engine,display_name) values
      ('${instA}','${wsA}','whatsapp','evolution','A / Vendas'),('${instB}','${wsB}','whatsapp','baileys','B / Suporte');
    insert into public.contacts(id,workspace_id,instance_id,channel,external_user_id,display_name) values
      ('${contactA1}','${wsA}','${instA}','whatsapp','contact-a1','Ana A'),
      ('${contactA2}','${wsA}','${instA}','whatsapp','contact-a2','Bia A'),
      ('${contactB}','${wsB}','${instB}','whatsapp','contact-b','Caio B');
    insert into public.conversations(id,workspace_id,contact_id,instance_id,stage,last_message_at,last_message_preview) values
      ('${convA}','${wsA}','${contactA1}','${instA}','ai',now(),'Mensagem A'),
      ('${convB}','${wsB}','${contactB}','${instB}','ai',now(),'Mensagem B');
    insert into public.messages(workspace_id,conversation_id,instance_id,provider_message_id,direction,source_engine,actor_type,status,body_text,occurred_at) values
      ('${wsA}','${convA}','${instA}','provider-a1','inbound','evolution','contact','received','Mensagem A',now()),
      ('${wsB}','${convB}','${instB}','provider-b1','inbound','baileys','contact','received','Mensagem B',now());
    insert into private.platform_admins(user_id) values ('${userA}');
  `);

  const masterStatus = await asUser(userA, async () => (await db.query('select public.is_my_platform_master() as active')).rows[0].active);
  const regularStatus = await asUser(userB, async () => (await db.query('select public.is_my_platform_master() as active')).rows[0].active);
  assert.equal(masterStatus,true,'platform master RPC should report only the caller\'s active identity');
  assert.equal(regularStatus,false,'non-master account should not receive master identity');
  console.log('✓ authenticated self-only platform-master identity check');

  const aCounts = await asUser(userA, async () => {
    const workspaces = await db.query('select id from public.workspaces order by id');
    const contacts = await db.query('select id from public.contacts order by id');
    const messages = await db.query('select id,body_text from public.messages');
    return { workspaces: workspaces.rows, contacts: contacts.rows, messages: messages.rows };
  });
  assert.deepEqual(aCounts.workspaces.map(x => x.id), [wsA], 'user A must only see workspace A');
  assert.deepEqual(aCounts.contacts.map(x => x.id).sort(), [contactA1,contactA2].sort(), 'user A must only see own workspace contacts');
  assert.equal(aCounts.messages.length, 1, 'user A must only see own workspace messages');
  console.log('✓ RLS tenant isolation for workspaces, contacts and messages');

  const bCounts = await asUser(userB, async () => {
    const contacts = await db.query('select id from public.contacts');
    return contacts.rows.map(x => x.id);
  });
  assert.deepEqual(bCounts, [contactB], 'user B must only see workspace B');
  console.log('✓ reverse tenant isolation');

  await asUser(userA, async () => {
    await db.query(`update public.conversations set stage='human', assigned_user_id='${userA}' where id='${convA}'`);
    await expectDenied(() => db.query(`update public.conversations set assigned_user_id='${userB}' where id='${convA}'`), 'must not assign conversation to a non-member');
    await expectDenied(() => db.query(`update public.contacts set external_user_id='moved' where id='${contactA1}'`), 'browser must not edit external identity keys');
    await expectDenied(() => db.query(`insert into public.messages(workspace_id,conversation_id,instance_id,direction,source_engine,actor_type,status,body_text,occurred_at) values ('${wsA}','${convA}','${instA}','outbound','system','human','sent','forged',now())`), 'browser must not insert a sent message');
    await expectDenied(() => db.query(`insert into public.campaigns(workspace_id,name,text_body) values ('${wsB}','Cross tenant','x')`), 'must not insert into another workspace');
    const created = await db.query(`insert into public.campaigns(workspace_id,name,text_body) values ('${wsA}','Draft test','Uma mensagem') returning id,status`);
    const id = created.rows[0].id;
    await expectDenied(() => db.query(`update public.campaigns set status='running' where id='${id}'`), 'browser must not dispatch a campaign');
    await expectDenied(() => db.query('select * from private.audit_events'), 'browser must not read private audit trail');
    await db.query(`insert into public.contact_links(workspace_id,contact_id_low,contact_id_high) values ('${wsA}','${contactA1}','${contactA2}')`);
    const links = await db.query(`select count(*)::int as n from public.contact_links where workspace_id='${wsA}'`);
    assert.equal(links.rows[0].n, 1, 'manual same-workspace contact link should be allowed');
    await expectDenied(() => db.query(`insert into public.contact_links(workspace_id,contact_id_low,contact_id_high) values ('${wsA}','${contactA1}','${contactB}')`), 'cross-workspace profile link must fail the composite foreign key');
    await expectDenied(() => db.query(`insert into public.contacts(workspace_id,channel,display_name) values ('${wsB}','manual','No access')`), 'member must not create a contact in another workspace');
    await expectDenied(() => db.query(`insert into public.contacts(workspace_id,channel,display_name,consent_status) values ('${wsA}','manual','Forged opt-in','opted_in')`), 'browser insert must not forge consent status');
    await expectDenied(() => db.query(`update public.contacts set consent_status='opted_in' where id='${contactA1}'`), 'consent cannot be changed without append-only evidence');
    await expectDenied(() => db.query(`insert into public.contact_consent_events(workspace_id,contact_id,purpose,action,source,occurred_at) values ('${wsA}','${contactA1}','marketing','granted','test',now())`), 'browser cannot forge append-only consent evidence');
    await expectDenied(() => db.query(`select public.record_contact_consent('${wsA}','${contactA1}','global','granted','manual',null,now())`), 'a consent grant must carry an evidence reference');
    await db.query(`select public.record_contact_consent('${wsA}','${contactA1}','global','granted','manual','proof-ref-001',now())`);
    const globalConsent=await db.query(`select consent_status from public.contacts where id='${contactA1}'`);
    assert.equal(globalConsent.rows[0].consent_status,'opted_in','verified grant should update global consent summary');
    await db.query(`select public.record_contact_consent('${wsA}','${contactA1}','marketing','opted_out','whatsapp_opt_out',null,now())`);
    const purposeConsent=await db.query(`select status from public.contact_consent_state where workspace_id='${wsA}' and contact_id='${contactA1}' and purpose='marketing'`);
    assert.equal(purposeConsent.rows[0].status,'opted_out','category opt-out should be recorded independently');
    await expectDenied(() => db.query(`insert into public.outbox_jobs(workspace_id,job_type,idempotency_key) values ('${wsA}','send_message','manual-forge')`), 'browser cannot dispatch outbox jobs');
  });
  console.log('✓ column grants, assignment safety, server-only dispatch/audit and manual links');

  const ownerPolicy = await asUser(userA, async () => {
    await db.query(`update public.workspace_data_policies set media_retention_days=45 where workspace_id='${wsA}'`);
    const result = await db.query(`select media_retention_days from public.workspace_data_policies where workspace_id='${wsA}'`);
    return result.rows[0].media_retention_days;
  });
  assert.equal(ownerPolicy,45,'owner should be able to configure workspace policy');
  const operatorPolicyRows = await asUser(operatorA, async () => {
    const result = await db.query(`update public.workspace_data_policies set media_retention_days=1 where workspace_id='${wsA}' returning workspace_id`);
    return result.rows;
  });
  assert.equal(operatorPolicyRows.length,0,'operator update is filtered by RLS and must affect zero rows');
  console.log('✓ owner/operator policy boundary');

  const renamedWorkspace = await asUser(userA, async () => {
    const result = await db.query(`update public.workspaces set name='Workspace A renamed' where id='${wsA}' returning name`);
    return result.rows[0]?.name;
  });
  assert.equal(renamedWorkspace,'Workspace A renamed','owner should be able to rename their workspace');
  const operatorWorkspaceRows = await asUser(operatorA, async () => {
    const result = await db.query(`update public.workspaces set name='Operator rename' where id='${wsA}' returning id`);
    return result.rows;
  });
  assert.equal(operatorWorkspaceRows.length,0,'operator must not rename workspace');
  await asUser(userA, async () => {
    await expectDenied(() => db.query(`update public.workspaces set status='closed' where id='${wsA}'`), 'owner browser grant must not allow changing lifecycle status');
  });
  console.log('✓ owner can rename only own workspace; lifecycle fields remain server-controlled');

  await db.exec('begin');
  await expectDenied(() => db.query(`insert into public.messages(workspace_id,conversation_id,instance_id,provider_message_id,direction,source_engine,actor_type,status,body_text,occurred_at) values ('${wsA}','${convA}','${instA}','provider-a1','inbound','evolution','contact','received','duplicate',now())`), 'provider event/message idempotency key must be unique');
  await db.exec('rollback');
  console.log('✓ provider message deduplication constraint');

  await db.exec(`set role service_role; insert into private.audit_events(workspace_id,actor_kind,action) values ('${wsA}','service','test'); reset role;`);
  console.log('✓ service-only audit insert');
  console.log('\nPASS: migration syntax, core constraints and local RLS behavior verified in PGlite. This is not a substitute for Supabase local/staging tests.');
} catch (error) {
  console.error('\nFAIL:', error?.message ?? error);
  if (error?.query) console.error(error.query);
  process.exitCode = 1;
} finally {
  await db.close();
}
