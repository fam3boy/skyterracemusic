'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Music, CheckCircle, AlertCircle, Sparkles, ChevronRight, Disc, Clock, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function RequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    youtube_url: '',
    story: '',
    requester_name: '',
    requester_contact: '',
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [duplicateFound, setDuplicateFound] = useState(false);
  const [activeTheme, setActiveTheme] = useState<any>(null);

  // Search states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [showManualFields, setShowManualFields] = useState(false);

  const debouncedTitle = useDebounce(formData.title, 500);
  const debouncedArtist = useDebounce(formData.artist, 500);

  // Fetch active theme
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/themes');
        if (res.ok) {
          const active = await res.json();
          if (active) setActiveTheme(active);
        }
      } catch (e) {
        console.error('Failed to init themes', e);
      }
    }
    init();
  }, []);

  // Duplicate Check & Suggestions Logic
  useEffect(() => {
    if (debouncedTitle.length >= 2 || debouncedArtist.length >= 2) {
      fetchSuggestions(debouncedTitle || debouncedArtist);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    if (debouncedTitle.length >= 2 && debouncedArtist.length >= 2 && activeTheme) {
      checkDuplicate(debouncedTitle, debouncedArtist);
    } else {
      setDuplicateFound(false);
    }
  }, [debouncedTitle, debouncedArtist, activeTheme]);

  const fetchSuggestions = async (query: string) => {
    try {
      const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch (e) {
      console.error('Suggestions error', e);
    }
  };

  const checkDuplicate = async (title: string, artist: string) => {
    try {
      const res = await fetch(`/api/requests?theme_id=${activeTheme.id}&title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`);
      if (res.ok) {
        const data = await res.json();
        setDuplicateFound(data.isDuplicate);
      }
    } catch (e) {
      console.error('Duplicate check error', e);
    }
  };

  const selectSuggestion = (s: any) => {
    setFormData(prev => ({ ...prev, title: s.title, artist: s.artist }));
    setShowSuggestions(false);
    setShowManualFields(true);
  };

  const handleMusicSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword) return;
    setSearching(true);
    setSearchError(null);
    setSearchResults([]); 
    setHasSearched(true);
    try {
      const res = await fetch(`/api/music-search?keyword=${encodeURIComponent(searchKeyword)}`);
      if (res.ok) {
        setSearchResults(await res.json());
      } else {
        const data = await res.json();
        setSearchError(data.error || '검색 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setSearchError('네트워크 오류가 발생했습니다.');
    } finally {
      setSearching(false);
    }
  };

  const selectMusicResult = (result: any) => {
    setFormData(prev => ({
      ...prev,
      title: result.title,
      artist: result.artist
    }));
    setSearchResults([]);
    setSearchKeyword('');
    setSearchError(null);
    setHasSearched(false);
    setShowManualFields(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Final Validation
    if (!formData.title) {
      setError('곡명을 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      router.push(`/status/${data.id}?new=true`);
    } catch (err: any) {
      setError('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-40">
      {/* 1. Header */}
      <div className="border-b border-hyundai-gray-100 bg-white text-hyundai-black">
        <div className="portal-container">
            <div className="h-14 flex items-center gap-4 text-[11px] font-black uppercase tracking-widest">
               <Link href="/" className="hover:text-hyundai-gold transition-colors">디지털 포털</Link>
               <span className="w-1.5 h-px bg-hyundai-gray-200"></span>
               <span className="">음악 신청 센터</span>
            </div>
        </div>
      </div>

      <div className="portal-container pt-24 md:pt-32">
        {/* 2. Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-16 border-b-4 border-hyundai-black pb-16 mb-24">
           <div className="space-y-6 max-w-3xl">
              <div className="space-y-4">
                 <span className="text-hyundai-gold text-sm font-black tracking-[0.4em] uppercase block">신청 서비스 등록</span>
                 <h1 className="text-5xl md:text-8xl font-black text-hyundai-black tracking-[-0.04em] leading-[0.9] uppercase">스카이테라스 <br />음악 신청 <br />데스크</h1>
              </div>
              <p className="text-lg md:text-xl font-medium text-hyundai-gray-500 leading-relaxed">함께 나누고 싶은 고품격 아울렛의 감성, 당신의 노래를 들려주세요. <br className="hidden md:block" />현대백화점 대전점 스카이테라스의 소리를 당신이 채웁니다.</p>
           </div>
           
           <div className="flex flex-col gap-6 w-full md:w-auto">
              <div className="bg-hyundai-gray-50 p-8 border border-hyundai-gray-100 space-y-4">
                 <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-hyundai-gold" />
                    <span className="text-xs font-black uppercase tracking-widest text-hyundai-black">정기 심사 및 방송 안내</span>
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-bold text-hyundai-black">매주 목요일 19:00</p>
                    <p className="text-xs font-medium text-hyundai-gray-400">일괄 검토 및 승인 상태 업데이트</p>
                 </div>
              </div>
              <div className="bg-hyundai-black p-8 text-white space-y-1">
                 <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">진행 중인 테마</p>
                 <p className="text-lg font-black uppercase tracking-tight">{activeTheme ? activeTheme.title : "일반 선곡 리스트"}</p>
              </div>
           </div>
        </div>

        {/* 3. Operational Form */}
        <div className="max-w-6xl mx-auto">
           <form onSubmit={handleSubmit} className="space-y-32">
              {error && (
                <div className="p-10 bg-red-50 border-l-8 border-red-600 flex items-center gap-6 text-red-600">
                  <AlertCircle className="w-8 h-8 shrink-0" />
                  <p className="text-lg font-black uppercase tracking-tight leading-none">{error}</p>
                </div>
              )}

              {/* Step 01: Integrated Search Flow */}
              <div className="space-y-16">
                 <div className="space-y-4">
                    <span className="text-3xl font-black text-hyundai-gray-200 uppercase tracking-tighter block italic">01/곡 정보 입력</span>
                    <h3 className="text-4xl font-black text-hyundai-black uppercase tracking-tight">신청 곡 통합 검색</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-12 bg-hyundai-gray-50/50 p-10 md:p-16 border-y border-hyundai-gray-100">
                    <div className="space-y-12">
                        {/* Selected Track Card (Always visible if data exists) */}
                        {formData.title && !showManualFields && (
                          <div className="p-10 bg-white border-2 border-hyundai-emerald shadow-xl animate-in fade-in slide-in-from-left-8 duration-500">
                             <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="w-32 h-32 bg-hyundai-emerald/5 shrink-0 border border-hyundai-emerald/10 flex items-center justify-center overflow-hidden">
                                   <Disc className="w-16 h-16 text-hyundai-emerald animate-[spin_8s_linear_infinite]" />
                                </div>
                                <div className="flex-grow space-y-2 text-center md:text-left min-w-0">
                                   <div className="flex items-center justify-center md:justify-start gap-3">
                                      <CheckCircle className="w-5 h-5 text-hyundai-emerald" />
                                      <span className="text-xs font-black text-hyundai-emerald uppercase tracking-[0.3em]">최종 선택된 곡</span>
                                   </div>
                                   <h4 className="text-4xl font-black text-hyundai-black uppercase tracking-tight leading-none truncate">{formData.title}</h4>
                                   <p className="text-xl font-bold text-hyundai-gray-400 uppercase tracking-widest truncate">{formData.artist}</p>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, title: '', artist: '' }));
                                    setHasSearched(false);
                                  }}
                                  className="px-10 h-16 border-2 border-hyundai-black text-sm font-black uppercase tracking-widest hover:bg-hyundai-black hover:text-white transition-all"
                                >
                                  다른 곡 검색
                                </button>
                             </div>
                          </div>
                        )}

                        {/* Direct Search Input */}
                        {(!formData.title || showManualFields) && (
                          <div className="space-y-8">
                             <div className="flex flex-col gap-6">
                                <div className="relative group">
                                   <div className="absolute left-10 top-1/2 -translate-y-1/2">
                                      <Search className="w-8 h-8 text-hyundai-gray-200 group-focus-within:text-hyundai-black transition-colors" />
                                   </div>
                                   <input 
                                     type="text" 
                                     placeholder="아티스트 또는 곡명으로 검색해 보세요" 
                                     className="w-full h-28 pl-24 pr-40 bg-white border-2 border-hyundai-gray-100 text-2xl font-black uppercase outline-none focus:border-hyundai-black focus:ring-8 focus:ring-hyundai-black/5 transition-all shadow-sm"
                                     value={searchKeyword}
                                     onChange={(e) => setSearchKeyword(e.target.value)}
                                     onKeyDown={(e) => e.key === 'Enter' && handleMusicSearch(e)}
                                   />
                                   <button 
                                     type="button"
                                     onClick={handleMusicSearch}
                                     disabled={searching || !searchKeyword}
                                     className="absolute right-4 top-4 bottom-4 px-12 bg-hyundai-black text-white text-lg font-black uppercase hover:bg-hyundai-gray-800 transition-all disabled:opacity-20"
                                   >
                                      {searching ? '조회 중' : '검색'}
                                   </button>
                                </div>
                                
                                <p className="text-sm font-bold text-hyundai-gray-400 uppercase tracking-widest px-2 italic">
                                  최신 가요부터 클래식까지 통합 데이터베이스에서 조회합니다.
                                </p>
                             </div>

                             {/* Search Results Display (Inline) */}
                             {(searchResults.length > 0 || searching) && (
                               <div className="bg-white border-2 border-hyundai-black shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                                  <div className="max-h-[500px] overflow-y-auto scrollbar-hide divide-y divide-hyundai-gray-50">
                                     {searching ? (
                                       <div className="py-32 flex flex-col items-center justify-center gap-6 text-hyundai-gray-400">
                                          <div className="w-16 h-16 border-4 border-hyundai-gray-100 border-t-hyundai-gold rounded-full animate-spin"></div>
                                          <p className="font-black uppercase tracking-[0.2em]">데이터베이스 통신 중...</p>
                                       </div>
                                     ) : (
                                       searchResults.map((result, i) => (
                                         <button 
                                           key={i} 
                                           type="button"
                                           onClick={() => selectMusicResult(result)}
                                           className="w-full flex items-center gap-8 p-10 text-left hover:bg-hyundai-gray-50 transition-all group border-l-8 border-transparent hover:border-hyundai-black"
                                         >
                                            <div className="w-24 h-24 bg-hyundai-gray-100 shrink-0 overflow-hidden relative border border-hyundai-gray-50">
                                               {result.image ? <img src={result.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <Music className="w-full h-full p-8 text-hyundai-gray-300" />}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                               <p className="font-black text-hyundai-black text-3xl uppercase truncate tracking-tight">{result.title}</p>
                                               <p className="text-lg font-bold text-hyundai-gray-400 truncate uppercase mt-1 tracking-widest">{result.artist}</p>
                                            </div>
                                            <div className="w-14 h-14 rounded-full border-2 border-hyundai-gray-100 flex items-center justify-center group-hover:bg-hyundai-black group-hover:border-hyundai-black transition-all">
                                               <ChevronRight className="w-8 h-8 text-hyundai-gray-200 group-hover:text-white" />
                                            </div>
                                         </button>
                                       ))
                                     )}
                                  </div>
                               </div>
                             )}

                             {/* No Results Fallback */}
                             {hasSearched && searchResults.length === 0 && !searching && (
                               <div className="p-12 bg-hyundai-gray-50 border-2 border-dashed border-hyundai-gray-200 text-center space-y-6">
                                  <p className="text-xl font-bold text-hyundai-gray-400 uppercase tracking-tight">검색 결과가 없습니다.</p>
                                  <button 
                                    type="button"
                                    onClick={() => { setShowManualFields(true); setHasSearched(false); }}
                                    className="px-12 h-20 bg-white border-2 border-hyundai-black text-hyundai-black text-lg font-black uppercase tracking-widest hover:bg-hyundai-black hover:text-white transition-all shadow-lg"
                                  >
                                    직접 정보 입력하여 신청하기
                                  </button>
                               </div>
                             )}

                             {/* Silent Manual Trigger */}
                             {!hasSearched && !searching && searchResults.length === 0 && (
                               <div className="pt-4 flex justify-center">
                                  <button 
                                    type="button" 
                                    onClick={() => setShowManualFields(!showManualFields)}
                                    className="text-[11px] font-black text-hyundai-gray-300 hover:text-hyundai-black uppercase tracking-[0.3em] transition-colors border-b border-hyundai-gray-100 pb-1"
                                  >
                                    원하는 결과가 없나요? {showManualFields ? '검색으로 돌아가기' : '직접 입력하기'}
                                  </button>
                               </div>
                             )}
                          </div>
                        )}

                        {/* Manual Form Area (Visible when direct entry is selected) */}
                        {showManualFields && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t-2 border-hyundai-black pt-16 animate-in slide-in-from-bottom-8 duration-700">
                             <div className="space-y-4 relative">
                                <label className="text-sm font-black text-hyundai-gray-400 uppercase tracking-[0.3em]">곡 제목</label>
                                <input 
                                  type="text" 
                                  required
                                  placeholder="곡 제목을 정확히 입력해 주세요"
                                  className="w-full h-24 bg-white border-none px-10 text-2xl font-black uppercase tracking-tight focus:ring-8 focus:ring-hyundai-black/5 transition-all outline-none shadow-sm"
                                  value={formData.title}
                                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                                  onFocus={() => setShowSuggestions(suggestions.length > 0)}
                                />
                                {showSuggestions && (
                                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white shadow-3xl border-2 border-hyundai-black z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                                     <div className="divide-y divide-hyundai-gray-50">
                                       {suggestions.map((s, i) => (
                                         <button 
                                           key={i} 
                                           type="button"
                                           onClick={() => selectSuggestion(s)}
                                           className="w-full px-10 py-8 text-left hover:bg-hyundai-gray-50 transition-all flex flex-col gap-1"
                                         >
                                           <span className="text-2xl font-black text-hyundai-black uppercase tracking-tight">{s.title}</span>
                                           <span className="text-sm text-hyundai-gray-400 font-bold uppercase tracking-widest">{s.artist}</span>
                                         </button>
                                       ))}
                                     </div>
                                  </div>
                                )}
                             </div>
                             <div className="space-y-4">
                                <label className="text-sm font-black text-hyundai-gray-400 uppercase tracking-[0.3em]">아티스트명</label>
                                <input 
                                  type="text" 
                                  required
                                  placeholder="아티스트명을 입력해 주세요"
                                  className="w-full h-24 bg-white border-none px-10 text-2xl font-black uppercase tracking-tight focus:ring-8 focus:ring-hyundai-black/5 transition-all outline-none shadow-sm"
                                  value={formData.artist}
                                  onChange={(e) => setFormData({...formData, artist: e.target.value})}
                                />
                             </div>
                          </div>
                        )}
                    </div>
                 </div>

                 {duplicateFound && (
                   <div className="p-10 bg-hyundai-gold/5 border border-hyundai-gold/20 flex items-start gap-8">
                      <Sparkles className="w-8 h-8 text-hyundai-gold shrink-0 mt-1" />
                      <div>
                         <p className="text-xl font-black text-hyundai-gold uppercase tracking-tight">중복 신청 가능성 감지</p>
                         <p className="text-[13px] font-medium text-hyundai-gray-500 mt-2 leading-relaxed uppercase tracking-wider">이미 승인된 신청곡이거나, 다른 고객이 먼저 신청한 곡입니다.</p>
                      </div>
                   </div>
                 )}
              </div>

              {/* Step 02: Narrative */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 pt-24 border-t-2 border-hyundai-gray-100">
                  <div className="space-y-12">
                     <div className="space-y-4">
                        <span className="text-2xl font-black text-hyundai-gray-200 uppercase tracking-tighter block italic">02/신청 사연</span>
                        <h3 className="text-3xl font-black text-hyundai-black uppercase tracking-tight">선곡의 이유와 추억 (선택사항)</h3>
                     </div>
                     <textarea 
                       rows={8}
                       placeholder="심사 시 반영될 사연을 입력해 주세요. (선택)"
                       className="w-full bg-hyundai-gray-50 border-none px-10 py-10 text-lg font-bold leading-relaxed focus:bg-white focus:ring-4 focus:ring-hyundai-black/5 transition-all outline-none resize-none placeholder:text-hyundai-gray-200"
                       maxLength={200}
                       value={formData.story}
                       onChange={(e) => setFormData({...formData, story: e.target.value})}
                     />
                  </div>

                  <div className="space-y-12">
                     <div className="space-y-4">
                        <span className="text-2xl font-black text-hyundai-gray-200 uppercase tracking-tighter block italic">03/정보 확인</span>
                        <h3 className="text-3xl font-black text-hyundai-black uppercase tracking-tight">신청자 프로필 (선택사항)</h3>
                     </div>
                     <div className="space-y-10">
                        <input 
                          type="text" 
                          placeholder="성함 또는 닉네임 (선택)"
                          className="w-full h-20 bg-hyundai-gray-50 border-none px-8 text-xl font-black uppercase focus:ring-4 focus:ring-hyundai-black/5 outline-none transition-all"
                          value={formData.requester_name}
                          onChange={(e) => setFormData({...formData, requester_name: e.target.value})}
                        />
                        <input 
                          type="text" 
                          placeholder="연락처 (010-0000-0000) (선택)"
                          className="w-full h-20 bg-hyundai-gray-50 border-none px-8 text-xl font-black focus:ring-4 focus:ring-hyundai-black/5 outline-none transition-all"
                          value={formData.requester_contact}
                          onChange={(e) => setFormData({...formData, requester_contact: e.target.value})}
                        />
                     </div>
                  </div>
              </div>

              {/* Execution */}
              <div className="pt-32 border-t-8 border-hyundai-black flex flex-col items-center">
                 <button 
                   type="submit" 
                   disabled={loading}
                   className={cn(
                     "btn-portal-primary w-full h-32 text-3xl tracking-[0.4em] font-black group relative transform hover:-translate-y-2 active:translate-y-0 active:scale-95 duration-500 shadow-2xl shadow-hyundai-black/20",
                     loading && "opacity-50 cursor-not-allowed"
                   )}
                 >
                    {loading ? "전송 중..." : "신청서 전송하기"}
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
