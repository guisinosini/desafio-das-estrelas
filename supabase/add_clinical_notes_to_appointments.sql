-- Add clinical_notes column to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS clinical_notes TEXT DEFAULT '';

-- Optional: Add session timing for performance analysis
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS session_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS session_ended_at TIMESTAMPTZ;
