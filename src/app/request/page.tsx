'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { isValidYouTubeUrl } from '@/utils/youtube';
import { useRouter } from 'next/navigation';
import { Search, Youtube, Music, User, Send, CheckCircle, Copy, ArrowLeft, AlertCircle, Sparkles, ChevronRight, Info, Disc, Clock } from 'lucide-react';
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
  const [inputMode, setInputMode] = useState<'link' | 'manual'>('link');
  
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

  const debouncedTitle = useDebounce(formData.title, 500);
  const debouncedArtist = useDebounce(formData.artist, 500);

  // Fetch active theme and suggestions
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/admin/themes');
        if (res.ok) {
          const themes = await res.json();
          const active = themes.find((t: any) => t.is_active);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Final Validation
    if (!formData.title && inputMode === 'manual') {
      setError('곡명을 입력해주세요.');
      setLoading(false);
      return;
    }

    if (inputMode === 'link' && !isValidYouTubeUrl(formData.youtube_url)) {
      setError('유효하지 않은 YouTube 링크입니다. 전체 URL을 입력해주세요.');
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
      {/* 1. Industrial Header (Breadcrumbs included) */}
      <div className="border-b border-hyundai-gray-100 bg-white">
        <div className="portal-container">
            <div className="h-14 flex items-center gap-4 text-[10px] font-black text-hyundai-gray-400 uppercase tracking-widest">
               <Link href="/" className="hover:text-hyundai-black transition-colors">디지털 포털</Link>
               <span className="w-1.5 h-px bg-hyundai-gray-200"></span>
               <span className="text-hyundai-black">음악 신청 센터</span>
            </div>
        </div>
      </div>

      <div className="portal-container pt-24 md:pt-32">
        {/* 2. Section Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-16 border-b-4 border-hyundai-black pb-16 mb-24">
           <div className="space-y-6 max-w-3xl">
              <div className="space-y-4">
                 <span className="text-hyundai-gold text-[12px] font-black tracking-[0.4em] uppercase block animate-in fade-in slide-in-from-bottom-2 duration-500">신청 서비스 등록</span>
                 <h1 className="text-5xl md:text-8xl font-black text-hyundai-black tracking-[-0.04em] leading-[0.9] uppercase animate-in fade-in slide-in-from-bottom-4 duration-700">스카이테라스 <br />음악 신청 <br />데스크</h1>
              </div>
              <p className="text-lg md:text-xl font-medium text-hyundai-gray-500 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">함께 나누고 싶은 고품격 아울렛의 감성, 당신의 노래를 들려주세요. <br className="hidden md:block" />현대백화점 대전점 스카이테라스의 소리를 당신이 채웁니다.</p>
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
                <div className="p-10 bg-red-50 border-l-8 border-red-600 flex items-center gap-6 text-red-600 animate-in slide-in-from-top-4">
                  <AlertCircle className="w-8 h-8 shrink-0" />
                  <p className="text-lg font-black uppercase tracking-tight leading-none">{error}</p>
                </div>
              )}

              {/* Step 01: Methodology */}
              <div className="space-y-16">
                 <div className="space-y-4">
                    <span className="text-3xl font-black text-hyundai-gray-200 uppercase tracking-tighter block italic">01/신청 방식</span>
                    <h3 className="text-4xl font-black text-hyundai-black uppercase tracking-tight">음원 선택 프로토콜</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hyundai-gray-100 border border-hyundai-gray-100 overflow-hidden">
                    <button 
                      type="button"
                      onClick={() => setInputMode('link')}
                      className={cn(
                        "flex flex-col items-center justify-center gap-6 py-24 transition-all duration-700 relative group overflow-hidden",
                        inputMode === 'link' ? "bg-white text-hyundai-black" : "bg-transparent text-hyundai-gray-300 hover:text-hyundai-gray-500"
                      )}
                    >
                       <Youtube className={cn("w-12 h-12 transition-all duration-700", inputMode === 'link' ? "scale-110 text-red-600" : "opacity-30")} />
                       <div className="text-center space-y-1 relative z-10">
                           <span className="text-[11px] font-black uppercase tracking-[0.3em] block">방식 A</span>
                           <span className="text-xl font-black uppercase tracking-tight">YouTube 링크 등록</span>
                       </div>
                       {inputMode === 'link' && <div className="absolute bottom-0 left-0 right-0 h-2 bg-hyundai-black"></div>}
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setInputMode('manual')}
                      className={cn(
                        "flex flex-col items-center justify-center gap-6 py-24 transition-all duration-700 relative group overflow-hidden",
                        inputMode === 'manual' ? "bg-white text-hyundai-black" : "bg-transparent text-hyundai-gray-300 hover:text-hyundai-gray-500"
                      )}
                    >
                       <Disc className={cn("w-12 h-12 transition-all duration-700", inputMode === 'manual' ? "scale-110 text-hyundai-emerald animate-[spin_4s_linear_infinite]" : "opacity-30")} />
                       <div className="text-center space-y-1 relative z-10">
                           <span className="text-[11px] font-black uppercase tracking-[0.3em] block">방식 B</span>
                           <span className="text-xl font-black uppercase tracking-tight">직접 정보 입력</span>
                       </div>
                       {inputMode === 'manual' && <div className="absolute bottom-0 left-0 right-0 h-2 bg-hyundai-black"></div>}
                    </button>
                 </div>
              </div>

              {/* Step 02: Track Identity */}
               <div className="space-y-16">
                  <div className="space-y-4">
                     <span className="text-3xl font-black text-hyundai-gray-200 uppercase tracking-tighter block italic">02/곡 정보</span>
                     <h3 className="text-4xl font-black text-hyundai-black uppercase tracking-tight">선택 음원 상세 검색</h3>
                  </div>

                 <div className="grid grid-cols-1 gap-12">
                    {inputMode === 'link' ? (
                       <div className="space-y-6">
                           <div className="space-y-4">
                              <div className="flex justify-between items-end">
                                 <label className="text-[11px] font-black text-hyundai-gray-400 uppercase tracking-[0.3em]">Youtube 리소스 링크</label>
                                 <span className="text-[10px] font-bold text-hyundai-emerald uppercase tracking-widest">글로벌 링크 확인됨</span>
                              </div>
                             <div className="relative">
                                <input 
                                  type="url" 
                                  placeholder="HTTPS://WWW.YOUTUBE.COM/WATCH?V=REFERENCE_ID"
                                  className="w-full h-24 bg-hyundai-gray-50 border-none px-10 text-xl font-black uppercase tracking-tight focus:bg-white focus:ring-4 focus:ring-hyundai-black/5 transition-all outline-none placeholder:text-hyundai-gray-200"
                                  value={formData.youtube_url}
                                  onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                                />
                                <div className="absolute right-10 top-1/2 -translate-y-1/2 w-10 h-10 bg-hyundai-black flex items-center justify-center text-white">
                                   <Search className="w-5 h-5" strokeWidth={2.5} />
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <Info className="w-4 h-4 text-hyundai-gold mt-0.5" />
                                <p className="text-[11px] text-hyundai-gray-400 font-medium leading-relaxed uppercase tracking-wider italic">유튜브 영상 하단의 공유 버튼을 통해 복사한 URL을 입력해 주세요. 정확한 링크는 선곡 승인 확률을 높입니다.</p>
                             </div>
                          </div>
                       </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-4 relative">
                              <label className="text-[11px] font-black text-hyundai-gray-400 uppercase tracking-[0.3em]">곡 제목</label>
                             <input 
                               type="text" 
                               placeholder="예) 봄이 좋냐"
                               className="w-full h-20 bg-hyundai-gray-50 border-none px-8 text-xl font-black uppercase tracking-tight focus:bg-white focus:ring-4 focus:ring-hyundai-black/5 transition-all outline-none"
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
                               placeholder="예) 10CM"
                               className="w-full h-20 bg-hyundai-gray-50 border-none px-8 text-xl font-black uppercase tracking-tight focus:bg-white focus:ring-4 focus:ring-hyundai-black/5 transition-all outline-none"
                               value={formData.artist}
                               onChange={(e) => setFormData({...formData, artist: e.target.value})}
                             />
                          </div>
                       </div>
                    )}
                 </div>

                 {duplicateFound && (
                   <div className="p-10 bg-hyundai-gold/5 border border-hyundai-gold/20 flex items-start gap-8">
                      <Sparkles className="w-8 h-8 text-hyundai-gold shrink-0 mt-1" />
                      <div>
                         <p className="text-xl font-black text-hyundai-gold uppercase tracking-tight">중복 신청 가능성 감지</p>
                         <p className="text-[13px] font-medium text-hyundai-gray-500 mt-2 leading-relaxed uppercase tracking-wider">이미 승인된 신청곡이거나, 다른 고객이 먼저 신청한 곡입니다. <br />중복 신청 시 관리자의 선곡 큐레이션 알고리즘에 의해 우선순위가 조정될 수 있습니다.</p>
                      </div>
                   </div>
                 )}
              </div>

              {/* Step 03: Narrative & Ownership */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 pt-24 border-t-2 border-hyundai-gray-100">
                 {/* Story */}
                  <div className="space-y-12">
                     <div className="space-y-4">
                        <span className="text-2xl font-black text-hyundai-gray-200 uppercase tracking-tighter block italic">03/신청 사연</span>
                        <h3 className="text-3xl font-black text-hyundai-black uppercase tracking-tight">선곡의 이유와 추억</h3>
                     </div>
                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-hyundai-gray-400 uppercase tracking-[0.3em]">신청 사연 (심사용 자료)</label>
                       <textarea 
                         rows={8}
                         placeholder="곡과 관련된 추억이나 신청 이유를 자유롭게 기록해 주세요. (심사 시 반영됩니다)"
                         className="w-full bg-hyundai-gray-50 border-none px-10 py-10 text-lg font-bold leading-relaxed focus:bg-white focus:ring-4 focus:ring-hyundai-black/5 transition-all outline-none resize-none placeholder:text-hyundai-gray-200"
                         maxLength={200}
                         value={formData.story}
                         onChange={(e) => setFormData({...formData, story: e.target.value})}
                       />
                       <div className="flex justify-end">
                           <span className="text-[10px] font-black text-hyundai-gray-300 uppercase tracking-[0.4em]">{formData.story.length} / 200 자 내외</span>
                       </div>
                    </div>
                 </div>

                 {/* Requester */}
                  <div className="space-y-12">
                     <div className="space-y-4">
                        <span className="text-2xl font-black text-hyundai-gray-200 uppercase tracking-tighter block italic">04/정보 확인</span>
                        <h3 className="text-3xl font-black text-hyundai-black uppercase tracking-tight">신청자 프로필</h3>
                     </div>
                    <div className="space-y-10">
                        <div className="space-y-4">
                           <label className="text-[11px] font-black text-hyundai-gray-400 uppercase tracking-[0.3em]">성함 또는 닉네임</label>
                          <input 
                            type="text" 
                            placeholder="사용자 고유 명칭 입력"
                            className="w-full h-20 bg-hyundai-gray-50 border-none px-8 text-xl font-black uppercase tracking-tight focus:bg-white focus:ring-4 focus:ring-hyundai-black/5 transition-all outline-none"
                            value={formData.requester_name}
                            onChange={(e) => setFormData({...formData, requester_name: e.target.value})}
                          />
                       </div>
                        <div className="space-y-4">
                           <label className="text-[11px] font-black text-hyundai-gray-400 uppercase tracking-[0.3em]">연락처 (인증용)</label>
                          <input 
                            type="text" 
                            placeholder="010-0000-0000"
                            className="w-full h-20 bg-hyundai-gray-50 border-none px-8 text-xl font-black tracking-[0.2em] focus:bg-white focus:ring-4 focus:ring-hyundai-black/5 transition-all outline-none"
                            value={formData.requester_contact}
                            onChange={(e) => setFormData({...formData, requester_contact: e.target.value})}
                          />
                           <p className="text-[10px] text-hyundai-gray-300 font-black uppercase tracking-[0.2em] mt-3">암호화된 보안 채널을 통해 처리됩니다</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Step Final: Execution */}
              <div className="pt-32 border-t-8 border-hyundai-black flex flex-col items-center gap-16">
                  <div className="space-y-6 text-center max-w-2xl">
                     <h4 className="text-3xl font-black text-hyundai-black uppercase tracking-tight leading-none italic">신청서 최종 제출</h4>
                    <p className="text-sm font-medium text-hyundai-gray-400 leading-relaxed uppercase tracking-wider">
                       제출하신 데이터는 현대프리미엄아울렛 대전점 스카이테라스의 큐레이션 센터로 전송됩니다. <br />
                       운영 정책에 따라 선별된 곡들은 정규 방송 시간에 실시간으로 송출됩니다.
                    </p>
                 </div>
                 
                 <button 
                   type="submit" 
                   disabled={loading}
                   className={cn(
                     "btn-portal-primary w-full h-24 text-2xl tracking-[0.4em] font-black group relative transform hover:-translate-y-2 active:translate-y-0 active:scale-95 duration-500",
                     loading && "opacity-50 cursor-not-allowed"
                   )}
                 >
                    {loading ? (
                      <div className="flex items-center justify-center gap-6">
                         <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                         <span>제출 처리 중...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-6">
                         <span>신청서 전송하기</span>
                         <ArrowLeft className="w-8 h-8 rotate-180 group-hover:translate-x-2 transition-transform duration-500" strokeWidth={3} />
                      </div>
                    )}
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
