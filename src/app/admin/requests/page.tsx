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
  
  // New States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isGrouped, setIsGrouped] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetchRequests();
    fetchTemplates();
  }, [filter, search, startDate, endDate, isGrouped]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filter, grouped: isGrouped.toString() });
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

  async function fetchTemplates() {
    const res = await fetch('/api/admin/settings?type=templates');
    if (res.ok) setTemplates(await res.json());
  }

  const handleBulkStatus = async (status: string) => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length}건을 일괄 ${status} 처리하시겠습니까?`)) return;

    try {
      const res = await fetch('/api/admin/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status }),
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchRequests();
      }
    } catch (err) {
      console.error('Bulk update failed', err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) fetchRequests();
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
        fetchRequests();
        setMemoOpen(null);
      }
    } catch (err) {
      console.error('Failed to save memo', err);
    }
  };

  const recommendationBadges = {
    APPROVE: 'bg-hyundai-emerald text-white',
    REVIEW: 'bg-blue-100 text-blue-700',
    REVIEW_CAUTION: 'bg-hyundai-gold text-white',
    REJECT: 'bg-red-500 text-white',
  };

  const getBadgeLabel = (status: string) => {
    switch (status) {
      case 'APPROVE': return '승인 추천';
      case 'REVIEW': return '검토 권장';
      case 'REVIEW_CAUTION': return '주의 필요';
      case 'REJECT': return '제외 추천';
      default: return status;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-hyundai-black tracking-tight">신청곡 관리</h2>
          <p className="text-hyundai-gray-500 mt-1 font-medium">지능형 추천 및 그룹핑 시스템 가동 중</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => setIsGrouped(!isGrouped)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${isGrouped ? 'bg-hyundai-black text-white border-hyundai-black' : 'bg-white text-hyundai-gray-400 border-hyundai-gray-100'}`}
          >
            {isGrouped ? '보기: 그룹화됨' : '보기: 전체 목록'}
          </button>
          
          <div className="flex bg-white p-1.5 rounded-xl border border-hyundai-gray-200 shadow-sm">
            {[
              { id: 'all', label: '전체' },
              { id: 'pending', label: '대기' },
              { id: 'approved', label: '승인' },
              { id: 'hold', label: '보류' },
              { id: 'deleted', label: '삭제' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all uppercase ${
                  filter === f.id ? 'bg-hyundai-black text-white shadow-md' : 'text-hyundai-gray-400 hover:text-hyundai-black'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-[50] mb-8 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-hyundai-black text-white px-8 py-5 rounded-[2rem] shadow-2xl border border-white/10 flex items-center justify-between backdrop-blur-md bg-opacity-95">
            <div className="flex items-center gap-6">
              <span className="text-sm font-black tracking-wider uppercase text-hyundai-emerald">
                {selectedIds.length}건 선택됨
              </span>
              <div className="h-4 w-px bg-white/20"></div>
              <div className="flex gap-3">
                <button onClick={() => handleBulkStatus('approved')} className="px-4 py-1.5 bg-hyundai-emerald text-white text-[10px] font-black rounded-full hover:scale-105 transition-transform">일괄 승인</button>
                <button onClick={() => handleBulkStatus('hold')} className="px-4 py-1.5 bg-blue-500 text-white text-[10px] font-black rounded-full hover:scale-105 transition-transform">일괄 보류</button>
                <button onClick={() => handleBulkStatus('deleted')} className="px-4 py-1.5 bg-red-500 text-white text-[10px] font-black rounded-full hover:scale-105 transition-transform">일괄 삭제</button>
              </div>
            </div>
            <button onClick={() => setSelectedIds([])} className="text-xs font-black text-white/40 hover:text-white uppercase tracking-widest">선택 취소</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="lg:col-span-2 relative">
          <input 
            type="text" 
            placeholder="곡명, 아티스트, 신청자 검색..." 
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-hyundai-gray-100 rounded-2xl focus:ring-4 focus:ring-hyundai-emerald/5 focus:border-hyundai-emerald outline-none transition-all text-sm font-medium shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-hyundai-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            className="w-full px-3 py-3.5 bg-white border border-hyundai-gray-100 rounded-2xl focus:border-hyundai-emerald outline-none text-[10px] font-black uppercase tracking-tighter"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-hyundai-gray-200">~</span>
          <input 
            type="date" 
            className="w-full px-3 py-3.5 bg-white border border-hyundai-gray-100 rounded-2xl focus:border-hyundai-emerald outline-none text-[10px] font-black uppercase tracking-tighter"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="card-premium overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-hyundai-gray-50 text-[10px] uppercase font-black tracking-[0.2em] text-hyundai-gray-400 border-b border-hyundai-gray-100">
            <tr>
              <th className="px-6 py-5 w-10">
                <input 
                  type="checkbox" 
                  className="rounded border-hyundai-gray-200 text-hyundai-emerald focus:ring-hyundai-emerald/20"
                  onChange={(e) => {
                    if(e.target.checked) setSelectedIds(requests.map(r => r.id));
                    else setSelectedIds([]);
                  }}
                  checked={requests.length > 0 && selectedIds.length === requests.length}
                />
              </th>
              <th className="px-6 py-5">신청 곡 정보</th>
              <th className="px-6 py-5">AI 추천</th>
              <th className="px-6 py-5">신청자</th>
              <th className="px-6 py-5 text-right">관리 액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hyundai-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-32"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-hyundai-emerald mx-auto"></div></td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-32 text-hyundai-gray-200 font-black uppercase tracking-[0.3em]">검색 결과가 없습니다</td></tr>
            ) : (
              requests.map(req => (
                <tr key={req.id} className={`hover:bg-hyundai-gray-50/50 transition-colors ${selectedIds.includes(req.id) ? 'bg-hyundai-emerald/[0.03]' : ''}`}>
                  <td className="px-6 py-5">
                    <input 
                      type="checkbox" 
                      className="rounded border-hyundai-gray-200 text-hyundai-emerald focus:ring-hyundai-emerald/20"
                      checked={selectedIds.includes(req.id)}
                      onChange={(e) => {
                        if(e.target.checked) setSelectedIds([...selectedIds, req.id]);
                        else setSelectedIds(selectedIds.filter(id => id !== req.id));
                      }}
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <p className="font-black text-hyundai-black text-base tracking-tight leading-tight">{req.title}</p>
                      <p className="text-sm font-bold text-hyundai-gray-400">{req.artist}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {req.youtube_url && (
                          <a href={req.youtube_url} target="_blank" className="text-hyundai-gray-300 hover:text-red-600 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg></a>
                        )}
                        {req.group_count > 1 && (
                          <span className="text-[9px] font-black bg-hyundai-black text-white px-2 py-0.5 rounded-full uppercase">중복 그룹 ({req.group_count})</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-start gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${recommendationBadges[req.auto_recommendation as keyof typeof recommendationBadges] || 'bg-gray-100'}`}>
                        {getBadgeLabel(req.auto_recommendation)}
                      </span>
                      <p className="text-[10px] text-hyundai-gray-400 font-bold leading-tight">{req.auto_reason}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs">
                    <p className="font-black text-hyundai-black">{req.requester_name}</p>
                    <p className="text-hyundai-gray-400 mt-0.5 font-bold uppercase tracking-tighter text-[9px]">{new Date(req.created_at).toLocaleDateString()} • {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setMemoOpen(req.id); setMemoText(req.admin_memo || ''); }} className="p-2 border border-hyundai-gray-100 rounded-xl hover:bg-hyundai-gray-100 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                      <button onClick={() => updateStatus(req.id, 'approved')} className="p-2 bg-hyundai-emerald/10 text-hyundai-emerald rounded-xl hover:bg-hyundai-emerald hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></button>
                      <button onClick={() => updateStatus(req.id, 'deleted')} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Memo Modal with Templates */}
      {memoOpen && (
        <div className="fixed inset-0 bg-hyundai-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-3xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-hyundai-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-black tracking-tight">심사 메모 및 템플릿</h3>
              <button onClick={() => setMemoOpen(null)} className="text-hyundai-gray-300 hover:text-hyundai-black"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            
            <div className="p-8 space-y-6">
              {templates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                   {templates.map(t => (
                     <button 
                       key={t.id} 
                       onClick={() => setMemoText(t.content)}
                       className="px-3 py-1.5 bg-hyundai-gray-100 hover:bg-hyundai-black hover:text-white text-[10px] font-black rounded-full transition-all uppercase tracking-tighter"
                     >
                       {t.title}
                     </button>
                   ))}
                </div>
              )}
              
              <textarea
                className="w-full px-6 py-5 bg-hyundai-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-hyundai-emerald/5 outline-none min-h-[160px] text-sm font-medium"
                placeholder="관리자 코멘트를 입력하세요..."
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
              />
            </div>

            <div className="p-8 bg-hyundai-gray-50 flex justify-end gap-4">
              <button 
                onClick={() => handleSaveMemo(memoOpen)}
                className="w-full py-4 bg-hyundai-black text-white font-black rounded-2xl hover:opacity-90 transition-all uppercase tracking-widest text-xs"
              >
                저장 및 적용
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
