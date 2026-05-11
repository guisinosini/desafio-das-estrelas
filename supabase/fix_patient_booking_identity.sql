-- Migration: Fix Patient Identity and Booking Permissions
-- Ensures patients can manage their own records and create appointments.

-- 1. Patients Table Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can manage their own record" ON patients;
CREATE POLICY "Patients can manage their own record" ON patients
  FOR ALL USING (email = (auth.jwt() ->> 'email'))
  WITH CHECK (email = (auth.jwt() ->> 'email'));

-- 2. Appointments Table Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can manage their own appointments" ON appointments;
CREATE POLICY "Patients can manage their own appointments" ON appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = appointments.patient_id
      AND patients.email = (auth.jwt() ->> 'email')
    )
  );

-- 3. Profiles Read Access for Booking
-- Patients need to see specialist profiles to book them
DROP POLICY IF EXISTS "Patients can view specialist profiles" ON professionals;
CREATE POLICY "Patients can view specialist profiles" ON professionals
  FOR SELECT USING (active = true);

-- 4. Services Read Access for Booking
DROP POLICY IF EXISTS "Everyone can view active services" ON services;
CREATE POLICY "Everyone can view active services" ON services
  FOR SELECT USING (active = true);
