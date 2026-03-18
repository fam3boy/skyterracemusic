import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen pt-40 pb-20">
      <div className="portal-container max-w-3xl">
        <h1 className="text-4xl font-bold text-hyundai-black mb-12 tracking-tight">개인정보처리방침</h1>
        
        <div className="prose prose-hyundai max-w-none space-y-8 text-hyundai-gray-600 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-hyundai-black mb-4">1. 개인정보의 수집 및 이용 목적</h2>
            <p>
              현대프리미엄아울렛 대전점 스카이테라스 음악 신청 서비스(이하 '서비스')는 다음과 같은 목적을 위해 개인정보를 수집하고 이용합니다. 수집된 개인정보는 정해진 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경될 시에는 사전 동의를 구할 예정입니다.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>신청곡 접수 및 선곡 여부 확인</li>
              <li>중복 신청 방지 및 서비스 운영 관리</li>
              <li>부적절한 신청에 대한 필터링 및 조치</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-hyundai-black mb-4">2. 수집하는 개인정보의 항목</h2>
            <p>서비스 제공을 위해 아래와 같은 최소한의 개인정보를 수집하고 있습니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>필수항목: 신청곡 정보(곡명, 아티스트명), 연락처(선택 사항인 경우 제외)</li>
              <li>자동수집항목: 서비스 이용 기록, 접속 로그, IP 주소</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-hyundai-black mb-4">3. 개인정보의 보유 및 이용 기간</h2>
            <p>
              원칙적으로 개인정보 보존 기간이 경과하거나, 처리 목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다. 단, 서비스 운영 및 통계 분석을 위해 최대 1년간 보관 후 파기합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-hyundai-black mb-4">4. 개인정보의 안전성 확보 조치</h2>
            <p>
              서비스는 이용자의 개인정보를 취급함에 있어 개인정보가 분실, 도난, 누출, 변조 또는 훼손되지 않도록 안전성 확보를 위하여 기술적, 관리적 대책을 강구하고 있습니다.
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
