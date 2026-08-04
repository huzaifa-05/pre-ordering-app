import React from 'react';
import { UtensilsCrossed, ArrowRight, Star } from 'lucide-react';

/**
 * Home page — landing / hero section
 * Props:
 *   onNavigate – (page: string) => void
 */
export default function Home({ onNavigate }) {
  const features = [
    { emoji: '⚡', title: 'Lightning Fast', desc: 'Place your order in under 60 seconds.' },
    { emoji: '🎯', title: 'Pickup Ready', desc: 'Your food is hot when you arrive.' },
    { emoji: '📱', title: 'No App Needed', desc: 'Works perfectly in any browser.' },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-orange-50 via-white to-white">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Star className="w-3 h-3 fill-current" />
          Premium Pre-Ordering Experience
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-800 leading-tight mb-4">
          Order Ahead,<br />
          <span className="text-orange-500">Skip the Wait</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-md mb-8">
          Browse our fresh menu, add to cart, and pick up hot food — zero waiting in line.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onNavigate('menu')}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-full transition-colors shadow-md shadow-orange-200 text-sm"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Browse Menu
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-orange-300 text-slate-700 font-bold px-7 py-3.5 rounded-full transition-colors text-sm"
          >
            View Orders
          </button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="bg-white px-4 py-14">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 hover:border-orange-200 transition-colors"
            >
              <span className="text-4xl mb-3 block">{f.emoji}</span>
              <h3 className="font-bold text-slate-800 mb-1">{f.title}</h3>
              <p className="text-slate-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
