'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';

const footerLinks = {
  shop: [
    { href: '/shop?category=wooden-frames', label: 'Wooden Frames' },
    { href: '/shop?category=glass-frames', label: 'Glass Frames' },
    { href: '/shop?category=modern-frames', label: 'Modern Frames' },
    { href: '/shop?category=vintage-frames', label: 'Vintage Frames' },
    { href: '/shop?category=premium-luxury-frames', label: 'Premium Luxury' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
    { href: '/shipping-policy', label: 'Shipping Policy' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
  ],
  account: [
    { href: '/account', label: 'My Account' },
    { href: '/cart', label: 'Shopping Cart' },
    { href: '/track-order', label: 'Track Order' },
    { href: '/auth/login', label: 'Sign In' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-white/5">
      <div className="section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center">
                <span className="text-dark-900 font-bold text-sm">F</span>
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight">
                  Frames <span className="text-gold-500">&</span> Decor
                </span>
                <span className="text-[10px] text-gold-500/70 block -mt-1 tracking-widest uppercase">PK</span>
              </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Pakistan&apos;s premium destination for handcrafted photo frames and wall decor. 
              Transform your memories into art with our curated collection.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold-500/20 hover:text-gold-500 transition-colors text-white/40">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold-500/20 hover:text-gold-500 transition-colors text-white/40">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold-500/20 hover:text-gold-500 transition-colors text-white/40">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-500 mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-500 mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-500 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/40">
                <Phone size={14} className="text-gold-500/60" />
                +92 300 1234567
              </li>
              <li className="flex items-center gap-2 text-sm text-white/40">
                <Mail size={14} className="text-gold-500/60" />
                hello@framesandecor.pk
              </li>
              <li className="flex items-start gap-2 text-sm text-white/40">
                <MapPin size={14} className="text-gold-500/60 mt-0.5" />
                Lahore, Pakistan
              </li>
            </ul>
            <div className="mt-6 p-4 glass rounded-xl">
              <p className="text-xs text-gold-500 font-medium mb-1">Cash on Delivery</p>
              <p className="text-xs text-white/30">Available across Pakistan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="section-padding py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} Frames & Decor PK. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="text-xs text-white/20 hover:text-white/40 transition-colors">
              Privacy
            </Link>
            <Link href="/shipping-policy" className="text-xs text-white/20 hover:text-white/40 transition-colors">
              Shipping
            </Link>
            <Link href="/faq" className="text-xs text-white/20 hover:text-white/40 transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
