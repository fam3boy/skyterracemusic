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
          <div className="text-center py-20 uppercase font-black tracking-widest text-hyundai-gray-200">Loading Themes...</div>
        ) : (
          themes.map(theme => (
            <div key={theme.id} className={`card p-6 border-l-8 ${theme.is_active ? 'border-hyundai-emerald' : 'border-hyundai-gray-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-hyundai-emerald bg-hyundai-emerald/10 px-2 py-1 rounded tracking-tighter uppercase">
                      {new Date(theme.theme_month).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                    </span>
                    {theme.is_active && <span className="text-[10px] font-black bg-hyundai-gold text-white px-2 py-1 rounded">ACTIVE</span>}
                  </div>
                  <h3 className="text-xl font-bold text-hyundai-black">{theme.title}</h3>
                  <p className="text-sm text-hyundai-gray-500 mt-1">{theme.description || '설명이 없습니다.'}</p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleToggleActive(theme.id, theme.is_active)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                      theme.is_active 
                        ? 'bg-hyundai-gray-100 text-hyundai-gray-500 border-hyundai-gray-200' 
                        : 'bg-hyundai-emerald text-white border-hyundai-emerald'
                    }`}
                  >
                    {theme.is_active ? '비활성화' : '이달의 테마로 설정'}
                  </button>
                  <button 
                    onClick={() => handleEdit(theme)}
                    className="p-2 border border-hyundai-gray-200 rounded-lg hover:bg-hyundai-gray-100 text-hyundai-gray-500 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editingTheme && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-auto">
            <form onSubmit={handleSave}>
              <div className="p-8 border-b border-hyundai-gray-100">
                <h3 className="font-bold text-2xl">테마 편집</h3>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-hyundai-black mb-2">테마명</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-hyundai-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald"
                      value={editingTheme.title}
                      onChange={(e) => setEditingTheme({ ...editingTheme, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-hyundai-black mb-2">적용 월</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-3 border border-hyundai-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald"
                      value={editingTheme.theme_month}
                      onChange={(e) => setEditingTheme({ ...editingTheme, theme_month: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-hyundai-black mb-2">테마 설명</label>
                  <textarea
                    className="w-full px-4 py-3 border border-hyundai-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald min-h-[100px]"
                    value={editingTheme.description}
                    onChange={(e) => setEditingTheme({ ...editingTheme, description: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-hyundai-black">기본 플레이리스트</label>
                    <button 
                      type="button"
                      onClick={() => setTracks([...tracks, { title: '', artist: '' }])}
                      className="text-xs font-bold text-hyundai-emerald hover:underline"
                    >
                      + 곡 추가
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {tracks.map((track, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-xs font-mono text-hyundai-gray-300 w-4">{i + 1}</span>
                        <input
                          placeholder="곡명"
                          className="flex-grow px-3 py-2 border border-hyundai-gray-200 rounded-lg text-sm"
                          value={track.title}
                          onChange={(e) => {
                            const newTracks = [...tracks];
                            newTracks[i].title = e.target.value;
                            setTracks(newTracks);
                          }}
                        />
                        <input
                          placeholder="아티스트"
                          className="w-32 px-3 py-2 border border-hyundai-gray-200 rounded-lg text-sm"
                          value={track.artist}
                          onChange={(e) => {
                            const newTracks = [...tracks];
                            newTracks[i].artist = e.target.value;
                            setTracks(newTracks);
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => setTracks(tracks.filter((_, idx) => idx !== i))}
                          className="p-2 text-red-300 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-8 bg-hyundai-gray-100 rounded-b-2xl flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingTheme(null)}
                  className="px-6 py-3 font-bold text-hyundai-gray-500 hover:bg-hyundai-gray-200 rounded-xl transition-all"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="px-10 py-3 bg-hyundai-emerald text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
