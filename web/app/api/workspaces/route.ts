import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMyWorkspaces } from '@/lib/data/workspaces';
export const dynamic='force-dynamic';
export async function GET(){
 try{const supabase=await createSupabaseServerClient();const {data:{user},error}=await supabase.auth.getUser();if(error||!user)return NextResponse.json({error:'Autenticação necessária.'},{status:401,headers:{'Cache-Control':'private, no-store'}});const items=await getMyWorkspaces();return NextResponse.json({items},{headers:{'Cache-Control':'private, no-store, max-age=0'}})}
 catch(error){console.error('workspace list failed',error instanceof Error?error.name:'unknown');return NextResponse.json({error:'Não foi possível carregar os workspaces.'},{status:503,headers:{'Cache-Control':'private, no-store'}})}
}
