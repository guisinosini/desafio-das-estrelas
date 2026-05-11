-- Migration: Add Specialist-Service Mapping
-- This creates a join table to link professionals to the services they offer.

CREATE TABLE IF NOT EXISTS professional_services (
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, service_id)
);

-- Enable RLS
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;

-- Admin Full Access
DROP POLICY IF EXISTS "Admins have full access to professional_services" ON professional_services;
CREATE POLICY "Admins have full access to professional_services" ON professional_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Professional Read Access (they can see their own mapping)
DROP POLICY IF EXISTS "Professionals can view their own services" ON professional_services;
CREATE POLICY "Professionals can view their own services" ON professional_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = professional_services.professional_id
      AND p.email = auth.jwt() ->> 'email'
    )
  );

-- Patient Read Access (they can see which professional offers which service)
DROP POLICY IF EXISTS "Patients can view professional services" ON professional_services;
CREATE POLICY "Patients can view professional services" ON professional_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'patient'
    )
  );
