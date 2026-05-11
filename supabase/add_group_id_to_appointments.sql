-- Migration: Add group_id to appointments and sessions_quantity to services
-- Run this script in the Supabase SQL Editor

-- 1. Add group_id to appointments
--    Used to link multiple sessions of the same booking together.
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS group_id uuid DEFAULT NULL;

-- 2. Add sessions_quantity to services (if not already present)
--    Defines how many sessions a service requires.
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS sessions_quantity integer NOT NULL DEFAULT 1;

-- Confirm changes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name = 'group_id';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'services'
  AND column_name = 'sessions_quantity';
