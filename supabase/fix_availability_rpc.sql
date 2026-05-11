-- RPC for fetching booked slots without leaking patient data (Bypasses RLS)
CREATE OR REPLACE FUNCTION get_professional_booked_slots(p_prof_id UUID, p_date DATE)
RETURNS TABLE(start_time TIMESTAMP WITH TIME ZONE, end_time TIMESTAMP WITH TIME ZONE, id UUID) AS $$
BEGIN
  RETURN QUERY 
  SELECT a.start_time, a.end_time, a.id
  FROM public.appointments a
  WHERE a.professional_id = p_prof_id 
    AND a.start_time >= p_date::timestamp
    AND a.start_time <= (p_date::timestamp + interval '1 day' - interval '1 second')
    AND a.status != 'cancelled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_professional_booked_slots(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_professional_booked_slots(UUID, DATE) TO service_role;
