import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, LogIn, UserPlus, Loader, AlertCircle, ShieldCheck } from 'lucide-react';
import { confirmSignup, login, resendSignupCode, signup } from '../services/api.js';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    confirmationCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login({ email: form.email, password: form.password });
        onAuthSuccess(res.user);
      } else if (mode === 'confirm') {
        await confirmSignup({ email: form.email, code: form.confirmationCode });
        const res = await login({ email: form.email, password: form.password });
        onAuthSuccess(res.user);
      } else {
        const res = await signup({
          email: form.email,
          password: form.password,
          full_name: form.fullName,
          phone: form.phone || null,
        });
        if (res.confirmationRequired) {
          setMode('confirm');
          setMessage('Account created. Enter the confirmation code sent by Cognito.');
          return;
        }
        onAuthSuccess(res.user);
      }
      onClose();
    } catch (err) {
      if (err.code === 'UserNotConfirmedException') {
        setMode('confirm');
        setMessage('Enter the confirmation code sent by Cognito, then continue.');
      }
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await resendSignupCode(form.email);
      setMessage('A new confirmation code was sent.');
    } catch (err) {
      setError(err.message || 'Could not resend confirmation code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header with tabs */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setMode('login'); setError(null); setMessage(null); }}
              className={`font-bold text-lg pb-1 border-b-2 transition-colors ${
                mode === 'login'
                  ? 'text-orange-500 border-orange-500'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
              className={`font-bold text-lg pb-1 border-b-2 transition-colors ${
                mode === 'signup'
                  ? 'text-orange-500 border-orange-500'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              Create Account
            </button>
            {mode === 'confirm' && (
              <span className="font-bold text-lg pb-1 border-b-2 text-orange-500 border-orange-500">
                Confirm
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold p-3 rounded-xl border border-green-200">
              <UserPlus className="w-4 h-4 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="auth-name">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-name"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Sardar Huzaifa"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          )}

          {mode === 'confirm' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="auth-code">
                Confirmation Code *
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-code"
                  name="confirmationCode"
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="123456"
                  value={form.confirmationCode}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="auth-email">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="auth-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {mode !== 'confirm' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="auth-password">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="auth-phone">
                Phone Number (optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-phone"
                  name="phone"
                  type="tel"
                  placeholder="03001234567"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-orange-200 text-sm"
          >
            {loading ? (
              <><Loader className="w-4 h-4 animate-spin" /> Processing...</>
            ) : mode === 'login' ? (
              <><LogIn className="w-4 h-4" /> Sign In</>
            ) : mode === 'confirm' ? (
              <><ShieldCheck className="w-4 h-4" /> Confirm Account</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Create Account</>
            )}
          </button>

          {mode === 'confirm' && (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading || !form.email}
              className="w-full border border-slate-200 text-slate-600 hover:text-orange-500 hover:border-orange-300 disabled:opacity-40 font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Resend Code
            </button>
          )}

          <p className="text-center text-xs text-slate-500 pt-2">
            {mode === 'login' ? (
              <>Don't have an account? <button type="button" onClick={() => { setMode('signup'); setError(null); setMessage(null); }} className="text-orange-500 font-bold hover:underline">Sign Up</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => { setMode('login'); setError(null); setMessage(null); }} className="text-orange-500 font-bold hover:underline">Sign In</button></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
