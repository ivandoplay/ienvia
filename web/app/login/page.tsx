'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!configured) { setError('Autenticação ainda não foi configurada neste ambiente. Nenhum acesso real está conectado.'); return; }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : '/visao-geral');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar. Confira seus dados.');
    } finally { setBusy(false); }
  }

  return <main className="login-screen"><section className="login-card surface"><a className="brand login-brand" href="/visao-geral"><span className="brand-symbol">✳</span><span>ienvia</span></a><p className="eyebrow">ÁREA DE ACESSO</p><h1>Bem-vinda de volta</h1><p className="page-description">Entre com as credenciais fornecidas pelo administrador do seu workspace.</p>{!configured&&<div className="login-demo-note">Modo de demonstração local. Configure Supabase Auth antes de usar com dados reais.</div>}<form className="login-form" onSubmit={submit}><label>E-mail<input autoComplete="username" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@empresa.com"/></label><label>Senha<input autoComplete="current-password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha"/></label>{error&&<p className="login-error" role="alert">{error}</p>}<button className="primary-button login-submit" type="submit" disabled={busy}>{busy?'Entrando…':'Entrar'}</button></form><p className="login-foot">A criação de contas é restrita ao fluxo administrativo; não há cadastro público.</p></section></main>;
}
