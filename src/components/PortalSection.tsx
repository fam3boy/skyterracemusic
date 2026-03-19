'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PortalSectionProps {
  title: string;
  subtitle?: string;
  moreHref?: string;
  children: React.ReactNode;
  bgGray?: boolean;
}

export default function PortalSection({ title, subtitle, moreHref, children, bgGray }: PortalSectionProps) {
  return (
    <section className={cn(
      "py-8 md:py-40 border-b border-hyundai-gray-100",
      bgGray ? "bg-hyundai-gray-50" : "bg-white"
    )}>
      <div className="portal-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 md:mb-24">
          <div className="space-y-4 max-w-2xl">
            {subtitle && (
              <span className="text-hyundai-gold text-[13px] font-bold tracking-[0.4em] uppercase block animate-in fade-in slide-in-from-bottom-2 duration-500">
                {subtitle}
              </span>
            )}
            <h2 className="text-4xl md:text-6xl font-bold text-hyundai-black tracking-[-0.03em] leading-tight uppercase animate-in fade-in slide-in-from-bottom-4 duration-700">
              {title}
            </h2>
          </div>
          
          {moreHref && (
            <Link 
              href={moreHref}
              className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-hyundai-gray-400 hover:text-hyundai-black transition-all"
            >
              <span>자세히 보기</span>
              <div className="w-12 h-12 rounded-full border border-hyundai-gray-200 flex items-center justify-center group-hover:bg-hyundai-black group-hover:text-white group-hover:border-hyundai-black transition-all">
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          )}
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          {children}
        </div>
      </div>
    </section>
  );
}
