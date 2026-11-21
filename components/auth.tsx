'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, ShieldCheck, Sprout, UserRoundPlus } from 'lucide-react';
import { DEMO_PASSWORD, isValidEmail, normalizeEmail, type Person } from '@/lib/workspace';
import { Brand } from './ui';

type Mode = 'login' | 'register';

const MIN_PASSWORD = 8;

function AuthArt({ mode }: { mode: Mode }) {
  return <div className="signin-art">
    <Brand />
    <div className="signin-art-text">
      <p className="fern-eyebrow"><Sprout size={15} /> THE FIELD JOURNAL</p>
      <h2>{mode === 'login' ? <>Welcome <em>back.</em></> : <>Plant something <em>new.</em></>}</h2>
      <p>{mode === 'login' ? 'Your notes are right where you left them.' : 'A private place for whatever’s on your mind.'}</p>
    </div>
    <div className="fern-index" aria-hidden="true"><span /> FIG. 01 &nbsp; / &nbsp; WOOD FERN</div>
  </div>;
}

function PasswordField({ id, label, value, onChange, placeholder, autoComplete, invalid }: {
  id: string; label: string; value: string; onChange: (value: string) => void; placeholder: string; autoComplete: string; invalid?: boolean;
}) {
  const [show, setShow] = useState(false);
  return <div className="form-field auth-field">
    <label htmlFor={id}>{label}</label>
    <div className={`password-wrap ${invalid ? 'is-invalid' : ''}`}>
      <input id={id} className="input text-control password-input" type={show ? 'text' : 'password'} value={value} placeholder={placeholder}
        autoComplete={autoComplete} minLength={MIN_PASSWORD} required onChange={e => onChange(e.target.value)} />
      <button type="button" className="btn fn-icon password-toggle" onClick={() => setShow(s => !s)}
        aria-label={show ? 'Hide password' : 'Show password'} title={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOff size={17} strokeWidth={1.7} /> : <Eye size={17} strokeWidth={1.7} />}
      </button>
    </div>
  </div>;
}

export function LoginPage({ people, onSubmit }: { people: Person[]; onSubmit: (email: string, password: string) => string | null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const demoAccounts = people.filter(p => p.email.endsWith('@fieldnote.example')).slice(0, 2);
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
    if (!password) { setError('Enter your password.'); return; }
    setError(onSubmit(normalizeEmail(email), password) ?? '');
  }
  return <main className="signin-layout">
    <AuthArt mode="login" />
    <div className="signin-content"><div className="signin-inner">
      <span className="signin-glyph"><KeyRound size={22} strokeWidth={1.7} /></span>
      <p className="eyebrow"><span className="eyebrow-dot" />FIELDNOTE WORKSPACE</p>
      <h1>Log in.</h1>
      <p>Use your Fieldnote account, or try a demo login below.</p>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="form-field auth-field"><span>Email address</span>
          <input className="input text-control" type="email" value={email} placeholder="you@example.com"
            autoComplete="email" maxLength={140} required onChange={e => { setEmail(e.target.value); setError(''); }} />
        </label>
        <PasswordField id="login-password" label="Password" value={password} onChange={v => { setPassword(v); setError(''); }} placeholder="••••••••" autoComplete="current-password" />
        {error && <p className="auth-error" role="alert"><AlertCircle size={15} />{error}</p>}
        <button type="submit" className="btn fn-btn primary-btn auth-submit">Log in <ArrowRight size={16} /></button>
      </form>
      {demoAccounts.length > 0 && <div className="auth-demo">
        <p>Demo logins — password <code>{DEMO_PASSWORD}</code></p>
        <div className="auth-demo-chips">{demoAccounts.map(p => <button type="button" key={p.id} className="btn auth-demo-chip"
          onClick={() => { setEmail(p.email); setPassword(DEMO_PASSWORD); setError(''); }}>{p.email}</button>)}</div>
      </div>}
      <div className="auth-switch">New to Fieldnote? <Link href="/register">Create an account</Link></div>
      <div className="signin-disclaimer"><ShieldCheck size={17} />Demo only. Accounts live in this browser and aren’t sent anywhere.</div>
      <div className="auth-alt-links">
        <Link href="/sign-in" className="btn text-btn">Pick a demo account instead</Link>
        <Link href="/posts" className="btn text-btn">Browse public posts <ArrowRight size={15} /></Link>
      </div>
    </div></div>
  </main>;
}

export function RegisterPage({ onSubmit }: { onSubmit: (name: string, email: string, password: string) => string | null }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (name.trim().length < 2) { setError('Enter your full name.'); return; }
    if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
    if (password.length < MIN_PASSWORD) { setError(`Passwords need at least ${MIN_PASSWORD} characters.`); return; }
    if (password !== confirm) { setError('The two passwords don’t match.'); return; }
    setError(onSubmit(name.trim().replace(/\s+/g, ' ').slice(0, 70), normalizeEmail(email), password) ?? '');
  }
  return <main className="signin-layout">
    <AuthArt mode="register" />
    <div className="signin-content"><div className="signin-inner">
      <span className="signin-glyph"><UserRoundPlus size={23} strokeWidth={1.7} /></span>
      <p className="eyebrow"><span className="eyebrow-dot" />FIELDNOTE WORKSPACE</p>
      <h1>Create account.</h1>
      <p>Start your own notebook. It takes less than a minute.</p>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="form-field auth-field"><span>Full name</span>
          <input className="input text-control" value={name} placeholder="e.g. Casey Lee"
            autoComplete="name" maxLength={70} required onChange={e => { setName(e.target.value); setError(''); }} />
        </label>
        <label className="form-field auth-field"><span>Email address</span>
          <input className="input text-control" type="email" value={email} placeholder="you@example.com"
            autoComplete="email" maxLength={140} required onChange={e => { setEmail(e.target.value); setError(''); }} />
        </label>
        <PasswordField id="register-password" label="Password" value={password} onChange={v => { setPassword(v); setError(''); }} placeholder={`At least ${MIN_PASSWORD} characters`} autoComplete="new-password" invalid={Boolean(password) && password.length < MIN_PASSWORD} />
        <PasswordField id="register-confirm" label="Confirm password" value={confirm} onChange={v => { setConfirm(v); setError(''); }} placeholder="Repeat your password" autoComplete="new-password" invalid={Boolean(confirm) && confirm !== password} />
        {error && <p className="auth-error" role="alert"><AlertCircle size={15} />{error}</p>}
        <button type="submit" className="btn fn-btn primary-btn auth-submit">Create account <ArrowRight size={16} /></button>
      </form>
      <div className="auth-switch">Already have an account? <Link href="/login">Log in</Link></div>
      <div className="signin-disclaimer"><ShieldCheck size={17} />Demo only. Your account is stored in this browser — don’t use a real password.</div>
      <Link href="/posts" className="btn text-btn signin-public">Browse public posts <ArrowRight size={15} /></Link>
    </div></div>
  </main>;
}