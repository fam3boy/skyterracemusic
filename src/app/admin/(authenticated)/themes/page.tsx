'use client';

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Music, ListMusic, CalendarDays, ClipboardList, Settings2, Plus, X, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Search } from 'lucide-react';

export default function ThemesPage() {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTheme, setEditingTheme] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  
  // Search states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchTargetIndex, setSearchTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  async function fetchThemes() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/themes');
      if (res.ok) {
        const data = await res.json();
        setThemes(data);
      }
    } catch (err) {
      console.error('Failed to fetch themes', err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch('/api/admin/themes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !current }),
      });

      if (res.ok) {
        fetchThemes();
      }
    } catch (err) {
      console.error('Failed to toggle active', err);
    }
  };

  const handleEdit = async (theme: any) => {
    setEditingTheme(theme);
    try {
      const res = await fetch(`/api/admin/themes?id=${theme.id}`);
      if (res.ok) {
        const data = await res.json();
        setTracks(data.tracks || []);
      }
    } catch (err) {
      console.error('Failed to fetch theme details', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingTheme.id ? 'PATCH' : 'POST';
      const body = {
        ...editingTheme,
        tracks
      };

      const res = await fetch('/api/admin/themes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setEditingTheme(null);
        fetchThemes();
      }
    } catch (err) {
      console.error('Failed to save theme', err);
    }
  };

  const handleBackgroundUpload = async (theme: any, file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.6); // Compress a bit
        setEditingTheme({ ...theme, background_base64: base64 });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleYoutubeBlur = async (index: number, url: string) => {
    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) return;
    if (tracks[index].title) return; // Don't overwrite if title exists

    try {
      const res = await fetch(`/api/youtube-metadata?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        const newTracks = [...tracks];
        newTracks[index].title = data.title;
        if (!newTracks[index].artist) newTracks[index].artist = data.author || '';
        setTracks(newTracks);
      }
    } catch (err) {
      console.error('Failed to fetch youtube title', err);
    }
  };

  const handleMusicSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/music-search?keyword=${encodeURIComponent(searchKeyword)}`);
      if (res.ok) {
        setSearchResults(await res.json());
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearching(false);
    }
  };

  const selectTrack = (result: any) => {
    if (searchTargetIndex === null) return;
    const newTracks = [...tracks];
    newTracks[searchTargetIndex] = {
      ...newTracks[searchTargetIndex],
      title: result.title,
      artist: result.artist
    };
    setTracks(newTracks);
    setSearchOpen(false);
    setSearchTargetIndex(null);
    setSearchResults([]);
    setSearchKeyword('');
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-hyundai-black">월별 테마 설정</h2>
          <p className="text-hyundai-gray-500 mt-1">월간 테마 및 기본 플레이리스트 관리</p>
        </div>
        <button 
          onClick={() => { setEditingTheme({ title: '', theme_month: new Date().toISOString().slice(0, 7) + '-01', description: '', background_base64: '' }); setTracks([]); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          새 테마 추가
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-20 uppercase font-bold tracking-normal text-hyundai-gray-200 animate-pulse text-[14px]">테마 정보를 불러오는 중...</div>
        ) : themes.length === 0 ? (
          <div className="text-center py-20 text-hyundai-gray-400 italic">등록된 테마가 없습니다.</div>
        ) : (
          themes.map(theme => (
            <div key={theme.id} className={cn(
              "card p-0 overflow-hidden border-none shadow-xl transition-all hover:scale-[1.01]",
              theme.is_active ? 'ring-2 ring-hyundai-emerald ring-offset-4 ring-offset-hyundai-gray-100' : ''
            )}>
              <div className="flex flex-col md:flex-row">
                <div className="md:w-32 bg-hyundai-gray-200 relative overflow-hidden shrink-0 hidden md:block">
                  {theme.background_base64 ? (
                    <img src={theme.background_base64} className="absolute inset-0 w-full h-full object-cover blur-[2px]" alt="Bg" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-hyundai-gray-400"><ImageIcon className="w-8 h-8 opacity-20" /></div>
                  )}
                </div>
                <div className={cn(
                  "p-8 flex-grow",
                  theme.is_active ? 'bg-white' : 'bg-hyundai-gray-100/50'
                )}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[12px] font-bold tracking-normal text-hyundai-emerald bg-hyundai-emerald/5 px-3 py-1.5 rounded-full border border-hyundai-emerald/20 uppercase">
                      {new Date(theme.theme_month).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                    </span>
                    {theme.is_active && (
                      <span className="flex items-center gap-1 text-[12px] font-bold bg-hyundai-gold text-white px-3 py-1.5 rounded-full shadow-lg shadow-hyundai-gold/20 italic animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white opacity-75"></span>
                        현재 활성화됨
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-hyundai-black mb-2">{theme.title}</h3>
                  <p className="text-sm text-hyundai-gray-500 font-medium leading-relaxed">{theme.description || '설명이 등록되지 않았습니다.'}</p>
                  
                  {(theme.start_date || theme.end_date) && (
                    <div className="mt-6 flex items-center gap-4 text-xs font-bold text-hyundai-gray-400">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        운영 기간: {theme.start_date ? new Date(theme.start_date).toLocaleDateString() : '미지정'} ~ {theme.end_date ? new Date(theme.end_date).toLocaleDateString() : '미지정'}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-8 md:w-1/3 bg-hyundai-black flex flex-col justify-center gap-3">
                  <button 
                    onClick={() => handleToggleActive(theme.id, theme.is_active)}
                    className={cn(
                      "w-full py-4 rounded-xl text-[14px] font-bold transition-all uppercase tracking-tight",
                      theme.is_active 
                        ? 'bg-hyundai-gray-800 text-hyundai-gray-400 hover:text-white' 
                        : 'bg-hyundai-emerald text-white hover:bg-white hover:text-hyundai-emerald shadow-lg shadow-hyundai-emerald/20'
                    )}
                  >
                    {theme.is_active ? '비활성화하기' : '현재 테마로 설정'}
                  </button>
                  <button 
                    onClick={() => handleEdit(theme)}
                    className="w-full py-4 bg-white/10 text-white rounded-xl text-[14px] font-bold hover:bg-white hover:text-hyundai-black transition-all uppercase tracking-tight border border-white/20"
                  >
                    테마 정보 수정
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editingTheme && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-[100] backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
            <form onSubmit={handleSave} className="flex flex-col h-full">
              <div className="p-8 border-b border-hyundai-gray-100 flex justify-between items-center bg-hyundai-gray-100/30">
                <h3 className="font-bold text-2xl text-hyundai-black uppercase tracking-tight">테마 기획 및 구성</h3>
                <button type="button" onClick={() => setEditingTheme(null)} className="text-hyundai-gray-400 hover:text-red-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-hyundai-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <label className="block text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-normal mb-2">테마명</label>
                      <input
                        type="text"
                        required
                        placeholder="예: 봄의 속삭임 (Acoustic)"
                        className="w-full px-5 py-4 bg-hyundai-gray-100/50 border border-hyundai-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-hyundai-emerald/10 focus:border-hyundai-emerald transition-all font-bold text-lg text-hyundai-black"
                        value={editingTheme.title}
                        onChange={(e) => setEditingTheme({ ...editingTheme, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-normal mb-2">테마 상세 설명</label>
                      <textarea
                        className="w-full px-5 py-4 bg-hyundai-gray-100/50 border border-hyundai-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-hyundai-emerald/10 focus:border-hyundai-emerald transition-all min-h-[100px] text-sm font-medium"
                        placeholder="테마에 대한 배경이나 선정 이유를 입력하세요..."
                        value={editingTheme.description}
                        onChange={(e) => setEditingTheme({ ...editingTheme, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-normal mb-2">배경 이미지 (Optional)</label>
                      <div className="relative group cursor-pointer aspect-video bg-hyundai-gray-100 rounded-2xl border-2 border-dashed border-hyundai-gray-200 overflow-hidden hover:border-hyundai-emerald transition-all">
                        {editingTheme.background_base64 ? (
                          <div className="relative w-full h-full group">
                            <img src={editingTheme.background_base64} className="w-full h-full object-cover blur-[2px] opacity-70" alt="Preview" />
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                               <p className="text-white text-xs font-bold">이미지 변경</p>
                             </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-2">
                             <ImageIcon className="w-8 h-8 text-hyundai-gray-300" />
                             <p className="text-[10px] font-bold text-hyundai-gray-400">업로드</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBackgroundUpload(editingTheme, file);
                        }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-normal mb-2">대상 월 (Month)</label>
                      <input
                        type="date"
                        required
                        className="w-full px-5 py-4 bg-hyundai-gray-100/50 border border-hyundai-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-hyundai-emerald/10 focus:border-hyundai-emerald transition-all text-sm font-bold"
                        value={editingTheme.theme_month ? new Date(editingTheme.theme_month).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditingTheme({ ...editingTheme, theme_month: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-hyundai-gray-100">
                  <div className="space-y-4">
                    <label className="block text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-normal">운영 시작일</label>
                    <input
                      type="date"
                      className="w-full px-5 py-4 bg-hyundai-gray-100/50 border border-hyundai-gray-200 rounded-2xl outline-none text-sm font-bold"
                      value={editingTheme.start_date || ''}
                      onChange={(e) => setEditingTheme({ ...editingTheme, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-normal">운영 종료일</label>
                    <input
                      type="date"
                      className="w-full px-5 py-4 bg-hyundai-gray-100/50 border border-hyundai-gray-200 rounded-2xl outline-none text-sm font-bold"
                      value={editingTheme.end_date || ''}
                      onChange={(e) => setEditingTheme({ ...editingTheme, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-hyundai-black p-4 rounded-2xl text-white">
                    <label className="text-[14px] font-bold uppercase tracking-tight">테마 기본 플레이리스트</label>
                      <button 
                        type="button"
                        onClick={() => setTracks([...tracks, { title: '', artist: '', youtube_url: '' }])}
                        className="px-6 py-2 bg-hyundai-emerald text-white text-[12px] font-bold rounded-xl shadow-lg hover:scale-105 transition-all uppercase tracking-tight"
                      >
                        + 곡 추가
                      </button>
                  </div>
                  
                  <div className="space-y-3">
                    {tracks.length === 0 && (
                      <p className="text-center py-10 text-hyundai-gray-400 text-xs italic">등록된 기본 곡이 없습니다.</p>
                    )}
                    {tracks.map((track, i) => (
                      <div key={i} className="flex flex-col gap-3 p-5 bg-hyundai-gray-100/50 rounded-2xl border border-hyundai-gray-200 relative group/track shadow-sm">
                        <div className="flex gap-3 items-center">
                          <span className="text-[12px] font-bold bg-hyundai-black text-white w-7 h-7 rounded flex items-center justify-center shrink-0">{i + 1}</span>
                          <input
                            placeholder="곡명"
                            className="flex-grow px-4 py-3 bg-white border border-hyundai-gray-200 rounded-xl text-sm font-bold uppercase tracking-tight outline-none focus:border-hyundai-emerald transition-all"
                            value={track.title}
                            onChange={(e) => {
                              const newTracks = [...tracks];
                              newTracks[i].title = e.target.value;
                              setTracks(newTracks);
                            }}
                          />
                          <button 
                            type="button"
                            onClick={() => { setSearchTargetIndex(i); setSearchOpen(true); }}
                            className="p-3 bg-hyundai-gray-50 text-hyundai-gray-400 hover:text-hyundai-emerald hover:bg-white rounded-xl transition-all border border-transparent hover:border-hyundai-gray-100"
                            title="음악 검색"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <input
                            placeholder="아티스트"
                            className="w-48 px-4 py-3 bg-white border border-hyundai-gray-200 rounded-xl text-xs font-bold outline-none focus:border-hyundai-emerald transition-all"
                            value={track.artist}
                            onChange={(e) => {
                              const newTracks = [...tracks];
                              newTracks[i].artist = e.target.value;
                              setTracks(newTracks);
                            }}
                          />
                          <div className="flex gap-1 shrink-0">
                            <button 
                              type="button"
                              disabled={i === 0}
                              onClick={() => {
                                const newTracks = [...tracks];
                                [newTracks[i-1], newTracks[i]] = [newTracks[i], newTracks[i-1]];
                                setTracks(newTracks);
                              }}
                              className="p-2 bg-white text-hyundai-gray-400 hover:text-hyundai-emerald rounded-lg shadow-sm border border-hyundai-gray-100 disabled:opacity-30"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button 
                              type="button"
                              disabled={i === tracks.length - 1}
                              onClick={() => {
                                const newTracks = [...tracks];
                                [newTracks[i+1], newTracks[i]] = [newTracks[i], newTracks[i+1]];
                                setTracks(newTracks);
                              }}
                              className="p-2 bg-white text-hyundai-gray-400 hover:text-hyundai-emerald rounded-lg shadow-sm border border-hyundai-gray-100 disabled:opacity-30"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => setTracks(tracks.filter((_, idx) => idx !== i))}
                              className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-6 shrink-0 flex justify-center">
                             <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                           </div>
                           <input
                            placeholder="유튜브 미디어 URL (선택 사항 - 입력 시 제목 자동 불러오기)"
                            className="flex-grow px-4 py-2.5 bg-white border border-hyundai-gray-200 rounded-lg text-[10px] font-bold outline-none focus:border-red-400 transition-all text-hyundai-gray-500"
                            value={track.youtube_url || ''}
                            onBlur={(e) => handleYoutubeBlur(i, e.target.value)}
                            onChange={(e) => {
                              const newTracks = [...tracks];
                              newTracks[i].youtube_url = e.target.value;
                              setTracks(newTracks);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-8 bg-hyundai-black flex justify-end gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={() => setEditingTheme(null)}
                  className="px-8 py-5 text-[14px] font-bold text-hyundai-gray-400 hover:text-white transition-all uppercase tracking-tight"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="px-12 py-5 bg-hyundai-emerald text-white text-[14px] font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase tracking-tight"
                >
                  테마 저장 및 적용
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Music Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-[200] backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-3xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-hyundai-gray-100 flex justify-between items-center bg-hyundai-gray-50">
               <div>
                  <h4 className="font-black text-xl text-hyundai-black">한국 음악 검색</h4>
                  <p className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-tight mt-1">Maniadb 데이터베이스 연동</p>
               </div>
               <button onClick={() => setSearchOpen(false)} className="text-hyundai-gray-400 hover:text-red-500"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-8 space-y-6 flex flex-col min-h-0">
               <form onSubmit={handleMusicSearch} className="flex gap-2">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="아티스트 또는 곡명 입력..." 
                    className="flex-grow px-6 py-4 bg-hyundai-gray-100 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-hyundai-emerald/10 transition-all"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                  <button type="submit" disabled={searching} className="px-8 bg-hyundai-black text-white text-xs font-bold rounded-2xl uppercase tracking-widest disabled:opacity-50">
                    {searching ? '검색 중...' : '검색'}
                  </button>
               </form>

               <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar min-h-[300px]">
                  {searchResults.length === 0 && !searching && (
                    <div className="py-20 text-center text-hyundai-gray-300 font-bold uppercase tracking-widest text-[11px]">검색 결과가 없습니다</div>
                  )}
                  {searchResults.map((result, i) => (
                    <button 
                      key={i} 
                      onClick={() => selectTrack(result)}
                      className="w-full flex items-center gap-4 p-4 text-left hover:bg-hyundai-gray-50 rounded-2xl transition-all border border-transparent hover:border-hyundai-gray-100 group"
                    >
                       <div className="w-12 h-12 bg-hyundai-gray-200 rounded-lg overflow-hidden shrink-0">
                          {result.image ? <img src={result.image} alt="" className="w-full h-full object-cover" /> : <Music className="w-full h-full p-3 text-hyundai-gray-400" />}
                       </div>
                       <div className="flex-grow min-w-0">
                          <p className="font-bold text-hyundai-black text-sm truncate group-hover:text-hyundai-emerald transition-colors">{result.title}</p>
                          <p className="text-[11px] font-bold text-hyundai-gray-400 truncate uppercase mt-0.5">{result.artist} • {result.album}</p>
                       </div>
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
