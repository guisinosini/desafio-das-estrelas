-- Migration: Fix Admin Access to Clinical Tables
-- Ensures that users with the 'admin' role have full access to all data, bypassing patient-specific RLS.

-- Table: patients
DROP POLICY IF EXISTS "Admins have full access to patients" ON patients;
CREATE POLICY "Admins have full access to patients" ON patients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Table: appointments
DROP POLICY IF EXISTS "Admins have full access to appointments" ON appointments;
CREATE POLICY "Admins have full access to appointments" ON appointments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Table: professionals
DROP POLICY IF EXISTS "Admins have full access to professionals" ON professionals;
CREATE POLICY "Admins have full access to professionals" ON professionals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Table: services
DROP POLICY IF EXISTS "Admins have full access to services" ON services;
CREATE POLICY "Admins have full access to services" ON services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Table: products
DROP POLICY IF EXISTS "Admins have full access to products" ON products;
CREATE POLICY "Admins have full access to products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Table: product_sales
DROP POLICY IF EXISTS "Admins have full access to product_sales" ON product_sales;
CREATE POLICY "Admins have full access to product_sales" ON product_sales
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Table: patient_messages
DROP POLICY IF EXISTS "Admins have full access to patient_messages" ON patient_messages;
CREATE POLICY "Admins have full access to patient_messages" ON patient_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Table: professional_availability
DROP POLICY IF EXISTS "Admins have full access to professional_availability" ON professional_availability;
CREATE POLICY "Admins have full access to professional_availability" ON professional_availability
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Table: patient_anamnesis
DROP POLICY IF EXISTS "Admins have full access to patient_anamnesis" ON patient_anamnesis;
CREATE POLICY "Admins have full access to patient_anamnesis" ON patient_anamnesis
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
