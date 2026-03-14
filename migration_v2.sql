-- Migration script v2: Enhance Mail Logs
-- Adds status tracking and period information for weekly reports

DO $$ 
BEGIN 
    -- 1. Add status column to weekly_mail_logs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weekly_mail_logs' AND column_name='status') THEN
        ALTER TABLE weekly_mail_logs ADD COLUMN status TEXT DEFAULT 'success';
    END IF;

    -- 2. Add error_message column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weekly_mail_logs' AND column_name='error_message') THEN
        ALTER TABLE weekly_mail_logs ADD COLUMN error_message TEXT;
    END IF;

    -- 3. Add start_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weekly_mail_logs' AND column_name='period_start') THEN
        ALTER TABLE weekly_mail_logs ADD COLUMN period_start TIMESTAMP WITH TIME ZONE;
    END IF;

    -- 4. Add end_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weekly_mail_logs' AND column_name='period_end') THEN
        ALTER TABLE weekly_mail_logs ADD COLUMN period_end TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
