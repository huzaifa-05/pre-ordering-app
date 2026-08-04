import React, { useState, useEffect } from 'react';
import { Search, Loader, AlertCircle } from 'lucide-react';
import MenuCard from '../components/MenuCard.jsx';
import { getMenu } from '../services/api.js';

/**
 * Menu page
 * Props:
 *   cart       – Map<id, { ...item, quantity }>
 *   onAdd      – (item) => void
 *   onRemove   – (itemId: string) => void
 */
export default function Menu({ cart, onAdd, onRemove }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    getMenu()
      .then(setMenuItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Derive unique categories
  const categories = ['All', ...new Set(menuItems.map((i) => i.category))];

  // Filter items
  const visible = menuItems.filter((item) => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-400">
        <Loader className="w-8 h-8 animate-spin text-orange-400" />
        <p className="text-sm font-medium">Loading menu…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-red-400">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm font-medium">{error}</p>
        <p className="text-xs text-slate-400">Make sure the backend is running on port 5000.</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-1">Our Menu</h1>
        <p className="text-slate-500 text-sm">{menuItems.length} delicious items available today</p>
      </div>

      {/* Search + categories */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search dishes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No dishes found</p>
          <p className="text-sm mt-1">Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visible.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              quantity={cart.get(item.id)?.quantity || 0}
              onAdd={() => onAdd(item)}
              onRemove={() => onRemove(item.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
