-- Migration script to sync database schema
-- Run this if you encounter "column does not exist" errors

-- 1. Update monthly_themes table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monthly_themes' AND column_name='start_date') THEN
        ALTER TABLE monthly_themes ADD COLUMN start_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monthly_themes' AND column_name='end_date') THEN
        ALTER TABLE monthly_themes ADD COLUMN end_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monthly_themes' AND column_name='deleted_at') THEN
        ALTER TABLE monthly_themes ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Update theme_tracks table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_tracks' AND column_name='youtube_url') THEN
        ALTER TABLE theme_tracks ADD COLUMN youtube_url TEXT;
    END IF;
END $$;

-- 3. Update song_requests table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='song_requests' AND column_name='deleted_at') THEN
        ALTER TABLE song_requests ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
