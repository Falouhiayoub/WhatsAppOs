'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Lock, Mail, Building, User, Sparkles } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login Form
  const [email, setEmail] = useState('owner@darkaftan.ma');
  const [password, setPassword] = useState('password123');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [orgName, setOrgName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Échec de la connexion');

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          organizationName: orgName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Échec de l\'inscription');

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 font-black text-2xl mb-4 shadow-lg shadow-emerald-500/20">
          WA
        </div>
        <h2 className="text-2xl font-bold tracking-tight">AI WhatsApp Business OS</h2>
        <p className="text-sm text-slate-400 mt-1">
          {tab === 'login' ? 'Connectez-vous à votre espace d\'entreprise' : 'Créez votre espace entreprise en 1 minute'}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-800/60 p-1 rounded-xl mb-6">
        <button
          onClick={() => setTab('login')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
            tab === 'login' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Connexion
        </button>
        <button
          onClick={() => setTab('register')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
            tab === 'register' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Inscription
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
          {error}
        </div>
      )}

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Professionnel</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                placeholder="owner@darkaftan.ma"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Mot de Passe</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2"
          >
            {loading ? <span>Connexion...</span> : <span>Se Connecter</span>}
          </button>

          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                setEmail('owner@darkaftan.ma');
                setPassword('password123');
              }}
              className="text-xs text-emerald-400 hover:underline inline-flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Remplir les identifiants de démo Maroc (Dar Al Kaftan)</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nom complet</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                placeholder="Khadija Bennani"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nom de l'Entreprise / Business</label>
            <div className="relative">
              <Building className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                placeholder="Dar Al Kaftan Casablanca"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Professionnel</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                placeholder="khadija@darkaftan.ma"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Mot de Passe</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2"
          >
            {loading ? <span>Création du compte...</span> : <span>Créer Mon Espace Entreprise</span>}
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 relative">
      <Suspense fallback={<div className="text-sm text-slate-400">Chargement...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
