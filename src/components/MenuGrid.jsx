import React, { useState } from 'react';
import { Plus, ShoppingBag } from 'lucide-react';

export default function MenuGrid({ menuItems, onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Pastas', 'Burgers', 'Pizzas'];

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section id="menu-section" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          On The Menu Today
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500">
          Handcrafted recipes prepared fresh with top-tier local ingredients. Fast and hot pre-order.
        </p>
      </div>

      {/* Categories Filter Tabs */}
      <div className="mt-8 flex justify-center">
        <div className="flex space-x-1 rounded-2xl bg-blue-50/70 p-1.5 border border-blue-100">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-50/50"
          >
            {/* Dish Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 backdrop-blur-sm shadow-sm">
                {item.category}
              </div>
            </div>

            {/* Content Details */}
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </h3>
                <span className="text-lg font-extrabold text-blue-600">
                  ${item.price.toFixed(2)}
                </span>
              </div>
              
              <p className="mt-2 text-sm text-slate-500 line-clamp-2 flex-1">
                {item.description}
              </p>

              {/* Add To Cart Trigger */}
              <div className="mt-6">
                <button
                  onClick={() => onAddToCart(item)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-sm font-bold text-slate-800 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:shadow-lg hover:shadow-blue-100 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
