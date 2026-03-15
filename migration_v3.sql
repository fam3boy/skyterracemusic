-- Migration v3: Add requester contact field
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='song_requests' AND column_name='requester_contact') THEN
        ALTER TABLE song_requests ADD COLUMN requester_contact TEXT;
    END IF;
END $$;
