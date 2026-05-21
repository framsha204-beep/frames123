'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 5000 ? 0 : 250;
  const total = subtotal - discount + shippingFee;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (!coupon) {
      toast.error('Invalid or expired coupon code');
      setApplyingCoupon(false);
      return;
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      toast.error('This coupon has expired');
      setApplyingCoupon(false);
      return;
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      toast.error('This coupon has reached its usage limit');
      setApplyingCoupon(false);
      return;
    }

    if (subtotal < coupon.min_order_amount) {
      toast.error(`Minimum order amount is ${formatPrice(coupon.min_order_amount)}`);
      setApplyingCoupon(false);
      return;
    }

    const discountAmount = coupon.discount_type === 'percentage'
      ? (subtotal * coupon.discount_value) / 100
      : coupon.discount_value;

    setDiscount(discountAmount);
    setAppliedCoupon(couponCode.toUpperCase());
    toast.success(`Coupon applied! You save ${formatPrice(discountAmount)}`);
    setApplyingCoupon(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-white/10 mb-6" />
          <h1 className="text-2xl font-display font-bold mb-2">Your Cart is Empty</h1>
          <p className="text-white/40 mb-8">Add some beautiful frames to get started!</p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            Browse Frames <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-padding">
        <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = item.product.sale_price || item.product.price;
              return (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="glass rounded-2xl p-4 sm:p-6 flex gap-4">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-dark-200 rounded-xl overflow-hidden flex-shrink-0">
                    {item.product.images?.[0] && (
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">{item.product.name}</h3>
                        <p className="text-xs text-white/30 mt-1">
                          {item.size} · {item.color} · {item.material}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.size, item.color)}
                        className="text-white/20 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 text-sm"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 text-sm"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-gold-500 font-semibold">{formatPrice(price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24">
              <h3 className="font-semibold mb-6">Order Summary</h3>

              {/* Coupon */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="input-field pl-9 text-sm py-2.5"
                      disabled={!!appliedCoupon}
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    disabled={applyingCoupon || !!appliedCoupon}
                    className="btn-secondary px-4 py-2.5 text-sm"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-400 mt-2">✓ Coupon {appliedCoupon} applied</p>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/40">Shipping</span>
                  <span>{shippingFee === 0 ? <span className="text-green-400">Free</span> : formatPrice(shippingFee)}</span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-white/20">Free shipping on orders above Rs. 5,000</p>
                )}
                <div className="border-t border-white/5 pt-3 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-gold-500">{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href={`/checkout${appliedCoupon ? `?coupon=${appliedCoupon}&discount=${discount}` : ''}`}
                className="btn-primary w-full mt-6 inline-flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <p className="text-center text-xs text-white/20 mt-4">Cash on Delivery Available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
