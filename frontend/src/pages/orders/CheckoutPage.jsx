import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Plus, CheckCircle2, Truck, ShieldCheck, ArrowRight, DollarSign } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import { addressService } from '../../services/addressService';
import Button from '../../components/common/Button';

const CheckoutPage = () => {
  const { cart, items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New address state
  const [newAddress, setNewAddress] = useState({
    recipientName: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: true,
  });

  useEffect(() => {
    if (!items || items.length === 0) {
      navigate('/cart');
      return;
    }

    const loadAddresses = async () => {
      try {
        const list = await addressService.getAddresses();
        setAddresses(list || []);
        if (list && list.length > 0) {
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      }
    };

    loadAddresses();
  }, [items, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    let checkoutPayload;

    if (showNewAddressForm) {
      if (
        !newAddress.recipientName ||
        !newAddress.phoneNumber ||
        !newAddress.streetAddress ||
        !newAddress.city ||
        !newAddress.state ||
        !newAddress.postalCode
      ) {
        error('Please fill in all delivery address fields');
        return;
      }

      checkoutPayload = {
        recipientName: newAddress.recipientName.trim(),
        phoneNumber: newAddress.phoneNumber.trim(),
        streetAddress: newAddress.streetAddress.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        postalCode: newAddress.postalCode.trim(),
        paymentMethod: 'CASH_ON_DELIVERY',
        notes: notes.trim(),
      };
    } else {
      const selected = addresses.find((a) => a.id === selectedAddressId);
      if (!selected) {
        error('Please select or create a delivery address');
        return;
      }

      checkoutPayload = {
        addressId: selected.id,
        recipientName: selected.recipientName,
        phoneNumber: selected.phoneNumber,
        streetAddress: selected.streetAddress,
        city: selected.city,
        state: selected.state,
        postalCode: selected.postalCode,
        paymentMethod: 'CASH_ON_DELIVERY',
        notes: notes.trim(),
      };
    }

    try {
      setSubmitting(true);
      const placedOrder = await orderService.checkout(checkoutPayload);
      success(`Order placed successfully! Order #${placedOrder.orderNumber}`);
      navigate(`/consumer/orders/${placedOrder.id}`);
    } catch (err) {
      error(err.message || 'Failed to complete checkout. Please review stock limits.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          Checkout & Delivery
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Finalize your farm order with secure Cash on Delivery payment.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Address Selection & Notes */}
        <div className="lg:col-span-8 space-y-6">
          {/* Address Section */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Delivery Address</h3>
                <p className="text-xs text-stone-500 mt-0.5">Where should the farmer deliver your produce?</p>
              </div>

              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showNewAddressForm ? 'Choose Saved Address' : 'Add New Address'}
                </button>
              )}
            </div>

            {/* Saved Addresses Radio Cards */}
            {!showNewAddressForm && addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-stone-900">{addr.recipientName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-stone-200 text-stone-700 font-bold px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-xs text-stone-500 font-medium mt-2">
                        Phone: {addr.phoneNumber}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* New Address Input Form */}
            {showNewAddressForm && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={newAddress.recipientName}
                      onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                      placeholder="e.g. Priya Sundaram"
                      className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phoneNumber}
                      onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Street Address / House No.</label>
                  <input
                    type="text"
                    required
                    value={newAddress.streetAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                    placeholder="e.g. Flat 402, Green Towers, MG Road"
                    className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      placeholder="Pune"
                      className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      placeholder="Maharashtra"
                      className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      placeholder="411001"
                      className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Payment Option</h3>
            <p className="text-xs text-stone-500">Working payment method configured for initial marketplace rollout:</p>

            <div className="p-4 rounded-2xl border-2 border-brand-600 bg-brand-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-stone-500">Pay cash or UPI directly when your fresh harvest arrives</p>
                </div>
              </div>
              <span className="w-5 h-5 rounded-full border-4 border-brand-600 bg-white" />
            </div>
          </div>

          {/* Optional Delivery Instructions / Notes */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-2">
            <label className="block text-xs font-bold text-stone-700">
              Special Delivery Instructions (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Leave with security guard, or call before arrival"
              className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Right: Order Review & Place Order Button */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-6 sticky top-28">
          <h3 className="text-lg font-black text-stone-900">Order Items Review</h3>

          <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-stone-100 pr-1">
            {items.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-stone-900 truncate max-w-[180px]">{item.productTitle}</p>
                  <p className="text-stone-500">
                    {item.quantity} {item.unit} × ₹{item.unitPrice}
                  </p>
                </div>
                <span className="font-bold text-stone-900">₹{Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-stone-900">₹{Number(subtotal).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery Fee</span>
              <span className="font-bold text-stone-900">
                {deliveryFee > 0 ? `₹${Number(deliveryFee).toFixed(2)}` : 'FREE'}
              </span>
            </div>
            <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between text-base font-black text-stone-900">
              <span>Total Payable</span>
              <span className="text-2xl text-brand-700">₹{Number(total).toFixed(2)}</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            className="w-full shadow-lg shadow-brand-600/25"
          >
            Confirm & Place Order
          </Button>

          <p className="text-[11px] text-stone-400 text-center leading-relaxed">
            By placing this order, inventory is reserved from the farmer and will be prepared for packaging.
          </p>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
