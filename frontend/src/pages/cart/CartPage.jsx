import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, MapPin, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import { EmptyState } from '../../components/common/LoadingSpinner';

const CartPage = () => {
  const { cart, items, subtotal, deliveryFee, total, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [updatingId, setUpdatingId] = useState(null);

  const handleUpdate = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    try {
      setUpdatingId(itemId);
      await updateQuantity(itemId, newQty);
    } catch (err) {
      error(err.message || 'Could not update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId, title) => {
    try {
      setUpdatingId(itemId);
      await removeItem(itemId);
      success(`Removed ${title} from cart`);
    } catch (err) {
      error(err.message || 'Could not remove item');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all items from your cart?')) {
      try {
        await clearCart();
        success('Shopping cart cleared');
      } catch (err) {
        error(err.message || 'Could not clear cart');
      }
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Your Shopping Cart is Empty"
          description="Explore our fresh regional harvest catalog to add organic vegetables, orchard fruits, grains, and raw honey directly from local producers."
          action={
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20"
            >
              Browse Farm Products <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      </div>
    );
  }

  const isAvailableItem = (item) => {
    if (typeof item.isAvailable === 'boolean') return item.isAvailable;
    if (typeof item.available === 'boolean') return item.available;
    return Number(item.availableStock ?? 0) >= Number(item.quantity ?? 1);
  };

  const hasUnavailableItems = items.some((item) => !isAvailableItem(item));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          Shopping Cart ({items.length} items)
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Review your directly sourced agricultural items before proceeding to checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm divide-y divide-stone-100">
            {items.map((item) => (
              <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Product details */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.productImageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80'}
                    alt={item.productTitle}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-stone-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-bold text-stone-900 hover:text-brand-700 transition-colors text-sm sm:text-base truncate block"
                    >
                      {item.productTitle}
                    </Link>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400" /> {item.farmName}
                    </p>
                    <p className="text-xs font-semibold text-stone-800 mt-1">
                      ₹{item.unitPrice} <span className="text-stone-400 font-normal">/ {item.unit}</span>
                    </p>

                    {!isAvailableItem(item) && (
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block mt-1">
                        Exceeds stock or unavailable (Only {item.availableStock} {item.unit} left)
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                    <button
                      type="button"
                      disabled={updatingId === item.id || item.quantity <= 1}
                      onClick={() => handleUpdate(item.id, item.quantity, -1)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={updatingId === item.id || item.quantity >= item.availableStock}
                      onClick={() => handleUpdate(item.id, item.quantity, 1)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-sm font-black text-stone-900 block">
                      ₹{Number(item.subtotal).toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id, item.productTitle)}
                    className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-2">
            <Link
              to="/products"
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              ← Continue Shopping
            </Link>
            <button
              onClick={handleClear}
              className="text-xs font-bold text-stone-400 hover:text-rose-600 transition-colors"
            >
              Clear Shopping Cart
            </button>
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-6 sticky top-28">
          <h3 className="text-lg font-black text-stone-900">Order Summary</h3>

          <div className="space-y-3 text-xs text-stone-600">
            <div className="flex items-center justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-stone-900">₹{Number(subtotal).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-stone-400" /> Estimated Delivery Fee
              </span>
              <span className="font-bold text-stone-900">
                {deliveryFee > 0 ? `₹${Number(deliveryFee).toFixed(2)}` : 'FREE'}
              </span>
            </div>
            {deliveryFee > 0 && (
              <p className="text-[11px] text-brand-600 bg-brand-50 p-2 rounded-xl">
                Add ₹{(500 - subtotal).toFixed(2)} more for <strong>FREE Delivery</strong>!
              </p>
            )}

            <div className="pt-3 border-t border-stone-100 flex items-baseline justify-between text-base font-black text-stone-900">
              <span>Total Payable</span>
              <span className="text-2xl text-brand-700">₹{Number(total).toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              disabled={hasUnavailableItems}
              onClick={() => navigate('/checkout')}
              className="w-full gap-2 shadow-lg shadow-brand-600/25"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Button>
            {hasUnavailableItems && (
              <p className="text-[11px] text-rose-600 text-center mt-2 font-medium">
                Please remove or reduce out-of-stock items before checking out.
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2 text-stone-500 text-[11px]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Safe Cash on Delivery at your doorstep</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Direct farmer remittance verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
