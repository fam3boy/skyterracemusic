'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-hyundai-emerald rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-hyundai-black">관리자 로그인</h2>
          <p className="text-hyundai-gray-500">SKY TERRACE 관리 시스템</p>
        </div>

        <form onSubmit={handleLogin} className="card p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-hyundai-black mb-1">이메일</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-hyundai-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-hyundai-black mb-1">비밀번호</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-hyundai-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
              loading ? 'bg-hyundai-gray-200 cursor-not-allowed' : 'bg-hyundai-emerald hover:bg-emerald-700 active:scale-[0.98]'
            }`}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
