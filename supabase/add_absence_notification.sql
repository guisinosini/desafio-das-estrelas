-- Trigger function to notify patient about absence
CREATE OR REPLACE FUNCTION public.handle_absence_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if status changed to 'absence'
    IF (NEW.status = 'absence' AND (OLD.status IS DISTINCT FROM 'absence')) THEN
        INSERT INTO public.patient_messages (
            patient_id,
            professional_id,
            content,
            sender,
            read
        ) VALUES (
            NEW.patient_id,
            NEW.professional_id,
            'Olá! Notamos que você não pôde comparecer ao nosso encontro hoje. Se tiver qualquer dúvida ou precisar reagendar, entre em contato conosco. Estamos à disposição!',
            'professional',
            false
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS tr_on_absence_notification ON public.appointments;
CREATE TRIGGER tr_on_absence_notification
AFTER UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.handle_absence_notification();
