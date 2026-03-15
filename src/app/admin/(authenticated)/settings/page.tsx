'use client';

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states (Restored)
  const [newPattern, setNewPattern] = useState('');
  const [patternType, setPatternType] = useState('WORD');
  const [newTemplate, setNewTemplate] = useState({ title: '', content: '', type: 'HOLD' });

  // New states for Mail & Accounts
  const [activeTab, setActiveTab] = useState<'automation' | 'mail' | 'accounts'>('automation');
  const [recipients, setRecipients] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [newRecipient, setNewRecipient] = useState({ email: '', role: 'TO', send_day: 4 });
  const [newAdmin, setNewAdmin] = useState({ email: '', nickname: '', password: '', role: 'admin' });
  const [editingAdmin, setEditingAdmin] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchData();
    fetchRecipients();
    fetchAccounts();
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

  async function fetchRecipients() {
    const res = await fetch('/api/admin/mail-settings');
    if (res.ok) setRecipients(await res.json());
  }

  async function fetchAccounts() {
    const res = await fetch('/api/admin/accounts');
    if (res.ok) setAdmins(await res.json());
  }

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

  const handleAddRecipient = async () => {
    if (!newRecipient.email) return;
    const res = await fetch('/api/admin/mail-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecipient)
    });
    if (res.ok) { setNewRecipient({ email: '', role: 'TO', send_day: 4 }); fetchRecipients(); }
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

  const handleChangePassword = async (id: string) => {
    if (!newPassword) return;
    const res = await fetch('/api/admin/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password: newPassword })
    });
    if (res.ok) { setEditingAdmin(null); setNewPassword(''); alert('비밀번호가 변경되었습니다.'); }
  };

  const handleDelete = async (id: string, table: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    let url = `/api/admin/settings?id=${id}&table=${table}`;
    if (table === 'mail_recipients') url = `/api/admin/mail-settings?id=${id}`;
    if (table === 'admins') url = `/api/admin/accounts?id=${id}`;
    
    const res = await fetch(url, { method: 'DELETE' });
    if (res.ok) { fetchData(); fetchRecipients(); fetchAccounts(); }
  };

  return (
    <AdminLayout>
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-hyundai-black tracking-tight">시스템 통합 설정</h2>
          <p className="text-hyundai-gray-500 mt-1 font-medium">관리자 계정, 메일 수신 및 자동화 규칙 관리</p>
        </div>
        
        <div className="flex bg-hyundai-gray-100 p-1.5 rounded-2xl">
          {[
            { id: 'automation', label: '자동화 규칙' },
            { id: 'mail', label: '메일 수신 설정' },
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
          {/* Banned Patterns (same as before) */}
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

          {/* Templates (same as before) */}
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

      {activeTab === 'mail' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-1 space-y-8">
            <div className="card-premium p-8">
              <h3 className="text-lg font-bold mb-6">수신자 추가</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-normal block mb-2">이메일 주소</label>
                  <input type="email" value={newRecipient.email} onChange={(e) => setNewRecipient({...newRecipient, email: e.target.value})} className="w-full bg-hyundai-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-hyundai-emerald/10 outline-none" placeholder="example@hyundai.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-normal block mb-2">역할</label>
                    <select value={newRecipient.role} onChange={(e) => setNewRecipient({...newRecipient, role: e.target.value})} className="w-full bg-hyundai-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold">
                      <option value="TO">수신 (TO)</option>
                      <option value="CC">참조 (CC)</option>
                      <option value="BCC">숨은참조 (BCC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-normal block mb-2">발송 요일</label>
                    <select value={newRecipient.send_day} onChange={(e) => setNewRecipient({...newRecipient, send_day: parseInt(e.target.value)})} className="w-full bg-hyundai-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold">
                      <option value={4}>목요일 (시스템 기본)</option>
                      <option value={1}>월요일</option>
                      <option value={5}>금요일</option>
                      <option value={0}>일요일</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleAddRecipient} className="w-full py-4 bg-hyundai-black text-white text-[14px] font-bold rounded-xl uppercase tracking-tight mt-4">수신자 등록</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 card-premium p-8 overflow-hidden">
            <h3 className="text-lg font-bold mb-6">수신 리스트</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[12px] font-bold text-hyundai-gray-400 uppercase tracking-tight border-b border-hyundai-gray-100">
                    <th className="pb-4 text-left">이메일</th>
                    <th className="pb-4 text-center">역할</th>
                    <th className="pb-4 text-center">발송 요일</th>
                    <th className="pb-4 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hyundai-gray-50">
                  {recipients.map(r => (
                    <tr key={r.id} className="text-sm">
                      <td className="py-4 font-bold text-hyundai-black">{r.email}</td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${r.role === 'TO' ? 'bg-hyundai-emerald/10 text-hyundai-emerald' : 'bg-blue-50 text-blue-500'}`}>{r.role}</span>
                      </td>
                      <td className="py-4 text-center font-bold text-hyundai-gray-500">{r.send_day === 4 ? '목요일' : r.send_day === 1 ? '월요일' : '기타'}</td>
                      <td className="py-4 text-right">
                        <button onClick={() => handleDelete(r.id, 'mail_recipients')} className="p-2 text-hyundai-gray-300 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <button onClick={() => setEditingAdmin(a.id)} className="p-2 text-hyundai-gray-300 hover:text-hyundai-black transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></button>
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
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-3xl">
            <h3 className="text-xl font-bold mb-6">비밀번호 변경</h3>
            <input type="password" placeholder="새 비밀번호 입력..." className="w-full bg-hyundai-gray-50 border-none rounded-xl px-4 py-4 text-sm mb-6 outline-none focus:ring-2 focus:ring-hyundai-black/5" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={() => setEditingAdmin(null)} className="flex-1 py-4 text-[14px] font-bold text-hyundai-gray-400 uppercase tracking-tight">취소</button>
              <button onClick={() => handleChangePassword(editingAdmin)} className="flex-1 py-4 bg-hyundai-black text-white text-[14px] font-bold rounded-xl uppercase tracking-tight shadow-lg shadow-hyundai-black/20">변경하기</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
