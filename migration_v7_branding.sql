-- Migration V7: Branding and System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Initialize default branding placeholders if needed
INSERT INTO system_settings (key, value) 
VALUES ('logo_base64', '')
ON CONFLICT (key) DO NOTHING;
