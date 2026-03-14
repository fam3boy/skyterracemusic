# 현대프리미엄아울렛 대전점 | SKY TERRACE 신청곡 웹앱

현대프리미엄아울렛 대전점 3F 스카이테라스 방문 고객을 위한 맞춤형 신청곡 접수 및 관리 시스템입니다.

## 🚀 주요 기능

### [고객용]
- **테마 조회**: 현재 활성화된 월별 테마 및 기본 플레이리스트 확인
- **신청곡 등록**: 곡명, 아티스트, YouTube 링크 및 특별한 사연 입력
- **상태 확인**: 본인의 신청곡이 승인/보류 되었는지 실시간 확인 (UUID 방식)

### [관리자용]
- **테마 관리**: 매월 새로운 음악 테마 설정 및 기본 곡 등록
- **신청곡 심사**: 고객 신청곡의 승인, 보류, 삭제 처리 및 관리자 메모 기능
- **자동화 시스템**: 매주 목요일 19:00 승인된 곡 목록 자동 집계 및 메일 발송
- **로그 추적**: 모든 관리자 작업에 대한 Audit Log 및 메일 발송 이력 저장

## 🛠 기술 스택
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (현대백화점 브랜드 가이드 준수)
- **Database**: Vercel Postgres (Edge Compatible)
- **Auth**: NextAuth.js (Credentials Provider)
- **Language**: TypeScript

## 🔐 관리자 접속 및 초기 설정

### [초기 데이터 생성]
1. Vercel Postgres 콘솔에서 `vercel_schema.sql`의 내용을 실행하여 테이블을 생성합니다.
2. **기존 사용자의 경우**: `migration.sql`을 먼저 실행하여 누락된 컬럼(start_date, youtube_url 등)을 추가합니다.
3. `seed.sql`을 실행하여 기본 관리자 계정(`admin@skyterrace.com` / `admin123`)과 샘플 데이터를 생성합니다.

### [관리자 로그인]
- **접속 주소**: `https://your-deployment-url/admin/login`
- **초기 계정**: `admin@skyterrace.com`
- **초기 비밀번호**: `admin123`
- *로그인 후 반드시 관리자 비밀번호를 업데이트하거나 새로운 계정을 생성하는 것을 권장합니다.*

## ⚙️ 설정 방법 (Environment Variables)

`.env.local` 파일에 다음 항목을 설정해야 합니다:

```env
# Vercel Postgres Configuration
POSTGRES_URL=your_vercel_postgres_url
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret (Generate with: openssl rand -base64 32)

# Automation & Mail Settings
CRON_SECRET=your_random_string (Security for API routes)
WEEKLY_MAIL_RECIPIENT=broadcasting@hyundai.com
RESEND_API_KEY=re_123456789 (Get from resend.com)
```

### [주간 리포트 테스트 및 연동]
- **자동 발송**: Vercel Cron Job 설정을 통해 매주 목요일 19:00에 `/api/cron/weekly-mail`을 호출합니다. (Authorization 헤더에 `Bearer [CRON_SECRET]` 필요)
- **수동 발송**: 관리자 대시보드 또는 메일 로그 페이지에서 '즉시 재발송' 버튼을 클릭하여 현재 시점 기준의 리포트를 즉시 발송할 수 있습니다.
- **메일 템플릿**: HTML 형식의 테이블 리포트가 발송되며, 관리자 메모가 있는 경우 함께 포함됩니다.


## 📅 스케줄링 및 집계 구조

### 주간 집계 기준
- **시작**: 전주 목요일 19:00:00
- **종료**: 해당 주 목요일 18:59:59
- **집계 대상**: `status`가 `approved`이며 `approved_at`이 위 기간에 포함된 데이터

### 자동 로직
- `/api/cron/weekly-mail` 경로를 Vercel Cron Jobs 또는 기타 스케줄러를 통해 매주 목요일 19:00에 호출하도록 설정합니다.
- 호출 시 `Authorization: Bearer [CRON_SECRET]` 헤더가 필요합니다.

## 📁 데이터베이스 구조
- `admins`: 관리자 계정 정보
- `monthly_themes`: 월별 테마 정보 (Soft Delete 지원)
- `theme_tracks`: 테마별 기본 곡 목록
- `song_requests`: 사용자 신청곡 목록 (Soft Delete 지원)
- `weekly_mail_logs`: 메일 발송 기록
- `audit_logs`: 관리자 작업 이력

---
본 웹앱은 현대프리미엄아울렛 대전점의 프리미엄 브랜드 이미지를 바탕으로 제작되었습니다.
