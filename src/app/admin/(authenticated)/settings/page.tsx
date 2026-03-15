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

  // New states for Branding & Accounts
  const [activeTab, setActiveTab] = useState<'automation' | 'branding' | 'accounts'>('automation');
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdmin, setNewAdmin] = useState({ email: '', nickname: '', password: '', role: 'admin' });
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
  
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchData();
    fetchAccounts();
    fetchBranding();
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
      console.error(err); 
    } finally {
      setLoading(false);
    }
  }

  async function fetchAccounts() {
    const res = await fetch('/api/admin/accounts');
    if (res.ok) setAdmins(await res.json());
  }

  async function fetchBranding() {
    const res = await fetch('/api/admin/branding');
    if (res.ok) {
      const settings = await res.json();
      setLogoBase64(settings.logo_base64 || null);
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/png');
        
        const res = await fetch('/api/admin/branding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'logo_base64', value: base64 })
        });

        if (res.ok) {
          setLogoBase64(base64);
          alert('로고가 성공적으로 업데이트되었습니다.');
        }
        setUploadingLogo(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddPattern = async () => {
    if (!newPattern) return;
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pattern: newPattern, type: patternType })
    });
    if (res.ok) { setNewPattern(''); fetchData(); }
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.title || !newTemplate.content) return;
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTemplate, templateType: newTemplate.type })
    });
    if (res.ok) { setNewTemplate({ title: '', content: '', type: 'HOLD' }); fetchData(); }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password) return;
    const res = await fetch('/api/admin/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAdmin)
    });
    if (res.ok) { setNewAdmin({ email: '', nickname: '', password: '', role: 'admin' }); fetchAccounts(); }
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;
    const res = await fetch('/api/admin/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingAdmin)
    });
    if (res.ok) { setEditingAdmin(null); fetchAccounts(); alert('관리자 정보가 업데이트되었습니다.'); }
  };

  const handleDelete = async (id: string, table: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    let url = `/api/admin/settings?id=${id}&table=${table}`;
    if (table === 'admins') url = `/api/admin/accounts?id=${id}`;
    
    const res = await fetch(url, { method: 'DELETE' });
    if (res.ok) { fetchData(); fetchAccounts(); }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <AdminLayout>
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-hyundai-black tracking-tight">시스템 통합 설정</h2>
          <p className="text-hyundai-gray-500 mt-1 font-medium">관리자 계정, 브랜딩 및 자동화 규칙 관리</p>
        </div>
        
        <div className="flex bg-hyundai-gray-100 p-1.5 rounded-2xl">
          {[
            { id: 'automation', label: '자동화 규칙' },
            { id: 'branding', label: '브랜딩 설정' },
            { id: 'accounts', label: '관리자 계정' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white text-hyundai-black shadow-sm' : 'text-hyundai-gray-400 hover:text-hyundai-gray-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'automation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
          <div className="card-premium p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              금칙어 / 링크 필터 관리
            </h3>
            <div className="flex gap-2 mb-6">
              <select value={patternType} onChange={(e) => setPatternType(e.target.value)} className="bg-hyundai-gray-50 border-none rounded-xl text-sm font-bold px-4"><option value="WORD">단어</option><option value="ARTIST">아티스트</option><option value="LINK">링크/URL</option></select>
              <input type="text" placeholder="검색 또는 차단할 패턴 입력..." className="flex-grow bg-hyundai-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500/10 outline-none" value={newPattern} onChange={(e) => setNewPattern(e.target.value)} />
              <button onClick={handleAddPattern} className="px-6 bg-hyundai-black text-white text-[12px] font-bold rounded-xl uppercase tracking-tight">필터 추가</button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {patterns.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-hyundai-gray-50 rounded-2xl group">
                  <div className="flex items-center gap-3"><span className="text-[11px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded">{p.type}</span><span className="text-sm font-bold text-hyundai-black">{p.pattern}</span></div>
                  <button onClick={() => handleDelete(p.id, 'banned_patterns')} className="opacity-0 group-hover:opacity-100 p-2 text-hyundai-gray-300 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                </div>
              ))}
            </div>
          </div>

          <div className="card-premium p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-hyundai-emerald"></div>심사 메모 템플릿</h3>
            <div className="space-y-4 mb-8">
              <div className="flex gap-4">
                <input type="text" placeholder="템플릿 제목..." className="flex-grow bg-hyundai-gray-50 border-none rounded-xl px-4 py-3 text-sm" value={newTemplate.title} onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })} />
                <select value={newTemplate.type} onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })} className="bg-hyundai-gray-50 border-none rounded-xl text-sm font-bold px-4"><option value="HOLD">보류용</option><option value="DELETED">삭제용</option></select>
              </div>
              <textarea placeholder="내용..." className="w-full bg-hyundai-gray-50 border-none rounded-xl px-4 py-3 text-sm min-h-[100px]" value={newTemplate.content} onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })} />
              <button onClick={handleAddTemplate} className="w-full py-4 bg-hyundai-black text-white text-[14px] font-bold rounded-xl uppercase tracking-tight">템플릿 생성</button>
            </div>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {templates.map(t => (
                <div key={t.id} className="p-5 bg-hyundai-gray-50 rounded-3xl group relative">
                  <div className="flex justify-between mb-2">
                    <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full tracking-tight ${t.type === 'HOLD' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>{t.type}</span>
                    <button onClick={() => handleDelete(t.id, 'admin_templates')} className="opacity-0 group-hover:opacity-100 text-hyundai-gray-300 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                  </div>
                  <p className="text-sm font-bold text-hyundai-black mb-1">{t.title}</p>
                  <p className="text-xs text-hyundai-gray-400 font-medium line-clamp-2">{t.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="card-premium p-10">
            <h3 className="text-2xl font-black mb-8">시스템 브랜딩</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                   <label className="text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-widest block mb-4">공식 로고 등록</label>
                   <div className="relative group cursor-pointer border-2 border-dashed border-hyundai-gray-100 rounded-[2rem] p-10 bg-hyundai-gray-50/50 hover:bg-white hover:border-hyundai-gold transition-all duration-500 text-center">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-hyundai-gray-400 group-hover:text-hyundai-gold transition-colors">
                           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        </div>
                        <p className="text-sm font-bold text-hyundai-black">이미지 업로드</p>
                        <p className="text-[11px] text-hyundai-gray-400 font-medium leading-relaxed">PNG, JPG 지원 (최적 너비 400px)<br />업로드 시 자동으로 크기가 조정됩니다.</p>
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="space-y-6 flex flex-col items-center justify-center p-10 bg-hyundai-black rounded-[2rem] text-center">
                 <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block mb-6">현재 적용된 로고 미리보기</label>
                 <div className="h-20 flex items-center justify-center">
                   {logoBase64 ? (
                     <img src={logoBase64} alt="Preview" className="h-full w-auto object-contain" />
                   ) : (
                     <div className="text-white/20 font-black italic text-4xl">NO LOGO</div>
                   )}
                 </div>
                 {uploadingLogo && <p className="text-hyundai-gold text-xs font-bold animate-pulse mt-4">최적화 및 업로드 중...</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="lg:col-span-1 card-premium p-8">
            <h3 className="text-lg font-bold mb-6">신규 관리자 추가</h3>
            <div className="space-y-4">
              <input type="email" placeholder="관리자 이메일 계정..." className="w-full bg-hyundai-gray-50 border-none rounded-xl px-4 py-3 text-sm" value={newAdmin.email} onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})} />
              <input type="text" placeholder="관리자 이름 (닉네임)..." className="w-full bg-hyundai-gray-50 border-none rounded-xl px-4 py-3 text-sm" value={newAdmin.nickname} onChange={(e) => setNewAdmin({...newAdmin, nickname: e.target.value})} />
              <input type="password" placeholder="초기 비밀번호..." className="w-full bg-hyundai-gray-50 border-none rounded-xl px-4 py-3 text-sm" value={newAdmin.password} onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})} />
              <select className="w-full bg-hyundai-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold" value={newAdmin.role} onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}><option value="admin">일반 운영자 (admin)</option><option value="administrator">시스템 관리자 (administrator)</option></select>
              <button onClick={handleCreateAdmin} className="w-full py-4 bg-hyundai-black text-white text-[14px] font-bold rounded-xl uppercase tracking-tight">새 운영 계정 생성</button>
            </div>
          </div>

          <div className="lg:col-span-2 card-premium p-8">
            <h3 className="text-lg font-black mb-6">관리자 리스트</h3>
            <div className="space-y-4">
              {admins.map(a => (
                <div key={a.id} className="flex items-center justify-between p-5 bg-hyundai-gray-50 rounded-2xl group">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-hyundai-black">{a.nickname}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-hyundai-black text-white rounded uppercase">{a.role}</span>
                    </div>
                    <p className="text-xs text-hyundai-gray-400">{a.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingAdmin(a)} className="p-2 text-hyundai-gray-300 hover:text-hyundai-black transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                    <button onClick={() => handleDelete(a.id, 'admins')} className="p-2 text-hyundai-gray-300 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {editingAdmin && (
        <div className="fixed inset-0 bg-hyundai-black/60 flex items-center justify-center z-[200] p-6 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-10 shadow-3xl">
            <h3 className="text-2xl font-black mb-8">관리자 정보 수정</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-widest block mb-2">이메일 계정 (ID)</label>
                <input type="email" placeholder="이메일..." className="w-full bg-hyundai-gray-50 border-none rounded-xl px-4 py-4 text-sm" value={editingAdmin.email} onChange={(e) => setEditingAdmin({...editingAdmin, email: e.target.value})} />
              </div>
              <div>
                <label className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-widest block mb-2">닉네임</label>
                <input type="text" placeholder="닉네임..." className="w-full bg-hyundai-gray-50 border-none rounded-xl px-4 py-4 text-sm" value={editingAdmin.nickname} onChange={(e) => setEditingAdmin({...editingAdmin, nickname: e.target.value})} />
              </div>
              <div>
                <label className="text-[11px] font-bold text-hyundai-gray-400 uppercase tracking-widest block mb-2">새 비밀번호 (변경 시에만 입력)</label>
                <input type="password" placeholder="비밀번호..." className="w-full bg-hyundai-gray-50 border-none rounded-xl px-4 py-4 text-sm" value={editingAdmin.password || ''} onChange={(e) => setEditingAdmin({...editingAdmin, password: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button onClick={() => setEditingAdmin(null)} className="flex-1 py-4 text-[14px] font-bold text-hyundai-gray-400 uppercase tracking-tight">취소</button>
              <button onClick={handleUpdateAdmin} className="flex-1 py-4 bg-hyundai-black text-white text-[14px] font-bold rounded-xl uppercase tracking-tight shadow-xl shadow-hyundai-black/20">수정 내용 저장</button>
            </div>
          </div>
        </div>
      )}
      </AdminLayout>
    </div>
  );
}
