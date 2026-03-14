import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 bg-hyundai-emerald/10 text-hyundai-emerald text-sm font-semibold rounded-full mb-4">
          3F SKY TERRACE MUSIC
        </span>
        <h2 className="text-3xl font-bold text-hyundai-black mb-4 italic">
          "지금, 당신의 순간을 노래하세요"
        </h2>
        <p className="text-hyundai-gray-500">
          현대프리미엄아울렛 대전점 스카이테라스에서<br />
          여러분의 감성을 담은 신청곡을 들려드립니다.
        </p>
      </div>

      <div className="bg-hyundai-emerald rounded-2xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-emerald-200 text-sm font-medium mb-1">3월의 테마</p>
          <h3 className="text-4xl font-black mb-4 tracking-tight">봄의 왈츠 (Spring Waltz)</h3>
          <div className="h-1 w-20 bg-hyundai-gold mb-6"></div>
          
          <div className="space-y-4">
            <p className="text-sm opacity-80 leading-relaxed">
              따스한 햇살과 함께 전해지는 설렘을 노래에 담아보세요.<br />
              오늘의 테마곡 리스트를 확인하고 신청곡을 남겨주세요.
            </p>
            
            <div className="pt-4 flex flex-col gap-3">
              <Link href="/request" className="bg-white text-hyundai-emerald py-4 px-6 rounded-xl font-bold text-center hover:bg-hyundai-gray-100 transition-colors shadow-lg">
                신청곡 등록하기
              </Link>
              <Link href="/status" className="bg-hyundai-emerald border border-white/30 text-white py-4 px-6 rounded-xl font-bold text-center hover:bg-white/10 transition-colors">
                내 신청현황 확인
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-hyundai-gold opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="space-y-6">
        <h4 className="text-lg font-bold text-hyundai-black flex items-center gap-2">
          <span className="w-1 h-5 bg-hyundai-emerald"></span>
          테마 플레이리스트
        </h4>
        
        <div className="divide-y divide-hyundai-gray-200 border-t border-b border-hyundai-gray-200">
          {[
            { title: "Lilac", artist: "IU" },
            { title: "봄 안녕 봄", artist: "IU" },
            { title: "우연히 봄", artist: "로꼬, 유주" },
            { title: "벚꽃 엔딩", artist: "버스커 버스커" },
          ].map((song, i) => (
            <div key={i} className="py-4 flex items-center justify-between group cursor-default">
              <div>
                <p className="font-bold text-hyundai-black group-hover:text-hyundai-emerald transition-colors">{song.title}</p>
                <p className="text-sm text-hyundai-gray-500">{song.artist}</p>
              </div>
              <div className="text-hyundai-gray-200 group-hover:text-hyundai-gold transition-colors">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
