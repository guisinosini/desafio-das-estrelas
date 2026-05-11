-- Permite que pacientes insiram suas próprias tarefas
-- (O client-side irá enviar o professional_id da primeira tarefa atribuída ao paciente)

CREATE POLICY "Patients can insert their own tasks"
    ON public.patient_tasks
    FOR INSERT
    WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE email = auth.jwt() ->> 'email'));
