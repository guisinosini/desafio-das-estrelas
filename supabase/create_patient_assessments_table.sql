-- Create patient_assessments table
CREATE TABLE IF NOT EXISTS public.patient_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('humor', 'food', 'bdi', 'bai', 'mbti')),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE public.patient_assessments ENABLE ROW LEVEL SECURITY;

-- Policies

-- Patients can view and insert their own assessments
CREATE POLICY "Patients can view own assessments"
    ON public.patient_assessments
    FOR SELECT
    USING (
      patient_id IN (SELECT id FROM public.patients WHERE email = auth.jwt() ->> 'email')
    );

CREATE POLICY "Patients can insert own assessments"
    ON public.patient_assessments
    FOR INSERT
    WITH CHECK (
      patient_id IN (SELECT id FROM public.patients WHERE email = auth.jwt() ->> 'email')
    );

-- Professionals and Admins can view all assessments
CREATE POLICY "Professionals and Admins can view all assessments"
    ON public.patient_assessments
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'professional')
      )
    );

-- Grant privileges
GRANT ALL ON TABLE public.patient_assessments TO authenticated;
GRANT ALL ON TABLE public.patient_assessments TO service_role;
