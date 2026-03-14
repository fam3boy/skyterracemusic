"use client";

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SongRequest, RequestStatus } from '@/types/database';

export default function RequestsManagementPage() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const [memoOpen, setMemoOpen] = useState<string | null>(null);
  const [memoText, setMemoText] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  async function fetchRequests() {
    setLoading(true);
    let query = supabase
      .from('song_requests')
      .select('*, monthly_themes(title)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setRequests(data as any);
    }
    setLoading(false);
  }

  const updateStatus = async (id: string, status: RequestStatus) => {
    const { error } = await supabase
      .from('song_requests')
      .update({ 
        status, 
        approved_at: status === 'approved' ? new Date().toISOString() : null 
      })
      .eq('id', id);

    if (!error) {
      // Log action (simplified for now)
      setRequests(requests.map(r => r.id === id ? { ...r, status, approved_at: status === 'approved' ? new Date().toISOString() : undefined } : r));
    }
  };

  const handleSaveMemo = async (id: string) => {
    const { error } = await supabase
      .from('song_requests')
      .update({ admin_memo: memoText })
      .eq('id', id);

    if (!error) {
      setRequests(requests.map(r => r.id === id ? { ...r, admin_memo: memoText } : r));
      setMemoOpen(null);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    hold: 'bg-gray-100 text-gray-800',
    deleted: 'bg-red-100 text-red-800',
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-hyundai-black">신청곡 관리</h2>
          <p className="text-hyundai-gray-500 mt-1">사용자 요청 목록 및 심사</p>
        </div>
        
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-hyundai-gray-200">
          {(['all', 'pending', 'approved', 'hold', 'deleted'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                filter === f ? 'bg-hyundai-emerald text-white shadow-md' : 'text-hyundai-gray-500 hover:bg-hyundai-gray-100'
              }`}
            >
              {f === 'all' ? '전체' : f === 'pending' ? '대기' : f === 'approved' ? '승인' : f === 'hold' ? '보류' : '삭제'}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-hyundai-gray-100 text-hyundai-gray-500 text-xs uppercase font-bold border-b border-hyundai-gray-200">
            <tr>
              <th className="px-6 py-4">신청곡 정보</th>
              <th className="px-6 py-4">사연 / 메모</th>
              <th className="px-6 py-4">신청자 / 일시</th>
              <th className="px-6 py-4 text-center">상태</th>
              <th className="px-6 py-4 text-right">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hyundai-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-20 text-hyundai-gray-200 uppercase font-black tracking-widest">Loading...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-20 text-hyundai-gray-500 italic">검색 결과가 없습니다.</td></tr>
            ) : (
              requests.map(req => (
                <tr key={req.id} className="hover:bg-hyundai-gray-100/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-hyundai-black">{req.title}</p>
                    <p className="text-sm text-hyundai-gray-500">{req.artist}</p>
                    {req.youtube_url && (
                      <a href={req.youtube_url} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                        YouTube 열기
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-hyundai-black truncate">{req.story || '-'}</p>
                    {req.admin_memo && <p className="text-xs text-hyundai-gold font-bold mt-1">Memo: {req.admin_memo}</p>}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <p className="text-hyundai-black font-medium">{req.requester_name || '익명'}</p>
                    <p className="text-hyundai-gray-500">{new Date(req.created_at).toLocaleDateString()}</p>
                    <p className="text-hyundai-gray-300">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${statusColors[req.status] || ''}`}>
                      {req.status === 'pending' ? '대기' : req.status === 'approved' ? '승인' : req.status === 'hold' ? '보류' : '삭제'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => { setMemoOpen(req.id); setMemoText(req.admin_memo || ''); }}
                        className="p-2 hover:bg-white rounded border border-transparent hover:border-hyundai-gray-200 text-hyundai-gray-500 transition-all"
                        title="메모"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      
                      {req.status !== 'approved' && (
                        <button 
                          onClick={() => updateStatus(req.id, 'approved')}
                          className="p-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded transition-all"
                          title="승인"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                        </button>
                      )}
                      
                      {req.status !== 'hold' && req.status !== 'approved' && (
                        <button 
                          onClick={() => updateStatus(req.id, 'hold')}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition-all"
                          title="보류"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </button>
                      )}
                      
                      {req.status !== 'deleted' && (
                        <button 
                          onClick={() => updateStatus(req.id, 'deleted')}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded transition-all"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Memo Modal */}
      {memoOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-hyundai-gray-100">
              <h3 className="font-bold text-lg">관리자 메모 입력</h3>
            </div>
            <div className="p-6">
              <textarea
                className="w-full px-4 py-3 border border-hyundai-gray-200 rounded-lg focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald outline-none min-h-[120px]"
                placeholder="운영 참고용 메모를 입력하세요 (사용자에게 보이지 않음)"
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
              />
            </div>
            <div className="p-6 bg-hyundai-gray-100 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setMemoOpen(null)}
                className="px-4 py-2 text-hyundai-gray-500 font-bold hover:bg-hyundai-gray-200 rounded-lg transition-all"
              >
                취소
              </button>
              <button 
                onClick={() => handleSaveMemo(memoOpen)}
                className="px-6 py-2 bg-hyundai-emerald text-white font-bold rounded-lg shadow-md hover:opacity-90 transition-all"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
