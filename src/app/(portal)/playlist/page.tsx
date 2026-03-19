import { sql } from '@vercel/postgres';
import Link from 'next/link';
import { 
  Music, 
  Clock, 
  CheckCircle, 
  Headphones, 
  ChevronRight, 
  PlayCircle, 
  Layers,
  Users,
  Calendar,
  Sparkles
} from 'lucide-react';
import PortalSection from '@/components/PortalSection';

export const dynamic = 'force-dynamic';

export default async function PlaylistPage() {
  // One-time self-healing migration for album covers
  try {
    await sql`ALTER TABLE theme_tracks ADD COLUMN IF NOT EXISTS image TEXT;`;
    await sql`ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS image TEXT;`;
  } catch (e) {
    console.error("Migration check failed:", e);
  }

  // 1. Fetch active theme
  const themeRes = await sql`
    SELECT * FROM monthly_themes 
    WHERE is_active = true 
    AND (deleted_at IS NULL)
    LIMIT 1
  `;
  const activeTheme = themeRes.rows[0];

  let themeTracks: any[] = [];
  let guestRequests: any[] = [];

  if (activeTheme) {
    // 2. Fetch official tracks
    const tracksRes = await sql`
      SELECT * FROM theme_tracks 
      WHERE theme_id = ${activeTheme.id} 
      ORDER BY order_index
    `;
    themeTracks = tracksRes.rows;

    // 3. Fetch approved guest requests
    const requestedRes = await sql`
      SELECT id, title, artist, approved_at, requester_name, image
      FROM song_requests 
      WHERE status = 'approved'
      AND deleted_at IS NULL
      ORDER BY approved_at DESC
      LIMIT 30
    `;
    guestRequests = requestedRes.rows;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Page Header */}
      <section className="relative pt-32 pb-20 border-b border-hyundai-gray-100 bg-hyundai-gray-50/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-hyundai-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="portal-container relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
               <span className="w-10 h-[1px] bg-hyundai-gold"></span>
               <span className="text-hyundai-accent text-[12px] font-bold tracking-[0.4em] uppercase">NOW PLAYING & SCHEDULED</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-hyundai-black tracking-tight leading-tight">
              오늘의 플레이리스트
            </h1>
            <p className="text-lg text-hyundai-gray-500 font-medium break-keep leading-relaxed">
              {activeTheme ? `'${activeTheme.title}' 테마곡들과 고객님들이 직접 신청하신 곡들로 구성된 스카이테라스의 전체 선율입니다.` : "현재 스카이테라스에서 울려 퍼지는 선율들을 확인해보세요."}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Official Theme Playlist */}
      <section className="py-24">
        <div className="portal-container">
           <div className="flex justify-between items-end mb-16">
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-hyundai-gold" />
                    <span className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-widest">OFFICIAL SELECTION</span>
                 </div>
                 <h2 className="text-3xl font-bold text-hyundai-black">{activeTheme?.title || "이달의 테마곡"}</h2>
              </div>
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-12 gap-y-8 md:gap-y-12">
               {themeTracks.map((track, i) => (
                <div key={track.id} className="group flex items-center gap-3 md:gap-6 p-2 md:p-4 hover:bg-hyundai-gray-50 transition-all duration-300">
                   <div className="relative w-14 h-14 md:w-20 md:h-20 bg-hyundai-gray-100 flex items-center justify-center overflow-hidden border border-hyundai-gray-100 group-hover:border-hyundai-gray-200 transition-all shrink-0">
                      {track.image ? (
                        <img src={track.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={track.title} />
                      ) : (
                        <Music className="w-6 h-6 md:w-8 md:h-8 text-hyundai-gray-300 group-hover:scale-110 transition-transform duration-500" />
                      )}
                      <div className="absolute inset-0 bg-hyundai-black/0 group-hover:bg-hyundai-black/5 transition-all"></div>
                      <span className="absolute bottom-1 right-1 text-[8px] md:text-[10px] font-bold text-hyundai-gray-300">{(i+1).toString().padStart(2, '0')}</span>
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] md:text-[16px] font-bold text-hyundai-black truncate tracking-tight uppercase">{track.title}</h4>
                      <p className="text-[10px] md:text-[12px] font-semibold text-hyundai-gray-400 uppercase tracking-wide mt-0.5 md:mt-1">{track.artist}</p>
                   </div>
                </div>
              ))}
              {themeTracks.length === 0 && (
                 <div className="col-span-full py-20 text-center border-2 border-dashed border-hyundai-gray-100 rounded-3xl">
                    <p className="text-hyundai-gray-300 font-bold uppercase tracking-widest text-sm">등록된 테마곡이 없습니다.</p>
                 </div>
              )}
           </div>
        </div>
      </section>

      {/* 3. Guest Requests Playlist */}
      <section className="py-24 bg-hyundai-gray-50/50 border-t border-hyundai-gray-100">
        <div className="portal-container">
           <div className="flex justify-between items-end mb-16">
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-hyundai-gold" />
                    <span className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-widest">GUEST SELECTIONS</span>
                 </div>
                 <h2 className="text-3xl font-bold text-hyundai-black">방문객 신청곡 (최근 승인)</h2>
              </div>
              <Link href="/request" className="hidden md:flex items-center gap-2 text-[14px] font-bold text-hyundai-black hover:text-hyundai-accent transition-colors">
                 나도 신청하기 <ChevronRight className="w-4 h-4" />
              </Link>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-12 gap-y-8 md:gap-y-12">
              {guestRequests.length > 0 ? guestRequests.map((track, i) => (
                <div key={track.id} className="group flex items-center gap-3 md:gap-6 p-2 md:p-4 bg-white border border-hyundai-gray-100 hover:bg-hyundai-gray-50 transition-all">
                   <div className="relative w-14 h-14 md:w-20 md:h-20 bg-hyundai-gray-50 shrink-0 border border-hyundai-gray-100 overflow-hidden">
                      {track.image ? (
                        <img src={track.image} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <Music className="w-6 h-6 text-hyundai-gray-200" />
                        </div>
                      )}
                   </div>
                   <div className="min-w-0 space-y-0.5 md:space-y-1">
                      <h5 className="text-[13px] md:text-[17px] font-bold text-hyundai-black tracking-tight truncate uppercase">{track.title}</h5>
                      <p className="text-[10px] md:text-[12px] font-semibold text-hyundai-gray-400 tracking-wider uppercase truncate">{track.artist}</p>
                      <p className="text-[8px] md:text-[10px] font-bold text-hyundai-accent uppercase tracking-widest truncate">{track.requester_name || "GUEST"} </p>
                   </div>
                </div>
              )) : (
                 <div className="col-span-full py-32 text-center bg-white border border-dashed border-hyundai-gray-100">
                    <p className="text-hyundai-gray-300 font-bold uppercase tracking-widest text-sm">현재 승인된 신청곡이 없습니다.</p>
                 </div>
              )}
           </div>
        </div>
      </section>

      {/* 4. Unified CTA */}
      <section className="bg-hyundai-black py-32 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
        </div>
        <div className="portal-container relative z-10 space-y-10">
           <div className="space-y-4">
              <Sparkles className="w-10 h-10 text-hyundai-gold mx-auto mb-6" />
              <h3 className="text-3xl md:text-5xl font-bold tracking-tight">당신의 선율을 들려주세요</h3>
              <p className="text-hyundai-gray-400 font-medium text-lg">스카이테라스의 무드는 고객님의 참여로 완성됩니다.</p>
           </div>
           <Link href="/request" className="btn-portal-primary h-20 px-16 inline-flex items-center justify-center text-[16px] font-bold">
             지금 음악 신청하기
           </Link>
        </div>
      </section>
    </div>
  );
}
