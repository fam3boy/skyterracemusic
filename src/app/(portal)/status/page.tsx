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

      <div className="portal-container pt-6 md:pt-10">
        {/* 2. Top Header (Hyundai Style) */}
        <div className="mb-20">
           <div className="flex justify-between items-end border-b-2 border-hyundai-black pb-6 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-hyundai-black tracking-tighter">신청 현황 조회</h1>
           </div>
           <p className="text-[14px] font-medium text-hyundai-gray-500 px-2 tracking-tight">
             신청 시 발급받은 조회 번호를 통해 실시간 처리 상태를 확인하실 수 있습니다. <br className="hidden md:block" />
             분실 시 보안 정책에 따라 조회가 제한될 수 있습니다.
           </p>
        </div>

        {/* 3. Operational Search Input */}
        <div className="bg-white border border-hyundai-gray-100 p-12 md:p-24 space-y-16">
          <form onSubmit={handleSearch} className="space-y-16">
            <div className="space-y-8">
               <div className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-hyundai-accent rounded-full"></span>
                  <span className="text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-widest">식별 번호 입력 (UUID)</span>
               </div>
               
               <div className="relative group">
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    className="w-full bg-white border border-hyundai-gray-200 h-20 md:h-24 px-6 md:px-10 pr-20 md:pr-32 text-lg md:text-3xl font-bold text-hyundai-black placeholder:text-hyundai-gray-100 outline-none transition-all font-mono tracking-tighter focus:border-hyundai-black"
                    placeholder="조회 번호를 입력하세요"
                    value={requestId}
                    onChange={(e) => setRequestId(e.target.value)}
                  />
                  <div className="absolute right-0 top-0 bottom-0 px-6 md:px-10 bg-hyundai-black text-white flex items-center justify-center group-focus-within:bg-hyundai-accent transition-all duration-500">
                    <Search className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2} />
                  </div>
               </div>
            </div>

            <div className="flex justify-center pt-8">
               <button
                 type="submit"
                 disabled={!requestId.trim()}
                 className={cn(
                    "btn-portal-primary px-8 md:px-32 h-16 md:h-20 text-[15px] md:text-[16px] font-bold w-full md:w-auto",
                    !requestId.trim() && "opacity-20 cursor-not-allowed"
                 )}
               >
                 현황 조회하기
               </button>
            </div>
          </form>

          {/* Infrastructure Guidelines */}
          <div className="pt-24 border-t border-hyundai-gray-50 grid grid-cols-1 md:grid-cols-2 gap-16">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <Clock className="w-5 h-5 text-hyundai-accent" />
                   <h4 className="text-[15px] font-bold text-hyundai-black tracking-tight">심사 주기 안내</h4>
                </div>
                <p className="text-[13px] font-medium text-hyundai-gray-400 leading-relaxed tracking-tight">
                   신청곡은 시스템 내부 선별 기준에 따라 정기적으로 검토됩니다. <br />
                   검토 완료 후 상태가 '승인'으로 전환되면 정규 방송 리스트에 포함됩니다.
                </p>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <Info className="w-5 h-5 text-hyundai-accent" />
                   <h4 className="text-[15px] font-bold text-hyundai-black tracking-tight">수정 및 취소 정책</h4>
                </div>
                <p className="text-[13px] font-medium text-hyundai-gray-400 leading-relaxed tracking-tight">
                   이미 제출된 데이터는 시스템 무결성을 위해 직접 수정이 불가능합니다. <br />
                   중요한 오류가 있는 경우 기존 요청을 무시하고 새로 신청해 주시길 권장합니다.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
