import React, { useState, useEffect } from 'react';
import { X, Clock, StickyNote, User, CheckCircle, Loader, ShieldCheck } from 'lucide-react';
import { createOrder } from '../services/api.js';

/**
 * OrderForm (modal)
 * Props:
 *   isOpen      – boolean
 *   onClose     – () => void
 *   cartItems   – Array<{ id, name, price, quantity }>
 *   totalAmount – number  (already includes tax)
 *   onSuccess   – () => void   (called after successful order)
 *   user        – logged in user object or null
 *   onOpenAuth  – () => void   (opens auth modal if guest wants to log in)
 */
export default function OrderForm({ isOpen, onClose, cartItems, totalAmount, onSuccess, user, onOpenAuth }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    pickupTime: '',
    notes: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill user details if logged in
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.full_name || prev.fullName || '',
        email: user.email || prev.email || '',
        phone: user.phone || prev.phone || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email) {
      setErrorMsg('Full name and email are required.');
      return;
    }

    if (!user) {
      setErrorMsg('Please sign in or create an account to place your order.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      await createOrder({
        user_id: user.id,
        items: cartItems.map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        pickupTime: form.pickupTime || null,
        notes: form.notes || null,
        totalAmount,
      });

      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setForm({ fullName: '', email: '', phone: '', pickupTime: '', notes: '' });
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100 rounded-t-2xl z-10">
          <div>
            <h2 className="font-bold text-slate-800 text-xl">Complete Your Order</h2>
            <p className="text-slate-500 text-sm mt-0.5">{cartItems.length} item(s) • Total: <span className="text-orange-500 font-bold">${totalAmount.toFixed(2)}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success state */}
        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h3 className="text-2xl font-bold text-slate-800">Order Placed!</h3>
            <p className="text-slate-500">Your order has been received. We'll have it ready for you!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Auth Notice */}
            {user ? (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-2 rounded-xl border border-green-200">
                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Signed in as <strong>{user.full_name || user.email}</strong></span>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-orange-50 text-orange-800 text-xs px-3 py-2 rounded-xl border border-orange-200">
                <span>Sign in or create an account to place order</span>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="font-bold underline text-orange-600 hover:text-orange-700 ml-2"
                >
                  Sign In / Sign Up
                </button>
              </div>
            )}

            {/* Customer info */}
            <fieldset className="space-y-3">
              <legend className="flex items-center gap-2 font-semibold text-slate-700 text-sm mb-2">
                <User className="w-4 h-4 text-orange-500" /> Your Details
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="of-fullName">Full Name *</label>
                  <input
                    id="of-fullName"
                    name="fullName"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Sardar Huzaifa"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="of-email">Email *</label>
                  <input
                    id="of-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="of-phone">Phone (optional)</label>
                <input
                  id="of-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="03001234567"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </fieldset>

            {/* Order details */}
            <fieldset className="space-y-3">
              <legend className="flex items-center gap-2 font-semibold text-slate-700 text-sm mb-2">
                <Clock className="w-4 h-4 text-orange-500" /> Order Details
              </legend>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="of-pickupTime">
                  <Clock className="w-3 h-3 inline mr-1" /> Pickup Time
                </label>
                <input
                  id="of-pickupTime"
                  name="pickupTime"
                  type="time"
                  value={form.pickupTime}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="of-notes">
                  <StickyNote className="w-3 h-3 inline mr-1" /> Special Notes
                </label>
                <textarea
                  id="of-notes"
                  name="notes"
                  rows={2}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any special requests or allergies..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </fieldset>

            {/* Order summary */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Order Summary</p>
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-600">{item.name} ×{item.quantity}</span>
                  <span className="font-medium text-slate-700">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-200">
                <span>Total (incl. tax)</span>
                <span className="text-orange-500">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Error */}
            {status === 'error' && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                ⚠️ {errorMsg}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <><Loader className="w-4 h-4 animate-spin" /> Placing Order...</>
              ) : (
                'Confirm Order'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
