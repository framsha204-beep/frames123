'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';

interface AnalyticsData {
  dailyOrders: { date: string; count: number; revenue: number }[];
  topProducts: { name: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  cityBreakdown: { city: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({ dailyOrders: [], topProducts: [], statusBreakdown: [], cityBreakdown: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const [ordersRes, itemsRes] = await Promise.all([
        supabase.from('orders').select('total, status, shipping_city, created_at'),
        supabase.from('order_items').select('product_name, quantity'),
      ]);

      const orders = ordersRes.data || [];
      const items = itemsRes.data || [];

      const dailyMap = new Map<string, { count: number; revenue: number }>();
      orders.forEach((o: { total: number; created_at: string }) => {
        const date = new Date(o.created_at).toLocaleDateString('en-PK');
        const existing = dailyMap.get(date) || { count: 0, revenue: 0 };
        dailyMap.set(date, { count: existing.count + 1, revenue: existing.revenue + (o.total || 0) });
      });
      const dailyOrders = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v })).slice(-7);

      const statusMap = new Map<string, number>();
      orders.forEach((o: { status: string }) => statusMap.set(o.status, (statusMap.get(o.status) || 0) + 1));
      const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

      const cityMap = new Map<string, number>();
      orders.forEach((o: { shipping_city: string }) => {
        if (o.shipping_city) cityMap.set(o.shipping_city, (cityMap.get(o.shipping_city) || 0) + 1);
      });
      const cityBreakdown = Array.from(cityMap.entries()).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 5);

      const productMap = new Map<string, number>();
      items.forEach((i: { product_name: string; quantity: number }) => productMap.set(i.product_name, (productMap.get(i.product_name) || 0) + i.quantity));
      const topProducts = Array.from(productMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

      setData({ dailyOrders, topProducts, statusBreakdown, cityBreakdown });
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold mb-6 flex items-center gap-2"><BarChart3 size={24} className="text-gold-500" /> Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6 flex items-center gap-2"><BarChart3 size={24} className="text-gold-500" /> Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-gold-500" /> Daily Orders (Last 7 days)</h2>
          {data.dailyOrders.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-2">
              {data.dailyOrders.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                  <span className="text-white/40">{d.date}</span>
                  <div className="flex items-center gap-4">
                    <span>{d.count} orders</span>
                    <span className="text-gold-500 font-semibold">{formatPrice(d.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><ShoppingBag size={18} className="text-gold-500" /> Top Products</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gold-500 font-bold w-5">#{i + 1}</span>
                    <span className="text-sm truncate max-w-[200px]">{p.name}</span>
                  </div>
                  <span className="text-sm text-white/40">{p.count} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><DollarSign size={18} className="text-gold-500" /> Order Status Breakdown</h2>
          {data.statusBreakdown.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.statusBreakdown.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{s.status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gold-500 rounded-full" style={{ width: `${Math.min(100, (s.count / Math.max(1, data.statusBreakdown.reduce((a, b) => a + b.count, 0))) * 100)}%` }} />
                    </div>
                    <span className="text-sm text-white/40 w-8 text-right">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Top Cities</h2>
          {data.cityBreakdown.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.cityBreakdown.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gold-500 font-bold w-5">#{i + 1}</span>
                    <span className="text-sm">{c.city}</span>
                  </div>
                  <span className="text-sm text-white/40">{c.count} orders</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
