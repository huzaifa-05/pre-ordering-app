import React from 'react';
import { ShoppingCart, UtensilsCrossed, Menu as MenuIcon, X, User, LogOut, LogIn } from 'lucide-react';
import { logout } from '../services/api.js';

/**
 * Navbar
 * Props:
 *   activePage   – 'home' | 'menu' | 'orders'
 *   onNavigate   – (page: string) => void
 *   cartCount    – number of items in the cart
 *   onCartOpen   – () => void
 *   user         – logged in user object or null
 *   onOpenAuth   – () => void
 *   onLogout     – () => void
 */
export default function Navbar({ activePage, onNavigate, cartCount, onCartOpen, user, onOpenAuth, onLogout }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navLink = (page, label) => (
    <button
      onClick={() => { onNavigate(page); setMobileOpen(false); }}
      className={`font-semibold text-sm transition-colors px-1 pb-0.5 border-b-2 ${
        activePage === page
          ? 'text-orange-500 border-orange-500'
          : 'text-slate-600 border-transparent hover:text-orange-500'
      }`}
    >
      {label}
    </button>
  );

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 font-bold text-xl text-slate-800 hover:text-orange-500 transition-colors"
        >
          <UtensilsCrossed className="w-6 h-6 text-orange-500" />
          <span>GenZ<span className="text-orange-500">Bites</span></span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLink('home', 'Home')}
          {navLink('menu', 'Menu')}
          {navLink('orders', 'Orders')}
        </div>

        {/* Auth + Cart + Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Custom Auth Status */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <User className="w-3.5 h-3.5 text-orange-500" />
                <span className="max-w-[120px] truncate">{user.full_name || user.email}</span>
              </div>
              <button
                onClick={() => { logout(); onLogout(); }}
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-red-500 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-full transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}

          {/* Cart Icon */}
          <button
            onClick={onCartOpen}
            className="relative p-2 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-500 transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-3">
          {navLink('home', 'Home')}
          {navLink('menu', 'Menu')}
          {navLink('orders', 'Orders')}
        </div>
      )}
    </nav>
  );
}
