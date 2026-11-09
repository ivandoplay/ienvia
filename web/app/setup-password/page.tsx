'use client';

import {FormEvent,useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {createSupabaseBrowserClient} from '@/lib/supabase/browser';

export default function SetupPasswordPage(){
 const router=useRouter();const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [checking,setChecking]=useState(true);
 useEffect(()=>{let alive=true;createSupabaseBrowserClient().auth.getUser().then((result:{data:{user:unknown|null};error:unknown})=>{if(!alive)return;if(result.error||!result.data.user)router.replace('/login');else setChecking(false)}).catch(()=>{if(alive)router.replace('/login')});return()=>{alive=false}},[router]);
 async function submit(e:FormEvent){e.preventDefault();setError('');if(password.length<12){setError('Use pelo menos 12 caracteres.');return}if(password!==confirm){setError('As senhas não coincidem.');return}setBusy(true);try{const {error}=await createSupabaseBrowserClient().auth.updateUser({password});if(error)throw error;router.replace('/visao-geral');router.refresh()}catch(err){setError(err instanceof Error?err.message:'Não foi possível salvar a senha. Tente abrir novamente o link de convite.')}finally{setBusy(false)}}
 return <main className="login-screen"><section className="login-card surface"><a className="brand login-brand" href="/login"><span className="brand-symbol">✳</span><span>ienvia</span></a><p className="eyebrow">PRIMEIRO ACESSO</p><h1>Defina sua senha</h1><p className="page-description">Use uma senha exclusiva com pelo menos 12 caracteres.</p>{checking?<div className="login-demo-note">Validando seu link seguro…</div>:<form className="login-form" onSubmit={submit}><label>Nova senha<input autoComplete="new-password" type="password" required minLength={12} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 12 caracteres"/></label><label>Confirmar nova senha<input autoComplete="new-password" type="password" required minLength={12} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Digite novamente"/></label>{error&&<p className="login-error" role="alert">{error}</p>}<button className="primary-button login-submit" type="submit" disabled={busy||checking}>{busy?'Salvando…':'Salvar senha'}</button></form>}</section></main>
}
