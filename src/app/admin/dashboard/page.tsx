'use client';

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    pending: 0,
    approved: 0,
    hold: 0,
    deleted: 0,
    total: 0,
    weeklyApproved: 0,
    weeklyPeriodStart: null,
    weeklyPeriodEnd: null,
    lastMail: null
  });
  const [activeTheme, setActiveTheme] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/audit-logs')
        ]);
        
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
          setActiveTheme(data.activeTheme);
        }
        
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-10">
        <h2 className="text-3xl font-black text-hyundai-black tracking-tight">관리자 대시보드</h2>
        <p className="text-hyundai-gray-500 mt-1 font-medium">실시간 신청곡 현황 및 시스템 운영 기록</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Row 1: Key Metrics */}
        <div className="card-premium p-8 border-l-4 border-l-hyundai-black">
          <p className="text-xs font-black text-hyundai-gray-400 uppercase tracking-widest mb-2">전체 신청수</p>
          <p className="text-5xl font-black text-hyundai-black tracking-tighter">{stats.total}</p>
          <p className="text-[10px] text-hyundai-gray-400 mt-6 font-bold">누적 데이터 기준</p>
        </div>
        
        <div className="card-premium p-8 border-l-4 border-l-yellow-400">
          <p className="text-xs font-black text-hyundai-gray-400 uppercase tracking-widest mb-2">검토 대기중</p>
          <p className="text-5xl font-black text-hyundai-black tracking-tighter">{stats.pending}</p>
          <div className="mt-6 flex justify-end">
            <span className="text-[10px] font-black bg-yellow-400 text-white px-3 py-1 rounded-full tracking-tighter">심사 필요</span>
          </div>
        </div>

        <div className="card-premium p-8 border-l-4 border-l-hyundai-emerald bg-hyundai-emerald/5">
          <p className="text-xs font-black text-hyundai-emerald uppercase tracking-widest mb-2">이번 주 승인건 (미리보기)</p>
          <p className="text-5xl font-black text-hyundai-black tracking-tighter">{stats.weeklyApproved}</p>
          <p className="text-[10px] text-hyundai-gray-400 mt-2 font-mono font-bold">{stats.weeklyPeriodStart ? new Date(stats.weeklyPeriodStart).toLocaleDateString() : '...'} ~ {stats.weeklyPeriodEnd ? new Date(stats.weeklyPeriodEnd).toLocaleDateString() : '...'}</p>
          <div className="mt-6 flex justify-between items-center">
             <button 
               onClick={async () => {
                 if(confirm('지금 즉시 주간 리포트를 발송하시겠습니까? (최근 승인곡 포함)')) {
                   const res = await fetch('/api/cron/weekly-mail?forceCurrent=true');
                   if(res.ok) alert('성공적으로 발송되었습니다.'); else alert('발송 중 오류가 발생했습니다.');
                   window.location.reload();
                 }
               }}
               className="text-[10px] font-black text-hyundai-emerald hover:underline uppercase tracking-widest"
             >
               수동 발송하기
             </button>
             <span className="text-[10px] font-bold bg-hyundai-emerald text-white px-3 py-1 rounded-full uppercase">Ready</span>
          </div>
        </div>

        <div className="card-premium p-8 border-l-4 border-l-hyundai-gold">
          <p className="text-xs font-black text-hyundai-gray-400 uppercase tracking-widest mb-2">자동 리포트 상태</p>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stats.lastMail?.status === 'success' ? 'bg-hyundai-emerald animate-pulse' : 'bg-red-500'}`}></div>
            <p className="text-2xl font-black text-hyundai-black uppercase tracking-tight">{stats.lastMail?.status === 'success' ? '정상 발송' : stats.lastMail?.status || '기록 없음'}</p>
          </div>
          <p className="text-[10px] text-hyundai-gray-400 mt-2 uppercase font-bold tracking-tight">
            최근: {stats.lastMail?.sent_at ? new Date(stats.lastMail.sent_at).toLocaleString() : '정보 없음'}
          </p>
          <div className="mt-6 flex justify-end">
             <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${stats.lastMail?.status === 'success' ? 'bg-hyundai-emerald/10 text-hyundai-emerald' : 'bg-red-50 text-red-500'}`}>
                {stats.lastMail?.status === 'success' ? '시스템 정상' : '조치 필요'}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="card-premium p-8">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-hyundai-emerald"></div>
              운영 프로세스 안내
            </h3>
            <div className="space-y-6">
              <div className="p-6 bg-hyundai-gray-50 rounded-[1.5rem] border border-hyundai-gray-100">
                <p className="font-black text-hyundai-black mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 bg-hyundai-black text-white text-[10px] flex items-center justify-center rounded-full">1</span>
                  신청곡 심사 정책
                </p>
                <p className="text-sm text-hyundai-gray-500 leading-relaxed font-medium">부적절한 가사, 상업적 홍보, 중복 신청 등을 필터링하며 거절 시 사유를 메모로 남기면 사용자 화면에 노출됩니다.</p>
              </div>
              <div className="p-6 bg-hyundai-gray-50 rounded-[1.5rem] border border-hyundai-gray-100">
                <p className="font-black text-hyundai-black mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 bg-hyundai-black text-white text-[10px] flex items-center justify-center rounded-full">2</span>
                  주간 리포트 자동화
                </p>
                <p className="text-sm text-hyundai-gray-500 leading-relaxed font-medium">매주 목요일 19:00 시스템에 의해 자동 집계되어 등록된 이메일로 발송됩니다. 필요한 경우 '수동 발송하기'를 사용하세요.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-premium p-8 flex flex-col">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-hyundai-gold"></div>
            최근 관리자 활동 (감사 로그)
          </h3>
          <div className="flex-grow">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-hyundai-emerald"></div>
              </div>
            ) : logs.length > 0 ? (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-hyundai-gray-50 rounded-2xl transition-colors border border-transparent hover:border-hyundai-gray-100">
                    <div className="w-8 text-[10px] font-black text-hyundai-gray-300 pt-1">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-bold text-hyundai-black tracking-tight">{log.action}</p>
                      <p className="text-[10px] text-hyundai-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        {log.admin_name || '시스템'} • {log.target_table} ({log.target_id?.slice(0, 8)})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xs font-black text-hyundai-gray-300 uppercase tracking-widest leading-loose">기록된 활동이 없습니다.</p>
              </div>
            )}
          </div>
          <Link href="/admin/audit-logs" className="mt-8 text-[10px] font-black text-hyundai-gray-400 hover:text-hyundai-black uppercase tracking-[0.2em] border-t border-hyundai-gray-100 pt-6 text-center">
            전체 활동 내역 보기
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
