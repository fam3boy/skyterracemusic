'use client';

import { useEffect, useState } from 'react';
import { Music, Disc } from 'lucide-react';
import { cn } from '@/lib/utils';
import Head from 'next/head';

export default function LiveBroadcastPage() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    fetchTracks();
    const pollInterval = setInterval(() => {
      fetchTracks();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    if (tracks.length > 0) {
      const rotateInterval = setInterval(() => {
        setFlip(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % tracks.length);
          setFlip(false);
        }, 500); // Wait half a second while flipped
      }, 15000); // Rotate song every 15 seconds

      return () => clearInterval(rotateInterval);
    }
  }, [tracks]);

  async function fetchTracks() {
    try {
      const res = await fetch('/api/live?limit=10');
      if (res.ok) {
        const data = await res.json();
        setTracks(data);
      }
    } catch (err) {
      console.error('Failed to fetch live tracks', err);
    } finally {
      if (loading) setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-hyundai-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-hyundai-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="min-h-screen bg-hyundai-black flex flex-col items-center justify-center text-center">
        <Disc className="w-32 h-32 text-hyundai-gold/20 mb-8 animate-[spin_10s_linear_infinite]" />
        <h1 className="text-4xl font-black text-white mb-4 tracking-widest uppercase">THE HYUNDAI | SKY TERRACE</h1>
        <p className="text-xl text-hyundai-gold tracking-widest uppercase font-bold">현재 방송 중인 플레이리스트 설정 중입니다</p>
      </div>
    );
  }

  const currentTrack = tracks[currentIndex];

  return (
    <>
      <Head>
        <title>Live Broadcast | Sky Terrace</title>
      </Head>
      <div className="min-h-screen bg-hyundai-black overflow-hidden relative flex flex-col items-center justify-center p-12 lg:p-24">
        {/* Animated Background Gradients (Aesthetic) */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-hyundai-gold/10 blur-[120px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-hyundai-emerald/10 blur-[120px] animate-[pulse_8s_ease-in-out_infinite] pointer-events-none"></div>

        {/* Top Branding */}
        <div className="absolute top-16 left-16 right-16 flex justify-between items-center z-50">
          <div className="flex items-center gap-6">
            <span className="text-white text-3xl font-black italic tracking-tighter uppercase">THE HYUNDAI | SKY TERRACE</span>
            <div className="px-5 py-2 bg-hyundai-gold/20 border border-hyundai-gold/40 rounded-full flex items-center gap-3 backdrop-blur-md">
              <div className="w-2.5 h-2.5 rounded-full bg-hyundai-gold animate-pulse"></div>
              <span className="text-[14px] font-bold text-hyundai-gold uppercase tracking-widest">Live ON-AIR</span>
            </div>
          </div>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[14px]">Now Playing : Request #{currentIndex + 1}</p>
        </div>

        {/* Main Content (with transition) */}
        <div className={cn(
          "w-full max-w-7xl flex flex-col lg:flex-row items-center gap-20 transition-all duration-700 ease-in-out z-10",
          flip ? "opacity-0 scale-95 translate-y-8" : "opacity-100 scale-100 translate-y-0"
        )}>
           
           {/* Left Cover/Disk */}
           <div className="relative w-[400px] h-[400px] xl:w-[500px] xl:h-[500px] shrink-0">
              {/* Spinning Record Plate behind cover */}
              <div className="absolute -right-24 top-4 bottom-4 w-full bg-stone-900 rounded-full shadow-2xl animate-[spin_4s_linear_infinite] flex items-center justify-center border-[12px] border-black overflow-hidden pointer-events-none z-0">
                 <div className="w-[120px] h-[120px] rounded-full border-2 border-hyundai-gold/30 bg-hyundai-black"></div>
              </div>
              
              {/* Album Cover */}
              <div className="relative z-10 w-full h-full bg-hyundai-gray-50 rounded-[2rem] shadow-[-20px_0_40px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 flex items-center justify-center">
                 {currentTrack.image ? (
                   <img src={currentTrack.image} className="w-full h-full object-cover" alt="Album Cover" />
                 ) : (
                   <div className="flex flex-col items-center justify-center bg-hyundai-gray-50 text-hyundai-gray-300">
                     <Music className="w-32 h-32 mb-4" />
                     <p className="text-2xl font-bold uppercase tracking-widest text-hyundai-gray-400">SKY TERRACE</p>
                   </div>
                 )}
              </div>
           </div>

           {/* Right Info */}
           <div className="flex flex-col flex-grow text-white min-w-0 z-10">
              <div className="space-y-6 mb-12">
                 <h2 className="text-6xl xl:text-8xl font-black uppercase tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 drop-shadow-lg line-clamp-2">
                   {currentTrack.title}
                 </h2>
                 <p className="text-3xl xl:text-5xl font-medium text-hyundai-gold uppercase tracking-tight">
                   {currentTrack.artist}
                 </p>
                 <div className="inline-flex items-center gap-3 py-2 px-6 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
                   <p className="text-lg font-bold text-white uppercase tracking-widest drop-shadow-md">
                     Requested by <span className="text-hyundai-gold ml-2 underline underline-offset-4 decoration-hyundai-gold/50">{currentTrack.requester_name}</span>
                   </p>
                 </div>
              </div>
              
              {/* Story Quoted Block */}
              {currentTrack.story && (
                <div className="relative mt-8 mt-auto group animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-300">
                  <div className="absolute -left-6 -top-6 text-hyundai-gold/20 font-serif text-[120px] leading-none pointer-events-none">"</div>
                  <div className="relative z-10 pl-10 border-l-4 border-hyundai-gold/50">
                     <p className="text-2xl xl:text-3xl font-medium text-white/90 leading-[1.6] whitespace-pre-wrap line-clamp-4">
                       {currentTrack.story}
                     </p>
                  </div>
                </div>
              )}
           </div>

        </div>

      </div>
    </>
  );
}
