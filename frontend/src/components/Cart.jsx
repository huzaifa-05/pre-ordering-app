import React from 'react';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';

/**
 * Cart (slide-in drawer)
 * Props:
 *   isOpen      – boolean
 *   onClose     – () => void
 *   items       – Array<{ id, name, price, quantity, image }>
 *   onAdd       – (itemId: string) => void
 *   onRemove    – (itemId: string) => void
 *   onClear     – () => void
 *   onCheckout  – () => void
 */
export default function Cart({ isOpen, onClose, items, onAdd, onRemove, onClear, onCheckout }) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax      = subtotal * 0.08;
  const total    = subtotal + tax;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-slate-800 text-lg">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClear}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                aria-label="Clear cart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400 py-16">
              <ShoppingCart className="w-14 h-14 opacity-30" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm text-center">Browse the menu and add something delicious!</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-slate-50 rounded-xl p-3"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
                  <p className="text-orange-500 font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                {/* Qty controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-7 h-7 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-orange-300 hover:text-orange-500 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-slate-700 text-sm">{item.quantity}</span>
                  <button
                    onClick={() => onAdd(item.id)}
                    className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: totals + checkout */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4 space-y-3">
            <div className="space-y-1.5 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 text-base pt-1 border-t border-slate-100">
                <span>Total</span>
                <span className="text-orange-500">${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-sm shadow-orange-200"
            >
              Place Order — ${total.toFixed(2)}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
