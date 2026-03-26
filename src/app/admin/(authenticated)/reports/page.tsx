'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ChevronRight, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Download,
  Search,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { exportSongsToExcel } from '@/lib/excel';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ReportsListPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Date range for manual generation
  const [manualMode, setManualMode] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateNow() {
    let confirmMsg = '현재 시점까지 승인된 신청곡들을 집계하여 새로운 리포트를 생성하시겠습니까?';
    let url = '/api/cron/weekly-mail?forceCurrent=true';

    if (manualMode) {
      if (!startDate || !endDate) {
        alert('시작일과 종료일을 모두 선택해주세요.');
        return;
      }
      confirmMsg = `${startDate} ~ ${endDate} 기간의 신청곡을 집계하여 리포트를 생성하시겠습니까?`;
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }

    if (!confirm(confirmMsg)) return;
    
    setGenerating(true);
    try {
      const res = await fetch(url);
      if (res.ok) {
        alert('리포트 생성이 완료되었습니다.');
        fetchReports();
      } else {
        const error = await res.text();
        alert('생성 실패: ' + error);
      }
    } catch (err) {
      console.error('Failed to generate report', err);
      alert('오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-hyundai-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-hyundai-black tracking-tighter uppercase flex items-center gap-3">
             주간 자동 리포트 아카이브
             <span className="w-2.5 h-2.5 rounded-full bg-hyundai-gold"></span>
          </h2>
          <p className="text-sm font-bold text-hyundai-gray-400 mt-1 uppercase tracking-normal">리포트 로그를 관리하고 수동으로 생성할 수 있습니다.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4 bg-white p-4 border border-hyundai-gray-100 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 pr-4 border-r border-hyundai-gray-100 mr-2">
            <button 
              onClick={() => setManualMode(!manualMode)}
              className={cn(
                "px-4 py-2 rounded-xl text-[11px] font-bold transition-all uppercase tracking-tight",
                manualMode ? "bg-hyundai-black text-white" : "bg-hyundai-gray-50 text-hyundai-gray-400"
              )}
            >
              기간 수동 설정
            </button>
          </div>

          {manualMode && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2 fade-in duration-300">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-hyundai-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-hyundai-gold"
              />
              <span className="text-hyundai-gray-300 font-bold">~</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-hyundai-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-hyundai-gold"
              />
            </div>
          )}

          <button 
            onClick={handleGenerateNow}
            disabled={generating}
            className={cn(
              "btn-portal-primary h-12 px-8 flex items-center gap-3 text-[12px] font-black",
              generating && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", generating && "animate-spin")} />
            {generating ? '생성 중...' : manualMode ? '선택 기간 생성' : '즉시 생성 (최근 7일)'}
          </button>
        </div>
      </div>

      {/* 2. Utility Bar */}
      <div className="bg-white border border-hyundai-gray-200 p-6 flex justify-between items-center">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-3 py-2 border-b border-hyundai-black">
              <FileText className="w-4 h-4 text-hyundai-black" />
              <span className="text-[13px] font-bold uppercase tracking-tight">전체 리포트 ({reports.length})</span>
           </div>
        </div>
      </div>

      {/* 3. Report List */}
      <div className="bg-white border border-hyundai-gray-200 divide-y divide-hyundai-gray-100">
        <div className="grid grid-cols-12 gap-4 p-6 bg-hyundai-gray-50 border-b border-hyundai-gray-200 text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-widest">
           <div className="col-span-1">No</div>
           <div className="col-span-4">리포트 제목 (집계 기간)</div>
           <div className="col-span-2 text-center">승인 건수</div>
           <div className="col-span-2 text-center">상태</div>
           <div className="col-span-2 text-center">생성 일시</div>
           <div className="col-span-1"></div>
        </div>

        {reports.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-hyundai-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-hyundai-gray-200">
               <FileText className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-hyundai-gray-400 uppercase">생성된 리포트가 없습니다.</p>
          </div>
        ) : (
          reports.map((report, i) => (
            <Link 
              key={report.id} 
              href={`/admin/reports/${report.id}`}
              className="grid grid-cols-12 gap-4 p-8 items-center hover:bg-hyundai-gray-50 transition-all group"
            >
              <div className="col-span-1 text-[13px] font-bold text-hyundai-gray-300">
                {(reports.length - i).toString().padStart(2, '0')}
              </div>
              <div className="col-span-4 space-y-1">
                <p className="text-[15px] font-bold text-hyundai-black group-hover:text-hyundai-gold transition-colors truncate">
                  {report.subject || 'Weekly Music Report'}
                </p>
                <div className="flex items-center gap-2 text-[11px] font-bold text-hyundai-gray-400 uppercase">
                  <Calendar className="w-3 h-3" />
                  {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                </div>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-lg font-black text-hyundai-black tracking-tighter">
                  {report.summary_data?.totalCount ?? '-'}
                </span>
                <span className="text-[10px] ml-1 text-hyundai-gray-300 font-bold uppercase">곡</span>
              </div>
              <div className="col-span-2 flex justify-center">
                <span className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
                  report.status === 'success' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                  {report.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {report.status}
                </span>
              </div>
              <div className="col-span-2 text-center text-[12px] font-bold text-hyundai-gray-500 uppercase">
                {new Date(report.created_at).toLocaleDateString()}
              </div>
              <div className="col-span-1 flex justify-end gap-2">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (report.summary_data?.songs) {
                      const dateStr = new Date(report.created_at).toLocaleDateString().split('.').join('_').trim();
                      exportSongsToExcel(report.summary_data.songs, `Music_Report_${dateStr}.xlsx`);
                    } else {
                      alert('데이터가 없습니다.');
                    }
                  }}
                  className="w-10 h-10 border border-hyundai-gray-100 flex items-center justify-center text-hyundai-gray-200 hover:text-hyundai-emerald hover:border-hyundai-emerald transition-all"
                  title="Excel 다운로드"
                >
                   <Download className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 border border-hyundai-gray-100 flex items-center justify-center text-hyundai-gray-200 group-hover:text-hyundai-black group-hover:border-hyundai-black transition-all">
                   <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
