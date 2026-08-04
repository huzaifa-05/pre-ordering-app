import React, { useState } from 'react';
import { X, CalendarClock, ShoppingBag } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, cartItems, onSubmitOrder }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pickupTime: '',
  });

  const [errors, setErrors] = useState({});

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const serviceFee = 0.99;
  const total = subtotal + tax + serviceFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (!formData.pickupTime) newErrors.pickupTime = 'Pickup time is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmitOrder({
      ...formData,
      subtotal,
      tax,
      serviceFee,
      total,
      items: cartItems,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in" />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all border border-slate-100 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">Pre-order Pickup</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <X className="h-5.5 w-5.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition-all ${errors.name
                  ? 'border-red-300 bg-red-50/50 focus:border-red-500'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
              />
              {errors.name && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., +1 234 567 890"
                className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition-all ${errors.phone
                  ? 'border-red-300 bg-red-50/50 focus:border-red-500'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
              />
              {errors.phone && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="pickupTime" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Pickup Time
              </label>
              <input
                type="time"
                id="pickupTime"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition-all ${errors.pickupTime
                  ? 'border-red-300 bg-red-50/50 focus:border-red-500'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
              />
              {errors.pickupTime && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.pickupTime}</p>}
            </div>
          </div>

          {/* Pricing Breakdown summary */}
          <div className="rounded-2xl bg-blue-50/40 p-4 border border-blue-50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Order Receipt</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (8%)</span>
                <span className="font-semibold text-slate-800">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Convenience Fee</span>
                <span className="font-semibold text-slate-800">${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-blue-100 pt-2 text-base font-extrabold text-slate-800">
                <span>Total Amount</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-300 active:scale-98"
          >
            Confirm & Pre-order
          </button>
        </form>
      </div>
    </div>
  );
}
