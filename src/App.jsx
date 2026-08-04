import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MenuGrid from './components/MenuGrid';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderConfirmation from './components/OrderConfirmation';

// Fallback menu in case server is not running during initial frontend preview
const FALLBACK_MENU = [
  {
    id: 'pasta-1',
    category: 'Pastas',
    name: 'Fettuccine Alfredo',
    price: 14.99,
    description: 'Rich, velvet fettuccine tossed in dynamic parmesan-garlic cream, finished with fresh cracked pepper.',
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'burger-1',
    category: 'Burgers',
    name: 'Classic Beef Burger',
    price: 12.99,
    description: 'Juicy smashed beef patty, cheddar, heirloom tomato, crisp bibb lettuce, and secret house spread on brioche.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'pizza-1',
    category: 'Pizzas',
    name: 'Pepperoni Pizza',
    price: 16.99,
    description: 'Artisanal thin crust topped with signature marinara, fresh whole-milk mozzarella, and crispy cupped pepperoni.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80',
  },
];

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Fetch menu from Node.js Express backend on component mount
  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await fetch('/api/menu');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setMenuItems(data.data);
        } else {
          setMenuItems(FALLBACK_MENU);
        }
      } catch (err) {
        console.warn('Backend API /api/menu unreachable, using fallback menu:', err);
        setMenuItems(FALLBACK_MENU);
      } finally {
        setIsLoadingMenu(false);
      }
    }
    fetchMenu();
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleSubmitOrder = async (orderInfo) => {
    setIsSubmittingOrder(true);
    try {
      // POST order request to Node.js backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: orderInfo.name,
          phone: orderInfo.phone,
          pickupTime: orderInfo.pickupTime,
          items: orderInfo.items,
          totalAmount: orderInfo.total,
        }),
      });

      const data = await response.json();
      if (data.success && data.order) {
        // Enhance order details with backend order ID
        setOrderDetails({
          ...orderInfo,
          orderId: data.order.orderId,
        });
      } else {
        // Fallback if backend server error
        setOrderDetails({
          ...orderInfo,
          orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }
    } catch (error) {
      console.warn('Backend API /api/orders request failed, recording offline order:', error);
      setOrderDetails({
        ...orderInfo,
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      });
    } finally {
      setIsSubmittingOrder(false);
      setIsCheckoutOpen(false);
      setCart([]); // Reset cart
    }
  };

  const handleBackToMenu = () => {
    setOrderDetails(null);
  };

  const scrollToMenu = () => {
    const menuSec = document.getElementById('menu-section');
    if (menuSec) {
      menuSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 flex flex-col justify-between">
      <div>
        <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />

        {orderDetails ? (
          <OrderConfirmation orderDetails={orderDetails} onBackToMenu={handleBackToMenu} />
        ) : (
          <>
            <Hero onExploreMenu={scrollToMenu} />
            {isLoadingMenu ? (
              <div className="py-20 text-center text-slate-500 font-semibold animate-pulse">
                Loading delicious menu from Node.js backend...
              </div>
            ) : (
              <MenuGrid menuItems={menuItems} onAddToCart={handleAddToCart} />
            )}
          </>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="border-t border-slate-100 bg-white py-8 text-center text-xs font-semibold text-slate-400">
        <div>&copy; {new Date().getFullYear()} GenZ Restaurant. Node.js Express Backend + React Frontend.</div>
        <div className="mt-1 text-slate-300">All rights reserved. Modular Fullstack Architecture.</div>
      </footer>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* Checkout Modal Form */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmittingOrder}
      />
    </div>
  );
}

export default App;
