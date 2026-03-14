'use client';

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    hold: 0,
    deleted: 0,
    total: 0,
    weeklyApproved: 0,
  });
  const [activeTheme, setActiveTheme] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats({
            pending: data.pending,
            approved: data.approved,
            hold: data.hold,
            deleted: data.deleted,
            total: data.total,
            weeklyApproved: data.weeklyApproved
          });
          setActiveTheme(data.activeTheme);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    }
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-hyundai-black">Dashboard</h2>
        <p className="text-hyundai-gray-500 mt-1">실시간 신청곡 현황 및 운영 요약</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Row 1: Key Metrics */}
        <div className="card p-6 border-l-4 border-l-hyundai-black">
          <p className="text-sm font-bold text-hyundai-gray-500 mb-1">총 신청곡</p>
          <p className="text-4xl font-black text-hyundai-black">{stats.total}</p>
          <p className="text-xs text-hyundai-gray-400 mt-4">누적 데이터 기준</p>
        </div>
        
        <div className="card p-6 border-l-4 border-l-yellow-400">
          <p className="text-sm font-bold text-hyundai-gray-500 mb-1">심사 대기</p>
          <p className="text-4xl font-black text-hyundai-black">{stats.pending}</p>
          <div className="mt-4 flex justify-end">
            <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">FAST REVIEW</span>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-hyundai-emerald">
          <p className="text-sm font-bold text-hyundai-gray-500 mb-1">이번 주 승인 예정</p>
          <p className="text-4xl font-black text-hyundai-black">{stats.weeklyApproved}</p>
          <div className="mt-4 flex justify-end">
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">READY TO MAIL</span>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-hyundai-gold">
          <p className="text-sm font-bold text-hyundai-gray-500 mb-1">활성화 테마</p>
          <p className="text-lg font-bold text-hyundai-black truncate">{activeTheme?.title || '없음'}</p>
          <p className="text-xs text-hyundai-gray-500 mt-1 uppercase tracking-tighter">{activeTheme?.theme_month ? new Date(activeTheme.theme_month).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }) : '-'}</p>
          <div className="mt-4 flex justify-end">
             <span className="text-[10px] font-bold bg-hyundai-gold/10 text-hyundai-gold px-2 py-1 rounded italic">ON AIR</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Row 2: Sub Metrics */}
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-hyundai-gray-400 uppercase tracking-wider">승인 완료</p>
            <p className="text-2xl font-black text-hyundai-emerald">{stats.approved}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-hyundai-emerald/10 flex items-center justify-center text-hyundai-emerald">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          </div>
        </div>
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-hyundai-gray-400 uppercase tracking-wider">보류 처리</p>
            <p className="text-2xl font-black text-hyundai-gray-500">{stats.hold}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-hyundai-gray-100 flex items-center justify-center text-hyundai-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/></svg>
          </div>
        </div>
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-hyundai-gray-400 uppercase tracking-wider">삭제/거절</p>
            <p className="text-2xl font-black text-red-500">{stats.deleted}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-hyundai-emerald"></div>
            운영 가이드라인
          </h3>
          <div className="space-y-4 text-sm text-hyundai-gray-500">
            <div className="p-4 bg-hyundai-gray-100 rounded-lg">
              <p className="font-bold text-hyundai-black mb-1">심사 원칙</p>
              <p>부적절한 단어, 광고성 내용, 불법 음원 경로가 포함된 사연은 즉시 삭제 처리해주시기 바랍니다.</p>
            </div>
            <div className="p-4 bg-hyundai-gray-100 rounded-lg">
              <p className="font-bold text-hyundai-black mb-1">메일 발송 안내</p>
              <p>매주 목요일 19:00에 지난 1주일간 승인된 곡 목록이 방송팀으로 자동 발송됩니다. (집계 기간: 지난주 목 19:00 ~ 이번주 목 18:59)</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-hyundai-gold"></div>
            최근 관리자 작업
          </h3>
          <div className="text-center py-10">
            <p className="text-sm text-hyundai-gray-200 uppercase tracking-widest font-black">Coming Soon</p>
            <p className="text-xs text-hyundai-gray-500 mt-2">최근 작업 이력 로딩 중...</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
