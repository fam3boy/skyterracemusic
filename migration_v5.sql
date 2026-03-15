-- Migration V5: Admin Automation & Throttling

-- 1. Banned Patterns (Words, Artists, Links)
CREATE TABLE banned_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('WORD', 'ARTIST', 'LINK')),
    pattern TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    admin_id UUID REFERENCES admins(id)
);

-- 2. Admin Memo Templates
CREATE TABLE admin_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('HOLD', 'DELETED')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    admin_id UUID REFERENCES admins(id)
);

-- 3. Request Throttling (Rate Limiting)
CREATE TABLE request_throttles (
    ip_address TEXT PRIMARY KEY,
    request_count INT DEFAULT 1,
    last_request_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP WITH TIME ZONE
);

-- 4. Recommendations Columns in song_requests
ALTER TABLE song_requests 
ADD COLUMN auto_recommendation TEXT,
ADD COLUMN auto_reason TEXT;

-- 5. Indexes for performance
CREATE INDEX idx_song_requests_title_artist ON song_requests(title, artist);
CREATE INDEX idx_song_requests_youtube_url ON song_requests(youtube_url);
