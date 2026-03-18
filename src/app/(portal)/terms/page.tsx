import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen pt-40 pb-20">
      <div className="portal-container max-w-3xl">
        <h1 className="text-4xl font-bold text-hyundai-black mb-12 tracking-tight">서비스 이용약관</h1>
        
        <div className="prose prose-hyundai max-w-none space-y-8 text-hyundai-gray-600 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-hyundai-black mb-4">제 1 조 (목적)</h2>
            <p>
              본 약관은 현대프리미엄아울렛 대전점 스카이테라스가 제공하는 음악 신청 서비스(이하 "서비스")를 이용함에 있어 서비스와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-hyundai-black mb-4">제 2 조 (이용 신청 및 승낙)</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>이용자는 본 약관에 동의하고 신청곡을 등록함으로써 서비스를 이용할 수 있습니다.</li>
              <li>타인의 정보를 도용하거나 부적절한 내용을 포함할 경우 서비스 이용이 제한될 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-hyundai-black mb-4">제 3 조 (서비스의 제공 및 변경)</h2>
            <p>
              서비스는 신청곡 접수, 선곡 관리, 방송 현황 조회 등을 제공합니다. 서비스는 현대프리미엄아울렛의 운영 사정에 따라 예고 없이 변경되거나 중단될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-hyundai-black mb-4">제 4 조 (신청곡 선곡 기준)</h2>
            <p>
              모든 신청곡이 방송되는 것은 아니며, 현장 분위기, 시간대, 음원 권리 관계 및 가사 내용 등에 따라 운영자의 판단하에 선곡에서 제외될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-hyundai-black mb-4">제 5 조 (책임 및 면책)</h2>
            <p>
              서비스는 무료로 제공되며, 천재지변이나 예상치 못한 시스템 오류로 인한 서비스 중단에 대해 책임을 지지 않습니다.
            </p>
          </section>

          <div className="pt-12 border-t border-hyundai-gray-100">
            <Link href="/" className="text-hyundai-accent font-bold hover:underline">홈으로 돌아가기</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
