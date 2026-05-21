'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, Minus, Plus, Truck, Shield, RotateCcw, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, Review } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*), inventory(*)')
        .eq('slug', slug)
        .single();

      if (data) {
        setProduct(data);
        setSelectedSize(data.sizes?.[0] || '');
        setSelectedColor(data.colors?.[0] || '');
        setSelectedMaterial(data.materials?.[0] || '');

        const [reviewsRes, relatedRes] = await Promise.all([
          supabase.from('reviews').select('*').eq('product_id', data.id).eq('is_approved', true),
          supabase.from('products').select('*').eq('category_id', data.category_id).neq('id', data.id).eq('is_active', true).limit(4),
        ]);
        if (reviewsRes.data) setReviews(reviewsRes.data);
        if (relatedRes.data) setRelatedProducts(relatedRes.data);
      }
      setLoading(false);
    };
    if (slug) fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity, selectedSize, selectedColor, selectedMaterial);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square skeleton rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 skeleton w-3/4" />
              <div className="h-6 skeleton w-1/4" />
              <div className="h-24 skeleton w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/shop" className="btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const price = product.sale_price || product.price;
  const specs = product.specifications as Record<string, string>;
  const avgRating = reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-padding">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/30 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-white/60">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-dark-200 rounded-2xl overflow-hidden mb-4">
              {product.images?.[selectedImage] && (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              )}
              {product.is_premium && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-gold-500 text-dark-900 text-xs font-bold rounded-lg">
                  PREMIUM QUALITY
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors',
                      selectedImage === i ? 'border-gold-500' : 'border-transparent hover:border-white/20'
                    )}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">{product.name}</h1>

            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < Math.round(avgRating) ? 'text-gold-500 fill-gold-500' : 'text-white/10'} />
                  ))}
                </div>
                <span className="text-sm text-white/40">({reviews.length} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gold-500">{formatPrice(price)}</span>
              {product.sale_price && (
                <>
                  <span className="text-lg text-white/30 line-through">{formatPrice(product.price)}</span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded">
                    {Math.round((1 - product.sale_price / product.price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-white/50 leading-relaxed mb-8">{product.description}</p>

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/60 mb-3">Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                        selectedSize === size
                          ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                          : 'border-white/10 text-white/50 hover:border-white/20'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/60 mb-3">Color: {selectedColor}</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                        selectedColor === color
                          ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                          : 'border-white/10 text-white/50 hover:border-white/20'
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Material Selection */}
            {product.materials?.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/60 mb-3">Material</label>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((mat) => (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                        selectedMaterial === mat
                          ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                          : 'border-white/10 text-white/50 hover:border-white/20'
                      )}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-white/60 mb-3">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button onClick={handleAddToCart} className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-3 text-base px-10 py-4">
              <ShoppingBag size={20} /> Add to Cart — {formatPrice(price * quantity)}
            </button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
              <div className="text-center">
                <Truck size={20} className="mx-auto text-gold-500/60 mb-2" />
                <p className="text-xs text-white/30">Free Shipping 5000+</p>
              </div>
              <div className="text-center">
                <Shield size={20} className="mx-auto text-gold-500/60 mb-2" />
                <p className="text-xs text-white/30">Quality Guaranteed</p>
              </div>
              <div className="text-center">
                <RotateCcw size={20} className="mx-auto text-gold-500/60 mb-2" />
                <p className="text-xs text-white/30">7-Day Returns</p>
              </div>
            </div>

            {/* Specifications */}
            {specs && Object.keys(specs).length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <h3 className="font-semibold mb-4">Specifications</h3>
                <div className="space-y-2">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-white/40 capitalize">{key}</span>
                      <span className="text-white/70">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-display font-bold mb-8">Customer Reviews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 glass rounded-2xl">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? 'text-gold-500 fill-gold-500' : 'text-white/10'} />
                    ))}
                  </div>
                  <p className="text-sm text-white/50 mb-3">&ldquo;{review.comment}&rdquo;</p>
                  <p className="text-sm font-medium">{review.customer_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-display font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} className="card card-hover group">
                  <div className="relative aspect-square bg-dark-200 overflow-hidden">
                    {p.images?.[0] && (
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm group-hover:text-gold-500 transition-colors">{p.name}</h3>
                    <span className="text-gold-500 font-semibold text-sm mt-1 block">{formatPrice(p.sale_price || p.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
