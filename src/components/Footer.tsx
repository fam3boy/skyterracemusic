'use client';

import Link from 'next/link';
import { MapPin, Phone, Instagram, Facebook, Youtube, MessageSquare } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-hyundai-gray-100 pt-20 pb-16">
      <div className="portal-container">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-16">
          <div className="space-y-8">
            <Link href="/" className="flex flex-col group">
              <span className="text-xl font-bold text-hyundai-black tracking-[-0.05em] leading-none">THE HYUNDAI</span>
              <span className="text-[10px] font-bold text-hyundai-gray-400 tracking-[0.4em] uppercase mt-1">SKY TERRACE</span>
            </Link>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-[13px] font-bold text-hyundai-gray-600">
               <Link href="/request" className="hover:text-hyundai-accent transition-colors">음악 신청</Link>
               <Link href="/status" className="hover:text-hyundai-accent transition-colors">신청 현황</Link>
            </div>
          </div>

          <div className="space-y-4 md:text-right">
             <div className="flex flex-wrap md:justify-end gap-6">
                <Link href="/privacy" className="text-[12px] font-bold text-hyundai-black">개인정보처리방침</Link>
                <Link href="/terms" className="text-[12px] font-medium text-hyundai-gray-500">이용약관</Link>
             </div>
             <p className="text-[12px] font-medium text-hyundai-gray-400 leading-relaxed">
                대전광역시 유성구 테크노중앙로 123 현대프리미엄아울렛 대전점 3F <br />
                대표전화 : 042-332-2222
             </p>
          </div>
        </div>

        <div className="pt-8 border-t border-hyundai-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex flex-col gap-1">
             <p className="text-[11px] font-medium text-hyundai-gray-400">
               © {currentYear} HYUNDAI DEPARTMENT STORE INC. ALL RIGHTS RESERVED.
             </p>
             <p className="text-[9px] text-hyundai-gray-200">
               음악 데이터 제공: <a href="http://www.maniadb.com/" target="_blank" rel="noreferrer" className="hover:text-hyundai-gray-400 transition-colors">ManiaDB</a> (<a href="http://creativecommons.org/licenses/by-nc-sa/2.0/kr/" target="_blank" rel="noreferrer" className="hover:text-hyundai-gray-400 transition-colors">CC BY-NC-SA 2.0 KR</a>)
             </p>
           </div>
           <div className="flex gap-4">
              <Link href="/admin" className="text-[10px] text-hyundai-gray-300 hover:text-hyundai-gray-500 transition-colors">관리자 접속</Link>
           </div>
        </div>
      </div>
    </footer>
  );
}
