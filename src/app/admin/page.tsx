'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Package, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  recentOrders: { id: string; order_number: string; customer_name: string; total: number; status: string; created_at: string }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalCustomers: 0, pendingOrders: 0, recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [ordersRes, productsRes, customersRes, pendingRes, recentRes] = await Promise.all([
        supabase.from('orders').select('total'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('id, order_number, customer_name, total, status, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum: number, o: { total: number }) => sum + (o.total || 0), 0) || 0;

      setStats({
        totalOrders: ordersRes.data?.length || 0,
        totalRevenue,
        totalProducts: productsRes.count || 0,
        totalCustomers: customersRes.count || 0,
        pendingOrders: pendingRes.count || 0,
        recentOrders: recentRes.data || [],
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'text-green-400' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-400' },
    { label: 'Products', value: stats.totalProducts.toString(), icon: Package, color: 'text-purple-400' },
    { label: 'Customers', value: stats.totalCustomers.toString(), icon: Users, color: 'text-orange-400' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-white/30">Welcome back, Admin</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
          <Clock size={14} /> {stats.pendingOrders} pending orders
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/40">{card.label}</span>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-2xl font-bold">{loading ? '—' : card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-gold-500 hover:underline">View All</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 skeleton rounded-lg" />)}</div>
          ) : stats.recentOrders.length === 0 ? (
            <p className="text-sm text-white/30 py-8 text-center">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {stats.recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders`} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div>
                    <p className="text-sm font-medium font-mono">{order.order_number}</p>
                    <p className="text-xs text-white/30">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gold-500">{formatPrice(order.total)}</p>
                    <p className="text-xs text-white/30 capitalize">{order.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-gold-500" /> Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/orders', label: 'Manage Orders', icon: ShoppingBag },
              { href: '/admin/products', label: 'Manage Products', icon: Package },
              { href: '/admin/customers', label: 'View Customers', icon: Users },
              { href: '/admin/coupons', label: 'Manage Coupons', icon: DollarSign },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:bg-white/5 hover:border-gold-500/20 transition-all">
                <action.icon size={18} className="text-gold-500/60" />
                <span className="text-sm">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
