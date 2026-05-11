-- COMPREHENSIVE RLS FIX (RECURSION-SAFE)
-- This script uses SECURITY DEFINER functions to break circular dependencies.

-- ==========================================
-- 0. HELPER FUNCTIONS (SECURITY DEFINER)
-- ==========================================
-- These bypass RLS to perform quick role/ownership checks

CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_is_professional()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'professional');
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_patient_id_for_user()
RETURNS uuid AS $$
  SELECT id FROM public.patients WHERE email = (auth.jwt() ->> 'email') LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_professional_id_for_user()
RETURNS uuid AS $$
  SELECT id FROM public.professionals WHERE email = (auth.jwt() ->> 'email') LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ==========================================
-- 1. APPOINTMENTS
-- ==========================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to appointments" ON appointments;
CREATE POLICY "Admins have full access to appointments" ON appointments
  FOR ALL USING (check_is_admin());

DROP POLICY IF EXISTS "Professionals can manage their own appointments" ON appointments;
CREATE POLICY "Professionals can manage their own appointments" ON appointments
  FOR ALL USING (professional_id = get_professional_id_for_user());

DROP POLICY IF EXISTS "Patients can manage their own appointments" ON appointments;
CREATE POLICY "Patients can manage their own appointments" ON appointments
  FOR ALL USING (patient_id = get_patient_id_for_user());

-- ==========================================
-- 2. PATIENTS
-- ==========================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to patients" ON patients;
CREATE POLICY "Admins have full access to patients" ON patients
  FOR ALL USING (check_is_admin());

DROP POLICY IF EXISTS "Professionals can view their patients" ON patients;
CREATE POLICY "Professionals can view their patients" ON patients
  FOR SELECT USING (
    check_is_professional() AND 
    EXISTS (
      SELECT 1 FROM appointments a 
      WHERE a.patient_id = patients.id 
      AND a.professional_id = get_professional_id_for_user()
    )
  );

DROP POLICY IF EXISTS "Patients can manage their own record" ON patients;
CREATE POLICY "Patients can manage their own record" ON patients
  FOR ALL USING (email = (auth.jwt() ->> 'email'));

-- ==========================================
-- 3. PROFESSIONALS
-- ==========================================
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to professionals" ON professionals;
CREATE POLICY "Admins have full access to professionals" ON professionals
  FOR ALL USING (check_is_admin());

DROP POLICY IF EXISTS "Professionals can manage their own profile" ON professionals;
CREATE POLICY "Professionals can manage their own profile" ON professionals
  FOR ALL USING (email = (auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Professionals are viewable by everyone" ON professionals;
CREATE POLICY "Professionals are viewable by everyone" ON professionals
  FOR SELECT USING (true);

-- ==========================================
-- 4. SERVICES & PRODUCTS
-- ==========================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to services" ON services;
CREATE POLICY "Admins have full access to services" ON services
  FOR ALL USING (check_is_admin());

DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins have full access to products" ON products;
CREATE POLICY "Admins have full access to products" ON products
  FOR ALL USING (check_is_admin());

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- ==========================================
-- 5. PRODUCT SALES & PAYMENTS
-- ==========================================
ALTER TABLE product_sales ENABLE ROW LEVEL SECURITY;
-- payments table might not exist if only conceptual, but we apply if it does
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY; 

DROP POLICY IF EXISTS "Admins have full access to product_sales" ON product_sales;
CREATE POLICY "Admins have full access to product_sales" ON product_sales
  FOR ALL USING (check_is_admin());

-- ==========================================
-- 6. ANAMNESIS & MESSAGES
-- ==========================================
ALTER TABLE patient_anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to patient_anamnesis" ON patient_anamnesis;
CREATE POLICY "Admins have full access to patient_anamnesis" ON patient_anamnesis
  FOR ALL USING (check_is_admin());

DROP POLICY IF EXISTS "Professionals can view anamnesis of patients" ON patient_anamnesis;
CREATE POLICY "Professionals can view anamnesis of patients" ON patient_anamnesis
  FOR SELECT USING (check_is_professional());

DROP POLICY IF EXISTS "Patients can manage their own anamnesis" ON patient_anamnesis;
CREATE POLICY "Patients can manage their own anamnesis" ON patient_anamnesis
  FOR ALL USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to patient_messages" ON patient_messages;
CREATE POLICY "Admins have full access to patient_messages" ON patient_messages
  FOR ALL USING (check_is_admin());

DROP POLICY IF EXISTS "Professionals can manage their own messages" ON patient_messages;
CREATE POLICY "Professionals can manage their own messages" ON patient_messages
  FOR ALL USING (professional_id = get_professional_id_for_user());

DROP POLICY IF EXISTS "Patients can manage their own messages" ON patient_messages;
CREATE POLICY "Patients can manage their own messages" ON patient_messages
  FOR ALL USING (patient_id = get_patient_id_for_user());

-- ==========================================
-- 7. AUTO-PROVISION PATIENTS ON SIGNUP
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Create Profile
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url', 
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  );

  -- 2. If it's a patient, also create a record in the clinical patients table
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'patient') = 'patient' THEN
    INSERT INTO public.patients (full_name, email, active)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email,
      TRUE
    )
    ON CONFLICT (email) DO NOTHING;
  END IF;

  -- 3. If it's a professional, also create a record in the clinical professionals table
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'patient') = 'professional' THEN
    INSERT INTO public.professionals (full_name, email, specialty, active)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email,
      'A definir',
      TRUE
    )
    ON CONFLICT (email) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
