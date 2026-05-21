'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Truck, Shield, Palette, Sparkles, ChevronDown, Send, Frame, Gem, Eye, Box, Zap, HeartHandshake } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, Category, Review } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [featuredRes, bestsellerRes, catRes, reviewRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_featured', true).eq('is_active', true).limit(4),
        supabase.from('products').select('*').eq('is_bestseller', true).eq('is_active', true).limit(4),
        supabase.from('categories').select('*').eq('is_active', true).order('display_order'),
        supabase.from('reviews').select('*').eq('is_approved', true).limit(5),
      ]);
      if (featuredRes.data) setFeaturedProducts(featuredRes.data);
      if (bestsellerRes.data) setBestSellers(bestsellerRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (reviewRes.data) setReviews(reviewRes.data);
    };
    fetchData();
  }, []);

  const handleSubscribe = async () => {
    if (!email) return;
    setSubscribing(true);
    await supabase.from('newsletter_subscribers').insert({ email });
    setEmail('');
    setSubscribing(false);
  };

  const faqs = [
    { q: 'How long does delivery take?', a: 'We deliver within 3-5 business days across Pakistan. Lahore and Islamabad orders are typically delivered within 1-2 days.' },
    { q: 'Do you offer custom frame sizes?', a: 'Yes! We offer custom sizing for most frame styles. Contact us via WhatsApp with your requirements and we will provide a quote within 24 hours.' },
    { q: 'What is your return policy?', a: 'We offer a 7-day return policy for damaged or defective items. Items must be in original packaging. Contact our support team to initiate a return.' },
    { q: 'Is Cash on Delivery available?', a: 'Yes, we offer Cash on Delivery (COD) across Pakistan. No advance payment is required.' },
    { q: 'Can I track my order?', a: 'Absolutely! Once your order is shipped, you will receive a tracking number via SMS and WhatsApp. You can also track your order on our website.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-dark-gradient" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>
        <div className="relative section-padding text-center max-w-4xl mx-auto pt-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8 animate-fade-in">
            <Sparkles size={14} className="text-gold-500" />
            <span className="text-sm text-gold-400">Premium Handcrafted Frames</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6 animate-slide-up">
            Transform Your{' '}
            <span className="gold-text">Memories</span>
            <br />
            Into Timeless Art
          </h1>
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Discover Pakistan&apos;s finest collection of handcrafted photo frames. 
            From classic wood to modern acrylic, find the perfect frame for every moment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
              Explore Collection <ArrowRight size={18} />
            </Link>
            <Link href="/about" className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-4">
              Our Story
            </Link>
          </div>
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-white/30 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-gold-500/60" />
              <span>Free Shipping 5000+</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Shield size={16} className="text-gold-500/60" />
              <span>Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <Box size={16} className="text-gold-500/60" />
              <span>COD Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Frames */}
      <section className="py-24 bg-dark-800/50">
        <div className="section-padding">
          <div className="text-center mb-16">
            <span className="text-gold-500 text-sm font-medium uppercase tracking-widest">Curated Selection</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-3">Featured Frames</h2>
            <p className="text-white/40 mt-3 max-w-md mx-auto">Handpicked by our design team for their exceptional quality and style.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="card card-hover group">
                <div className="relative aspect-square bg-dark-200 overflow-hidden">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  {product.is_premium && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-gold-500 text-dark-900 text-xs font-bold rounded">
                      PREMIUM
                    </div>
                  )}
                  {product.sale_price && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      SALE
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm group-hover:text-gold-500 transition-colors">{product.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-gold-500 font-semibold">{formatPrice(product.sale_price || product.price)}</span>
                    {product.sale_price && (
                      <span className="text-white/30 text-sm line-through">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/shop" className="btn-secondary inline-flex items-center gap-2">
              View All Frames <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24">
        <div className="section-padding">
          <div className="text-center mb-16">
            <span className="text-gold-500 text-sm font-medium uppercase tracking-widest">Most Popular</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-3">Best Sellers</h2>
            <p className="text-white/40 mt-3 max-w-md mx-auto">Our customers&apos; favorites that keep flying off the shelves.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="card card-hover group">
                <div className="relative aspect-square bg-dark-200 overflow-hidden">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-dark-900 text-xs font-bold rounded">
                    BESTSELLER
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm group-hover:text-gold-500 transition-colors">{product.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-gold-500 font-semibold">{formatPrice(product.sale_price || product.price)}</span>
                    {product.sale_price && (
                      <span className="text-white/30 text-sm line-through">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-dark-800/50">
        <div className="section-padding">
          <div className="text-center mb-16">
            <span className="text-gold-500 text-sm font-medium uppercase tracking-widest">Browse By</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-3">Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative p-6 glass rounded-2xl hover:border-gold-500/30 transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-gold-500/10 rounded-xl flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                  <Frame size={24} className="text-gold-500" />
                </div>
                <h3 className="font-medium text-sm group-hover:text-gold-500 transition-colors">{cat.name}</h3>
                <p className="text-xs text-white/30 mt-1 line-clamp-2">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24">
        <div className="section-padding">
          <div className="text-center mb-16">
            <span className="text-gold-500 text-sm font-medium uppercase tracking-widest">Why Us</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-3">Why Choose Frames & Decor PK</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Gem, title: 'Premium Quality', desc: 'Every frame is crafted with the finest materials and meticulous attention to detail.' },
              { icon: Truck, title: 'Nationwide Delivery', desc: 'Free shipping on orders above Rs. 5,000. Delivery across all major cities in Pakistan.' },
              { icon: Shield, title: 'Quality Guarantee', desc: '100% satisfaction guarantee. If your frame arrives damaged, we replace it immediately.' },
              { icon: Palette, title: 'Custom Options', desc: 'Choose from multiple sizes, colors, and materials to create your perfect frame.' },
              { icon: HeartHandshake, title: 'Expert Support', desc: 'Our design experts are available on WhatsApp to help you choose the right frame.' },
              { icon: Zap, title: 'Fast Processing', desc: 'Orders are processed within 24 hours and shipped with premium packaging.' },
            ].map((item, i) => (
              <div key={i} className="p-6 glass rounded-2xl hover:border-gold-500/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold-500/20 transition-colors">
                  <item.icon size={24} className="text-gold-500" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frame Customization Process */}
      <section className="py-24 bg-dark-800/50">
        <div className="section-padding">
          <div className="text-center mb-16">
            <span className="text-gold-500 text-sm font-medium uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-3">Frame Customization Process</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Choose Your Frame', desc: 'Browse our collection and select the style that speaks to you.' },
              { step: '02', title: 'Select Options', desc: 'Pick your preferred size, color, and material combination.' },
              { step: '03', title: 'Place Your Order', desc: 'Add to cart and checkout with Cash on Delivery.' },
              { step: '04', title: 'Receive & Enjoy', desc: 'Get your frame delivered to your doorstep, ready to display.' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="text-5xl font-display font-bold text-gold-500/20 group-hover:text-gold-500/40 transition-colors mb-4">{item.step}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Steps */}
      <section className="py-24">
        <div className="section-padding">
          <div className="text-center mb-16">
            <span className="text-gold-500 text-sm font-medium uppercase tracking-widest">Delivery</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-3">Shipping & Delivery</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            {[
              { title: 'Order Confirmation', desc: 'You receive an SMS and WhatsApp confirmation with your order details.' },
              { title: 'Processing', desc: 'Your frame is carefully inspected, wrapped in premium packaging within 24 hours.' },
              { title: 'Shipped', desc: 'We partner with trusted couriers for safe and fast delivery across Pakistan.' },
              { title: 'Delivered', desc: 'Your frame arrives at your doorstep. Pay on delivery and start decorating!' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gold-500 text-dark-900 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  {i < 3 && <div className="w-px h-full bg-gold-500/20 mt-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-white/40">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-24 bg-dark-800/50">
        <div className="section-padding">
          <div className="text-center mb-16">
            <span className="text-gold-500 text-sm font-medium uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-3">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="p-6 glass rounded-2xl">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < review.rating ? 'text-gold-500 fill-gold-500' : 'text-white/10'} />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-4">&ldquo;{review.comment}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold-500/10 rounded-full flex items-center justify-center">
                    <span className="text-gold-500 text-xs font-bold">{review.customer_name[0]}</span>
                  </div>
                  <span className="text-sm font-medium">{review.customer_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Frame Style Assistant */}
      <section className="py-24">
        <div className="section-padding">
          <div className="max-w-4xl mx-auto glass-gold rounded-3xl p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 rounded-full mb-6">
              <Sparkles size={14} className="text-gold-500" />
              <span className="text-xs text-gold-400 font-medium">Coming Soon</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              AI Frame Style <span className="gold-text">Assistant</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto mb-8">
              Upload a photo of your room and let our AI recommend the perfect frame style, size, 
              and placement. Get a virtual preview before you buy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-3 text-sm text-white/40">
                <Eye size={16} className="text-gold-500" />
                <span>Virtual Room Preview</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/40">
                <Palette size={16} className="text-gold-500" />
                <span>Style Matching</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/40">
                <Sparkles size={16} className="text-gold-500" />
                <span>Smart Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-dark-800/50">
        <div className="section-padding text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Stay in the Frame</h2>
          <p className="text-white/40 max-w-md mx-auto mb-8">
            Subscribe for exclusive deals, new arrivals, and interior decor inspiration.
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-field flex-1"
            />
            <button onClick={handleSubscribe} disabled={subscribing} className="btn-primary px-6">
              <Send size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="section-padding max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-gold-500 text-sm font-medium uppercase tracking-widest">Support</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-sm pr-4">{faq.q}</span>
                  <ChevronDown size={18} className={cn('text-gold-500 transition-transform flex-shrink-0', openFaq === i && 'rotate-180')} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-white/40 leading-relaxed animate-slide-down">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
