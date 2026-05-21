'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, CheckCircle, Truck, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

interface OrderData {
  order_number: string;
  status: string;
  customer_name: string;
  total: number;
  created_at: string;
  shipping_city: string;
  order_items?: { product_name: string; quantity: number; unit_price: number; size: string; color: string }[];
}

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 skeleton rounded-full" /></div>}>
      <TrackOrderContent />
    </Suspense>
  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);

  const trackOrder = async () => {
    if (!orderNumber.trim()) { toast.error('Please enter your order number'); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber.trim().toUpperCase())
      .single();

    if (error || !data) {
      toast.error('Order not found. Please check your order number.');
      setOrder(null);
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  const getCurrentStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex((s) => s.key === status);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-padding max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold">Track Your Order</h1>
          <p className="text-white/40 mt-2">Enter your order number to check the status</p>
        </div>

        <div className="flex gap-3 mb-10">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && trackOrder()}
              placeholder="e.g. FD-20240101-0001"
              className="input-field pl-11 text-base"
            />
          </div>
          <button onClick={trackOrder} disabled={loading} className="btn-primary px-6">
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>

        {order && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Order #{order.order_number}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status === 'cancelled' ? 'Cancelled' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-white/30">Customer</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-white/30">City</p>
                  <p className="font-medium">{order.shipping_city}</p>
                </div>
                <div>
                  <p className="text-white/30">Total</p>
                  <p className="font-medium text-gold-500">{formatPrice(order.total)}</p>
                </div>
              </div>
            </div>

            {order.status !== 'cancelled' ? (
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-6">Order Progress</h3>
                <div className="relative">
                  {statusSteps.map((step, i) => {
                    const currentStep = getCurrentStepIndex(order.status);
                    const isComplete = i <= currentStep;
                    const isCurrent = i === currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-center gap-4 mb-6 last:mb-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isComplete ? 'bg-gold-500 text-dark-900' : 'bg-white/5 text-white/20'} ${isCurrent ? 'ring-2 ring-gold-500/50' : ''}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${isComplete ? 'text-white' : 'text-white/30'}`}>{step.label}</p>
                          {isCurrent && <p className="text-xs text-gold-500">Current Status</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 text-center">
                <XCircle size={40} className="mx-auto text-red-400 mb-3" />
                <p className="font-semibold">This order has been cancelled</p>
                <p className="text-sm text-white/40 mt-1">Contact us if you have questions about this order.</p>
              </div>
            )}

            {order.order_items && order.order_items.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.order_items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-xs text-white/30">{item.size} · {item.color} · Qty: {item.quantity}</p>
                      </div>
                      <span className="text-gold-500">{formatPrice(item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
