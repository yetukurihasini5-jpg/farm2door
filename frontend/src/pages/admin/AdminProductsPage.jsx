import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'];

const AdminProductsPage = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 15,
      };
      if (statusFilter) params.status = statusFilter;
      const data = await productService.getProducts(params);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      addToast('Failed to load marketplace products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, page]);

  const handleStatusChange = async (productId, newStatus) => {
    try {
      setUpdatingId(productId);
      const updated = await adminService.updateProductStatus(productId, newStatus);
      addToast(`Product status updated to ${newStatus}`, 'success');
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update product status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.farmerName && p.farmerName.toLowerCase().includes(q)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Product Moderation & Catalog Governance
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Review produce quality, audit pricing, and moderate product availability on the marketplace.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by produce title, farmer name, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="py-2 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
          </select>
        </div>
      </div>

      {/* Products Moderation Table */}
      {loading ? (
        <LoadingSpinner text="Fetching marketplace catalog..." />
      ) : filteredProducts.length > 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
                <tr>
                  <th className="py-3 px-6">Produce Listing</th>
                  <th className="py-3 px-6">Producer / Farm</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6">Inventory</th>
                  <th className="py-3 px-6 text-right">Moderation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => (
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
                      <p className="font-semibold text-stone-800">{p.farmName || p.farmerName || 'Direct Farmer'}</p>
                      <p className="text-[11px] text-stone-400">{p.farmerLocation || 'Local Region'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium text-[11px]">
                        {p.categoryName || 'Produce'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-stone-900">
                      ₹{p.pricePerUnit} <span className="text-stone-400 font-normal">/ {p.unit}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-stone-800">
                      {p.stockQuantity} {p.unit}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <select
                        disabled={updatingId === p.id}
                        value={p.status}
                        onChange={(e) => handleStatusChange(p.id, e.target.value)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : p.status === 'OUT_OF_STOCK'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
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
          <h3 className="text-base font-bold text-stone-800">No products found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
            No items matched your search query or filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
