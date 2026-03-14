import Link from 'next/link';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch active theme and its tracks
  const themeRes = await sql`
    SELECT * FROM monthly_themes 
    WHERE is_active = true 
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
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[450px] -mt-8 -mx-4 md:-mx-8 overflow-hidden flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-hyundai-black">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1514525253361-bee243870d22?q=80&w=2000')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-hyundai-black/60 via-transparent to-hyundai-black"></div>
        </div>
        
        <div className="relative z-10 text-center space-y-6 px-4 max-w-3xl">
          <div className="inline-block px-4 py-1.5 bg-hyundai-emerald text-xs font-bold tracking-[0.2em] rounded-full mb-2">
            SKY TERRACE MUSIC
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight drop-shadow-2xl">
            {activeTheme ? activeTheme.title : '오늘의 하늘, 오늘의 음악'}
          </h1>
          <p className="text-lg md:text-xl text-hyundai-gray-200 font-medium opacity-90">
            {activeTheme?.description || '현대프리미엄아울렛 대전점 3F 스카이테라스에서 들려오는 특별한 선율'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/request" className="btn-primary px-10 py-4 text-lg">
              신청곡 보내기
            </Link>
            <Link href="/status" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-xl font-bold hover:bg-white/20 transition-all text-lg">
              신청 현황 확인
            </Link>
          </div>
        </div>
      </section>

      {/* Playlist Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-hyundai-black tracking-tighter">Theme Playlist</h2>
            <p className="text-hyundai-gray-500 font-medium">이달의 테마 공식 플레이리스트</p>
          </div>
          <span className="text-xs font-bold text-hyundai-emerald bg-hyundai-emerald/10 px-3 py-1.5 rounded-full uppercase tracking-widest">
            {new Date().toLocaleDateString('ko-KR', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-hyundai-gray-100">
          {tracks.length > 0 ? (
            <div className="divide-y divide-hyundai-gray-100">
              {tracks.map((track, i) => (
                <div key={track.id} className="group flex items-center p-6 hover:bg-hyundai-gray-50 transition-all cursor-default">
                  <span className="w-10 text-hyundai-gray-300 font-mono italic font-black group-hover:text-hyundai-emerald transition-colors">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-grow ml-4">
                    <p className="font-bold text-hyundai-black text-lg group-hover:translate-x-1 transition-transform">{track.title}</p>
                    <p className="text-hyundai-gray-500 font-medium">{track.artist}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-hyundai-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <div className="w-2 h-2 bg-hyundai-emerald rounded-full animate-ping"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center">
              <p className="text-hyundai-gray-300 font-black text-2xl uppercase tracking-tighter mb-2">Playlist Empty</p>
              <p className="text-hyundai-gray-500">현재 등록된 테마 곡이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-6">
        <div className="p-8 bg-hyundai-black rounded-3xl text-white">
          <h3 className="text-xl font-bold mb-4">공간 안내</h3>
          <p className="text-hyundai-gray-400 text-sm leading-relaxed mb-6">
            스카이테라스는 대전점 3층에 위치한 야외 휴식 공간입니다. <br />
            고객님의 소중한 사연이 담긴 신청곡은 매일 정규 방송 시간에 송출됩니다.
          </p>
          <div className="flex items-center gap-2 text-hyundai-gold font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>운영시간: 10:30 - 21:00</span>
          </div>
        </div>
        <div className="p-8 bg-hyundai-gray-50 border border-hyundai-gray-200 rounded-3xl">
          <h3 className="text-xl font-bold text-hyundai-black mb-4">신청 안내</h3>
          <ul className="space-y-3 text-sm text-hyundai-gray-500 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-hyundai-emerald">✓</span>
              <span>부적절한 가사가 포함된 곡은 제외될 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-hyundai-emerald">✓</span>
              <span>당일 신청곡은 익일 방송 시간에 반영됩니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-hyundai-emerald">✓</span>
              <span>신청 결과는 UUID를 통해 확인 가능합니다.</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
