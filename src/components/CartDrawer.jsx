import React from 'react';
import { X, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-modal="true" role="dialog">
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Dark blurred backdrop overlay */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in"
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-300 ease-in-out animate-slide-in-right">
            <div className="flex h-full flex-col bg-white shadow-2xl">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-800">Your Basket</h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                      <ShoppingCart className="h-8 w-8" />
                    </div>
                    <h3 className="text-md font-bold text-slate-800">Your cart is empty</h3>
                    <p className="mt-1 text-sm text-slate-500 max-w-[240px]">
                      Add delicious signature dishes to start pre-ordering.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 rounded-2xl border border-slate-50 p-3.5 hover:border-blue-50 transition-colors"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-xl object-cover bg-slate-100"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                          <span className="text-xs font-semibold text-blue-600">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>

                          {/* Increment / Decrement & Remove Controls */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center rounded-lg bg-slate-100 p-0.5">
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="p-1 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-slate-700">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="p-1 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-slate-100 px-6 py-6 bg-slate-50/50">
                  <div className="flex justify-between text-base font-bold text-slate-800">
                    <span>Subtotal</span>
                    <span className="text-blue-600">${subtotal.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Taxes and pickup charges calculated at checkout.
                  </p>
                  <button
                    onClick={onCheckout}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-300 active:scale-98"
                  >
                    Proceed to Pre-order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
