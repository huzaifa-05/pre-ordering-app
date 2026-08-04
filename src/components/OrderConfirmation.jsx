import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, MapPin, Receipt, ArrowLeft } from 'lucide-react';

export default function OrderConfirmation({ orderDetails, onBackToMenu }) {
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const orderId = orderDetails?.orderId || 'ORD-' + Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-xl shadow-blue-50/50">
        
        {/* Banner Status Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-10 text-center text-white">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-4 animate-float">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold">Order Confirmed!</h2>
          <p className="mt-1 text-sm text-blue-100">
            Thank you, {orderDetails?.name || 'Customer'}. Your order has been received.
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Status Tracker Bar */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Remaining</div>
                <div className="text-sm font-extrabold text-slate-800">{formatTime(timeLeft)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Reference</div>
                <div className="text-sm font-extrabold text-slate-800">{orderId}</div>
              </div>
            </div>
          </div>

          {/* Receipt Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Your Receipt</h3>
            <div className="space-y-3.5">
              {orderDetails?.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600 text-xs bg-blue-50 h-5 w-5 flex items-center justify-center rounded">
                      {item.quantity}x
                    </span>
                    <span className="font-semibold text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-700">${orderDetails?.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (8%)</span>
                  <span className="font-medium text-slate-700">${orderDetails?.tax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience Fee</span>
                  <span className="font-medium text-slate-700">${orderDetails?.serviceFee?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-extrabold text-slate-800">
                  <span>Paid Amount</span>
                  <span className="text-blue-600">${orderDetails?.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Information */}
          <div className="rounded-2xl border border-slate-100 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pickup Details</h3>
            <div className="flex gap-3 text-sm">
              <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-800">GenZ Restaurant Outlet</div>
                <div className="text-xs text-slate-500">123 Innovator Street, Tech Hub, Suite 101</div>
              </div>
            </div>
            <div className="flex gap-3 text-sm pt-2 border-t border-slate-50">
              <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-800">Pickup Schedule</div>
                <div className="text-xs text-slate-500">Today at {orderDetails?.pickupTime || 'specified time'}</div>
              </div>
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={onBackToMenu}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 active:scale-98"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </button>

        </div>
      </div>
    </div>
  );
}
