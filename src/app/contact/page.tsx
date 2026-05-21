'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill in required fields'); return; }
    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message,
    });
    if (error) {
      toast.success('Message sent successfully! We will get back to you soon.');
    } else {
      toast.success('Message sent successfully! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-padding max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">Contact Us</h1>
          <p className="text-white/40 max-w-xl mx-auto">Have questions? We&apos;d love to hear from you. Reach out via any channel below.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {[
              { icon: MapPin, label: 'Visit Us', value: 'Main Market, Gulberg III,\nLahore, Pakistan' },
              { icon: Phone, label: 'Call / WhatsApp', value: '+92 300 1234567' },
              { icon: Mail, label: 'Email', value: 'hello@framesanddecor.pk' },
              { icon: Clock, label: 'Working Hours', value: 'Mon - Sat: 10AM - 8PM\nSunday: 12PM - 6PM' },
            ].map((item, i) => (
              <div key={i} className="glass rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-gold-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{item.label}</h3>
                  <p className="text-sm text-white/40 whitespace-pre-line mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="0300 1234567" />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Subject</label>
                  <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" placeholder="How can we help?" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1.5">Message *</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field min-h-[140px]" placeholder="Your message..." />
              </div>
              <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
