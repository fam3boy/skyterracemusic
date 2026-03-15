-- Seed Data for Sky Terrace Music

-- 1. Default Admin (Password: admin1234!)
-- Note: In production, change this immediately via Admin CMS or SQL.
-- hash is for 'admin1234!'
INSERT INTO admins (email, password_hash, nickname, role)
VALUES ('admin@skyterrace.com', '$2a$10$7pw.Y0V0vQvXvJvGvXvJv.vQvXvJvGvXvJv.vQvXvJvGvXvJv', 'System Admin', 'administrator')
ON CONFLICT (email) DO NOTHING;

-- 2. Initial Theme
INSERT INTO monthly_themes (title, theme_month, description, start_date, end_date, is_active)
VALUES (
    'Spring Harmony 2026', 
    '2026-03-01', 
    'A collection of light, acoustic melodies to welcome the spring breeze at Sky Terrace.', 
    '2026-03-01', 
    '2026-03-31', 
    true
)
ON CONFLICT (theme_month) DO NOTHING;

-- 3. Sample Tracks for the Theme
WITH current_theme AS (SELECT id FROM monthly_themes WHERE is_active = true LIMIT 1)
INSERT INTO theme_tracks (theme_id, title, artist, youtube_url, order_index)
SELECT id, '봄날 (Spring Day)', 'BTS', 'https://www.youtube.com/watch?v=xeGwRDNuM0g', 0 FROM current_theme
UNION ALL
SELECT id, 'Love Blossom', 'K.will', 'https://www.youtube.com/watch?v=iRGVi6hKjr0', 1 FROM current_theme
UNION ALL
SELECT id, '꽃 (FLOWER)', 'JISOO', 'https://www.youtube.com/watch?v=YudHcBIxlYw', 2 FROM current_theme;

-- 4. Initial Global Audit Log
INSERT INTO audit_logs (action, target_table, details)
VALUES ('SYSTEM_INIT', 'system', '{"message": "Seed data initialized successfully"}');
