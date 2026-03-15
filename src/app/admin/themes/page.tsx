'use client';

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';

export default function ThemesPage() {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTheme, setEditingTheme] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);

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

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-hyundai-black">월별 테마 설정</h2>
          <p className="text-hyundai-gray-500 mt-1">월간 테마 및 기본 플레이리스트 관리</p>
        </div>
        <button 
          onClick={() => { setEditingTheme({ title: '', theme_month: new Date().toISOString().slice(0, 7) + '-01', description: '' }); setTracks([]); }}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          새 테마 추가
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-20 uppercase font-bold tracking-widest text-hyundai-gray-200 animate-pulse">테마 정보를 불러오는 중...</div>
        ) : themes.length === 0 ? (
          <div className="text-center py-20 text-hyundai-gray-400 italic">등록된 테마가 없습니다.</div>
        ) : (
          themes.map(theme => (
            <div key={theme.id} className={`card p-0 overflow-hidden border-none shadow-xl transition-all hover:scale-[1.01] ${theme.is_active ? 'ring-2 ring-hyundai-emerald ring-offset-4 ring-offset-hyundai-gray-100' : ''}`}>
              <div className="flex flex-col md:flex-row">
                <div className={`p-8 md:w-2/3 ${theme.is_active ? 'bg-white' : 'bg-hyundai-gray-100/50'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[12px] font-bold tracking-widest text-hyundai-emerald bg-hyundai-emerald/5 px-3 py-1.5 rounded-full border border-hyundai-emerald/20 uppercase">
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
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        운영 기간: {theme.start_date ? new Date(theme.start_date).toLocaleDateString() : '미지정'} ~ {theme.end_date ? new Date(theme.end_date).toLocaleDateString() : '미지정'}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-8 md:w-1/3 bg-hyundai-black flex flex-col justify-center gap-3">
                  <button 
                    onClick={() => handleToggleActive(theme.id, theme.is_active)}
                    className={`w-full py-4 rounded-xl text-[12px] font-bold transition-all uppercase tracking-widest ${
                      theme.is_active 
                        ? 'bg-hyundai-gray-800 text-hyundai-gray-400 hover:text-white' 
                        : 'bg-hyundai-emerald text-white hover:bg-white hover:text-hyundai-emerald shadow-lg shadow-hyundai-emerald/20'
                    }`}
                  >
                    {theme.is_active ? '비활성화하기' : '현재 테마로 설정'}
                  </button>
                  <button 
                    onClick={() => handleEdit(theme)}
                    className="w-full py-4 bg-white/10 text-white rounded-xl text-[12px] font-bold hover:bg-white hover:text-hyundai-black transition-all uppercase tracking-widest border border-white/20"
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
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
            <form onSubmit={handleSave} className="flex flex-col h-full">
              <div className="p-8 border-b border-hyundai-gray-100 flex justify-between items-center bg-hyundai-gray-100/30">
                <h3 className="font-bold text-2xl text-hyundai-black uppercase tracking-tight">테마 기획 및 구성</h3>
                <button type="button" onClick={() => setEditingTheme(null)} className="text-hyundai-gray-400 hover:text-red-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-hyundai-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6 md:col-span-2">
                    <div>
                      <label className="block text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-[0.2em] mb-2">테마명</label>
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
                      <label className="block text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-[0.2em] mb-2">테마 상세 설명</label>
                      <textarea
                        className="w-full px-5 py-4 bg-hyundai-gray-100/50 border border-hyundai-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-hyundai-emerald/10 focus:border-hyundai-emerald transition-all min-h-[100px] text-sm font-medium"
                        placeholder="테마에 대한 배경이나 선정 이유를 입력하세요..."
                        value={editingTheme.description}
                        onChange={(e) => setEditingTheme({ ...editingTheme, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-[0.2em] mb-2">대상 월 (Month)</label>
                    <input
                      type="date"
                      required
                      className="w-full px-5 py-4 bg-hyundai-gray-100/50 border border-hyundai-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-hyundai-emerald/10 focus:border-hyundai-emerald transition-all text-sm font-bold"
                      value={editingTheme.theme_month ? new Date(editingTheme.theme_month).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingTheme({ ...editingTheme, theme_month: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-[0.2em] mb-2">시작일</label>
                      <input
                        type="date"
                        className="w-full px-4 py-4 bg-hyundai-gray-100/50 border border-hyundai-gray-200 rounded-2xl outline-none text-xs font-bold"
                        value={editingTheme.start_date || ''}
                        onChange={(e) => setEditingTheme({ ...editingTheme, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-[0.2em] mb-2">종료일</label>
                      <input
                        type="date"
                        className="w-full px-4 py-4 bg-hyundai-gray-100/50 border border-hyundai-gray-200 rounded-2xl outline-none text-xs font-bold"
                        value={editingTheme.end_date || ''}
                        onChange={(e) => setEditingTheme({ ...editingTheme, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b-2 border-hyundai-black pb-4">
                    <label className="text-[12px] font-bold text-hyundai-black uppercase tracking-[0.2em]">테마 기본 플레이리스트</label>
                      <button 
                        type="button"
                        onClick={() => setTracks([...tracks, { title: '', artist: '', youtube_url: '' }])}
                        className="px-5 py-3 bg-hyundai-emerald text-white text-[11px] font-bold rounded-lg shadow-md hover:scale-105 transition-all uppercase tracking-widest"
                      >
                        + 신규 곡 추가
                      </button>
                  </div>
                  
                  <div className="space-y-4">
                    {tracks.length === 0 && (
                      <p className="text-center py-10 text-hyundai-gray-400 text-xs italic">등록된 기본 곡이 없습니다.</p>
                    )}
                    {tracks.map((track, i) => (
                      <div key={i} className="flex flex-col gap-3 p-5 bg-hyundai-gray-100/50 rounded-2xl border border-hyundai-gray-200 relative group/track">
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
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>
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
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                            </button>
                            <button 
                              type="button"
                              onClick={() => setTracks(tracks.filter((_, idx) => idx !== i))}
                              className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-6 shrink-0 flex justify-center">
                             <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                           </div>
                           <input
                            placeholder="유튜브 미디어 URL (선택 사항)"
                            className="flex-grow px-4 py-2.5 bg-white border border-hyundai-gray-200 rounded-lg text-[10px] font-bold outline-none focus:border-red-400 transition-all text-hyundai-gray-500"
                            value={track.youtube_url || ''}
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
                  className="px-8 py-5 text-[12px] font-bold text-hyundai-gray-400 hover:text-white transition-all uppercase tracking-widest"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="px-12 py-5 bg-hyundai-emerald text-white text-[12px] font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase tracking-[0.2em]"
                >
                  테마 저장 및 적용
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
