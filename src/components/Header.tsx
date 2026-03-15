'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, Menu, X, Globe, User, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const topNavItems = [
    { name: '브랜드 사이트', href: '#' },
    { name: '온라인 스토어', href: '#' },
    { name: '현대백화점 APP', href: '#' },
    { name: 'ENGLISH', href: '#' },
  ];

  const mainNavItems = [
    { name: '지점안내', href: '#' },
    { name: '쇼핑정보', href: '#' },
    { name: '서비스/시설', href: '#' },
    { name: '문화센터', href: '#' },
    { name: '음악신청', href: '/request' },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      isScrolled ? "bg-white/95 backdrop-blur-xl shadow-sm translate-y-[-44px]" : "bg-white"
    )}>
      {/* Utility Bar (Level 1) */}
      <div className="border-b border-hyundai-gray-100">
        <div className="portal-container h-11 flex justify-end items-center gap-8">
           {topNavItems.map((item) => (
             <Link key={item.name} href={item.href} className="text-[10px] font-black text-hyundai-gray-400 hover:text-hyundai-black transition-colors uppercase tracking-[0.1em]">
               {item.name}
             </Link>
           ))}
           <div className="h-3 w-px bg-hyundai-gray-200"></div>
           <Link href="/admin" className="text-[10px] font-black text-hyundai-black uppercase tracking-widest">ADMIN PORTAL</Link>
        </div>
      </div>

      {/* Main Bar (Level 2) */}
      <div className="border-b border-hyundai-gray-200">
        <div className="portal-container h-24 flex justify-between items-center">
          {/* Brand Logo */}
          <Link href="/" className="flex flex-col group">
            <span className="text-2xl font-black text-hyundai-black tracking-[-0.05em] leading-none">THE HYUNDAI</span>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-1 h-1 rounded-full bg-hyundai-gold"></span>
               <span className="text-[10px] font-black text-hyundai-gray-400 tracking-[0.4em] uppercase">SKY TERRACE</span>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center gap-14">
            {mainNavItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "text-[13px] font-black tracking-tighter transition-all relative py-2 group uppercase",
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
              className="hidden lg:flex h-12 items-center px-8 bg-hyundai-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-hyundai-gold hover:text-hyundai-black transition-all"
            >
              Music Service
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
             className="flex w-full h-16 items-center justify-center bg-hyundai-black text-white text-[11px] font-black uppercase tracking-[0.2em]"
           >
             Music Request Service
           </Link>
        </div>
      </div>
    </header>
  );
}
