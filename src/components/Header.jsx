import React from 'react';
import { ShoppingBag, Flame } from 'lucide-react';

export default function Header({ cartCount, onCartClick }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-100 bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Logo / Branding */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200 transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-300">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
              GenZ Restaurant
            </span>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 -mt-1">
              Foodie WE
            </div>
          </div>
        </div>

        {/* Action Button & Cart Indicator */}
        <div className="flex items-center gap-4">
          <button
            onClick={onCartClick}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-blue-50 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-200 hover:text-blue-600 hover:shadow-md hover:shadow-blue-50 active:scale-95 group"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-6" />
            
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white ring-2 ring-white animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
