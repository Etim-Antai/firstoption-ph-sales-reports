
import React, { useState } from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, isSupabaseConnected } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const res = await login(email.trim(), password);

      if (!res.success) {
        setError(res.error || 'Unable to sign in. Please check your credentials.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#10243A] selection:bg-[#0D9488] selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-7 sm:p-9 border border-slate-100 animate-fadeIn">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#10243A] border border-slate-100 flex items-center justify-center shadow-md">
            <img
              src="./firstoption_logo.jpg"
              alt="FirstOption Solar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = './firstoptionsolar.jpg';
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
              ? 'Sign in with your registered staff email and password.'
              : 'Authentication is not configured. Please contact your administrator.'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="staff-email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Work Email
            </label>

            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="staff-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@firstoptionsolar.ng"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="staff-password"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Password
            </label>

            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="staff-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy || !isSupabaseConnected}
            className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-md shadow-[#0D9488]/20 transition-all disabled:opacity-50"
          >
            <span>
              {busy ? 'Signing in...' : 'Sign in securely'}
            </span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-slate-400">
          Protected by Supabase authentication and role-based permissions.
        </div>
      </div>
    </div>
  );
};
