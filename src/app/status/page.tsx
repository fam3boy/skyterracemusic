"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="inline-flex items-center text-hyundai-gray-500 hover:text-hyundai-emerald mb-8 transition-colors">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        메인으로 돌아가기
      </Link>

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-hyundai-black mb-2">신청 현황 확인</h2>
        <p className="text-hyundai-gray-500">신청 시 받은 고유 번호를 입력해주세요.</p>
      </div>

      <form onSubmit={handleSearch} className="card p-8 space-y-6">
        <div>
          <label className="block text-sm font-bold text-hyundai-black mb-2">신청번호 (UUID)</label>
          <input
            type="text"
            required
            className="w-full px-4 py-4 border border-hyundai-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald transition-all font-mono"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-hyundai-emerald text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 active:scale-[0.98] transition-all"
        >
          조회하기
        </button>
      </form>

      <div className="mt-12 p-6 bg-hyundai-gray-100 rounded-2xl border border-hyundai-gray-200">
        <h4 className="font-bold text-hyundai-black mb-3 text-sm uppercase tracking-wider">안내사항</h4>
        <ul className="text-xs text-hyundai-gray-500 space-y-2 list-disc pl-4">
          <li>신청 시 발급된 고유 번호 전체를 입력하셔야 조회가 가능합니다.</li>
          <li>신청곡은 관리자의 승인을 거쳐 매주 목요일 19:00 이후 플레이리스트에 반영됩니다.</li>
          <li>신청이 거절되거나 삭제된 경우 상세 정보를 조회할 수 없을 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
