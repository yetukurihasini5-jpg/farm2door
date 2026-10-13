import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { addressService } from '../../services/addressService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';

const ConsumerAddressesPage = () => {
  const { success, error } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    recipientName: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false,
  });

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data || []);
    } catch (err) {
      console.error(err);
      error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      recipientName: '',
      phoneNumber: '',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      isDefault: addresses.length === 0,
    });
    setModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingId(addr.id);
    setForm({
      recipientName: addr.recipientName,
      phoneNumber: addr.phoneNumber,
      streetAddress: addr.streetAddress,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await addressService.updateAddress(editingId, form);
        success('Address updated successfully');
      } else {
        await addressService.createAddress(form);
        success('New address saved');
      }
      setModalOpen(false);
      loadAddresses();
    } catch (err) {
      error(err.message || 'Failed to save address');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressService.deleteAddress(id);
        success('Address removed');
        loadAddresses();
      } catch (err) {
        error(err.message || 'Failed to delete address');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefault(id);
      success('Default address updated');
      loadAddresses();
    } catch (err) {
      error(err.message || 'Failed to update default address');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving delivery locations..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Delivery Addresses
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your residential and work addresses for seamless delivery.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openAddModal} icon={Plus}>
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No Addresses Saved"
          description="Add your first delivery address to enable rapid one-click checkout."
          action={
            <Button variant="primary" size="md" onClick={openAddModal} icon={Plus}>
              Add Address Now
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                addr.isDefault
                  ? 'border-brand-600 bg-brand-50/20 shadow-sm'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-stone-900">{addr.recipientName}</h3>
                  {addr.isDefault ? (
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-brand-600" /> Default
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] font-bold text-stone-500 hover:text-brand-600 hover:underline"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}
                </p>
                <p className="text-xs text-stone-500 font-medium mt-2">
                  Contact Phone: {addr.phoneNumber}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => openEditModal(addr)}
                  className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                  title="Edit address"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog for Add/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100">
            <h3 className="text-lg font-bold text-stone-900 mb-4">
              {editingId ? 'Edit Address' : 'Add New Delivery Address'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={form.recipientName}
                    onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                    className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={form.streetAddress}
                  onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                  className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                />
                <label htmlFor="isDefault" className="text-xs font-bold text-stone-700">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="md">
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumerAddressesPage;
