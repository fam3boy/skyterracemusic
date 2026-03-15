'use client';

import { Clock, MapPin, Headphones, Info, ChevronRight, Share2, Calendar } from 'lucide-react';

export default function InfoBlock() {
  return (
    <section className="bg-white py-24 border-b border-hyundai-gray-100">
      <div className="portal-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-hyundai-gray-100 border border-hyundai-gray-100">
          
          {/* Item 1: Schedule */}
          <div className="p-12 space-y-6 group hover:bg-hyundai-gray-50 transition-colors duration-500">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-black text-hyundai-gold uppercase tracking-[0.3em]">Operational Status</span>
               <Clock className="w-5 h-5 text-hyundai-gray-200 group-hover:text-hyundai-black transition-colors" />
            </div>
            <div className="space-y-2">
               <h4 className="text-2xl font-black text-hyundai-black tracking-tight">Today's Schedule</h4>
               <p className="text-[13px] font-medium text-hyundai-gray-500 leading-relaxed">
                 오전 10:30 - 오후 21:00 <br />
                 금요일/토요일 일요일 연장 운영
               </p>
            </div>
            <div className="pt-2 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-hyundai-emerald animate-pulse"></div>
               <span className="text-[11px] font-black text-hyundai-emerald uppercase tracking-widest">On-Air Now</span>
            </div>
          </div>

          {/* Item 2: Policy */}
          <div className="p-12 space-y-6 group hover:bg-hyundai-gray-50 transition-colors duration-500">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-black text-hyundai-gold uppercase tracking-[0.3em]">Music Guidelines</span>
               <Headphones className="w-5 h-5 text-hyundai-gray-200 group-hover:text-hyundai-black transition-colors" />
            </div>
            <div className="space-y-2">
               <h4 className="text-2xl font-black text-hyundai-black tracking-tight">Request Policy</h4>
               <p className="text-[13px] font-medium text-hyundai-gray-500 leading-relaxed">
                 선곡팀의 큐레이션을 거쳐 방송됩니다. <br />
                 적정 음량 및 테마 준수를 원칙으로 합니다.
               </p>
            </div>
            <a href="/#guide" className="inline-flex items-center gap-2 text-[10px] font-black text-hyundai-black uppercase tracking-widest border-b-2 border-hyundai-black pb-1 hover:text-hyundai-gold hover:border-hyundai-gold transition-all">
               View Full Guidelines <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Item 3: Space */}
          <div className="p-12 space-y-6 group hover:bg-hyundai-gray-50 transition-colors duration-500">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-black text-hyundai-gold uppercase tracking-[0.3em]">Terrace Space</span>
               <MapPin className="w-5 h-5 text-hyundai-gray-200 group-hover:text-hyundai-black transition-colors" />
            </div>
            <div className="space-y-2">
               <h4 className="text-2xl font-black text-hyundai-black tracking-tight">Terrace Location</h4>
               <p className="text-[13px] font-medium text-hyundai-gray-500 leading-relaxed">
                 현대프리미엄아울렛 대전점 3F <br />
                 하늘정원 스카이테라스 메인홀
               </p>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black text-hyundai-gray-400 uppercase tracking-widest hover:text-hyundai-black transition-colors">
               <Share2 className="w-4 h-4" /> Share Location
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
