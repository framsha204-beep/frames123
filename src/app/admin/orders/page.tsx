'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  shipping_city: string;
  total: number;
  status: string;
  created_at: string;
}

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase.from('orders').select('id, order_number, customer_name, customer_phone, shipping_city, total, status, created_at').order('created_at', { ascending: false });
    if (filterStatus !== 'all') query = query.eq('status', filterStatus);
    if (search) query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`);
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filterStatus, search]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) { toast.error('Failed to update status'); return; }
    toast.success(`Order status updated to ${newStatus}`);
    fetchOrders();
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Order Management</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order # or customer..." className="input-field pl-10 text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-auto text-sm">
          <option value="all">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center"><p className="text-white/30">No orders found</p></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-white/40 font-medium">Order</th>
                  <th className="text-left p-4 text-white/40 font-medium">Customer</th>
                  <th className="text-left p-4 text-white/40 font-medium hidden sm:table-cell">City</th>
                  <th className="text-left p-4 text-white/40 font-medium">Total</th>
                  <th className="text-left p-4 text-white/40 font-medium">Status</th>
                  <th className="text-left p-4 text-white/40 font-medium hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 font-mono text-xs">{order.order_number}</td>
                    <td className="p-4">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-xs text-white/30">{order.customer_phone}</p>
                    </td>
                    <td className="p-4 text-white/50 hidden sm:table-cell">{order.shipping_city}</td>
                    <td className="p-4 font-semibold text-gold-500">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`appearance-none bg-transparent border rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer pr-7 ${getStatusColor(order.status)}`}
                        >
                          {statuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/30" />
                      </div>
                    </td>
                    <td className="p-4 text-xs text-white/30 hidden sm:table-cell">{new Date(order.created_at).toLocaleDateString('en-PK')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
