import React from 'react';
import { ArrowRight, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function Hero({ onExploreMenu }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-white py-16 sm:py-24">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-50/60 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Hero text content */}
          <div className="text-center lg:col-span-7 lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold tracking-wide text-blue-700 ring-1 ring-inset ring-blue-700/10">
              <Zap className="h-3 w-3 text-blue-600 fill-blue-600" /> Pre-order & Skip the Line
            </span>
            
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Craving food?
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 mt-2">
                Order in seconds.
              </span>
            </h1>
            
            <p className="mt-6 text-lg leading-relaxed text-slate-600 max-w-xl mx-auto lg:mx-0">
              Welcome to <strong className="text-slate-800">Foodie WE</strong> by GenZ Restaurant. Customize your meal, select your pickup time, and get gourmet dishes hot and fresh when you arrive.
            </p>

            {/* Micro value props */}
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-5 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Clock className="h-4 w-4" />
                </div>
                <span>15 Min Fast Pickup</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span>Contactless Pre-ordering</span>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button
                onClick={onExploreMenu}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-300 active:scale-98"
              >
                Explore Menu
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Hero graphic image element */}
          <div className="relative mx-auto max-w-md lg:col-span-5 lg:max-w-none">
            <div className="relative rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-1.5 shadow-2xl shadow-blue-100">
              <div className="overflow-hidden rounded-[22px] bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                  alt="Delicious premium food spread"
                  className="h-80 w-full object-cover opacity-90 transition-transform duration-700 hover:scale-105 sm:h-96"
                />
              </div>
              
              {/* Floating review card */}
              <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3.5 rounded-2xl bg-white/95 p-4 shadow-xl border border-slate-100 backdrop-blur-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-white font-bold text-lg">
                  ★
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Chef's Choice</div>
                  <div className="text-xs text-slate-500">Rated 4.9/5 by GenZ foodies</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
