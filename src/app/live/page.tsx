'use client';

import { useEffect, useState, useRef } from 'react';
import { Music, Disc, MessageCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import Head from 'next/head';

export default function LiveBroadcastPage() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTracks();
    const pollInterval = setInterval(() => {
      fetchTracks();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    if (tracks.length > 0) {
      const rotateInterval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % tracks.length);
      }, 15000);

      return () => clearInterval(rotateInterval);
    }
  }, [tracks]);

  // Auto-scroll the active chat bubble into view
  useEffect(() => {
    if (chatRef.current) {
      const activeElement = document.getElementById(`bubble-${currentIndex}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentIndex]);

  async function fetchTracks() {
    try {
      const res = await fetch('/api/live?limit=15');
      if (res.ok) {
        const data = await res.json();
        // Sort ascending by time so the newest is at the bottom, like a real messenger
        setTracks(data.sort((a: any, b: any) => new Date(a.approved_at).getTime() - new Date(b.approved_at).getTime()));
      }
    } catch (err) {
      console.error('Failed to fetch live tracks', err);
    } finally {
      if (loading) setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-hyundai-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center text-center">
        <Disc className="w-32 h-32 text-hyundai-gray-200 mb-8 animate-[spin_10s_linear_infinite]" />
        <h1 className="text-4xl font-black text-hyundai-black mb-4 tracking-widest uppercase">THE HYUNDAI | SKY TERRACE</h1>
        <p className="text-xl text-hyundai-gray-500 tracking-widest uppercase font-bold">현재 방송 대기 중인 신청곡이 없습니다</p>
      </div>
    );
  }

  const currentTrack = tracks[currentIndex];

  return (
    <>
      <Head>
        <title>Live Broadcast | Sky Terrace</title>
      </Head>
      <div className="min-h-screen bg-[#E2E5CC]/20 flex overflow-hidden">
        
        {/* LEFT SIDE: Now Playing (40% Width) */}
        <div className="w-[40%] bg-hyundai-black text-white p-16 flex flex-col relative shadow-[20px_0_40px_rgba(0,0,0,0.1)] z-20">
           {/* Animated Background Gradients in Dark section */}
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
             <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] rounded-full bg-hyundai-gold/20 blur-[150px] animate-[pulse_10s_ease-in-out_infinite]"></div>
           </div>

           <div className="relative z-10 flex justify-between items-center mb-16">
              <div>
                 <span className="text-white text-2xl font-black italic tracking-tighter uppercase">SKY TERRACE</span>
                 <p className="text-hyundai-gold text-xs font-bold uppercase tracking-widest mt-1">Live DJ Station</p>
              </div>
              <div className="px-4 py-1.5 bg-red-600 rounded-full flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span className="text-[11px] font-bold text-white uppercase tracking-widest">ON AIR</span>
              </div>
           </div>

           <div className="flex-1 flex flex-col items-center justify-center relative z-10">
              <div className="relative w-[320px] h-[320px] 2xl:w-[480px] 2xl:h-[480px] mb-12">
                 {/* Spinning Record Plate */}
                 <div className="absolute -right-20 top-4 bottom-4 w-full bg-[#111] rounded-full shadow-2xl animate-[spin_4s_linear_infinite] flex items-center justify-center border-[8px] border-[#0a0a0a] overflow-hidden z-0 pointer-events-none">
                    <div className="w-[100px] h-[100px] rounded-full border border-hyundai-gold/20 bg-hyundai-black flex items-center justify-center">
                      <div className="w-4 h-4 bg-black rounded-full"></div>
                    </div>
                 </div>
                 
                 {/* Album Cover */}
                 <div key={currentIndex} className="relative z-10 w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 fade-in duration-500">
                    {currentTrack?.image ? (
                      <img src={currentTrack.image} className="w-full h-full object-cover" alt="Album Cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full bg-hyundai-gray-50 text-hyundai-gray-300">
                        <Music className="w-24 h-24 mb-4" />
                      </div>
                    )}
                 </div>
              </div>

              <div key={`info-${currentIndex}`} className="text-center animate-in slide-in-from-bottom-8 fade-in flex flex-col items-center w-full px-8">
                 <h2 className="text-4xl 2xl:text-5xl font-black uppercase tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 line-clamp-2 mb-4">
                   {currentTrack?.title}
                 </h2>
                 <p className="text-xl 2xl:text-2xl font-bold text-hyundai-gold uppercase tracking-tight">
                   {currentTrack?.artist}
                 </p>
                 <div className="mt-8 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                   <p className="text-sm font-bold text-white uppercase tracking-widest">
                     Now Playing
                   </p>
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT SIDE: Messenger UI (60% Width) */}
        <div className="w-[60%] bg-[#E5E0D5] relative flex flex-col z-10">
          
          {/* Header of Messenger */}
          <div className="h-24 bg-white/80 backdrop-blur-xl border-b border-black/5 flex items-center px-12 z-20 shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-hyundai-black rounded-2xl flex items-center justify-center text-hyundai-gold">
                 <MessageCircle className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-hyundai-black tracking-tight">스카이테라스 신청곡 보드</h3>
                  <p className="text-xs font-bold text-hyundai-gray-500">지금을 즐겁게 해줄 플레이리스트</p>
               </div>
            </div>
            <div className="ml-auto text-xs font-bold text-hyundai-gray-400 bg-black/5 px-4 py-2 rounded-xl">
               총 {tracks.length}곡 라이브 방송 중
            </div>
          </div>

          {/* Chat Messages Area */}
          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto p-12 space-y-12 pb-[300px] scroll-smooth"
            style={{ 
               backgroundImage: `radial-gradient(circle at center, rgba(0,0,0,0.03) 1px, transparent 1px)`, 
               backgroundSize: '24px 24px' 
            }}
          >
            {tracks.map((track, i) => {
              const isActive = i === currentIndex;
              return (
                <div 
                  id={`bubble-${i}`}
                  key={track.id} 
                  className={cn(
                    "flex flex-col gap-2 max-w-[85%] transition-all duration-700",
                    isActive ? "opacity-100 scale-100 drop-shadow-xl" : "opacity-60 scale-95 origin-left blur-[0.5px]"
                  )}
                >
                   {/* Sender Name */}
                   <div className="flex items-center gap-2 px-2">
                     <div className="font-bold text-sm text-hyundai-gray-600 bg-white/50 px-3 py-1 rounded-full border border-black/5 shadow-sm">
                       {track.requester_name}
                     </div>
                     <span className="text-[10px] font-bold text-hyundai-gray-400">
                       {new Date(track.approved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                   </div>

                   {/* Chat Bubble Base (Story) */}
                   <div className={cn(
                      "px-8 py-6 rounded-3xl rounded-tl-sm text-lg xl:text-xl font-medium leading-relaxed shadow-lg relative",
                      isActive 
                        ? "bg-hyundai-black text-white" 
                        : "bg-white text-hyundai-black border border-black/5"
                   )}>
                      {isActive && <div className="absolute inset-0 bg-gradient-to-r from-hyundai-gold/10 to-transparent rounded-3xl pointer-events-none"></div>}
                      <p className="relative z-10 whitespace-pre-wrap word-break">
                        {track.story || "이 음악을 틀어주시면 정말 감사하겠습니다! 🎵"}
                      </p>
                   </div>

                   {/* Attached Music Card inside Chat */}
                   <div className={cn(
                      "mt-2 ml-4 self-start flex items-center gap-4 p-3 pr-6 rounded-2xl shadow-md border animate-in slide-in-from-left-4 fade-in duration-500",
                      isActive ? "bg-white border-hyundai-gold/30" : "bg-white/80 border-transparent blur-[1px]"
                   )}>
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-hyundai-gray-100">
                         {track.image ? (
                           <img src={track.image} className="w-full h-full object-cover" alt="" />
                         ) : (
                           <Music className="w-full h-full p-3 text-hyundai-gray-300" />
                         )}
                      </div>
                      <div>
                         <p className="text-sm font-bold text-hyundai-black uppercase tracking-tight line-clamp-1">{track.title}</p>
                         <p className="text-[11px] font-bold text-hyundai-gray-500 uppercase tracking-tight">{track.artist}</p>
                      </div>
                   </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Fade Mask & Fake Input Box */}
          <div className="absolute bottom-0 left-0 w-full pointer-events-none">
            <div className="h-32 bg-gradient-to-t from-[#E5E0D5] to-transparent"></div>
            <div className="h-24 bg-[#E5E0D5] flex items-center px-12 border-t border-black/5">
               <div className="w-full bg-white rounded-full h-14 border border-black/5 shadow-inner flex items-center px-6 gap-3 opacity-50">
                  <span className="text-hyundai-gray-400 text-sm font-bold tracking-tight">신청 사연이 계속해서 도착하고 있습니다...</span>
                  <Send className="w-5 h-5 text-hyundai-gray-300 ml-auto" />
               </div>
            </div>
          </div>
          
        </div>

      </div>
    </>
  );
}
