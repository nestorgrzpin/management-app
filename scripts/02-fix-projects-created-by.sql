-- Update created_by for all projects to the current authenticated user
-- First, get the first user ID from the users table and update all projects to that user
UPDATE projects 
SET created_by = (SELECT id FROM users LIMIT 1)
WHERE created_by IS NOT NULL OR created_by IS NULL;

-- Verify the update
SELECT id, name, created_by FROM projects LIMIT 5;
