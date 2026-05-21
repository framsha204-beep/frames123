'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CouponRow {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('coupons').update({ is_active: !current }).eq('id', id);
    toast.success(`Coupon ${!current ? 'activated' : 'deactivated'}`);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    toast.success('Coupon deleted');
    fetchCoupons();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Tag size={24} className="text-gold-500" /> Coupons</h1>
        <button className="btn-primary text-sm inline-flex items-center gap-2"><Plus size={16} /> Add Coupon</button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
      ) : coupons.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center"><p className="text-white/30">No coupons created</p></div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1.5 bg-gold-500/10 rounded-lg font-mono text-sm font-bold text-gold-500">{coupon.code}</div>
                <div>
                  <p className="text-sm">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `${formatPrice(coupon.discount_value)} off`}
                  </p>
                  <p className="text-xs text-white/30">
                    Min: {formatPrice(coupon.min_order_amount)} · Used: {coupon.used_count}/{coupon.max_uses || '∞'}
                    {coupon.expires_at && ` · Expires: ${new Date(coupon.expires_at).toLocaleDateString('en-PK')}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(coupon.id, coupon.is_active)} className={`text-xs px-3 py-1 rounded-lg ${coupon.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => deleteCoupon(coupon.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
