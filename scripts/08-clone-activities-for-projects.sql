-- Clone activities for projects that don't have them
-- This script adds all template activities to projects that are missing them

INSERT INTO project_activities (project_id, activity_id, status, progress_percentage)
SELECT 
  p.id as project_id,
  a.id as activity_id,
  'pending' as status,
  0 as progress_percentage
FROM projects p
CROSS JOIN activities a
WHERE NOT EXISTS (
  SELECT 1 FROM project_activities pa
  WHERE pa.project_id = p.id AND pa.activity_id = a.id
)
ON CONFLICT DO NOTHING;

-- Verify the cloning worked
SELECT COUNT(*) as total_project_activities FROM project_activities;
SELECT project_id, COUNT(*) as activity_count FROM project_activities GROUP BY project_id;
