"use client";

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, admins(nickname, email)')
        .order('created_at', { ascending: false });

      if (!error && data) setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-hyundai-black">관리자 활동 이력</h2>
        <p className="text-hyundai-gray-500 mt-1">시스템 변경 사항 및 운영 로그</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-hyundai-gray-100 text-hyundai-gray-500 text-xs uppercase font-bold border-b border-hyundai-gray-200">
            <tr>
              <th className="px-6 py-4">일시</th>
              <th className="px-6 py-4">관리자</th>
              <th className="px-6 py-4">동작</th>
              <th className="px-6 py-4">대상 테이블</th>
              <th className="px-6 py-4">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hyundai-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-20 uppercase font-black tracking-widest text-hyundai-gray-200">Loading Logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-20 text-hyundai-gray-500 italic">로그 기록이 없습니다.</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-hyundai-gray-50 space-x-0">
                  <td className="px-6 py-4 text-xs">
                    <p className="text-hyundai-black font-medium">{new Date(log.created_at).toLocaleDateString()}</p>
                    <p className="text-hyundai-gray-400">{new Date(log.created_at).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <p className="font-bold text-hyundai-black">{log.admins?.nickname || 'Unknown'}</p>
                    <p className="text-hyundai-gray-400">{log.admins?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black uppercase bg-hyundai-emerald/5 text-hyundai-emerald px-2 py-1 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-hyundai-gray-500">{log.target_table}</td>
                  <td className="px-6 py-4 text-xs font-mono text-hyundai-gray-500 truncate max-w-[200px]">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
