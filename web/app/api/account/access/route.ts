import {NextResponse} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabase/server';

export const dynamic='force-dynamic';
export async function GET(){
 const headers={'Cache-Control':'private, no-store, max-age=0'};
 try{
  const supabase=await createSupabaseServerClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user)return NextResponse.json({error:'Autenticação necessária.'},{status:401,headers});
  const {data,error}=await supabase.rpc('is_my_platform_master');
  if(error){console.error('platform access check failed',error.code);return NextResponse.json({error:'Não foi possível verificar o nível de acesso.'},{status:503,headers})}
  return NextResponse.json({platformMasterIdentityActive:data===true},{headers});
 }catch(error){
  console.error('account access check failed',error instanceof Error?error.name:'unknown');
  return NextResponse.json({error:'Não foi possível verificar o nível de acesso.'},{status:503,headers});
 }
}
