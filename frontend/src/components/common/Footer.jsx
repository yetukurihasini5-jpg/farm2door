import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Heart, ShieldCheck, Truck, Users } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Brand & mission */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Farm<span className="text-brand-500">2</span>Door
              </span>
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed">
              Empowering farmers by cutting out middlemen. Delivering fresh, chemical-free, and ethically harvested produce directly from soil to your kitchen.
            </p>
            <div className="flex items-center gap-3 pt-2 text-stone-400">
              <span className="inline-flex items-center gap-1 text-[11px] bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> 100% Direct
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700">
                <Truck className="w-3.5 h-3.5 text-brand-400" /> Fast Delivery
              </span>
            </div>
          </div>

          {/* Marketplace Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/products" className="hover:text-brand-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=vegetables" className="hover:text-brand-400 transition-colors">
                  Fresh Vegetables
                </Link>
              </li>
              <li>
                <Link to="/products?category=fruits" className="hover:text-brand-400 transition-colors">
                  Orchard Fruits
                </Link>
              </li>
              <li>
                <Link to="/products?category=dairy-honey" className="hover:text-brand-400 transition-colors">
                  Dairy & Pure Honey
                </Link>
              </li>
              <li>
                <Link to="/products?category=grains-pulses" className="hover:text-brand-400 transition-colors">
                  Grains & Pulses
                </Link>
              </li>
            </ul>
          </div>

          {/* For Producers & Consumers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              For Farmers
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/register?role=ROLE_FARMER" className="hover:text-brand-400 transition-colors">
                  Sell on Farm2Door
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  Farmer Portal Login
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-400 transition-colors">
                  Fair Price Guarantee
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-400 transition-colors">
                  Farmer Support Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Direct Values
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Fair price to farmers with zero agent commissions
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Harvested only after order confirmation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Verified customer reviews on delivered orders
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Cash on delivery transparent payment
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Farm2Door Inc. All rights reserved. Direct Farmer-to-Consumer Agricultural Platform.</p>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Built with Java 21, Spring Boot, MySQL & React</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
