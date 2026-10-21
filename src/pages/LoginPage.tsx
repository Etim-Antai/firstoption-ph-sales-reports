import React, { useState } from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, isSupabaseConnected } = useAuth();
  const [email, setEmail] = useState('admin@firstoptionsolar.ng');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const handleQuickDemo = (role: 'admin' | 'viewer') => {
    if (role === 'admin') {
      setEmail('admin@firstoptionsolar.ng');
      setPassword('admin2026!');
    } else {
      setEmail('viewer@firstoptionsolar.ng');
      setPassword('viewer2026!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#10243A] selection:bg-[#0D9488] selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-7 sm:p-9 border border-slate-100 animate-fadeIn">
        {/* Brand identity header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#10243A] border border-slate-100 flex items-center justify-center shadow-md">
            <img
              src="./firstoption_logo.jpg"
              alt="FirstOption Solar"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = './firstoptionsolar.jpg';
              }}
            />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-[#10243A]">
              FirstOption <span className="text-[#0D9488]">Solar</span>
            </div>
            <div className="text-xs font-semibold text-slate-400">
              Sales Intelligence Dashboard
            </div>
          </div>
        </div>

        <div className="my-6 border-t border-slate-100" />

        <div>
          <h2 className="text-xl font-bold text-[#10243A]">Sign in</h2>
          <p className="text-xs text-slate-500 mt-1">
            {isSupabaseConnected
              ? 'Enter your verified Supabase staff credentials.'
              : 'Local sandbox mode active. Sign in to view and manage company sales.'}
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Work Email / Username
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@firstoptionsolar.ng"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-md shadow-[#0D9488]/20 transition-all disabled:opacity-50"
          >
            <span>{busy ? 'Signing in…' : 'Sign in securely'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Demo Fast Login Shortcuts */}
        {!isSupabaseConnected && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400 mb-2">
              Free Tier / Demo Quick Sign-in:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left text-xs transition-colors"
              >
                <div className="font-bold text-[#10243A]">Admin Demo</div>
                <div className="text-[10px] text-slate-500">Full CRUD & Import</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('viewer')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left text-xs transition-colors"
              >
                <div className="font-bold text-[#10243A]">Viewer Demo</div>
                <div className="text-[10px] text-slate-500">Read-only analytics</div>
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-[11px] text-slate-400">
          Protected by Row Level Security and role-based permissions.
        </div>
      </div>
    </div>
  );
};
