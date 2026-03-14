"use client";

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    pending: 0,
    approvedTotal: 0,
    totalThisMonth: 0,
  });
  const [activeTheme, setActiveTheme] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      // Get counts
      const { count: pendingCount } = await supabase
        .from('song_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: approvedCount } = await supabase
        .from('song_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get active theme
      const { data: theme } = await supabase
        .from('monthly_themes')
        .select('*')
        .eq('is_active', true)
        .single();

      setStats({
        pending: pendingCount || 0,
        approvedTotal: approvedCount || 0,
        totalThisMonth: (pendingCount || 0) + (approvedCount || 0),
      });
      setActiveTheme(theme);
    }
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-hyundai-black">Dashboard</h2>
        <p className="text-hyundai-gray-500 mt-1">실시간 신청곡 현황 및 운영 요약</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card p-6 border-l-4 border-l-yellow-400">
          <p className="text-sm font-bold text-hyundai-gray-500 mb-1">대기 중인 신청곡</p>
          <p className="text-4xl font-black text-hyundai-black">{stats.pending}</p>
          <div className="mt-4 flex justify-end">
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">신속한 심사 필요</span>
          </div>
        </div>
        <div className="card p-6 border-l-4 border-l-hyundai-emerald">
          <p className="text-sm font-bold text-hyundai-gray-500 mb-1">이번 주 승인된 곡</p>
          <p className="text-4xl font-black text-hyundai-black">{stats.approvedTotal}</p>
          <div className="mt-4 flex justify-end">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">자동 발송 대기 중</span>
          </div>
        </div>
        <div className="card p-6 border-l-4 border-l-hyundai-gold">
          <p className="text-sm font-bold text-hyundai-gray-500 mb-1">활성화된 테마</p>
          <p className="text-xl font-bold text-hyundai-black truncate">{activeTheme?.title || '없음'}</p>
          <p className="text-xs text-hyundai-gray-500 mt-1">{activeTheme?.theme_month || '-'}</p>
          <div className="mt-4 flex justify-end">
            <span className="text-xs bg-emerald-50 text-hyundai-emerald px-2 py-1 rounded">운영 중</span>
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
