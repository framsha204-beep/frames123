'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 skeleton rounded-full" /></div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('products').select('*, category:categories(*)').eq('is_active', true);

    if (selectedCategory) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', selectedCategory).single();
      if (cat) query = query.eq('category_id', cat.id);
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    switch (sortBy) {
      case 'price-low': query = query.order('price', { ascending: true }); break;
      case 'price-high': query = query.order('price', { ascending: false }); break;
      case 'name': query = query.order('name', { ascending: true }); break;
      default: query = query.order('created_at', { ascending: false });
    }

    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  }, [selectedCategory, sortBy, searchQuery]);

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true).order('display_order').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSelectedCategory(categorySlug);
  }, [categorySlug]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-padding">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-display font-bold">
            {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'Shop' : 'All Frames'}
          </h1>
          <p className="text-white/40 mt-2">Discover our curated collection of premium photo frames.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={cn(
            'lg:w-64 flex-shrink-0',
            showFilters ? 'block' : 'hidden lg:block'
          )}>
            <div className="glass rounded-2xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-gold-500">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="lg:hidden">
                  <X size={18} />
                </button>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search frames..."
                    className="input-field pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Categories</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      !selectedCategory ? 'bg-gold-500/10 text-gold-500' : 'text-white/50 hover:text-white hover:bg-white/5'
                    )}
                  >
                    All Frames
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        selectedCategory === cat.slug ? 'bg-gold-500/10 text-gold-500' : 'text-white/50 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-ghost inline-flex items-center gap-2 text-sm"
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
              <span className="text-sm text-white/30">{products.length} products</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card">
                    <div className="aspect-square skeleton" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 skeleton w-3/4" />
                      <div className="h-4 skeleton w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white/30 text-lg">No frames found</p>
                <p className="text-white/20 text-sm mt-2">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/product/${product.slug}`} className="card card-hover group">
                    <div className="relative aspect-square bg-dark-200 overflow-hidden">
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      )}
                      {product.is_premium && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-gold-500 text-dark-900 text-xs font-bold rounded">PREMIUM</div>
                      )}
                      {product.sale_price && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">SALE</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gold-500/60 mb-1">
                        {(product.category as unknown as Category)?.name || 'Frame'}
                      </p>
                      <h3 className="font-medium text-sm group-hover:text-gold-500 transition-colors">{product.name}</h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-gold-500 font-semibold">{formatPrice(product.sale_price || product.price)}</span>
                        {product.sale_price && (
                          <span className="text-white/30 text-sm line-through">{formatPrice(product.price)}</span>
                        )}
                      </div>
                      {product.sizes?.length > 0 && (
                        <p className="text-xs text-white/20 mt-2">{product.sizes.length} sizes available</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
