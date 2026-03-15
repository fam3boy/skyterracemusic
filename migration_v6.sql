-- Migration V6: Expanded Mail & Admin Management

-- 1. Mail Recipients Table
CREATE TABLE IF NOT EXISTS mail_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('TO', 'CC', 'BCC')),
    send_day INT DEFAULT 4, -- 0=Sunday, 4=Thursday
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add email and nickname to admins
ALTER TABLE admins ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);

-- 3. Add initial recipient if none exist
INSERT INTO mail_recipients (email, role, send_day)
SELECT 'admin@example.com', 'TO', 4
WHERE NOT EXISTS (SELECT 1 FROM mail_recipients);
