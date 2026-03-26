'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Download, 
  Printer, 
  Calendar, 
  Users, 
  Trophy,
  History,
  CheckCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { exportSongsToExcel } from '@/lib/excel';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [params.id]);

  async function fetchReport() {
    try {
      const res = await fetch(`/api/admin/reports/${params.id}`);
      if (res.ok) {
        setReport(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setLoading(false);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-hyundai-black"></div>
      </div>
    );
  }

  if (!report) return <div>리포트를 찾을 수 없습니다.</div>;

  const { summary_data: summary } = report;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 print:p-0 print:space-y-6">
      {/* 1. Header & Navigation */}
      <div className="flex justify-between items-center print:hidden">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[13px] font-bold text-hyundai-gray-400 hover:text-hyundai-black transition-colors uppercase tracking-tight"
        >
          <ChevronLeft className="w-4 h-4" />
          목록으로 돌아가기
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              if (summary?.songs) {
                const dateStr = new Date(report.created_at).toLocaleDateString().split('.').join('_').trim();
                exportSongsToExcel(summary.songs, `Music_Report_${dateStr}.xlsx`);
              }
            }}
            className="flex items-center gap-3 px-6 py-4 bg-hyundai-emerald text-white text-[14px] font-bold uppercase tracking-tight hover:bg-hyundai-black transition-all"
          >
            <Download className="w-4 h-4" />
            Excel 다운로드
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-3 px-6 py-4 bg-hyundai-black text-white text-[14px] font-bold uppercase tracking-tight hover:bg-hyundai-gold hover:text-hyundai-black transition-all"
          >
            <Printer className="w-4 h-4" />
            PDF 저장 / 인쇄
          </button>
        </div>
      </div>

      {/* 2. Report Document Header */}
      <div className="bg-white border border-hyundai-gray-200 p-12 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-hyundai-gray-50 -rotate-45 translate-x-16 -translate-y-16"></div>
        
        <div className="space-y-8 relative z-10">
           <div className="flex justify-between items-start">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <span className="bg-hyundai-black text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest">공식 리포트</span>
                    <span className="text-hyundai-gray-300 font-bold text-[10px] uppercase tracking-widest">번호. {report.id.slice(0, 8)}</span>
                 </div>
                 <h1 className="text-4xl lg:text-5xl font-bold text-hyundai-black tracking-tighter leading-tight uppercase underline decoration-hyundai-gold decoration-4 underline-offset-8">
                    SKY TERRACE <br />
                    주간 신청곡 리포트
                 </h1>
              </div>
              <div className="text-right">
                 <p className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-widest mb-1">리포트 생성 일시</p>
                 <p className="text-lg font-black text-hyundai-black">{new Date(report.created_at).toLocaleDateString()}</p>
              </div>
           </div>

           <div className="flex flex-wrap gap-12 pt-8 border-t border-hyundai-gray-100">
              <div className="space-y-2">
                 <p className="text-[11px] font-bold text-hyundai-gray-300 uppercase tracking-widest">집계 기간</p>
                 <div className="flex items-center gap-3 text-[15px] font-bold text-hyundai-black">
                    <Calendar className="w-4 h-4 text-hyundai-gold" />
                    {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                 </div>
              </div>
              <div className="space-y-2">
                 <p className="text-[11px] font-bold text-hyundai-gray-300 uppercase tracking-widest">총 승인 건수</p>
                 <div className="flex items-center gap-3 text-[15px] font-bold text-hyundai-black">
                    <CheckCircle className="w-4 h-4 text-hyundai-gold" />
                    {summary?.totalCount || 0} 건 승인됨
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 3. Summary KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-hyundai-gray-200 border border-hyundai-gray-200">
        {/* Top Songs */}
        <div className="bg-white p-12">
            <h3 className="text-lg font-bold text-hyundai-black uppercase tracking-tight mb-8 flex items-center gap-3">
               <Trophy className="w-5 h-5 text-hyundai-gold" /> 인기 신청곡 TOP 5
            </h3>
            <div className="space-y-4">
               {summary?.topSongs?.length > 0 ? summary.topSongs.map((s: any, i: number) => (
                 <div key={i} className="flex items-center gap-6 p-4 bg-hyundai-gray-50 border border-hyundai-gray-100 group transition-all">
                    <span className="text-xl font-bold text-hyundai-gray-200 w-8">0{i+1}</span>
                    <div className="flex-1">
                       <p className="font-bold text-sm text-hyundai-black uppercase truncate">{s.title}</p>
                       <p className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-normal leading-none mt-1">{s.artist}</p>
                    </div>
                 </div>
               )) : <p className="text-sm font-bold text-hyundai-gray-300 uppercase">기록된 데이터가 없습니다.</p>}
            </div>
        </div>

        {/* Top Artists */}
        <div className="bg-white p-12">
            <h3 className="text-lg font-bold text-hyundai-black uppercase tracking-tight mb-8 flex items-center gap-3">
               <Users className="w-5 h-5 text-hyundai-gold" /> 인기 아티스트
            </h3>
            <div className="space-y-6">
               {summary?.topArtists?.length > 0 ? summary.topArtists.map((a: any, i: number) => (
                 <div key={i} className="flex justify-between items-end border-b border-hyundai-gray-100 pb-4">
                    <div className="space-y-1">
                       <p className="text-sm font-black text-hyundai-black uppercase">{a.name}</p>
                       <div className="w-48 h-1.5 bg-hyundai-gray-100 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-hyundai-black" 
                             style={{ width: `${(a.count / summary.totalCount) * 100}%` }}
                          ></div>
                       </div>
                    </div>
                    <span className="text-xl font-black text-hyundai-black italic">{a.count} <span className="text-[10px] text-hyundai-gray-300 uppercase not-italic">회 신청</span></span>
                 </div>
               )) : <p className="text-sm font-bold text-hyundai-gray-300 uppercase">기록된 데이터가 없습니다.</p>}
            </div>
        </div>
      </div>

      {/* 4. Full Song List */}
      <div className="bg-white border border-hyundai-gray-200 overflow-hidden">
        <div className="p-10 border-b border-hyundai-gray-200 flex justify-between items-center">
           <h3 className="text-lg font-bold text-hyundai-black uppercase tracking-tight flex items-center gap-3">
              <History className="w-5 h-5 text-hyundai-gold" /> 상세 신청곡 내역
           </h3>
           <span className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-widest">전체 {summary?.songs?.length || 0}건</span>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-hyundai-gray-50 text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-widest border-b border-hyundai-gray-100">
                    <th className="px-10 py-6">번호</th>
                    <th className="px-10 py-6">곡 제목</th>
                    <th className="px-10 py-6">아티스트</th>
                    <th className="px-10 py-6">신청자</th>
                    <th className="px-10 py-6">승인 일시</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-hyundai-gray-50">
                 {summary?.songs?.length > 0 ? summary.songs.map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-hyundai-gray-50/50 transition-colors">
                       <td className="px-10 py-6 text-[14px] font-bold text-hyundai-gray-300">{(i+1).toString().padStart(3, '0')}</td>
                       <td className="px-10 py-6 text-[14px] font-bold text-hyundai-black uppercase tracking-tight">{s.title}</td>
                       <td className="px-10 py-6 text-[13px] font-bold text-hyundai-gray-500 uppercase">{s.artist}</td>
                       <td className="px-10 py-6 text-[13px] font-bold text-hyundai-gray-500">{s.requester || '익명'}</td>
                       <td className="px-10 py-6 text-[12px] font-bold text-hyundai-gray-400 uppercase">{new Date(s.approved_at).toLocaleString('ko-KR')}</td>
                    </tr>
                 )) : (
                    <tr>
                       <td colSpan={5} className="px-10 py-24 text-center text-sm font-bold text-hyundai-gray-300 uppercase tracking-widest">상세 리포트 데이터가 없습니다.</td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
