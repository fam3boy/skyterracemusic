'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [logoMode, setLogoMode] = useState<'text' | 'image' | 'both'>('text');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    fetchBranding();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function fetchBranding() {
    try {
      const res = await fetch('/api/admin/branding');
      if (res.ok) {
        const settings = await res.json();
        if (settings.logo_base64) setCustomLogo(settings.logo_base64);
        if (settings.logo_mode) setLogoMode(settings.logo_mode);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const topNavItems = [
    { name: '브랜드 사이트', href: 'https://www.ehyundai.com' },
  ];

  const mainNavItems = [
    { name: '음악신청', href: '/request' },
    { name: '신청현황', href: '/status' },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      isScrolled ? "bg-white/95 backdrop-blur-xl shadow-sm" : "bg-white"
    )}>
      {/* Main Bar */}
      <div className="border-b border-hyundai-gray-200">
        <div className="portal-container h-24 flex justify-between items-center">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative h-12 flex items-center gap-5">
              {/* Image Logo */}
              {(logoMode === 'image' || logoMode === 'both') && customLogo ? (
                <img src={customLogo} alt="Logo" className="h-full w-auto object-contain" />
              ) : (logoMode === 'image' && !customLogo) ? (
                 <img 
                   src="/logo.png" 
                   alt="THE HYUNDAI" 
                   className="h-full w-auto object-contain hidden"
                   onError={(e) => (e.currentTarget.style.display = 'none')}
                   onLoad={(e) => (e.currentTarget.style.display = 'block')}
                 />
              ) : null}

              {/* Text Branding */}
              {(logoMode === 'text' || logoMode === 'both') && (
                <div className="flex flex-col first-letter:group-hover:opacity-80 transition-opacity">
                  <span className="text-2xl font-bold text-hyundai-black tracking-[-0.05em] leading-none">THE HYUNDAI</span>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="w-1 h-1 rounded-full bg-hyundai-gold"></span>
                     <span className="text-[11px] font-bold text-hyundai-gray-400 tracking-normal uppercase">SKY TERRACE</span>
                  </div>
                </div>
              )}
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center gap-14">
            {mainNavItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "text-[15px] font-bold tracking-tighter transition-all relative py-2 group uppercase",
                  pathname === item.href ? "text-hyundai-black" : "text-hyundai-gray-500 hover:text-hyundai-black"
                )}
              >
                {item.name}
                <span className={cn(
                  "absolute bottom-[-2px] left-0 h-0.5 bg-hyundai-black transition-all duration-300",
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                )}></span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button className="w-12 h-12 flex items-center justify-center hover:bg-hyundai-gray-50 transition-colors">
               <Search className="w-5 h-5 text-hyundai-black" strokeWidth={2.5} />
            </button>
            <button 
              className="lg:hidden w-12 h-12 flex items-center justify-center hover:bg-hyundai-gray-50 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
               <Menu className="w-6 h-6 text-hyundai-black" strokeWidth={2.5} />
            </button>
            <Link 
              href="/request" 
              className="hidden lg:flex h-12 items-center px-8 bg-hyundai-black text-white text-[14px] font-bold uppercase tracking-tight hover:bg-hyundai-gold hover:text-hyundai-black transition-all"
            >
              음악 신청 서비스
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={cn(
        "fixed inset-0 bg-white z-[100] transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] lg:hidden",
        mobileMenuOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="p-8 flex justify-between items-center">
           <span className="text-xl font-black tracking-tighter">THE HYUNDAI</span>
           <button onClick={() => setMobileMenuOpen(false)} className="w-12 h-12 flex items-center justify-center">
             <X className="w-8 h-8" />
           </button>
        </div>
        <div className="px-10 py-12 space-y-12">
            {mainNavItems.map((item, idx) => (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-4xl font-black tracking-tighter hover:text-hyundai-gold transition-colors animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {item.name}
              </Link>
            ))}
        </div>
        <div className="absolute bottom-12 left-10 right-10">
           <Link 
             href="/request" 
             onClick={() => setMobileMenuOpen(false)}
             className="flex h-16 items-center justify-center bg-hyundai-black text-white text-[16px] font-bold uppercase tracking-tight"
           >
             음악 신청 서비스
           </Link>
        </div>
      </div>
    </header>
  );
}
