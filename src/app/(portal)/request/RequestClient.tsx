'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Music, AlertCircle, ChevronRight, Disc } from 'lucide-react';
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

export default function RequestClient({ initialTheme, initialBranding }: { initialTheme: any, initialBranding: any }) {
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
    image: '', 
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [duplicateFound, setDuplicateFound] = useState(false);
  const [activeTheme, setActiveTheme] = useState<any>(initialTheme);
  const [branding, setBranding] = useState<any>(initialBranding);

  // Search states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [showManualFields, setShowManualFields] = useState(false);

  const debouncedTitle = useDebounce(formData.title, 500);
  const debouncedArtist = useDebounce(formData.artist, 500);

  // Still fetch in case of updates, but now we have initial data!
  useEffect(() => {
    async function init() {
      try {
        const [themeRes, brandingRes] = await Promise.all([
          fetch('/api/themes'),
          fetch('/api/branding')
        ]);
        
        if (themeRes.ok) {
          const active = await themeRes.json();
          if (active) setActiveTheme(active);
        }
        
        if (brandingRes.ok) {
          const bData = await brandingRes.json();
          setBranding(bData);
        }
      } catch (e) {
        console.error('Failed to init data', e);
      }
    }
    init();
  }, []);

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
      artist: result.artist,
      image: result.image || ''
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

      <div className="portal-container pt-6 md:pt-10">
        {/* Theme Display */}
        {activeTheme && (
          <div className="mb-8 flex items-center">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-hyundai-gray-50 border border-hyundai-gray-100 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 bg-hyundai-accent rounded-full animate-pulse"></span>
                <span className="text-[11px] font-bold text-hyundai-black uppercase tracking-widest">
                   이달의 테마: <span className="text-hyundai-accent">{activeTheme.title}</span>
                </span>
             </div>
          </div>
        )}

        {/* 2. Top Portal Header (Hyundai Style) */}
        <div className="mb-20">
           <div className="flex justify-between items-end border-b-2 border-hyundai-black pb-6 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-hyundai-black tracking-tighter">글쓰기</h1>
              <span className="text-[13px] font-medium text-hyundai-gray-500">
                <span className="text-hyundai-accent mr-1 font-bold">•</span>
                는 필수 입력항목 입니다.
              </span>
           </div>
           <p className="text-[14px] font-medium text-hyundai-gray-500 px-2 tracking-tight">
             현대프리미엄아울렛 대전점 스카이테라스 테마와 맞는 곡을 추천해주세요. 불건전하거나 광고성 게시물은 통보 없이 삭제될 수 있습니다.
           </p>
        </div>

        {/* 3. Operational Form */}
        <div className="bg-white">
           <form onSubmit={handleSubmit} className="space-y-6 md:space-y-12">
              {error && (
                <div className="p-8 bg-red-50 border border-red-100 flex items-center gap-6 text-red-600 mb-10">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <p className="text-base font-bold tracking-tight">{error}</p>
                </div>
              )}

              {/* Integrated Search Row */}
              <div className="form-row border-t-2 border-hyundai-black">
                 <div className="form-label">
                    신청곡 검색<span className="required-mark">*</span>
                 </div>
                 <div className="form-field space-y-6">
                    {(!formData.title || showManualFields) && (
                      <div className="flex flex-col gap-4">
                        <div className="relative group">
                          <input 
                            type="text" 
                            autoComplete="off"
                            placeholder="아티스트 또는 곡명을 입력해 주세요" 
                            className="input-hyundai pr-36 md:pr-40 placeholder:text-[13px] md:placeholder:text-[16px]"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleMusicSearch(e)}
                          />
                          <button 
                            type="button"
                            onClick={handleMusicSearch}
                            disabled={searching || !searchKeyword}
                            className="absolute right-0 top-0 bottom-0 px-6 md:px-10 bg-hyundai-black text-white text-[13px] md:text-[14px] font-bold hover:bg-hyundai-accent transition-all disabled:opacity-20"
                          >
                             {searching ? '...' : '검색'}
                          </button>
                        </div>
                        
                        {(searchResults.length > 0 || searching) && (
                          <div className="border border-hyundai-gray-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                             <div className="max-h-[400px] overflow-y-auto divide-y divide-hyundai-gray-50">
                                {searching ? (
                                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-hyundai-gray-300">
                                     <div className="w-8 h-8 border-2 border-hyundai-gray-50 border-t-hyundai-accent rounded-full animate-spin"></div>
                                     <p className="font-bold text-[12px] tracking-widest">데이터 조회 중...</p>
                                  </div>
                                ) : (
                                  searchResults.map((result, i) => (
                                    <button 
                                      key={i} 
                                      type="button"
                                      onClick={() => selectMusicResult(result)}
                                      className="w-full flex items-center gap-6 p-6 text-left hover:bg-hyundai-gray-50 transition-all group"
                                    >
                                       <div className="w-16 h-16 bg-hyundai-gray-100 shrink-0 overflow-hidden relative border border-hyundai-gray-50">
                                          {result.image ? <img src={result.image} alt="" className="w-full h-full object-cover" /> : <Music className="w-full h-full p-4 text-hyundai-gray-300" />}
                                       </div>
                                       <div className="flex-grow min-w-0">
                                          <p className="font-bold text-hyundai-black text-xl truncate tracking-tight">{result.title}</p>
                                          <p className="text-[14px] font-semibold text-hyundai-gray-400 truncate tracking-wide">{result.artist}</p>
                                       </div>
                                       <ChevronRight className="w-5 h-5 text-hyundai-gray-200 group-hover:text-hyundai-accent transition-colors" />
                                    </button>
                                  ))
                                )}
                             </div>
                          </div>
                        )}

                        {hasSearched && searchResults.length === 0 && !searching && (
                          <div className="p-6 bg-hyundai-gray-50 border border-dashed border-hyundai-gray-200 text-center space-y-4">
                             <p className="text-sm font-semibold text-hyundai-gray-400">검색 결과가 없습니다.</p>
                             <button type="button" onClick={() => { setShowManualFields(true); setHasSearched(false); }} className="text-sm font-bold border-b border-hyundai-black pb-0.5">직접 입력하기</button>
                          </div>
                        )}
                      </div>
                    )}

                    {formData.title && !showManualFields && (
                      <div className="p-8 bg-hyundai-gray-50 border border-hyundai-gray-200 flex items-center gap-8 group">
                         <div className="w-24 h-24 bg-white shrink-0 border border-hyundai-gray-200 overflow-hidden">
                            {formData.image ? <img src={formData.image} alt="" className="w-full h-full object-cover" /> : <Disc className="w-12 h-12 text-hyundai-gray-200 animate-spin" />}
                         </div>
                         <div className="flex-grow min-w-0">
                            <span className="text-[11px] font-bold text-hyundai-accent tracking-widest uppercase block mb-1">SELECTED TRACK</span>
                            <h4 className="text-2xl font-bold text-hyundai-black tracking-tight truncate">{formData.title}</h4>
                            <p className="text-base font-semibold text-hyundai-gray-400 truncate">{formData.artist}</p>
                         </div>
                         <button type="button" onClick={() => { setFormData(prev => ({ ...prev, title: '', artist: '', image: '' })); setHasSearched(false); }} className="px-6 h-12 border border-hyundai-black text-[13px] font-bold hover:bg-hyundai-black hover:text-white transition-all">재검색</button>
                      </div>
                    )}

                    {!hasSearched && !searching && !formData.title && (
                       <button type="button" onClick={() => setShowManualFields(!showManualFields)} className="text-[13px] font-bold text-hyundai-gray-400 hover:text-hyundai-black transition-colors underline underline-offset-4 decoration-hyundai-gray-200">
                          {showManualFields ? '검색 모드로 전환' : '원하는 검색 결과가 없으신가요? 직접 입력'}
                       </button>
                    )}
                 </div>
              </div>

              {showManualFields && (
                <>
                  <div className="form-row">
                     <div className="form-label">
                        곡 제목<span className="required-mark">*</span>
                     </div>
                     <div className="form-field">
                        <input 
                          type="text" 
                          required
                          autoComplete="off"
                          placeholder="곡 제목을 입력해 주세요"
                          className="input-hyundai"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                     </div>
                  </div>
                  <div className="form-row">
                     <div className="form-label">
                        아티스트명<span className="required-mark">*</span>
                     </div>
                     <div className="form-field">
                        <input 
                          type="text" 
                          required
                          autoComplete="off"
                          placeholder="아티스트명을 입력해 주세요"
                          className="input-hyundai"
                          value={formData.artist}
                          onChange={(e) => setFormData({...formData, artist: e.target.value})}
                        />
                     </div>
                  </div>
                </>
              )}

              <div className="form-row">
                 <div className="form-label">
                    신청 사연
                 </div>
                 <div className="form-field">
                    <textarea 
                      rows={6}
                      placeholder="함께 나누고 싶은 이야기나 신청 배경을 입력해 주세요 (최대 200자)"
                      className="textarea-hyundai"
                      maxLength={200}
                      value={formData.story}
                      onChange={(e) => setFormData({...formData, story: e.target.value})}
                    />
                 </div>
              </div>

              <div className="form-row">
                 <div className="form-label">
                    성함 / 닉네임
                 </div>
                 <div className="form-field">
                    <input 
                      type="text" 
                      autoComplete="off"
                      placeholder="실명 또는 닉네임을 입력해 주세요"
                      className="input-hyundai md:max-w-sm"
                      value={formData.requester_name}
                      onChange={(e) => setFormData({...formData, requester_name: e.target.value})}
                    />
                 </div>
              </div>

              <div className="form-row">
                 <div className="form-label">
                    연락처
                 </div>
                 <div className="form-field">
                    <input 
                      type="text" 
                      autoComplete="off"
                      placeholder="010-0000-0000"
                      className="input-hyundai md:max-w-sm"
                      value={formData.requester_contact}
                      onChange={(e) => setFormData({...formData, requester_contact: e.target.value})}
                    />
                    <p className="mt-3 text-[13px] font-medium text-hyundai-gray-400">송출 확정 시 안내 문자가 발송될 수 있습니다.</p>
                 </div>
              </div>

              <div className="pt-10 md:pt-20 pb-20 md:pb-40 flex flex-col items-center gap-8">
                 <div className="p-6 md:p-8 bg-[#f8f8f8] border border-hyundai-gray-100 text-center w-full">
                    <p className="text-[14px] font-medium text-hyundai-gray-500 leading-relaxed">
                       입력하신 정보는 신청곡 관리 목적으로만 사용되며, <br className="hidden md:block" /> 
                       개인정보처리방침에 따라 안전하게 보호됩니다.
                    </p>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <Link href="/" className="btn-portal-outline px-20">취소</Link>
                    <button 
                      type="submit" 
                      disabled={loading || !formData.title}
                      className={cn(
                        "btn-portal-primary px-32",
                        (loading || !formData.title) && "opacity-20 cursor-not-allowed"
                      )}
                    >
                       {loading ? "전송 중..." : "신청서 등록"}
                    </button>
                 </div>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
