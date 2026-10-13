import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Upload,
  CheckCircle,
  X,
  Sprout,
  Image as ImageIcon,
  DollarSign,
  Package,
} from 'lucide-react';
import { farmerService } from '../../services/farmerService';
import { categoryService } from '../../services/productService';
import uploadService from '../../services/uploadService';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner, ConfirmationModal } from '../../components/common/LoadingSpinner';

const UNITS = ['KG', 'GRAM', 'PIECE', 'BUNCH', 'DOZEN', 'LITER'];

const FarmerProductsPage = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const initialFormState = {
    title: '',
    description: '',
    categoryId: '',
    unit: 'KG',
    pricePerUnit: '',
    stockQuantity: '',
    minOrderQuantity: '1',
    imageUrl: '',
    isFeatured: false,
    status: 'ACTIVE',
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await farmerService.getMyProducts(page, 12);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      addToast('Failed to load produce listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      categoryId: categories.length > 0 ? categories[0].id : '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || '',
      description: product.description || '',
      categoryId: product.categoryId || (categories.find(c => c.name === product.categoryName)?.id || ''),
      unit: product.unit || 'KG',
      pricePerUnit: product.pricePerUnit || '',
      stockQuantity: product.stockQuantity || '',
      minOrderQuantity: product.minOrderQuantity || '1',
      imageUrl: product.imageUrl || '',
      isFeatured: product.isFeatured || false,
      status: product.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, WEBP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size cannot exceed 5MB', 'error');
      return;
    }

    try {
      setUploadingImage(true);
      const res = await uploadService.uploadImage(file);
      // res.data or res contains the file URL
      const url = res.data || res;
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      addToast('Image uploaded successfully', 'success');
    } catch (err) {
      addToast('Failed to upload image. You can enter an image URL instead.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast('Produce title is required', 'error');
      return;
    }
    if (!formData.categoryId) {
      addToast('Please select a produce category', 'error');
      return;
    }
    if (!formData.pricePerUnit || Number(formData.pricePerUnit) <= 0) {
      addToast('Price must be greater than zero', 'error');
      return;
    }
    if (formData.stockQuantity === '' || Number(formData.stockQuantity) < 0) {
      addToast('Stock quantity cannot be negative', 'error');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      categoryId: Number(formData.categoryId),
      unit: formData.unit,
      pricePerUnit: Number(formData.pricePerUnit),
      stockQuantity: Number(formData.stockQuantity),
      minOrderQuantity: Number(formData.minOrderQuantity) || 1,
      imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
      isFeatured: formData.isFeatured,
      status: formData.status,
    };

    try {
      setSubmitting(true);
      if (editingProduct) {
        await farmerService.updateProduct(editingProduct.id, payload);
        addToast('Produce listing updated successfully', 'success');
      } else {
        await farmerService.createProduct(payload);
        addToast('New produce added to your catalog', 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await farmerService.toggleProductStatus(product.id);
      addToast(`Status toggled for "${product.title}"`, 'success');
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, status: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
            : p
        )
      );
    } catch (err) {
      addToast('Failed to toggle product status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await farmerService.deleteProduct(productToDelete.id);
      addToast(`Listing deactivated: ${productToDelete.title}`, 'success');
      setDeleteModalOpen(false);
      fetchProducts();
    } catch (err) {
      addToast('Failed to delete listing', 'error');
    } finally {
      setDeleting(false);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory ? p.categoryName === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Produce & Inventory Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Maintain your crop catalog, prices per unit, stock levels, and store visibility.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Produce
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search produce by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <LoadingSpinner text="Fetching produce inventory..." />
      ) : filteredProducts.length > 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
                <tr>
                  <th className="py-3 px-6">Produce</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6">Stock Available</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => {
                  const isLow = Number(p.stockQuantity) <= 5 && Number(p.stockQuantity) > 0;
                  const isOut = Number(p.stockQuantity) <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                            alt={p.title}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-stone-900 text-sm">{p.title}</p>
                            <p className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium text-[11px]">
                          {p.categoryName || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-stone-900">
                        ₹{p.pricePerUnit} <span className="text-stone-400 font-normal">/ {p.unit}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`font-black ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-stone-800'}`}>
                            {p.stockQuantity} {p.unit}
                          </span>
                          {isOut ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                              Out
                            </span>
                          ) : isLow ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> Low
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className="flex items-center gap-1.5 focus:outline-none"
                          title="Click to toggle status"
                        >
                          {p.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200 font-bold text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                              INACTIVE
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-brand-600 hover:bg-stone-100 transition-colors"
                            title="Edit Listing"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setProductToDelete(p);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Deactivate / Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center">
          <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No produce listings found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1 mb-6">
            {searchQuery
              ? 'No items matched your search query. Try clearing the filters.'
              : 'Add your first harvest item to start receiving orders directly from consumers.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20"
          >
            Add Harvest Listing
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-100 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-stone-900">
                  {editingProduct ? 'Edit Produce Listing' : 'Add New Produce Listing'}
                </h3>
                <p className="text-xs text-stone-500">Provide direct details about your harvest for consumers</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Produce Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Farm Fresh Alphonso Mangoes"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="">Select a Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Selling Unit *</label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Price per Unit (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 80.00"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Stock Quantity Available *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 50"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Produce Description</label>
                  <textarea
                    rows="3"
                    placeholder="Cultivated using organic compost, harvested fresh yesterday morning..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Image Section */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-stone-700">Produce Image</label>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 border border-dashed border-stone-300 flex-shrink-0">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 w-full space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          {uploadingImage ? 'Uploading...' : 'Upload File'}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingImage}
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-stone-400">or enter image URL directly:</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 select-none">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-stone-300"
                    />
                    Feature on Marketplace Top Harvests
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Produce' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Deactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Deactivate Produce Listing"
        message={`Are you sure you want to deactivate "${productToDelete?.title}"? Consumers will no longer be able to place new orders for this item.`}
        confirmText="Yes, Deactivate"
        isDanger={true}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
};

export default FarmerProductsPage;
