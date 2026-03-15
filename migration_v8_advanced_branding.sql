-- Migration V8: Advanced Branding and Theme Backgrounds
ALTER TABLE monthly_themes ADD COLUMN IF NOT EXISTS background_base64 TEXT;

-- Initialize logo_mode setting if not exists
INSERT INTO system_settings (key, value)
VALUES ('logo_mode', 'both')
ON CONFLICT (key) DO NOTHING;
