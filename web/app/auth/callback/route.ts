import { NextRequest,NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const OTP_TYPES=new Set<EmailOtpType>(['signup','invite','magiclink','recovery','email_change','email']);
function safeNext(value:string|null){return value&&value.startsWith('/')&&!value.startsWith('//')?value:'/setup-password'}

export async function GET(request:NextRequest){
 const url=request.nextUrl;const next=safeNext(url.searchParams.get('next'));const supabase=await createSupabaseServerClient();
 try{
  const code=url.searchParams.get('code');const tokenHash=url.searchParams.get('token_hash');const type=url.searchParams.get('type');
  let error:unknown=null;
  if(code){const result=await supabase.auth.exchangeCodeForSession(code);error=result.error}
  else if(tokenHash&&type&&OTP_TYPES.has(type as EmailOtpType)){const result=await supabase.auth.verifyOtp({token_hash:tokenHash,type:type as EmailOtpType});error=result.error}
  else return NextResponse.redirect(new URL('/login?error=invalid_link',request.url));
  if(error)return NextResponse.redirect(new URL('/login?error=link_expired',request.url));
  return NextResponse.redirect(new URL(next,request.url));
 }catch{return NextResponse.redirect(new URL('/login?error=link_failed',request.url))}
}
