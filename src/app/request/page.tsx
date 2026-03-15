'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { isValidYouTubeUrl } from '@/utils/youtube';
import { useRouter } from 'next/navigation';
import { Search, Youtube, Music, User, Send, CheckCircle, Copy, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
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
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);

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
          if (active) setActiveThemeId(active.id);
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

    if (debouncedTitle.length >= 2 && debouncedArtist.length >= 2 && activeThemeId) {
      checkDuplicate(debouncedTitle, debouncedArtist);
    } else {
      setDuplicateFound(false);
    }
  }, [debouncedTitle, debouncedArtist, activeThemeId]);

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
      const res = await fetch(`/api/requests?theme_id=${activeThemeId}&title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`);
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
    if (!formData.title || !formData.artist) {
      setError('곡명과 아티스트명은 필수입니다.');
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
    <div className="max-w-xl mx-auto px-6 py-8 md:py-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <Link href="/" className="p-2 hover:bg-hyundai-gray-100 rounded-full transition-colors order-first">
          <ArrowLeft className="w-6 h-6 text-hyundai-gray-500" />
        </Link>
        <div className="text-center absolute left-1/2 -translate-x-1/2">
           <div className="bg-hyundai-emerald/10 text-hyundai-emerald px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
             Song Request
           </div>
        </div>
      </div>

      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-3xl font-black text-hyundai-black mb-3 leading-tight">스카이테라스에<br />당신의 노래를 들려주세요</h1>
        <p className="text-hyundai-gray-500 text-sm">함께 나누고 싶은 고품격 아울렛의 감성</p>
      </div>

      {/* Input Mode Tabs */}
      <div className="flex bg-hyundai-gray-100 p-1.5 rounded-2xl mb-8 border border-hyundai-gray-200">
        <button 
          onClick={() => setInputMode('link')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
            inputMode === 'link' ? "bg-white text-hyundai-black shadow-sm" : "text-hyundai-gray-400 hover:text-hyundai-gray-500"
          )}
        >
          <Youtube className="w-4 h-4" />
          유튜브 링크로 신청
        </button>
        <button 
          onClick={() => setInputMode('manual')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
            inputMode === 'manual' ? "bg-white text-hyundai-black shadow-sm" : "text-hyundai-gray-400 hover:text-hyundai-gray-500"
          )}
        >
          <Music className="w-4 h-4" />
          직접 입력
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 animate-in shake duration-500">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-bold leading-tight">{error}</p>
          </div>
        )}

        {/* Dynamic Fields based on Mode */}
        {inputMode === 'link' ? (
          <div className="card-premium p-6 space-y-6">
            <div className="space-y-4">
               <label className="flex items-center gap-2 text-xs font-black text-hyundai-gray-400 uppercase tracking-widest">
                 <Youtube className="w-3.5 h-3.5 text-red-500" />
                 YouTube URL
               </label>
               <input 
                 type="url" 
                 placeholder="https://www.youtube.com/watch?v=..."
                 className="w-full bg-hyundai-gray-100 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-hyundai-emerald transition-all"
                 value={formData.youtube_url}
                 onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
               />
               <p className="text-[10px] text-hyundai-gray-400 leading-relaxed italic">* 유튜브 영상 하단의 '공유' 버튼을 눌러 링크를 복사해 오시면 정확합니다.</p>
            </div>
          </div>
        ) : (
          <div className="card-premium p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 relative">
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-black text-hyundai-gray-400 uppercase tracking-widest">
                  <Music className="w-3.5 h-3.5 text-hyundai-emerald" />
                  Song Title
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="곡 제목을 입력하세요"
                    className="w-full bg-hyundai-gray-100 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-hyundai-emerald transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    onFocus={() => setShowSuggestions(suggestions.length > 0)}
                  />
                  {showSuggestions && (
                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white shadow-2xl rounded-2xl border border-hyundai-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                       <div className="px-4 py-3 bg-hyundai-gray-100 text-[10px] font-black uppercase text-hyundai-gray-400 flex justify-between">
                         <span>Recommended</span>
                         <Sparkles className="w-3 h-3" />
                       </div>
                       <div className="max-h-48 overflow-y-auto">
                         {suggestions.map((s, i) => (
                           <button 
                             key={i} 
                             type="button"
                             onClick={() => selectSuggestion(s)}
                             className="w-full px-5 py-3 text-left hover:bg-hyundai-gray-50 transition-colors flex flex-col gap-0.5"
                           >
                             <span className="text-sm font-bold text-hyundai-black">{s.title}</span>
                             <span className="text-xs text-hyundai-gray-400">{s.artist}</span>
                           </button>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-black text-hyundai-gray-400 uppercase tracking-widest">
                  <User className="w-3.5 h-3.5 text-hyundai-emerald" />
                  Artist
                </label>
                <input 
                  type="text" 
                  placeholder="가수 이름을 입력하세요"
                  className="w-full bg-hyundai-gray-100 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-hyundai-emerald transition-all"
                  value={formData.artist}
                  onChange={(e) => setFormData({...formData, artist: e.target.value})}
                />
              </div>

              {duplicateFound && (
                <div className="bg-hyundai-gold/10 border border-hyundai-gold/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-500">
                   <AlertCircle className="w-4 h-4 text-hyundai-gold shrink-0" />
                   <p className="text-[11px] font-bold text-hyundai-gold leading-tight">앗! 이미 누군가 신청한 곡입니다. <br /><span className="opacity-70 font-medium">관리자가 중복 승인할 가능성이 낮으니 확인 부탁드려요.</span></p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Common Optional Fields */}
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-xs font-black text-hyundai-gray-400 uppercase tracking-widest ml-4">
               Requester Info
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="성함 (익명가능)"
                className="w-full bg-white border border-hyundai-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-hyundai-emerald"
                value={formData.requester_name}
                onChange={(e) => setFormData({...formData, requester_name: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="연락처 (선택)"
                className="w-full bg-white border border-hyundai-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-hyundai-emerald"
                value={formData.requester_contact}
                onChange={(e) => setFormData({...formData, requester_contact: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-xs font-black text-hyundai-gray-400 uppercase tracking-widest ml-4">
               Your Story
            </label>
            <textarea 
              rows={4}
              placeholder="곡과 관련된 추억이나 신청 이유를 자유롭게 적어주세요 (최대 200자)"
              className="w-full bg-white border border-hyundai-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-hyundai-emerald resize-none"
              maxLength={200}
              value={formData.story}
              onChange={(e) => setFormData({...formData, story: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={cn(
            "w-full py-5 rounded-2xl font-black text-lg shadow-xl shadow-hyundai-emerald/20 transition-all flex items-center justify-center gap-3",
            loading ? "bg-hyundai-gray-200 text-hyundai-gray-400 cursor-not-allowed" : "bg-hyundai-emerald text-white hover:bg-hyundai-black hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
          ) : (
            <>
              신청 완료하기
              <Send className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-12 text-center">
        <p className="text-[11px] text-hyundai-gray-400 leading-relaxed uppercase tracking-tighter">
          현대프리미엄아울렛 대전점 스카이테라스 신청곡 운영실<br />
          © HYUNDAI PREMIUM OUTLET DAEJEON
        </p>
      </div>
    </div>
  );
}
