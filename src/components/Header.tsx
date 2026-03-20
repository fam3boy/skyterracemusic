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
  const [brandText, setBrandText] = useState('THE HYUNDAI | SKY TERRACE');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    fetchBranding();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  async function fetchBranding() {
    try {
      const res = await fetch(`/api/branding?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const settings = await res.json();
        if (settings.logo_base64) setCustomLogo(settings.logo_base64);
        if (settings.logo_mode) setLogoMode(settings.logo_mode);
        if (settings.brand_text) setBrandText(settings.brand_text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const [brandTop, brandBottom] = brandText.split('|').map(t => t.trim());

  const topNavItems: { name: string; href: string }[] = [];

  const mainNavItems = [
    { name: '소개', href: '/#intro' },
    { name: '플레이리스트', href: '/playlist' },
    { name: '신청현황', href: '/status' },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      isScrolled ? "bg-white shadow-sm" : "bg-white"
    )}>
      {/* Top Utility Bar */}
      <div className="hidden lg:block border-b border-hyundai-gray-100 bg-[#f8f8f8]">
        <div className="portal-container h-11 flex justify-end items-center gap-8">
           {topNavItems.map((item) => (
             <a key={item.name} href={item.href} className="text-[12px] font-medium text-hyundai-gray-500 hover:text-hyundai-black transition-colors">{item.name}</a>
           ))}
           <div className="flex items-center gap-6 border-l border-hyundai-gray-200 pl-8 ml-2">
              <Link href="/admin" className="text-[12px] font-medium text-hyundai-gray-500 hover:text-hyundai-black">관리자</Link>
              <div className="flex items-center gap-1 cursor-pointer group">
                 <span className="text-[12px] font-medium text-hyundai-black">KOREAN</span>
                 <svg className="w-3 h-3 text-hyundai-gray-400 group-hover:text-hyundai-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
           </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="border-b border-hyundai-gray-200">
        <div className="portal-container h-20 lg:h-24 flex justify-between items-center">
          {/* Brand Logo & Branch Info */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center group">
              <div className="relative h-10 flex items-center min-w-[40px]">
                {!isLoading && (
                  <>
                    {customLogo ? (
                      <img key={customLogo} src={customLogo} alt="Logo" className="h-full w-auto object-contain" />
                    ) : (
                      <span className="text-2xl md:text-3xl font-bold text-hyundai-black tracking-[-0.05em] leading-none uppercase">{brandTop || (isLoading ? '' : 'THE HYUNDAI')}</span>
                    )}
                  </>
                )}
              </div>
            </Link>
          </div>

          {/* Large Center Navigation */}
          <nav className="hidden lg:flex items-center gap-16">
            {mainNavItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "text-[17px] font-bold tracking-tight transition-all relative py-2 group",
                  pathname === item.href ? "text-hyundai-accent" : "text-hyundai-black hover:text-hyundai-accent"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden w-12 h-12 flex items-center justify-center hover:bg-hyundai-gray-50 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
               <Menu className="w-7 h-7 text-hyundai-black" strokeWidth={2} />
            </button>
            <Link 
              href="/request" 
              className="hidden lg:flex h-14 items-center px-10 bg-hyundai-black text-white text-[15px] font-bold tracking-tight hover:bg-hyundai-accent transition-all"
            >
              음악 신청하기
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={cn(
        "fixed inset-0 bg-white z-[200] transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] lg:hidden flex flex-col",
        mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}>
         <div className="p-8 flex justify-between items-center">
            <div className="h-8 flex items-center">
               {!isLoading && (
                 <>
                    {customLogo ? (
                      <img key={customLogo} src={customLogo} alt="Logo" className="h-full w-auto object-contain" />
                    ) : (
                      <span className="text-xl font-black tracking-tighter uppercase">{brandTop || (isLoading ? '' : 'THE HYUNDAI')}</span>
                    )}
                 </>
               )}
            </div>
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
