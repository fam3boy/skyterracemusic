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

      {/* 2. Key Information Block */}
      <InfoBlock />

      {/* 3. Current Live Theme Section */}
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

      {/* 4. Recent Approved Songs (Premium List) */}
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

      {/* 5. Popular Requests & Guidelines */}
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
                { q: "공간에 무드에 맞춘 스마트 선곡", a: "현대백화점 대전점의 공간 무드와 시간대별 분위기를 고려하여 큐레이션 엔진이 작동합니다." },
                { q: "콘텐츠 안전 가이드라인", a: "쾌적한 쇼핑 환경을 위해 부적절한 가사가 포함된 음원은 시스템에서 필터링될 수 있습니다." },
                { q: "조회 번호 보안 및 개인화", a: "발급되는 36자리 고유 번호는 본인 확인을 위한 식별값입니다. 외부에 노출되지 않도록 주의 바랍니다." }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-hyundai-gray-50 border border-hyundai-gray-100 space-y-4">
                  <h6 className="text-[16px] font-bold text-hyundai-black tracking-tight">{item.q}</h6>
                  <p className="text-[13px] text-hyundai-gray-500 font-medium leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 6. Premium CTA Banner */}
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
                조회 및 관리
              </Link>
            </div>
        </div>
      </section>
    </div>
  );
}
