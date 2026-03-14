"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { SongRequest } from '@/types/database';

export default function StatusDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';
  
  const [request, setRequest] = useState<SongRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequest() {
      const { data, error } = await supabase
        .from('song_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setRequest(data);
      }
      setLoading(false);
    }
    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hyundai-emerald"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">신청곡을 찾을 수 없습니다.</h2>
        <p className="text-hyundai-gray-500 mb-8">신청 번호를 다시 확인해주세요.</p>
        <Link href="/" className="btn-primary">홈으로 이동</Link>
      </div>
    );
  }

  const statusMap = {
    pending: { label: '심사 중', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    approved: { label: '승인됨', color: 'bg-green-100 text-green-800 border-green-200' },
    hold: { label: '보류됨', color: 'bg-hyundai-gray-100 text-hyundai-gray-500 border-hyundai-gray-200' },
    deleted: { label: '거절/삭제됨', color: 'bg-red-100 text-red-800 border-red-200' },
  };

  const status = statusMap[request.status as keyof typeof statusMap];

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {isNew && (
        <div className="bg-hyundai-emerald/10 border border-hyundai-emerald/20 p-6 rounded-2xl mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-12 h-12 bg-hyundai-emerald text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-hyundai-emerald mb-1">신청이 완료되었습니다!</h2>
          <p className="text-sm text-hyundai-gray-500">관리자 확인 후 플레이리스트에 반영됩니다.</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="bg-hyundai-gray-100 px-6 py-4 flex justify-between items-center border-b border-hyundai-gray-200">
          <span className="text-xs font-bold text-hyundai-gray-500 uppercase tracking-wider">신청 정보</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
            {status.label}
          </span>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-hyundai-gray-100 rounded-lg flex items-center justify-center text-hyundai-gray-500 flex-shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-hyundai-black mb-1">{request.title}</h3>
              <p className="text-lg text-hyundai-gray-500">{request.artist}</p>
            </div>
          </div>

          {request.story && (
            <div className="bg-hyundai-gray-100/50 p-4 rounded-xl italic text-hyundai-gray-500 relative">
              <span className="absolute -top-3 -left-1 text-4xl text-hyundai-emerald opacity-20 font-serif">"</span>
              <p className="relative z-10">{request.story}</p>
              <span className="absolute -bottom-8 -right-1 text-4xl text-hyundai-emerald opacity-20 font-serif">"</span>
            </div>
          )}

          <div className="pt-6 border-t border-hyundai-gray-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-hyundai-gray-500">신청일</span>
              <span className="text-hyundai-black font-medium">
                {new Date(request.created_at).toLocaleDateString()} {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-hyundai-gray-500">신청번호</span>
              <span className="text-hyundai-black font-mono uppercase">{request.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <Link href="/" className="btn-primary text-center">홈으로 돌아가기</Link>
        <Link href="/request" className="btn-outline text-center">다른 곡 신청하기</Link>
      </div>
    </div>
  );
}
