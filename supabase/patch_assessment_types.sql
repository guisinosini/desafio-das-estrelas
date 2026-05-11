-- Remover a restrição antiga
ALTER TABLE public.patient_assessments DROP CONSTRAINT IF EXISTS patient_assessments_assessment_type_check;

-- Adicionar a restrição atualizada incluindo mchat e snap
ALTER TABLE public.patient_assessments ADD CONSTRAINT patient_assessments_assessment_type_check 
CHECK (assessment_type IN ('humor', 'food', 'bdi', 'bai', 'mbti', 'mchat', 'snap'));
