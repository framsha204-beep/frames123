'use client';

import { useState } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'Frames & Decor PK',
    storeEmail: 'hello@framesanddecor.pk',
    storePhone: '+92 300 1234567',
    whatsapp: '+92 300 1234567',
    address: 'Main Market, Gulberg III, Lahore, Pakistan',
    freeShippingThreshold: '5000',
    shippingFee: '250',
    currency: 'PKR',
    taxRate: '0',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Settings saved successfully');
    setSaving(false);
  };

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Settings size={24} className="text-gold-500" /> Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm inline-flex items-center gap-2">
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div className="space-y-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Store Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Store Name</label>
              <input type="text" value={settings.storeName} onChange={(e) => update('storeName', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Email</label>
              <input type="email" value={settings.storeEmail} onChange={(e) => update('storeEmail', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Phone</label>
              <input type="tel" value={settings.storePhone} onChange={(e) => update('storePhone', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1.5">WhatsApp</label>
              <input type="tel" value={settings.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-white/50 mb-1.5">Address</label>
              <input type="text" value={settings.address} onChange={(e) => update('address', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Shipping & Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Free Shipping Threshold (PKR)</label>
              <input type="number" value={settings.freeShippingThreshold} onChange={(e) => update('freeShippingThreshold', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Flat Shipping Fee (PKR)</label>
              <input type="number" value={settings.shippingFee} onChange={(e) => update('shippingFee', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Currency</label>
              <input type="text" value={settings.currency} onChange={(e) => update('currency', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Tax Rate (%)</label>
              <input type="number" value={settings.taxRate} onChange={(e) => update('taxRate', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
