import { useState } from 'react';
import Link from 'next/link';
import { isValidYouTubeUrl } from '@/utils/youtube';
import { useRouter } from 'next/navigation';

export default function RequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    youtube_url: '',
    story: '',
    requester_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.title || !formData.artist) {
      setError('곡명과 아티스트명은 필수입니다.');
      setLoading(false);
      return;
    }

    if (formData.youtube_url && !isValidYouTubeUrl(formData.youtube_url)) {
      setError('유효하지 않은 YouTube 링크입니다.');
      setLoading(false);
      return;
    }

    try {
      // Check for duplicates via API
      // First, we need the active theme ID, but we can just let the server handle it or fetch it.
      // For efficiency, let's just submit, or do a check if the user has entered enough.
      
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit');

      router.push(`/status/${data.id}?new=true`);
    } catch (err: any) {
      setError('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="inline-flex items-center text-hyundai-gray-500 hover:text-hyundai-emerald mb-8 transition-colors">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        메인으로 돌아가기
      </Link>

      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-hyundai-black mb-2">신청곡 보내기</h2>
        <p className="text-hyundai-gray-500">스카이테라스에서 함께 듣고 싶은 노래를 들려주세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {duplicateWarning && (
          <div className="bg-hyundai-gold/10 border border-hyundai-gold/30 text-hyundai-gold font-bold px-4 py-3 rounded-md text-xs flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45L19.53 19H4.47L12 5.45zM11 16h2v2h-2v-2zm0-7h2v5h-2V9z"/></svg>
            {duplicateWarning}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-hyundai-black mb-1">곡명 *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-hyundai-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald transition-all"
              placeholder="노래 제목을 입력하세요"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-hyundai-black mb-1">아티스트 *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-hyundai-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald transition-all"
              placeholder="가수 이름을 입력하세요"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-hyundai-black mb-1 italic">YouTube 링크 (선택)</label>
            <input
              type="url"
              className="w-full px-4 py-3 border border-hyundai-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald transition-all text-xs"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.youtube_url}
              onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-hyundai-black mb-1">신청 사연 (선택)</label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 border border-hyundai-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald transition-all resize-none"
              placeholder="곡과 관련된 추억이나 사연을 들려주세요 (최대 200자)"
              maxLength={200}
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-hyundai-black mb-1">신청자 성함 (선택)</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-hyundai-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hyundai-emerald/20 focus:border-hyundai-emerald transition-all"
              placeholder="익명으로 신청 가능합니다"
              value={formData.requester_name}
              onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
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
          {loading ? '신청 중...' : '신청곡 제출하기'}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-hyundai-gray-500">
        <p>* 부적절한 제목이나 사연이 포함된 곡은 관리자에 의해 거절될 수 있습니다.</p>
        <p className="mt-1">* 승인된 곡은 목요일 19:00 이후 플레이리스트에 반영됩니다.</p>
      </div>
    </div>
  );
}
