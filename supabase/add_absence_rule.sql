-- Step 1: Add 'absence' to appointments status check constraint
DO $$ 
BEGIN
    ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
    ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check 
    CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'absence'));
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not alter constraint, it might not exist or table is busy.';
END $$;

-- Step 2: Create a function to process absences
CREATE OR REPLACE FUNCTION public.mark_absent_appointments()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Se passaram 2 horas do início e o status não é completed/cancelled
    -- E não foram deixadas notas clínicas (o que indicaria que houve atendimento)
    UPDATE public.appointments
    SET status = 'absence'
    WHERE status IN ('scheduled', 'confirmed')
      AND start_time < (now() - interval '2 hours')
      AND (clinical_notes IS NULL OR clinical_notes = '');
      
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN json_build_object('success', true, 'updated_count', updated_count);
END;
$$;

-- Grant access to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.mark_absent_appointments() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_absent_appointments() TO service_role;
