'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Phone } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 skeleton rounded-full" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || '';

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="section-padding max-w-lg text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-white/40 mb-8">Thank you for your order. We will process it within 24 hours.</p>

        <div className="glass rounded-2xl p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <Package size={20} className="text-gold-500" />
            <h2 className="font-semibold">Order Details</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Order Number</span>
              <span className="font-mono text-gold-500 font-semibold">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Payment Method</span>
              <span>Cash on Delivery</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Status</span>
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">Pending</span>
            </div>
          </div>
        </div>

        <div className="glass-gold rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} className="text-gold-500" />
            <p className="text-white/60">
              You will receive a confirmation on WhatsApp shortly. For queries, contact us at{' '}
              <span className="text-gold-500">+92 300 1234567</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={`/track-order?order=${orderNumber}`} className="btn-primary inline-flex items-center gap-2">
            Track Order
          </Link>
          <Link href="/shop" className="btn-secondary inline-flex items-center gap-2">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
