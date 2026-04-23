'use client';

import { useEffect, useState } from 'react';
import { Music, PlayCircle, SkipForward, Clock, HardDrive, ListEnd } from 'lucide-react';

export default function LiveControlPage() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchQueue() {
    try {
      const res = await fetch('/api/live?limit=30');
      if (res.ok) {
        setTracks(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch queue', err);
    } finally {
      if (loading) setLoading(false);
    }
  }

  async function handleSkip(id: string) {
    if (!confirm('이 곡을 송출 완료(넘기기) 처리하시겠습니까?\n대형 스크린(TV) 화면도 즉시 다음 곡으로 넘어갑니다.')) return;
    setSkipping(true);
    try {
      const res = await fetch('/api/admin/live-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'play_next' })
      });
      if (res.ok) {
        await fetchQueue();
      }
    } catch (err) {
      alert('오류가 발생했습니다.');
    } finally {
      setSkipping(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-hyundai-black border-t-transparent animate-spin"></div></div>;
  }

  const nowPlaying = tracks[0];
  const upNext = tracks.slice(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-hyundai-black tracking-tighter uppercase font-sans">
             방송 송출 제어 센터 (DJ Desk)
          </h2>
          <p className="text-[12px] font-bold text-hyundai-gray-400 mt-1 uppercase tracking-normal">매장 텔레비전 및 전광판 무선 컨트롤 시스템</p>
        </div>
        
        <div className="flex items-center gap-4">
           <a href="/live" target="_blank" className="px-6 py-3 bg-white border border-hyundai-gray-200 text-xs font-bold text-hyundai-black rounded-full hover:bg-hyundai-gray-50 uppercase tracking-widest transition-colors flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>새 창에서 무대 화면 보기
           </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* NOW PLAYING CARD */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-hyundai-black text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-hyundai-gold/20 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex items-center gap-3 mb-10">
               <div className="px-4 py-1.5 bg-red-600 rounded-full flex items-center gap-2 animate-pulse">
                 <div className="w-2 h-2 rounded-full bg-white"></div>
                 <span className="text-[11px] font-bold text-white uppercase tracking-widest">LIVE ON AIR</span>
               </div>
               <span className="text-xs font-bold text-hyundai-gray-400 uppercase tracking-widest">현재 모니터 송출 중인 곡</span>
            </div>

            {nowPlaying ? (
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                 <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-2xl overflow-hidden bg-stone-900 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    {nowPlaying.image ? (
                       <img src={nowPlaying.image} className="w-full h-full object-cover" alt="" />
                    ) : (
                       <div className="flex items-center justify-center h-full"><Music className="w-16 h-16 text-white/20" /></div>
                    )}
                 </div>
                 <div className="flex-1 min-w-0 flex flex-col pt-4">
                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight line-clamp-2">{nowPlaying.title}</h3>
                    <p className="text-xl text-hyundai-gold font-bold uppercase tracking-tight mt-2">{nowPlaying.artist}</p>
                    
                    <div className="mt-8 space-y-4">
                       <p className="text-sm font-bold text-white/50 uppercase tracking-widest border-b border-white/10 pb-2">사연 및 메세지</p>
                       <p className="text-white/90 text-sm leading-relaxed max-h-32 overflow-y-auto pr-2">
                         {nowPlaying.story || "(사연 없이 음악만 신청된 건입니다)"}
                       </p>
                    </div>

                    <div className="mt-8 pt-6 flex gap-4 w-full border-t border-white/10">
                       <button 
                         disabled={skipping}
                         onClick={() => handleSkip(nowPlaying.id)}
                         className="flex-1 py-4 bg-white hover:bg-hyundai-gray-100 text-hyundai-black rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                       >
                         {skipping ? '처리 중...' : <><SkipForward className="w-5 h-5" /> 다음 곡으로 강제 넘기기 (송출 종료)</>}
                       </button>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-hyundai-gray-500 relative z-10">
                 <HardDrive className="w-16 h-16 mb-4 opacity-50" />
                 <p className="text-lg font-bold uppercase tracking-widest">승인된 대기열이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* UP NEXT QUEUE */}
        <div className="col-span-1 bg-white border border-hyundai-gray-200 rounded-[2rem] p-8 shadow-sm flex flex-col h-[600px] lg:h-auto">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-hyundai-gray-100">
             <h3 className="text-lg font-bold uppercase tracking-tighter text-hyundai-black flex items-center gap-2">
               <ListEnd className="w-5 h-5 text-hyundai-gray-400" />
               방송 대기열 (Queue)
             </h3>
             <span className="text-xs font-bold text-hyundai-gray-400 bg-hyundai-gray-50 px-3 py-1 rounded-full">{upNext.length}곡 대기 중</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
            {upNext.length === 0 ? (
               <div className="text-center text-hyundai-gray-300 text-xs font-bold uppercase mt-10">대기 중인 곡이 없습니다.</div>
            ) : (
               upNext.map((track, i) => (
                 <div key={track.id} className="flex gap-4 p-4 rounded-xl hover:bg-hyundai-gray-50 transition-colors border border-transparent hover:border-hyundai-gray-100 group">
                    <div className="w-16 h-16 bg-hyundai-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                       {track.image ? <img src={track.image} className="w-full h-full object-cover" alt="" /> : <Music className="w-full h-full p-4 text-hyundai-gray-300" />}
                       <div className="absolute top-1 left-1 w-5 h-5 bg-black/60 backdrop-blur-sm shadow-sm rounded-md flex items-center justify-center text-[9px] font-black text-white">
                         {i + 1}
                       </div>
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                       <p className="font-bold text-hyundai-black text-sm uppercase tracking-tight truncate">{track.title}</p>
                       <p className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-tight mt-0.5">{track.artist}</p>
                       <div className="flex items-center gap-1 mt-2 text-[10px] text-hyundai-gray-300 font-bold uppercase">
                          <Clock className="w-3 h-3" />
                          승인됨: {new Date(track.approved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </div>
                 </div>
               ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
