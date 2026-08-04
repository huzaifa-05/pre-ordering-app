import React from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

/**
 * MenuCard
 * Props:
 *   item        – { id, name, category, price, description, image }
 *   quantity    – current qty in cart (0 if not added)
 *   onAdd       – () => void
 *   onRemove    – () => void
 */
export default function MenuCard({ item, quantity, onAdd, onRemove }) {
  return (
    <article className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 overflow-hidden flex flex-col transition-shadow duration-200">
      {/* Image */}
      <div className="relative overflow-hidden h-44">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold text-orange-500 px-2.5 py-1 rounded-full shadow-sm">
          {item.category}
        </span>
        {/* Cart quantity badge */}
        {quantity > 0 && (
          <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
            {quantity}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-bold text-slate-800 text-base leading-snug">{item.name}</h3>
        <p className="text-slate-500 text-sm flex-1 line-clamp-2">{item.description}</p>

        {/* Footer: price + controls */}
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-orange-500 text-lg">${item.price.toFixed(2)}</span>

          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-orange-50 rounded-full px-1 py-0.5">
              <button
                onClick={onRemove}
                className="w-7 h-7 rounded-full bg-white border border-orange-200 flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors"
                aria-label={`Remove one ${item.name}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-slate-700 w-4 text-center text-sm">{quantity}</span>
              <button
                onClick={onAdd}
                className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                aria-label={`Add one more ${item.name}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
