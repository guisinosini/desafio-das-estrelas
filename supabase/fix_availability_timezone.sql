-- RPC v2 with precise timestamp range to avoid timezone shifts
CREATE OR REPLACE FUNCTION get_professional_booked_slots_v2(
  p_prof_id UUID, 
  p_start TIMESTAMP WITH TIME ZONE, 
  p_end TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(start_time TIMESTAMP WITH TIME ZONE, end_time TIMESTAMP WITH TIME ZONE, id UUID) AS $$
BEGIN
  RETURN QUERY 
  SELECT a.start_time, a.end_time, a.id
  FROM public.appointments a
  WHERE a.professional_id = p_prof_id 
    AND a.start_time >= p_start
    AND a.start_time <= p_end
    AND a.status != 'cancelled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_professional_booked_slots_v2(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_professional_booked_slots_v2(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO service_role;
