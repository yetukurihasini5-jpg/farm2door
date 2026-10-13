import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  ArrowLeft,
  Truck,
  Heart,
  Share2,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, isConsumer } = useAuth();
  const { success, error } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
        setQuantity(data.minOrderQuantity || 1);

        const revData = await reviewService.getProductReviews(id, 0, 10);
        setReviews(revData.content || []);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Retrieving farm produce specifications..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-stone-800">Product Not Found</h2>
        <p className="text-xs text-stone-500 mt-2 mb-6">The requested product listing may have been deactivated or removed.</p>
        <Link to="/products" className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= 10;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      error('Please sign in as a consumer to purchase');
      navigate('/login');
      return;
    }

    if (!isConsumer) {
      error('Only consumers can purchase products');
      return;
    }

    if (isOutOfStock) {
      error('Product is out of stock');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(product.id, quantity);
      success(`Added ${quantity} ${product.unit} of ${product.title} to your cart`);
    } catch (err) {
      error(err.message || 'Could not add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleIncrement = () => {
    if (quantity < product.stockQuantity) {
      setQuantity((q) => q + 1);
    } else {
      error(`Maximum available stock is ${product.stockQuantity} ${product.unit}`);
    }
  };

  const handleDecrement = () => {
    const min = product.minOrderQuantity || 1;
    if (quantity > min) {
      setQuantity((q) => q - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand-600">Catalog</Link>
        <span>/</span>
        <span className="text-stone-900 font-bold truncate max-w-xs">{product.title}</span>
      </div>

      {/* Main product display grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-sm">
        {/* Left: Product Imagery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 relative group">
            <img
              src={product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-white/95 backdrop-blur-md text-brand-800 text-xs font-bold px-3 py-1 rounded-xl shadow-sm">
                {product.categoryName}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Specifications & Farmer Info */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Title & Rating */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-bold text-stone-800 ml-1">
                    {product.ratingAverage > 0 ? Number(product.ratingAverage).toFixed(1) : 'New'}
                  </span>
                </div>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs text-stone-500">
                  {product.reviewCount} customer reviews
                </span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  100% Direct Harvest
                </span>
              </div>
            </div>

            {/* Price section */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-900">₹{product.pricePerUnit}</span>
              <span className="text-sm text-stone-500 font-semibold">per {product.unit}</span>
              <span className="text-xs text-stone-400 ml-auto font-medium">All taxes included</span>
            </div>

            {/* Description */}
            <p className="text-sm text-stone-600 leading-relaxed">
              {product.description || 'Pure, sustainably farmed produce grown using natural compost, indigenous seeds, and ethical methods.'}
            </p>

            {/* Farmer Farm Profile Card */}
            <div className="p-4 rounded-2xl border border-brand-200/80 bg-brand-50/50 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-base flex-shrink-0 shadow-sm">
                {product.farmerName?.charAt(0) || 'F'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-stone-900 truncate">{product.farmName}</h4>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-brand-600" /> Verified Producer
                  </span>
                </div>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" /> {product.farmLocation}
                </p>
                <p className="text-[11px] text-stone-600 mt-1">Cultivated by {product.farmerName}</p>
              </div>
            </div>

            {/* Stock status indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-stone-700">Stock Availability:</span>
              {isOutOfStock ? (
                <span className="font-bold text-rose-600">Currently Sold Out</span>
              ) : isLowStock ? (
                <span className="font-bold text-amber-600">
                  Low Stock — Only {product.stockQuantity} {product.unit} remaining
                </span>
              ) : (
                <span className="font-bold text-brand-700">
                  In Stock ({product.stockQuantity} {product.unit} available)
                </span>
              )}
            </div>
          </div>

          {/* Action Bar: Quantity & Add to Cart */}
          <div className="pt-6 border-t border-stone-100 space-y-4">
            <div className="flex items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                <button
                  type="button"
                  disabled={quantity <= (product.minOrderQuantity || 1)}
                  onClick={handleDecrement}
                  className="p-2 text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-stone-900">
                  {quantity} {product.unit}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stockQuantity}
                  onClick={handleIncrement}
                  className="p-2 text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add To Cart Button */}
              <Button
                variant="primary"
                size="lg"
                disabled={isOutOfStock}
                loading={addingToCart}
                onClick={handleAddToCart}
                className="flex-1 gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {isOutOfStock ? 'Sold Out' : `Add to Cart • ₹${(product.pricePerUnit * quantity).toFixed(2)}`}
              </Button>
            </div>

            <p className="text-[11px] text-stone-400 text-center">
              Minimum order: {product.minOrderQuantity || 1} {product.unit} • Free delivery on orders over ₹500
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-stone-900">Verified Consumer Reviews</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Authentic reviews submitted exclusively by verified buyers after receiving delivery.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-stone-900">
              {product.ratingAverage > 0 ? Number(product.ratingAverage).toFixed(1) : '5.0'}
            </span>
            <div className="flex items-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-xs">
            No customer reviews posted for this produce yet. Reviews can be written by customers after order delivery.
          </div>
        ) : (
          <div className="divide-y divide-stone-100 space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{rev.consumerName}</span>
                    <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-bold">
                      Verified Buyer
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetailPage;
