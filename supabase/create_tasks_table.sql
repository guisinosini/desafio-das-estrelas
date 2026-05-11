-- Create patient_tasks table
CREATE TABLE IF NOT EXISTS public.patient_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE public.patient_tasks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Patients can view their own tasks"
    ON public.patient_tasks
    FOR SELECT
    USING (patient_id IN (SELECT id FROM public.patients WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Patients can update their own tasks (complete)"
    ON public.patient_tasks
    FOR UPDATE
    USING (patient_id IN (SELECT id FROM public.patients WHERE email = auth.jwt() ->> 'email'))
    WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Professionals can do everything with their tasks"
    ON public.patient_tasks
    FOR ALL
    USING (professional_id IN (SELECT id FROM public.professionals WHERE email = auth.jwt() ->> 'email'));



-- Grant access
GRANT ALL ON TABLE public.patient_tasks TO authenticated;
GRANT ALL ON TABLE public.patient_tasks TO service_role;
