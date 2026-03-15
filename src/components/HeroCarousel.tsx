'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SLIDES = [
  {
    id: 1,
    title: "음악, 공간을 채우는 선율",
    subtitle: "THIS MONTH'S THEME: ACOUSTIC COMFORT",
    description: "현대프리미엄아울렛 대전점 스카이테라스에서 들려오는 특별한 어쿠스틱 선율. 고객님의 소중한 신청곡을 기다립니다.",
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2400",
    cta: "실시간 신청곡 등록",
    href: "/request"
  },
  {
    id: 2,
    title: "당신의 사연이 음악이 됩니다",
    subtitle: "YOUR STORY, OUR PLAYLIST",
    description: "스카이테라스의 스피커를 통해 흐르는 당신만의 보이스. 지금 바로 당신의 플레이리스트를 만들어주세요.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2400",
    cta: "음악 신청하기",
    href: "/request"
  },
  {
    id: 3,
    title: "스카이테라스 소식",
    subtitle: "SKY TERRACE NEWS",
    description: "현대백화점 대전점 3F 스카이테라스에서 진행되는 다양한 음악 이벤트와 소식을 만나보세요.",
    image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2400",
    cta: "운영 가이드 보기",
    href: "/#guide"
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[800px] w-full overflow-hidden bg-white">
      {SLIDES.map((slide, index) => (
        <div 
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.65,0,0.35,1)]",
            index === current ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
          )}
        >
          {/* Background Image with Zoom Effect */}
          <div 
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-transform duration-[12000ms] ease-linear",
              index === current ? "scale-110" : "scale-100"
            )}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* Content Layer */}
          <div className="portal-container relative h-full flex items-center justify-start text-white">
            <div className="max-w-4xl space-y-10">
               <div className="space-y-4">
                  <span className="text-white text-[12px] font-black tracking-[0.5em] uppercase block animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">{slide.subtitle}</span>
                  <h2 className="text-6xl md:text-9xl font-black tracking-[-0.04em] leading-[0.9] uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">{slide.title}</h2>
               </div>
               
               <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed max-w-xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700 fill-mode-both">
                 {slide.description}
               </p>

               <div className="pt-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-1000 fill-mode-both">
                 <Link 
                   href={slide.href}
                   className="inline-flex h-16 items-center px-14 bg-white text-hyundai-black text-[11px] font-black uppercase tracking-[0.3em] hover:bg-hyundai-gold hover:text-white transition-all transform hover:-translate-y-1"
                 >
                   {slide.cta}
                 </Link>
               </div>
            </div>
          </div>
        </div>
      ))}

      {/* Modern Pagination & Controls */}
      <div className="absolute bottom-20 left-0 right-0 z-20">
        <div className="portal-container flex items-end justify-between">
          <div className="flex flex-col gap-6">
             <div className="flex gap-4">
               {SLIDES.map((_, i) => (
                 <button 
                   key={i}
                   onClick={() => setCurrent(i)}
                   className="group py-4 flex flex-col items-center"
                 >
                   <span className={cn(
                     "text-[10px] font-black mb-2 transition-all duration-500",
                     current === i ? "text-white" : "text-white/40 group-hover:text-white/60"
                   )}>{(i + 1).toString().padStart(2, '0')}</span>
                   <div className={cn(
                     "h-[2px] transition-all duration-700 ease-in-out",
                     current === i ? "w-20 bg-white" : "w-10 bg-white/20"
                   )} />
                 </button>
               ))}
             </div>
          </div>
          
          <div className="flex items-center gap-0">
             <button 
               onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
               className="w-16 h-16 border border-white/20 flex items-center justify-center hover:bg-white hover:text-hyundai-black transition-all"
             >
               <ChevronLeft className="w-6 h-6" />
             </button>
             <button 
               onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
               className="w-16 h-16 border border-white/20 border-l-0 flex items-center justify-center hover:bg-white hover:text-hyundai-black transition-all"
             >
               <ChevronRight className="w-6 h-6" />
             </button>
          </div>
        </div>
      </div>
    </section>
  );
}
