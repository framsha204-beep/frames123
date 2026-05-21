'use client';

import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CustomerRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      const { data } = await query;
      setCustomers(data || []);
      setLoading(false);
    };
    fetch();
  }, [search]);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6 flex items-center gap-2"><Users size={24} className="text-gold-500" /> Customers</h1>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="input-field pl-10 text-sm" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}</div>
      ) : customers.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center"><p className="text-white/30">No customers found</p></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-white/40 font-medium">Name</th>
                <th className="text-left p-4 text-white/40 font-medium hidden sm:table-cell">Email</th>
                <th className="text-left p-4 text-white/40 font-medium hidden sm:table-cell">Phone</th>
                <th className="text-left p-4 text-white/40 font-medium">Role</th>
                <th className="text-left p-4 text-white/40 font-medium hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4 font-medium">{c.full_name || '—'}</td>
                  <td className="p-4 text-white/50 hidden sm:table-cell">{c.email || '—'}</td>
                  <td className="p-4 text-white/50 hidden sm:table-cell">{c.phone || '—'}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.role === 'admin' ? 'bg-gold-500/20 text-gold-400' : 'bg-white/5 text-white/40'}`}>
                      {c.role || 'customer'}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-white/30 hidden sm:table-cell">{new Date(c.created_at).toLocaleDateString('en-PK')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
