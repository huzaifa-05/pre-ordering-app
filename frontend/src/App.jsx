import React, { useState, useEffect, useCallback } from 'react';
import Navbar    from './components/Navbar.jsx';
import Cart      from './components/Cart.jsx';
import OrderForm from './components/OrderForm.jsx';
import AuthModal from './components/AuthModal.jsx';
import Home      from './pages/Home.jsx';
import Menu      from './pages/Menu.jsx';
import Orders    from './pages/Orders.jsx';
import { getCurrentUser } from './services/api.js';

/**
 * App — root component
 *
 * Manages:
 *   - Custom Email/Password Auth State
 *   - Page routing (home / menu / orders)
 *   - Cart state  (Map<itemId → cartItem>)
 *   - Cart drawer open/close
 *   - OrderForm modal open/close
 *   - AuthModal open/close
 */
export default function App() {
  const [user, setUser]           = useState(null);
  const [page, setPage]           = useState('home');
  const [cart, setCart]           = useState(new Map()); // Map<id, { ...item, quantity }>
  const [cartOpen, setCartOpen]   = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [authOpen, setAuthOpen]   = useState(false);

  // Check stored user session on initial load
  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        if (u) setUser(u);
      })
      .catch(() => setUser(null));
  }, []);

  // ── Cart helpers ──────────────────────────────────────────────
  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(item.id);
      next.set(item.id, existing
        ? { ...existing, quantity: existing.quantity + 1 }
        : { ...item, quantity: 1 }
      );
      return next;
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(itemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        next.delete(itemId);
      } else {
        next.set(itemId, { ...existing, quantity: existing.quantity - 1 });
      }
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart(new Map()), []);

  // ── Derived values ────────────────────────────────────────────
  const cartItems  = [...cart.values()];
  const cartCount  = cartItems.reduce((s, i) => s + i.quantity, 0);
  const subtotal   = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalAmount = subtotal * 1.08; // + 8% tax

  // ── Checkout handler ──────────────────────────────────────────
  const handleCheckout = () => {
    setCartOpen(false);
    if (!user) {
      setAuthOpen(true);
    } else {
      setOrderOpen(true);
    }
  };

  const handleOrderSuccess = () => {
    clearCart();
    setPage('orders');
  };

  // ── Main App Render ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar
        activePage={page}
        onNavigate={setPage}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={() => setUser(null)}
      />

      {/* Pages */}
      {page === 'home'   && <Home onNavigate={setPage} />}
      {page === 'menu'   && <Menu cart={cart} onAdd={addToCart} onRemove={removeFromCart} />}
      {page === 'orders' && <Orders />}

      {/* Cart drawer */}
      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onAdd={(id) => {
          const item = cart.get(id);
          if (item) addToCart(item);
        }}
        onRemove={removeFromCart}
        onClear={clearCart}
        onCheckout={handleCheckout}
      />

      {/* Order form modal */}
      <OrderForm
        isOpen={orderOpen}
        onClose={() => setOrderOpen(false)}
        cartItems={cartItems}
        totalAmount={totalAmount}
        onSuccess={handleOrderSuccess}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {/* Auth modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={(u) => {
          setUser(u);
          if (cartItems.length > 0) {
            setOrderOpen(true);
          }
        }}
      />
    </div>
  );
}
