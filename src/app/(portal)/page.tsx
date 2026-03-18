import Link from 'next/link';
import { sql } from '@vercel/postgres';
import { 
  Music, Clock, MapPin, Send, Search, CheckCircle, 
  Headphones, Sparkles, AlertCircle, ChevronRight, PlayCircle, Star, ArrowUpRight
} from 'lucide-react';
import InfoBlock from '@/components/InfoBlock';
import PortalSection from '@/components/PortalSection';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch active theme
  const themeRes = await sql`
    SELECT * FROM monthly_themes 
    WHERE is_active = true 
    AND (deleted_at IS NULL)
    LIMIT 1
  `;
  const activeTheme = themeRes.rows[0];

  let themeTracks: any[] = [];
  let requestedTracks: any[] = [];
  let popularTracks: any[] = [];

  if (activeTheme) {
    const tracksRes = await sql`
      SELECT * FROM theme_tracks 
      WHERE theme_id = ${activeTheme.id} 
      ORDER BY order_index
    `;
    themeTracks = tracksRes.rows;

    const requestedRes = await sql`
      SELECT id, title, artist, approved_at, 'request' as type 
      FROM song_requests 
      WHERE status = 'approved'
      AND deleted_at IS NULL
      ORDER BY approved_at DESC
      LIMIT 8
    `;
    requestedTracks = requestedRes.rows;

    // Simulate popular tracks based on request counts
    const popularRes = await sql`
      SELECT title, artist, COUNT(*) as request_count
      FROM song_requests
      WHERE deleted_at IS NULL
      GROUP BY title, artist
      ORDER BY request_count DESC
      LIMIT 5
    `;
    popularTracks = popularRes.rows;
  }

  return (
    <div className="bg-white">
      {/* 1. Sophisticated Theme Hero */}
      <section className="relative pt-32 md:pt-48 pb-32 overflow-hidden border-b border-hyundai-gray-100 min-h-[600px] flex items-center bg-white">
        {/* Blurred Background Image */}
        {activeTheme?.background_base64 && (
          <div className="absolute inset-0 z-0">
            <img 
              src={activeTheme.background_base64} 
              className="w-full h-full object-cover blur-[4px] opacity-40" 
              alt="" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/90"></div>
          </div>
        )}
        
        <div className="portal-container relative z-10 w-full text-left">
           <div className="max-w-4xl space-y-12">
              <div className="space-y-4">
                 <span className="text-hyundai-accent text-[14px] font-bold tracking-[0.4em] uppercase block">THIS MONTH'S CURATION</span>
                  <h1 className="text-5xl md:text-[80px] font-bold text-hyundai-black tracking-[-0.04em] leading-[1.1] break-keep">
                    {activeTheme ? activeTheme.title : "스카이테라스 선율"}
                  </h1>
               </div>
               <p className="text-lg md:text-xl font-medium text-hyundai-gray-500 leading-relaxed max-w-2xl break-keep">
                  {activeTheme?.description || "현대프리미엄아울렛 대전점 스카이테라스의 공간에 영감을 불어넣는 공식 컬렉션입니다."}
               </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                 <Link href="/request" className="btn-portal-primary h-20 px-12 flex items-center justify-center text-[16px]">음악 신청하기</Link>
                 <Link href="/status" className="btn-portal-outline h-20 px-12 flex items-center justify-center text-[16px]">신청 현황 조회</Link>
              </div>
           </div>
        </div>
      </section>

      {/* 2. Brand Introduction Section */}
      <section id="intro" className="py-32 bg-white">
        <div className="portal-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
              <span className="text-hyundai-accent text-[14px] font-bold tracking-[0.4em] uppercase block">ABOUT SKY TERRACE</span>
              <h2 className="text-4xl md:text-5xl font-bold text-hyundai-black leading-[1.2] tracking-tight break-keep">
                공간에 선율을 더하는 <br />
                당신만의 특별한 시간
              </h2>
              <p className="text-lg text-hyundai-gray-500 leading-relaxed font-medium break-keep">
                현대프리미엄아울렛 대전점 3F 스카이테라스는 바쁜 일상 속에서 잠시 멈추어 휴식을 취할 수 있는 도심 속 오아시스입니다. <br /><br />
                우리는 이곳을 찾는 고객들이 직접 선곡한 음악을 통해 공간과 교감하고, 소중한 사람들과 더 깊은 추억을 쌓을 수 있기를 바랍니다. 당신이 고른 한 곡의 음악이 이곳의 무드를 완성합니다.
              </p>
              <div className="pt-4 flex items-center gap-6">
                 <div className="flex flex-col">
                    <span className="text-2xl font-bold text-hyundai-black">365</span>
                    <span className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-widest">Days of Music</span>
                 </div>
                 <div className="w-px h-10 bg-hyundai-gray-100"></div>
                 <div className="flex flex-col">
                    <span className="text-2xl font-bold text-hyundai-black">3F</span>
                    <span className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-widest">Location</span>
                 </div>
              </div>
            </div>
            <div className="relative aspect-[4/3] bg-hyundai-gray-50 overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-24 h-24 text-hyundai-gray-100 animate-pulse" />
               </div>
               <img src="https://images.unsplash.com/photo-1514525253361-b83f85dfd75c?q=80&w=1974&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Space Mood" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Information Block */}
      <InfoBlock />

      {/* 4. Current Live Theme Section (Playlist) */}
      <div id="playlist">
        <PortalSection 
          title={activeTheme ? activeTheme.title : "현재 진행 중인 테마"}
          subtitle="SEASONAL SELECTIONS"
          moreHref="/request"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {themeTracks.slice(0, 8).map((track, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-square bg-hyundai-gray-50 overflow-hidden">
                   <div className="absolute inset-0 flex items-center justify-center opacity-40">
                      <Music className="w-12 h-12 text-hyundai-gray-200 group-hover:scale-110 transition-transform duration-700" />
                   </div>
                   {/* Hover Overlay */}
                   <div className="absolute inset-0 bg-hyundai-black/0 group-hover:bg-hyundai-black/5 transition-all flex items-center justify-center">
                   </div>
                </div>
                <div className="py-6 space-y-1 text-left">
                  <h4 className="text-[17px] font-bold text-hyundai-black truncate tracking-tight">{track.title}</h4>
                  <p className="text-[13px] font-semibold text-hyundai-gray-400 tracking-wide uppercase">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </PortalSection>
      </div>

      {/* 5. Recent Approved Songs (Premium List) */}
      <PortalSection 
        title="실시간 승인 현황" 
        subtitle="LIVE SELECTION UPDATES"
        moreHref="/status"
        bgGray
      >
        <div className="bg-white border border-hyundai-gray-100 divide-y divide-hyundai-gray-50">
           {requestedTracks.map((track, i) => (
             <div key={i} className="group flex items-center justify-between p-8 hover:bg-hyundai-gray-50 transition-all duration-300">
               <div className="flex items-center gap-10">
                  <span className="text-[14px] font-bold text-hyundai-gray-300 w-8">{ (i+1).toString().padStart(2, '0') }</span>
                  <div className="space-y-1 text-left">
                     <h5 className="text-[18px] font-bold text-hyundai-black tracking-tight">{track.title}</h5>
                     <p className="text-[12px] font-semibold text-hyundai-gray-400 tracking-wider uppercase">{track.artist}</p>
                  </div>
               </div>
                <div className="flex items-center gap-8">
                  <div className="hidden md:flex flex-col items-end gap-1 text-right">
                     <span className="text-[10px] font-bold text-hyundai-accent uppercase tracking-widest">방송 예정</span>
                     <span className="text-[13px] font-semibold text-hyundai-black">{ new Date(track.approved_at).toLocaleDateString() }</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-hyundai-gray-200 group-hover:text-hyundai-black transition-colors" />
               </div>
             </div>
           ))}
        </div>
      </PortalSection>

      {/* 6. Popular Requests & Guidelines */}
      <section className="py-32 bg-white">
        <div className="portal-container grid grid-cols-1 lg:grid-cols-2 gap-24">
          
          <div className="space-y-12 text-left">
            <div className="space-y-4">
              <span className="text-hyundai-accent text-[12px] font-bold tracking-[0.4em] uppercase block">HALL OF FAME</span>
              <h3 className="text-4xl font-bold text-hyundai-black tracking-tight">명예의 전당</h3>
            </div>
            <div className="border border-hyundai-gray-100 divide-y divide-hyundai-gray-100">
              {popularTracks.map((track, i) => (
                <div key={i} className="flex items-center gap-6 p-6 hover:bg-hyundai-gray-50 transition-colors">
                   <div className="w-12 h-12 bg-hyundai-black text-white flex items-center justify-center font-bold italic text-sm">
                     0{i + 1}
                   </div>
                   <div className="flex-grow min-w-0">
                      <h6 className="text-[16px] font-bold text-hyundai-black truncate tracking-tight">{track.title}</h6>
                      <p className="text-[12px] font-semibold text-hyundai-gray-400 truncate uppercase tracking-wide">{track.artist}</p>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] font-bold text-hyundai-gray-300 block mb-0.5">COUNT</span>
                      <p className="text-xl font-bold text-hyundai-black italic">{track.request_count}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-12 text-left">
            <div className="space-y-4">
              <span className="text-hyundai-accent text-[12px] font-bold tracking-[0.4em] uppercase block">GUIDELINES</span>
              <h3 className="text-4xl font-bold text-hyundai-black tracking-tight">운영 안내</h3>
            </div>
            <div className="space-y-6">
              {[
                { q: "스마트 큐레이션 엔진 운영", a: "현대백화점의 전문 음악 큐레이터와 AI 엔진이 시간대별 방문객의 연령대와 매장 무드를 분석하여 최적의 선곡 시점을 결정합니다." },
                { q: "콘텐츠 안전 및 클린 정책", a: "공공장소의 쾌적함을 위해 부장절한 표현, 혐오 표현, 정치적 색채가 짙은 곡은 시스템에서 자동 필터링되며 수동 검토를 거쳐 제외됩니다." },
                { q: "실시간 방송 알림 (준비중)", a: "신청하신 곡이 선정되면 고객님의 고유 번호를 통해 실시간 방송 예정 시각을 본 서비스에서 확인하실 수 있습니다." },
                { q: "개인정보 보호 정책", a: "수집된 정보는 익명화되어 선곡 지표로만 활용되며, 고유 번호 분실 시 복구가 어려우니 반드시 화면을 캡처하거나 번호를 보관해 주세요." }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-hyundai-gray-50 border border-hyundai-gray-100 space-y-4">
                  <h6 className="text-[16px] font-bold text-hyundai-black tracking-tight">{item.q}</h6>
                  <p className="text-[13px] text-hyundai-gray-500 font-medium leading-relaxed break-keep">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Location & Space Section */}
      <section id="location" className="py-32 bg-white overflow-hidden">
        <div className="portal-container">
           <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-16">
              <div className="space-y-4 text-left">
                <span className="text-hyundai-accent text-[12px] font-bold tracking-[0.4em] uppercase block">SPACE GUIDE</span>
                <h3 className="text-4xl font-bold text-hyundai-black tracking-tight">공간 안내</h3>
              </div>
              <p className="text-hyundai-gray-400 font-medium text-[15px] max-w-md text-left md:text-right">
                현대프리미엄아울렛 대전점을 방문하시는 모든 고객에게 열려있는 휴식 공간입니다.
              </p>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 relative h-[400px] bg-hyundai-gray-50 flex items-center justify-center group overflow-hidden border border-hyundai-gray-100">
                 <div className="absolute inset-0 bg-[#e5e7eb] flex items-center justify-center opacity-50">
                    <MapPin className="w-12 h-12 text-hyundai-accent opacity-20" />
                 </div>
                 <div className="absolute bottom-8 left-8 right-8 bg-white p-6 shadow-xl text-left border border-hyundai-gray-100 z-10">
                    <h5 className="text-[16px] font-bold text-hyundai-black mb-1">현대프리미엄아울렛 대전점 3F 스카이테라스</h5>
                    <p className="text-[13px] text-hyundai-gray-500 font-medium">대전광역시 유성구 용산동 테크노중앙로 123</p>
                 </div>
              </div>
              <div className="bg-hyundai-gray-50 p-10 flex flex-col justify-between text-left border border-hyundai-gray-100">
                 <div className="space-y-8">
                    <div className="space-y-2">
                       <span className="text-[11px] font-bold text-hyundai-accent tracking-widest uppercase">How to find</span>
                       <h6 className="text-[18px] font-bold text-hyundai-black">오시는 길</h6>
                       <p className="text-[14px] text-hyundai-gray-500 leading-relaxed font-medium">
                          아울렛 본관 3층 회전목마 인근 에스컬레이터를 이용해 테라스 광장으로 오실 수 있습니다.
                       </p>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[11px] font-bold text-hyundai-accent tracking-widest uppercase">Operating Hours</span>
                       <h6 className="text-[18px] font-bold text-hyundai-black">이용 시간</h6>
                       <p className="text-[14px] text-hyundai-gray-500 leading-relaxed font-medium">
                          10:30 - 20:30 (금~일 21:00까지) <br />
                          * 아울렛 운영 시간과 동일하게 운영됩니다.
                       </p>
                    </div>
                 </div>
                 <Link href="https://map.naver.com/v5/search/%ED%98%84%EB%8C%80%ED%94%84%EB%A6%AC%EB%AF%B8%EC%97%84%EC%95%84%EC%9A%B8%EB%A0%9B%20%EB%8C%80%EC%A0%84%EC%A0%90" target="_blank" className="flex items-center gap-2 text-[13px] font-bold text-hyundai-black group">
                    네이버 지도로 보기 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
           </div>
        </div>
      </section>

      {/* 8. Premium CTA Banner */}
      <section className="bg-hyundai-black py-40 text-center text-white relative overflow-hidden">
        <div className="portal-container relative z-10 space-y-12">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
              당신의 감성으로 완성하는 <br />
              <span className="text-hyundai-accent">스카이테라스의 소리</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/request" className="btn-portal-primary h-20 px-16 flex items-center justify-center text-[15px] font-bold">
                지금 신청하기
              </Link>
              <Link href="/status" className="h-20 px-16 border border-white/20 text-white flex items-center justify-center text-[15px] font-bold hover:bg-white hover:text-hyundai-black transition-all">
                신청 현황 확인
              </Link>
            </div>
        </div>
      </section>
    </div>
  );
}
