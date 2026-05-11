CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  professional_id UUID REFERENCES professionals(id),
  items JSONB NOT NULL DEFAULT '[]',
  general_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Permite leitura pública pelo ID para que o paciente veja sem login
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public viewing by ID" ON prescriptions FOR SELECT USING (true);
CREATE POLICY "Professionals can insert" ON prescriptions FOR INSERT WITH CHECK (true);
