'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { formatPrice, getStatusColor } from '@/lib/utils';

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, signOut, loading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      supabase.from('orders').select('id, order_number, status, total, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
        if (data) setOrders(data);
        setLoading(false);
      });
    }
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading || !user) {
    return <div className="min-h-screen pt-24 pb-16 flex items-center justify-center"><div className="skeleton w-12 h-12 rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-padding max-w-3xl mx-auto">
        <div className="glass rounded-2xl p-6 mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold-500/10 flex items-center justify-center">
            <User size={24} className="text-gold-500" />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">{profile?.full_name || user.email}</h1>
            <p className="text-sm text-white/40">{user.email}</p>
          </div>
          <button onClick={handleSignOut} className="btn-ghost flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Package size={20} className="text-gold-500" /> My Orders</h2>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-white/30 mb-4">No orders yet</p>
            <Link href="/shop" className="btn-primary text-sm">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/track-order?order=${order.order_number}`} className="glass rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors block">
                <div>
                  <p className="font-medium text-sm font-mono">{order.order_number}</p>
                  <p className="text-xs text-white/30 mt-1">{new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gold-500">{formatPrice(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
