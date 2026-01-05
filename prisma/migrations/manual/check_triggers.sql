SELECT trigger_name, event_manipulation, action_timing, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
