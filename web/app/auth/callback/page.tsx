'use client';

import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import type {EmailOtpType} from '@supabase/supabase-js';
import {createSupabaseBrowserClient} from '@/lib/supabase/browser';

const OTP_TYPES=new Set<EmailOtpType>(['signup','invite','magiclink','recovery','email_change','email']);
function safeNext(value:string|null){return value&&value.startsWith('/')&&!value.startsWith('//')?value:'/setup-password'}

export default function AuthCallbackPage(){
 const router=useRouter();const [message,setMessage]=useState('Validando link seguro…');
 useEffect(()=>{let alive=true;(async()=>{
  try{
   const supabase=createSupabaseBrowserClient();const url=new URL(window.location.href);const code=url.searchParams.get('code');const tokenHash=url.searchParams.get('token_hash');const type=url.searchParams.get('type');let error:Error|null=null;
   if(code){const result=await supabase.auth.exchangeCodeForSession(code);error=result.error}
   else if(tokenHash&&type&&OTP_TYPES.has(type as EmailOtpType)){const result=await supabase.auth.verifyOtp({token_hash:tokenHash,type:type as EmailOtpType});error=result.error}
   else {const fragment=new URLSearchParams(window.location.hash.replace(/^#/,''));const accessToken=fragment.get('access_token');const refreshToken=fragment.get('refresh_token');if(accessToken&&refreshToken){const result=await supabase.auth.setSession({access_token:accessToken,refresh_token:refreshToken});error=result.error}else{const result=await supabase.auth.getUser();error=result.error??(!result.data.user?new Error('Sessão ausente.'):null)}}
   if(error)throw error;const next=safeNext(url.searchParams.get('next'));window.history.replaceState({},'',url.pathname);router.replace(next);router.refresh();
  }catch{if(alive){setMessage('Este link não é válido ou expirou. Peça um novo convite.');window.setTimeout(()=>router.replace('/login?error=link_expired'),1600)}}
 })();return()=>{alive=false}},[router]);
 return <main className="login-screen"><section className="login-card surface"><a className="brand login-brand" href="/login"><span className="brand-symbol">✳</span><span>ienvia</span></a><p className="eyebrow">ACESSO SEGURO</p><h1>Confirmando seu acesso</h1><p className="page-description" role="status">{message}</p></section></main>
}
