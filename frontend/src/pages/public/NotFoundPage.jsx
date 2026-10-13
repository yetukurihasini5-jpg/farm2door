import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Home, ShoppingBag } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-600 mb-6 border border-brand-100 shadow-sm">
        <Sprout className="w-10 h-10" />
      </div>
      <span className="text-xs font-black tracking-widest uppercase text-brand-600 bg-brand-50 px-3 py-1 rounded-full mb-3 border border-brand-100">
        404 — Page Not Found
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight mb-3">
        Oops! This Field Has Nothing Planted
      </h1>
      <p className="text-sm text-stone-500 max-w-md mb-8 leading-relaxed">
        The link you followed may have moved or no longer exists. Let's get you back to the fresh marketplace.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
        >
          <Home className="w-4 h-4" />
          Return to Home
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          Browse Produce Catalog
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
