-- Add evaluation columns to patient_tasks
ALTER TABLE public.patient_tasks 
ADD COLUMN IF NOT EXISTS score TEXT,
ADD COLUMN IF NOT EXISTS score_custom TEXT,
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Update RLS to ensure patients can update these new columns
-- (Existing policies usually allow UPDATE on all columns if the row belongs to the patient)
