"use client";

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MailLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('weekly_mail_logs')
      .select('*')
      .order('sent_at', { ascending: false });

    if (!error && data) setLogs(data);
    setLoading(false);
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
          <thead className="bg-hyundai-gray-100 text-hyundai-gray-500 text-xs uppercase font-bold border-b border-hyundai-gray-200">
            <tr>
              <th className="px-6 py-4">발송 일시</th>
              <th className="px-6 py-4">수신자</th>
              <th className="px-6 py-4">제목</th>
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
                <tr key={log.id} className="hover:bg-hyundai-gray-500/5 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    <p className="font-bold text-hyundai-black">{new Date(log.sent_at).toLocaleDateString()}</p>
                    <p className="text-xs text-hyundai-gray-500">{new Date(log.sent_at).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-hyundai-gray-500">{log.recipient_email}</td>
                  <td className="px-6 py-4 text-sm font-medium text-hyundai-black truncate max-w-xs">{log.subject}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-hyundai-emerald/10 text-hyundai-emerald px-2 py-1 rounded-md font-bold text-xs border border-hyundai-emerald/20">
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
                          : 'bg-white border border-hyundai-emerald text-hyundai-emerald hover:bg-hyundai-emerald hover:text-white'
                      }`}
                    >
                      {resending === log.id ? '재발송 중...' : '수동 재발송'}
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
