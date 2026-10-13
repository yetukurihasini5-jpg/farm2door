import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import ProductCard from '../../components/products/ProductCard';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';

const ProductCatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortDir, setSortDir] = useState(searchParams.get('sortDir') || 'DESC');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));

  // Load Categories on Mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getCategories();
        setCategories(cats || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  // Fetch Products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          size: 12,
          sortBy,
          sortDir,
        };
        if (search.trim()) params.search = search.trim();
        if (selectedCategory) params.categoryId = selectedCategory;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        const data = await productService.getProducts(params);
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, minPrice, maxPrice, sortBy, sortDir, page]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('createdAt');
    setSortDir('DESC');
    setPage(0);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Catalog Header */}
      <div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          Marketplace Catalog
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Explore {totalElements} freshly harvested agricultural products directly from verified local farms.
        </p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search vegetables, mangoes, basmati, honey..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-stone-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(0);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-stone-700 bg-white"
            >
              <option value="">All Crop Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selector */}
          <div className="md:col-span-4">
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                setSortBy(sb);
                setSortDir(sd);
                setPage(0);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-stone-700 bg-white"
            >
              <option value="createdAt-DESC">Sort: Newest Harvest First</option>
              <option value="pricePerUnit-ASC">Sort: Price: Low to High</option>
              <option value="pricePerUnit-DESC">Sort: Price: High to Low</option>
              <option value="ratingAverage-DESC">Sort: Highest Rated</option>
              <option value="title-ASC">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('');
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              selectedCategory === ''
                ? 'bg-brand-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => {
                setSelectedCategory(c.id.toString());
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedCategory === c.id.toString()
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.name}
            </button>
          ))}

          {(search || selectedCategory || minPrice || maxPrice) && (
            <button
              onClick={handleResetFilters}
              className="ml-auto text-xs text-rose-600 hover:underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Product Grid Area */}
      {loading ? (
        <LoadingSpinner text="Searching marketplace database..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products match your criteria"
          description="Try removing price filters or searching for alternative crop terms."
          action={
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-stone-200">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs font-bold text-stone-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCatalogPage;
