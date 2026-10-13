import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, MapPin, Check, Plus, Minus, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ProductCard = ({ product }) => {
  const { addToCart, items } = useCart();
  const { isAuthenticated, isConsumer } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(product?.minOrderQuantity || 1);

  if (!product) return null;

  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= 10;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      error('Please sign in as a consumer to add items to your cart');
      navigate('/login');
      return;
    }

    if (!isConsumer) {
      error('Only consumers can purchase products');
      return;
    }

    if (isOutOfStock) {
      error('This product is currently out of stock');
      return;
    }

    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      success(`Added ${quantity} ${product.unit} of ${product.title} to your cart`);
    } catch (err) {
      error(err.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 flex flex-col overflow-hidden h-full">
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-stone-100">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-white/90 backdrop-blur-md text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
            {product.categoryName}
          </span>
          {product.isFeatured && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              Only {product.stockQuantity} {product.unit} left
            </span>
          ) : (
            <span className="bg-brand-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              Fresh Harvest
            </span>
          )}
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Farm info */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
            <span className="truncate font-medium">{product.farmName || product.farmerName}</span>
          </div>

          {/* Title */}
          <Link
            to={`/products/${product.id}`}
            className="block font-bold text-stone-900 group-hover:text-brand-700 transition-colors line-clamp-1 text-base mb-2"
          >
            {product.title}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-stone-800">
              {product.ratingAverage > 0 ? Number(product.ratingAverage).toFixed(1) : 'New'}
            </span>
            {product.reviewCount > 0 && (
              <span className="text-[11px] text-stone-400">({product.reviewCount} reviews)</span>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-xs text-stone-400 block font-medium">Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-stone-900">₹{product.pricePerUnit}</span>
              <span className="text-xs text-stone-500 font-semibold">/{product.unit}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={isOutOfStock || adding}
            onClick={handleAddToCart}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95'
            }`}
            title={isOutOfStock ? 'Sold out' : 'Add to shopping cart'}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
