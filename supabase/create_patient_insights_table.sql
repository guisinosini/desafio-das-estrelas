-- Create patient_insights table for the diary functionality
CREATE TABLE IF NOT EXISTS public.patient_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE public.patient_insights ENABLE ROW LEVEL SECURITY;

-- Policies for patients
CREATE POLICY "Patients can manage their own insights"
    ON public.patient_insights
    FOR ALL
    USING (patient_id IN (SELECT id FROM public.patients WHERE email = auth.jwt() ->> 'email'))
    WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE email = auth.jwt() ->> 'email'));

-- Grant access
GRANT ALL ON TABLE public.patient_insights TO authenticated;
GRANT ALL ON TABLE public.patient_insights TO service_role;
