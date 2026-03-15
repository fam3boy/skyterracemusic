'use client';

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newPattern, setNewPattern] = useState('');
  const [patternType, setPatternType] = useState('WORD');
  const [newTemplate, setNewTemplate] = useState({ title: '', content: '', type: 'HOLD' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        fetch('/api/admin/settings?type=patterns'),
        fetch('/api/admin/settings?type=templates')
      ]);
      if (pRes.ok) setPatterns(await pRes.json());
      if (tRes.ok) setTemplates(await tRes.json());
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddPattern = async () => {
    if (!newPattern) return;
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pattern: newPattern, type: patternType })
    });
    if (res.ok) {
      setNewPattern('');
      fetchData();
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.title || !newTemplate.content) return;
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTemplate, templateType: newTemplate.type })
    });
    if (res.ok) {
      setNewTemplate({ title: '', content: '', type: 'HOLD' });
      fetchData();
    }
  };

  const handleDelete = async (id: string, table: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/admin/settings?id=${id}&table=${table}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  return (
    <AdminLayout>
      <div className="mb-10">
        <h2 className="text-3xl font-black text-hyundai-black tracking-tight">자동화 설정</h2>
        <p className="text-hyundai-gray-500 mt-1 font-medium">관리 효율을 높이기 위한 금칙어 및 템플릿 관리</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Banned Patterns */}
        <div className="space-y-8">
          <div className="card-premium p-8">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              금칙어 / 링크 필터 관리
            </h3>
            
            <div className="flex gap-2 mb-6">
              <select 
                value={patternType} 
                onChange={(e) => setPatternType(e.target.value)}
                className="bg-hyundai-gray-50 border-none rounded-xl text-xs font-black uppercase tracking-tighter outline-none focus:ring-2 focus:ring-red-500/10 px-4"
              >
                <option value="WORD">단어/패턴</option>
                <option value="ARTIST">아티스트</option>
                <option value="LINK">링크 키워드</option>
              </select>
              <input 
                type="text" 
                placeholder="새로운 필터 입력..." 
                className="flex-grow bg-hyundai-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500/10 outline-none"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
              />
              <button onClick={handleAddPattern} className="px-6 bg-hyundai-black text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:opacity-90 transition-all">Add</button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {patterns.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-hyundai-gray-50 rounded-2xl border border-transparent hover:border-red-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase tracking-tighter">
                      {p.type}
                    </span>
                    <span className="text-sm font-bold text-hyundai-black">{p.pattern}</span>
                  </div>
                  <button onClick={() => handleDelete(p.id, 'banned_patterns')} className="opacity-0 group-hover:opacity-100 p-2 text-hyundai-gray-300 hover:text-red-500 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Memo Templates */}
        <div className="space-y-8">
          <div className="card-premium p-8">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-hyundai-emerald"></div>
              심사 메모 템플릿
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="템플릿 제목..." 
                  className="flex-grow bg-hyundai-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-hyundai-emerald/10 outline-none"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                />
                <select 
                  value={newTemplate.type} 
                  onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                  className="bg-hyundai-gray-50 border-none rounded-xl text-xs font-black uppercase tracking-tighter outline-none focus:ring-2 focus:ring-hyundai-emerald/10 px-4"
                >
                  <option value="HOLD">보류용</option>
                  <option value="DELETED">삭제용</option>
                </select>
              </div>
              <textarea 
                placeholder="템플릿 내용 입력..." 
                className="w-full bg-hyundai-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-hyundai-emerald/10 outline-none min-h-[100px]"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
              />
              <button 
                onClick={handleAddTemplate}
                className="w-full py-4 bg-hyundai-black text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:opacity-90 transition-all"
              >
                Create Template
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {templates.map(t => (
                <div key={t.id} className="p-5 bg-hyundai-gray-50 rounded-3xl border border-transparent hover:border-hyundai-emerald/20 transition-all group relative">
                   <div className="flex justify-between items-start mb-2">
                     <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${t.type === 'HOLD' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                       {t.type}
                     </span>
                     <button onClick={() => handleDelete(t.id, 'admin_templates')} className="opacity-0 group-hover:opacity-100 text-hyundai-gray-300 hover:text-red-500 transition-all">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                     </button>
                   </div>
                   <p className="text-sm font-black text-hyundai-black mb-1">{t.title}</p>
                   <p className="text-xs text-hyundai-gray-400 font-medium line-clamp-2">{t.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
