'use client';

import { useEffect, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Download, Filter, FileText, CheckCircle, 
  Clock, AlertTriangle, Users, Music, Layers, BarChart3,
  Calendar, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [themeId, setThemeId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    fetchThemes();
    fetchStats();
  }, [themeId, startDate, endDate, status]);

  async function fetchThemes() {
    const res = await fetch('/api/admin/themes');
    if (res.ok) setThemes(await res.json());
  }

  async function fetchStats() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        theme_id: themeId, 
        startDate, 
        endDate, 
        status 
      });
      const res = await fetch(`/api/admin/dashboard/stats?${params.toString()}`);
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  }

  const downloadWeeklyReport = async () => {
    setLoading(true);
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const today = new Date();
      
      const params = new URLSearchParams({ 
        status: 'approved',
        start: weekAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      });
      
      const res = await fetch(`/api/admin/requests?${params.toString()}`);
      if (res.ok) {
        const songs = await res.json();
        
        let csv = '\uFEFF'; // BOM for Excel
        csv += '제목,아티스트,신청자,사연/메모,신청일시\n';
        songs.forEach((s: any) => {
          csv += `"${s.title}","${s.artist}","${s.requester_name || '익명'}","${(s.story || '') + (s.admin_memo ? ` [메모: ${s.admin_memo}]` : '')}","${new Date(s.created_at).toLocaleString()}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `skyterrace_weekly_report_${today.toISOString().split('T')[0]}.csv`;
        link.click();
      }
    } catch (err) {
      console.error('Failed to download report', err);
      alert('다운로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10B981', '#FACC15', '#3B82F6', '#EF4444'];

  if (loading && !stats) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-hyundai-black"></div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* 1. Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-hyundai-black tracking-tighter uppercase flex items-center gap-3">
             운영 통계 인사이트
             <span className="w-2.5 h-2.5 rounded-full bg-hyundai-gold animate-pulse"></span>
          </h2>
          <p className="text-sm font-bold text-hyundai-gray-400 mt-1 uppercase tracking-normal">실시간 운영 데이터 및 성과 지표 대시보드</p>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
             onClick={() => stats && downloadWeeklyReport()}
             className="flex items-center gap-3 px-8 py-4 bg-white border border-hyundai-gray-200 text-hyundai-black rounded-sm text-[14px] font-bold uppercase tracking-tight hover:bg-hyundai-gray-50 transition-all shadow-sm"
           >
             <Download className="w-4 h-4" />
             주간 리포트 다운로드
           </button>
        </div>
      </div>

      {/* 2. Filter Terminal */}
      <div className="bg-white border border-hyundai-gray-200 p-8 flex flex-wrap items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-hyundai-black"></div>
        
        <div className="flex items-center gap-3 text-hyundai-black">
          <Filter className="w-5 h-5" />
          <span className="text-[12px] font-bold uppercase tracking-normal">데이터 필터 터미널</span>
        </div>

        <div className="flex items-center gap-12 flex-1">
          <div className="space-y-2">
             <label className="text-[11px] font-bold text-hyundai-gray-300 uppercase tracking-normal block">테마 선택</label>
             <select 
               className="bg-transparent border-none text-[14px] font-bold text-hyundai-black p-0 outline-none cursor-pointer focus:ring-0 uppercase"
               value={themeId}
               onChange={(e) => setThemeId(e.target.value)}
             >
               <option value="all">전체 테마</option>
               {themes.map(t => <option key={t.id} value={t.id}>{t.title.toUpperCase()}</option>)}
             </select>
          </div>

          <div className="space-y-2">
             <label className="text-[11px] font-bold text-hyundai-gray-300 uppercase tracking-normal block">조회 기간 설정</label>
             <div className="flex items-center gap-4">
               <input 
                 type="date" 
                 className="bg-transparent border-none text-[14px] font-bold p-0 outline-none focus:ring-0 uppercase" 
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
               />
               <span className="text-hyundai-gray-200 text-sm">/</span>
               <input 
                 type="date" 
                 className="bg-transparent border-none text-[14px] font-bold p-0 outline-none focus:ring-0 uppercase" 
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
               />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[11px] font-bold text-hyundai-gray-300 uppercase tracking-normal block">처리 상태 필터</label>
             <select 
               className="bg-transparent border-none text-[14px] font-bold text-hyundai-black p-0 outline-none cursor-pointer focus:ring-0 uppercase"
               value={status}
               onChange={(e) => setStatus(e.target.value)}
             >
               <option value="all">전체 상태</option>
               <option value="pending">대기 중</option>
               <option value="approved">승인 완료</option>
               <option value="hold">보류 중</option>
               <option value="deleted">반려/삭제</option>
             </select>
          </div>
        </div>

        {(themeId !== 'all' || startDate || endDate || status !== 'all') && (
          <button 
            onClick={() => { setThemeId('all'); setStartDate(''); setEndDate(''); setStatus('all'); }}
            className="text-[11px] font-bold text-red-500 uppercase tracking-widest hover:underline"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* 3. Operational Alerts */}
      {stats && (stats.kpis.approvalRate < 20 || stats.kpis.deletionRate > 30) && (
        <div className="bg-red-50 border border-red-100 p-6 flex items-center gap-6 animate-in slide-in-from-top-4 duration-500">
          <div className="w-10 h-10 bg-white border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-red-900 tracking-widest uppercase mb-0.5">운영 알림: 퍼포먼스 이슈 감지</p>
            <p className="text-xs font-bold text-red-600 leading-tight">
              {stats?.kpis?.approvalRate < 20 ? `승인율이 ${(stats?.kpis?.approvalRate ?? 0).toFixed(1)}%로 임계치 미달입니다. ` : ''}
              {stats?.kpis?.deletionRate > 30 ? `삭제율이 ${(stats?.kpis?.deletionRate ?? 0).toFixed(1)}%로 비정상 유입이 의심됩니다.` : ''}
            </p>
          </div>
        </div>
      )}

      {/* 4. KPI Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-hyundai-gray-200 border border-hyundai-gray-200">
        <KPIItem label="전체 신청 건수" value={stats?.kpis?.total ?? 0} icon={<Activity />} trend="up" />
        <KPIItem label="평균 승인율" value={`${(stats?.kpis?.approvalRate ?? 0).toFixed(1)}%`} icon={<CheckCircle />} trend="none" />
        <KPIItem label="링크 입력 비중" value={`${(stats?.kpis?.total > 0 ? (stats?.kpis?.with_link / stats?.kpis?.total) * 100 : 0).toFixed(1)}%`} icon={<Music />} trend="none" />
        
        {/* Instant Action */}
        <div className="bg-hyundai-black p-8 flex flex-col justify-between group">
           <div className="flex justify-between items-start">
             <span className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-widest">일괄 처리 프로세스</span>
             <FileText className="w-5 h-5 text-hyundai-gold" />
           </div>
            <div>
              <p className="text-sm font-bold text-white mb-6">현재 승인된 {stats?.kpis?.approved ?? 0}곡을 <br />CSV 파일로 즉시 다운로드합니다.</p>
              <button 
                onClick={downloadWeeklyReport}
                className="w-full py-4 bg-hyundai-gold text-hyundai-black text-[14px] font-bold uppercase tracking-tight hover:bg-white transition-all shadow-lg shadow-hyundai-gold/10"
              >
                주간 리포트 다운로드
              </button>
           </div>
        </div>
      </div>

      {/* 5. Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <ChartCard title="일일 트래픽 파이프라인" className="lg:col-span-8 h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.trends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#999'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#999'}} />
              <Tooltip 
                contentStyle={{borderRadius: '0', border: '1px solid #eee', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700}}
                itemStyle={{fontSize: '12px', textTransform: 'uppercase'}}
              />
              <Legend verticalAlign="top" align="right" height={36} iconType="rect" wrapperStyle={{fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em'}} />
              <Line type="step" name="신청 수" dataKey="count" stroke="#000000" strokeWidth={3} dot={false} activeDot={{r: 6, strokeWidth: 0}} />
              <Line type="step" name="승인 수" dataKey="approved_count" stroke="#D4AF37" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="태스크 처리 결과 분포" className="lg:col-span-4 h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats?.statusDist}
                innerRadius={65}
                outerRadius={95}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {stats?.statusDist.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 700, textTransform: 'uppercase'}} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="인기 아티스트 퍼포먼스" className="lg:col-span-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.topArtists} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F1F1" />
              <XAxis type="number" hide />
              <YAxis dataKey="artist" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#000'}} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#000000" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="시간대별 피크 유입 분석" className="lg:col-span-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.hourlyDist}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#000'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#999'}} />
              <Tooltip />
              <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 6. Detail View */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-hyundai-gray-200 border border-hyundai-gray-200">
        <div className="bg-white p-10">
          <div className="flex justify-between items-center mb-10">
             <h3 className="text-lg font-bold flex items-center gap-3 uppercase tracking-tight text-hyundai-black">
                <Music className="w-5 h-5 text-hyundai-gold" /> 최다 신청곡 순위
             </h3>
             <span className="text-[11px] font-bold text-white bg-hyundai-black px-3 py-1.5 uppercase tracking-normal">TOP 10 랭킹</span>
          </div>
          <div className="space-y-2">
            {stats?.topSongs.map((song: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-hyundai-gray-50 border border-hyundai-gray-100 hover:bg-white hover:shadow-xl hover:shadow-black/5 hover:-translate-y-0.5 transition-all group">
                <div className="flex items-center gap-5">
                  <span className="text-xl font-bold text-hyundai-gray-200 w-8 group-hover:text-hyundai-gold transition-colors">{(i + 1).toString().padStart(2, '0')}</span>
                  <div>
                    <p className="font-bold text-hyundai-black text-sm uppercase tracking-tight">{song.title}</p>
                    <p className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-normal leading-none mt-1">{song.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-hyundai-black tracking-tighter">{song.count}<span className="text-[9px] ml-1 text-hyundai-gray-300 uppercase">건 신청</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-10">
          <div className="flex justify-between items-center mb-10">
             <h3 className="text-lg font-bold flex items-center gap-3 uppercase tracking-tight text-hyundai-black">
                <Layers className="w-5 h-5 text-hyundai-gold" /> 테마 선호도 맵핑
             </h3>
             <Activity className="w-5 h-5 text-hyundai-gray-200" />
          </div>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats?.themeDist} layout="vertical">
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#000'}} width={120} />
                 <Tooltip />
                 <Bar dataKey="value" fill="#000000" radius={[0, 4, 4, 0]} barSize={20} />
               </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 border-t border-hyundai-gray-100 pt-8">
             <div className="flex items-center gap-4 bg-hyundai-gray-50 p-6">
                <TrendingUp className="w-8 h-8 text-hyundai-gold" />
                <div>
                   <p className="text-[12px] font-bold text-hyundai-black uppercase tracking-widest">운영 제언 및 피드백</p>
                   <p className="text-sm font-bold text-hyundai-gray-400 leading-tight mt-1.5">현재 '{stats?.themeDist[0]?.name}' 장르의 신청 비중이 가장 높습니다. <br />해당 테마의 오우라(Aura) 강화를 추천합니다.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIItem({ label, value, icon, trend }: any) {
  return (
    <div className="bg-white p-8 group overflow-hidden relative">
      <div className="flex justify-between items-start mb-6">
        <span className="text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-[0.2em]">{label}</span>
        <div className="text-hyundai-gray-200 group-hover:text-hyundai-gold transition-colors">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-5xl font-bold tracking-tighter text-hyundai-black">{value}</p>
        <div className="flex items-center">
           {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-hyundai-gold" />}
           {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-hyundai-gold/0 group-hover:bg-hyundai-gold transition-all duration-500"></div>
    </div>
  );
}

function ChartCard({ title, children, className }: any) {
  return (
    <div className={`bg-white border border-hyundai-gray-200 shadow-sm p-10 flex flex-col ${className}`}>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-6 bg-hyundai-black"></div>
        <h3 className="text-[16px] font-bold text-hyundai-black uppercase tracking-tight">
           {title}
         </h3>
       </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}
