'use client';

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';

export default function MailLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/mail-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLoading(false);
    }
  }

  const handleManualResend = async (log: any) => {
    setResending(log.id);
    try {
      // In a real app, this would call an API route that sends the email
      const response = await fetch('/api/cron/weekly-mail', {
        method: 'GET', // Or a dedicated POST route for re-sending
      });
      
      if (response.ok) {
        alert('메일 재발송 요청이 완료되었습니다.');
        fetchLogs();
      } else {
        alert('재발송 실패: ' + (await response.text()));
      }
    } catch (err) {
      alert('오류가 발생했습니다.');
    } finally {
      setResending(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-hyundai-black">메일 발송 권한 및 로그</h2>
        <p className="text-hyundai-gray-500 mt-1">자동 발송된 신청곡 목록 이력 및 수동 재발송</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-hyundai-black text-white text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">집계 기간 & 발송시각</th>
              <th className="px-6 py-4">수신자 & 제목</th>
              <th className="px-6 py-4 text-center">상태</th>
              <th className="px-6 py-4 text-center">곡 수</th>
              <th className="px-6 py-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hyundai-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-20 text-hyundai-gray-200 uppercase font-black tracking-widest">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-20 text-hyundai-gray-500 italic">발송 이력이 없습니다.</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-hyundai-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-hyundai-emerald bg-hyundai-emerald/5 px-2 py-0.5 rounded w-fit mb-1">
                        {log.period_start ? `${new Date(log.period_start).toLocaleDateString()} - ${new Date(log.period_end).toLocaleDateString()}` : 'Manual/Unknown'}
                      </span>
                      <p className="font-bold text-hyundai-black">{new Date(log.sent_at).toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p className="text-hyundai-gray-500 text-xs">{log.recipient_email}</p>
                    <p className="font-medium text-hyundai-black truncate max-w-xs">{log.subject}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {log.status === 'success' ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">SUCCESS</span>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded">FAILED</span>
                        {log.error_message && (
                          <span className="text-[9px] text-red-400 max-w-[100px] truncate" title={log.error_message}>
                            {log.error_message}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-hyundai-black/5 text-hyundai-black px-2 py-1 rounded-md font-bold text-xs border border-hyundai-black/10">
                      {log.request_ids?.length || 0}곡
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleManualResend(log)}
                      disabled={resending === log.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        resending === log.id 
                          ? 'bg-hyundai-gray-200 text-hyundai-gray-400 cursor-not-allowed'
                          : 'bg-hyundai-black text-white hover:bg-hyundai-gray-800 shadow-sm'
                      }`}
                    >
                      {resending === log.id ? '발송 중...' : '즉시 재발송'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-6 bg-hyundai-gold/5 border border-hyundai-gold/20 rounded-2xl">
        <h4 className="font-bold text-hyundai-gold mb-2 text-sm">시스템 안내</h4>
        <p className="text-xs text-hyundai-gray-500 leading-relaxed">
          매주 목요일 19:00에 시스템이 자동으로 승인된 신청곡을 집계하여 발송합니다. <br />
          발송 대상은 `approved_at` 기준이며, 발송 완료 후 로그에 저장됩니다. <br />
          수동 재발송 시에는 현재 시점 기준의 최신 승인 목록을 다시 집계하여 발송하니 주의하시기 바랍니다.
        </p>
      </div>
    </AdminLayout>
  );
}
