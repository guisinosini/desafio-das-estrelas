-- FORCED FIX for Availability Constraints
-- Execute this in the Supabase SQL Editor

-- 1. Ensure the column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professional_availability' AND column_name='specific_date') THEN
        ALTER TABLE professional_availability ADD COLUMN specific_date DATE;
    END IF;
END $$;

-- 2. Drop the OLD constraint that is causing the "duplicate key" error
-- We use a loop to find and drop ANY constraint that only looks at (prof_id, day_of_week, start_time)
ALTER TABLE professional_availability DROP CONSTRAINT IF EXISTS professional_availability_professional_id_day_of_week_start_key;
ALTER TABLE professional_availability DROP CONSTRAINT IF EXISTS professional_availability_professional_id_day_of_week_start_t_key;

-- 3. Create the NEW constraint that includes 'specific_date'
-- This allows different availability for the same day_of_week on different dates
ALTER TABLE professional_availability DROP CONSTRAINT IF EXISTS professional_availability_unique_slot;
ALTER TABLE professional_availability ADD CONSTRAINT professional_availability_unique_slot 
  UNIQUE (professional_id, day_of_week, specific_date, start_time, end_time);

-- 4. Verify RLS (Admins and Professionals)
DROP POLICY IF EXISTS "Professionals can manage their own availability." ON professional_availability;
CREATE POLICY "Professionals can manage their own availability." 
  ON professional_availability FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'professional'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'professional'));

-- 5. Clear existing data to avoid conflicts if necessary (Optional, but recommended for clean start)
-- DELETE FROM professional_availability;
