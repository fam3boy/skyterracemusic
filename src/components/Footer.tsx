'use client';

import Link from 'next/link';
import { MapPin, Phone, Instagram, Facebook, Youtube, MessageSquare } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-hyundai-gray-200 pt-24 pb-16">
      <div className="portal-container">
        {/* Upper Footer: Brand & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          {/* Brand Identity */}
          <div className="lg:col-span-4 space-y-10">
            <Link href="/" className="flex flex-col group">
              <span className="text-2xl font-black text-hyundai-black tracking-[-0.05em] leading-none">THE HYUNDAI</span>
              <div className="flex items-center gap-2 mt-1">
                 <span className="w-1 h-1 rounded-full bg-hyundai-gold"></span>
                 <span className="text-[10px] font-black text-hyundai-gray-400 tracking-[0.4em] uppercase">SKY TERRACE</span>
              </div>
            </Link>
            <p className="text-hyundai-gray-500 text-[13px] leading-relaxed font-medium max-w-sm">
              현대프리미엄아울렛 대전점 스카이테라스에서 들려오는 특별한 선율을 만나보세요. 
              고객님의 소중한 신청곡은 정규 방송 시간에 송출됩니다.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Youtube, MessageSquare].map((Icon, i) => (
                <a key={i} href="#" className="w-11 h-11 border border-hyundai-gray-200 flex items-center justify-center hover:bg-hyundai-black hover:text-white transition-all text-hyundai-gray-400">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Sitemaps */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-hyundai-black">고객서비스</h4>
              <ul className="space-y-4">
                <li><Link href="/request" className="text-[13px] text-hyundai-gray-400 hover:text-hyundai-black transition-colors">음악 신청 서비스</Link></li>
                <li><Link href="/status" className="text-[13px] text-hyundai-gray-400 hover:text-hyundai-black transition-colors">신청 현황 조회</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-hyundai-black">오퍼레이션</h4>
              <ul className="space-y-4">
                <li><Link href="/admin/login" className="text-[13px] text-hyundai-gray-400 hover:text-hyundai-black transition-colors">관리자 로그인</Link></li>
                <li><Link href="/admin" className="text-[13px] text-hyundai-gray-400 hover:text-hyundai-black transition-colors">운영 터미널</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Lower Footer: Official Info */}
        <div className="pt-12 border-t border-hyundai-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div className="flex flex-wrap gap-x-8 gap-y-4">
              <a href="#" className="text-[11px] font-black text-hyundai-black uppercase tracking-widest">이용약관</a>
              <a href="#" className="text-[11px] font-black text-hyundai-gold uppercase tracking-widest">개인정보처리방침</a>
              <a href="#" className="text-[11px] font-black text-hyundai-gray-400 uppercase tracking-widest">영상정보처리기기</a>
           </div>
           
           <div className="space-y-2 text-left md:text-right">
              <p className="text-[10px] font-bold text-hyundai-gray-400 uppercase tracking-widest">
                대전광역시 유성구 용산동 테크노중앙로 123 현대프리미엄아울렛 대전점 3F
              </p>
              <p className="text-[10px] font-bold text-hyundai-gray-300 uppercase tracking-widest">
                © {currentYear} HYUNDAI DEPARTMENT STORE INC. ALL RIGHTS RESERVED.
              </p>
           </div>
        </div>
      </div>
    </footer>
  );
}
