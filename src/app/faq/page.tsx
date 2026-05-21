'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  { q: 'What payment methods do you accept?', a: 'We currently accept Cash on Delivery (COD) across all major cities in Pakistan. Online payment options will be available soon.' },
  { q: 'How long does delivery take?', a: 'Delivery typically takes 3-5 business days for major cities and 5-7 business days for other areas. You will receive a WhatsApp confirmation with tracking details.' },
  { q: 'Do you offer free shipping?', a: 'Yes! We offer free shipping on all orders above Rs. 5,000. Orders below Rs. 5,000 have a flat shipping fee of Rs. 250.' },
  { q: 'Can I return or exchange a product?', a: 'Yes, we have a 7-day return and exchange policy. The product must be unused and in original packaging. Contact us via WhatsApp to initiate a return.' },
  { q: 'Do you offer custom frame sizes?', a: 'Yes! We offer custom sizing for most frame styles. Contact us with your requirements and we will provide a quote within 24 hours.' },
  { q: 'Are the frames ready to hang?', a: 'Yes, all our frames come with hanging hardware included. Wall collage sets also include a layout template for easy installation.' },
  { q: 'How do I track my order?', a: 'You can track your order using the order number provided in your confirmation. Visit our Track Order page or contact us on WhatsApp.' },
  { q: 'Do you ship internationally?', a: 'Currently, we only ship within Pakistan. We are planning to expand to international shipping soon.' },
  { q: 'What materials are the frames made of?', a: 'Our frames are crafted from premium materials including solid wood, Italian glass, high-grade acrylic, MDF with veneer finish, and metal alloys depending on the design.' },
  { q: 'Can I order in bulk for events or businesses?', a: 'Absolutely! We offer special bulk pricing for events, corporate gifts, and businesses. Contact us for a custom quote.' },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-padding max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-white/40">Find answers to common questions about our products and services.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left p-5 flex items-center justify-between gap-4"
              >
                <span className="font-medium text-sm">{faq.q}</span>
                <ChevronDown size={18} className={cn('text-white/30 transition-transform flex-shrink-0', openIndex === i && 'rotate-180')} />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
