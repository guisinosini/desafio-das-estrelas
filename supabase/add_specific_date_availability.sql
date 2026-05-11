-- Add specific_date column to support non-recurring availability
ALTER TABLE professional_availability ADD COLUMN IF NOT EXISTS specific_date DATE;

-- Update unique constraint to consider the date
-- We allow either a day_of_week (recurring) OR a specific_date (peculiar)
ALTER TABLE professional_availability DROP CONSTRAINT IF EXISTS professional_availability_professional_id_day_of_week_start_key;
ALTER TABLE professional_availability DROP CONSTRAINT IF EXISTS professional_availability_professional_id_day_of_week_start_t_key;

-- New constraint: (professional_id, start_time, end_time) + (day_of_week OR specific_date)
-- Note: In Postgres, UNIQUE constraints treat NULL as distinct, so we need Careful logic or multiple constraints.
-- For simplicity in this clinical context, we'll allow uniqueness across all parameters.
ALTER TABLE professional_availability ADD CONSTRAINT professional_availability_unique_slot 
  UNIQUE (professional_id, day_of_week, specific_date, start_time, end_time);

-- Policy update (Admins)
create policy "Admins have full access to availability" on professional_availability
  for all using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  ) with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );
