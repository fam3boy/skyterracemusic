'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Copy, Clock, Music, User, MessageCircle, AlertCircle, ExternalLink, ChevronRight, Hash, Calendar, Heart, ArrowLeft, Disc, Verified, ShieldCheck, ArrowRight } from 'lucide-react';
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
        const res = await fetch(`/api/requests/${id}`);
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
        <div className="w-16 h-16 border-8 border-hyundai-gray-50 border-t-hyundai-black rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-hyundai-gray-400">데이터 인증 및 보안 확인 중</p>
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
           <h2 className="text-4xl md:text-6xl font-black text-hyundai-black uppercase tracking-tighter">데이터 조회 실패</h2>
           <p className="text-hyundai-gray-400 font-bold uppercase tracking-widest text-sm">입력하신 신청 번호와 일치하는 데이터가 시스템에 존재하지 않습니다.</p>
        </div>
        <button onClick={() => router.push('/status')} className="btn-portal-primary px-16 h-20 text-lg tracking-widest font-black">
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
      text: '보내주신 소중한 신청곡을 선곡팀에서 엄격한 기준에 따라 검토 중입니다. 결과 보고를 기다려 주십시오.',
      subLabel: '검토 진행 중'
    },
    approved: { 
      label: '송출 준비 완료', 
      icon: Verified, 
      color: 'bg-hyundai-emerald', 
      text: '디지털 선곡 검증이 완료되었습니다. 이번 주 목요일 19:00 이후 정규 플레이리스트에 정식 편성됩니다.',
      subLabel: '최종 승인 완료'
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
      {/* 1. Infrastructure Header */}
      <div className="border-b border-hyundai-gray-100 bg-white">
        <div className="portal-container">
            <div className="h-14 flex items-center gap-4 text-[10px] font-black text-hyundai-gray-400 uppercase tracking-widest">
               <Link href="/" className="hover:text-hyundai-black transition-colors">디지털 포털</Link>
               <span className="w-1.5 h-px bg-hyundai-gray-200"></span>
               <Link href="/status" className="hover:text-hyundai-black transition-colors">조회 센터</Link>
               <span className="w-1.5 h-px bg-hyundai-gray-200"></span>
               <span className="text-hyundai-black">상세 레포트</span>
            </div>
        </div>
      </div>

      <div className="portal-container pt-24 md:pt-32">
        {/* Success Alert for New Requests */}
        {isNew && (
           <div className="mb-24 bg-hyundai-emerald p-12 text-white flex flex-col md:flex-row items-center gap-10 animate-in fade-in slide-in-from-top-8 duration-1000 shadow-3xl shadow-hyundai-emerald/20">
              <div className="w-20 h-20 bg-white/20 flex items-center justify-center shrink-0">
                 <Verified className="w-10 h-10" />
              </div>
               <div className="space-y-2 flex-grow text-center md:text-left">
                  <h2 className="text-3xl font-black uppercase tracking-tight">시스템 등록 성공</h2>
                  <p className="text-sm font-bold opacity-80 uppercase tracking-wider">귀하의 신청 데이터가 안전하게 서버에 동기화되었습니다. 고유 ID를 보관하십시오.</p>
               </div>
               <button 
                 onClick={copyId}
                 className="btn-portal-outline border-white text-white hover:bg-white hover:text-hyundai-emerald px-10 h-16 text-sm font-black whitespace-nowrap"
               >
                 {copied ? '복사됨' : '고유 식별 번호 복사'}
               </button>
           </div>
        )}

        <div className="max-w-6xl mx-auto space-y-32">
           {/* 2. Top Banner (Status Area) */}
           <div className="grid grid-cols-1 lg:col-span-12 gap-px bg-hyundai-gray-100 border border-hyundai-gray-100">
              <div className={cn("lg:col-span-4 p-12 text-white flex flex-col justify-between gap-12", status.color)}>
               <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">서비스 운영 상태</span>
                  <div className="space-y-2">
                     <h2 className="text-4xl font-black uppercase leading-none tracking-tighter">{status.label}</h2>
                     <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 italic">{status.subLabel}</p>
                  </div>
               </div>
                 <status.icon className="w-20 h-20 opacity-30 self-end" strokeWidth={1.5} />
              </div>
              
              <div className="lg:col-span-8 bg-white p-12 flex flex-col justify-center space-y-8">
                  <div className="space-y-4">
                     <span className="text-[10px] font-black text-hyundai-gold uppercase tracking-[0.4em]">공식 검토 답변</span>
                     <p className="text-2xl font-black text-hyundai-black leading-tight uppercase tracking-tight">
                        {status.text}
                     </p>
                  </div>
                 {request.admin_memo && (
                    <div className="p-8 bg-hyundai-gray-50 border-l-8 border-hyundai-black">
                       <p className="text-sm font-bold text-hyundai-gray-600 leading-relaxed uppercase tracking-tight italic">
                          "{request.admin_memo}"
                       </p>
                    </div>
                 )}
              </div>
           </div>

           {/* 3. Detail Identity Area */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 pt-24 border-t-2 border-hyundai-gray-100">
              {/* Left Column: Track Specs */}
              <div className="space-y-16">
                  <div className="space-y-4">
                     <span className="text-3xl font-black text-hyundai-gray-200 uppercase tracking-tighter block italic">01/곡 정보</span>
                     <h3 className="text-3xl font-black text-hyundai-black uppercase tracking-tight">음원 데이터 식별</h3>
                  </div>
                 
                 <div className="space-y-12">
                    <div className="flex items-start gap-8">
                       <div className="w-32 h-32 bg-hyundai-black text-white flex items-center justify-center shrink-0">
                          <Disc className="w-12 h-12 animate-[spin_6s_linear_infinite]" />
                       </div>
                       <div className="space-y-3 pt-2">
                          <h4 className="text-4xl font-black text-hyundai-black uppercase leading-none tracking-tighter">{request.title}</h4>
                          <div className="flex items-center gap-3">
                             <User className="w-4 h-4 text-hyundai-gold" />
                             <span className="text-lg font-bold text-hyundai-gray-400 uppercase tracking-widest">{request.artist}</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                           <MessageCircle className="w-5 h-5 text-hyundai-gold" />
                           <span className="text-[11px] font-black text-hyundai-gray-400 uppercase tracking-[0.3em]">사용자 신청 사연</span>
                        </div>
                       <div className="p-10 bg-hyundai-gray-50 border border-hyundai-gray-100 relative">
                          <p className="text-lg font-medium text-hyundai-gray-500 leading-relaxed italic">
                              "{request.story || '제출된 사연 데이터가 없습니다'}"
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right Column: Metadata Specs */}
              <div className="space-y-16">
                  <div className="space-y-4">
                     <span className="text-3xl font-black text-hyundai-gray-200 uppercase tracking-tighter block italic">02/메타데이터</span>
                     <h3 className="text-3xl font-black text-hyundai-black uppercase tracking-tight">트랜잭션 기록 상세</h3>
                  </div>

                 <div className="space-y-6 divide-y-2 divide-hyundai-gray-50">
                    {[
                      { icon: Hash, label: '심사 식별자', val: request.id, mono: true, copy: true },
                      { icon: Calendar, label: '신청 일시', val: new Date(request.created_at).toLocaleString() },
                      { icon: User, label: '신청자 성함', val: request.requester_name || '시스템 익명', upper: true },
                      { icon: Heart, label: '음원 소스', val: request.youtube_url ? 'YOUTUBE_VERIFIED' : '직접 입력', link: request.youtube_url }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-6">
                         <div className="flex items-center gap-4">
                            <item.icon className="w-4 h-4 text-hyundai-gray-300" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-hyundai-gray-400">{item.label}</span>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className={cn(
                               "text-[12px] font-bold text-hyundai-black",
                               item.mono && "font-mono font-black",
                               item.upper && "uppercase tracking-widest"
                            )}>
                               {item.val}
                            </span>
                            {item.copy && (
                               <button onClick={copyId} className={cn("p-1.5 transition-all", copied ? "text-hyundai-emerald" : "text-hyundai-gray-200 hover:text-hyundai-black")}>
                                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                               </button>
                            )}
                            {item.link && (
                               <a href={item.link} target="_blank" rel="noopener" className="p-1.5 text-hyundai-emerald hover:text-hyundai-black transition-all">
                                  <ExternalLink className="w-4 h-4" />
                               </a>
                            )}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* 4. Footer Actions */}
            <div className="flex flex-col md:flex-row gap-8 pt-32 border-t-8 border-hyundai-black">
               <button 
                 onClick={() => router.push('/')}
                 className="btn-portal-outline flex-1 h-24 text-2xl tracking-[0.4em] font-black group relative transform hover:-translate-y-2 active:scale-95 duration-500"
               >
                  <div className="flex items-center justify-center gap-6">
                     <ArrowLeft className="w-8 h-8 group-hover:-translate-x-2 transition-transform duration-500" strokeWidth={3} />
                     <span>포털 메인 이동</span>
                  </div>
               </button>
               <button 
                 onClick={() => router.push('/request')}
                 className="btn-portal-primary flex-1 h-24 text-2xl tracking-[0.4em] font-black group relative transform hover:-translate-y-2 active:scale-95 duration-500"
               >
                  <div className="flex items-center justify-center gap-6">
                     <span>추가 신청하기</span>
                     <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform duration-500" strokeWidth={3} />
                  </div>
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}
