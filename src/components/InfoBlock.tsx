'use client';

import { Clock, MapPin, Headphones, Info, ChevronRight, Share2, Calendar } from 'lucide-react';

export default function InfoBlock() {
  return (
    <section className="bg-white py-32 border-b border-hyundai-gray-100">
      <div className="portal-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-hyundai-gray-100 border border-hyundai-gray-100">
          
          {/* Item 1: Schedule */}
          <div className="p-12 space-y-6 group hover:bg-hyundai-gray-50 transition-colors duration-500">
            <div className="flex justify-between items-start">
               <span className="text-[12px] font-bold text-hyundai-gold uppercase tracking-[0.3em]">운영 상태</span>
               <Clock className="w-5 h-5 text-hyundai-gray-200 group-hover:text-hyundai-black transition-colors" />
            </div>
            <div className="space-y-2">
               <h4 className="text-2xl font-bold text-hyundai-black tracking-tight">오늘의 운영 시간</h4>
               <p className="text-[15px] font-medium text-hyundai-gray-500 leading-relaxed">
                 오전 10:30 - 오후 21:00 <br />
                 금요일/토요일 일요일 연장 운영
               </p>
            </div>
            <div className="pt-2 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-hyundai-emerald animate-pulse"></div>
               <span className="text-[12px] font-bold text-hyundai-emerald uppercase tracking-widest">실시간 방송 중</span>
            </div>
          </div>

          {/* Item 2: Policy */}
          <div className="p-12 space-y-6 group hover:bg-hyundai-gray-50 transition-colors duration-500">
            <div className="flex justify-between items-start">
               <span className="text-[12px] font-bold text-hyundai-gold uppercase tracking-[0.3em]">신청 가이드라인</span>
               <Headphones className="w-5 h-5 text-hyundai-gray-200 group-hover:text-hyundai-black transition-colors" />
            </div>
            <div className="space-y-2">
               <h4 className="text-2xl font-bold text-hyundai-black tracking-tight">선곡 정책 안내</h4>
               <p className="text-[15px] font-medium text-hyundai-gray-500 leading-relaxed">
                 전문 큐레이션팀의 검토를 거쳐 방송됩니다. <br />
                 공간 테마 및 음질 규격 준수를 원칙으로 합니다.
               </p>
            </div>
            <a href="/#guide" className="inline-flex items-center gap-2 text-[12px] font-bold text-hyundai-black uppercase tracking-widest border-b-2 border-hyundai-black pb-1 hover:text-hyundai-gold hover:border-hyundai-gold transition-all">
               전체 가이드라인 보기 <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Item 3: Space */}
          <div className="p-12 space-y-6 group hover:bg-hyundai-gray-50 transition-colors duration-500">
            <div className="flex justify-between items-start">
               <span className="text-[12px] font-bold text-hyundai-gold uppercase tracking-[0.3em]">테라스 공간</span>
               <MapPin className="w-5 h-5 text-hyundai-gray-200 group-hover:text-hyundai-black transition-colors" />
            </div>
            <div className="space-y-2">
               <h4 className="text-2xl font-bold text-hyundai-black tracking-tight">위치 안내</h4>
               <p className="text-[15px] font-medium text-hyundai-gray-500 leading-relaxed">
                 현대프리미엄아울렛 대전점 3F <br />
                 하늘정원 스카이테라스 메인홀
               </p>
            </div>
            <button className="flex items-center gap-2 text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-widest hover:text-hyundai-black transition-colors">
               <Share2 className="w-4 h-4" /> 공간 위치 공유하기
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
