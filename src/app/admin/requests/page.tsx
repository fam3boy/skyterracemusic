'use client';

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';

export default function RequestsManagementPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'hold' | 'deleted'>('all');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [memoOpen, setMemoOpen] = useState<string | null>(null);
  const [memoText, setMemoText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => fetchRequests(), 300);
    return () => clearTimeout(timer);
  }, [filter, search, startDate, endDate]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filter });
      if (search) params.append('q', search);
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);

      const res = await fetch(`/api/admin/requests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, status, approved_at: status === 'approved' ? new Date().toISOString() : null } : r));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSaveMemo = async (id: string) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, admin_memo: memoText }),
      });

      if (res.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, admin_memo: memoText } : r));
        setMemoOpen(null);
      }
    } catch (err) {
      console.error('Failed to save memo', err);
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 group">
        <div>
          <h2 className="text-3xl font-bold text-hyundai-black">신청곡 관리</h2>
          <p className="text-hyundai-gray-500 mt-1">사용자 요청 목록 심사 및 필터링</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-hyundai-gray-200 shadow-sm w-full lg:w-auto">
          {(['all', 'pending', 'approved', 'hold', 'deleted'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wider ${
                filter === f ? 'bg-hyundai-black text-white shadow-lg scale-105' : 'text-hyundai-gray-400 hover:text-hyundai-black hover:bg-hyundai-gray-100'
              }`}
            >
              {f === 'all' ? 'TOTAL' : f === 'pending' ? 'PENDING' : f === 'approved' ? 'APPROVED' : f === 'hold' ? 'HOLD' : 'DELETED'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="lg:col-span-2 relative">
          <input 
            type="text" 
            placeholder="곡명, 아티스트, 신청자 검색..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-hyundai-gray-200 rounded-xl focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald outline-none transition-all text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-hyundai-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            className="w-full px-3 py-3 bg-white border border-hyundai-gray-200 rounded-xl focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald outline-none transition-all text-xs font-bold"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-hyundai-gray-300">~</span>
          <input 
            type="date" 
            className="w-full px-3 py-3 bg-white border border-hyundai-gray-200 rounded-xl focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald outline-none transition-all text-xs font-bold"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex justify-end lg:justify-start">
           <button 
             onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); setFilter('all'); }}
             className="px-4 py-3 text-hyundai-gray-400 hover:text-red-500 font-bold text-xs uppercase transition-colors"
           >
             Reset Filters
           </button>
        </div>
      </div>

      <div className="card overflow-hidden shadow-xl border-none">
        <table className="w-full text-left">
          <thead className="bg-hyundai-black text-white text-[10px] uppercase font-black tracking-[0.2em] border-b border-hyundai-black">
            <tr>
              <th className="px-6 py-5">Song Identity</th>
              <th className="px-6 py-5">Context / Memo</th>
              <th className="px-6 py-5">Source / Timeline</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-6 py-5 text-right">Administrative</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hyundai-gray-100 bg-white">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-32 text-hyundai-gray-200 uppercase font-black tracking-widest animate-pulse">Synchronizing Data...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-32 text-hyundai-gray-500 font-bold uppercase tracking-wider italic">No requests match your filters</td></tr>
            ) : (
              requests.map(req => (
                <tr key={req.id} className="hover:bg-hyundai-emerald/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-black text-hyundai-black text-base">{req.title}</p>
                      <p className="text-sm font-bold text-hyundai-gray-400 tracking-tight">{req.artist}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {req.youtube_url && (
                          <a href={req.youtube_url} target="_blank" className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition-all shadow-sm" title="YouTube Preview">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                          </a>
                        )}
                        {req.duplicate_count > 0 && (
                          <span className="px-2 py-0.5 bg-hyundai-gold text-white text-[9px] font-black rounded uppercase tracking-wider animate-bounce shadow-lg shadow-hyundai-gold/20">
                            Duplicate ({req.duplicate_count})
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 max-w-xs">
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-black text-hyundai-gray-400 uppercase tracking-widest mb-1">Requester Story</p>
                        <p className="text-xs text-hyundai-black font-medium leading-relaxed italic border-l-2 border-hyundai-emerald/20 pl-3">{req.story || 'No story provided'}</p>
                      </div>
                      {req.admin_memo && (
                        <div className="bg-hyundai-gold/5 p-2 rounded border border-hyundai-gold/10">
                           <p className="text-[9px] font-black text-hyundai-gold uppercase tracking-tighter mb-1">Internal Admin Memo</p>
                           <p className="text-[11px] text-hyundai-gold/80 font-bold">{req.admin_memo}</p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold">
                    <p className="text-hyundai-black mb-1">{req.requester_name || 'ANONYMOUS'}</p>
                    <p className="text-hyundai-gray-400">{new Date(req.created_at).toLocaleDateString()} {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[9px] text-hyundai-gray-300 mt-1 uppercase tracking-tighter">Theme: {req.theme_title || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest border-2 ${statusColors[req.status as keyof typeof statusColors] || ''}`}>
                      {req.status === 'pending' ? 'PENDING' : req.status === 'approved' ? 'APPROVED' : req.status === 'hold' ? 'HOLD' : 'DELETED'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setMemoOpen(req.id); setMemoText(req.admin_memo || ''); }}
                        className="p-2.5 bg-hyundai-gray-100 text-hyundai-gray-500 hover:bg-hyundai-black hover:text-white rounded-lg transition-all shadow-sm group/btn"
                        title="Edit Administrative Memo"
                      >
                        <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      
                      {req.status !== 'approved' && (
                        <button 
                          onClick={() => updateStatus(req.id, 'approved')}
                          className="p-2.5 bg-hyundai-emerald/10 text-hyundai-emerald hover:bg-hyundai-emerald hover:text-white rounded-lg transition-all shadow-sm group/btn"
                          title="Approve Request"
                        >
                          <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                        </button>
                      )}
                      
                      {req.status !== 'hold' && req.status !== 'approved' && (
                        <button 
                          onClick={() => updateStatus(req.id, 'hold')}
                          className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm group/btn"
                          title="Put on Hold"
                        >
                          <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </button>
                      )}
                      
                      {req.status !== 'deleted' && (
                        <button 
                          onClick={() => updateStatus(req.id, 'deleted')}
                          className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-sm group/btn"
                          title="Reject / Delete"
                        >
                          <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
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
