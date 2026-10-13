import React, { useState, useEffect } from 'react';
import {
  Tags,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  X,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import uploadService from '../../services/uploadService';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const AdminCategoriesPage = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const initialForm = {
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCategories();
      setCategories(data || []);
    } catch (err) {
      addToast('Failed to load produce categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      isActive: category.isActive !== undefined ? category.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slug,
    }));
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await uploadService.uploadImage(file);
      const url = res.data || res;
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      addToast('Category image uploaded', 'success');
    } catch (err) {
      addToast('Upload failed. Enter image URL manually.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Category name is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
        isActive: formData.isActive,
      };

      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, payload);
        addToast('Category updated successfully', 'success');
      } else {
        await adminService.createCategory(payload);
        addToast('New category created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Produce Category Taxonomy
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure catalog departments, icons, and product browsing hierarchy.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading taxonomy..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <img
                    src={c.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                    alt={c.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-stone-100 shadow-xs"
                  />
                  <div className="flex items-center gap-2">
                    {c.isActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-bold border border-stone-200">
                        Disabled
                      </span>
                    )}
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-stone-900">{c.name}</h3>
                <p className="text-[11px] font-mono text-stone-400 mt-0.5">slug: {c.slug}</p>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                  {c.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span>Database ID #{c.id}</span>
                <span className="font-semibold text-brand-700">{c.productCount || 0} Products</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
              <h3 className="text-lg font-black text-stone-900">
                {editingCategory ? 'Edit Produce Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exotic Fruits & Berries"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="exotic-fruits-berries"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Seasonal native fruits harvested at peak ripeness..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImage ? '...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-stone-300"
                  />
                  Active (visible in public consumer marketplace)
                </label>
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
