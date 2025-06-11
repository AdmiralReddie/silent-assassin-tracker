
-- Add kill method and description to kill_requests table
ALTER TABLE public.kill_requests 
ADD COLUMN kill_method TEXT,
ADD COLUMN kill_description TEXT;

-- Update the pending_kill_confirmation structure in players table to include kill details
-- Note: This is a JSONB column, so we don't need to alter the schema, 
-- but we'll update the application logic to include these new fields
