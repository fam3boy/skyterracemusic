'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Clock, Disc, User, MessageCircle, AlertCircle, ExternalLink, Hash, Calendar, Heart, ArrowLeft, Verified, ShieldCheck, ArrowRight, Copy, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function StatusDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';
  
  const [request, setRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchRequest() {
      try {
        const res = await fetch(`/api/requests/${id}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setRequest(data);
        }
      } catch (err) {
        console.error('Failed to fetch request', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequest();
  }, [id]);

  const copyId = () => {
    navigator.clipboard.writeText(id as string);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] gap-6">
        <div className="w-12 h-12 border-4 border-hyundai-gray-50 border-t-hyundai-black rounded-full animate-spin"></div>
        <p className="text-[12px] font-bold uppercase tracking-widest text-hyundai-gray-400">데이터 인증 및 보안 확인 중</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="portal-container py-40 text-center space-y-12">
        <div className="w-32 h-32 bg-hyundai-gray-50 text-hyundai-gray-200 flex items-center justify-center mx-auto border-4 border-hyundai-gray-100 rotate-45">
          <AlertCircle className="w-12 h-12 -rotate-45" />
        </div>
        <div className="space-y-4">
           <h2 className="text-4xl md:text-5xl font-bold text-hyundai-black tracking-tighter">데이터 조회 실패</h2>
           <p className="text-hyundai-gray-400 font-semibold tracking-widest text-sm uppercase">입력하신 신청 번호와 일치하는 데이터가 시스템에 존재하지 않습니다.</p>
        </div>
        <button onClick={() => router.push('/status')} className="btn-portal-primary px-16 h-20 text-lg tracking-widest font-semibold">
           식별 번호 재입력
        </button>
      </div>
    );
  }

  const statusMap = {
    pending: { 
      label: '심사 대기 중', 
      icon: Clock, 
      color: 'bg-hyundai-gold', 
      text: '보내주신 소중한 신청곡을 선곡팀에서 검토 중입니다. 고유 번호를 복사하여 반영 결과를 확인할 수 있습니다.',
      subLabel: '검토 진행 중'
    },
    approved: { 
      label: '승인 완료', 
      icon: Verified, 
      color: 'bg-hyundai-emerald', 
      text: '신청곡이 승인되었습니다. 이번 주 금요일 이후 정규 플레이리스트에 정식 편성됩니다.',
      subLabel: ''
    },
    hold: { 
      label: '심사 보류', 
      icon: ShieldCheck, 
      color: 'bg-hyundai-gray-500', 
      text: '일부 메타데이터 오류 혹은 내부 정책 사유로 인해 보류되었습니다. 공지사항의 가이드라인을 확인해 주십시오.',
      subLabel: '재검토 대상'
    },
    deleted: { 
      label: '요청 반려', 
      icon: AlertCircle, 
      color: 'bg-hyundai-black', 
      text: '방송 규범 및 저작권 정책에 부합하지 않아 폐기된 요청입니다. 사유를 확인하시려면 고객센터로 문의 바랍니다.',
      subLabel: '반려된 요청'
    },
  };

  const status = statusMap[request.status as keyof typeof statusMap] || statusMap.pending;

  return (
    <div className="bg-white min-h-screen pb-40">

      <div className="portal-container pt-6 md:pt-10">
        {/* Success Alert for New Requests */}
        {isNew && (
           <div className="mb-20 bg-hyundai-accent p-10 text-white flex flex-col md:flex-row items-center gap-10 animate-in fade-in slide-in-from-top-8 duration-1000">
              <div className="w-16 h-16 bg-white/20 flex items-center justify-center shrink-0">
                 <Verified className="w-8 h-8" />
              </div>
               <div className="space-y-1 flex-grow text-center md:text-left">
                  <h2 className="text-2xl font-bold tracking-tight">신청곡 등록 성공</h2>
                  <p className="text-[14px] font-medium opacity-90">신청곡 등록이 완료되었습니다. 신청해주신 곡은 내부 검토를 거쳐 반영 여부가 결정되며 고유 번호를 복사하여 반영 여부를 확인할 수 있습니다.</p>
               </div>
               <button 
                 onClick={copyId}
                 className="h-14 px-10 border border-white text-white hover:bg-white hover:text-hyundai-accent text-[14px] font-bold transition-all whitespace-nowrap"
               >
                 {copied ? '복사됨' : '고유 번호 복사'}
               </button>
           </div>
        )}

        <div className="space-y-24">
           {/* 2. Top Banner (Status Area) */}
           <div className="flex flex-col md:flex-row border border-hyundai-gray-100">
              <div className={cn("md:w-[320px] p-12 text-white flex flex-col justify-between gap-12", status.color)}>
                <div className="space-y-4">
                   <span className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-60">곡 신청 상태</span>
                   <div className="space-y-1">
                      <h2 className="text-3xl font-bold leading-none tracking-tight whitespace-nowrap">{status.label}</h2>
                      {status.subLabel && <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">{status.subLabel}</p>}
                   </div>
                </div>
                 <status.icon className="w-12 h-12 opacity-30 self-end" strokeWidth={1.5} />
              </div>
              
              <div className="flex-grow p-12 flex flex-col justify-center space-y-8 bg-white">
                  <div className="space-y-6">
                     <span className="text-[11px] font-bold text-hyundai-accent uppercase tracking-[0.4em]">신청곡 검토중</span>
                     <p className="text-2xl font-bold text-hyundai-black leading-tight tracking-tight break-keep">
                        {status.text}
                     </p>
                  </div>
                 {request.admin_memo && (
                    <div className="p-8 bg-hyundai-gray-50 border-l-4 border-hyundai-black">
                       <p className="text-[15px] font-medium text-hyundai-gray-600 leading-relaxed italic">
                          "{request.admin_memo}"
                       </p>
                    </div>
                 )}
              </div>
           </div>

           {/* 3. Detail Specification Area */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              {/* Left Column: Track Specs */}
              <div className="space-y-12">
                  <div className="flex justify-between items-end border-b-2 border-hyundai-black pb-6">
                     <h3 className="text-2xl font-bold text-hyundai-black tracking-tight">음원 데이터</h3>
                     <span className="text-[13px] font-bold text-hyundai-gray-300 italic">01/곡 정보</span>
                  </div>
                 
                 <div className="space-y-10">
                    <div className="flex items-center gap-8">
                       <div className="w-28 h-28 bg-hyundai-gray-50 shrink-0 border border-hyundai-gray-100 flex items-center justify-center overflow-hidden">
                          {request.image ? (
                            <img src={request.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Disc className="w-12 h-12 text-hyundai-gray-200 animate-spin" />
                          )}
                       </div>
                       <div className="space-y-2 min-w-0">
                          <h4 className="text-3xl font-bold text-hyundai-black leading-none tracking-tight truncate">{request.title}</h4>
                          <span className="text-lg font-semibold text-hyundai-gray-400 tracking-wide block">{request.artist}</span>
                       </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <span className="w-1 h-1 bg-hyundai-accent rounded-full"></span>
                           <span className="text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-widest">신청 사연</span>
                        </div>
                       <div className="p-8 bg-hyundai-gray-50 border border-hyundai-gray-100">
                          <p className="text-[16px] font-medium text-hyundai-gray-500 leading-relaxed italic">
                              "{request.story || '제출된 사연 데이터가 없습니다'}"
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right Column: Metadata Specs */}
              <div className="space-y-12">
                  <div className="flex justify-between items-end border-b-2 border-hyundai-black pb-6">
                     <h3 className="text-2xl font-bold text-hyundai-black tracking-tight">신청 정보</h3>
                     <span className="text-[13px] font-bold text-hyundai-gray-300 italic">02/상세 내역</span>
                  </div>

                 <div className="space-y-2 divide-y divide-hyundai-gray-100">
                    {[
                      { label: '신청 번호', val: request.id.toUpperCase(), mono: true, copy: true },
                      { label: '신청 일시', val: request.created_at ? new Date(request.created_at).toLocaleString() : '-' },
                      { label: '신청자', val: request.requester_name || '시스템 익명' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-6">
                         <span className="text-[13px] font-bold text-hyundai-gray-400 uppercase tracking-widest">{item.label}</span>
                         <div className="flex items-center gap-4">
                            <span className={cn(
                               "text-[15px] font-bold text-hyundai-black",
                               item.mono && "font-mono"
                            )}>
                               {item.val}
                            </span>
                            {item.copy && (
                               <button onClick={copyId} className={cn("p-1.5 transition-all outline-none", copied ? "text-hyundai-accent" : "text-hyundai-gray-200 hover:text-hyundai-black")}>
                                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            )}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* 4. Footer Actions */}
            <div className="flex flex-col md:flex-row gap-6 pt-24 pb-40 border-t border-hyundai-gray-100">
               <button 
                 onClick={() => router.push('/')}
                 className="btn-portal-outline flex-1 h-20 text-[16px] font-bold"
               >
                  메인으로 돌아가기
               </button>
               <button 
                 onClick={() => router.push('/request')}
                 className="btn-portal-primary flex-1 h-20 text-[16px] font-bold"
               >
                  추가 신청하기
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}
