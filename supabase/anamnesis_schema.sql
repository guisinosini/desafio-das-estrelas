-- Patient Anamnesis Table
CREATE TABLE IF NOT EXISTS patient_anamnesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(patient_id)
);

-- RLS
ALTER TABLE patient_anamnesis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own anamnesis"
  ON patient_anamnesis FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert/update their own anamnesis"
  ON patient_anamnesis FOR ALL
  USING (auth.uid() = patient_id);

CREATE POLICY "Professionals can view anamnesis of patients"
  ON patient_anamnesis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'professional'
    )
  );

-- Function to handle timestamp update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patient_anamnesis_updated_at
BEFORE UPDATE ON patient_anamnesis
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
