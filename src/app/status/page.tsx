"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronRight, Info, Music, Clock, Database, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function StatusSearchPage() {
  const [requestId, setRequestId] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestId.trim()) {
      router.push(`/status/${requestId.trim()}`);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-40">
      {/* 1. Header Infrastructure */}
      <div className="border-b border-hyundai-gray-100 bg-white">
        <div className="portal-container">
           <div className="h-14 flex items-center gap-4 text-[10px] font-black text-hyundai-gray-400 uppercase tracking-widest">
              <Link href="/" className="hover:text-hyundai-black transition-colors">Digital Portal</Link>
              <span className="w-1.5 h-px bg-hyundai-gray-200"></span>
              <span className="text-hyundai-black">Status Inquiry Center</span>
           </div>
        </div>
      </div>

      <div className="portal-container pt-24 md:pt-32">
        {/* 2. Hero Section */}
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-16 border-b-4 border-hyundai-black pb-16">
          <div className="space-y-6 max-w-3xl">
             <div className="space-y-4">
                <span className="text-hyundai-gold text-[12px] font-black tracking-[0.4em] uppercase block animate-in fade-in slide-in-from-bottom-2 duration-500">Live Status Check</span>
                <h1 className="text-5xl md:text-8xl font-black text-hyundai-black tracking-[-0.04em] leading-[0.9] uppercase animate-in fade-in slide-in-from-bottom-4 duration-700">Digital <br />Audit <br />Inquiry</h1>
             </div>
             <p className="text-lg md:text-xl font-medium text-hyundai-gray-500 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">신청 시 발급받은 조회 번호를 통해 실시간 처리 상태를 확인하실 수 있습니다. <br className="hidden md:block" />현대백화점 대전점의 공식 큐레이션 엔진이 귀하의 요청을 분석 중입니다.</p>
          </div>
          
          <div className="bg-hyundai-gray-50 p-8 border border-hyundai-gray-100 hidden md:block">
             <Database className="w-12 h-12 text-hyundai-gray-200 mb-4" />
             <p className="text-[10px] font-black text-hyundai-black uppercase tracking-widest">Real-time DB Connection</p>
             <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-hyundai-emerald"></div>
                <span className="text-[11px] font-bold text-hyundai-emerald uppercase">Operational</span>
             </div>
          </div>
        </div>

        {/* 3. Operational Search Input */}
        <div className="max-w-5xl mx-auto py-20">
          <form onSubmit={handleSearch} className="space-y-24">
            <div className="space-y-12">
               <div className="space-y-4">
                  <span className="text-3xl font-black text-hyundai-gray-200 uppercase tracking-tighter block italic">01/Identification</span>
                  <h3 className="text-3xl font-black text-hyundai-black uppercase tracking-tight">Enter Request ID (UUID)</h3>
               </div>
               
               <div className="relative group">
                  <input
                    type="text"
                    required
                    className="w-full bg-transparent border-b-8 border-hyundai-gray-100 px-2 py-12 text-2xl md:text-6xl font-black text-hyundai-black placeholder:text-hyundai-gray-100 outline-none transition-all font-mono tracking-tighter focus:border-hyundai-black caret-hyundai-gold"
                    placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                    value={requestId}
                    onChange={(e) => setRequestId(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 bg-hyundai-black text-white flex items-center justify-center group-focus-within:bg-hyundai-gold transition-all duration-500">
                    <Search className="w-8 h-8" strokeWidth={3} />
                  </div>
               </div>
               
               <div className="flex gap-3 items-start">
                  <Info className="w-4 h-4 text-hyundai-gold mt-0.5" />
                  <p className="text-[11px] text-hyundai-gray-400 font-medium leading-relaxed uppercase tracking-wider italic">
                    신청 완료 시 시스템에서 자동으로 발급된 36자리 고유 식별 번호를 정확하게 입력해 주십시오. <br />
                    분실 시 보안 정책에 따라 조회가 불가능할 수 있습니다.
                  </p>
               </div>
            </div>

            <div className="flex justify-center pt-10">
               <button
                 type="submit"
                 className="btn-portal-primary w-full max-w-lg h-24 text-xl tracking-[0.4em] font-black group relative transform hover:-translate-y-1 active:scale-95 duration-500"
               >
                 <div className="flex items-center justify-center gap-6">
                    <span>EXECUTE SEARCH</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
                 </div>
               </button>
            </div>
          </form>

          {/* Infrastructure Guidelines */}
          <div className="mt-40 grid grid-cols-1 md:grid-cols-2 gap-px bg-hyundai-gray-100 border border-hyundai-gray-100">
             <div className="p-12 bg-white space-y-8 group hover:bg-hyundai-gray-50 transition-colors duration-500">
                <div className="flex justify-between items-start">
                   <span className="text-[10px] font-black text-hyundai-gold uppercase tracking-[0.3em]">Operational Policy</span>
                   <Clock className="w-6 h-6 text-hyundai-gray-200 group-hover:text-hyundai-black transition-colors" />
                </div>
                <div className="space-y-4">
                   <h4 className="text-2xl font-black text-hyundai-black uppercase tracking-tight">Audit Cycle</h4>
                   <p className="text-[13px] font-medium text-hyundai-gray-500 leading-relaxed uppercase tracking-wider">
                      신청곡은 시스템 내부 선별 기준에 따라 주기적으로 검토됩니다. <br />
                      검토 완료 후 상태가 'APPROVED'로 전환되면 정규 방송 리스트에 포함됩니다.
                   </p>
                </div>
             </div>
             
             <div className="p-12 bg-white space-y-8 group hover:bg-hyundai-gray-50 transition-colors duration-500">
                <div className="flex justify-between items-start">
                   <span className="text-[10px] font-black text-hyundai-gold uppercase tracking-[0.3em]">Technical Support</span>
                   <Music className="w-6 h-6 text-hyundai-gray-200 group-hover:text-hyundai-black transition-colors" />
                </div>
                <div className="space-y-4">
                   <h4 className="text-2xl font-black text-hyundai-black uppercase tracking-tight">Data Modifications</h4>
                   <p className="text-[13px] font-medium text-hyundai-gray-500 leading-relaxed uppercase tracking-wider">
                      한번 제출된 메타데이터는 무결성 유지를 위해 수정이 제한됩니다. <br />
                      오류 발견 시 기존 요청을 철회하고 'PROTOCOL B'를 통해 재신청해 주시기 바랍니다.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
