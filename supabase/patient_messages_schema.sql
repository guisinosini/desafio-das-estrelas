-- Messages table for patient-professional communication
CREATE TABLE patient_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  content text NOT NULL,
  sender text CHECK (sender IN ('patient', 'professional')) NOT NULL,
  read boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE patient_messages ENABLE ROW LEVEL SECURITY;

-- Patients management policy
CREATE POLICY "Patients can manage their own messages" ON patient_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_messages.patient_id
      AND patients.email = (auth.jwt() ->> 'email')
    )
  );

-- Professionals management policy
CREATE POLICY "Professionals can manage their own messages" ON patient_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = patient_messages.professional_id
      AND professionals.email = (auth.jwt() ->> 'email')
    )
  );
