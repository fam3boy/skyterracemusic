'use client';

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  MoreHorizontal, 
  Youtube, 
  Copy, 
  StickyNote,
  User,
  Trash2,
  Check,
  ChevronDown,
  ExternalLink,
  Music,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function RequestsManagementPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'hold' | 'deleted'>('all');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [memoOpen, setMemoOpen] = useState<string | null>(null);
  const [memoText, setMemoText] = useState('');
  
  // Reject Modal State
  const [rejectOpen, setRejectOpen] = useState<string | null>(null);
  const [rejectText, setRejectText] = useState('');
  
  // New States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isGrouped, setIsGrouped] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  // Music Search States
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchTargetId, setSearchTargetId] = useState<string | null>(null);

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
    
    if (status === 'rejected') {
      setRejectOpen('BULK');
      setRejectText('');
      return;
    }

    if (!confirm(`선택한 ${selectedIds.length}개의 항목을 ${status} 처리하시겠습니까?`)) return;
    executeBulkStatus(status);
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

  const handleClearContact = async (id: string) => {
    if (!confirm('이 신청자의 연락처 정보를 즉시 삭제하시겠습니까? (복구 불가)')) return;
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, clear_contact: true }),
      });

      if (res.ok) fetchRequests();
    } catch (err) {
      console.error('Failed to clear contact', err);
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

  const executeBulkStatus = async (status: string, memo?: string) => {
    try {
      const res = await fetch('/api/admin/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status, rejection_reason: memo }),
      });
      if (res.ok) {
        fetchRequests();
        setSelectedIds([]);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`일괄 처리 중 오류가 발생했습니다: ${errorData.error || '알 수 없는 서버 오류'}`);
      }
    } catch (err) {
      console.error('Failed to bulk update', err);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const handleProcessReject = async (target: string | null) => {
    if (!target) return;
    
    if (target === 'BULK') {
      await executeBulkStatus('rejected', rejectText);
      setRejectOpen(null);
      return;
    }

    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: target, status: 'rejected', rejection_reason: rejectText }),
      });

      if (res.ok) {
        fetchRequests();
        setRejectOpen(null);
        setSelectedIds(prev => prev.filter(id => id !== target));
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`반려 처리 중 오류가 발생했습니다: ${errorData.error || '알 수 없는 서버 오류'}`);
      }
    } catch (err) {
      console.error('Failed to reject', err);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const recommendationBadges = {
    APPROVE: 'bg-hyundai-emerald/10 text-hyundai-emerald border-hyundai-emerald/20',
    REVIEW: 'bg-blue-50 text-blue-600 border-blue-100',
    REVIEW_CAUTION: 'bg-hyundai-gold/10 text-hyundai-gold border-hyundai-gold/20',
    REJECT: 'bg-red-50 text-red-600 border-red-100',
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

  const getDaysLeft = (createdAt: string) => {
    const targetDate = new Date(new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
    const leftTime = targetDate.getTime() - new Date().getTime();
    return Math.ceil(leftTime / (1000 * 60 * 60 * 24));
  };

  const handleMusicSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/admin/music-search?keyword=${encodeURIComponent(searchKeyword)}`);
      if (res.ok) {
        setSearchResults(await res.json());
      } else {
        setSearchError('검색 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setSearchError('네트워크 오류가 발생했습니다.');
    } finally {
      setSearching(false);
    }
  };

  const selectMusicResult = async (result: any) => {
    if (!searchTargetId) return;
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: searchTargetId, 
          title: result.title, 
          artist: result.artist,
          image: result.image 
        }),
      });

      if (res.ok) {
        fetchRequests();
        setSearchOpen(false);
        setSearchTargetId(null);
      }
    } catch (err) {
      console.error('Failed to update music info', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        {/* Top Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold text-hyundai-black tracking-tighter uppercase font-sans">
               신청 곡 처리 센터
            </h2>
            <p className="text-[12px] font-bold text-hyundai-gray-400 mt-1 uppercase tracking-normal">데이터 검증 및 처리 작업 대기열</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setIsGrouped(!isGrouped)}
              className={cn(
                 "h-12 px-8 text-[14px] font-bold uppercase tracking-tight border transition-all",
                 isGrouped ? "bg-hyundai-black text-white border-hyundai-black" : "bg-white text-hyundai-black border-hyundai-gray-200 hover:bg-hyundai-gray-50"
              )}
            >
              {isGrouped ? '그룹화 보기 해제' : '동일 곡 그룹화 보기'}
            </button>
            
            <div className="flex bg-white h-12 border border-hyundai-gray-200 p-1 shrink-0">
              {[
                { id: 'all', label: '전체' },
                { id: 'pending', label: '대기' },
                { id: 'approved', label: '승인' },
                { id: 'rejected', label: '반려' },
                { id: 'deleted', label: '삭제' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={cn(
                    "px-6 h-full text-[12px] font-bold tracking-tight transition-all uppercase",
                    filter === f.id ? "bg-hyundai-gold text-hyundai-black" : "text-hyundai-gray-400 hover:text-hyundai-black"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bulk Action Strip */}
        {selectedIds.length > 0 && (
          <div className="sticky top-0 z-[60] bg-hyundai-black text-white px-8 py-4 flex items-center justify-between shadow-2xl animate-in slide-in-from-top-4">
             <div className="flex items-center gap-10">
                <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-hyundai-gold animate-pulse"></div>
                   <span className="text-[14px] font-bold tracking-tight uppercase">{selectedIds.length}건 선택됨</span>
                </div>
                <div className="h-6 w-px bg-white/20"></div>
                <div className="flex gap-3">
                   <button onClick={() => handleBulkStatus('approved')} className="h-10 px-6 bg-hyundai-emerald hover:bg-hyundai-emerald/80 text-[12px] font-bold uppercase tracking-tight transition-colors">일괄 승인</button>
                   <button onClick={() => handleBulkStatus('rejected')} className="h-10 px-6 bg-orange-600 hover:bg-orange-600/80 text-[12px] font-bold uppercase tracking-tight transition-colors">일괄 반려</button>
                   <button onClick={() => handleBulkStatus('deleted')} className="h-10 px-6 bg-red-600 hover:bg-red-600/80 text-[12px] font-bold uppercase tracking-tight transition-colors">일괄 삭제 / 폐기</button>
                </div>
             </div>
             <button onClick={() => setSelectedIds([])} className="text-[12px] font-bold text-hyundai-gray-400 hover:text-white uppercase tracking-tight transition-colors">선택 해제</button>
          </div>
        )}

        {/* Filter Terminal */}
        <div className="bg-white border border-hyundai-gray-200 p-6 flex flex-wrap items-center gap-6">
          <div className="flex-1 relative min-w-[300px]">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-hyundai-gray-300" />
             <input 
               type="text" 
               placeholder="제목, 아티스트, 또는 신청자명으로 검색..." 
               className="w-full bg-hyundai-gray-50 border-none px-12 py-4 text-[14px] font-bold uppercase tracking-tight focus:ring-1 focus:ring-hyundai-black/5 outline-none"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
          <div className="flex items-center gap-2 bg-hyundai-gray-50 p-1 border border-transparent focus-within:border-hyundai-gray-200 transition-all">
             <Calendar className="w-4 h-4 text-hyundai-gray-300 ml-3" />
             <input 
               type="date" 
               className="bg-transparent border-none text-[12px] font-bold p-2 outline-none uppercase focus:ring-0"
               value={startDate}
               onChange={(e) => setStartDate(e.target.value)}
             />
             <span className="text-hyundai-gray-200 text-sm">/</span>
             <input 
               type="date" 
               className="bg-transparent border-none text-[12px] font-bold p-2 outline-none uppercase focus:ring-0"
               value={endDate}
               onChange={(e) => setEndDate(e.target.value)}
             />
          </div>
        </div>

        {/* Main Table Container */}
        <div className="bg-white border border-hyundai-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-hyundai-gray-50 border-b border-hyundai-gray-200">
                <th className="px-6 py-4 w-12">
                  <div className="flex items-center justify-center">
                     <input 
                       type="checkbox" 
                       className="w-4 h-4 rounded-none border-hyundai-gray-300 text-hyundai-black focus:ring-0"
                       onChange={(e) => {
                         if(e.target.checked) setSelectedIds(requests.map(r => r.id));
                         else setSelectedIds([]);
                       }}
                       checked={requests.length > 0 && selectedIds.length === requests.length}
                     />
                  </div>
                </th>
                <th className="px-8 py-6 text-[12px] uppercase font-bold tracking-tight text-hyundai-gray-400">곡 상세 정보</th>
                <th className="px-8 py-6 text-[12px] uppercase font-bold tracking-tight text-hyundai-gray-400">신청자 프로필</th>
                <th className="px-8 py-6 text-[12px] uppercase font-bold tracking-tight text-hyundai-gray-400 text-right">처리 및 상태 제어</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hyundai-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="py-40 text-center"><div className="animate-spin h-8 w-8 border-t-2 border-hyundai-black rounded-full mx-auto"></div></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={5} className="py-40 text-center text-sm font-bold text-hyundai-gray-300 uppercase tracking-widest">일치하는 신청 내역이 데이터베이스에 존재하지 않습니다</td></tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} className={cn(
                    "group transition-all hover:bg-hyundai-gray-50/50",
                    selectedIds.includes(req.id) ? "bg-hyundai-gold/5" : ""
                  )}>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                         <input 
                           type="checkbox" 
                           className="w-4 h-4 rounded-none border-hyundai-gray-300 text-hyundai-black focus:ring-0"
                           checked={selectedIds.includes(req.id)}
                           onChange={(e) => {
                             if(e.target.checked) setSelectedIds([...selectedIds, req.id]);
                             else setSelectedIds(selectedIds.filter(id => id !== req.id));
                           }}
                         />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-5">
                         <div className="w-10 h-10 bg-hyundai-gray-50 flex items-center justify-center text-hyundai-gray-300 group-hover:bg-white group-hover:text-hyundai-black transition-colors border border-transparent group-hover:border-hyundai-gray-200 overflow-hidden">
                            {req.image ? (
                              <img src={req.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Music className="w-5 h-5" />
                            )}
                         </div>
                         <div className="flex flex-col gap-1 min-w-0">
                            <p className="font-bold text-hyundai-black text-[16px] uppercase tracking-tight truncate max-w-[300px]">{req.title}</p>
                            <p className="text-[13px] font-bold text-hyundai-gray-400 uppercase tracking-tight">{req.artist}</p>
                            <div className="flex items-center gap-4 mt-2">
                               {req.youtube_url && (
                                 <a href={req.youtube_url} target="_blank" className="flex items-center gap-1.5 text-[10px] font-bold text-hyundai-gray-300 hover:text-red-600 uppercase transition-colors">
                                    <Youtube className="w-4 h-4" /> 미디어 링크
                                 </a>
                               )}
                               {req.group_count > 1 && (
                                 <span className="text-[10px] font-bold bg-hyundai-black text-white px-2.5 py-1 uppercase tracking-tight">중복 신청 ({req.group_count}건)</span>
                               )}
                            </div>
                         </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                         <div className="flex items-center gap-2 mb-1.5">
                            <User className="w-3.5 h-3.5 text-hyundai-gray-300" />
                            <p className="text-sm font-bold text-hyundai-black uppercase">{req.requester_name}</p>
                         </div>
                         {req.requester_contact && (
                           <div className="flex items-center gap-2 mb-1.5 pl-5 group/contact">
                              <p className="text-[12px] font-bold text-hyundai-gray-500 tracking-tight">
                                {req.requester_contact}
                                <span className="ml-2 text-[10px] text-red-400 font-medium tracking-normal">
                                  ({getDaysLeft(req.created_at) > 0 ? `${getDaysLeft(req.created_at)}일 뒤 자동 삭제` : '오늘 자정 삭제 예정'})
                                </span>
                              </p>
                              <button 
                                 onClick={() => handleClearContact(req.id)}
                                 className="p-1 opacity-0 group-hover/contact:opacity-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded transition-all"
                                 title="연락처 즉시 삭제"
                              >
                                 <Trash2 className="w-3 h-3" />
                              </button>
                           </div>
                         )}
                         <p className="text-hyundai-gray-400 font-bold uppercase tracking-tight text-[11px] pl-5">
                            {new Date(req.created_at).toLocaleDateString()} • {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                          {req.status === 'pending' && <span className="text-[10px] font-bold bg-hyundai-gray-100 text-hyundai-gray-500 px-2 py-1 uppercase tracking-tight">대기 중</span>}
                          {req.status === 'approved' && <span className="text-[10px] font-bold bg-hyundai-emerald text-white px-2 py-1 uppercase tracking-tight">승인 완료</span>}
                          {req.status === 'rejected' && <span className="text-[10px] font-bold bg-orange-600 text-white px-2 py-1 uppercase tracking-tight">반려됨</span>}
                          {req.status === 'deleted' && <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-1 uppercase tracking-tight">삭제됨</span>}
                        </div>
                        
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => { setMemoOpen(req.id); setMemoText(req.admin_memo || ''); }} 
                            className="h-8 px-2 flex items-center gap-1 bg-white border border-hyundai-gray-200 text-hyundai-gray-400 hover:text-hyundai-black hover:border-hyundai-black transition-all text-[10px] font-bold uppercase"
                          >
                             <StickyNote className="w-3 h-3" /> 메모
                          </button>
                          
                          {req.status !== 'approved' && (
                            <button 
                              onClick={() => updateStatus(req.id, 'approved')} 
                              className="h-8 px-3 flex items-center gap-1 bg-hyundai-emerald text-white hover:bg-hyundai-emerald/80 transition-all text-[10px] font-bold uppercase"
                            >
                               <Check className="w-3 h-3" /> 승인
                            </button>
                          )}
                          
                          {req.status !== 'rejected' && req.status !== 'deleted' && (
                            <button 
                              onClick={() => { setRejectOpen(req.id); setRejectText(req.rejection_reason || ''); }} 
                              className="h-8 px-3 flex items-center gap-1 bg-orange-600 text-white hover:bg-orange-700 transition-all text-[10px] font-bold uppercase"
                            >
                               <XCircle className="w-3 h-3" /> 반려
                            </button>
                          )}
                          
                          {req.status !== 'deleted' && (
                            <button 
                              onClick={() => updateStatus(req.id, 'deleted')} 
                              className="h-8 px-3 flex items-center gap-1 bg-red-600 text-white hover:bg-red-700 transition-all text-[10px] font-bold uppercase"
                            >
                               <Trash2 className="w-3 h-3" /> 삭제
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Memo Overlay */}
        {memoOpen && (
          <div className="fixed inset-0 bg-hyundai-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
            <div className="bg-white border border-hyundai-gray-200 w-full max-w-xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b border-hyundai-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-hyundai-black">검사 인텔리전스</h3>
                  <p className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-tight mt-1">운영 메모 및 응대 템플릿</p>
                </div>
                <button onClick={() => setMemoOpen(null)} className="h-10 w-10 flex items-center justify-center hover:bg-hyundai-gray-50 transition-colors">
                  <XCircle className="w-6 h-6 text-hyundai-gray-300" />
                </button>
              </div>
              
              <div className="p-10 space-y-8">
                {templates.length > 0 && (
                  <div className="space-y-4">
                     <p className="text-[11px] font-bold text-hyundai-gray-300 uppercase tracking-widest">사용 가능한 템플릿</p>
                     <div className="flex flex-wrap gap-3">
                        {templates.map(t => (
                          <button 
                            key={t.id} 
                            onClick={() => setMemoText(t.content)}
                            className="px-5 py-3 border border-hyundai-gray-200 hover:border-hyundai-black text-[12px] font-bold uppercase tracking-tight transition-all"
                          >
                            {t.title}
                          </button>
                        ))}
                     </div>
                  </div>
                )}
                
                <div className="space-y-4">
                   <p className="text-[11px] font-bold text-hyundai-gray-300 uppercase tracking-widest">내부 운영 메모 / 피드백</p>
                   <textarea
                     className="w-full px-8 py-6 bg-hyundai-gray-50 border-none outline-none min-h-[180px] text-xs font-bold leading-relaxed focus:bg-white focus:ring-1 focus:ring-hyundai-black transition-all"
                     placeholder="이 기록에 대한 관리자 노트를 입력하십시오..."
                     value={memoText}
                     onChange={(e) => setMemoText(e.target.value)}
                   />
                </div>
              </div>

              <div className="px-10 py-8 bg-hyundai-gray-50 border-t border-hyundai-gray-100 flex justify-end gap-3">
                <button 
                   onClick={() => setMemoOpen(null)}
                   className="px-8 py-4 text-[12px] font-bold uppercase tracking-widest text-hyundai-gray-400 hover:text-hyundai-black transition-colors"
                >
                   취소
                </button>
                <button 
                  onClick={() => handleSaveMemo(memoOpen)}
                  className="px-10 py-4 bg-hyundai-black text-white text-[14px] font-bold uppercase tracking-tight hover:bg-hyundai-gold hover:text-hyundai-black transition-all"
                >
                  변경 사항 확정
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Music Search / Correction Modal */}
        {searchOpen && (
          <div className="fixed inset-0 bg-hyundai-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
            <div className="bg-white border border-hyundai-gray-200 w-full max-w-2xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
              <div className="px-10 py-8 border-b border-hyundai-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-hyundai-black">곡 정보 검색 및 수정</h3>
                  <p className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-tight mt-1">Maniadb 데이터 기반 정보 자동 완성</p>
                </div>
                <button onClick={() => setSearchOpen(false)} className="h-10 w-10 flex items-center justify-center hover:bg-hyundai-gray-50 transition-colors">
                  <X className="w-6 h-6 text-hyundai-gray-300" />
                </button>
              </div>
              
              <div className="p-10 space-y-8 flex flex-col min-h-0">
                 <form onSubmit={handleMusicSearch} className="flex gap-2">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="아티스트 또는 곡명..." 
                      className="flex-grow px-8 py-5 bg-hyundai-gray-50 border-none outline-none text-sm font-bold uppercase tracking-tight focus:bg-white focus:ring-1 focus:ring-hyundai-black transition-all"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                    <button type="submit" disabled={searching} className="px-8 bg-hyundai-black text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-hyundai-gold hover:text-hyundai-black transition-all">
                      {searching ? '검색 중...' : '검색'}
                    </button>
                 </form>

                 {searchError && (
                   <div className="p-4 bg-red-50 border border-red-100 rounded flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-tight">
                      <AlertCircle className="w-4 h-4" />
                      {searchError}
                   </div>
                 )}

                 <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar min-h-[300px]">
                    {searchResults.length === 0 && !searching && !searchError && (
                      <div className="py-20 text-center text-hyundai-gray-200 font-bold uppercase tracking-widest text-[11px] italic">검색 결과가 없습니다</div>
                    )}
                    {searchResults.map((result, i) => (
                      <button 
                        key={i} 
                        onClick={() => selectMusicResult(result)}
                        className="w-full flex items-center gap-5 p-4 text-left hover:bg-hyundai-gray-50 transition-all border border-transparent hover:border-hyundai-gray-100 group"
                      >
                         <div className="w-12 h-12 bg-hyundai-gray-100 shrink-0 overflow-hidden">
                            {result.image ? <img src={result.image} alt="" className="w-full h-full object-cover" /> : <Music className="w-full h-full p-3 text-hyundai-gray-300" />}
                         </div>
                         <div className="flex-grow min-w-0">
                            <p className="font-bold text-hyundai-black text-sm uppercase tracking-tight truncate group-hover:text-hyundai-gold transition-colors">{result.title}</p>
                            <p className="text-[11px] font-bold text-hyundai-gray-400 truncate uppercase mt-0.5 tracking-tight">{result.artist} • {result.album}</p>
                         </div>
                         <CheckCircle2 className="w-5 h-5 text-hyundai-emerald opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Overlay */}
        {rejectOpen && (
          <div className="fixed inset-0 bg-hyundai-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
            <div className="bg-white border border-hyundai-gray-200 w-full max-w-xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b border-hyundai-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-red-600">신청 반려 처리</h3>
                  <p className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-tight mt-1">반려 사유를 선택하거나 직접 입력하세요</p>
                </div>
                <button onClick={() => setRejectOpen(null)} className="h-10 w-10 flex items-center justify-center hover:bg-hyundai-gray-50 transition-colors">
                  <XCircle className="w-6 h-6 text-hyundai-gray-300" />
                </button>
              </div>
              
              <div className="p-10 space-y-8">
                {templates.filter(t => t.type === 'REJECT' || t.type === 'HOLD').length > 0 && (
                  <div className="space-y-4">
                     <p className="text-[11px] font-bold text-hyundai-gray-300 uppercase tracking-widest">반려 템플릿 선택</p>
                     <div className="flex flex-wrap gap-3">
                        {templates.filter(t => t.type === 'REJECT' || t.type === 'HOLD').map(t => (
                          <button 
                            key={t.id} 
                            onClick={() => setRejectText(t.content)}
                            className="px-5 py-3 border border-orange-200 hover:border-orange-500 hover:bg-orange-50 text-[12px] font-bold text-orange-700 uppercase tracking-tight transition-all"
                          >
                            {t.title}
                          </button>
                        ))}
                     </div>
                  </div>
                )}
                
                <div className="space-y-4">
                   <p className="text-[11px] font-bold text-hyundai-gray-300 uppercase tracking-widest">상세 반려 사유 입력</p>
                   <textarea
                     className="w-full px-8 py-6 bg-hyundai-gray-50 border-none outline-none min-h-[180px] text-xs font-bold leading-relaxed focus:bg-white focus:ring-1 focus:ring-hyundai-black transition-all"
                     placeholder="반려 사유를 입력하십시오. 선택하신 템플릿 내용이 여기에 반영되며 수정 가능합니다."
                     value={rejectText}
                     onChange={(e) => setRejectText(e.target.value)}
                   />
                </div>
              </div>

              <div className="px-10 py-8 bg-hyundai-gray-50 border-t border-hyundai-gray-100 flex justify-end gap-3">
                <button 
                   onClick={() => setRejectOpen(null)}
                   className="px-8 py-4 text-[12px] font-bold uppercase tracking-widest text-hyundai-gray-400 hover:text-hyundai-black transition-colors"
                >
                   취소
                </button>
                <button 
                  onClick={() => handleProcessReject(rejectOpen)}
                  className="px-10 py-4 bg-orange-600 text-white text-[14px] font-bold uppercase tracking-tight hover:bg-orange-700 transition-all"
                >
                  최종 반려 처리
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
