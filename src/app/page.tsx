import Link from 'next/link';
import { sql } from '@vercel/postgres';
import { Music, Clock, MapPin, Send, Search, CheckCircle, Headphones, Sparkles, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch active theme and its tracks
  const themeRes = await sql`
    SELECT * FROM monthly_themes 
    WHERE is_active = true 
    AND (deleted_at IS NULL)
    LIMIT 1
  `;
  const activeTheme = themeRes.rows[0];

  let tracks: any[] = [];
  if (activeTheme) {
    const tracksRes = await sql`
      SELECT * FROM theme_tracks 
      WHERE theme_id = ${activeTheme.id} 
      ORDER BY order_index
    `;
    tracks = tracksRes.rows;
  }

  return (
    <div className="space-y-16 pb-24">
      {/* Hero Section */}
      <section className="relative h-[550px] -mt-8 -mx-4 md:-mx-8 overflow-hidden flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-hyundai-black">
          <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1514525253361-bee243870d22?q=80&w=2000')] bg-cover bg-center scale-105 animate-slow-zoom"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-hyundai-black/80 via-hyundai-black/20 to-hyundai-black"></div>
        </div>
        
        <div className="relative z-10 text-center space-y-8 px-6 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-hyundai-emerald/20 backdrop-blur-md border border-hyundai-emerald/30 text-hyundai-emerald text-[10px] font-black tracking-[0.3em] rounded-full mb-4 uppercase">
            <Sparkles className="w-3 h-3" />
            Sky Terrace Music
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.1] drop-shadow-2xl">
            {activeTheme ? activeTheme.title : '오늘의 하늘, 오늘의 음악'}
          </h1>
          <p className="text-lg md:text-2xl text-hyundai-gray-200 font-medium opacity-90 max-w-2xl mx-auto leading-relaxed">
            {activeTheme?.description || '현대프리미엄아울렛 대전점 스카이테라스에서 들려오는 특별한 선율을 만나보세요.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
            <Link href="/request" className="bg-hyundai-emerald hover:bg-white hover:text-hyundai-black text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-hyundai-emerald/30 transition-all flex items-center justify-center gap-3">
              신청곡 보내기
              <Send className="w-6 h-6" />
            </Link>
            <Link href="/status" className="bg-white/10 backdrop-blur-xl text-white border-2 border-white/20 px-12 py-5 rounded-2xl font-black hover:bg-white hover:text-hyundai-black transition-all text-xl flex items-center justify-center gap-3">
              나의 신청 현황
              <Search className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Playlist Section */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <Headphones className="w-5 h-5 text-hyundai-emerald" />
               <span className="text-xs font-black text-hyundai-emerald uppercase tracking-widest">Selected Tracks</span>
            </div>
            <h2 className="text-4xl font-black text-hyundai-black tracking-tighter">Theme Playlist</h2>
            <p className="text-hyundai-gray-400 font-bold mt-1">이달의 테마에 맞춰 큐레이션된 추천곡입니다.</p>
          </div>
          <div className="bg-hyundai-gray-100 px-5 py-2.5 rounded-2xl border border-hyundai-gray-200 flex items-center gap-3">
            <Clock className="w-4 h-4 text-hyundai-gray-400" />
            <span className="text-sm font-black text-hyundai-black">
              {new Date().toLocaleDateString('ko-KR', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="card-premium overflow-hidden border-2">
          {tracks.length > 0 ? (
            <div className="divide-y divide-hyundai-gray-100">
              {tracks.map((track, i) => (
                <div key={track.id} className="group flex items-center p-7 hover:bg-hyundai-gray-50 transition-all cursor-default">
                  <span className="w-12 text-hyundai-gray-200 font-black text-2xl tracking-tighter group-hover:text-hyundai-emerald transition-colors">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-grow ml-4">
                    <p className="font-black text-hyundai-black text-xl group-hover:translate-x-1 transition-transform tracking-tight">{track.title}</p>
                    <p className="text-hyundai-gray-400 font-bold text-sm">{track.artist}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-hyundai-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                    <div className="w-2.5 h-2.5 bg-hyundai-emerald rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 px-10 text-center bg-hyundai-gray-50/50">
              <div className="w-20 h-20 bg-white shadow-xl rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-hyundai-gray-100 animate-bounce duration-[3000ms]">
                <Music className="w-10 h-10 text-hyundai-gray-200" />
              </div>
              <h3 className="text-2xl font-black text-hyundai-black mb-2">플레이리스트가 준비 중입니다</h3>
              <p className="text-hyundai-gray-400 font-medium max-w-xs mx-auto leading-relaxed">곧 아름다운 테마곡들로 채워질 예정입니다. <br />먼저 듣고 싶은 곡을 신청해 보는 건 어떨까요?</p>
              <Link href="/request" className="inline-flex items-center gap-2 mt-8 text-hyundai-emerald font-black hover:underline uppercase tracking-widest text-sm">
                Go to request <Send className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-8">
        <div className="p-10 bg-hyundai-black rounded-[2.5rem] text-white relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-hyundai-gold" />
              공간 안내
            </h3>
            <p className="text-hyundai-gray-400 font-medium leading-loose mb-8">
              스카이테라스는 현대프리미엄아울렛 대전점 3층에 위치한 고품격 야외 휴식 공간입니다. <br />
              고객님의 소중한 사연이 담긴 신청곡은 매일 정규 방송 시간에 송출되어 특별한 분위기를 연출합니다.
            </p>
            <div className="flex items-center gap-3 text-hyundai-gold font-black bg-white/5 py-3 px-5 rounded-2xl border border-white/10 w-fit">
              <Clock className="w-5 h-5" />
              <span>운영시간: 10:30 - 21:00</span>
            </div>
          </div>
        </div>

        <div className="p-10 bg-hyundai-gray-50 border-2 border-hyundai-gray-100 rounded-[2.5rem]">
          <h3 className="text-2xl font-black text-hyundai-black mb-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-hyundai-emerald" />
            신청 안내
          </h3>
          <ul className="space-y-5">
            {[
              "부적절한 가사나 광고성 사연이 포함된 곡은 제외될 수 있습니다.",
              "승인된 곡은 매주 목요일 19:00 시스템에 공식 반영됩니다.",
              "신청 결과는 발급된 고유 번호를 통해 실시간 조회가 가능합니다.",
              "저작권 이슈가 있는 곡은 방송팀 판단하에 대체될 수 있습니다."
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-hyundai-emerald shrink-0 mt-0.5" />
                <span className="text-hyundai-gray-500 font-bold leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
