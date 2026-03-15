'use client';

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Download, Filter, FileText, CheckCircle, 
  Clock, AlertTriangle, Users, Music, Layers, BarChart3 
} from 'lucide-react';

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

  const exportCSV = () => {
    if (!stats) return;
    let csv = '\uFEFF'; // BOM for Excel
    csv += '지표,값\n';
    csv += `전체 신청 수,${stats.kpis.total}\n`;
    csv += `승인 완료,${stats.kpis.approved}\n`;
    csv += `승인율,${stats.kpis.approvalRate.toFixed(2)}%\n`;
    csv += `링크 입력 수,${stats.kpis.with_link}\n\n`;
    
    csv += '일별 트렌드\n날짜,신청 수,승인 수\n';
    stats.trends.forEach((t: any) => csv += `${t.date},${t.count},${t.approved_count}\n`);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `skyterrace_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const COLORS = ['#10B981', '#FACC15', '#3B82F6', '#EF4444'];
  const SOURCE_COLORS = ['#000000', '#D1D5DB'];

  if (loading && !stats) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-hyundai-emerald"></div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-black text-hyundai-black tracking-tight flex items-center gap-3">
            운영 데이터 대시보드
            <span className="text-xs bg-hyundai-emerald text-white px-2 py-1 rounded-md uppercase tracking-widest font-bold">Live</span>
          </h2>
          <p className="text-hyundai-gray-500 mt-2 font-medium">데이터 시각화 및 운영 성과 지표 분석 시스템</p>
        </div>
        
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 px-6 py-3 bg-hyundai-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl hover:shadow-hyundai-black/20"
        >
          <Download className="w-4 h-4" />
          CSV 리프트 다운로드
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card-premium p-6 mb-10 border border-hyundai-gray-100 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-hyundai-gray-400" />
          <span className="text-xs font-black uppercase text-hyundai-gray-400 tracking-wider">필터 적용</span>
        </div>
        <div className="h-4 w-px bg-hyundai-gray-100 hidden lg:block"></div>
        
        <select 
          className="bg-transparent border-none text-sm font-black text-hyundai-black px-2 outline-none cursor-pointer"
          value={themeId}
          onChange={(e) => setThemeId(e.target.value)}
        >
          <option value="all">모든 테마</option>
          {themes.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>

        <div className="flex items-center gap-3">
          <input 
            type="date" 
            className="bg-hyundai-gray-50 border-none text-[10px] font-black px-3 py-2 rounded-lg outline-none uppercase" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-hyundai-gray-300">~</span>
          <input 
            type="date" 
            className="bg-hyundai-gray-50 border-none text-[10px] font-black px-3 py-2 rounded-lg outline-none uppercase" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <select 
          className="bg-transparent border-none text-sm font-black text-hyundai-black px-2 outline-none cursor-pointer"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">모든 상태</option>
          <option value="pending">대기중</option>
          <option value="approved">승인됨</option>
          <option value="hold">보류됨</option>
          <option value="deleted">삭제됨</option>
        </select>

        {(themeId !== 'all' || startDate || endDate || status !== 'all') && (
          <button 
            onClick={() => { setThemeId('all'); setStartDate(''); setEndDate(''); setStatus('all'); }}
            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline ml-auto"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* Operational Alerts */}
      {stats && (stats.kpis.approvalRate < 20 || stats.kpis.deletionRate > 30) && (
        <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex items-center gap-6">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-red-900 tracking-tight">운영 주의보: 서비스 품질 지표 저하</p>
              <p className="text-sm text-red-600 font-medium">
                {stats.kpis.approvalRate < 20 ? `승인율이 현재 ${stats.kpis.approvalRate.toFixed(1)}%로 매우 낮습니다. 선곡 기준을 재검토해 주세요. ` : ''}
                {stats.kpis.deletionRate > 30 ? `삭제율이 ${stats.kpis.deletionRate.toFixed(1)}%로 높습니다. 이상 유입 여부를 확인하십시오.` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPIItem label="전체 신청" value={stats?.kpis.total} icon={<Users />} color="black" />
        <KPIItem label="승인완료" value={stats?.kpis.approved} sub={`율 ${stats?.kpis.approvalRate.toFixed(1)}%`} icon={<CheckCircle />} color="emerald" />
        
        {/* Instant Mail Card (Prominent) */}
        <div className="card-premium p-8 border-l-4 border-l-hyundai-gold shadow-xl shadow-hyundai-gold/5 lg:col-span-2 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs font-black text-hyundai-gray-400 uppercase tracking-[0.2em]">주간 리포트 즉시 발송</p>
              <FileText className="w-5 h-5 text-hyundai-gold" />
            </div>
            <p className="text-4xl font-black text-hyundai-black tracking-tighter">
              {stats?.kpis.approved} <span className="text-sm font-bold text-hyundai-gray-400">곡 대기 중</span>
            </p>
            <p className="text-[10px] text-hyundai-gray-400 font-bold mt-2 uppercase">현재까지 승인된 모든 곡을 즉시 발송합니다.</p>
          </div>
          <button 
            onClick={async () => {
              if (confirm('현재까지 승인된 곡들을 포함하여 주간 리포트를 즉시 발송하시겠습니까?')) {
                const res = await fetch('/api/cron/weekly-mail?forceCurrent=true');
                if (res.ok) alert('성공적으로 발송되었습니다.'); else alert('발송 중 오류가 발생했습니다.');
              }
            }}
            className="w-full md:w-auto px-8 py-4 bg-hyundai-gold text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-hyundai-gold/20"
          >
            지금 즉시 발송하기
          </button>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <ChartCard title="신청 건수 트렌드" className="lg:col-span-2 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.trends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
              <Tooltip 
                contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900}}
                itemStyle={{fontSize: '12px'}}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}} />
              <Line type="monotone" name="전체 신청" dataKey="count" stroke="#000000" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 8}} />
              <Line type="monotone" name="승인 건수" dataKey="approved_count" stroke="#10B981" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="신청 상태 분포" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats?.statusDist}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {stats?.statusDist.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '10px', fontWeight: 900}} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <ChartCard title="인기 아티스트 TOP 10" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.topArtists} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#G3F4F6" />
              <XAxis type="number" hide />
              <YAxis dataKey="artist" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#000000" radius={[0, 10, 10, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="시간대별 분포" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.hourlyDist}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="card-premium p-8">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-black flex items-center gap-3">
               <Music className="w-5 h-5" /> 최다 신청 곡 리스트
             </h3>
             <span className="text-[10px] font-black text-hyundai-gray-400 uppercase tracking-widest">TOP 10</span>
          </div>
          <div className="space-y-4">
            {stats?.topSongs.map((song: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-hyundai-gray-50 rounded-2xl hover:bg-white border border-transparent hover:border-hyundai-gray-100 transition-all shadow-sm shadow-transparent hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-black text-hyundai-gray-200 w-6">{(i + 1).toString().padStart(2, '0')}</span>
                  <div>
                    <p className="font-black text-hyundai-black text-sm">{song.title}</p>
                    <p className="text-[10px] font-bold text-hyundai-gray-400 uppercase tracking-tight">{song.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-hyundai-black">{song.count}<span className="text-xs ml-1 text-hyundai-gray-400">회</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-premium p-8">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-black flex items-center gap-3">
               <Layers className="w-5 h-5" /> 테마별 선호도
             </h3>
             <BarChart3 className="w-4 h-4 text-hyundai-gray-300" />
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats?.themeDist} layout="vertical">
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} width={120} />
                 <Tooltip />
                 <Bar dataKey="value" fill="#FACC15" radius={[0, 10, 10, 0]} />
               </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function KPIItem({ label, value, sub, icon, color }: any) {
  const colorMap = {
    black: 'border-l-hyundai-black text-hyundai-black',
    emerald: 'border-l-hyundai-emerald text-hyundai-emerald',
    gold: 'border-l-hyundai-gold text-hyundai-gold',
    red: 'border-l-red-500 text-red-500'
  };

  return (
    <div className={`card-premium p-8 border-l-4 ${colorMap[color as keyof typeof colorMap]} shadow-xl shadow-hyundai-black/5`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs font-black text-hyundai-gray-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="text-hyundai-gray-300">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-black tracking-tighter text-hyundai-black">{value}</p>
        {sub && <span className="text-xs font-black uppercase text-hyundai-gray-400">{sub}</span>}
      </div>
    </div>
  );
}

function ChartCard({ title, children, className }: any) {
  return (
    <div className={`card-premium p-8 flex flex-col ${className}`}>
      <h3 className="text-sm font-black text-hyundai-black uppercase tracking-widest mb-8 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-hyundai-emerald"></div>
        {title}
      </h3>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}
