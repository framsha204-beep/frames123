'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  stock: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('id, name, slug, price, sale_price, images, is_active, is_featured, stock').order('created_at', { ascending: false });
    if (search) query = query.ilike('name', `%${search}%`);
    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    toast.success(`Product ${!current ? 'activated' : 'deactivated'}`);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast.success('Product deleted');
    fetchProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Products</h1>
        <button className="btn-primary text-sm inline-flex items-center gap-2"><Plus size={16} /> Add Product</button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-10 text-sm" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
      ) : products.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center"><p className="text-white/30">No products found</p></div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="glass rounded-xl p-4 flex items-center gap-4">
              <div className="relative w-16 h-16 bg-dark-200 rounded-lg overflow-hidden flex-shrink-0">
                {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-semibold text-gold-500">{formatPrice(product.sale_price || product.price)}</span>
                  {product.sale_price && <span className="text-xs text-white/30 line-through">{formatPrice(product.price)}</span>}
                  <span className="text-xs text-white/30">Stock: {product.stock}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(product.id, product.is_active)} className={`text-xs px-3 py-1 rounded-lg ${product.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </button>
                <button className="p-2 rounded-lg hover:bg-white/5 text-white/30"><Edit size={14} /></button>
                <button onClick={() => deleteProduct(product.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
