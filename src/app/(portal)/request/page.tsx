'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { isValidYouTubeUrl } from '@/utils/youtube';
import { useRouter } from 'next/navigation';
import { Search, Youtube, Music, User, Send, CheckCircle, Copy, ArrowLeft, AlertCircle, Sparkles, ChevronRight, Info, Disc, Clock, X } from 'lucide-react';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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
  };

  const handleYoutubeBlur = async (url: string) => {
    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) return;
    
    try {
      const res = await fetch(`/api/youtube-metadata?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          title: prev.title || data.title,
          artist: prev.artist || data.author || ''
        }));
      }
    } catch (err) {
      console.error('Youtube metadata fetch failed', err);
    }
  };

  const handleMusicSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/music-search?keyword=${encodeURIComponent(searchKeyword)}`);
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

  const selectMusicResult = (result: any) => {
    setFormData(prev => ({
      ...prev,
      title: result.title,
      artist: result.artist
    }));
    setSearchOpen(false);
    setSearchResults([]);
    setSearchKeyword('');
    setSearchError(null);
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
            <div className="h-14 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
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
                 <span className="text-hyundai-gold text-[12px] font-black tracking-[0.4em] uppercase block">신청 서비스 등록</span>
                 <h1 className="text-5xl md:text-8xl font-black text-hyundai-black tracking-[-0.04em] leading-[0.9] uppercase">스카이테라스 <br />음악 신청 <br />데스크</h1>
              </div>
              <p className="text-lg md:text-xl font-medium text-hyundai-gray-500 leading-relaxed">함께 나누고 싶은 고품격 아울렛의 감성, 당신의 노래를 들려주세요. <br className="hidden md:block" />현대백화점 대전점 스카이테라스의 소리를 당신이 채웁니다.</p>
           </div>
           
           <div className="flex flex-col gap-6 w-full md:w-auto">
              <div className="bg-hyundai-gray-50 p-8 border border-hyundai-gray-100 space-y-4">
                 <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-hyundai-gold" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-hyundai-black">정기 심사 및 방송 안내</span>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[13px] font-bold text-hyundai-black">매주 목요일 19:00</p>
                    <p className="text-[11px] font-medium text-hyundai-gray-400">일괄 검토 및 승인 상태 업데이트</p>
                 </div>
              </div>
              <div className="bg-hyundai-black p-8 text-white space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">진행 중인 테마</p>
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

              {/* Step 01: Unified Track Identity */}
              <div className="space-y-16">
                 <div className="space-y-4">
                    <span className="text-3xl font-black text-hyundai-gray-200 uppercase tracking-tighter block italic">01/곡 정보 입력</span>
                    <h3 className="text-4xl font-black text-hyundai-black uppercase tracking-tight">선택 음원 통합 검색</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-12 bg-hyundai-gray-50/50 p-10 md:p-16 border border-hyundai-gray-100">
                    <div className="space-y-6">
                        <div className="space-y-4">
                           <div className="flex justify-between items-end">
                              <label className="text-[11px] font-black text-hyundai-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Youtube className="w-4 h-4 text-red-600" />
                                Youtube 링크 <span className="text-[9px] font-bold opacity-50">(자동 입력 지원)</span>
                              </label>
                           </div>
                          <div className="relative">
                             <input 
                               type="url" 
                               placeholder="HTTPS://WWW.YOUTUBE.COM/WATCH?V=..."
                               className="w-full h-24 bg-white border-none px-10 text-xl font-black uppercase tracking-tight focus:ring-4 focus:ring-hyundai-black/5 transition-all outline-none placeholder:text-hyundai-gray-200 shadow-sm"
                               value={formData.youtube_url}
                               onBlur={(e) => handleYoutubeBlur(e.target.value)}
                               onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                             />
                             <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-hyundai-gold animate-pulse" />
                             </div>
                          </div>
                          <p className="text-[11px] text-hyundai-gray-400 font-medium leading-relaxed uppercase tracking-wider italic">
                            유튜브 링크를 붙여넣으시면 곡 제목과 아티스트 정보가 자동으로 채워집니다.
                          </p>
                       </div>
                    </div>

                    <div className="flex items-center gap-8 py-4">
                       <span className="h-px bg-hyundai-gray-200 flex-grow"></span>
                       <span className="text-[10px] font-black text-hyundai-gray-300 uppercase tracking-[0.4em]">고정 곡 정보</span>
                       <span className="h-px bg-hyundai-gray-200 flex-grow"></span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4 relative">
                           <div className="flex justify-between items-end">
                              <label className="text-[11px] font-black text-hyundai-gray-400 uppercase tracking-[0.3em]">곡 제목</label>
                              <button 
                                type="button" 
                                onClick={() => { setSearchKeyword(formData.title); setSearchOpen(true); }}
                                className="text-[10px] font-black text-hyundai-gold hover:text-hyundai-black uppercase tracking-widest flex items-center gap-1 transition-colors"
                              >
                                 <Search className="w-3 h-3" /> 음악 검색 (KOREAN)
                              </button>
                           </div>
                          <input 
                            type="text" 
                            required
                            placeholder="곡명 직접 입력 또는 검색"
                            className="w-full h-20 bg-white border-none px-8 text-xl font-black uppercase tracking-tight focus:ring-4 focus:ring-hyundai-black/5 transition-all outline-none shadow-sm"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            onFocus={() => setShowSuggestions(suggestions.length > 0)}
                          />
                          {showSuggestions && (
                            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white shadow-3xl border border-hyundai-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                               <div className="divide-y divide-hyundai-gray-50">
                                 {suggestions.map((s, i) => (
                                   <button 
                                     key={i} 
                                     type="button"
                                     onClick={() => selectSuggestion(s)}
                                     className="w-full px-8 py-6 text-left hover:bg-hyundai-gray-50 transition-all flex flex-col gap-1"
                                   >
                                     <span className="text-lg font-black text-hyundai-black uppercase tracking-tight">{s.title}</span>
                                     <span className="text-[11px] text-hyundai-gray-400 font-bold uppercase tracking-widest">{s.artist}</span>
                                   </button>
                                 ))}
                               </div>
                            </div>
                          )}
                       </div>
                        <div className="space-y-4">
                           <label className="text-[11px] font-black text-hyundai-gray-400 uppercase tracking-[0.3em]">아티스트명</label>
                          <input 
                            type="text" 
                            required
                            placeholder="아티스트명 입력"
                            className="w-full h-20 bg-white border-none px-8 text-xl font-black uppercase tracking-tight focus:ring-4 focus:ring-hyundai-black/5 transition-all outline-none shadow-sm"
                            value={formData.artist}
                            onChange={(e) => setFormData({...formData, artist: e.target.value})}
                          />
                       </div>
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
                        <h3 className="text-3xl font-black text-hyundai-black uppercase tracking-tight">선곡의 이유와 추억</h3>
                     </div>
                     <textarea 
                       rows={8}
                       placeholder="심사 시 반영될 사연을 입력해 주세요."
                       className="w-full bg-hyundai-gray-50 border-none px-10 py-10 text-lg font-bold leading-relaxed focus:bg-white focus:ring-4 focus:ring-hyundai-black/5 transition-all outline-none resize-none placeholder:text-hyundai-gray-200"
                       maxLength={200}
                       value={formData.story}
                       onChange={(e) => setFormData({...formData, story: e.target.value})}
                     />
                  </div>

                  <div className="space-y-12">
                     <div className="space-y-4">
                        <span className="text-2xl font-black text-hyundai-gray-200 uppercase tracking-tighter block italic">03/정보 확인</span>
                        <h3 className="text-3xl font-black text-hyundai-black uppercase tracking-tight">신청자 프로필</h3>
                     </div>
                     <div className="space-y-10">
                        <input 
                          type="text" 
                          placeholder="성함 또는 닉네임"
                          className="w-full h-20 bg-hyundai-gray-50 border-none px-8 text-xl font-black uppercase focus:ring-4 focus:ring-hyundai-black/5 outline-none transition-all"
                          value={formData.requester_name}
                          onChange={(e) => setFormData({...formData, requester_name: e.target.value})}
                        />
                        <input 
                          type="text" 
                          placeholder="연락처 (010-0000-0000)"
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
                     "btn-portal-primary w-full h-24 text-2xl tracking-[0.4em] font-black group relative transform hover:-translate-y-2 active:translate-y-0 active:scale-95 duration-500",
                     loading && "opacity-50 cursor-not-allowed"
                   )}
                 >
                    {loading ? "전송 중..." : "신청서 전송하기"}
                 </button>
              </div>
           </form>
        </div>
      </div>

      {/* Music Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-hyundai-black/90 flex items-center justify-center p-6 z-[200] backdrop-blur-xl">
          <div className="bg-white border-2 border-hyundai-black w-full max-w-2xl shadow-3xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-10 border-b border-hyundai-gray-100 flex justify-between items-center bg-hyundai-gray-50">
               <h4 className="font-black text-3xl text-hyundai-black uppercase">MUSIC SEARCH</h4>
               <button onClick={() => setSearchOpen(false)} className="text-hyundai-gray-300 hover:text-hyundai-black"><X className="w-8 h-8" /></button>
            </div>
            
            <div className="p-10 space-y-10 flex flex-col min-h-0">
               <form onSubmit={handleMusicSearch} className="flex gap-2">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="아티스트 또는 곡명..." 
                    className="flex-grow h-20 px-8 bg-hyundai-gray-100 border-none text-lg font-black uppercase outline-none focus:ring-4"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                  <button type="submit" disabled={searching} className="px-10 bg-hyundai-black text-white text-[14px] font-black uppercase disabled:opacity-50">
                    {searching ? 'SEARCHING' : 'SEARCH'}
                  </button>
               </form>

               {searchError && <p className="text-red-500 font-bold">{searchError}</p>}

               <div className="flex-grow overflow-y-auto space-y-2 pr-4 custom-scrollbar">
                  {searchResults.map((result, i) => (
                    <button 
                      key={i} 
                      onClick={() => selectMusicResult(result)}
                      className="w-full flex items-center gap-6 p-6 text-left hover:bg-hyundai-gray-50 transition-all border border-transparent hover:border-hyundai-gray-200 group relative"
                    >
                       <div className="w-16 h-16 bg-hyundai-gray-200 shrink-0 overflow-hidden relative">
                          {result.image ? <img src={result.image} alt="" className="w-full h-full object-cover" /> : <Music className="w-full h-full p-5 text-hyundai-gray-400" />}
                       </div>
                       <div className="flex-grow min-w-0">
                          <p className="font-black text-hyundai-black text-xl uppercase truncate">{result.title}</p>
                          <p className="text-[12px] font-bold text-hyundai-gray-400 truncate uppercase mt-1 tracking-widest">{result.artist}</p>
                       </div>
                       <ChevronRight className="w-6 h-6 text-hyundai-gray-200" />
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
