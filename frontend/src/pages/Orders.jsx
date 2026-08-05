import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Loader, AlertCircle, RefreshCw,
  Clock, StickyNote, CheckCircle, Package,
} from 'lucide-react';
import { getOrders } from '../services/api.js';

const STATUS_STYLES = {
  Received:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
  Preparing:  'bg-blue-50 text-blue-700 border border-blue-200',
  Ready:      'bg-green-50 text-green-700 border border-green-200',
  Completed:  'bg-slate-100 text-slate-600 border border-slate-200',
};

const STATUS_ICON = {
  Received:   <Clock className="w-3 h-3" />,
  Preparing:  <Package className="w-3 h-3" />,
  Ready:      <CheckCircle className="w-3 h-3" />,
  Completed:  <CheckCircle className="w-3 h-3" />,
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    getOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-orange-500" />
            Orders
          </h1>
          <p className="text-slate-500 text-sm mt-1">All orders placed through the app</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-orange-500 border border-slate-200 hover:border-orange-300 px-3 py-2 rounded-xl transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader className="w-8 h-8 animate-spin text-orange-400" />
          <p className="text-sm">Loading orders…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-400">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={fetchOrders} className="text-sm text-orange-500 underline">Try again</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <ClipboardList className="w-14 h-14 opacity-30" />
          <p className="font-medium">No orders yet</p>
          <p className="text-sm">Place an order from the Menu page!</p>
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusStyle = STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-600';
            const statusIcon  = STATUS_ICON[order.status]  || <Clock className="w-3 h-3" />;

            return (
              <article
                key={order.orderId}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                {/* Order header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{order.orderId}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${statusStyle}`}>
                    {statusIcon}
                    {order.status}
                  </span>
                </div>

                {/* Customer */}
                <div className="bg-slate-50 rounded-xl p-3 mb-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Customer</span>
                    <span className="font-semibold text-slate-700">{order.user?.full_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Email</span>
                    <span className="font-semibold text-slate-700">{order.user?.email || '—'}</span>
                  </div>
                  {order.pickupTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">{order.pickupTime}</span>
                    </div>
                  )}
                  {order.notes && (
                    <div className="flex items-start gap-1 w-full">
                      <StickyNote className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600 text-xs italic">{order.notes}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-1.5 mb-3">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.name || item.menuItemId} ×{item.quantity}</span>
                      <span className="font-medium text-slate-700">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between font-bold text-slate-800 pt-3 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-orange-500 text-lg">${parseFloat(order.totalAmount).toFixed(2)}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
