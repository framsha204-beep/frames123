'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, User, Search, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { user, profile } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-dark-900/90 backdrop-blur-xl border-b border-white/5 py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="section-padding flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
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

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors duration-300 relative',
                pathname === link.href
                  ? 'text-gold-500'
                  : 'text-white/60 hover:text-white'
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-white/5 transition-colors"
          >
            <Search size={18} className="text-white/60" />
          </Link>

          <Link
            href="/cart"
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
          >
            <ShoppingBag size={18} className="text-white/60" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 text-dark-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <Link
            href={user ? (profile?.role === 'admin' ? '/admin' : '/account') : '/auth/login'}
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-white/5 transition-colors"
          >
            <User size={18} className="text-white/60" />
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-dark-900/95 backdrop-blur-xl border-b border-white/5 animate-slide-down">
          <nav className="section-padding py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-gold-500/10 text-gold-500'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={user ? '/account' : '/auth/login'}
              className="px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5"
            >
              {user ? 'My Account' : 'Sign In'}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
