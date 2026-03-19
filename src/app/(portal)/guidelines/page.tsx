'use client';

import { Headphones, Music, ShieldCheck, AlertCircle, Clock, Heart, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GuidelinesPage() {
  const router = useRouter();

  const sections = [
    {
      title: "선곡 및 운영 정책",
      icon: Music,
      content: [
        { h: "공연 및 방송 시간", p: "스카이테라스 음악 서비스는 아울렛 운영 시간(10:30~20:30) 동안 상시 송출됩니다. 주말 및 공휴일에는 마감 시간이 21:00까지 연장될 수 있습니다." },
        { h: "선곡 프로세스", p: "신청된 곡은 전문 큐레이션팀과 자동 필터링 시스템을 거쳐 매장 분위기, 시간대, 저작권 적합 여부를 판단한 뒤 최종 승인됩니다." },
        { h: "송출 시점", p: "승인된 곡은 '방송 예정' 리스트에 추가되며, 대기 인원에 따라 약 30분~2시간 내외로 송출됩니다." }
      ]
    },
    {
      title: "신청 제한 및 클린 가이드",
      icon: ShieldCheck,
      content: [
        { h: "필터링 대상", p: "욕설, 선정적인 가사, 혐오 표현이 포함된 곡이나 정치적/종교적 색채가 강한 곡은 승인이 거절될 수 있습니다." },
        { h: "음질 기준", p: "공공장소의 청취 환경을 고려하여 음질이 현저히 낮거나 노이즈가 심한 음원은 제외됩니다." },
        { h: "중복 신청 제한", p: "원활한 운영을 위해 동일 인물의 과도한 반복 신청은 스팸으로 간주되어 일시적으로 제한될 수 있습니다." }
      ]
    },
    {
      title: "이용 팁 & 에티켓",
      icon: Heart,
      content: [
        { h: "신청 번호 보관", p: "신청 완료 후 발급되는 고유 번호를 캡처하거나 메모해 두시면 '신청 현황' 메뉴에서 실시간 진행 상태를 확인하실 수 있습니다." },
        { h: "공간에 어울리는 선곡", p: "스카이테라스는 가족, 연인, 친구와 함께하는 휴식 공간입니다. 편안한 분위기의 재즈, 어쿠스틱, 이지리스닝 곡들을 추천드립니다." }
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-hyundai-black py-32 text-center text-white relative overflow-hidden">
        <div className="portal-container relative z-10 space-y-6">
           <button 
             onClick={() => router.back()}
             className="inline-flex items-center gap-2 text-[12px] font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest mb-8"
           >
             <ArrowLeft className="w-4 h-4" /> 이전으로 돌아가기
           </button>
           <h1 className="text-4xl md:text-6xl font-bold tracking-tight">서비스 가이드라인</h1>
           <p className="text-hyundai-gray-300 font-medium max-w-2xl mx-auto text-lg">
             스카이테라스의 음악 서비스는 모두가 즐거운 <br className="hidden md:block" /> 휴식 공간을 만들기 위해 선곡 정책을 운영하고 있습니다.
           </p>
        </div>
        {/* Abstract Background Element */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-white rounded-full"></div>
           <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] border border-white rounded-full"></div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="portal-container max-w-5xl space-y-24">
           {sections.map((section, idx) => (
             <div key={idx} className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="flex items-center gap-6 border-b-2 border-hyundai-black pb-6">
                   <div className="w-14 h-14 bg-hyundai-gray-50 flex items-center justify-center rounded-2xl">
                      <section.icon className="w-7 h-7 text-hyundai-accent" />
                   </div>
                   <h2 className="text-3xl font-bold text-hyundai-black tracking-tight">{section.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {section.content.map((item, i) => (
                     <div key={i} className="space-y-4 p-8 bg-hyundai-gray-50 rounded-3xl group hover:bg-white hover:shadow-2xl hover:shadow-hyundai-gray-100 transition-all duration-500 border border-transparent hover:border-hyundai-gray-100">
                        <div className="flex items-center gap-3">
                           <CheckCircle className="w-5 h-5 text-hyundai-emerald opacity-0 group-hover:opacity-100 transition-opacity" />
                           <h4 className="text-[17px] font-bold text-hyundai-black tracking-tight">{item.h}</h4>
                        </div>
                        <p className="text-[14px] text-hyundai-gray-500 font-medium leading-relaxed break-keep">
                           {item.p}
                        </p>
                     </div>
                   ))}
                </div>
             </div>
           ))}

           {/* Legal Banner */}
           <div className="p-12 bg-hyundai-gold/5 border border-hyundai-gold/20 rounded-[2rem] space-y-6 text-center">
              <AlertCircle className="w-10 h-10 text-hyundai-gold mx-auto" />
              <div className="space-y-2">
                 <h3 className="text-xl font-bold text-hyundai-black">저작권 및 송출 관련 고지</h3>
                 <p className="text-sm text-hyundai-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
                    본 서비스는 현대프리미엄아울렛 매장 내 디지털 사이니지를 통해 연동되며, 별도의 음원 소유권을 제공하지 않습니다. 모든 선곡 데이터는 운영 기록으로 보관되며, 부적절한 사용 시 이용이 차단될 수 있습니다.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 bg-hyundai-gray-50 text-center">
         <div className="portal-container space-y-12">
            <h2 className="text-3xl md:text-4xl font-bold text-hyundai-black tracking-tight">이제 당신의 곡을 들려주세요</h2>
            <Link href="/request" className="btn-portal-primary h-20 px-16 inline-flex items-center justify-center text-[16px] font-bold">
               지금 음악 신청하기
            </Link>
         </div>
      </section>
    </div>
  );
}
