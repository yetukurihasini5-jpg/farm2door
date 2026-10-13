import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import ProductCard from '../../components/products/ProductCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [cats, products] = await Promise.all([
          categoryService.getCategories(),
          productService.getFeaturedProducts(),
        ]);
        setCategories(cats || []);
        setFeaturedProducts(products || []);
      } catch (err) {
        console.error('Error loading landing page data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-brand-50/60 via-white to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 border border-brand-200/80 text-brand-800 text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-spin" />
                Zero Middlemen • 100% Farmgate Transparency
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.12]">
                Direct From <span className="text-brand-600 underline decoration-brand-300 decoration-wavy decoration-2">Local Farms</span> To Your Kitchen Door.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
                Connect directly with passionate regional farmers. Enjoy chemical-free seasonal vegetables, orchard-ripened fruits, stone-milled grains, and pure apiary honey delivered right after harvest.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xl shadow-brand-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop Fresh Harvest
                </Link>
                <Link
                  to="/register?role=ROLE_FARMER"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-sm border border-stone-200 shadow-sm transition-all hover:border-stone-300"
                >
                  <Sprout className="w-4 h-4 text-brand-600" />
                  Join as Producer Farmer
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200/80 max-w-lg">
                <div>
                  <p className="text-2xl font-black text-stone-900">100%</p>
                  <p className="text-xs font-semibold text-stone-500">Residue Free</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-stone-900">0%</p>
                  <p className="text-xs font-semibold text-stone-500">Middleman Cuts</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-stone-900">COD</p>
                  <p className="text-xs font-semibold text-stone-500">Safe Payment</p>
                </div>
              </div>
            </div>

            {/* Hero Image Mosaic */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
                    alt="Fresh organic farm harvest"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-500 px-2 py-0.5 rounded-md inline-block mb-1">
                      Nashik Valley Organic Co-op
                    </span>
                    <p className="text-sm font-bold">Picked at sunrise, delivered within hours</p>
                  </div>
                </div>

                {/* Floating pill badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3 animate-bounce duration-1000">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-stone-900">Verified Producers</p>
                    <p className="text-[10px] text-stone-500">Direct Farmgate Quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY TAXONOMY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
              Fresh Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
              Browse by Agricultural Produce
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            Explore all items <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading farm categories..." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="group bg-white rounded-2xl p-4 border border-stone-200/80 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-900/5 transition-all flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 bg-stone-100 relative group-hover:scale-105 transition-transform">
                  <img
                    src={cat.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xs font-bold text-stone-900 group-hover:text-brand-700 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
                  {cat.description}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. FEATURED PRODUCTS (FROM MYSQL VIA API) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
              Handpicked Harvest
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
              Featured Producer Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            View full market catalog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching fresh farm products..." />
        ) : featuredProducts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">
            <p className="text-sm text-stone-500">Products are currently loading from MySQL database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="bg-white border-y border-stone-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
              Seamless Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
              How Farm2Door Operates
            </h2>
            <p className="text-sm text-stone-500 mt-2 leading-relaxed">
              We eliminate traditional mandi intermediaries, ensuring farmers receive maximum profit and households receive freshly harvested crops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200/70 relative">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-base shadow-lg shadow-brand-600/30 mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Farmers List Produce</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Registered local farmers publish their current crop harvests, specifying transparent prices per KG/dozen and actual available inventory.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200/70 relative">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-base shadow-lg shadow-brand-600/30 mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Consumers Order Directly</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Browse by categories, inspect farmer background & reviews, add items to cart, and checkout with convenient Cash on Delivery.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200/70 relative">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-base shadow-lg shadow-brand-600/30 mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Harvest & Doorstep Delivery</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Farmers accept and pack the order. Produce is dispatched directly in temperature-safe packaging straight to your home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS FOR FARMERS & CONSUMERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Consumer Benefits */}
          <div className="bg-gradient-to-br from-brand-900 to-brand-950 text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300 bg-brand-800/80 px-2.5 py-1 rounded-md">
                For Conscious Consumers
              </span>
              <h3 className="text-2xl font-black mt-3 mb-4">Pure Nutrition, Fair Price</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-brand-100">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  Farm-fresh taste harvested within 24 hours of delivery
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  No chemical ripening, zero cold-storage nutrient loss
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  Know exactly which local grower produced your family's food
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-stone-950 font-bold text-xs rounded-xl transition-all"
              >
                Browse Marketplace <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Farmer Benefits */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-stone-800 px-2.5 py-1 rounded-md">
                For Producer Farmers
              </span>
              <h3 className="text-2xl font-black mt-3 mb-4">Empowering Rural Livelihoods</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-stone-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  Earn 40% to 60% higher realization compared to wholesale mandis
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  Full autonomy to set your own pricing and manage your inventory
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  Direct customer recognition, feedback, and loyal recurring buyers
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                to="/register?role=ROLE_FARMER"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all"
              >
                Register Your Farm <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
