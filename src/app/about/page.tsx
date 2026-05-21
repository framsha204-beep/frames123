import { Award, Heart, Sparkles, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-padding max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-display font-bold mb-4">About Frames & Decor PK</h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            We are Pakistan&apos;s premier destination for handcrafted photo frames and wall decor, bringing artistry and elegance to every home.
          </p>
        </div>

        <div className="glass rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-display font-bold mb-4">Our Story</h2>
          <p className="text-white/50 leading-relaxed mb-4">
            Founded with a passion for preserving memories in beautiful frames, Frames & Decor PK has grown from a small workshop to one of Pakistan&apos;s most trusted names in home decor. We believe every photo deserves a frame that matches its beauty and significance.
          </p>
          <p className="text-white/50 leading-relaxed">
            Our team of skilled artisans handcrafts each frame using the finest materials — from premium hardwoods and Italian glass to modern acrylics. Every piece undergoes rigorous quality checks to ensure it meets our exacting standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Award, label: 'Premium Quality', desc: 'Handcrafted excellence' },
            { icon: Users, label: '10,000+ Customers', desc: 'Happy homes across PK' },
            { icon: Heart, label: 'Made with Love', desc: 'Every frame tells a story' },
            { icon: Sparkles, label: 'Unique Designs', desc: '200+ frame styles' },
          ].map((item, i) => (
            <div key={i} className="glass rounded-2xl p-6 text-center">
              <item.icon size={28} className="mx-auto text-gold-500 mb-3" />
              <h3 className="font-semibold text-sm">{item.label}</h3>
              <p className="text-xs text-white/30 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-display font-bold mb-4">Our Mission</h2>
          <p className="text-white/50 leading-relaxed">
            To make premium-quality, beautifully designed photo frames accessible to every Pakistani household. We aim to transform living spaces into personal galleries that celebrate life&apos;s most precious moments, one frame at a time.
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-display font-bold mb-4">Why Choose Us?</h2>
          <ul className="space-y-3 text-white/50">
            <li className="flex items-start gap-3"><span className="text-gold-500 font-bold">1.</span> Handcrafted frames by skilled Pakistani artisans</li>
            <li className="flex items-start gap-3"><span className="text-gold-500 font-bold">2.</span> Premium materials sourced globally</li>
            <li className="flex items-start gap-3"><span className="text-gold-500 font-bold">3.</span> Nationwide delivery with secure packaging</li>
            <li className="flex items-start gap-3"><span className="text-gold-500 font-bold">4.</span> Cash on Delivery across all major cities</li>
            <li className="flex items-start gap-3"><span className="text-gold-500 font-bold">5.</span> 7-day easy return and exchange policy</li>
            <li className="flex items-start gap-3"><span className="text-gold-500 font-bold">6.</span> Responsive customer support via WhatsApp</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
