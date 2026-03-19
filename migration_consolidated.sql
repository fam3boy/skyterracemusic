-- Consolidated Migration: Hyundai Sky Terrace Music (Full Schema)
-- Execute this in Vercel Postgres to ensure all tables and columns are up to date.

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- Legacy
    password TEXT, -- New bcrypt field
    nickname VARCHAR(50),
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Monthly Themes
CREATE TABLE IF NOT EXISTS monthly_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    theme_month DATE NOT NULL UNIQUE,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. Theme Tracks
CREATE TABLE IF NOT EXISTS theme_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES monthly_themes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    youtube_url TEXT,
    order_index INTEGER DEFAULT 0,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Song Requests
CREATE TABLE IF NOT EXISTS song_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES monthly_themes(id),
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    youtube_url TEXT,
    story TEXT,
    requester_name TEXT,
    requester_contact TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hold', 'deleted')),
    admin_memo TEXT,
    auto_recommendation TEXT,
    auto_reason TEXT,
    image TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 5. Mail Recipients
CREATE TABLE IF NOT EXISTS mail_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('TO', 'CC', 'BCC')),
    send_day INT DEFAULT 4,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Logs & Throttling
CREATE TABLE IF NOT EXISTS weekly_mail_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_text TEXT,
    request_ids JSONB,
    status TEXT DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Alias for sent_at in some queries
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(id),
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS request_throttles (
    ip_address TEXT PRIMARY KEY,
    request_count INT DEFAULT 1,
    last_request_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS banned_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('WORD', 'ARTIST', 'LINK')),
    pattern TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    admin_id UUID REFERENCES admins(id)
);

CREATE TABLE IF NOT EXISTS admin_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('HOLD', 'DELETED')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    admin_id UUID REFERENCES admins(id)
);

-- 7. Indices
CREATE INDEX IF NOT EXISTS idx_song_requests_status ON song_requests(status);
CREATE INDEX IF NOT EXISTS idx_song_requests_theme_id ON song_requests(theme_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_approved_at ON song_requests(approved_at);
CREATE INDEX IF NOT EXISTS idx_song_requests_title_artist ON song_requests(title, artist);
CREATE INDEX IF NOT EXISTS idx_monthly_themes_active ON monthly_themes(is_active) WHERE is_active = true;

-- 8. Seed (Optional)
INSERT INTO mail_recipients (email, role, send_day)
SELECT 'broadcasting@hyundai.com', 'TO', 4
WHERE NOT EXISTS (SELECT 1 FROM mail_recipients);
