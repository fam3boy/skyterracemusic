'use client';

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { 
  Music, Plus, Save, Trash2, ArrowUp, ArrowDown, 
  Search, Youtube, ExternalLink, ListMusic, ListChecks
} from 'lucide-react';

export default function PlaylistPage() {
  const [theme, setTheme] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchPlaylist();
  }, []);

  async function fetchPlaylist() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/playlist');
      if (res.ok) {
        const data = await res.json();
        setTheme(data.theme);
        setTracks(data.tracks || []);
      }
    } catch (err) {
      console.error('Failed to fetch playlist', err);
    } finally {
      setLoading(false);
    }
  }

  const handleMusicSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchKeyword) return;
    setSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/music-search?keyword=${encodeURIComponent(searchKeyword)}`);
      if (res.ok) {
        setSearchResults(await res.json());
      }
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setSearching(false);
    }
  };

  const selectMusicResult = (result: any) => {
    const newTrack = {
      id: 'temp-' + Date.now(),
      title: result.title,
      artist: result.artist,
      youtube_url: result.video_id ? `https://www.youtube.com/watch?v=${result.video_id}` : '',
      isNew: true
    };
    setTracks([...tracks, newTrack]);
    setSearchResults([]);
    setSearchKeyword('');
    setHasSearched(false);
  };

  const addTrack = () => {
    setTracks([...tracks, { id: 'temp-' + Date.now(), title: '', artist: '', youtube_url: '', isNew: true }]);
  };

  const removeTrack = async (id: string, index: number) => {
    if (typeof id === 'string' && id.startsWith('temp-')) {
      const newTracks = [...tracks];
      newTracks.splice(index, 1);
      setTracks(newTracks);
      return;
    }

    if (!confirm('정말 이 곡을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/admin/playlist?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        const newTracks = [...tracks];
        newTracks.splice(index, 1);
        setTracks(newTracks);
      }
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const moveTrack = (index: number, direction: 'up' | 'down') => {
    const newTracks = [...tracks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newTracks.length) return;

    [newTracks[index], newTracks[targetIndex]] = [newTracks[targetIndex], newTracks[index]];
    setTracks(newTracks);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // 1. Save all tracks (simple implementation: update all order indices)
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const isNew = typeof track.id === 'string' && track.id.startsWith('temp-');
        const method = isNew ? 'POST' : 'PATCH';
        const body = isNew 
          ? { title: track.title, artist: track.artist, youtube_url: track.youtube_url }
          : { id: track.id, title: track.title, artist: track.artist, youtube_url: track.youtube_url, order_index: i };

        await fetch('/api/admin/playlist', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }
      alert('성공적으로 저장되었습니다.');
      fetchPlaylist();
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-hyundai-black tracking-tight flex items-center gap-3">
            현재 플레이리스트 관리
            {theme && <span className="text-[11px] bg-hyundai-gold text-white px-2 py-1 rounded-md uppercase font-bold tracking-normal">{theme.title}</span>}
          </h2>
          <p className="text-hyundai-gray-500 mt-2 font-medium">홈페이지 메인 및 현장 방송에 사용되는 리스트를 실시간으로 조정합니다.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={addTrack}
            className="flex items-center gap-2 px-6 py-4 bg-hyundai-black text-white rounded-2xl text-[14px] font-bold uppercase tracking-tight hover:scale-105 transition-all shadow-xl"
          >
            <Plus className="w-4 h-4" />
            곡 추가
          </button>
          <button 
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-4 bg-hyundai-emerald text-white rounded-2xl text-[14px] font-bold uppercase tracking-tight hover:scale-105 transition-all shadow-xl disabled:opacity-50"
          >
            {saving ? '저장 중...' : <><Save className="w-4 h-4" /> 변경사항 저장</>}
          </button>
        </div>
      </div>

      {!theme && !loading && (
        <div className="card-premium p-20 text-center">
          <Music className="w-16 h-16 text-hyundai-gray-200 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-hyundai-black">활성화된 테마가 없습니다.</h3>
          <p className="text-hyundai-gray-400 mt-2 font-medium">먼저 [월별 테마 설정]에서 테마를 생성하고 활성화해주세요.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-40">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-hyundai-emerald"></div>
        </div>
      ) : theme && (
        <div className="space-y-8">
          {/* New Search Section */}
          <div className="card-premium p-8 border-hyundai-emerald/20 bg-hyundai-emerald/5">
             <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hyundai-gray-300" />
                   <input 
                     type="text"
                     placeholder="추가할 곡명 또는 아티스트를 검색하세요..."
                     className="w-full bg-white border-none pl-12 pr-4 py-4 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-hyundai-emerald/20 transition-all outline-none"
                     value={searchKeyword}
                     onChange={(e) => setSearchKeyword(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleMusicSearch()}
                   />
                </div>
                <button 
                  onClick={() => handleMusicSearch()}
                  disabled={searching || !searchKeyword}
                  className="px-10 py-4 bg-hyundai-emerald text-white text-[14px] font-bold rounded-2xl shadow-lg shadow-hyundai-emerald/10 hover:bg-hyundai-black transition-all disabled:opacity-20"
                >
                  {searching ? '검색 중' : '음원 검색'}
                </button>
             </div>

             {/* Inline Search Results */}
             {(searchResults.length > 0 || searching) && (
               <div className="mt-6 bg-white border border-hyundai-gray-100 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="max-h-[400px] overflow-y-auto divide-y divide-hyundai-gray-50">
                    {searching ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4">
                         <div className="w-8 h-8 border-2 border-hyundai-gray-50 border-t-hyundai-emerald rounded-full animate-spin"></div>
                         <p className="font-bold text-[12px] text-hyundai-gray-300 tracking-widest uppercase">데이터 조회 중...</p>
                      </div>
                    ) : searchResults.map((result, i) => (
                      <button 
                        key={i}
                        onClick={() => selectMusicResult(result)}
                        className="w-full flex items-center gap-6 p-6 text-left hover:bg-hyundai-gray-50 transition-all group"
                      >
                         <div className="w-16 h-16 bg-hyundai-gray-100 rounded-xl overflow-hidden shrink-0 border border-hyundai-gray-50">
                            {result.image ? <img src={result.image} alt="" className="w-full h-full object-cover" /> : <Music className="w-full h-full p-4 text-hyundai-gray-300" />}
                         </div>
                         <div className="flex-grow">
                            <p className="font-bold text-hyundai-black text-lg truncate tracking-tight uppercase">{result.title}</p>
                            <p className="text-[13px] font-bold text-hyundai-gray-400 truncate tracking-wide uppercase">{result.artist}</p>
                         </div>
                         <Plus className="w-5 h-5 text-hyundai-gray-200 group-hover:text-hyundai-emerald transition-colors" />
                      </button>
                    ))}
                  </div>
               </div>
             )}

             {hasSearched && searchResults.length === 0 && !searching && (
               <div className="mt-4 p-8 bg-white/50 border border-dashed border-hyundai-gray-200 rounded-2xl text-center">
                  <p className="text-sm font-bold text-hyundai-gray-400">검색 결과가 없습니다. 우측 상단의 '곡 추가' 버튼을 눌러 직접 입력해주세요.</p>
               </div>
             )}
          </div>

          <div className="space-y-4">
            <div className="bg-hyundai-gray-100/50 p-4 rounded-2xl border border-hyundai-gray-200 flex items-center justify-between text-[11px] font-bold uppercase tracking-normal text-hyundai-gray-400 mb-2">
              <div className="flex gap-10">
                <span className="w-8 ml-2">#</span>
                <span className="w-64">음원 상세 정보 (곡명 / 아티스트)</span>
                <span>유튜브 미디어 링크</span>
              </div>
              <span className="mr-8">순서 조정 및 태스크 관리</span>
            </div>

            {tracks.length === 0 && (
              <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-hyundai-gray-200 text-center">
                 <p className="text-hyundai-gray-400 font-bold italic">플레이리스트가 비어 있습니다. 곡을 추가해보세요.</p>
              </div>
            )}

            {tracks.map((track, i) => (
              <div key={track.id} className="card-premium p-6 group/track hover:border-hyundai-emerald/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-6 flex-grow">
                   <span className="text-2xl font-bold text-hyundai-gray-200 w-8 group-hover/track:text-hyundai-emerald transition-colors">{(i + 1).toString().padStart(2, '0')}</span>
                   
                   <div className="flex flex-col md:flex-row gap-4 flex-grow max-w-2xl">
                      <input 
                        type="text"
                        placeholder="곡 제목"
                        className="bg-hyundai-gray-50 border-none px-4 py-3 rounded-xl text-sm font-bold text-hyundai-black focus:ring-2 focus:ring-hyundai-emerald/20 transition-all outline-none flex-grow"
                        value={track.title}
                        onChange={(e) => {
                          const newTracks = [...tracks];
                          newTracks[i].title = e.target.value;
                          setTracks(newTracks);
                        }}
                      />
                      <input 
                        type="text"
                        placeholder="아티스트"
                        className="bg-hyundai-gray-50 border-none px-4 py-2.5 rounded-xl text-sm font-bold text-hyundai-gray-500 focus:ring-2 focus:ring-hyundai-emerald/20 transition-all outline-none w-48"
                        value={track.artist}
                        onChange={(e) => {
                          const newTracks = [...tracks];
                          newTracks[i].artist = e.target.value;
                          setTracks(newTracks);
                        }}
                      />
                   </div>

                   <div className="flex items-center gap-2 bg-red-50/50 px-3 py-2 rounded-xl border border-red-100/50 flex-grow max-w-xs">
                      <Youtube className="w-4 h-4 text-red-500 shrink-0" />
                      <input 
                        type="text"
                        placeholder="YouTube 영상 URL"
                        className="bg-transparent border-none text-[10px] font-bold text-red-900/40 focus:text-red-900 transition-all outline-none w-full"
                        value={track.youtube_url || ''}
                        onChange={(e) => {
                          const newTracks = [...tracks];
                          newTracks[i].youtube_url = e.target.value;
                          setTracks(newTracks);
                        }}
                      />
                   </div>
                </div>

                <div className="flex items-center gap-2 ml-6">
                  <div className="flex flex-col gap-1 mr-4">
                    <button 
                      disabled={i === 0}
                      onClick={() => moveTrack(i, 'up')}
                      className="p-1.5 bg-hyundai-gray-50 text-hyundai-gray-400 hover:text-hyundai-emerald rounded-lg disabled:opacity-20 transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      disabled={i === tracks.length - 1}
                      onClick={() => moveTrack(i, 'down')}
                      className="p-1.5 bg-hyundai-gray-50 text-hyundai-gray-400 hover:text-hyundai-emerald rounded-lg disabled:opacity-20 transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeTrack(track.id, i)}
                    className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-12 p-8 bg-hyundai-emerald/5 border border-hyundai-emerald/10 rounded-[2.5rem] flex items-start gap-6">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-hyundai-emerald shadow-lg">
           <ListMusic className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-hyundai-black mb-1">플레이리스트 실시간 동기화</h4>
          <p className="text-sm text-hyundai-gray-500 font-medium leading-relaxed">
            여기에서 변경한 사항은 저장 시 즉시 홈페이지 메인에 반영됩니다. <br />
            곡의 순서를 바꾼 뒤 상단의 **[변경사항 저장]** 버튼을 반드시 눌러주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
