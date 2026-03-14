-- Database Schema for Hyundai Sky Terrace Music (Vercel Postgres Compatible)

-- 1. Admins Table (Standalone for NextAuth)
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nickname TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Monthly Themes
CREATE TABLE monthly_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    theme_month DATE NOT NULL UNIQUE, -- Store as YYYY-MM-01
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- 3. Theme Tracks (Default Playlist)
CREATE TABLE theme_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES monthly_themes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Song Requests
CREATE TABLE song_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES monthly_themes(id),
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    youtube_url TEXT,
    story TEXT,
    requester_name TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hold', 'deleted')),
    admin_memo TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- 5. Weekly Mail Logs
CREATE TABLE weekly_mail_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_text TEXT,
    request_ids JSONB -- Storing as JSONB for better compatibility in some Postgres environments
);

-- 6. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(id),
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indices for performance and sorting
CREATE INDEX idx_song_requests_status ON song_requests(status);
CREATE INDEX idx_song_requests_theme_id ON song_requests(theme_id);
CREATE INDEX idx_song_requests_approved_at ON song_requests(approved_at);
CREATE INDEX idx_monthly_themes_active ON monthly_themes(is_active) WHERE is_active = true;
