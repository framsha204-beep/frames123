'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, MapPin } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CheckoutForm {
  fullName: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  notes: string;
  deliveryInstructions: string;
}

const cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur', 'Sargodha', 'Abbottabad', 'Mardan', 'Other'];

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 skeleton rounded-full" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    notes: '',
    deliveryInstructions: '',
  });

  const couponCode = searchParams.get('coupon') || '';
  const discountAmount = parseFloat(searchParams.get('discount') || '0');
  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 5000 ? 0 : 250;
  const total = subtotal - discountAmount + shippingFee;

  const updateForm = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!form.fullName.trim()) { toast.error('Please enter your full name'); return false; }
    if (!form.phone.trim() || form.phone.length < 10) { toast.error('Please enter a valid phone number'); return false; }
    if (!form.address.trim()) { toast.error('Please enter your address'); return false; }
    if (!form.city.trim()) { toast.error('Please select your city'); return false; }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    setLoading(true);
    try {
      const orderNumber = 'FD-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

      const { data: order, error: orderError } = await supabase.from('orders').insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        customer_name: form.fullName,
        customer_phone: form.phone,
        customer_whatsapp: form.whatsapp || form.phone,
        shipping_address: form.address,
        shipping_city: form.city,
        notes: form.notes,
        delivery_instructions: form.deliveryInstructions,
        subtotal,
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        coupon_code: couponCode || null,
        total,
        status: 'pending',
        payment_method: 'cod',
      }).select().single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images?.[0] || null,
        size: item.size,
        color: item.color,
        material: item.material,
        quantity: item.quantity,
        unit_price: item.product.sale_price || item.product.price,
        total_price: (item.product.sale_price || item.product.price) * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      if (couponCode) {
        await supabase.rpc('increment_coupon_usage', { coupon_code: couponCode });
      }

      clearCart();
      router.push(`/order-success?order=${order.order_number}`);
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No items to checkout</h1>
          <a href="/shop" className="btn-primary">Browse Frames</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-padding">
        <h1 className="text-3xl font-display font-bold mb-2">Checkout</h1>
        <p className="text-white/40 mb-8">Cash on Delivery — Pay when you receive your order</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-gold-500" /> Delivery Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-white/50 mb-1.5">Full Name *</label>
                  <input type="text" value={form.fullName} onChange={(e) => updateForm('fullName', e.target.value)} className="input-field" placeholder="Muhammad Ahmed Khan" />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Phone Number *</label>
                  <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} className="input-field" placeholder="0300 1234567" />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">WhatsApp Number</label>
                  <input type="tel" value={form.whatsapp} onChange={(e) => updateForm('whatsapp', e.target.value)} className="input-field" placeholder="0300 1234567" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-white/50 mb-1.5">Complete Address *</label>
                  <textarea value={form.address} onChange={(e) => updateForm('address', e.target.value)} className="input-field min-h-[80px]" placeholder="House #, Street, Area, Landmark" />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">City *</label>
                  <select value={form.city} onChange={(e) => updateForm('city', e.target.value)} className="input-field">
                    <option value="">Select City</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Order Notes</label>
                  <input type="text" value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} className="input-field" placeholder="Any special requests..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-white/50 mb-1.5">Delivery Instructions</label>
                  <input type="text" value={form.deliveryInstructions} onChange={(e) => updateForm('deliveryInstructions', e.target.value)} className="input-field" placeholder="e.g. Leave at the gate, call before delivery..." />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
              <div className="p-4 border border-gold-500/30 bg-gold-500/5 rounded-xl flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-gold-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-gold-500 rounded-full" />
                </div>
                <div>
                  <p className="font-medium text-sm">Cash on Delivery (COD)</p>
                  <p className="text-xs text-white/30">Pay when you receive your order</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3">
                    <div className="relative w-14 h-14 bg-dark-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images?.[0] && (
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-white/30">{item.size} · {item.color} · x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-gold-500">{formatPrice((item.product.sale_price || item.product.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t border-white/5 pt-4">
                <div className="flex justify-between"><span className="text-white/40">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-green-400"><span>Discount ({couponCode})</span><span>-{formatPrice(discountAmount)}</span></div>}
                <div className="flex justify-between"><span className="text-white/40">Shipping</span><span>{shippingFee === 0 ? <span className="text-green-400">Free</span> : formatPrice(shippingFee)}</span></div>
                <div className="border-t border-white/5 pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span><span className="text-gold-500">{formatPrice(total)}</span>
                </div>
              </div>

              <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full mt-6 inline-flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Placing Order...</> : 'Place Order (COD)'}
              </button>
              <p className="text-center text-xs text-white/20 mt-3">By placing this order, you agree to our terms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
