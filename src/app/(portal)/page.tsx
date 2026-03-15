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
      <section className="relative pt-48 pb-32 overflow-hidden border-b border-hyundai-gray-100 min-h-[700px] flex items-center">
        {/* Blurred Background Image */}
        {activeTheme?.background_base64 && (
          <div className="absolute inset-0 z-0">
            <img 
              src={activeTheme.background_base64} 
              className="w-full h-full object-cover blur-[40px] opacity-20 scale-110" 
              alt="" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white"></div>
          </div>
        )}
        
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none z-0">
           <Music className="w-full h-full -rotate-12 translate-x-1/4" />
        </div>
        
        <div className="portal-container relative z-10 w-full">
           <div className="max-w-5xl space-y-12">
              <div className="space-y-6">
                 <span className="text-hyundai-gold text-[14px] font-bold tracking-[0.5em] uppercase block animate-in fade-in slide-in-from-bottom-4 duration-700">이달의 테라스 선율</span>
                  <h1 className="text-5xl md:text-[80px] font-black text-hyundai-black tracking-[-0.06em] leading-[1.1] uppercase break-keep whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {activeTheme ? activeTheme.title : "SEASONAL CURATION"}
                  </h1>
               </div>
               <p className="text-lg md:text-2xl font-medium text-hyundai-gray-500 leading-[1.7] max-w-3xl break-keep animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                  {activeTheme?.description || "현대프리미엄아울렛 대전점 스카이테라스의 공간에 영감을 불어넣는 공식 컬렉션입니다."}
               </p>
              <div className="flex flex-col sm:flex-row gap-6 pt-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                 <Link href="/request" className="btn-portal-primary h-20 px-16 flex items-center justify-center text-[16px]">음악 신청하기</Link>
                 <Link href="/status" className="btn-portal-outline h-20 px-16 flex items-center justify-center text-[16px]">현황 조회하기</Link>
              </div>
           </div>
        </div>
      </section>

      {/* 2. Key Information Block */}
      <InfoBlock />

      {/* 3. Current Live Theme Section */}
      <PortalSection 
        title={activeTheme ? activeTheme.title : "현재 진행 중인 테마"}
        subtitle="이달의 추천 곡"
        moreHref="/request"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {themeTracks.slice(0, 8).map((track, i) => (
            <div key={i} className="card-portal group cursor-pointer overflow-hidden border-none">
              <div className="relative aspect-square bg-[#F5F5F5] transition-all duration-700 group-hover:bg-hyundai-black">
                 <div className="absolute inset-0 flex items-center justify-center p-16">
                    <Music className="w-16 h-16 text-hyundai-gray-200 group-hover:scale-110 group-hover:text-white/20 transition-all duration-700" />
                 </div>
                 <div className="absolute inset-0 bg-hyundai-black/0 group-hover:bg-hyundai-black/40 transition-all flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out" strokeWidth={1} />
                 </div>
                  <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[12px] font-bold text-white uppercase tracking-widest px-4 py-1.5 border border-white/20">Track {(i+1).toString().padStart(2, '0')}</span>
                  </div>
              </div>
              <div className="py-8 space-y-2">
                <h4 className="text-xl font-bold text-hyundai-black truncate uppercase tracking-tighter">{track.title}</h4>
                <p className="text-[14px] font-bold text-hyundai-gray-400 uppercase tracking-widest">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </PortalSection>

      {/* 4. Recent Approved Songs (Premium List) */}
      <PortalSection 
        title="실시간 승인 현황" 
        subtitle="최신 신청곡 업데이트"
        moreHref="/status"
        bgGray
      >
        <div className="bg-white border border-hyundai-gray-100">
           <div className="grid grid-cols-1 divide-y divide-hyundai-gray-50">
             {requestedTracks.map((track, i) => (
               <div key={i} className="group flex items-center justify-between px-12 py-10 hover:bg-hyundai-gray-50 transition-all duration-500">
                 <div className="flex items-center gap-14">
                    <span className="text-3xl font-bold text-hyundai-gray-100 w-12 group-hover:text-hyundai-gold transition-colors duration-500 italic">{(i+1).toString().padStart(2, '0')}</span>
                    <div className="space-y-1">
                       <h5 className="text-2xl font-bold text-hyundai-black uppercase tracking-tight group-hover:translate-x-1 transition-transform duration-500">{track.title}</h5>
                       <p className="text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-[0.2em]">{track.artist}</p>
                    </div>
                 </div>
                  <div className="flex items-center gap-10">
                    <div className="hidden md:flex flex-col items-end gap-1.5">
                       <span className="text-[11px] font-bold text-hyundai-gray-300 uppercase tracking-normal">방송 예정</span>
                       <span className="text-[13px] font-bold text-hyundai-black">{ new Date(track.approved_at).toLocaleDateString() }</span>
                    </div>
                    <div className="h-10 w-px bg-hyundai-gray-100 hidden md:block"></div>
                    <div className="w-12 h-12 rounded-full border border-hyundai-gray-200 flex items-center justify-center group-hover:bg-hyundai-black group-hover:text-white transition-all">
                       <Link href="/status" className="link-portal text-[14px]">
                전체 신청곡 보기 →
             </Link>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </PortalSection>

      {/* 5. Popular Requests & FAQ Mixed (High Contrast) */}
      <section className="py-40 bg-white">
        <div className="portal-container grid grid-cols-1 lg:grid-cols-12 gap-24">
          
          {/* Hall of Fame (5 cols) */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-16">
            <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-8 duration-1000">
              <span className="text-hyundai-gold text-[16px] font-bold tracking-normal uppercase block">
                MUSIC & LIFESTYLE AT THE HYUNDAI
              </span>
              <h3 className="text-5xl font-bold text-hyundai-black uppercase tracking-tighter leading-none">명예의 전당</h3>
            </div>
            <div className="grid grid-cols-1 gap-px bg-hyundai-gray-100 border border-hyundai-gray-100">
              {popularTracks.map((track, i) => (
                <div key={i} className="flex items-center gap-8 group p-8 bg-white hover:bg-hyundai-gray-50 transition-all duration-500">
                   <div className="relative">
                      <div className="w-16 h-16 bg-hyundai-black text-white flex items-center justify-center p-4">
                        <span className="text-xl font-bold italic">0{i + 1}</span>
                      </div>
                      {i === 0 && <Star className="absolute -top-2 -right-2 w-5 h-5 text-hyundai-gold fill-hyundai-gold shadow-sm" />}
                   </div>
                   <div className="flex-grow space-y-1">
                      <h6 className="text-lg font-bold text-hyundai-black uppercase tracking-tight truncate max-w-[200px]">{track.title}</h6>
                      <p className="text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-normal mt-1">{track.artist}</p>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] font-bold text-hyundai-gray-300 uppercase tracking-normal mb-1">신청 횟수</span>
                      <p className="text-2xl font-bold text-hyundai-black italic">{track.request_count}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden xl:block xl:col-span-1 w-px bg-hyundai-gray-100 h-full mx-auto"></div>

          {/* FAQ / Info (6 style) */}
          <div className="lg:col-span-12 xl:col-span-6 space-y-16">
            <div className="space-y-6">
              <span className="text-hyundai-gold text-[14px] font-bold tracking-normal uppercase block">서비스 안내</span>
              <h3 className="text-5xl font-bold text-hyundai-black uppercase tracking-tighter leading-none">운영 가이드</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { q: "신청곡 송출 알고리즘", a: "현대백화점 대전점의 공간 무드와 현재 시간대별 유동인구 텐션을 고려하여 선곡 큐레이션이 작동합니다." },
                { q: "콘텐츠 가이드라인", a: "쾌적한 쇼핑 환경을 위해 저작권이 확보되지 않은 음원이나 부적절한 가사가 포함된 신청곡은 필터링됩니다." },
                { q: "조회 UUID 보안 안내", a: "개인화된 음악 경험을 위해 발급되는 신청곡 UUID는 본인 확인을 위한 고유 식별값이며 외부에 노출되지 않도록 주의 바랍니다." }
              ].map((item, i) => (
                <div key={i} className="p-10 bg-white border border-hyundai-gray-100 hover:border-hyundai-black transition-all cursor-pointer group hover:shadow-2xl hover:shadow-black/[0.03]">
                  <div className="flex justify-between items-center">
                    <h6 className="text-lg font-bold text-hyundai-black uppercase tracking-tight transition-colors group-hover:text-hyundai-gold">{item.q}</h6>
                    <div className="w-10 h-10 border border-hyundai-gray-100 flex items-center justify-center group-hover:bg-hyundai-black group-hover:text-white transition-all">
                       <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                  <p className="text-[13px] text-hyundai-gray-500 font-medium mt-6 leading-relaxed max-w-lg">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
            <div className="pt-10">
              <h3 className="text-4xl md:text-6xl font-bold tracking-tighter text-hyundai-black uppercase mb-12">
               당신의 감성을 <br /> 들려주세요
            </h3>
            <Link href="/request" className="btn-portal-outline border-hyundai-black text-hyundai-black hover:bg-hyundai-black hover:text-white text-[16px]">
               음악 신청하기
            </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Premium CTA Banner */}
      <section className="bg-hyundai-black py-48 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-hyundai-emerald rounded-full blur-[200px]"></div>
           <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-hyundai-gold rounded-full blur-[180px] opacity-20"></div>
        </div>
        <div className="portal-container relative z-10 flex flex-col items-center">
             <span className="text-hyundai-gold text-[16px] font-bold tracking-[0.6em] uppercase mb-10 block animate-in fade-in duration-1000">당신의 음악을 들려주세요</span>
            <h2 className="text-5xl md:text-[80px] font-bold tracking-[-0.05em] max-w-6xl mx-auto leading-[1.1] uppercase mb-16 animate-in fade-in slide-in-from-bottom-10 duration-[1200ms] delay-300">
              현대의 감성으로 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">완성하는 테라스의 선율</span>
            </h2>
            <p className="text-white/60 text-lg font-medium max-w-2xl mx-auto mb-20 leading-relaxed uppercase tracking-[0.1em]">현대프리미엄아울렛 대전점 스카이테라스에서 <br />당신의 특별한 선율을 들려주세요.</p>
           
           <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-2xl">
              <Link href="/request" className="flex-1 h-20 bg-white text-hyundai-black flex items-center justify-center text-[15px] font-bold uppercase tracking-[0.3em] hover:bg-hyundai-gold transition-all transform hover:-translate-y-1 active:scale-95">
                신청곡 등록하기
              </Link>
              <Link href="/status" className="flex-1 h-20 border border-white/20 text-white flex items-center justify-center text-[15px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-hyundai-black transition-all transform hover:-translate-y-1 active:scale-95">
                신청 현황 확인
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
}
