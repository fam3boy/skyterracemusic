-- Seed Data for Sky Terrace Music
-- Initialize basic themes and sample requests

-- 1. Insert Sample Admin (Password: admin123)
-- Hash generated for 'admin123' using bcrypt
INSERT INTO admins (email, password_hash, nickname)
VALUES ('admin@skyterrace.com', '$2a$10$px6p6qY6G7G6G6G6G6G6G.6G6G6G6G6G6G6G6G6G6G6G6G6G6G6G6', 'Chief Admin')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Sample Theme (March 2026)
INSERT INTO monthly_themes (title, theme_month, description, start_date, end_date, is_active)
VALUES (
    'Spring Harmony', 
    '2026-03-01', 
    'A collection of light, acoustic melodies to welcome the spring breeze.', 
    '2026-03-01', 
    '2026-03-31', 
    true
)
ON CONFLICT (theme_month) DO NOTHING;

-- Get the ID of the inserted theme
DO $$
DECLARE
    theme_id UUID;
BEGIN
    SELECT id INTO theme_id FROM monthly_themes WHERE theme_month = '2026-03-01' LIMIT 1;

    -- 3. Insert Theme Tracks
    INSERT INTO theme_tracks (theme_id, title, artist, youtube_url, order_index) VALUES
    (theme_id, 'Spring Day', 'BTS', 'https://www.youtube.com/watch?v=xeVqka7UZRo', 0),
    (theme_id, 'Cherry Blossom Ending', 'Busker Busker', 'https://www.youtube.com/watch?v=tXV7dfvSefo', 1),
    (theme_id, 'Love Blossom', 'K.Will', 'https://www.youtube.com/watch?v=iRGvi_W46S4', 2);

    -- 4. Insert Sample Requests
    INSERT INTO song_requests (theme_id, title, artist, youtube_url, story, requester_name, status) VALUES
    (theme_id, 'Spring Spring Spring', 'Roy Kim', '', 'Spring is finally here!', 'Kim Spring', 'pending'),
    (theme_id, 'Lilac', 'IU', '', 'I love this song so much.', 'IU Fan', 'approved'),
    (theme_id, 'Not Spring, Love, or Cherry Blossoms', 'HIGH4, IU', '', 'A bit bitter but good.', 'Lee Music', 'hold');
END $$;
