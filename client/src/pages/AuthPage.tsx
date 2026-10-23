import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../lib/api';

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isRegister = mode === 'register';

  if (user) return <Navigate to="/workflows" replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSubmitting(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const values = { email: String(form.get('email')), password: String(form.get('password')) };
      if (isRegister) await register({ ...values, name: String(form.get('name')) });
      else await login(values);
      navigate('/workflows');
    } catch (err) { setError(getApiError(err)); }
    finally { setSubmitting(false); }
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #6366f1 0, transparent 28%), radial-gradient(circle at 80% 65%, #0ea5e9 0, transparent 25%)' }} />
        <div className="absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
        <div className="relative"><Logo /></div>
        <div className="relative my-auto max-w-xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-indigo-100"><Sparkles size={14} /> Automation without the busywork</span>
          <h1 className="font-display text-5xl font-bold leading-[1.08] tracking-tight">Turn ideas into workflows that run themselves.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-gray-300">Design reliable automations on a visual canvas, connect your tools, and understand every run at a glance.</p>
          <div className="mt-10 space-y-4 text-sm text-gray-200">
            {['Build visually with drag-and-drop nodes', 'Validate every workflow before it goes live', 'Keep your automation data in your own stack'].map((item) => <div key={item} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500"><Check size={14} /></span>{item}</div>)}
          </div>
        </div>
        <p className="relative text-sm text-gray-500">FlowNexus · Visual automation for focused teams</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><Logo /></div>
          <p className="mb-2 text-sm font-semibold text-brand-600">{isRegister ? 'START BUILDING' : 'WELCOME BACK'}</p>
          <h2 className="font-display text-3xl font-bold tracking-tight">{isRegister ? 'Create your workspace' : 'Sign in to FlowNexus'}</h2>
          <p className="mt-2 text-gray-500">{isRegister ? 'Your first automation is only a few minutes away.' : 'Continue building smarter, connected workflows.'}</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            {isRegister && <label><span className="label">Full name</span><input className="field" name="name" autoComplete="name" placeholder="Ada Lovelace" minLength={2} required /></label>}
            <label><span className="label">Email address</span><input className="field" name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></label>
            <label><span className="label">Password</span><span className="relative block"><input className="field pr-11" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder={isRegister ? '8+ chars, uppercase and number' : 'Your password'} minLength={8} required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
            {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <button className="btn-primary w-full py-3" disabled={submitting}>{submitting ? <Spinner /> : <>{isRegister ? 'Create account' : 'Sign in'}<ArrowRight size={17} /></>}</button>
          </form>
          <p className="mt-7 text-center text-sm text-gray-500">{isRegister ? 'Already have an account?' : 'New to FlowNexus?'} <Link className="font-semibold text-brand-600 hover:text-brand-700" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
        </div>
      </section>
    </main>
  );
}
