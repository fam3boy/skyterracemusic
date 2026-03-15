'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Copy, ArrowLeft, Clock, Music, User, MessageCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function StatusDetailPage() {
  const { id } = useParams();
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hyundai-emerald"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black mb-2">신청곡을 찾을 수 없습니다.</h2>
        <p className="text-hyundai-gray-500 mb-8 text-sm">신청 번호를 다시 확인해주세요.</p>
        <Link href="/" className="bg-hyundai-black text-white px-8 py-3 rounded-xl font-bold inline-block">홈으로 이동</Link>
      </div>
    );
  }

  const statusMap = {
    pending: { label: '심사 중', icon: Clock, color: 'bg-yellow-400 text-white', text: '보내주신 소중한 신청곡을 관리자가 확인하고 있습니다.' },
    approved: { label: '승인됨', icon: CheckCircle, color: 'bg-hyundai-emerald text-white', text: '신청곡이 승인되었습니다! 이번 주 목요일 19:00 이후 방송됩니다.' },
    hold: { label: '보류됨', icon: AlertCircle, color: 'bg-hyundai-gray-500 text-white', text: '부적절한 사유 등으로 인해 보류되었습니다. 공지사항을 확인해주세요.' },
    deleted: { label: '거절됨', icon: AlertCircle, color: 'bg-red-500 text-white', text: '방송 규정에 맞지 않아 반려되었습니다.' },
  };

  const status = statusMap[request.status as keyof typeof statusMap] || statusMap.pending;

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10 text-center relative">
        <Link href="/" className="absolute left-0 top-1/2 -translate-y-1/2 p-2 hover:bg-hyundai-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-hyundai-gray-400" />
        </Link>
        <h2 className="text-sm font-black text-hyundai-gray-400 uppercase tracking-widest">Request Status</h2>
      </div>

      {isNew && (
        <div className="bg-hyundai-emerald/10 border border-hyundai-emerald/10 p-8 rounded-[2rem] mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="w-16 h-16 bg-hyundai-emerald text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-hyundai-emerald/20">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-hyundai-black mb-1">신청이 완료되었습니다!</h2>
          <p className="text-sm text-hyundai-gray-500 max-w-[240px] mx-auto leading-relaxed">아래 신청번호를 보관하시면 처리 상태를 조회하실 수 있습니다.</p>
        </div>
      )}

      <div className="card-premium overflow-hidden">
        {/* Status Header */}
        <div className={cn("px-8 py-6 flex items-center justify-between", status.color)}>
           <div className="flex items-center gap-3">
             <status.icon className="w-5 h-5" />
             <span className="font-black text-lg tracking-tight">{status.label}</span>
           </div>
           <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Live State</span>
        </div>

        <div className="p-8 space-y-8">
           <p className="text-sm font-medium text-hyundai-gray-500 leading-relaxed bg-hyundai-gray-50 p-4 rounded-xl border-l-4 border-l-current border-opacity-20" style={{ color: 'inherit' }}>
             {status.text}
           </p>

           <div className="space-y-6">
             <div className="flex items-start gap-4">
               <div className="w-12 h-12 bg-white shadow-sm border border-hyundai-gray-100 rounded-2xl flex items-center justify-center text-hyundai-emerald shrink-0">
                 <Music className="w-5 h-5" />
               </div>
               <div className="pt-1">
                 <h3 className="text-xl font-black text-hyundai-black mb-1">{request.title}</h3>
                 <p className="text-sm font-bold text-hyundai-gray-400 flex items-center gap-1.5">
                   <User className="w-3.5 h-3.5" />
                   {request.artist}
                 </p>
               </div>
             </div>

             {request.story && (
               <div className="bg-hyundai-emerald/5 p-5 rounded-2xl border border-hyundai-emerald/5 relative">
                 <MessageCircle className="w-4 h-4 text-hyundai-emerald absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm" />
                 <p className="text-sm text-hyundai-gray-600 leading-relaxed italic">"{request.story}"</p>
               </div>
             )}

             {request.admin_memo && (
               <div className="bg-hyundai-gray-100 p-5 rounded-2xl border border-hyundai-gray-200">
                 <div className="flex items-center gap-2 mb-2">
                   <AlertCircle className="w-3.5 h-3.5 text-hyundai-gray-500" />
                   <span className="text-[10px] font-black text-hyundai-gray-400 uppercase tracking-widest">Admin Feedback</span>
                 </div>
                 <p className="text-sm font-bold text-hyundai-black leading-relaxed">{request.admin_memo}</p>
               </div>
             )}
           </div>

           <div className="pt-8 border-t border-hyundai-gray-100 space-y-4">
             <div className="flex justify-between items-center text-xs">
               <span className="font-black text-hyundai-gray-400 uppercase tracking-widest">Request Number</span>
               <div className="flex items-center gap-3">
                 <span className="font-mono font-bold text-hyundai-black bg-hyundai-gray-100 px-3 py-1.5 rounded-lg border border-hyundai-gray-200">{request.id}</span>
                 <button 
                   onClick={copyId}
                   className={cn(
                     "p-2 rounded-xl border transition-all",
                     copied ? "bg-hyundai-emerald border-hyundai-emerald text-white" : "bg-white border-hyundai-gray-200 text-hyundai-gray-400 hover:border-hyundai-emerald hover:text-hyundai-emerald"
                   )}
                 >
                   {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                 </button>
               </div>
             </div>
             
             {request.youtube_url && (
               <div className="flex justify-between items-center text-xs">
                 <span className="font-black text-hyundai-gray-400 uppercase tracking-widest">Source Link</span>
                 <a 
                   href={request.youtube_url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-1 font-bold text-hyundai-emerald hover:underline"
                 >
                   YouTube 보기 <ExternalLink className="w-3 h-3" />
                 </a>
               </div>
             )}

             <div className="flex justify-between items-center text-xs">
               <span className="font-black text-hyundai-gray-400 uppercase tracking-widest">Submitted At</span>
               <span className="font-bold text-hyundai-black">
                 {new Date(request.created_at).toLocaleString()}
               </span>
             </div>
           </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-4">
        <Link href="/" className="bg-hyundai-black text-white py-4 rounded-2xl text-center font-black text-lg shadow-xl shadow-hyundai-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all">
          홈으로 돌아가기
        </Link>
        <Link href="/request" className="bg-white border-2 border-hyundai-gray-100 text-hyundai-gray-500 py-4 rounded-2xl text-center font-bold hover:bg-hyundai-gray-50 transition-all">
          다른 곡 신청하기
        </Link>
      </div>
    </div>
  );
}
